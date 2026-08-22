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

| Variável | Valor realista (BR, público frio) |
|---|---|
| CPM | R$15–35 |
| CTR | 1–2% → CPC ~R$1,50–3,00 |
| Conversão da página | 3–8% |
| **CPA resultante** | **~R$30–60** |
| **Ticket atual** | **R$9,90 / R$19,90** |

**O CPA é maior que o ticket.** Não por pouco: por 2 a 3 vezes. Nenhum ajuste de
segmentação, criativo ou horário conserta uma estrutura em que o custo de adquirir é o
dobro do que você recebe.

Existem exatamente duas saídas, e nenhuma delas é "otimizar a campanha":

- **Subir o AOV.** Order bumps + upsell + comunidade recorrente no back-end. Se o
  cliente de R$9,90 vale R$60–90 ao longo de 60 dias, o CPA de R$40 vira lucro.
- **Não pagar pelo tráfego.** Orgânico (Ramo A) até o back-end existir.

> **Portão de entrada deste ramo: AOV comprovado acima de R$60.**
> Enquanto não tiver isso medido — não estimado, medido — cada real em Meta é caixa
> queimado. Você tem R$2.500. Isso é 40–60 dias de teste. Não gaste antes de ter o
> back-end pronto para receber.

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
