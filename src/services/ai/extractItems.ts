/**
 * Extração de itens de pedido via IA (OpenRouter + Claude Haiku 4.5).
 * Aceita imagens (data URLs JPEG) e retorna itens normalizados prontos para inserção.
 * Portado de CentralCompras-PBQPH.html linhas 2433-2526.
 */

import type { Ecr, Item } from '../../domain/types';
import { normalizeItem } from '../../domain/normalize';
import { UN_PADRAO } from '../../domain/constants';
import { callOpenRouter } from './openRouterClient';

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(ecrs: Ecr[]): string {
  const ecrsList = ecrs.map((e) => `${e.id}: ${e.codigo} — ${e.nome}`).join('\n');

  return `Você é um extrator de dados de pedidos/orçamentos de obra. Analise a(s) imagem(ns) e extraia TODAS as linhas de itens em JSON estrito.

Formato OBRIGATÓRIO (apenas JSON, sem markdown, sem texto antes/depois):
{"itens":[{"descricao":"texto da linha do item","observacao":"código/SKU do item se houver, senão string vazia","unidade":"un|kg|m|m²|m³|sc|L|gl|bd|cx|rl|pç","quantidade":number,"preco_unit":number,"ipi_pct":number,"desc_pct":number,"ecr_id":number_or_null}]}

═══ REGRA CRÍTICA SOBRE PREÇO E DESCONTO ═══
"preco_unit" é SEMPRE o preço BRUTO (de tabela / antes do desconto).
"desc_pct" é o percentual de desconto da linha.
O sistema aplica o desconto: total = qtd × preco_unit × (1 − desc_pct/100) × (1 + ipi_pct/100).

NUNCA repasse o desconto duas vezes. Se a tabela mostra colunas separadas tipo:
  | TABELA | DESC% | VALOR UNITÁRIO | TOTAL |
  |  22,50 |  9,00 |     20,48      | 102,38 |
então: preco_unit = 22.50 (TABELA), desc_pct = 9, NÃO 20.48.

VERIFIQUE matematicamente cada linha antes de devolver:
  qtd × preco_unit × (1 − desc_pct/100) ≈ TOTAL da linha (tolerância 1%).
Se não bater, está errado — você confundiu bruto com líquido. Corrija.

Caso só haja UMA coluna de preço (sem coluna de desconto explícita): preco_unit = esse preço, desc_pct = 0.

═══ DEMAIS REGRAS ═══
- Use ponto como separador decimal (ex: 22.50, não 22,50).
- "quantidade" e "preco_unit" são números (não strings).
- "ipi_pct" e "desc_pct" são percentuais (0 se ausente).
- "observacao": código do produto / SKU se disponível na coluna "Item" ou "Cód." (ex: "2660"). Caso contrário, "".
- "ecr_id" é o id numérico do ECR mais provável dado a descrição. Use null se incerto. ECRs disponíveis:
${ecrsList}
- "unidade" deve ser uma das unidades padrão. Mapeie:
  • UN, UNID, UND, PEÇA, PC, PÇ → "un" ou "pç"
  • KG → "kg"
  • M, MT, METRO → "m"
  • M2 → "m²", M3 → "m³"
  • BARRA, BR, BR3MT, BR6MT → "un" (não há unidade "barra"; conte como unidade)
  • CX, CAIXA → "cx"
  • RL, ROLO → "rl"
  • SC, SACO → "sc"
  • L, LT, LITRO → "L"
- Ignore totais, subtotais, cabeçalhos, dados do cliente/fornecedor/loja, vencimentos, formas de pagamento.
- Se a imagem não contiver itens reconhecíveis, retorne {"itens":[]}.`;
}

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

// ── Extração ──────────────────────────────────────────────────────────────────

/**
 * Envia imagens para a IA e retorna itens normalizados.
 * Lança erro se apiKey não estiver configurada ou a IA não retornar JSON válido.
 */
export async function extractItemsFromImages(
  imagesDataUrls: string[],
  ecrs: Ecr[],
  apiKey: string,
): Promise<Item[]> {
  if (!apiKey) throw new Error('OpenRouter API key não configurada. Acesse Configurações.');
  if (!imagesDataUrls.length) throw new Error('Nenhuma imagem fornecida.');

  const promptText = buildPrompt(ecrs);

  const content: Array<
    { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
  > = [{ type: 'text', text: promptText }];

  for (const url of imagesDataUrls) {
    content.push({ type: 'image_url', image_url: { url } });
  }

  const raw = await callOpenRouter(apiKey, [{ role: 'user', content }]);

  // Extrai o bloco JSON da resposta (a IA pode adicionar texto antes/depois)
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Resposta da IA sem JSON válido.');

  const parsed = JSON.parse(raw.slice(start, end + 1)) as { itens?: RawExtractedItem[] };
  const rawItems = Array.isArray(parsed.itens) ? parsed.itens : [];

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
