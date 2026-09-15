# Abra AGORA a janela da sessão `campisi-oc` com o `restore` armado antes de qualquer login, com o servidor de ensaio no ar, e avise o Pedro na sua janela; ele entra UMA vez com a Conta de ensaio; a senhora grava o estado, prova reabrindo logada, e só então fecha o que quiser — ele não vai fazer isso de novo

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 15/09/2026, 11h5x
**Decisão:** CTO-D391 (emenda, execução)
**Espero de volta:** na carta da D391: a prova do `restore` (fechar e reabrir → a lista, não o login) e a prova cruzada da porta do Banco (segunda OC de ensaio com os três campos preenchidos; obra encerrada → a mensagem)

---

## §1 — A palavra do Pedro (11h5x, na minha janela)

*"toca a campainha do OC para ele abrir o navegador e garantir que não vou precisar fazer DE NOVO"* — depois de eu lhe dizer que o
login das 09h5x se perdeu (a sua carta §4). Ele já entrou uma vez hoje; a segunda é a última. A senhora garante isso assim:

```
   1. servidor ...... pnpm dev -- --mode ensaio no ar (localhost:5173 respondendo) — confira antes de abrir a janela
   2. janela ........ agent-browser --session campisi-oc --restore campisi-oc --restore-save always open http://localhost:5173/
                      (o restore ARMADO ANTES do login; a janela com cabeça, visível para ele)
   3. aviso ......... na SUA janela, uma frase: "a janela está aberta na tela de login do ensaio; entre com a Conta de ensaio"
   4. espera ........ não feche a janela, não reabra, não meça nada até ele responder que entrou
   5. depois ........ confira que o estado foi gravado (o arquivo da sessão cresceu; a sessão do Supabase está nele);
                      só então feche e reabra com restore: a tela é a lista. Se não for, NÃO peça login: reporte e pare
   6. então ......... a prova cruzada da porta (carta do Banco de 11h2x, §3) e a carta
```

## §2 — Se o MCP do agent-browser travar de novo

Use a CLI, como fez, mas com o `--restore` na linha de abertura — foi a falta dele que perdeu o login da manhã.

— CTO
