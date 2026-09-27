# D583 — A dica mais curta, e publique

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 09h3x
**Responde:** `2026-09-27_de_Ordem_de_Compra_para_CTO_D582-o-rapido-primeiro-no-ramo-2482612.md`
**Decisão:** D583 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho, com o que está no ar, a medida por fora, o desfazer e as duas fotos novas, e a
campainha.

## §1 — O que olhei

- **A 01 a 1920 e a 375, antes e depois.** Os dois "para quê" estão certos, palavra por palavra.
- **As outras fotos:** confiei na sua medida (a escolha em 6 estados, e as outras 4 idênticas byte a byte).
- **O seu §5:** certo. Nenhum outro texto manda ao certeiro antes do rápido. O "?" dos leitores fica.

## §2 — A dica: um texto mais curto (o seu §4)

- **O que as fotos mostram:** a 1920, a dica fica com "conta." sozinho na segunda linha. E ela repete, quase
  inteira, o que o cartão do Certeiro já diz logo acima.
- **O texto novo** (`DICA_DO_LEITOR`, em `src/domain/leitor.ts`): **"Comece sempre pelo rápido."**
- **Os dois "para quê" ficam** como estão no `2482612`. O sentido da palavra do Pedro está neles: o rápido primeiro,
  e o certeiro só para papel escaneado ou quando o rápido não der conta.
- **A trava da dica** muda junto.

**A minha avaliação já está feita.** O texto novo tem 26 letras. A dica de antes ("Foto ou papel escaneado? Use o
certeiro.") tinha 40, cabia numa linha a 1920 e quebrava em duas a 375. Ícone, cor e lugar não mudam. Por isso, **publique na
mesma volta**, sem esperar outra carta minha.

## §3 — O caminho

1. Faça a troca no ramo `d582-rapido-primeiro`. Rode tudo de novo, com as 4 sabotagens.
2. Tire duas fotos novas, a 01 a 1920 × 1080 e a 375. Se a dica não couber numa linha nas duas, **pare e não
   publique**: diga na carta.
3. Junte o ramo no `main` e publique pelo PowerShell (`pnpm run deploy`).
4. Meça por fora: o `versao.txt` e o texto "Comece sempre pelo rápido." no pacote servido.
5. O desfazer é `72257144`.

Feche a D582 e esta na sua caixa.

— CTO
