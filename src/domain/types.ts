/**
 * Tipos canônicos do domínio Central de Compras.
 * Inferidos diretamente dos schemas Zod em src/domain/schemas/.
 */

import type { StatusOc, TipoEmitente } from './constants';

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Emitente {
  id: string;
  tipo: TipoEmitente;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  email_envio_nf: string;
  telefones: [string, string];
  endereco: Endereco;
}

export interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ie: string;
  endereco: Endereco;
  telefones: [string, string];
  email: string;
  contato_responsavel: string;
  ecrs_atende: number[];
  observacoes: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Obra {
  id: string;
  nome: string;
  cei: string;
  endereco: Endereco;
  telefone: string;
  responsavel: string;
  observacoes: string;
  ativa: boolean;
  pasta_oc_path: string;
  criado_em: string;
  atualizado_em: string;
}

export interface NormaTecnica {
  codigo: string;
  titulo: string;
}

export interface DocumentoObrigatorio {
  nome: string;
  periodicidade: string;
  observacao: string;
}

export interface CriterioRecebimento {
  criterio: string;
  tolerancia: string;
  metodo: string;
  registro: string;
}

export interface Ensaio {
  nome: string;
  metodo: string;
  periodicidade: string;
  amostragem: string;
}

export interface Material {
  id: string;
  descricao: string;
  unidade_padrao: string;
}

export interface Ecr {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  objetivo: string;
  escopo: string;
  normas: NormaTecnica[];
  unidades_padrao: string[];
  documentos_obrigatorios: DocumentoObrigatorio[];
  criterios_recebimento: CriterioRecebimento[];
  ensaios: Ensaio[];
  amostragem: string;
  registros: string[];
  responsabilidades: string;
  observacoes: string;
  materiais: Material[];
}

export interface Item {
  id: string;
  ecr_id: number | null;
  material_id: string;
  descricao: string;
  observacao: string;
  quantidade: number;
  unidade: string;
  preco_unit: number;
  ipi_pct: number;
  desc_pct: number;
  prazo_entrega: string;
}

export interface OrdemCompra {
  id: string;
  numero: string;
  sequencial: number;
  ano: number;
  data: string;
  status: StatusOc;
  fornecedor_id: string;
  obra_id: string;
  condicao_pagamento: string;
  emitente_id: string;
  itens: Item[];
  frete: number;
  outras_despesas: number;
  desconto_material: number;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
  pdf_gerado_em: string;
}

export interface Config {
  /** Legacy — mantido para retrocompat; novos códigos usam emitentes[]. */
  emitente?: Partial<Emitente>;
  emitentes: Emitente[];
  endereco_cobranca: Endereco;
  ultimo_numero_oc: number;
  ano_corrente: number;
  condicoes_pagamento: string[];
  texto_condicoes_contratacao: string;
  texto_envio_nf: string;
  texto_qualidade: string;
  openrouter_api_key: string;
  pasta_backups: string;
}

export interface Data {
  schema_version: number;
  version: number;
  app_name: string;
  shared_file_name: string;
  seeded_at: string;
  last_saved: string;
  config: Config;
  fornecedores: Fornecedor[];
  obras: Obra[];
  ecrs: Ecr[];
  ordens_compra: OrdemCompra[];
}
