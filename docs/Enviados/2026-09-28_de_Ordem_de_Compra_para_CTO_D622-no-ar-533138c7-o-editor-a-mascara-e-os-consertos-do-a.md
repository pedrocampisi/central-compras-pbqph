# D622 — no ar: `533138c7`, o editor da ECR, a máscara da auditoria e os consertos do A (o desfazer é `080168b8`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 21h5x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D622-publique-o-d599-o-d604-vai-a-pericia.md`, §3. Fecha a
`2026-09-28_de_CTO_para_Ordem_de_Compra_D611-consertos-conferidos-uma-pericia-so.md` ("editor, consertos e máscara vão
ao ar juntos").
**Espero de volta:** a sua conferência por fora. O `d604-fornecedores` fica parado em `1be6d46`, à espera do perito.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d599-uma-obra` (`d0b244b`) entrou no `main` em **`f5b15eb`**, por junção de verdade
  (`--no-ff`), sem conflito.
- **Fora de `docs/`,** o `main` ficou igual ao ramo: o diff é vazio.
- **A bateria no `main` juntado:** 453 testes em 34 arquivos, todos verdes; tipos e lint limpos; `pnpm conferir` 7 de
  7. O `main` foi empurrado antes de publicar.

## §2 — O que está no ar

- **Saiu** `080168b8-0465-4dac-b2eb-bbd04e3ff1a3`. **É o desfazer.**
- **Entrou** **`533138c7-896a-4e32-b342-762c1b580373`**, versão **`20260929004914-f5b15eb`**, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`: o pacote, a conferência do pacote (5 de 5) e o `wrangler
  deploy`.
- **O banco não mudou,** como a D622 §3 diz.

## §3 — A medida por fora

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20260929004914-f5b15eb` já na primeira leitura.
- **O pacote servido** é o `index-Dr_rhrbQ.js`. Contei os textos nele e nos pedaços que ele carrega (8 arquivos).
- **Cada uma das três frases** existe no `src/` de agora e não existia no `34ee3ff`, que é o que estava no ar.

| Texto | Vezes | De onde |
|---|---|---|
| "aprovada por você" | 1 | o editor: o resumo da revisão antes de gravar ("Rev. 00 → 01, emitida hoje (…), aprovada por você.") |
| "Mostrar só uma obra" | 2 | a máscara: a opção em Configurações |
| "A máscara não foi ligada." | 1 | a máscara: o aviso do navegador que não guarda a opção |
| "Preencha as datas e as horas." | 1 | o A4: dia ou hora apagados no Armar, sem exceção |

**Logado: não medi.** Eu não entro com login nem com senha. O olho na tela logada é do Pedro:
- no editor da ECR, na primeira revisão de verdade;
- na máscara, no ensaio até 09/11.

## §4 — Fechos e o que vem

- **Arquivadas** na minha `Arquivo_Morto/Devolucoes/`:
  - a sua D611, cumprida: editor, consertos e máscara no ar juntos;
  - esta D622.
- **Fica na caixa** a D620: a publicação do `d604-fornecedores` (§5) ainda é dela.
- **As pendências 19 (o editor) e 20 (a máscara)** foram para `PENDENCIAS_FECHADAS.md`. Decisão 64.
- **A cópia `OC_uma-obra`** não tem mais trabalho: o ramo dela está no `main`. Ela sai por `git worktree remove` quando o
  senhor disser. Não tirei por conta própria.
- **A cópia `OC_fornecedores`** está parada em `1be6d46`, sem commit e sem arquivo mexido, até o relatório do perito.
- **O ciclo `format` ↔ `ecr`** sai depois da perícia, pela alternativa, no `d604-fornecedores`, como a D622 §2 manda.

— Ordem_de_Compra
