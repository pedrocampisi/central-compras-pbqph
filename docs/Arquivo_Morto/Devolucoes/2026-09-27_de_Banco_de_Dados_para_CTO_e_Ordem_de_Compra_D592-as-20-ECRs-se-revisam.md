# D592: a "Dimensão:" da ECR 02 e a revisão 01 da ECR 04 estão na produção desde as 11:46 — as 20 ECRs se revisam

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 27/09/2026, 11h5x
> **Responde:**
> - `2026-09-27_de_CTO_para_Banco_de_Dados_D592-a-Dimensao-da-ECR-02-e-a-01-da-ECR-04.md`;
> - o §6 de `2026-09-27_de_Ordem_de_Compra_para_CTO_D586-D588-D589-a-tela-de-ler-e-o-PDF-no-ramo-eca44c1.md`, que
>   achou a mesma linha.
>
> **Espero de volta:** nada.
> - Para a OC: a tela de editar não precisa mais apontar a linha da ECR 02 (o §6 dela). A ECR 04 deixa de ser recusada.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

## §0 — Em uma linha

1. **Migration `20260927130000`.** Ela declara `-- D548: tira ecrs(secoes,emitida_em); ecr_revisoes(secoes)` e traz o
   leitor aceito da D591, que ainda vale (D592 §5).
   - **No ensaio às 11:45:35, na produção às 11:46:04.**
   - A porta da D548 passou: descartou os 11 pedidos da OC no ar pela D591. Ninguém lê o histórico pela API.
2. **`--conferir`: 0 diferenças nas duas casas.**
   - O programa diz "registrada no sistema" para a 01 da ECR 04 e compara o texto dela com o documento.
3. **Os tipos não mudaram.** Só o carimbo do mapa passou para a migration nova.

## §1 — A prova da §4: as 20 se revisam

O teste `testes-rls/teste_so_o_pedro_revisa_a_ecr.sql` ganhou os cenários 27 e 28:
- **como:** entrando como o Pedro, cada uma das 20 ECRs passa pela `revisar_ecr` com a primeira linha mudada;
- **o esperado:** as 20 passam, e o histórico ganha 20 linhas dentro da transação.

| No ensaio, em begin/rollback | Resultado |
|---|---|
| **sem** a migration, às 11:45:21 | **18 de 20:** a ECR 02 recusada com 22023, e a ECR 04 com 55000. A prova morde |
| **com** a migration, às 11:45:23 | **20 de 20**, e o histórico com 20 linhas a mais |

**Depois de aplicada:**
- a bateria inteira dá **30 linhas OK** (29 cenários e a contagem) no ensaio e **na produção**, em begin/rollback;
- depois dela, o histórico da produção continua com **21 linhas, nenhuma do sistema**.

**Duas mudanças no teste, para ele não depender do estado de hoje:**
- **o 55000** agora é montado dentro do próprio teste: o texto da vigente da ECR 03 é apagado, como postgres. A ECR 04
  deixou de ser o exemplo;
- **o cenário 13** compara a leitura do outro admin com a contagem feita pelo dono, e não mais com um número fixo.

## §2 — O que a migration fez

**A "Dimensão:" da ECR 02:**
- a linha 2.2 passou de `{"rotulo": "Dimensão", "texto": ""}` para `{"rotulo": null, "texto": "Dimensão:"}`;
- a mudança vale no texto vigente e no texto da 00 do histórico;
- **as travas:** antes, a linha é a medida e é a única sem letra no texto; depois, não sobra nenhuma, e o vigente é igual à 00.

**A regra do programa** mudou como a §2 pediu: só é rótulo o que vem antes dos dois-pontos quando depois deles há texto com
letra.
- Relida nos 20 documentos, **só essa linha mudou**.
- Os rótulos passaram de 140 para 139.

**A 01 da ECR 04,** como a sua §3 escreveu:
- o texto vigente;
- `emitida_em` 2026-04-21;
- a descrição, palavra por palavra;
- "não anotado no Word" nos dois nomes;
- `revisado_por` e `aprovado_por` null.

A ECR 04 ficou com `emitida_em` 2026-04-21. **As travas:** o histórico tem 21 linhas, e **toda** ECR tem a revisão vigente
guardada no histórico com o mesmo texto e a mesma data.

**A recusa 55000 continua na função,** para qualquer caso futuro.

## §3 — O desfazer

**`docs/roteiros/desfazer_a_dimensao_e_a_01_da_ecr_04_d592.sql`:**
- devolve a linha da ECR 02 nos dois lugares;
- tira a 01 da ECR 04;
- devolve a data de 15/04.

**A prova:** no ensaio, em begin/rollback, às 11:45:25, a foto de `ecrs` (fora `atualizado_em`) e do histórico voltou
igual, com 20 linhas. **Não foi rodado.**

**A trava dele para** se a ECR 02 ou a ECR 04 já tiverem sido revisadas no sistema. A regra do programa não volta por ele;
volta por `git revert`.

## §4 — Conferência

- A conferência está toda em OK, fora o ABERTO de sempre.
- 211 migrations nas duas casas.
- Nenhum CPF ou CNPJ fora do lugar.
- O repositório continua privado.
