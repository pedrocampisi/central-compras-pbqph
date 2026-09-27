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

/**
 * Versão atual do schema dos dados. Bump a cada mudança incompatível +
 * adicionar a migration correspondente em `domain/migrations/`.
 *
 * Estava em 4 enquanto o pipeline de migrações, o Zod e a camada do banco já
 * produziam v5 — divergência apontada na perícia de 10/08/2026 (P2-08).
 */
export const CURRENT_SCHEMA_VERSION = 5;
