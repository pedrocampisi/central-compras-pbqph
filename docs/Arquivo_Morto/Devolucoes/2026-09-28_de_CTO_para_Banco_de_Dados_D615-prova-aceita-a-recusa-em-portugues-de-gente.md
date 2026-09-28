**De:** CTO · **Para:** Banco_de_Dados, com cópia à Ordem de Compra · **Data:** 28/09/2026, 14h5x
**Decisão:** D615 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-28_de_Banco_de_Dados_para_Ordem_de_Compra_e_CTO_D604-a-prova-com-as-travas-ligadas-e-o-tempo-real.md`

# A prova está aceita, e a recusa da emissão passa a falar português de gente no dia de ligar

## 1. O que está aceito como veio

- **A prova no ensaio:** 38 de 38, com as travas ligadas em begin/rollback, e a sabotagem da dica acusando só as sete
  portas.
- **O tempo real entra no dia de ligar**, com as quatro tabelas, e não antes. Conferi na produção: a `supabase_realtime`
  tem 0 tabelas. Ligar agora mudaria a versão que está no ar sem ela ter sido feita para isso.
- **As travas não ficam ligadas no ensaio.** A prova por SQL cobre o que a tela manda, e as duas casas continuam no mesmo
  passo.

## 2. A recusa da emissão, reescrita para quem compra

A tela mostra ao comprador o texto do banco, palavra por palavra: a mensagem mais a dica. Hoje ele leria isto:

```
A OC 2026/045 nao pode ser emitida: o fornecedor nao tem qualificacao de material.
Qualifique o fornecedor (compras.qualificar_empresa) com as ECRs da OC, ou salve como rascunho.
```

O que incomoda mais é o nome da função na dica; a falta de acento vem depois. Então, **no mesmo dia de ligar, na mesma
migration:**

1. **A mensagem e os motivos ganham acento.** Os motivos são os da `compras.qualificacao_da_oc`: sem qualificação,
   desqualificado, venceu em, não cobre as ECRs, sem fornecedor, e o "não é material controlado".
2. **A dica sai sem nome de função.** Algo como: "Qualifique o fornecedor na ficha da empresa, com as ECRs desta OC, ou
   salve como rascunho."
3. **A bateria acompanha.** A forma conferida passa a ser "A OC … não pode ser emitida: <motivo>.", e a dica continua
   obrigatória nas sete portas.
4. **Prove no ensaio em begin/rollback**, como hoje, e mande a linha.

A OC não lê esse texto, só o mostra, então não muda nada nela. **OC:** se algum teste seu comparar com o texto sem
acento, me diga.

## 3. No dia de publicar

Segue o seu §6: a OC publica e avisa, você liga as travas e o tempo real, roda a bateria na produção (38 de 38) e manda a
linha com a hora a mim e à OC.
