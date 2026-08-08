/**
 * Migração v4 → v5
 * Remove `config.openrouter_api_key` do JSON.
 *
 * A chave da OpenRouter saiu do navegador: a extração de itens por IA passou a
 * rodar numa função no servidor (Supabase Edge Function), com a chave nos
 * segredos do projeto. Um JSON antigo que ainda carregue a chave tem o campo
 * apagado aqui — inclusive para que backups gerados daqui em diante não a
 * propaguem.
 */

type Raw = Record<string, unknown>;

export function migrateV4toV5(raw: Raw): Raw {
  const config = { ...((raw['config'] as Raw) ?? {}) };
  delete config['openrouter_api_key'];
  return {
    ...raw,
    schema_version: 5,
    config,
  };
}
