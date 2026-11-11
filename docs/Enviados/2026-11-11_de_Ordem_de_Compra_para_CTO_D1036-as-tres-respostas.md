# D1036, seção 1: as três respostas, sem construir

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 11/11/2026, 15h05
**Assunto:** o segundo encarregado na mesma obra, a versão completa no celular e o "marcar entregue" de quem compra; tudo lido no código e nas migrações, nada construído
**Responde:** `2026-11-11_de_CTO_para_Ordem_de_Compra_D1036-os-upgrades-da-reuniao-de-10-11.md`, seção 1
**Espero de volta:** nada para estas três. A carta do ramo, com os upgrades da seção 2, vem depois.

---

## 1. Mais de um encarregado na mesma obra: sim, já funciona

Li no Banco, só lendo, a migração `20261004120100_o_recebimento_pelo_mestre_cto_d693.sql`:
- a tabela `core.mestre_da_obra` só proíbe a **mesma pessoa** duas vezes na mesma obra (o índice único é por pessoa e obra);
- a função `core.e_mestre_da_obra` pergunta "esta pessoa está nesta obra?", pessoa por pessoa.

Então dois ou três encarregados na mesma obra veem a **mesma lista** de pedidos, e qualquer um deles recebe. Quando um recebe, a entrega fica registrada na OC. Não conferi, na tela, o que o outro vê depois disso: a lista do Banco continua mostrando as OCs emitidas e as entregues, por causa da entrega parcial. Na tela, a lista de obras de cada encarregado só esconde as obras onde **ele mesmo** já está. O cabeçalho do código já diz "mais de um mestre por obra é permitido".

**As três linhas para o Rodrigo:**
1. Em **Acesso dos encarregados**, toque em **Cadastrar encarregado** e escreva o nome do segundo. Em **Obra**, escolha a mesma obra do primeiro.
2. Se ele já estiver cadastrado, no cartão dele escolha a obra em **Pôr numa obra…** e toque em **Pôr**.
3. Toque em **Gerar QR** no cartão dele e mostre o QR a ele. A partir daí, os dois veem e recebem os mesmos pedidos da obra.

## 2. A versão completa no celular: a sua suspeita está certa, e há um segundo caminho

**O que leva à tela do encarregado:** só o papel `mestre` do perfil que está logado no aparelho (`App.tsx`, `perfil?.papel === 'mestre'`). Não há atalho de endereço nem marca guardada no aparelho que leve quem não é encarregado a essa tela. O ícone instalado abre o mesmo endereço da casa (`start_url` é a raiz).

**Primeiro caminho, o que o senhor suspeitou:** ler um QR de encarregado no celular entra **como aquele encarregado**. A sessão do aparelho passa a ser a dele, até alguém tocar em "Sair". Se o Pedro testou o QR no celular dele, ficou na sessão do encarregado, e a casa inteira some.

**Segundo caminho, que parece a mesma coisa:** no ícone instalado, sem ninguém logado, a primeira tela é a de entrada do encarregado:
- o título é "Central de Compras", seguido de "Encarregado: peça o QR ao engenheiro e toque no botão";
- o botão grande é "Ler o QR";
- o "Entrar com e-mail e senha" fica embaixo, pequeno.

Quem abre o ícone por ali vê uma tela de encarregado sem ser encarregado.

**O que o Pedro faz para ver a casa inteira no celular:**
1. Se a tela é a lista de pedidos do encarregado, vá ao pé da lista e toque em **Sair**.
2. Na tela de entrada, toque em **Entrar com e-mail e senha** (no ícone) e entre com a conta dele.
3. A casa inteira abre, com o menu em **Mais**, no pé da tela.

**Não achei defeito**, então o item 7 da seção 2 fica vazio. Vou só propor, na carta do ramo, que a tela de entrada do ícone deixe o "Entrar com e-mail e senha" tão visível quanto o "Ler o QR". Uma linha de texto, se o senhor quiser.

## 3. "Marcar entregue" pelo celular, sem ser o encarregado: já tem, com uma falta

**O que já existe**, na casa inteira e no celular também (a pintura deixou tudo de pé a 375):
- **Ver o que está para chegar:** em **Histórico**, filtre o status em **Emitida**. São as OCs emitidas e ainda não entregues.
- **Marcar entregue:** em cada OC emitida, a ação principal da linha é **Marcar entregue**. Ela abre a avaliação do recebimento do PS.02, e a OC entregue aceita "Outra entrega", a parcial.
- Quem pode: admin, engenharia e financeiro, os mesmos que emitem OC. Quem é só leitura vê e não marca.

**O que falta:** o Histórico **não mostra a data combinada da entrega** (a `entrega_prevista` da OC). Ela só aparece na Nova OC. E o filtro "Emitida" não ordena por essa data. Então quem compra vê o que falta chegar, mas não vê **quando** chega nem o que está atrasado.

Isso entra na seção 2, como o item 6: uma vista "a chegar", com a data combinada e as atrasadas no alto, e o "Marcar entregue" ao lado.

## 4. Agora

Sigo para a seção 2, num ramo que nasce do `main` (`a77a550`). Nada sobe de dia: a produção espera a sua campainha depois das 19h.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente. Não toquei o banco: só li as migrações.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
