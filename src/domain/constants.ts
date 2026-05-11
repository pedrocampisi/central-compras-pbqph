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

export const TIPOS_PRESTADOR = ['PJ', 'PF', 'MEI'] as const;
export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];

/**
 * Status de cada critério de avaliação PBQP-H de prestador de serviço.
 * `null` = ainda não avaliado.
 */
export const STATUS_CRITERIO = ['CONFORME', 'NAO_CONFORME'] as const;
export type StatusCriterio = (typeof STATUS_CRITERIO)[number] | null;

export const STATUS_CRITERIO_LABEL: Record<'CONFORME' | 'NAO_CONFORME', string> = {
  CONFORME: 'Conforme',
  NAO_CONFORME: 'Não Conforme',
};

/**
 * Categorias de serviço para prestadores. Lista inicial pode crescer conforme uso.
 * "Outros" cobre serviços não-classificados — usuário pode digitar livremente no campo.
 */
export const CATEGORIAS_SERVICO = [
  'Alvenaria',
  'Elétrica',
  'Hidráulica',
  'Pintura',
  'Gesso',
  'Esquadrias',
  'Cobertura',
  'Carpintaria',
  'Concretagem',
  'Impermeabilização',
  'Limpeza',
  'Transporte',
  'Outros',
] as const;

/** Versão atual do schema do JSON. Bump a cada mudança incompatível + adicionar migration. */
export const CURRENT_SCHEMA_VERSION = 4;
