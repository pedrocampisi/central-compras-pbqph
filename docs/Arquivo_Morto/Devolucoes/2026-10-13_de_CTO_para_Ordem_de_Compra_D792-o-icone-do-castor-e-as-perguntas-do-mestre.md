# D792 — O ícone do castor e as perguntas do mestre

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 13/10/2026, 16h0x
**Decisão:** 792
**Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Espero de volta:** uma carta com as três peças num ramo, os testes, as fotos (o ícone e a tela do mestre a 375,
antes e depois) e a medida da §4; publicar só depois de eu conferir.

---

## §1 — O que aconteceu

O Pedro testou o app do mestre no Android dele, hoje, na produção. Cadastrou um mestre de teste, gerou o QR e chegou
à tela do recebimento (as quatro perguntas e a foto da nota). A recomendação é não enviar: o recebimento não tem
desfazer. Isso muda a D721 ("ninguém cria mestre de teste na produção") pela palavra dele.

Ele devolveu duas coisas, e eu junto uma terceira, que eu devia a você desde 12/10.

## §2 — O ícone: a cabeça laranja do castor

Palavra do Pedro: "o ícone também não ficou legal, do app. Coloque a cabeça laranja do castor".

- Os ícones do app (`public/icons/icon-192.png`, `icon-512.png` e `icon-512-maskable.png`, de 05/05) são o castor em
  contorno fino sobre azul escuro. No celular, quase não se vê.
- A cabeça laranja já está no repositório: `public/marca/mascote-rosto.png`, que já é o favicon.
- Refaça os três ícones e o da tela inicial do iPhone (apple-touch-icon) a partir dela, sobre o creme do tema
  (`#FBF3DE`). No `maskable`, a cabeça inteira dentro da área segura, para o Android não cortar o capacete.
- **A prova:** os ícones gerados, o `maskable` recortado em círculo e em quadrado arredondado, e a medida de que o
  manifesto publicado aponta para os novos.
- Diga na carta o que o Pedro precisa fazer no celular para ver o ícone novo (o Android guarda o ícone antigo).

## §3 — As duas perguntas que parecem a mesma

Palavra do Pedro, na tela do mestre: "esse chegou 'tudo' não é meio redundante?".

No código não é (`src/domain/recebimento.ts`):
- "Chegou o que foi pedido?" guarda a conformidade com a OC e a ECR;
- "Chegou tudo?" guarda a entrega parcial.

Mas se o dono leu as duas como a mesma pergunta, o mestre também vai ler. O texto muda para a diferença ficar à
vista: uma pergunta é sobre o **material certo** (o tipo, a marca, a medida); a outra, sobre a **quantidade
toda**. Uma ideia, que é palpite meu: "Veio o material certo?" e "Veio a quantidade toda?" (Sim / Só uma parte).
O texto final é seu, na língua do mestre (D693). O que o banco guarda não muda.

## §4 — A D768, que eu devia desde 12/10

A Central precisa, para casar nota e OC no 2a, que o recebimento guarde:
1. o **número da nota em dígitos**;
2. a **quantidade recebida por item**.

Eu marquei esta carta como "agora" em 12/10, e ela não saiu. O erro é meu.

- **Meça antes de construir:** o que o recebimento já guarda hoje (o número lido da foto, o "Sem foto? Escreva o
  número", os itens).
- **Construa só o que falta.** A quantidade por item cabe no "Só uma parte": a lista dos itens com a quantidade
  pedida já escrita, e o mestre muda só o que veio a menos. Com "Sim", vale a quantidade pedida.
- Se precisar de coluna ou tabela nova, **pare e me escreva**: a peça é do Banco.

## §5 — O caminho

- Um ramo do `main`, com teste e sabotagem em cada peça.
- Abaixo de mil linhas de código: sem perícia.
- Eu confiro as fotos. Depois você publica pelo seu caminho (emenda 3) e me manda a prova de que a produção serve a
  versão nova.

— CTO
