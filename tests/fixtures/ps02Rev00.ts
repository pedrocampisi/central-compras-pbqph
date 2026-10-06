/**
 * O PS.02 Rev. 00 como dado de teste (CTO-D730: "o texto do HTML entra como
 * dado de teste no ramo até a forma do Banco chegar").
 *
 * O texto é o do arquivo do SGQ, palavra por palavra (sha256 bf295a90ff8eede3…,
 * gravado em 29/09/2026), conferido contra ele. Uma exceção, de propósito: os
 * nomes da tabela de revisões são inventados. Eles moram no banco, nunca no
 * repositório (D730 §1).
 */

import type { Procedimento, TextoRico } from '../../src/domain/procedimento';

const n = (texto: string) => ({ texto, negrito: true });
const t = (texto: string) => ({ texto, negrito: false });
const so = (texto: string): TextoRico => [t(texto)];

export function ps02Rev00(): Procedimento {
  return {
    codigo: 'PS.02',
    titulo: 'PS.02 — Aquisição & Qualificação de Fornecedores',
    subtitulo: 'Procedimento Sistêmico Corporativo de Qualidade',
    sobretitulo: 'CAMPISI ENGENHARIA LTDA · SGQ PBQP-H SIAC NÍVEL A',
    revisao: '00',
    situacao: 'Emissão inicial formal',
    data: '2026-08-31',
    responsavel: 'SGQ Campisi Engenharia',
    referencia: 'SiAC PBQP-H 2021 · requisito 8.4',
    escopo: 'Materiais, serviços, laboratórios, projetos/engenharia e locação de equipamentos críticos',
    sumario: [
      { texto: '1. Objetivo', ancora: 'objetivo' },
      { texto: '2. Qualificação', ancora: 'qualificacao' },
      { texto: '3. Contratação', ancora: 'contratacao' },
      { texto: '4. Avaliação', ancora: 'avaliacao' },
      { texto: '5. Laboratórios', ancora: 'laboratorios' },
      { texto: '6. Registros', ancora: 'registros' },
      { texto: '7. Revisões', ancora: 'revisoes' },
    ],
    comoUsar: [
      n('Como usar este procedimento:'),
      t(' identifique primeiro '),
      n('o que está sendo adquirido'),
      t(
        '. A categoria define como qualificar o fornecedor, qual documento de aquisição/contratação deve existir e como será feita a avaliação posterior.',
      ),
    ],
    fluxo: {
      titulo: 'Fluxo didático — da necessidade ao fornecedor avaliado',
      introducao: 'O fluxo é o mesmo em essência, mas os documentos e critérios mudam conforme a categoria.',
      cartoes: [
        {
          titulo: '🧱 Material controlado',
          texto: 'Qualificar → especificar pela ECR → emitir documento de compra → receber e avaliar.',
          destino: 'materiais',
        },
        {
          titulo: '👷 Serviço de obra',
          texto: 'Qualificar → contratar com escopo técnico → acompanhar execução/PES → avaliar.',
          destino: 'servicos',
        },
        {
          titulo: '🧪 Laboratório',
          texto: 'Verificar enquadramento/acreditação → contratar ensaio → conferir laudo e rastreabilidade.',
          destino: 'laboratorios',
        },
        {
          titulo: '📐 Projeto / engenharia',
          texto: 'Qualificar → contrato com objeto, escopo e responsabilidades → avaliar entrega técnica.',
          destino: 'projetos',
        },
        {
          titulo: '🏗️ Locação de equipamento',
          texto: 'Qualificar → contrato/documento de locação claro → conferir equipamento e avaliar.',
          destino: 'locacao',
        },
      ],
      tituloDaSequencia: 'Sequência mínima',
      sequencia: [
        { titulo: '1 · Necessidade', texto: 'Obra/Engenharia define o que precisa.' },
        { titulo: '2 · Categoria', texto: 'Classificar material, serviço, laboratório, projeto ou locação.' },
        { titulo: '3 · Qualificação', texto: 'Registrar no FO 8.4.1.1 ou controle aplicável.' },
        { titulo: '4 · Contratação', texto: 'Comunicar requisitos suficientes ao fornecedor.' },
        { titulo: '5 · Recebimento', texto: 'Conferir o que foi entregue/executado.' },
        { titulo: '6 · Avaliação', texto: 'Registrar desempenho e tratar desvios.' },
      ],
    },
    secoes: [
      {
        numero: 1,
        ancora: 'objetivo',
        titulo: 'Objetivo e responsabilidades',
        selo: 'SiAC 8.4',
        ajuda:
          'O processo de aquisição deve assegurar que materiais, serviços e processos externos atendam aos requisitos especificados. Dica de auditoria: mostre a ligação entre necessidade, qualificação, documento de contratação, recebimento e avaliação.',
        blocos: [
          {
            tipo: 'paragrafo',
            ancora: 'objetivo-1',
            destaque: null,
            texto: [
              n('Objetivo:'),
              t(
                ' assegurar que a compra de produtos e a contratação de serviços e processos estejam conformes com os requisitos aplicáveis.',
              ),
            ],
          },
          {
            tipo: 'quadros',
            ancora: 'objetivo-2',
            quadros: [
              { ancora: 'objetivo-2-1', titulo: 'Diretoria', texto: 'Assegura recursos e diretrizes do processo de aquisição.' },
              {
                ancora: 'objetivo-2-2',
                titulo: 'Administrativo / Compras',
                texto: 'Realiza cotações, compras, formalizações e organização dos registros financeiros/documentais.',
              },
              {
                ancora: 'objetivo-2-3',
                titulo: 'Obra / Engenharia',
                texto:
                  'Levanta quantitativos, solicita compras, define requisitos técnicos, recebe, armazena, identifica e apoia a avaliação.',
              },
            ],
          },
        ],
      },
      {
        numero: 2,
        ancora: 'qualificacao',
        titulo: 'Qualificação de fornecedores',
        selo: 'SiAC 8.4.1.1',
        ajuda:
          'A qualificação ocorre antes da compra/contratação, com critérios adequados ao tipo de fornecimento. Os registros devem demonstrar por que o fornecedor foi aceito.',
        blocos: [
          {
            tipo: 'paragrafo',
            ancora: 'qualificacao-1',
            destaque: null,
            texto: [
              t(
                'A Campisi pré-avalia e seleciona fornecedores com base na capacidade de atender aos requisitos especificados. O registro corporativo é o ',
              ),
              n('FO 8.4.1.1 — Qualificação de Fornecedores'),
              t(', separado por categoria.'),
            ],
          },
          {
            tipo: 'paragrafo',
            ancora: 'qualificacao-2',
            destaque: 'aviso',
            texto: [
              n('PSQ / SiMaC:'),
              t(' quando existir PSQ para o produto-alvo, é vedada a aquisição de produtos de fornecedores considerados '),
              n('não conformes'),
              t(
                ' no PSQ. A apresentação de um certificado isolado não deve ser usada para contornar essa vedação. Quando cabível, fornecedores conformes no PSQ podem ser dispensados da qualificação convencional prevista pelo SiAC.',
              ),
            ],
          },
          {
            tipo: 'tabela',
            ancora: 'qualificacao-3',
            colunas: ['Categoria', 'Critérios internos Campisi', 'Regra de decisão'],
            linhas: [
              {
                ancora: 'materiais',
                celulas: [
                  [n('Materiais controlados')],
                  so('Qualidade/PSQ-ECR · preço/condições · prazo'),
                  so('≥ 2 respostas favoráveis: qualificado; < 2: desqualificado para compra de material controlado.'),
                ],
              },
              {
                ancora: 'servicos',
                celulas: [
                  [n('Serviços')],
                  so('Documentação e requisitos de SST · EPI aplicável · condição comercial/técnica'),
                  so('≥ 2 favoráveis: qualificado; < 2: desqualificado.'),
                ],
              },
              {
                ancora: 'qualificacao-3-3',
                celulas: [
                  [n('Projetos / engenharia')],
                  so('Responsabilidade técnica · conhecimento/requisitos técnicos aplicáveis · prazo/preço'),
                  so('≥ 2 favoráveis: qualificado; < 2: desqualificado.'),
                ],
              },
              {
                ancora: 'locacao',
                celulas: [
                  [n('Locação')],
                  so('Contrato/documentação · condição/checklist do equipamento · disponibilidade/preço'),
                  so('≥ 2 favoráveis: qualificado; < 2: desqualificado.'),
                ],
              },
              {
                ancora: 'qualificacao-3-5',
                celulas: [
                  [n('Controle tecnológico')],
                  so('Enquadramento conforme critérios de laboratório do SiAC / ABNT NBR ISO/IEC 17025.'),
                  so('Aplicar os critérios específicos do item 6 deste procedimento.'),
                ],
              },
            ],
          },
          {
            tipo: 'paragrafo',
            ancora: 'qualificacao-4',
            destaque: 'miudo',
            texto: so(
              'Regra interna Campisi: as qualificações são revistas periodicamente, com requalificação anual quando definida pelo controle corporativo e obrigatoriamente nos casos em que o SiAC estabelece 12 meses.',
            ),
          },
        ],
      },
      {
        numero: 3,
        ancora: 'contratacao',
        titulo: 'Documento de compra ou contratação',
        selo: 'SiAC 8.4.3',
        ajuda:
          'O SiAC exige que os requisitos sejam suficientes antes de serem comunicados ao fornecedor. O formato do documento pode variar; o importante é deixar claro o que está sendo comprado ou contratado.',
        blocos: [
          {
            tipo: 'tabela',
            ancora: 'contratacao-1',
            colunas: ['Categoria', 'Como a Campisi formaliza', 'Conteúdo mínimo'],
            linhas: [
              {
                ancora: 'contratacao-1-1',
                celulas: [
                  so('Material controlado'),
                  [n('Ordem/documento de compra'), t(' conforme processo interno.')],
                  so('Descrição clara + especificações técnicas + requisitos da ECR aplicável.'),
                ],
              },
              {
                ancora: 'contratacao-1-2',
                celulas: [
                  so('Serviço de obra controlado'),
                  so('Contrato / pedido / instrumento equivalente.'),
                  so('Escopo e especificações técnicas do serviço.'),
                ],
              },
              {
                ancora: 'contratacao-1-3',
                celulas: [
                  so('Laboratório'),
                  so('Contrato / solicitação de ensaio.'),
                  so(
                    'Ensaio, norma, prazo, requisitos de acreditação quando aplicáveis, competências e equipamentos/calibração quando requeridos.',
                  ),
                ],
              },
              {
                ancora: 'projetos',
                celulas: [
                  so('Projeto / serviço especializado'),
                  so('Contrato ou documento formal de contratação.'),
                  so(
                    'Objeto, escopo, responsabilidades, especificações técnicas e, em habitação, atendimento às exigências aplicáveis da NBR 15575.',
                  ),
                ],
              },
              {
                ancora: 'contratacao-1-5',
                celulas: [
                  so('Locação de equipamento crítico'),
                  [
                    n('Contrato/documento de locação.'),
                    t(
                      ' Não é necessário criar uma OC apenas por ser locação, se o documento de contratação já cumprir o requisito.',
                    ),
                  ],
                  so('Equipamento, especificações, características operacionais, manutenção e responsabilidades técnicas aplicáveis.'),
                ],
              },
            ],
          },
        ],
      },
      {
        numero: 4,
        ancora: 'avaliacao',
        titulo: 'Recebimento e avaliação do fornecedor',
        selo: 'SiAC 8.4.1.2',
        ajuda:
          'A avaliação acontece depois do fornecimento. O registro pode ser digital, em NF, formulário, bot ou planilha, desde que seja rastreável e contenha os critérios definidos.',
        blocos: [
          {
            tipo: 'quadros',
            ancora: 'avaliacao-1',
            quadros: [
              {
                ancora: 'avaliacao-1-1',
                titulo: 'Materiais e locação',
                texto:
                  'Registrar fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR/contrato. O formulário digital ou bot é aceito quando o registro permanece rastreável.',
              },
              {
                ancora: 'avaliacao-1-2',
                titulo: 'Serviços, projetos e laboratórios',
                texto:
                  'Avaliar prazo, conformidade com escopo e normas aplicáveis, documentação técnica/responsabilidade e evidência de aceite ou tratativa.',
              },
            ],
          },
          {
            tipo: 'paragrafo',
            ancora: 'avaliacao-2',
            destaque: 'informacao',
            texto: [
              n('Regra operacional do controle digital:'),
              t(
                ' quando houver duas ou mais respostas “Não Conforme”, registrar a tratativa e comunicar o responsável definido pela Campisi. A abertura de RNC/FO 10.2 ocorre quando o desvio se enquadrar no processo de não conformidade da empresa; não deve ser gerada automaticamente apenas pelo número de respostas.',
              ),
            ],
          },
        ],
      },
      {
        numero: 5,
        ancora: 'laboratorios',
        titulo: 'Laboratórios de controle tecnológico',
        selo: 'SiAC 8.4.1.1 · Anexo 7',
        ajuda:
          'Laboratórios exigem verificação específica. A acreditação deve cobrir os ensaios contratados. Laboratórios fora das alíneas de acreditação/processo de acreditação exigem avaliação complementar conforme Anexo 7.',
        blocos: [
          { tipo: 'paragrafo', ancora: 'laboratorios-1', destaque: null, texto: so('Os critérios podem incluir:') },
          {
            tipo: 'lista',
            ancora: 'laboratorios-2',
            itens: [
              'laboratório acreditado pela CGCRE/INMETRO para os ensaios contratados;',
              'laboratório em processo de acreditação pela CGCRE/INMETRO;',
              'laboratório avaliado satisfatoriamente pela Campisi conforme requisitos do Anexo 7;',
              'instituição de pesquisa/ensino que comprove atendimento à ABNT NBR ISO/IEC 17025;',
              'empresa de controle tecnológico com SGQ ISO 9001 cujo escopo inclua os ensaios;',
              'outros laboratórios que comprovem atendimento à ABNT NBR ISO/IEC 17025.',
            ].map((texto, i) => ({ ancora: `laboratorios-2-${i + 1}`, texto })),
          },
          {
            tipo: 'paragrafo',
            ancora: 'laboratorios-3',
            destaque: 'aviso',
            texto: so(
              'Nos casos não enquadrados como acreditados ou em processo de acreditação, a Campisi deve avaliar instalações, competência/experiência da equipe e calibração dos equipamentos conforme o Anexo 7. Esses laboratórios devem ser requalificados a cada 12 meses. O avaliador deve possuir os registros de capacitação/experiência exigidos pelo SiAC.',
            ),
          },
        ],
      },
      {
        numero: 6,
        ancora: 'registros',
        titulo: 'Registros e evidências',
        selo: 'Informação documentada',
        ajuda:
          'O auditor deve conseguir seguir a trilha: fornecedor qualificado → requisito comunicado → fornecimento recebido → desempenho avaliado.',
        blocos: [
          {
            tipo: 'quadros',
            ancora: 'registros-1',
            quadros: [
              { ancora: 'registros-1-1', titulo: 'FO 8.4.1.1', texto: 'Qualificação de fornecedores' },
              { ancora: 'registros-1-2', titulo: 'ECRs', texto: 'Especificações de Compra e Recebimento' },
              {
                ancora: 'registros-1-3',
                titulo: 'Ordens / documentos de compra',
                texto: 'Materiais controlados e demais compras conforme processo',
              },
              { ancora: 'registros-1-4', titulo: 'Contratos', texto: 'Serviços, projetos, laboratórios e locações quando aplicável' },
              { ancora: 'registros-1-5', titulo: 'Avaliações', texto: 'NF, formulário digital, bot ou planilha rastreável' },
            ],
          },
        ],
      },
      {
        numero: 7,
        ancora: 'revisoes',
        titulo: 'Histórico e controle de revisão',
        selo: 'Controle documental',
        ajuda: 'Somente revisões formalmente salvas entram neste quadro. O autosave do navegador é apenas rascunho.',
        blocos: [
          { tipo: 'historico', ancora: 'revisoes-1' },
          {
            tipo: 'paragrafo',
            ancora: 'revisoes-2',
            destaque: 'informacao',
            texto: [
              n('Conteúdo preparado para a próxima revisão formal:'),
              t(
                ' migração para o padrão HTML oficial, consolidação do fluxo de aquisição e correções de interpretação do SiAC 8.4.',
              ),
            ],
          },
        ],
      },
    ],
    rodape: {
      titulo: 'Campisi Engenharia Ltda.',
      texto: 'Sistema de Gestão da Qualidade · PBQP-H SiAC Nível A',
    },
    revisoes: [
      {
        revisao: '00',
        data: '2026-08-31',
        descricao: 'Emissão inicial.',
        revisado_por: 'Revisor de teste',
        aprovado_por: 'Aprovador de teste',
      },
    ],
  };
}
