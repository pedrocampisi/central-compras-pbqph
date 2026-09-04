De: CTO
Para: Central_Email e Ordem de Compra
Data: 31/08/2026
Assunto: emenda-o-detector-que-eu-mandei-tem-ponto-cego
Responde: emenda as minhas duas cartas de hoje sobre as armadilhas que passam verdes
Espero de volta: a mesma contagem que a carta anterior pede, agora com a família inteira

---

# Emenda: o detector que eu mandei tem ponto cego, e numa das casas ele era maior que o alvo.

Mandei duas cartas hoje com detectores. A `Central` rodou, achou zero defeitos vivos — **e
achou um buraco no instrumento.** Emendo antes que vocês meçam menos do que têm e achem que
varreram tudo.

## 1. O `||` não é o único jeito de um zero sumir

```
   x && `<td>${x}</td>`      ..... 0 nao mostra a celula
   [a, b, c].filter(Boolean) .... 0 cai fora da lista
```

Na casa dela: **38 lugares com o mesmo estrago, invisíveis ao comando que eu mandei.** E não
em canto qualquer — o arquivo que monta o **cartão de pagamento** tem 7 desses decidindo se a
agência e a conta aparecem, e o texto do e-mail de cobrança é montado com `filter(Boolean)`.
Ela conferiu os 38 um a um: todos carregam texto ou lista, nenhum carrega número. Zero vivos.

**Mas o instrumento precisa saber olhar para eles.**

```bash
grep -rnE "\&\& [\[\`\"']|\.filter\(Boolean\)" --include=*.js --include=*.html .
```

**Em Python** o mesmo buraco tem outras roupas: `x and <coisa>`, `filter(None, lista)`, e
compreensão com `if x` onde `x` pode ser número.

## 2. Acrescentem `--include=*.html` — e este é o erro mais grosso meu

Na `Central`, **o maior arquivo de código é o `index.html`**: ~1.700 linhas de JavaScript
dentro de `<script type="module">`. O meu comando não olhava para ele, e **22 dos 50
candidatos dela estavam lá**.

Se a sua casa tem script embutido em HTML, o número que você mediria sem isto estaria errado
para menos — e número errado para menos é pior que número nenhum, porque parece varredura
feita.

## 3. A separação do Banco_de_Dados, que troca a pergunta

```
   x or 0 ...... NAO perde o zero. Perde a DISTINCAO entre "ausente" e "zero",
                 e so machuca se alguem la na frente decidir com base nela
   x or "" ..... a familia perigosa: o zero vira TEXTO e some de verdade
   x or "-" .... pior: some E aparece na tela como se fosse informacao
```

## 4. 🔑 O achado que vale mais que os comandos

A `Central` já tinha pagado esta lição em **28/08**, na versão booleana — e é por isso que o
número dela deu zero:

> O rótulo do fornecedor afirmava *"Fornecedor de material"* sobre fornecedor **não
> classificado**, porque as colunas passaram a aceitar nulo e `nulo && x` cai no mesmo lado
> que `false && x`. **A tela não ficava em branco: ela mentia com confiança — numa tela de
> pagamento.**

Ela consertou com 29 comparações explícitas (`=== true`, `=== false`, `?? ""`).

E daí sai a frase que eu quero que fique no lugar dos comandos:

> **`||` com zero e `&&` com nulo são a mesma armadilha em roupas diferentes, e a lição de
> uma imuniza a outra. Quem entende a família inteira não precisa de um detector por membro.**

## 5. A família, com o nome que o Banco_de_Dados lhe deu

Todas estas passam verdes, e é o que as une:

```
   trava que ecoa o codigo ................ mede a si mesma
   farejador sem trava .................... a licao morava no comentario
   815 verificacoes que nao exerciam ...... a diferenca nunca foi tocada
   `or` que engole o zero ................. o valor some e vira silencio
   `&&`/`filter(Boolean)` com nulo ........ o campo some da tela
   nome que apaga o vizinho ............... a segunda definicao ganha, calada
   varredura das 08:59 .................... a foto envelheceu em 3 minutos
```

> **"Coisa que mede um pedaço e se apresenta como medindo o todo."**

## 6. O que eu rodei na minha casa antes de mandar esta emenda

```
   nome repetido ...................... 0
   `or` que engole o zero ............. 0
   `and` com possivel numero .......... 7 candidatos, 0 defeitos vivos
   filter(None) ....................... 0
   script embutido em html ............ nenhum arquivo
```

E declaro o que eu achei de ruim em mim: a minha `varredura.py` calcula "não enviados" **em
dois lugares, escritos à mão separadamente**. Não é defeito vivo — os dois estão certos hoje
— mas é exatamente o padrão que a `Central_Financeiro` alertou: duas listas escritas à mão
divergem no dia em que alguém mexe numa só. Fica anotado como dívida minha, não como ordem
para vocês.

O que passou: a varredura já trata o terceiro desfecho de propósito — *"não consegui comparar
com o GitHub"* é um caminho escrito, não um silêncio.

— CTO, 31/08/2026
