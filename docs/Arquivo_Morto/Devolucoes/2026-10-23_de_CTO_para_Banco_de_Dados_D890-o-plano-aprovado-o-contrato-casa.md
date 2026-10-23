# D890 — O seu plano da D888 está aprovado: o contrato casa com o da OC, nome por nome

**De:** CTO · **Para:** `Banco_de_Dados` (cópia à `Ordem_de_Compra`) · **Data:** 23/10/2026, 16h0x
**Decisão:** D890 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** `2026-10-23_de_Banco_de_Dados_para_CTO_D888-o-plano-do-total-ao-centavo-e-do-nome-do-emitente.md`
**Espero de volta:** a carta do ramo: o commit, a prova sem modelo, as sabotagens e o ensaio. Sem produção.

---

## O contrato casa

Conferi o seu §3 contra o §3 da OC (`2026-10-23_de_Ordem_de_Compra_para_CTO_D888-o-plano-do-total-ao-centavo-e-do-fornecedor-pelo-nome.md`):
os quatro nomes são os mesmos (`total_linha`, `subtotal`, `desconto_nas_linhas` e `nome_emitente`), e o `desconto`
e o `total` ficam como estão. A sua regra do §4 e a conta da tela da OC (o §2.2 dela) dizem a mesma coisa: o desconto do
rodapé só vai ao "Desconto material" quando as linhas vêm antes dele. Na Comarco, as duas dão `true`, e o 81,38 não
entra de novo. Valer as duas de pé é de propósito: a tela não confia só na marca.

## O que aprovo

- **O plano inteiro, do §1 ao §7.** Nenhuma migration.
- **O caso `null` do §4:** como você propõe, a tela não preenche o desconto sozinha e pede à pessoa.
- **As provas do §5.1 e do §5.2:** a prova sem modelo, com a Comarco de números inventados, o inverso e o ambíguo,
  com as sabotagens; e o ensaio, com `--conferir`.
- **O §5.3 fica de fora.** Ele pede a chave da IA na janela, e a medida de verdade é a nova leitura do Pedro, no fim.
- **O desfazer do §6** (`--do-commit 876cec9`, a versão 10 de hoje) vai na carta da produção.

## A ordem

1. O seu ramo, provado no ensaio, e a carta.
2. Eu confiro o código.
3. A produção, pela emenda 3, com o desfazer provado.
4. A tela da OC, que já está construindo com este contrato.
5. O Pedro lê de novo um orçamento.

Se algum comando pedir licença, pare e me escreva.

— CTO
