# Pendências fechadas — Ordem de Compra

> **Data:** 26/09/2026
> **Estado:** CONCLUÍDO — é registro, não é fila de trabalho
> **Escopo:** os itens do `PENDENCIAS.md` que já fecharam, **inteiros, como estavam**, cada um com a data do fecho no título. Saíram da fila viva em 26/09/2026, na gaveta do fim da corrida (CTO-D571; lei 2, e lei 3 §7.6). Item que fechar daqui em diante vem para cá no dia em que fecha.

---

### 24. O PDF novo da OC (D655) no ramo, esperando o CTO e o Pedro — **FECHADA EM 01/10/2026: NO AR em `8d25ed4b` (CTO-D659, decisão 73); o desfazer é `69af6378`**

*Aberta em 30/09/2026, na decisão 72.* O quadro PARA A NOTA FISCAL e o CNO certo estão no ramo `d655-pdf-obra-na-nota`
(`893e411`), com o CI verde e NÃO publicados. **Espera:** o CTO conferir, o Pedro ver os PDFs em
`docs/Capturas/2026-09-30_D655/` e a carta curta de publicar. Aí é a emenda 3: juntar, a bateria, publicar pelo
PowerShell e medir por fora.

---

### 1. Provar na tela: ninguém emitiu OC por este aplicativo depois da troca para `salvar_oc` — **FECHADA EM 30/09/2026: as 004 e 005 saíram pela palavra nova do Pedro (D642, D651); a emissão provada pela 2026/008 e pela 2026/009, emitidas pela equipe com o PDF**

*Meu, quando houver conta de ensaio.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.


**Evidência nova, medida pelo `CTO` no banco de produção em 02/09/2026:** existem **2 ordens de
compra** (2026/004 e 2026/005, ambas de 08/08) e o **contador está em 7** — os números 006 e 007
foram gastos em 13/08 sem OC sobrevivente, que é o `reservar_numero_oc` **funcionando como
projetado**: rascunho abandonado queima número, e é isso que impede dois computadores de emitirem
a mesma OC.

✅ **O Pedro decidiu em 02/09/2026:** a primeira OC de verdade sai **`2026/008`**. As 004 e 005
ficam como estão, os números 006 e 007 ficam queimados, **ninguém limpa nada**.

⚠️ **Isto não fecha o item.** O que estava em aberto do lado do banco fechou; o que continua aberto
é o que sempre foi meu: **provar na tela** que esta versão emite. A evidência de hoje prova que a
numeração do banco funciona, **não** que esta tela funciona.

**O ensaio de 03/09 andou com este item, sem fechar.** Com o aplicativo no ar em
`compras.campisi.workers.dev`, ficou provado que **a tela carrega e alcança o banco**: uma chamada
a `/auth/v1/token`, e a recusa voltou como frase de gente. **Emitir continua sem prova** — exige
estar dentro, e eu não tenho senha nem uso a de ninguém. **Quem fecha este item é uma pessoa com
conta**, emitindo uma OC de ensaio e conferindo o número e o PDF.

**O fecho, em 30/09/2026 (decisão 71):**
- **A palavra de 02/09 ("as 004 e 005 ficam como estão, ninguém limpa nada") foi trocada pelo Pedro.** Na janela do
  Banco, às 08h4x, ele digitou: "sim, pode apagar as OCs 2026/004 e 2026/005". O Banco apagou as duas às 08:41:25, com
  a cópia no desfazer (não rodado), e o CTO conferiu por fora (D642, D651).
- **O que era meu, provar que esta versão emite, também fechou, pela equipe e não por mim.** Medido no banco de
  produção, só leitura, em 30/09:
  - a 2026/008 foi emitida em 26/09, com o PDF gerado e 5 itens;
  - a 2026/009 foi emitida em 30/09, com o PDF gerado e 1 item;
  - o contador está em 9: os números vieram do banco, na emissão;
  - não há outra OC na produção.
  Uma pessoa com conta emitiu por esta tela, com número e PDF, que era exatamente o que o item pedia.
- **Não abri os PDFs nem vi a tela logada.** A prova é o registro do banco, não o meu olho.

---

### 23. D644 §4 — três retoques: colunas fixas em Fornecedores, o cartão do Dashboard contando empresas, a busca do Catálogo no escuro · **no ramo `d644-retoques` (`5fb2b5d`, CI verde), esperando a linha do CTO sobre as fotos** — **FECHADA EM 30/09/2026: NO AR em `69af6378` (CTO-D647, decisão 70); o desfazer é `d7e5e46e`**


*Aberta em 29/09/2026 (decisão 68).* **O que é:**
1. As larguras das colunas de Fornecedores fixas: o cabeçalho não anda entre a lista, a busca e os filtros.
2. O cartão "Fornecedores" do Dashboard conta empresas (a regra da D501).
3. A caixa "Buscar ECR…" do Catálogo segue o tema escuro.

**A prova:**
- um teste com sabotagem para cada retoque;
- as fotos `01`, `04` e `06` em 1366 e 1920, e o Dashboard e o Catálogo no claro e no escuro.

**Fecha quando:** o CTO der a linha e a publicação sair. Sem perícia.
**A carta:** `Devolucoes/2026-09-29_de_CTO_para_Ordem_de_Compra_D644-fotos-aceitas-publique-e-tres-retoques-depois.md`.
*Em 29/09, 23h4x (decisão 69):* os três prontos no ramo, na cópia `OC_empresas`. As fotos estão em
`docs/Capturas/2026-09-29_D644/`, e a carta está na `Enviados`. Um ponto está com o CTO: a linha menor da empresa passa
por baixo de dois cabeçalhos.

---

### 22. D641 + D643 — fornecedores por empresa e o título uma vez · **no ramo, esperando a linha do CTO sobre as fotos** — **FECHADA EM 29/09/2026: NO AR em `d7e5e46e` (CTO-D644, decisão 68); o desfazer é `31557b08`**

*Aberta em 29/09/2026 (decisão 67).* **Onde mora:** o ramo **`d641-fornecedores-por-empresa`** (`4ca0741`), empurrado,
**fora do `main`**, na cópia `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_empresas` (sai só por `git worktree
remove`). **As fotos:** `docs/Capturas/2026-09-29_D641_D643/`. **A carta:**
`Enviados/2026-09-29_de_Ordem_de_Compra_para_CTO_D641-D643-fornecedores-por-empresa-e-o-titulo-uma-vez.md`.
**Fecha quando:** o CTO der a linha sobre as fotos; aí publico pela emenda 3 e mando o `versao.txt`. **Sem perícia**
(poucas linhas, D641 §3).

---

### 21. D604 + D605 + D606 — a avaliação dos fornecedores para a auditoria de 16/11 · **a tela NO AR em `31557b08` (decisão 66); falta o lado do Banco: as travas e o tempo real, depois da conferência do CTO** — **FECHADA EM 28/09/2026: a tela NO AR em `31557b08` (decisão 66); as travas e o tempo real ligados pelo Banco às 22h42 (D626)**

*Aberta em 28/09/2026 (decisão 59).* **O que é:** as telas da qualificação e da avaliação na entrega, e o "Qualificar agora".
**Onde está o que chegou:** na `Devolucoes`: as cartas D604, D605 e D606 do CTO, o plano do Banco, o contrato do Banco (D604),
a D609 (as tabelas na produção, **as duas travas desligadas até a tela publicar**: a tela primeiro, a trava depois) e a D610
(o tipo `laboratorio`; 2 pessoas físicas sem documento, qualificadas pelo `fornecedor_id`). **Quando começa:** depois do
editor e da perícia da máscara, numa cópia nova. **O Banco pediu aviso** quando as telas estiverem prontas para teste.
*Em 28/09 (D613):* o plano aceito com as quatro recomendações. O ramo cresce em `fe119e6` (por merge, e não recriado: o
ramo já estava empurrado); a qualificação na ficha da empresa, com as cinco categorias e o selo na lista; as tratativas num
bloco do Painel, só para quem revisa ECR; a locação sem OC fica para depois. A perícia deste ramo vai de `fe119e6` à ponta.
A prova no ensaio é primeiro pelo lado do Banco. Já no ramo: as regras puras (`0318d8b`, 18 testes).
*Em 28/09, 14h3x (decisão 60):* as telas prontas no ramo, `928320a`, CI verde, NÃO publicadas: a ficha da empresa,
o selo, a trava com o "Qualificar agora", a avaliação na entrega, as tratativas no Painel e os dois PDFs do auditor. Tem
540 testes e 39 sabotagens; as fotos estão em `docs/Capturas/2026-09-28_D604/`, no ramo. A carta ao CTO e ao Banco está na
`Enviados/`. **Falta:**
- a prova do Banco no ensaio, com as travas ligadas;
- a perícia `fe119e6..928320a` (4.258 linhas);
- a publicação, depois do editor, dos consertos e da máscara;
- as travas ligadas na produção, logo depois de publicar.
*Em 28/09, 14h5x (decisão 61):* a prova do Banco no ensaio passou, 38 de 38. Os quatro retoques da D614 estão no ramo
`ebbebb0`, CI verde, NÃO publicados; o tempo real escuta as duas tabelas novas. **Falta:**
- a conferência do CTO;
- a perícia `fe119e6..ebbebb0`; a cópia fica parada até o relatório;
- a publicação;
- no mesmo dia, avisar o Banco, que liga as travas e o tempo real na produção e manda a hora.
*Em 28/09 (D616):* os retoques conferidos e as 40 fotos aprovadas; a linha do tempo real fica. A perícia
`fe119e6..ebbebb0` está com o Pedro; o relatório chega em `docs/Pericias/`. A cópia fica parada em `ebbebb0`. Quando
chegar: medir cada achado (reproduziu, não reproduziu, não dá para medir), sem consertar antes da triagem do CTO.
*Em 28/09, 20h5x (decisão 62):* as duas perícias medidas no ramo `d604-fornecedores` (`d504c0f`, CI verde), sem
conserto: os 4 achados dos consertos e da máscara e os 7 da qualificação reproduziram. A carta ao CTO está na `Enviados/`.
**Falta:**
- a triagem do CTO;
- os consertos que ela mandar;
- a publicação, na ordem combinada, e no mesmo dia o aviso ao Banco.
*Em 28/09, 21h (D620):* os onze aceitos, zero falsos; a medida no ramo vale. Os consertos do A nascem no `d599-uma-obra`
(cópia `OC_uma-obra`), que depois entra por merge no `d604-fornecedores`, onde nascem os do B. A família da máscara vem
primeiro (A1, A2, B1, B2). O B4 e o B5 são de família: varrer o `src/` e dizer os outros casos. Uma carta por ramo. As
perícias foram para o `Arquivo_Morto/Pericias/`.
*Em 28/09, 21h4x (decisão 63):* os onze achados consertados, e as medidas viraram travas.
- **O `d599-uma-obra`, ponta `d0b244b`:** A1 a A4, e o Duplicar da D621. CI verde, 350 linhas.
- **O `d604-fornecedores`, ponta `1be6d46`:** B1 a B7, e a busca das famílias, que achou o PDF da OC. CI verde, 1.332
  linhas.
- As duas cartas ao CTO estão na `Enviados/`.

**Falta:**
- a conferência do CTO;
- a perícia pequena do `d604-fornecedores`;
- a publicação na ordem da D620, e no mesmo dia o aviso ao Banco.
*Em 28/09 (D622, D623, decisão 64):* o `d599-uma-obra` foi ao ar em `533138c7`, conferido por fora; a cópia
`OC_uma-obra` foi tirada.
*Em 28/09, 22h3x (D624, decisão 65):* a perícia pequena caiu. Pela lei 3 §9.5 nova, conserto de perícia não chama perícia
nova. O ciclo `format` ↔ `ecr` saiu no `fd6ad34`, CI verde.

**Falta:**
- a ordem da D604;
- a publicação da tela, com o "Qualificar agora";
- a conferência do CTO no ar;
- só então o roteiro do Banco, que liga as travas e o tempo real.
*Em 28/09, 22h3x (D625, decisão 66):* a tela NO AR em `31557b08`, versão `20260929013715-5567871`. O desfazer é
`533138c7`. O banco não mudou.

**Falta:**
- a conferência do CTO no ar;
- a carta dele ao Banco;
- as travas e o tempo real ligados na produção.

**Fecha quando** o Banco avisar que ligou.
*Em 28/09, 22h4x (D626, cópia):* o CTO conferiu a tela no ar por fora e mandou o Banco ligar as travas e o tempo real
na produção. Nada é pedido a esta casa. A D626 fica na caixa até a resposta do Banco.
*Em 28/09, 22h42 (D626 do Banco):* as duas travas ligadas na produção (`D` → `O`) e as quatro tabelas no tempo real.
A bateria do Banco deu 39 de 39. O desfazer está provado e não foi rodado. **Fechada.**

---

### 20. D599 — mostrar só uma obra, para a auditoria de 16 e 17/11 · **no ramo, esperando a carta do CTO para publicar** — **FECHADA EM 28/09/2026: NO AR em `533138c7` (CTO-D622, decisão 64); o desfazer é `080168b8`**

*Aberta em 27/09/2026 (decisão 57).* **Onde mora:** o ramo **`d599-uma-obra`**, empurrado, **fora do `main`**, feito
na cópia `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_uma-obra` (sai só por `git worktree remove`). As
fotos estão em `docs/Capturas/2026-09-27_D599/`. **Fecha quando:** a carta do CTO mandar publicar, depois da tela de
editar (pendência 19), **até 06/11**, para o ensaio do Pedro até 09/11. **Se a perícia consertar o `d589-editar-ecr`,**
o conserto vem para este ramo.
*Em 27/09 (decisão 58):* aprovada pela D601, com o retoque em Configurações (`feefada`). **A linha medida passou para
1.003 contra `7edb715`:** acima do portão por 3, e o CTO decide se vai ao perito.

---

### 19. D596 §3 + D589 §4.2 — a tela de editar a ECR e os dez campos fora do código · **consertos conferidos; esperando a perícia única sobre `fe119e6`** — **FECHADA EM 28/09/2026: NO AR em `533138c7` (CTO-D622, decisão 64); o desfazer é `080168b8`**

*Aberta em 27/09/2026 (decisão 56).* **Onde mora:** o ramo **`d589-editar-ecr`**, commit **`7edb715`**, empurrado,
**fora do `main`**. As fotos estão em `docs/Capturas/2026-09-27_D596/`. **Fecha quando:** a carta do CTO mandar
publicar. O desfazer será a `080168b8`. **Depois dela:** a primeira revisão de verdade é do Pedro.
*Em 27/09, 22h (D603):* a perícia do Codex chegou (sete achados). Medidos no ramo, commit `5f287cd`, só testes:
os sete reproduzem (o 5 no banco falso, o 6 por mutação). **Nada consertado:** espera a triagem do CTO.
*Em 28/09 (D607, decisão 59):* os sete aceitos e consertados no ramo, commit **`97226b3`**, empurrado; levados à cópia
`OC_uma-obra` por merge (`fe119e6`). 412 testes, zero `it.fails`. **1.185 linhas novas** contra `5f287cd`, acima do portão
de mil (lei 3 §9.5): o CTO decide se vai perícia antes. **Fecha quando:** a carta do CTO mandar publicar e o editor estiver no ar.
*Em 28/09 (D611):* conferidos. Por passar de mil, vai **uma perícia só** sobre a cópia `OC_uma-obra` em `fe119e6`
(escopo `7edb715..fe119e6`: consertos, medidas, máscara e merge); o Pedro dispara. A cópia fica parada em `fe119e6` e o ramo
em `97226b3`. O relatório chega na `docs\Pericias\` da casa: medir sem consertar. Editor, consertos e máscara vão ao ar juntos.

---

### 18. D586 + D588 + D589 + D593 — a tela de ler as ECRs, o PDF delas e o PDF da OC comprimido · **aprovado pela D593; esperando a ordem de publicar** — **FECHADA EM 27/09/2026: NO AR em `080168b8` (CTO-D594, decisão 55); o desfazer é `b2c4cf79`. A tela de editar segue aberta no ramo `d589-editar-ecr`**

*Aberta em 27/09/2026 (decisão 53; decisão 54).* **Onde mora:** o ramo **`d586-ecrs-do-sgq`**, commit **`ba53d2f`**,
empurrado, **fora do `main`**. As fotos estão em `docs/Capturas/2026-09-27_D586/` e `docs/Capturas/2026-09-27_D593/`.
**Fecha quando:** o CTO mandar, numa linha, por campainha, **depois de conferir a D592 do Banco na produção** (a
migration mexe em `secoes` e vai antes da tela). O desfazer é `b2c4cf79`. **Depois dela:** a tela de editar (D589 §4.2), num ramo à parte,
com a linha "Dimensão" sem texto da ECR 02 e a ECR 04 (recusada pelo banco até a decisão do CTO) em aberto.

---

### 17. D585 — a aba Prestadores sai da OC · **no ramo, esperando a carta do CTO para publicar** — **FECHADA EM 27/09/2026: NO AR em `b2c4cf79` (CTO-D587, decisão 52)**

*Aberta em 27/09/2026 (decisão 51).* **Onde mora:** o ramo **`d585-sem-prestadores`**, commit **`2672433`**,
empurrado, **fora do `main`**. As fotos estão em `docs/Capturas/2026-09-27_D585/`. **Fecha quando:** a carta do CTO
mandar publicar; o desfazer é `10205e67`.

---

### 16. D582 — o rápido primeiro: o texto da escolha do leitor · **no ramo, esperando a carta do CTO para publicar** — **FECHADA EM 27/09/2026: NO AR em `10205e67`, com a dica curta (CTO-D583, decisão 50)**

*Aberta em 27/09/2026 (decisão 49).* Os três textos da escolha trocados pela palavra do Pedro. **Onde mora:** o
ramo **`d582-rapido-primeiro`**, commit **`2482612`**, empurrado, **fora do `main`**. As fotos estão em
`docs/Capturas/2026-09-27_D582/`. **Fecha quando:** a carta do CTO mandar publicar. Aí o ramo entra no `main` e
sobe pelo PowerShell; o desfazer é `72257144`.

---

### 15. D579 — a moldura na tela estreita · **no ramo, esperando a carta do CTO para publicar** — **FECHADA EM 27/09/2026: NO AR em `72257144` (CTO-D580, decisão 48)**

*Aberta em 27/09/2026 (decisão 47).* O topo e o rodapé do menu consertados a 375 e a 768, e o comentário
do `wrangler.jsonc` alinhado com a lei. **Onde mora:** o ramo **`d579-moldura-375`**, commit **`4cb6569`**,
empurrado, **fora do `main`**. As fotos estão em `docs/Capturas/2026-09-27_D579/`. **Fecha quando:** a carta do
CTO mandar publicar. Aí o ramo entra no `main` e sobe pelo PowerShell; o desfazer é `a9b3b112`.

---

### 14. D557 + D567 — a lista em texto e a escolha do leitor · **no ramo, esperando o Pedro olhar as fotos** — **FECHADA EM 27/09/2026: NO AR em `a9b3b112` (CTO-D577, decisão 46)**

*Aberta em 26/09/2026.* A D557 (colar a lista em texto) ficou em espera pela D559; **voltou na
D567** (a corrida da IA da OC, largada pelo Pedro às 22h4x), que construiu por cima dela a escolha
do leitor: **rápido ou certeiro**, antes de ler, a mesma para a imagem e para o texto.

**Onde mora:** o ramo **`d557-lista-em-texto`**, último commit **`3795db0`** (a D575: depois da
leitura, os itens e o total na mesma janela), empurrado. **Fora do `main`** (decisão 41). As fotos estão em
`docs/Capturas/2026-09-26_D567/` (40: 10 estados × 1280, 1024, 768 e 375; e mais 10 a
1920 × 1080, o monitor do Pedro, com o menu de verdade — CTO-D574).

**A tela está aprovada pelo CTO** (D571), com os dois retoques da D570 feitos (decisão 43): uma mensagem de
leitura por vez, e o 422 da imagem sem o conselho da lista. E, pela D575 (decisão 45), o campo
encolhe depois da leitura: a 1920 × 1080, os 8 itens e o Total lido cabem na mesma janela.

**Pronto no ramo:** tudo o da D557, e mais: a escolha com a dica e o "?"; a espera do certeiro que
diz "até 1 minuto"; o resultado com o total lido em destaque e quem leu; o "Ler de novo com o
certeiro", que troca só os itens daquela leitura e pergunta antes se algum foi mexido; o erro do
rápido que oferece o certeiro; a trava do `_meta.leitor`. 285 testes; 16 sabotagens da D567, 7 da
D570 e as 10 da D557 mordendo (decisões 42 e 43).

**Falta, na ordem:**
1. o `CTO` levar a tela ao Pedro pelas fotos (aprovada por ele na D571);
2. o "sim" do Pedro (a `extrair-itens` v5 já está na produção desde 23:02, conferida pelo CTO);
3. o aviso de publicar, **por carta do `CTO`**. Então: trazer o ramo para o `main` do dia, rodar
   tudo, publicar pelo PowerShell, medir por fora e escrever a carta com as linhas de exemplo para o
   Pedro, dizendo nela o limite de **2.000 caracteres** do texto (o da v5, dito pelo CTO na D570).

### A pendência 9 (b–f) e a 12: o primeiro acesso e a Nova OC a 375px — 26/09/2026

Fechadas pela decisão 35 (CTO-D541), NO AR na versão `0439a829` (`20260926134940-beae35d`).
**b/c:** "Primeiro acesso" e "Esqueci minha senha" têm cada um a sua frase, e a ação laranja vira
o botão de enviar (sem o campo Senha). **d:** "Esqueci minha senha" com 44px (era 29). **e:**
rodapé em 12,5px (era 11,5). **f:** as três telas da porta dentro de `<main>`. **12:** o título da
Nova OC em uma linha e a fila de botões quebrando entre botões, 0px de rolagem para o lado a 375px.
Visto numa página de prova com a tela real e dados inventados (a tela logada não se vê daqui). O
envio com e-mail de verdade **não foi apertado**: é do Pedro, na conferência dele. O texto antigo
das duas pendências fica abaixo, como estava.

#### (era a 9) Conferência da UI de 07/09 — a lista, e a porta que barra 9 de cada 10 telas

*Minha, esperando triagem do `CTO`.* Medida em 07/09/2026 no navegador embutido, a pedido do
Pedro. **Conferido e não consertado**: a casa está pausada.

⚠️ **A porta, e ela é o item principal.** Este aplicativo inteiro fica atrás de um login, então o
que dá para conferir sozinha é **uma tela**: a de entrada. Obras, fornecedores, catálogo, emissão
de OC e o PDF **não foram vistos**. Não uso a conta de ninguém, e criar conta de ensaio mexe na
autenticação de produção, que não é desta casa. **O caminho:** o Pedro entra (é a pendência 1
dele) e deixa a janela aberta — aí eu percorro tela a tela sem nunca ver a senha.

**QUEBRA**

```
   (a) erro no console a cada carregamento: Unexpected token '<'
       /registerSW.js responde 200 com HTML em vez de JavaScript
       reproduzir: abrir o site, abrir o console. Aparece sozinho
       -> era a pendencia 7. CONSERTADA e NO AR em 14/09 (decisao 30):
          console limpo, medido depois de publicar
```

**FUNCIONA MAL**

```
   (b) "Primeiro acesso" e "Esqueci minha senha" dizem a MESMA frase:
       "Informe seu e-mail para receber o link de redefinicao."
       Quem clica em "primeiro acesso" NUNCA TEVE SENHA -- nao ha' o que
       redefinir. E' a pessoa insegura do primeiro dia lendo a frase de
       outra situacao. E e' para esse botao que a pagina de aviso a manda
       reproduzir: abrir o site, clicar em "Primeiro acesso" sem preencher

   (c) depois dessa mensagem NAO HA' O QUE APERTAR: a tela mantem o campo
       Senha e a acao laranja continua escrita "Entrar". A pessoa e' mandada
       informar o e-mail e nao recebe botao de enviar
       reproduzir: a mesma de (b)
```

⚠️ **Não medido, de propósito:** o caminho com o e-mail preenchido. Apertar dispara **e-mail de
verdade para uma pessoa de verdade**, e isso é ato que sai da máquina. É buraco declarado, não é
"está tudo bem".

**DESIGN**

```
   (d) alvo de toque pequeno: "Esqueci minha senha" tem 29px de altura em
       375px de largura. O confortavel e' 44. Os outros dois estao certos
   (e) a letra do rodape e' a menor da tela: 11.5px (o contraste esta' bom)
   (f) a pagina nao tem marco <main>. Tem <h1> e lang="pt-BR" corretos
```

**O QUE ESTÁ CERTO, medido — porque lista só de defeito mente sobre o conjunto**

```
   contraste ............ todos >= 5.93 (o exigido e' 4.5)
   foco pelo teclado .... visivel, contorno de 1.6px com folga
   gerenciador de senha . autocomplete username / current-password corretos
   celular 375px ........ sem transbordo; cartao de 327px, margens iguais
   envio vazio .......... "Informe e-mail e senha." -- claro e imediato
   uma acao laranja ..... uma so'; icone desenhado, sem emoji
```

🔑 **Duas medições minhas que estavam ERRADAS, e quase viraram defeito falso.** `focus()` por
código disse que **não há indicação de foco** — apertando Tab de verdade, o contorno está lá. E
clicar por código lendo a tela na mesma linha disse que **o botão não responde** — a mensagem
aparece depois que a tela se redesenha. **A lição 31 pelas duas pontas:** o instrumento errado não
só esconde defeito, ele **inventa** defeito.

Carta: [`Enviados/2026-09-07_de_Ordem_de_Compra_para_CTO_a-conferencia-da-ui-para-na-porta-o-que-medi-e-a-porta.md`](Enviados/2026-09-07_de_Ordem_de_Compra_para_CTO_a-conferencia-da-ui-para-na-porta-o-que-medi-e-a-porta.md)

---

#### (era a 12) A tela de OC quebra a 375px fora dos campos: título e botões

*Meu, quando a pausa acabar.* Visto em 15/09 na prova das decisões 31 e 32, dentro do ensaio:
o título "Nova Ordem de Compra" quebra palavra por palavra e a fila de botões (Cancelar · Visualizar
· Salvar Rascunho · Emitir) transborda a 375px, com rolagem horizontal dentro do `main`. Os
**campos** estão certos (uma coluna, sem cortar) depois das duas linhas de CSS da decisão 32. É a
continuação da pendência 9 — que só tinha visto a tela de entrada — para a primeira tela de dentro.


### A porta fotografa sozinha, e a OC provou do outro lado — 15/09/2026

Era a pendência 10 (aberta e fechada no mesmo dia). O Banco fez `salvar_oc` (`20260915110000`, no
ensaio) tirar a fotografia **sozinha**, pela obra, na emissão — e ignorar as três chaves se a tela
mandar. A tela parou de mandá-las. **Prova cruzada no ensaio:** a OC **2026/009**, emitida pela tela
para Yuri Solaris 2, voltou com `destinatario_nome`, `_documento` (14 dígitos) e `_tipo = pj`
**iguais ao cadastro da obra**; a 2026/008 continua nula (a emissão dela já passou). A obra encerrada
sem destinatário, batendo na porta: recusa `P0001` com a frase, **nenhuma OC gravada e nenhum número
queimado** (contador em 9 antes e depois). Falta a linha do Pedro para a produção — é do Banco.

### A sessão `campisi-oc` restaurada entra logada — 15/09/2026

Era a pendência 11. Com a janela aberta por `agent-browser --session campisi-oc --restore campisi-oc
--restore-save always`, o Pedro entrou **uma** vez com a Conta de ensaio (11h5x); o arquivo de estado
foi de 811 para 2924 bytes, com a sessão do Supabase dentro; fechei a janela, reabri com o mesmo
comando, e a tela era o **Dashboard**, com a conta de programa logada, sem ninguém digitar. **Ninguém
pede login para prova nesta casa de novo** — se o estado expirar, é carta.

### O PWA passou a ser gerado — o gerador não conhecia o Vite da casa — 14/09/2026

*Minha.* Achado em 03/09, no primeiro ensaio no ar. ⏸️ **A data de 06/09 caiu com a pausa da
casa** (04/09, palavra do Pedro): não é atraso, é escopo. Volta quando ele mandar.

O `index.html` pede dois arquivos que **a montagem não gera**:

**Pista nova, medida em 04/09 na montagem da virada:** não é o PWA inteiro que falta. A montagem
**gera** `sw.js` e `workbox-*.js` (29 arquivos em cache declarados), mas **não** gera os dois que
o `index.html` pede. O gerador roda e entrega metade — o que aponta para configuração, e não para
o gerador estar desligado. Começar por aí em 06/09.

```
   dist/manifest.webmanifest   FALTA        dist/sw.js            existe
   dist/registerSW.js          FALTA        dist/workbox-*.js     existe
```

**Não é regressão da mudança para o Cloudflare** — medido: o site publicado no GitHub Pages
responde **404 nos dois**. O que mudou foi só o disfarce: no Cloudflare, o
`not_found_handling: single-page-application` devolve **200 com o `index.html` dentro**, e o
navegador estoura `Unexpected token '<'` no console de quem abre.

**O que isso custa hoje, na prática:** o aplicativo **não é instalável** e **não abre offline** —
as duas coisas que o `Fluxo.md` promete ao operador ("aplicativo web instalável como PWA",
"depois o PWA roda offline"). O `sw.js` existe mas ninguém o registra, porque quem registrava era
o `registerSW.js` que não existe.

**A hipótese, que é hipótese e não medição:** o `vite-plugin-pwa` (0.21) não emite esses dois
arquivos sob o Vite desta casa (8.x) — a injeção no `index.html` acontece, a emissão não. Conferir
antes de mexer; pode ser configuração, pode ser incompatibilidade de versão.

**Enquanto não fecha, está trancado por escrito:** a quarta trava do `scripts/conferir-pacote.js`
confere que tudo que o `index.html` pede existe, e estes dois estão numa **lista de exceções
declaradas**, impressa a cada execução com o número desta pendência ao lado. Fechar esta pendência
inclui **apagar as duas linhas de exceção** — se elas ficarem, a trava continua avisando.

⚠️ **E tem uma decisão junto, que não é só técnica:** ou o PWA passa a funcionar, ou o `Fluxo.md`
para de prometer que funciona. **Documento que promete o que o programa não faz é pior que
documento nenhum**, porque quem lê para de acreditar no resto.

---

✅ **FECHADA EM 14/09/2026, com a palavra do Pedro ("pode dar o aceita no pwa").** A causa não era
configuração: o `vite-plugin-pwa` 0.21.2 declara aceitar Vite até o 6, e a casa roda o 8 — ele emitia
o `sw.js` e engolia os outros dois em silêncio. Subiu para 1.3.0, fixado. **As duas exceções da trava
sumiram**, a trava foi **sabotada** e mordeu (código de saída 1, restaurada byte a byte), e na tela:
console limpo, e a página abre **com o servidor desligado** (`deliveryType: cache-storage`).
**No ar desde a mesma noite**, com a palavra dele (*"empurra e publica"*): os três arquivos respondem com o tipo certo e o console está limpo. Decisão 30.

A pausa da casa também mudou o aviso lá em cima: *"PARA a pendência 7"* deixou de valer para ela
em 14/09, e só para ela.


---

### O ref do banco não é segredo — a régua estava errada, e quem a checou fui eu — 04/09/2026

✅ **Fechada em 04/09/2026 pelo `CTO`, sem ir à mesa do Pedro.** Achada em 04/09/2026, conferindo o diff da virada antes de empurrar — e é a conferência que
achou, não a sorte.*

O valor está escrito em **um** documento arquivado,
[`Arquivo_Morto/RELATORIO-MIGRACAO-SUPABASE-2026-08-08.md`](RELATORIO-MIGRACAO-SUPABASE-2026-08-08.md),
que entrou no registro `ce72335`, de 08/08/2026 — antes desta caixa existir. **Já está público**,
no ramo `migracao-supabase`, e não é novidade que a virada cria: é dívida que a virada só carrega
para a `main`.

⚠️ **CORREÇÃO DE UMA FRASE MINHA AO PEDRO, dita em 03/09:** eu disse que *"o endereço do banco não
entrou em commit nenhum"*. Isso valia para **os meus** registros, e eu não disse essa parte. No
repositório inteiro, é falso — está lá desde 08/08.

**O tamanho real disto, medido e não estimado:**

```
   no pacote que o site entrega ... 1 arquivo .js, 3 ocorrencias
                                    quem abre compras.campisi.com.br LE o valor
   no repositorio publico ......... 1 documento arquivado, 1 ocorrencia
```

**O endereço do projeto não é segredo, e não pode ser** — o navegador precisa dele para falar com
o banco, então ele viaja em todo pacote de todo aplicativo que usa Supabase. **Quem protege os
dados é a política do banco (RLS) avaliada contra o usuário logado**, mais a chave publicável, que
não autoriza nada sozinha. O que existe aqui é **quebra da régua da casa** (decisão 6: este é o
único repositório público, e valor não se escreve nele), e não vazamento de senha.

**Por que eu não conserto por conta própria:**

```
   tapar o valor no documento .... conserta a VITRINE, nao a historia:
                                   o registro ce72335 continua publico
   reescrever a historia ......... force-push em repositorio publico.
                                   Ato grande, e quebra o clone de quem tiver um
```

Meia-medida que faz o repositório **parecer** limpo enquanto o registro antigo segue lá é pior que
o problema, porque cria sossego falso. **A escolha é do Pedro**, e as duas pontas honestas são:
deixar como está e saber por quê, ou reescrever a história de propósito, sabendo o preço.

---

✅ **COMO FECHOU, e não fechei eu.** Levei o achado ao `CTO` junto com a notícia de que eu tinha
**batido a condição de parada dele e não parado**. Ele foi **medir em vez de arbitrar**:

```
   RLS ligado ........................ 45 de 45 tabelas
   grants de tabela ao `anon` ........ 0
   funcoes que o anon pode executar .. 21, e as que aceitam argumento abrem
                                       com um teste sobre auth.uid()
```

**Com o ref e a chave publicável na mão não se abre nada.** A régua que eu cumpria estava errada
no motivo, e regra com motivo fraco morre no primeiro que checa o motivo. Virou a **decisão 28**,
que emenda a 6.

**Reescrever histórico: não**, e a decisão é dele. Não há o que proteger, `force-push` em
repositório público quebra o clone de quem tiver um, e a CTO-D49 proíbe. O documento de 08/08
fica como está.

Carta: [`Arquivo_Morto/Devolucoes/2026-09-04_de_CTO_para_Ordem_de_Compra_voce-bateu-a-minha-condicao-de-parada-e-trouxe-o-motivo-medi-e-voce-esta-certa.md`](Devolucoes/2026-09-04_de_CTO_para_Ordem_de_Compra_voce-bateu-a-minha-condicao-de-parada-e-trouxe-o-motivo-medi-e-voce-esta-certa.md)


---

### O endereço velho parou de servir o programa e passou a avisar — 03/09/2026

Achado em 02/09/2026, lendo o `Fluxo.md` para corrigir o que ele dizia sobre o GitHub Pages.

O `start.bat` desta pasta — que é o atalho copiado para a **área de trabalho das pessoas** — tem o
endereço escrito dentro dele:

```
   antes  ...  https://pedrocampisi.github.io/central-compras-pbqph/
   agora  ...  https://compras.campisi.com.br/          (corrigido no repositório)
```

**Corrigir o arquivo aqui não corrige as cópias que já estão nas máquinas.** Ninguém atualiza a
área de trabalho de outra pessoa a partir deste repositório.

⚠️ **E o risco não é só o atalho quebrar — é ele NÃO quebrar.** Quando o GitHub Pages deixar de
receber publicação, o site que está lá **não some**: ele congela na última versão publicada, que é
a `main` de hoje — **a versão de arquivo no OneDrive, sem login e sem banco**. Quem clicar no
atalho antigo vai abrir um aplicativo que funciona, que parece o certo, e que **grava em outro
lugar**. Duas versões vivas ao mesmo tempo, e nenhuma delas avisando.

**Isto não é problema de programação, é de combinação com as pessoas**, e por isso é do Pedro
decidir como resolver. Os caminhos que eu enxergo, e o custo de cada um:

```
   desligar o Pages depois da virada ...... o atalho velho dá erro seco.
                                            Quebra na cara, mas quebra CEDO.
   deixar o Pages com uma página de aviso .. exige uma última publicação lá,
                                            só com o recado e o link novo
   trocar os atalhos, um por um ........... o único que não deixa ninguém para trás
```

**Recomendo os dois últimos juntos:** trocar os atalhos e deixar o endereço velho avisando, para
quem tiver o link salvo no navegador em vez do atalho. Mas isso é publicação e é mudança no dia
das pessoas — **não faço nada disso sem a palavra dele.**

---

✅ **A página de aviso está no ar no endereço velho**, desde a noite de 03/09/2026:
[`aviso-endereco-antigo/index.html`](../aviso-endereco-antigo/index.html). Uma página só, sem
dependência nenhuma, no padrão visual da casa (uma ação laranja, ícone desenhado, sem animação).

Ela diz o endereço novo e **separa dois caminhos de entrada** — a correção veio do `CTO` em
03/09, medida por ele na produção e conferida por mim:

```
   quem já usa a Central ····· MESMO e-mail, MESMA senha. Não faz "primeiro acesso".
   conta nova (sem senha) ···· "Primeiro acesso — definir minha senha".
```

**Por quê:** os dois apps usam o **mesmo projeto Supabase de produção** (mesmo `auth.users`),
então a senha de uma pessoa é a mesma nos dois — não por login automático (o crachá compartilhado
**continua congelado**, a pessoa digita e-mail e senha em cada app), mas por ser o mesmo cadastro.
Medido pelo `CTO`: das contas que existem hoje, **todas já têm senha** — ou seja, "primeiro
acesso" na prática só serve para conta que o administrador criar dali para frente.

**Eu confiri por conta própria** que o site no ar (`compras.campisi.com.br`) liga no projeto de
produção, e não no de ensaio: disparei um login na tela e o host da chamada bate com o ref de
produção. Sem isso, a frase sobre senha estaria escrita no escuro.

**Como foi publicada, e por que deste jeito.** O endereço velho era servido por um fluxo
automático na `main` que **compilava o programa antigo**. Em vez de editar esse fluxo, ele foi
**apagado** e um outro, com outro nome, foi **criado** (`aviso.yml`, que sobe uma pasta com um
HTML e nada mais):

```
   apagar um e criar outro ... na virada, os DOIS ramos apagaram o deploy.yml
                               -> nada para alguem resolver errado
   editar o antigo ........... modificado de um lado, apagado do outro
                               -> conflito no meio da virada, na pressa
```

Isso também derruba a preocupação que estava escrita aqui: **o aviso não depende da virada.** O
`aviso.yml` só existe na `main`, então a junção dos ramos o mantém. E o `index.html` do aviso é
**idêntico** nos dois ramos, de propósito, para o arquivo não virar conflito.

**O código do programa na `main` não foi tocado** — só a receita de publicação. Quem precisar da
versão de arquivo um dia, ela está toda lá.

**O que foi medido no ar depois de publicar** (e não o que foi enviado — lição 28):

```
   endereco velho, raiz ......... 200, "Este endereco saiu do ar."
                                  zero resto do programa antigo na pagina
   atalho de tela interna ....... 404 do GitHub servindo O AVISO, nao a tela preta
   o link laranja, CLICADO ...... leva a tela de entrada de compras.campisi.com.br
   compras.campisi.com.br ....... 200, o mesmo pacote de antes, intocado
   compras.campisi.workers.dev .. 404, o ensaio segue morto
```

O clique foi de verdade, e não uma leitura do `href`: **cabeçalho de HTTP não prova que um link
leva a algum lugar** — e a lição 31, do susto do instrumento, é justamente sobre isso.

**O risco que este item descrevia acabou.** Ele não era o atalho quebrar, era o atalho **não**
quebrar: o endereço velho ia congelar servindo o programa de arquivo, que funciona, parece o
certo e grava em outro lugar. Duas versões vivas ao mesmo tempo. Hoje o endereço velho não serve
programa nenhum — serve um recado.

**O que sobra, e não é urgente:** trocar as cópias do atalho nas áreas de trabalho. Deixou de ser
risco e virou arrumação, porque o atalho velho agora cai no aviso. O `start.bat` deste
repositório já aponta para o endereço novo desde 02/09; as cópias nas máquinas, não.

---

### A publicação passou a levar o banco junto — e a provar que levou — 02/09/2026

Era o item do `deploy.yml` com a versão digitada à mão, e virou coisa maior: o `CTO` mediu e
achou que o fluxo **não tinha uma linha de `env`**. Como `VITE_…` é lida na hora de montar,
juntar os ramos daria CI verde, publicação verde e **a tela sem alcançar o banco na mão da
pessoa**.

Agora ele tem duas travas — uma pergunta *"as variáveis chegaram?"*, a outra *"o endereço está
DENTRO do pacote?"* —, o Node vem do `.nvmrc` e o pnpm do `packageManager`. **A primeira versão
da segunda trava era cega** e o ensaio pegou antes de entrar. Ver `PLANEJAMENTO.md`, decisão 22,
com o que **não** foi possível provar sem publicar.

**Quem digita as duas variáveis é o Pedro**, em Settings → Secrets and variables → Actions. Não
vieram por carta e não passaram por agente nenhum.

### A conferência automática dos documentos existe, roda no CI, e mordeu na primeira vez — 02/09/2026

Era a pendência de que a organização tinha sido conferida **à mão uma vez, em 19/08**.
`scripts/conferir-documentos.js`, sete travas, ligado ao `pnpm conferir` **e ao CI no mesmo
commit** — porque o dia de hoje ensinou que instrumento que não roda é instrumento que não existe.

**A primeira execução saiu vermelha e achou quatro coisas reais:** três documentos que saíram de
circulação sem ninguém escrever por quê (as cartas do CNAE e das travas tapadas, e o `LEIA-ME.md`
do Arquivo Morto) e um apontamento de pasta onde tinha de ser de arquivo. Todos amarrados.

**Ela acusou a si mesma duas vezes** — uma trava que reprovava a si própria e outra que estourava
devolvendo *"não deu para medir"* com saída 0 — e as duas viraram regra. **8 sabotagens, 8
acusações.** Ver `PLANEJAMENTO.md`, decisão 21, com o que ela **não** olha, declarado.

### O CI desta casa passou a existir, e o primeiro verde não é meu — 02/09/2026

```
   antes ····· 16 execuções na história do repositório, 16 de publicação, 0 de CI
   agora ····· o fluxo CI dispara em push de qualquer ramo
```

`ci.yml` disparava só em `pull_request` para a `main`, e **nunca houve pull request neste
repositório**. O arquivo existia, era lido por quem passasse, e nunca tinha executado uma vez. Os
"76 testes verdes" que esta casa escreveu em três cartas eram verdes **numa máquina só: a minha.**

A primeira execução real saiu **vermelha em 22 segundos** — e foi ela que achou o defeito: o
`.nvmrc` declarava Node 20.11.0, que não tem `util.styleText` e não consegue carregar o `vitest`.
**O ambiente que esta casa declarava não rodava os testes desta casa.** Corrigido pela decisão 20:

```
   33620657411 ···· VERMELHO ···· .nvmrc 20.11.0
   33621122253 ···· VERDE ······· .nvmrc 24.14.1 · node v24.14.1 · Tests 76 passed (76)
```

Ordem do `CTO` pela régua da decisão 129 dele: congelamento veta frente nova, não conserto de
instrumento. **Zero linhas de código do produto foram tocadas.**

### Perícia P0-02: não é minha — é o item 13 do `Banco_de_Dados` — 02/09/2026

Esperei treze dias em silêncio: a lista dizia *"espera o `Banco_de_Dados`"* desde 20/08 e
**nenhuma carta nunca disse isso a ele**. Escrevi a carta em 02/09 e ele **respondeu no mesmo
dia**: é o mesmo assunto, e o item 13 dele (*"não há integração contínua nem ambiente reproduzível
na nuvem"*) é **mais largo que o meu e o contém**.

Antes de escrever, fui medir a casa dele em vez de repetir o achado de 10/08 — e três das quatro
coisas que a perícia pedia **já estavam feitas**: 146 migrations versionadas, reconstrução do zero
executável (`montar_ensaio.py`, que recusa rodar contra produção antes de qualquer outra coisa) e
22 arquivos de teste de permissão. Falta **o fio entre eles**, e o fio é da casa dele.

**Ele não deu data, e está certo em não dar** — prioridade é do Pedro. Comprometeu-se a avisar por
carta antes de marcar como feito.

Duas coisas ficaram para mim: a **decisão 19** (número certo colado no substantivo errado — eu
disse 169 migrations, são 146) e a conferência de entrega dele, `toda_carta_enviada_chegou()`, que
entra na pendência da conferência automática.

### A lei da organização dos documentos está cumprida — 02/09/2026

| O que a lei pedia | Como ficou |
|---|---|
| **Estado em todo documento** | **17 documentos, 17 cabeçalhos** `Data / Estado / Escopo`. As **22 cartas** ficam de fora **de propósito**: o estado de uma carta é a gaveta em que ela está (**decisão 13**) |
| **Os motivos saem do `Agente.md`** | Viraram as **decisões 14 a 18**. O `Agente.md` ficou só com a regra e o número da decisão ao lado |
| **`Readme.md` → `README.md`** | Não era o que parecia: o `README.md` da raiz **já existia e já era a porta certa** desde 20/08. O `docs/Readme.md` era **outro documento** — um guia de 280 linhas para dev. Virou [`docs/roteiros/guia-do-desenvolvedor.md`](../roteiros/guia-do-desenvolvedor.md), e com isso sumiu o segundo arquivo com cara de "leia-me" |
| **`pecas/` e `roteiros/`** | `roteiros/` **nasceu** com o guia acima. `pecas/` continua não existindo, **e isso é a lei sendo cumprida**: pasta vazia não se cria |

**Duas coisas apareceram no caminho e foram consertadas:** a pasta `melhorias futuras/` estava
**fora de `docs/`** (a lei só admite `CLAUDE.md` e `README.md` lá fora) e virou
[`docs/melhorias-futuras/`](melhorias-futuras/), com as três ideias marcadas **PROPOSTA**; e o
`Agente.md` apontava o padrão visual para `campisi-central/`, **pasta que não existe mais** desde a
arrumação — agora aponta para `00_Diretrizes_e_padroes/Padrao_Front_end/`, conferido arquivo por
arquivo.

**Uma pergunta ficou de pé, como proposta:** `docs/Fluxo.md` descreve o que o sistema faz para
quem não abre código — é o candidato natural a primeira **peça**. Não foi movido porque mover
quebra os apontamentos de fora por um ganho só de arrumação, e **esta casa está em congelamento**.
Quem decide é o Pedro.

### A tela de fornecedor NÃO classifica — e nunca classificou por engano — 28/08/2026

Era a pendência aberta em 28/08 (o upsert não escrever `fornece_material` nem `presta_servico`).
**Fechou por decisão do Pedro, sem uma linha de código:** a classificação vem do CNAE, não da
tela. Deixar nulo era a resposta certa desde sempre — agora tem decisão por trás em vez de ser
acidente. Ver `PLANEJAMENTO.md`, decisão 8.

> ⚠️ **Emendado em 15/09/2026 (decisão 31):** quem NASCE pela tela grava `fornece_material = true`;
> a edição continua não classificando ninguém.

### As duas recusas do banco pararam de subir cruas na tela — 28/08/2026

`fornecedores_cpf_pessoa_exige_pessoa` e `fornecedores_raiz_pendura_na_empresa` agora viram frase
sem jargão. Os nomes das duas foram conferidos no banco, não copiados da carta. Ver
`PLANEJAMENTO.md`, decisão 5. **Falta a prova visual** — ver as frases na tela exige fazer o
banco recusar de verdade, e esta casa não escreve no banco para ensaiar.

### Endereço de terceiro em carta viva: zero nesta casa — 28/08/2026

Varredura das cartas, documentos e código a pedido do `CTO`. Nenhum endereço a tirar, e nenhum
CPF ou CNPJ real. Ver `Arquivo_Morto/Devolucoes/` e a carta de resposta.

### `CLAUDE.md` na porta, apontando para a lei — 20/08/2026

Esta casa não tinha arquivo de leis. Quem abrisse uma conversa aqui trabalhava sem as regras,
achando que estava com elas. Ver `PLANEJAMENTO.md`, decisão 2.

### Caixa de correio no desenho da lei — 20/08/2026

`Devolucoes_Agentes/` deu lugar a `Devolucoes/` + `Enviados/` + `Arquivo_Morto/`. Ver
`PLANEJAMENTO.md`, decisão 3.
