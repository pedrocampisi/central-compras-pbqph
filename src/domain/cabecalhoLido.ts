/**
 * A IA monta o alto da OC a partir do orçamento (CTO-D805 §2, visão do Pedro
 * na D804): a mesma leitura do "Importar Pedido (IA)" propõe também o
 * fornecedor, a condição de pagamento, a entrega e os totais. A pessoa confere.
 *
 * Lógica pura, sem tela. O contrato com o Banco é o `cabecalho` da
 * `extrair-itens`: todos os campos são opcionais, e vazio quer dizer que o
 * papel não diz.
 *
 * As regras:
 * - **O fornecedor sai do CNPJ do emitente,** só entre os cadastrados. A IA
 *   nunca cadastra e nunca muda cadastro: sem cadastro, o campo fica vazio e a
 *   tela diz por quê.
 * - **A IA não pisa no que a pessoa pôs.** O campo que ela já preencheu à mão
 *   fica como está, e a tela diz o que o papel dizia. Quem decide se o campo
 *   está livre é a tela (`livre`); aqui só se obedece.
 * - **A obra e as observações não entram:** são da pessoa.
 */

import { somaDias } from './qualificacao';
import { formatDate } from './format';
import { entraNaOc, motivoForaDaOc, agruparPorEmpresa, escolherEmpresa } from './fornecedores';
import type { Fornecedor, OrdemCompra } from './types';

/** Os campos do alto que a leitura pode preencher. */
export type CampoDoAlto = 'fornecedor' | 'condicao' | 'entrega' | 'frete' | 'outras' | 'desconto';

/** O `cabecalho` da `extrair-itens`, já conferido. Vazio (`''`/`null`): o papel não diz. */
export interface CabecalhoLido {
  /** 14 dígitos, de quem EMITIU o orçamento; `''` sem CNPJ. */
  cnpj_emitente: string;
  condicao_pagamento: string;
  entrega_texto: string;
  entrega_dias: number | null;
  /** AAAA-MM-DD. */
  entrega_data: string;
  frete: number | null;
  outras_despesas: number | null;
  desconto: number | null;
  total: number | null;
  /** A dúvida da leitura sobre o cabeçalho. */
  confira: string;
}

export const SEM_CADASTRO = 'o CNPJ do orçamento não está no cadastro';
export const SEM_CNPJ = 'o orçamento não traz o CNPJ de quem o emitiu';
export const DOIS_CADASTROS = 'o CNPJ do orçamento está em mais de uma empresa do cadastro';

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const reais = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null;

function diaValido(dia: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) && !Number.isNaN(Date.parse(`${dia}T00:00:00Z`));
}

/** O `cabecalho` como veio do servidor; `null` se não veio (a v4 não manda). */
export function cabecalhoDoServidor(v: unknown): CabecalhoLido | null {
  if (!v || typeof v !== 'object') return null;
  const c = v as Record<string, unknown>;
  const cnpj = texto(c['cnpj_emitente']).replace(/\D/g, '');
  const dias = c['entrega_dias'];
  const data = texto(c['entrega_data']);
  return {
    // Só CNPJ: 14 dígitos. CPF (11) ou número quebrado não vale.
    cnpj_emitente: cnpj.length === 14 ? cnpj : '',
    condicao_pagamento: texto(c['condicao_pagamento']),
    entrega_texto: texto(c['entrega_texto']),
    entrega_dias: typeof dias === 'number' && Number.isInteger(dias) && dias > 0 && dias <= 365 ? dias : null,
    entrega_data: diaValido(data) ? data : '',
    frete: reais(c['frete']),
    outras_despesas: reais(c['outras_despesas']),
    desconto: reais(c['desconto']),
    total: reais(c['total']),
    confira: texto(c['confira']),
  };
}

export type FornecedorDoCnpj =
  | { tipo: 'achou'; id: string }
  | { tipo: 'nao_achou'; porque: string };

/**
 * A filial do cadastro com o CNPJ do orçamento. Bate a filial exata: é ela que
 * entra, e não a principal da empresa. Fora da OC (inativa, bloqueada, fora da
 * lista de material) não entra, e a frase diz o motivo.
 */
export function fornecedorDoCnpj(cnpj: string, todos: readonly Fornecedor[]): FornecedorDoCnpj {
  if (!cnpj) return { tipo: 'nao_achou', porque: SEM_CNPJ };
  const iguais = todos.filter((f) => (f.cnpj ?? '').replace(/\D/g, '') === cnpj);
  if (iguais.length === 0) return { tipo: 'nao_achou', porque: SEM_CADASTRO };
  const empresas = agruparPorEmpresa([...iguais]);
  if (empresas.length > 1) return { tipo: 'nao_achou', porque: DOIS_CADASTROS };
  // O mesmo CNPJ duas vezes na mesma empresa: a regra de sempre escolhe.
  const id = iguais.length === 1 ? iguais[0]!.id : escolherEmpresa(empresas[0], '');
  const f = iguais.find((x) => x.id === id) ?? iguais[0]!;
  if (!entraNaOc(f)) return { tipo: 'nao_achou', porque: `o fornecedor do CNPJ do orçamento está ${motivoForaDaOc(f)}` };
  return { tipo: 'achou', id: f.id };
}

/** Dia da semana de AAAA-MM-DD: 0 domingo, 6 sábado. */
function diaDaSemana(dia: string): number {
  return new Date(`${dia}T12:00:00Z`).getUTCDay();
}

/** N dias úteis depois do dia: de segunda a sexta, sem contar feriados. */
export function somaDiasUteis(dia: string, n: number): string {
  let d = dia;
  for (let falta = n; falta > 0; ) {
    d = somaDias(d, 1);
    const s = diaDaSemana(d);
    if (s !== 0 && s !== 6) falta -= 1;
  }
  return d;
}

const ehUteis = (t: string) => /\buteis\b/.test(t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());

/**
 * A entrega que o papel diz, e como se chegou nela. A data impressa vale como
 * está; o prazo em dias conta a partir da Data da OC — em dias úteis quando o
 * papel diz "úteis" (de segunda a sexta, sem feriados), senão em dias corridos.
 * Sem nada no papel: `null`, e fica o automático (a Data mais um dia).
 */
export function entregaDoPapel(cab: CabecalhoLido, dataDaOc: string): { data: string; como: string } | null {
  const comoEsta = cab.entrega_texto ? `"${cab.entrega_texto}"` : '';
  if (cab.entrega_data) return { data: cab.entrega_data, como: comoEsta || formatDate(cab.entrega_data) };
  if (!cab.entrega_dias || !diaValido(dataDaOc)) return null;
  const n = cab.entrega_dias;
  const desde = `a partir da Data da OC (${formatDate(dataDaOc)})`;
  return ehUteis(cab.entrega_texto)
    ? { data: somaDiasUteis(dataDaOc, n), como: `${comoEsta}: ${n} dias úteis ${desde}, de segunda a sexta, sem contar feriados` }
    : { data: somaDias(dataDaOc, n), como: `${comoEsta || `${n} dias`}: ${n} dias corridos ${desde}` };
}

/** O que a leitura faz no alto da OC. */
export interface Preenchimento {
  mudancas: Partial<Pick<OrdemCompra, 'fornecedor_id' | 'condicao_pagamento' | 'entrega_prevista' | 'frete' | 'outras_despesas' | 'desconto_material'>>;
  /** O "confira" de cada campo que a leitura preencheu. */
  confira: Partial<Record<CampoDoAlto, string>>;
  /** O campo que a pessoa já tinha preenchido, e o que o papel dizia. */
  naoPisou: Partial<Record<CampoDoAlto, string>>;
  /** Por que o fornecedor ficou vazio; `''` quando entrou ou já estava escolhido. */
  semFornecedor: string;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function preencherDoCabecalho(
  oc: Pick<OrdemCompra, 'data'>,
  cab: CabecalhoLido,
  todos: readonly Fornecedor[],
  livre: (c: CampoDoAlto) => boolean,
): Preenchimento {
  const p: Preenchimento = { mudancas: {}, confira: {}, naoPisou: {}, semFornecedor: '' };
  const propoe = (c: CampoDoAlto, aplica: () => void, confira: string, oPapelDiz: string) => {
    if (livre(c)) {
      aplica();
      p.confira[c] = confira;
    } else {
      p.naoPisou[c] = oPapelDiz;
    }
  };

  const f = fornecedorDoCnpj(cab.cnpj_emitente, todos);
  if (f.tipo === 'achou') {
    const id = f.id;
    propoe('fornecedor', () => (p.mudancas.fornecedor_id = id), 'Escolhido pelo CNPJ do orçamento. Confira.', 'outro fornecedor, pelo CNPJ');
  } else if (livre('fornecedor')) {
    p.semFornecedor = f.porque;
  }

  const cond = cab.condicao_pagamento;
  if (cond) propoe('condicao', () => (p.mudancas.condicao_pagamento = cond), 'Lida do orçamento, como está escrita. Confira.', `"${cond}"`);

  const entrega = entregaDoPapel(cab, oc.data);
  if (entrega) {
    propoe('entrega', () => (p.mudancas.entrega_prevista = entrega.data), `Do orçamento — ${entrega.como}. Confira.`, entrega.como);
  }

  const valores: [CampoDoAlto, number | null, 'frete' | 'outras_despesas' | 'desconto_material'][] = [
    ['frete', cab.frete, 'frete'],
    ['outras', cab.outras_despesas, 'outras_despesas'],
    ['desconto', cab.desconto, 'desconto_material'],
  ];
  for (const [c, v, campo] of valores) {
    if (v == null) continue;
    propoe(c, () => (p.mudancas[campo] = v), 'Lido do orçamento. Confira.', brl(v));
  }
  return p;
}

/** O total do orçamento ao lado do da OC; `null` quando o papel não traz total. */
export function conferenciaDoTotal(totalDoOrcamento: number | null, totalDaOc: number) {
  if (totalDoOrcamento == null) return null;
  const centavos = Math.round(totalDaOc * 100) - Math.round(totalDoOrcamento * 100);
  return { orcamento: totalDoOrcamento, oc: totalDaOc, diferenca: centavos / 100, bate: centavos === 0 };
}

/** Os nomes dos campos, para a frase do "ficou o seu". */
export const NOME_DO_CAMPO: Record<CampoDoAlto, string> = {
  fornecedor: 'Fornecedor',
  condicao: 'Condição de pagamento',
  entrega: 'Entrega prevista',
  frete: 'Frete',
  outras: 'Outras despesas',
  desconto: 'Desconto material',
};
