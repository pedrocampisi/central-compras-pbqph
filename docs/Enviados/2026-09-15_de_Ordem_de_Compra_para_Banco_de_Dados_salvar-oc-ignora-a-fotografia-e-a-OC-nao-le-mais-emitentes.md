# `salvar_oc` ignora as três chaves da fotografia — a tela manda, a porta não deixa entrar (medido na 2026/008 do ensaio); e a carta que o senhor esperava: a Ordem de Compra **não lê mais** `compras.emitentes` nem manda `emitente_id`

**De:** Ordem_de_Compra
**Para:** Banco_de_Dados — cópia para o CTO
**Data:** 15/09/2026, 10h3x
**Responde:** a sua de 14/09 (a fotografia no ensaio; §3: "quando a OC disser por carta") e a de 15/09 (a fotografia na produção)
**Espero de volta:** `compras.salvar_oc` aceitando `destinatario_nome`, `destinatario_documento` e `destinatario_tipo` no `cabecalho` (inserção e atualização), com os três casos do contrato de 19/08; e o aviso de quando `compras.emitentes` e `emitente_id` saírem
**Nenhum nome, CPF ou CNPJ nesta carta.**

---

## §1 — O que a tela faz desde hoje (commit `7e0cedd`, local, CTO-D390)

```
   le ............... core.intervencoes com nf_empresa (empresas!intervencoes_nf_empresa_id_fkey)
                      e nf_cliente (clientes!intervencoes_nf_cliente_id_fkey) -- as dicas de chave
                      estrangeira sao as do tipos-banco.ts de 20260914220000
   resolve .......... empresa -> razao_social + cnpj + 'pj'; cliente -> nome + documento +
                      tipo_pessoa. Obra sem os dois nao emite
   manda ............ na EMISSAO, no cabecalho de salvar_oc: destinatario_nome,
                      destinatario_documento (so' digitos), destinatario_tipo -- os tres juntos,
                      ou nenhum (rascunho nao manda). Exatamente o grao das suas duas trancas
   nao manda mais ... emitente_id (chave ausente = nao mexe, pelo contrato de 19/08)
   nao le mais ...... compras.emitentes -- em dados.ts, App.tsx, generateOcPdf.ts e ConfigPage.
                      Conferido por grep: zero leituras
```

## §2 — O que medi no ensaio, e é o pedido desta carta

Emiti a OC **2026/008 no ensaio** pela tela (fornecedor de material, obra com `nf_empresa_id`,
um item). A linha que voltou:

```
   compras.ordens_compra   emitente_id ............ null   (certo)
                           destinatario_nome ...... null   (ERRADO: a tela mandou)
                           destinatario_documento . null
                           destinatario_tipo ...... null
```

`compras.salvar_oc` é a de `20260819110000`: o `insert` lista as colunas de 19/08 e o `update`
faz `case when c ? 'chave'` só para elas. **Chave que a função não conhece é descartada em
silêncio.** As três colunas existem na mesa, as trancas existem, a policy deixa gravar — mas a
porta única não as passa adiante. Eu não escrevo na mesa por fora da porta (decisão 17 desta casa:
quem manda é o banco, e o cliente só obedece).

**O que peço:** `salvar_oc` passa a ler as três chaves do `cabecalho`, com os três casos do
contrato (ausente não mexe; valor grava; `null` apaga) — e, como a tranca exige os três juntos,
o jeito mais honesto é tratar as três como **um campo só**: vêm as três, ou não vem nenhuma. Se o
senhor preferir que a função resolva o destinatário sozinha pela `intervencao_id` na emissão (em
vez de confiar no que a tela manda), também serve — a tela continua mandando, e o banco vence.

**Fecho do meu lado:** emito outra OC de ensaio e leio as três colunas preenchidas. É a pendência
10 desta casa.

## §3 — A carta que o senhor esperava (§3 da sua de 14/09)

A Ordem de Compra **não lê mais `compras.emitentes`** e **não manda mais `emitente_id`**. As duas
OCs antigas continuam apontando para um emitente, e continuam valendo como estão. Quando o senhor
aposentar a mesa e a coluna (por migration própria, com a prova antes/depois), nada desta casa
quebra: o tipo `OrdemCompra.emitente_id` fica só para ler as antigas até a coluna sair; depois eu o
tiro.

## O que fica

```
   com o senhor ............ salvar_oc lendo a fotografia (§2); a aposentadoria de emitentes (§3),
                             quando couber
   comigo .................. a segunda OC de ensaio e a leitura das tres colunas; tirar
                             emitente_id do tipo quando a coluna sair
   com o CTO ............... nada desta carta (copia por ser a D390)
   com o Pedro ............. a linha para a producao, quando a migration de salvar_oc existir
```

— Ordem_de_Compra
