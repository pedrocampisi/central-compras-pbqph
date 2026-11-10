# D975 — o X nas buscas da OC, no ramo, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 08h42
**Responde:** a D975. **Nada na produção.** A publicação espera a sua campainha, depois das 19h.
**Nenhum dado de cliente, obra ou pessoa nesta carta nem nas fotos:** empresas inventadas.

## §1 — Os campos de busca da OC
1. **A barra de lista** (`ListToolbar`): um componente só, usado em Histórico, Fornecedores, Obras, Catálogo e Qualificação. O X entrou nele, então vale nas cinco telas.
2. **A busca do mestre** ("Procurar a empresa", `MaterialAChegar`).
3. **Não entrou, de propósito:** o `CampoPesquisavel` (Obra e Fornecedor da Nova OC, filtro do Histórico). É uma lista de escolha que mostra a escolha feita, então o X ali apagaria a escolha, e não um texto de busca. Já tem a opção "vazia" no topo para desfazer. Se o Pedro quiser o X também nele, diga.

## §2 — O que o X faz (igual à Central)
Um componente novo, `CampoDeBusca`: o X só aparece com texto; o clique apaga tudo, devolve a lista inteira e o cursor ao campo; o Esc dentro do campo faz o mesmo. É `<button type="button">` de 32 px, com o nome "Limpar a busca"; o X nativo do `type="search"` fica escondido.
Na tela do mestre, quando nenhuma empresa casa, passam a existir dois botões "Limpar a busca" (o X e o link da frase); o teste antigo pega o link.

## §3 — A prova
- **Ramo `d975-x-na-busca`, commit `2417c4e` (código) e o das fotos, sem publicar.** 7 testes novos: 6 em `CampoDeBusca.test.tsx` e 1 em `MaterialAChegar.test.tsx`. A bateria tem 1360 testes verdes, com `typecheck` e `eslint` limpos.
- **A trava reprova antes:** 7 de 7 sabotagens ficam vermelhas (X sempre visível, sem devolver o cursor, sem Esc, X nativo aparecendo, alvo de 20 px, limpa só um pedaço, botão `submit`).
- **O "ensaio":** a prova de tela foi numa página de prova com o banco falso, como as fotos de sempre. Não entrei logado no ensaio, e não peço login ao Pedro para isto.
- **Fotos** em `docs/Capturas/2026-11-10_D975/`, a 1366 e a 375: a barra de lista (vazia e com texto) e a busca do mestre (vazia e com texto). A 375 o X cabe sem rolagem de lado. A página de prova foi apagada depois.

## §4 — Um erro meu, já consertado
Na rodada das sabotagens, apaguei sem querer o `node_modules` por uma junção que eu tinha criado na cópia isolada. Refiz com `pnpm install --frozen-lockfile --offline`, do lockfile e do cache, sem baixar nada. A bateria roda inteira de novo. O código não foi tocado.

## §5 — Espero de você
A ordem de publicar (emenda 3). A D1018 (o ponteiro do padrão novo) continua só no commit local da `main`, sem push, e sobe na mesma subida.

A contagem do sinal de arroba nesta carta dá 0.

— Ordem_de_Compra
