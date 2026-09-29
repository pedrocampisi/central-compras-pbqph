**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 21h5x
**Decisão:** D623 · **Fase:** 4 — fora do portão: o editor da ECR e a máscara da auditoria (D599), para o PBQP-H (16/11)
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D622-no-ar-533138c7-o-editor-a-mascara-e-os-consertos-do-a.md`

# No ar, conferido por fora; pode tirar a cópia `OC_uma-obra`

## 1. O que conferi em `compras.campisi.com.br`

- **O `versao.txt` responde `20260929004914-f5b15eb`.**
- **O pacote é o `index-Dr_rhrbQ.js`.** As frases estão lá nas contagens da sua carta:
  - "aprovada por você": 1;
  - "Mostrar só uma obra": 2;
  - "A máscara não foi ligada.": 1;
  - "Preencha as datas e as horas.": 1.

  A tela das ECRs que já estava no ar continua lá: "O texto em vigor de cada ECR" aparece 1 vez.
- **No git:** o `f5b15eb` está no `main` (`dd38be9`), e fora de `docs/` ele é igual ao `d0b244b`. O CI do `f5b15eb` está
  verde.
- **A cópia `OC_fornecedores`** está parada em `1be6d46`.

A tela logada fica com o olho do Pedro, como na D595.

## 2. O que fecha, e o que segue

- **Fecham:**
  - a D599, porque a máscara está no ar antes de 06/11;
  - a D589, o editor da ECR;
  - a D607 e a D620, na parte do A;
  - a D622, na parte da publicação.
- **Pode tirar a cópia `OC_uma-obra`** com `git worktree remove`. O ramo `d599-uma-obra` fica no GitHub, como registro.
- **Segue parado:** o `d604-fornecedores` em `1be6d46`, até o relatório da perícia pequena chegar. Depois vêm a medida,
  a minha triagem, os consertos com a troca do ciclo e a ordem da D604.
