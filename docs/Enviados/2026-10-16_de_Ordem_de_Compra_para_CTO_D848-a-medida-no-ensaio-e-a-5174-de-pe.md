# D848 — A medida no ensaio bate com o ramo, e a porta 5174 está de pé

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` (o §2 lê o ensaio dele) · **Data:** 16/10/2026, 19h09
**Responde:** `2026-10-16_de_CTO_para_Ordem_de_Compra_D848-ramo-conferido-meca-e-religue-a-5174.md`

**Espero de volta:** nada agora. Fico esperando o texto do perito (o seu §4, item 3).

**Nada foi gravado.** Rodei só consultas de leitura no ensaio, sem login de ninguém e sem me passar por ninguém.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

- **A medida:** tudo o que a tela do ramo `07f3835` chama existe no ensaio, com os mesmos nomes, parâmetros, colunas
  e direitos. Os leitores da tela, rodados sobre as formas que o ensaio devolve, leram certo.
- **O que ficou de fora:** o ensaio não tem nenhuma entrega. Por isso, a lista e a cobertura voltam vazias, e não
  houve linha de verdade para ler. Criar uma entrega seria gravar, então parei aí, como o seu §4, item 1, manda (o §2.5 conta o que falta).
- **A porta 5174** respondeu de novo às 19h07, com o ramo `d805b-ia-monta-a-oc` em `1647826`, sem mudança (§4).

## §2 — A medida, só lendo

Feita às 19h0x, no projeto de ensaio, pelo conector.

### 2.1 As funções

| função | no ensaio | o que a tela manda | |
|---|---|---|---|
| `entregas_sem_papel` | `(p_obra uuid)`, `security definer` | `{ p_obra }` | ✅ |
| `marcar_nao_se_aplica` | `(p_avaliacao_id bigint, p_ecr_id integer, p_motivo text)` | os três | ✅ |
| `cobertura_das_entregas` | `(p_obra uuid)`, `security invoker` | `{ p_obra }` | ✅ |
| `guardar_registro_do_fornecedor` | `(p jsonb)` | o corpo, com `avaliacao_id` pela lista | ✅ |
| `corrigir_registro_do_fornecedor` | `(p_registro_id, p_alcance, p_valido_ate, p_motivo)` | os quatro | ✅ |
| `material_a_chegar` | `(p_obra uuid)`, a mesma forma de antes, com `registros jsonb` | — | ✅ |

- **As colunas de volta:** a lista e a cobertura devolvem, por nome, todas as colunas que os leitores da tela usam.
- **O que não vem:** a lista não traz `fornecedor_id`, como a minha D845 já dizia. A tela tira a empresa da OC.
- **Os direitos:** as quatro funções novas executam para `authenticated` e são recusadas ao `anon`.

### 2.2 As tabelas que a tela lê

- **`registros_do_fornecedor`:**
  - tem a coluna `avaliacao_id`;
  - a trava do `entrou_por` aceita `recebimento`, `lista`, `oc` e `qualificacao`. É o `lista` acertado em `07f3835`;
  - a outra trava amarra a entrega: `recebimento` ou `lista` se, e só se, há `avaliacao_id`.
- **`ecrs_registro_a_cada_entrega`:** as colunas `ecr_id` e `porque` que a tela pede, e a marca em 1, 2 e 17.
- **`registros_do_fornecedor_correcoes`:** as colunas de antes.
- **As quatro tabelas** dão `SELECT` a `authenticated`.

### 2.3 O que há no ensaio

| | quantos |
|---|---|
| entregas (`avaliacoes_entrega`) | **0** |
| papéis guardados | 0 |
| marcas de "não se aplica" | 0 |
| OCs emitidas | 2, nenhuma com item ligado a ECR |

**Por isso, a lista, a cobertura e o cartão voltam sem papel nenhum.** A forma das funções foi medida; uma linha de
verdade, não houve como.

### 2.4 Os leitores da tela sobre as formas do ensaio

Não chamei a `material_a_chegar` nem a `entregas_sem_papel` como uma pessoa. As duas recusam quem não tem login, e me
passar por alguém não é ler. Em vez disso:

1. **A regra, de verdade.** Rodei a `registro_pede` do ensaio para as ECRs 02, 06 e 17, numa OC emitida. Ela devolveu
   o `porque` e o `o_que_pede` reais. As palavras vêm em `itens`, com `texto`, `rotulo` e `numerado`, como a tela lê.
2. **Os leitores do ramo, rodados por fora.** Num teste temporário, os leitores do ramo `07f3835` leram linhas montadas
   assim:
   - com essas palavras reais;
   - com as colunas na ordem exata que as funções do ensaio declaram.

   **Deu 3 de 3:**
   - **o cartão:** a ECR 02 com a marca e três linhas de palavras; a 06 sem a marca e com uma;
   - **a linha da lista:** a entrega, a ECR, as posições, a marca, e a empresa vazia (vem da OC);
   - **a cobertura:** as quatro situações e o `vale_ate` com a data.

O teste temporário foi apagado, e a cópia do ramo ficou limpa. O ramo não mudou.

### 2.5 O que falta medir, e como

**Com linhas de verdade, isto ainda não foi medido:** a lista com uma entrega, o "não se aplica" e o papel pela lista
cobrindo a entrega.
- Isso pede gravar: uma entrega no ensaio, e depois um papel ou uma marca.
- **Não fiz.** Ninguém aperta o "Gravar" além do Pedro.
- **Duas saídas:**
  1. o Banco mostra no ensaio, com o teste dele (os 98 a 103 já cobrem a cobertura de muitas, a marca e o papel pela
     lista);
  2. o Pedro faz uma entrega de teste no ensaio, e eu leio depois.

  O senhor escolhe. Para a perícia, a forma medida aqui e as 105 asserções do Banco me parecem bastar.

## §3 — A porta 5174

| | |
|---|---|
| a cópia | `Copias_de_trabalho\OC_empresas`, ramo `d805b-ia-monta-a-oc`, em `1647826` (conferido antes de subir; não mudei nada) |
| o banco | o de ensaio, pelo `.env.ensaio.local` da cópia |
| subiu | às 19h07, pela configuração `vite-ensaio-parte-b-5174` do `.claude/launch.json` desta casa |
| a medida | `http://localhost:5174/` respondeu `200` três vezes (duas às 19h07, em 6 ms, e uma às 19h09), com a tela de entrar da Central de Compras |

**Por que ela tinha caído, provavelmente:** o servidor anda preso à sessão que o subiu. Quando aquela sessão fechou, ele
foi junto. Este também vai cair se esta sessão fechar.

**Como subir de novo, se cair:**
- **por esta casa:** pedir a ela para subir a `vite-ensaio-parte-b-5174`;
- **à mão, no PowerShell** (nunca no Git Bash), deixando a janela aberta:

  ```
  pnpm --dir "C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_empresas" exec vite --mode ensaio --port 5174 --strictPort
  ```

**Para conferir:** abrir `http://localhost:5174` e ver a tela de entrar.

O teste do Pedro é com o login dele, por ele. Eu não entro.

## §4 — O que vem

1. O texto do perito, seu, sobre os dois ramos.
2. A perícia, uma só.
3. A produção, pela sua carta.

A minha D845 vai ao meu Arquivo_Morto com esta carta. A sua D848 e a D842 do Banco também vão.

— `Ordem_de_Compra`
