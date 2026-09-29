/**
 * A qualificação dos fornecedores e a avaliação na entrega no banco (CTO-D604,
 * D605, D606; o contrato do Banco de 28/09).
 *
 * - Ler: as vistas `qualificacoes_situacao`, `tratativas_abertas` e
 *   `desempenho_12_meses`, e as tabelas dos critérios e das categorias. Quem
 *   calcula a situação, o vencimento e a nota é o banco.
 * - Escrever: só pelas três funções. Ninguém escreve direto nas tabelas, e o
 *   banco recusa quem tentar.
 *
 * Com a máscara da D599 ligada, as avaliações e as tratativas vêm só da obra
 * dela. A lista de qualificados vem inteira: a qualificação é da empresa, não
 * da obra (D604 §3.5).
 */

import { compras } from './client';
import { todasAsLinhas } from './dados';
import { obraDaMascara } from '../storage/umaObra';
import {
  CATEGORIAS,
  fraseDaRecusaDaCiencia,
  fraseDaRecusaDaEntrega,
  fraseDaRecusaDaQualificacao,
  paraSituacao,
  type Avaliacao,
  type Categoria,
  type CriterioMarcado,
  type LinhaDeQualificacao,
} from '../../domain/qualificacao';

export interface CategoriaDaQualificacao {
  categoria: Categoria;
  nome: string;
  minimo: number;
  /** Os textos dos três critérios, na ordem (do banco, que corrigiu os da planilha). */
  criterios: string[];
}

export interface Tratativa {
  avaliacaoId: number;
  ocId: string;
  numero: string;
  fornecedorId: string;
  intervencaoId: string;
  notaFiscal: string;
  recebidoEm: string;
  prazoConforme: boolean;
  integridadeConforme: boolean;
  ocEcrConforme: boolean;
  naoConformes: number;
  observacao: string;
  tratativa: string;
  avaliadoPorNome: string;
}

export interface Desempenho {
  empresaRaizId: string | null;
  fornecedorId: string | null;
  entregas: number;
  noPrazo: number;
  inteiras: number;
  conformes: number;
  primeira: string;
  ultima: string;
}

export interface DadosDaQualificacao {
  linhas: LinhaDeQualificacao[];
  categorias: CategoriaDaQualificacao[];
  tratativas: Tratativa[];
  desempenho: Desempenho[];
}

const txt = (v: unknown): string => (v == null ? '' : String(v));
const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);
const ehCategoria = (v: unknown): v is Categoria => CATEGORIAS.includes(v as Categoria);

function paraLinha(l: Record<string, unknown>): LinhaDeQualificacao | null {
  if (!ehCategoria(l['categoria'])) return null;
  const criterios: CriterioMarcado[] = [1, 2, 3].map((i) => ({
    atende: l[`atende_${i}`] === true,
    motivo: txt(l[`motivo_${i}`]),
  }));
  return {
    id: num(l['id']),
    empresaRaizId: (l['empresa_raiz_id'] as string | null) ?? null,
    fornecedorId: (l['fornecedor_id'] as string | null) ?? null,
    categoria: l['categoria'],
    tipo: txt(l['tipo']),
    qualificadaEm: txt(l['qualificada_em']),
    venceEm: txt(l['vence_em']),
    criterios,
    nota: num(l['nota']),
    minimo: num(l['minimo']),
    qualificada: l['qualificada'] === true,
    qualificadoPorNome: txt(l['qualificado_por_nome']),
    origem: txt(l['origem']),
    situacao: paraSituacao(l['situacao']),
    ecrs: Array.isArray(l['ecrs']) ? (l['ecrs'] as unknown[]).map(Number).sort((a, b) => a - b) : [],
    vigente: l['vigente'] === true,
  };
}

function paraTratativa(l: Record<string, unknown>): Tratativa {
  return {
    avaliacaoId: num(l['avaliacao_id']),
    ocId: txt(l['oc_id']),
    numero: txt(l['numero']),
    fornecedorId: txt(l['fornecedor_id']),
    intervencaoId: txt(l['intervencao_id']),
    notaFiscal: txt(l['nota_fiscal']),
    recebidoEm: txt(l['recebido_em']),
    prazoConforme: l['prazo_conforme'] === true,
    integridadeConforme: l['integridade_conforme'] === true,
    ocEcrConforme: l['oc_ecr_conforme'] === true,
    naoConformes: num(l['nao_conformes']),
    observacao: txt(l['observacao']),
    tratativa: txt(l['tratativa']),
    avaliadoPorNome: txt(l['avaliado_por_nome']),
  };
}

function paraDesempenho(l: Record<string, unknown>): Desempenho {
  return {
    empresaRaizId: (l['empresa_raiz_id'] as string | null) ?? null,
    fornecedorId: (l['fornecedor_id'] as string | null) ?? null,
    entregas: num(l['entregas']),
    noPrazo: num(l['no_prazo']),
    inteiras: num(l['inteiras']),
    conformes: num(l['conformes']),
    primeira: txt(l['primeira']),
    ultima: txt(l['ultima']),
  };
}

/** Tudo o que as telas da qualificação leem, numa carga só. Falha sobe: quem chama decide. */
export async function carregarQualificacoes(obra: string | null = obraDaMascara()): Promise<DadosDaQualificacao> {
  const tratativas = () => compras().from('tratativas_abertas').select('*', { count: 'exact' });
  // Cada pedido dentro de um `async`: um erro na hora de montar a consulta vira
  // recusa que o Promise.all recebe, e não deixa os pedidos já saídos falhando
  // sem ninguém ouvir.
  const [linhas, categorias, criterios, abertas, desempenho] = await Promise.all([
    (async () =>
      todasAsLinhas('qualificações', (de, ate) =>
        compras().from('qualificacoes_situacao').select('*', { count: 'exact' }).order('id').range(de, ate)))(),
    (async () => compras().from('categorias_qualificacao').select('categoria, nome, minimo'))(),
    (async () =>
      compras().from('criterios_qualificacao').select('categoria, ordem, texto').order('categoria').order('ordem'))(),
    (async () =>
      todasAsLinhas('tratativas abertas', (de, ate) =>
        (obra ? tratativas().eq('intervencao_id', obra) : tratativas()).order('avaliacao_id').range(de, ate)))(),
    (async () => compras().from('desempenho_12_meses').select('*'))(),
  ]);
  for (const r of [linhas, categorias, criterios, abertas, desempenho]) {
    if (r.error) throw new Error(`Falha ao carregar as qualificações: ${r.error.message}`);
  }

  const textos = new Map<string, string[]>();
  for (const c of (criterios.data ?? []) as Record<string, unknown>[]) {
    const lista = textos.get(txt(c['categoria'])) ?? [];
    lista[num(c['ordem']) - 1] = txt(c['texto']);
    textos.set(txt(c['categoria']), lista);
  }
  const porCategoria = new Map(
    ((categorias.data ?? []) as Record<string, unknown>[])
      .filter((c) => ehCategoria(c['categoria']))
      .map((c) => [c['categoria'] as Categoria, c]),
  );

  return {
    linhas: ((linhas.data ?? []) as Record<string, unknown>[]).map(paraLinha).filter((l): l is LinhaDeQualificacao => !!l),
    // Na ordem das abas da planilha, e só as que o banco conhece.
    categorias: CATEGORIAS.filter((c) => porCategoria.has(c)).map((c) => ({
      categoria: c,
      nome: txt(porCategoria.get(c)!['nome']),
      minimo: num(porCategoria.get(c)!['minimo']),
      criterios: textos.get(c) ?? [],
    })),
    tratativas: ((abertas.data ?? []) as Record<string, unknown>[]).map(paraTratativa),
    desempenho: ((desempenho.data ?? []) as Record<string, unknown>[]).map(paraDesempenho),
  };
}

// ---------------------------------------------------------------------------
// As três escritas (contrato §2). A recusa sobe como frase de gente.
// ---------------------------------------------------------------------------

export interface QualificacaoNova {
  sujeito: { empresa_raiz_id: string } | { fornecedor_id: string };
  categoria: Categoria;
  tipo: string;
  qualificadaEm: string;
  criterios: CriterioMarcado[];
  /** Só em material; nas outras o banco recusa ECR. */
  ecrs: number[];
}

export interface QualificacaoGravada {
  qualificacaoId: number;
  nota: number;
  minimo: number;
  qualificada: boolean;
  situacao: ReturnType<typeof paraSituacao>;
  venceEm: string;
}

export async function qualificarEmpresa(q: QualificacaoNova): Promise<QualificacaoGravada> {
  const p = {
    ...q.sujeito,
    categoria: q.categoria,
    ...(q.tipo.trim() ? { tipo: q.tipo.trim() } : {}),
    qualificada_em: q.qualificadaEm,
    criterios: q.criterios.map((c) => ({ atende: c.atende, motivo: c.motivo.trim() })),
    ...(q.categoria === 'material' ? { ecrs: q.ecrs } : {}),
  };
  const { data, error } = await compras().rpc('qualificar_empresa', { p });
  if (error) throw new Error(fraseDaRecusaDaQualificacao(error));
  const r = (data ?? {}) as Record<string, unknown>;
  return {
    qualificacaoId: num(r['qualificacao_id']),
    nota: num(r['nota']),
    minimo: num(r['minimo']),
    qualificada: r['qualificada'] === true,
    situacao: paraSituacao(r['situacao']),
    venceEm: txt(r['vence_em']),
  };
}

export interface EntregaGravada {
  avaliacaoId: number;
  status: string;
  versao: number;
  entregueEm: string;
  naoConformes: number;
  tratativaAberta: boolean;
}

/** A avaliação e o "entregue" numa escrita só (contrato §2). */
export async function registrarEntrega(ocId: string, versao: number, a: Avaliacao): Promise<EntregaGravada> {
  const p = {
    nota_fiscal: a.notaFiscal.trim(),
    recebido_em: a.recebidoEm,
    prazo_conforme: a.prazoConforme,
    integridade_conforme: a.integridadeConforme,
    oc_ecr_conforme: a.ocEcrConforme,
    ...(a.observacao.trim() ? { observacao: a.observacao.trim() } : {}),
    ...(a.tratativa.trim() ? { tratativa: a.tratativa.trim() } : {}),
  };
  const { data, error } = await compras().rpc('registrar_entrega', { p_oc_id: ocId, p_versao: versao, p });
  if (error) throw new Error(fraseDaRecusaDaEntrega(error));
  const r = (data ?? {}) as Record<string, unknown>;
  return {
    avaliacaoId: num(r['avaliacao_id']),
    status: txt(r['status']),
    versao: num(r['versao']),
    entregueEm: txt(r['entregue_em']),
    naoConformes: num(r['nao_conformes']),
    tratativaAberta: r['tratativa_aberta'] === true,
  };
}

export async function darCienciaTratativa(avaliacaoId: number, nota: string): Promise<void> {
  const { error } = await compras().rpc('dar_ciencia_tratativa', { p_avaliacao_id: avaliacaoId, p_nota: nota.trim() });
  if (error) throw new Error(fraseDaRecusaDaCiencia(error));
}

// ---------------------------------------------------------------------------
// As avaliações de entrega, para o PDF do auditor (D604 §3.5)
// ---------------------------------------------------------------------------

export interface AvaliacaoGravada {
  id: number;
  ocId: string;
  intervencaoId: string;
  notaFiscal: string;
  recebidoEm: string;
  prazoConforme: boolean;
  integridadeConforme: boolean;
  ocEcrConforme: boolean;
  naoConformes: number;
  observacao: string;
  tratativa: string;
  avaliadoPorNome: string;
  cienciaPorNome: string;
  cienciaEm: string;
  cienciaNota: string;
}

/** Todas as avaliações, pelo dia do recebimento; com a máscara, só as da obra dela. */
export async function lerAvaliacoesDeEntrega(): Promise<AvaliacaoGravada[]> {
  const obra = obraDaMascara();
  const todas = () => compras().from('avaliacoes_entrega').select('*', { count: 'exact' });
  const r = await todasAsLinhas('avaliações de entrega', (de, ate) =>
    (obra ? todas().eq('intervencao_id', obra) : todas()).order('recebido_em').order('id').range(de, ate));
  if (r.error) throw new Error(`Falha ao ler as avaliações de entrega: ${r.error.message}`);
  return ((r.data ?? []) as Record<string, unknown>[]).map((l) => ({
    id: num(l['id']),
    ocId: txt(l['oc_id']),
    intervencaoId: txt(l['intervencao_id']),
    notaFiscal: txt(l['nota_fiscal']),
    recebidoEm: txt(l['recebido_em']),
    prazoConforme: l['prazo_conforme'] === true,
    integridadeConforme: l['integridade_conforme'] === true,
    ocEcrConforme: l['oc_ecr_conforme'] === true,
    naoConformes: num(l['nao_conformes']),
    observacao: txt(l['observacao']),
    tratativa: txt(l['tratativa']),
    avaliadoPorNome: txt(l['avaliado_por_nome']),
    cienciaPorNome: txt(l['ciencia_por_nome']),
    cienciaEm: txt(l['ciencia_em']),
    cienciaNota: txt(l['ciencia_nota']),
  }));
}
