/**
 * Funções de normalização — convertem dados brutos (unknown) nos tipos canônicos.
 * Usadas no load do JSON, ao criar novos registros e ao migrar dados legados.
 * Portadas de CentralCompras-PBQPH.html linhas 860-995.
 */

import type {
  Data,
  Ecr,
  Emitente,
  Fornecedor,
  Item,
  Obra,
  OrdemCompra,
} from './types';
import {
  DataSchema,
  EcrSchema,
  EmitenteSchema,
  FornecedorSchema,
  ItemSchema,
  ObraSchema,
  OrdemCompraSchema,
} from './schemas/data.schema';
import { uid } from './id';
import { nowIso, todayIso } from './format';
import { STATUS_OC } from './constants';

// ── Helpers internos ─────────────────────────────────────────────────────────

/** Converte qualquer valor para número, retornando 0 em caso de falha. */
function toNum(v: unknown): number {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Garante retorno de array — nunca undefined. */
function asArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Normaliza objeto de endereço genérico. */
function normalizeEndereco(e: unknown): {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
} {
  const o = (e as Record<string, unknown>) ?? {};
  return {
    logradouro: String(o['logradouro'] ?? ''),
    numero: String(o['numero'] ?? ''),
    complemento: String(o['complemento'] ?? ''),
    bairro: String(o['bairro'] ?? ''),
    cidade: String(o['cidade'] ?? ''),
    uf: String(o['uf'] ?? ''),
    cep: String(o['cep'] ?? ''),
  };
}

// ── Converters para sub-itens de ECR ─────────────────────────────────────────

function toNormaItem(n: unknown): { codigo: string; titulo: string } {
  if (typeof n === 'string') return { codigo: '', titulo: n };
  const o = (n as Record<string, unknown>) ?? {};
  return { codigo: String(o['codigo'] ?? ''), titulo: String(o['titulo'] ?? '') };
}

function toDocItem(x: unknown): { nome: string; periodicidade: string; observacao: string } {
  if (typeof x === 'string') return { nome: x, periodicidade: '', observacao: '' };
  const o = (x as Record<string, unknown>) ?? {};
  return {
    nome: String(o['nome'] ?? ''),
    periodicidade: String(o['periodicidade'] ?? ''),
    observacao: String(o['observacao'] ?? ''),
  };
}

function toCritItem(x: unknown): {
  criterio: string;
  tolerancia: string;
  metodo: string;
  registro: string;
} {
  if (typeof x === 'string') return { criterio: x, tolerancia: '', metodo: '', registro: '' };
  const o = (x as Record<string, unknown>) ?? {};
  return {
    criterio: String(o['criterio'] ?? ''),
    tolerancia: String(o['tolerancia'] ?? ''),
    metodo: String(o['metodo'] ?? ''),
    registro: String(o['registro'] ?? ''),
  };
}

function toEnsaioItem(x: unknown): {
  nome: string;
  metodo: string;
  periodicidade: string;
  amostragem: string;
} {
  if (typeof x === 'string') return { nome: x, metodo: '', periodicidade: '', amostragem: '' };
  const o = (x as Record<string, unknown>) ?? {};
  return {
    nome: String(o['nome'] ?? ''),
    metodo: String(o['metodo'] ?? ''),
    periodicidade: String(o['periodicidade'] ?? ''),
    amostragem: String(o['amostragem'] ?? ''),
  };
}

// ── Funções públicas de normalização ─────────────────────────────────────────

export function normalizeItem(it: unknown): Item {
  const o = (it as Record<string, unknown>) ?? {};
  const ecrId = o['ecr_id'];
  const raw = {
    id: String(o['id'] ?? uid('item')),
    ecr_id: ecrId != null && toNum(ecrId) !== 0 ? toNum(ecrId) : null,
    material_id: String(o['material_id'] ?? ''),
    descricao: String(o['descricao'] ?? ''),
    observacao: String(o['observacao'] ?? ''),
    quantidade: toNum(o['quantidade']),
    unidade: String(o['unidade'] ?? 'un'),
    preco_unit: toNum(o['preco_unit']),
    ipi_pct: toNum(o['ipi_pct']),
    desc_pct: toNum(o['desc_pct']),
    prazo_entrega: String(o['prazo_entrega'] ?? ''),
  };
  return ItemSchema.parse(raw);
}

export function normalizeOC(oc: unknown): OrdemCompra {
  const o = (oc as Record<string, unknown>) ?? {};
  const raw = {
    id: String(o['id'] ?? uid('oc')),
    numero: String(o['numero'] ?? ''),
    sequencial: toNum(o['sequencial']),
    ano: toNum(o['ano']) || new Date().getFullYear(),
    data: String(o['data'] ?? todayIso()),
    status: STATUS_OC.includes(o['status'] as (typeof STATUS_OC)[number])
      ? o['status']
      : 'rascunho',
    fornecedor_id: String(o['fornecedor_id'] ?? ''),
    obra_id: String(o['obra_id'] ?? ''),
    condicao_pagamento: String(o['condicao_pagamento'] ?? ''),
    emitente_id: String(o['emitente_id'] ?? ''),
    itens: asArr(o['itens']).map(normalizeItem),
    frete: toNum(o['frete']),
    outras_despesas: toNum(o['outras_despesas']),
    desconto_material: toNum(o['desconto_material']),
    observacoes: String(o['observacoes'] ?? ''),
    criado_em: String(o['criado_em'] ?? nowIso()),
    atualizado_em: String(o['atualizado_em'] ?? nowIso()),
    pdf_gerado_em: String(o['pdf_gerado_em'] ?? ''),
  };
  return OrdemCompraSchema.parse(raw);
}

export function normalizeFornecedor(f: unknown): Fornecedor {
  const o = (f as Record<string, unknown>) ?? {};
  const tel = asArr<unknown>(o['telefones']);
  const raw = {
    id: String(o['id'] ?? uid('forn')),
    razao_social: String(o['razao_social'] ?? ''),
    nome_fantasia: String(o['nome_fantasia'] ?? ''),
    cnpj: String(o['cnpj'] ?? ''),
    ie: String(o['ie'] ?? ''),
    endereco: normalizeEndereco(o['endereco']),
    telefones: [String(tel[0] ?? ''), String(tel[1] ?? '')] as [string, string],
    email: String(o['email'] ?? ''),
    contato_responsavel: String(o['contato_responsavel'] ?? ''),
    ecrs_atende: asArr<unknown>(o['ecrs_atende']).map(toNum),
    observacoes: String(o['observacoes'] ?? ''),
    ativo: o['ativo'] !== false,
    criado_em: String(o['criado_em'] ?? nowIso()),
    atualizado_em: String(o['atualizado_em'] ?? nowIso()),
  };
  return FornecedorSchema.parse(raw);
}

export function normalizeObra(obra: unknown): Obra {
  const o = (obra as Record<string, unknown>) ?? {};
  const raw = {
    id: String(o['id'] ?? uid('obra')),
    nome: String(o['nome'] ?? ''),
    cei: String(o['cei'] ?? ''),
    endereco: normalizeEndereco(o['endereco']),
    telefone: String(o['telefone'] ?? ''),
    responsavel: String(o['responsavel'] ?? ''),
    observacoes: String(o['observacoes'] ?? ''),
    ativa: o['ativa'] !== false,
    pasta_oc_path: String(o['pasta_oc_path'] ?? ''),
    criado_em: String(o['criado_em'] ?? nowIso()),
    atualizado_em: String(o['atualizado_em'] ?? nowIso()),
  };
  return ObraSchema.parse(raw);
}

export function normalizeEcr(ecr: unknown): Ecr {
  const o = (ecr as Record<string, unknown>) ?? {};
  const id = toNum(o['id']);
  const raw = {
    id,
    codigo: String(o['codigo'] ?? `ECR ${String(id).padStart(2, '0')}`),
    nome: String(o['nome'] ?? ''),
    categoria: String(o['categoria'] ?? ''),
    objetivo: String(o['objetivo'] ?? ''),
    escopo: String(o['escopo'] ?? ''),
    normas: asArr(o['normas']).map(toNormaItem),
    unidades_padrao: asArr<string>(o['unidades_padrao']).length
      ? asArr<string>(o['unidades_padrao'])
      : ['un'],
    documentos_obrigatorios: asArr(o['documentos_obrigatorios']).map(toDocItem),
    criterios_recebimento: asArr(o['criterios_recebimento']).map(toCritItem),
    ensaios: asArr(o['ensaios']).map(toEnsaioItem),
    amostragem: String(o['amostragem'] ?? ''),
    registros: asArr<unknown>(o['registros']).map((r) =>
      typeof r === 'string' ? r : String((r as Record<string, unknown>)['nome'] ?? ''),
    ),
    responsabilidades: String(o['responsabilidades'] ?? ''),
    observacoes: String(o['observacoes'] ?? ''),
    materiais: asArr<Record<string, unknown>>(o['materiais']).map((m) => ({
      id: String(m['id'] ?? uid('mat')),
      descricao: String(m['descricao'] ?? ''),
      unidade_padrao: String(m['unidade_padrao'] ?? 'un'),
    })),
  };
  return EcrSchema.parse(raw);
}

export function normalizeEmitente(e: unknown): Emitente {
  const o = (e as Record<string, unknown>) ?? {};
  const tel = asArr<unknown>(o['telefones']);
  const raw = {
    id: String(o['id'] ?? uid('emit')),
    tipo: o['tipo'] === 'PF' ? 'PF' : 'PJ',
    razao_social: String(o['razao_social'] ?? ''),
    nome_fantasia: o['nome_fantasia'] != null ? String(o['nome_fantasia']) : undefined,
    cnpj: o['cnpj'] != null ? String(o['cnpj']) : undefined,
    cpf: o['cpf'] != null ? String(o['cpf']) : undefined,
    ie: o['ie'] != null ? String(o['ie']) : undefined,
    email_envio_nf: String(o['email_envio_nf'] ?? ''),
    telefones: [String(tel[0] ?? ''), String(tel[1] ?? '')] as [string, string],
    endereco: normalizeEndereco(o['endereco']),
  };
  return EmitenteSchema.parse(raw);
}

/**
 * Normaliza o objeto raiz do JSON.
 * Assume que as migrações de schema já foram aplicadas (runMigrations).
 * Aceita dados parciais/legados e produz um Data completo e tipado.
 */
export function normalizeData(raw: unknown): Data {
  const safe = (raw as Record<string, unknown>) ?? {};
  const cfgRaw = (safe['config'] as Record<string, unknown>) ?? {};

  // ── Emitentes: preferir array; fallback: promover emitente legado ──────────
  let emitentes: Emitente[] = [];
  if (Array.isArray(cfgRaw['emitentes']) && cfgRaw['emitentes'].length > 0) {
    emitentes = (cfgRaw['emitentes'] as unknown[]).map(normalizeEmitente);
  } else if (cfgRaw['emitente'] != null && typeof cfgRaw['emitente'] === 'object') {
    const leg = cfgRaw['emitente'] as Record<string, unknown>;
    if (leg['razao_social']) {
      emitentes = [normalizeEmitente({ id: 'emit-legacy-01', ...leg })];
    }
  }

  return DataSchema.parse({
    ...safe,
    config: {
      ...cfgRaw,
      emitentes,
      ultimo_numero_oc: toNum(cfgRaw['ultimo_numero_oc']),
      ano_corrente: toNum(cfgRaw['ano_corrente']) || new Date().getFullYear(),
      condicoes_pagamento:
        Array.isArray(cfgRaw['condicoes_pagamento']) && cfgRaw['condicoes_pagamento'].length > 0
          ? cfgRaw['condicoes_pagamento']
          : [],
    },
    fornecedores: asArr(safe['fornecedores']).map(normalizeFornecedor),
    obras: asArr(safe['obras']).map(normalizeObra),
    ecrs: asArr(safe['ecrs']).map(normalizeEcr),
    ordens_compra: asArr(safe['ordens_compra']).map(normalizeOC),
  });
}
