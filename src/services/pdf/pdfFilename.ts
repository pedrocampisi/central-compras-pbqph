/**
 * Geração do nome do arquivo PDF de OC.
 * Formato: `<fornecedor-slug> <data-iso> R<valor> oc.pdf`
 * Ex: "campisi construtora 2026-01-15 R1-250-00 oc.pdf"
 */

import type { OrdemCompra } from '../../domain/types';
import { computeOcTotals } from '../../domain/compute';
import { slugify } from '../../domain/slugify';
import { formatBrl } from '../../domain/format';

export function buildPdfFilename(oc: OrdemCompra, fornecedorRazaoSocial: string): string {
  const fornSlug = slugify(fornecedorRazaoSocial || 'oc');
  const totGeral = computeOcTotals(oc).total_geral;
  const valor = formatBrl(totGeral)
    .replace('R$', 'R')
    .trim()
    .replace(/[,.\s]/g, '-')
    .replace(/-+/g, '-');
  return `${fornSlug} ${oc.data} ${valor} oc.pdf`.trim();
}
