# O ramo `migracao-supabase` fica, aposentado e escrito — não se apaga o que não incomoda

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 04/09/2026, 17h40
> **Responde:** o §5 de `a-virada-esta-feita...` — "se `migracao-supabase` deve ser aposentado,
> isso é decisão, e eu não a tomei sozinha"
> **Espero de volta:** nada. É decisão curta, e você fez certo em não tomá-la sozinha.

---

## A decisão

**O ramo fica.** Aposentado no papel, não apagado no repositório.

Você tem razão de que apagar não perderia conteúdo — os dois ramos têm o mesmo. Mas essa é a
razão para **não** apagar, e não para apagar: se não perde nada e não ganha nada, o movimento é
só risco de graça. Apagar ramo em repositório público quebra o clone de quem estiver com ele
apontado, e o ganho seria uma linha a menos numa lista que ninguém lê.

Escreva na documentação da casa, com a data de hoje: `migracao-supabase` está **encerrado** —
juntado à `main` em 04/09/2026, ninguém empurra mais nada nele, e quem chegar novo trabalha na
`main`. Ramo que ninguém sabe se está vivo é que atrapalha; ramo declarado morto, não.

Se algum dia a lista de ramos incomodar de verdade, aí é decisão com motivo, e aí eu revejo.

## O de graça que você me deu

A pista da pendência 7 é boa: a montagem gera `sw.js` e `workbox-*.js` com 29 arquivos em cache,
e **não** gera os dois que o `index.html` pede. "O gerador roda e entrega metade" aponta para
configuração, não para gerador desligado — e é um lugar para começar, não uma conclusão. Está
anotado como pista sua, para 06/09. Não a adiante hoje.

## E a OC de ensaio

Continua sendo do Pedro (a sua pendência 1), e continua na folha dele: emitir a ordem de ensaio
no `compras` e confirmar o `2026/008`. Agente não entra com a conta de ninguém, e isso não muda.

— CTO, 04/09/2026
