# D557 — Colar a lista de materiais em texto, do jeito que veio, e a IA organiza os itens da OC

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 17h1x
**Decisão:** D557 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação, com o desfazer e as linhas para o Pedro conferir, e a campainha.
**O servidor é do Banco** (carta irmã, a mesma D557): a `extrair-itens` passa a aceitar texto. Construa já, pelo
contrato do §2. **Publique só depois que eu avisar que a função nova está na produção.**

## §0 — A palavra do Pedro

Na minha janela, em 26/09/2026 entre 16h3x e 17h0x:

> "eu quero que você implemente uma nova função, que é colocar um texto para a IA ler e organizar. […] ao invés de […]
> na hora de colocar os materiais […] selecionando um por um […], a pessoa vai pegar, colocar os textos meio torto e a
> IA vai […] interpretar o texto e […] organizar, entendeu? A ordem de compra."

É o caso de todo dia: o engenheiro manda a lista pelo WhatsApp, e quem faz a OC hoje digita item por item.

## §1 — O que muda na tela

1. **O campo do "Importar Pedido (IA)" (D554) ganha uma caixa de texto:** "ou cole aqui a lista de materiais, do jeito
   que veio", com o botão **"Organizar com IA"**. As três formas da D554 (arrastar, Ctrl+V, escolher) continuam.
2. **O Ctrl+V decide pelo que está na área de transferência,** e não pelo lugar do cursor:
   - **imagem ou arquivo:** importa como hoje, **mesmo com o cursor na caixa de texto do campo**. As três linhas que o
     Pedro conferiu na D554 continuam valendo;
   - **texto:** vai para a caixa de texto do campo;
   - **fora do campo** (a Descrição de um item, as Observações), o Ctrl+V continua colando como antes.
3. **O resultado:**
   - os itens entram **somados** aos que já estão, como na importação;
   - o aviso diz quantos itens entraram e quantas linhas ficaram de fora ("7 itens · 2 linhas ignoradas");
   - **as linhas ignoradas aparecem**, para a pessoa ver o que não virou item, até ela fechar;
   - **o item com `confira`** fica marcado na tabela, com o texto da dúvida ao passar o mouse e também escrito na
     linha, na tela de celular. **O `confira` não vai ao banco nem ao PDF.** Some quando a pessoa edita a linha, ou
     quando o rascunho é salvo;
   - **quantidade 0 e preço 0** ficam à vista: é o que o texto não disse, e quem completa é a pessoa.
4. **A caixa de texto não se perde:**
   - se a leitura falhar, o texto fica lá para tentar de novo;
   - se der certo, a caixa esvazia.
5. **Os limites e erros** vêm do servidor em português, e a tela mostra a mensagem como veio. Com a caixa vazia, o
   botão fica cinza.

## §2 — O contrato com o servidor

```
   entrada .... POST extrair-itens  { "texto": "<a lista como a pessoa colou>" }
   saida ...... { "itens": [ { os campos de hoje ..., "confira": "texto curto" (opcional) } ],
                  "ignoradas": [ "linha como veio", ... ],
                  "_meta": { ... como hoje } }
   erros ...... 400 (vazio, texto e imagens juntos, grande demais), com { "erro": "mensagem em portugues" };
                o resto como hoje (401, 403, 422, 502, 503)
   imagem ..... como hoje; a resposta ganha "ignoradas": [] e nada mais
```

A normalização de unidade e de campo continua na tela, a mesma da importação (`extractItems.ts`).

## §3 — Como publicar

- **Travas com sabotagem:**
  - o `confira` não chega ao `salvar_oc` nem ao PDF;
  - o Ctrl+V de imagem na caixa de texto do campo importa a imagem;
  - o Ctrl+V fora do campo não muda;
  - as linhas ignoradas aparecem;
  - a falha não apaga o texto.
- **A 375 px:** a caixa de texto e o botão cabem, com 0 de rolagem de lado. É o caso do celular: o engenheiro copia do
  WhatsApp e cola.
- **Direto na produção** (D541), pela emenda 3, com o desfazer anotado, **depois do meu aviso** de que a função está no
  ar.
- **Linhas prontas para o Pedro conferir,** com um texto de exemplo que ele copia da própria carta: sem nome de
  cliente, de obra ou de gente, com uma linha que não é item e uma sem quantidade. Diga o que ele deve ver.

— CTO
