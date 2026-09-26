# D542 — no ar: `44c083c6` (o desfazer é `0439a829`). O Fornecedor é a empresa, pelo apelido; a filial vem depois, pelo que ela é; os 4 últimos dígitos saíram

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 11h3x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D542-o-fornecedor-por-empresa-e-a-filial-depois.md`
**Espero de volta:** nada, a não ser que alguma das três escolhas do §1 e do §2 não sirva. A
conferência logada é do Pedro: as linhas estão no §6.
**Nenhuma chave, CPF ou CNPJ nesta carta** (os CNPJs das provas são inventados e não aparecem aqui).

---

## §1 — O que mudou, item por item da sua §2

```
   1 a lista ......... uma linha por empresa, pelo apelido, na ordem do apelido. Grupo = o
                       empresa_id da fornecedor_resolvido (lido junto com o apelido; a tela
                       nao calcula raiz). Linha menor: "4 filiais · Araguari/MG e Uberlandia/MG";
                       com uma filial so', a cidade. Apelido repetido: a razao social entra na
                       linha menor; se ainda empatar, a raiz do CNPJ (a parte que diz a empresa).
                       A pesquisa acha pelo apelido e pela razao social e fantasia de qualquer
                       filial ("beija flor" acha a Imperio)
   2 uma filial ...... escolher a empresa ja' escolhe a filial; o campo Filial nem aparece
   3 mais de uma ..... campo "Filial", obrigatorio, <select> simples, logo abaixo. Cidade; na
                       mesma cidade, a rua e o numero (e o bairro); sem rua, "matriz" ou
                       "filial nº N"; grupo com duas razoes sociais, a razao da filial. Os 4
                       ultimos digitos sairam: no pacote servido, "····" aparece 0 vezes
   4 bloqueada ....... fora da Nova OC (regra entraNaOc); no Historico, dentro
   5 a pista ......... a mesma de antes, agora com a razao social na frente: razao · endereco ·
                       CNPJ inteiro. Fica embaixo do ultimo campo do fornecedor (o Filial,
                       quando aparece). O PDF nao mudou: a OC grava a FILIAL, como sempre
   6 rascunho ........ ver §2
   7 Historico ....... filtro por empresa: a Imperio traz as OCs de todas as filiais
   8 apelidos ........ ver §3
   9 375px/teclado ... ver §4
```

Salvar ou emitir com a empresa escolhida e a filial em branco dá o aviso **"Selecione a filial do
fornecedor."** (antes seria "Selecione um fornecedor", que confundiria quem acabou de escolher um).

**Duas escolhas que a carta não fez, e eu fiz** (diga se não servem):
- **A cidade sem gritar.** O cadastro tem "UBERLANDIA" e "Uberlandia" para a mesma cidade (medido:
  quase toda empresa de várias filiais tem os dois). A tela compara sem caixa e mostra
  "Uberlandia/MG". Sem isso, a Império diria "Uberlandia/MG e UBERLANDIA/MG".
- **A mesma razão social escrita de dois jeitos não conta como duas.** A comparação ignora caixa,
  acento, pontuação e espaço, então "…BRASIL S.A." e "…Brasil S/A" são uma só. A ArcelorMittal
  aparece como "Belo Horizonte/MG" e "Uberlandia/MG", sem a razão repetida à toa.

E uma que apareceu ao olhar: **a busca livre do Histórico** ("Buscar por número, fornecedor…") só
olhava a razão social; "imperio" não achava nada. Agora acha também pelo apelido e pelo fantasia.

## §2 — O rascunho cuja filial hoje estaria fora (o seu item 6)

Abre **mostrando a filial gravada, sem trocar sozinho**. A lista da OC aberta inclui a filial
gravada mesmo fora da regra, e o rótulo dela diz o porquê: "Uberlandia/MG · filial nº 18 · … ·
**bloqueada para compra nova**" (ou "inativa", ou "fora da lista de material"). A pista embaixo termina
com "Atenção: bloqueada para compra nova". Se a pessoa trocar de filial, a bloqueada sai da lista
e não volta. **A tela não impede salvar ou emitir com ela.** Se o banco recusar, a mensagem é a do
banco. Se o senhor quiser a trava na tela, é uma linha; não pus porque a carta pediu "sem trocar".

## §3 — Medido na produção, só leitura (26/09, ~11h2x)

```
   na lista da Nova OC ...... 136 filiais de 113 empresas (a sua conta, 138 de 114, e' antes
                              do bloqueio: as 2 bloqueadas saem, e a segunda "Imperio" — 2
                              filiais, ambas bloqueadas — sai inteira)
   mais de uma filial ....... 13 empresas; a maior, a Imperio, com 9 (2 razoes sociais)
   apelido em duas empresas . na Nova OC so' a Triangulo Cercas; no Historico, a Imperio tambem
   APELIDOS COM CARA DE RAZAO SOCIAL (o seu item 8): 32 de 113 na lista da Nova OC
     30 com a forma juridica no nome (LTDA, S/A, EIRELI, ME, EPP), por exemplo
        "BJB COMERCIO E SERVICOS LTDA" e "CIPLAN - CIMENTO PLANALTO S/A"
      2 sem ela, mas com cara de razao: um "…LTD" cortado e um "…CIA BRASILEIRA DE BRICOLAGEM"
     (siglas curtas em maiusculas, como "G13" ou "HRT", nao contei: sao nomes)
```

Mostrados como vêm. A lista, com o critério, sai de uma consulta só de leitura à `fornecedor_resolvido`
filtrada como a tela filtra. Posso mandar os 32 nomes numa carta ao Banco, se o senhor quiser.

## §4 — Visto na tela, a 375px, pelo teclado

Página de prova temporária com a tela real e dados inventados, espelhando a produção: uma "Império"
com 5 filiais (uma bloqueada, duas razões sociais, a cidade escrita dos dois jeitos), a ArcelorMittal
com "S.A." e "S/A", as duas Triângulo Cercas e uma de filial única com rua. Apagada no fim.

```
   "imperio" ............. 1 linha: "Imperio das Tintas | 4 filiais · Araguari/MG e Uberlandia/MG"
                           (a bloqueada ja' fora)
   seta + Enter .......... aparece "Filial": Araguari/MG · BEIJA FLOR… | Uberlandia/MG · matriz ·
                           IMPERIO… | … filial nº 27 · BEIJA FLOR… | … filial nº 48 · BEIJA FLOR…
   Tab + setas ........... escolhe a filial; a pista: razao · cidade · CNPJ inteiro
   "zapi" + Enter ........ o campo Filial some; a pista com rua, bairro, cidade e CNPJ
   "triangulo" ........... 2 linhas, cada uma com a sua razao social embaixo
   "arcelor" + Enter ..... Filial: "Belo Horizonte/MG" e "Uberlandia/MG"
   Salvar sem filial ..... "Selecione a filial do fornecedor."
   rascunho bloqueado .... §2, visto assim
   Historico ............. o filtro "imperio" mostra 5 filiais e traz as OCs de duas delas (uma
                           da bloqueada); a busca livre "Imperio" acha as mesmas duas
   largura ............... rolagem para o lado 0 (375 = 375); o campo Filial termina em 359px
```

Um limite: o `<select>` fechado corta o texto comprido a 375px ("…BEIJA FLOR COMERCI"). Aberto, o
celular mostra a linha inteira. Não mexi, porque é o controle nativo.

Os cliques a 375px continuam caindo no lugar errado, como na D541. Numa das vezes o clique caiu na
busca livre, e foi assim que o defeito dela apareceu. Todas as escolhas acima foram feitas pelo
teclado de verdade.

## §5 — Travas, publicação, medidas

```
   sabotagens ... 7, todas mordendo (saida 1), restauradas com hash igual:
                  (a) o agrupamento perde filiais .............. 5 vermelhos
                  (b) a filial volta a levar os 4 ultimos ....... 2
                  (c) a bloqueada volta para a Nova OC .......... 1
                  (d) a filial unica deixa de se escolher ....... 1
                  (e) o apelido repetido perde a razao social ... 1
                  (e) some o ultimo desempate ................... 1
                  (+) a leitura do banco ignora o bloqueio ...... 2
   bateria ...... 163 verdes (eram 149), lint, typecheck, build, conferir:pacote 5/5,
                  conferir (documentos) 7/7
   commit ....... 10a9c7d (codigo)
   saiu do ar ... 0439a829-6134-4031-a37a-b2be33ffa2fc (26/09 13h50 UTC)  <- O DESFAZER
   entrou ....... 44c083c6-7e3b-486f-b431-098b815e3691 · versao 20260926142722-10a9c7d
   medido depois, por fora, sem entrar:
     /versao.txt ................. 200 text/plain, "20260926142722-10a9c7d"
     bundle index-BCZkmivK.js .... a versao 1 · empresa_id 6 · bloqueado_para_compra_nova 5 ·
                                   "Selecione a filial" 2 · "filial nº" 1 · "····" 0
     ref da producao ............. presente · ref do ensaio: 0
     sw.js ....................... nao precacheia versao.txt
     /, manifesto, registerSW.js, sw.js ... 200, tipo certo
     a vista ..................... as 6 colunas que a tela le, legiveis por authenticated
                                   (has_column_privilege, so' leitura); o GET anonimo volta
                                   42501, como na D536
```

Quem estiver com a aba aberta recebe a versão nova sozinho (o vigia da D541).

## §6 — As linhas prontas para o Pedro, em compras.campisi.com.br

> 1. Abra a Nova OC. Se a aba já estava aberta, ela se atualiza sozinha ao voltar para ela; senão,
>    Ctrl+Shift+R.
> 2. **Fornecedor:** digite `império`. Aparece **uma** linha, "Império das Tintas", com "9 filiais ·
>    Uberlandia/MG" embaixo. (A outra Império tem as 2 filiais bloqueadas, então não entra na Nova
>    OC. Ela aparece no Histórico, passo 7.)
> 3. **Escolha a Império:** aparece o campo **Filial**, com "matriz" e "filial nº …". Nenhum "····".
>    Escolha uma e veja embaixo a razão social, a cidade e o CNPJ inteiro.
> 4. **ArcelorMittal:** o campo Filial mostra as duas cidades, Belo Horizonte e Uberlândia.
> 5. `triângulo`: duas linhas "Triângulo Cercas", cada uma com a sua razão social embaixo.
> 6. **Escolha uma das Triângulo Cercas** (cada uma tem uma filial só): o campo Filial **não
>    aparece**, e a pista embaixo já traz o CNPJ inteiro.
> 7. **Histórico:** o filtro de fornecedor com "Império" mostra as duas empresas e traz as OCs de
>    todas as filiais. A busca livre também acha pela palavra "Império".
> 8. **No celular:** o campo Filial cabe, e a tela não arrasta para o lado.

## O que fica

```
   com o Pedro ...... as linhas do §6
   com o senhor ..... se servem: a cidade sem gritar, S.A. = S/A, e o rascunho bloqueado
                      que a tela nao impede de emitir (§2); se quer os 32 apelidos numa carta
   comigo ........... nada novo; a pendencia 13 segue; 2, 3 e 4 pausadas
```

— Ordem_de_Compra
