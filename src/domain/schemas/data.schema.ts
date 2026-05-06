/**
 * Schemas Zod do JSON inteiro. Aceitam shapes incompletos via .default()/.optional().
 * Os tipos canônicos em src/domain/types.ts são compatíveis com o shape após .parse().
 */

import { z } from 'zod';
import { STATUS_OC, TIPOS_EMITENTE } from '../constants';

// ── Endereço ────────────────────────────────────────────────────────────────
export const EnderecoSchema = z.object({
  logradouro: z.string().default(''),
  numero: z.string().default(''),
  complemento: z.string().default(''),
  bairro: z.string().default(''),
  cidade: z.string().default(''),
  uf: z.string().default(''),
  cep: z.string().default(''),
});

// ── Emitente ───────────────────────────────────────────────────────────────
export const EmitenteSchema = z.object({
  id: z.string(),
  tipo: z.enum(TIPOS_EMITENTE).default('PJ'),
  razao_social: z.string().default(''),
  nome_fantasia: z.string().default('').optional(),
  cnpj: z.string().default('').optional(),
  cpf: z.string().default('').optional(),
  ie: z.string().default('').optional(),
  email_envio_nf: z.string().default(''),
  telefones: z.tuple([z.string().default(''), z.string().default('')]).default(['', '']),
  endereco: EnderecoSchema.default({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  }),
});

// ── Fornecedor ──────────────────────────────────────────────────────────────
export const FornecedorSchema = z.object({
  id: z.string(),
  razao_social: z.string().default(''),
  nome_fantasia: z.string().default(''),
  cnpj: z.string().default(''),
  ie: z.string().default(''),
  endereco: EnderecoSchema.default({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  }),
  telefones: z.tuple([z.string().default(''), z.string().default('')]).default(['', '']),
  email: z.string().default(''),
  contato_responsavel: z.string().default(''),
  ecrs_atende: z.array(z.number()).default([]),
  observacoes: z.string().default(''),
  ativo: z.boolean().default(true),
  criado_em: z.string().default(''),
  atualizado_em: z.string().default(''),
});

// ── Obra ────────────────────────────────────────────────────────────────────
export const ObraSchema = z.object({
  id: z.string(),
  nome: z.string().default(''),
  cei: z.string().default(''),
  endereco: EnderecoSchema.default({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  }),
  telefone: z.string().default(''),
  responsavel: z.string().default(''),
  observacoes: z.string().default(''),
  ativa: z.boolean().default(true),
  pasta_oc_path: z.string().default(''),
  criado_em: z.string().default(''),
  atualizado_em: z.string().default(''),
});

// ── ECR ────────────────────────────────────────────────────────────────────
export const NormaSchema = z.object({ codigo: z.string().default(''), titulo: z.string().default('') });
export const DocumentoSchema = z.object({
  nome: z.string().default(''),
  periodicidade: z.string().default(''),
  observacao: z.string().default(''),
});
export const CriterioSchema = z.object({
  criterio: z.string().default(''),
  tolerancia: z.string().default(''),
  metodo: z.string().default(''),
  registro: z.string().default(''),
});
export const EnsaioSchema = z.object({
  nome: z.string().default(''),
  metodo: z.string().default(''),
  periodicidade: z.string().default(''),
  amostragem: z.string().default(''),
});
export const MaterialSchema = z.object({
  id: z.string(),
  descricao: z.string().default(''),
  unidade_padrao: z.string().default('un'),
});

export const EcrSchema = z.object({
  id: z.number(),
  codigo: z.string().default(''),
  nome: z.string().default(''),
  categoria: z.string().default(''),
  objetivo: z.string().default(''),
  escopo: z.string().default(''),
  normas: z.array(NormaSchema).default([]),
  unidades_padrao: z.array(z.string()).default(['un']),
  documentos_obrigatorios: z.array(DocumentoSchema).default([]),
  criterios_recebimento: z.array(CriterioSchema).default([]),
  ensaios: z.array(EnsaioSchema).default([]),
  amostragem: z.string().default(''),
  registros: z.array(z.string()).default([]),
  responsabilidades: z.string().default(''),
  observacoes: z.string().default(''),
  materiais: z.array(MaterialSchema).default([]),
});

// ── Item & OC ───────────────────────────────────────────────────────────────
export const ItemSchema = z.object({
  id: z.string(),
  ecr_id: z.number().nullable().default(null),
  material_id: z.string().default(''),
  descricao: z.string().default(''),
  observacao: z.string().default(''),
  quantidade: z.number().default(0),
  unidade: z.string().default('un'),
  preco_unit: z.number().default(0),
  ipi_pct: z.number().default(0),
  desc_pct: z.number().default(0),
  prazo_entrega: z.string().default(''),
});

export const OrdemCompraSchema = z.object({
  id: z.string(),
  numero: z.string().default(''),
  sequencial: z.number().default(0),
  ano: z.number().default(new Date().getFullYear()),
  data: z.string().default(''),
  status: z.enum(STATUS_OC).default('rascunho'),
  fornecedor_id: z.string().default(''),
  obra_id: z.string().default(''),
  condicao_pagamento: z.string().default(''),
  emitente_id: z.string().default(''),
  itens: z.array(ItemSchema).default([]),
  frete: z.number().default(0),
  outras_despesas: z.number().default(0),
  desconto_material: z.number().default(0),
  observacoes: z.string().default(''),
  criado_em: z.string().default(''),
  atualizado_em: z.string().default(''),
  pdf_gerado_em: z.string().default(''),
});

// ── Config ─────────────────────────────────────────────────────────────────
export const ConfigSchema = z.object({
  emitente: z.record(z.string(), z.unknown()).optional(),
  emitentes: z.array(EmitenteSchema).default([]),
  endereco_cobranca: EnderecoSchema.default({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  }),
  ultimo_numero_oc: z.number().default(0),
  ano_corrente: z.number().default(new Date().getFullYear()),
  condicoes_pagamento: z.array(z.string()).default([]),
  texto_condicoes_contratacao: z.string().default(''),
  texto_envio_nf: z.string().default(''),
  texto_qualidade: z.string().default(''),
  openrouter_api_key: z.string().default(''),
  pasta_backups: z.string().default(''),
});

// ── Data raiz ──────────────────────────────────────────────────────────────
export const DataSchema = z.object({
  schema_version: z.number().default(3),
  version: z.number().default(1),
  app_name: z.string().default('Central de Compras PBQP-H V2 - Campisi'),
  shared_file_name: z.string().default('central-compras-data.json'),
  seeded_at: z.string().default(''),
  last_saved: z.string().default(''),
  config: ConfigSchema.default(ConfigSchema.parse({})),
  fornecedores: z.array(FornecedorSchema).default([]),
  obras: z.array(ObraSchema).default([]),
  ecrs: z.array(EcrSchema).default([]),
  ordens_compra: z.array(OrdemCompraSchema).default([]),
});

export type DataParsed = z.infer<typeof DataSchema>;
