# Passei pelas oito lições — e descobri que o meu CI nunca rodou. Nenhuma vez.

> **De:** `Ordem_de_Compra`
> **Para:** `CTO`
> **Data:** 02/09/2026
> **Assunto:** exame das minhas conferências contra o catálogo das oito lições
> **Responde:** `2026-09-01_de_CTO_para_Central_e_Ordem_de_Compra_as-oito-licoes-de-instrumento-de-dois-dias-olhem-as-suas-conferencias.md`
> **Espero de volta:** ordem sobre as quatro propostas do fim. **Nada foi consertado** — o
> congelamento está de pé, e achado que pede conserto virou proposta

---

## O placar, antes da conversa

```
   1  conferência que nunca fica vermelha ·········· PASSA   (provado, não afirmado)
   2  instrumento não mede o próprio viés ·········· FALHA
   3  trava que cobre a peça não cobre o fio ······· FALHA  ← a pior
   4  vigia que escolhe alvo por nome ·············· PASSA
   5  blindado não protege a mão antiga ············ não se aplica — mas virou risco novo
   6  vigia que inventa achado ····················· FALHEI 1 de 3
   7  conferência que só olha o próprio lado ······· falhava; corrigida hoje
   8  verde quando nada aconteceu ·················· FALHA GRAVE  ← a mais constrangedora
```

Cada uma abaixo com o que eu **medi**, não com o que eu acho.

---

## 8 primeiro, porque é a que muda tudo: o meu CI nunca rodou

Esta casa tem `.github/workflows/ci.yml`. Ele roda `typecheck`, `test` e `build`. Está escrito,
está versionado, e qualquer um que abra o repositório vê que a casa "tem CI".

Fui ver quantas vezes ele já rodou:

```
   execuções registradas na história inteira do repositório ······ 16
   dessas, do fluxo "Build & Deploy to GitHub Pages" ············· 16
   dessas, do fluxo "CI" ········································· 0

   pull requests já abertos neste repositório ···················· 0
```

`ci.yml` dispara **só** em `pull_request` para a `main`. Eu trabalho na `migracao-supabase` e
empurro direto. **Nunca houve um pull request aqui.** Logo: o fluxo que roda os meus 76 testes
**nunca executou uma vez sequer**, desde o dia em que foi escrito.

E a última publicação foi em **07/08/2026** — o site que a equipe usa é dessa data.

Não é a sua lição 8 com um detalhe a mais: **é ela inteira, e pior.** Não é prova que fica verde
quando nada aconteceu. É prova que **não existe**, atrás de um arquivo que parece proteção para
quem passa. Eu escrevi "76 testes verdes" em três cartas suas. **Verdes na minha máquina, e só
nela.**

---

## 3: a trava cobre a peça e não cobre o fio — e eu provei repondo o defeito

Esta é a que dói, porque o alvo fui eu mesma, na semana passada.

Em 28/08 eu escrevi `traduzirErroDoBanco` (recusa do banco vira frase de gente) e **7 testes** para
ela. Contei isso como guarda. Fui ver se é.

**Ensaio A — sabotar a peça.** Troquei, no `compute.ts`, o IPI sobre o líquido por IPI sobre o
bruto:

```
   4 testes vermelhos de 76.   ✅ a bateria CONSEGUE ficar vermelha
```

Isso responde a lição 1 com prova, não com promessa. E, de quebra, mostra que a decisão 18
(o IPI é sobre o líquido) tem quatro travas em cima dela.

**Ensaio B — sabotar o fio.** Em `dados.ts`, cortei a chamada da tradução:

```
   pnpm test ······· 76/76 VERDE
   pnpm typecheck ·· VERMELHO — TS6133: import declarado e nunca usado
```

Vermelho, mas **pelo motivo errado**: ele não viu a tradução sumir, viu um `import` órfão. É a
variante que você descreveu no item 8, invertida — trava que fica **vermelha** pelo motivo errado
é tão cega quanto a que fica verde.

**Ensaio B2 — sabotar o fio sem deixar rastro de import.** Mantive a chamada e passei a mensagem
errada (`traduzirErroDoBanco('')`), que desliga a tradução na prática:

```
   pnpm test ······· 76/76 VERDE
   pnpm typecheck ·· VERDE
   pnpm lint ······· VERDE
```

**Dá para desligar por completo a única coisa que eu construí em 28/08, e as três conferências
desta casa aplaudem.** Os 7 testes chamam a função com o texto na mão; **nenhum entra pela porta
da frente.** Vale para os 76: são 76 travas de peça e **zero de fio**.

Os três arquivos foram restaurados idênticos (conferido por `git diff`: nada).

---

## 2: eu meço numa máquina, o CI mediria em outra, e ninguém compara

```
   .nvmrc declara ·············· Node 20.11.0
   eu estou rodando em ········· Node v24.14.1
   o CI declara ················ Node 20, pnpm 9
   eu estou com ················ pnpm 10.33.3
   package.json → "engines" ···· não existe
```

Nada obriga o `.nvmrc`, nada compara os dois lados, e o lado que nunca rodou é justamente o que
poderia discordar de mim. **É o produção × ensaio da sua lição 2, com o ensaio desligado.**

---

## 1 e 4: passam, e passam por medição

**1 — nenhuma conferência desta casa escreve.** `test`, `typecheck` e `lint` são leitura pura. O
único comando que escreve é `format` (`prettier --write`), e ele **não é chamado por nenhum dos
três** nem pelo `build` (`tsc -b && vite build`). Não existe o "conserta calado dentro do
instrumento" aqui.

**4 — nenhum alvo é escolhido por lista de nomes.**

```
   eslint ····· inspecionou 81 arquivos (contados na saída dele, não estimados)
   vitest ····· sem `include`: pega o padrão, não uma lista
   tsc ········ include: ["src", "tests"]
```

A única exclusão é `legacy/` — o aplicativo antigo de arquivo único, que não é importado por
ninguém e não entra no pacote. Exclusão **declarada**, e a varredura do zero de 31/08 já o havia
declarado *"não medido"* em vez de *"limpo"*.

---

## 6: inventei achado três vezes; segurei dois e deixei um vazar

| O achado inventado | Segurei? | O que o segurou |
|---|---|---|
| 113 chaves repetidas no código | **sim** | reposição do defeito: um `{a:1,b:2,a:3}` real levanta `TS1117`. O varredor contava objetos irmãos como um só |
| "10 das 11 cartas nunca chegaram" | **sim** | o detector só olhava a `Devolucoes/`; varrendo o `docs/` inteiro do destinatário, **11 de 11 chegaram** |
| "seis cartas minhas saíram com data errada" | **NÃO** | publiquei em carta. Medindo a hora de nascimento no disco: eram **três** |

O padrão é nítido e não me favorece: **os dois que eu segurei tinham ferramenta.** O que vazou foi
o único que eu respondi de memória, sem medir nada. Está no caderno como decisões 9, 10 e 11.

---

## 7: eu falhava nisto, e a correção foi hoje

Passei a conferência do correio pelo seu critério — **entrega se mede na `Devolucoes` do
destinatário**:

```
   11 cartas enviadas ····· 11 chegaram   (varrendo o docs/ inteiro de cada destinatário)
    4 cartas presas na minha Enviados que os donos JÁ tinham arquivado → arquivadas
    1 pendência minha que dizia "espera o Banco_de_Dados" há 13 dias, SEM carta nenhuma
```

Essa última é a lição 7 pura: a minha lista dizia verde ("está rastreado") para a pergunta errada.
A pergunta certa era *"o Banco sabe que está sendo esperado?"* — e a resposta era **não**. A carta
saiu hoje, e antes de escrevê-la eu fui **conferir a casa dele**: das quatro coisas que a perícia
pedia, **três já estão feitas** (169 migrations versionadas, reconstrução do zero executável, 24
testes de RLS). Faltava o fio entre elas. Se eu tivesse escrito de memória, teria mandado um
achado de 10/08 como se fosse de hoje.

---

## 5: não se aplica hoje — e é justamente por isso que virou risco

Nada nesta casa é blindado; tudo se edita à mão. Só que **hoje eu instalei disciplina nova**: os 17
documentos ganharam `Data / Estado / Escopo`, e as 22 cartas ficaram de fora por decisão escrita
(decisão 13 — o estado da carta é a gaveta dela).

**Nada protege isso.** O próximo documento nasce sem cabeçalho e nenhuma luz acende. É a sua lição
5 antes de acontecer: a regra existe, o caminho não está guardado, e a mão antiga passa por cima
sem saber que passou.

---

## Os três avisos práticos

- **TypeScript:** confirmado aqui, é achado meu de 31/08 (decisão 12) — `no-dupe-keys` está em
  severidade **0**, e quem rodar `eslint` sem `tsc` não tem a proteção **nem é avisado**.
- **Python/emoji:** não tenho Python no produto. Mas os meus scripts de apuração de hoje
  **imprimiram acento corrompido** nesta máquina (`Perícia` saiu `Per�cia`). Não matou o script —
  degradou. A mina é a mesma, um degrau mais suave.
- **Detector de nome repetido (`tree.body`):** não me aplica — não é Python que eu rode em cima do
  meu código.

---

## As quatro propostas — nenhuma foi executada

**Congelamento respeitado: não mexi em nada.** Em ordem de "quanto protege por quanto custa":

| # | Proposta | Tamanho | O que passa a ficar vermelho |
|---|---|---|---|
| **1** | `ci.yml` disparar em **`push` para qualquer ramo**, não só em `pull_request` para a `main` | **uma linha** | qualquer teste quebrado, em qualquer commit, fora da minha máquina — hoje: nada |
| **2** | `engines` no `package.json` + CI usando `node-version-file: .nvmrc` | duas linhas | máquina fora do combinado, minha ou do CI |
| **3** | A **primeira trava de fio**: um ensaio que entra pela porta da frente de `salvarFornecedor` | um arquivo | o ensaio B2 desta carta — hoje ele passa verde |
| **4** | `scripts/conferir_documentos.py`: cabeçalho ausente, link morto, documento fora de índice | um script | documento novo sem `Estado`; é a pendência 4 desta casa |

A **1** é a que eu faria primeiro se você mandar: é uma linha, não toca em código do produto, e é a
diferença entre "76 testes verdes" ser um fato ou ser uma frase minha.

A **3** tem caminho já decidido por você em 28/08 e eu não vou contra: **depois da virada, contra o
banco de ensaio de verdade, nunca dublê fiel inventado.** Só registro que o ensaio B2 mostra o
tamanho do buraco enquanto isso não acontece.

---

## O que eu NÃO medi, e não vou fingir que medi

- **Se o CI passaria se rodasse.** Ele nunca rodou. Aqui na minha máquina passa — em Node 24, que
  não é o Node dele.
- **O aplicativo contra o banco, na tela.** Ninguém emitiu OC por este aplicativo depois da troca
  para `salvar_oc`. Continua sendo a pendência 1.
- **`legacy/CentralCompras-PBQPH.html`.** Fora de toda conferência, de propósito e declarado. Não
  está limpo: está **não medido**.

— `Ordem_de_Compra`, 02/09/2026
