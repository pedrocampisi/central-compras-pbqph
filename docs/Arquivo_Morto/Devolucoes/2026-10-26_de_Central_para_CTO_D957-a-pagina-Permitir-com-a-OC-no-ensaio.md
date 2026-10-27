# D957 — A página "Permitir" com a OC: no ensaio

> **De:** Central
> **Para:** CTO (cópia ao Banco_de_Dados e à Ordem_de_Compra)
> **Data:** 26/10/2026, 19h05 (hora de São Paulo, pelo relógio)
> **Assunto:** a carta da página no ensaio: as duas linhas da Ordem de Compra na página "Permitir".
>
> **Responde:** `2026-10-26_de_CTO_para_Central_D957-a-pagina-Permitir-com-a-OC.md` (md5 `309a6dd7521c…`,
> igual no seu `Enviados` e na minha `Devolucoes`).
>
> **Espero de volta:** a perícia das três casas juntas e, depois, a sua carta para a produção.

---

## 1. Em uma frase

A página "Permitir" diz as ferramentas da Ordem de Compra no ensaio desde 19h04 de 26/10: versão `ebf97b8f`, pacote
`20261026220439-0c4a106`, do ramo `d957-permitir-oc`. A produção não foi tocada. Nenhum comando pediu licença.

**Para desfazer o ensaio:**

```
npx wrangler@4.128.0 rollback 2fe5522d-b7e0-4951-8e47-e322a31cce7f -c ferramentas/ensaio/wrangler.jsonc
```

Isso volta ao que estava no ensaio (a D922). Anotei antes de publicar, pela lista de publicações do Cloudflare.

## 2. O que a página diz agora

| quem pede | as linhas, na ordem |
|---|---|
| a IA que grava (o Antigravity, o Claude) | procurar clientes, obras e fornecedores, como na Busca da Central; **procurar fornecedores, obras e ordens de compra, como na Ordem de Compra**; corrigir os dados de um cliente…; cadastrar prestadores de serviço…; **montar o rascunho de uma ordem de compra a partir de uma cotação, para você conferir e emitir na tela.** |
| o "só busca" (o ChatGPT) | procurar clientes, obras e fornecedores, como na Busca da Central; **procurar fornecedores, obras e ordens de compra, como na Ordem de Compra.** |

- **A de montar está em `FERRAMENTAS_QUE_GRAVAM`.** O "só busca" não a vê, e continua lendo "Ele só procura: não
  corrige nem grava nada."
- **A de procurar na OC aparece também para o "só busca"**, porque o Banco mostra as duas buscas da OC a ele (D954
  §3; o teste das portas dele, na D957 dele).
- **Três ferramentas, duas linhas.** As duas buscas da OC (`buscar_fornecedor_e_obra_da_oc` e
  `buscar_ordens_de_compra`) são uma coisa só para quem lê. A segunda é dita na linha da primeira, por uma lista
  nova, `FERRAMENTAS_NA_MESMA_LINHA`. Só uma busca pode morar na linha de outra; o que grava tem linha própria, e
  um teste prende isso.
- **A frase "Ele age com o seu nome e com os seus acessos, nada além" ficou**, como você pediu.
- **Ninguém foi forçado a religar.** Nada mudou nas ligações nem na porta.

## 3. A prova

- **461 testes, 0 falhas.** Um é novo, e o da página do "só busca" e o da IA que grava mudaram para as linhas novas.
- **O teste que compara com a função `mcp` do Banco** lê a lista dela no disco do Banco, que já tem as sete
  ferramentas (a D957 dele). A comparação é exata: ferramenta do Banco sem frase aqui, ou frase daqui sem
  ferramenta lá, deixa vermelho. Isso inclui as três da OC.
- **Sabotagens: 14 de 14 pegas**, cada uma contra a bateria inteira:
  - a linha de procurar ou a de montar some;
  - a frase de procurar perde as "ordens de compra";
  - a de montar promete emitir;
  - a de montar sai das que gravam;
  - a de procurar entra nas que gravam;
  - a busca das OCs ganha linha própria, some, aponta para uma linha que não existe ou para a de gravar;
  - o nome da de montar ou o da de procurar diferente do Banco;
  - a de montar sobe para o lugar da de procurar;
  - o "só busca" vê tudo.
- **Na vitrine, no navegador:**
  - o pedido do Antigravity mostra as cinco linhas, com "Permitir";
  - o do ChatGPT mostra as duas de procurar, a frase do "só busca" e "Permitir", a 375 sem rolagem para o lado.
- **A medida por fora, no ensaio:**
  - o `/versao.txt` serve `20261026220439-0c4a106`;
  - o `app/permitir.js` servido tem md5 `dccbfb76064d…`, igual ao do `dist-ensaio/`, com a linha de montar;
  - o `config.js` aponta para o banco de ensaio;
  - `/`, `/permitir` e `/permitir?authorization_id=…` dão 200;
  - sem login, o `/permitir` pede a entrada ("Entre para continuar a ligação com a IA"), sem erro no console.

## 4. O que a medida por fora não vê

- **A página logada, com um pedido de verdade.** O pedido só nasce quando uma pessoa liga a IA, e agente não digita
  senha. A prova de ponta a ponta é a primeira ligação do Antigravity no ensaio, pela pessoa, como o Banco também
  disse na D957 dele.

## 5. O que fica

- **O ramo `d957-permitir-oc`** (`0c4a106`) fica no disco, sem push, esperando a sua carta para a produção. O
  `main` não mudou de código.
- **Na produção**, a página entra junto com a ferramenta na `mcp`, no item 3 da ordem do Banco (D954 §3, item 5).

## 6. Atenção: o `main` da Central está vermelho desde a D957 do Banco

O teste que compara a página com a `mcp` lê a `logica.ts` **no disco do Banco**, e ela já tem as três da OC (sem
commit lá, por ora). O `main` da Central ainda não diz as três, então fica **460 de 461**, com esse teste
vermelho. Isso é o teste fazendo o trabalho dele: ferramenta nova sem frase na página.

**O efeito:** o publicador roda a bateria antes de tudo e recusa teste vermelho. Até o ramo `d957-permitir-oc`
entrar no `main`, **nenhuma publicação de produção da Central sai do `main`**, nem um conserto urgente. A produção
que está no ar (`137b613a`) não muda nada com isso.

Não afrouxei o teste no `main` por conta própria. Os caminhos que vejo, para você escolher:
1. **Esperar.** Nada de produção da Central até a perícia e a sua carta, e o ramo entra no `main` junto. É o que
   recomendo, se não houver conserto urgente na fila; hoje não há.
2. **Pôr o ramo no `main` já, sem publicar.** O `main` volta ao verde, mas aí qualquer publicação levaria as duas
   linhas para a produção antes de a `mcp` da produção ter as ferramentas: a página prometeria o que a IA não faz.
3. **Uma folga no teste do `main`**, que aceite faltarem as três da OC e só elas, enquanto a produção não as tiver.

— Central
