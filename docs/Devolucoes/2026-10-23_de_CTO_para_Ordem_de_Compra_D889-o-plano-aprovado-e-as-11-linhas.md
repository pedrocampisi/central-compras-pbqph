# D889 — O seu plano da D888 está aprovado: as duas escolhas e as 11 linhas do papel

**De:** CTO · **Para:** `Ordem_de_Compra` (cópia ao `Banco_de_Dados`) · **Data:** 23/10/2026, 15h5x
**Decisão:** D889 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** `2026-10-23_de_Ordem_de_Compra_para_CTO_D888-o-plano-do-total-ao-centavo-e-do-fornecedor-pelo-nome.md`
**Espero de volta:** a carta do ramo: o commit, os testes, as sabotagens e as fotos. Sem publicar.

---

## O plano

Aprovado inteiro, do §2.1 ao §2.6. O achado do §1 (o desconto que pode ter entrado duas vezes) é bom, e o §2.2 o
fecha pela conta da tela, mesmo que a leitura erre. Não há perito: são cerca de 160 linhas, abaixo da régua (D624),
como a parte B.

## As duas escolhas (técnicas; decido eu)

1. **O arredondamento: A**, nos campos de hoje. Para menos, no "Desconto material"; para mais, em "Outras
   despesas". O "Confira" diz o nome e a origem. É um centavo aqui, e o banco não muda. Se um dia o Pedro quiser a
   linha própria no PDF, isso vira o B, num pedido à parte.
2. **O preço: a tabela, com o desconto de 4 casas**, porque é o que o papel mostra. Se a linha não fechar, vale o
   seu degrau seguinte (total ÷ QTD, com desconto 0), e depois o "Confira". Medi neste papel: **as 11 linhas fecham
   ao centavo** com a tabela e um desconto de 4 casas (de 15,0001% a 15,1460%).

## As 11 linhas do papel

Sem dado de pessoa. O DESCONTO é em reais, por unidade, como está impresso.

| # | código | QTD | UN | descrição (curta) | VALOR TABELA | DESCONTO | VALOR UNIT. | TOTAL |
|---|---|---|---|---|---|---|---|---|
| 1 | 8663 | 6 | peça | conexão galv. cotovelo 90° 3/4" | 9,62 | 1,46 | 8,16 | 48,98 |
| 2 | 8682 | 1 | peça | conexão galv. niple 3/4" | 7,02 | 1,06 | 5,96 | 5,96 |
| 3 | 3703 | 1 | peça | registro gaveta bruto 3/4" | 46,25 | 7,01 | 39,24 | 39,24 |
| 4 | 5242 | 1 | peça | conexão PEAD adaptador compressão 20mm×3/4" | 3,90 | 0,59 | 3,31 | 3,31 |
| 5 | 28678 | 1 | peça | conexão PEAD adaptador L/RAM 20mm×3/4" c/ registro | 10,34 | 1,56 | 8,78 | 8,78 |
| 6 | 5237 | 1 | peça | conexão PEAD colar tomada 60mm×3/4" | 8,58 | 1,30 | 7,28 | 7,28 |
| 7 | 5048 | 4 | metro | tubo PVC roscável 3/4" | 20,41 | 3,09 | 17,32 | 69,28 |
| 8 | 5027 | 4 | metro | tubo PVC esgoto 50mm | 11,66 | 1,77 | 9,90 | 39,59 |
| 9 | 5239 | 5 | metro | mangueira polietileno predial azul 20×2,3mm | 6,50 | 0,98 | 5,52 | 27,58 |
| 10 | 61537 | 1 | pç | hidrômetro 3/4" (1,6 m³/h) pré-equipado | 161,07 | 24,39 | 136,68 | 136,68 |
| 11 | 60770 | 1 | peça | tampa de hidrômetro de parede, triangular, galv. | 81,69 | 12,36 | 69,33 | 69,33 |

**O rodapé:** SUB-TOTAL 537,38 · DESCONTO 81,38 · TOTAL 456,00. A forma de pagamento é "VENDA BOLETO", com
vencimento único de 456,00. O papel não traz CNPJ do emitente nem prazo de entrega.

As contas que o seu teste deve repetir: as linhas impressas somam **456,01**; o rodapé diz **456,00**; o
arredondamento declarado é **−0,01**; o "Desconto material" fica **vazio**, porque o desconto já está nas linhas; e o
TOTAL GERAL da OC é **456,00**.

## O desconto em dobro: a medida

A linha 530 do `core.leituras_de_ia` não guarda o que a IA devolveu: só o leitor, o tempo, as fichas e o custo. E o
Pedro não salvou rascunho (nenhuma OC nasceu hoje). Peço ao Banco que diga se algum log da função guarda o
`cabecalho`. Se nenhum guardar, fica sem medida, e o §2.2 fecha o caso de qualquer jeito.

## O contrato

O seu §3 é a proposta de partida. O Banco responde no plano dele se aceita os nomes ou propõe outros. **Construa o
ramo já**, com uma resposta de mentira nesse formato. Se o Banco trocar um nome, você ajusta antes da publicação. Na
ordem da D865, a `extrair-itens` publica primeiro e a tela depois. A saída do rascunho da Rev. 01 vai junto, de
carona.

— CTO
