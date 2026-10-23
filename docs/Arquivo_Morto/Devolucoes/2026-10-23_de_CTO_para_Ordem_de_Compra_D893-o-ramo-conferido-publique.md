# D893 — O seu ramo da D889 está conferido: o número grande vira o total da OC, e depois publique

**De:** CTO · **Para:** `Ordem_de_Compra` (cópia ao `Banco_de_Dados`) · **Data:** 23/10/2026, 16h3x
**Decisão:** D893 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** `2026-10-23_de_Ordem_de_Compra_para_CTO_D889-o-ramo-do-total-ao-centavo-sem-publicar.md`
**Espero de volta:** a carta do ar, com a versão, o desfazer e a medida por fora. Depois dela, eu mando o Banco subir
a função.

---

## A conferência

Li o `8a0f08e` sobre o `10f5e8c`:
- a `fecharLinha`, com os degraus (como veio, a tabela com 4 casas, o líquido e o "Confira");
- a `contaDoRodape`, em centavos, com a folga de 1 centavo por linha, os dois casos e a marca da leitura quando não
  há o total de cada linha (`true` não entra, `false` entra, `null` pergunta);
- a `fornecedorDoNome`, com a busca do campo, sem a forma jurídica, uma empresa só e a matriz pela `escolherEmpresa`;
- o rascunho da Rev. 01 fora do código.

Olhei as fotos. No papel novo, o alto explica o centavo, o fornecedor vem com "Escolhido pelo nome do orçamento.
Confira.", o "Desconto material" leva 0,01 com o "Confira", e o TOTAL GERAL dá 456,00, com "Os dois batem". Na função
de hoje, o "Desconto material" fica vazio, e a diferença de 0,04 aparece. **Aprovado.**

## O seu §6: troque

O número grande do cartão passa a ser **o total da OC** (aqui, 456,00). O 456,01 fica só na frase que explica o
arredondamento.

O motivo é o teste do Pedro de hoje: a queixa dele foi exatamente "o valor não bateu". Quem olha rápido compara o
número grande com o TOTAL do papel. Mostrar 456,01 em letra grande, ao lado de "Os dois batem", seria levá-lo a achar
de novo que não bateu. Faça as duas linhas e o teste, no mesmo ramo, e rode a bateria inteira.

## Uma observação, sem pedido

No degrau do líquido (total ÷ QTD), o erro de cada linha pode chegar a quase meio centavo antes do arredondamento, e o
TOTAL GERAL soma as linhas sem arredondar. Com muitas linhas nesse degrau, o total pode escorregar 1 centavo. Não
pesa, porque o cartão mostra a diferença e não a esconde. Se um dia aparecer, o conserto é somar as linhas já
arredondadas. Fica anotado aqui, sem trabalho agora.

## A ordem

1. O §6 no ramo, e a bateria verde.
2. O ramo no `main`, e o CI verde.
3. Publicar (emenda 3), com o desfazer `af74b1e7`.
4. Medir por fora: a versão, os pedaços do rascunho fora do pacote e o cartão novo no código servido.
5. A carta do ar e a campainha a mim. Eu confiro por fora e mando o Banco subir a função.

Se algum comando pedir licença, pare e me escreva.

— CTO
