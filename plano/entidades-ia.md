# Ramo A — Entidades IA

## 1. O que faz uma entidade parecer viva

Não é qualidade de render. É **continuidade**. Uma pessoa parece real quando a semana
dela tem relação com a semana anterior. Três camadas, nesta ordem de importância:

1. **Continuidade narrativa** — ela tem uma vida em andamento, com coisas que se
   arrastam entre vídeos (um projeto, uma mudança, uma opinião que ela defende sempre).
2. **Continuidade de opinião** — ela tem 3 bandeiras e um inimigo declarado. Repete
   sempre. Público segue quem é previsível em valor e imprevisível em formato.
3. **Continuidade visual e sonora** — mesma cara, mesma voz, mesmo enquadramento,
   mesmo espaço físico recorrente. Esta é a mais fácil de quebrar e a mais fácil de
   automatizar (ver `pipeline-video.md`).

A maioria das contas de IA morre na camada 1 e ninguém percebe — culpam a ferramenta.

## 2. Bíblia da personagem (preencher antes de gerar 1 vídeo)

Um arquivo por entidade, em `plano/entidades/<nome>.md`. Sem isso preenchido, não gere
nada — é o documento que a LLM lê para escrever todo roteiro depois.

```
NOME / IDADE / CIDADE
ARQUÉTIPO (a amiga sincera / o cara que já ferrou e voltou / a nerd que traduz)
INIMIGO DECLARADO (contra o que ela fala sempre)
3 BANDEIRAS (os temas que ela nunca abandona)
VOZ (5 palavras que ela usa muito; 5 que ela nunca usaria)
ROTINA (o que ela faz de segunda a domingo — gera pauta infinita)
UNIVERSO VISUAL (2 cenários fixos, paleta, roupa-assinatura)
FORMATO-ASSINATURA (a abertura que se repete em todo vídeo)
O QUE ELA VENDE (e por que faz sentido vindo dela)
```

Regra: **a personagem vem antes do produto.** Personagem construída para vender um
produto específico morre quando o produto morre.

## 3. Curto vs. longo — e a congruência entre eles

Você levantou isso e está certo: curto não é o único caminho. Mas eles não são dois
projetos. São um funil.

| | Curto (Reels/TikTok/Shorts/Stories) | Longo (YouTube) |
|---|---|---|
| Função | alcance, descoberta, topo | autoridade, confiança, conversão |
| Ganha o quê | seguidor | comprador |
| Custo de produção | baixo | alto |
| Vida útil | 72h | 2 anos |

**A congruência resolve-se com direção única de produção:** o vídeo longo é gravado
primeiro; os curtos são cortes dele. Assim a personagem não se contradiz — é
literalmente a mesma fala. E o custo do curto vira quase zero.

Se a entidade for exclusivamente curta, então o longo precisa ser um formato próprio
(compilado semanal, "os 5 melhores da semana"), nunca conteúdo desconectado.

Regra de ouro: **uma entidade, uma voz, todas as plataformas.** Entidade diferente por
plataforma = trabalho ×N e autoridade ÷N.

## 4. Meta imediata: 2k seguidores no TikTok

Objetivo: destravar Shop e LIVE.
*(Confirme o requisito atual dentro do app — muda por região e por período. Não trate
2k como número fixo sem verificar.)*

O que realmente move seguidor no TikTok, em ordem:

1. **Volume.** 3–5 posts/dia é o que faz a conta sair do zero, não 1/dia perfeito. É
   por isso que o lote semanal existe.
2. **Retenção nos 3 primeiros segundos.** Todo o resto é secundário. Use o banco de
   ganchos em `copy/organico-ia-influencers.md`.
3. **Série.** Conteúdo numerado ("dia 4 de 30") força o retorno e é a coisa mais barata
   que existe para converter view em seguidor.
4. **Um único nicho por conta.** Conta que fala de 3 assuntos não é recomendada para
   ninguém.

Métrica de controle semanal: **retenção a 3s** e **seguidores ganhos por 1.000 views.**
Views sem seguidor = o conteúdo entretém mas não dá motivo para seguir. Se esse número
não subir em 30 dias, o problema é o nicho e a personagem — não a ferramenta de vídeo.

## 5. Gatilho de clonagem

Só crie a entidade nº2 quando a nº1 tiver:
- [ ] 30 dias postando sem você intervir fora do bloco semanal
- [ ] métrica de seguidor/1k views estável ou subindo
- [ ] pipeline de produção documentado o suficiente para outra pessoa executar

Clonar antes disso multiplica um processo quebrado. Você vai ter 5 contas ruins em vez
de 1 boa, e o trabalho será 5×.
