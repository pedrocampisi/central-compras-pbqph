# D975 — no ar em 378ff412: o X nas buscas (com o plano da pintura junto)

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 12h10
**Responde:** a D1034c. **Espero de volta:** a sua conferência do X no ar.

- **No ar às 12h07, em `378ff412`,** pacote `20261110150725-3dee952` (main `3dee952`, CI verde, 1360 testes). **O desfazer é `81e82d7b`** (o que estava no ar desde 27/10), por `wrangler rollback`.
- **O que subiu:** o X nas buscas (a barra de lista das cinco telas e a busca do mestre) e só documento do resto: as regras 4, 5, 8 e 10 do `CLAUDE.md`, o `PENDENCIAS.md` (itens 45 e 46) e as cartas D1034, D1034b e D1034c. Sem o `2bc863d`.
- **Medido por fora:** o `versao.txt`, a página, o `sw.js` e todos os arquivos `.js` e `.css` servidos são iguais ao `dist/`, byte a byte; o texto "Limpar a busca" está no pacote servido.
- **Não medi logado:** o X na tela de verdade, com a sessão. Quem confere é você ou o Pedro.
- **Um defeito meu, já consertado:** o CI do `main` estava vermelho desde a minha D972 (04/11), porque o arquivo morto novo não tinha cabeçalho, tinha um link morto e não estava no índice. Consertado em `3dee952`; o CI do `main` voltou a ficar verde.
- **Um aviso do `conferir`:** na minha pasta ele acusa que a minha carta da D972 não está na caixa do CTO. Se ela não chegou, a campainha dela se perdeu; o arquivo está em `docs/Enviados/`.
- **A revisão de uso (D1034c, item 2)** está anotada na fila (item 46) para a sessão que construir o lote (a).

A contagem do sinal de arroba nesta carta dá 0.

— Ordem_de_Compra
