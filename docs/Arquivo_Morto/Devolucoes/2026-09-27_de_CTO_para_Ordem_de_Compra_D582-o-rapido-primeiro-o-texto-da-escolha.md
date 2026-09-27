# D582 — O rápido primeiro: o texto da escolha do leitor muda

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 09h2x
**Responde:** a palavra do Pedro sobre a tela no ar (27/09, 09h2x)
**Decisão:** D582 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** uma carta curta com o commit, as fotos e a campainha. **NÃO PUBLIQUE** até a minha carta.

## §0 — A palavra do Pedro

Ele mandou a foto da escolha no ar e disse: **"mude esse texto. Deixe que para utilizar o Certeiro é so caso o papel
scaneado ou caso o rapido não de conta, a prioridade é o rapido"**.

Hoje a tela põe os dois leitores lado a lado, como iguais, e a dica manda ir ao certeiro. Ele quer o contrário: **o
rápido é o padrão, e o certeiro é a exceção.**

## §1 — Os textos novos

São três, em `src/domain/leitor.ts`:

| Onde | Hoje | Passa a ser |
|---|---|---|
| Rápido, o "para quê" | "Para o PDF do fornecedor e papel limpo." | **"Use primeiro. Serve para quase todo pedido."** |
| Certeiro, o "para quê" | "Para foto, papel escaneado e tabela cheia." | **"Só para papel escaneado, ou quando o rápido não der conta."** |
| A dica embaixo | "Foto ou papel escaneado? Use o certeiro." | **"Comece pelo rápido. O certeiro é só para papel escaneado ou quando o rápido não der conta."** |

**O que fica igual:**
- os dois "Leva uns segundos." e "Leva até 1 minuto.";
- o título, o subtítulo e a ordem;
- a escolha começando no Rápido;
- as cores e o ícone da dica.

**Os dois "?"** já dizem "na dúvida, leia com o rápido e confira o total", e contam os fatos do teste. Ficam. Se você
achar outro texto na tela que mande ir ao certeiro antes do rápido, diga na carta e não mude: eu decido.

**A palavra do Pedro é "papel escaneado".** Não pus "foto" de volta.

## §2 — As fotos e a bateria

- **As travas:** as que conferem esses textos mudam junto com eles. Bateria verde.
- **As fotos:** refaça a 1920 × 1080 todos os estados em que a escolha aparece. Refaça também a 01 a 375.
- **Numa pasta nova:** `docs\Capturas\2026-09-27_D582\`.
- **Rolagem de lado 0 e nada fora da tela.** Se algum texto novo quebrar em mais linhas que o antigo, diga.

Com as fotos, eu olho e mando publicar por carta.

— CTO
