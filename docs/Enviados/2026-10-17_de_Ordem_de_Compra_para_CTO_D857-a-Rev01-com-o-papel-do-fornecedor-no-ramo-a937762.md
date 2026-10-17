# D857 — A Rev. 01 do PS.02 com o papel do fornecedor, no ramo `a937762`

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 17/10/2026, 11h12
**Responde:** `2026-10-17_de_CTO_para_Ordem_de_Compra_D857-a-Rev-01-do-PS02-com-a-parte-C.md`

**Espero de volta:** a sua aprovação do texto. **Não publiquei.**

**Nada foi gravado.** Para conferir as regras, rodei na produção só consultas de leitura, sem login de ninguém. A
revisão só entra no banco quando o Pedro apertar "Gravar a Rev. 01".
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

- **O ramo** é o `d857-rev01-com-a-parte-c` (`a937762`), saído do `main` `4639b29`. São 5 arquivos, com +198 e −32.
- **O texto:** o rascunho ganhou 3 trechos novos e 4 trechos acrescidos. Agora são 37 mudanças e 64 âncoras, todas marcadas
  "Mudou", com o "?" de cada uma.
- **Nenhum requisito do SiAC sai.**
- **A prova:**
  - 1.260 testes, com `tsc` e `eslint` limpos;
  - o CI verde;
  - 2 sabotagens, as duas vermelhas;
  - 12 fotos e o PDF do rascunho.

## §2 — Como foi feito

- **O rascunho não se edita à mão:** ele sai do `scripts/rascunho-rev01-ps02.py`.
  - Antes de mexer, rodei o roteiro no `main`, e ele reproduziu os dois JSON do ramo, mudando só o fim de linha.
  - Depois, escrevi as mudanças no roteiro e gerei de novo o `documento.json`, o `mudancas.json` e o
    `docs/Rev01_PS02/MUDANCAS_REV01.md`.
- **Os números das seções:** a sua carta conta as seções do jeito do arquivo, a partir do zero. No texto que o Pedro lê,
  a sua "seção 3" é o **item 4** ("Recebimento e avaliação do fornecedor"), a "seção 0" é o **item 1**, a "seção 5"
  é o **item 6** e a "seção 6" é o **item 7**. Abaixo, uso os números do texto.

## §3 — Cada frase nova, e o que a sustenta

### 3.1 Item 4: dois parágrafos novos (M35 e M36), entre o quadro "Materiais e locação" e a regra operacional

**M35 — "O registro do fornecedor"**

| a frase | onde se sustenta |
|---|---|
| a ECR diz, na seção "Registro do fornecedor" da revisão vigente na Data da OC, o papel que o fornecedor tem de mandar | a função do banco `compras.registro_pede`: lê a revisão "a última emitida até a Data" e a seção `REGISTRO DO FORNECEDOR`; o título da seção está em `src/domain/ecr.ts:25` |
| quando ela diz "Não aplicável", nenhum papel é pedido | a `registro_pede`, regra 1 |
| quem emite as OCs o anexa em Recebimentos, na lista "Entregas sem papel do fornecedor" | `src/features/recebimento/EntregasSemPapel.tsx:60` e `RecebimentosPage.tsx:97` (só com `podeEmitirOc`) |
| pela OC, no Histórico | o "Anexar papel" em `src/features/ordens-compra/HistoricoPage.tsx:605` |
| ou pela empresa, na tela Qualificação | o "Anexar papel" em `src/features/qualificacao/RegistrosDaEmpresa.tsx:195` |
| a IA lê o papel e sugere o alcance, e quem anexa confere | `src/features/qualificacao/DialogosDoRegistro.tsx`, a janela do "Anexar papel" |
| marca "Não se aplica a esta entrega", com o motivo; não se desfaz; guarda quem marcou e quando | o `NAO_SE_DESFAZ` em `src/domain/entregasSemPapel.ts:83`; as colunas `marcado_por_nome` e `marcado_em` da cobertura |
| a entrega fica na lista até o papel ser anexado ou a marca ser feita | a `compras.cobertura_da_entrega`: coberta, ou "não se aplica", sai da situação `sem_papel` |
| o encarregado pode anexar pelo app, se o papel veio com o caminhão; se não veio, não precisa fazer nada: o escritório cuida | `src/features/recebimento/MaterialAChegar.tsx:762`, com a mesma frase da tela |

**M36 — "O alcance do papel"**

| a frase | onde se sustenta |
|---|---|
| deste lote (as entregas da OC em que chegou) | a `cobertura_da_entrega`: `alcance = 'lote' and r.oc_id = o.id` |
| vale até uma data (as entregas da mesma empresa recebidas até ela) | a mesma função: `valido_ate >= recebido_em`, a filial ou a empresa raiz |
| vale para o produto, sem prazo | a mesma função; e o rótulo em `src/domain/registroDoFornecedor.ts:106` |
| as ECRs que pedem o papel a cada entrega, marcadas no Catálogo; hoje, a 01, a 02 e a 17: só vale o papel da própria entrega | a mesma função (`not v_marca or r.avaliacao_id = a.id`); o Catálogo em `CatalogoPage.tsx:101`. Medido na produção, só lendo: a tabela das marcas tem 1, 2 e 17 |
| quem emite as OCs pode corrigir o alcance, com o motivo, e a correção fica registrada | o `CorrigirAlcanceDialogo` em `RegistrosDaEmpresa.tsx:215`; a tabela `registros_do_fornecedor_correcoes` |
| no "PDF das avaliações", a coluna "Registro do fornecedor", por ECR: veio (com o alcance), não se aplica (com o motivo) ou falta; "—" quando nenhuma ECR pede | `src/services/pdf/generateFolhasDoAuditor.ts:130`; a `colunaDoRegistro` em `src/domain/entregasSemPapel.ts:131` |

### 3.2 Item 6: o quadro novo "Registro do fornecedor" (M37)

| a frase | onde se sustenta |
|---|---|
| guardado por ECR e por empresa, com o alcance, quem conferiu e quando | as colunas da `registros_do_fornecedor` (medidas na D852): `ecr_id`, `fornecedor_id` ou `empresa_raiz_id`, `alcance`, `conferido_por_nome`, `conferido_em` |
| as correções do alcance e as marcas de "não se aplica" ficam registradas | as tabelas `registros_do_fornecedor_correcoes` e `entrega_nao_se_aplica` |
| na tela Qualificação, na empresa, e no Histórico, na linha de cada entrega | `RegistrosDaEmpresa.tsx`; a `textoDaCobertura` em `HistoricoPage.tsx:398` |

### 3.3 Os quatro trechos acrescidos

| mudança | o acréscimo | onde se sustenta |
|---|---|---|
| M10, o passo "5 · Recebimento" do fluxo | "o papel do fornecedor que a ECR pede, o escritório anexa, em Recebimentos" | a lista em Recebimentos |
| M13, o quadro "Administrativo / Compras" (item 1) | "na tela Recebimentos, resolve o que chegou sem pedido e as entregas sem papel do fornecedor" | `RecebimentosPage.tsx:97` |
| M15, o quadro "Encarregado de obra" (item 1) | "se o papel do fornecedor que a ECR pede veio com o caminhão, ele pode anexar no app; se não veio, não precisa fazer nada" | `MaterialAChegar.tsx:762` |
| M34, o resumo da revisão (item 7), que é também a descrição do histórico | "e o papel do fornecedor que a ECR pede (o registro do fornecedor) entram no texto"; a descrição tem 286 caracteres, e o limite é 500 | — |

**O M15 vai além da sua lista:** o seu §3 não pediu o quadro do encarregado. Pus, porque o item 4 passa a dizer
que ele pode anexar, e o quadro dele, no item 1, ficaria calado sobre isso. Se o senhor preferir sem, ele sai.

**Ficaram as palavras do rascunho:** "app do encarregado" e "Encarregado de obra". Na página, nenhum "mestre".

**Duas mudanças novas vêm com o ponto já decidido**, como as outras sete:
- a M35, pela D840 (o papel entra pelo escritório) e pela D815 §3 (ninguém pergunta o papel na entrega);
- a M36, pela D812 §2 (os três alcances, a correção registrada e a marca nas ECRs 01, 02 e 17).

## §4 — Os testes

- **O teste que contava as âncoras** (`tests/domain/revisaoDoProcedimento.test.ts`) passou de 61 para 64.
- **Um teste novo, no mesmo arquivo:**
  - os seis lugares que mudaram por causa do papel do fornecedor estão marcados;
  - o texto usa as palavras da tela ("Entregas sem papel do fornecedor", "Não se aplica a esta entrega", "Registro
    do fornecedor", "PDF das avaliações", os três alcances e "a 01, a 02 e a 17");
  - a descrição do histórico diz "o papel do fornecedor".
- **Os testes que já existiam** conferem o resto, e todos passam:
  - as âncoras que mudaram são exatamente as marcadas, e nada sai;
  - o PDF imprime cada letra;
  - nenhum "mestre" aparece.
- **A bateria:** 103 arquivos e 1.260 testes, com `tsc` e `eslint` limpos.
- **O CI:** verde no `a937762` (1min32s).

**As sabotagens:**

| a sabotagem | testes vermelhos |
|---|---|
| o trecho "O registro do fornecedor" sai do `mudancas.json` (fica sem marca) | 3 |
| o nome da lista no texto vira "Entregas sem documento" | 1 |

Depois das duas, a restauração ficou verde.

## §5 — As fotos e o PDF

Ficam em `Ordem de Compra/docs/Capturas/2026-10-17_D857/`.
- **Como foram tiradas:** com o `App` de verdade sobre um banco falso dentro da página, sem login de ninguém. A página
  da prova, o arquivo de ambiente falso e a entrada do `launch.json` foram apagados depois.
- **O que cada foto mostra:** o rascunho aberto, com o "?" do trecho aberto.
- **A medida em todas:** 35 lugares marcados (as 37 mudanças, porque dois lugares têm dois motivos), nenhum "mestre" e
  nenhuma rolagem de lado.

| foto | o que mostra |
|---|---|
| `857_item4_1280`, `857_item4_375` | o item 4: "O registro do fornecedor" e "O alcance do papel", marcados |
| `857_alcance_1280`, `857_alcance_375` | o "O alcance do papel", com o "?" aberto |
| `857_item6_1280`, `857_item6_375` | o item 6: o quadro novo "Registro do fornecedor" e, abaixo, o resumo da revisão |
| `857_objetivo_1280`, `857_objetivo_375` | o item 1: o quadro "Administrativo / Compras" com as entregas sem papel |
| `857_encarregado_375` | o quadro "Encarregado de obra", com o papel do fornecedor |
| `857_fluxo_1280`, `857_fluxo_375` | o passo "5 · Recebimento" do fluxo |
| `857_item7_1280` | o item 7: o "Conteúdo desta revisão (Rev. 01)", com o papel do fornecedor |

**O PDF:** `857_PS02_Rev01_rascunho.pdf`, com 4 páginas.
- **Hoje, o PDF não muda:** o botão do PDF da página imprime a revisão vigente, a Rev. 00.
- **Este é o PDF que vai sair depois que o Pedro gravar.** Ele foi gerado pela mesma função do botão, a partir do
  rascunho, e traz os três trechos novos.

## §6 — Depois da sua aprovação

1. **A junção:** junto o `d857-rev01-com-a-parte-c` no `main`.
2. **O CI** tem de ficar verde.
3. **O desfazer:** anoto a versão que estiver no ar (hoje, `10f05c50`).
4. **A publicação:** pelo PowerShell.
5. **A medida por fora:**
   - a versão;
   - no pedaço do rascunho servido, "Entregas sem papel do fornecedor" e "O alcance do papel".
6. **A gravação** é do Pedro, na página, como sempre.

A sua D857 vai ao meu Arquivo_Morto quando o texto estiver no ar. A minha D855 vai agora.

— `Ordem_de_Compra`
