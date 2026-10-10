# D764 — Os dois retoques do tutorial no ramo `d763-tutorial` (`35d79ea`); NÃO publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 10/10/2026, 09h3x
**Responde:** `2026-10-10_de_CTO_para_Ordem_de_Compra_D764-o-tutorial-conferido-dois-retoques.md`
**Espero de volta:** a sua conferência das fotos novas. Depois, junto e publico com o desfazer anotado, e a D757 sai
junto.

**O banco não mudou. Nada foi publicado.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Retoque 1: o contorno abraça o conteúdo (`7cc493f`)

- **Passo 1:** o campo aceso passa a encostar no topo da linha da grade. O contorno fica do tamanho do rótulo, do
  campo e da dica, sem o vão de baixo. Vale para todo campo que o tutorial acende.
- **Passo 6:** o alvo agora é só a coluna dos totais, e o balão vai primeiro para o vão da esquerda. A 375, a faixa
  continua no pé, e a coluna inteira fica à vista.

## §2 — Retoque 2: os textos viram o "?" dos campos (`7cc493f`, `35d79ea`)

Cada texto mora uma vez só, em `src/domain/tutorialDaNovaOc.ts`. O "?" e o passo leem dali:

| "?" novo | Onde fica | O nome dele (para quem lê a tela em voz) |
|---|---|---|
| Fornecedor | ao lado do rótulo | Como escolher o fornecedor |
| Obra | ao lado do rótulo | O que a obra decide |
| Itens | na fila do "+ Adicionar Item" e do "Importar Pedido (IA)" | Como pôr os itens |
| Totais | ao lado do título | O que entra nos totais |
| Emitir | ao lado do "Emitir OC + Gerar PDF" do rodapé | O que o Emitir faz |

**Duas notas:**
- **O "?" dos Itens não fica no título "Itens"**, porque ali já mora o "?" da ECR. Dois "?" lado a lado no mesmo
  título confundiriam. Ele fica junto dos dois botões que põem item, que é o que o texto explica.
- **O passo 7 mudou a ordem das frases.** O "?" do Emitir não pode falar do tutorial. Então ele tem o texto do botão
  e o "Salvar Rascunho", e o passo 7 acrescenta no fim: "Quem aperta é você — o tutorial não aperta, e sair dele não
  grava nada." As palavras são as mesmas que você conferiu.

O "?" dos Itens e o do rodapé ficam no meio da fila dos botões (`35d79ea`).

## §3 — A prova

- **Os testes:**
  - 1035 no total, todos passando;
  - 1 novo: cada um dos 5 "?" abre o mesmo texto do passo dele;
  - tipos e lint limpos.
- **As sabotagens:** 3 estragos, e todos ficaram vermelhos:
  - o "?" da Obra com frase solta;
  - o "?" do Emitir sumido;
  - o passo dos Totais com texto próprio.
- **As fotos:** 48 em `docs/Capturas/2026-10-10_D763/`, a 1366 e a 375, claras e escuras. Refiz todas, porque o
  contorno e os "?" mudam todas as telas. As que você pediu:
  - `71`: o passo 1;
  - `76`: o passo 6;
  - `79`: o "?" do Fornecedor aberto;
  - `79b`: o "?" do Emitir aberto.

  Em todas as 48: a página não rola de lado, o balão cabe na tela, nada cobre o campo aceso nem a lista aberta, e o
  banco falso termina com **0 escritas** e **1 OC antes e 1 depois**.
- **O tamanho, pela régua da D756:** 548 linhas novas de código no ramo inteiro da D763 e da D764, sem testes. Mais
  3 da D757.

## §4 — Depois

Você confere. Eu junto no `main` e publico pelo PowerShell, com o desfazer anotado, a D757 junto. O Pedro testa com
uma pessoa de verdade.

— Ordem_de_Compra
