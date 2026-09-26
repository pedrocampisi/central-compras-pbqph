# D549 — no ar: `6e7e6284` (o desfazer é `5dfddad2`). A OC escolhe só a empresa e grava a filial principal; o campo Filial saiu

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 13h0x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D549-a-OC-escolhe-a-empresa-a-filial-e-a-matriz.md`
**Espero de volta:** nada, a não ser que a mensagem nova da D545 (§2) não sirva.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — O que mudou, item por item da sua §2

```
   1 campo Filial ....... saiu da Nova OC. A pessoa escolhe a empresa, e acabou
   2 a principal ........ uma funcao so', filialPrincipal (domain/fornecedores.ts): a matriz
                          (ordem 0001) se ela pode receber OC; senao a de menor ordem que pode;
                          bloqueada ou inativa nunca (a regra entraNaOc)
   3 a pista ............ "Na OC: <razao social> · <endereco> · CNPJ <inteiro>" — o que vai no
                          PDF, sem pedir nada. O PDF nao mudou: imprime a filial gravada
                          (generateOcPdf.ts:100), que agora e' a principal
   4 rascunho antigo .... abre com a filial gravada, sem trocar; a trava da D545 vale para ela
   5 Historico .......... nao mudou
   6 o que saiu junto ... o aviso "Selecione a filial do fornecedor.", o <select>, o rotulo da
                          filial (cidade/rua/"matriz"/"filial nº N") e as travas deles. Nada disso
                          tinha uso no Historico, que so' usa a lista por empresa
```

## §2 — Uma coisa que a carta não cobria: a mensagem da D545

A mensagem era "Escolha outra filial para emitir", e ela manda fazer o que a tela deixou de permitir.
Com isso, quem abrisse um rascunho com filial bloqueada ficaria sem saída. Resolvi assim:

- **Escolher a mesma empresa de novo** mantém a filial gravada **se ela ainda pode receber OC**. Se
  não pode, a OC passa para a principal. Um rascunho com filial válida continua sem trocar, e um
  com bloqueada tem uma saída.
- **A mensagem virou:** *"Esta filial está bloqueada para compra nova. Escolha a empresa de novo no
  campo Fornecedor: a OC passa para a filial principal."* É o que acontece de fato. Vi isso na tela.

Se o senhor preferir outra saída, por exemplo trocar sozinho ao abrir, é pouca coisa. Não fiz porque
a carta mandou "sem trocar".

## §3 — Medido na produção, só leitura

```
   empresas com mais de uma filial na Nova OC ... 13 (a sua conta, 14, era antes do bloqueio: a
                                                  segunda Imperio tem as 2 filiais bloqueadas)
     gravam a matriz ............................ 12
     sem matriz na lista ........................ 1 — Gomes e Filhos, grava a filial nº 2
   empresas de filial unica cuja unica filial nao e' a matriz ... 11 (gravam ela, como antes)
   filiais sem CNPJ de 14 digitos na lista ..................... 0
```

## §4 — Travas, prova e publicação

```
   sabotagens ... 5, todas mordendo (saida 1), restauradas com hash igual — as do seu §3:
                  (1) a matriz deixa de ser a preferida .......... 5 vermelhos
                  (2) a bloqueada/inativa pode ser a principal ... 2
                  (3) o rascunho troca a filial gravada .......... 1
                  (4) o campo Filial volta na Nova OC ............ 1
                  (5) de novo, a D545: emitir com bloqueada passa  1
                  ("sem matriz, a de menor ordem" e' coberta pela (1): com a de maior ordem,
                  o teste da empresa sem matriz fica vermelho)
   bateria ...... 169 verdes, lint, typecheck, build, conferir:pacote 5/5, conferir 7/7
   na tela ...... pagina de prova a 375px, pelo teclado (apagada): Imperio -> matriz, sem campo
                  Filial; ArcelorMittal -> a matriz de Belo Horizonte; empresa sem matriz -> a
                  0004, nao a 0009; rascunho com bloqueada -> abre com ela, Emitir recusa com a
                  mensagem nova, escolher a Imperio de novo -> a matriz. O PDF nao abri (§6)
   commit ....... 94ecf78 (codigo)
   saiu do ar ... 5dfddad2-b6cb-4003-895d-05f02e341fc1 (a D545)  <- O DESFAZER
   entrou ....... 6e7e6284-fd4c-4fea-b170-a4173e7c2fe0 · versao 20260926155708-94ecf78
   medido depois, por fora:
     /versao.txt ................. 200 text/plain, "20260926155708-94ecf78"
     bundle index-DBmfkjx5.js .... a versao 1 · "Na OC: " 1 · a mensagem nova 1 ·
                                   "Selecione a filial" 0 · "oc-filial" 0 · "filial nº" 0 · "····" 0
     ref da producao ............. presente · ref do ensaio: 0
     sw.js ....................... nao precacheia versao.txt; /, manifesto, registerSW, sw 200
```

## §5 — As linhas prontas para o Pedro, em compras.campisi.com.br

> 1. Abra a Nova OC. A aba aberta se atualiza sozinha ao voltar para ela; senão, Ctrl+Shift+R.
> 2. **Fornecedor → Império das Tintas:** **não aparece** campo Filial. Embaixo do campo aparece
>    "Na OC: …" com a razão social, o endereço e o CNPJ **terminado em /0001-…** (a matriz).
> 3. **ArcelorMittal:** o mesmo. "Na OC: …" com o CNPJ /0001-… de Belo Horizonte.
> 4. Com uma obra e um item, aperte **"Visualizar"**: o PDF traz a razão social e o CNPJ da matriz,
>    os mesmos da linha "Na OC".

## §6 — O que não vi

O PDF aberto. O código que monta o PDF lê a filial gravada, e a gravada agora é a matriz; a linha 4
do §5 é a prova no ar. A tela logada também não, como sempre: é a conferência do Pedro.

## Depois desta

A D551 (as colunas da `fornecedores` sem o asterisco) chegou enquanto eu fazia esta. Começo agora.

— Ordem_de_Compra
