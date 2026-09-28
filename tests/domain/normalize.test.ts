/**
 * Testes das funções de normalização.
 * Verificam retrocompatibilidade com dados legados e defaults corretos.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeItem,
  normalizeOC,
  normalizeFornecedor,
  normalizeObra,
  normalizeEcr,
  normalizeEmitente,
} from '../../src/domain/normalize';

// ── normalizeItem ─────────────────────────────────────────────────────────────

describe('normalizeItem', () => {
  it('preenche defaults para objeto vazio', () => {
    const item = normalizeItem({ id: 'test-id' });
    expect(item.id).toBe('test-id');
    expect(item.quantidade).toBe(0);
    expect(item.unidade).toBe('un');
    expect(item.ecr_id).toBeNull();
    expect(item.preco_unit).toBe(0);
    expect(item.ipi_pct).toBe(0);
    expect(item.desc_pct).toBe(0);
  });

  it('gera id se ausente', () => {
    const item = normalizeItem({});
    expect(item.id).toMatch(/^item-/);
  });

  it('converte ecr_id 0 para null', () => {
    expect(normalizeItem({ id: 'i1', ecr_id: 0 }).ecr_id).toBeNull();
  });

  it('mantém ecr_id válido', () => {
    expect(normalizeItem({ id: 'i1', ecr_id: 5 }).ecr_id).toBe(5);
  });

  it('converte ecr_id null explícito para null', () => {
    expect(normalizeItem({ id: 'i1', ecr_id: null }).ecr_id).toBeNull();
  });

  it('converte strings numéricas em números', () => {
    const item = normalizeItem({ id: 'i1', quantidade: '5', preco_unit: '100.50' });
    expect(item.quantidade).toBe(5);
    expect(item.preco_unit).toBe(100.5);
  });
});

// ── normalizeFornecedor ───────────────────────────────────────────────────────

describe('normalizeFornecedor', () => {
  it('preenche todos os defaults', () => {
    const f = normalizeFornecedor({ id: 'forn-1' });
    expect(f.id).toBe('forn-1');
    expect(f.razao_social).toBe('');
    expect(f.ativo).toBe(true);
    expect(f.telefones).toEqual(['', '']);
    expect(f.ecrs_atende).toEqual([]);
    expect(f.endereco.logradouro).toBe('');
  });

  it('preserva ativo=false', () => {
    const f = normalizeFornecedor({ id: 'f1', ativo: false });
    expect(f.ativo).toBe(false);
  });

  it('gera id se ausente', () => {
    const f = normalizeFornecedor({});
    expect(f.id).toMatch(/^forn-/);
  });

  it('normaliza ecrs_atende convertendo para número', () => {
    const f = normalizeFornecedor({ id: 'f1', ecrs_atende: ['1', 2, '3'] });
    expect(f.ecrs_atende).toEqual([1, 2, 3]);
  });

  it('mantém telefones existentes', () => {
    const f = normalizeFornecedor({ id: 'f1', telefones: ['11 9999-0000', '11 3333-4444'] });
    expect(f.telefones).toEqual(['11 9999-0000', '11 3333-4444']);
  });

  it('normaliza endereço aninhado', () => {
    const f = normalizeFornecedor({ id: 'f1', endereco: { cidade: 'São Paulo', uf: 'SP' } });
    expect(f.endereco.cidade).toBe('São Paulo');
    expect(f.endereco.uf).toBe('SP');
    expect(f.endereco.logradouro).toBe('');
  });
});

// ── normalizeObra ─────────────────────────────────────────────────────────────

describe('normalizeObra', () => {
  it('preenche defaults para objeto mínimo', () => {
    const o = normalizeObra({ id: 'obra-1' });
    expect(o.id).toBe('obra-1');
    expect(o.nome).toBe('');
    expect(o.ativa).toBe(true);
    expect(o.pasta_oc_path).toBe('');
  });

  it('gera id se ausente', () => {
    const o = normalizeObra({});
    expect(o.id).toMatch(/^obra-/);
  });

  it('preserva ativa=false', () => {
    const o = normalizeObra({ id: 'o1', ativa: false });
    expect(o.ativa).toBe(false);
  });
});

// ── normalizeEcr ──────────────────────────────────────────────────────────────

const OS_DEZ_CAMPOS_VELHOS = [
  'normas',
  'documentos_obrigatorios',
  'criterios_recebimento',
  'ensaios',
  'amostragem',
  'registros',
  'responsabilidades',
  'observacoes',
  'objetivo',
  'escopo',
];

describe('normalizeEcr', () => {
  // Os dez campos de antes saíram (CTO-D596). O banco ainda os manda até a
  // carta do Banco tirar as colunas, e os arquivos antigos também os têm: a
  // ECR carrega igual, sem eles.
  it('descarta os dez campos velhos, e a ECR carrega igual', () => {
    const ecr = normalizeEcr({
      id: 1,
      codigo: 'ECR 01',
      objetivo: 'Garantir qualidade',
      escopo: 'Recebimento',
      normas: ['NBR 12345'],
      documentos_obrigatorios: ['NF-e'],
      criterios_recebimento: [{ criterio: 'Verificar embalagem' }],
      ensaios: ['Resistência'],
      amostragem: 'Por lote',
      registros: ['FVM'],
      responsabilidades: 'Almoxarife',
      observacoes: 'Nota velha',
    });
    expect(ecr.codigo).toBe('ECR 01');
    for (const campo of OS_DEZ_CAMPOS_VELHOS) expect(campo in ecr, campo).toBe(false);
  });

  it('gera código padrão se ausente', () => {
    expect(normalizeEcr({ id: 5 }).codigo).toBe('ECR 05');
    expect(normalizeEcr({ id: 12 }).codigo).toBe('ECR 12');
  });

  it('mantém unidades_padrao existentes', () => {
    const ecr = normalizeEcr({ id: 1, unidades_padrao: ['kg', 'sc'] });
    expect(ecr.unidades_padrao).toEqual(['kg', 'sc']);
  });

  it('usa ["un"] como default para unidades_padrao vazio', () => {
    expect(normalizeEcr({ id: 1 }).unidades_padrao).toEqual(['un']);
  });

  it('normaliza materiais', () => {
    const ecr = normalizeEcr({
      id: 1,
      materiais: [{ id: 'mat-1', descricao: 'Cimento CP-II', unidade_padrao: 'sc' }],
    });
    expect(ecr.materiais[0]).toEqual({ id: 'mat-1', descricao: 'Cimento CP-II', unidade_padrao: 'sc' });
  });

  it('gera id de material se ausente', () => {
    const ecr = normalizeEcr({ id: 1, materiais: [{ descricao: 'Areia' }] });
    expect(ecr.materiais[0]?.id).toMatch(/^mat-/);
  });
});

// ── normalizeOC ───────────────────────────────────────────────────────────────

describe('normalizeOC', () => {
  it('padrão status=rascunho para status inválido', () => {
    expect(normalizeOC({ id: 'oc-1', status: 'desconhecido' }).status).toBe('rascunho');
  });

  it('mantém status válidos', () => {
    for (const s of ['rascunho', 'emitida', 'entregue', 'cancelada'] as const) {
      expect(normalizeOC({ id: 'oc-1', status: s }).status).toBe(s);
    }
  });

  it('normaliza itens aninhados', () => {
    const oc = normalizeOC({ id: 'oc-1', itens: [{ id: 'it-1', quantidade: 5 }] });
    expect(oc.itens[0]?.quantidade).toBe(5);
    expect(oc.itens[0]?.ecr_id).toBeNull();
  });

  it('gera id se ausente', () => {
    expect(normalizeOC({}).id).toMatch(/^oc-/);
  });

  it('preenche defaults numéricos com zero', () => {
    const oc = normalizeOC({ id: 'oc-1' });
    expect(oc.frete).toBe(0);
    expect(oc.outras_despesas).toBe(0);
    expect(oc.desconto_material).toBe(0);
    expect(oc.sequencial).toBe(0);
  });
});

// ── normalizeEmitente ─────────────────────────────────────────────────────────

describe('normalizeEmitente', () => {
  it('padrão tipo=PJ', () => {
    expect(normalizeEmitente({ id: 'emit-1', razao_social: 'Campisi' }).tipo).toBe('PJ');
  });

  it('aceita tipo=PF', () => {
    expect(normalizeEmitente({ id: 'emit-1', tipo: 'PF', razao_social: 'João' }).tipo).toBe('PF');
  });

  it('gera id se ausente', () => {
    expect(normalizeEmitente({ razao_social: 'Campisi' }).id).toMatch(/^emit-/);
  });

  it('preenche telefones como tuple', () => {
    const e = normalizeEmitente({ id: 'e1', telefones: ['11 9999-0000'] });
    expect(e.telefones).toEqual(['11 9999-0000', '']);
  });
});
