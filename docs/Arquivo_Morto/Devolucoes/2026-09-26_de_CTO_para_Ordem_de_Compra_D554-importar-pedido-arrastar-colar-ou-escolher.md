# D554 — Importar Pedido (IA): um campo para arrastar, colar com Ctrl+V ou escolher o arquivo

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 15h0x
**Decisão:** D554 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação, com o desfazer, as linhas para o Pedro conferir, e a campainha.

## §0 — A palavra do Pedro

Na minha janela, em 26/09/2026 por volta das 15h0x, com um print da Nova OC (o bloco Itens vazio, os botões "+ Adicionar
Item" e "Importar Pedido (IA)"):

> "na hora de importar o pedido ele abre a minha pasta. Não gostei prefiro que ele abra um campo para arrastar/copiar o
> arquivo (ou um print) no control + v e dar a opção de escolher tb"

Hoje o botão chama `fileInputRef.current?.click()` (`NovaOcPage.tsx:714`) e vai direto para a pasta.

## §1 — O que muda

1. **O botão "Importar Pedido (IA)" abre um campo, e não a pasta.** O campo fica no bloco Itens e diz as três formas:
   - **arrastar** o arquivo para dentro dele;
   - **colar com Ctrl+V** um print (a imagem da área de transferência) ou um arquivo copiado no Explorer;
   - o botão **"Escolher arquivo"**, que abre a pasta como hoje.
   - O campo fecha pelo X ou pelo Esc, e não lê nada sozinho ao fechar.
   - Uma ideia, se servir: com a OC sem itens, a caixa "Nenhum item adicionado" pode ser o próprio campo. A forma é sua.
2. **O Ctrl+V só vai para a importação com o campo aberto e o cursor fora de um campo de texto.** Colar na Descrição de
   um item continua colando texto. Com o campo fechado, o Ctrl+V da página não muda.
3. **Os tipos são os de hoje:** PDF, JPG e PNG, e o print colado, que chega como imagem. Um tipo diferente recebe uma
   mensagem dizendo quais servem, e nada vai para o servidor.
4. **Mais de um arquivo ou print de uma vez** (as fotos das páginas de um mesmo pedido) entram juntos, numa leitura
   só, como páginas.
5. **O limite de páginas nunca corta em silêncio.** Hoje, `pdfToImages.ts:56` lê só as 5 primeiras páginas do PDF e
   joga fora o resto sem aviso. Um pedido de 6 páginas vira uma OC com itens a menos, e ninguém fica sabendo.
   - O limite continua o de hoje (5), porque o teto de tokens do servidor (8000) foi feito para ele.
   - A conta é pelo total de páginas de tudo o que entrou.
   - Passou do limite: a mensagem diz quantas páginas chegaram e qual é o limite, e **nada é lido**. A pessoa manda em
     duas vezes, porque os itens se somam aos que já estão na OC.
6. **Enquanto lê,** o campo mostra que está lendo, e um segundo envio fica bloqueado até a resposta.

## §2 — O que não muda

- **O modelo.** A função `extrair-itens` da produção (versão 3, conferida por mim hoje) usa
  `google/gemini-3.5-flash-lite` com `reasoning: minimal`, desde 10/08, por decisão do Pedro. Não mexa.
- O servidor, o prompt, a normalização e o "+ Adicionar Item".

## §3 — Uma coisa que o print mostra

A caixa "Nenhum item adicionado" aparece **fora do centro, à direita**. No print, que tem uns 1180 px de largura, ela
fica centrada perto dos 850 px, e sobra um vazio grande à esquerda. Parece centrada na largura da tabela, e não na parte
que se vê.
- Meça nas quatro larguras de sempre.
- Se for isso, centralize na parte visível.
- Se não for, diga o que é.

## §4 — Como publicar

- **Direto na produção** (D541), pela emenda 3, com o desfazer anotado.
- **Travas com sabotagem:**
  - o botão não chama mais o clique do `input` de arquivo;
  - o Ctrl+V dentro de um campo de texto não vai para a importação;
  - mais de 5 páginas não chega ao servidor;
  - tipo errado não chega ao servidor.
- **A 375 px:** arrastar e colar são coisa de computador. No celular, o campo mostra o "Escolher arquivo", que já abre
  a câmera ou a galeria.
- **Na carta de publicação, três linhas prontas para o Pedro conferir:**
  - colar um print com Ctrl+V;
  - arrastar um PDF;
  - escolher pelo botão.
- O teste com login é dele, porque agente não entra com usuário. A carta dá o passo a passo, e diz o que ele deve ver
  em cada uma.

— CTO
