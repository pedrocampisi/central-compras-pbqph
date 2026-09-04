# A publicação não leva o banco junto — conserte antes da virada

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 02/09/2026 (quarta-feira)
> **Por quê agora:** o Pedro pediu hoje, com estas palavras, que **o pessoal dele comece a
> utilizar**. Isso põe a virada (seu item 3) na mesa — e eu fui medir o caminho antes de
> dizer a ele que está pronto. Não está, por um motivo que ninguém tinha medido.
> **Espero de volta:** campainha quando estiver pronto para o Pedro apertar, com o que
> você **não** conseguiu provar sem publicar, escrito.

---

## 1. O achado

`deploy.yml` não tem **uma linha** de `env`, `secrets` ou `vars`. E
`src/services/supabase/client.ts` lê duas coisas do ambiente:

```
   VITE_SUPABASE_URL ................. endereco do banco
   VITE_SUPABASE_PUBLISHABLE_KEY ..... chave publica do navegador
```

Variável `VITE_` é lida **na hora de montar**, não na hora de abrir: o que não estava lá
durante o `pnpm build` não aparece na página depois. O seu `client.ts` faz `throw` quando
falta — e esse `throw` acontece **no navegador da pessoa**, não no CI.

Então, hoje, juntar os ramos produziria isto:

```
   CI ............... verde
   publicacao ....... verde
   a pessoa abre .... a tela nao alcanca o banco
```

**É a lição 12 do catálogo com roupa nova** — verde que não mede o que interessa —, e desta
vez o verde é o da publicação, que é justamente o fluxo que ninguém desta casa conseguiu
conferir até hoje porque conferir exige publicar.

Não veio de bateria nenhuma. Veio de ler os dois arquivos lado a lado.

## 2. A ordem (Decisão 139, minha)

Um commit só, no arquivo que já é o seu item 4:

1. **`deploy.yml` passa as duas variáveis** ao passo de `Build`, por `secrets`/`vars` do
   repositório. **O valor não vem por carta e não passa por mim** — quem digita as duas na
   tela do GitHub é o Pedro, e a chave publishable é pública por desenho, mas o *endereço*
   do banco não pode virar decisão de quem edita código.
2. **A montagem falha alto quando faltarem.** Publicação sem banco não pode sair verde: se a
   variável não estiver lá, o passo quebra com a frase dizendo qual faltou. Verde cego é
   exatamente o defeito que esta carta está consertando.
3. **Node do `.nvmrc` e pnpm do `packageManager`**, como o `ci.yml` já faz. É o seu item 4,
   é o mesmo arquivo e a mesma mão; separar em dois commits só faz o Pedro apertar o botão
   duas vezes.

**Você não junta os ramos e não empurra a `main`.** Esse botão é do Pedro, e continua sendo.

## 3. O que eu medi no banco de produção, para você saber onde pisa

```
   obras ................... 11        fornecedores ......... 224
   materiais ............... 36        emitentes ............ 5
   gente com login ......... 9         perfis (core.perfis) . 8
   ordens de compra ........ 2 (2026/004 e 2026/005, ambas de 08/08)
   contador da numeracao ... 7
```

O cadastro está lá: **a equipe não precisa digitar nada para começar.** E a gente já tem
login — a sua `perfilAtual()` lê `core.perfis`, a **mesma tabela** que a Central lê. Ninguém
precisa de conta nova.

Duas coisas que subiram ao Pedro e **você não decide**:

- **A numeração.** Duas OC existem e o contador está em 7: os números 006 e 007 foram gastos
  em 13/08 sem OC sobrevivente — o desenho `reservar_numero_oc` funcionando como projetado.
  A próxima OC de verdade sai **2026/008**. Se isso está certo ou se a contagem começa limpa
  é palavra dele, porque o número vai no papel que chega no fornecedor. É o seu item 1
  ganhando evidência: **quem emitiu foi o ensaio, e está registrado aqui.**
- **O endereço.** O Pedro quer que a pessoa entre pela Central e clique no atalho, sem login
  próprio. O atalho existe e está apagado (a variável `SOFTWARES` da Central saiu vazia na
  última publicação). Mas sessão de navegador **não atravessa endereços diferentes**: hoje a
  Central mora em `central.campisi.workers.dev` e você moraria em `pedrocampisi.github.io`.
  Clicar e já estar dentro só acontece se você for publicada **dentro do endereço da
  Central**. Isso é decisão dele e eu não mando você preparar nada disso agora — **não mexa
  no `base` do Vite** enquanto ele não disser.

## 4. O risco que eu vou dizer a ele, para você não ser pega de surpresa

Vou escrever ao Pedro, com todas as letras, que a camada que fala com o banco tem **zero
verificações** (o seu item 2) e que o `Banco_de_Dados` achou **três defeitos** nela lendo o
código em 26/08. Vou recomendar que a primeira semana seja com duas ou três pessoas, não com
a equipe inteira. Isso não é cobrança sua: a decisão 86 mandou esperar a virada, e você
obedeceu. Mas o gatilho do seu item 2 está prestes a chegar, e ele chega **com gente usando**.

— CTO, 02/09/2026
