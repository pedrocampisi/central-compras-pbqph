**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 09h4x
**Decisão:** D680 · **Fase:** 4 — fora do portão: pedido direto do Pedro; a OC firme para a auditoria do PBQP-H (16/11)
**Responde:** nada; é ordem nova, com a palavra do Pedro de hoje.
**Espero de volta:** o ramo, com testes, sabotagens e fotos numeradas; a contagem de linhas (lei 3 §9.5). Publicar é
seu pela emenda 3, depois da minha conferência.

# A busca pelo que bate melhor, o PDF com o apelido e dois defeitos da 2026/010

## 1. A palavra do Pedro

- Hoje, na janela do CTO, com três fotos da OC que ele emitiu às 09h39 (a 2026/010):
  - "O sistema de pesquisa como no da central também, não esta muito legal. De uma consertada geral. Nesse caso
    queria a comarco e apareceu ABr gesso?"
  - "O nome da OC precisa vir com o apelido e não esse nome gigantesco."
- A pausa da casa não vale para esta lista: é pedido direto dele, como a D541.

## 2. A busca

**Medido no código:**
- O `filtrarOpcoes` (`domain/pesquisa.ts`), da escolha de fornecedor e de obra, acha cada palavra em qualquer lugar
  do rótulo, do detalhe e dos termos (a razão social).
- Ele devolve na ordem que veio, que é a alfabética. O Pedro digitou "co": a ABR Gesso veio primeiro, porque "co"
  aparece no meio da razão social dela, e a Comarco ficou lá embaixo.

**O que quero:**
- **A régua da Central** (D674, `Central\app\busca.js`, no ar desde hoje). Cada opção ganha uma nota, e menor é
  melhor:
  - 0: o nome é o termo;
  - 1: o nome começa pelo termo;
  - 2: uma palavra do nome começa pelo termo;
  - 3: o termo está no meio do nome;
  - 4: casou só em outro nome (razão social, cidade, termos).
- Na mesma nota, o inativo e o bloqueado descem; no resto, a ordem que já vinha. O nome que conta primeiro é o que a
  lista mostra (o apelido).
- **Em TODAS as buscas da OC**, não só nas duas listas de escolha: Fornecedores, Histórico, Qualificação, Catálogo de
  ECR e Obras. Liste na volta quais são e onde estão. Se alguma não deve reordenar, diga por quê.
- **A prova:** "co" põe a Comarco no alto, com os fornecedores reais da produção, só lendo. Junto, um caso de obra e um
  de Histórico.

## 3. O nome do PDF

- Hoje o `buildPdfFilename` usa a razão social, nas duas portas (Nova OC e Histórico). O arquivo de hoje saiu
  "comarco comercial araguari industria e construcoes ltda 2026-09-18 R-263-29 oc.pdf".
- **Com o apelido:** "comarco 2026-09-18 R-263-29 oc.pdf". Sem apelido, a razão social, como hoje.

## 4. Dois defeitos medidos na 2026/010 (na produção, só lendo)

1. **O item 1 entrou com quantidade 0 e preço 0 numa OC emitida.** A emissão não pode aceitar linha com quantidade 0.
   Ela recusa, e a mensagem diz qual linha é. A linha em branco de verdade (sem descrição, quantidade nem preço) pode
   sumir sozinha. O desenho é seu. Diga também se o banco deve ter a mesma trava.
2. **O item 3 guarda `&#x3D;` no lugar de `=`** ("DISCO SERRA … F&#x3D;3/4"). A leitura do pedido não desfaz a
   entidade de HTML. Desfaça na leitura, com teste.

A 2026/010 fica como está: a linha zerada não muda o total. Se o Pedro quiser trocar, é palavra dele.

## 5. O que já está certo (não mexa)

- **Os 8 itens da 2026/010 não têm ECR.** Os 20 do catálogo não têm EPI nem disco de corte, e a trava da D605 não
  pediu qualificação. Está certo.
- **A pasta da obra:** a obra da 2026/010 tem caminho no cadastro. O PDF vai para lá quando a pasta foi ligada
  naquele navegador; senão, ele baixa. Expliquei ao Pedro, e não há obra aqui.

## 6. O que volta para mim

1. O ramo, com o CI verde e uma sabotagem por regra (nota, apelido, quantidade 0, entidade).
2. Fotos numeradas: a lista de fornecedores com "co", antes e depois, e uma de cada busca reordenada.
3. A contagem de linhas novas de código. Acima de mil, há perícia antes de publicar.
