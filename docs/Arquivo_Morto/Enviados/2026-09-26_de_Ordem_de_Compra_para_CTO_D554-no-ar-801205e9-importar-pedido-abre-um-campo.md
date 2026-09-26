# D554 — no ar: `801205e9` (o desfazer é `e7e22b41`). O "Importar Pedido (IA)" abre um campo para arrastar, colar com Ctrl+V ou escolher o arquivo

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 15h3x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D554-importar-pedido-arrastar-colar-ou-escolher.md`
**Espero de volta:** nada, a não ser que o senhor discorde da leitura da caixa fora do centro (§3).
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — O que mudou, item por item da sua §1

```
   1 o botao ............ "Importar Pedido (IA)" abre um campo no bloco Itens. Nao clica mais em
                          input nenhum; a Nova OC nao tem mais input de arquivo proprio.
                          Com a OC sem itens, o campo toma o lugar do "Nenhum item adicionado"
                          (a sua ideia). Com itens, aparece embaixo da tabela.
                          Com o campo aberto, o botao fica cinza. O campo pega o foco ao abrir,
                          e o Ctrl+V ja' vale sem clicar em nada.
                          Fecha pelo X ou pelo Esc, sem ler nada.
   2 o Ctrl+V ........... so' com o campo aberto, e so' com o cursor fora de campo de texto.
                          Campo de texto: input que se digita, textarea, select, editavel.
                          Na Descricao, na Quantidade ou nas Observacoes, colar cola como antes.
                          Campo fechado: o Ctrl+V da pagina nao muda.
                          O Esc segue a mesma regra, e nao fecha nada quando a lista do
                          Fornecedor/Obra esta' aberta (ela fecha primeiro).
   3 os tipos ........... PDF, JPG e PNG, pelo tipo que o navegador diz ou pela extensao quando
                          ele nao diz. O print chega como PNG. Tipo errado: a mensagem diz qual
                          arquivo nao serve e quais servem, e nada sai do navegador.
                          WebP e HEIC ficam de fora, porque nao estavam no "Escolher" de antes.
   4 varios de uma vez .. arrastar, colar ou escolher varios (o "Escolher" agora aceita mais de
                          um). Uma leitura so', as paginas na ordem em que chegaram.
   5 o limite ........... 5, contado pelo total de tudo o que entrou. Primeiro cada arquivo e'
                          aberto e as paginas sao SOMADAS; so' depois alguma pagina e' desenhada.
                          Passou de 5: "Chegaram N paginas, e o limite de uma leitura e' 5. Nada
                          foi lido: mande em duas vezes — os itens de cada leitura se somam aos
                          que ja' estao na OC."
                          O corte calado de pdfToImages.ts:56 saiu.
                          O outro corte calado, o .slice(0, 10) antes do fetch em
                          extractItems.ts, tambem saiu: virou uma trava que recusa mais de 5
                          antes de chamar o servidor.
   6 enquanto le ........ "Lendo o pedido…" no campo, e o martelo depois de 250ms. Colar, soltar,
                          escolher, o X e o Esc ficam bloqueados ate' a resposta.
                          Ao terminar bem: o campo fecha, os itens entram, e vem o aviso verde.
                          Ao falhar: a mensagem fica escrita no campo (role=alert), que continua
                          aberto para a pessoa tentar de novo.
```

Um cuidado a mais: **com o campo aberto, um arquivo solto fora dele não abre por cima da OC.** Antes,
errar o alvo fazia o navegador abrir o PDF no lugar da página, e o rascunho ia junto.

## §2 — O que não mudou

- **O modelo e o servidor:** `extrair-itens` na produção continua na **versão 3**, e a última mudança
  é de agosto. Conferi só lendo, depois de publicar. Não abri e não mudei o prompt.
- **O que o servidor recebe:** o mesmo `{imagens: [...]}`, JPEG na mesma escala e qualidade (1,6 e
  0,75).
- **A normalização e o "+ Adicionar Item":** não mudaram.

## §3 — A caixa "Nenhum item adicionado": medi, e ela está no centro do que se vê

Medi na tela de prova, com a casca da aplicação (a lateral e o conteúdo), nas quatro larguras e na
do print:

```
   largura   area de conteudo visivel   centro dela   centro da caixa
     375            84 – 355                220             220
     768            84 – 738                411             411
    1024           288 – 974                631             631
    1180           288 – 1130               709             709
    1440           288 – 1390               839             839
   rolagem de lado: 0 em todas (a 375 havia 3px; ver abaixo)
```

- **A caixa está centrada no conteúdo, ao pixel, nas cinco.** Com a OC vazia não existe tabela; a
  caixa ocupa a largura do bloco Itens, e o bloco é a largura do conteúdo.
- **O vazio à esquerda é a lateral** (248 px, ou 64 abaixo de 900). Contra a janela inteira, a caixa
  fica 124 px à direita do meio, e é isso que o olho vê.
- **Os "perto dos 850"** batem com uma janela de 1440 (839). Numa janela de 1180 inteira, o centro
  seria 709. Meu palpite é que o print foi de uma janela mais larga, reduzido ou cortado.
- **Não mexi.** Centralizar na janela desalinharia a caixa de todo o resto do formulário.
- **Na prática, o problema some no caso que o Pedro viveu:** ao apertar "Importar Pedido (IA)", o
  campo toma o lugar da caixa.
- **Se o print mostra outra coisa, por exemplo a caixa passando da borda,** me mande que eu meço de
  novo.

Duas coisas que a medição achou:

- **A 375 px, o "Importar Pedido (IA)" passava 3 px da borda**, e a tela ganhava rolagem de lado.
  Consertei: os dois botões quebram linha. Hoje a rolagem é 0.
- **A 375 px, o painel Totais transborda para a esquerda. Não mexi.** A grade dele pede 200 + 100 px
  mais o espaço entre as colunas, 320 px, onde cabem 271. Como está alinhada à direita, sobra 49 px
  para a esquerda, por baixo da lateral, e o "Subtotal bruto" aparece cortado. Isso é de antes da
  D554 e fora desta carta. Se quiser, é pouca coisa.

## §4 — Travas e sabotagens

Todas as sabotagens foram restauradas com hash igual.

```
   (1)  o codigo de antes volta (ref + input escondido + o botao clicando) ... 4 vermelhos
   (1b) o botao novo abre o campo E clica um input ........................... 2
        (1) e (1b) de novo SEM o teste de texto, so' com o de comportamento .. 3 e 1
   (2)  o Ctrl+V dentro de campo de texto vai para a importacao .............. 1
   (3a) mais de 5 paginas: tirar a soma antes de desenhar .................... 1
   (3b) a ultima porta (extractItems) sem a trava ............................ 1
   (4)  tipo errado chega ao servidor ........................................ 2
```

A primeira rodada deixou duas verdes, e foi bom:

- **A (1) verde** foi sabotagem minha mal feita: eu clicava um input que já não existia. Refiz como o
  código de antes era.
- **A (3a) verde** mostrou uma trava sem teste. A trava depois do desenho pegava sozinha, mas nada
  provava que um PDF de 40 páginas não é desenhado inteiro antes de ser recusado. Entrou o teste
  "passou do limite, nenhuma página é desenhada".

A bateria:

```
   testes ....... 207 verdes (eram 173; +9 regra, +12 leitura, +13 campo e pagina)
   tambem ....... lint e typecheck limpos; build e conferir:pacote 5/5, pela publicacao
```

Na tela de prova (apagada), com a `lerPedido` de verdade:

- seis prints colados deram a mensagem das páginas;
- um `.docx` solto deu a mensagem do tipo;
- colar dentro das Observações não fez nada;
- em nenhum dos três houve chamada a `/functions/v1/`;
- o Esc fecha e a caixa vazia volta;
- a 375, o campo diz "Escolha o PDF ou as fotos do pedido" e mostra "Escolher arquivo";
- o tema escuro está certo.

## §5 — Publicação

```
   commit ....... 6e20dc3 (codigo)
   saiu do ar ... e7e22b41-2714-4e4c-bcfd-08702547e1da (a D551)  <- O DESFAZER
   entrou ....... 801205e9-2fa2-4678-8764-3d14ac57b97d · versao 20260926182529-6e20dc3
   medido depois, por fora:
     /versao.txt ............ "20260926182529-6e20dc3"
     index-D0ogZYfu.js ...... "Arraste o pedido para ca' ou cole com Ctrl+V" 1 · "Escolha o PDF
                              ou as fotos do pedido" 1 · "Escolher arquivo" 1 · "Lendo o pedido" 1
                              · "o limite de uma leitura e'" 1 · "Fechar a importacao" 1
     extractItems-DGRwW8aI .. if(e.length>5)throw ... antes do fetch; slice(0,10) 0
     pdfToImages-C_7IKVTp ... Math.min 0; numPages vai inteiro para a conta
```

## §6 — As três linhas para o Pedro, em compras.campisi.com.br

> Antes: abra a **Nova OC**. A aba aberta se atualiza sozinha ao voltar para ela; senão, Ctrl+Shift+R.
>
> 1. **Colar um print com Ctrl+V.**
>    - Tire um print de um pedido com **Win+Shift+S** e marque a parte dos itens.
>    - Na Nova OC, aperte **"Importar Pedido (IA)"**. No lugar do "Nenhum item adicionado" aparece um
>      campo tracejado: *"Arraste o pedido para cá ou cole com Ctrl+V"*.
>    - **Sem clicar em nenhuma caixa de texto**, aperte **Ctrl+V**.
>    - Deve ver **"Lendo o pedido…"**. Depois o campo fecha, os itens aparecem na tabela e vem o aviso
>      verde **"N item(ns) importado(s) via IA."**
>    - Um extra, se quiser: clique nas **Observações** e aperte Ctrl+V. A imagem não é importada.
> 2. **Arrastar um PDF.**
>    - Abra o campo de novo.
>    - Arraste da pasta um PDF de pedido com **até 5 páginas** para dentro do campo. A borda fica azul
>      enquanto o arquivo passa por cima.
>    - Solte. Deve ver o mesmo da linha 1, e os itens novos **se somam** aos que já estavam.
>    - Se o PDF tiver **6 páginas ou mais**, a mensagem vermelha diz quantas chegaram e que o limite é 5,
>      **e nenhum item entra**.
> 3. **Escolher pelo botão.**
>    - Abra o campo e aperte **"Escolher arquivo"**. A pasta abre, como antes.
>    - Dá para marcar **várias fotos** de uma vez (Ctrl+clique). Elas viram uma leitura só.
>    - Deve ver o mesmo da linha 1.
>    - O **X** ou o **Esc** fecham o campo sem ler nada.
>    - No celular, o mesmo botão abre a câmera ou a galeria.

## §7 — O que não vi

- **Um print de verdade vindo do Windows e um arquivo de verdade arrastado do Explorer.** Na prova,
  os eventos foram montados com o mesmo `DataTransfer` que o navegador entrega, mas quem apertou fui
  eu, por código.
- **Um PDF de verdade desenhado.** A conta usa `numPages`, que é o que o código antigo já usava.
- **A leitura no servidor.** A tela logada é da conferência do Pedro, como sempre.

As três linhas do §6 cobrem esses três pontos.

— Ordem_de_Compra
