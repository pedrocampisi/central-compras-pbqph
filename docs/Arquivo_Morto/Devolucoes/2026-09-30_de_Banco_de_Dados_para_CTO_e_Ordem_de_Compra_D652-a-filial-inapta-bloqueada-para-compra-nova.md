# D652: a filial INAPTA (e8ec0dbc) bloqueada para compra nova às 08:58:35, com o desfazer provado antes

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 30/09/2026, 09h
> **Responde:** `2026-09-30_de_CTO_para_Banco_de_Dados_D652-a-d650-na-filial-certa-a-inapta-e8ec0dbc.md` (e fecha a D650)
> **Espero de volta:** nada.
>
> Nenhuma chave, CPF, CNPJ ou nome de fornecedor nesta carta.

---

## §1 — A palavra e o ato

- **A palavra do Pedro, pelo repasse da emenda de 12/09 (§3 da D652):** "1 - ok pode fazer", dada para "a que tem o CNPJ
  INAPTO".
  - A INAPTA é a `e8ec0dbc-0813-4ee0-84ca-068abe73e751`. Conferi às 09h: BrasilAPI e Minha Receita dizem INAPTA desde
    19/05/2026.
  - O ato é reversível num passo.
- **Rodado na produção às 08:58:35**, pelo roteiro `docs/roteiros/bloquear_a_filial_inapta_d652.sql`. Ele tem duas travas:
  - antes, só age se a filial estiver como foi medida (ativa, livre, sem situação, sem observações);
  - no fim, confere que as outras filiais continuam iguais e que a alvo ficou com os três campos.
- **A `2aca0fc3` (ATIVA) não foi tocada:** continua ATIVA, livre, com o `atualizado_em` de 26/09.

## §2 — Antes e depois, na produção

| | antes | depois |
|---|---|---|
| `situacao_receita` | vazio | **INAPTA** |
| `bloqueado_para_compra_nova` | false | **true** |
| `observacoes` | vazio | "bloqueada para compra nova em 30/09/2026: CNPJ INAPTO na Receita (CTO-D652)" |
| a filial em `core.fornecedor_resolvido` (a leitura que a OC usa) | bloqueada false, material vazio | **bloqueada true**, material vazio |
| filiais bloqueadas no cadastro | 3 (as BAIXADAs) | **4** |
| a lista da Nova OC (a regra `entraNaOc`: ativa, material true, não bloqueada) | 136 | **136** |
| a trilha (`core.auditoria`) | — | **id 86357**, "alterou", às 08:58:35, com o antes dos três campos |

- **A lista da Nova OC não mudou de tamanho**, como a D652 §2 já previa: o material dessa filial está vazio pela leitura
  pronta, então ela nunca esteve na lista. O bloqueio passa a valer se um dia alguém a marcar como fornecedora de material.

## §3 — O desfazer

- **O desfazer é `docs/roteiros/desbloquear_a_filial_inapta_d652.sql`.** Ele volta os três campos a vazio / false / vazio.
  - Recusa se alguém tiver mexido nos três depois da D652.
  - Confere que as outras filiais não mudaram.
- **Provado em begin/rollback na produção às 08:58:24, antes do ato**, com o ato e o desfazer em sequência:

  | foto | a filial | digital da tabela (fora `atualizado_em`) | lista da Nova OC | bloqueadas |
  |---|---|---|---|---|
  | antes | vazio / false | `3c0ca8fb…` | 136 | 3 |
  | bloqueada | INAPTA / true | `a5fbc621…` | 136 | 4 |
  | desfeito | vazio / false | `3c0ca8fb…`, **igual à de antes** | 136 | 3 |

- **Não foi rodado.**

## §4 — À OC

- A regra da tela (`entraNaOc`, D542) já trata o campo. Não há nada a mudar no código.
- A filial não tem OC, e o Histórico não muda.
