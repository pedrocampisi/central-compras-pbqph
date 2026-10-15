# D805 — A política da qualidade no PDF, o que cada ECR pede ao fornecedor, e a IA monta a OC do orçamento

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 15h2x
**Decisão:** D805 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** nada. É palavra do Pedro na janela do CTO, em 15/10: "pode mandar" (a IA monta a OC, D804) e "tem novas
coisas para serem implementadas também, dá uma lida na última transcrição da aula do PBQP-H".
**Espero de volta:** uma campainha por parte, depois do commit dela: a A com as fotos e as medidas; a C, que é só texto,
junto com a A ou logo depois; a B com as fotos e as medidas.

---

## §0 — De onde vem

Na aula do PBQP-H de 15/10, o Pedro mostrou a OC à consultora. O "Importar Pedido (IA)" leu a foto do orçamento e
preencheu os itens. Ela aprovou ("você tem tudo que você precisa ... em relação a materiais") e disse o que falta.

1. **A política da qualidade dentro do PDF da OC.**
   - É o texto, não um anexo.
   - É o item 5.2 da norma: a política tem de estar disponível às partes interessadas. Os fornecedores estão no mapa
     delas, e o pedido de compra é o papel que chega a eles.
   - Ela disse que o auditor cobra isso.
2. **O que o fornecedor deve mandar, por ECR.**
   - Hoje o PDF diz só "CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR". Ela perguntou: "qual ECR? O que o fornecedor tem que
     te mandar?".
   - A sugestão dela: o item aponta a ECR, e o PDF puxa da ECR o que o fornecedor deve enviar.
   - O Pedro respondeu: "isso é fácil".
3. **Qualificação e avaliação são coisas diferentes.**
   - A qualificação vem ANTES da compra, e a data dela tem de ser anterior à do pedido.
   - A avaliação é o carimbo do recebimento, DEPOIS da entrega.
   - Na tela da qualificação, ela tomou a coluna "Desempenho" por avaliação, e a lista de ECRs embaixo do fornecedor
     por itens comprados. Depois entendeu e disse: "é isso mesmo, só precisa arrumar aqui".

Ela lembrou também que o auditor pede o pedido de compra pronto e não olha você criar. **O PDF é o que ele lê.**

## §1 — Parte A, primeiro: o PDF e a tela da qualificação

Um ramo a partir do `main`. A parte A é pequena e é o que a auditoria lê.

### A1 — A política da qualidade no PDF

- **O texto** é a frase da política, palavra por palavra, do documento oficial `FO 5.2 - Política de Qualidade.html`,
  na pasta `05 - PS e MQ` do SGQ no Dropbox.
  - O HTML é empacotado: o texto está dentro do `<script type="__bundler/template">`.
  - Eu li assim:

    > Buscar a satisfação do cliente com excelência técnica, promover a melhoria contínua de nossos processos, cumprir
    > os requisitos legais e aplicáveis, e atuar com sustentabilidade em tudo que fazemos.

  - **Confira contra o arquivo; não confie na minha cópia.**
- **O título** é "POLÍTICA DA QUALIDADE", com a referência "(FO 5.2)".
  - Sem revisão e sem data, para o PDF não envelhecer quando o documento ganhar revisão.
- **Só a frase.** As sete diretrizes do documento ficam fora: ela pediu "o textinho".
- **Uma vez por OC**, e não em toda página.
  - O lugar no PDF é seu.
  - Mostre na foto da OC de 1 item que as assinaturas não vão para uma página nova por causa da política.
- **Onde guardar o texto:** no código ou na configuração, você escolhe, com duas condições:
  - a configuração vazia não tira a política do PDF;
  - um teste lê o texto do PDF e acha a frase inteira.

### A2 — O que cada ECR pede ao fornecedor, no PDF

- **O que entra:** para cada ECR que aparece nos itens da OC, na ordem da primeira aparição:
  - o código e o nome da ECR;
  - a seção "REGISTRO DO FORNECEDOR" dela, palavra por palavra.
- **Vale a regra da D586/D588:** o PDF não resume, não conserta e não esconde linha. Se a ECR diz "Não aplicável", o PDF
  diz "Não aplicável".
- **O quadro genérico** "CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR" dá lugar a isso.
  - A OC sem ECR nenhuma fica como você achar mais claro.
  - Diga o que escolheu, e quantas OCs da produção não têm ECR em item nenhum.
- **A OC já emitida mostra a ECR que valia na emissão,** e não a de hoje.
  - Se uma ECR mudar de revisão em dezembro, o PDF de uma OC de outubro não pode mostrar o texto de dezembro.
  - Você diz como: a fotografia na emissão, ou a revisão pela data.
- **O tamanho, medido por mim na produção:**
  - as 20 ECRs têm a seção;
  - ela vai de 1 a 9 itens; a maior é a da ECR 08, com 9 certificados.
  - Faça a foto da OC com as três ECRs de seção mais longa juntas.

### A3 — A tela da qualificação diz o que é cada coisa

- **Os títulos e os subtítulos dizem** (a regra da D475: a tela se lê):
  - os critérios são a qualificação, feita ANTES da compra;
  - a coluna "Desempenho" é o que as entregas mostraram (as avaliações do carimbo), e ela conta na requalificação;
  - a lista de ECRs embaixo do fornecedor são as ECRs para as quais ele está qualificado, e não itens comprados.
- **As perguntas dos critérios não mudam.** Elas são do PS.02. Mudar o texto delas é mudar o procedimento, e isso é do
  Pedro com a consultora (D729 §3).
- **Meça e responda, sem construir:** a OC pode sair com a Data anterior à qualificação do fornecedor?
  - A trava de emissão olha a qualificação de hoje.
  - Se o campo Data aceita um dia no passado, a OC sai com uma data anterior à qualificação, e o auditor vê isso.
  - Se pode, proponha a trava. Eu decido.

### O que eu quero da parte A

- **Os testes,** com uma sabotagem para cada coisa nova: A1, A2 e A3.
- **As fotos do PDF:**
  - 1 item sem ECR;
  - 1 item com ECR;
  - as três ECRs de seção mais longa juntas;
  - 30 itens.
- **As fotos da tela da qualificação,** antes e depois, a 1280.
- **A medida da Data** (A3).
- **O tamanho do ramo em linhas,** sem os testes.

Eu confiro. Com a minha aprovação, você publica pela emenda 3 e mede na produção, como sempre.

## §2 — Parte B, logo depois da A: a IA monta a OC a partir do orçamento

**Não espere a A ser publicada.** É outro ramo, e ele mexe em outro canto do código.

O Pedro aprovou a visão dele (D804): a IA preenche e a pessoa confere. A mesma leitura do "Importar Pedido (IA)" passa a
propor também o alto e os totais da OC.

### O contrato com o Banco

O Banco vai devolver um `cabecalho` na `extrair-itens` (a carta D805 a ele). Os campos são opcionais:

```
"cabecalho": {
  "cnpj_emitente": "",
  "condicao_pagamento": "",
  "entrega_texto": "",
  "entrega_dias": null,
  "entrega_data": "",
  "frete": null,
  "outras_despesas": null,
  "desconto": null,
  "total": null,
  "confira": ""
}
```

| Campo | O que é |
|---|---|
| `cnpj_emitente` | 14 dígitos, só de quem **emitiu** o orçamento. Nunca o do cliente. Nunca CPF. |
| `condicao_pagamento` | Como está escrita no papel. |
| `entrega_texto` | O prazo ou a data de entrega, como está escrito. |
| `entrega_dias` | O prazo em dias, quando o papel dá em dias ("5 dias úteis" → 5; o "úteis" fica no `entrega_texto`). |
| `entrega_data` | `AAAA-MM-DD`, quando o papel traz a data. |
| `frete`, `outras_despesas`, `desconto`, `total` | Em reais, como impressos. |
| `confira` | A dúvida da leitura sobre o cabeçalho, quando houver. |

Campo vazio (`""` ou `null`) quer dizer: o papel não diz.

Construa contra o contrato, com uma resposta de mentira nos testes. Ligue de verdade quando o Banco publicar no ensaio.

### O que a IA preenche

- **O fornecedor,** pelo CNPJ do emitente, só entre as empresas já cadastradas.
  - Uma filial bate: ela entra.
  - Nenhuma bate: o campo fica vazio, com a frase "o CNPJ do orçamento não está no cadastro".
  - **A IA nunca cadastra fornecedor e nunca muda cadastro.**
- **A condição de pagamento,** como está escrita.
- **A entrega prevista,** só quando o orçamento traz a data ou o prazo.
  - O prazo em dias conta a partir da Data da OC.
  - Em dias úteis, diga como contou.
  - Sem nada no papel, fica o automático de hoje: a Data mais um dia.
- **O frete, as outras despesas e o desconto material,** quando o orçamento os mostra.
- **A diferença do total.** Quando o orçamento traz o total, a tela mostra o total do orçamento ao lado do total da OC,
  e a diferença, se houver. É a conferência que o Pedro quer.

**A IA não preenche** a obra, que fica manual, nem as observações.

### As regras

1. **Todo campo que a IA preencheu leva o "confira",** como os itens hoje, até a pessoa mexer nele ou confirmar.
2. **Nada grava e nada emite sem o clique** do comprador.
3. **A trava da qualificação continua.** O fornecedor não qualificado não emite, mesmo que a IA o tenha preenchido.
4. **O campo que a pessoa já preencheu à mão, a IA não sobrescreve.** Ela pergunta, ou deixa como está: diga o que
   escolheu.

### O que eu quero da parte B

- **Os testes da ligação,** com uma sabotagem para cada um:
  - o CNPJ que bate;
  - o CNPJ que não bate;
  - duas filiais;
  - o orçamento sem CNPJ;
  - o prazo em dias virando data;
  - o frete e o desconto;
  - a diferença do total;
  - o campo à mão que a IA não pisa.
- **As fotos,** com um orçamento de exemplo, antes e depois de importar.
- **O tamanho em linhas,** sem os testes. Se passar de mil, vai à perícia antes da produção (D624).
- **Antes de publicar, o Pedro testa com um orçamento real** dele, no ensaio. Eu marco com ele. A medida é quantos
  campos ele teve de consertar.

## §3 — Parte C: só uma proposta, sem construir — os certificados por ECR

A consultora disse que cada ECR pede ao fornecedor certificados específicos, e que a Campisi tem de mantê-los
arquivados.

- **Uns vêm a cada lote.** O aço traz certificado a cada compra.
- **Outros valem até a validade.** O piso já entregue não pede certificado novo enquanto o dele valer.

**Medi na produção:** das 20 seções "REGISTRO DO FORNECEDOR", só 1 fala em "lote", e nenhuma fala em "validade". Pelo
texto de hoje, o sistema não tem como saber qual é qual.

**Proponha, em uma página:**
- onde o certificado fica guardado no sistema;
- quem o põe: o comprador na OC, o encarregado no recebimento, ou o financeiro pelo e-mail;
- como o sistema sabe se o certificado é por lote ou por validade;
- o que já existe hoje e serve (a foto da nota no recebimento, por exemplo).

Duas opções e a sua recomendação. Eu levo ao Pedro. **Nada se constrói antes da palavra dele.**

## §4 — O que não é seu, para você não estranhar

- **A Lista Mestra.** A consultora vai pôr todos os documentos do SGQ em Rev. 00 de 14/10/2026.
  - Isso bate no PS.02 (Rev. 00 de 31/08) e nas 20 ECRs do sistema (19 em Rev. 00 de 15/04 e 1 em Rev. 01 de 21/04).
  - A decisão é do Pedro. Até ela sair, ninguém aperta "Gravar a Rev. 01", e nenhuma revisão muda.
  - Se ele disser sim, vem carta.
- **A auditoria.** Saiu de 16/11 para dezembro, em 14/10, e o Pedro pensa em 2027. O "mostrar só uma obra" não muda: a
  janela se escolhe em Configurações.
- **Os indicadores, a RNC e o mapa de processos** não são da OC.

— CTO
