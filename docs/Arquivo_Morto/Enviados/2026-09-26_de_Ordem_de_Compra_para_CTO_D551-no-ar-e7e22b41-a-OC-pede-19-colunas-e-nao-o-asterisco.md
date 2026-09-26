# D551 — no ar: `e7e22b41` (o desfazer é `6e7e6284`). A OC pede à `fornecedores` crua 19 colunas, e não o `*`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 13h1x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D551-a-OC-pede-as-colunas-que-usa-e-nao-o-asterisco.md`
**Espero de volta:** nada. A segunda medida do log (§3) fica para depois que alguém abrir a OC. Posso
fazer, ou o senhor mede.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — O que mudou

A lista fica em `COLUNAS_DA_FORNECEDORES` (`services/supabase/linhas.ts`), e o pedido é
`core().from('fornecedores').select(COLUNAS_DA_FORNECEDORES.join(', '))` (`dados.ts`). São as 19
colunas que o mapeador lê da linha crua:

```
   id, razao_social, nome_fantasia, documento, inscricao_estadual,
   logradouro, numero, complemento, bairro, cidade, uf, cep,
   telefones, email, contato_responsavel, observacoes, ativo, criado_em, atualizado_em
```

Ficam de fora as sete da sua lista e mais 17 que a OC não lê da crua: dados bancários, CPF, CNAE,
origem, raiz, situação na Receita, e o bloqueio, que vem da resolvida. Conferi a lista contra o
`tipos-banco.ts`: as 19 existem. Antes de publicar, conferi também que o `authenticated` pode ler as
19 na produção (`has_column_privilege`, só leitura: 19 de 19). Se faltasse uma, a carga inteira da
OC cairia.

**As escritas (seu item 2):** `linhaDoFornecedor` grava só colunas da lista, mais o `fornece_material`
do cadastro novo, que não vem da leitura. Nada da classificação nem do costume. Há um teste que
fica vermelho se a escrita ganhar uma coluna fora da lista.

## §2 — Travas

```
   sabotagens ... 5, todas mordendo (saida 1), restauradas com hash igual:
                  (1) o pedido volta a ser select('*') ...................... 1 vermelho
                  (2) a lista ganha o '*' ................................... 1
                  (3) a lista volta a pedir o costume (emite_boleto) ........ 1
                  (4) a lista perde uma coluna que o mapeador le ............ 2
                      (sem esta, o campo sumiria da tela sem erro nenhum)
                  (5) a escrita grava o costume ............................. 1
   bateria ...... 173 verdes, lint, typecheck, build, conferir:pacote 5/5, conferir 7/7
   commit ....... 723a35b (codigo)
```

## §3 — Publicação e o log

```
   saiu do ar ... 6e7e6284-fd4c-4fea-b170-a4173e7c2fe0 (a D549)  <- O DESFAZER
   entrou ....... e7e22b41-2714-4e4c-bcfd-08702547e1da · versao 20260926160215-723a35b
   o pacote servido (index-CY0EOjom.js) pede:
                  .from(`fornecedores`).select(No.join(`, `)).order(`razao_social`)
```

**O log da API** (edge_logs, GET `/rest/v1/fornecedores`, 26/09 12h00Z até 16h0xZ):

```
   ?select=*&order=razao_social.asc ........ 4 pedidos, o ultimo as 14:39:50Z  <- a OC velha
                                             DEPOIS da publicacao (16:02Z): nenhum
   ?select=id,razao_social,…,email,telefones… 23 pedidos, sem order ........ outro programa
                                             (a lista e a ordem das colunas nao sao as da OC)
```

**O que falta medir:** o pedido novo da OC ainda não aparece no log porque ninguém abriu a OC
depois das 16:02Z, e eu não entro no sistema. A assinatura dele será
`?select=id%2C+razao_social%2C+…&order=razao_social.asc`, com vírgula e espaço, o que o distingue
do outro programa. Quando aparecer, e se não houver mais nenhum `select=*&order=razao_social.asc`,
a porta da D548 pode contar a OC como fora do caminho velho. Uma aba antiga aberta se atualiza
sozinha ao receber o foco (D541).

— Ordem_de_Compra
