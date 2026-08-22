# Log da Operação

Uma linha por evento que muda uma decisão. Alimente no bloco semanal.

## 22/08 — Restrição de ambiente registrada

Sessões do Claude Code **remotas** (nuvem / claude.ai) rodam atrás de um proxy de
egresso com política da organização. `www.youtube.com:443` responde **403 na conexão** —
bloqueio de política, não falha de rede. Efeito prático: nessas sessões não dá para
assistir, transcrever ou tirar frames de vídeo do YouTube.

Contorno correto: rodar `scripts/extrair-video.sh` numa **sessão local** (CLI na sua
máquina ou app desktop), onde vale a sua rede. Ou colar a transcrição direto na conversa.

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
