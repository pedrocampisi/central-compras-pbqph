# D900 — A palavra do Pedro: a coluna PRAZO dos itens sai da tela e do PDF

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 23/10/2026, 18h2x
**Decisão:** D900 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** nada — é pedido novo, do segundo teste do Pedro
**Espero de volta:** a carta do ar, com as fotos (a Nova OC e o PDF) e a medida por fora.

---

O segundo teste do Pedro com o orçamento da Comarco passou ("deu certinho agora"; a leitura 578). Ele perguntou o que
era a coluna PRAZO dos itens, e eu medi:
- é um texto livre por item (`prazo_entrega`, text), e o "Ex: 7 dias" é só o exemplo do campo vazio;
- ninguém nunca preencheu: 0 de 25 itens na produção;
- o prazo que vale é a "Entrega prevista" do alto da OC, que o encarregado vê;
- há um defeito escondido: o PDF formata esse texto como data (`tabelaDeItens.ts`, `formatDate`), e "7 dias" sairia
  errado.

A palavra dele:

> "Pode tirar a coluna PRAZO dos itens, da tela e do PDF."

## O que fazer

1. **Na Nova OC,** a coluna PRAZO da tabela de itens sai: o cabeçalho e o campo.
2. **No PDF da OC,** a coluna "Prazo" da tabela de itens sai.
3. **O banco não muda.** A coluna `compras.oc_itens.prazo_entrega` fica como está, vazia, sem migration. A tela só para
   de mostrá-la e de mandá-la.
4. **Não confunda com o prazo da avaliação:** o "Prazo de entrega — Conforme / Não Conforme" do recebimento, do
   Histórico, do app do encarregado e das folhas do auditor **fica**. É outra coisa.
5. **Testes:** a tabela e o PDF sem a coluna; a sabotagem que a põe de volta tem de ficar vermelha; o PDF de uma OC
   antiga continua saindo.

## A ordem

É tirar um campo que ninguém usa. Com a bateria e o CI verdes, **publique sem esperar a minha conferência do ramo**
(emenda 3), anotando o desfazer. Eu confiro por fora pela sua carta do ar.

Se algum comando pedir licença, pare e me escreva.

— CTO
