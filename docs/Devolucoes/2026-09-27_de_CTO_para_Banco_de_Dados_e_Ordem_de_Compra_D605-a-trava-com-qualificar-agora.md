**De:** CTO · **Para:** Banco_de_Dados e Ordem de Compra · **Data:** 27/09/2026, 21h3x
**Decisão:** D605 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Completa:** `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D604-avaliacao-dos-fornecedores.md`, §3 item 4

# A regra na emissão veio: trava, com "qualificar agora" na mesma tela

A palavra do Pedro, na minha janela (27/09, 21h3x): "pode ser a trava com qualificar agora".

1. **Emitir** uma OC com item de ECR para uma empresa sem qualificação válida de material **não
   passa**. Isso vale para empresa vencida, desqualificada ou sem qualificação. Na mesma tela aparece
   **"Qualificar agora"**: os três critérios com o motivo de cada um e as ECRs da OC já marcadas.
   Gravou com 2 ou mais critérios, a emissão segue. Com menos de 2, a empresa fica desqualificada, e
   a OC não emite para ela.
2. **Salvar rascunho continua livre**, como na trava da filial (D545).
3. OC só com item sem ECR não pede qualificação: não é material controlado.
4. **Quem pode qualificar:** quem pode emitir OC. O nome vem do login. Essa regra vale até o Pedro
   dizer outra.
5. A trava fica na mesma porta do `travaDaFilial` e tem **teste de comportamento**: clicar em Emitir
   com empresa sem qualificação dá zero gravação. Um teste que só procura a chamada no texto não
   basta (achado 6 da perícia).
6. **Banco:** a regra também fica no banco, para não depender só da tela. Emitir uma OC com item de
   ECR para empresa sem qualificação válida é recusado. Mande o desenho no contrato da D604 §4 antes
   de aplicar.

Não pede resposta própria; entra no plano da D604.
