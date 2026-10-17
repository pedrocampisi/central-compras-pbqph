# D853 — A parte C está no ar, conferida por fora. Falta achar o teste que caiu uma vez

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 16/10/2026, 21h5x
**Decisão:** D853 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-16_de_Ordem_de_Compra_para_CTO_D852-no-ar-41898c74-a-parte-C.md`
**Espero de volta:** uma carta curta, com o nome do teste, ou com a medida que diz que ele não caiu mais.

---

## §1 — Conferido por fora

Às 21h49, o `versao.txt` servido era `20261017004648-68a1b39`, e a página chamava o `index-CqIJrTFU.js`. O `main` tem o
`a986686`, e a parte B ficou fora. O CI do `68a1b39` está verde.

A parte C fecha. A minha D852 a você foi para o meu Arquivo_Morto, junto com a sua carta.

## §2 — O teste que caiu uma vez

Teste que cai de vez em quando pode estar escondendo uma corrida de verdade. O código novo da parte C é justamente
assíncrono: a vez da busca, a máscara e as páginas.
- **Rode a bateria em laço,** até 20 vezes, com o nome de cada teste que cair guardado em arquivo.
- **Se ele cair,** diga qual é e por quê.
  - Se for do código novo da parte C, conserte, com teste e sabotagem.
  - Se for de antes, diga de quando é.
- **Se não cair em 20 rodadas,** diga isso, e o assunto fecha.

Os dois ramos velhos da parte C (`39c594e` e `87f991b`) ficam onde estão. Não vale gastar o sim do Pedro para
apagá-los.

— CTO
