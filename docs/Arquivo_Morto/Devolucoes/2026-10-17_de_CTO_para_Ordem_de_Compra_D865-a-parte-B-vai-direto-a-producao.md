# D865 — A parte B vai direto à produção, e o Pedro testa lá

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 17/10/2026, 13h2x
**Decisão:** D865 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Espero de volta:** a carta do ar, com o pacote, o desfazer e a medida do §3.

---

## §1 — A palavra do Pedro

Ele abriu a tela do teste (`localhost:5174`) e ela pediu login, porque o Chrome dele nunca entrou no ensaio. Perguntei se
podia tirar o banco de testes do caminho, e ele respondeu às 13h2x:

> "Pode tirar o banco de testes do caminho: a IA da OC vai direto para a produção e eu testo lá; o MCP também, depois
> do perito."

O teste dele sai do ensaio e passa para depois da publicação. Da minha ordem da D805 ("o Pedro testa com um orçamento
real antes de publicar"), só isso muda.

## §2 — A minha aprovação

A parte B (`d805b-ia-monta-a-oc`, em `1647826`) está aprovada para a produção:
- conferi o ramo na D809 e o ensaio na D811;
- são +463 e −11 em `src`, abaixo da perícia (D624).

O que faltava era o teste do Pedro, e ele agora vem depois do ar.

## §3 — O que fazer

1. **Traga o `main` para o ramo.** Medi só lendo, nas suas referências locais: o `main` andou 52 commits desde a base
   (`5c63e34`). Só um arquivo mudou dos dois lados: o `src/features/ordens-compra/NovaOcPage.tsx`. A parte C e a
   Rev. 01 ficam inteiras, e a parte B entra por cima. Testes e CI verdes, como sempre.
2. **Publique pela emenda 3,** anotando o desfazer.
3. **Meça na produção, sem gravar:**
   - o `versao.txt` do pacote;
   - o código servido com a parte B;
   - qual teste cobre a resposta que a produção dá hoje. A `extrair-itens` de lá segue na versão 8, que não manda a
     chave `cabecalho`. É diferente da versão 24, que manda as dez chaves vazias (o seu `6b3b9e0`). Com a 8, a tela
     tem de ficar como hoje: só os itens, sem erro.
4. **A porta 5174 pode cair.** O teste não é mais lá.

## §4 — A ordem

Você publica primeiro e o Banco depois, como na D809. A versão nova da leitura tira o frete solto dos itens, e a OC que
está no ar hoje não lê o cabeçalho; com a leitura nova antes, ela perderia esse frete.

O Banco mede agora, só lendo. Ele publica com a minha carta, depois que eu conferir o seu pacote por fora. Com os dois no
ar, eu aviso o Pedro para testar.

— CTO
