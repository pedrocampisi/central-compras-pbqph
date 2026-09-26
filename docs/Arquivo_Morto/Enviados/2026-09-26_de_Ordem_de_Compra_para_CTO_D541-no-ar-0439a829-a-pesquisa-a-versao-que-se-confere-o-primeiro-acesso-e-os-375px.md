# D541 — no ar, tudo junto: `0439a829` (o desfazer é `ce7f479e`). A pesquisa na Obra e no Fornecedor, a tela que confere a própria versão, o primeiro acesso e a Nova OC a 375px

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 10h5x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D541-a-pausa-acabou-melhorias-direto-na-producao.md`
**Espero de volta:** nada. A conferência logada é do Pedro — as linhas estão no §6.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §0 — Para o Pedro sair do pacote velho AGORA

O navegador dele ainda pode estar no pacote de 25/09, que não tem o vigia. **Um Ctrl+Shift+R na
aba da OC** (recarregar ignorando o que está guardado) já traz o novo. Sem teclado (celular):
**abrir o endereço, fechar, abrir de novo.** Daqui para a frente, a tela sai do velho sozinha.

## §1 — O cliente velho: medido, e consertado

Medido no navegador embutido, servindo dois pacotes em sequência (A e depois B), com o registro
que estava no ar:

```
   aba aberta desde antes ...... fica no velho indefinidamente (1 min parada, nada muda)
   1a visita depois ............ roda o VELHO. O worker novo instala e assume por tras
                                 (skipWaiting + clientsClaim), mas a pagina nao recarrega:
                                 o registerSW.js so' registra
   2a visita ................... roda o novo
```

**Sim, um cliente pode continuar no velho** — e foi isso que o Pedro viu. O conserto:

```
   o build ......... grava AAAAMMDDhhmmss-commit dentro do pacote e em /versao.txt (fora do
                     precache — se o worker o guardasse, a pergunta "o que esta' no ar?"
                     seria respondida pelo cache)
   a tela .......... le /versao.txt sem cache ao abrir e a cada volta do foco (no maximo a
                     cada 30s). Mudou: pede ao worker o pacote novo, espera ele assumir,
                     recarrega
   OC em edicao .... NAO recarrega (a OC mora so' na memoria): avisa, e troca quando a
                     edicao termina
   sem laco ........ nao recarrega duas vezes pela mesma versao; e o que nao tem o formato
                     nao e' versao — medido no ar: arquivo inexistente volta 200 text/html
                     (a pagina inicial). Sem essa trava, recarregaria para sempre
```

Medido com o vigia, pacotes C → D → E servidos em sequência:

```
   aba no C, volta o foco ....... recarregou sozinha em < 5s, ja' no D (um passo so')
   visita com o D no cache ...... abriu o D, conferiu, recarregou sozinha no E
                                  (a navegacao aparece como "reload")
   o foco 18s depois de abrir ... nao conferiu (o intervalo minimo de 30s) — de proposito
```

O `conferir:pacote` ganhou a 5ª pergunta (a versão é legível, está dentro do JS e fora do
precache). **Ela reprovou um pacote certo na estreia**: o minificador escreve a constante entre
crases, e a pergunta procurava aspas. O defeito era da pergunta; consertada, 5 de 5.

## §2 — A pesquisa, e só na Obra e no Fornecedor

Os lugares em que se escolhe obra ou fornecedor numa lista — **todos**, no commit `beae35d`:

```
   src/features/ordens-compra/NovaOcPage.tsx:607 ...... Nova OC, Fornecedor
   src/features/ordens-compra/NovaOcPage.tsx:627 ...... Nova OC, Obra
   src/features/ordens-compra/HistoricoPage.tsx:256 ... Historico, filtro de fornecedor
   src/features/ordens-compra/HistoricoPage.tsx:264 ... Historico, filtro de obra
```

Fora da lista, dito para não parecer esquecimento: `src/features/prestadores-servico/
NovaAvaliacaoDrawer.tsx:149` tem um campo de obra, mas **nenhuma tela abre esse componente**
(nenhum import fora dele). Os outros campos de escolha **não mudaram**: ECR e unidade (itens da
Nova OC), condição de pagamento, status (Histórico), categoria (Prestadores) — há teste que falha
se Condição, ECR, unidade ou status deixarem de ser lista.

Como acha: cada palavra digitada, sem acento e sem caixa, em qualquer ordem, no rótulo que a tela
mostra, na razão social, no fantasia e no **apelido da empresa** (`empresa_apelido` de
`core.fornecedor_resolvido`, lido junto). Uma correção ao §2 da D541: a tela mostra a **razão
social** (com cidade e final do CNPJ quando repete), não o apelido. Por isso o apelido aparece como
linha menor embaixo quando o rótulo não o contém — sem ela, digitar "Império" e ver "Beija Flor
Comércio de Tintas" pareceria engano. Pesquisa vazia = a lista inteira, com a opção vazia
(Selecione… / Todos …) no topo. Teclado: setas, Enter escolhe, Esc e Tab saem sem mudar nada.

Visto a 375px, com a tela real e dados inventados numa página de prova temporária (apagada): digitei
`imperio` e vieram as duas filiais da Beija Flor com "Império das Tintas" embaixo; seta para baixo +
Enter escolheu a segunda, com o endereço dela embaixo do campo; Tab, `galpao`, Enter escolheu a obra.

## §3 — O primeiro acesso (pendência 9 b–f)

```
   b ... "Primeiro acesso" tem titulo e frase proprios: "Sua conta ja' foi criada pelo
         administrador. Informe o seu e-mail da empresa: enviamos um link para voce criar a
         sua senha." "Esqueci minha senha" tem a dele. Nenhuma das duas fala em redefinir
   c ... a acao laranja vira "Enviar link para criar minha senha" (ou "…de senha nova"), o
         campo Senha some, e ha' "Voltar para entrar". O foco vai para o e-mail
   d ... "Esqueci minha senha": 44px de alvo (era 29)
   e ... rodape: 12,5px (era 11,5)
   f ... as tres telas da porta dentro de <main>
```

O envio é o mesmo link do Supabase nos dois casos (as contas nascem sem senha) — muda o que se diz,
não o que se manda. **Não apertei com e-mail de verdade.** A prova foi até o botão: nos testes, com o
cliente do Supabase simulado, o botão manda **exatamente o e-mail digitado**, uma vez; sem e-mail, não
manda nada e pede o e-mail. Na página de prova, a 375px, Enter com o campo vazio mostrou "Informe o
seu e-mail." Dois detalhes que apareceram ao olhar e foram junto: os dois botões da entrada tinham
altura fixa e espremiam o texto quando ele quebra em duas linhas a 375px — agora altura mínima.

## §4 — A Nova OC a 375px (pendência 12)

A fila de quatro botões era um `flex` sem quebra: transbordava e espremia o título até ele quebrar
palavra por palavra. Agora o título pede 260px e a fila desce, quebrando entre botões. Medido a
375px: título em **1 linha**, botões em 2 linhas, **nenhum** passando da borda, rolagem para o lado
**0** (375 = 375). Visto na página de prova, sem a moldura do aplicativo logado — a conferência na
moldura é a do Pedro (§6, linha 6).

## §5 — Travas, publicação, medidas

```
   sabotagens ... 9, todas mordendo (saida 1) e restauradas com hash igual: pesquisa vazia
                  deixa de mostrar tudo (1 vermelho) · a pesquisa para de filtrar (7) ·
                  apelido e fantasia saem (1) · um campo sem pesquisa deixa de ser lista (1) ·
                  a trava contra laco some (1) · recarrega com OC em edicao (1) · aceita a
                  pagina inicial como versao (1) · a frase antiga do primeiro acesso volta (1) ·
                  o campo Senha volta no primeiro acesso (1)
   bateria ...... 149 verdes (eram 118), lint limpo, typecheck, build, conferir:pacote 5/5,
                  conferir (documentos) 7/7
   commit ....... beae35d (codigo); a main empurrada leva tambem os cadernos desta carta
   saiu do ar ... ce7f479e-0020-4982-8066-fd0adec5f9dc (25/09 23h19 UTC)  <- O DESFAZER
   entrou ....... 0439a829-6134-4031-a37a-b2be33ffa2fc · versao 20260926134940-beae35d
   medido depois, por fora, sem entrar:
     /versao.txt ................. 200 text/plain, "20260926134940-beae35d"
     bundle index-CDKmPNbL.js .... a versao 1 · fornecedor_resolvido 1 · empresa_apelido 4 ·
                                   "Nada encontrado" 1 · "Enviar link para criar minha senha" 1
     ref da producao ............. presente · ref do ensaio: 0
     sw.js ....................... nao precacheia versao.txt (0)
     /, manifesto, registerSW.js, sw.js ... 200, tipo certo
```

## §6 — As linhas prontas para o Pedro, em compras.campisi.com.br

> 1. **Antes de tudo: Ctrl+Shift+R** na aba da OC (ou, no celular, abrir, fechar e abrir de novo).
> 2. **Nova OC → Fornecedor:** clique no campo e digite `imperio`. Devem aparecer as filiais da
>    Beija Flor, com "Império das Tintas" embaixo. Apague o texto: volta a lista inteira (138).
> 3. **Só pelo teclado:** no Fornecedor, digite parte de um nome, seta para baixo, Enter. Tab vai
>    para a Obra; digite parte do nome de uma obra, Enter. As duas escolhas ficam, com o endereço
>    e o "Faturar para" embaixo como antes.
> 4. **Esc** no meio de uma pesquisa: a lista fecha e a escolha de antes continua.
> 5. **Histórico:** os filtros de fornecedor e de obra aceitam texto do mesmo jeito; o de status
>    continua lista.
> 6. **No celular, Nova OC:** o título numa linha, os botões em duas, sem arrastar a tela para o lado.
> 7. **Saia e veja a entrada:** "Primeiro acesso" mostra a frase própria e o botão "Enviar link para
>    criar minha senha", sem o campo Senha. **Aqui você pode apertar com o seu e-mail** — deve
>    chegar o link; eu não apertei.
> 8. **A versão se confere sozinha:** na próxima publicação, deixe a aba aberta; ao voltar para ela,
>    a tela se atualiza sozinha (com uma OC aberta, ela avisa e espera você salvar ou fechar).

## O que fica

```
   com o Pedro ...... as linhas do §6; a ordem de teste, depois delas
   com o senhor ..... nada
   comigo ........... a pendencia 13 (a sessao de prova), como o senhor escreveu na D536;
                      as 2, 3 e 4 seguem pausadas
```

— Ordem_de_Compra
