**De:** CTO · **Para:** Ordem_de_Compra · **Data:** 30/09/2026, 14h4x
**Decisão:** D655 · **Fase:** 4 — pedido direto do Pedro na Ordem de Compra. Serve ao portão: a nota com a obra escrita é a que o motor da Central_Financeiro identifica sozinho.
**Responde:** nada; é ordem nova, com a palavra do Pedro de hoje.
**Espero de volta:** o ramo, o CI, os PDFs de antes e de depois em imagem e as provas do §5. **Não publique:** eu aprovo, o Pedro vê os PDFs e só então vai a ordem de publicar.

# O PDF da OC tem que fazer o vendedor escrever o endereço da obra na nota fiscal

## 1. A palavra do Pedro

- **O pedido, hoje, na janela do CTO:** "Quero agora que vc melhore o template em .pdf da OC, pq um dos principais
  objetivos dela e o vendedor colocar na nota fiscal o endereço da obra. Quer é um grande problema hoje, então ela
  tem que ser montado de um jeito que deixe isso claro".
- **A escolha dele, à pergunta "o endereço do cliente continua no PDF?":** "Os dois, com destaque na obra".
  - O endereço de quem recebe a nota fica no PDF, mas menor.
  - O da obra ganha o destaque e a instrução.
- **A pausa da casa se levanta só para este item**, pela palavra dele.

## 2. O que o PDF faz hoje (`src/services/pdf/generateOcPdf.ts`, lido no `main` 340a506)

- **O primeiro bloco é o FATURAR PARA** (linhas 179–197), com o endereço inteiro do destinatário. É o primeiro
  endereço que o vendedor lê.
- **O ENTREGAR EM, com o endereço da obra, é o terceiro bloco** (223–238), depois da condição de pagamento e do
  fornecedor.
  - Tem a mesma letra e o mesmo peso do resto.
  - O título fala de entrega, não de nota fiscal.
- **A única instrução é o item 1 das condições de contratação** (linha 44), em 7,5 pt, no fim da página: "Constar o
  nome e endereço da obra no rodapé da Nota Fiscal".
  - "Rodapé" não é campo de nota. O campo de texto livre da nota eletrônica é o **Informações complementares**,
    no quadro "Dados adicionais".
  - O item 5 repete parte disso (número da OC e nome da obra/CNO).
- **O "CNO/CEI:" sai mesmo vazio** (linha 231).
- **Na produção, o texto das condições é o padrão do código.** A leitura do banco preenche vazio (`dados.ts:177`).
  Mudar o texto no código muda o PDF, sem ato no banco.

## 3. Por que o endereço da obra importa: a metade que recebe

A nota chega à Central_Financeiro, e o motor dela descobre a obra por esta escada
(`Central_Financeiro\motor\regras\identificar.py`, linhas 20–28):

1. o **CNO** da obra impresso na nota;
2. o **CEP** de uma obra só;
3. o **nome ou apelido** da obra impresso;
4. **logradouro + número** da obra.

**O endereço que a nota diz ser do destinatário (o tomador) não conta como o da obra**, de propósito (degrau 4,
linhas 711–719). Então o que o vendedor precisa escrever, num campo que ele preenche, é o nome da obra, o
logradouro com número, o CEP e o CNO quando houver. O número da OC vai junto, para o dia em que a nota se casar
com a OC.

## 4. O que construir

O desenho e as palavras são seus; o conteúdo, não.

1. **Um bloco "PARA A NOTA FISCAL" no alto da página 1, logo abaixo do cabeçalho.** Ele tem que ser a coisa mais
   visível da página: cor, borda e letra maior que o resto. Leva:
   - a instrução em uma frase, nomeando o campo, por exemplo: "Escreva no campo INFORMAÇÕES COMPLEMENTARES da nota
     o texto abaixo";
   - o texto pronto para copiar, com obra, logradouro e número, bairro, cidade/UF, CEP, CNO (só se a obra tiver) e o
     número da OC;
   - uma linha dizendo que o local de entrega é esse mesmo endereço.
2. **O destinatário continua, com nome, CPF/CNPJ e endereço, menor e abaixo do bloco.** O título de cada endereço
   diz de quem ele é, para o vendedor não confundir o do cliente com o da obra.
3. **O endereço da obra não aparece duas vezes competindo.** Se o bloco novo leva a obra, o ENTREGAR EM se funde
   nele ou só aponta para ele; a escolha é sua.
4. **As condições de contratação dizem o mesmo que o bloco.** O item 1 nomeia o campo certo, sem "rodapé". O item 5
   não repete o que o bloco já diz.
5. **O rodapé de toda página** pode levar a lembrança em uma linha. Se fizer, que caiba.
6. **Sem CNO no cadastro, o CNO some do texto.** Nada de "CNO: " vazio.

## 5. As provas

1. **Testes no texto do PDF**, porque o `desenhaPdfDaOc` já devolve o documento:
   - o bloco traz a obra, o logradouro, o CEP, o CNO quando há e o número da OC;
   - sem CNO, a palavra CNO não aparece no bloco;
   - na página 1, o bloco vem antes do FATURAR PARA.
   - Sabotagem: tirar o CEP do bloco reprova.
2. **Os PDFs em imagem**, legíveis, com o de hoje da mesma OC ao lado:
   - destinatário pessoa física com endereço;
   - destinatário empresa;
   - obra sem CNO;
   - OC com itens para duas páginas;
   - obra de endereço comprido, que quebra linha.
   - Em `docs\Capturas\2026-09-30_D655\`, numeradas.
3. **Dado fictício ou do ensaio.** Na carta de volta não vão nome, CPF, CNPJ nem endereço de ninguém.

## 6. O caminho

- Ramo novo a partir do `main`, pela emenda 3. Deve ficar longe de mil linhas, então não precisa de perícia.
- Não publique: eu confiro, o Pedro vê os PDFs, e a ordem de publicar vai em carta curta.
