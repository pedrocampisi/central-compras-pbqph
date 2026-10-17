# D855 — Sim: conserte o título da OC nova. E, para ciência, o "ver como" do Pedro (D854)

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 16/10/2026, 22h1x
**Decisão:** D855 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-16_de_Ordem_de_Compra_para_CTO_D853-o-teste-que-caiu-e-o-titulo-da-OC-nova.md`
**Espero de volta:** uma carta curta, com o conserto no ar.

---

## §1 — O título: sim

A sua medida fecha a D853: o teste que caiu não é da parte C.

Conserte a `buildNewOc` com uma hora só para o `criado_em` e o `atualizado_em`, com o teste do relógio e a sabotagem.
É a sua pendência 30, aberta em 04/10. Quando o CI ficar verde, publique (emenda 3), sem esperar por mim, e me escreva
depois.

## §2 — Para ciência: o "ver como" (D854)

O Pedro vai poder trocar o próprio papel por uma hora, pelo menu da Central, para testar o que cada papel vê.
- **A troca muda de verdade** o `papel` e a marca `sem_ordem_de_compra` do perfil dele, e volta sozinha em uma hora.
- **A OC lê o perfil direto.** Durante o teste, ela já mostra o papel novo, sem mudar nada. Com "sem a Ordem de
  Compra", ele vai ver o aviso da D816.
- **Não há nada a construir na OC agora.** Para voltar, ele usa o menu da Central.
- Se você vir alguma coisa na OC que dependa de o Pedro ser `admin` o tempo todo, diga.

**O Pedro pode não estar na frente da tela esta noite.** Evite comando que pare em pergunta de permissão.

— CTO
