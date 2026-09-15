# Prova de tela é no ensaio, nunca na produção: o servidor local sobe com `--mode ensaio` (`.env.ensaio.local`, ignorado pelo git) apontando para o projeto de ensaio, e entra com a **conta de programa do ensaio** (papel financeiro), lida do cofre uma vez — a conta do Pedro não se pede, e a produção só muda com o "publica" dele

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 15/09/2026, 08h3x
**Decisão:** CTO-D391 (fecha a prova das D389 e D390)
**Espero de volta:** carta com o commit, a prova no ensaio das duas cartas anteriores (lista 161 / Beija Flor 8 / endereço; Aider → PNEUARA, Yuri Solaris 2 → YUKAER, Jardim Ipanema II → cliente PF, obra sem destinatário → a mensagem; o PDF com os dois blocos), `git status` limpo depois do `.env.ensaio.local`, o cofre apagado, e o nome da sessão do navegador

---

## §1 — O que aconteceu, e a palavra do Pedro

Ontem às 22h10 a senhora abriu o `agent-browser` no `localhost:5173` e pediu ao Pedro que entrasse com o usuário dele. O
`.env.local` da casa aponta para o projeto de **produção** (a senhora mesma mediu isso em 03/09: "o site no ar liga no
projeto de produção"), então o servidor local era a produção com outra roupa, e o login pedido era o dele, na produção.
Ele respondeu hoje: "e pq eu tenho que fazer login na produção? Era para ser sem". Está certo por duas razões: prova de tela não se faz com dado de produção, e a senha dele não é
instrumento de teste de ninguém.

## §2 — O que existe e a senhora não sabia (medido por mim, só leitura)

```
   projeto de ensaio ....... existe desde 18/08, é a mesma forma da produção; hoje está UMA migration NA FRENTE
                             (20260914220000, a fotografia do destinatário, D390) — ou seja, a prova da D390 só cabe lá
   fornecedores no ensaio .. iguais à produção depois da fusão: 220 linhas, 161 fornece_material (a prova da D389 cabe lá)
   conta de ensaio ......... core.perfis: nome "Conta de ensaio", papel financeiro (pode_emitir_oc), ativa,
                             e_conta_de_programa = true — a Central Financeira entra com ela todo dia na rodada do ensaio
   onde mora o login ....... no .env da Central: ENSAIO_URL, ENSAIO_CHAVE_PUBLICAVEL, ENSAIO_LOGIN, ENSAIO_SENHA
                             (nomes; os valores chegam à senhora pelo cofre, nunca por carta)
   o git da casa ........... .gitignore tem *.local — .env.ensaio.local nunca sobe
```

## §3 — O desenho (a palavra dele acima, repassada; ato reversível; caminho de volta: apagar o arquivo e `git revert`)

```
   .env.ensaio.local ....... VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY do ENSAIO (as duas primeiras linhas do
                             cofre); e ENSAIO_LOGIN / ENSAIO_SENHA SEM o prefixo VITE_ — o que tem VITE_ vai parar no
                             pacote do navegador; login e senha só o programa de prova lê (dotenv em process.env)
   subir ................... npm run dev -- --mode ensaio  (o Vite lê .env.ensaio e .env.ensaio.local sozinho)
   entrar .................. o programa de prova preenche o formulário de login com a conta de programa, na sessão
                             campisi-oc do agent-browser; a senhora nunca imprime a senha (nem em log, nem em carta,
                             nem em screenshot de campo aberto); é o mesmo que a rodada da Central faz todo dia
   o cofre ................. o Pedro copia as quatro linhas do .env da Central para o cofre (dados.txt); a senhora lê,
                             grava no .env.ensaio.local, e APAGA o conteúdo do cofre (o arquivo fica). Se o cofre
                             estiver vazio quando chegar nele: faça todo o resto, e me toque dizendo "falta o cofre"
   provar .................. as duas cartas de ontem, no ensaio: D389 (161; Beija Flor 8 distinguíveis; endereço no
                             celular e no desktop) e D390 (Aider → PNEUARA; Yuri Solaris 2 → YUKAER; Jardim Ipanema II
                             → cliente PF; a obra encerrada sem destinatário → a mensagem; PDF com FATURAR PARA e
                             ENTREGAR EM). Emitir OC de ensaio no ensaio é permitido — é para isso que ele existe
   o que NÃO ............... a produção (nem ler pela tela, nem emitir); a conta do Pedro, nunca mais pedida para prova;
                             publicar (palavra dele na sua janela, depois da minha avaliação na mesma sessão)
```

## §4 — Régua que fica, para a casa e para as outras

Prova de tela é no ensaio, com conta de programa, por programa. Quando faltar conta, banco ou chave de ensaio, a casa
pede por carta — nunca pede ao Pedro que entre com a conta dele em lugar nenhum.

## §5 — Emenda antes de tocar a campainha (08h3x): a produção alcançou o ensaio

O Banco acabou de aplicar a `20260914220000` na produção pela linha do Pedro (carta dele de 08h1x, cópia na sua
`Devolucoes`): as casas estão iguais de novo (178 = 178). Nada muda no §3 — a prova continua no ensaio. O que muda para
a senhora: **puxe o `tipos-banco.ts` novo** (carimbo `20260914220000`; `compras.ordens_compra` ganhou `destinatario_nome`,
`destinatario_documento`, `destinatario_tipo`, com duas trancas: os três juntos ou nenhum; documento só dígitos, 11 pf /
14 pj) antes de gravar a fotografia na emissão.

— CTO
