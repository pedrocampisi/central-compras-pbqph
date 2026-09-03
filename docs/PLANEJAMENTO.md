# Caderno de decisões — Ordem de Compra

> **Data:** 03/09/2026
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

---

## Decisão 12 — o zero é resposta, e quem o protege aqui é a comparação explícita · 31/08/2026

**O QUE FOI DECIDIDO**
Onde o valor pode ser número, `||` não decide nada sozinho. Vale uma das duas:

```
   Number(x) || 0            ← permitido: o zero sobrevive, e NaN vira 0
   x === 0 ? '' : x          ← na tela, comparação explícita
   x ?? y                    ← quando a pergunta é "veio alguma coisa?"

   x || ''   ·   x || '-'    ← PROIBIDO sobre número: o zero some, e no
                               segundo caso some parecendo informação
```

**POR QUÊ**
Numa ordem de compra **zero é resposta**: quantidade zero, desconto zero, frete zero. Em
JavaScript `0` é falso, então um `||` no caminho troca um número legítimo por vazio **sem erro,
sem log e lendo bem em voz alta**. Alerta do `CTO` em 31/08, nascido de um achado da
`Central_Financeiro`.

**A MEDIÇÃO**

```
   79 arquivos vivos · 48 candidatos · 36 com cara de número · 0 defeitos vivos
```

Os 36 são todos `Number(x) || 0`, e a tela já usa comparação explícita nos campos de dinheiro e
quantidade. **Nada foi alterado** — mexer no que está certo é o conserto do que não estava
quebrado.

**⚠️ O QUE ESTA VARREDURA ENSINOU SOBRE INSTRUMENTO, E É O QUE MAIS VALE**
O varredor de chave repetida que esta casa escreveu acusou **113 ocorrências**. Eram falsas: ele
contava objetos irmãos de uma lista como se fossem um só. **Não quebrou, não avisou — devolveu um
número com cara de medição**, no mesmo dia em que esta casa escreveu que ferramenta ruim mente com
confiança (decisão 11).

Trocado pelo instrumento que não mente: **reintroduzir o defeito e ver quem acusa.** Um
`{ a: 1, b: 2, a: 3 }` colocado num arquivo real desta casa levanta `TS1117` no `pnpm typecheck`.
Não é contagem zero — é impossibilidade provada, e o arquivo foi restaurado idêntico.

**DOIS LIMITES DECLARADOS, porque instrumento entra com o limite escrito**

- **`no-dupe-keys` do eslint está DESLIGADA aqui** (severidade 0), desligada de propósito pelo
  `typescript-eslint` porque o compilador cobre. Está certo — mas **quem rodar `eslint` sem rodar
  `tsc` não tem essa proteção e não é avisado de que não tem**;
- o compilador pega chave escrita à mão, **não pega chave calculada** (`{[k]: 1, [k]: 2}`). Esta
  casa tem 10 chaves calculadas, todas sozinhas no objeto delas — colisão impossível hoje.

**O QUE NÃO FOI MEDIDO**
`legacy/CentralCompras-PBQPH.html`, o aplicativo antigo de arquivo único: 188 candidatos, **não
olhados um a um**. Ele não é referenciado por nenhum arquivo e não entra no pacote publicado — é
museu. **Não está declarado limpo: está declarado não medido.**

---

## Decisão 13 — carta não leva cabeçalho de estado: a gaveta é o estado dela · 02/09/2026

**O QUE FOI DECIDIDO**
Os `.md` desta casa nascem com `Data / Estado / Escopo` no topo — **menos as cartas**. Carta já
entra com o cabeçalho dela (De · Para · Data · Assunto · Responde · Espero de volta), e o estado
dela é **a pasta em que está**:

```
   Devolucoes/            chegou e NÃO foi tratada
   Enviados/              pedi e ainda não responderam
   Arquivo_Morto/…        fechada, com o motivo no INDICE
```

**POR QUÊ**
Um `Estado: VALE HOJE` dentro de uma carta que já está no `Arquivo_Morto/` cria **duas verdades
sobre o mesmo papel**, e a de dentro do arquivo é a que ninguém lembra de atualizar quando move a
pasta. É a decisão 4 outra vez, e a 7: **lista que repete o que a gaveta já diz é lista que
desatualiza.** Some o segundo lugar, some o desencontro.

E carta que já saiu daqui **não se reescreve**: metade dela mora na casa de outro agente, e mudar
só a minha metade rompe o par.

**O ALCANCE**

```
   39 arquivos .md nesta casa
   ├── 22 cartas ······················ isentas por esta decisão
   └── 17 documentos ·················· 17 com cabeçalho, conferido em 02/09
```

---

## Decisão 14 — cor, sombra, raio e fonte vêm todos de um arquivo só · 12/08/2026

> Decisão tomada em 12/08/2026 e escrita até hoje dentro do `Agente.md` 0.1. Trazida para o
> caderno em **02/09/2026**, porque motivo mora aqui e regra mora lá.

**O QUE FOI DECIDIDO**
`src/styles/tokens.css` é a **única fonte** de cor, sombra, raio e fonte. Nenhum hexadecimal solto
dentro de módulo. O tema escuro (`data-tema="escuro"` no `<html>`) é aplicado por **script inline
no `index.html`, antes da primeira pintura**; `hooks/useTema.ts` só lê e alterna.

**POR QUÊ**
Cor solta em módulo é marca que anda sozinha: o padrão visual vem de fora
(`00_Diretrizes_e_padroes/Padrao_Front_end/`), e cada hexadecimal copiado à mão é um lugar que
deixa de acompanhar a fonte. O bloco de apelidos no fim do `tokens.css` (`--navy`, `--bg`,
`--text`…) existe **só para o código antigo não quebrar** — código novo usa os oficiais
(`--marca`, `--fundo`, `--texto`, `--acento`).

O tema antes da primeira pintura tem motivo próprio e curto: **senão a tela pisca clara** antes de
escurecer, e quem trabalha no escuro leva um flash branco a cada abertura.

---

## Decisão 15 — uma ação laranja por tela; ícone é desenho; selo é neutro até provar o contrário · 12/08/2026

> Mesma origem da decisão 14: estava no `Agente.md` 0.1, veio para o caderno em 02/09/2026.

**O QUE FOI DECIDIDO**

```
   uma ação primária (laranja) por tela ····· o segundo botão é sempre outline
   ícone é <Icon>, traço 1.6 ··············· nunca emoji
   <Pill> nasce neutro ····················· verde/vermelho só quando for mesmo situação
   mascote longe de dado ··················· <EmptyState> cheio quando o vazio é a tela;
                                              compacto dentro de cartão com números
```

**POR QUÊ**
Duas laranjas na mesma tela é o mesmo que nenhuma — a cor deixa de dizer "é por aqui". Em Nova OC
o laranja é o **"Emitir OC" do rodapé**; o atalho do topo é secundário **de propósito**, e trocar
isso por "ficou mais visível" desfaz a regra.

Emoji **desenha diferente em cada sistema e não aceita a cor do tema**: o mesmo símbolo vira outro
desenho no Windows, no celular e no PDF. E selo colorido em tudo faz o vermelho parar de assustar
justamente onde ele precisa assustar.

---

## Decisão 16 — a cerimônia da marca é da Central; aqui a entrada é formulário · 12/08/2026

> Decisão **do Pedro**, 12/08/2026. Estava no `Agente.md` 0.1; veio para o caderno em 02/09/2026.

**O QUE FOI DECIDIDO**
Este aplicativo **não tem portão de boas-vindas e não tem animação de entrada**. O login é
formulário, e some no dia em que a `Central` assumir a autenticação. Movimento só em **espera e no
login** — `<Loader>` (o martelo) é o único permitido nas telas de trabalho, e só aparece **depois
de 250 ms**.

**POR QUÊ**
A cerimônia da marca — portão, vídeo e som — é da **Central**, que será a porta de entrada da
equipe. Repetir a cerimônia em cada programa transforma abertura em pedágio: quem emite dez OCs
por dia assiste dez vezes.

Os 250 ms do martelo têm motivo separado: **abaixo disso a espera termina antes de o olho
registrar**, e o giro vira pisca-pisca — parece defeito, não parece trabalho.

**A CONSEQUÊNCIA NO DISCO**
`public/marca/` **não tem** `anim-entrada.mp4`, `anim-poster-final.png` nem `efeito-entrada.mp3`.
Não é falta: é a decisão. Se um dia precisarem, a fonte é
`00_Diretrizes_e_padroes/Padrao_Front_end/assets/`. E os quadros do martelo ficam **fora do
pré-carregamento** do service worker (`globIgnores` no `vite.config.ts`) — só baixam em espera
real.

---

## Decisão 17 — a gravação da OC é uma chamada só, e quem manda é o banco · 18–19/08/2026

> O contrato campo a campo continua no `Agente.md` 0.2 — é lá que se consulta antes de mexer em
> `salvarOrdemCompra`. Aqui fica **por que ele tem essa forma**. Trazido em 02/09/2026.

**O QUE FOI DECIDIDO**
Cabeçalho e itens da OC gravam **numa transação só**, por `compras.salvar_oc(p jsonb)`. O cliente
não decide nada: manda o pedido inteiro e obedece à resposta.

**POR QUÊ — cada regra veio de um estrago concreto**

| A regra | O estrago que ela evita |
|---|---|
| uma chamada, uma transação | era o **P0-01 da perícia**: gravar cabeçalho e itens separados deixava **OC numerada sem itens** quando a segunda chamada falhava |
| `request_id` é a identidade da **tentativa**, não da OC | repetir a tentativa não pode **gastar outro número de documento**. Por isso ele se reaproveita no retry (`tentativaRef`) e só é descartado quando grava |
| `versao` obrigatória ao atualizar | duas pessoas na mesma OC. O banco devolve `40001`, a camada converte em `ConflitoDeVersao`, e **a mensagem do banco já está pronta para a tela** — reescrever é piorar |
| chave com `null` **APAGA** | apagar campo precisa ser possível. Por isso ausente ≠ `null`: ausente não mexe, `null` limpa. As exceções (`data`, `status`, `frete`, `outras_despesas`, `desconto_material`) ficam em `coalesce` **declaradas**, não por acaso |
| `itens` ausente ≠ `itens: []` | lista vazia **apaga todos**. A tela edita a lista inteira, então manda sempre — omitir por engano seria apagar por engano |
| status e PDF com comando estreito | trocar status não regrava itens; `marcar_pdf_gerado` **não mexe na versão** (gerar PDF não muda conteúdo) e roda **depois** de o arquivo existir |

**⚠️ O LIMITE, QUE CONTINUA VALENDO**
Nada disso foi **provado na tela**. Ninguém emitiu OC por este aplicativo depois da troca — o
contrato foi conferido campo a campo por leitura no banco, **que é outra coisa**. Está aberto como
item 2 das `PENDENCIAS`.

---

## Decisão 18 — o IPI incide sobre o líquido, não sobre o bruto · anterior a este caderno

**O QUE FOI DECIDIDO**
A ordem de cálculo da linha é, e continua sendo:

```
   bruto → desconto → LÍQUIDO → IPI → total

   total_linha = (qtd × preço × (1 − desc/100)) × (1 + ipi/100)
```

**POR QUÊ ESTÁ NO CADERNO**
Não é uma decisão tomada agora — é uma decisão **que parece defeito para quem chega**. ERPs comuns
fazem o outro caminho (IPI sobre o bruto), e uma IA de manutenção que "corrija" isso muda o valor
de **toda** ordem de compra da empresa, sem erro, sem teste vermelho e sem ninguém perceber até a
nota chegar diferente.

**A DATA HONESTA: não sei quando foi decidido.** Sei que **não foi na migração para React** — o
aplicativo antigo de arquivo único já calculava assim:

```
   legacy/CentralCompras-PBQPH.html:1314   const ipi = (base - desc) * (…ipi_pct…)/100;
   src/domain/compute.ts:38                const ipi = liquido * (ipiPct / 100);
```

Quem quiser mudar isto **pergunta ao Pedro**, não ao código.

---

## Decisão 19 — o número certo colado no substantivo errado · 02/09/2026

**O QUE FOI DECIDIDO**
Contagem que vai para carta entra com **a pergunta que ela responde escrita ao lado**. Não basta o
número estar certo: tem de estar certo **para a frase em que ele foi colado**.

```
   o que eu contei ····· find . -name '*.sql'      → 169
   o que eu escrevi ···· "169 migrations versionadas"
   o que era ··········· supabase/migrations/*.sql → 146
                         os outros 23 são testes de RLS, roteiros e carga
```

**POR QUÊ**
Escrevi ao `Banco_de_Dados`, em 02/09, que ele tinha **169 migrations**. Ele conferiu e devolveu:
são **146**; 169 é o total de `.sql` da casa inteira. Refiz a conta aqui e **ele está certo**. O
mesmo aconteceu com os testes de permissão: contei **24 entradas da pasta**, mas duas não são
asserção — uma é `__pycache__` e outra é um teste em Python. **22** arquivos `.sql` de asserção.

O número não estava errado. **A frase em volta dele estava** — e é a frase que viaja, é ela que o
outro agente lê e repete.

**O DETALHE QUE FAZ ISSO VIRAR REGRA E NÃO DESCULPA**
É a **terceira vez em dois dias** que a mesma coisa acontece entre casas da plataforma: a
`Central_Email` contou `create table` e chamou de mesas (uma era criada e apagada no mesmo
arquivo); o `Banco_de_Dados` contou onze dígitos sem borda e achou CPF dentro de CNPJ; eu contei
`.sql` e chamei de migration. **Três instrumentos honestos, três substantivos errados.**

**COMO FICA, NA PRÁTICA**

```
   ❌  "169 migrations versionadas"
   ✅  "169 arquivos .sql em toda a casa (find . -name '*.sql'), dos quais
        146 em supabase/migrations/"
```

O comando que produziu o número vai junto. Quem lê confere em cinco segundos — e foi exatamente
assim que o erro morreu em menos de uma hora, em vez de virar fato repetido.

**⚠️ E A CARTA ERRADA NÃO FOI REESCRITA**
Ela já estava na `Devolucoes` de duas casas quando o erro apareceu. Vale o que já valia aqui:
**carta que saiu não se corrige por dentro** — a correção sai como carta nova, e o par fica no
registro mostrando o erro e o conserto. Esconder o erro reescrevendo é pior que o erro.

---

## Decisão 20 — a máquina que mede é a mesma máquina em que eu trabalho · 02/09/2026

**O QUE FOI DECIDIDO**

```
   .nvmrc ········· 20.11.0      →  24.14.1
   engines.node ··· ">=20.11.0"  →  ">=24"
```

O CI baixa o Node pelo `.nvmrc` e o pnpm pelo `packageManager`. **A versão não está escrita em
lugar nenhum duas vezes** — nem no fluxo, nem à mão.

**POR QUÊ**
Porque a alternativa devolvia a doença. Manter o Node 20 no CI enquanto eu trabalho no 24 é ter
duas máquinas que podem discordar **sem ninguém medindo na diferença** — a lição 2 do catálogo do
`CTO`, que este exame acabou de curar. E não havia argumento de estabilidade do outro lado: **o
Node desta casa é ferramenta de construção, não de produção.** O usuário recebe página estática e
nunca roda Node.

**A PROVA, NOS DOIS SENTIDOS — e é ela que faz esta decisão valer**

```
   .nvmrc 20.11.0 ···· execução 33620657411 ···· VERMELHO em 22s
                       SyntaxError: 'node:util' não exporta 'styleText'
                       (styleText só existe do Node 20.12.0 em diante)

   .nvmrc 24.14.1 ···· execução 33621122253 ···· VERDE em 36s
                       node: v24.14.1 · pnpm v10.33.3 · Tests 76 passed (76)
```

**O 20.11.0 nunca conseguiu rodar os testes desta casa** — desde o dia em que o `.nvmrc` foi
escrito. Ninguém soube porque o CI nunca rodava (decisão registrada na carta do exame), porque eu
rodo em 24, e porque o fluxo antigo dizia `'20'`: baixaria a 20 mais recente e ficaria **verde por
sorte**, numa versão que ninguém tinha declarado.

**POR QUE O `engines` FOI JUNTO, sem ordem explícita**
Deixar `">=20.11.0"` seria manter no arquivo **uma frase que a máquina já tinha desmentido**. O
piso declarado passa a ser o único que alguém mede. O 20.12+ talvez funcione — **ninguém mede**, e
esta casa não declara o que não mede (decisão 19).

**O QUE FICA DE FORA, DECLARADO**
`deploy.yml` — o fluxo que publica o site que a equipe usa — **ainda tem a versão digitada à mão**
(`node-version: '20'`, `pnpm 9`). É o único lugar da casa onde ela não vem de uma fonte só. Não foi
tocado porque não há como rodá-lo para conferir sem publicar, e publicar é botão do Pedro.
**Proposta pronta para a retomada de 06/09**, com o desenho já aprovado pelo `CTO`: ele passa a ler
o `.nvmrc` e o `packageManager`, como o CI.

---

## Decisão 21 — a conferência dos documentos é do tamanho desta casa, não da casa do Banco · 02/09/2026

**O QUE FOI DECIDIDO**
`scripts/conferir-documentos.js`, ligado ao `pnpm conferir` e **ao CI no mesmo commit**. Sete
travas:

```
   1  cabeçalho Data/Estado/Escopo em todo documento que não é carta
   2  o Estado é um dos quatro da lei
   3  nenhum link .md aponta para arquivo que não existe
   4  todo documento está amarrado a um índice
   5  só CLAUDE.md e README.md moram fora de docs/
   6  toda carta em Enviados/ chegou na casa de quem recebe
   7  a conferência não escreve — ela lê o próprio código e prova
```

**POR QUÊ AGORA, E POR QUE EM JAVASCRIPT**
A organização foi conferida **à mão uma vez**, em 19/08. Conferência manual dura poucas semanas —
a observação é do `Banco_de_Dados`, que já viu 27 documentos sem índice nenhum. E o dia de hoje
ensinou o resto: **instrumento que não roda é instrumento que não existe** (o `ci.yml` desta casa,
0 execuções em 16). Por isso ela nasce ligada ao CI no mesmo commit — não "depois".

Em JavaScript, e não em Python, porque roda no Node que esta casa já declara. **Nenhuma ferramenta
nova entrou na casa.**

**O DESENHO É DO BANCO, E UMA COISA FOI MUDADA DE PROPÓSITO**
Li o `conferir_tudo.py` dele em vez de pedir por carta — estava à mão. Mas **na casa dele as
cartas são listadas no `INDICE.md`, e aqui não são**: as decisões 4 e 7 tiraram essa tabela porque
a gaveta é a verdade. Copiar a regra dele acusaria **todas** as cartas vivas desta casa como
órfãs — um vermelho errado, que é pior que verde nenhum. **Instrumento se adapta à casa; não se
copia por cima dela.**

**A PRIMEIRA EXECUÇÃO SAIU VERMELHA, E ACHOU COISA DE VERDADE**

```
   3 documentos saíram de circulação sem ninguém escrever POR QUÊ
       · a carta do CNAE (28/08), que virou a decisão 8
       · a carta das travas tapadas (28/08) — o nome dela aparecia DENTRO de
         outra linha, o que não é a mesma coisa que ter linha
       · o LEIA-ME.md do Arquivo Morto
   1 apontamento de PASTA onde tinha de ser de arquivo (melhorias-futuras/)
```

**E ELA ACUSOU A SI MESMA DUAS VEZES, o que é o melhor sinal**

- a trava 7 procurava os nomes proibidos com uma expressão **que continha os nomes proibidos**:
  reprovou a si mesma na primeira execução da vida. Vigia que inventa achado (lição 6);
- uma variável apagada fez a trava 4 **estourar**, e o programa devolveu *"não deu para medir"* com
  código de saída **0**. Corrigido, e virou regra: **trava que estoura fica VERMELHA.** O "não deu
  para medir" honesto é o que a própria trava **declara** — como a trava 6 faz dentro do CI, onde
  as outras casas não existem no checkout.

**A PROVA DE QUE ELA MORDE — 8 ensaios, 8 acusações**
Cada trava foi sabotada de propósito e todas ficaram vermelhas: cabeçalho arrancado, estado
inventado, link para arquivo inexistente, documento órfão, `.md` na raiz, carta que nunca saiu,
poder de escrever, e trava quebrada. **Conferência que nasce verde e nunca se viu vermelha não é
conferência.**

**⚠️ O QUE O PRÓPRIO ENSAIO ENSINOU, e é o preço que eu paguei**
O roteiro de sabotagem restaurava os arquivos com `git checkout --`. Num arquivo com **edição
minha ainda não gravada**, isso não restaura: **apaga**. Ele comeu uma correção legítima do
`INDICE.md`, e só a conferência seguinte mostrou. Roteiro de ensaio é instrumento também, e este
tinha efeito colateral que ninguém tinha declarado.

**O QUE ELA NÃO OLHA — declarado**
Não lê o conteúdo de carta nenhuma; **não sabe se um documento está desatualizado** — só se ele
declara o estado em que diz estar, então documento mentiroso passa verde aqui; não segue link
http; não olha `legacy/`, `node_modules/` nem `dist/`; e fora desta casa responde a **uma**
pergunta só: *"a carta que eu mandei chegou?"*.

---

## Decisão 22 — a publicação prova que o banco entrou no pacote, e não que ela mandou · 02/09/2026

**O QUE FOI DECIDIDO**
`deploy.yml` ganhou **duas travas**, e elas fazem perguntas diferentes de propósito:

```
   antes do build ···· "as duas variáveis chegaram?"   → responde "eu mandei?"
   depois do build ··· "o endereço do banco está DENTRO do pacote?"
                                                        → responde "chegou?"
```

As duas variáveis vêm de `vars` **ou** de `secrets` do repositório (`vars.X || secrets.X`), quem
digita é o Pedro, e o valor **não passa por carta nem por agente nenhum**.

**POR QUÊ**
Até hoje o `deploy.yml` não tinha **uma linha** de `env`. `VITE_…` é lida na hora de **montar**:
o que não estava lá durante o `pnpm build` não existe na página depois. Juntar os ramos hoje
daria **CI verde, publicação verde, e a tela sem alcançar o banco na mão da pessoa** — o defeito
achado pelo `CTO` lendo `deploy.yml` e `client.ts` lado a lado, no único fluxo desta casa que
ninguém conseguia conferir, porque conferir exigia publicar.

**A MEDIÇÃO, feita aqui antes de escrever a trava**

```
   build com VITE_SUPABASE_URL preenchida ····· 3 ocorrências do endereço dentro do pacote
   build com ela vazia ······················· 0 · e o build NÃO reclama
                                                 (a frase de erro do client.ts vai junto,
                                                  para estourar no navegador da pessoa)
```

**⚠️ A PRIMEIRA VERSÃO DA SEGUNDA TRAVA ERA CEGA, e o ensaio pegou**
Ela ia procurar `supabase.co` no pacote. Medido: **um pacote SEM banco também tem `supabase.co`**
— a biblioteca carrega a string `*.supabase.co` dentro dela. A trava passaria verde nos dois
casos. O padrão que discrimina é `https://<host>.supabase.co`: **3 × 0**. Verde cego evitado por
testar a trava, não o programa.

**A PROVA DAS DUAS, rodadas como o GitHub roda (`bash -e`), 6 casos, 6 certos**
as duas presentes → passa · falta o endereço → para · falta a chave → para · faltam as duas →
para · pacote com banco → passa · pacote sem banco → **para**. A armadilha que este ensaio
existia para pegar era o `[ -z "$X" ] && …`, que sob `bash -e` derruba o passo **mesmo quando
está tudo certo**. Por isso o roteiro usa `if`.

**O ENSAIO SEM PUBLICAR, que não foi pedido e eu pus assim mesmo**
`workflow_dispatch` ganhou a opção `ensaio`: monta, roda as duas travas e **para antes de
publicar**. Existe porque este era o único fluxo da casa que só se conferia pondo no ar — e
agora dá para provar a fiação **sem** pôr. Desmarcado, o comportamento é o de sempre.

**O QUE EU NÃO CONSEGUI PROVAR, e não vou fingir que provei**

- que `${{ vars.X || secrets.X }}` resolve como eu espero **na máquina do GitHub**. A sintaxe
  está certa; só uma corrida de verdade prova. **É por isso que o ensaio existe: rodar ele é a
  prova, e custa nada;**
- que a página publicada **abre e alcança o banco** num navegador de gente. Isso só depois de
  publicar;
- o `base` do Vite continua **intocado**: onde este aplicativo vai morar (dentro da Central ou
  em endereço próprio) é decisão do Pedro, e mexer nisso antes seria escolher por ele.

**O QUE ESTA DECISÃO NÃO RESOLVE**
`secrets` **não guarda segredo nenhum aqui**: as duas variáveis ficam dentro do pacote publicado,
porque é assim que `VITE_` funciona. `Secrets` só esconde o valor do log. Quem protege o banco é
a política (RLS) dentro dele, avaliada contra o usuário logado — e a chave `sb_secret_…` nunca
entrou e nunca entra neste arquivo.

**EMENDA, no mesmo dia — publicar quer dizer `main`, por qualquer porta**
O ensaio abriu um buraco que o `CTO` viu antes de qualquer um usar, e ele é consequência direta
do acréscimo: `workflow_dispatch` **sempre existiu aqui sem restrição de ramo**. Enquanto ninguém
usava o botão, era arma guardada. A partir do momento em que o ensaio **convida** a usá-lo, uma
caixinha desmarcada por engano a partir da `migracao-supabase` publicaria o ramo **sem juntar** —
e o site ficaria no ar diferente da `main`, sem ninguém ter decidido isso.

```
   push na main ················ publica          (o botão do Pedro)
   dispatch da main, desmarcado · publica
   dispatch de OUTRO ramo ······ NÃO publica  ← a trava nova
   dispatch com `ensaio` ······· NÃO publica
```

E **passo pulado deixou de ser silêncio**: o fluxo diz, em texto, por que não publicou. Os quatro
casos foram rodados com a substituição que o GitHub faz: **4 de 4 certos**.

*Quem convida para o botão responde pelo botão* — a frase é do `CTO`, e o buraco era dele por
origem e meu por consequência.

---

## Decisão 23 — este aplicativo nasce em `compras.campisi.com.br`, e o pacote prova que sabe onde mora · 02/09/2026

**O QUE FOI DECIDIDO**
O endereço saiu do indefinido: **`compras.campisi.com.br`**, endereço próprio, e a equipe nunca
decora o `github.io`. É a decisão 145 do `CTO`, e ela **revoga a ordem dele de mais cedo** ("não
toque no `base`") — o que mudou foi uma medição: a zona `campisi.com.br` já está na Cloudflare, na
mesma conta do Worker da Central, então endereço próprio custa **um registro de DNS**, criado pelo
`Banco_de_Dados` com a palavra do Pedro.

Três coisas neste commit, e **zero linha de código de produto**:

```
   public/CNAME ················ uma linha: compras.campisi.com.br
                                 (o Vite copia public/ para dist/, e é por esse
                                  arquivo que o GitHub Pages sabe o domínio)
   VITE_BASE_PATH=/ no Build ··· o base padrão /central-compras-pbqph/ é certo
                                 para github.io e ERRADO para domínio próprio
   a terceira trava ··········· o pacote aponta para a raiz? sobrou caminho
                                 velho? o CNAME veio junto?
```

**POR QUE NÃO PRECISOU DE CÓDIGO DE PRODUTO**
O `vite.config.ts` **já lia** `VITE_BASE_PATH` (linha 11), de um conserto anterior. Conferido
antes de escrever qualquer coisa: a ordem supunha uma peça, e a peça existia. Se não existisse,
isto viraria proposta, porque o congelamento vale até 06/09.

**A MEDIÇÃO, feita antes de escrever a trava — e ela pegou a MESMA cegueira do `supabase.co`**

```
                              pacote CERTO      pacote ERRADO
   grep /assets/  (ingênuo)        6                 6     ← VERDE CEGO
   grep "/assets/ (com a aspa)     6                 0
   o slug no pacote inteiro    0 arquivos        3 arquivos
```

A pergunta ingênua fica verde nos dois porque **`/central-compras-pbqph/assets/` contém
`/assets/`**. É a segunda vez no mesmo dia que uma trava minha ia nascer cega, e a segunda vez que
medir os dois lados antes de escrever matou o verde falso. **Isto não é sorte duas vezes: é o
método.**

**O ENSAIO — 5 casos, 5 certos, e os três portões acusando sozinhos**
O roteiro é lido **de dentro do `deploy.yml`** e rodado com `bash -e`, como o GitHub roda —
ensaiar uma cópia do roteiro não prova nada sobre o roteiro que vai rodar.

```
   pacote do github.io ················ para   (portão 1 de 3)
   pacote de raiz, inteiro ············ passa
   raiz + sobra do caminho antigo ····· para   (portão 2 de 3)
   raiz SEM o CNAME ·················· para   (portão 3 de 3)
   pacote de raiz de novo ············· passa
```

Cada portão foi sabotado **separadamente** de propósito: o primeiro a disparar esconde os outros,
e trava com portão nunca exercitado é trava que ninguém viu funcionar.

**O TERCEIRO PORTÃO NÃO FOI PEDIDO, E EU PUS**
`base` de raiz e `CNAME` são **duas metades da mesma decisão**. Um pacote de raiz publicado **sem**
CNAME cai no endereço antigo e dá tela branca igual — só que sem aviso nenhum, porque as outras
duas travas estariam verdes. As duas metades viajam juntas ou não viajam.

**⚠️ O QUE EU NÃO CONSEGUI PROVAR, e não vou fingir que provei**

- **o ensaio no GitHub não alcança esta trava hoje** — e isto não é previsão: o ensaio **foi
  rodado** (corrida `33683289814`, 21 segundos, vermelha) e morreu no portão anterior. Motivo
  medido: `gh variable list` e `gh secret list` voltam **vazios**. Enquanto o Pedro não digitar as
  duas variáveis do banco, **nenhum ensaio chega na trava do endereço** — ela está provada só na
  minha máquina;

  **⚠️ Mas o vermelho pagou por si e fechou TRÊS dos "não provados" da decisão 22:**
  `${{ vars.X || secrets.X }}` **resolve na máquina do GitHub** sem erro de sintaxe (o log mostra a
  variável vazia, ou seja: resolveu); a trava do banco **morde lá**, com a frase que o Pedro vai
  ler; e `deploy: skipped` — **o ensaio parou antes de publicar**, como projetado. De quebra, o
  botão do ensaio funciona a partir de um ramo que não é a `main`, coisa que não dava para saber
  sem apertar;
- **a página abrindo em navegador de gente** — só depois de publicar.

**✅ EMENDA DA MESMA NOITE — o DNS saiu do "não provado", e eu medi em vez de aceitar o relato**
O `Banco_de_Dados` criou o registro com a palavra do Pedro, e o `CTO` avisou. Conferi por conta
própria, contra o `8.8.8.8`:

```
   compras.campisi.com.br  CNAME  pedrocampisi.github.io   TTL 300
                             → 185.199.108/109/110/111.153   (os quatro do GitHub Pages)
   http://compras.campisi.com.br   → HTTP 404, servidor: GitHub.com
   https://compras.campisi.com.br  → sem certificado válido ainda
```

**O 404 é a informação boa, não a ruim.** Ele vem **do GitHub**: o caminho do DNS está inteiro e
chega lá — o que falta é o GitHub **saber** que este domínio é deste repositório, e isso é
exatamente o clique `Settings > Pages > Custom domain`, que é do Pedro. E o HTTPS sem certificado
é o esperado: o GitHub só emite **depois** que o domínio é registrado ali.

Ou seja, o estado tem nome: **o DNS está pronto e o site ainda não foi apresentado ao domínio.**

**⚠️ A ORDEM DAS COISAS IMPORTA, e é do Pedro**
Este commit **não publica nada**: está na `migracao-supabase`, e publicar quer dizer `main` (a
trava de ramo da decisão 22). Mas no dia em que ele juntar os ramos, **o endereço que a equipe usa
muda**. Se a `main` subir com `base` de raiz **antes** do DNS e do `Settings > Pages`, o site fica
inalcançável até o DNS chegar. A sequência segura é: **DNS primeiro, `Custom domain` depois,
juntar os ramos por último** — e `Enforce HTTPS` quando o GitHub liberar o certificado.

**⚠️ E O ENSAIO LOCAL TEM UM PONTO CEGO QUE ELE MESMO NÃO ENXERGA**
O Git avisou que `public/CNAME` viraria CRLF nesta máquina, e eu fui medir se a trava aguentava.
O teste disse "aguenta". **O teste estava certo e a conclusão estava errada:** os bytes (`od -c`)
mostram `\r\n` no arquivo, mas o `$(cat)` devolveu **22 caracteres** — o Git Bash do Windows
**come o `\r` sozinho**. Na máquina do CI, que é Linux, o `\r` **fica**, e a trava daria vermelho
num arquivo correto. Ou seja: **este portão não pode ser ensaiado aqui**, porque a diferença que
ele mede não existe nesta máquina.

Dois consertos, e nenhum deles confia no outro: a trava passa o `tr -d '\r'` antes de comparar, e
o `.gitattributes` prende o `CNAME` em LF em toda máquina. **A lição é mais larga que o `\r`:**
instrumento ensaiado na máquina errada não prova o que ele faz na máquina certa — e foi um aviso
do Git, que era fácil de ignorar, que abriu isso.

**O QUE ESTA DECISÃO NÃO RESOLVE**
O crachá compartilhado (sessão em cookie no `.campisi.com.br`, para não digitar senha em cada
software) é **código de produto** e continua congelado até 06/09. Por ora a pessoa digita a senha
da Central uma vez por máquina e a sessão persiste.

---

## Decisão 24 — a hospedagem vai para o Cloudflare, e publicar deixa de ser automático · 02/09/2026

**O QUE FOI DECIDIDO**
O GitHub Pages saiu. Este aplicativo passa a morar no **Cloudflare**, junto com a Central e com o
resto da plataforma. **Palavra do Pedro, dita na janela dele** — a carta do `CTO` (decisão 154
dele) trazia a mesma coisa, mas eu perguntei antes de executar, porque mudança de direção que
joga fora trabalho do mesmo dia não se faz sobre relato.

O endereço **não muda**: continua `compras.campisi.com.br`. Muda **quem serve**.

**POR QUE — e a razão é boa o bastante para o desperdício**
A escolha anterior pelo Pages era **inércia**: era o que esta casa já tinha. O Pedro perguntou o
óbvio, que ninguém tinha perguntado — *por que a hospedagem vai para um lugar diferente de tudo o
mais?* Não havia resposta. Uma plataforma com cada software num lugar diferente cobra esse preço
todo dia, em cabeça de quem mantém.

**O QUE FOI JOGADO FORA, e escrito para não se fingir que não houve custo**

```
   public/CNAME + a linha dele no .gitattributes ····· 3 horas de vida
   .github/workflows/deploy.yml (o fluxo inteiro) ···· o trabalho da tarde
   a variável VITE_BASE_PATH ························ nasceu e morreu no mesmo dia
```

O desperdício é da decisão anterior, não do trabalho: **as travas sobreviveram inteiras**, porque
elas nunca foram sobre o GitHub — eram sobre o pacote. Mudaram de casa, não de pergunta.

**AS TRAVAS MUDARAM DE CASA, E A CASA NOVA É MELHOR**
`scripts/conferir-pacote.js`, ligado ao `pnpm run deploy`:

```
   pnpm run deploy  =  pnpm build  &&  pnpm conferir:pacote  &&  wrangler deploy
```

Três perguntas: **o banco entrou no pacote?**, **o pacote aponta para a raiz?**, **o subendereço
morto voltou?**

Elas ficaram **locais** e não no CI por um motivo medido, não por preguiça: conferir o pacote
exige **montar** o pacote, e montar exige o endereço e a chave do banco. No CI isso obrigaria o
Pedro a digitar as duas coisas **também lá**, criando mais um lugar no mundo com o nome do banco
dentro. Aqui elas vêm do `.env.local`, que já está na pasta, que o Vite já lê sozinho, e que
**nenhum agente nunca abriu**.

E há um ganho que o CI não dava: **a trava passou a ficar no caminho do ato real.** Antes, a
conferência era num lugar e a publicação em outro; agora não existe caminho que suba sem passar
por ela — a não ser digitar `wrangler deploy` na mão, e isso está escrito no topo do
`wrangler.jsonc`.

**O ENSAIO — 6 casos, 6 certos, cada portão sabotado sozinho**

```
   pacote inteiro ····················· passa
   sem endereço de banco ·············· para   (1 de 3)
   index não aponta para a raiz ······· para   (2 de 3)
   o subendereço morto ressuscitou ···· para   (3 de 3)
   sem index.html no pacote ·········· para   ← trava que QUEBRA fica vermelha
   pacote inteiro de novo ············· passa
```

A sabotagem do portão 1 foi feita **por substituição no pacote montado**, com expressão regular:
o endereço do banco foi trocado **sem nunca ser lido nem impresso**. Remontar com a variável
errada seria mais simples e faria o valor passar por mim.

**O QUE MUDOU NO `vite.config.ts`, e por que isso não fere o congelamento**
O `base` deixou de ser variável e virou `/`, em dev e em build. **A variável `VITE_BASE_PATH` foi
apagada**: manivela que só tem uma posição é manivela que engana.

É código de produto? É arquivo de construção, e a régua que vale é a **decisão 137 do `CTO`: o
congelamento mede o que o usuário vê.** Isto não muda uma tela, um cálculo nem uma regra — muda de
onde o navegador busca os arquivos. **Zero arquivos em `src/`**, como em todo o dia de hoje.

**ONDE EU DIVERGI DA CENTRAL, DE PROPÓSITO**
A Central chama `npx wrangler deploy`, **sem versão presa**. Aqui o `wrangler` entrou como
dependência de desenvolvimento **fixada em `4.128.0`**, sem acento circunflexo — a decisão 20
desta casa diz que versão mora num lugar só, e ferramenta que publica é o último lugar onde se
quer descobrir uma diferença de versão.

**UMA LINHA QUE É SEGURO, E NÃO NECESSIDADE — declarado no arquivo**
`not_found_handling: single-page-application` entrou copiado da Central. **Esta casa não tem
roteador de cliente** (conferido: nenhum `react-router` nas dependências; a navegação é estado
interno), então hoje não existe endereço interno para recarregar. A linha fica porque, no dia em
que existir, a falta dela aparece como 404 no navegador de uma pessoa — e não aqui.

**⚠️ O QUE ESTE COMMIT NÃO FEZ, E NÃO VAI FAZER SOZINHO**
**Nada foi publicado.** `wrangler deploy` é ato que sai desta máquina, e só roda com a palavra do
Pedro dita na janela dele. Conferido que o `wrangler` **já está logado** nesta máquina (sem
imprimir a conta), então o ensaio depende só da palavra — não de configuração.

Continuam sem prova: o endereço `compras.campisi.workers.dev` existindo, a tela abrindo, o login
falando com o banco, e o PDF saindo. Tudo isso é medição **depois** do ensaio.

**⚠️ E UMA COISA QUE ESTE COMMIT DESCOBRIU, QUE É MAIOR QUE ELE**
Corrigindo o `Fluxo.md`, apareceu o `start.bat` — o atalho copiado para a **área de trabalho das
pessoas**, com o endereço escrito dentro. Corrigi o arquivo daqui, **e isso não corrige as
cópias**. Pior: quando o Pages parar de receber publicação, o site de lá **não some** — congela na
`main` de hoje, que é a versão de arquivo no OneDrive, sem login e sem banco. Quem clicar no
atalho velho abre um aplicativo que **funciona**, parece o certo, e grava em outro lugar. Virou a
**pendência 6**, e é decisão do Pedro, não minha: mexe no dia das pessoas.

---

## Decisão 25 — o primeiro ensaio no ar achou um defeito antigo, e a trava nova é sobre ele · 03/09/2026

**O QUE FOI MEDIDO, com a palavra do Pedro na janela**
`pnpm run deploy` subiu em `compras.campisi.workers.dev`. As quatro medições que o `CTO` pediu:

```
   a tela carrega ················· SIM — o formulário de entrada inteiro
   a tela alcança o banco ········· SIM — 1 chamada a /auth/v1/token
   a recusa é frase de gente ······ SIM — "E-mail ou senha incorretos."
                                    (a decisão 5, funcionando no ar)
   o PDF sai ····················· NÃO MEDIDO — exige estar dentro, e eu não
                                    tenho senha nem uso a de ninguém
```

A prova do banco foi feita com um e-mail **que não existe** e uma senha sem valor: prova a fiação
inteira sem tocar em conta de pessoa nenhuma e sem disparar e-mail.

**⚠️ O DEFEITO QUE O ENSAIO ACHOU, E QUE É ANTIGO**
O console acusou `Unexpected token '<'`. A rede não tinha **um 404 sequer** — e é justamente esse
o problema:

```
   /manifest.webmanifest  →  200, content-type text/html, com o index.html dentro
   /registerSW.js         →  200, content-type text/html, com o index.html dentro
```

O `index.html` pede os dois; **a montagem não os gera** (`dist/` não tem nenhum dos dois, e tem o
`sw.js`). O `not_found_handling: single-page-application` transforma arquivo faltando em página
inteira com **200**, e o navegador tenta ler página como programa.

**NÃO É REGRESSÃO MINHA, e eu fui medir antes de dizer isso:** o site publicado no GitHub Pages
(ramo `main`) responde **404 nos dois**. O PWA desta casa — o "instalável, funciona offline" que o
`Fluxo.md` promete — **nunca funcionou em produção**. A hipótese é o `vite-plugin-pwa` não emitir
os arquivos sob o Vite desta casa; é hipótese, não medição, e está escrita como hipótese.

O que o Cloudflare mudou não foi criar o defeito: foi **trocar o 404 honesto por um 200 mentiroso**.

**A TRAVA NOVA — a quarta pergunta do `conferir-pacote.js`**
*Tudo que o `index.html` pede existe dentro do pacote?*

É a mesma família das outras três, e a mesma cegueira de sempre: **"o arquivo respondeu?" fica
verde nos dois casos**, porque o servidor responde 200 para tudo. A que discrimina é "o arquivo
**existe**?".

**Ensaiada:** escondi um `.css` que o índice pede — ficou **vermelha**, nomeando o arquivo. O
pacote inteiro passa.

**AS DUAS EXCEÇÕES SÃO DECLARADAS DENTRO DA TRAVA, E ISSO É DE PROPÓSITO**
`/manifest.webmanifest` e `/registerSW.js` estão numa lista de exceções **com o motivo e o número
da pendência escritos ao lado**, e a trava **imprime as duas toda vez que roda**, com um aviso de
que exceção não é "está tudo bem".

O caminho fácil era a trava não perguntar isso, ou perguntar frouxo. Recusado: **exceção escrita é
dívida que se cobra; trava frouxa é dívida que some.** No dia em que a pendência 7 fechar, as duas
linhas somem do código — e se alguém apagar a pendência sem consertar, a trava continua gritando.

**POR QUE EU NÃO CONSERTEI O PWA AGORA**
Produto está congelado até 06/09, e este é dos que o usuário vê (instalável, offline). Mais: a
causa é hipótese, e conserto sobre hipótese, à noite, em ferramenta de montagem, é como se cria o
defeito seguinte. Virou a **pendência 7**.

**E UMA ARMADILHA QUE EU MESMA TINHA PLANTADO, achada ao rodar**
Eu escrevi `pnpm deploy` em sete lugares. **`pnpm deploy` é comando EMBUTIDO do pnpm** (empacotar
workspace) e não roda o roteiro desta casa: o certo é `pnpm run deploy`, com o `run`. Corrigido em
todos os documentos vivos e no `wrangler.jsonc`, com o motivo escrito — senão a próxima sessão
"conserta" de volta.

---

## Decisão 26 — `compras.campisi.com.br` está no ar, e o endereço de ensaio morreu de propósito · 03/09/2026

**O QUE FOI FEITO, com a palavra do Pedro na janela**
`routes` com `custom_domain` entrou no `wrangler.jsonc` e a publicação subiu. O Cloudflare criou o
DNS e o certificado sozinho.

**A MEDIÇÃO DOS DOIS ENDEREÇOS — e medir os dois é a régua, não zelo extra**

```
   https://compras.campisi.com.br ·········· abre, HTTPS válido, tela de entrada
        DNS ····························· 172.67.168.65 + dois AAAA (Cloudflare)
        chamada ao banco ················· /auth/v1/token
        a recusa ························ "E-mail ou senha incorretos."
   https://compras.campisi.workers.dev ····· 404  ← de propósito, ver abaixo
```

A régua veio da `Central`, que pagou por ela no mesmo dia: **"medir só o que você acabou de fazer
é o jeito mais limpo de não ver o que acabou de quebrar."**

**⚠️ `workers_dev: false` É ESCOLHA ESCRITA, E NÃO O PADRÃO ACONTECENDO**
Quando `routes` existe, o wrangler **desliga o `.workers.dev` por conta própria** e avisa no meio
da saída do deploy, onde é fácil não ler. A `Central` descobriu isso levando 404 por alguns
minutos no endereço dela, em 03/09.

Aqui a escolha é **desligar**, e por um motivo: `compras.campisi.workers.dev` era **ensaio**, e
ensaio que fica no ar vira endereço que alguém salva. Um endereço a menos para confundir com o de
verdade — e esta casa já tem um problema desses vivo (a pendência 6).

**O corte não abriu janela sem endereço** porque **ninguém usa nenhum dos dois ainda**: a equipe só
chega em `compras.campisi.com.br` depois de juntar os ramos e trocar os atalhos. Por isso deu para
fazer numa publicação só. Se alguém já estivesse usando, seriam duas: liga o novo, confere, depois
desliga o velho.

**⚠️ O SUSTO DA MEDIÇÃO, QUE ERA O MEU INSTRUMENTO E NÃO O SITE**
No endereço novo, o formulário de entrada parecia **não fazer nada**: nenhuma chamada ao banco,
nenhuma mensagem. Isso tem cara de "o site não alcança o banco", que seria o pior desfecho
possível de uma publicação.

Era o contrário: **o formulário nunca era enviado.** A ferramenta que eu usava escreve o valor
dentro do campo **sem avisar o React**, então o programa via os campos vazios e não chamava nada.
Quando o preenchimento passou a disparar os eventos que uma pessoa dispara ao digitar, a chamada
saiu e a frase apareceu.

**A lição é a de ontem com roupa nova** (`instrumento ensaiado na máquina errada não prova o que
faz na máquina certa`): **instrumento que não faz o que uma pessoa faz não mede o que uma pessoa
vive.** E o modo de falhar é traiçoeiro — ele produz *silêncio*, que se parece com defeito grave.
Se eu tivesse parado no primeiro resultado, teria escrito na carta que a publicação subiu quebrada.

**O QUE CONTINUA QUEBRADO, e é o de sempre**
O erro `Unexpected token '<'` continua no console, nos dois endereços: é a **pendência 7**, o PWA
que nunca foi gerado. Não muda com o domínio.

**UMA OBSERVAÇÃO NOVA, QUE NÃO É DEFEITO MAS É INFORMAÇÃO**
No endereço próprio o Cloudflare injeta um pedido para `/cdn-cgi/rum` — é a medição de audiência
dele, ligada na zona, e **não** é código desta casa. Não existia no `.workers.dev`. Fica escrito
para ninguém achar, daqui a seis meses, que este aplicativo passou a mandar dado para algum lugar
por conta própria. Se o Pedro não quiser, desliga-se na Cloudflare, e é decisão dele.

**O QUE AINDA NÃO FOI PROVADO**
Emitir uma OC. Exige estar dentro, e eu não tenho senha nem uso a de ninguém. **Quem fecha é uma
pessoa com conta** — está na pendência 1.

---

## Decisão 27 — o endereço velho parou de servir o programa e passou a avisar · 03/09/2026

**A PALAVRA DO PEDRO, na janela do `CTO`, na noite de 03/09**
*"Pode trocar, tem ninguém usando ainda."* Ele já tinha entrado em `compras.campisi.com.br`. Isso
soltou a página que estava pronta e parada desde a manhã, por decisão dele mesmo.

**O QUE ESTAVA EM JOGO — e não era o atalho quebrar**
`pedrocampisi.github.io/central-compras-pbqph` **não some** quando deixa de receber publicação:
congela na última versão que subiu, que era **a de arquivo no OneDrive, sem login e sem banco**.
Quem clicasse no atalho antigo abriria um programa que funciona, que parece o certo, e que
**grava em outro lugar**. Duas versões vivas ao mesmo tempo, e nenhuma delas avisando. O perigo
era o endereço velho **não** quebrar.

**COMO FOI FEITO, e por que apagar-e-criar em vez de editar**
O endereço velho era servido por um fluxo na `main` que compilava o programa antigo. Ele foi
**apagado**, e um outro, com outro nome, foi **criado** — `aviso.yml`, que sobe uma pasta com um
HTML e nada mais, sem compilação e sem dependência.

```
   apagar um e criar outro ... os DOIS ramos apagaram o deploy.yml
                               -> na virada, nada para alguem resolver errado
   editar o antigo ........... modificado de um lado, apagado do outro
                               -> conflito no meio da virada, na pressa
```

O `aviso.yml` existe **só na `main`**, então a junção dos ramos o mantém — e o `index.html` do
aviso é **idêntico** nos dois ramos, de propósito, para o arquivo não virar conflito. **O código
do programa na `main` não foi tocado**: só a receita de publicação.

**O 404 TAMBÉM AVISA**
`404.html` é cópia do `index.html`. Quem tinha atalho para uma tela interna cai no recado, e não
na tela preta do GitHub. Custa um arquivo e cobre o caso que ninguém lembra de testar.

**O QUE FOI MEDIDO NO AR, e não o que foi enviado**

```
   endereco velho, raiz ......... 200, "Este endereco saiu do ar."
                                  zero resto do programa antigo na pagina
   atalho de tela interna ....... 404 do GitHub servindo O AVISO
   o link laranja, CLICADO ...... leva a tela de entrada de compras.campisi.com.br
   compras.campisi.com.br ....... 200, o mesmo pacote de antes, intocado
   compras.campisi.workers.dev .. 404, o ensaio segue morto
```

**O clique foi de verdade, e não uma leitura do `href`.** Cabeçalho de HTTP não prova que um link
leva a algum lugar — é a lição 31, do susto do instrumento, aplicada antes de doer.

**UMA COISA QUE ESTAVA ESCRITA E DEIXOU DE VALER**
A pendência 5 dizia que juntar os ramos **republica na hora** o que a equipe usa, e que era esse
o botão que a virada apertava. Não é mais: a `main` não publica o programa. **A virada virou
papelada** — não muda nada para quem usa o software. Corrigido lá, e não apagado.

**O QUE SOBRA**
Trocar as cópias do atalho nas áreas de trabalho. Deixou de ser risco e virou arrumação, porque
o atalho velho agora cai no aviso.

