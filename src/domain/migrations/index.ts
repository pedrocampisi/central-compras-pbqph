/**
 * Pipeline de migrações de schema.
 * Aplica as migrações necessárias em ordem crescente de versão.
 * O JSON resultante pode então ser normalizado com normalizeData().
 *
 * Uso:
 *   const migrated = runMigrations(rawJson);
 *   const data = normalizeData(migrated);
 */

import { migrateV1toV2 } from './v1-to-v2';
import { migrateV2toV3 } from './v2-to-v3';

type Raw = Record<string, unknown>;

/**
 * Executa todas as migrações necessárias baseadas em `schema_version`.
 * Dados sem `schema_version` são tratados como v1.
 */
export function runMigrations(raw: unknown): unknown {
  let data = (raw as Raw) ?? {};
  const version = Number(data['schema_version'] ?? 1);

  if (version < 2) data = migrateV1toV2(data);
  if (version < 3) data = migrateV2toV3(data);

  return data;
}
