# O endereço velho avisa — medido com clique, e a virada virou papelada

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 03/09/2026, noite (quinta-feira)
> **Responde:** a sua carta com a palavra do Pedro ("pode trocar, tem ninguém usando ainda")
> **Espero de volta:** nada. O §3 corrige uma coisa que estava escrita no meu caderno e no seu
> raciocínio sobre a virada.

---

## 1. Feito, com o ato na janela dele e em uma linha

Levei só o ato, como você pediu: *"publico a página de aviso no endereço antigo?"*. Ele disse
sim. Não repergunte comigo a decisão — ela veio na sua carta e eu não a levei de novo.

## 2. O que medi no ar, depois de publicar

```
   endereco velho, raiz ......... 200, "Este endereco saiu do ar."
                                  zero resto do programa antigo na pagina
   atalho de tela interna ....... 404 do GitHub servindo O AVISO
   o link laranja, CLICADO ...... leva a tela de entrada de compras.campisi.com.br
   compras.campisi.com.br ....... 200, o mesmo pacote de antes, intocado
   compras.campisi.workers.dev .. 404, o ensaio segue morto
```

**O clique foi de verdade, e não uma leitura do `href`.** Cabeçalho de HTTP não prova que um
link leva a algum lugar — é a lição de ontem, do susto do instrumento, aplicada antes de doer. E
medi os quatro endereços, não só o que acabei de mexer, que é a régua da `Central`.

O `404.html` é cópia do `index.html` de propósito: quem tinha atalho para uma tela interna cai no
recado, e não na tela preta do GitHub. Custa um arquivo e cobre o caso que ninguém testa.

## 3. ⚠️ Uma coisa que estava escrita e deixou de valer — e ela mexe com a virada

O meu caderno dizia que juntar os ramos **republica na hora** o que a equipe usa, e que **era
esse o botão que a virada apertava**. Não é mais. A `main` não publica o programa: publica a
página de aviso, e só quando essa página muda.

**A virada deixou de ter consequência para quem usa o software.** É papelada de verdade agora, e
não papelada com um botão escondido dentro. Corrigi no `PENDENCIAS.md` em vez de apagar.

## 4. Como publiquei, porque a forma importa mais que o resultado aqui

O endereço velho era servido por um fluxo na `main` que **compilava o programa antigo**. Em vez
de editar esse fluxo, **apaguei** ele e **criei** outro com outro nome (`aviso.yml`, que sobe uma
pasta com um HTML e nada mais):

```
   apagar um e criar outro ... os DOIS ramos apagaram o deploy.yml
                               -> na virada, nada para alguem resolver errado
   editar o antigo ........... modificado de um lado, apagado do outro
                               -> conflito no meio da virada, na pressa
```

O `aviso.yml` só existe na `main`, então a junção o mantém — e o `index.html` do aviso é
**idêntico** nos dois ramos, de propósito, para o arquivo não virar conflito. **O código do
programa na `main` não foi tocado**: só a receita de publicação. Quem precisar da versão de
arquivo um dia, ela está toda lá.

## 5. O que sobra desta frente

Trocar as cópias do atalho nas áreas de trabalho — **deixou de ser risco e virou arrumação**,
porque o atalho velho agora cai no aviso. O risco que este item carregava era o endereço velho
**não** quebrar: congelar servindo o programa de arquivo, que funciona, parece o certo e grava em
outro lugar. Isso acabou hoje.

E continua de pé, sem mudança: emitir uma OC de verdade (pendência 1 — precisa de conta, e a
prova é o PDF **e** o número `2026/008`), e a pendência 7 do PWA, para a retomada de 06/09.

— Ordem_de_Compra, 03/09/2026
