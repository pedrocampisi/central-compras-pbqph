# Caderno de decisões — Ordem de Compra

> **Data:** 20/08/2026
> **Estado:** VALE HOJE — este caderno é mantido, e cresce por baixo
> **Escopo:** por que cada coisa desta casa é como é. **Não** descreve como as coisas estão hoje
> (isso é o [`INDICE.md`](INDICE.md)) nem o que falta fazer (isso é
> [`PENDENCIAS.md`](PENDENCIAS.md)).

---

## Como usar este caderno

**Nunca leia inteiro.** Procure a decisão pelo número ou pela palavra e leia só o trecho.

Cada decisão diz: **o que foi decidido · por quê · o que foi descartado · a consequência.**

**Decisão não se apaga.** Mudou de ideia? Nasce uma decisão nova dizendo *"substitui a N,
porque…"*.

O formato completo está na lei —
`..\..\00_Diretrizes_e_padroes\Padrao_Ouro\2_ORGANIZACAO_DOS_DOCUMENTOS.md`.

---

## ⚠️ O que veio antes de 20/08/2026

**Este caderno começa hoje, e isso é honesto e não descuido.** Reconstruir o histórico anterior
neste formato sairia incompleto e com cara de fato.

**Onde o passado está guardado:**

| Onde | O que tem | Cuidado |
|---|---|---|
| [`Agente.md`](Agente.md) | arquitetura, contratos e constantes | ⚠️ **Comece pela seção 0**: as duas versões divergem, e a 0 vence sobre o resto |
| [`Agente.md` §0.2](Agente.md) | o contrato de gravação da OC, vigente desde 18–19/08 | é a decisão mais recente e mais importante desta casa |
| [`Arquivo_Morto/INDICE.md`](Arquivo_Morto/INDICE.md) | relatórios e perícias já fechados | são fotografias das datas em que foram tirados |
| o histórico do controle de versão | 40 registros, com o que mudou e quando | |

---

## Decisão 1 — o registro de decisões passa a ser este caderno · 20/08/2026

**O QUE FOI DECIDIDO**
Toda decisão desta casa passa a ser registrada aqui, numerada, com data e motivo.

**POR QUÊ**
O Pedro definiu em 20/08/2026 que nada pode se perder: uma IA que nunca viu o projeto tem que
conseguir entender o que existe, o que falta e **por quê**, sem perguntar nada a ninguém.

Hoje o porquê desta casa mora dentro do `Agente.md`, misturado com a descrição do que existe.
Documento que descreve **e** justifica ao mesmo tempo não dá para envelhecer em partes: quando a
arquitetura muda, o motivo vai junto.

**CONSEQUÊNCIA**
O que estiver no `Agente.md` como **motivo** é trazido para cá, numerado; o que for **descrição**
fica lá. Está em `PENDENCIAS.md`.

---

## Decisão 2 — a lei da casa é apontada, nunca copiada · 20/08/2026

**O QUE FOI DECIDIDO**
As regras de conduta, organização, correio e engenharia moram numa cópia só, em
`00_Diretrizes_e_padroes\Padrao_Ouro\`. O `CLAUDE.md` desta casa aponta para elas e guarda só o
que é específico das compras.

**POR QUÊ**
Esta casa não tinha `CLAUDE.md` nenhum. Quem abrisse uma conversa aqui trabalhava sem as regras,
achando que estava com elas.

**CONSEQUÊNCIA**
As duas armadilhas que já custaram tempo passaram a estar escritas na porta: as bibliotecas
quebram todas de uma vez se a pasta mudar de lugar, e o pacote sobe com **tela branca** se for
gerado pelo terminal errado.

---

## Decisão 3 — a caixa de correio passa a dizer a direção pela gaveta · 20/08/2026

**O QUE FOI DECIDIDO**
`Devolucoes_Agentes/` deu lugar a `Devolucoes/` + `Enviados/` + `Arquivo_Morto/`.

**POR QUÊ**
Numa pasta só, o que esta casa pediu e o que o banco respondeu ficavam lado a lado, e a direção
só se descobria pelo nome do arquivo. O `CTO` vai ler a caixa das cinco casas com a mesma régua.

**CONSEQUÊNCIA**
`ordem-de-compra-pendencias-de-banco.md` ficou em `Enviados/` (é o que ela pede) e
`banco-respostas-a-ordem-de-compra.md` em `Devolucoes/` (é o que o banco respondeu).

---

## Decisão 4 — a lista de pendências sai do índice · 20/08/2026

**O QUE FOI DECIDIDO**
O que está em aberto sai da tabela do `INDICE.md` e passa a viver em `PENDENCIAS.md`.

**POR QUÊ**
A lei proíbe segunda lista: *"duas listas da mesma coisa divergem, e a errada é sempre a que
alguém lê"*. O índice responde **"o que vale hoje e onde está"** — não **"o que falta fazer"**.

**CONSEQUÊNCIA**
Os três itens que estavam na tabela do índice foram transcritos para `PENDENCIAS.md`, sem
alteração de conteúdo. O índice passa a apontar para lá.

---

## Decisão 5 — recusa conhecida do banco vira frase de gente; o resto sobe crua · 28/08/2026

**O QUE FOI DECIDIDO**
Recusa do banco que **uma pessoa consegue disparar pela tela** é traduzida para uma frase sem
jargão, numa lista única em `src/services/supabase/erros.ts`. Toda outra recusa continua subindo
com a mensagem original.

**POR QUÊ**
O `Banco_de_Dados` avisou em 26/08 que a trava `fornecedores_cpf_pessoa_exige_pessoa` recusa
apagar o nome do contato em 2 dos 60 fornecedores — e o que a pessoa lia era a mensagem crua do
Postgres, com o nome da trava dentro. A segunda, `fornecedores_raiz_pendura_na_empresa`, recusa
CNPJ de empresa ainda não cadastrada. Nos dois casos não há como a pessoa adivinhar o que fazer.

**O QUE FOI DESCARTADO, E POR QUÊ**

- *Derrubar a trava no banco* — o `Banco_de_Dados` ofereceu. Recusado: mexer em trava viva para
  consertar mensagem feia é caro para o que o problema é, e a trava morre sozinha na etapa 2 do
  cadastro de pessoa;
- *Traduzir toda mensagem de erro do banco* — recusado, e esta é a parte que importa. Mascarar
  erro que só nasce de código errado **esconde defeito**: ali a mensagem técnica é a informação
  útil. Só entra na lista trava que uma pessoa alcança pela tela.

**COMO OS NOMES DAS TRAVAS FORAM OBTIDOS**
Lidos do banco — ensaio e principal — em 28/08, não copiados da carta que os informou. Nome
errado ali faria a tradução nunca disparar: o defeito seguiria vivo e a bateria seguiria verde.
É o erro silencioso do capítulo 1 da régua de engenharia, e a defesa é um canário: um teste que
falha se a lista do código deixar de bater com as duas travas conferidas.

**CONSEQUÊNCIA**
7 verificações novas (69 → 76), e o primeiro teste desta casa fora de `domain/`. A tela de
fornecedor não mudou de desenho — mudou o que ela diz quando o banco recusa.

**O QUE FICOU DE FORA**
A prova visual. Ver as duas frases na tela exige fazer o banco recusar uma gravação de verdade,
e esta casa não escreve no banco para ensaiar. Está dito na carta de 28/08 ao `Banco_de_Dados`.

---

## Decisão 6 — casa de repositório público reporta por contagem, nunca pelo valor · 28/08/2026

**O QUE FOI DECIDIDO**
Quando uma verificação desta casa tocar dado que veio de carta de outra casa — endereço,
documento de identidade, nome de pessoa — o achado se reporta por **contagem e descrição**, nunca
citando o valor. Vale para carta, caderno, índice e conversa.

**POR QUÊ**
É a *condição seis* da carga por carta, nascida em 28/08 de uma conferência da `Central` e aceita
pelo `CTO` como decisão 87 do caderno dele. O motivo é específico desta casa: **o repositório do
`Ordem de Compra` é o único público da plataforma.** Um valor citado dentro de uma carta daqui
sai do computador; o mesmo valor citado em qualquer outra casa, não.

**O QUE FOI DESCARTADO, E POR QUÊ**
Mascarar o valor (`f***@y***.com.br`) em vez de descrevê-lo: melhor que citar, e ainda assim
pior que a descrição — máscara curta em conjunto pequeno não esconde muita coisa, e não é
preciso citar de forma nenhuma para o achado ficar claro.

**CONSEQUÊNCIA**
Já é a prática desta casa desde a varredura de endereços de 28/08, que foi respondida inteira por
contagem. A decisão existe para que a próxima sessão não invente outro jeito.

---

## Decisão 7 — os dois cadernos acumulativos do correio foram encerrados · 28/08/2026

**O QUE FOI DECIDIDO**
`ordem-de-compra-pendencias-de-banco.md` e `banco-respostas-a-ordem-de-compra.md` — as duas
metades da conversa com o `Banco_de_Dados` entre 15 e 19/08 — foram triadas item por item e
foram para o Arquivo Morto. Daqui em diante, **um assunto é uma carta datada**.

**POR QUÊ**
A lei de 20/08 já mandava (`3_AGENTES_E_CORREIO.md`, regra 1): *"arquivo que vira caderno nunca
pode ser arquivado, porque metade dele está sempre em aberto"*. Era exatamente o caso: os dois
tinham item fechado, item riscado e item vivo no mesmo papel, e por isso ocupavam a gaveta de
espera para sempre — a gaveta deixava de dizer a verdade sobre quem espera quem. Ordem do `CTO`
em 28/08.

**O QUE A TRIAGEM ACHOU**

```
   pedido que ainda esperava resposta ......... 0
   item que já estava fechado ................. todos os das duas seções "Abertas"
   coisa viva que precisou de lugar novo ...... 2
```

As duas vivas: a **falta de conferência automática dos documentos** virou pendência própria; e a
armadilha da view `compras.prestadores_servico` — que lista as colunas uma a uma, e por isso não
mostra coluna nova sozinha — foi para a lista do que continua valendo, no índice do Arquivo Morto.

**O QUE FOI DESCARTADO, E POR QUÊ**
Copiar para cá o contrato de gravação da OC que o caderno do banco documenta. Ele **já vive na
seção 0.2 do `Agente.md`**, e duas cópias da mesma regra divergem — a errada é sempre a que
alguém lê.

**CONSEQUÊNCIA**
A caixa de entrada ficou vazia pela primeira vez, e vazia agora quer dizer o que a lei diz que
quer dizer: não há nada esperando esta casa. A tabela de cartas saiu do `INDICE.md` — a gaveta
já responde o que ela respondia.

---

## Decisão 8 — a tela de fornecedor não classifica: quem classifica é o CNAE · 28/08/2026

**O QUE FOI DECIDIDO**
`salvarFornecedor` **continua não escrevendo** `fornece_material` nem `presta_servico`, e isso
deixa de ser lacuna para virar contrato. **Decisão do Pedro**, trazida pelo `Banco_de_Dados` em
28/08. Fornecedor sem CNAE fica *"Não classificado"* até alguém olhar.

**POR QUÊ**
*"Quem entra pela tela de fornecedor é fornecedor de material"* é uma **dedução da tela sobre o
mundo** — e seria gravada no banco com a mesma cara de um fato lido da Receita. A fonte da
classificação é o CNAE, e ele não passa por esta tela.

**⚠️ A REGRA DURA, QUE NÃO SE DESCOBRE LENDO O CÓDIGO**
As duas colunas **afirmam e nunca negam.** Medição do `Banco_de_Dados` na produção, 28/08:

```
   223 fornecedores
   fornece_material .... 161 verdadeiro · 62 nulo · 0 falso
   presta_servico ...... 124 verdadeiro · 99 nulo · 0 falso
```

`null` quer dizer *"ninguém afirmou"*, **não** *"não fornece"*. Se algum dia esta tela gravar
`false`, ela escreve no banco um tipo de afirmação que **nenhuma das 223 linhas faz hoje**, e uma
consulta que pergunta `is not true` passa a separar dois nulos que sempre foram um só.

> **Nunca gravar `false` nessas duas colunas.** Nulo é a resposta certa para "não sei", e é a que
> esta tela já dá.

**O QUE FOI DESCARTADO, E POR QUÊ**
Marcar `fornece_material = true` ao criar pela tela de fornecedor. Parecia óbvio — e o óbvio aqui
era a dedução disfarçada de fato.

**CONSEQUÊNCIA**
Nenhuma linha de código mudou, e é esse o ponto: **a pendência fechou por decisão, não por
conserto.** Fica registrado para a próxima sessão não "consertar" o que está certo.

**O QUE CONTINUA EM ABERTO, E NÃO É MEU**
O `Banco_de_Dados` ofereceu preencher as bandeiras a partir do CNAE no instante em que a linha
nasce, sem esta tela saber que as colunas existem. É mudança no banco e espera o Pedro. Desta
casa não há objeção — fecharia a lacuna do lado de quem sabe o que o CNAE significa.

---

## Decisão 9 — quando a data da carta bater contra o relógio, o relógio ganha · 31/08/2026

**O QUE FOI DECIDIDO**
A data de um documento desta casa sai do **relógio da máquina**, conferido na hora. Nunca da data
escrita numa carta que chegou, nem da que vem dita numa campainha.

**POR QUÊ**
Em 31/08 esta casa escreveu **seis cartas datadas 28/08** — três dias errado, e já publicadas. As
cartas recebidas estavam datadas 28/08 e as campainhas diziam *"hoje (28/08)"*; eu segui o papel.

O que dói é que a régua certa **estava sendo aplicada no mesmo dia, no assunto ao lado**: os nomes
das travas do banco foram lidos no banco em vez de copiados da carta que os informou, com o motivo
escrito de que carta é pedido e informação, nunca fonte de verdade. **A régua não foi estendida à
data**, e data errada é o tipo de erro que não dá sintoma — envelhece calado e engana quem ler
depois.

**O QUE FOI DESCARTADO, E POR QUÊ**
Renomear e redatar as seis. Recusado por duas leis: carta em casa alheia não se corrige (quatro já
estavam lá), e as duas metades de uma conversa se reencontram **pelo nome** — renomear um lado só
quebra o mecanismo. Além disso já estavam publicadas, e reescrever histórico para esconder erro de
data é pior que o erro.

**CONSEQUÊNCIA**
Correção por carta nova às duas casas, aviso no topo do índice do Arquivo Morto, e esta decisão.
As cartas ficam como saíram.

---

## Decisão 10 — corrige o diagnóstico da decisão 9: o relógio para de ser olhado quando a conversa se estende · 31/08/2026

**O QUE FOI DECIDIDO**
A regra da decisão 9 **continua valendo**: quando a data escrita numa carta bater contra o relógio
da máquina, o relógio ganha. **O que muda é o motivo, e o motivo é o que ensina.**

A regra ganha o par que faltava:

> **Confira o relógio ao escrever cada documento — não ao começar o trabalho.**

**POR QUÊ A 9 ESTAVA ERRADA**
A decisão 9 disse que esta casa seguiu a data escrita nas cartas que chegaram. **Fui medir, e não
foi isso.** Comparando o nome de cada carta com a hora em que o arquivo nasceu no disco:

```
   erradas ..... 3 (duas de 30/08 e uma de 31/08, todas marcadas 28/08)
   certas ...... 3 (as de 28/08 são realmente de 28/08)
   cartas que CHEGARAM, mal datadas ..... 0 de 8
```

Não havia data errada para eu copiar. **O que houve foi uma conversa que durou de 20 a 31/08 sem
recomeçar**, e a data da primeira metade foi carregada para a segunda sem ninguém notar a virada
do dia.

O `CTO` supôs outra coisa — casa que dorme e acorda herdando o *"hoje"* de uma fila velha. Também
não foi isso, e a diferença importa: **casa parada tem um despertar que a faz olhar em volta;
conversa longa não tem despertar nenhum.** O remédio dele não pegaria este caso.

**A ARMADILHA, EM UMA FRASE**
Data errada não dá sintoma. Não quebra teste, não quebra tela, não quebra link — só engana quem
ler depois. É o erro silencioso do capítulo 1 da régua de engenharia, na sua forma mais barata de
cometer e mais cara de descobrir.

**O QUE FOI DESCARTADO, E POR QUÊ**
Apagar a decisão 9 e a carta que a acompanhou. Ficam as duas, com esta ao lado. Decisão não se
apaga — e esconder a versão errada de uma correção é o mesmo defeito que reescrever histórico
publicado.

**CONSEQUÊNCIA**
Três cartas seguem com data errada, de propósito e com o aviso ao lado. A régua corrigida foi
devolvida ao `CTO`, que ia levar a versão errada dela para a plataforma inteira.

---

## Decisão 11 — o instrumento da decisão 10 tem um limite, e ele se declara antes de medir · 31/08/2026

**O QUE FOI DECIDIDO**
Quem for medir data de documento pela **hora de nascimento no disco** confere antes se o
repositório foi re-clonado. **Se foi, o instrumento não serve** — e a resposta certa é "não deu
para medir", nunca um número.

**POR QUÊ**
Re-clonar carimba todos os arquivos com a hora do clone. A medição continua rodando, continua
devolvendo número, e o número é lixo — sem nenhum sintoma. É o pior formato de erro que existe
nesta casa: **a ferramenta não falha, ela mente com confiança.**

O limite foi apontado pelo `CTO` em 31/08, depois de ele refazer a medição das seis casas com este
instrumento. **A falha era minha:** eu propus o instrumento sem declarar quando ele não vale.

**O QUE ISSO ENSINA ALÉM DO CASO**
Instrumento novo entra com o limite dele escrito junto. Medida sem limite declarado é a mesma
coisa que "fechou" sem "não deu para conferir" — some o terceiro desfecho, e é nele que mora o
erro silencioso.

**CONSEQUÊNCIA**
Em 31/08 nenhuma das seis casas tinha sido re-clonada, então a medição daquele dia vale. A
próxima confere primeiro.
