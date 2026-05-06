/**
 * Migração v1 → v2
 * Promove `config.emitente` (objeto único legado) para `config.emitentes` (array).
 * Referência: normalizeData() legado, CentralCompras-PBQPH.html linha 873-883.
 */

type Raw = Record<string, unknown>;

export function migrateV1toV2(raw: Raw): Raw {
  const cfg = (raw['config'] as Raw) ?? {};

  // Se já tem emitentes[] populado, apenas avança a versão
  if (Array.isArray(cfg['emitentes']) && (cfg['emitentes'] as unknown[]).length > 0) {
    return { ...raw, schema_version: 2 };
  }

  // Promove legado config.emitente → emitentes[0]
  const legacyEmitente = cfg['emitente'] as Raw | undefined;
  const emitentes: Raw[] =
    legacyEmitente?.['razao_social']
      ? [{ id: 'emit-legacy-01', tipo: 'PJ', ...legacyEmitente }]
      : [];

  return {
    ...raw,
    schema_version: 2,
    config: {
      ...cfg,
      emitentes,
    },
  };
}
