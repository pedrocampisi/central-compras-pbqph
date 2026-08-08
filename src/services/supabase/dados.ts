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
  Data, Ecr, Emitente, Endereco, Fornecedor, Item, Obra, OrdemCompra,
} from '../../domain/types';
import { core, compras, supabase } from './client';

// ---------------------------------------------------------------------------
// Conversões entre o formato do banco (colunas planas) e o do app (objetos)
// ---------------------------------------------------------------------------

const vazio = (v: unknown): string => (v == null ? '' : String(v));

function paraEndereco(l: Record<string, unknown>): Endereco {
  return {
    logradouro: vazio(l['logradouro']),
    numero: vazio(l['numero']),
    complemento: vazio(l['complemento']),
    bairro: vazio(l['bairro']),
    cidade: vazio(l['cidade']),
    uf: vazio(l['uf']),
    cep: vazio(l['cep']),
  };
}

function deEndereco(e: Partial<Endereco> | undefined) {
  return {
    logradouro: e?.logradouro || null,
    numero: e?.numero || null,
    complemento: e?.complemento || null,
    bairro: e?.bairro || null,
    cidade: e?.cidade || null,
    uf: e?.uf ? e.uf.toUpperCase().slice(0, 2) : null,
    cep: e?.cep ? e.cep.replace(/\D/g, '') || null : null,
  };
}

/** CPF/CNPJ entram no banco só com dígitos — é o que impede o mesmo cadastro
 *  entrar duas vezes com pontuação diferente. */
const soDigitos = (v: string | undefined): string | null => {
  const d = (v ?? '').replace(/\D/g, '');
  return d.length === 11 || d.length === 14 ? d : null;
};

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

export async function carregarDados(): Promise<Data> {
  const [forn, obras, ecrs, ocs, emits, cfgNum] = await Promise.all([
    core().from('fornecedores').select('*').order('razao_social'),
    // "Obra" na tela é a INTERVENÇÃO: é o serviço que consome material. O
    // imóvel vem junto porque é dele que saem endereço e responsável.
    core()
      .from('intervencoes')
      .select('id, descricao_curta, ativa, pasta_caminho, criado_em, atualizado_em, imovel:imoveis(*)')
      .order('descricao_curta'),
    compras().from('ecrs').select('*, materiais(*)').order('id'),
    compras().from('ordens_compra').select('*, itens:oc_itens(*)').order('ano').order('sequencial'),
    compras().from('emitentes').select('*').order('padrao', { ascending: false }),
    compras().from('numeracao').select('ano, ultimo_sequencial'),
  ]);

  for (const r of [forn, obras, ecrs, ocs, emits, cfgNum]) {
    if (r.error) throw new Error(`Falha ao carregar dados: ${r.error.message}`);
  }

  const anoCorrente = new Date().getFullYear();
  const numeracaoAno = (cfgNum.data ?? []).find((n: Record<string, number>) => n['ano'] === anoCorrente);

  return {
    schema_version: 4,
    version: 1,
    app_name: 'Central de Compras PBQP-H',
    shared_file_name: '',
    seeded_at: '',
    last_saved: new Date().toISOString(),
    config: {
      emitentes: (emits.data ?? []).map(paraEmitente),
      endereco_cobranca: paraEndereco({}),
      ultimo_numero_oc: numeracaoAno?.['ultimo_sequencial'] ?? 0,
      ano_corrente: anoCorrente,
      condicoes_pagamento: ['À vista', '7 dias', '14 dias', '21 dias', '28 dias', '30 dias'],
      texto_condicoes_contratacao: '',
      texto_envio_nf: '',
      texto_qualidade: '',
      // A chave da IA não vem mais junto dos dados: ela passou para o servidor.
      openrouter_api_key: '',
      pasta_backups: '',
    },
    fornecedores: (forn.data ?? []).map(paraFornecedor),
    obras: (obras.data ?? []).map(paraObra),
    ecrs: (ecrs.data ?? []).map(paraEcr),
    ordens_compra: (ocs.data ?? []).map(paraOc),
    prestadores_servico: [],
    avaliacoes_prestadores: [],
  };
}

function paraFornecedor(l: Record<string, unknown>): Fornecedor {
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
    ecrs_atende: [],
    observacoes: vazio(l['observacoes']),
    ativo: l['ativo'] !== false,
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
    itens,
    frete: Number(l['frete']) || 0,
    outras_despesas: Number(l['outras_despesas']) || 0,
    desconto_material: Number(l['desconto_material']) || 0,
    observacoes: vazio(l['observacoes']),
    criado_em: vazio(l['criado_em']),
    atualizado_em: vazio(l['atualizado_em']),
    pdf_gerado_em: vazio(l['pdf_gerado_em']),
  };
}

function paraEmitente(l: Record<string, unknown>): Emitente {
  const tels = (l['telefones'] as string[]) ?? [];
  return {
    id: String(l['id']),
    tipo: (l['tipo'] as Emitente['tipo']) ?? 'PJ',
    razao_social: vazio(l['razao_social']),
    nome_fantasia: vazio(l['nome_fantasia']),
    cnpj: vazio(l['documento']),
    ie: vazio(l['inscricao_estadual']),
    email_envio_nf: vazio(l['email_envio_nf']),
    telefones: [tels[0] ?? '', tels[1] ?? ''],
    endereco: paraEndereco(l),
  };
}

// ---------------------------------------------------------------------------
// Numeração de OC
// ---------------------------------------------------------------------------

/**
 * Reserva o próximo número de OC.
 *
 * ATENÇÃO ao ligar isto na tela: chame ao SALVAR, não ao abrir a tela de nova
 * OC. Hoje o número é reservado na abertura, então quem desiste deixa um buraco
 * permanente na sequência — e duas pessoas abrindo ao mesmo tempo recebem o
 * mesmo número. Aqui o banco garante que não repete, mas só chamar na hora
 * certa evita o buraco.
 */
export async function reservarNumeroOc(
  ano?: number,
): Promise<{ ano: number; sequencial: number; numero: string }> {
  const { data, error } = await compras().rpc('proximo_numero_oc', { p_ano: ano ?? null });
  if (error) throw new Error(`Não foi possível reservar o número da OC: ${error.message}`);
  const linha = Array.isArray(data) ? data[0] : data;
  return linha as { ano: number; sequencial: number; numero: string };
}

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------

export async function salvarFornecedor(f: Fornecedor): Promise<void> {
  const { error } = await core().from('fornecedores').upsert({
    ...(f.id && !f.id.startsWith('forn-') ? { id: f.id } : {}),
    razao_social: f.razao_social,
    nome_fantasia: f.nome_fantasia || null,
    documento: soDigitos(f.cnpj),
    inscricao_estadual: f.ie || null,
    email: f.email || null,
    telefones: (f.telefones ?? []).filter(Boolean),
    contato_responsavel: f.contato_responsavel || null,
    ...deEndereco(f.endereco),
    observacoes: f.observacoes || null,
    ativo: f.ativo !== false,
  });
  if (error) throw new Error(`Falha ao gravar fornecedor: ${error.message}`);
}

export async function salvarOrdemCompra(oc: OrdemCompra): Promise<string> {
  const cabecalho = {
    ...(oc.id && !oc.id.startsWith('oc-') ? { id: oc.id } : {}),
    ano: oc.ano,
    sequencial: oc.sequencial,
    data: oc.data,
    status: oc.status,
    intervencao_id: oc.obra_id || null,
    fornecedor_id: oc.fornecedor_id || null,
    emitente_id: oc.emitente_id || null,
    condicao_pagamento: oc.condicao_pagamento || null,
    frete: oc.frete ?? 0,
    outras_despesas: oc.outras_despesas ?? 0,
    desconto_material: oc.desconto_material ?? 0,
    observacoes: oc.observacoes || null,
    pdf_gerado_em: oc.pdf_gerado_em || null,
  };

  const { data, error } = await compras()
    .from('ordens_compra')
    .upsert(cabecalho, { onConflict: 'ano,sequencial' })
    .select('id')
    .single();
  if (error) throw new Error(`Falha ao gravar a ordem de compra: ${error.message}`);

  const ocId = String((data as Record<string, unknown>)['id']);

  // Itens são regravados por inteiro: a tela edita a lista como um todo
  // (adiciona, remove, reordena), e casar item a item aqui seria reimplementar
  // no cliente uma comparação que o banco resolve com apagar-e-inserir.
  const { error: erroApagar } = await compras().from('oc_itens').delete().eq('oc_id', ocId);
  if (erroApagar) throw new Error(`Falha ao atualizar itens: ${erroApagar.message}`);

  if (oc.itens?.length) {
    const { error: erroItens } = await compras().from('oc_itens').insert(
      oc.itens.map((i, idx) => ({
        oc_id: ocId,
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
    );
    if (erroItens) throw new Error(`Falha ao gravar itens: ${erroItens.message}`);
  }
  return ocId;
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
