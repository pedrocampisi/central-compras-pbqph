/**
 * Extração de itens de pedido via IA — agora pelo SERVIDOR.
 *
 * A chamada vai para a Edge Function `extrair-itens` do Supabase, que guarda a
 * chave da OpenRouter nos segredos do projeto e busca os ECRs no banco sozinha.
 * O navegador não conhece chave nenhuma — antes, qualquer pessoa com o
 * inspetor aberto lia a chave no localStorage.
 *
 * A NORMALIZAÇÃO continua aqui de propósito: o servidor devolve os itens no
 * mesmo formato cru que o modelo devolvia antes, e é o aplicativo que decide
 * como mapear unidades e completar campos (normalizeUnit + normalizeItem).
 */

import type { Item } from '../../domain/types';
import { normalizeItem } from '../../domain/normalize';
import { UN_PADRAO } from '../../domain/constants';
import { supabase } from '../supabase/client';

const MAX_IMAGENS = 10;

// ── Normalização de unidade ───────────────────────────────────────────────────

const UN_MAP: Record<string, string> = {
  un: 'un', unid: 'un', und: 'un', unidade: 'un',
  kg: 'kg', quilo: 'kg',
  m: 'm', mt: 'm', metro: 'm',
  m2: 'm²', 'm²': 'm²',
  m3: 'm³', 'm³': 'm³',
  sc: 'sc', sac: 'sc', saco: 'sc',
  l: 'L', lt: 'L', litro: 'L',
  gl: 'gl', galao: 'gl',
  bd: 'bd', balde: 'bd',
  cx: 'cx', caixa: 'cx',
  rl: 'rl', rolo: 'rl',
  pc: 'pç', pç: 'pç', peca: 'pç',
  // Variações de "barra" (não há unidade dedicada — cai em "un")
  br: 'un', barra: 'un', br3mt: 'un', br6mt: 'un', br1mt: 'un', br2mt: 'un',
};

function normalizeUnit(u: unknown): string {
  const v = String(u ?? '').toLowerCase().trim().replace(/[^a-z0-9²³ç]/gi, '');
  return UN_MAP[v] ?? (UN_PADRAO.includes(v as (typeof UN_PADRAO)[number]) ? v : 'un');
}

// ── Raw item type from IA response ────────────────────────────────────────────

interface RawExtractedItem {
  descricao?: unknown;
  observacao?: unknown;
  unidade?: unknown;
  quantidade?: unknown;
  preco_unit?: unknown;
  ipi_pct?: unknown;
  desc_pct?: unknown;
  ecr_id?: unknown;
}

// ── Erros da função do servidor, em português ─────────────────────────────────

function mensagemErro(status: number): string {
  switch (status) {
    case 401:
      return 'Sessão expirada. Saia e entre novamente.';
    case 403:
      return 'Seu acesso não permite usar a importação por IA.';
    case 422:
      return 'A IA não conseguiu ler itens neste arquivo. Tente uma imagem mais nítida.';
    case 502:
      return 'O serviço de IA (OpenRouter) está fora do ar. Tente novamente em instantes.';
    case 503:
      return 'A importação por IA ainda não foi configurada no servidor. Avise o administrador.';
    default:
      return `Falha na importação por IA (erro ${status}). Tente novamente.`;
  }
}

// ── Extração ──────────────────────────────────────────────────────────────────

/**
 * Envia as imagens (data URLs JPEG) para a função do servidor e devolve os
 * itens já normalizados, prontos para entrar na OC.
 */
export async function extractItemsFromImages(imagesDataUrls: string[]): Promise<Item[]> {
  if (!imagesDataUrls.length) throw new Error('Nenhuma imagem fornecida.');

  const url = import.meta.env['VITE_SUPABASE_URL'] as string;
  const chave = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string;

  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error('Sessão expirada. Saia e entre novamente.');

  const resp = await fetch(`${url}/functions/v1/extrair-itens`, {
    method: 'POST',
    headers: {
      apikey: chave,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imagens: imagesDataUrls.slice(0, MAX_IMAGENS) }),
  });

  if (!resp.ok) throw new Error(mensagemErro(resp.status));

  const payload = (await resp.json()) as { itens?: RawExtractedItem[] };
  const rawItems = Array.isArray(payload.itens) ? payload.itens : [];

  return rawItems.map((it) =>
    normalizeItem({
      ecr_id: it.ecr_id != null && Number(it.ecr_id) ? Number(it.ecr_id) : null,
      descricao: String(it.descricao ?? '').trim(),
      observacao: String(it.observacao ?? '').trim(),
      quantidade: Number(it.quantidade) || 0,
      unidade: normalizeUnit(it.unidade),
      preco_unit: Number(it.preco_unit) || 0,
      ipi_pct: Number(it.ipi_pct) || 0,
      desc_pct: Number(it.desc_pct) || 0,
    }),
  );
}
