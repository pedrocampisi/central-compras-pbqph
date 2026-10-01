# D659 — no ar: `8d25ed4b`, o PDF com o quadro da nota (o desfazer é `69af6378`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 01/10/2026, 09h1x
**Responde:** `2026-10-01_de_CTO_para_Ordem_de_Compra_D659-o-pdf-da-nota-aprovado-publique.md`.
**Espero de volta:** a sua conferência por fora.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d655-pdf-obra-na-nota` (`893e411`) entrou no `main` em **`9ee32a3`**, por junção de verdade
  (`--no-ff`), sem conflito.
- **Fora de `docs/`,** o `main` ficou igual ao `893e411`: o diff é vazio.
- **A bateria no `main` juntado:**
  - 630 testes, todos verdes;
  - tipos e lint limpos;
  - `pnpm conferir` 7 de 7.
- **O CI do `9ee32a3` está verde** (execução 36860059485).
- **As suas duas respostas do §5** (a linha do cuidado só para empresa, e o lembrete azul fica) já eram o que estava
  no ramo. Nada mudou.

## §2 — O que está no ar

- **Saiu** `69af6378-61d2-44a6-aebc-7a15d436e972`. **É o desfazer.**
- **Entrou** **`8d25ed4b-0379-45da-8aa3-b2e4515f78ae`**, versão **`20261001121218-9ee32a3`**, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`, às 09h13 de 01/10.

## §3 — A medida por fora

**Pelo endereço `compras.campisi.com.br`, sem login:**
- **O `versao.txt`** servido diz `20261001121218-9ee32a3`.
- **O pacote servido** é o `index-BqfxjSWQ.js`. Contei os textos nele e nos pedaços que ele carrega (4 arquivos).

| O que procurei | No ar | No código de antes (`340a506`) | O que prova |
|---|---|---|---|
| "PARA A NOTA FISCAL" | 3 (o título, o item 1, o lembrete) | 0 | o quadro |
| "LEIA ANTES DE EMITIR A NOTA" | 1 | — | o quadro |
| "Local de entrega: este mesmo endereço" | 1 | — | o ENTREGAR EM dentro do quadro |
| "NA NOTA FISCAL: o endereço…" | 1 | — | o lembrete do rodapé |
| "DESTINATÁRIO DA NOTA" | 1 | — | o destinatário com o título novo |
| "ENTREGAR EM" | **0** | 1 | o quadro velho saiu |
| "CNO/CEI" | **0** | 1 | a linha velha saiu |
| `cno, pasta_caminho` (a carga lê `intervencoes.cno`) | 1 | — | o CNO certo |
| "CEI / Matr" (o rótulo velho da gaveta) | **0** | 1 | a gaveta diz CNO |

## §4 — O que não medi

- **O PDF baixado do site no ar: não.** Para baixar, é preciso entrar no site, e eu não entro com senha. A sessão
  `campisi-oc` do ensaio venceu em 25/09 (pendência 13), e ainda espera o Pedro entrar uma vez.
- **A prova do PDF continua a do ramo:** o gerador desenhando os cinco casos sobre dados inventados, em
  `docs/Capturas/2026-09-30_D655/`.
- **A primeira OC emitida a partir de agora** é o PDF real. Se o Pedro mandar uma foto dela, eu confiro o quadro.
- **Logado:** não medido.
