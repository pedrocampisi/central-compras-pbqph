# D728 — os três pedidos do Pedro no ramo (`b226682`), para a sua avaliação

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 05/10/2026, 18h3x
**Responde:** `2026-10-05_de_CTO_para_Ordem_de_Compra_D728-tres-pedidos-do-Pedro-ECR-entrega-e-qualidade.md`.
**Espero de volta:** a sua avaliação do ramo e das fotos. Aprovado, eu publico (emenda 3), fora do dia do primeiro uso
do mestre.
**O banco não mudou.** Sem migration. **NÃO publicado.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §0 — O ramo

- **`d728-tres-pedidos`, em `b226682`**, saído do `main` de hoje (`6eceaac`). Três commits:
  - `89f02ec`: o §1 e o §2;
  - `e6633b3`: o §3;
  - `b226682`: as fotos.
- **A prova:**
  - **945 testes**, com tipos e lint limpos;
  - **7 sabotagens, todas vermelhas**;
  - **CI verde** (37375832445).
- **Um tropeço:** numa rodada da bateria, com a máquina carregada (79 s contra os 24 s de costume), um teste antigo
  estourou os 5 s. É o "rascunho da ECR entre contas", que não toca em nada deste ramo. Sozinho ele passou, e na rodada
  seguinte deram 937 de 937. É a mesma família da pendência 30: tempo, não regra.
- **A pausa** abriu só para esta lista. Nada mais entrou.

## §1 — A sigla ECR

- **O catálogo:**
  - o título agora é "Catálogo de ECRs", e o menu também;
  - a primeira linha sob o título diz "ECR é a Especificação de Compra e Recebimento de cada material", seguida da
    contagem de ECRs e do texto que já estava.
- **Nas outras telas, o "?" da sigla** fica na primeira vez que ela aparece, e é **um só por tela**. O texto é um
  só, para todas dizerem o mesmo: "ECR é a Especificação de Compra e Recebimento: o que a Campisi exige na compra e no
  recebimento de cada material controlado. O texto de cada uma está no Catálogo de ECRs."

| Tela | Onde fica o "?" |
|---|---|
| Nova OC | No selo do fornecedor, quando ele mostra as ECRs. Senão, ao lado do título "Itens", antes da coluna ECR |
| Qualificar agora | No aviso da trava, quando ele fala de ECR (o "material controlado (ECR 19)" da foto do Pedro). Senão, em "Qualificada para as ECRs" |
| A gaveta do fornecedor | No título "Qualificação": a linha das ECRs fala de ECR sempre |
| A ficha da empresa | Na linha da qualificação de material, depois das ECRs |
| Qualificação | No subtítulo, na aba Materiais (só ali as linhas mostram ECRs) |
| Recebimentos (a ligação do sem pedido) e o registro de entrega | Na pergunta "Confere com a OC e com a ECR" |
| Painel, tratativas abertas | No título, quando alguma linha mostra "OC e ECR" |

- **Os PDFs ficam como estão.** O app do mestre não mostra a sigla.

## §2 — A entrega prevista no dia seguinte

- **A OC nova nasce com a entrega no dia seguinte ao da Data.** A Data é o "hoje" de Brasília (o `todayIso` da casa),
  e a conta do dia seguinte é no calendário, sem fuso.
- **A entrega acompanha a Data** enquanto ninguém mexeu nela. Depois que o engenheiro mexeu, inclusive para
  esvaziar, ela é dele.
- **O rascunho salvo e a OC que já existe** ficam com o que têm. Mudar a Data deles não mexe na entrega.
- **O texto de ajuda do campo ficou o mesmo.** Eu tinha trocado e voltei atrás, porque a sua carta diz que fica.
- **Uma decisão minha, para você confirmar ou vetar: a OC duplicada no Histórico** também nasce com o dia seguinte.
  - A cópia levava a entrega da OC velha, quase sempre um dia que já passou.
  - A duplicada não é rascunho salvo nem OC que existe: ela nasce agora.
- **A prova:**
  - o relógio falso às 22h de Brasília (já 06/10 no UTC) acha 06/10, e não 07/10;
  - os testes cobrem a virada do mês, a do ano e o 29 de fevereiro;
  - cinco sabotagens, todas vermelhas: o "hoje" em UTC, a entrega que não desliga, a nova sem o dia seguinte, a que
    acompanha sempre, e dois dias em vez de um.

## §3 — O "?" do critério de qualidade

- **Li o PS.02 vigente no Dropbox do SGQ, só leitura,** e nada foi copiado para o repositório. Li:
  - a tabela do item 2 e o parágrafo PSQ/SiMaC inteiros;
  - o item 5, dos laboratórios, que a tabela manda aplicar ao controle tecnológico.
- **Onde o PS.02 diz algo além da pergunta, o critério ganhou um "?". Onde ele só repete a pergunta, não ganhou.**

| Categoria | "?" | Por quê |
|---|---|---|
| Materiais, critério 1 | **sim** | "Qualidade/PSQ-ECR" e o parágrafo do PSQ: a ECR, o PSQ e o certificado avulso que não contorna |
| Materiais, critérios 2 e 3 | não | preço/condições e prazo: a pergunta já diz |
| Serviço, Projetos, Locação | não | SST e NR, EPI, responsabilidade técnica, contrato e checklist: o PS.02 repete a pergunta |
| Controle tecnológico, 1, 2 e 3 | **sim** | o item 5 acrescenta: a acreditação para os ensaios contratados; a 17025 comprovada (instituição de ensino ou pesquisa) e, sem acreditação, a avaliação do Anexo 7 com requalificação a cada 12 meses; a ISO 9001 com os ensaios no escopo |

- **O texto do critério 1 de Materiais é o seu, com duas mudanças:**
  1. **saiu** "As entregas avaliadas nos últimos 12 meses ajudam a responder". Essa frase não está no PS.02, e a caixa
     já mostra o desempenho dos 12 meses logo acima dos critérios;
  2. **entrou** "PSQ (Programa Setorial da Qualidade, do PBQP-H)", porque o Pedro não conhece a sigla.
- **A fonte vai no fim de cada "?"**: "Fonte: PS.02, item 2." no de Materiais e "Fonte: PS.02, item 5." nos do
  laboratório. A fonte completa está num comentário no código (`src/domain/ajudaDosCriterios.ts`).
- **As perguntas não mudaram.** Elas vêm do banco.

### As diferenças entre a pergunta e o PS.02, como você pediu: não troquei nada

| Critério | A pergunta do banco | O PS.02, item 2 |
|---|---|---|
| Materiais 2 | "menor preço de mercado" | "preço/condições" |
| Serviço 3 | "menor preço do mercado" | "condição comercial/técnica" |
| Projetos 2 | "conhecimento da ABNT NBR 15575" | "conhecimento/requisitos técnicos aplicáveis" |
| Projetos 3 | "menor preço do mercado" | "prazo/preço" |
| Locação 3 | "menor preço do mercado" | "disponibilidade/preço" |

- **No próprio PS.02 há uma referência quebrada:** a linha do controle tecnológico manda "aplicar os critérios
  específicos do **item 6** deste procedimento". No HTML de hoje, os laboratórios são o **item 5**, e o item 6 é
  "Registros e evidências". Os "?" citam o item 5, que é onde o texto está. O conserto é do SGQ, não desta casa.

## §4 — As fotos

Ficam no ramo, em `docs/Capturas/2026-10-05_D728/`: 7 cenas, cada uma a 1366 e a 375.

| Foto | O que mostra |
|---|---|
| `30_catalogo_de_ecrs` | o título e a sigla por extenso |
| `31_nova_oc_entrega_amanha_e_o_que_e_ecr` | Data 05/10 e Entrega 06/10; o "?" de "Itens" aberto |
| `32_nova_oc_o_que_e_ecr_no_selo` | o fornecedor qualificado: o "?" depois de "ECRs 03 e 08" |
| `33_qualificar_agora_o_criterio_de_qualidade` | o "?" do critério 1 aberto |
| `34_qualificar_laboratorio_os_tres` | os três "?" do laboratório; o do 2 aberto |
| `35_recebimentos_o_que_e_ecr` | a ligação do sem pedido: o "?" na pergunta da ECR |
| `36_qualificar_agora_o_que_e_ecr_no_aviso` | o aviso "material controlado (ECR 19)" com o "?" aberto |

- **As fotos foram tiradas como as da D719:** o app de verdade, sobre um banco falso dentro da página, com tudo
  inventado. Não entrei no ensaio com conta, porque esta casa não digita senha.
  - Se você quiser fotos com o banco de ensaio de verdade, isso pede a mão do Pedro no login.
- **A medida das fotos:** nenhuma rolagem de lado e nada fora da tela, nas 14.
  - Nas caixas abertas, a medida acusa texto da caixa por cima da página de trás. É a caixa cobrindo a página, e não
    defeito: as fotos mostram.
  - Na de 375 da Nova OC, a coluna ECR da tabela é estreita e corta o código. Isso já era assim antes deste ramo, e
    não mexi.
