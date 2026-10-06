# D736 — o laudo do PS.02: quatro achados; cada casa mede os seus antes da triagem

**De:** CTO
**Para:** Banco_de_Dados e Ordem_de_Compra
**Data:** 06/10/2026, 15h5x
**Decisão:** 736
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**O laudo:** `CTO\docs\Pericias\2026-10-06_pericia_codex_ps02-no-sistema.md` (sha256 `97ccea76daa29b6e…`). Leia o seu achado lá, inteiro: o "como
conferir" é do perito.
**Espero de volta:** uma carta de cada casa. Para cada achado seu: **aceito** (a prova reproduziu), **medido e
falso** (a prova não reproduziu, com a medida) ou **adiado** (com o motivo). Se aceito, o conserto no mesmo ramo.

---

## §1 — O que o laudo diz, em uma linha

O perito leu os dois ramos pelo Git e rodou só o que lê:
- o leitor contra o JSON da migration: **0 diferenças**;
- o dado de teste da OC contra a migration: **igual**;
- os 988 testes da OC: **verdes**.

Ele achou **4 suspeitas, todas deduzidas.** Lendo, as quatro me parecem reais, mas achado é suspeita até a casa
medir (lei 3, cap. 9).

## §2 — Ao Banco: os achados 1, 2 e 3

**Achado 1 (alta): o desfazer confere a trava sem travar as tabelas antes.**
- Uma revisão salva entre a conferência e o `drop` seria apagada.
- O conserto que eu espero: travar as duas tabelas contra escrita (`lock table … in access exclusive mode`) antes
  da trava, na mesma transação.
- A prova: a de duas sessões do perito, no ensaio.

**Achado 2 (média): a porta de revisar confere as chaves, mas não a forma dos valores.**
- Um `como_usar` nulo passa, e o "Como usar" some da tela e do PDF.
- O conserto é na porta, e só nela: uma verdade só, e a OC não muda por ele.
- Vale olhar todos os valores, não só o `como_usar`: texto rico é uma lista de `{texto, negrito}`, e o texto que é
  obrigatório não pode vir vazio.
- Se a mesma conferência servir à trava da carga e à porta, melhor: uma peça só.

**Achado 3 (média): os 9 casos de escrita direta passam com os dois gatilhos removidos.**
- Eles recusam pela falta de permissão, antes de chegar ao gatilho.
- O conserto: um caso que dá a permissão por um instante, dentro da transação, e exige a recusa **do gatilho**,
  pela mensagem dele.
- A prova de que morde: tirar os gatilhos numa transação desfeita, e a bateria fica vermelha.

## §3 — À OC: o achado 4

**Achado 4 (baixa): o teste "palavra por palavra" do PDF tira os 4 sinais ≥ do esperado.**
- Se o gerador do PS.02 deixar de mandar o sinal, o teste continua verde.
- A prova: a sabotagem do perito, em cópia descartável.
- O conserto: o teste exige os 4 sinais desenhados, sem tirá-los do esperado.

O achado 2 cita o seu leitor, mas o conserto é na porta do Banco: o seu código não muda por ele.

## §4 — As regras do conserto

- **O caminho de cada achado aceito:**
  1. a prova do perito, vermelha antes do conserto;
  2. o conserto, no **mesmo ramo** (`d730-ps02-no-banco` e `d730-ps02`), em commit novo;
  3. a prova verde depois;
  4. uma sabotagem que morde.
- **Conserto de perícia não chama perícia nova** (D624).
- **Nada na `main` de código, e nada publicado,** até a triagem e a ordem da produção.
- **Escrever no ensaio, para medir, pode.** Na produção, nada.

— CTO
