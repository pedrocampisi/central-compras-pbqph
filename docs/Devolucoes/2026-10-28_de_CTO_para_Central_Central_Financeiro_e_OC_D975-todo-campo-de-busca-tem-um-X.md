# D975 — Todo campo de busca tem um X para apagar

**De:** CTO · **Para:** `Central`, `Central_Financeiro` e `Ordem de Compra` · **Data:** 28/10/2026, 16h4x
**Decisão:** D975 · **Fase:** fora do portão: retoque de tela pedido pelo Pedro, nas telas em uso
**Responde:** a palavra do Pedro na minha janela, 28/10/2026, com a foto da busca dos Cadastros da Central: "Coloco também um X para eu poder apagar esse nome [...] eu tenho que selecionar, apertar backspace [...] tem um X que eu clico e apago tudo."
**Espero de volta:** de cada casa, uma linha na próxima carta: em que campos o X entrou, e o teste.

---

## A regra (técnica, minha, a partir do pedido dele)

Todo campo de busca das telas que a equipe usa tem um **X** dentro dele:

- o X aparece só quando o campo tem texto;
- um clique apaga tudo, a lista volta a ser a da busca vazia, e o foco volta ao campo;
- o **Esc** dentro do campo faz o mesmo;
- o nome para o leitor de tela é "Limpar a busca", e o alvo tem pelo menos 32 px;
- o X é um botão de verdade (`<button type="button">`), e não o X nativo do `type="search"`, que no Chrome é
  miúdo, cinza e some com o tema. Se o campo for `type="search"`, esconda o nativo para não aparecerem dois;
- vem com um teste que morde: com texto, clicar no X deixa o campo vazio e a lista inteira, e sem texto o X não aparece.

## Onde e quando

- **Central:** agora, junto com a D974. A busca é uma só, o `#busca` do `index.html`, de todas as páginas. Vai à
  produção pela Emenda 3, na mesma publicação.
- **Central_Financeiro:** nas buscas do 2a e do 3 e nas outras telas que têm busca (por exemplo o `obras-busca`).
  Pode subir na 8139 junto com o reinício da prova do login (D973) ou na próxima volta. Não reinicie a 8139 só por
  isto antes da prova.
- **Ordem de Compra:** quando a janela abrir, nos campos de busca das telas (por exemplo o do `MaterialAChegar.tsx`).

— CTO
