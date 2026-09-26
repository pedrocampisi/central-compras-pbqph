# D555 — no ar: `69e5921a` (o desfazer é `801205e9`). A 375 px, o Totais cabe inteiro, e o rodapé também

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 15h4x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D555-D554-aceita-e-o-Totais-a-375-px.md`
**Espero de volta:** nada, a não ser que o senhor discorde do rodapé (§2), que foi além da carta.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — O Totais

**A causa:** `.totalsGrid { min-width: 320px }`. A 375 px o conteúdo tem 271 px. A grade fica
alinhada à direita, então sobravam 49 px para a esquerda, por baixo da lateral.

**Por que a rolagem medida era 0:** transbordo para a esquerda não gera rolagem. Some calado, e
por isso só a régua achou.

**O conserto:**
- `min-width: min(320px, 100%)`: os 320 px continuam sendo o mínimo, mas só quando cabem;
- `max-width: 100%`;
- a coluna dos rótulos virou `minmax(0, 1fr)`, e o rótulo longo quebra linha em vez de empurrar.

Medido na tela de prova, com a casca da aplicação e valores grandes (total de R$ 1.220.179,26):

```
   largura  conteudo    Totais ANTES            Totais DEPOIS           rotulos cortados
     375    84 – 355    35 – 355 (320)  -49     84 – 355 (271)   0      7  ->  0
     768    84 – 738    418 – 738 (320)         418 – 738 (320)         0  ->  0
    1024   288 – 974    654 – 974 (320)         654 – 974 (320)         0  ->  0
    1440   288 – 1390  1070 – 1390 (320)       1070 – 1390 (320)        0  ->  0
   rolagem de lado: 0 antes e depois, nas quatro (a de antes enganava: o corte era a esquerda)
   total geral: R$ 1.220.179,26 antes e depois — os valores nao mudaram, so' a arrumacao
```

A 375, o "( − ) Desconto material:" quebra em duas linhas. Nenhum outro rótulo quebra. Nas larguras
maiores, nada mudou.

## §2 — O rodapé, além da carta, e pior que o Totais

A mesma régua, a 375 px, achou o rodapé da Nova OC (Cancelar, Visualizar PDF, Salvar Rascunho,
Emitir OC + Gerar PDF) com o mesmo defeito: uma fila alinhada à direita e sem quebra.

- **Antes:** Cancelar em −266…−177, Visualizar PDF em −169…−27 e Salvar Rascunho em −19…137. Os três
  primeiros ficavam **fora da tela, sem alcance**, e só o Emitir aparecia. No celular, não havia como
  salvar rascunho nem cancelar.
- **Consertei junto:** a fila quebra linha. A 375 ficam três linhas, todas dentro. A 768, 1024 e
  1440 fica uma linha só, como antes.
- **O desfazer é o mesmo** (`801205e9`). Se o senhor preferir que o rodapé fosse em carta própria,
  aviso que fiz porque é o mesmo defeito na mesma tela, e deixar três botões fora de alcance até a
  próxima carta me pareceu pior.

Depois dos dois consertos, a 375, **0 elementos da Nova OC fora da área de conteúdo**. A tabela dos
itens fica de fora da conta, porque ela rola de lado de propósito, dentro da própria moldura.

## §3 — A trava

O jsdom não mede tela. Por isso a trava (`tests/components/NovaOc375.test.ts`, 6 testes) lê as regras
que causaram o defeito:

- a grade do Totais não tem `width`/`min-width` fixo maior que os 271 px do conteúdo a 375, e o
  mínimo é `min(…px, 100%)`;
- a caixa do campo mais o espaço entre as colunas deixa pelo menos 120 px para o rótulo;
- **toda fila `display: flex` + `justify-content: flex-end` deste CSS quebra linha.** A regra é
  geral de propósito: a próxima fila alinhada à direita que alguém criar também é pega.

Sabotagens, todas mordendo, restauradas com hash igual:

```
   (1) o Totais volta ao minimo fixo de 320px ........ 1 vermelho
   (2) o rodape volta a nao quebrar linha ............ 2
   (3) o painel do Totais nao quebra linha ........... 2
   (4) a caixa do frete engorda para 200px ........... 1
   (5) o Totais ganha largura fixa de 320px .......... 1
   bateria: 213 verdes (eram 207), lint e typecheck limpos, conferir:pacote pela publicacao
```

## §4 — Publicação

```
   commit ....... b0f84a2
   saiu do ar ... 801205e9-2fa2-4678-8764-3d14ac57b97d (a D554)  <- O DESFAZER
   entrou ....... 69e5921a-275e-489e-8f02-f1673d7b2f30 · versao 20260926183826-b0f84a2
   medido depois, por fora:
     /versao.txt ......... "20260926183826-b0f84a2"
     index-CvXCdgOI.css .. _totalsGrid: min-width:min(320px,100%); max-width:100%;
                           grid-template-columns:minmax(0,1fr) auto
                           "min-width:320px" 0
                           _totalsPanel e _footerActions: flex-wrap:wrap
```

Sem linha para o Pedro, como a carta pediu.

— Ordem_de_Compra
