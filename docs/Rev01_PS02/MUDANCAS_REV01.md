# PS.02 Rev. 01 — o rascunho, mudança por mudança

> **Data:** 06/10/2026 (gerado por `scripts/rascunho-rev01-ps02.py`; não edite à mão)
> **Estado:** PROPOSTA — aguardando o Pedro
> **Escopo:** o que muda da Rev. 00 para a Rev. 01 do PS.02, com o motivo de cada mudança (CTO-D730 §4, D738). **NÃO** é o procedimento: o texto inteiro está em `documento_rev01_rascunho.json`, na forma que o banco guarda.

---

## Em uma olhada

- **34 mudanças.** Quase todas acrescentam a tela do sistema ao que o PS.02 já dizia.
- **Requisitos do SiAC que saem: 0.** Nenhum requisito da Rev. 00 sai nem se estreita. Cada mudança foi conferida uma a uma (coluna "SiAC").
- **Escolhas do Pedro: 7.** Estão juntas na seção seguinte, cada uma com as opções.
- **Nada inventado:** cada frase sobre o sistema foi medida no código ou no banco. O que o sistema não faz (contratos, PES, avaliação de serviço, projeto e laboratório, o PSQ), o texto não diz que ele faz.
- **O que não muda:** o item 5 (laboratórios) inteiro, o aviso do PSQ/SiMaC, o escopo, a referência, o sumário e o rodapé.
- **A forma:** a do contrato do Banco. As 11 âncoras do documento continuam; são 61 âncoras, nenhuma repetida, e todo cartão e item do sumário apontam para uma que existe.

## As escolhas do Pedro

- **M12 — 1, quadro "Diretoria".** Quem revisa as ECRs e o procedimento e dá ciência nas tratativas é a Diretoria? (a) Sim, como está. (b) Outro papel: diga qual.
  - No rascunho está a opção (a).
- **M17 — 2, tabela, linha "Materiais controlados".** Materiais, critério 2: (a) o PS.02 passa a dizer o que a tela pergunta, "menor preço de mercado"; (b) o PS.02 fica "preço/condições", e a pergunta da tela muda (carta ao Banco).
  - No rascunho está a opção (a).
- **M18 — 2, tabela, linha "Serviços".** Serviços, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "condição comercial/técnica", e a pergunta muda.
  - No rascunho está a opção (a).
- **M19 — 2, tabela, linha "Projetos / engenharia".** Projetos, critérios 2 e 3: (a) como a tela, "conhecimento da ABNT NBR 15575" e "menor preço do mercado"; (b) ficam "conhecimento/requisitos técnicos aplicáveis" e "prazo/preço", e as perguntas mudam. Pode ser (a) num e (b) no outro.
  - No rascunho está a opção (a).
- **M20 — 2, tabela, linha "Locação".** Locação, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "disponibilidade/preço", e a pergunta muda.
  - No rascunho está a opção (a).
- **M21 — 2, tabela, linha "Controle tecnológico".** Controle tecnológico: (a) a regra é "≥ 1 favorável", como o sistema já faz; (b) outra regra (diga qual), e o mínimo do banco muda.
  - No rascunho está a opção (a).
- **M29 — 6, quadro "FO 8.4.1.1", o link da planilha.** A planilha FO 8.4.1.1 deixa de ser o registro? (a) Sim: o link sai, e o registro é a tela. (b) Não: o link fica, e a planilha continua valendo junto.
  - No rascunho está a opção (a).

## Todas as mudanças

### M01 — Cabeçalho

- **Âncora:** `cabecalho.revisao`
- **Antes:** Emissão inicial formal
- **Depois:** Manual do sistema de compras
- **Por quê:** A Rev. 01 passa a descrever cada passo na tela do sistema em que ele é feito (D730 §4.1).
- **SiAC:** Nenhum requisito sai.

### M02 — Como usar

- **Âncora:** `como_usar`
- **Antes:** Como usar este procedimento: identifique primeiro o que está sendo adquirido. A categoria define como qualificar o fornecedor, qual documento de aquisição/contratação deve existir e como será feita a avaliação posterior.
- **Depois:** **Como usar este procedimento:** identifique primeiro **o que está sendo adquirido**. A categoria define como qualificar o fornecedor, qual documento de aquisição/contratação deve existir e como será feita a avaliação posterior. Cada passo diz também **em que tela do sistema de compras** ele é feito.
- **Por quê:** Uma frase no fim: o procedimento passa a ser também o manual das telas.
- **SiAC:** Nenhum requisito sai.

### M03 — Fluxo, cartão "Material controlado"

- **Âncora:** `fluxo.c1`
- **Antes:** Qualificar → especificar pela ECR → emitir documento de compra → receber e avaliar.
- **Depois:** Qualificar na tela Qualificação → especificar pela ECR do Catálogo de ECRs → emitir a OC na Nova OC → receber pelo app do mestre e avaliar.
- **Por quê:** O mesmo caminho, com a tela de cada passo.
- **SiAC:** Nenhum requisito sai.

### M04 — Fluxo, cartão "Serviço de obra"

- **Âncora:** `fluxo.c2`
- **Antes:** Qualificar → contratar com escopo técnico → acompanhar execução/PES → avaliar.
- **Depois:** Qualificar na tela Qualificação → contratar com escopo técnico → acompanhar execução/PES → avaliar.
- **Por quê:** Só a qualificação de serviço está no sistema; contrato, PES e avaliação de serviço continuam fora dele.
- **SiAC:** Nenhum requisito sai.

### M05 — Fluxo, cartão "Laboratório"

- **Âncora:** `fluxo.c3`
- **Antes:** Verificar enquadramento/acreditação → contratar ensaio → conferir laudo e rastreabilidade.
- **Depois:** Verificar enquadramento/acreditação na tela Qualificação (Controle tecnológico) → contratar ensaio → conferir laudo e rastreabilidade.
- **Por quê:** Só a qualificação do laboratório está no sistema.
- **SiAC:** Nenhum requisito sai.

### M06 — Fluxo, cartão "Projeto / engenharia"

- **Âncora:** `fluxo.c4`
- **Antes:** Qualificar → contrato com objeto, escopo e responsabilidades → avaliar entrega técnica.
- **Depois:** Qualificar na tela Qualificação → contrato com objeto, escopo e responsabilidades → avaliar entrega técnica.
- **Por quê:** Só a qualificação está no sistema.
- **SiAC:** Nenhum requisito sai.

### M07 — Fluxo, cartão "Locação de equipamento"

- **Âncora:** `fluxo.c5`
- **Antes:** Qualificar → contrato/documento de locação claro → conferir equipamento e avaliar.
- **Depois:** Qualificar na tela Qualificação → contrato/documento de locação claro → conferir equipamento e avaliar.
- **Por quê:** Só a qualificação está no sistema.
- **SiAC:** Nenhum requisito sai.

### M08 — Fluxo, passo "3 · Qualificação"

- **Âncora:** `fluxo.s3`
- **Antes:** Registrar no FO 8.4.1.1 ou controle aplicável.
- **Depois:** Registrar na tela Qualificação (a FO 8.4.1.1 no sistema).
- **Por quê:** A FO 8.4.1.1 virou a tela Qualificação (D730 §4.2).
- **SiAC:** Nenhum requisito sai.

### M09 — Fluxo, passo "4 · Contratação"

- **Âncora:** `fluxo.s4`
- **Antes:** Comunicar requisitos suficientes ao fornecedor.
- **Depois:** Comunicar requisitos suficientes ao fornecedor. Material: a OC da Nova OC, com a ECR de cada item.
- **Por quê:** A tela de cada passo, para material.
- **SiAC:** Nenhum requisito sai.

### M10 — Fluxo, passo "5 · Recebimento"

- **Âncora:** `fluxo.s5`
- **Antes:** Conferir o que foi entregue/executado.
- **Depois:** Conferir o que foi entregue/executado. Material: o mestre registra no app do mestre.
- **Por quê:** O recebimento de material virou o app do mestre (D730 §4.2).
- **SiAC:** Nenhum requisito sai.

### M11 — Fluxo, passo "6 · Avaliação"

- **Âncora:** `fluxo.s6`
- **Antes:** Registrar desempenho e tratar desvios.
- **Depois:** Registrar desempenho e tratar desvios. Material: a avaliação da OC; a tratativa fica no Dashboard até a ciência.
- **Por quê:** A avaliação e a tratativa no sistema.
- **SiAC:** Nenhum requisito sai.

### M12 — 1, quadro "Diretoria"

- **Âncora:** `objetivo.q1.i1`
- **Antes:** Assegura recursos e diretrizes do processo de aquisição.
- **Depois:** Assegura recursos e diretrizes do processo de aquisição. No sistema, revisa as ECRs e este procedimento, e dá ciência nas tratativas.
- **Por quê:** No sistema, revisar ECR, revisar o procedimento e dar ciência na tratativa são de uma pessoa só, a mesma (a regra da D589).
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Quem revisa as ECRs e o procedimento e dá ciência nas tratativas é a Diretoria? (a) Sim, como está. (b) Outro papel: diga qual.

### M13 — 1, quadro "Administrativo / Compras"

- **Âncora:** `objetivo.q1.i2`
- **Antes:** Realiza cotações, compras, formalizações e organização dos registros financeiros/documentais.
- **Depois:** Realiza cotações, compras, formalizações e organização dos registros financeiros/documentais. No sistema, emite as OCs na Nova OC, registra as entregas no Histórico e resolve o que chegou sem pedido, na tela Recebimentos.
- **Por quê:** As telas de quem compra.
- **SiAC:** Nenhum requisito sai.

### M14 — 1, quadro "Obra / Engenharia"

- **Âncora:** `objetivo.q1.i3`
- **Antes:** Levanta quantitativos, solicita compras, define requisitos técnicos, recebe, armazena, identifica e apoia a avaliação.
- **Depois:** Levanta quantitativos, solicita compras, define requisitos técnicos, recebe, armazena, identifica e apoia a avaliação. No sistema, a engenharia cadastra o mestre de obra, põe na obra e gera o QR de entrada dele, na tela Mestres.
- **Por quê:** A tela Mestres é da engenharia (e do administrador).
- **SiAC:** Nenhum requisito sai.

### M15 — 1, quadro novo "Mestre de obra"

- **Âncora:** `objetivo.q1`
- **Antes:** não existia.
- **Depois (novo):** **Mestre de obra**: Recebe o material na obra pelo app do mestre: diz se chegou no dia combinado, sem estrago, o que foi pedido e se chegou tudo, com a foto ou o número da nota.
- **Por quê:** O mestre passou a receber pelo sistema (o app do mestre, D693 e D696). O papel não estava no PS.02.
- **SiAC:** Nenhum requisito sai.

### M16 — 2, primeiro parágrafo

- **Âncora:** `qualificacao.p1`
- **Antes:** A Campisi pré-avalia e seleciona fornecedores com base na capacidade de atender aos requisitos especificados. O registro corporativo é o FO 8.4.1.1 — Qualificação de Fornecedores, separado por categoria.
- **Depois:** A Campisi pré-avalia e seleciona fornecedores com base na capacidade de atender aos requisitos especificados. O registro corporativo é a **tela Qualificação** do sistema de compras — a **FO 8.4.1.1 — Qualificação de Fornecedores** —, separada por categoria, uma aba para cada. A qualificação é da empresa e vale para todas as filiais dela.
- **Por quê:** A FO 8.4.1.1 virou a tela Qualificação (D730 §4.2). No sistema, a qualificação é da empresa, não da filial.
- **SiAC:** Nenhum requisito sai.

### M17 — 2, tabela, linha "Materiais controlados"

- **Âncora:** `materiais`
- **Antes:** Qualidade/PSQ-ECR · preço/condições · prazo
- **Depois:** Qualidade/PSQ-ECR · menor preço de mercado · prazo
- **Por quê:** Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço de mercado".
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Materiais, critério 2: (a) o PS.02 passa a dizer o que a tela pergunta, "menor preço de mercado"; (b) o PS.02 fica "preço/condições", e a pergunta da tela muda (carta ao Banco).

### M18 — 2, tabela, linha "Serviços"

- **Âncora:** `servicos`
- **Antes:** Documentação e requisitos de SST · EPI aplicável · condição comercial/técnica
- **Depois:** Documentação e requisitos de SST · EPI aplicável · menor preço do mercado
- **Por quê:** Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço do mercado".
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Serviços, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "condição comercial/técnica", e a pergunta muda.

### M19 — 2, tabela, linha "Projetos / engenharia"

- **Âncora:** `qualificacao.t1.l3`
- **Antes:** Responsabilidade técnica · conhecimento/requisitos técnicos aplicáveis · prazo/preço
- **Depois:** Responsabilidade técnica · conhecimento da ABNT NBR 15575 · menor preço do mercado
- **Por quê:** Duas das 5 diferenças da D729: a tela pergunta "conhecimento da ABNT NBR 15575" e "menor preço do mercado".
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Projetos, critérios 2 e 3: (a) como a tela, "conhecimento da ABNT NBR 15575" e "menor preço do mercado"; (b) ficam "conhecimento/requisitos técnicos aplicáveis" e "prazo/preço", e as perguntas mudam. Pode ser (a) num e (b) no outro.

### M20 — 2, tabela, linha "Locação"

- **Âncora:** `locacao`
- **Antes:** Contrato/documentação · condição/checklist do equipamento · disponibilidade/preço
- **Depois:** Contrato/documentação · condição/checklist do equipamento · menor preço do mercado
- **Por quê:** Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço do mercado".
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Locação, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "disponibilidade/preço", e a pergunta muda.

### M21 — 2, tabela, linha "Controle tecnológico"

- **Âncora:** `qualificacao.t1.l5`
- **Antes:** Aplicar os critérios específicos do item 6 deste procedimento.
- **Depois:** ≥ 1 favorável: qualificado; nenhuma: desqualificado. Aplicar os critérios específicos do item 5 deste procedimento.
- **Por quê:** O "item 6" era um engano: os laboratórios são o item 5 (D729, D732 §4). E o sistema qualifica o laboratório com uma das três respostas favorável (o mínimo do banco é 1); a Rev. 00 não dizia a regra de decisão desta linha.
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** Controle tecnológico: (a) a regra é "≥ 1 favorável", como o sistema já faz; (b) outra regra (diga qual), e o mínimo do banco muda.

### M22 — 2, parágrafo novo: a trava da emissão

- **Âncora:** `qualificacao.t1`
- **Antes:** não existia.
- **Depois (novo):** **A trava da emissão:** a OC com material controlado (item com ECR) só é emitida se a empresa estiver qualificada em Materiais para aquelas ECRs, ou com a qualificação vencendo nos próximos 30 dias. Se não estiver, a Nova OC abre o "Qualificar agora", e a emissão segue se a qualificação for gravada com a nota no mínimo; abaixo dele, a empresa fica desqualificada e a OC não emite para ela.
- **Por quê:** A trava da emissão existe no sistema (D605) e não estava escrita no PS.02 (D730 §4.2).
- **SiAC:** Nenhum requisito sai.

### M23 — 2, a regra interna (letra miúda)

- **Âncora:** `qualificacao.p2`
- **Antes:** Regra interna Campisi: as qualificações são revistas periodicamente, com requalificação anual quando definida pelo controle corporativo e obrigatoriamente nos casos em que o SiAC estabelece 12 meses.
- **Depois:** Regra interna Campisi: toda qualificação vale 12 meses. A tela Qualificação mostra o vencimento e avisa 30 dias antes; a requalificação é feita na mesma tela, e a caixa de qualificar mostra as entregas avaliadas da empresa nos últimos 12 meses.
- **Por quê:** No sistema, toda qualificação vence em 12 meses, em todas as categorias. Os 12 meses que o SiAC exige ficam cobertos, porque valem para todas.
- **SiAC:** Nenhum requisito sai.

### M24 — 3, tabela, linha "Material controlado", como formaliza

- **Âncora:** `contratacao.t1.l1`
- **Antes:** Ordem/documento de compra conforme processo interno.
- **Depois:** **Ordem de Compra** emitida na tela Nova OC. O número nasce na emissão, e o PDF é guardado na pasta da obra.
- **Por quê:** A OC é emitida no sistema. O número vem do banco na emissão; o PDF vai à pasta da obra pelo servidor e, se ele falhar, pelo navegador.
- **SiAC:** Nenhum requisito sai.

### M25 — 3, tabela, linha "Material controlado", conteúdo mínimo

- **Âncora:** `contratacao.t1.l1`
- **Antes:** Descrição clara + especificações técnicas + requisitos da ECR aplicável.
- **Depois:** Descrição clara + especificações técnicas + requisitos da ECR aplicável. Na OC, cada item leva a ECR dele.
- **Por quê:** No sistema, a ECR é marcada por item da OC.
- **SiAC:** Nenhum requisito sai.

### M26 — 4, quadro "Materiais e locação"

- **Âncora:** `avaliacao.q1.i1`
- **Antes:** Registrar fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR/contrato. O formulário digital ou bot é aceito quando o registro permanece rastreável.
- **Depois:** Registrar fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR/contrato. O formulário digital ou bot é aceito quando o registro permanece rastreável. No sistema, para o que tem OC: o mestre de obra registra no app do mestre (chegou no dia combinado, sem estrago, o que foi pedido, chegou tudo, e a foto ou o número da nota), ou o escritório registra pelo "Entregue" do Histórico; as duas formas gravam a mesma avaliação. O que chegou sem OC vai para a tela Recebimentos, para ligar a uma OC ou descartar com o motivo.
- **Por quê:** O recebimento virou o app do mestre e o "Entregue" com a avaliação (D730 §4.2). O texto de antes fica inteiro, para o que é recebido fora do sistema.
- **SiAC:** Nenhum requisito sai.

### M27 — 4, a regra operacional (informação)

- **Âncora:** `avaliacao.a1`
- **Antes:** Regra operacional do controle digital: quando houver duas ou mais respostas “Não Conforme”, registrar a tratativa e comunicar o responsável definido pela Campisi. A abertura de RNC/FO 10.2 ocorre quando o desvio se enquadrar no processo de não conformidade da empresa; não deve ser gerada automaticamente apenas pelo número de respostas.
- **Depois:** **Regra operacional do controle digital:** quando houver duas ou mais respostas “Não Conforme”, o sistema exige a tratativa por escrito e a mantém em "Tratativas abertas", no Dashboard, até o responsável pelas ECRs dar ciência. A abertura de RNC/FO 10.2 ocorre quando o desvio se enquadrar no processo de não conformidade da empresa; não deve ser gerada automaticamente apenas pelo número de respostas.
- **Por quê:** O "comunicar o responsável" virou a tratativa aberta no Dashboard, com a ciência dele.
- **SiAC:** Nenhum requisito sai.

### M28 — 6, quadro "FO 8.4.1.1"

- **Âncora:** `registros.q1.i1`
- **Antes:** Qualificação de fornecedores
- **Depois:** Qualificação de fornecedores: a tela Qualificação; para o auditor, o "PDF dos qualificados".
- **Por quê:** A FO 8.4.1.1 virou a tela Qualificação, e a folha do auditor sai pelo botão dela.
- **SiAC:** Nenhum requisito sai.

### M29 — 6, quadro "FO 8.4.1.1", o link da planilha

- **Âncora:** `registros.q1.i1`
- **Antes:** ../08 - Execução de Obra/08.4 - Aquisição/FO 8.4.1.1 - Qualificação dos fornecedores.xlsx
- **Depois:** sai.
- **Por quê:** O link levava à planilha, que deixa de ser o registro. Na página do sistema ele já aparecia sem link (D732).
- **SiAC:** Nenhum requisito sai.
- **Escolha do Pedro:** A planilha FO 8.4.1.1 deixa de ser o registro? (a) Sim: o link sai, e o registro é a tela. (b) Não: o link fica, e a planilha continua valendo junto.

### M30 — 6, quadro "ECRs"

- **Âncora:** `registros.q1.i2`
- **Antes:** Especificações de Compra e Recebimento
- **Depois:** Especificações de Compra e Recebimento: o Catálogo de ECRs, com o histórico de revisões e o PDF de cada uma.
- **Por quê:** As ECRs viraram o Catálogo de ECRs (D588, D730 §4.2).
- **SiAC:** Nenhum requisito sai.

### M31 — 6, quadro "Ordens / documentos de compra"

- **Âncora:** `registros.q1.i3`
- **Antes:** Materiais controlados e demais compras conforme processo
- **Depois:** Materiais controlados e demais compras conforme processo: a tela Histórico, com o PDF de cada OC na pasta da obra.
- **Por quê:** Onde a OC fica no sistema.
- **SiAC:** Nenhum requisito sai.

### M32 — 6, quadro "Avaliações"

- **Âncora:** `registros.q1.i5`
- **Antes:** NF, formulário digital, bot ou planilha rastreável
- **Depois:** As avaliações de cada OC, no sistema; para o auditor, o "PDF das avaliações" do Histórico. Fora do sistema: NF, formulário digital, bot ou planilha rastreável.
- **Por quê:** Onde a avaliação fica no sistema. O texto de antes fica, para o que é avaliado fora dele.
- **SiAC:** Nenhum requisito sai.

### M33 — 7, o "?" do item

- **Âncora:** `revisoes`
- **Antes:** Somente revisões formalmente salvas entram neste quadro. O autosave do navegador é apenas rascunho.
- **Depois:** Somente revisões gravadas no sistema entram neste quadro: no sistema, gravar a revisão é aprová-la. O rascunho não entra.
- **Por quê:** O "autosave do navegador" era do HTML, e no sistema não existe (D732 §4).
- **SiAC:** Nenhum requisito sai.

### M34 — 7, o quadro "Conteúdo preparado para a próxima revisão formal"

- **Âncora:** `revisoes.a1`
- **Antes:** Conteúdo preparado para a próxima revisão formal: migração para o padrão HTML oficial, consolidação do fluxo de aquisição e correções de interpretação do SiAC 8.4.
- **Depois:** **Conteúdo desta revisão (Rev. 01):** o procedimento passa a dizer em que tela do sistema de compras cada passo é feito; o item 2 passa a remeter os laboratórios ao item 5; e a trava da emissão, o app do mestre e a tratativa no Dashboard entram no texto.
- **Por quê:** O quadro descrevia a migração para o HTML, que a página já é (D732 §4).
- **SiAC:** Nenhum requisito sai.

