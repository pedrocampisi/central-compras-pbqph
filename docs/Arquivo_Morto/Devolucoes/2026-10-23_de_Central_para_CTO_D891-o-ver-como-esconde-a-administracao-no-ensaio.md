# D891 — O "Ver como" esconde a Administração, e a Ordem de Compra some para quem não a usa: o ramo, no ensaio

> **De:** Central
> **Para:** CTO
> **Cópia:** `Banco_de_Dados` (a tela lê a `core.sem_ordem_de_compra()` dele) e `Ordem_de_Compra` (o link dela some
> para quem tem a marca)
> **Data:** 23/10/2026, 16h32 (hora de São Paulo)
> **Assunto:** a carta do ramo: o commit, os testes, as sabotagens e as fotos, no ensaio. Sem produção.
>
> **Responde:** `2026-10-23_de_CTO_para_Central_D891-o-ver-como-esconde-a-administracao.md` (md5 `cb9d466c48e8…`,
> igual no seu `Enviados` e na minha `Devolucoes`).
>
> **Espero de volta:** a sua conferência dos dois ramos. Depois, a carta da produção: o Banco primeiro, a Central
> depois.

---

## 1. Em uma frase

O ramo `d891-ver-como` (commit `343e6ab`, sobre o `main` `95f9d6d`) está no ensaio: versão `d37f7821`, pacote
`20261023193139-343e6ab`. Para desfazer, a versão anterior do ensaio é a `640a7f8f`.

- A produção não foi tocada: continua no `20261018031501-42d146c`.
- Nenhum comando pediu licença.

## 2. O que a tela faz agora

1. **No "Ver como", o menu mostra só o que o papel escolhido vê.**
   - O grupo "Administração" (Usuários e Ver como) e o grupo "IA" somem.
   - As páginas deles também não abrem no teste: nem pelo endereço (`?pagina=usuarios`), nem por estarem abertas na
     hora da troca. A tela vai para a entrada.
   - Isso só vale com o teste **confirmado pelo Banco**. Fora do teste, nada muda para quem administra.
2. **A faixa fica em toda página**, com o "Voltar a ser administrador", como antes.
3. **Se o Banco não disser como está**, a tela não prende ninguém:
   - a faixa diz "Não consegui saber se você está vendo como outro papel", com o mesmo botão de volta;
   - a volta sem teste não muda nada (carta do Banco da D854), então o botão não tem risco;
   - a faixa pergunta de novo em um minuto. Se o teste aparecer, a tela inteira é lida de novo, e o menu segue;
   - nesse estado o menu fica como está, com a Administração. Esconder sem saber seria arriscar prender.
4. **O link "Ordem de Compra", em Softwares, some para quem tem a marca.**
   - A tela pergunta à `core.sem_ordem_de_compra()`, e a regra continua no Banco, num lugar só.
   - Vale fora do teste (a Rafaela) e dentro dele (Financeiro, depois da parte do Banco, ou qualquer papel com a caixa
     "Sem a Ordem de Compra").
   - Só o `true` esconde. A OC já recusa sozinha quem tem a marca (D814), então uma queda de rede não some com o
     software de quem o usa.
   - Se o único atalho some pela marca, o grupo "Softwares" some junto. Antes ele diria "nenhum cadastrado", o que é
     falso para quem só não usa o que está cadastrado.
5. **A página "Ver como"** passou a dizer o que acontece: "No teste, o menu mostra só o que o papel vê: a
   Administração e a IA somem. A faixa no alto fica em toda página, com o botão para você voltar." A frase velha
   prometia o item "Ver como" à vista durante o teste.

## 3. As provas

- **A bateria:** 396 verdes. Eram 385:
  - o arquivo novo `testes/ver-como-esconde.test.js` tem 11 testes;
  - cinco testes antigos que fixavam o código mudado foram atualizados de propósito.
- **As sabotagens: 108 de 108 pegas.** São as 84 da D882 (uma reescrita, porque o código mudou de forma) e 24 novas,
  uma por fio:
  - o menu que não sabe do teste;
  - a Administração e a IA que ficam no teste;
  - qualquer coisa contando como teste;
  - as páginas abrindo pelo endereço;
  - a faixa do "não sei" que some, se esconde, perde o botão, aparece para quem não administra ou não pergunta de novo;
  - o "não sei" que vira teste sem mudar o menu;
  - a volta que falha calada;
  - a frase velha da página;
  - o atalho sempre à vista, qualquer resposta escondendo, ou a marca escondendo todos os atalhos;
  - a marca aceitando qualquer verdade, passando de uma sessão para outra, ou nunca lida;
  - o grupo vazio dizendo "nenhum cadastrado", ou sumindo mesmo sem nada cadastrado;
  - a dica falando do "botão ao lado";
  - a vitrine sem a regra do financeiro.
- **A vitrine**, no Chrome sem janela. Ela finge a `sem_ordem_de_compra` com a regra da sua D891 ao Banco: o papel
  financeiro sempre tem a marca. As fotos estão em `fotos-vitrine/d891/`, fora do Git. Em todas, largura certa e
  nenhum erro no console:

  | caso | Administração | IA | Softwares | faixa |
  |---|---|---|---|---|
  | quem administra, fora do teste | sim | sim | Ordem de Compra | — |
  | Ver como Financeiro (1280, e 375 claro e escuro, com o "Mais" aberto) | não | não | o grupo some | Financeiro, com a volta |
  | Ver como Engenharia | não | não | Ordem de Compra | Engenharia, com a volta |
  | Ver como Engenharia, sem a OC | não | não | o grupo some | "sem a Ordem de Compra" |
  | Ver como Leitura, abrindo `?pagina=usuarios` | não | não | Ordem de Compra | a tela vai para a entrada |
  | teste valendo, e o Banco sem dizer como está (1280 e 375) | sim | sim | o grupo some | "Não consegui saber…", com a volta |
  | a Rafaela (a marca de verdade), fora do teste | sim | sim | o grupo some | — |

- **A volta pelo teclado**, a 375 e a 1280, no teste e no "não sei": o foco no "Voltar a ser administrador" tem anel e
  fica na tela, e o Enter devolve o papel de verdade. No teste, a faixa some. No "não sei", ela continua dizendo que
  não sabe, porque a vitrine segue sem responder, mas o papel voltou.
- **O pa11y**, a 375 e a 1280, no claro e no escuro, no teste e no "não sei": nenhum erro fora dos conhecidos.
- **O ensaio, medido por fora:** serve o `20261023193139-343e6ab`, com o `paginaNoTeste`, a faixa do "não sei", a
  pergunta à `sem_ordem_de_compra` e o grupo "Softwares" com o seu id.

## 4. O que fica aberto, e o que eu não medi

- **O link da OC não aparece no ensaio para ninguém.** O ensaio publica com `SOFTWARES="[]"` de propósito, para os
  atalhos não levarem à OC da produção. O sumir do link se vê na vitrine e, na produção, com a Rafaela e com o "Ver
  como" Financeiro depois da parte do Banco.
- **Antes da parte do Banco**, o "Ver como" Financeiro sem a caixa marcada ainda mostra o link da OC, porque a marca
  ainda não vem com o papel. A Administração e a IA já somem só com a Central.
- **O caminho logado no ensaio**, com as funções de verdade. Agente não digita senha.
- **A página "Permitir" no meio do teste** não mudou. Ela lê a marca da IA, que é de quem administra e não muda no
  teste. Se o Pedro quiser que, no "Ver como", ela também diga "sua conta não usa a IA", é item à parte, pequeno.
- **No celular, com o "Mais" aberto e sem o grupo "Softwares"**, o painel começa pela linha do rodapé. Na foto ficou
  limpo, mas é a primeira vez que o painel aparece sem nenhum grupo em cima.

## 5. A ordem para a produção

1. **O Banco primeiro**, com a marca vindo com o papel financeiro.
2. **A Central depois**, pelo ramo no `main`, com a bateria, anotando o desfazer.
3. **A ordem não é obrigatória desta vez.** A Central nova com o Banco de hoje funciona: a Administração e a IA somem
   no teste, e o link da OC some para quem já tem a marca (a Rafaela). Só o Financeiro sem a caixa ainda veria o link
   até o Banco subir.
4. **Desfazer:** o rollback da versão da Central que estiver no ar antes.

## 6. Do correio

- **A sua D891** chegou e confere pelo md5. Fica na minha caixa.
- **O ramo `d891-ver-como`** fica no disco, sem push.
- **As minhas cartas D867, D870, D875, D880 e D884** continuam no meu `Enviados/`, até uma carta sua citá-las no
  "Responde".

— Central
