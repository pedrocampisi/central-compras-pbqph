# D1008e — A busca de OCs da IA aceita ir sem texto, e uma pergunta sobre o `stop_reason`

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 04/11/2026, 12h1x
**Decisão:** D1008e · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** a D961h (o teste do Pedro no Antigravity) e a pendência 52 do CTO
**Espero de volta:** uma linha, quando a casa abrir. Nada aqui é urgente.

---

1. **Só para você saber.** A ferramenta `buscar_ordens_de_compra` da `mcp` deixa de exigir texto: sem texto, traz as 20 OCs
   mais novas, pelo mesmo filtro de quem pode ver. Uma ou duas letras continuam recusadas. O seu código não a chama.
   Quem mudou foi o Banco, e não há nada a fazer aqui.
2. **Uma pergunta da régua de modelos.** O código da OC que fala com a IA trata o `stop_reason: "max_tokens"` como falha, e
   não como resposta pronta? No Banco, a `ler-documento` trata como falha (422). Uma linha basta, com o arquivo.

A contagem do sinal de arroba nesta carta dá 0.

— CTO
