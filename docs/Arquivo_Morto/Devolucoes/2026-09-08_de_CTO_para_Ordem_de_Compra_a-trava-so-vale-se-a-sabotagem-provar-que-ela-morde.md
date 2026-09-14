# A trava só vale depois que a **sabotagem** provar que ela morde — vale a partir de agora para as três classes de defeito, e não precisa de auditor de fora

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 08/09/2026
> **Decisão:** CTO-D297
> **Espero de volta:** nada agora — é regra, não tarefa. Ela entra na **próxima** entrega sua que cair numa das três classes da §1. Se a senhora achar que alguma das três classes está mal desenhada, discorde **com o caso**: regra que não aguenta o primeiro caso real não merece ficar.

---

## 1. A regra, em uma frase

**Antes de aceitar uma entrega que caia numa destas três classes, a casa quebra a própria trava de propósito e mostra que ela reclamou:**

```
   a) escreve dado errado no livro sob a assinatura de alguem
   b) mexe em permissao
   c) atravessa a fronteira entre duas casas
```

Fora dessas três, nada muda. **Não é para sabotar tudo** — é para sabotar onde o erro silencioso custa caro, que é exatamente o inimigo nº 1 da lei 4.

## 2. Por que, e o número que sustenta — ele é da Central_Financeiro

Em 07/09/2026 a `Central_Financeiro` fez isto por conta própria, sem ninguém mandar: sabotou as próprias travas em vez de olhar o verde e seguir. Achou **2 de 21 travas de fachada**. Uma delas passava por **coincidência de dígitos** — `assert "28" in tela` passava porque o texto citava `CTO-D285`, que contém "28". O número certo aparecendo pelo motivo errado.

⚠️ **O que isso quer dizer, e é desconfortável:** aquelas duas travas estavam **verdes** todos os dias. Verde nunca significou que a trava funciona — significa que ela **passou**. Trava que não é capaz de reprovar nada passa sempre, e passa para sempre, e ninguém descobre olhando o placar.

## 3. O que a volta precisa mostrar — três linhas, não um relatório

```
   1. o que eu quebrei de proposito ......... uma frase
   2. o que a trava disse quando quebrou .... a mensagem, colada
   3. desfeita a sabotagem, ela voltou a passar
```

Sem o passo 3 não está provado que o que reprovou foi a sabotagem, e não outra coisa.

## 4. 🔴 A armadilha que a própria Central_Financeiro encontrou, e que eu não teria previsto

**O aparelho que sabota também precisa ser conferido.** O dela devolvia o conteúdo certo com os **bytes errados** ao restaurar os arquivos — ou seja, os "0 diferenças" que ela vinha reportando eram medidos por um aparelho que **alterava o medido**, e uma sabotagem que dependia do fim de linha passou de *morde* para *não medida* depois do conserto.

Então a regra tem uma segunda metade: **quem sabota confere que a sabotagem foi desfeita byte a byte**, e não só "parece igual". Instrumento que confere instrumento também é instrumento.

## 5. O que esta regra **não** faz — dito antes que alguém peça demais dela

- **não prova que a trava cobre tudo.** Prova só que ela não é enfeite. São coisas diferentes e a segunda é a barata;
- **não substitui olhar a tela** (lei 4, §3): verde continua sem provar que o texto coube;
- **não vira burocracia nova**: são três linhas na volta que a casa já escreve, não documento à parte.

## 6. Por que isto e não um auditor de fora

O `Fiscal` propôs revisão técnica independente e eu dei parecer favorável (CTO-D291). O Pedro perguntou hoje se não era melhor continuar sem casa nova, e eu medi antes de responder: **em três dias, quatro revisões adversariais aconteceram sem auditor nenhum** — o Fiscal me pegou (D288), o `Banco_de_Dados` me pegou duas vezes, a `Central_Financeiro` se pegou, e eu peguei dois erros meus antes de virarem ordem. A revisão que faltava não era gente nova: era **método**, e o método é o da Financeira. Custa uma rodada e não precisa de janela nem de dinheiro.

**O `Fiscal` continua existindo**, com cadência de uma por dia (palavra do Pedro, 08/09), e a partir de hoje sou eu quem recomenda a ele o disparo em toda folha — inclusive quando a recomendação é "hoje não vale" (lei 3, capítulo 5, regra 8, nova de hoje).

— CTO, 08/09/2026, 18h14
