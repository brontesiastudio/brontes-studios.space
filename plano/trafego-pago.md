# Ramo C — Tráfego Pago

## 1. Diagnóstico do erro de ontem

Você rodou **orçamento de campanha (CBO) com 4 criativos**. O problema não foi só a
estrutura — foram três coisas empilhadas:

**Erro 1 — CBO em fase de teste.**
CBO existe para *concentrar* verba no que já está ganhando. Em teste você quer o
oposto: verba igual para cada criativo, para poder comparar. Com CBO e verba baixa, o
Meta joga quase tudo no criativo que teve o primeiro clique barato — muitas vezes nas
primeiras 2 horas, com dado nenhum — e os outros 3 morrem com R$4 gastos. Você não
descobriu qual criativo é bom. Você descobriu qual criativo teve sorte às 9h da manhã.
→ **Seu instinto está certo:** teste com ABO, um criativo por conjunto.

**Erro 2 — 4 criativos com verba de teste pequena.**
Cada conjunto precisa de dado suficiente para significar alguma coisa. Dividir uma
verba pequena por 4 garante que nenhum dos 4 sai do ruído. Teste 2, não 4.

**Erro 3 — publicar sem conferência.**
Esse você já identificou sozinho e é o mais valioso: você não tirou print e não mandou
para uma LLM conferir antes de subir. Virou checklist no §4. Faça isso *sempre* — é o
passo mais barato do processo inteiro e o que mais evita queimar caixa.

## 2. A matemática que decide se você deveria estar rodando tráfego

> **Correção (22/08).** A versão anterior desta seção fixava um portão de "AOV acima de
> R$60" e tratava o ticket como R$9,90 isolado. Estava errado em dois pontos: ignorava os
> 3 order bumps e o upsell (o que conta é o carrinho, não o produto de entrada), e usava
> CPA de funil comum em vez de CPA de funil de impulso. Low ticket escala de verdade —
> o gate correto não é um valor de AOV, é a relação abaixo.

### O gate correto

```
AOV líquido (carrinho inteiro, depois das taxas)  >  CPA real
```

Só isso. Não existe número mágico de AOV. Se o CPA é R$10 e o líquido por venda é R$18,
a estrutura é lucrativa e escala. Se o CPA é R$40 com o mesmo líquido, não é. O número
que importa é o **seu**, medido, não uma média de mercado.

### Por que o funil de impulso tem CPA baixo

Oferta de R$9,90 não se compara a oferta de R$97. A decisão de compra é impulsiva, o
quiz já qualificou o lead antes do checkout, e a conversão de página fica muito acima da
faixa de um funil comum. É por isso que R$10 por criativo é um número plausível aqui —
e é exatamente o que precisa ser confirmado com os seus prints, não com estimativa minha.

### AOV do carrinho atual (modelo — substituir pelos números reais)

Estrutura no ar: front R$9,90 → upsell Pro (+R$10) → 3 order bumps
(IAvatares, Biblioteca de 60 criativos, Esteira + calendário 30 dias).

| Componente | Take rate | Contribuição |
|---|---|---|
| Front-end R$9,90 | 100% | R$9,90 |
| Upsell Pro (+R$10) | a medir | — |
| Bump 1 | a medir | — |
| Bump 2 | a medir | — |
| Bump 3 | a medir | — |
| **AOV bruto** | | **a medir** |
| − taxa do gateway | | |
| **AOV líquido** | | **este é o número do gate** |

**Ação: puxe o AOV real no painel da Hotmart antes da próxima campanha.** Vendas totais
÷ número de pedidos. É um número que você já tem e que decide todo o resto.

### A restrição que sobrou (e que é a real)

Unit economics não é mais o argumento. O que continua valendo com R$2.500 de caixa é
**capital de giro**, e por um motivo específico do low ticket:

Você gasta no Meta **hoje** e recebe da Hotmart **depois** — o prazo de repasse padrão
para cartão costuma ser bem mais longo que o ciclo de gasto do anúncio (antecipação
existe, com custo; Pix cai mais rápido). *Confirme o seu prazo e o seu mix Pix/cartão no
painel — varia por conta e por plano.*

O efeito prático: mesmo com ROAS positivo, você precisa financiar todo o período entre
gastar e receber. A R$70/dia de verba com repasse em 30 dias, o pico de caixa exposto
chega a ~R$2.100 — praticamente todo o seu caixa preso, sem margem para uma rodada de
teste ruim no meio.

**Portanto o gate operacional não é o AOV. É este:**

- [ ] AOV líquido real medido no painel
- [ ] CPA real medido (com print, não estimativa)
- [ ] Prazo de repasse conhecido, e mix Pix/cartão conhecido
- [ ] Caixa suficiente para cobrir o ciclo gasto→recebimento **mais** uma rodada de teste perdida

Com os quatro preenchidos, escala. Sem eles, o risco não é o modelo — é ficar sem caixa
no meio de uma campanha que estava dando certo, que é a forma mais burra de morrer.

### Nota independente

Nada disso muda o argumento do `README.md` §1. Low ticket lucrativo continua sendo renda
que **zera todo dia 1º**: cada mês recomeça do zero em vendas. A comunidade recorrente
resolve um problema diferente (previsibilidade), não o mesmo. As duas coisas convivem —
o low ticket lucrativo é, aliás, a melhor fonte de assinante que existe.

## 3. Estrutura correta ("cabine de marketing")

### Teste
```
Campanha (objetivo: Vendas | evento: Purchase | ABO)
├── Conjunto 1 — verba própria — Criativo A
└── Conjunto 2 — verba própria — Criativo B
```
- Público **amplo** (idade + país). Sem interesses, sem lookalike no início — com verba
  baixa a segmentação só encarece o CPM.
- Posicionamentos automáticos.
- Atribuição: 7 dias clique / 1 dia visualização.
- Um criativo por conjunto. Sempre.
- Nunca mexer no conjunto durante a fase de aprendizado — qualquer edição reinicia.

### Verba de teste
Regra: verba diária por conjunto ≈ **1× a 1,5× o CPA-alvo**, por 3 dias.
Nunca arrisque mais de ~20% do caixa em uma rodada de teste.
Com R$2.500: rodada máxima ~R$500. Ex.: 2 conjuntos × R$40/dia × 3 dias = R$240. Uma
rodada. Depois pare e leia o dado.

### Regras de corte (escreva antes de subir, não durante)
- Gastou 1× o CPA-alvo sem nenhum "adicionar ao carrinho" → mata.
- Gastou 2× o CPA-alvo sem compra → mata.
- Compra dentro do CPA-alvo → sobrevive para escala.
- Sem regra escrita antes, você vai deixar rodando "só mais um dia". Todo mundo deixa.

### Escala
Sua nota diz "20 a 40% por dia por criativo". **Corrija para 20% a cada 2–3 dias.**
Aumento diário agressivo joga o conjunto de volta para o aprendizado a cada 24h e você
nunca sai da fase instável. 20–30% a cada 2–3 dias, e só enquanto o ROAS se mantiver na
janela de 3 dias. Para saltos maiores, duplique o conjunto com verba maior em vez de
editar o original.

### Saturação
Sinais de que o criativo morreu: frequência subindo com CTR caindo, CPM subindo sem
mudança de público, CPA subindo 3 dias seguidos. Aí não adianta verba — precisa de
criativo novo. É por isso que o Ramo D (fábrica) é pré-requisito deste ramo: sem fluxo
de criativo, escala trava sempre no mesmo lugar.

## 4. Checklist obrigatório antes de publicar

Tire print de cada tela e mande para conferência antes de clicar em publicar.

- [ ] Objetivo é **Vendas**, não Tráfego nem Engajamento
- [ ] Evento de conversão = **Purchase** (não PageView, não Lead)
- [ ] Pixel disparando: testado com o Test Events da Meta, compra real de ponta a ponta
- [ ] Deduplicação de evento configurada (se usar API de conversões junto do pixel)
- [ ] Orçamento no **conjunto** (ABO), não na campanha
- [ ] 1 criativo por conjunto
- [ ] Público amplo, sem exclusões desnecessárias
- [ ] Janela de atribuição 7d clique / 1d visualização
- [ ] Link com UTM correta e checkout abrindo no destino certo
- [ ] Verba diária e regra de corte **escritas** antes de subir
- [ ] Print de tudo → conferido por LLM → só então publicar

## 5. Registro de campanhas

Toda campanha entra aqui. Sem registro, você repete o mesmo erro em 3 meses e não lembra.

| Data | Estrutura | Verba | Criativos | Resultado | Aprendizado |
|---|---|---|---|---|---|
| 21/08 | CBO, 4 criativos | — | 4 | sem retorno | CBO em teste concentra verba e mata o aprendizado; faltou conferência pré-publicação |
