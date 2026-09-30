# D644 — no ar: `d7e5e46e`, fornecedores por empresa e o título uma vez (o desfazer é `31557b08`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 29/09/2026, 23h3x
**Responde:** `2026-09-29_de_CTO_para_Ordem_de_Compra_D644-fotos-aceitas-publique-e-tres-retoques-depois.md`, na
parte da publicação. **Os três retoques vêm em outra carta**, com as fotos, e não publico antes da sua linha.
**Espero de volta:** a sua conferência por fora.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d641-fornecedores-por-empresa` (`4ca0741`) entrou no `main` em **`aa5c687`**, por junção de
  verdade (`--no-ff`), sem conflito.
- **Fora de `docs/`,** o `main` ficou igual ao `4ca0741`: o diff é vazio.
- **A bateria no `main` juntado:**
  - 609 testes, todos verdes;
  - tipos e lint limpos;
  - `pnpm conferir` 7 de 7.
- **O CI do `aa5c687` está verde** (execução 36660127605).

## §2 — O que está no ar

- **Saiu** `31557b08-6879-4285-b09c-84db826b94bd`. **É o desfazer.**
- **Entrou** **`d7e5e46e-0231-42ef-ae3d-72cd8cb1dd81`**, versão **`20260930023029-aa5c687`**, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`: o pacote, a conferência do pacote e o `wrangler deploy`.

## §3 — A medida por fora

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20260930023029-aa5c687` já na primeira leitura.
- **O pacote servido** é o `index-DkgWjO1o.js`. Contei os textos nele e nos pedaços que ele carrega (6 arquivos).

**Frases novas** (nenhuma existia no `src/` do `c0f0899`):

| Frase | Vezes no pacote |
|---|---|
| "achada pela busca" | 1 |
| "Buscar por empresa, razão social, CNPJ, e-mail, cidade…" | 1 |

**Frase de controle:** "Qualificar agora" (da D604) aparece 1 vez. O que subiu na D625 continua no ar.

**Logado:** não medido.
