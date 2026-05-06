/**
 * Helpers de baixo nível para geração de PDF.
 * Portado de CentralCompras-PBQPH.html linhas 1864-1869.
 */

import type { jsPDF } from 'jspdf';
import type { Endereco } from '../../domain/types';

/** Desenha um retângulo de borda cinza claro (cor 180,180,180). */
export function drawBox(doc: jsPDF, x: number, y: number, w: number, h: number): void {
  doc.setDrawColor(180);
  doc.rect(x, y, w, h);
}

/** Formata a primeira linha de um endereço (logradouro + número + complemento). */
export function addrLine(addr: Partial<Endereco> | undefined | null): string {
  if (!addr) return '';
  return [addr.logradouro, addr.numero, addr.complemento].filter(Boolean).join(', ');
}
