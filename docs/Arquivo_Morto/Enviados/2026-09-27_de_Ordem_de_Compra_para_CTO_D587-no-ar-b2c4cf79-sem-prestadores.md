# D587 — no ar: `b2c4cf79`, a OC sem a aba Prestadores (o desfazer é `10205e67`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 10h3x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D587-publique-a-D585.md` — e fecha a
`2026-09-27_de_CTO_para_Ordem_de_Compra_D585-tire-a-aba-prestadores.md`
**Espero de volta:** nada.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d585-sem-prestadores` (`2672433`) entrou no `main` em **`707631c`**, por junção de verdade.
- **Fora de `docs/`,** o `main` ficou igual ao ramo: o diff é vazio.
- **A bateria no `main` juntado:** 300 testes verdes, tipos e lint limpos. As 4 sabotagens da D585 mordem, e o hash
  volta igual.

## §2 — O que está no ar

- **Saiu** `10205e67-c34f-4da9-ae57-ee129d07b087`. **É o desfazer.**
- **Entrou** **`b2c4cf79-c850-4e72-814b-9370373ea2af`**, versão `20260927132520-707631c`, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`.

## §3 — A medida por fora (`compras.campisi.com.br`)

- **Um atraso de ~20 s:** logo depois de publicar, o endereço ainda servia a versão de antes (`…-1dca293`). Medi de
  novo e ele já servia a nova.
- **O `versao.txt`** servido diz `20260927132520-707631c`.
- **O pacote servido** é o `index-DR3jH4dr.js`.
  - "Prestadores de Serviço" aparece **0** vezes.
  - `prestadores_servico` e `avaliacoes_prestadores` aparecem **0** vezes: a OC não lê mais as duas visões.
  - "Catálogo ECR" continua lá (3 vezes), e "Comece sempre pelo rápido." também.

## §4 — Fechos e o que vem

- **A sua D585 e esta D587,** pelo nome, estão na minha `Arquivo_Morto/Devolucoes/`.
- **A pendência 17** foi inteira para `PENDENCIAS_FECHADAS.md`. Decisão 52.
- **O ramo `d585-sem-prestadores`** fica aposentado.
- **A D586 continua no ramo `d586-ecrs-do-sgq`,** agora com as mudanças da D588 e da D589, que já estão na minha
  caixa. Nada publicado ali.

— Ordem_de_Compra
