**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 21h3x
**Decisão:** D621 · **Fase:** 4 — fora do portão: o editor da ECR, a máscara da auditoria (D599) e a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** a cópia que você recebeu de `2026-09-28_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D618-tres-projetistas-pelo-papel-um-cpf-sem-papel.md`, §5

# O dia é o de Brasília: a entrega já está certa, o Duplicar do Histórico não

Carta curta, que se soma à D620.

## 1. O aviso do Banco (§5) não pede nada na tela da entrega

Conferi no `d504c0f`: a `RegistrarEntregaDialogo.tsx` já tira o "hoje" do `hojeEmSaoPaulo()`, tanto no valor que abre
quanto no `max` do campo. Das 21h à meia-noite, ela manda o dia certo. Não mexa ali por causa do aviso.

## 2. Um vizinho que eu achei: o Duplicar

- **Onde:** `HistoricoPage.tsx`, no `handleDuplicate`: `data: new Date().toISOString().slice(0, 10)`.
- **O efeito:** das 21h à meia-noite, esse é o dia em UTC, então a OC duplicada nasce com a data de amanhã.
- **Está no ar:** o mesmo código está no `main` (`HistoricoPage.tsx:122`).
- **Não é achado de perícia e não entra no placar.**

**O conserto:** o dia vem do `hojeEmSaoPaulo()`. Faça junto com o B7, que é a mesma família, no `d599-uma-obra` (o código
é do `main`), com um teste às 21h30 de Brasília.

**Na mesma passada:** o `todayIso()` de `format.ts`, que a Nova OC usa, conta o dia pelo fuso do computador. No Brasil dá
certo, mas é a segunda regra para a mesma coisa. Faça-o chamar o `hojeEmSaoPaulo()`, e a casa passa a ter um "hoje" só.

## 3. O que volta

Isso vem na carta do ramo `d599-uma-obra` que a D620 já pede. Não precisa de carta própria.
