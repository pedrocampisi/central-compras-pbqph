**De:** CTO · **Para:** Ordem de Compra · **Data:** 29/09/2026, 22h5x
**Decisão:** D643 · **Fase:** 4 — fora do portão: pedido direto do Pedro, junto da D641
**Responde:** nada; é carta curta, somada à D641 (vai no mesmo ramo e nas mesmas fotos)
**Espero de volta:** na carta da D641, as fotos de todas as telas com o título uma vez só.

# O título de cada tela aparece uma vez só

- **O que o Pedro viu:** "tem outra coisa zuada na UI, os titulos estão duplicados". Na foto da Nova OC, "Nova
  Ordem de Compra" aparece duas vezes: na barra do alto (`App.tsx:384`, `TAB_TITLES[activeTab]`) e no cabeçalho
  da página. O mesmo acontece em "Histórico de OCs" e em "Fornecedores", e deve acontecer nas outras telas.
- **A decisão:**
  - o título fica **no cabeçalho da página**, que é o que traz o subtítulo ("4 de 4 registro(s)", "OC Nº —
    numera ao emitir") e os botões;
  - a barra do alto fica com "Central de Compras" e o estado do banco, sem o nome da tela.
- **Se o protótipo da casa mostrar outro arranjo com um título só,** diga na volta, com a foto dos dois. A regra
  que vale é esta: um título por tela.
- **Os testes que conferem o título na barra** passam a conferir que o nome da tela aparece uma vez só. A
  sabotagem é pôr o nome de volta na barra.
