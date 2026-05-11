/**
 * Migração v3 → v4
 * Adiciona suporte ao módulo de Prestadores de Serviço (PBQP-H):
 *   - `prestadores_servico: PrestadorServico[]` — cadastro
 *   - `avaliacoes_prestadores: AvaliacaoPrestador[]` — avaliações periódicas
 *     (CONFORME / NÃO CONFORME para prazo, EPI e PES)
 *
 * Dados existentes recebem arrays vazios — sem perda nem reescrita de campos.
 */

type Raw = Record<string, unknown>;

export function migrateV3toV4(raw: Raw): Raw {
  return {
    ...raw,
    schema_version: 4,
    prestadores_servico: Array.isArray(raw['prestadores_servico'])
      ? raw['prestadores_servico']
      : [],
    avaliacoes_prestadores: Array.isArray(raw['avaliacoes_prestadores'])
      ? raw['avaliacoes_prestadores']
      : [],
  };
}
