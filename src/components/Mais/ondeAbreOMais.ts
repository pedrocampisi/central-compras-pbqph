import type { CSSProperties } from 'react';

/** A largura da lista do "Mais", em px. */
export const LARGURA = 232;

/**
 * Onde a lista do "Mais" abre, a 8 px da borda da tela no mínimo. Antes, sem
 * espaço embaixo, ela abria em cima mesmo sem caber, e as primeiras ações
 * ficavam acima da tela: em 667 × 350, com o botão a 110 px e uma lista de
 * 230 px, o topo ia a -124 px (laudo da pintura, achado 2).
 */
export function ondeAbreOMais(
  r: Pick<DOMRect, 'top' | 'bottom' | 'right'>,
  altura: number,
  larguraDaTela: number,
  alturaDaTela: number,
): CSSProperties {
  const left = Math.max(8, Math.min(r.right - LARGURA, larguraDaTela - LARGURA - 8));
  const embaixo = alturaDaTela - 8 - (r.bottom + 4);
  const emCima = r.top - 4 - 8;
  if (altura <= embaixo) return { left, top: r.bottom + 4 };
  if (altura <= emCima) return { left, bottom: alturaDaTela - r.top + 4 };
  if (embaixo >= emCima) return { left, top: r.bottom + 4, maxHeight: Math.max(0, embaixo) };
  return { left, bottom: alturaDaTela - r.top + 4, maxHeight: Math.max(0, emCima) };
}
