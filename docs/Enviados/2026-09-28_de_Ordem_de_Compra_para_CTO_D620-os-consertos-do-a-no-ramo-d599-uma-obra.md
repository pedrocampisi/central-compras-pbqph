# D620 — os quatro consertos do A no ramo `d599-uma-obra`, e o dia de Brasília no Duplicar (D621)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 21h4x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D620-triagem-das-duas-pericias-onze-aceitos.md` (a carta do ramo `d599-uma-obra`,
§4), e `2026-09-28_de_CTO_para_Ordem_de_Compra_D621-o-dia-e-o-de-brasilia-no-duplicar.md`, que vem nesta mesma carta.
**Espero de volta:** a sua conferência do ramo e, quando for a hora, a ordem de publicar. **Publicado: nada.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Os testes usam dados inventados e banco
falso; nenhuma chamada ao banco de verdade.

---

## §1 — Em uma linha

**Os quatro achados da perícia de `fe119e6` estão consertados no ramo `d599-uma-obra`, ponta `d0b244b`, CI verde.** As
sete medidas deixaram de ser `it.fails` e viraram testes comuns, todos verdes. O Duplicar da D621 foi consertado junto.
São 350 linhas novas contra `fe119e6`, abaixo do portão. Continua no ar a `080168b8`.

## §2 — O ramo

| commit | o que é |
|---|---|
| `428db2f` | os quatro consertos, A1 a A4; as medidas viram travas |
| `fde445b` | o dia de Brasília no Duplicar e na Nova OC (D621) |
| `d0b244b` | merge do `main` (`f0a6a1d`), pelo seu aviso do CI |

- **O CI vermelho no `428db2f`** (execução 36501780163) era o lock antigo, como o senhor disse: o d599 nasceu antes do
  `7107296` da D612. Trouxe o `main` por merge. O conflito foi só de papel, no `PLANEJAMENTO.md` e no `INDICE.md` do
  `Arquivo_Morto`, e eu resolvi pela união:
  - as decisões 57 e 58 vêm do ramo, e da 59 à 62 vêm do `main`;
  - a linha velha da D596 ("esperando o CTO") saiu, e ficou a do `main`, já respondida pela D598.
- **CI verde na ponta `d0b244b`** (execução 36504042795).
- **A bateria:** 453 testes em 34 arquivos, todos verdes; tipos e lint limpos; o pacote gerado pelo PowerShell.
- **Linhas contra `fe119e6`** (`src/` e `tests/`): **350 novas, 20 tiradas**. Em `src/` são 82 novas e 13 tiradas; em
  `tests/`, 268 e 7. Fora disso, o merge do `main` trouxe o `package.json` e o lock da D612 (25 e 5), que não são meus.
  **Abaixo de 1.000: sem perícia pequena por este ramo.**

## §3 — Cada achado: a propriedade, o antes e o depois

"Antes" é a medida da D616, no `d504c0f`, marcada `it.fails`. "Depois" é o mesmo teste, sem o `.fails`, verde no
`d0b244b`.

| achado | a propriedade da D620 §3 | antes | depois |
|---|---|---|---|
| A1 | a outra obra sai da tela na hora; a resposta pedida noutro estado da máscara vai fora, nos dois sentidos | 3 `it.fails` | 3 verdes |
| A2 | a máscara vira no instante da borda; relógio falso, sem conferir por fora | 2 `it.fails` (16/11 e 18/11) | 2 verdes |
| A3 | o gabarito não depende do `SINAIS`; a mutação tem de ficar vermelha | mutação verde (23 de 23) | mutação vermelha |
| A4 | nenhuma exceção, e a mensagem diz o que falta | 2 `it.fails` (sem o dia, sem a hora) | 2 verdes |

- **A1, o que mudou:**
  - Ao ligar, a conferência tira da tela, na hora, as OCs e as obras que não são a da máscara, sem esperar a busca.
  - A carga guarda qual máscara estava valendo quando pediu. Se a máscara mudou quando a resposta chega, a resposta vai
    fora. Isso vale ao ligar e ao desligar.
- **A2, o que mudou:**
  - O relógio de 15 segundos continua.
  - Quando a borda da janela (início ou fim) está a menos de 30 segundos, marca-se um despertador para o instante exato
    dela.
  - O teste usa só o relógio falso. Nenhum teste chama a conferência por fora.
- **A3, o que mudou:**
  - O gabarito da prova é uma tabela escrita à mão, com os códigos da fonte Symbol da Adobe (≥ 0xb3, ≤ 0xa3, e os
    outros sete).
  - A prova não lê mais o `SINAIS` do código.
- **A4, o que mudou:**
  - Dia ou hora apagados dão "data inválida" em vez de exceção.
  - O Armar mostra a mensagem que pede o campo que falta.

## §4 — As sabotagens

Cada conserto foi desfeito, um por vez. Rodou a bateria do arquivo, e o arquivo voltou com o mesmo sha256.

| sabotagem | resultado |
|---|---|
| A1: sem tirar a outra obra na hora | vermelha |
| A1: sem jogar fora a resposta de outra máscara | vermelha |
| A2: sem o despertador da borda | vermelha |
| A3: os dois códigos do `SINAIS` trocados | **vermelha** (antes do conserto, verde) |
| A4: sem a guarda da data inválida | vermelha |
| D621: o `todayIso` volta ao relógio do computador | vermelha |
| D621: o Duplicar volta a cortar em UTC | vermelha |

**7 de 7 vermelhas, 7 de 7 com o mesmo sha256.** Desta vez as mutações foram feitas pelo roteiro que restaura e confere
o sha, e não à mão.

## §5 — O dia de Brasília no Duplicar (D621)

- **O Duplicar do Histórico:**
  - a data da OC nova vem do `todayIso()`, e não mais de `new Date().toISOString().slice(0, 10)`;
  - o ano sai da mesma data.
- **O `todayIso()` chama o `hojeEmSaoPaulo()`.** A casa passa a ter um "hoje" só.
  - Isso cria uma importação circular: `format.ts` importa de `ecr.ts`, e `ecr.ts` já importava o `formatDate` de
    `format.ts`.
  - É inofensiva, porque nenhum dos dois usa o outro na carga do módulo, só dentro das funções.
  - O lint não tem regra contra isso, e a bateria e o pacote passam.
  - Se o senhor preferir sem ciclo, a conta do fuso pode morar no `format.ts`, e o `hojeEmSaoPaulo` passa a chamar o
    `todayIso`.
- **A trava** fica em `tests/components/DiaDeBrasilia.test.tsx`, com o relógio falso às 21h30 de 28/09 em Brasília:
  - a OC duplicada nasce com 28/09, e não 29/09;
  - o `todayIso()` dá 28/09 mesmo com o computador no fuso de Tóquio, onde já é 29/09.
- **O aviso do Banco (D618 §5)** não pediu nada na tela da entrega, como o senhor conferiu. Pus uma trava lá mesmo assim,
  no ramo `d604-fornecedores`, que é onde a tela mora: às 21h30, o recebimento sugerido e o máximo do campo são 28/09.

## §6 — O que segue

- O conserto já foi ao `d604-fornecedores` por merge. A carta daquele ramo segue junto com esta.
- **A ordem de publicar é sua.** Na sua ordem da D620, este ramo sobe primeiro, e a máscara tem de estar no ar antes de
  06/11.
