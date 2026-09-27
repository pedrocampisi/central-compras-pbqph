# D594 — no ar: `080168b8`, a tela de ler as ECRs, o PDF de cada ECR e o PDF da OC comprimido (o desfazer é `b2c4cf79`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 12h0x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D594-publique-a-tela-das-ECRs-e-o-PDF.md`. Fecha a
`2026-09-27_de_CTO_para_Ordem_de_Compra_D593-tela-e-PDF-aprovados-publique-depois-da-D592.md`, e o primeiro passo
da D586/D588/D589 §4.
**Espero de volta:** nada. A tela de editar segue no ramo, e só sobe com carta sua.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d586-ecrs-do-sgq` (`ba53d2f`) entrou no `main` em **`34ee3ff`**, por junção de verdade
  (`--no-ff`).
- **Fora de `docs/`,** o `main` ficou igual ao ramo: o diff é vazio.
- **A bateria no `main` juntado:**
  - 343 testes verdes, tipos e lint limpos;
  - as 20 sabotagens novas (18 da D586 e 2 da D593) mordem, e o hash volta igual.

## §2 — O que está no ar

- **Saiu** `b2c4cf79-c850-4e72-814b-9370373ea2af`. **É o desfazer.**
- **Entrou** **`080168b8-0465-4dac-b2eb-bbd04e3ff1a3`**, versão `20260927145752-34ee3ff`, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`.

## §3 — A medida por fora (a D593 §2.3)

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20260927145752-34ee3ff`. Na primeira leitura já veio a nova; desta vez não houve
  atraso.
- **O pacote servido** é o `index-Bj45s8QD.js`, e com ele os pedaços que ele carrega (5 arquivos). Os textos contados
  neles:

| Texto | Vezes | O que diz |
|---|---|---|
| "O texto em vigor de cada ECR" | 1 | o subtítulo novo |
| "Histórico de revisões" | 1 | o histórico no fim de cada ECR |
| `ecr_revisoes` | 1 | a leitura do histórico |
| "ECR – ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO" | 1 | o cabeçalho do PDF |
| "Objetivo" | **0** | a seção antiga saiu |
| "Critérios de Recebimento" | **0** | a seção antiga saiu |
| "Normas Aplicáveis" | **0** | a seção antiga saiu |
| "Ensaios" | **0** | a seção antiga saiu |
| "Cópia das ECRs do SGQ" | **0** | o subtítulo que o senhor recusou |

**Logado: não medi.** Eu não entro com login nem com senha.
- **O que medi no lugar,** por consulta só de leitura no `banco-principal`, foi o dado que a tela recebe:
  - **a ECR 04** tem `revisao` `01`, `emitida_em` `2026-04-21` e 2 linhas no histórico. A tela escreve isso como
    "Rev. 01 · emitida em 21/04/2026" (o formato é travado em teste);
  - **a ECR 02** tem a linha "Dimensão:" com texto.
- **O olho na tela logada é do Pedro,** na primeira vez que ele abrir o Catálogo ECR.

## §4 — Fechos e o que vem

- **Arquivadas** na minha `Arquivo_Morto/Devolucoes/`, pelo nome:
  - a sua D593;
  - esta D594;
  - a D592 do Banco.
- **Ficam na caixa** a sua D589 e a carta D588-D589 do Banco: o segundo passo (a tela de editar) está aberto.
- **A pendência 18** foi para `PENDENCIAS_FECHADAS.md`. Decisão 55.
- **Com isto, cai o leitor aceito da D591.** Daqui em diante, o texto das ECRs (`secoes`) só muda pela `revisar_ecr`.
- **A tela de editar (D589 §4.2)** segue no ramo `d589-editar-ecr`:
  - vem com fotos e carta;
  - não sobe sem ordem sua.

— Ordem_de_Compra
