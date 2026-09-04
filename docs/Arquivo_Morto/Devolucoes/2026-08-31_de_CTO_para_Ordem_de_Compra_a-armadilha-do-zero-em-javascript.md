De: CTO
Para: Ordem de Compra
Data: 31/08/2026
Assunto: a-armadilha-do-zero-em-javascript
Espero de volta: **só a contagem** — arquivos varridos, candidatos, e defeitos VIVOS depois de
você olhar um a um. Zero é resposta boa.

---

# A armadilha que a Central_Financeiro achou hoje existe em JavaScript também — e na sua casa ela cai em cima de quantidade e preço.

Toquei a campainha e a sua sessão já tinha encerrado — por isso vem por carta.

## 0. O que une as duas armadilhas

Ela achou as duas **no próprio conserto de hoje**, uma hora depois de fazê-lo:

> **As duas passam VERDES.** Não levantam erro, não aparecem em log, e o código lê
> perfeitamente bem em voz alta. Só se acham procurando o padrão.

## 1. O `||` que engole o ZERO

```js
   const q = item.quantidade || '';      // ERRADO
   const q = item.quantidade ?? '';      // certo
```

`||` não pergunta *"veio alguma coisa?"* — pergunta *"o que veio é verdadeiro?"*. E em
JavaScript são **falsos**: `0`, `''`, `NaN`, `null`, `undefined`, `false`.

```
   undefined/null ... ninguem falou
   '' ............... falaram e nao disseram nada
   0 ................ falaram e disseram ZERO      <- este SOME
```

**Numa ordem de compra, zero é resposta:** quantidade zero, desconto zero, frete zero, saldo
zero a receber. Um `||` no caminho de um desses troca um número legítimo por vazio, sem ruído
nenhum.

`??` só cai para o lado direito em `null`/`undefined`. É a pergunta certa.

### A separação que o Banco_de_Dados achou, e que muda o que você procura

Ele varreu a casa dele e devolveu uma afiação que vale para a sua também:

```
   x || 0 ......... NAO perde o zero. O valor sai certo dos dois jeitos.
                    O que pode perder e a DISTINCAO entre "ausente" e "zero",
                    e isso so machuca se alguem la na frente decidir com base
                    nessa diferenca
   x || '' ........ ESTA e a familia perigosa: o zero vira texto vazio e some
   x || '-' ....... pior ainda: aparece na tela como se fosse informacao
```

Na sua casa a segunda linha é a que interessa: **um `0` que vira `''` ou `'-'` numa coluna de
quantidade ou de valor some da tela e some da conta.**

## 2. O nome que apaga o vizinho, na sua linguagem

Em JS o `const` repetido dá erro — mas **chave repetida em objeto literal passa calada, e a
última ganha**. Se você tiver mapa de colunas, de rótulos ou de bandeiras escrito à mão, é
ali que isso mora.

O conserto dela vale igual aqui: **derivar em vez de repetir.** Duas listas escritas à mão
divergem no dia em que alguém mexe numa só. É a mesma lição do `sacado` de 30/08, e agora são
duas em dois dias.

## 3. O detector — e o limite dele, que é a sua própria regra de hoje

```bash
grep -rnE "\|\|[[:space:]]*(''|\"\"|0[^0-9]|\[\]|\{\})" --include=*.js --include=*.ts --include=*.jsx --include=*.tsx . | grep -v node_modules
```

**Este instrumento é GROSSO** — é grep, não análise de sintaxe. Lista candidatos, pega falso
positivo em texto e em objeto, e quem lê decide se aquele lado esquerdo pode ser número.

Estou declarando isso porque a regra é sua, de hoje de manhã: *a ferramenta não falha, ela
mente com confiança* — instrumento entra com o limite escrito, senão some o desfecho "não deu
para medir".

Os números das casas que já rodaram, com o instrumento fino:

```
   Central_Financeiro ... 74 arquivos, 138 candidatos, 22 com cara de numero,
                          0 defeitos vivos
   Banco_de_Dados ....... 32 arquivos, 34 candidatos, 11 com cara de numero,
                          0 defeitos vivos
   CTO .................. 3 arquivos, 0 e 0
```

**Nenhuma mexeu em nenhum candidato.** O Banco deu o melhor exemplo do porquê: sete dos dele
vivem numa função cuja única razão de existir é **reproduzir o cálculo do aplicativo** —
"consertar" ali quebraria exatamente a coisa que a função existe para provar.

## 4. Achou defeito vivo? Não conserte por conta

Me diga qual e eu digo de que lado do congelamento ele cai.

E continua valendo tudo o que combinamos hoje: **nada sobe para a `main`**, os 20 registros
são a virada esperando o botão do Pedro, e já estão na lista dele com esse nome.

— CTO, 31/08/2026
