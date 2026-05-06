/**
 * Testes das migrações de schema e do round-trip com o JSON de produção real.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { runMigrations } from '../../src/domain/migrations';
import { DataSchema } from '../../src/domain/schemas/data.schema';
import { normalizeData } from '../../src/domain/normalize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURE_PATH = join(__dirname, '../fixtures/central-compras-data.legacy.json');

// ── runMigrations ─────────────────────────────────────────────────────────────

describe('runMigrations', () => {
  it('trata dados sem schema_version como v1', () => {
    const v1: Record<string, unknown> = {
      config: {
        emitente: { id: 'emit-1', razao_social: 'Campisi Construtora', tipo: 'PJ' },
      },
    };
    const result = runMigrations(v1) as Record<string, unknown>;
    expect(result['schema_version']).toBe(3);

    const cfg = result['config'] as Record<string, unknown>;
    expect(Array.isArray(cfg['emitentes'])).toBe(true);
    expect((cfg['emitentes'] as unknown[]).length).toBe(1);
  });

  it('promove config.emitente legado para emitentes[0]', () => {
    const v1: Record<string, unknown> = {
      schema_version: 1,
      config: {
        emitente: {
          id: 'emit-legacy-01',
          razao_social: 'Campisi',
          tipo: 'PJ',
          cnpj: '12.345.678/0001-90',
        },
      },
    };
    const result = runMigrations(v1) as Record<string, unknown>;
    const cfg = result['config'] as Record<string, unknown>;
    const emitentes = cfg['emitentes'] as Record<string, unknown>[];
    expect(emitentes[0]?.['razao_social']).toBe('Campisi');
  });

  it('não duplica emitentes se emitentes[] já existe', () => {
    const data: Record<string, unknown> = {
      schema_version: 1,
      config: {
        emitente: { razao_social: 'Antigo' },
        emitentes: [{ id: 'e1', razao_social: 'Novo', tipo: 'PJ' }],
      },
    };
    const result = runMigrations(data) as Record<string, unknown>;
    const cfg = result['config'] as Record<string, unknown>;
    expect((cfg['emitentes'] as unknown[]).length).toBe(1);
    expect((cfg['emitentes'] as Record<string, unknown>[])[0]?.['razao_social']).toBe('Novo');
  });

  it('migra v2 → v3 (adiciona campos ricos nos ECRs)', () => {
    const v2: Record<string, unknown> = {
      schema_version: 2,
      config: { emitentes: [] },
      ecrs: [{ id: 1, nome: 'Cimento', normas: [], documentos_obrigatorios: [] }],
    };
    const result = runMigrations(v2) as Record<string, unknown>;
    expect(result['schema_version']).toBe(3);

    const ecrs = result['ecrs'] as Record<string, unknown>[];
    expect(ecrs[0]?.['objetivo']).toBeDefined();
    expect(ecrs[0]?.['escopo']).toBeDefined();
    expect(Array.isArray(ecrs[0]?.['ensaios'])).toBe(true);
  });

  it('campos existentes do ECR não são sobrescritos na migração v2→v3', () => {
    const v2: Record<string, unknown> = {
      schema_version: 2,
      config: { emitentes: [] },
      ecrs: [{ id: 1, nome: 'Cimento', objetivo: 'Garantir qualidade', ensaios: [] }],
    };
    const result = runMigrations(v2) as Record<string, unknown>;
    const ecrs = result['ecrs'] as Record<string, unknown>[];
    expect(ecrs[0]?.['objetivo']).toBe('Garantir qualidade');
  });

  it('não altera dados já em v3', () => {
    const v3: Record<string, unknown> = {
      schema_version: 3,
      config: { emitentes: [{ id: 'e1', razao_social: 'Campisi', tipo: 'PJ' }] },
      ecrs: [{ id: 1, objetivo: 'Recepcionar cimento com qualidade' }],
    };
    const result = runMigrations(v3) as Record<string, unknown>;
    expect(result['schema_version']).toBe(3);
    const ecrs = result['ecrs'] as Record<string, unknown>[];
    expect(ecrs[0]?.['objetivo']).toBe('Recepcionar cimento com qualidade');
  });

  it('encadeia v1 → v2 → v3 automaticamente', () => {
    const v1: Record<string, unknown> = {
      // sem schema_version = implicitamente v1
      config: { emitente: { razao_social: 'Campisi', tipo: 'PJ' } },
      ecrs: [{ id: 1, nome: 'Cimento' }],
    };
    const result = runMigrations(v1) as Record<string, unknown>;
    expect(result['schema_version']).toBe(3);
    // emitentes migrado
    const cfg = result['config'] as Record<string, unknown>;
    expect((cfg['emitentes'] as unknown[]).length).toBe(1);
    // campos ricos adicionados
    const ecrs = result['ecrs'] as Record<string, unknown>[];
    expect(typeof ecrs[0]?.['objetivo']).toBe('string');
  });
});

// ── Round-trip com fixture de produção real ───────────────────────────────────

describe('Round-trip com fixture de produção', () => {
  it('carrega e normaliza o JSON real sem erros', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const migrated = runMigrations(raw);
    const data = normalizeData(migrated);

    expect(data.config).toBeDefined();
    expect(Array.isArray(data.fornecedores)).toBe(true);
    expect(Array.isArray(data.obras)).toBe(true);
    expect(Array.isArray(data.ecrs)).toBe(true);
    expect(Array.isArray(data.ordens_compra)).toBe(true);
    expect(data.ecrs.length).toBeGreaterThan(0);
  });

  it('passa no DataSchema Zod após migração e normalização', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const migrated = runMigrations(raw);
    const normalized = normalizeData(migrated);
    // Não deve lançar ZodError
    const parsed = DataSchema.parse(normalized);
    expect(parsed.schema_version).toBe(3);
  });

  it('todos os 20 ECRs têm estrutura válida após migração', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const migrated = runMigrations(raw);
    const data = normalizeData(migrated);

    expect(data.ecrs.length).toBe(20);
    for (const ecr of data.ecrs) {
      expect(typeof ecr.id).toBe('number');
      expect(typeof ecr.nome).toBe('string');
      expect(typeof ecr.codigo).toBe('string');
      expect(Array.isArray(ecr.normas)).toBe(true);
      expect(typeof ecr.objetivo).toBe('string');
      expect(Array.isArray(ecr.ensaios)).toBe(true);
      expect(Array.isArray(ecr.criterios_recebimento)).toBe(true);
      expect(Array.isArray(ecr.materiais)).toBe(true);
    }
  });

  it('normas dos ECRs são objetos com codigo e titulo', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const data = normalizeData(runMigrations(raw));

    for (const ecr of data.ecrs) {
      for (const norma of ecr.normas) {
        expect(typeof norma.codigo).toBe('string');
        expect(typeof norma.titulo).toBe('string');
      }
    }
  });

  it('todos os itens de OC têm ecr_id null ou número', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const data = normalizeData(runMigrations(raw));

    for (const oc of data.ordens_compra) {
      for (const item of oc.itens) {
        expect(item.ecr_id === null || typeof item.ecr_id === 'number').toBe(true);
      }
    }
  });

  it('config.emitentes é array (migração de emitente legado)', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as unknown;
    const data = normalizeData(runMigrations(raw));
    expect(Array.isArray(data.config.emitentes)).toBe(true);
  });
});
