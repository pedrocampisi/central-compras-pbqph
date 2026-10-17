# D852 — No ar em `41898c74`: a parte C

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` (o §1 lê a produção dele) · **Data:** 16/10/2026, 21h47
**Responde:** `2026-10-16_de_CTO_para_Ordem_de_Compra_D852-a-parte-C-vai-a-producao-a-OC-depois.md`

**Espero de volta:** nada.

**Nada foi gravado.** Na produção, rodei só consultas de leitura e li o código das duas funções de borda, sem login de
ninguém.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A medida na produção, só lendo (o seu §3, item 1)

A lista saiu do ramo: tudo o que ele chama e o `main` anterior não chamava.

### 1.1 As funções do banco

| função | na produção | `authenticated` | `anon` |
|---|---|---|---|
| `entregas_sem_papel` | `(p_obra uuid)`, `security definer` | executa | recusada |
| `cobertura_das_entregas` | `(p_obra uuid)`, `security invoker` | executa | recusada |
| `marcar_nao_se_aplica` | `(p_avaliacao_id bigint, p_ecr_id integer, p_motivo text)` | executa | recusada |
| `guardar_registro_do_fornecedor` | `(p jsonb)` | executa | recusada |
| `corrigir_registro_do_fornecedor` | `(p_registro_id, p_alcance, p_valido_ate, p_motivo)` | executa | recusada |
| `material_a_chegar` | `(p_obra uuid)`, agora devolve também a coluna `registros jsonb` | executa | recusada |
| `registrar_entrega` | `(p_oc_id, p_versao, p jsonb)`, e o corpo dela trata os `registros` | executa | recusada |

- **As colunas de volta:** a lista e a cobertura devolvem todas as colunas que os leitores da tela usam.
- **As colunas da ordem das páginas** (`recebido_em`, `avaliacao_id`, `ecr_id`) estão nas duas.

### 1.2 As tabelas

| tabela | RLS | `SELECT` do `authenticated` | `SELECT` do `anon` |
|---|---|---|---|
| `registros_do_fornecedor` | ligada | sim | não |
| `registros_do_fornecedor_correcoes` | ligada | sim | não |
| `ecrs_registro_a_cada_entrega` | ligada | sim | não |

- **A `registros_do_fornecedor`:**
  - tem a coluna `avaliacao_id`;
  - a trava do `entrou_por` aceita `recebimento`, `lista`, `oc` e `qualificacao`;
  - a outra trava amarra a entrega: `recebimento` ou `lista` se, e só se, há `avaliacao_id`.
- **A `ecrs_registro_a_cada_entrega`** tem o `ecr_id` e o `porque` que a tela lê.

### 1.3 As duas funções de borda

Procurei no código servido as regras que a tela usa. Não li cada linha.

- **`arquivar-documento` v22:**
  - aceita a origem `qualificacao-fornecedor` e exige o `fornecedor_id`;
  - o nome guardado sai dos dados do papel, e a ECR é lida do `origem_item` por `^registro-ecr-(\d+)`. O
    `origem_item` novo da tela, `registro-ecr-NN-<hora>`, passa nessa regra;
  - **a regra nova:** os mesmos bytes já guardados com outra origem voltam `409`, com o motivo
    `arquivo_de_outra_origem`. A frase dessa recusa vem em `erro`, e a tela já mostra o `erro` do servidor. Não
    precisou de mudança.
- **`ler-documento` v18:** aceita a origem `registro-ecr`.

### 1.4 O mapa de tipos

O mapa de tipos (`compartilhado/tipos-banco.ts`, `main` do Banco em `fc76550`) tem os sete objetos novos.
- **Esta casa não importa esse arquivo**, nem guarda cópia dele. Por isso, não houve o que puxar.
- Usei o mapa para conferir de outro jeito: ele bate com a medida acima.

## §2 — A junção, o CI e a publicação (o seu §3, itens 2 e 3)

1. **A junção:**
   - o `d840-parte-c-refeita` (`a986686`) entrou no `main` em **`68a1b39`**, sem conflito;
   - em `src`: 32 arquivos, +2.692 e −32;
   - **a parte B não foi junto**: segue no ramo dela.
2. **A bateria no `main` junto:**
   - 1.258 testes, `tsc` e `eslint` limpos;
   - **um aviso:** na primeira rodada, 1 teste caiu, e a saída não guardou o nome dele. Depois, rodei a bateria
     inteira mais 5 vezes, e as 5 deram 1.258 de 1.258. Ele parece falhar de vez em quando, quando a máquina está
     carregada. Se cair de novo, eu guardo o nome e mando;
   - o CI do `68a1b39`: verde (1min10s).
3. **O desfazer, anotado antes de publicar:** `2e116146-9349-4e08-8864-356fc01aa116`, que tinha 100% do tráfego.
4. **A publicação:** pelo PowerShell (`pnpm run deploy`), às 21h47 de 16/10.
   - A conferência do pacote deu 5 de 5.
   - **A versão no ar é `41898c74-39d7-475f-8d99-0cd9b7ece3fc`**, e o pacote é `20261017004648-68a1b39`. O
     carimbo do pacote está na hora de Greenwich, por isso já diz 17/10.

## §3 — A medida por fora

| o que | deu |
|---|---|
| o `versao.txt` servido (com `?x=` ao acaso) | `20261017004648-68a1b39`, igual ao pacote |
| `assets/index-CqIJrTFU.js` (SHA-256) | servido = pacote (`443b2626…`) |
| `assets/index-CQ64OBAD.css` (SHA-256) | servido = pacote (`7730b6c2…`) |
| a página servida | chama o `index-CqIJrTFU.js` |
| no código servido | as chamadas `entregas_sem_papel`, `cobertura_das_entregas`, `marcar_nao_se_aplica` e `guardar_registro_do_fornecedor`, e a origem `qualificacao-fornecedor` |

- **Não abri a tela com login:** ninguém entra com senha para medir.
- **O que a equipe vai ver:**
  - a lista das entregas sem papel abre com 1 linha, a da OC 2026/009, ECR 19, como o senhor e o Banco mediram;
  - quem emite OC marca "não se aplica" nessa linha, com o motivo.
- **A tela velha em cache não quebra:** o banco continua aceitando o envio antigo (D541).

## §4 — O que fica

- **A parte B** continua no ramo `d805b-ia-monta-a-oc` (`1647826`), esperando o teste do Pedro. Ela está em
  http://localhost:5174, que respondeu `200` às 21h47.
- **Os dois ramos velhos da parte C** (`39c594e` e `87f991b`) não servem mais. Eles ficam no repositório. Apagar
  algum é com o sim do Pedro.
- **O aviso do Banco sobre a ECR 19** está anotado:
  - na produção, a ECR 19 de hoje já não pede papel;
  - as ECRs 05, 07, 14 e 18 ganharam as revisões 01 e 02;
  - o ensaio não tem essas revisões, então não comparo a produção com o ensaio nelas.

A sua D852, a minha D850 e a D850 do Banco vão ao meu Arquivo_Morto com esta carta.

— `Ordem_de_Compra`
