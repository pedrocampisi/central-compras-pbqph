# D575 — o campo encolhe depois da leitura: os 8 itens e o total cabem na janela. Ramo `3795db0`, nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 01h0x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D575-depois-da-leitura-os-itens-a-vista.md`
**Espero de volta:** o seu olhar nas fotos. **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d557-lista-em-texto`, último commit **`3795db0`**, empurrado. O `main` continua sem ele.
- **Testes:** 292, todos verdes. Tipos e lint limpos.
- **Travas:** 8 sabotagens novas (24 a 31). Todas mordem, e o hash volta igual.

## §2 — O que fiz: o seu caminho 1

- **Depois da leitura que deu certo, o campo fica só com o resultado:** o total, quem leu, o "Ler de novo com o
  certeiro", as linhas ignoradas e os avisos.
- **A escolha, o "Escolher arquivo" e a caixa de texto** somem até um botão novo, **"Ler outro pedido"**, que os
  traz de volta. O resultado continua na tela.
- **A página rola** até o pé do campo ficar no pé da janela, sem animação. Os itens entraram logo acima, e ficam à
  vista junto do total.
- **Colar ou soltar outro pedido** continua valendo com o campo encolhido. Colar **texto** traz a caixa de volta,
  com o texto dentro.
- **A falha sem leitura anterior** deixa o campo inteiro, como antes.
- **Não mudou:** os textos, as cores, as travas e a ordem das coisas. O que some, some inteiro, no lugar em que
  estava. O caminho 2 (usar a largura) não foi preciso.

## §3 — A medida

- **A 1920 × 1080:** as 8 linhas da tabela e o cartão do total ficam inteiros dentro da janela, nos estados 04, 05
  e 06. O "Ler de novo com o certeiro" também fica à vista, na 04 e na 06; na 05 ele não existe, porque quem leu foi
  o certeiro.
- **Nas outras larguras**, o mesmo nos três estados; lá as fotos são altas.
- **A trava:** o jsdom não mede janela, então a bateria trava o que faz caber:
  - o campo encolhido;
  - a rolagem até o **fim** do campo, e não até o alto;
  - o "Ler outro pedido".

  **A janela se mede no fotógrafo,** no navegador de verdade. A foto é a prova.

## §4 — As fotos

- **As 10 de 1920 × 1080 foram refeitas.** As sete sem resultado (01, 02, 03, 07, 08, 09 e 10) saíram **idênticas,
  byte a byte**: ali a tela não mudou.
- **Mudaram a 04, a 05 e a 06,** refeitas também a 1280, 1024, 768 e 375, com o mesmo nome. Rolagem de lado 0 e nada
  fora da tela, nas 22.
- **Um aviso sobre elas:** nas quatro larguras, as 04, 05 e 06 agora mostram o `App` inteiro, com menu e topo. Os
  outros sete estados dessas larguras continuam com a moldura antiga da página de prova. Se quiser as 40 iguais, é
  só pedir.
- **A 1920, a 04** tem o "8 itens importados via IA." por cima do "Ler outro pedido", nos 3,4 s da mensagem. É a
  mesma mensagem do sistema todo que o senhor já deixou como está.

## §5 — Um achado que não é desta carta (não consertei)

Com o `App` inteiro a **375**, dois defeitos da moldura do sistema, a mesma que está no ar:
- **O título do topo** ("Nova Ordem de Compra") quebra em quatro linhas e passa por cima do título da página.
- **O avatar do rodapé do menu** ("PP") sai cortado na borda esquerda.

A medida de "nada fora da tela" não pega nenhum dos dois: um fica por cima de outra coisa, e o outro sai pela
esquerda.

As fotos de antes não mostravam isso porque usavam uma moldura falsa. Ver `04_resultado_do_rapido_375.png`, no
alto. O senhor decide se vira carta.

— Ordem_de_Compra
