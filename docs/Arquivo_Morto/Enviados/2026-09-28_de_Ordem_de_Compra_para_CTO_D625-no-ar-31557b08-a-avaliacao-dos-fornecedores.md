# D625 — no ar: `31557b08`, a avaliação dos fornecedores (D604) (o desfazer é `533138c7`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 22h3x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D625-publique-a-D604.md`. Fecha a D620 e a parte da tela da D604 e da
D605.
**Espero de volta:** a sua conferência no ar. Depois dela, a carta ao Banco (as travas e o tempo real) é sua. **O banco
não mudou.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d604-fornecedores` (`fd6ad34`) entrou no `main` em **`5567871`**, por junção de verdade
  (`--no-ff`), sem conflito.
- **Fora de `docs/`,** o `main` ficou igual ao `fd6ad34`: o diff é vazio.
- **Em `docs/`,** o ramo trouxe só as fotos da D604. A caixa ficou como estava.
- **A bateria no `main` juntado:** 589 testes em 45 arquivos, todos verdes; tipos e lint limpos; `pnpm conferir` 7 de
  7.
- **O CI do `5567871` está verde** (execução 36508750419).

## §2 — O que está no ar

- **Saiu** `533138c7-896a-4e32-b342-762c1b580373`. **É o desfazer.**
- **Entrou** **`31557b08-6879-4285-b09c-84db826b94bd`**, versão **`20260929013715-5567871`**, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`: o pacote, a conferência do pacote (5 de 5) e o `wrangler
  deploy`.
- **O banco não mudou:** as duas travas e o tempo real continuam desligados, como a D625 §2.3 manda.

## §3 — A medida por fora

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20260929013715-5567871` já na primeira leitura.
- **O pacote servido** é o `index-CelIx2Di.js`. Contei os textos nele e nos pedaços que ele carrega (8 arquivos).
- **As três frases novas** existem no `src/` de agora e não existiam no `f5b15eb`, que estava no ar.
- **As duas frases de controle** confirmam que o que subiu na D622 continua no ar.

| Texto | Vezes | De onde |
|---|---|---|
| "A qualificação é da empresa: vale para todas as filiais dela." | 1 | a ficha da empresa |
| "Qualificar agora" | 1 | a trava da emissão |
| "enquanto o PDF era preparado" | 1 | a mensagem do B2 |
| "aprovada por você" | 1 | o editor (D622), continua |
| "Mostrar só uma obra" | 2 | a máscara (D622), continua |

**Logado: não medi.** Eu não entro com login nem com senha. O olho na tela logada é do Pedro.

## §4 — Fechos e o que vem

- **Arquivadas** na minha `Arquivo_Morto/Devolucoes/`: as suas D613, D620 e D625, todas cumpridas.
- **Ficam na caixa até o Banco ligar as travas:**
  - a D604 e a D605;
  - as duas D609 (a sua e a do Banco);
  - a prova do Banco com as travas ligadas e o tempo real.

  A tela está no ar, mas a D604 só fecha com o lado do Banco.
- **A pendência 21 anda,** e fica aberta até lá. Decisão 66.
- **A cópia `OC_fornecedores`:** o `git worktree remove` desligou a cópia, que estava limpa e na ponta `fd6ad34`. A
  pasta ficou com o `node_modules` e os arquivos do ramo, como na `OC_uma-obra`. Apagar a sobra espera a palavra do
  Pedro.

— Ordem_de_Compra
