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
 *   tela diz por quê. **Sem CNPJ, sai pelo nome impresso** (CTO-D888 §2,
 *   D888b): a mesma busca do campo Fornecedor, e a matriz, como na escolha à mão.
 * - **O desconto nunca entra duas vezes, e a OC fecha no rodapé** (CTO-D888 §1):
 *   quando as linhas trazem o total impresso, a conta delas decide se o
 *   desconto do rodapé já está nelas, e a diferença de arredondamento do papel
 *   entra declarada, nunca calada e nunca espalhada pelas linhas.
 * - **A IA não pisa no que a pessoa pôs.** O campo que ela já preencheu à mão
 *   fica como está, e a tela diz o que o papel dizia. Quem decide se o campo
 *   está livre é a tela (`livre`); aqui só se obedece.
 * - **A obra e as observações não entram:** são da pessoa.
 */

import { somaDias } from './qualificacao';
import { formatDate } from './format';
import { entraNaOc, motivoForaDaOc, agruparPorEmpresa, escolherEmpresa, opcoesDeEmpresa } from './fornecedores';
import { filtrarOpcoes } from './pesquisa';
import { emCentavos } from './numericDoBanco';
import type { LinhasDoPapel } from './linhaDoPapel';
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
  /** O SUB-TOTAL do rodapé, como impresso. */
  subtotal: number | null;
  /** A leitura diz que o desconto do rodapé é a soma dos das linhas; `null`: não diz. */
  desconto_nas_linhas: boolean | null;
  /** A razão social ou a fantasia de quem emitiu, como impressa; `''` se o papel não diz. */
  nome_emitente: string;
  /** A dúvida da leitura sobre o cabeçalho. */
  confira: string;
}

export const SEM_CADASTRO = 'o CNPJ do orçamento não está no cadastro';
export const SEM_CNPJ = 'o orçamento não traz o CNPJ de quem o emitiu';
export const DOIS_CADASTROS = 'o CNPJ do orçamento está em mais de uma empresa do cadastro';
export const NOME_SEM_CADASTRO = 'o orçamento não traz CNPJ, e o nome de quem o emitiu não está no cadastro';
export const NOME_EM_VARIAS = 'o orçamento não traz CNPJ, e o nome de quem o emitiu casa com mais de uma empresa do cadastro';
export const NOME_SEM_FILIAL = 'o orçamento não traz CNPJ, e a empresa do nome dele não tem filial que receba OC';

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const reais = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null;

function diaValido(dia: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) && !Number.isNaN(Date.parse(`${dia}T00:00:00Z`));
}

/**
 * O `cabecalho` como veio do servidor; `null` se não veio (a v4 não manda) ou
 * se veio todo vazio. A v24 manda as dez chaves sempre, e a lista de materiais
 * colada não é orçamento: sem nada no papel, a tela não fala do alto da OC.
 */
export function cabecalhoDoServidor(v: unknown): CabecalhoLido | null {
  if (!v || typeof v !== 'object') return null;
  const c = v as Record<string, unknown>;
  const cnpj = texto(c['cnpj_emitente']).replace(/\D/g, '');
  const dias = c['entrega_dias'];
  const data = texto(c['entrega_data']);
  const lido: CabecalhoLido = {
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
    subtotal: reais(c['subtotal']),
    desconto_nas_linhas: typeof c['desconto_nas_linhas'] === 'boolean' ? c['desconto_nas_linhas'] : null,
    nome_emitente: texto(c['nome_emitente']).slice(0, 160),
    confira: texto(c['confira']),
  };
  // A marca sozinha não é papel: um `false` com tudo vazio continua "não veio".
  const campos: unknown[] = Object.entries(lido).filter(([k]) => k !== 'desconto_nas_linhas').map(([, v]) => v);
  return campos.some((x) => x !== '' && x !== null) ? lido : null;
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

/** As palavras do nome que não dizem a empresa: a forma jurídica. */
const FORMA_JURIDICA = new Set(['ltda', 'me', 'epp', 'eireli', 'sa', 'mei', 'cia']);
const semAcento = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * A empresa do cadastro pelo nome impresso no orçamento, quando ele não traz
 * CNPJ (CTO-D888 §2). A busca é a do campo Fornecedor (`opcoesDeEmpresa` e
 * `filtrarOpcoes`: o apelido, a razão social e a fantasia de qualquer filial,
 * com todas as palavras); a pontuação e a forma jurídica ("LTDA", "ME") saem
 * do nome antes. Uma empresa só casa: entra a matriz, pela `escolherEmpresa`,
 * como na escolha à mão (D549; a palavra do Pedro na D888b: "Ela tem que
 * escolher a matriz"). Nenhuma, ou mais de uma: vazio, com o porquê.
 */
export function fornecedorDoNome(nome: string, todos: readonly Fornecedor[]): FornecedorDoCnpj {
  const palavras = nome
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((p) => p && !FORMA_JURIDICA.has(semAcento(p)));
  if (palavras.length === 0) return { tipo: 'nao_achou', porque: SEM_CNPJ };
  const empresas = agruparPorEmpresa([...todos]);
  const casaram = filtrarOpcoes(opcoesDeEmpresa(empresas), palavras.join(' '));
  if (casaram.length === 0) return { tipo: 'nao_achou', porque: NOME_SEM_CADASTRO };
  if (casaram.length > 1) return { tipo: 'nao_achou', porque: NOME_EM_VARIAS };
  const id = escolherEmpresa(empresas.find((g) => g.chave === casaram[0]!.valor), '');
  return id ? { tipo: 'achou', id } : { tipo: 'nao_achou', porque: NOME_SEM_FILIAL };
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
  /** O que a conta do papel decidiu sobre o desconto e o total, em frase; `''` sem nada a dizer. */
  contaDoPapel: string;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** O desconto do rodapé e o arredondamento do papel, decididos pela conta (CTO-D888 §1, D889). */
export interface ContaDoRodape {
  /** O que vai ao "Desconto material" pelo desconto do papel; `null`: nada. */
  desconto: number | null;
  /** O rodapé menos as linhas, em reais: negativo, o rodapé é menor. 0 quando fecha. */
  arredondamento: number;
  /** A frase para a pessoa; `''` quando não há o que dizer. */
  frase: string;
}

/**
 * Com as linhas do papel (todas com o total impresso) e o TOTAL do rodapé:
 *   - as linhas já dão o total → o desconto do rodapé já está nelas, e não
 *     entra de novo;
 *   - as linhas menos o desconto dão o total → o desconto entra;
 *   - nenhuma das duas → o desconto não entra, e a frase diz que a conta não
 *     fecha (a conferência do total mostra a diferença).
 * "Dar o total" admite 1 centavo por linha (o arredondamento do papel), e essa
 * diferença entra declarada. Sem as linhas do papel, vale a marca da leitura
 * (`desconto_nas_linhas`): `true` não entra, `false` entra, e `null` (a leitura
 * não soube, ou é a leitura antiga, sem a marca) não preenche sozinha e pede à
 * pessoa (D890, a regra do Banco na D888 §4).
 */
export function contaDoRodape(cab: CabecalhoLido, papel: LinhasDoPapel | null): ContaDoRodape {
  const desc = cab.desconto && cab.desconto > 0 ? cab.desconto : null;
  const jaNasLinhas = desc != null ? `O desconto do orçamento (${brl(desc)}) já está nos preços das linhas.` : '';
  if (!papel || cab.total == null) {
    if (desc == null || cab.desconto_nas_linhas === false) return { desconto: desc, arredondamento: 0, frase: '' };
    if (cab.desconto_nas_linhas === true) return { desconto: null, arredondamento: 0, frase: jaNasLinhas };
    return {
      desconto: null,
      arredondamento: 0,
      frase: `O orçamento diz um desconto de ${brl(desc)}, e a leitura não soube se ele já está nos preços das linhas. Se não estiver, ponha no "Desconto material".`,
    };
  }
  const c = (v: number | null) => Math.round((v ?? 0) * 100);
  const linhas = c(papel.soma) + c(cab.frete) + c(cab.outras_despesas);
  const total = c(cab.total);
  const cabe = (diferenca: number) => Math.abs(diferenca) <= papel.linhas;
  const declara = (diferenca: number, antes: string) =>
    (diferenca === 0
      ? antes
      : `${antes} As linhas do orçamento somam ${brl(papel.soma)} e o total dele diz ${brl(cab.total!)}: a diferença de ${brl(Math.abs(diferenca) / 100)} entra como arredondamento do orçamento.`
    ).trim();

  if (cabe(total - linhas)) {
    return { desconto: null, arredondamento: (total - linhas) / 100, frase: declara(total - linhas, jaNasLinhas) };
  }
  if (desc != null && cabe(total - (linhas - c(desc)))) {
    const d = total - (linhas - c(desc));
    return { desconto: desc, arredondamento: d / 100, frase: declara(d, '') };
  }
  return {
    desconto: null,
    arredondamento: 0,
    frase: desc != null
      ? `As linhas do orçamento somam ${brl(papel.soma)}, e a conta não chega ao total dele (${brl(cab.total)}) nem com o desconto de ${brl(desc)}, nem sem ele. O desconto não entrou: confira.`
      : '',
  };
}

export function preencherDoCabecalho(
  oc: Pick<OrdemCompra, 'data'>,
  cab: CabecalhoLido,
  todos: readonly Fornecedor[],
  livre: (c: CampoDoAlto) => boolean,
  papel: LinhasDoPapel | null = null,
): Preenchimento {
  const p: Preenchimento = { mudancas: {}, confira: {}, naoPisou: {}, semFornecedor: '', contaDoPapel: '' };
  const propoe = (c: CampoDoAlto, aplica: () => void, confira: string, oPapelDiz: string) => {
    if (livre(c)) {
      aplica();
      p.confira[c] = confira;
    } else {
      p.naoPisou[c] = oPapelDiz;
    }
  };

  // Com CNPJ, vale o CNPJ, como sempre; sem ele, o nome impresso (D888 §2).
  const peloNome = !cab.cnpj_emitente && !!cab.nome_emitente;
  const f = peloNome ? fornecedorDoNome(cab.nome_emitente, todos) : fornecedorDoCnpj(cab.cnpj_emitente, todos);
  if (f.tipo === 'achou') {
    const id = f.id;
    propoe(
      'fornecedor',
      () => (p.mudancas.fornecedor_id = id),
      peloNome ? 'Escolhido pelo nome do orçamento. Confira.' : 'Escolhido pelo CNPJ do orçamento. Confira.',
      peloNome ? 'outro fornecedor, pelo nome' : 'outro fornecedor, pelo CNPJ',
    );
  } else if (livre('fornecedor')) {
    p.semFornecedor = f.porque;
  }

  const cond = cab.condicao_pagamento;
  if (cond) propoe('condicao', () => (p.mudancas.condicao_pagamento = cond), 'Lida do orçamento, como está escrita. Confira.', `"${cond}"`);

  const entrega = entregaDoPapel(cab, oc.data);
  if (entrega) {
    propoe('entrega', () => (p.mudancas.entrega_prevista = entrega.data), `Do orçamento — ${entrega.como}. Confira.`, entrega.como);
  }

  // O arredondamento mora nos campos de hoje (a escolha A da D889): para
  // menos, no "Desconto material"; para mais, em "Outras despesas".
  const conta = contaDoRodape(cab, papel);
  p.contaDoPapel = conta.frase;
  const arred = conta.arredondamento;
  const mais = (a: number | null, b: number) => (a == null && b === 0 ? null : Math.round(((a ?? 0) + b) * 100) / 100);
  const LIDO = 'Lido do orçamento. Confira.';
  const ARREDONDADO = 'Com o arredondamento do orçamento (veja acima). Confira.';
  const valores: [CampoDoAlto, number | null, 'frete' | 'outras_despesas' | 'desconto_material', string][] = [
    ['frete', cab.frete, 'frete', LIDO],
    ['outras', mais(cab.outras_despesas, Math.max(arred, 0)), 'outras_despesas', arred > 0 ? ARREDONDADO : LIDO],
    ['desconto', mais(conta.desconto, Math.max(-arred, 0)), 'desconto_material', arred < 0 ? ARREDONDADO : LIDO],
  ];
  for (const [c, v, campo, confira] of valores) {
    if (v == null) continue;
    propoe(c, () => (p.mudancas[campo] = v), confira, brl(v));
  }
  return p;
}

/** O total do orçamento ao lado do da OC; `null` quando o papel não traz total. */
export function conferenciaDoTotal(totalDoOrcamento: number | null, totalDaOc: number) {
  if (totalDoOrcamento == null) return null;
  // O centavo da OC como o banco o arredonda (CTO-D960): 285,015 é 285,02.
  const centavos = emCentavos(totalDaOc) - emCentavos(totalDoOrcamento);
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
