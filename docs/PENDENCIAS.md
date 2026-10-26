# Pendências — Ordem de Compra

> **Data:** 29/09/2026
> **Estado:** VALE HOJE
> **Escopo:** o que **esta casa** tem para fazer, na ordem em que se faz. O que espera outro
> agente está na pasta [`Enviados/`](Enviados/); o que chegou e não foi tratado, em
> [`Devolucoes/`](Devolucoes/).

**De cima para baixo é a ordem em que se faz.** Item novo entra na posição que merece, não no
fim.

**O número de um item não é reaproveitado quando ele fecha.** Some da lista e deixa o buraco: as
cartas já enviadas apontam para o número, e carta enviada não se corrige. Buraco na numeração é
mais barato que carta apontando para o item errado.

---

## ⏸️ Esta casa está pausada — palavra do Pedro em 04/09/2026 (com a lista de 26/09 fora dela)

> ▶️ **26/09/2026 — a pausa acabou para uma lista (CTO-D541, palavra do Pedro na janela do CTO):**
> pesquisa na Obra e no Fornecedor, o primeiro acesso (pendência 9 b–f) e a Nova OC a 375px
> (pendência 12), **direto na produção**. Feitas e NO AR no mesmo dia (decisão 35). As
> pendências 2, 3 e 4 continuam pausadas.

> *"quero pausar a ordem de compra por enquanto e focar na central financeira"*

**Sem prazo declarado, então vale até ele dizer o contrário.** O que a pausa faz:

```
   PARA ....... abrir trabalho novo, adiantar pendencia, propor construcao
   PARA ....... (a pendencia 7, o PWA, saiu desta lista em 14/09: palavra do Pedro,
                so' para ela. Feita e NO AR na mesma noite. Em 14-15/09 ele liberou
                mais duas, pelo CTO: a lista de fornecedores da OC (D389) e o
                destinatario da nota (D390) -- feitas, provadas no ensaio e NO AR
                desde 15/09 12h4x, palavra dele: decisoes 31 a 33)
   FICA ....... tudo o que ja' esta' feito: a virada empurrada, o aviso no ar,
                o ramo aposentado. Nada se desfaz
   CONTINUA ... responder carta que chegar. Pausa nao e' silencio
```

~~A pendência 1 fica porque ela **é do Pedro e não minha**: espera ele, não eu.~~ **Fechada em 30/09/2026**
(decisão 71): as 004 e 005 saíram pela palavra nova do Pedro, e a 008 e a 009 provaram a emissão.

---

## 🔴 Abertas

### 44. A OC no mesmo MCP (CTO-D953): o plano mandado, esperando a aprovação

*Aberta em 26/10/2026, na decisão 143.* O Pedro quer o Antigravity na OC pelo MCP da Central, sem conector novo. O
plano foi ao CTO, com cópia ao Banco e à Central:
- quatro ferramentas, que só montam um **rascunho**: a IA não emite;
- a regra de quem entra na OC e da matriz vai para o banco antes;
- a prova é no ensaio, e o perito vem antes da produção.

**Falta, nesta ordem:**
1. a aprovação do CTO (as escolhas A, B e C) e os nomes do Banco;
2. o lado do Banco: a regra única e as funções `ia_*`, no ensaio;
3. o meu ramo: o aviso "Montado pela IA" e a carga lendo a regra do banco, sem publicar;
4. o perito;
5. a produção, na ordem do §12.8, e o teste de gente.

---

### 28. O app do mestre de obra (D693, D696): no ar, esperando o primeiro uso

*Aberta em 04/10/2026, na decisão 80; atualizada nas decisões 81, 84, 85, 86, 87 e 88.* **No ar desde 05/10, 10h53,
em `73d2b3db`** (decisão 88): a tela do mestre ligada ao contrato do Banco, o lado do escritório (Recebimentos), a tela
"Mestres" com o QR e o caminho do iPhone. O desfazer da tela é `4da03d09`.

**Falta:**
- ~~a conferência do CTO da versão no ar~~ — **conferida** (CTO, 05/10, commit `3503160` dele);
- **o primeiro uso** (D716): o primeiro mestre é cadastrado pelo engenheiro que o Pedro escolher, nunca por esta casa.
  No dia, esta casa fica de prontidão até o primeiro recebimento sair (pendência 31).

---

### 30. ~~O teste do título uma vez só (D643, a Nova OC) às vezes falha~~ — consertado e no ar (decisão 133)

*Aberta em 04/10/2026, na decisão 84; atualizada na decisão 87.* Falhou uma vez na `main` (decisão 83) e duas vezes
no ramo do mestre (a última em 05/10), sempre no meio da bateria inteira; sozinho e nas rodadas seguintes, passou. O código não mudou entre as rodadas: é tempo, não
regra. **Falta:** achar a espera que está curta (`tests/components/TituloUmaVez.test.tsx`) e prová-la com a bateria
rodando várias vezes seguidas.

**16/10, decisão 132 (CTO-D853):** a causa foi achada, e não é espera nem é do teste. A OC nova nasce em `buildNewOc` com duas
chamadas de `nowIso()`. Quando elas caem em milissegundos diferentes, o título diz "Editar OC" numa OC em branco. As
duas linhas são de 06/05/2026 (`aff88db`). Medido: 1 queda em 20 rodadas da bateria, e 1 em 630 no experimento com 30
cópias do teste.

**16/10, decisão 133 (CTO-D855):** consertado. A OC nova lê o relógio uma vez só. O teste do relógio
(`TituloDaOcNova`) e a sabotagem ficaram vermelhos antes e verdes depois. **No ar em `10f05c50`**, pacote `20261017012248-48ff24c`,
pelo `main` `48ff24c`; o desfazer é `41898c74`.

---

### 31. O QR do mestre e o celular que guarda, num aparelho de verdade

*Aberta em 04/10/2026, na decisão 84; mudada na decisão 87.* O caminho do iPhone (o QR no Safari pede o ícone; o ícone
lê o mesmo QR e entra) e o celular que guarda (o IndexedDB) estão provados em teste e nas fotos, sobre um banco falso.
**O ensaio de cinco minutos saiu** (CTO-D716). **Falta:** o primeiro uso na produção, com o engenheiro ao lado até o
primeiro recebimento sair. Esta casa fica de prontidão para consertar no mesmo dia. Vai na carta da produção.
---

### 33. A coluna ECR da tabela de itens, a 375, corta o código

*Aberta em 05/10/2026, na decisão 90 (CTO-D729 §2).* No celular, a coluna ECR da Nova OC é estreita e não mostra qual
ECR o item tem. Já era assim antes do ramo da D728. **Para depois:** não se mexe agora.

---

### 34. A pergunta longa do critério passa por cima da borda da caixa

*Aberta em 05/10/2026, na decisão 90 (CTO-D729 §2).* No "Qualificar", a legenda longa (o "3. O fornecedor consegue
atender conforme o prazo estipulado pela construtora?") quebra em duas linhas e cruza a borda do quadro, a 375 e na
foto do Pedro a 1366. Já era assim antes do ramo da D728. **Para depois:** não se mexe agora.

---

### 36. ~~A Rev. 01 do PS.02 (D738 a D741)~~ — gravada pelo Pedro, e o rascunho fora do código (decisão 141)

*Aberta em 06/10/2026, na decisão 96.* A página com o rascunho e o "Gravar a Rev. 01", só para quem revisa ECR, está
**no ar** desde 17h23 de 06/10:
- em `36e26eab`, versão `20261006202414-e5944b6`, pelo `main` `e5944b6` (decisão 98);
- o desfazer é `c1816ff8`;
- **conferida por fora pelo CTO** (D741, só registro, CTO `b17f501`).

A Rev. 01 **não foi gravada**: a vigente no banco é a Rev. 00.

**17/10, decisão 134 (CTO-D857, palavra do Pedro: "Pode"):** antes da sentada, o rascunho ganha o papel do fornecedor
(a parte C). Ele está no ramo `d857-rev01-com-a-parte-c` (`a937762`), **sem publicar**, com 37 mudanças, 64 âncoras e o CI
verde. Espera a aprovação do CTO; depois, publicar (emenda 3), e só então a sentada.

**17/10, decisão 135 (CTO-D857b):** aprovado, com o acréscimo do encarregado. O rascunho com o papel do fornecedor
está **no ar** em `109f5e71`, versão `20261017141917-9fac9f5`, pelo `main` `9fac9f5`; o desfazer é `10f05c50`. Medido por
fora. Agora, só falta a sentada.

**23/10, CTO-D887:** o Pedro gravou a Rev. 01 às 15h12 (linha 266 de `core.procedimento_revisoes`), e a Rev. 00
continua no histórico. Os passos 1 e 2 fecharam, e a meta de 23/10 foi cumprida. Falta só o passo 3: o rascunho sai do
código na próxima publicação, que será a da D888 (decisão 139). Não se publica só para isso.

**23/10, decisão 140:** o rascunho já saiu do código no ramo `d889-total-ao-centavo` (`8a0f08e`), sem publicar.
O passo 3 fecha quando esse ramo subir.

**23/10, decisão 141:** o ramo subiu em `680ee679`, e a medida por fora não acha pedaço do rascunho no pacote.
**Fechada.**

**Falta, nesta ordem:**
1. a sentada do Pedro, que lê o que mudou e grava com a mão dele, ou recusa uma frase (aí o CTO escreve, ela muda
   pelo script e volta a ele);
2. o CTO confere a gravação por SELECT e avisa;
3. na publicação seguinte, o rascunho sai do código (D739 §4.3).

Meta: 23/10.

---

### 37. O tutorial da Nova OC e a frase do 502 (D763 a D765, D757): no ar, esperando o teste do Pedro

*Aberta em 10/10/2026, na decisão 99.* O tutorial "Fazer uma OC", com os "?" novos, e a frase nova do 502 estão
**no ar** desde 09h35 de 10/10:
- em `656d33e5`, versão `20261010123530-0e7717e`, pelo `main` `0e7717e` (decisão 101);
- o desfazer é `36e26eab`.

**Falta, nesta ordem:**
1. a conferência do CTO por fora;
2. o teste do Pedro com uma pessoa de verdade, com a contagem de OCs antes e depois, feita pelo CTO;
3. se der certo, o mesmo jeito nas outras telas, quando o CTO mandar.

---

### 38. O ícone, as perguntas, a lista do mestre e o "Só uma parte" (D792 a D797): no ar

*Aberta em 13/10/2026, na decisão 102.* Tudo está **no ar**:
- o ícone do castor, as duas perguntas novas, o número da nota em dígitos e a lista fechada com busca por palavra,
  desde 16h52 de 13/10 (decisão 103);
- a lista do "Só uma parte", com a quantidade por item, desde 17h52 de 13/10, em `9e74c0f0`, versão
  `20261013205131-05e6848`, pelo `main` `05e6848` (decisão 105). O desfazer é `2b8e223f`.

**Falta:**
1. a medida do CTO da primeira entrega com itens no banco (a D795 e a D797 ele já conferiu por fora);
2. o Pedro, e cada mestre, trocar o ícone no celular: remover o antigo e pôr de novo pelo Chrome.

---

### 39. "Encarregado" em todas as telas e no rascunho do PS.02 (D799, D800): no ar; o resto é de outros

*Aberta em 13/10/2026, na decisão 106.* Tudo desta casa está **no ar**:
- **as telas e a busca:** desde 22h02 de 13/10 (decisão 107);
- **o rascunho da Rev. 01 do PS.02:** desde 22h15 de 13/10, em `ea46638b`, versão `20261014011408-d81adc1`, pelo
  `main` `d81adc1` (decisão 109). O desfazer é `685ccd1c`.

**Falta, fora desta casa:**
1. o Pedro ler o rascunho e apertar "Gravar a Rev. 01". Só ele aperta;
2. o Banco trocar as recusas do banco que dizem "mestre" (CTO-D800 ao Banco);
3. ~~o Pedro decidir o que fazer com o papel `encarregado` do banco~~: aposentado (CTO-D837, decisão 127).

---

### 42. ~~A D819: quando a qualificação foi lançada no sistema~~ — no ar

*Aberta em 15/10/2026, na decisão 125.*
- **O ramo:** `d819-qualificacao-lancada` (`566bae5`), **sem publicar**.
  - A tela mostra "lançada no sistema em DD/MM/AAAA" na linha aberta e no Histórico, quando o lançamento é depois da
    data. Não trava, e o PDF não muda.
- **No ar desde as 22h49 de 15/10** (decisão 126): está em `2e116146`, versão `20261016014924-5a07ec2`, pelo `main`
  `5a07ec2`, com a medida por fora. O desfazer é `9178a00a`.
- **Na junção com o ramo 2 da parte C,** o conflito na `.rolagem` do CSS se resolve com uma regra só.
- A D819 e a D822 foram ao arquivo morto.

### 41. ~~A D814: o perfil sem a Ordem de Compra~~ — no ar

*Aberta em 15/10/2026, na decisão 119.* Decisão do Pedro: uma pessoa do financeiro entra na Central de Dados, e não
precisa da Ordem de Compra.
- **A trava é do banco:** a marca `core.perfis.sem_ordem_de_compra`, e a recusa "Seu acesso não inclui a Ordem de
  Compra.".
- **A tela só avisa:** ela lê a marca na `perfilAtual`, e com a marca não entra, com a frase e o "Sair". Sem a marca,
  fica tudo como hoje.
- **Os testes:** com a marca, o aviso; sem a marca, como hoje; e uma sabotagem que deixa entrar.
- ~~**Num ramo, contra o banco falso, sem publicar.**~~ **Feito** no ramo `d814-perfil-sem-oc` (`b4128df`, decisão
  120), com o CI verde, 8 sabotagens vermelhas e 3 fotos.
- ~~**A conferência e a ordem de publicar do CTO.**~~ **No ar** em `9178a00a`, versão `20261016001818-b3e7722`, pelo
  `main` `b3e7722` (D816, decisão 122), com a medida por fora; o desfazer é `f47f687c`.
- **Fechada para esta casa.** A marca no banco é do Banco; até ela chegar, todos entram como antes.

---

### 43. ~~O cadastro novo de fornecedor pela regra única do Banco (D877b)~~ — fechada, não entra nesta volta

*Aberta e fechada em 17/10/2026 (decisões 137 e 138).* A medida mostrou que nenhuma tela cadastra prestador com Pix.
Por isso, pela CTO-D878, o "Novo prestador" nasce na Central, pela mesma função da IA. A gaveta do fornecedor de
material fica como está. Passá-la para uma função é melhoria à parte, fora desta volta.

---

### 40. ~~A D805: a política e o registro por ECR no PDF, a tela da qualificação, e a IA que monta a OC~~ — tudo no ar, e o teste do Pedro deu certo (decisão 142)

*Aberta em 15/10/2026, na decisão 110.*
1. ~~**a parte A**~~ **no ar** em `6547e313`, versão `20261015191902-1f530e7`, pelo `main` `1f530e7` (decisão 112),
   com a medida por fora; o desfazer é `ea46638b`;
2. ~~**a trava da Data**~~ **no ar** em `f47f687c`, versão `20261015210401-3e09378`, pelo `main` `3e09378`
   (decisões 115 e 117), com a medida por fora; o desfazer é `6547e313`. Desde as 21h18 de 15/10, o no ar é o
   `9178a00a` (o aviso da D814, item 41);
3. **a parte C** (o registro do fornecedor por ECR): **o desenho está aprovado** (D812 §2), com três ajustes:
   - o comprador corrige o alcance, com registro;
   - a marca "a cada entrega" nas ECRs 01, 02 e 17;
   - o alcance que o encarregado conferiu.

   - **o primeiro ramo, o recebimento,** está no ramo `d812-c1-registro-no-recebimento` (`3204be1`, decisões 118 e
     119), **sem publicar**, conferido pelo CTO (D815). A gravação de uma entrega é medida pelo Banco no ensaio,
     com o corpo que mandei (decisão 121): **deu 11 de 11.** O conserto da D818 está em `39c594e` (decisão 124);
   - **o segundo ramo, a qualificação,** está no ramo `d815-c2-registro-na-qualificacao`, **sem publicar**. Ele foi
     conferido pelo CTO (D818), e os três consertos estão em `4d949e2` (decisões 123 e 124).
   - **congelados até a triagem da perícia** (D821): o ramo 1 em `39c594e`, o ramo 2 em `87f991b` (decisão 125).
   - **a parte C foi refeita** (CTO-D840, decisão 127): o papel entra pelo escritório, e o carimbo só tem um
     botão opcional. O plano foi aprovado pela D845, e **o ramo novo é o `d840-parte-c-refeita` (`07f3835`)**, sem
     publicar, com 1250 testes, 97 de 98 sabotagens vermelhas e 11 fotos (decisão 128). O Banco já construiu a parte
     dele no ensaio (a D842 dele). Os dois ramos velhos seguem congelados;
   - **daqui em diante, a ordem é:**
     1. ~~a aprovação do plano~~ (D845);
     2. ~~o ramo novo~~ (decisão 128);
     3. ~~a medida no ensaio, só lendo~~ (decisão 129): a forma bate; o ensaio não tem entrega, e uma linha de
        verdade pede gravar, o que fica com o CTO;
     4. ~~a perícia, uma só, sobre o código final~~ (CTO-D850, decisão 130): os meus achados 2, 5, 7 e a metade
        do 4 eram verdadeiros e estão consertados em **`a986686`**, com 1258 testes, 11 de 11 sabotagens vermelhas e
        o CI verde. O CTO conferiu (D852): 7 de 7;
     5. ~~o contrato do Banco na produção~~ (D852): conferido pelo CTO e medido por mim, só lendo (decisão 131);
     6. ~~publicar~~: **no ar em `41898c74`**, pacote `20261017004648-68a1b39`, pelo `main` `68a1b39` (decisão 131),
        com a medida por fora; o desfazer é `2e116146`. Os dois ramos velhos ficam no repositório (apagar é com o
        sim do Pedro).

   Constrói-se com a recomendação até a resposta do Pedro (o item 24 dele);
4. **a parte B** (a IA monta o alto e os totais da OC): **no ar** em `af74b1e7`, versão `20261017163659-7460451`,
   pelo `main` `7460451` (o ramo `d805b-ia-monta-a-oc` em `2e82f99`, decisão 136), com a medida por fora; o desfazer é
   `109f5e71`. O Pedro mandou tirar o ensaio do caminho (CTO-D865): o teste dele passa a ser na produção. A 5174
   caiu, e o `launch.json` voltou ao do repositório.
   - ~~a conferência do CTO por fora~~ (D866, 13h4x: só a parte B mudou em `src`, +463 e −11);
   - ~~a versão 24 pelo Banco e o teste do Pedro~~: o Pedro testou em 23/10 um orçamento real de 11 itens. Os itens,
     as quantidades, a ECR e a condição vieram certos. Ele achou dois defeitos: o total não bateu ao centavo (455,96
     contra 456,00), e o fornecedor não saiu, porque o papel não traz CNPJ;
   - **a D888 (e a D888b, a matriz):** o plano foi ao CTO, com cópia ao Banco (decisão 139). Cada linha fecha no total
     impresso, a OC fecha no rodapé com o arredondamento declarado, o desconto entra uma vez só, o cartão do "Total
     lido" mostra os dois números, e sem CNPJ o fornecedor sai pelo nome, na matriz. **Falta:** a aprovação (com as
     duas escolhas: onde mora o arredondamento e a forma do preço), o plano do Banco, os ramos, a `extrair-itens`
     primeiro e a tela depois, e a nova leitura do Pedro;
   - **a D889 aprovou o plano** (o arredondamento nos campos de hoje; a tabela com o desconto de 4 casas), e **a D892
     inverteu a ordem:** a tela sobe primeiro, e a função do Banco logo depois. **O ramo está pronto, sem
     publicar:** `d889-total-ao-centavo`, `8a0f08e`, com o CI verde, 1317 testes, 9 de 9 sabotagens e 12 fotos
     (decisão 140). **Falta:**
     1. ~~a conferência do CTO e a ordem~~ (D893: aprovado, com o número grande do cartão trocado pelo total da OC);
     2. ~~publicar~~: **no ar em `680ee679`**, pacote `20261023192757-1afc8e0`, pelo `main` `1afc8e0`, medido por fora;
        o desfazer é `af74b1e7` (decisão 141);
     3. ~~a conferência do CTO por fora, e a função do Banco logo depois~~ (a `extrair-itens` versão 11, D894 do Banco);
     4. ~~a nova leitura do Pedro~~: "deu certinho" (a leitura 578, pela D900 do CTO).

     **Fechada a D888.** De carona, a D900 tirou a coluna PRAZO dos itens (decisão 142);
5. ~~**a sobra:** o campo "Requisito de Qualidade" da Configuração~~ saiu, com a parte A (decisão 112).

**A D808 chegou às 16h0x:** a parte A está aprovada; o campo "Requisito de Qualidade" sai da tela antes de
publicar; a trava da Data é sim, com o banco primeiro e a tela desta casa depois da parte B.

A D805 e a D816 ficam na `Devolucoes` até lá. As D840, a D845, a D842 do Banco, a D848, as D850 e a D852 foram ao arquivo morto (decisões 128 a 131). A D806, e da D808 à D814, foram ao arquivo morto.
**A D815 §3 foi decidida pelo Pedro** (CTO-D840): ninguém pergunta o papel na entrega, e a pergunta do escritório
morreu. O papel entra pelo escritório.

---

### 2. Dívida: `extractItems.ts` lê o endereço do banco sem conferir se veio

*Minha, para quando o congelamento sair em **06/09/2026** — entra junto com o item 3.*
Anotada em 02/09 por ordem do `CTO`: **é dívida, não defeito vivo.**

```
   src/services/supabase/client.ts:15   as string | undefined  +  throw se faltar
   src/services/ai/extractItems.ts:86   as string              +  NADA
```

O `client.ts` estoura na cara de quem abre quando a variável falta. O `extractItems.ts` faz o
mesmo `import.meta.env['VITE_SUPABASE_URL']` **sem checagem nenhuma**: ficaria `undefined`
calado. Achado em 02/09, lendo o código por causa da carta da publicação.

**Por que é dívida e não defeito:** publicação sem endereço **não sai mais** — a trava mudou de
casa em 02/09 (de `deploy.yml` para `scripts/conferir-pacote.js`, que roda dentro do `pnpm
deploy`), mas a pergunta é a mesma e agora ela está no caminho do ato real. O caminho que levava
ao `undefined` deixou de existir pela porta da publicação. O que fica é a diferença de tratamento entre dois arquivos que leem a mesma coisa —
e diferença sem motivo escrito é armadilha para quem chegar depois.

**Não foi consertado de propósito:** é código de produto, e produto está congelado (decisão 137
do `CTO`: o congelamento mede o que o usuário vê).

**Uma segunda coisa da mesma família entra aqui**, medida pelo `CTO` em 02/09: se o Correio da
plataforma for desligado por semanas, o banco gratuito pode pausar — e **a tela mostra o erro do
banco cru**. Hoje não é risco vivo (o Correio escreve a cada 30 minutos, o backup todo dia às
08:00, e o gratuito só pausa com **sete dias** quietos), mas é o mesmo assunto: *o que a pessoa vê
quando a camada falha*. A decisão 5 já disse que recusa conhecida vira frase de gente; **banco
pausado ainda não é uma delas.**

### 3. A minha conferência de segurança é de mão, e não declara o que confunde

*Minha.* Anotada em **02/09/2026**, no fim do dia, por uma régua que o `CTO` passou **por
campainha** — e campainha não mora em casa nenhuma, por isso está escrita aqui.

Antes de **cada** publicação deste dia eu rodei uma varredura de segurança no que ia subir:
e-mail de terceiro, CPF, CNPJ, chave, endereço de banco. Ela nunca deixou passar nada. **E ela
não é peça desta casa:** é um comando que eu escrevo na hora, diferente a cada vez, que ninguém
pode rodar, repetir, conferir nem sabotar. **Instrumento que só existe dentro de uma conversa
morre com ela** — é o que eu mesma escrevi na carta do exame das oito lições, sobre os meus
detectores avulsos.

E ela tem um defeito medido, na última corrida de hoje: acusou `sb_secret_` em três arquivos.
Eram **as três frases que dizem que a chave secreta nunca entra ali**. O achado morreu no meu
olho, não na ferramenta.

**Um segundo defeito, de outra família, medido na varredura da decisão 24:** ela acusou um
`integrity: sha512-…` do `pnpm-lock.yaml` como se fosse credencial. O padrão procura `eyJ` (o
começo de um JWT) **sem diferenciar maiúscula de minúscula**, e qualquer base64 comprido cedo ou
tarde contém `Eyj` no meio. Não é mentira ocasional: **é ruído garantido em todo arquivo de
travas.** Quando ela virar peça, a procura por JWT tem de ser **sensível a maiúsculas** e ancorada
no começo de um valor — senão a lista de achados fica longa demais para alguém ler de verdade, que
é como um vigia deixa de ser vigia.

> **A régua, que é desconfortável:** quanto melhor a casa documenta uma regra, mais o instrumento
> a acusa — **documento que proíbe algo contém, por obrigação, as palavras do que proíbe.** No
> mesmo dia a `Central_Email` bateu no mesmo defeito sem saber de mim: uma trava dela procurava
> `mark_read` e `move`, e pegou a frase impressa que diz *"não marca, não move"*.

**O que fazer quando ela virar peça** (não agora — é construção, e produto está congelado):

```
   guarda sobre CÓDIGO ····· lê a árvore do arquivo, não o texto. Foi assim que a
                             Central_Email consertou a dela
   guarda sobre TEXTO ······ declara no topo que CONFUNDE MENÇÃO COM USO, e não sai
                             verde por falta de achado nem vermelha por excesso: pede olho
```

**Enquanto isso vale o que sempre valeu:** ela continua rodando à mão antes de cada publicação, e
**todo achado dela é conferido um a um** antes de virar número em qualquer lugar.

### 4. A camada que fala com o banco não tem verificação nenhuma

> **Verde, nesta casa, quer dizer "o domínio está certo" — não "o programa grava certo".**

*Decidida pelo `CTO` em 28/08/2026: fica para DEPOIS da virada (decisão 86 do caderno dele).*
A conversa que decidiu isto está fechada, em [`Arquivo_Morto/Devolucoes/`](Arquivo_Morto/Devolucoes/) e [`Arquivo_Morto/Enviados/`](Arquivo_Morto/Enviados/). **Ninguém está esperando ninguém: o item é meu, e o que falta é o gatilho chegar.**

São 730 linhas, 15 leituras/escritas de tabela e 3 chamadas de função do banco, com **zero**
verificações e **zero** dublês. Os três defeitos apontados pelo `Banco_de_Dados` em 26/08 foram
achados por ele lendo o meu código — nenhum deles seria pego pela bateria daqui, com ela toda
verde.

**O gatilho, por escrito:** quando a virada fechar **e** o cadastro de fornecedor novo estiver
usando a fila de aprovação do banco, este item sobe para o topo da lista. A primeira coisa que ele
cobre são os três defeitos que o `Banco_de_Dados` achou lendo este código em 26/08 — eles já
provaram que a bateria verde de hoje não os pega.

**E o caminho está decidido junto: ensaio contra o banco de ensaio de verdade, nunca dublê fiel
inventado.** Dublê fiel de banco é a armadilha seguinte; banco de ensaio não finge.

### 5. Virada: migração dos dados reais e endereço do piloto

✅ **Duas partes deste item fecharam pela palavra do Pedro em 02/09/2026.** O **plano do banco
continua no gratuito** — e o `CTO` mediu antes de mandar construir "código que acorda", e **não
mandou**: `core.sinais_de_vida` já tem o Correio escrevendo a cada 30 minutos e o backup todo dia
às 08:00, enquanto o gratuito só pausa com sete dias quietos. **O código que acorda já existe e é
o próprio Correio.** E o **cadastro está lá**: a equipe não precisa digitar nada para começar.

✅ **O endereço saiu do indefinido na mesma noite:** `compras.campisi.com.br`, decisão 145 do
`CTO` — que **revogou** a ordem dele de mais cedo ("não toque no `base`") depois de medir que a
zona `campisi.com.br` já está na Cloudflare. O `base` **foi tocado** por isso, e o pacote agora
prova que sabe onde mora. Ver `PLANEJAMENTO.md`, decisão 23.

⚠️ **A HOSPEDAGEM MUDOU NA MESMA NOITE, e a lista de cima virou outra.** O Pedro perguntou por que
este software ia para o GitHub Pages se tudo o mais mora no Cloudflare, e disse **"vai com o
Cloudflare"** — confirmado por ele na janela, e não só por carta. O Pages morreu antes de nascer
no endereço próprio; o endereço `compras.campisi.com.br` **não muda**, muda quem serve. Ver
`PLANEJAMENTO.md`, decisão 24.

```
   ✅ preparado, sem publicar (commit de 02/09)
   ✅ 1  ensaio em compras.campisi.workers.dev ····· 03/09, palavra do Pedro
   ✅ 2  medido: tela abre, alcança o banco, recusa traduzida
            (o PDF NÃO foi medido: exige estar dentro — pendência 1)
   ✅ 3  produção: compras.campisi.com.br NO AR ···· 03/09, palavra do Pedro
            HTTPS válido, DNS na Cloudflare, e o endereço de ensaio
            desligado de propósito (`workers_dev: false`) — decisão 26
   ✅ 4  a virada: os ramos juntados ············ 04/09, palavra do Pedro
            zero conflitos, CI verde na main, e nada mudou para quem usa
   ✅ 5  o endereço velho passou a avisar ············ 03/09, palavra do Pedro
            "pode trocar, tem ninguém usando ainda" — ver o registro nas Fechadas
      6  trocar as cópias do atalho nas máquinas (arrumação, e não mais risco)
```

**O que sobrou do caminho antigo, e que agora é lixo a recolher:** o registro de DNS que o
`Banco_de_Dados` criou apontando para `pedrocampisi.github.io` **precisa sair** antes do endereço
próprio subir no Cloudflare (ordem já dada a ele pelo `CTO`). Se o `wrangler` reclamar de registro
existente, é porque ainda não saiu — **parar e avisar, não apagar nada por conta própria.**

*Decisão do Pedro.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.

**Medido em 31/08/2026, para ninguém ler isto como atraso:** a `migracao-supabase` está **20
registros à frente da `main`**, e isso é desenho, não dívida.

⚠️ **O que esta linha dizia deixou de valer em 03/09/2026, e vale mais corrigir que apagar.** Ela
dizia que juntar os ramos republica na hora o que a equipe usa, e que **era esse o botão que a
virada apertava**. Não é mais: a `main` não publica mais o programa — publica a página de aviso
do endereço velho, e só quando essa página muda. **A virada virou papelada:** ela não muda nada
para quem usa o software. O que está no ar já está no ar, servido pela Cloudflare.

---

---


---

---

### 13. A sessão `campisi-oc` venceu: prova de tela no ensaio parada

*Aberta em 25/09/2026, na decisão 34.* O estado guardado em 15/09 (2.900 bytes, com a sessão do
Supabase dentro) não entrou: o app tentou renovar a sessão, o banco recusou, a tela voltou ao login,
e o `restore-save` gravou o estado já sem sessão (786 bytes). **Não peço login ao Pedro** para uma
prova (decisão 33, régua do `CTO`). **Resposta do `CTO` (D536, 25/09):** a conta que entra por programa
**não vai existir** — um programa que lê a senha e entra é o agente entrando por outro caminho. O
caminho é o Pedro entrar **uma vez** com a Conta de ensaio, com o `restore` armado **antes**, quando
ele sentar para outra coisa. Não segura publicação que não muda a cara da tela (a da decisão 34 não
segurou).

---

## Onde estão as fechadas

Os itens fechados moram em [`Arquivo_Morto/PENDENCIAS_FECHADAS.md`](Arquivo_Morto/PENDENCIAS_FECHADAS.md), inteiros e com a data, desde 26/09/2026 (CTO-D571). Item que fecha sai daqui no mesmo dia.
