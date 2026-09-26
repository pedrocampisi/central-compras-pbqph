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
import { MAX_PAGINAS, mensagemDePaginas } from '../../domain/importacao';
import { ErroDaImportacao } from './lerPedido';

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
  /** Só na leitura de texto (D557): a dúvida da IA sobre esta linha. */
  confira?: unknown;
}

/**
 * O que uma leitura devolve para a tela (CTO-D557).
 *
 * `confira` fica FORA do item, num mapa pelo id: o item vai para o banco
 * (`salvar_oc`) e para o PDF, e a dúvida da IA não pode ir junto. Como o
 * `Item` nem tem onde guardá-la, ela não chega lá nem por descuido.
 */
export interface ResultadoDaLeitura {
  itens: Item[];
  confira: Record<string, string>;
  /** As linhas que a IA não transformou em item, como vieram. */
  ignoradas: string[];
}

/** A resposta do servidor → o resultado da tela. Pura, para o teste. */
export function paraResultado(payload: unknown): ResultadoDaLeitura {
  const p = (payload ?? {}) as { itens?: unknown; ignoradas?: unknown };
  const rawItems = (Array.isArray(p.itens) ? p.itens : []) as RawExtractedItem[];
  const confira: Record<string, string> = {};
  const itens = rawItems.map((it) => {
    const item = normalizeItem({
      ecr_id: it.ecr_id != null && Number(it.ecr_id) ? Number(it.ecr_id) : null,
      descricao: String(it.descricao ?? '').trim(),
      observacao: String(it.observacao ?? '').trim(),
      quantidade: Number(it.quantidade) || 0,
      unidade: normalizeUnit(it.unidade),
      preco_unit: Number(it.preco_unit) || 0,
      ipi_pct: Number(it.ipi_pct) || 0,
      desc_pct: Number(it.desc_pct) || 0,
    });
    const duvida = typeof it.confira === 'string' ? it.confira.trim() : '';
    if (duvida) confira[item.id] = duvida;
    return item;
  });
  const ignoradas = (Array.isArray(p.ignoradas) ? p.ignoradas : [])
    .filter((l): l is string => typeof l === 'string' && l.trim() !== '');
  return { itens, confira, ignoradas };
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

// ── A chamada ─────────────────────────────────────────────────────────────────

/** A mensagem que o servidor mandou, em português (`{ "erro": "…" }`), ou nada. */
async function erroDoServidor(resp: Response): Promise<string> {
  try {
    const corpo = (await resp.json()) as { erro?: unknown };
    return typeof corpo.erro === 'string' ? corpo.erro.trim() : '';
  } catch {
    return '';
  }
}

async function chamarExtrairItens(
  corpo: { imagens: string[] } | { texto: string },
  mensagem: (status: number, doServidor: string) => string,
): Promise<ResultadoDaLeitura> {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string;

  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error('Sessão expirada. Saia e entre novamente.');

  // Sem o header `apikey` de propósito: o CORS da função só permite
  // authorization e content-type, e o token da sessão autentica sozinho
  // (verificado em 08/08/2026 — com apikey o navegador bloqueia o preflight).
  const resp = await fetch(`${url}/functions/v1/extrair-itens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corpo),
  });

  if (!resp.ok) {
    const doServidor = await erroDoServidor(resp);
    const texto = mensagem(resp.status, doServidor);
    // A frase do próprio servidor vai para a tela como veio, sem prefixo (D557).
    throw texto === doServidor ? new ErroDaImportacao(texto) : new Error(texto);
  }

  return paraResultado(await resp.json());
}

// ── Extração ──────────────────────────────────────────────────────────────────

/**
 * Envia as imagens (data URLs JPEG) para a função do servidor e devolve os
 * itens já normalizados, prontos para entrar na OC.
 */
export async function extractItemsFromImages(imagesDataUrls: string[]): Promise<ResultadoDaLeitura> {
  if (!imagesDataUrls.length) throw new Error('Nenhuma imagem fornecida.');
  // Nunca cortar em silêncio (CTO-D554): `lerPedido` já barrou antes, e esta
  // é a última porta — página demais não sai do navegador.
  if (imagesDataUrls.length > MAX_PAGINAS) throw new Error(mensagemDePaginas(imagesDataUrls.length));
  // As mensagens da imagem ficam as de sempre; só o 400 (novo, D557: grande
  // demais) traz a do servidor.
  return chamarExtrairItens({ imagens: imagesDataUrls }, (status, doServidor) =>
    status === 400 && doServidor ? doServidor : mensagemErro(status),
  );
}

/**
 * A lista de materiais em texto, do jeito que a pessoa colou (CTO-D557). Os
 * limites e os erros são do servidor, e a mensagem dele vai para a tela como
 * veio; sem ela, a do status.
 */
export async function organizarTexto(texto: string): Promise<ResultadoDaLeitura> {
  if (texto.trim() === '') throw new Error('Cole a lista de materiais na caixa de texto.');
  return chamarExtrairItens({ texto }, (status, doServidor) =>
    doServidor || (status === 422 ? 'A IA não encontrou itens neste texto.' : mensagemErro(status)),
  );
}
