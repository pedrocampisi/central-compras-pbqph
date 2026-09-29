/**
 * Migração v2 → v3
 * Acrescenta campos ricos nos ECRs: objetivo, escopo, ensaios[], amostragem,
 * registros[], responsabilidades, observacoes — todos com defaults vazios.
 * O conteúdo real foi preenchido via script de extração dos documentos DOCX.
 *
 * Esses campos saíram do código em 27/09/2026 (CTO-D596): o texto da ECR é o
 * das `secoes`. Este passo fica, porque é um degrau da escada de formatos dos
 * arquivos antigos (v1 → v5); o que ele acrescenta, o `normalizeEcr` descarta.
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
