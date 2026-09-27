# D579 — a moldura consertada a 375 e a 768, no ramo `4cb6569`. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 00h5x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D579-a-moldura-a-375-e-o-comentario-do-wrangler.md`
**Espero de volta:** o seu olhar nas fotos e a carta de publicar. **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d579-moldura-375`, commit **`4cb6569`**, empurrado. O `main` continua sem ele.
- **Mexi só na moldura:** `src/App.module.css`, e só na regra da tela estreita. A Nova OC não mudou.
- **Bateria:** 297 testes, todos verdes. Tipos e lint limpos.

## §2 — O conserto

- **O topo** (a 900 px ou menos) cresce com o que tem dentro, em vez de ficar preso em 68 px. O selo "Banco
  conectado" desce para a linha de baixo quando não cabe.
- **O título do topo** vai a 20 px a 700 px ou menos. A 375, "Nova Ordem de Compra" cabe numa linha, e o topo fica
  com 92 px.
- **O rodapé do menu estreito** usa a largura toda do menu (44 px por dentro) e põe o avatar **em cima** do botão do
  tema. Lado a lado, eram 76 px.

## §3 — A medida, e o que ela achou a mais

O fotógrafo agora mede a moldura no navegador de verdade, nas 12 fotos de depois:
- **pedaço vazado**: parte do topo ou do menu que sai da caixa deles;
- **texto sobreposto**: texto da moldura por cima de outro texto;
- **fora da tela**: pela direita **e pela esquerda**.

As três medidas deram **zero nas 12**.

**No antes, a medida achou dois defeitos que a sua carta não citava** (ambos consertados pelo mesmo conserto):
- **O avatar também saía cortado a 768** (11 px para fora do menu, pela esquerda), nas três páginas.
- **No Dashboard a 375, o selo "Banco conectado" saía cortado** na borda direita.

## §4 — A 1920, a 1280 e a 768

- **A 1920 × 1080 e a 1280:** as 6 fotos saíram **idênticas às de antes, byte a byte**.
- **A 768:** mudou só o rodapé do menu. A diferença entre antes e depois cabe no retângulo de x 0 a 63 e y 1335 a
  1430: o avatar em cima do tema, agora inteiro. O topo a 768 ficou igual, com 68 px.

## §5 — A trava

O jsdom não mede tela. A régua lê as regras do CSS e faz a conta: avatar e tema em fila são 32 + 10 + 34 = 76 px, num
rodapé de 44 px. São **6 sabotagens, todas mordendo** e todas com o hash de volta igual:
1. o topo volta a ter altura presa;
2. o selo não desce de linha;
3. o avatar e o tema voltam lado a lado;
4. o rodapé volta a ter respiro dos lados (sobram 28 px para um botão de 34);
5. o título não diminui;
6. o conserto vaza para a 1280 e a 1920.

**A foto é a prova do resto.**

## §6 — As fotos

Estão em `docs\Capturas\2026-09-27_D579\` (18 fotos):
- **Depois:** as três páginas (`01_nova_oc`, `02_historico` e `03_dashboard`), em 375, 768, 1280 e `1920x1080`.
- **Antes:** a 375 e a 768, com o sufixo `_antes`. Mandei também o antes de 768, porque o avatar cortado aparece ali
  também.

## §7 — O `wrangler.jsonc`

- **O comentário agora diz:** quem decide quando o deploy roda é a lei 3 (7.2, emenda 3 de 15/09/2026). Publicar a
  OC é ato desta casa, por carta, depois da sua avaliação no ensaio. Voltar atrás é publicar a versão anterior. Fora
  de carta, não roda.
- **Não copiei a tabela.** O arquivo faz o mesmo: só o comentário mudou.

## §8 — Quando o senhor mandar publicar

- **O caminho:** junto o ramo no `main` e publico pelo PowerShell (`pnpm run deploy`).
- **O desfazer** será a versão que está no ar hoje, **`a9b3b112`**.

## §9 — Um achado que não é da moldura (não consertei)

- **No Histórico a 375,** o texto de dentro da busca sai cortado ("Buscar por número, fornecedo…").
- **É a página, não a moldura,** e é texto de exemplo dentro do campo. O senhor decide se vale carta.

— Ordem_de_Compra
