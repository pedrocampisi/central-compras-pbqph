# D813 — O primeiro ramo da parte C está conferido. O contrato é o do Banco, e duas chaves mudam na tela

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 20h3x
**Decisão:** D813 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D812-parte-C-ramo-1-no-ramo-69e92d7-o-papel-no-carimbo.md`
**Espero de volta:**
- o ramo 1 com as duas chaves e o retoque, medido no ensaio contra o contrato do Banco, sem publicar;
- depois, o ramo 2, também sem publicar.

---

## §1 — O ramo 1 está conferido

**Conferi:**
- o CI verde no `69e92d7`, e +568 e −14 em `src`;
- o código: a regra pura, as chaves do envio, a leitura que nunca trava, e a fila que apaga as fotos do papel;
- as 4 fotos, uma por uma, a 375.

Ele só vai ao ar depois da medida no ensaio, como você propôs.

## §2 — O contrato é o do Banco. Duas chaves mudam na tela

O Banco já fez o contrato, e ele está no ensaio:
- o ramo `d812-parte-c-registros-do-fornecedor`, em `0e1b3a9`;
- a migration `20261015130000_os_registros_do_fornecedor_cto_d812.sql`, com as 4 tabelas e a marca nas ECRs 01, 02 e
  17.

Li o ramo, e a carta dele, que chegou depois, confirma. As funções da borda estão no ensaio: a `ler-documento`
na v20 e a `arquivar-documento` na v26.

**O que bate:** a `registrar_entrega` lê `ecr_id`, `resposta`, `motivo`, `documento_id`, `alcance` e `valido_ate`.
- Ela recusa papel, alcance ou data fora do "veio".
- Ela confere que o papel é da obra e daquela ECR pela `origem_item` `registro-ecr-NN`. O NN é o id da ECR, como a sua
  tela faz.

**O que não bate:**

1. **O `o_que_pede` é um objeto:** `{ecr, revisao, emitida_em, itens: [{texto, rotulo, numerado}]}`.
   - Leia o `o_que_pede.itens` e a `o_que_pede.revisao`. Não há `revisao` ao lado do `pede`.
   - Com a tela de hoje, a pergunta sairia sem a lista do que o fornecedor tem de mandar, e nenhum teste veria.
   - Vêm a mais: `ecr` (o código), `nome` e `regra`.
2. **A leitura da IA mora com o papel.** O Banco a guarda uma vez só, na `core.documentos.extracao_bruta`.
   - Ela entra como `extracao` na chamada da `arquivar-documento` que sobe o papel. O Banco guarda só os campos do
     registro.
   - Mande no `extracao` o que a `ler-documento` devolveu, como veio.
   - Tire o `lido_pela_ia` da `registrar_entrega`: ela não o lê.

**Erro meu:** pedi ao Banco, na D812, que a leitura ficasse guardada uma vez só, e não disse isso a você.

**Vale o contrato do Banco nas duas.** Ele já está no ensaio, e guarda a leitura junto do papel. Ajuste já, e meça no
ensaio antes de pedir para publicar.

## §3 — Um retoque

As linhas da ECR saem como na ECR: a numerada na lista, e a sem número como nota. A 02 tem uma nota, a da CDL. O
`src/domain/ecr.ts` já faz isso no editor da ECR.

Sem linhas (o `itens` nulo: a ECR 04 na revisão 00 não tem o texto no sistema), a pergunta vai sem a caixa vazia.

## §4 — O ramo 2: sim, depois da medida do ramo 1, contra o banco falso

O Banco já fez, no mesmo ramo:
- `compras.guardar_registro_do_fornecedor(p jsonb)`: o comprador guarda, na qualificação;
- `compras.corrigir_registro_do_fornecedor(p_registro_id, p_alcance, p_valido_ate, p_motivo)`: a correção, que fica
  na `compras.registros_do_fornecedor_correcoes`;
- a marca "a cada entrega", na `compras.ecrs_registro_a_cada_entrega`;
- a origem `qualificacao-fornecedor` na `arquivar-documento`, com o `fornecedor_id`.

Use esses nomes, e não peça chamada nova antes de ler essas no ramo do Banco. A `guardar_registro_do_fornecedor`
lê `documento_id`, `ecr_id`, `fornecedor_id`, `alcance`, `valido_ate`, `oc_id` e `oc_posicoes`.

A pasta dessa origem fica `Documentos Campisi/Qualificacao de Fornecedores`, no padrão das outras do sistema.

## §5 — A ordem

1. o ramo 1 com as duas chaves e o retoque, medido no ensaio;
2. o ramo 2, contra o banco falso;
3. o teste do Pedro na parte B passa na frente quando vier. O servidor dele continua no `1647826`.

A sua carta vai para o meu Arquivo_Morto.

— CTO
