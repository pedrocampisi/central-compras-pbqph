"""O rascunho da Rev. 01 do PS.02 (CTO-D730 §4, D738): o procedimento como manual do sistema de compras.

Parte do `documento` da Rev. 00 como o Banco o guarda (o dado de teste com a digital do banco,
`tests/fixtures/ps02Rev00DoBanco.json`) e aplica as mudanças declaradas abaixo, uma a uma. Cada mudança
confere o texto de antes (se o de antes não bate, o programa para), e diz o depois, o motivo, o que
acontece com o SiAC e se é escolha do Pedro.

Escreve dois arquivos em `docs/Rev01_PS02/`:
  - `documento_rev01_rascunho.json`: o `documento` na forma do contrato, para a porta de revisar;
  - `MUDANCAS_REV01.md`: o arquivo de leitura, para o CTO e para o Pedro.

Nada aqui fala com o banco. O HTML do Dropbox não é lido nem tocado.
Rodar: python scripts/rascunho-rev01-ps02.py
"""
import copy
import io
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REV00 = os.path.join(RAIZ, 'tests', 'fixtures', 'ps02Rev00DoBanco.json')
SAIDA = os.path.join(RAIZ, 'docs', 'Rev01_PS02')

# As 11 âncoras que o próprio documento tem: a porta recusa revisão que tire uma delas.
DO_DOCUMENTO = ['objetivo', 'qualificacao', 'contratacao', 'avaliacao', 'laboratorios', 'registros', 'revisoes',
                'materiais', 'servicos', 'locacao', 'projetos']


def rico(s):
    """'**negrito** normal' → a lista de {texto, negrito} do contrato."""
    out = []
    for i, parte in enumerate(re.split(r'\*\*', s)):
        if parte:
            out.append({'texto': parte, 'negrito': i % 2 == 1})
    return out


def simples(v):
    return v if isinstance(v, str) else ''.join(t['texto'] for t in v)


def marcado(v):
    """O texto rico com o negrito marcado por **, para o arquivo de leitura."""
    if isinstance(v, str):
        return v
    return ''.join(f"**{t['texto']}**" if t['negrito'] else t['texto'] for t in v)


def acha(no, ancora):
    if isinstance(no, dict):
        if no.get('ancora') == ancora:
            return no
        for v in no.values():
            r = acha(v, ancora)
            if r is not None:
                return r
    elif isinstance(no, list):
        for v in no:
            r = acha(v, ancora)
            if r is not None:
                return r
    return None


# ── As marcas ──────────────────────────────────────────────────────────────────
MANTIDO = 'mantido'          # nenhum requisito do SiAC sai
VERMELHO = 'VERMELHO'        # um requisito do SiAC sai ou se estreita: vai ao Pedro
SIAC = {MANTIDO: 'Nenhum requisito sai.', VERMELHO: '🟥 **Um requisito do SiAC sai ou se estreita.**'}

# Cada mudança: (id, item, âncora, campo, antes, depois, motivo, siac, escolha)
#   campo: 'texto' (texto rico), 'texto_simples', 'titulo', 'etiqueta', 'ajuda', ('celula', n), 'endereco',
#          'novo_bloco_depois' / 'novo_item' (o depois é o bloco ou item inteiro)
#   escolha: None, ou a pergunta ao Pedro (com as opções)
MUDANCAS = [
    # ── O cabeçalho e o "Como usar" ──
    ('M01', 'Cabeçalho', 'cabecalho.revisao', 'etiqueta',
     'Emissão inicial formal', 'Manual do sistema de compras',
     'A Rev. 01 passa a descrever cada passo na tela do sistema em que ele é feito (D730 §4.1).', MANTIDO, None),
    ('M02', 'Como usar', 'como_usar', 'texto',
     'Como usar este procedimento: identifique primeiro o que está sendo adquirido. A categoria define como qualificar o fornecedor, qual documento de aquisição/contratação deve existir e como será feita a avaliação posterior.',
     '**Como usar este procedimento:** identifique primeiro **o que está sendo adquirido**. A categoria define como qualificar o fornecedor, qual documento de aquisição/contratação deve existir e como será feita a avaliação posterior. Cada passo diz também **em que tela do sistema de compras** ele é feito.',
     'Uma frase no fim: o procedimento passa a ser também o manual das telas.', MANTIDO, None),

    # ── O fluxo didático ──
    ('M03', 'Fluxo, cartão "Material controlado"', 'fluxo.c1', 'texto',
     'Qualificar → especificar pela ECR → emitir documento de compra → receber e avaliar.',
     'Qualificar na tela Qualificação → especificar pela ECR do Catálogo de ECRs → emitir a OC na Nova OC → receber pelo app do mestre e avaliar.',
     'O mesmo caminho, com a tela de cada passo.', MANTIDO, None),
    ('M04', 'Fluxo, cartão "Serviço de obra"', 'fluxo.c2', 'texto',
     'Qualificar → contratar com escopo técnico → acompanhar execução/PES → avaliar.',
     'Qualificar na tela Qualificação → contratar com escopo técnico → acompanhar execução/PES → avaliar.',
     'Só a qualificação de serviço está no sistema; contrato, PES e avaliação de serviço continuam fora dele.', MANTIDO, None),
    ('M05', 'Fluxo, cartão "Laboratório"', 'fluxo.c3', 'texto',
     'Verificar enquadramento/acreditação → contratar ensaio → conferir laudo e rastreabilidade.',
     'Verificar enquadramento/acreditação na tela Qualificação (Controle tecnológico) → contratar ensaio → conferir laudo e rastreabilidade.',
     'Só a qualificação do laboratório está no sistema.', MANTIDO, None),
    ('M06', 'Fluxo, cartão "Projeto / engenharia"', 'fluxo.c4', 'texto',
     'Qualificar → contrato com objeto, escopo e responsabilidades → avaliar entrega técnica.',
     'Qualificar na tela Qualificação → contrato com objeto, escopo e responsabilidades → avaliar entrega técnica.',
     'Só a qualificação está no sistema.', MANTIDO, None),
    ('M07', 'Fluxo, cartão "Locação de equipamento"', 'fluxo.c5', 'texto',
     'Qualificar → contrato/documento de locação claro → conferir equipamento e avaliar.',
     'Qualificar na tela Qualificação → contrato/documento de locação claro → conferir equipamento e avaliar.',
     'Só a qualificação está no sistema.', MANTIDO, None),
    ('M08', 'Fluxo, passo "3 · Qualificação"', 'fluxo.s3', 'texto',
     'Registrar no FO 8.4.1.1 ou controle aplicável.',
     'Registrar na tela Qualificação (a FO 8.4.1.1 no sistema).',
     'A FO 8.4.1.1 virou a tela Qualificação (D730 §4.2).', MANTIDO, None),
    ('M09', 'Fluxo, passo "4 · Contratação"', 'fluxo.s4', 'texto',
     'Comunicar requisitos suficientes ao fornecedor.',
     'Comunicar requisitos suficientes ao fornecedor. Material: a OC da Nova OC, com a ECR de cada item.',
     'A tela de cada passo, para material.', MANTIDO, None),
    ('M10', 'Fluxo, passo "5 · Recebimento"', 'fluxo.s5', 'texto',
     'Conferir o que foi entregue/executado.',
     'Conferir o que foi entregue/executado. Material: o mestre registra no app do mestre.',
     'O recebimento de material virou o app do mestre (D730 §4.2).', MANTIDO, None),
    ('M11', 'Fluxo, passo "6 · Avaliação"', 'fluxo.s6', 'texto',
     'Registrar desempenho e tratar desvios.',
     'Registrar desempenho e tratar desvios. Material: a avaliação da OC; a tratativa fica no Dashboard até a ciência.',
     'A avaliação e a tratativa no sistema.', MANTIDO, None),

    # ── 1. Objetivo e responsabilidades ──
    ('M12', '1, quadro "Diretoria"', 'objetivo.q1.i1', 'texto',
     'Assegura recursos e diretrizes do processo de aquisição.',
     'Assegura recursos e diretrizes do processo de aquisição. No sistema, revisa as ECRs e este procedimento, e dá ciência nas tratativas.',
     'No sistema, revisar ECR, revisar o procedimento e dar ciência na tratativa são de uma pessoa só, a mesma (a regra da D589).',
     MANTIDO,
     'Quem revisa as ECRs e o procedimento e dá ciência nas tratativas é a Diretoria? (a) Sim, como está. (b) Outro papel: diga qual.'),
    ('M13', '1, quadro "Administrativo / Compras"', 'objetivo.q1.i2', 'texto',
     'Realiza cotações, compras, formalizações e organização dos registros financeiros/documentais.',
     'Realiza cotações, compras, formalizações e organização dos registros financeiros/documentais. No sistema, emite as OCs na Nova OC, registra as entregas no Histórico e resolve o que chegou sem pedido, na tela Recebimentos.',
     'As telas de quem compra.', MANTIDO, None),
    ('M14', '1, quadro "Obra / Engenharia"', 'objetivo.q1.i3', 'texto',
     'Levanta quantitativos, solicita compras, define requisitos técnicos, recebe, armazena, identifica e apoia a avaliação.',
     'Levanta quantitativos, solicita compras, define requisitos técnicos, recebe, armazena, identifica e apoia a avaliação. No sistema, a engenharia cadastra o mestre de obra, põe na obra e gera o QR de entrada dele, na tela Mestres.',
     'A tela Mestres é da engenharia (e do administrador).', MANTIDO, None),
    ('M15', '1, quadro novo "Mestre de obra"', 'objetivo.q1', 'novo_item',
     None,
     {'ancora': 'objetivo.q1.i4', 'titulo': 'Mestre de obra',
      'texto': rico('Recebe o material na obra pelo app do mestre: diz se chegou no dia combinado, sem estrago, o que foi pedido e se chegou tudo, com a foto ou o número da nota.')},
     'O mestre passou a receber pelo sistema (o app do mestre, D693 e D696). O papel não estava no PS.02.', MANTIDO, None),

    # ── 2. Qualificação ──
    ('M16', '2, primeiro parágrafo', 'qualificacao.p1', 'texto',
     'A Campisi pré-avalia e seleciona fornecedores com base na capacidade de atender aos requisitos especificados. O registro corporativo é o FO 8.4.1.1 — Qualificação de Fornecedores, separado por categoria.',
     'A Campisi pré-avalia e seleciona fornecedores com base na capacidade de atender aos requisitos especificados. O registro corporativo é a **tela Qualificação** do sistema de compras — a **FO 8.4.1.1 — Qualificação de Fornecedores** —, separada por categoria, uma aba para cada. A qualificação é da empresa e vale para todas as filiais dela.',
     'A FO 8.4.1.1 virou a tela Qualificação (D730 §4.2). No sistema, a qualificação é da empresa, não da filial.', MANTIDO, None),
    ('M17', '2, tabela, linha "Materiais controlados"', 'materiais', ('celula', 1),
     'Qualidade/PSQ-ECR · preço/condições · prazo',
     'Qualidade/PSQ-ECR · menor preço de mercado · prazo',
     'Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço de mercado".', MANTIDO,
     'Materiais, critério 2: (a) o PS.02 passa a dizer o que a tela pergunta, "menor preço de mercado"; (b) o PS.02 fica "preço/condições", e a pergunta da tela muda (carta ao Banco).'),
    ('M18', '2, tabela, linha "Serviços"', 'servicos', ('celula', 1),
     'Documentação e requisitos de SST · EPI aplicável · condição comercial/técnica',
     'Documentação e requisitos de SST · EPI aplicável · menor preço do mercado',
     'Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço do mercado".', MANTIDO,
     'Serviços, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "condição comercial/técnica", e a pergunta muda.'),
    ('M19', '2, tabela, linha "Projetos / engenharia"', 'qualificacao.t1.l3', ('celula', 1),
     'Responsabilidade técnica · conhecimento/requisitos técnicos aplicáveis · prazo/preço',
     'Responsabilidade técnica · conhecimento da ABNT NBR 15575 · menor preço do mercado',
     'Duas das 5 diferenças da D729: a tela pergunta "conhecimento da ABNT NBR 15575" e "menor preço do mercado".', MANTIDO,
     'Projetos, critérios 2 e 3: (a) como a tela, "conhecimento da ABNT NBR 15575" e "menor preço do mercado"; (b) ficam "conhecimento/requisitos técnicos aplicáveis" e "prazo/preço", e as perguntas mudam. Pode ser (a) num e (b) no outro.'),
    ('M20', '2, tabela, linha "Locação"', 'locacao', ('celula', 1),
     'Contrato/documentação · condição/checklist do equipamento · disponibilidade/preço',
     'Contrato/documentação · condição/checklist do equipamento · menor preço do mercado',
     'Uma das 5 diferenças da D729: a pergunta da tela diz "menor preço do mercado".', MANTIDO,
     'Locação, critério 3: (a) "menor preço do mercado", como a tela; (b) fica "disponibilidade/preço", e a pergunta muda.'),
    ('M21', '2, tabela, linha "Controle tecnológico"', 'qualificacao.t1.l5', ('celula', 2),
     'Aplicar os critérios específicos do item 6 deste procedimento.',
     '≥ 1 favorável: qualificado; nenhuma: desqualificado. Aplicar os critérios específicos do item 5 deste procedimento.',
     'O "item 6" era um engano: os laboratórios são o item 5 (D729, D732 §4). E o sistema qualifica o laboratório com uma das três respostas favorável (o mínimo do banco é 1); a Rev. 00 não dizia a regra de decisão desta linha.',
     MANTIDO,
     'Controle tecnológico: (a) a regra é "≥ 1 favorável", como o sistema já faz; (b) outra regra (diga qual), e o mínimo do banco muda.'),
    ('M22', '2, parágrafo novo: a trava da emissão', 'qualificacao.t1', 'novo_bloco_depois',
     None,
     {'tipo': 'paragrafo', 'ancora': 'qualificacao.p3', 'miudo': False,
      'texto': rico('**A trava da emissão:** a OC com material controlado (item com ECR) só é emitida se a empresa estiver qualificada em Materiais para aquelas ECRs, ou com a qualificação vencendo nos próximos 30 dias. Se não estiver, a Nova OC abre o "Qualificar agora", e a emissão segue se a qualificação for gravada com a nota no mínimo; abaixo dele, a empresa fica desqualificada e a OC não emite para ela.')},
     'A trava da emissão existe no sistema (D605) e não estava escrita no PS.02 (D730 §4.2).', MANTIDO, None),
    ('M23', '2, a regra interna (letra miúda)', 'qualificacao.p2', 'texto',
     'Regra interna Campisi: as qualificações são revistas periodicamente, com requalificação anual quando definida pelo controle corporativo e obrigatoriamente nos casos em que o SiAC estabelece 12 meses.',
     'Regra interna Campisi: toda qualificação vale 12 meses. A tela Qualificação mostra o vencimento e avisa 30 dias antes; a requalificação é feita na mesma tela, e a caixa de qualificar mostra as entregas avaliadas da empresa nos últimos 12 meses.',
     'No sistema, toda qualificação vence em 12 meses, em todas as categorias. Os 12 meses que o SiAC exige ficam cobertos, porque valem para todas.',
     MANTIDO, None),

    # ── 3. Documento de compra ou contratação ──
    ('M24', '3, tabela, linha "Material controlado", como formaliza', 'contratacao.t1.l1', ('celula', 1),
     'Ordem/documento de compra conforme processo interno.',
     '**Ordem de Compra** emitida na tela Nova OC. O número nasce na emissão, e o PDF é guardado na pasta da obra.',
     'A OC é emitida no sistema. O número vem do banco na emissão; o PDF vai à pasta da obra pelo servidor e, se ele falhar, pelo navegador.',
     MANTIDO, None),
    ('M25', '3, tabela, linha "Material controlado", conteúdo mínimo', 'contratacao.t1.l1', ('celula', 2),
     'Descrição clara + especificações técnicas + requisitos da ECR aplicável.',
     'Descrição clara + especificações técnicas + requisitos da ECR aplicável. Na OC, cada item leva a ECR dele.',
     'No sistema, a ECR é marcada por item da OC.', MANTIDO, None),

    # ── 4. Recebimento e avaliação ──
    ('M26', '4, quadro "Materiais e locação"', 'avaliacao.q1.i1', 'texto',
     'Registrar fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR/contrato. O formulário digital ou bot é aceito quando o registro permanece rastreável.',
     'Registrar fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR/contrato. O formulário digital ou bot é aceito quando o registro permanece rastreável. No sistema, para o que tem OC: o mestre de obra registra no app do mestre (chegou no dia combinado, sem estrago, o que foi pedido, chegou tudo, e a foto ou o número da nota), ou o escritório registra pelo "Entregue" do Histórico; as duas formas gravam a mesma avaliação. O que chegou sem OC vai para a tela Recebimentos, para ligar a uma OC ou descartar com o motivo.',
     'O recebimento virou o app do mestre e o "Entregue" com a avaliação (D730 §4.2). O texto de antes fica inteiro, para o que é recebido fora do sistema.',
     MANTIDO, None),
    ('M27', '4, a regra operacional (informação)', 'avaliacao.a1', 'texto',
     'Regra operacional do controle digital: quando houver duas ou mais respostas “Não Conforme”, registrar a tratativa e comunicar o responsável definido pela Campisi. A abertura de RNC/FO 10.2 ocorre quando o desvio se enquadrar no processo de não conformidade da empresa; não deve ser gerada automaticamente apenas pelo número de respostas.',
     '**Regra operacional do controle digital:** quando houver duas ou mais respostas “Não Conforme”, o sistema exige a tratativa por escrito e a mantém em "Tratativas abertas", no Dashboard, até o responsável pelas ECRs dar ciência. A abertura de RNC/FO 10.2 ocorre quando o desvio se enquadrar no processo de não conformidade da empresa; não deve ser gerada automaticamente apenas pelo número de respostas.',
     'O "comunicar o responsável" virou a tratativa aberta no Dashboard, com a ciência dele.', MANTIDO, None),

    # ── 6. Registros e evidências ──
    ('M28', '6, quadro "FO 8.4.1.1"', 'registros.q1.i1', 'texto',
     'Qualificação de fornecedores',
     'Qualificação de fornecedores: a tela Qualificação; para o auditor, o "PDF dos qualificados".',
     'A FO 8.4.1.1 virou a tela Qualificação, e a folha do auditor sai pelo botão dela.', MANTIDO, None),
    ('M29', '6, quadro "FO 8.4.1.1", o link da planilha', 'registros.q1.i1', 'endereco',
     '../08 - Execução de Obra/08.4 - Aquisição/FO 8.4.1.1 - Qualificação dos fornecedores.xlsx',
     None,
     'O link levava à planilha, que deixa de ser o registro. Na página do sistema ele já aparecia sem link (D732).',
     MANTIDO,
     'A planilha FO 8.4.1.1 deixa de ser o registro? (a) Sim: o link sai, e o registro é a tela. (b) Não: o link fica, e a planilha continua valendo junto.'),
    ('M30', '6, quadro "ECRs"', 'registros.q1.i2', 'texto',
     'Especificações de Compra e Recebimento',
     'Especificações de Compra e Recebimento: o Catálogo de ECRs, com o histórico de revisões e o PDF de cada uma.',
     'As ECRs viraram o Catálogo de ECRs (D588, D730 §4.2).', MANTIDO, None),
    ('M31', '6, quadro "Ordens / documentos de compra"', 'registros.q1.i3', 'texto',
     'Materiais controlados e demais compras conforme processo',
     'Materiais controlados e demais compras conforme processo: a tela Histórico, com o PDF de cada OC na pasta da obra.',
     'Onde a OC fica no sistema.', MANTIDO, None),
    ('M32', '6, quadro "Avaliações"', 'registros.q1.i5', 'texto',
     'NF, formulário digital, bot ou planilha rastreável',
     'As avaliações de cada OC, no sistema; para o auditor, o "PDF das avaliações" do Histórico. Fora do sistema: NF, formulário digital, bot ou planilha rastreável.',
     'Onde a avaliação fica no sistema. O texto de antes fica, para o que é avaliado fora dele.', MANTIDO, None),

    # ── 7. Histórico e controle de revisão ──
    ('M33', '7, o "?" do item', 'revisoes', 'ajuda',
     'Somente revisões formalmente salvas entram neste quadro. O autosave do navegador é apenas rascunho.',
     'Somente revisões gravadas no sistema entram neste quadro: no sistema, gravar a revisão é aprová-la. O rascunho não entra.',
     'O "autosave do navegador" era do HTML, e no sistema não existe (D732 §4).', MANTIDO, None),
    ('M34', '7, o quadro "Conteúdo preparado para a próxima revisão formal"', 'revisoes.a1', 'texto',
     'Conteúdo preparado para a próxima revisão formal: migração para o padrão HTML oficial, consolidação do fluxo de aquisição e correções de interpretação do SiAC 8.4.',
     '**Conteúdo desta revisão (Rev. 01):** o procedimento passa a dizer em que tela do sistema de compras cada passo é feito; o item 2 passa a remeter os laboratórios ao item 5; e a trava da emissão, o app do mestre e a tratativa no Dashboard entram no texto.',
     'O quadro descrevia a migração para o HTML, que a página já é (D732 §4).', MANTIDO, None),
]


def aplica(doc):
    novo = copy.deepcopy(doc)
    for (mid, item, ancora, campo, antes, depois, motivo, siac, escolha) in MUDANCAS:
        if ancora == 'cabecalho.revisao':
            alvo = next(c for c in novo['cabecalho'] if c.get('campo') == 'revisao')
        elif ancora == 'como_usar':
            assert simples(novo['como_usar']) == antes, mid
            novo['como_usar'] = rico(depois)
            continue
        else:
            # O sumário aponta para as seções com a mesma âncora: a busca não entra nele.
            alvo = acha({k: v for k, v in novo.items() if k != 'sumario'}, ancora)
        assert alvo is not None, f'{mid}: a âncora {ancora} não existe'
        if campo == 'novo_item':
            assert acha(novo, depois['ancora']) is None, mid
            alvo['itens'].append(depois)
        elif campo == 'novo_bloco_depois':
            assert acha(novo, depois['ancora']) is None, mid
            secao = next(s for s in novo['secoes'] if acha(s, ancora) is not None)
            i = next(k for k, b in enumerate(secao['blocos']) if b.get('ancora') == ancora)
            secao['blocos'].insert(i + 1, depois)
        elif isinstance(campo, tuple):
            celulas = alvo['celulas']
            assert simples(celulas[campo[1]]) == antes, f'{mid}: o antes não bate: {simples(celulas[campo[1]])!r}'
            celulas[campo[1]] = rico(depois)
        elif campo == 'endereco':
            assert alvo.get('endereco') == antes, mid
            del alvo['endereco']
        elif campo in ('etiqueta', 'ajuda', 'titulo'):
            assert alvo[campo] == antes, f'{mid}: o antes não bate: {alvo[campo]!r}'
            alvo[campo] = depois
        else:
            assert simples(alvo[campo]) == antes, f'{mid}: o antes não bate: {simples(alvo[campo])!r}'
            alvo[campo] = rico(depois)
    return novo


def ancoras(doc):
    out = []

    def anda(v):
        if isinstance(v, dict):
            for k, x in v.items():
                if k == 'ancora':
                    out.append(x)
                else:
                    anda(x)
        elif isinstance(v, list):
            for x in v:
                anda(x)
    anda({k: v for k, v in doc.items() if k != 'sumario'})
    return out


def confere(doc):
    a = ancoras(doc)
    assert len(a) == len(set(a)), 'âncora repetida'
    for x in DO_DOCUMENTO:
        assert x in a, f'falta a âncora do documento {x}'
    destinos = [c['destino'] for c in doc['fluxo']['cartoes']] + [i['ancora'] for i in doc['sumario']['itens']]
    for d in destinos:
        assert d in a, f'destino sem âncora: {d}'
    assert set(doc) == {'linha_de_cima', 'subtitulo', 'cabecalho', 'sumario', 'como_usar', 'fluxo', 'secoes', 'rodape'}
    return len(a)


def leitura(rev00, rev01, n_ancoras):
    escolhas = [m for m in MUDANCAS if m[8]]
    vermelhos = [m for m in MUDANCAS if m[7] == VERMELHO]
    L = []
    L += ['# PS.02 Rev. 01 — o rascunho, mudança por mudança', '',
          '> **Data:** 06/10/2026 (gerado por `scripts/rascunho-rev01-ps02.py`; não edite à mão)',
          '> **Estado:** PROPOSTA — aguardando o Pedro',
          '> **Escopo:** o que muda da Rev. 00 para a Rev. 01 do PS.02, com o motivo de cada mudança (CTO-D730 §4, D738). '
          '**NÃO** é o procedimento: o texto inteiro está em `documento_rev01_rascunho.json`, na forma que o banco guarda.',
          '', '---', '',
          '## Em uma olhada', '',
          f'- **{len(MUDANCAS)} mudanças.** Quase todas acrescentam a tela do sistema ao que o PS.02 já dizia.',
          f'- **Requisitos do SiAC que saem: {len(vermelhos)}.** '
          + ('Nenhum requisito da Rev. 00 sai nem se estreita. Cada mudança foi conferida uma a uma (coluna "SiAC").'
             if not vermelhos else 'Estão marcados em vermelho abaixo.'),
          f'- **Escolhas do Pedro: {len(escolhas)}.** Estão juntas na seção seguinte, cada uma com as opções.',
          '- **Nada inventado:** cada frase sobre o sistema foi medida no código ou no banco. O que o sistema não faz '
          '(contratos, PES, avaliação de serviço, projeto e laboratório, o PSQ), o texto não diz que ele faz.',
          '- **O que não muda:** o item 5 (laboratórios) inteiro, o aviso do PSQ/SiMaC, o escopo, a referência, o '
          'sumário e o rodapé.',
          f'- **A forma:** a do contrato do Banco. As 11 âncoras do documento continuam; são {n_ancoras} âncoras, '
          'nenhuma repetida, e todo cartão e item do sumário apontam para uma que existe.',
          '', '## As escolhas do Pedro', '']
    for m in escolhas:
        L += [f'- **{m[0]} — {m[1]}.** {m[8]}', f'  - No rascunho está a opção (a).']
    L += ['', '## Todas as mudanças', '']
    for (mid, item, ancora, campo, antes, depois, motivo, siac, escolha) in MUDANCAS:
        L += [f'### {mid} — {item}', '', f'- **Âncora:** `{ancora}`']
        if antes is None:
            L += ['- **Antes:** não existia.']
        else:
            L += [f'- **Antes:** {antes}']
        if depois is None:
            L += ['- **Depois:** sai.']
        elif isinstance(depois, dict):
            corpo = depois.get('texto')
            titulo = depois.get('titulo')
            L += [f'- **Depois (novo):** ' + (f'**{titulo}**: ' if titulo else '') + marcado(corpo)]
        else:
            L += [f'- **Depois:** {depois}']
        L += [f'- **Por quê:** {motivo}', f'- **SiAC:** {SIAC[siac]}']
        if escolha:
            L += [f'- **Escolha do Pedro:** {escolha}']
        L += ['']
    return '\n'.join(L).replace('\n', '\r\n')


def main():
    rev00 = json.load(io.open(REV00, encoding='utf-8'))
    rev01 = aplica(rev00)
    n = confere(rev01)
    assert rev01 != rev00
    os.makedirs(SAIDA, exist_ok=True)
    io.open(os.path.join(SAIDA, 'documento_rev01_rascunho.json'), 'w', encoding='utf-8', newline='\n').write(
        json.dumps(rev01, ensure_ascii=False, indent=2) + '\n')
    io.open(os.path.join(SAIDA, 'MUDANCAS_REV01.md'), 'w', encoding='utf-8', newline='').write(
        leitura(rev00, rev01, n) + '\r\n')
    print(f'{len(MUDANCAS)} mudanças; {n} âncoras; escolhas {sum(1 for m in MUDANCAS if m[8])}; '
          f'vermelhos {sum(1 for m in MUDANCAS if m[7] == VERMELHO)}')


if __name__ == '__main__':
    main()
