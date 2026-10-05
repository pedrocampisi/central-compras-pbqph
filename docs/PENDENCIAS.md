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

### 28. O app do mestre de obra (D693, D696): no ar, esperando o primeiro uso

*Aberta em 04/10/2026, na decisão 80; atualizada nas decisões 81, 84, 85, 86, 87 e 88.* **No ar desde 05/10, 10h53,
em `73d2b3db`** (decisão 88): a tela do mestre ligada ao contrato do Banco, o lado do escritório (Recebimentos), a tela
"Mestres" com o QR e o caminho do iPhone. O desfazer da tela é `4da03d09`.

**Falta:**
- ~~a conferência do CTO da versão no ar~~ — **conferida** (CTO, 05/10, commit `3503160` dele);
- **o primeiro uso** (D716): o primeiro mestre é cadastrado pelo engenheiro que o Pedro escolher, nunca por esta casa.
  No dia, esta casa fica de prontidão até o primeiro recebimento sair (pendência 31).

---

### 32. Os três pedidos do Pedro (D728): no ramo, esperando a avaliação do CTO

*Aberta em 05/10/2026, na decisão 89.* No ramo `d728-tres-pedidos` (`b226682`), com o CI verde, **NÃO publicado**:
a sigla ECR por extenso, a entrega prevista no dia seguinte e o "?" dos critérios pelo PS.02.

**Falta:** a avaliação do CTO (carta `D728-os-tres-pedidos-no-ramo`); aprovado, publicar pela emenda 3, fora do dia
do primeiro uso do mestre.

---

### 30. O teste do título uma vez só (D643, a Nova OC) às vezes falha

*Aberta em 04/10/2026, na decisão 84; atualizada na decisão 87.* Falhou uma vez na `main` (decisão 83) e duas vezes
no ramo do mestre (a última em 05/10), sempre no meio da bateria inteira; sozinho e nas rodadas seguintes, passou. O código não mudou entre as rodadas: é tempo, não
regra. **Falta:** achar a espera que está curta (`tests/components/TituloUmaVez.test.tsx`) e prová-la com a bateria
rodando várias vezes seguidas.

---

### 31. O QR do mestre e o celular que guarda, num aparelho de verdade

*Aberta em 04/10/2026, na decisão 84; mudada na decisão 87.* O caminho do iPhone (o QR no Safari pede o ícone; o ícone
lê o mesmo QR e entra) e o celular que guarda (o IndexedDB) estão provados em teste e nas fotos, sobre um banco falso.
**O ensaio de cinco minutos saiu** (CTO-D716). **Falta:** o primeiro uso na produção, com o engenheiro ao lado até o
primeiro recebimento sair. Esta casa fica de prontidão para consertar no mesmo dia. Vai na carta da produção.
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
