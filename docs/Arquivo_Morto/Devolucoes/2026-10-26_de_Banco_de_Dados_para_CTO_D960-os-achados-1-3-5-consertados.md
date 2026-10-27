# D960 — Os achados 1, 3 e 5 da perícia da OC no MCP: aceitos, medidos e consertados

**De:** Banco_de_Dados
**Para:** CTO (cópia à Ordem_de_Compra e à Central)
**Data:** 26/10/2026, 21h5x (hora de São Paulo)
**Responde:** `..._D960-a-pericia-da-OC-no-MCP-achados-1-3-5.md`, e o pedido da Central no §5 da carta dela do achado 4
**Espera:** a sua carta para a produção, na ordem do §12.8.

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

**Os três achados são verdadeiros. Os três estão consertados no ramo e provados no ensaio. Nada foi feito na
produção.**

| | |
|---|---|
| o ramo | `d954-a-oc-no-mcp` |
| o hash novo | **`99e6444`** (o periciado era o `a2fd687`) |
| a base | `304a887` (o `main`; fora de `docs/`, o código é o que a produção tem) |
| a perícia do conserto | `git diff a2fd687 99e6444` |

A `mcp` não mudou: continua a versão 7 do ensaio, igual ao ramo.

## §2 — Achado 1 (médio): o total perdia o sinal — **aceito**

**A medida no ensaio:** `core.ia_reais(-100)` devolvia `R$ 100,00`. O laudo estava certo.

**O conserto** é o que o senhor leu, nas duas partes:
- **o formatador guarda o sinal.** `-R$ 100,00` quando é negativo, e `R$ 0,00` para o que arredonda a zero;
- **a diferença entre dois valores continua sem sinal.** A `core.ia_bate` já manda a diferença positiva e diz o
  lado por extenso ("a conta da OC dá menos que o papel");
- **a proposta recusa o total geral negativo,** depois das contas do banco, com esta frase: "O rascunho não foi
  proposto: o total da OC ficaria negativo (-R$ 100,00), porque o desconto material é maior que a compra. Confira o
  desconto com a pessoa."

**A tela da OC aceita total negativo hoje.** Li o código: não há trava na conta da tela (`compute.ts`), na Nova OC
nem no banco. As colunas do cabeçalho só proíbem frete, despesas e desconto negativos, e não o total. Pelo que li,
nada impede a tela de gravar uma OC de −R$ 100,00. Não testei a emissão dela.
- Para a IA, agora o banco recusa.
- Para a tela, a regra **pode ser da OC também**. Se o senhor quiser, o lugar certo é uma trava no banco que valha
  para os dois caminhos, como a da quantidade zero na emissão (D683). Não fiz: é regra nova para a pessoa, e pede a
  sua palavra.

## §3 — Achado 3 (baixo): a quantidade que vira zero — **aceito**

**A medida no ensaio:** `0.00001::numeric(14,4)` dá `0.0000`. A validação "maior que zero" olhava o número antes
dessa conversão.

**O mesmo vale para o cabeçalho.** Frete, outras despesas e desconto material são `numeric(14,2)`: um frete de 10,005
seria gravado como 10,01, diferente do que a proposta mostrava. Consertei os dois.

**O conserto: recusar, e não arredondar.**
- A peça nova `core.ia_casas(número, casas)` diz se o número cabe na coluna sem mudar.
- Na proposta, quantidade, preço, IPI e desconto têm até **4 casas**, e o cabeçalho tem até **2**.
- O que não couber recusa a proposta, na mesma lista de erros de antes, linha por linha.

Escolhi recusar porque arredondar calado é o defeito de origem: a pessoa conferiria um número que não é o gravado.
Com a recusa, a IA arredonda à vista, e o que a proposta mostra é exatamente o que a coluna guarda. A fronteira está
provada: 4 casas no item e 2 no cabeçalho passam, e o número mostrado é igual ao guardado.

## §4 — Achado 5 (baixo): o comparador que se alimentava da resposta — **aceito**

**A medida:** rodei a versão antiga do teste (a do `a2fd687`) com a regra omitindo um cadastro, só na consulta do
teste, sem mudar função nenhuma. Ela comparou **222 de 223** e disse "as duas regras dão a mesma resposta", com
saída 0. O laudo estava certo.

**O conserto** está em `testes-rls/teste_regra_unica_da_oc.py`:
- os cadastros são **contados à parte**, sem a regra;
- a entrada da tela entra com **LEFT JOIN** na regra: o cadastro que a regra omitir chega mesmo assim, "sem resposta
  do banco";
- a **cobertura é exigida**: todo cadastro contado tem de chegar uma vez, e cada um com a resposta do banco. O mesmo
  vale para os 12 de mentira;
- **a isca nova, `--isca-omite`,** faz a regra deixar de devolver um cadastro, e o teste reprova. A `--isca` de antes
  (inverter uma resposta) continua pega.

No ensaio: 223/223 e 12/12 com cobertura completa. As duas iscas foram pegas.

## §5 — Achado 2: o contrato — **confirmado**

O valor de verdade é o do banco, e é este:
1. **por linha,** as colunas calculadas da `compras.oc_itens` são `numeric(16,4)`: `valor_bruto`, `valor_desconto`,
   `valor_liquido`, `valor_ipi` e `valor_total`. Cada uma é calculada da quantidade, do preço e das porcentagens, e
   arredondada **nas 4 casas, na própria linha**, com o empate se afastando do zero, que é a regra do `numeric` do
   PostgreSQL;
2. **o total geral** (`compras.oc_totais`) = Σ `valor_liquido` + Σ `valor_ipi` + frete + outras despesas − desconto
   material. São somas de valores **já arredondados em 4 casas**, e o resultado fica com 4 casas;
3. **o que a pessoa lê** é esse total arredondado a 2 casas.

**Dois cuidados para a OC acertar a tela:**
- o total geral soma o **líquido e o IPI** de cada linha, cada um arredondado à parte. Ele **não** soma o
  `valor_total` da linha, que é calculado direto e pode diferir na 4ª casa;
- o "total da linha" que a proposta mostra é o `valor_total` arredondado a 2 casas.

**Medido no ensaio, com o exemplo do laudo** (3 × R$ 100,01 com desconto de 5,0045%): o banco dá **285,02**. É a
conta da coluna. A tela de hoje dá 285,01, e quem acerta é a OC.

## §6 — Achado 4: a pergunta da Central — **confirmada, sem pergunta nova**

A Central consertou o achado 4 lendo a `compras.pode_emitir_oc()`, sem função nova, e me pediu uma confirmação.
Conferi o catálogo, só leitura, nos dois bancos:
- **`authenticated` executa a `compras.pode_emitir_oc()`, no ensaio e na produção.** A função é a mesma nos dois (o
  md5 é igual);
- **um cuidado:** com a marca `sem_ordem_de_compra`, ela **não devolve falso**. Ela **recusa**, com o erro 42501
  ("Seu acesso não inclui a Ordem de Compra."), que chega à página como HTTP 403. A página da Central trata a falha
  como "não", então isso já cai do lado certo. Vale um caso no teste dela com a recusa, e não com o falso;
- `anon` também executa a função, e isso já era assim antes. Sem login, não há papel, e a resposta é falso.

A observação da Central sobre as linhas da Central (a `core.pode_editar_cadastro`) é sua decisão: se entra neste
ramo ou em outro. Do lado do banco, a pergunta já existe.

## §7 — A prova no ensaio

**Primeiro, o vermelho sem o conserto.** A bateria nova rodou contra a D954 de antes, que estava no ensaio:
- os cenários 42 a 45 deram **FALHOU**;
- o 46 (a fronteira) passou, como devia.

**A troca no ensaio:**
1. Desfiz a D954 de antes com o desfazer do `a2fd687`.
2. Apliquei a migration consertada.
3. Rodei o desfazer novo, que tira também a `ia_casas`: a bateria da OC pulou, a Central deu 61 e o prestador 48.
4. Reapliquei.

Depois da troca, todas as baterias deram 0 falhou:
- `teste_oc_no_mcp` **48 de 48**;
- `teste_mcp_da_central` 61;
- `teste_cadastro_de_prestador` 48;
- `teste_so_busca_na_pagina_permitir` 13;
- `teste_ordem_de_compra_barrada_por_pessoa` 40;
- `teste_financeiro_sem_a_oc` 20;
- `teste_qualificacao_na_data_da_oc` 23;
- `teste_destinatario_da_oc` 15;
- `teste_cancelada_volta_a_emitida` 12;
- `teste_qualificacao_e_entrega` 39;
- `teste_auditoria` 22;
- `teste_oc_nao_emite_com_quantidade_0` 18, mais os 3 pulados de sempre.

**As iscas: 9 de 9 pegas.** As seis de antes continuam pegas, e as três novas são:

| a isca | pega nos cenários |
|---|---|
| o formatador sem sinal | 42, 43 |
| o total negativo passa | 43 |
| as casas não contam | 44, 45 |

**O conserto ficou na mesma migration.** Ela ainda não está na produção, e foi assim que a casa fez na D872. A
perícia vê o conserto no `git diff a2fd687 99e6444`.

## §8 — O que não fiz

- Nada na produção.
- A trava do total negativo na tela: espera a sua palavra (§2).
- Nenhum comando pediu licença.

— Banco_de_Dados
