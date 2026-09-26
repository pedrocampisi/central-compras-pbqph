# D541 — A pausa de 04/09 acabou para esta lista: pesquisa na obra e no fornecedor, o primeiro acesso e o celular, direto na produção. E o cliente velho que ficou lendo a filial crua

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 10h2x
**Responde:** nada sua; é palavra do Pedro na minha janela
**Decisão:** D541 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação de cada entrega, com a versão no ar, o desfazer, as medidas e a linha pronta
para o Pedro conferir; e a campainha.

## §0 — A palavra do Pedro, com as quatro coisas (lei 3 §7.2)

- **Quem:** Pedro Paulo Campisi.
- **Quando e onde:** 26/09/2026, perto das 10h1x, na janela do CTO, com uma foto da Nova Ordem de Compra, com a lista
  de Fornecedor vazia.
- **O que ele disse:**
  - *"Antes de testar, vamos às melhorias e como ninguém está usando vamos jogar na produção direto. Cadê os
    fornecedores?"*
  - *"Quando a pessoa for selecionar tinha que ter uma forma de pesquisar, isso em todos os itens. Pq imagina a gente
    tem 30 obras aí tem que ficar scrolando até achar uma, a mesma coisa com os fornecedores. Os outros não precisa
    de pesquisa."*
- **O contexto:** mais cedo, ele confirmou que ninguém da equipe usa a OC. Medi: 2 OCs na produção, as duas de 08/08,
  e nada em `compras` há 14 dias.

**A pausa de 04/09 acaba para a lista do §2.** O resto das suas pendências (2, 3 e 4) continua como está.

## §1 — Primeiro: a lista vazia. A causa foi minha

**Medido no log da API da produção:**
- às 13h12Z, o navegador do Pedro pediu `/rest/v1/fornecedores?select=*` e `intervencoes`;
- ele **não** pediu `fornecedor_resolvido`;
- o código novo (`04e5035`) pede os dois juntos, no mesmo `Promise.all`. Então **ele rodou o pacote velho**
  (`ba1c9806`), que o service worker guardou.

**Por que a lista veio vazia:** o pacote velho filtra pelo `fornece_material` cru da filial. Às 09h59 de hoje, o Banco
fez a limpeza das filiais (a minha D540), e o cru foi a **0**. A resolvida continua com **138**.

**O erro é meu.** Na D540 eu contei os 8 leitores no `main` e no pacote servido, mas não contei os navegadores que
ainda rodavam o pacote velho. **Cliente velho em cache também é leitor.**

**O que eu peço:**
1. **Meça como o pacote novo chega a quem já tinha o velho.** Com `registerType: 'autoUpdate'`:
   - a primeira visita depois de publicar mostra o velho?
   - a página recarrega sozinha? em quanto tempo?
   - uma aba aberta desde antes fica no velho até quando?
2. **Se um cliente pode continuar no velho depois de uma publicação,** a tela passa a conferir a versão ao abrir e ao
   voltar o foco, e recarrega quando a versão mudou. Com trava e sabotagem.
   - **O motivo:** toda publicação que anda junto com uma mudança do banco tem essa janela. Com a equipe usando, a
     lista vazia seria de todo mundo.

Diga ao Pedro, na carta, o que ele faz agora para sair do velho: fechar a aba e abrir de novo, ou Ctrl+Shift+R.

## §2 — As melhorias, nesta ordem

1. **Pesquisa na Obra e no Fornecedor, e só neles.**
   - O campo passa a aceitar texto, e a lista vai filtrando enquanto a pessoa digita.
   - No fornecedor, a pesquisa acha pelo nome que a tela mostra (o apelido da empresa), pela razão social e pelo
     fantasia. Na obra, pelo nome que a tela mostra.
   - **Onde:** em todo lugar em que a pessoa escolhe uma obra ou um fornecedor numa lista. É a Nova OC e, se houver,
     os filtros das listas (Histórico e outras). Na carta, dê a lista desses lugares, com arquivo e linha.
   - **Os outros campos de escolha não mudam:** ECR, unidade, emitente e os que houver.
   - Funciona pelo teclado (Tab, setas, Enter, Esc) e no celular a 375 px.
   - Com a pesquisa vazia, a lista inteira aparece, como hoje.
2. **O primeiro acesso** (a sua pendência 9, itens b e c):
   - "Primeiro acesso" ganha a sua própria frase, porque quem nunca teve senha não tem o que redefinir;
   - depois da frase, a pessoa tem um botão para enviar.
   - **Não aperte com e-mail de verdade:** é ato que sai da máquina. A prova vai até o botão aparecer e mandar o que
     deve. Quem aperta com o e-mail de verdade é o Pedro, na conferência dele.
   - Os três detalhes de aparência da mesma tela (d, e, f: o alvo de toque de 29 px, o rodapé de 11,5 px e o marco
     `<main>`) vão junto.
3. **A Nova OC no celular** (a sua pendência 12): o título e a fila de botões cabem a 375 px, sem rolar para o lado.

## §3 — Como publicar

- **Direto na produção,** pela palavra do Pedro no §0 e pela emenda 3. Não há sentada no ensaio antes.
- **Antes de publicar,** o de sempre: typecheck, testes, build, travas com sabotagem para o que tiver regra (a pesquisa
  filtra; a lista vazia sem pesquisa é a lista inteira; os campos que não têm pesquisa continuam sem).
- **Depois de publicar,** meça por fora, como na D536: o pacote servido e o ref da produção. Anote a versão que saiu do
  ar: ela é o desfazer.
- **A tela logada, nem você nem eu vemos.** Por isso, a carta leva as linhas prontas para o Pedro conferir no endereço
  de verdade, numeradas.
- Pode publicar **por entrega:** primeiro o §1 com a pesquisa, e depois o resto. Ou tudo junto, se sair junto no mesmo
  dia. Quem escolhe é você.

## §4 — O que não muda

- Nenhuma migration: o banco é do Banco_de_Dados.
- A ordem de teste é do Pedro, depois das melhorias. A primeira vai pegar o número 2026/008, e ele já sabe.

— CTO (cto-2a, local_ddad6d2d-9bda-42a8-8c7b-30d90fc7a182)
