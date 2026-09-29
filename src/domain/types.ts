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
  // As duas bandeiras do banco (`core.fornecedores`). Quem fornece material
  // entra na lista da OC; quem só presta serviço, não. Opcionais porque o
  // formato antigo de arquivo (migrations/) não as conhece — e `undefined`
  // é diferente de `false`: a primeira é "o banco não disse", a segunda é
  // "o banco disse que não".
  fornece_material?: boolean;
  presta_servico?: boolean;
  /** O nome curto da EMPRESA (`core.empresa_raiz.apelido`), o que o Pedro usa
   *  ("Império das Tintas" para a filial da Beija Flor). Só para a pesquisa. */
  empresa_apelido?: string;
  /** A EMPRESA da filial (`core.fornecedor_resolvido.empresa_id`): quem agrupa
   *  as filiais na lista da OC é o banco, não a raiz do CNPJ (CTO-D542). */
  empresa_id?: string;
  /** Filial que não pode receber OC nova (BAIXADA na Receita, por exemplo). */
  bloqueado_para_compra_nova?: boolean;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Quem recebe a nota fiscal de uma obra — a empresa (`nf_empresa_id`) ou o
 * cliente (`nf_cliente_id`) que o cadastro da obra aponta, no Central. A OC
 * não escolhe: lê (CTO-D390, 14/09/2026).
 */
export interface Destinatario {
  nome: string;
  /** Só dígitos: 11 (pf) ou 14 (pj) — o grão do banco. */
  documento: string;
  tipo: 'pf' | 'pj';
  /** O que o cadastro tiver; pode vir vazio para pessoa física. */
  endereco: Endereco;
}

export interface Obra {
  id: string;
  nome: string;
  cei: string;
  endereco: Endereco;
  /** Ausente = a obra não tem destinatário da nota cadastrado; ela não emite OC. */
  destinatario?: Destinatario;
  telefone: string;
  responsavel: string;
  observacoes: string;
  ativa: boolean;
  pasta_oc_path: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Material {
  id: string;
  descricao: string;
  unidade_padrao: string;
}

/** Uma linha de uma seção da ECR (CTO-D586). */
export interface EcrItem {
  /** O que vem antes do primeiro ":" (até 4 palavras), ou `null`. */
  rotulo: string | null;
  texto: string;
  /** A linha está na lista do documento; fora dela é nota. */
  numerado: boolean;
}

export interface EcrSecao {
  titulo: string;
  itens: EcrItem[];
}

/**
 * Uma linha do histórico de revisões da ECR, como a tabela do rodapé do
 * documento (CTO-D588): revisão, data, descrição, quem revisou e quem aprovou.
 */
export interface EcrRevisao {
  revisao: string;
  /** AAAA-MM-DD, ou `null` se a linha não tem data. */
  data: string | null;
  descricao: string;
  revisado_por: string;
  aprovado_por: string;
}

export interface Ecr {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  unidades_padrao: string[];
  materiais: Material[];
  /** A revisão vigente ("00"); `null` se a ECR ainda não foi carregada. */
  revisao: string | null;
  /** A data da revisão vigente (AAAA-MM-DD); `null` se ainda não carregada. */
  emitida_em: string | null;
  /**
   * As cinco seções da ECR, na ordem do documento (CTO-D586). `null` se a ECR
   * ainda não foi carregada. Os dez campos de antes (objetivo, escopo,
   * normas…) saíram do código (CTO-D596): o texto da ECR é só este.
   */
  secoes: EcrSecao[] | null;
  /**
   * O histórico de revisões, da mais antiga à vigente (CTO-D588). `null`
   * quando o sistema não leu o histórico — a tela diz isso, e não inventa
   * uma lista vazia.
   */
  revisoes: EcrRevisao[] | null;
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
  /**
   * Vazio enquanto a OC é rascunho: por decisão do Pedro (18/08/2026) o número
   * do PBQP-H só nasce na EMISSÃO. Rascunho aberto e descartado não queima
   * número, e buraco na sequência é pergunta de auditor.
   */
  numero: string;
  sequencial: number;
  ano: number;
  data: string;
  status: StatusOc;
  fornecedor_id: string;
  obra_id: string;
  condicao_pagamento: string;
  /**
   * Da lista antiga `compras.emitentes`, que a OC não lê mais desde 15/09/2026
   * (CTO-D390). Fica só para as OCs emitidas antes, até o banco aposentar a
   * coluna. Novas OCs nascem com ela vazia.
   */
  emitente_id: string;
  /**
   * A FOTOGRAFIA do destinatário da nota no dia da emissão: valor, não
   * ponteiro. A obra diz quem É o destinatário hoje; isto diz quem ERA. Vazio
   * em rascunho e nas OCs anteriores a 14/09/2026.
   */
  destinatario?: Destinatario;
  itens: Item[];
  frete: number;
  outras_despesas: number;
  desconto_material: number;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
  pdf_gerado_em: string;
  /**
   * Versão que o banco tem desta OC. Sobe a cada gravação e é o que impede
   * duas pessoas de se sobrescreverem em silêncio: mandamos a versão que
   * lemos, e o banco recusa se ele já estiver noutra. 0 = OC que ainda não
   * existe no banco.
   */
  versao: number;
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
