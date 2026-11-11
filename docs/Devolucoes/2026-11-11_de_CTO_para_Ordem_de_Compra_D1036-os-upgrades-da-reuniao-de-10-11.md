# D1036 — Os upgrades da Ordem de Compra que saíram da reunião de 10/11

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 11/11/2026, 14h5x
**Decisão:** D1036
**Fase:** 4 — fora do portão: pedido direto do Pedro (os upgrades da Ordem de Compra que saíram da reunião de 10/11)
**Responde:** nada, é pedido novo
**Espero de volta:** primeiro, hoje, uma carta curta com as três respostas da seção 1; depois, a carta do ramo com os upgrades da seção 2, as fotos e as medidas, e a campainha.

---

O Pedro apresentou a casa à diretoria em 10/11 (Rodrigo, Thiago e Eduarda), e a reunião trouxe pedidos. Hoje ele escolheu os que entram: *"4, 5, 6, 7, 8 - manda bala"*, *"3 - ok"*, e sobre o 2, *"da pra fazer isso?"*. A equipe já pode estar usando a casa: **nada sobe de dia**. A produção é depois das 19h, na minha campainha, depois da minha conferência.

A frase da ata que prova cada pedido está em `CTO/docs/Reunioes/2026-11-10_diretoria-apresentacao-dos-sistemas/TAREFAS.md` (só leia).

## 1. Três perguntas, para responder hoje, sem construir

1. **Mais de um encarregado por obra.** Rodrigo quer dois ou três por obra, porque o titular nem sempre está na hora da entrega. Li no `main` que o encarregado escolhe uma ou mais obras. A pergunta: duas pessoas diferentes podem ser encarregadas da MESMA obra hoje, e as duas veem e recebem os mesmos pedidos? Se sim, diga como se faz na tela, em três linhas, para eu passar a ele. Se não, diga o que falta.
2. **A versão completa no celular.** O Pedro disse: *"queria uma versão completo do app da ordem de compra no celular. Eu testei aqui pareceu que tem uma versão que nem dos encarregados"*. Li no `App.tsx` que a tela do mestre aparece quando o perfil tem o papel `mestre`. A minha suspeita é que ele leu um QR de encarregado no celular dele e ficou na sessão do encarregado. Confirme ou derrube: há outro caminho que leve quem não é encarregado à tela do mestre no celular (o ícone instalado pelo QR, o endereço de entrada, o que fica guardado no aparelho)? E diga o que ele faz para ver a casa inteira no celular com a conta dele.
3. **"Marcar entregue" pelo celular e a mercadoria a chegar** (pedido 8, da Eduarda). Na reunião o Pedro disse "já tem". Diga o que quem compra já consegue hoje no celular: ver os pedidos que estão para chegar e marcar entregue sem ser o encarregado. O que faltar entra na seção 2.

## 2. Os upgrades, num ramo que nasce do `main`

1. **O QR de entrada do encarregado** (pedido 3). Hoje vale uma vez e por uma hora, e por isso alguém leva o computador à obra. O pedido do Rodrigo: valer 24 horas e poder ser mandado ao engenheiro, que mostra ao encarregado na obra no dia seguinte. Continua valendo uma vez só. A tela diz, no lugar do "não mande por foto": a quem mandar, e que quem ler entra como aquele encarregado. Se a validade mora no Banco, peça a ele por carta. Diga na carta o risco que sobra, em uma frase.
2. **Conferir item por item no recebimento** (pedido 4, do Thiago). Na pergunta "Veio a quantidade toda?", o encarregado passa a poder ticar item por item, com a quantidade pedida ao lado. Todos ticados é o "Sim" de hoje. Item sem tique abre o campo de quanto veio, que já existe (D794). **O que se guarda não muda:** é outro jeito de responder à mesma pergunta. Quem preferir responde "Sim" de uma vez, como hoje.
3. **Compartilhar o PDF do pedido sem baixar** (pedido 5, da Eduarda). No celular, o botão "Compartilhar" abre a folha de compartilhar do aparelho com o PDF. No computador, onde o navegador não deixa, o botão não aparece, e fica o "Baixar" de hoje. Diga na carta onde funciona e onde não.
4. **O PDF do pedido** (pedido 6): a observação em destaque, para o vendedor não passar por cima, e o texto do endereço da obra maior. É a primeira mudança no PDF desde a pintura, que não o tocou. Mostre o PDF de antes e o de depois, lado a lado, com uma observação e um endereço do tamanho dos de verdade. Só esses dois pontos mudam.
5. **A importação por IA que preenche sozinha o boleto e o vencimento** (pedido 7). Na reunião o Pedro mostrou um orçamento que não dizia a condição de pagamento, e a tela veio com boleto e vencimento preenchidos. Ache de onde vem: da leitura da IA, de um padrão da tela ou da última OC. O certo: o que o orçamento não diz fica vazio, e a tela não inventa. Se a causa estiver na função de leitura do Banco, diga, e eu peço a ele.
6. **O que faltar da pergunta 3** da seção 1.
7. **O que faltar da pergunta 2** da seção 1, se houver defeito.

## 3. O que NÃO entra

- Os projetos em PDF por obra para o encarregado: o Pedro tirou da Ordem de Compra (*"isso não tem nada haver com a ordem de compra"*).
- Liberar o acesso das pessoas do piloto: é cadastro, e quem faz é o Thiago.
- Regra de negócio: nada muda no que a emissão e o recebimento conferem.

## 4. A medida

Uma trava por upgrade; fotos a 375 e a 1.366, de dia e de noite, das telas que mudam; a página de prova com textos do tamanho dos de verdade (a lição da D1034n); a bateria inteira e o `pnpm conferir`; o número de linhas novas de código, sem teste. Passou de mil, vai à perícia.

A contagem do sinal de arroba nesta carta dá 0.

— CTO
