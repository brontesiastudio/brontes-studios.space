#!/usr/bin/env bash
# Extrai transcrição + frames de corte de um vídeo (YouTube ou arquivo local).
#
# Uso:
#   ./scripts/extrair-video.sh <url-ou-arquivo> [nome-da-pasta]
#
# Saída em material/<nome>/:
#   transcricao.txt        texto limpo, sem repetição de legenda automática
#   transcricao-tempo.txt  mesmo texto com marcação de tempo
#   frames/                um PNG por corte de cena
#   contato.jpg            mosaico com todos os frames (o storyboard visual)
#   info.txt               título, canal, duração, descrição
#
# Requisitos: yt-dlp, ffmpeg, python3
#   pip install -U yt-dlp     |     brew install yt-dlp ffmpeg
#   (Ubuntu/Debian: sudo apt install ffmpeg && pip install -U yt-dlp)

set -euo pipefail

ALVO="${1:-}"
if [[ -z "$ALVO" ]]; then
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

for dep in ffmpeg python3; do
  command -v "$dep" >/dev/null || { echo "erro: '$dep' não encontrado no PATH"; exit 1; }
done

# Sensibilidade do detector de cena: menor = mais frames. 0.3 é um bom começo.
LIMIAR="${LIMIAR:-0.3}"

if [[ -f "$ALVO" ]]; then
  MODO=arquivo
  NOME="${2:-$(basename "${ALVO%.*}")}"
else
  MODO=url
  command -v yt-dlp >/dev/null || { echo "erro: 'yt-dlp' não encontrado (pip install -U yt-dlp)"; exit 1; }
  NOME="${2:-$(yt-dlp --get-id "$ALVO" 2>/dev/null || echo video)}"
fi

DEST="material/$NOME"
mkdir -p "$DEST/frames"
echo "==> $NOME  ($MODO)  →  $DEST"

# ---------------------------------------------------------------- 1. baixar
VIDEO="$DEST/video.mp4"
if [[ "$MODO" == url ]]; then
  echo "--> metadados e legendas"
  yt-dlp --skip-download \
         --write-auto-subs --write-subs \
         --sub-langs "pt.*,en.*" --convert-subs srt \
         --write-description --print-to-file \
           "%(title)s%(\n)s%(uploader)s%(\n)s%(duration_string)s" "$DEST/info.txt" \
         -o "$DEST/legenda" "$ALVO" || echo "    (sem legenda disponível — segue só com os frames)"

  echo "--> vídeo"
  yt-dlp -f "bv*[height<=720]+ba/b[height<=720]/b" --merge-output-format mp4 \
         -o "$VIDEO" "$ALVO"
else
  cp -f "$ALVO" "$VIDEO"
  # Aceita uma legenda ao lado do arquivo: trend.mp4 → trend.srt
  LADO="${ALVO%.*}.srt"
  [[ -f "$LADO" ]] && cp -f "$LADO" "$DEST/legenda.srt" && echo "--> legenda encontrada ao lado do arquivo"
fi

# ------------------------------------------------------- 2. limpar legenda
SRT="$(find "$DEST" -maxdepth 1 -name 'legenda*.srt' | head -1 || true)"
if [[ -n "$SRT" ]]; then
  echo "--> limpando transcrição"
  python3 - "$SRT" "$DEST" <<'PY'
import re, sys, pathlib

srt, dest = sys.argv[1], pathlib.Path(sys.argv[2])
blocos, atual, tempo = [], [], None
for linha in pathlib.Path(srt).read_text(encoding="utf-8", errors="ignore").splitlines():
    linha = linha.strip()
    if re.fullmatch(r"\d+", linha):
        continue
    m = re.match(r"(\d\d:\d\d:\d\d)[,.]\d+ +--> ", linha)
    if m:
        if atual:
            blocos.append((tempo, " ".join(atual)))
        tempo, atual = m.group(1), []
        continue
    if linha:
        atual.append(re.sub(r"<[^>]+>", "", linha))
if atual:
    blocos.append((tempo, " ".join(atual)))

# Legenda automática repete a linha anterior em cada bloco. Fica só o texto novo.
saida, visto = [], ""
for t, texto in blocos:
    texto = " ".join(texto.split())
    if not texto:
        continue
    if texto == visto:
        continue
    if visto and texto.startswith(visto):
        novo = texto[len(visto):].strip()
    elif visto.endswith(texto):
        continue
    else:
        novo = texto
    if novo:
        saida.append((t, novo))
    visto = texto

(dest / "transcricao-tempo.txt").write_text(
    "\n".join(f"[{t}] {x}" for t, x in saida), encoding="utf-8")

# Texto corrido, quebrado em parágrafos a cada ~40s de fala.
paragrafos, buf, marca = [], [], None
for t, x in saida:
    seg = sum(int(v) * f for v, f in zip(t.split(":"), (3600, 60, 1)))
    if marca is None:
        marca = seg
    if seg - marca > 40 and buf:
        paragrafos.append(" ".join(buf)); buf, marca = [], seg
    buf.append(x)
if buf:
    paragrafos.append(" ".join(buf))
(dest / "transcricao.txt").write_text("\n\n".join(paragrafos), encoding="utf-8")
print(f"    {len(saida)} falas → transcricao.txt")
PY
else
  echo "    sem .srt — pulei a transcrição"
fi

# --------------------------------------------------------- 3. frames de corte
# Dois passos de propósito: primeiro descobrimos QUANDO cada corte acontece, depois
# extraímos o frame de cada tempo. Assim o nome do arquivo carrega o tempo — que é o
# que permite ler o ritmo do vídeo sem abrir o player.
echo "--> detectando cortes (limiar=$LIMIAR)"
TEMPOS="$DEST/cortes.txt"
{
  echo "0.000"                       # o frame de abertura é o mais importante de todos
  ffmpeg -nostdin -loglevel info -i "$VIDEO" -vf "select='gt(scene,$LIMIAR)',metadata=print" \
         -an -f null - 2>&1 | sed -n 's/.*pts_time:\([0-9.]*\).*/\1/p'
} | sort -n -u > "$TEMPOS"

N=$(wc -l < "$TEMPOS" | tr -d ' ')
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO" | cut -d. -f1)

# Vídeo com cortes suaves (ou nenhum): cai para amostragem por tempo.
if [[ "$N" -lt 4 ]]; then
  PASSO=$(( DUR / 24 + 1 ))
  echo "    só $N cortes detectados — amostrando a cada ${PASSO}s"
  : > "$TEMPOS"
  for ((t=0; t<DUR; t+=PASSO)); do echo "$t.000" >> "$TEMPOS"; done
  N=$(wc -l < "$TEMPOS" | tr -d ' ')
fi

FONTE=$(fc-match -f '%{file}' sans 2>/dev/null || true)
[[ -f "$FONTE" ]] || FONTE=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf

echo "--> extraindo $N frames"
i=0
while read -r t; do
  [[ -z "${t//[[:space:]]/}" ]] && continue
  i=$((i+1))
  mm=$(printf '%02d' $(( ${t%.*} / 60 )))
  ss=$(printf '%02d' $(( ${t%.*} % 60 )))
  # O tempo carimbado no quadro é o que transforma o mosaico em storyboard legível.
  if [[ -f "$FONTE" ]]; then
    CARIMBO=(-vf "drawtext=fontfile='$FONTE':text='${mm}\\:${ss}':x=10:y=10:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=8")
  else
    CARIMBO=()
  fi
  ffmpeg -nostdin -loglevel error -ss "$t" -i "$VIDEO" -frames:v 1 -q:v 2 \
         "${CARIMBO[@]}" "$DEST/frames/$(printf '%03d' $i)_${mm}m${ss}s.jpg" -y
done < "$TEMPOS"

# ------------------------------------------------------------ 4. contact sheet
echo "--> montando mosaico"
COLS=5
LINHAS=$(( (N + COLS - 1) / COLS ))
ffmpeg -nostdin -loglevel error -y -pattern_type glob -i "$DEST/frames/*.jpg" \
       -frames:v 1 -vf "scale=360:-1,tile=${COLS}x${LINHAS}:padding=8:margin=8:color=black" \
       "$DEST/contato.jpg" 2>/dev/null || echo "    (mosaico falhou; os frames estão em frames/)"

rm -f "$DEST"/legenda*.srt "$DEST"/legenda*.vtt

echo
echo "pronto: $DEST"
echo "  $N frames  |  transcricao.txt  |  contato.jpg"
echo
echo "Próximo passo: joga contato.jpg + transcricao.txt numa conversa e peça o"
echo "storyboard em tabela (tempo | plano | movimento | o que prende a atenção)."
