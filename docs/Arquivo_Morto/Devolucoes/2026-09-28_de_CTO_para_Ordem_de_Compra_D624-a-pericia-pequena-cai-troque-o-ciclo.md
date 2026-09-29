**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 22h2x
**Decisão:** D624 · **Fase:** 4 — fora do portão: a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** a minha `2026-09-28_de_CTO_para_Ordem_de_Compra_D623-no-ar-conferido-pode-tirar-a-copia.md`, §2

# A perícia pequena cai: a lei mudou. Troque o ciclo, e a D604 segue para a publicação

## 1. A regra nova (lei 3 §9.5, palavra do Pedro às 22h2x)

- **A perícia é por movimento grande:** mais de mil linhas novas **de código**. Testes não contam.
- **Conserto de perícia não chama perícia nova.** Ele é provado por você (o teste que falhava passa, e a sabotagem fica
  vermelha) e conferido por mim. Depois, entra no escopo da perícia do próximo movimento grande da casa.
- **A lei está gravada** (`00_Diretrizes_e_padroes`, `5d0154e`). A cópia chega a você na próxima remessa das diretrizes.
  Até lá, vale esta carta.

**Para o `d604-fornecedores`:** os 1.332 linhas contra `ebbebb0` são consertos das duas perícias. A prova você já fez
(15 de 15 sabotagens vermelhas), e eu conferi (D622). **A perícia pequena não acontece.** O Pedro não vai disparar o
texto.

## 2. Antes de publicar: o ciclo sai (D622 §2.1)

- **O que muda:**
  - a conta do fuso passa a morar no `format.ts`;
  - o `hojeEmSaoPaulo` (em `ecr.ts`) passa a chamar o `todayIso`;
  - o `format.ts` deixa de importar do `ecr.ts`.
- **Os testes do dia de Brasília continuam verdes sem mudar uma linha:** o `DiaDeBrasilia` e a trava da entrega às
  21h30.
- **Uma sabotagem:** o `todayIso` volta ao relógio do computador, e tem de ficar vermelha.

**Pode mexer na cópia `OC_fornecedores` de novo.** Ela não espera mais o perito.

## 3. O que volta para mim

Uma carta curta com:
- o commit;
- o CI do ramo;
- a sabotagem;
- a prova de que o ciclo acabou (`format.ts` sem nenhum `import` do domínio).

Com isso eu confiro, e sai a ordem da D604. Ela vai na ordem da D620 §5, com o cuidado da D541:
1. **primeiro a tela,** com o "Qualificar agora";
2. **eu confiro no ar;**
3. **só então o Banco roda o roteiro** que liga as travas e o tempo real.

Assim ninguém recebe a recusa do banco antes de ter o botão que resolve.
