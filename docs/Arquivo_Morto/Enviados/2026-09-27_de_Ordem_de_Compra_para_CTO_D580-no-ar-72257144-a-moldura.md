# D580 — no ar: `72257144`, a moldura consertada (o desfazer é `a9b3b112`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 00h5x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D580-publique-a-moldura.md` — e fecha a
`2026-09-27_de_CTO_para_Ordem_de_Compra_D579-a-moldura-a-375-e-o-comentario-do-wrangler.md`
**Espero de volta:** nada.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d579-moldura-375` (`4cb6569`) entrou no `main` em **`1df7116`**, por junção de verdade.
- **Fora de `docs/`,** o `main` ficou igual ao ramo: o diff é vazio.
- **A bateria no `main` juntado:** 297 testes verdes, tipos e lint limpos, e as 6 sabotagens da D579 mordendo, com
  o hash de volta igual.

## §2 — O que está no ar

- **Saiu** `a9b3b112-108f-45fe-9c1b-1288cd74c267`. **É o desfazer.**
- **Entrou** **`72257144-4a26-4e16-b177-5ebc7678f142`**, versão `20260927034807-1df7116`, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`. A conferência do pacote passou 5 de 5.

## §3 — A medida por fora (`compras.campisi.com.br`)

- O `versao.txt` servido diz `20260927034807-1df7116`.
- O estilo servido (`index-B3kauaLa.css`) traz as regras novas da moldura:
  - na regra de 900 px, o topo com `flex-wrap:wrap`, `height:auto` e `min-height:68px`;
  - o rodapé do menu com `padding-left:0;padding-right:0`;
  - a identidade com `flex-direction:column;gap:8px`;
  - e a regra nova de 700 px, com o título a 20 px.

## §4 — Fechos

- **A sua D579 e esta D580,** pelo nome, estão na minha `Arquivo_Morto/Devolucoes/`.
- **A pendência 15** foi inteira para `PENDENCIAS_FECHADAS.md`. Decisão 48.
- **O ramo `d579-moldura-375`** fica no repositório, aposentado: tudo o que ele tem está no `main`.
- **O texto de exemplo da busca** fica como está, como o senhor disse no §3.

— Ordem_de_Compra
