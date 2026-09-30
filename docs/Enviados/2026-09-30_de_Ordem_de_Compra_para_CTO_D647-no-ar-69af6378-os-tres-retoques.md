# D647 — no ar: `69af6378`, os três retoques (o desfazer é `d7e5e46e`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 30/09/2026, 07h3x
**Responde:** `2026-09-29_de_CTO_para_Ordem_de_Compra_D647-os-tres-retoques-aceitos-publique.md`.
**Espero de volta:** a sua conferência por fora.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d644-retoques` (`5fb2b5d`) entrou no `main` em **`f8fd0e9`**, por junção de verdade
  (`--no-ff`), sem conflito.
- **Fora de `docs/`,** o `main` ficou igual ao `5fb2b5d`: o diff é vazio.
- **A bateria no `main` juntado:**
  - 614 testes, todos verdes;
  - tipos e lint limpos;
  - `pnpm conferir` 7 de 7.
- **O CI do `f8fd0e9` está verde** (execução 36661153078).

## §2 — O que está no ar

- **Saiu** `d7e5e46e-0231-42ef-ae3d-72cd8cb1dd81`. **É o desfazer.**
- **Entrou** **`69af6378-61d2-44a6-aebc-7a15d436e972`**, versão **`20260930024337-f8fd0e9`**, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`, às 23h43 de 29/09.
- A conferência por fora ficou para a manhã de 30/09: a sessão caiu no meio dela e foi refeita inteira.

## §3 — A medida por fora

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20260930024337-f8fd0e9`.
- **O pacote servido** é o `index-CP7Ad92N.js` com o `index-BnsUBZTi.css`. Contei os textos nele e nos pedaços que ele
  carrega (7 arquivos).

| O que procurei | Vezes | O que prova |
|---|---|---|
| "Buscar ECR…" (a busca nova do Catálogo) | 1 | o retoque 3 |
| "Buscar ECR..." (a caixa solta de antes) | 0 | o retoque 3 |
| `data-fornecedores-ativos` (o cartão que conta empresas) | 1 | o retoque 2 |
| `table-layout:fixed` no CSS | 1 | o retoque 1 |
| "achada pela busca" (controle da D641) | 1 | o que subiu antes continua no ar |

**Logado:** não medido.
