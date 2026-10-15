# D805 parte B — A IA monta o alto da OC a partir do orçamento, no ramo `d805b-ia-monta-a-oc` (`01e8900`)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 16h1x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D805-a-politica-no-PDF-e-a-IA-monta-a-OC.md`, §2 (e acusa a
chegada da D808, que vem a seguir)
**Espero de volta:**
- a sua conferência das fotos e do ramo;
- o aviso de quando o Banco publicar o `cabecalho` da `extrair-itens` no ensaio. Aí eu ligo de verdade, e o Pedro
  testa com um orçamento real. **Não publiquei.**

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d805b-ia-monta-a-oc`, saído do `main` `f2685b2`, com um commit: **`01e8900`**. Está no GitHub.
- **O tamanho, sem os testes:** 458 linhas a mais e 11 a menos. Fica abaixo das mil da D624, então não pede perícia.
  Os testes somam mais 354.
- **A bateria:**
  - 1101 testes (eram 1075 no `main`);
  - tipos e lint limpos.
- **As sabotagens:** 27, todas vermelhas (§6). O código restaurado voltou ao verde.
- **As fotos:** 5, em `docs/Capturas/2026-10-15_D805B/`, a 1280.
  - Elas saíram do app de verdade, numa página de prova com uma resposta falsa da leitura.
  - Fornecedores, itens e números são inventados.
  - O CNPJ que a tela mostra embaixo do fornecedor foi coberto com "(teste)" na foto.

## §2 — O contrato: o `cabecalho` da `extrair-itens`

Construí contra uma resposta falsa, com este formato. Todos os campos são opcionais, e vazio (`""` ou `null`) quer
dizer que o papel não diz.

| campo | o que é | o que a tela confere |
|---|---|---|
| `cnpj_emitente` | o CNPJ de quem emitiu o orçamento | só 14 dígitos. CPF ou número quebrado vira vazio |
| `condicao_pagamento` | como o papel escreve | texto, sem espaço nas pontas |
| `entrega_texto` | a frase do prazo, como está | é por ela que se sabe se os dias são úteis |
| `entrega_dias` | o prazo em dias | inteiro, de 1 a 365 |
| `entrega_data` | a data impressa, AAAA-MM-DD | só data que existe |
| `frete`, `outras_despesas`, `desconto` | os valores do papel | número, zero ou mais, em centavos |
| `total` | o total do orçamento | número, zero ou mais |
| `confira` | a dúvida da leitura sobre o alto | texto |

- **Sem o `cabecalho`, nada muda.** A leitura de hoje continua igual: os itens entram e o alto da OC fica como está.
  Um teste confere isso.
- **A carta ao Banco é sua.** Eu não escrevi ao Banco.

## §3 — O que a leitura preenche

As fotos 01 (antes) e 02 (depois) são a mesma OC, antes e depois de colar o orçamento.

- **O fornecedor sai do CNPJ do emitente, só entre os cadastrados.**
  - A filial que bate é a que entra, e não a principal da empresa.
  - O mesmo CNPJ em duas empresas do cadastro: a leitura não escolhe.
  - A filial inativa, bloqueada ou fora da lista de material não entra, e a tela diz o motivo.
  - **Sem CNPJ, sem cadastro ou com dois cadastros, o fornecedor fica vazio.** No alto da tela aparece "Fornecedor:
    ficou vazio, porque o CNPJ do orçamento não está no cadastro. Escolha na lista." (foto 05).
  - **A IA nunca cadastra e nunca muda cadastro.** Um teste confere que o cadastro continua com o mesmo tamanho.
- **A condição de pagamento** entra como o papel escreve. Quando ela não está na lista da Configuração, ela entra na
  lista da tela, escolhida. A Configuração não muda.
- **A entrega:**
  - a data impressa vale como está;
  - o prazo em dias conta a partir da Data da OC:
    - quando o papel diz "úteis", conta de segunda a sexta, sem contar feriados;
    - quando não diz, conta dias corridos;
  - o aviso embaixo do campo diz a conta inteira. Exemplo: "Do orçamento — "5 dias úteis após o pedido": 5 dias
    úteis a partir da Data da OC (15/10/2026), de segunda a sexta, sem contar feriados. Confira.";
  - sem nada no papel, fica o automático, a Data mais um dia.
  - **Os feriados não contam.** O sistema não tem calendário de feriados, e o aviso diz isso.
  - **Se a pessoa mudar a Data depois da leitura,** a entrega não anda junto: ela já é um campo preenchido. O aviso
    continua dizendo de qual Data partiu a conta.
- **Os totais:** frete, outras despesas e desconto material entram (foto 03).
- **A conferência do total:** embaixo do TOTAL GERAL, numa linha só: o total do orçamento, o total da OC e a
  diferença.
  - Exemplo da foto 03: "Diferença: R$ 5,00 (a OC fica abaixo do orçamento)".
  - Quando os dois batem: "Os dois batem."
  - A conta é em centavos, para 0,1 + 0,2 não virar diferença.
- **A obra e as observações não entram.** Um teste confere isso.

## §4 — As quatro regras

1. **O "Confira".** Cada campo que a leitura preencheu ganha, embaixo dele, o aviso na cor de atenção, com a frase de
   onde veio e o botão "Está certo".
   - O "Está certo" tira o aviso.
   - Mexer no campo também tira.
   - No frete, nas outras despesas e no desconto, o aviso fica embaixo do TOTAL GERAL e diz o nome do campo, porque a
     grade dos totais não tem espaço embaixo de cada linha.
   - O aviso é da tela, como o "confira" dos itens. Não vai ao banco nem ao PDF, e some ao salvar.
2. **Nada grava e nada emite sem o clique.** A leitura só muda a OC na tela. Um teste confere que a OC continua
   rascunho, sem número e sem ir para a lista.
3. **A trava da qualificação continua.** A leitura só escolhe o fornecedor; a emissão passa pela mesma conferência
   de sempre, na tela e no banco.
4. **A IA não pisa no que a pessoa pôs.** A escolha que fiz:
   - **está livre** o campo vazio, o automático (o "À vista" com que a OC nova nasce, a entrega que acompanha a Data,
     o zero dos valores) e o que a própria leitura pôs;
   - **não está livre** o que a pessoa escolheu ou digitou nesta tela, o que ela conferiu com o "Está certo", e o que
     já estava gravado no rascunho. O "À vista" de um rascunho salvo é da pessoa, não é automático;
   - no campo que não está livre, fica o da pessoa, e o alto da tela diz o que o papel dizia. Exemplo da foto 04:
     "Condição de pagamento: ficou o que você já tinha posto. O orçamento diz "28/35/42 dias - boleto"."
   - a segunda leitura também não pisa no campo que a pessoa conferiu ou mudou depois da primeira.

## §5 — As fotos

| foto | o que mostra |
|---|---|
| `01_antes_alto_1280.png` | a Nova OC antes da leitura: fornecedor vazio, "À vista", a entrega na Data mais um dia |
| `02_depois_alto_1280.png` | depois da leitura: o fornecedor escolhido pelo CNPJ (com o selo da qualificação), a condição como está escrita e a entrega em dias úteis, cada um com o "Confira" e o "Está certo" |
| `03_depois_totais_1280.png` | o frete e o desconto lidos, os dois avisos com o nome do campo, e o total do orçamento ao lado do da OC, com a diferença |
| `04_amao_alto_1280.png` | a condição escolhida à mão antes da leitura: ela fica, e o alto diz o que o orçamento dizia |
| `05_semcadastro_alto_1280.png` | o CNPJ do orçamento fora do cadastro: o fornecedor fica vazio, e o alto diz por quê |

## §6 — As sabotagens

| peça quebrada | resultado |
|---|---|
| o CNPJ bate e o fornecedor não entra | vermelho (5) |
| o CNPJ não bate e entra o primeiro do cadastro | vermelho (2) |
| o CNPJ não bate e a tela não diz por que ficou vazio | vermelho (1) |
| duas filiais: compara pela raiz, e entra a principal | vermelho (1) |
| o mesmo CNPJ em duas empresas: escolhe uma | vermelho (1) |
| a filial bloqueada entra | vermelho (1) |
| sem CNPJ: a frase errada | vermelho (1) |
| CPF entra como CNPJ | vermelho (1) |
| os dias úteis contam o fim de semana | vermelho (1) |
| o papel diz "úteis" e a conta é corrida | vermelho (1) |
| o prazo conta de hoje, e não da Data da OC | vermelho (2) |
| a data impressa não vale | vermelho (1) |
| o frete não entra | vermelho (6) |
| o desconto vai para outras despesas | vermelho (5) |
| o campo preenchido fica sem o "Confira" | vermelho (3) |
| a leitura pisa no campo posto à mão (na regra) | vermelho (4) |
| a leitura pisa na condição do rascunho (na tela) | vermelho (1) |
| a leitura pisa na entrega do rascunho (na tela) | vermelho (1) |
| a leitura pisa no frete do rascunho (na tela) | vermelho (1) |
| a segunda leitura pisa no campo já conferido | vermelho (1) |
| o "Está certo" não tira o "Confira" | vermelho (1) |
| a leitura escreve nas observações | vermelho (2) |
| a diferença do total sem a conta em centavos | vermelho (3) |
| a diferença sai com sinal, além da frase | vermelho (1) |
| a conferência compara com o subtotal, e não com o total | vermelho (2) |
| a tela não lê o `cabecalho` da resposta | vermelho (8) |
| o contrato perde o `cabecalho` | vermelho (1) |

**Uma sabotagem ficou verde na primeira rodada** ("a leitura pisa na condição escolhida"): o teste só cobria a
condição escolhida nesta tela, que outra trava já protege. Faltava o rascunho salvo. Pus o teste do rascunho, e as
três sabotagens dele ficaram vermelhas.

## §7 — O que fica

1. **A parte B espera o Banco.** Quando o `cabecalho` estiver no ensaio:
   - eu ligo de verdade;
   - o Pedro testa com um orçamento real;
   - só depois disso ela vai ao `main` e é publicada, com a sua palavra.
2. **A D808 chegou.** Copiei-a para a minha `Devolucoes` e sigo agora:
   - o campo "Requisito de Qualidade" sai da Configuração, no ramo da parte A, com o teste;
   - junto no `main`, anoto o desfazer e publico pela emenda 3;
   - meço na produção sem gravar nada.
   A carta de fecho da parte A vem depois.
3. **A tela da trava da Data** vem depois, quando a parte do Banco estiver no ensaio.

— Ordem_de_Compra
