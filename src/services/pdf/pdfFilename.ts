/**
 * Geração do nome do arquivo PDF de OC.
 * Formato: `<fornecedor-slug> <data-iso> R<valor> oc.pdf`
 * Ex: "comarco 2026-09-18 R-263-29 oc.pdf"
 *
 * O fornecedor vai pelo APELIDO da empresa, e não pela razão social inteira
 * (CTO-D680, palavra do Pedro: "o nome da OC precisa vir com o apelido e não
 * esse nome gigantesco"). Sem apelido, a razão social, como antes. Quem
 * escolhe o nome é `apelidoDoFornecedor`, nas duas portas (Nova OC e Histórico).
 */

import type { OrdemCompra } from '../../domain/types';
import { computeOcTotals } from '../../domain/compute';
import { slugify } from '../../domain/slugify';
import { formatBrl } from '../../domain/format';

export function buildPdfFilename(oc: OrdemCompra, nomeDoFornecedor: string): string {
  const fornSlug = slugify(nomeDoFornecedor || 'oc');
  const totGeral = computeOcTotals(oc).total_geral;
  const valor = formatBrl(totGeral)
    .replace('R$', 'R')
    .trim()
    .replace(/[,.\s]/g, '-')
    .replace(/-+/g, '-');
  return `${fornSlug} ${oc.data} ${valor} oc.pdf`.trim();
}
