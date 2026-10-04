**De:** Banco de Dados · **Para:** CTO, com cópia para Ordem de Compra · **Data:** 04/10/2026, 10h2x
**Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D685-a-guardar-oc-aprovada-suba-a-producao.md`
**Decisão:** D685

# A `guardar-oc-na-obra` está na produção. Os três passos estão verdes

## 1. O commit

- **`589b8d4`** é o commit da D682, feito antes de qualquer passo.
- Os seis arquivos estavam com as digitais da sua carta quando commitei:

  | Arquivo | Digital |
  |---|---|
  | `_shared/onedrive.ts` | `f5e09615d0de` |
  | `guardar-oc-na-obra/index.ts` | `938166a03c5c` |
  | `guardar-oc-na-obra/logica.ts` | `c4ca87f30c77` |
  | `arquivar-documento/index.ts` | `c0d04de141bd` |
  | `proposta_oc_pdf_na_pasta_d682.sql` | `8eb4d740593e` |
  | `desfazer_proposta_oc_pdf_na_pasta_d682.sql` | `06e12c4cbdca` |

- **Os três arquivos de código não mudaram depois.** O que foi para a produção é byte a byte o que você conferiu (§3 e §4).
- **Os dois `.sql` mudaram no passo 1, como o passo pedia. Diga se quer conferir antes de dar por fechado:**
  - **A proposta virou a migration** `supabase/migrations/20261004103000_o_pdf_da_oc_na_pasta_da_obra_cto_d682.sql`, por `git mv`.
    - Mudaram o cabecalho (de "proposta" para "aprovada na D685") e o comentário que aponta o desfazer.
    - Do `-- D548: acrescenta` para baixo, o arquivo é igual ao conferido, salvo essa linha de comentário. Medi com `diff`.
  - **O desfazer foi renomeado** para `docs/roteiros/desfazer_o_pdf_da_oc_na_pasta_d682.sql`.
    - Ganhou a linha que apaga `20261004103000` do `supabase_migrations.schema_migrations`, a que você pediu.
    - Os dois `drop` estão iguais.

## 2. Os três passos

| Passo | Hora | O que entrou | Controle | Desfazer (não rodado) |
|---|---|---|---|---|
| 1. A tabela | ensaio 10:21:55 · produção 10:22:27 | migration `20261004103000`, aceita pela porta D548 ("só acrescenta") | `teste_oc_pdf_na_pasta.sql` inteiro: **20/20 no ensaio, 20/20 na produção** | `python scripts/consultar.py --projeto splhxikzzqqwrjbhgfud -f docs/roteiros/desfazer_o_pdf_da_oc_na_pasta_d682.sql` |
| 2. A função nova | 10:23:16 | `guardar-oc-na-obra` **versão 1**, exige login, `--conferir` IGUAL nos 3 arquivos | **4/4**, e o último é **200 "gravado"** na pasta de teste | `python scripts/implantar_funcao.py --projeto producao --apagar guardar-oc-na-obra` |
| 3. A `arquivar-documento` repartida | 10:23:49 | **18 → 19**, `--conferir` IGUAL (`index.ts` e `_shared/onedrive.ts`) | `controle_arquivar_documento` **4/4** · `controle_copia_notas_baixadas` **6/6** com o drive de verdade | `python scripts/implantar_funcao.py --projeto producao --do-commit 26fa1fe arquivar-documento` |

## 3. Passo 1, a tabela, em detalhe

- **O desfazer foi provado em begin/rollback nas duas casas, já com a linha do caderninho:**
  - no ensaio às 10:22:11;
  - na produção às 10:22:42.
- **O que a prova mostrou:**
  - a tabela, a função e o caderninho foram de presente para ausente (caderninho 1 → 0);
  - a digital de `compras.ordens_compra` ficou igual antes e depois.
- **Depois da prova:**
  - a tabela continua na produção, com **0 linhas**;
  - `aplicar_migration --conferir` dá 0 diferenças nas duas casas.
- **O mapa** `compartilhado/tipos-banco.ts` foi regerado da produção: de 280599 para 282433 bytes. **A OC precisa puxar.**
- **O `restaurar_backup.py`** já conhece `compras.oc_pdf_na_pasta`. Ela entra logo depois de `ordens_compra`, de quem depende.

## 4. Passo 2, a função nova, em detalhe

| Controle na produção | Esperado | Obtido |
|---|---|---|
| quem só lê | 403 `sem_permissao` | 403 |
| quem emite, OC que não existe | 404 `oc_nao_encontrada` | 404 |
| quem emite, arquivo que não é PDF | 400 `pedido_invalido` | 400 |
| quem emite, a OC 2026/008, `teste: true` | 200 `gravado` na pasta de TESTE | **200 `gravado`**, `registrado: false`, `teste: true` |

- **É a prova positiva que o ensaio não podia dar.** O Graph de verdade gravou um PDF em
  `Documentos Campisi/00_TESTES/notas e recibos/Ordem de Compra/`.
- **A subpasta foi criada pela própria função.** O PDF ficou lá: tem o nome `controle d682 78bd95d6f2be oc.pdf` e
  nenhum dado de ninguém.
- **A OC não foi marcada.** `compras.oc_pdf_na_pasta` continua com 0 linhas.
- **As duas contas temporárias foram apagadas.**

## 5. Passo 3, a `arquivar-documento`, em detalhe

- **Este passo mexeu no que já roda**, por isso os controles foram feitos logo depois de publicar:
  - **`controle_arquivar_documento` deu 4/4.** Inclui a nota já lançada, que devolveu `ja_lancada` para o lançamento vigente.
  - **`controle_copia_notas_baixadas` deu 6/6, contra o drive de verdade.** Passou pelos desfechos `gravada`,
    `ja_existia`, `ja_estava`, `gravada com outro nome`, `nao_e_pdf` e `.pdf garantido`.
    Os arquivos ficaram em `Documentos Campisi/00_TESTES/Notas baixadas`, e ele confere: 0 linhas e 0 arquivos
    deixados.
- **Com isso, o código do Graph repartido está provado na produção pelas duas funções que o usam.**

## 6. A trava

- **`PRODUCAO_LIBERADA` subiu no commit `c2b5d7b`.** O commit só tem isso e lista os três desfazeres.
- **Ela baixou no `6f3b522`, às 10h2x de hoje,** depois dos passos 2 e 3.
- O commit do passo 1 é o **`e45a8c4`**.

## 7. Para a Ordem de Compra

- **O contrato é o do §2 da minha carta da D682,** sem mudança. Está no Arquivo_Morto da minha casa e na sua `Devolucoes`.
- **A função está no ar:** `POST /functions/v1/guardar-oc-na-obra`.
- **O ✓ se lê em `compras.oc_pdf_na_pasta`,** pelo `oc_id`. Quem tem acesso lê, e só o servidor escreve.
- **Para provar a tela sem tocar uma obra de verdade,** mande `teste: true`. O PDF vai para a pasta de teste e a OC
  não é marcada.
- **Puxe o mapa novo.**

## 8. A seguir

A D683, a OC não emite com quantidade 0.
