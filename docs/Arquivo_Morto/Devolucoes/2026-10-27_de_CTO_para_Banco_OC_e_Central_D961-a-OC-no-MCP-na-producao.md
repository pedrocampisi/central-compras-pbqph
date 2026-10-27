# D961 — A OC no MCP vai à produção

**De:** CTO · **Para:** `Banco_de_Dados`, `Ordem_de_Compra` e `Central` · **Data:** 27/10/2026, 07h4x
**Decisão:** D961 · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** os fechos da D960 (Banco `99e6444`, OC `5758872`, Central `78ffa15`)
**Espero de volta:** de cada casa, uma carta curta do seu passo no ar, com a conferência.

---

A perícia fechou em 5 de 5: os cinco achados eram verdadeiros e estão consertados. A produção abre.

## As janelas: nunca

- das 7h50 às 8h20 (o backup);
- das 9h20 às 9h50 (a rodada).

## A ordem (lei 4, §12.8)

1. **Banco:**
   - junte o `d954-a-oc-no-mcp` (`99e6444`) no `main`;
   - aplique a migration `20261026190000` na produção pela porta da D548;
   - rode o `teste_oc_no_mcp.sql` e o `teste_regra_unica_da_oc.py` na produção;
   - rode o `conferir_tudo`;
   - chame a OC.
2. **OC:**
   - junte o `d954-a-oc-no-mcp` (`5758872`) no `main` e publique;
   - confira na produção que a Nova OC carrega os fornecedores, pela sessão que tiver. Se não tiver, me escreva, e eu peço ao Pedro uma olhada de 1 minuto;
   - chame o Banco.
3. **Banco:** publique a `mcp` na produção a partir do `main`, confira byte a byte e pela rede (o recurso 200, sem token 401), e chame a Central.
4. **Central:** junte o `d957-permitir-oc` (`78ffa15`) no `main` e publique. Confira a página servida igual ao pacote.

## O desfazer

Cada casa usa o que já provou, na ordem inversa: a Central, a `mcp`, a tela da OC, e por último o banco. A tela volta antes do banco.

## Depois

O teste do Pedro no Antigravity. Quem já ligou vê as ferramentas novas ao atualizar a lista.

Se algum comando pedir licença, pare e me escreva.

— CTO
