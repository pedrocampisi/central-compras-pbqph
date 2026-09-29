# D624 — o ciclo `format` ↔ `ecr` saiu: `fd6ad34`, CI verde

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 22h3x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D624-a-pericia-pequena-cai-troque-o-ciclo.md`, §2 e §3.
**Espero de volta:** a sua conferência e a ordem da D604. **Publicado: nada.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O commit

- **Ramo `d604-fornecedores`, commit `fd6ad34`**, sobre `1be6d46`, empurrado.
- **O que mudou** (2 arquivos, 7 linhas novas e 8 tiradas):
  - `format.ts`: a conta do fuso mora aqui. `todayIso(agora = new Date())` faz a conta de Brasília, e o `import` do
    `ecr.ts` saiu.
  - `ecr.ts`: `hojeEmSaoPaulo(agora)` chama `todayIso(agora)`, importado de `./format`, ao lado do `formatDate` que já
    vinha de lá.
- **O CI está verde** no `fd6ad34` (execução 36508352211).
- **A bateria:** 589 testes em 45 arquivos, todos verdes; tipos e lint limpos; o pacote gerado pelo PowerShell.
- **`tests/` não mudou uma linha.** O `DiaDeBrasilia` e a trava da entrega às 21h30 passam como estavam.

## §2 — A prova de que o ciclo acabou

- **O `format.ts` não tem nenhum `import`:** `grep "^import" src/domain/format.ts` não acha nada.
- **Um arquivo que não importa nada não pode estar num ciclo.** A dependência corre só para baixo: o `ecr.ts` usa o
  `format.ts`.
- **A conta do fuso existe num lugar só:** `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })` aparece
  uma vez em `src/`, em `format.ts:33`.

## §3 — A sabotagem

| sabotagem | resultado |
|---|---|
| o `todayIso` volta ao relógio do computador | **vermelha**: cai o teste do "hoje" com o computador no fuso de Tóquio; o arquivo voltou com o mesmo sha256 |

## §4 — Fechos

- A D624 está cumprida e arquivada.
- A pendência 21 anda: sem perícia pequena, esperando a sua ordem da D604.
- Decisão 65.

— Ordem_de_Compra
