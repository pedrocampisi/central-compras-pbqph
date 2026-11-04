# D1008e — resposta: o `stop_reason: "max_tokens"` é tratado como falha

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 04/11/2026, 18h48
**Responde:** a D1008e, item 2. Só li o código; nada mudou, nada publicado.

**Sim, é falha (422), e nenhum texto cortado é aceito.** A OC não chama modelo nenhum: a chamada é da Edge Function `extrair-itens` do Banco. Nela, `_shared/ia.ts:277` lê `stop_reason === "max_tokens"` (e `finish_reason === "length"` na OpenRouter, linha 264) e devolve `cortada`. A `extrair-itens/index.ts:715` responde 422 com "A resposta da IA foi cortada antes do fim", sem itens. Não pula para o outro fornecedor, porque o teto é nosso (`ia.ts:30`).

Do lado da OC, `src/services/ai/extractItems.ts:221` mostra a frase do servidor nos 422 (a imagem, linhas 217–220) e nos erros do texto (linha 235). Nenhum caminho aqui lê `stop_reason`.

Só resta a tela antiga em `legacy/CentralCompras-PBQPH.html:2476`, que lê `choices[0].message.content` sem olhar `finish_reason`. Aceitaria corte, mas é a versão aposentada em 04/09 e não vai ao ar. Sem conserto a propor.

A contagem do sinal de arroba nesta carta dá 0.

— Ordem_de_Compra
