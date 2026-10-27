# D960 — O achado 2 da perícia da OC no MCP: aceito, medido e consertado no ramo

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` · **Data:** 27/10/2026, 07h39
**Responde:** `2026-10-26_de_CTO_para_Ordem_de_Compra_D960-a-pericia-da-OC-no-MCP-achado-2.md`, e a campainha
de 27/10 de manhã

**Espero de volta:** a sua carta para a produção, na ordem do §12.8.

**O banco não mudou.** No ensaio, esta casa só leu: os tipos das colunas e as contas de teste (§2). Na produção
também só leu: os números das 4 OCs que existem, sem nome nenhum (§5).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

**O achado é verdadeiro e está consertado no ramo `d954-a-oc-no-mcp`, hash novo `5758872`.** Nada foi publicado,
e nenhuma das 4 OCs que já existem muda de valor, nem na tela nem no PDF.

| | |
|---|---|
| o ramo | `d954-a-oc-no-mcp` |
| o hash novo | **`5758872`** (o periciado era o `e88d33d`) |
| os dois commits | `deade5f` (a conta) e `5758872` (o CSV e o cabeçalho) |
| a perícia do conserto | `git diff e88d33d 5758872` |

## §2 — A medida: o contraexemplo do laudo

Três linhas iguais: quantidade 1, R$ 100,01, desconto de 5,0045%, IPI 0.

| | total |
|---|---|
| o banco (ensaio, `numeric(16,4)` por linha) | 285,0150 → **R$ 285,02** |
| a tela até o `e88d33d` | 285,01499865 → **R$ 285,01** |
| a tela no `5758872` | 285,015 → **R$ 285,02** |

Não parei no contraexemplo. Medi **400 linhas** no ensaio, só lendo, com as fórmulas das quatro colunas da
`oc_itens`: bruto, desconto, líquido e IPI. Escolhi as linhas para cair nos casos difíceis: quantidade quebrada,
preço de 4 casas, desconto e IPI com 4 casas, e valores grandes.

Comparei com a conta antiga da tela:
- **180** das 400 linhas diferiam do banco na quarta casa;
- **137** diferiam no centavo.

A conta nova acerta as 400, coluna por coluna, na quarta casa.

## §3 — O conserto

A tela agora faz **a conta do banco ao pé da letra**, em número inteiro com escala, como o `numeric` do Postgres.
O número comum do navegador não serve para isso: nele, 285,015 vira 285,01499…

- **Arquivo novo `src/domain/numericDoBanco.ts`**, lógica pura e sem React:
  - o arredondamento com o empate longe de zero;
  - a divisão na escala que o Postgres escolhe (`select_div_scale`);
  - a leitura do número como o JSON o manda ao banco, inclusive com expoente.
- **`computeOcTotals` e `computeItemTotal`** calculam as quatro colunas como as colunas calculadas da `oc_itens`,
  cada uma arredondada às 4 casas antes da soma.
  - O total é **Σ líquido + Σ IPI + frete + outras − desconto material**, como a `oc_totais`. Não é a soma do
    total de cada linha.
  - Frete, outras despesas e desconto material entram como a `numeric(14,2)` os guarda: 10,005 vira 10,01.
    Medi no ensaio: o banco dá 295,0150.
- **O centavo de quem lê.**
  - A tela e o PDF usam o `formatBrl`, que já desempatava longe de zero.
  - Três lugares, porém, usavam outro arredondamento e erravam o empate: a conferência com o total do papel, a
    soma das linhas do papel (`Math.round(v × 100)`) e o CSV do Histórico (`toFixed(2)`). Os três passaram para o
    centavo do banco.

## §4 — Os testes, a isca e as sabotagens

**`contaDaTelaIgualAoBanco`** tem agora 7 testes:
- o contraexemplo do perito, que dá R$ 285,02;
- **a isca:** a conta antiga, escrita no teste, que dá R$ 285,01. O teste exige que ela erre;
- as 400 linhas do ensaio, uma a uma, nas quatro colunas;
- as 400 numa OC só. O total tem de ser a soma exata das colunas do banco, e a isca tem de errar;
- o papel de 23/10. A tela agora dá **455,9972**, igual ao banco; antes dava 455,9971;
- frete, outras despesas e desconto material nas duas casas da coluna;
- o caso com IPI.

**`numericDoBanco`** tem 6 testes: o empate nos dois sinais, a escala da divisão, o expoente, o centavo
(`Math.round(1,005 × 100)` dá 100, e o banco dá 101), o CSV contra o `toFixed` e a conferência do papel.

**As sabotagens, 10 de 10 vermelhas.** Cada uma foi desfeita em seguida.

| a sabotagem | testes vermelhos |
|---|---|
| a linha sem as 4 casas (a conta de antes) | 6 |
| o empate para perto do zero | 9 |
| o total pelo bruto menos o desconto | 2 |
| o IPI fora do total | 5 |
| a divisão sempre com 16 casas | 1 |
| o desconto sem a coluna de 4 casas | 2 |
| o frete sem a coluna de 2 casas | 1 |
| o centavo pelo `Math.round` | 1 |
| o CSV pelo `toFixed` | 1 |
| o expoente do JSON ignorado | 1 |

**A bateria:** 1348 testes verdes (eram 1346), o `typecheck` e o `eslint` limpos.

## §5 — As OCs que já existem, e o PDF

Li a produção sem gravar nada: uma consulta de leitura, só com os números. Ela trouxe as quantidades, os preços,
as porcentagens, as colunas da linha e o total da `oc_totais`. **A produção tem 4 OCs, com 25 linhas ao todo.**
Passei cada uma pela conta antiga e pela nova, e comparei as duas com o banco:

| OC | total na conta antiga | total na conta nova | total no banco | linhas que mudam |
|---|---|---|---|---|
| 2026/008 | R$ 290,00 | R$ 290,00 | R$ 290,00 (290,0003) | 0 de 5 |
| 2026/009 | R$ 1.745,00 | R$ 1.745,00 | R$ 1.745,00 | 0 de 1 |
| 2026/010 | R$ 263,29 | R$ 263,29 | R$ 263,29 (263,2901) | 0 de 8 |
| 2026/011 | R$ 455,96 | R$ 455,96 | R$ 455,96 (455,9632) | 0 de 11 |

**Nenhuma OC muda.** Em todas, o total da conta nova é o do banco até a quarta casa. Subtotal, desconto e IPI
também ficam como estavam.

**O PDF também não muda para nenhuma delas.** Ele é feito no navegador, com a mesma conta da tela:
- os totais do rodapé saem da `computeOcTotals`;
- o valor de cada linha sai da `computeItemTotal`;
- o nome do arquivo leva o total.

Como nenhum desses números muda nas 4 OCs, o PDF de cada uma sai igual ao de hoje. Daqui para a frente, o PDF de
uma OC como a do contraexemplo sairá com o centavo do banco.

## §6 — O que não é meu, mas vi

A carta do Banco (D960, §2) diz que a tela da OC aceita total negativo. A conta nova guarda o sinal, mas **não pus
trava nenhuma na Nova OC.** Isso é decisão sua: o Banco a deixou esperando a sua palavra, e eu também espero.

## §7 — O que falta

- Nada na produção. Nada publicado.
- A produção vem pela sua carta, na ordem do §12.8: o banco sobe antes da tela.
- Nenhum comando pediu licença.
