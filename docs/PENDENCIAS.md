# Pendências — Ordem de Compra

> **Data:** 03/09/2026
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

## 🔴 Abertas

### 1. Provar na tela: ninguém emitiu OC por este aplicativo depois da troca para `salvar_oc`

*Meu, quando houver conta de ensaio.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.


**Evidência nova, medida pelo `CTO` no banco de produção em 02/09/2026:** existem **2 ordens de
compra** (2026/004 e 2026/005, ambas de 08/08) e o **contador está em 7** — os números 006 e 007
foram gastos em 13/08 sem OC sobrevivente, que é o `reservar_numero_oc` **funcionando como
projetado**: rascunho abandonado queima número, e é isso que impede dois computadores de emitirem
a mesma OC.

✅ **O Pedro decidiu em 02/09/2026:** a primeira OC de verdade sai **`2026/008`**. As 004 e 005
ficam como estão, os números 006 e 007 ficam queimados, **ninguém limpa nada**.

⚠️ **Isto não fecha o item.** O que estava em aberto do lado do banco fechou; o que continua aberto
é o que sempre foi meu: **provar na tela** que esta versão emite. A evidência de hoje prova que a
numeração do banco funciona, **não** que esta tela funciona.

**O ensaio de 03/09 andou com este item, sem fechar.** Com o aplicativo no ar em
`compras.campisi.workers.dev`, ficou provado que **a tela carrega e alcança o banco**: uma chamada
a `/auth/v1/token`, e a recusa voltou como frase de gente. **Emitir continua sem prova** — exige
estar dentro, e eu não tenho senha nem uso a de ninguém. **Quem fecha este item é uma pessoa com
conta**, emitindo uma OC de ensaio e conferindo o número e o PDF.

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
      4  a virada: juntar os ramos
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


### 8. O endereço do banco de produção está no repositório público desde 08/08/2026

*Achado em 04/09/2026, conferindo o diff da virada antes de empurrar — e é a conferência que
achou, não a sorte.*

O valor está escrito em **um** documento arquivado,
[`Arquivo_Morto/RELATORIO-MIGRACAO-SUPABASE-2026-08-08.md`](Arquivo_Morto/RELATORIO-MIGRACAO-SUPABASE-2026-08-08.md),
que entrou no registro `ce72335`, de 08/08/2026 — antes desta caixa existir. **Já está público**,
no ramo `migracao-supabase`, e não é novidade que a virada cria: é dívida que a virada só carrega
para a `main`.

⚠️ **CORREÇÃO DE UMA FRASE MINHA AO PEDRO, dita em 03/09:** eu disse que *"o endereço do banco não
entrou em commit nenhum"*. Isso valia para **os meus** registros, e eu não disse essa parte. No
repositório inteiro, é falso — está lá desde 08/08.

**O tamanho real disto, medido e não estimado:**

```
   no pacote que o site entrega ... 1 arquivo .js, 3 ocorrencias
                                    quem abre compras.campisi.com.br LE o valor
   no repositorio publico ......... 1 documento arquivado, 1 ocorrencia
```

**O endereço do projeto não é segredo, e não pode ser** — o navegador precisa dele para falar com
o banco, então ele viaja em todo pacote de todo aplicativo que usa Supabase. **Quem protege os
dados é a política do banco (RLS) avaliada contra o usuário logado**, mais a chave publicável, que
não autoriza nada sozinha. O que existe aqui é **quebra da régua da casa** (decisão 6: este é o
único repositório público, e valor não se escreve nele), e não vazamento de senha.

**Por que eu não conserto por conta própria:**

```
   tapar o valor no documento .... conserta a VITRINE, nao a historia:
                                   o registro ce72335 continua publico
   reescrever a historia ......... force-push em repositorio publico.
                                   Ato grande, e quebra o clone de quem tiver um
```

Meia-medida que faz o repositório **parecer** limpo enquanto o registro antigo segue lá é pior que
o problema, porque cria sossego falso. **A escolha é do Pedro**, e as duas pontas honestas são:
deixar como está e saber por quê, ou reescrever a história de propósito, sabendo o preço.

---

### 7. O PWA nunca funcionou em produção — e o `Fluxo.md` promete que funciona

*Minha, para a retomada de **06/09/2026**.* Achado em 03/09, no primeiro ensaio no ar.

O `index.html` pede dois arquivos que **a montagem não gera**:

**Pista nova, medida em 04/09 na montagem da virada:** não é o PWA inteiro que falta. A montagem
**gera** `sw.js` e `workbox-*.js` (29 arquivos em cache declarados), mas **não** gera os dois que
o `index.html` pede. O gerador roda e entrega metade — o que aponta para configuração, e não para
o gerador estar desligado. Começar por aí em 06/09.

```
   dist/manifest.webmanifest   FALTA        dist/sw.js            existe
   dist/registerSW.js          FALTA        dist/workbox-*.js     existe
```

**Não é regressão da mudança para o Cloudflare** — medido: o site publicado no GitHub Pages
responde **404 nos dois**. O que mudou foi só o disfarce: no Cloudflare, o
`not_found_handling: single-page-application` devolve **200 com o `index.html` dentro**, e o
navegador estoura `Unexpected token '<'` no console de quem abre.

**O que isso custa hoje, na prática:** o aplicativo **não é instalável** e **não abre offline** —
as duas coisas que o `Fluxo.md` promete ao operador ("aplicativo web instalável como PWA",
"depois o PWA roda offline"). O `sw.js` existe mas ninguém o registra, porque quem registrava era
o `registerSW.js` que não existe.

**A hipótese, que é hipótese e não medição:** o `vite-plugin-pwa` (0.21) não emite esses dois
arquivos sob o Vite desta casa (8.x) — a injeção no `index.html` acontece, a emissão não. Conferir
antes de mexer; pode ser configuração, pode ser incompatibilidade de versão.

**Enquanto não fecha, está trancado por escrito:** a quarta trava do `scripts/conferir-pacote.js`
confere que tudo que o `index.html` pede existe, e estes dois estão numa **lista de exceções
declaradas**, impressa a cada execução com o número desta pendência ao lado. Fechar esta pendência
inclui **apagar as duas linhas de exceção** — se elas ficarem, a trava continua avisando.

⚠️ **E tem uma decisão junto, que não é só técnica:** ou o PWA passa a funcionar, ou o `Fluxo.md`
para de prometer que funciona. **Documento que promete o que o programa não faz é pior que
documento nenhum**, porque quem lê para de acreditar no resto.

---

## ✅ Fechadas (registro)

### O endereço velho parou de servir o programa e passou a avisar — 03/09/2026

Achado em 02/09/2026, lendo o `Fluxo.md` para corrigir o que ele dizia sobre o GitHub Pages.

O `start.bat` desta pasta — que é o atalho copiado para a **área de trabalho das pessoas** — tem o
endereço escrito dentro dele:

```
   antes  ...  https://pedrocampisi.github.io/central-compras-pbqph/
   agora  ...  https://compras.campisi.com.br/          (corrigido no repositório)
```

**Corrigir o arquivo aqui não corrige as cópias que já estão nas máquinas.** Ninguém atualiza a
área de trabalho de outra pessoa a partir deste repositório.

⚠️ **E o risco não é só o atalho quebrar — é ele NÃO quebrar.** Quando o GitHub Pages deixar de
receber publicação, o site que está lá **não some**: ele congela na última versão publicada, que é
a `main` de hoje — **a versão de arquivo no OneDrive, sem login e sem banco**. Quem clicar no
atalho antigo vai abrir um aplicativo que funciona, que parece o certo, e que **grava em outro
lugar**. Duas versões vivas ao mesmo tempo, e nenhuma delas avisando.

**Isto não é problema de programação, é de combinação com as pessoas**, e por isso é do Pedro
decidir como resolver. Os caminhos que eu enxergo, e o custo de cada um:

```
   desligar o Pages depois da virada ...... o atalho velho dá erro seco.
                                            Quebra na cara, mas quebra CEDO.
   deixar o Pages com uma página de aviso .. exige uma última publicação lá,
                                            só com o recado e o link novo
   trocar os atalhos, um por um ........... o único que não deixa ninguém para trás
```

**Recomendo os dois últimos juntos:** trocar os atalhos e deixar o endereço velho avisando, para
quem tiver o link salvo no navegador em vez do atalho. Mas isso é publicação e é mudança no dia
das pessoas — **não faço nada disso sem a palavra dele.**

---

✅ **A página de aviso está no ar no endereço velho**, desde a noite de 03/09/2026:
[`aviso-endereco-antigo/index.html`](../aviso-endereco-antigo/index.html). Uma página só, sem
dependência nenhuma, no padrão visual da casa (uma ação laranja, ícone desenhado, sem animação).

Ela diz o endereço novo e **separa dois caminhos de entrada** — a correção veio do `CTO` em
03/09, medida por ele na produção e conferida por mim:

```
   quem já usa a Central ····· MESMO e-mail, MESMA senha. Não faz "primeiro acesso".
   conta nova (sem senha) ···· "Primeiro acesso — definir minha senha".
```

**Por quê:** os dois apps usam o **mesmo projeto Supabase de produção** (mesmo `auth.users`),
então a senha de uma pessoa é a mesma nos dois — não por login automático (o crachá compartilhado
**continua congelado**, a pessoa digita e-mail e senha em cada app), mas por ser o mesmo cadastro.
Medido pelo `CTO`: das contas que existem hoje, **todas já têm senha** — ou seja, "primeiro
acesso" na prática só serve para conta que o administrador criar dali para frente.

**Eu confiri por conta própria** que o site no ar (`compras.campisi.com.br`) liga no projeto de
produção, e não no de ensaio: disparei um login na tela e o host da chamada bate com o ref de
produção. Sem isso, a frase sobre senha estaria escrita no escuro.

**Como foi publicada, e por que deste jeito.** O endereço velho era servido por um fluxo
automático na `main` que **compilava o programa antigo**. Em vez de editar esse fluxo, ele foi
**apagado** e um outro, com outro nome, foi **criado** (`aviso.yml`, que sobe uma pasta com um
HTML e nada mais):

```
   apagar um e criar outro ... na virada, os DOIS ramos apagaram o deploy.yml
                               -> nada para alguem resolver errado
   editar o antigo ........... modificado de um lado, apagado do outro
                               -> conflito no meio da virada, na pressa
```

Isso também derruba a preocupação que estava escrita aqui: **o aviso não depende da virada.** O
`aviso.yml` só existe na `main`, então a junção dos ramos o mantém. E o `index.html` do aviso é
**idêntico** nos dois ramos, de propósito, para o arquivo não virar conflito.

**O código do programa na `main` não foi tocado** — só a receita de publicação. Quem precisar da
versão de arquivo um dia, ela está toda lá.

**O que foi medido no ar depois de publicar** (e não o que foi enviado — lição 28):

```
   endereco velho, raiz ......... 200, "Este endereco saiu do ar."
                                  zero resto do programa antigo na pagina
   atalho de tela interna ....... 404 do GitHub servindo O AVISO, nao a tela preta
   o link laranja, CLICADO ...... leva a tela de entrada de compras.campisi.com.br
   compras.campisi.com.br ....... 200, o mesmo pacote de antes, intocado
   compras.campisi.workers.dev .. 404, o ensaio segue morto
```

O clique foi de verdade, e não uma leitura do `href`: **cabeçalho de HTTP não prova que um link
leva a algum lugar** — e a lição 31, do susto do instrumento, é justamente sobre isso.

**O risco que este item descrevia acabou.** Ele não era o atalho quebrar, era o atalho **não**
quebrar: o endereço velho ia congelar servindo o programa de arquivo, que funciona, parece o
certo e grava em outro lugar. Duas versões vivas ao mesmo tempo. Hoje o endereço velho não serve
programa nenhum — serve um recado.

**O que sobra, e não é urgente:** trocar as cópias do atalho nas áreas de trabalho. Deixou de ser
risco e virou arrumação, porque o atalho velho agora cai no aviso. O `start.bat` deste
repositório já aponta para o endereço novo desde 02/09; as cópias nas máquinas, não.

---

### A publicação passou a levar o banco junto — e a provar que levou — 02/09/2026

Era o item do `deploy.yml` com a versão digitada à mão, e virou coisa maior: o `CTO` mediu e
achou que o fluxo **não tinha uma linha de `env`**. Como `VITE_…` é lida na hora de montar,
juntar os ramos daria CI verde, publicação verde e **a tela sem alcançar o banco na mão da
pessoa**.

Agora ele tem duas travas — uma pergunta *"as variáveis chegaram?"*, a outra *"o endereço está
DENTRO do pacote?"* —, o Node vem do `.nvmrc` e o pnpm do `packageManager`. **A primeira versão
da segunda trava era cega** e o ensaio pegou antes de entrar. Ver `PLANEJAMENTO.md`, decisão 22,
com o que **não** foi possível provar sem publicar.

**Quem digita as duas variáveis é o Pedro**, em Settings → Secrets and variables → Actions. Não
vieram por carta e não passaram por agente nenhum.

### A conferência automática dos documentos existe, roda no CI, e mordeu na primeira vez — 02/09/2026

Era a pendência de que a organização tinha sido conferida **à mão uma vez, em 19/08**.
`scripts/conferir-documentos.js`, sete travas, ligado ao `pnpm conferir` **e ao CI no mesmo
commit** — porque o dia de hoje ensinou que instrumento que não roda é instrumento que não existe.

**A primeira execução saiu vermelha e achou quatro coisas reais:** três documentos que saíram de
circulação sem ninguém escrever por quê (as cartas do CNAE e das travas tapadas, e o `LEIA-ME.md`
do Arquivo Morto) e um apontamento de pasta onde tinha de ser de arquivo. Todos amarrados.

**Ela acusou a si mesma duas vezes** — uma trava que reprovava a si própria e outra que estourava
devolvendo *"não deu para medir"* com saída 0 — e as duas viraram regra. **8 sabotagens, 8
acusações.** Ver `PLANEJAMENTO.md`, decisão 21, com o que ela **não** olha, declarado.

### O CI desta casa passou a existir, e o primeiro verde não é meu — 02/09/2026

```
   antes ····· 16 execuções na história do repositório, 16 de publicação, 0 de CI
   agora ····· o fluxo CI dispara em push de qualquer ramo
```

`ci.yml` disparava só em `pull_request` para a `main`, e **nunca houve pull request neste
repositório**. O arquivo existia, era lido por quem passasse, e nunca tinha executado uma vez. Os
"76 testes verdes" que esta casa escreveu em três cartas eram verdes **numa máquina só: a minha.**

A primeira execução real saiu **vermelha em 22 segundos** — e foi ela que achou o defeito: o
`.nvmrc` declarava Node 20.11.0, que não tem `util.styleText` e não consegue carregar o `vitest`.
**O ambiente que esta casa declarava não rodava os testes desta casa.** Corrigido pela decisão 20:

```
   33620657411 ···· VERMELHO ···· .nvmrc 20.11.0
   33621122253 ···· VERDE ······· .nvmrc 24.14.1 · node v24.14.1 · Tests 76 passed (76)
```

Ordem do `CTO` pela régua da decisão 129 dele: congelamento veta frente nova, não conserto de
instrumento. **Zero linhas de código do produto foram tocadas.**

### Perícia P0-02: não é minha — é o item 13 do `Banco_de_Dados` — 02/09/2026

Esperei treze dias em silêncio: a lista dizia *"espera o `Banco_de_Dados`"* desde 20/08 e
**nenhuma carta nunca disse isso a ele**. Escrevi a carta em 02/09 e ele **respondeu no mesmo
dia**: é o mesmo assunto, e o item 13 dele (*"não há integração contínua nem ambiente reproduzível
na nuvem"*) é **mais largo que o meu e o contém**.

Antes de escrever, fui medir a casa dele em vez de repetir o achado de 10/08 — e três das quatro
coisas que a perícia pedia **já estavam feitas**: 146 migrations versionadas, reconstrução do zero
executável (`montar_ensaio.py`, que recusa rodar contra produção antes de qualquer outra coisa) e
22 arquivos de teste de permissão. Falta **o fio entre eles**, e o fio é da casa dele.

**Ele não deu data, e está certo em não dar** — prioridade é do Pedro. Comprometeu-se a avisar por
carta antes de marcar como feito.

Duas coisas ficaram para mim: a **decisão 19** (número certo colado no substantivo errado — eu
disse 169 migrations, são 146) e a conferência de entrega dele, `toda_carta_enviada_chegou()`, que
entra na pendência da conferência automática.

### A lei da organização dos documentos está cumprida — 02/09/2026

| O que a lei pedia | Como ficou |
|---|---|
| **Estado em todo documento** | **17 documentos, 17 cabeçalhos** `Data / Estado / Escopo`. As **22 cartas** ficam de fora **de propósito**: o estado de uma carta é a gaveta em que ela está (**decisão 13**) |
| **Os motivos saem do `Agente.md`** | Viraram as **decisões 14 a 18**. O `Agente.md` ficou só com a regra e o número da decisão ao lado |
| **`Readme.md` → `README.md`** | Não era o que parecia: o `README.md` da raiz **já existia e já era a porta certa** desde 20/08. O `docs/Readme.md` era **outro documento** — um guia de 280 linhas para dev. Virou [`docs/roteiros/guia-do-desenvolvedor.md`](roteiros/guia-do-desenvolvedor.md), e com isso sumiu o segundo arquivo com cara de "leia-me" |
| **`pecas/` e `roteiros/`** | `roteiros/` **nasceu** com o guia acima. `pecas/` continua não existindo, **e isso é a lei sendo cumprida**: pasta vazia não se cria |

**Duas coisas apareceram no caminho e foram consertadas:** a pasta `melhorias futuras/` estava
**fora de `docs/`** (a lei só admite `CLAUDE.md` e `README.md` lá fora) e virou
[`docs/melhorias-futuras/`](melhorias-futuras/), com as três ideias marcadas **PROPOSTA**; e o
`Agente.md` apontava o padrão visual para `campisi-central/`, **pasta que não existe mais** desde a
arrumação — agora aponta para `00_Diretrizes_e_padroes/Padrao_Front_end/`, conferido arquivo por
arquivo.

**Uma pergunta ficou de pé, como proposta:** `docs/Fluxo.md` descreve o que o sistema faz para
quem não abre código — é o candidato natural a primeira **peça**. Não foi movido porque mover
quebra os apontamentos de fora por um ganho só de arrumação, e **esta casa está em congelamento**.
Quem decide é o Pedro.

### A tela de fornecedor NÃO classifica — e nunca classificou por engano — 28/08/2026

Era a pendência aberta em 28/08 (o upsert não escrever `fornece_material` nem `presta_servico`).
**Fechou por decisão do Pedro, sem uma linha de código:** a classificação vem do CNAE, não da
tela. Deixar nulo era a resposta certa desde sempre — agora tem decisão por trás em vez de ser
acidente. Ver `PLANEJAMENTO.md`, decisão 8.

### As duas recusas do banco pararam de subir cruas na tela — 28/08/2026

`fornecedores_cpf_pessoa_exige_pessoa` e `fornecedores_raiz_pendura_na_empresa` agora viram frase
sem jargão. Os nomes das duas foram conferidos no banco, não copiados da carta. Ver
`PLANEJAMENTO.md`, decisão 5. **Falta a prova visual** — ver as frases na tela exige fazer o
banco recusar de verdade, e esta casa não escreve no banco para ensaiar.

### Endereço de terceiro em carta viva: zero nesta casa — 28/08/2026

Varredura das cartas, documentos e código a pedido do `CTO`. Nenhum endereço a tirar, e nenhum
CPF ou CNPJ real. Ver `Arquivo_Morto/Devolucoes/` e a carta de resposta.

### `CLAUDE.md` na porta, apontando para a lei — 20/08/2026

Esta casa não tinha arquivo de leis. Quem abrisse uma conversa aqui trabalhava sem as regras,
achando que estava com elas. Ver `PLANEJAMENTO.md`, decisão 2.

### Caixa de correio no desenho da lei — 20/08/2026

`Devolucoes_Agentes/` deu lugar a `Devolucoes/` + `Enviados/` + `Arquivo_Morto/`. Ver
`PLANEJAMENTO.md`, decisão 3.
