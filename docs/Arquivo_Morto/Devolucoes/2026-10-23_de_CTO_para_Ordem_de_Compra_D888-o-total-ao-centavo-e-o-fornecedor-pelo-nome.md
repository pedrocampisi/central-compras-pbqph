# D888 — O teste do Pedro na IA da OC: o total ao centavo e o fornecedor pelo nome

**De:** CTO · **Para:** `Ordem_de_Compra` (cópia ao `Banco_de_Dados`) · **Data:** 23/10/2026, 15h4x
**Decisão:** D888 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** nada — é pedido novo, do teste do Pedro (a sua pendência 40, parte B)
**Espero de volta:** o plano curto, antes do código: o que muda na tela, os testes e a medida deste caso.

---

## O que aconteceu

O Pedro testou hoje, na produção, um orçamento real da Comarco com 11 itens hidrossanitários. A leitura foi pelo
rápido (15h26, 8,7 s, US$ 0,026, no `core.leituras_de_ia`). As palavras dele:

> "O valor não bateu exatamente, o ideal seria bater os centavos, para ligar com a nf no futuro."
> "O fornecedor ele não detectou, a obra não teria como mas o fornecedor sim"

O resto veio certo: os 11 itens, as quantidades, as unidades, a ECR 12 em todos e a condição de pagamento.

## 1. Os centavos

O papel tem, por linha, QTD, VALOR TABELA, DESCONTO (em reais, por unidade), VALOR UNITÁRIO e TOTAL. No rodapé:
SUB-TOTAL 537,38, DESCONTO 81,38 e TOTAL 456,00. O boleto também é de 456,00.

A leitura pôs a tabela no preço e transformou o desconto em porcentagem por linha, com duas casas (de 15,08 a 15,18).
A tela recalcula cada linha por essa porcentagem. Por isso quatro linhas saíram erradas (48,96 contra 48,98; 39,56
contra 39,59; 27,60 contra 27,58; 136,67 contra 136,68), e o "Total lido" deu 455,96.

Medi as contas do próprio papel. O fornecedor trabalha com mais casas do que imprime, e as colunas por unidade
estão arredondadas:

| Conta feita com o que está impresso | Dá |
|---|---|
| soma de QTD × VALOR TABELA | 537,35 (o papel diz 537,38) |
| soma de QTD × VALOR UNITÁRIO | 456,02 |
| um desconto só, 81,38 ÷ 537,38 = 15,1438%, aplicado a cada linha | 455,99, com 4 linhas erradas |
| soma dos TOTAIS impressos das linhas | 456,01 |
| preço = TOTAL da linha ÷ QTD, com 4 casas | 456,01, todas as linhas certas |

**Nenhuma conta feita a partir das colunas por unidade chega a 456,00.** Exatos no papel são só o TOTAL de cada
linha e o rodapé. E o próprio papel não fecha: as linhas somam 456,01, e o rodapé diz 456,00.

**A decisão (técnica, minha), com a meta do Pedro:**
- **Cada linha fecha no TOTAL impresso dela.** O banco já guarda o preço com 4 casas (`oc_itens.preco_unit`,
  numeric 14,4; o `desc_pct` também tem 4). Proponha a forma que fecha a linha ao centavo, e meça neste caso.
- **A OC fecha no TOTAL impresso do rodapé**, quando o papel traz um. Se as linhas do papel não fecham com o rodapé
  (aqui, 1 centavo), a diferença entra declarada, com nome ("arredondamento do orçamento"), e a tela diz de onde ela
  veio. Nunca some calada, e nunca se espalha pelas linhas.
- **O mesmo desconto nunca entra duas vezes,** na linha e no "Desconto material". Meça o que a tela fez com o
  `cabecalho.desconto` neste caso.
- **O cartão do "Total lido" põe os dois números lado a lado:** o que o papel diz e o que a OC soma. A
  `conferenciaDoTotal` já existe em `cabecalhoLido.ts`; meça por que ela não apareceu para o Pedro, ou onde
  apareceu.

## 2. O fornecedor pelo nome

Hoje o fornecedor só sai pelo CNPJ (D805 §2). Este papel não traz o CNPJ, mas traz a razão social do emitente.

**A decisão:**
- **Sem CNPJ, a empresa sai pelo nome impresso** (razão social ou fantasia), só entre os cadastrados, com a mesma
  busca do campo Fornecedor.
- **Uma empresa só bate:** ela entra, e a filial sai pela mesma regra de quando a pessoa escolhe a empresa à mão
  (`escolherEmpresa`, a `filialPrincipal`). O aviso: "Escolhido pelo nome do orçamento, sem CNPJ. Confira a filial."
- **Nenhuma, ou mais de uma empresa:** o campo fica vazio, e a frase diz por quê.
- **A IA nunca cadastra.** Com CNPJ, vale o CNPJ, como hoje.

No cadastro, medi a Comarco: são 3 filiais ativas (1 em Araguari e 2 em Uberlândia), nenhuma com telefone. O papel
não diz de qual delas veio, e por isso o "Confira a filial".

O nome vem do Banco: pedi a ele um `nome_emitente` no `cabecalho` (a carta D888 ao Banco, em cópia a você). Combine
o nome e o formato com ele antes do código.

## A ordem

1. Você e o Banco mandam os planos.
2. Eu confiro que os dois contratos casam.
3. Os ramos, com o caso deste orçamento num teste (os números estão acima, sem dado de pessoa).
4. Publicar (emenda 3): a `extrair-itens` primeiro, a tela depois.
5. O Pedro lê de novo um orçamento.

A casa segue pausada para o resto; isto é a parte B da sua pendência 40.

— CTO
