# Ramo D — Fábrica de Vídeo

## 1. O problema real: não é geração, é consistência

Você já consegue gerar bons vídeos com ChatGPT + Google Flow. O que falta não é
qualidade de saída — é **a mesma pessoa aparecer igual no vídeo 40**. Esse é um problema
de processo, não de ferramenta, e é por isso que créditos ilimitados não resolveram.

As três consistências, e como cada uma se trava:

| Consistência | Como quebra | Como travar |
|---|---|---|
| Facial | cada geração inventa um rosto novo | imagem de referência fixa + character sheet (frente/perfil/3-4) reutilizada em toda geração |
| Voz | timbre muda entre ferramentas | uma única voz clonada, sempre a mesma, gerada fora do vídeo e sincronizada depois |
| Cenário / estilo | prompt escrito do zero toda vez | prompt-base congelado em arquivo; só o miolo da cena muda |

**Ação concreta:** crie `plano/entidades/<nome>/` com `referencia/` (as imagens
travadas), `voz.txt` (id da voz) e `prompt-base.txt` (o bloco fixo). Toda geração
começa copiando o prompt-base. Nunca escreva um prompt do zero de novo.

## 2. Método trend → storyboard → re-cast

Sua ideia do vídeo da russa está correta e é o melhor uso de IA em vídeo curto hoje:
você não copia o vídeo, copia a **estrutura de retenção** que já foi validada por
milhões de views.

```
1. ESCOLHER   trend com tração comprovada (não a que "parece boa" — a que já tem número)
2. EXTRAIR    frames-chave (ffmpeg, 1 frame por corte)
3. LER        para cada frame: o que a câmera faz, o que muda na tela, por que
              o olho não sai — isto é o storyboard, e é a parte que importa
4. ABSTRAIR   descartar o conteúdo, guardar só o esqueleto de tempo e movimento
5. RE-CAST    aplicar sua personagem, seu cenário, seu contexto ao mesmo esqueleto
6. GERAR      prompt-base congelado + a cena nova
7. MONTAR     cortes no mesmo tempo do original, áudio próprio
```

O passo 4 é o que a maioria pula, e é o único que importa. Quem copia o conteúdo faz uma
cópia pior. Quem copia o esqueleto faz um vídeo novo com retenção emprestada.

Comando para extrair os frames de corte:
```bash
ffmpeg -i trend.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr frames/%03d.png
```
Joga a pasta no GPT, pede o storyboard em tabela (tempo | plano | movimento | o que
prende), e re-escreve a coluna de conteúdo com a sua personagem.

**Um template de storyboard validado vale mais que 100 créditos de geração.** Guarde
cada esqueleto que funcionar em `plano/storyboards/` e reutilize com personagens
diferentes. Esse acervo é o ativo real da fábrica.

## 3. Stack de ferramentas

Você citou HeyGen, Higgsfield e outras. Duas observações honestas:

- Não vou afirmar recursos e preços atuais dessas plataformas sem verificar — esse
  mercado muda a cada poucas semanas. Se quiser, eu pesquiso o estado atual de cada uma
  (consistência de personagem, API, custo por segundo, direitos de uso comercial) e
  escrevo um comparativo aqui.
- O critério de escolha não deve ser "qual gera o vídeo mais bonito". Deve ser, nesta
  ordem: **(1) trava personagem entre gerações, (2) tem API, (3) custo por vídeo
  final, (4) qualidade.** Ferramenta linda sem API é trabalho manual eterno; ferramenta
  sem trava de personagem já falhou no §1.

## 4. Quando virar software (e quando não)

A ideia de um "sistema de fabricação contínua" / app de presença online automática é
boa e é vendável. Mas tem ordem:

**Antes de escrever uma linha de código, o processo manual precisa estar rodando por 2
semanas.** Automação codifica um processo; se o processo ainda muda toda semana, o
código nasce obsoleto e você gasta o recurso mais escasso que tem (atenção contínua) em
manutenção em vez de conteúdo.

Arquitetura, quando chegar a hora — cada etapa é uma peça isolada:

```
fila de pautas (arquivo/planilha)
      ↓
roteiro (API de LLM + bíblia da personagem)
      ↓
storyboard (template do acervo)
      ↓
geração de cena (API de vídeo)  ─┐
geração de voz (API de TTS)     ─┤→ montagem (ffmpeg) → arquivo final
trilha/legenda                  ─┘
      ↓
agendamento / publicação
```

Restrições que vão aparecer, para você já saber:
- Publicação automatizada é a parte mais travada. As APIs de publicação das plataformas
  exigem aprovação de app e têm limites; contornos não-oficiais arriscam a conta — e a
  conta é o ativo. Comece agendando manualmente no bloco semanal.
- APIs de geração de vídeo são pagas por segundo. O custo por vídeo final é o número que
  decide a viabilidade do produto inteiro — calcule antes de construir, não depois.
- Comece pelo pedaço mais chato e mais repetitivo (roteiro + storyboard + montagem).
  Ele é 80% do tempo e 0% do risco.

Quando for a hora, isso é um projeto que dá para construir aqui no repo, incremental,
uma peça por semana.
