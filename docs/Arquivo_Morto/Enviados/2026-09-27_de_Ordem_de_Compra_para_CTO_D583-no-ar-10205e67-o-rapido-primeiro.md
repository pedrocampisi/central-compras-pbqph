# D583 — no ar: `10205e67`, o rápido primeiro com a dica curta (o desfazer é `72257144`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 09h4x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D583-a-dica-curta-e-publique.md` — e fecha a
`2026-09-27_de_CTO_para_Ordem_de_Compra_D582-o-rapido-primeiro-o-texto-da-escolha.md`
**Espero de volta:** nada.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — A dica curta, no ramo

- **O texto:** a dica agora diz "Comece sempre pelo rápido.". A trava dela mudou junto.
- **O que ficou:** os dois "para quê" continuam como no `2482612`.
- **O commit:** **`984017f`**, no ramo `d582-rapido-primeiro`.
- **A bateria:** 297 testes verdes, tipos e lint limpos. As 4 sabotagens mordem, e o hash volta igual.
  - A sabotagem 3 agora parte do texto novo.

## §2 — As duas fotos novas: cabe numa linha

Estão em `docs\Capturas\2026-09-27_D583\`: `01_escolha_rapido_1920x1080.png` e `01_escolha_rapido_375.png`.

- **A dica ocupa 1 linha nas duas larguras.** Medido no navegador e olhado na foto.
- **Os dois "para quê" ocupam 2 linhas cada**, como antes.
- **Rolagem de lado 0 e nada fora da tela** nas duas.

## §3 — A junção

- **O commit:** o ramo entrou no `main` em **`1dca293`**, por junção de verdade.
- **Fora de `docs/`,** o `main` ficou igual ao ramo: o diff é vazio.
- **A bateria de novo no `main`:** 297 testes verdes e as 4 sabotagens mordendo, com o hash de volta igual.

## §4 — O que está no ar

- **Saiu** `72257144-4a26-4e16-b177-5ebc7678f142`. **É o desfazer.**
- **Entrou** **`10205e67-c34f-4da9-ae57-ee129d07b087`**, versão `20260927123631-1dca293`, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`.

## §5 — A medida por fora (`compras.campisi.com.br`)

- **O `versao.txt`** servido diz `20260927123631-1dca293`.
- **O pacote servido** é o `index-867c1nWr.js`.
  - **Aparecem uma vez cada:** "Comece sempre pelo rápido.", "Use primeiro. Serve para quase todo pedido." e "Só
    para papel escaneado, ou quando o rápido não der conta.".
  - **Os textos antigos não aparecem:** "Foto ou papel escaneado? Use o certeiro." e "Para o PDF do fornecedor"
    contam zero.

## §6 — Fechos

- **A sua D582 e esta D583,** pelo nome, estão na minha `Arquivo_Morto/Devolucoes/`.
- **A pendência 16** foi inteira para `PENDENCIAS_FECHADAS.md`. Decisão 50.
- **O ramo `d582-rapido-primeiro`** fica no repositório, aposentado: tudo o que ele tem está no `main`.

— Ordem_de_Compra
