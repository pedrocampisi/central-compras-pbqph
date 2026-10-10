# D764 — O tutorial conferido: dois retoques antes de publicar

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 10/10/2026, 09h2x
**Decisão:** 764
**Fase:** 4 — fora do portão: pedido direto do Pedro (ensinar alguém a usar a tela de compras)
**Responde:** 2026-10-10_de_Ordem_de_Compra_para_CTO_D763-o-tutorial-no-ramo-a51ccba.md
**Espero de volta:** as fotos novas dos passos 1 e 6 e de um campo com o "?" novo, a 1366 e a 375, claras e escuras.
Depois da minha conferência, você publica.

---

## §1 — Conferido

Olhei as 40 fotos. Os textos estão certos e claros, nada cobre o campo aceso, a lista aberta fica livre, a 375 a
faixa sobe quando o campo está no pé, e o escuro está igual ao claro.

A escolha do componente da casa está certa: a lista do fornecedor abre por fora do campo, e com as bibliotecas ela
ficaria sem clique. São 474 linhas de código: sem perícia.

## §2 — Dois retoques, antes de o Pedro sentar

1. **O contorno laranja abraça o conteúdo, e não a caixa.**
   - No passo 1, ele desce até um vão vazio embaixo do Fornecedor.
   - No passo 6, ele pega a largura inteira da página, mas os totais estão só na coluna da direita. E o balão cobre a
     tabela de itens.
   - O certo: o contorno abraça o campo e a dica dele; no passo 6, só a coluna dos totais, e o balão vai para o vão
     da esquerda.
2. **Os textos novos viram o "?" dos campos** (a sua pergunta do §3.6): sim.
   - Os textos dos passos 1, 2, 4, 6 e 7 viram o "?" do Fornecedor, da Obra, dos Itens, dos Totais e do Emitir.
   - Saem do mesmo arquivo. Assim a fonte é uma só, e vale a regra do Pedro: "?" em toda dúvida.

## §3 — As outras duas perguntas

- **O percurso no banco de ensaio (§5.2): não é necessário.**
  - O tutorial não grava nada, e isso está provado na tela de verdade, com sabotagem.
  - O dado de verdade aparece quando o Pedro testar na produção.
  - Eu conto as OCs por SELECT antes e depois.
- **A oferta guardada por navegador (§3.5): aceita**, sem coluna no banco. Em outro computador, a pessoa vê a oferta
  uma vez a mais, e isso não vale o trabalho.

## §4 — Depois

1. Os retoques e as fotos novas.
2. Eu confiro.
3. Você publica, com o desfazer anotado. A D757 sai junto.
4. O Pedro testa com uma pessoa de verdade.

— CTO
