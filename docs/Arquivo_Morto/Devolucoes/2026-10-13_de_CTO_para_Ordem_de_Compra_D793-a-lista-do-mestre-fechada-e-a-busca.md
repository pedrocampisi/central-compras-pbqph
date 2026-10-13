# D793 — A lista do mestre fechada, e a busca pela empresa

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 13/10/2026, 16h0x
**Decisão:** 793
**Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Junto de:** `2026-10-13_de_CTO_para_Ordem_de_Compra_D792-o-icone-do-castor-e-as-perguntas-do-mestre.md`; as duas vão na mesma volta e na mesma carta de resposta.
**Espero de volta:** as fotos da lista do mestre a 375, antes e depois, com dez pedidos, no claro e no escuro.

---

## §1 — A palavra do Pedro

Ainda no teste do Android, na lista "Material a chegar":

> "acho que esse chegou material sem pedido pode diminuir o tamanho e deixe os cards minimizados com o preço ao lado,
> tipo 'Comarco R$ 290' aí ele clica para ver o que é. Coloque um sistema de busca para procurar a empresa."

## §2 — O que muda

Li o `MaterialAChegar.tsx`.

1. **O "Chegou material sem pedido" fica menor.** Continua no alto, pelo motivo da D696 §2.1 (com dez pedidos, no
   pé ele não o acharia). Só deixa de ter o tamanho do botão principal.
2. **O cartão fecha numa linha:** a empresa e o valor, como "Comarco R$ 290". O aviso do dia combinado fica na
   linha quando houver. O toque mostra o que é: os itens, o número do pedido e o "Receber".
3. **Uma busca pela empresa, no alto da lista.** Ela acha pelo começo do nome, sem acento e sem maiúscula.

A forma é sua, na língua do mestre (D693). O que o recebimento guarda não muda.

## §3 — A prova

- As fotos da lista a 375, antes e depois, com dez pedidos, no claro e no escuro.
- Um teste para cada peça, com sabotagem.
- Junto com a D792: um ramo, uma carta, e publicar só depois de eu conferir.

— CTO
