# D577 — Publique: a escolha do leitor e a caixa de texto, juntas

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 27/09/2026, 00h1x
**Responde:** a palavra do Pedro depois das 10 fotos de 1920 × 1080 (D576), e fecha a minha D557
**Decisão:** D577 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de fecho, com o que está no ar, a medida por fora, o desfazer e as linhas para o Pedro,
e a campainha.

## §0 — A palavra

O Pedro olhou as 10 fotos de 1920 × 1080 na minha janela e disse: **"Pode aplicar"** (27/09, 00h1x).

Publicar a Ordem de Compra é ato seu, pela emenda 3 (lei 3, a tabela da autonomia: "ato da casa depois da avaliação
do CTO; voltar é publicar a anterior"). A avaliação é a minha D576. A palavra do Pedro era a condição que **eu** pus
para esta tela, e ela veio.

## §1 — O que sobe

O ramo `d557-lista-em-texto` em **`3795db0`**, com tudo o que ele tem:
- a caixa de colar a lista em texto (D557);
- a escolha Rápido/Certeiro (D567);
- os dois retoques (D570);
- o campo que encolhe depois da leitura (D575).

## §2 — O caminho: o da sua §6 da D567

1. Traga o ramo para o `main` do dia.
2. Rode tudo de novo: testes, tipos, lint e as sabotagens.
3. Publique pelo PowerShell, como na D555.
4. Meça por fora, e escreva as linhas para o Pedro.

**O que eu já conferi do lado que recebe (produção, `extrair-itens` v5, desde 26/09 23:02:52):**
- aceita `leitor` e `texto`;
- o limite do texto é de 2.000 caracteres;
- devolve `_meta.leitor`, `_meta.modelo` e `_meta.provedor`;
- o 422 da resposta cortada tem a frase que a sua trava copiou.

O cliente velho em cache, sem `leitor`, continua lendo pelo rápido. Não há nada a esperar do Banco.

## §3 — A medida por fora

- A versão no ar é a nova. Diga como mediu: o identificador da publicação e um texto da tela nova no pacote servido,
  por exemplo "Qual leitor da IA lê o pedido?".
- A anterior (`69e5921a`) fica anotada como o desfazer.
- A chamada de verdade pede sessão, e você não tem conta. **Não tente entrar.** A primeira leitura de verdade quem faz
  é uma pessoa, e eu a vejo no log da `extrair-itens`.

## §4 — As linhas para o Pedro

Poucas linhas, em português simples. Ele vai usar na hora:
- onde está a tela nova;
- como testar os dois leitores com um pedido de verdade;
- o que conferir no "Total lido";
- como voltar atrás, se precisar. O "como voltar" é seu.

**Depois de publicar e medir,** a sua caixa fecha a minha D557 junto com esta. A moldura a 375 (o título do topo e o
avatar) vem numa carta minha à parte, depois desta.

— CTO
