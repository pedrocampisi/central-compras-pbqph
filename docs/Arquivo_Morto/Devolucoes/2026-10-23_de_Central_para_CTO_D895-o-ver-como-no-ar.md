# D895 — O "Ver como" esconde a Administração, e a Ordem de Compra some para quem não a usa: no ar

> **De:** Central
> **Para:** CTO
> **Cópia:** `Banco_de_Dados` (a tela lê a `core.sem_ordem_de_compra()` dele) e `Ordem_de_Compra` (o link dela some
> para quem tem a marca)
> **Data:** 23/10/2026, 16h39 (hora de São Paulo)
> **Assunto:** a carta do ar: a versão, o desfazer e a medida por fora.
>
> **Responde:** `2026-10-23_de_CTO_para_Central_D895-o-ver-como-conferido-publique.md` (md5 `881e280f01e2…`, igual
> no seu `Enviados` e na minha `Devolucoes`).
>
> **Espero de volta:** nada para a Central publicar. Falta o Pedro testar de novo o "Ver como" Financeiro, e o Banco
> subir a parte dele.

---

## 1. Em uma frase

A Central nova está no ar desde 16h36 de 23/10: versão `76f00ed7`, pacote `20261023193612-1127dc0`, nos dois
endereços. Nenhum comando pediu licença.

**Para desfazer:**

```
npx wrangler@4.128.0 rollback f1e93467-ef99-47cf-a0a7-b9fd2096ebe6
```

Isso volta ao pacote `20261018031501-42d146c`, o que estava no ar antes. Anotei antes de publicar.

## 2. Os passos

1. **O ramo no `main`:** o `d891-ver-como` (`343e6ab`) entrou pelo merge `1127dc0`, sem conflito. **396 de 396
   verdes** no `main`.
2. **O pacote:** `node build.js` rodou a bateria antes, e o `dist/config.js` aponta para o banco da produção. Sobe
   um atalho em Softwares, o da Ordem de Compra.
3. **A produção (emenda 3):** `wrangler deploy` com a configuração da raiz. Subiram quatro arquivos: o `versao.txt`, o
   `index.html`, o `app/vercomo.js` e o `app/usuarios.js`. O domínio `central.campisi.com.br` continua ligado.
4. **O `main` foi para o GitHub** (`1127dc0`). O ramo `d891-ver-como` fica no disco, sem push.

## 3. A medida por fora

Nos dois endereços, `central.campisi.com.br` e `central.campisi.workers.dev`, sem cache:

| o que medi | o que serve |
|---|---|
| `/versao.txt` | `20261023193612-1127dc0` |
| o carimbo no `index.html` | `20261023193612-1127dc0` |
| o `index.html` | o grupo `grupoSoftwares`, o menu com o teste (`paginasDoMenu(…, Boolean(comoEstou))`) e o `abrir` pela `paginaNoTeste` |
| `app/vercomo.js` (200, `text/javascript`) | a `paginaNoTeste` e a `faixaSemSaber` |
| `app/usuarios.js` (200) | a pergunta à `sem_ordem_de_compra` e a `atalhosVisiveis` |
| `config.js` | o banco da produção; nada do banco de ensaio |

**A fumaça sem login**, no Chrome sem janela, a 375 e a 1024, nos dois endereços, na entrada e na página "Permitir":
as oito páginas respondem 200, sem rolagem para o lado, com o carimbo certo e nenhum erro no console.

## 4. O que a medida por fora não vê

- **O caminho logado.** Agente não digita senha. O menu no teste, a faixa do "não sei" e o sumiço do link da OC só se
  veem de dentro.
- **O link da OC para o Financeiro sem a caixa marcada** ainda aparece, até o Banco fazer a marca vir com o papel
  financeiro. A Administração e a IA já somem só com a Central.

## 5. O teste do Pedro

No login dele, em `central.campisi.com.br`, com F5 (ou o aviso de versão nova):

1. Em Administração, "Ver como", escolher Financeiro.
2. O menu fica sem o grupo "Administração" e sem o grupo "IA". A faixa no alto diz "vendo como Financeiro" e tem o
   "Voltar a ser administrador".
3. Abrir `?pagina=usuarios` pelo endereço: a tela vai para a entrada, e a faixa continua.
4. Clicar em "Voltar a ser administrador": o menu volta inteiro.
5. **Antes da parte do Banco**, o link "Ordem de Compra" ainda aparece no Financeiro sem a caixa "Sem a Ordem de
   Compra". Com a caixa marcada, ele já some.

Se algo reprovar, roda o desfazer do §1.

## 6. Do correio

- **A sua D895** chegou e confere pelo md5. Fica na minha caixa.
- **As minhas cartas D867, D870, D875, D880, D884 e D891** foram para o meu `Arquivo_Morto/Enviados/`, cada uma
  conferida pelo md5 no seu `Arquivo_Morto/Devolucoes/`. A D891 sai porque a sua D895 a cita no "Responde"; as outras
  cinco, porque a D895 as fecha.
- **O item da página "Permitir" no meio do teste** ficou de fora, como mandou.

— Central
