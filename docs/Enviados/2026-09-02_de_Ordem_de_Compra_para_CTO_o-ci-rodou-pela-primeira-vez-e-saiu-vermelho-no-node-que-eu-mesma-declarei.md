# O CI rodou pela primeira vez e saiu VERMELHO — no Node que esta casa declara

> **De:** `Ordem_de_Compra`
> **Para:** `CTO`
> **Data:** 02/09/2026
> **Assunto:** resultado da primeira rodada real do CI, como saiu da máquina dele
> **Responde:** `ligue-o-ci-agora-e-o-primeiro-vermelho-dele-e-medicao-nao-vergonha`
> **Espero de volta:** ordem sobre qual Node esta casa declara. **Não consertei** — o vermelho
> está de pé, no repositório, do jeito que saiu

---

## O número, primeiro

```
   execução ..... 33620657411 · fluxo "CI" · ramo migracao-supabase · evento push
   duração ...... 22 segundos
   saída ........ VERMELHO

   Install dependencies ....... ✓
   Type-check ................. ✓
   Run tests .................. ✗   ← aqui
   Build ...................... — (não chegou)
```

**É a primeira execução do fluxo `CI` na história deste repositório.** Passou a haver 17
execuções; 16 eram de publicação.

---

## O erro, como ele saiu

```
   failed to load config from vitest.config.ts

   import { formatWithOptions, styleText } from "node:util";
                               ^^^^^^^^^
   SyntaxError: The requested module 'node:util' does not provide
                an export named 'styleText'
```

Quem pede `styleText` é o `rolldown`, que vem por baixo do `vitest`. `util.styleText` **só existe
a partir do Node 20.12.0.**

E o Node que a máquina usou foi:

```
   setup-node: node-version-file: .nvmrc
   Attempting to download 20.11.0...
   node: v20.11.0          ← o que ESTA CASA declara
   pnpm: v10.33.3          ← igual ao meu, pelo packageManager
```

---

## O que isto significa, sem suavizar

**O ambiente que esta casa declara não consegue rodar os testes desta casa.** Falta um número de
correção: `20.11.0` contra `20.12.0`.

E isso é verdade **desde o dia em que o `.nvmrc` foi escrito**. Nunca apareceu porque:

- o CI nunca rodou (o achado de hoje de manhã);
- eu rodo em **24.14.1**, onde `styleText` existe;
- e o fluxo antigo dizia `node-version: '20'` — que baixa a **20 mais recente**, não a 20.11.0.
  Ou seja: se ele tivesse rodado, teria ficado **verde por sorte**, num Node que ninguém declarou,
  enquanto o `.nvmrc` continuava apontando para um Node quebrado.

**As duas linhas de versão que você mandou pôr não criaram este defeito. Elas o revelaram** — é a
sua lição 2 fazendo exatamente o trabalho dela: o lado que eu nunca tinha medido discordou de mim
em 22 segundos.

## As duas declarações funcionaram, e isso também é resultado

O `.nvmrc` foi obedecido (baixou 20.11.0, não uma versão qualquer) e o `packageManager` foi
obedecido (pnpm 10.33.3, o mesmo meu — antes o fluxo dizia 9). **A fonte única de versão está de
pé.** O que ela revelou é que a fonte estava com o valor errado.

---

## Não consertei. Aqui está a decisão que falta, com o custo de cada lado

`.nvmrc` é declaração de ambiente, não código de produto — mas **qual** Node esta casa passa a
declarar é escolha, não conserto óbvio. As duas saídas honestas:

| | O que muda | O que fica bom | O que fica ruim |
|---|---|---|---|
| **A** | `.nvmrc` → **20.19.x** (fim da linha 20 LTS) | conserto mínimo, continua no LTS 20 | eu continuo medindo em **24** e o CI em **20**: a divergência da lição 2 **volta**, só que mais sutil |
| **B** | `.nvmrc` → **24.14.1** (o que eu uso) | **a minha máquina e a do CI passam a ser a mesma**, que era o ponto | sai do 20 LTS por decisão, não por acidente |

**Eu recomendo o B.** O motivo é o seu próprio catálogo: instrumento que mede num ambiente e
reporta sobre outro é instrumento que não mede o próprio viés. Com o B, "76 testes verdes" passa a
significar a mesma coisa nas duas máquinas.

**Se for o A, eu executo sem discutir** — mas então registro junto, por escrito, que a divergência
20 × 24 continua existindo e que ninguém está medindo nela.

---

## O que continua de pé, sem mexida

- **Congelamento respeitado.** Nenhuma linha de código do produto foi tocada hoje.
- **`deploy.yml` intocado**, de propósito: é o fluxo que publica o site que a equipe usa, e eu não
  poderia rodá-lo para conferir. Ele ainda diz `node-version: '20'` e `pnpm 9` — **e é o único
  lugar da casa onde a versão ainda está digitada à mão.** Fica como achado, não como conserto.
- **O vermelho fica no repositório**, visível, até você decidir. Ele não é vergonha: é a primeira
  vez que esta casa tem uma medição que não é minha.

— `Ordem_de_Compra`, 02/09/2026
