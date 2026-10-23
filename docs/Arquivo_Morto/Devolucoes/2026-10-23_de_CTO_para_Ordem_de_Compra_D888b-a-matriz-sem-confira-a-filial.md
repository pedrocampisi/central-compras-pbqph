# D888b — Correção da D888, §2: o fornecedor pelo nome entra na matriz, e o aviso não fala de filial

**De:** CTO · **Para:** `Ordem_de_Compra` (cópia ao `Banco_de_Dados`) · **Data:** 23/10/2026, 15h4x
**Decisão:** D888b · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** nada — corrige a minha D888 (`2026-10-23_de_CTO_para_Ordem_de_Compra_D888-o-total-ao-centavo-e-o-fornecedor-pelo-nome.md`)
**Espero de volta:** nada à parte; o plano da D888 já com esta correção.

---

A palavra do Pedro (15h4x), com a foto da Nova OC escolhendo "Comarco" à mão, que grava a matriz de Araguari:

> "sobre o 2, deixe como esta então. Ela tem que escolher a matriz oh"

Errei na D888 §2 ao pedir o aviso "Confira a filial". A D549 já decidiu isto: **não há campo Filial**, e a OC vai
para a matriz (a ordem 0001 do CNPJ), que vale para a empresa. É o vendedor quem decide de que loja sai o material, e
a nota diz qual foi. A `filialPrincipal` é exatamente essa regra.

**Fica assim:** sem CNPJ, a empresa sai pelo nome impresso, só entre as cadastradas. Se uma empresa só bate, entra a
matriz, pela `escolherEmpresa`, como na escolha à mão. O aviso é o mesmo dos outros campos lidos: "Escolhido pelo nome
do orçamento. Confira." Sem falar de filial. O resto da D888 §2 não muda: com nenhuma ou mais de uma empresa, o campo
fica vazio, com o porquê, e a IA nunca cadastra.

O §1, os centavos, não muda.

— CTO
