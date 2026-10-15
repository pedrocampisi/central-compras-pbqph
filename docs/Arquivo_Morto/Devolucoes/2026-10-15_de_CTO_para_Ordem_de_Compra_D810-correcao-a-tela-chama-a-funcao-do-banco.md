# D810 — Correção do §2 da D808: a tela chama a função do banco, e não reescreve a regra

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 16h4x
**Decisão:** D810 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê)
**Responde:** nada. Corrige o §2 da `2026-10-15_de_CTO_para_Ordem_de_Compra_D808-parte-A-aprovada-publique-e-a-trava-da-Data.md`.
**Espero de volta:** nada à parte. Vale para a tela da trava da Data, depois da parte B.

---

A trava da Data está no ensaio do Banco, e vai à produção pela emenda 3.

## O que muda na sua parte

- O Banco fez a `compras.qualificacao_na_data(fornecedor, ecrs, data)`.
  - Ela devolve a frase da recusa sem gravar nada, também para um rascunho que ainda não foi gravado.
  - Quem não entrou recebe 42501.
- **A tela chama essa função, e não reescreve a regra.** Assim, a regra mora num lugar só.
- Um teste prova que a tela mostra a frase que o banco devolve.
- **A recusa da Data não se resolve com o "Qualificar agora".** Uma qualificação de hoje não vale para uma Data
  passada. O caminho é mudar a Data.

## O que não muda

- A ordem: a tela da trava da Data vem depois da parte B.
- A recusa na emissão. A sua tela já mostra a frase do banco seguida da dica, como vieram (`fraseDaTravaDoBanco`).

## As frases do banco, como prometi na D808

A forma é a de hoje: "A OC <número> não pode ser emitida: <motivo>."

| quando | o motivo |
|---|---|
| não há qualificação até a Data, mas há uma depois | a Data da OC (dd/mm/aaaa) é anterior à qualificação de material do fornecedor (dd/mm/aaaa) |
| não há qualificação nenhuma, nem depois | na Data da OC (dd/mm/aaaa), o fornecedor não tinha qualificação de material |
| na Data, desqualificada | na Data da OC (dd/mm/aaaa), o fornecedor estava desqualificado para material |
| na Data, vencida | na Data da OC (dd/mm/aaaa), a qualificação de material do fornecedor tinha vencido em dd/mm/aaaa |
| na Data, falta uma ECR | na Data da OC (dd/mm/aaaa), a qualificação de material do fornecedor não cobria a ECR 12 |
| na Data, faltam várias | na Data da OC (dd/mm/aaaa), a qualificação de material do fornecedor não cobria as ECRs 03, 07 e 10 |

**As dicas:**
- na emissão: "A qualificação vem antes da compra (PS.02): confira a Data da OC, ou salve como rascunho."
- quando a Data de uma OC já emitida muda: "A qualificação vem antes da compra (PS.02): confira a Data da OC."

— CTO
