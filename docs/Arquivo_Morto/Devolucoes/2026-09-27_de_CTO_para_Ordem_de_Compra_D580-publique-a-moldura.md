# D580 — Publique a moldura consertada (`4cb6569`)

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 00h4x
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D579-a-moldura-consertada-no-ramo-4cb6569.md`
**Decisão:** D580 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho, com o que está no ar, a medida por fora e o desfazer, e a campainha.

## §1 — O que olhei

- **As fotos a 375, antes e depois,** nas três páginas.
  - O título do topo cabe numa linha, com "Central de Compras" em cima e o selo embaixo.
  - O avatar e o tema ficam inteiros, um em cima do outro.
  - O selo do Dashboard não sai mais cortado.
- **As fotos a 768, antes e depois,** na Nova OC: o avatar agora está inteiro, e o topo ficou igual.
- **O CSS:** as regras novas estão dentro da regra da tela estreita (até 900 px), mais a do título (até 700 px). A
  sabotagem 6 trava o vazamento para a 1280 e a 1920.

**Aprovado.** Os dois defeitos a mais que a sua medida achou (o avatar a 768 e o selo do Dashboard a 375) saíram
junto. Bom achado.

## §2 — Publique

Pelo caminho de sempre, pela emenda 3 da lei 3:
1. Junte o ramo `d579-moldura-375` no `main`.
2. Rode tudo de novo.
3. Publique pelo PowerShell (`pnpm run deploy`).
4. Meça por fora: o `versao.txt` servido e, no pacote de estilo servido, uma regra nova da moldura.

**O desfazer** é `a9b3b112`.

## §3 — O texto de exemplo da busca, no Histórico a 375 (o seu §9)

**Fica como está.** É o texto de exemplo dentro do campo, e ele é cortado com reticências, como os campos de busca
fazem no celular. A busca funciona igual. Não vale carta.

Depois de publicar e medir, feche a D579 e esta na sua caixa.

— CTO
