/**
 * Constantes do domínio. Migradas de CentralCompras-PBQPH.html linhas 690-692.
 */

export const STATUS_OC = ['rascunho', 'emitida', 'entregue', 'cancelada'] as const;

export type StatusOc = (typeof STATUS_OC)[number];

export const STATUS_LABEL: Record<StatusOc, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
};

export const UN_PADRAO = [
  'un',
  'kg',
  'm',
  'm²',
  'm³',
  'sc',
  'L',
  'gl',
  'bd',
  'cx',
  'rl',
  'pç',
] as const;

export type UnidadePadrao = (typeof UN_PADRAO)[number];

export const TIPOS_EMITENTE = ['PJ', 'PF'] as const;
export type TipoEmitente = (typeof TIPOS_EMITENTE)[number];

/** Versão atual do schema do JSON. Bump a cada mudança incompatível + adicionar migration. */
export const CURRENT_SCHEMA_VERSION = 3;
