/**
 * Migração v2 → v3
 * Acrescenta campos ricos nos ECRs: objetivo, escopo, ensaios[], amostragem,
 * registros[], responsabilidades, observacoes — todos com defaults vazios.
 * O conteúdo real foi preenchido via script de extração dos documentos DOCX.
 */

type Raw = Record<string, unknown>;

function migrateEcr(e: unknown): Raw {
  const ecr = (e as Raw) ?? {};
  return {
    objetivo: '',
    escopo: '',
    ensaios: [],
    amostragem: '',
    registros: [],
    responsabilidades: '',
    observacoes: '',
    // campos existentes sobrescrevem os defaults acima
    ...ecr,
  };
}

export function migrateV2toV3(raw: Raw): Raw {
  const ecrs = Array.isArray(raw['ecrs']) ? (raw['ecrs'] as unknown[]) : [];

  return {
    ...raw,
    schema_version: 3,
    ecrs: ecrs.map(migrateEcr),
  };
}
