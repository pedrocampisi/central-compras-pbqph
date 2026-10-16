# D818 §2 — Os três consertos, nos dois ramos, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 22h28
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D818-ramo-2-conferido-tres-consertos-e-a-pericia.md`
**Espero de volta:**
- a sua conferência dos três consertos;
- depois dela, o texto da perícia, para o Pedro disparar.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Os commits

| ramo | commit | o que entrou |
|---|---|---|
| `d812-c1-registro-no-recebimento` (ramo 1) | `39c594e` | o conserto 1 no carimbo: o papel e a foto da nota |
| `d815-c2-registro-na-qualificacao` (ramo 2) | `6ab6b25` | a junção do ramo 1 (sem conflito) |
| `d815-c2-registro-na-qualificacao` (ramo 2) | `4d949e2` | os consertos 1, 2 e 3 na qualificação |

- **O ramo 2 recebeu o ramo 1 por junção, não por rebase:** os dois já estavam empurrados.
- **O CI:** verde no `39c594e` e no `4d949e2`.
- **Nenhum foi publicado.**

## §2 — Conserto 1: vale só o último arquivo escolhido

- **A peça nova:** `src/hooks/useUltimaEscolha.ts`, com 16 linhas.
  - Cada escolha de arquivo pega a sua vez.
  - Depois de cada espera (o preparo do arquivo, a leitura da IA), a resposta só entra se a vez ainda for dela.
- **Onde ela entra:**
  - **o papel do carimbo** (`PapelDoFornecedor`): a leitura da foto trocada no meio não cai em cima da nova, e o "Lendo o papel…" só sai com a leitura da última;
  - **a foto da nota** (`FotoDaNota`, a que já está na produção): o número lido da primeira não sobrescreve o da segunda. Ela vale para o "com pedido" e para o "sem pedido", que usam a mesma peça;
  - **o "Anexar papel"** (ramo 2): os bytes, a leitura e o erro do primeiro arquivo não entram depois que o segundo foi escolhido. Sobem os bytes do último, com o nome dele.
- **A foto da nota vai ao ar com o ramo 1,** não sozinha. Se você quiser esse conserto antes, numa publicação só dele, é um ramo de 28 linhas a partir do `main`. Diga.

## §3 — Conserto 2: o aviso da ECR na ordem do banco

A `avisoDaEcr` agora recebe os itens da seção 03 da revisão vigente e a marca. Ela segue a `compras.registro_pede`, e a
primeira regra que vale ganha:

| regra do banco | o que a tela diz |
|---|---|
| 1 — a seção diz só "Não aplicável" | "A ECR diz "Não aplicável" no registro do fornecedor: nenhuma entrega pede o papel." |
| 2 — a marca "a cada entrega" | nada: a caixa da marca já diz |
| 3 — já chegou um lote da empresa | "Esta empresa já mandou papel valendo só para o lote: cada entrega pede o papel, mesmo com outro guardado." |
| 4 — um "vale até" que vale hoje | nada |
| 5 — um "vale para o produto" | nada |
| 6 — venceu | "O papel que valia até uma data venceu. A próxima entrega vai pedir de novo." |
| 6 — nada guardado | "Nenhum papel guardado para esta ECR." |

- A regra 1 usa a mesma expressão do banco (`não aplicável`, com ou sem acento e ponto). Basta uma linha que pede para
  a seção não ser "Não aplicável".
- **A regra 1 vale nesta tela pela revisão vigente.** O banco usa a revisão da Data da OC, porque a pergunta dele é de
  uma entrega. A qualificação não tem OC, então mostra a revisão vigente, como a coluna "O que a ECR pede".
- **O teste prende a ordem:**
  - 5 casos na regra pura: o lote com um "vale até" valendo, o lote com um "produto", o lote com um vencido, a marca
    com um lote, e a "Não aplicável" com a marca;
  - 3 casos na tela.

## §4 — Conserto 3: "Tentar de novo"

- **O botão:** quando a leitura dos papéis falha, um "Tentar de novo" fica junto da frase do erro e lê outra vez, sem
  recarregar a página.
- **Enquanto lê de novo:** a frase do erro sai e volta o "Lendo os papéis…". Para isso, a loja limpa o erro ao
  começar a ler.

## §5 — A prova

- **a bateria:** 1192 testes, 10 novos sobre o `dbdeb58`, com tipos e lint limpos;
- **12 sabotagens dos consertos, as 12 vermelhas:**
  - os bytes do primeiro arquivo;
  - a leitura do primeiro;
  - sem a regra 1;
  - sem a regra 2;
  - o "vale até" antes do lote;
  - o "produto" antes do lote;
  - a tela sem a marca;
  - a tela sem os itens;
  - o "Tentar de novo" que não lê;
  - o erro que fica;
  - o papel do carimbo;
  - a nota do carimbo;
- **as 28 sabotagens do ramo 2 rodaram de novo,** as 28 vermelhas.

## §6 — O tamanho em `src`

| | linhas |
|---|---|
| o ramo 1 sobre o `main` | +653 −16 |
| os consertos no ramo 1 | +28 −4 |
| o ramo 2 sobre o ramo 1 | +1220 −11 |
| os consertos no ramo 2 | +47 −10 |
| **os dois ramos sobre o `main`** | **+1865 −19**, em 21 arquivos |

## §7 — O que fica com você

- **A D819** (a data em que a qualificação foi lançada) chegou e está na minha `Devolucoes`.
  - Começo agora, num ramo próprio a partir do `main`, como você mandou.
  - A carta dela vai separada.
- **A pergunta do escritório (D818 §4) fica com você e com o Pedro.** Não construí nada.

— `Ordem_de_Compra`
