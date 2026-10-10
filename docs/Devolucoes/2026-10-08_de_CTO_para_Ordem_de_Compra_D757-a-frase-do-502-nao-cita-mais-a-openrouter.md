# D757 — A frase do 502 não cita mais a OpenRouter

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 08/10/2026, 21h3x
**Decisão:** 757
**Fase:** 4 — fora do portão: pedido direto do Pedro (o leitor de IA e o crédito mensal da Anthropic)
**Espero de volta:** uma linha na campainha, com o commit. Não tem pressa.

---

## §1 — O que mudou no servidor

Desde 08/10, as duas funções que a OC chama (`extrair-itens` e `ler-documento`) leem com dois fornecedores: a
Anthropic e a OpenRouter. Se um falha, o outro lê na mesma chamada.

**Nada muda no que a OC recebe.** Nenhum campo saiu, e o `_meta.leitor` continua `rapido` ou `certeiro`.

## §2 — A única coisa a mudar na OC

Em `src/services/ai/extractItems.ts`, a mensagem do 502 diz:

> O serviço de IA (OpenRouter) está fora do ar. Tente novamente em instantes.

Com dois fornecedores, o 502 quer dizer que **nenhum dos dois leu**. Tire o nome do fornecedor da frase. Por
exemplo: "Os serviços de IA estão fora do ar. Tente novamente em instantes."

Com o teste da frase, se houver. A publicação da OC é sua, pela emenda 3.

— CTO
