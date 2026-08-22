# Log da Operação

Uma linha por evento que muda uma decisão. Alimente no bloco semanal.

## 22/08 — Restrição de ambiente registrada

Sessões do Claude Code **remotas** (nuvem / claude.ai) rodam atrás de um proxy de
egresso com política da organização. `www.youtube.com:443` responde **403 na conexão** —
bloqueio de política, não falha de rede. Efeito prático: nessas sessões não dá para
assistir, transcrever ou tirar frames de vídeo do YouTube.

Verificado com a ferramenta instalada, não por suposição: `yt-dlp 2026.08.19` falha com
`Tunnel connection failed: 403 Forbidden` nas três tentativas. O bloqueio é de rede —
nenhum programa passa.

### Perímetro medido (22/08)

| Alcançável da sessão remota | Bloqueado |
|---|---|
| GitHub, API Anthropic, API Gemini, pip/npm | YouTube, OpenAI, Meta/Facebook, TikTok, Instagram, Hotmart, HeyGen, ElevenLabs, fal, Replicate, HuggingFace, Google |

**Consequência para o projeto:** nenhuma etapa operacional (subir campanha, publicar
vídeo, ler faturamento, gerar vídeo por API) roda de uma sessão remota. Logo a
automação não pode depender de uma sessão de IA ligada — ela precisa ser **código no
repositório**, escrito e testado aqui, executado na sua máquina ou num servidor seu.
Isso é melhor de qualquer forma: automação que só funciona com alguém assistindo não é
automação.

Divisão de trabalho entre sessões:

| Sessão | Boa para |
|---|---|
| Remota (aqui) | repositório, copy, planejamento, código do pipeline |
| Local (CLI / desktop) | YouTube, Gerenciador de Anúncios, arquivos da sua máquina, navegador |

## 21/08 — Campanha sem retorno

CBO com 4 criativos, sem conferência pré-publicação. Ver `trafego-pago.md` §1.

## 22/08 — Correção da economia de tráfego

Gate de "AOV > R$60" removido: estava errado (ignorava os 3 order bumps e o upsell, e
usava CPA de funil comum em vez de funil de impulso). Gate correto: AOV líquido do
carrinho > CPA real, ambos medidos. Ver `trafego-pago.md` §2.

**Pendente:** puxar AOV real no painel da Hotmart e o print do CPA de R$10.
