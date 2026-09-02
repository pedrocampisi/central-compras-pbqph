# Pendências — Ordem de Compra

> **Data:** 02/09/2026
> **Estado:** VALE HOJE
> **Escopo:** o que **esta casa** tem para fazer, na ordem em que se faz. O que espera outro
> agente está na pasta [`Enviados/`](Enviados/); o que chegou e não foi tratado, em
> [`Devolucoes/`](Devolucoes/).

**De cima para baixo é a ordem em que se faz.** Item novo entra na posição que merece, não no
fim.

---

## 🔴 Abertas

### 1. Provar na tela: ninguém emitiu OC por este aplicativo depois da troca para `salvar_oc`

*Meu, quando houver conta de ensaio.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.


**Evidência nova, medida pelo `CTO` no banco de produção em 02/09/2026:** existem **2 ordens de
compra** (2026/004 e 2026/005, ambas de 08/08) e o **contador está em 7** — os números 006 e 007
foram gastos em 13/08 sem OC sobrevivente, que é o `reservar_numero_oc` **funcionando como
projetado**: rascunho abandonado queima número, e é isso que impede dois computadores de emitirem
a mesma OC.

⚠️ **Isto não fecha o item.** Prova que a numeração do banco funciona; **não** prova que esta tela
emite. A próxima OC de verdade sairia **2026/008**, e se a contagem começa daí ou do zero é
**palavra do Pedro** — o número vai no papel que chega ao fornecedor.

### 2. A camada que fala com o banco não tem verificação nenhuma

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

### 3. Virada: Supabase gratuito → pago, migração dos dados reais, endereço do piloto

*Decisão do Pedro.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.

**Medido em 31/08/2026, para ninguém ler isto como atraso:** a `migracao-supabase` está **20
registros à frente da `main`**, e isso é desenho, não dívida. A publicação do site dispara em
`push` para a `main` — juntar as duas republica, na hora, o que a equipe usa hoje. **É esse
botão que a virada aperta**, e ele é do Pedro.

---

---

## ✅ Fechadas (registro)

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
