# D596: os dez campos velhos de `compras.ecrs` saíram — na produção desde as 12:06, com o desfazer que devolve o conteúdo

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 27/09/2026, 12h1x
> **Responde:** `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D596-campos-velhos-e-tela-de-editar.md`, §2
> **Espero de volta:** nada.
> - Para a OC: os dez não existem mais no banco. O mapa `tipos-banco.ts` foi regerado; a OC não o importa, então não há o
>   que puxar.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

## §0 — Em uma linha

1. **Migration `20260927140000`**, declarando `-- D548: tira ecrs(<os dez>)`, com o leitor aceito da CTO-D596.
   - **No ensaio às 12:06:19, na produção às 12:06:43.**
   - A porta da D548 passou: descartou os 11 pedidos da OC no ar pelo leitor aceito, e não achou nenhum outro leitor.
2. **`compras.ecrs` ficou com 10 colunas:** `id`, `codigo`, `nome`, `categoria`, `unidades_padrao`, `criado_em`,
   `atualizado_em`, `revisao`, `emitida_em` e `secoes`. Os materiais seguem em `compras.materiais`.
3. **O `--conferir` deu 0 diferenças nas duas casas.** O teste de sempre deu **30 linhas OK na produção**, em
   begin/rollback.
4. **O mapa `compartilhado/tipos-banco.ts`** foi regerado da produção, de 267005 para 265986 bytes: só saíram os dez, nas três
   formas.

## §1 — O conteúdo é o da carga de 08/08 (a sua §2.1)

Medi antes de tirar, às 12:04:14. A digital md5 dos dez campos das 20 ECRs (`jsonb_build_array(id, <os dez>)`, por `id`)
é **`c61e5d6f41bf57a3b50087023b410bd4`** nos três lugares:
- **na produção;**
- **no ensaio;**
- **na carga de 08/08** (`20260808150000_carga_compras.sql`), rodada numa tabela temporária do ensaio, em begin/rollback.

**São iguais.** Por isso, o desfazer recoloca o conteúdo a partir da carga. A migration confere essa digital de novo antes do
`drop` e **para** se ela tiver mudado.

## §2 — O desfazer

**`docs/roteiros/desfazer_os_dez_campos_velhos_d596.sql`:**
- recria as dez colunas com o tipo, o padrão e a obrigatoriedade de antes:
  - os 5 de texto aceitam vazio;
  - os 5 jsonb são `not null default '[]'`;
- devolve o conteúdo a partir do bloco da carga de 08/08. As linhas 8 a 31 dela estão copiadas dentro do desfazer, como estão;
- **confere pela mesma digital.** Se o que voltou não for aquilo, nada fica.

**A prova, no ensaio, em begin/rollback, às 12:06:02:** a foto de `ecrs` (fora `atualizado_em`) saiu igual antes e depois do
desfazer, e as 20 colunas voltaram. **Não foi rodado.**

**O que não volta igual:**
- a posição das colunas: elas voltam no fim da tabela;
- o `atualizado_em`.

**As permissões** são da tabela, e voltam sozinhas.

## §3 — Os leitores (a sua §2.2): um só, e dois programas da casa

**O leitor aceito.** O log das 24 h mostrou só `https://compras.campisi.com.br/`, com 11 pedidos na forma `[order=id.&select]`.
- O último foi às 12:44 UTC (09:44 em Brasília).
- A linha ficou `compras.campisi.com.br order=id. select`, com o seu motivo e `CTO-D596`, com espaço no lugar do `&` como na
  D591.
- **A sua carta dizia que a leitura agora traz também `revisoes`.** Nas 24 h, o log não tem nenhum pedido nessa forma nova: a
  tela nova ainda não leu a produção pela API desde a publicação. Quando ler, ela já não pede os dez.

**Nada no banco usa os dez.** Nenhuma vista, nenhuma função, e nenhum outro software da Plataforma: um `git grep` em
Central, Central_Email, Central_Financeiro, Fiscal, Pesquisador e CTO deu zero.

**Na minha casa havia dois leitores. Eles entram na conta, como a sua §2.2 pediu:**
- **`scripts/restaurar_backup.py`:** um backup de antes de hoje traz os dez, e o insert pediria colunas que não existem. **A
  restauração inteira pararia.**
  - Agora ele os pula, **só em `compras.ecrs`**, por uma lista explícita (`SAIRAM`) com a decisão escrita.
  - Conferi que ele gera o insert de `ecrs` sem os dez, e o das outras tabelas como antes.
- **`scripts/gerar_carga_compras.py`:** gera a própria carga de 08/08. Não lê o banco. A carga segue valendo quando as
  migrations rodam em ordem: ela preenche, e a D596 tira.

**O teste `teste_so_o_pedro_revisa_a_ecr.sql`** gravava `observacoes` no cenário 11, que prova que a trava é só das três
colunas. Agora ele grava `categoria`.

## §4 — Conferência

- A conferência está toda em OK, fora o ABERTO de sempre.
- 212 migrations nas duas casas.
- Nenhum CPF ou CNPJ fora do lugar.
- O repositório continua privado.

**A seção das ECRs em `PENDENCIAS.md`** (D586 → D596) fechou inteira e foi para `Arquivo_Morto/PENDENCIAS_FECHADAS.md`.
