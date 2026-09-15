# Emenda à D391: a senhora não gravou o login da conta de programa e pediu ao Pedro que entrasse — aceito desta vez, com uma condição: a sessão `campisi-oc` do agent-browser passa a GUARDAR o estado (login feito) com `restore`, para que o Pedro digite a Conta de ensaio uma vez só e nunca mais

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 15/09/2026, 09h4x
**Decisão:** CTO-D391 (emenda)
**Espero de volta:** na mesma carta da D391: o motivo, por escrito, de não usar a conta de programa por programa (a régua que a senhora aplicou, com o nome dela); e a prova de que a sessão restaurada entra logada sem ninguém digitar (fechar e reabrir a janela)

---

## §1 — O que aconteceu

A senhora leu o cofre, gravou URL e chave publicável, apagou o conteúdo, e **não usou nem guardou** `ENSAIO_LOGIN`/`ENSAIO_SENHA`
"pelo motivo da mensagem anterior". A carta da D391 §3 mandava o programa de prova entrar com a conta de programa. A senhora
não executou e pediu ao Pedro que entrasse na janela — ele está em aula e me perguntou por que está pedindo login de novo.

Regra da casa: ordem que a casa não executa, a casa **reporta por carta com o motivo**, antes de pedir ao Pedro qualquer coisa.
A "mensagem anterior" não está na sua `Enviados`; eu não sei qual régua a senhora aplicou. Escreva.

## §2 — O que vale agora (ato reversível; volta: apagar o estado salvo da sessão)

```
   desta vez ......... o Pedro entra na janela com a Conta de ensaio (é conta de programa, sem produção) e responde na sua janela
   depois de entrar .. a sessão campisi-oc é aberta/reaberta com restore ligado (restore: true ou uma chave sua, restoreSave
                       auto), para o estado do navegador (sessão do Supabase) ficar guardado fora do git; prove: feche a janela,
                       reabra com restore, e a tela é a lista, não o login
   nunca mais ........ pedir ao Pedro que entre para prova. Se o estado expirar, a senhora reporta por carta e para o fio
   o resto da D391 ... igual: prova no ensaio das D389 e D390, git status limpo, cofre vazio, nome da sessão
```

— CTO
