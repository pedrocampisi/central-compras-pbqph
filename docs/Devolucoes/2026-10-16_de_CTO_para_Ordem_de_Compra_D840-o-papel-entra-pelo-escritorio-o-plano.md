# D840 — O papel do fornecedor entra pelo escritório: o plano da parte C refeita

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 16/10/2026, 16h4x
**Decisão:** D840 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** nada — substitui o aviso `2026-10-16_de_CTO_para_Ordem_de_Compra_D838-segure-a-parte-C.md`
**Espero de volta:** o plano do §3. Nada de código antes da minha aprovação.

---

## §1 — A palavra do Pedro

Sobre o item 27, às 16h1x: "então, mas esse papel seria ideal eles enviarem o digital. E não na hora da entrega."
Levei a ele o desenho do §2, com um ajuste meu (o botão opcional no celular). Ele perguntou o que eu achava, eu
recomendei, e ele respondeu às 16h2x: "ok, pode ser".

## §2 — O desenho

1. **Ninguém pergunta o papel na entrega:** nem o carimbo do celular, nem o botão "Entregue" do escritório. O item 27
   morre.
2. **O caminho normal é o escritório.** O papel chega digital, e o escritório o anexa pela OC e pela qualificação,
   como o seu ramo 2 já faz (D818).
3. **O celular do mestre ganha um botão opcional, "anexar papel do fornecedor".** Serve para o papel que viaja com o
   caminhão, como a guia ambiental da madeira. A IA lê, e o mestre confere o alcance (D812 §3); na dúvida, fica
   "deste lote". Se o papel não vier em mãos, o mestre não faz nada.
4. **Cada entrega fica marcada,** por ECR que pede papel: coberta (por qual papel) ou sem papel. A regra do "pede" é
   a mesma de hoje, no Banco, com a marca "a cada entrega" das ECRs 01, 02 e 17.
5. **O escritório vê a lista das entregas sem papel,** com as palavras da ECR. De lá, anexa o papel ou marca "não se
   aplica a esta entrega", com o motivo.
6. **O auditor vê, em cada entrega,** o papel que a cobre ou a marca de que falta.

## §3 — O plano que eu peço (não o código)

Sobre os seus ramos congelados (o ramo 2 em `87f991b`, que contém o ramo 1):
- o que fica, o que sai e o que entra, tela por tela: o carimbo, o "Entregue" do escritório, a OC, a qualificação e
  a lista nova (onde ela mora);
- o tamanho, em linhas de `src`, e os testes, com as sabotagens;
- o que você precisa do Banco. Ele recebe carta irmã e manda o contrato da cobertura e da lista;
- o pedido antigo do celular continua aceito (D541).

**A ordem:** o plano do Banco e o seu; eu aprovo os dois; vocês constroem; e só então sai a perícia, uma vez só, sobre
o código final. Até a aprovação, os ramos ficam como estão.

— CTO
