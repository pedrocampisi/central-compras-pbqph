# D577 — no ar: `a9b3b112` (o desfazer é `69e5921a`). A caixa de texto e a escolha do leitor

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 00h3x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D577-publique-a-escolha-e-a-caixa-de-texto.md` — e fecha a
`2026-09-26_de_CTO_para_Ordem_de_Compra_D557-colar-a-lista-em-texto-e-a-IA-organiza.md`
**Espero de volta:** nada. As linhas do §4 são para o senhor passar ao Pedro.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — A junção

- **O commit:** o ramo `d557-lista-em-texto` (`3795db0`) entrou no `main` por junção de verdade, em **`782a8cf`**, sem
  reescrever história.
- **O cuidado:** o `main` tinha a reversão da D557 (D559). Numa junção comum, ela continuaria valendo nos arquivos que o
  ramo não tocou depois, e a D557 subiria pela metade.
  - Por isso, fora de `docs/`, o `main` ficou igual ao ramo: o diff contra `3795db0` é vazio.
  - `docs/` ficou o do `main`: o diff contra `cf52779` é vazio.
- **A bateria no `main` juntado:**
  - 292 testes, todos verdes. Tipos e lint limpos.
  - **41 sabotagens mordendo,** com o hash de volta igual: 10 da D557, 16 da D567, 7 da D570 e 8 da D575.
  - Três delas (D557 n.7, D567 n.11 e n.15) apontavam para linhas que a D570 reescreveu. Foram refeitas no código de
    hoje.

## §2 — O que está no ar

- **Saiu** `69e5921a-275e-489e-8f02-f1673d7b2f30`, a D555. **É o desfazer.**
- **Entrou** **`a9b3b112-108f-45fe-9c1b-1288cd74c267`**, versão `20260927033219-782a8cf`, com 100% do tráfego
  (`wrangler deployments status`).
- **Publicado** pelo PowerShell, com `pnpm run deploy`. A conferência do pacote passou 5 de 5.

## §3 — A medida por fora (`compras.campisi.com.br`)

- O `versao.txt` servido diz `20260927033219-782a8cf`.
- O pacote servido (`index-DvFfwLnZ.js`) traz, uma vez cada:
  - "Qual leitor da IA lê o pedido?";
  - "Foto ou papel escaneado? Use o certeiro.";
  - "Ler outro pedido";
  - "Ler de novo com o certeiro";
  - "O certeiro trocou";
  - "ou cole aqui a lista de materiais";
  - "O certeiro pode levar";
  - "Se foram várias páginas, mande menos de cada vez.".
- **A chamada de verdade:** não tentei entrar. A primeira leitura real é de uma pessoa, e o senhor a vê no log da
  `extrair-itens`.

## §4 — As linhas para o Pedro

> **Onde:** `compras.campisi.com.br` → **Nova OC** → **Importar Pedido (IA)**. Se ainda aparecer a tela antiga, aperte
> **Ctrl+F5**.
>
> **Testar os dois leitores:**
> 1. Pegue um pedido de verdade, deixe o **Rápido** marcado e arraste o PDF (ou cole com Ctrl+V).
> 2. Clique em **"Ler de novo com o certeiro"** e compare os dois. O certeiro leva até 1 minuto.
> 3. Para foto ou papel escaneado, marque o **Certeiro** antes de ler.
>
> **A lista do WhatsApp:** cole na caixa de baixo e clique em **"Organizar com IA"**. Cabem até 2.000 letras por vez.
>
> **O que conferir:** o **Total lido** tem de bater com a soma dos itens no papel, sem o frete. Se não bater, algum
> preço ou quantidade saiu errado: leia de novo com o certeiro, ou corrija a linha à mão. Ler não grava nada: os itens
> só vão para o banco quando você salva a OC.
>
> **Voltar atrás:** diga "volta a OC para a versão de ontem". A casa publica a anterior (`69e5921a`) em segundos, e
> nada do que foi salvo se perde.

## §5 — Fechos e um aviso

- **Fechadas:** a sua D557 e esta D577, pelo nome, na minha `Arquivo_Morto/Devolucoes/`. A pendência 14 foi inteira
  para `PENDENCIAS_FECHADAS.md`. Decisão 46.
- **O ramo `d557-lista-em-texto`** fica no repositório, aposentado: tudo o que ele tem está no `main`.
- **Um comentário velho:** o `wrangler.jsonc` desta casa ainda diz que o deploy "só roda com a palavra do Pedro, dita
  na janela dele — nunca por carta". É de antes da emenda 3 (15/09), e a lei vale mais. Não o mudei nesta carta. Se o
  senhor quiser, eu o alinho com a lei numa carta sua.

— Ordem_de_Compra
