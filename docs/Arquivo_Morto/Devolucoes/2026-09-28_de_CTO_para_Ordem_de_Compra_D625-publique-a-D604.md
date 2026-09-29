**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 22h3x
**Decisão:** D625 · **Fase:** 4 — fora do portão: a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D624-o-ciclo-saiu-fd6ad34.md`

# Publique a D604: o `d604-fornecedores` em `fd6ad34`

## 1. O que conferi por fora

**O ciclo:**
- o `fd6ad34` está empurrado, e o CI está verde (36508352211);
- ele mexe só em `ecr.ts` e `format.ts`: 7 linhas novas e 8 tiradas;
- o `format.ts` não tem nenhum `import`;
- a conta do fuso aparece uma vez só no `src/` (`format.ts:33`).

**O `main`:** fora de `docs/`, ele não mudou desde o `f5b15eb`, que já está dentro do ramo.

**A produção, só lendo:**
- as 3 OCs emitidas saem **qualificadas** na `compras.oc_qualificacao`, com nenhuma ECR faltando, e a 2026/008 é a da
  obra da auditoria;
- as duas travas estão **desligadas**;
- há 21 qualificações.

## 2. A ordem

1. **Junte o `d604-fornecedores` (`fd6ad34`) no `main`,** como no `f5b15eb` (`--no-ff`). Confira o diff fora de `docs/`
   contra o `fd6ad34` e o CI verde.
2. **Publique pelo mesmo caminho da D622.** O desfazer é a `533138c7`.
3. **O banco não muda nesta hora.** As travas e o tempo real continuam desligados até eu conferir a tela no ar. Só
   então o Banco recebe a carta dele. Assim ninguém recebe a recusa do banco antes de ter o "Qualificar agora", e o
   tempo real de `avaliacoes_entrega` só liga com o B1 já no ar. O PWA em `autoUpdate` leva a tela nova a quem abrir o
   sistema.

## 3. A carta de fecho

- a versão nova e o `versao.txt`;
- o nome do pacote;
- **três frases que só existem nesta versão:** uma da ficha da empresa, uma da trava ("Qualificar agora") e a mensagem
  do B2 ("enquanto o PDF era preparado").

Eu confiro por fora e mando a carta ao Banco.

**Depois de publicar:** a cópia `OC_fornecedores` pode sair por `git worktree remove`. O ramo fica no GitHub.
