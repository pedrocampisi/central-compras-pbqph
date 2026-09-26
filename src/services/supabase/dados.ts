/**
 * Leitura e gravação dos dados no Supabase.
 *
 * Substitui services/storage/fileSystem.ts mantendo o MESMO formato em memória
 * (`Data`). Isso é deliberado: todo o `domain/` e toda a interface continuam
 * funcionando sem alteração, e os 68 testes existentes seguem valendo, porque
 * eles testam o domínio — que não muda. A troca é só de onde os dados vêm.
 *
 * O que some com essa troca:
 *   - o Ctrl+S manual (o arquivo só era gravado quando alguém mandava)
 *   - o "último a salvar vence" entre dois aparelhos
 *   - a trava em Chrome/Edge (a File System Access API não existe em Safari
 *     nem no celular)
 *
 * Nota sobre a gravação: `salvarDados` regrava o conjunto inteiro por upsert.
 * Na escala real (33 fornecedores, 20 ECRs, poucas OCs) isso custa pouco e
 * mantém exatamente o mesmo contrato de chamada que o app já usa. Trocar por
 * gravação incremental é otimização possível depois, não pré-requisito.
 */

import type {
  AvaliacaoPrestador, Data, Ecr, Fornecedor, Item, Obra,
  OrdemCompra, PrestadorServico,
} from '../../domain/types';
import { CURRENT_SCHEMA_VERSION } from '../../domain/constants';
import { core, compras, supabase } from './client';
import { traduzirErroDoBanco } from './erros';
import {
  bandeirasResolvidas, cabecalhoDaOc, classificacaoDoCadastroNovo, destinatarioDaLinhaDaObra,
  ehFornecedorNovo, fotografiaDaLinhaDaOc, linhaDoFornecedor, paraEndereco, raizDoDocumento,
} from './linhas';

// ---------------------------------------------------------------------------
// Conversões entre o formato do banco (colunas planas) e o do app (objetos)
// ---------------------------------------------------------------------------

const vazio = (v: unknown): string => (v == null ? '' : String(v));

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

export async function carregarDados(): Promise<Data> {
  const [forn, fornResolvido, obras, ecrs, ocs, cfgNum, prest, avals, fornEcrs] = await Promise.all([
    core().from('fornecedores').select('*').order('razao_social'),
    // Material e serviço RESOLVIDOS (a filial, ou a mãe quando a filial está em
    // branco): é por eles que a lista da OC filtra desde a CTO-D519. O resto
    // do cadastro (endereço, telefones) continua vindo da filial, acima.
    core().from('fornecedor_resolvido').select('id, fornece_material, presta_servico, empresa_apelido'),
    // "Obra" na tela é a INTERVENÇÃO: é o serviço que consome material. O
    // imóvel vem junto porque é dele que saem endereço e responsável; o
    // destinatário da nota (empresa OU cliente, trava do banco) vem junto
    // porque é dele que a OC fatura — a OC não escolhe, lê (CTO-D390).
    core()
      .from('intervencoes')
      .select(
        'id, descricao_curta, ativa, pasta_caminho, criado_em, atualizado_em, imovel:imoveis(*), ' +
        'nf_empresa:empresas!intervencoes_nf_empresa_id_fkey(razao_social, cnpj, logradouro, numero, complemento, bairro, cidade, uf, cep), ' +
        'nf_cliente:clientes!intervencoes_nf_cliente_id_fkey(nome, documento, tipo_pessoa, logradouro, numero, complemento, bairro, cidade, uf, cep)',
      )
      .order('descricao_curta'),
    compras().from('ecrs').select('*, materiais(*)').order('id'),
    compras().from('ordens_compra').select('*, itens:oc_itens(*)').order('ano').order('sequencial'),
    compras().from('numeracao').select('ano, ultimo_sequencial'),
    compras().from('prestadores_servico').select('*').order('razao_social'),
    compras().from('avaliacoes_prestadores').select('*').order('data_avaliacao'),
    // Quais ECRs cada fornecedor atende. Tabela própria desde 17/08 — até
    // então a tela deixava marcar e a marcação sumia no reload.
    compras().from('fornecedor_ecrs').select('fornecedor_id, ecr_id'),
  ]);

  for (const r of [forn, fornResolvido, obras, ecrs, ocs, cfgNum, prest, avals, fornEcrs]) {
    if (r.error) throw new Error(`Falha ao carregar dados: ${r.error.message}`);
  }

  // ECRs agrupados por fornecedor, para o mapeador não varrer a lista inteira
  // a cada fornecedor.
  const ecrsPorFornecedor = new Map<string, number[]>();
  for (const l of (fornEcrs.data ?? []) as Record<string, unknown>[]) {
    const id = String(l['fornecedor_id']);
    const lista = ecrsPorFornecedor.get(id) ?? [];
    lista.push(Number(l['ecr_id']));
    ecrsPorFornecedor.set(id, lista);
  }

  const resolvidoPorId = new Map<string, Record<string, unknown>>();
  for (const l of (fornResolvido.data ?? []) as Record<string, unknown>[]) {
    resolvidoPorId.set(String(l['id']), l);
  }

  const anoCorrente = new Date().getFullYear();
  const numeracaoAno = (cfgNum.data ?? []).find((n: Record<string, number>) => n['ano'] === anoCorrente);

  return {
    schema_version: CURRENT_SCHEMA_VERSION,
    version: 1,
    app_name: 'Central de Compras PBQP-H',
    shared_file_name: '',
    seeded_at: '',
    last_saved: new Date().toISOString(),
    config: {
      // `compras.emitentes` não é mais lida (CTO-D390, 15/09/2026): o
      // destinatário da nota vem da obra. A lista fica vazia até o banco
      // aposentar a mesa e o campo sair do formato de dados.
      emitentes: [],
      endereco_cobranca: paraEndereco({}),
      ultimo_numero_oc: numeracaoAno?.['ultimo_sequencial'] ?? 0,
      ano_corrente: anoCorrente,
      condicoes_pagamento: ['À vista', '7 dias', '14 dias', '21 dias', '28 dias', '30 dias'],
      texto_condicoes_contratacao: '',
      texto_envio_nf: '',
      texto_qualidade: '',
      // A chave da IA não existe mais no formato de dados: passou para o servidor.
      pasta_backups: '',
    },
    fornecedores: (forn.data ?? []).map((l) =>
      paraFornecedor(l, ecrsPorFornecedor.get(String(l['id'])) ?? [], resolvidoPorId),
    ),
    // O `as`: o leitor de tipos do cliente não entende a dica de chave
    // estrangeira (`empresas!intervencoes_nf_empresa_id_fkey`) e devolve um
    // tipo de erro em vez de linhas. A consulta é a mesma; só o tipo é dito.
    obras: ((obras.data ?? []) as unknown as Record<string, unknown>[]).map(paraObra),
    ecrs: (ecrs.data ?? []).map(paraEcr),
    ordens_compra: (ocs.data ?? []).map(paraOc),
    prestadores_servico: (prest.data ?? []).map(paraPrestador),
    avaliacoes_prestadores: (avals.data ?? []).map(paraAvaliacao),
  };
}

function paraFornecedor(
  l: Record<string, unknown>,
  ecrsAtende: number[] = [],
  resolvidoPorId: ReadonlyMap<string, Record<string, unknown>> = new Map(),
): Fornecedor {
  return {
    id: String(l['id']),
    razao_social: vazio(l['razao_social']),
    nome_fantasia: vazio(l['nome_fantasia']),
    cnpj: vazio(l['documento']),
    ie: vazio(l['inscricao_estadual']),
    endereco: paraEndereco(l),
    telefones: [(l['telefones'] as string[])?.[0] ?? '', (l['telefones'] as string[])?.[1] ?? ''],
    email: vazio(l['email']),
    contato_responsavel: vazio(l['contato_responsavel']),
    ecrs_atende: [...ecrsAtende].sort((a, b) => a - b),
    observacoes: vazio(l['observacoes']),
    ativo: l['ativo'] !== false,
    // Os RESOLVIDOS, não os crus da filial (CTO-D519). `null` vira `undefined`:
    // "não disse" e "disse que não" são coisas diferentes, e a lista da OC só
    // aceita `true`.
    ...bandeirasResolvidas(l, resolvidoPorId),
    // O apelido da empresa, só para a pesquisa achar pelo nome do Pedro (D541).
    empresa_apelido: vazio(resolvidoPorId.get(String(l['id']))?.['empresa_apelido']) || undefined,
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
  };
}

function paraObra(l: Record<string, unknown>): Obra {
  const im = (l['imovel'] ?? {}) as Record<string, unknown>;
  return {
    id: String(l['id']),                       // id da INTERVENÇÃO
    nome: vazio(l['descricao_curta']) || vazio(im['nome_referencia']),
    cei: vazio(im['cadastro_imobiliario']),
    endereco: paraEndereco(im),
    destinatario: destinatarioDaLinhaDaObra(l),
    telefone: vazio(im['proprietario_telefone']),
    responsavel: vazio(im['conferido_por']),
    observacoes: vazio(im['observacoes']),
    ativa: l['ativa'] !== false,
    pasta_oc_path: vazio(l['pasta_caminho']),
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
  };
}

function paraEcr(l: Record<string, unknown>): Ecr {
  return {
    id: Number(l['id']),
    codigo: vazio(l['codigo']),
    nome: vazio(l['nome']),
    categoria: vazio(l['categoria']),
    objetivo: vazio(l['objetivo']),
    escopo: vazio(l['escopo']),
    normas: (l['normas'] as Ecr['normas']) ?? [],
    unidades_padrao: (l['unidades_padrao'] as string[]) ?? [],
    documentos_obrigatorios: (l['documentos_obrigatorios'] as Ecr['documentos_obrigatorios']) ?? [],
    criterios_recebimento: (l['criterios_recebimento'] as Ecr['criterios_recebimento']) ?? [],
    ensaios: (l['ensaios'] as Ecr['ensaios']) ?? [],
    amostragem: vazio(l['amostragem']),
    registros: (l['registros'] as string[]) ?? [],
    responsabilidades: vazio(l['responsabilidades']),
    observacoes: vazio(l['observacoes']),
    materiais: ((l['materiais'] as Record<string, unknown>[]) ?? []).map((m) => ({
      id: String(m['id']),
      descricao: vazio(m['descricao']),
      unidade_padrao: vazio(m['unidade_padrao']),
    })),
  };
}

function paraOc(l: Record<string, unknown>): OrdemCompra {
  const itens = ((l['itens'] as Record<string, unknown>[]) ?? [])
    .sort((a, b) => Number(a['posicao']) - Number(b['posicao']))
    .map<Item>((i) => ({
      id: String(i['id']),
      ecr_id: i['ecr_id'] == null ? null : Number(i['ecr_id']),
      material_id: vazio(i['material_id']),
      descricao: vazio(i['descricao']),
      observacao: vazio(i['observacao']),
      quantidade: Number(i['quantidade']) || 0,
      unidade: vazio(i['unidade']),
      preco_unit: Number(i['preco_unit']) || 0,
      ipi_pct: Number(i['ipi_pct']) || 0,
      desc_pct: Number(i['desc_pct']) || 0,
      prazo_entrega: vazio(i['prazo_entrega']),
    }));

  return {
    id: String(l['id']),
    numero: vazio(l['numero']),
    sequencial: Number(l['sequencial']),
    ano: Number(l['ano']),
    data: vazio(l['data']),
    status: (l['status'] as OrdemCompra['status']) ?? 'rascunho',
    fornecedor_id: vazio(l['fornecedor_id']),
    obra_id: vazio(l['intervencao_id']),
    condicao_pagamento: vazio(l['condicao_pagamento']),
    emitente_id: vazio(l['emitente_id']),
    destinatario: fotografiaDaLinhaDaOc(l),
    itens,
    frete: Number(l['frete']) || 0,
    outras_despesas: Number(l['outras_despesas']) || 0,
    desconto_material: Number(l['desconto_material']) || 0,
    observacoes: vazio(l['observacoes']),
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
    pdf_gerado_em: vazio(l['pdf_gerado_em']),
    versao: Number(l['versao']) || 0,
  };
}

function paraPrestador(l: Record<string, unknown>): PrestadorServico {
  const tels = (l['telefones'] as string[]) ?? [];
  return {
    id: String(l['id']),
    razao_social: vazio(l['razao_social']),
    nome_fantasia: vazio(l['nome_fantasia']),
    tipo: (l['tipo'] as PrestadorServico['tipo']) ?? 'PJ',
    cnpj_cpf: vazio(l['documento']),
    categoria_servico: vazio(l['categoria_servico']),
    endereco: paraEndereco(l),
    telefones: [tels[0] ?? '', tels[1] ?? ''],
    email: vazio(l['email']),
    contato_responsavel: vazio(l['contato_responsavel']),
    observacoes: vazio(l['observacoes']),
    ativo: l['ativo'] !== false,
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
  };
}

function paraAvaliacao(l: Record<string, unknown>): AvaliacaoPrestador {
  return {
    id: String(l['id']),
    prestador_id: vazio(l['prestador_id']),
    // Mesma tradução usada nas OCs: "obra" na tela é a intervenção no banco.
    obra_id: vazio(l['intervencao_id']),
    data_avaliacao: vazio(l['data_avaliacao']),
    responsavel: vazio(l['responsavel']),
    atendeu_prazo: (l['atendeu_prazo'] as AvaliacaoPrestador['atendeu_prazo']) ?? null,
    usou_epi: (l['usou_epi'] as AvaliacaoPrestador['usou_epi']) ?? null,
    conforme_pes: (l['conforme_pes'] as AvaliacaoPrestador['conforme_pes']) ?? null,
    observacoes: vazio(l['observacoes']),
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
  };
}

// ---------------------------------------------------------------------------
// Numeração de OC
// ---------------------------------------------------------------------------
//
// Não existe função de reservar número aqui, e é de propósito: desde 18/08/2026
// quem numera é o banco, dentro de `salvar_oc` e de `definir_status_oc`, e só
// na EMISSÃO. Uma chamada avulsa daqui gastaria um número do PBQP-H sem
// documento — que é exatamente o defeito que essa mudança fechou.
//
// Se um dia alguma tela precisar MOSTRAR o próximo número sem gastá-lo, a
// função é `compras.espiar_proximo_numero_oc` (não escreve nada).

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------

export async function salvarFornecedor(f: Fornecedor): Promise<string> {
  const materialDaFilial = ehFornecedorNovo(f) ? await ensinarAMae(f) : true;
  const { data, error } = await core().from('fornecedores').upsert(linhaDoFornecedor(f, materialDaFilial))
    .select('id')
    .single();
  if (error) {
    // Trava conhecida vira frase de gente e substitui a mensagem inteira; o
    // resto continua subindo cru, que é onde a mensagem técnica ajuda.
    const traduzida = traduzirErroDoBanco(error.message);
    throw new Error(
      traduzida === error.message ? `Falha ao gravar fornecedor: ${error.message}` : traduzida,
    );
  }

  const id = String((data as Record<string, unknown>)['id']);
  await salvarEcrsDoFornecedor(id, f.ecrs_atende ?? []);
  return id;
}

/**
 * Cadastro NOVO: se a empresa-mãe (`core.empresa_raiz`) ainda não sabe se
 * vende material, ela aprende agora, e a filial fica em branco (CTO-D519, E4
 * — a regra de `classificacaoDoCadastroNovo`). Devolve o que vai na filial.
 *
 * Mãe antes de filial, de propósito: se a filial falhar depois, a mãe ficou
 * sabendo uma coisa que uma pessoa disse e que é verdade; na ordem inversa, a
 * filial nasceria em branco com a mãe sem saber — invisível para a OC.
 *
 * Raiz que o banco não conhece: a filial não entra (a chave estrangeira de
 * 26/08 recusa), e a empresa nasce com apelido dado por gente, na aprovação
 * — não por esta tela.
 */
async function ensinarAMae(f: Fornecedor): Promise<true | null> {
  const raiz = raizDoDocumento(f.cnpj);
  let mae: boolean | null | undefined;
  if (raiz) {
    const { data, error } = await core()
      .from('empresa_raiz')
      .select('fornece_material')
      .eq('raiz', raiz)
      .maybeSingle();
    if (error) throw new Error(`Falha ao ler a empresa do fornecedor: ${error.message}`);
    const linha = data as Record<string, unknown> | null;
    mae = linha ? (typeof linha['fornece_material'] === 'boolean' ? linha['fornece_material'] : null) : undefined;
  }

  const decisao = classificacaoDoCadastroNovo(mae);
  if (decisao.ensinarMae && raiz) {
    // `.is(null)`: só escreve se continua em branco — nunca sobre o que alguém disse.
    const { error } = await core()
      .from('empresa_raiz')
      .update({ fornece_material: true })
      .eq('raiz', raiz)
      .is('fornece_material', null);
    if (error) throw new Error(`Falha ao gravar a classificação da empresa: ${error.message}`);
  }
  return decisao.materialDaFilial;
}

/**
 * Sincroniza quais ECRs o fornecedor atende.
 *
 * Grava a diferença — insere só o que foi marcado, apaga só o que foi
 * desmarcado — em vez de apagar tudo e reinserir. Apagar-e-reinserir abriria a
 * janela em que uma falha no meio deixa o fornecedor sem nenhum ECR, que é
 * exatamente o defeito que o banco acabou de fechar do lado das OCs.
 */
async function salvarEcrsDoFornecedor(fornecedorId: string, desejados: number[]): Promise<void> {
  const { data, error } = await compras()
    .from('fornecedor_ecrs')
    .select('ecr_id')
    .eq('fornecedor_id', fornecedorId);
  if (error) throw new Error(`Falha ao ler os ECRs do fornecedor: ${error.message}`);

  const atuais = new Set(((data ?? []) as Record<string, unknown>[]).map((l) => Number(l['ecr_id'])));
  const alvo = new Set(desejados);
  const inserir = [...alvo].filter((id) => !atuais.has(id));
  const remover = [...atuais].filter((id) => !alvo.has(id));

  if (inserir.length) {
    const { error: erroIns } = await compras()
      .from('fornecedor_ecrs')
      .insert(inserir.map((ecr_id) => ({ fornecedor_id: fornecedorId, ecr_id })));
    if (erroIns) throw new Error(`Falha ao gravar os ECRs do fornecedor: ${erroIns.message}`);
  }
  if (remover.length) {
    const { error: erroDel } = await compras()
      .from('fornecedor_ecrs')
      .delete()
      .eq('fornecedor_id', fornecedorId)
      .in('ecr_id', remover);
    if (erroDel) throw new Error(`Falha ao remover os ECRs do fornecedor: ${erroDel.message}`);
  }
}

/** Estado da OC como o banco devolveu depois de gravar. */
export interface OcGravada {
  id: string;
  numero: string;
  ano: number;
  sequencial: number;
  status: OrdemCompra['status'];
  versao: number;
  pdf_gerado_em: string;
}

/** Erro de gravação concorrente: outra pessoa salvou esta OC antes de você. */
export class ConflitoDeVersao extends Error {}

function paraOcGravada(linha: Record<string, unknown>): OcGravada {
  return {
    id: String(linha['id']),
    numero: vazio(linha['numero']),
    ano: Number(linha['ano']) || 0,
    sequencial: Number(linha['sequencial']) || 0,
    status: (linha['status'] as OrdemCompra['status']) ?? 'rascunho',
    versao: Number(linha['versao']) || 0,
    pdf_gerado_em: vazio(linha['pdf_gerado_em']),
  };
}

/**
 * Grava a ordem de compra INTEIRA numa operação só (`compras.salvar_oc`).
 *
 * Antes eram três requisições sem transação comum — cabeçalho, apagar itens,
 * inserir itens — e uma falha no meio deixava OC numerada sem item nenhum.
 * Era o achado P0 da perícia. Agora quem garante é o Postgres: se qualquer
 * linha falhar, o banco desfaz tudo sozinho.
 *
 * `requestId` é a identidade da TENTATIVA, não da OC. Repetir o mesmo devolve
 * a mesma OC, sem criar outra e sem gastar outro número — é o que protege do
 * clique duplo e do "tentar de novo". Gere um por tentativa de salvamento e
 * **reaproveite no retry**.
 *
 * O número não nasce aqui quando é rascunho: por decisão do Pedro (18/08) ele
 * só existe a partir da emissão.
 */
export async function salvarOrdemCompra(oc: OrdemCompra, requestId: string): Promise<OcGravada> {
  const ehNova = !oc.id || oc.id.startsWith('oc-');

  const payload: Record<string, unknown> = {
    request_id: requestId,
    // Os três casos de cada chave (ausente / valor / null) e a fotografia do
    // destinatário estão explicados em `cabecalhoDaOc` — que é testável sem banco.
    cabecalho: cabecalhoDaOc(oc),
    // Mandamos a lista SEMPRE: a tela edita os itens como um todo. Omitir a
    // chave significaria "não mexa nos itens", e lista vazia significa
    // "apague todos" — são pedidos diferentes no contrato do banco.
    itens: (oc.itens ?? []).map((i, idx) => ({
      posicao: idx + 1,
      ecr_id: i.ecr_id ?? null,
      material_id: i.material_id || null,
      descricao: i.descricao || 'Item sem descrição',
      observacao: i.observacao || null,
      quantidade: i.quantidade ?? 0,
      unidade: i.unidade || null,
      preco_unit: i.preco_unit ?? 0,
      ipi_pct: i.ipi_pct ?? 0,
      desc_pct: i.desc_pct ?? 0,
      prazo_entrega: i.prazo_entrega || null,
    })),
  };

  if (!ehNova) {
    payload['oc_id'] = oc.id;
    payload['versao'] = oc.versao;
  }

  const { data, error } = await compras().rpc('salvar_oc', { p: payload });
  if (error) {
    // 40001 = serialization_failure: o banco recusou porque a OC mudou desde
    // que esta tela a leu. A mensagem já vem pronta para o usuário.
    if (error.code === '40001') throw new ConflitoDeVersao(error.message);
    throw new Error(`Falha ao gravar a ordem de compra: ${error.message}`);
  }
  const linha = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  return paraOcGravada(linha);
}

/**
 * Muda só o status — sem tocar nos itens.
 *
 * Emitir reserva o número, se ainda não houver; emitir de novo, ou passar a
 * entregue, não gasta outro. Mandar a versão é opcional no banco, mas quem
 * manda ganha a proteção contra sobrescrever a mudança de outra pessoa.
 */
export async function definirStatusOc(
  ocId: string,
  status: OrdemCompra['status'],
  versao?: number,
): Promise<OcGravada> {
  const { data, error } = await compras().rpc('definir_status_oc', {
    p_oc_id: ocId,
    p_status: status,
    p_versao: versao ?? null,
  });
  if (error) {
    if (error.code === '40001') throw new ConflitoDeVersao(error.message);
    throw new Error(`Falha ao alterar o status: ${error.message}`);
  }
  const linha = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  return paraOcGravada(linha);
}

/**
 * Carimba a data de geração do PDF. Não mexe na versão de propósito: gerar
 * PDF não muda conteúdo, e subir a versão invalidaria a tela de quem estiver
 * editando — alarme falso.
 */
export async function marcarPdfGerado(ocId: string): Promise<string> {
  const { data, error } = await compras().rpc('marcar_pdf_gerado', { p_oc_id: ocId });
  if (error) throw new Error(`Falha ao registrar a geração do PDF: ${error.message}`);
  return vazio(data);
}

/** Totais calculados pelo banco — a mesma conta para tela, PDF e relatório. */
export async function totaisDaOc(ocId: string) {
  const { data, error } = await compras()
    .from('oc_totais')
    .select('*')
    .eq('oc_id', ocId)
    .single();
  if (error) throw new Error(`Falha ao ler totais: ${error.message}`);
  return data;
}

export function assinarMudancas(aoMudar: () => void): () => void {
  const canal = supabase
    .channel('compras-mudancas')
    .on('postgres_changes', { event: '*', schema: 'compras', table: 'ordens_compra' }, aoMudar)
    .on('postgres_changes', { event: '*', schema: 'core', table: 'fornecedores' }, aoMudar)
    .subscribe();
  return () => void supabase.removeChannel(canal);
}
