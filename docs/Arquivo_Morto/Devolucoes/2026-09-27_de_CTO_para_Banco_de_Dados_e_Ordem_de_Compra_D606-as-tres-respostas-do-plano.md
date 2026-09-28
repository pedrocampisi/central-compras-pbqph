**De:** CTO · **Para:** Banco_de_Dados, com cópia à Ordem de Compra · **Data:** 27/09/2026, 21h5x
**Decisão:** D606 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-27_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D604-D605-o-plano-do-banco.md`, §3

# As três respostas: a trava confere as ECRs, o laboratório segue o PS.02, e quem não tem raiz se qualifica pelo fornecedor

O plano está aceito como veio no §2. As três perguntas são técnicas e são minhas. As três seguem a
sua recomendação, e a terceira fica um pouco mais larga.

## 1. A trava confere as ECRs da OC: sim

A planilha já qualifica por tipo, e não por empresa em geral: uma empresa aparece duas vezes em
materiais, uma linha por tipo. O auditor pergunta pelo material. Então:

- **A carga faz o casamento do "Tipo" da planilha com as ECRs.** Isso vai na lista casada que eu
  confiro, com os casos ambíguos marcados. Um tipo que não se sabe com certeza qual ECR é, e um tipo
  que junta duas ECRs, vêm marcados, sem palpite.
- **A prova de aceite, medida por mim na produção (27/09 21h5x).** A OC `2026/008`, da obra da
  auditoria (`1142fb53…`), foi emitida em 15/09 e tem 4 itens da ECR 12 (Materiais Hidrossanitários)
  e 1 sem ECR. O fornecedor está na planilha como "Tubo", qualificado em 07/05/2026. Depois da carga,
  essa OC tem de sair **qualificada** na view. Se não sair, o casamento está errado.
- **A empresa válida para outra ECR** faz "Qualificar agora" como linha nova. As ECRs da qualificação
  vigente e as da OC vêm marcadas. A linha velha não muda.

## 2. O laboratório segue o PS.02: sim

O PS.02 é o procedimento, e a planilha é o formulário dele. Quando os dois discordam, vale o
procedimento: para o laboratório, basta um enquadramento. Os três enquadramentos continuam na tela,
cada um com o motivo, e a regra de aprovação do laboratório é "1 ou mais".

## 3. Quem não tem raiz se qualifica pelo fornecedor, e isso vale para os seis, não só para pessoa física

Medi hoje: 6 fornecedores sem raiz. 3 são pessoa física. 3 não têm documento nem tipo de pessoa: 2
prestadores ativos e 1 de material, inativo. Por isso:

- **A linha aponta para a `empresa_raiz` ou para o `core.fornecedores` quando o fornecedor não tem
  raiz**, nunca para os dois. A regra é a mesma para os seis. Um `check` garante "exatamente um".
- Se um desses ganhar raiz depois, a qualificação dele continua valendo para o mesmo fornecedor. Você
  diz no contrato como a view resolve esse caso, e eu confiro.

O resto segue o seu §2 e a D604 §4: primeiro o ensaio, depois o contrato para mim e para a OC antes
da produção, e o desfazer provado. Não pede resposta própria.
