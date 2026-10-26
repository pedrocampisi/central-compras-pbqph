# D953 — A OC no mesmo MCP: o plano

**De:** CTO · **Para:** `Ordem_de_Compra (cópia ao Banco_de_Dados e à Central)` · **Data:** 26/10/2026, 16h3x
**Decisão:** D953 · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** o pedido do Pedro de 26/10, 16h2x
**Espero de volta:** o plano das ferramentas, antes de qualquer código.

---

O Pedro pediu: "Queria ligar o antigravity via MCP ao ordem de compra também. E queria fazer isso sem ter que concectar outro MCP, tudo ficar no mesmo".

É o que a lei 4, §12, já manda: um MCP só (a função `mcp` do Banco), e cada casa é dona das ferramentas que espelham as telas dela. A Central foi a primeira (o cadastro de prestador, D877 a D885). Você é a segunda. Leia o §12 inteiro antes do plano.

## O primeiro caso que eu proponho

A pessoa aponta a pasta, a IA lê a cotação ou a proposta do fornecedor e monta o **rascunho** da OC (fornecedor, obra, itens e valores) pela mesma função que a sua tela usa. A pessoa confere na IA, confirma, e emite na tela, como hoje. Se o Pedro quiser outro caso, ele diz, e eu aviso.

## O que o plano precisa trazer

1. **As ferramentas, uma por botão que já existe na sua tela** (§12.2): buscar OC, buscar fornecedor e obra, montar o rascunho. Para cada uma, diga o botão, a função do banco por trás e o que ela devolve.
2. **O que a sua tela ainda grava direto na tabela.** Isso passa para função antes de a ferramenta nascer (§12.2).
3. **O que a IA não pode,** porque a pessoa também não pode:
   - a marca `sem_ordem_de_compra` (D814) barra pela IA o que barra na tela;
   - emitir fica na tela, a menos que você mostre por que deve ser pela IA;
   - dado de banco e Pix não saem em busca nenhuma.
4. **A gravação em dois passos** (§12.3): o que a IA mostra antes de gravar, com o dinheiro em destaque, e o teto de itens por proposta.
5. **As regras de negócio da OC** que a ferramenta precisa respeitar, lidas do que já existe (a qualificação na data, D810; a quantidade por item, D797; o papel no nome do cliente), e não inventadas.
6. **A prova:** no ensaio, com papel de mentira, e o desfazer.

O lado do servidor (a trava, o escopo, a página "Permitir") é do Banco, numa carta a ele. Combinem entre vocês o nome de cada ferramenta.

Nada de código antes da minha aprovação. A perícia vem antes da produção, como no MCP da Central.

Se algum comando pedir licença, pare e me escreva.

— CTO
