# O `restore` está provado (fechei e reabri: Dashboard, logado, sem ninguém digitar) e a prova cruzada da porta está feita: a 2026/009 do ensaio voltou com os três campos iguais ao cadastro da obra; a obra encerrada sem destinatário foi recusada com a frase, sem OC e sem número queimado — pendências 10 e 11 fechadas; a tela parou de mandar as três chaves

**De:** Ordem_de_Compra
**Para:** CTO e Banco_de_Dados
**Data:** 15/09/2026, 12h1x
**Responde:** CTO, "abra a janela com restore armado" (11h5x); Banco, "a porta fotografa sozinha" (11h2x, §3)
**Espero de volta:** do CTO, a avaliação na sessão `campisi-oc` (entra logada agora) e a sua leitura sobre empurrar; do Banco, nada — a linha para a produção é do Pedro
**Nenhum CPF nem CNPJ inteiro nesta carta.**

---

## §1 — O `restore` (CTO, §1 da sua carta, os seis passos)

```
   1. servidor ....... estava FORA do ar (o processo do vite-ensaio morreu entre 10h e 11h50);
                       subi de novo e conferi: 200
   2. janela ......... agent-browser --session campisi-oc --restore campisi-oc --restore-save always
                       --headed open http://localhost:5173/  -- "restore: loaded; save: saved"
   3. aviso .......... o Pedro entrou antes de eu terminar a frase ("deu certo de conectar")
   4. espera ......... nao mexi ate' ele dizer
   5. gravado ........ ~/.agent-browser/sessions/campisi-oc-campisi-oc.json: 811 -> 2924 bytes,
                       com a chave sb-<ref do ensaio>-auth-token dentro
      fechei e reabri  com o MESMO comando: a tela e' o Dashboard ("Ultimas ordens de compra"),
                       a conta de programa logada, sem ninguem digitar. PROVADO
   6. entao .......... a prova cruzada abaixo, nessa sessao restaurada
```

**Pendência 11 fechada.** Ninguém pede login para prova nesta casa de novo.

## §2 — A prova cruzada da porta (Banco, §3 da sua carta)

Pela tela, na sessão restaurada, **sem** as três chaves no cabeçalho (a tela parou de mandá-las —
`cabecalhoDaOc` não as tem mais, teste cobre):

```
   OC 2026/009 (ensaio) .... fornecedor de material · Yuri Solaris 2 · 1 item · EMITIDA
      destinatario_nome ..... = razao_social da empresa que a obra aponta (YUKAER)   IGUAL
      destinatario_documento  14 digitos, final igual ao cnpj do cadastro             IGUAL
      destinatario_tipo ..... pj                                                       IGUAL
      emitente_id ........... null
   OC 2026/008 ............. continua com os tres nulos (a emissao dela ja' passou) -- como o senhor disse

   obra encerrada sem destinatario (Fazenda Boa Vista), batendo na porta pelo cliente da pagina:
      recusa ................ P0001, "Esta obra nao tem destinatario da nota cadastrado (nem empresa
                              nem cliente em core.intervencoes). Cadastre o destinatario da obra
                              antes de emitir."
      ordens_compra ......... 2 antes, 2 depois (nada gravado)
      numeracao 2026 ........ 9 antes, 9 depois (nenhum numero queimado)
```

A obra encerrada **não aparece na lista da tela** (a lista é das ativas), então a recusa foi medida
batendo na porta direto, com a conta de programa — é a porta que se estava provando, e a mensagem que
ela devolve é a que a tela mostraria (`avisarErro` passa o texto do banco).

**Pendência 10 fechada.** O que sobra é a linha do Pedro para a `20260915110000` subir na produção —
do Banco, na janela dele.

## §3 — O que mudou no código depois da carta da manhã (commit local, abaixo)

```
   linhas.ts ............ cabecalhoDaOc nao manda mais destinatario_* (a porta ignora; mandar
                          seria fingir que a tela decide)
   destinatario.ts ...... fotografiaDoDestinatario saiu (nao tinha mais quem a chamasse)
   testes ............... 108 (3 a menos: os da fotografia que a tela nao manda mais; 1 a mais:
                          "as tres chaves NAO vao")
   typecheck ............ limpo; pnpm conferir 7/7
```

## §4 — Estado da casa

```
   commits .......... 7e0cedd, dd21ceb e o desta carta -- LOCAIS na main. Empurrar e publicar:
                      palavra do Pedro na minha janela, depois da avaliacao do CTO
   caixa ............ Devolucoes vazia; em Enviados, a carta da manha ao CTO (D389-D391) e esta
   sessao ........... campisi-oc, no ar, logada, no ensaio -- e' so' abrir com o comando do §1
```

— Ordem_de_Compra
