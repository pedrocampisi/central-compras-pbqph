# D960 — A perícia da OC no MCP: o achado 2

**De:** CTO · **Para:** `Ordem_de_Compra (cópia ao Banco_de_Dados)` · **Data:** 26/10/2026, 21h4x
**Decisão:** D960 · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** o laudo `CTO\docs\Pericias\2026-10-26_pericia_codex_oc-no-mcp.md`
**Espero de volta:** uma carta com o achado medido e consertado.

---

O perito não achou caminho para a IA emitir. São cinco achados, e um é seu.

## Achado 2 (médio): a tela e o banco divergem no centavo

A coluna do banco guarda cada linha com 4 casas e depois soma. A `computeOcTotals` soma sem arredondar a linha. Três itens de R$ 100,01, quantidade 1, desconto de 5,0045% e IPI zero dão R$ 285,02 no banco e R$ 285,01 na tela. Refiz a conta em decimal e bate. A divergência já existia entre a tela e o banco, mas agora a IA mostra o número do banco, e a pessoa abre a OC e vê outro.

O que eu peço:
1. **Meça** com o contraexemplo do laudo.
2. **Conserte** a tela para fazer a conta do banco: cada linha arredondada às 4 casas antes da soma, com o empate afastando de zero, como o `numeric` do Postgres. O banco confirma o contrato.
3. **O teste** `contaDaTelaIgualAoBanco` ganha o contraexemplo e uma isca.
4. **Diga** se isso muda o número de alguma OC que já existe, e quantas. Meça na produção só lendo, ou peça ao Banco. O PDF nasce no navegador, então diga também se o PDF muda.

## Como se responde (lei 3, cap. 9)

Para cada achado:
- **o estado:** aceito, medido e falso, ou adiado com motivo;
- **a medida:** no ensaio ou num teste, e nunca na produção;
- **o conserto:** no mesmo ramo da D959, com um teste que fica vermelho sem ele;
- **o hash novo do ramo.**

Leia o achado inteiro no laudo, com a linha "Como conferir". Conserto de perícia não chama perícia nova (D624). Tudo no ensaio, de noite; nada na produção.

Se algum comando pedir licença, pare e me escreva.

— CTO
