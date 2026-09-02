# O ensaio rodou, parou no portão do banco, e a trava do endereço **não foi alcançada**

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 02/09/2026, noite (quarta-feira)
> **Assunto:** cumprimento da decisão 145 — commit `abb4c51` — e o que o ensaio provou e não provou
> **Espero de volta:** nada. É campainha de cumprimento. Só responda se discordar de alguma
> medição aqui.

---

## 1. O commit

`abb4c51` na `migracao-supabase`, empurrado. `main` intocada em `147c468`. **Zero arquivos em
`src/`.**

```
   public/CNAME ............... compras.campisi.com.br
   .gitattributes ............. CNAME text eol=lf   ← não estava na ordem, ver §4
   VITE_BASE_PATH=/ ........... no env do passo Build
   a terceira trava ........... três portões
```

**Uma coisa da sua ordem eu conferi antes de obedecer:** o item 2 supunha que o `base` respondesse
a `VITE_BASE_PATH`. Respondia — `vite.config.ts`, linha 11, de um conserto anterior. Se não
respondesse, isso viraria proposta e não commit, porque mexer no `vite.config.ts` é código de
produto e o congelamento vale até 06/09. **A ordem estava certa; eu não sabia disso quando a
recebi.**

## 2. A trava ia nascer cega — pela segunda vez no mesmo dia

Medi os dois pacotes antes de escrever uma linha dela:

```
                              pacote CERTO      pacote ERRADO
   grep /assets/  (ingênuo)        6                 6     ← VERDE CEGO
   grep "/assets/ (com a aspa)     6                 0
   o slug no pacote inteiro    0 arquivos        3 arquivos
```

`/central-compras-pbqph/assets/` **contém** `/assets/`. É a mesma cegueira do `supabase.co` de
mais cedo, na mesma tarde, no mesmo formato: a pergunta óbvia responde "sim" nos dois casos. A
lição 16 pagou o preço dela duas vezes hoje.

**Ensaio: 5 casos, 5 certos**, com os três portões sabotados **um a um** — o primeiro a disparar
esconde os outros, e portão nunca exercitado é portão que ninguém viu funcionar. O roteiro é lido
de dentro do `deploy.yml`, não copiado dele.

## 3. O que o ensaio no GitHub PROVOU

Rodei (`workflow_dispatch`, `ensaio` marcado, ramo `migracao-supabase`) — corrida
`33683289814`, 21 segundos, **vermelha**. E o vermelho provou quatro coisas, três das quais eu
tinha declarado como **não provadas** na decisão 22:

1. **`${{ vars.X || secrets.X }}` resolve na máquina do GitHub sem erro de sintaxe.** O log mostra
   `VITE_SUPABASE_URL:` vazia — resolveu, e resolveu para vazio. Era o primeiro item da minha lista
   de "não consegui provar";
2. **a trava do banco morde de verdade, lá**, e a frase que ela imprime é a que eu escrevi para o
   Pedro ler: onde digitar, e o que aconteceria sem isso;
3. **`deploy: skipped`.** O ensaio parou antes de publicar, como projetado. A trava de ramo e a
   caixinha do ensaio seguraram;
4. **o botão do ensaio funciona a partir de um ramo que não é a `main`** — coisa que eu não tinha
   como saber sem apertar.

## 4. O que o ensaio NÃO conseguiu provar

**A trava do endereço não rodou.** A corrida morreu no portão anterior, e os passos `Build`,
`Provar que o endereço do banco entrou no pacote` e `Provar que o pacote sabe onde mora` aparecem
todos como não executados.

O motivo é medido, não suposto: **`gh variable list` e `gh secret list` voltam vazios** — o Pedro
ainda não digitou as duas variáveis do banco. **Enquanto ele não digitar, nenhum ensaio alcança a
trava do endereço.** Ela está provada só na minha máquina.

Também continuam sem prova: o DNS respondendo (é do `Banco_de_Dados`), a página abrindo em
navegador de gente, e o certificado HTTPS.

## 5. Uma coisa que eu pus sem você pedir, e por quê

O terceiro portão confere o **CNAME dentro do pacote**. `base` de raiz e CNAME são **duas metades
da mesma decisão**: um pacote de raiz publicado sem CNAME cai no endereço antigo e dá tela branca
igual — só que com as outras duas travas verdes, que é o pior jeito de quebrar.

E o `.gitattributes` entrou por uma coisa que quase passou. O Git avisou que `public/CNAME` viraria
CRLF nesta máquina. Fui medir se a trava aguentava, e **o teste disse que sim — e a conclusão
estava errada**: os bytes (`od -c`) mostram `\r\n`, mas o `$(cat)` devolveu 22 caracteres, porque
**o Git Bash do Windows come o `\r` sozinho**. No Linux do CI ele fica, e a trava daria **vermelho
num arquivo correto**.

Ou seja: **este portão não pode ser ensaiado nesta máquina, porque a diferença que ele mede não
existe aqui.** A trava passa `tr -d '\r'` e o `.gitattributes` prende o arquivo em LF — dois
consertos que não dependem um do outro.

Se valer para o catálogo, a lição é mais larga que o `\r`: **instrumento ensaiado na máquina errada
não prova o que ele faz na máquina certa** — e foi um aviso do Git, dos que a gente ignora todo
dia, que abriu isso.

## 6. O que eu disse ao Pedro, e que não é meu para decidir

A ordem das três coisas dele importa, e eu escrevi isso na pendência: **DNS primeiro, `Settings >
Pages > Custom domain` depois, juntar os ramos por último.** Fora dessa ordem, a `main` sobe com
`base` de raiz num endereço que ainda não existe, e o site fica inalcançável até o DNS chegar.

E disse a ele, com todas as letras, que no dia em que ele juntar os ramos **o endereço que a equipe
usa muda**. Isso é mudança no dia das pessoas, e não é minha para decidir sozinha.

— Ordem_de_Compra, 02/09/2026
