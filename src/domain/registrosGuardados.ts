/**
 * O registro do fornecedor no escritório (CTO-D811 §4, D812 §2, D813 §4): o
 * papel que a ECR pede, já guardado, como a tela da qualificação o mostra.
 *
 * - **Cada papel guardado aparece com o alcance** e a data, por ECR, ao lado do
 *   que a revisão vigente da ECR pede. O comprador vê o que falta.
 * - **O comprador corrige o alcance** (ajuste 1 da D812), e a correção fica
 *   escrita: quem, quando, de quê para quê. Quem decide a quem o papel vale é o
 *   alcance; o caminho por onde ele entrou fica só anotado.
 * - **O "deste lote" precisa da OC** em que chegou: pela qualificação, só o
 *   "vale até" e o "vale para o produto"; pelo "Anexar" na OC, os três.
 * - **Na ECR com a marca "a cada entrega"** (01, 02, 17), o lote precisa da
 *   entrega (D840 §2.3): pela OC, ele não entra, e a tela manda à lista das
 *   entregas sem papel; pela entrega, ele é o único, sem escolha. O "vale até" e
 *   o "produto" guardam o papel, mas não cobrem a entrega (Banco-D840, escolha 1).
 * - **O aviso de 30 dias** fica aqui, como o da qualificação.
 *
 * Lógica pura, sem tela. Quem diz se a obra pede o papel de novo é o banco
 * (`compras.registro_pede`); aqui nada decide isso.
 */

import { formatDate, formatTimestamp } from './format';
import { somaDias } from './qualificacao';
import { ALCANCES, textoDoAlcance, type Alcance } from './registroDoFornecedor';

/** Uma correção do alcance, como a `registros_do_fornecedor_correcoes` guarda. */
export interface CorrecaoDoAlcance {
  alcanceAntes: Alcance;
  validoAteAntes: string;
  alcanceDepois: Alcance;
  validoAteDepois: string;
  motivo: string;
  corrigidoPorNome: string;
  corrigidoEm: string;
}

export type EntrouPor = 'recebimento' | 'qualificacao' | 'oc' | 'lista';

/** Um papel guardado (`compras.registros_do_fornecedor`), com as correções dele, da mais antiga à última. */
export interface RegistroGuardado {
  id: number;
  documentoId: string;
  ecrId: number;
  /** A empresa: a raiz, ou o fornecedor sem raiz. Um dos dois. */
  empresaRaizId: string | null;
  fornecedorId: string | null;
  alcance: Alcance;
  /** AAAA-MM-DD, só no `vale_ate`; '' nos outros. */
  validoAte: string;
  /** A OC em que chegou; '' quando entrou pela qualificação. */
  ocId: string;
  /** A entrega que o papel de lote nomeia (`avaliacao_id`); 0 quando não nomeia (o pedido 3 da D840 ao Banco). */
  avaliacaoId: number;
  entrouPor: EntrouPor;
  conferidoPorNome: string;
  conferidoEm: string;
  correcoes: CorrecaoDoAlcance[];
}

/** A marca "a cada entrega" de uma ECR (`compras.ecrs_registro_a_cada_entrega`). */
export interface MarcaACadaEntrega {
  ecrId: number;
  porque: string;
}

export interface RegistrosDoFornecedor {
  registros: RegistroGuardado[];
  marcas: MarcaACadaEntrega[];
}

/** Na qualificação, o lote não entra: ele precisa da OC em que chegou (a trava do banco). */
export const ALCANCES_DA_QUALIFICACAO: readonly Alcance[] = ALCANCES.filter((a) => a !== 'lote');

/** Por onde o papel entra no escritório: a qualificação, o "Anexar" na OC, ou a entrega da lista sem papel (D840 §2.5). */
export type PorOndeAnexa = 'qualificacao' | 'oc' | 'entrega';

/**
 * Os alcances que um papel aceita: o lote só com a OC; na ECR com a marca, o
 * lote só com a entrega, e pela entrega ele é o único.
 */
export function alcancesPossiveis(porOnde: PorOndeAnexa, aCadaEntrega = false): readonly Alcance[] {
  if (porOnde === 'qualificacao') return ALCANCES_DA_QUALIFICACAO;
  if (!aCadaEntrega) return ALCANCES;
  return porOnde === 'entrega' ? ['lote'] : ALCANCES_DA_QUALIFICACAO;
}

/** "ECR 02", pelo id. */
export const codigoDaEcr = (ecrId: number) => `ECR ${String(ecrId).padStart(2, '0')}`;

/** O que a janela diz embaixo do alcance, pela entrada e pela marca da ECR. */
export function dicasDoAlcance(porOnde: PorOndeAnexa, ecrId: number, aCadaEntrega: boolean): string[] {
  if (aCadaEntrega && porOnde === 'entrega') return ['Este papel vale para esta entrega.'];
  if (aCadaEntrega) {
    return [
      `A ${codigoDaEcr(ecrId)} pede o papel a cada entrega: anexe pela entrega, em Recebimentos, na lista das entregas sem papel.`,
      'Aqui, o "vale até" e o "vale para o produto" guardam o papel, mas não cobrem as entregas desta ECR.',
    ];
  }
  if (porOnde === 'qualificacao') return ['O papel deste lote se anexa na OC em que ele chegou, em Ordens de compra.'];
  return [];
}

/** O alcance por extenso, para os botões de escolha. */
export const NOME_DO_ALCANCE: Record<Alcance, string> = {
  lote: 'Deste lote',
  vale_ate: 'Vale até uma data',
  produto: 'Vale para o produto, sem prazo',
};

const ENTROU_POR: Record<EntrouPor, string> = {
  recebimento: 'chegou com o material, na obra',
  oc: 'anexado na OC',
  lista: 'anexado na entrega, pela lista das entregas sem papel',
  qualificacao: 'anexado na qualificação',
};

export type Vigencia = 'vale' | 'vence_em_30_dias' | 'vencido' | 'lote' | 'produto';

/** O papel no dia `hoje`: o "vale até" vale, vence em 30 dias, ou venceu; os outros não vencem. */
export function vigenciaDoRegistro(r: Pick<RegistroGuardado, 'alcance' | 'validoAte'>, hoje: string): Vigencia {
  if (r.alcance !== 'vale_ate') return r.alcance;
  if (r.validoAte < hoje) return 'vencido';
  return r.validoAte <= somaDias(hoje, 30) ? 'vence_em_30_dias' : 'vale';
}

/** O alcance, e a vigência quando ela pede atenção. */
export function textoDaVigencia(r: Pick<RegistroGuardado, 'alcance' | 'validoAte'>, hoje: string): string {
  const v = vigenciaDoRegistro(r, hoje);
  if (v === 'vencido') return `Venceu em ${formatDate(r.validoAte)}`;
  if (v === 'vence_em_30_dias') return `Vence em ${formatDate(r.validoAte)}, em menos de 30 dias`;
  return textoDoAlcance(r.alcance, r.validoAte);
}

/** Quem conferiu, quando, e por onde o papel entrou. */
export function quemConferiu(r: Pick<RegistroGuardado, 'entrouPor' | 'conferidoPorNome' | 'conferidoEm'>): string {
  const quando = r.conferidoEm ? formatTimestamp(r.conferidoEm) : '';
  return [ENTROU_POR[r.entrouPor], `conferido por ${r.conferidoPorNome || 'alguém sem nome'}`, quando]
    .filter(Boolean)
    .join(' · ');
}

/**
 * "cobre a entrega de 14/10, OC 2026/101": o papel de lote que nomeia a entrega
 * (D840 §2.4); '' nos outros. Sem o dia da entrega (a leitura não chegou), só a OC.
 */
export function textoDaEntregaCoberta(
  r: Pick<RegistroGuardado, 'alcance' | 'avaliacaoId'>,
  recebidoEm: string,
  numeroDaOc: string,
): string {
  if (r.alcance !== 'lote' || !r.avaliacaoId) return '';
  const oc = `OC ${numeroDaOc || '(sem número)'}`;
  const dia = /^\d{4}-\d{2}-\d{2}/.test(recebidoEm) ? `${recebidoEm.slice(8, 10)}/${recebidoEm.slice(5, 7)}` : '';
  return dia ? `cobre a entrega de ${dia}, ${oc}` : `cobre uma entrega da ${oc}`;
}

/** Uma correção numa linha: 'Corrigido de "Deste lote" para "Vale até 30/06/2027" — Fulano, 15/10/2026 21:00. Motivo: …'. */
export function textoDaCorrecao(c: CorrecaoDoAlcance): string {
  const de = textoDoAlcance(c.alcanceAntes, c.validoAteAntes);
  const para = textoDoAlcance(c.alcanceDepois, c.validoAteDepois);
  const quem = [c.corrigidoPorNome, c.corrigidoEm ? formatTimestamp(c.corrigidoEm) : ''].filter(Boolean).join(', ');
  return `Corrigido de "${de}" para "${para}" — ${quem}.${c.motivo ? ` Motivo: ${c.motivo}` : ''}`;
}

/**
 * Os papéis de uma ECR para uma empresa (a chave da tela, `chaveDaEmpresa`),
 * os que pedem atenção primeiro e, dentro disso, o mais novo no alto.
 * `chaveDoFornecedor` dá a chave do fornecedor que ganhou empresa depois.
 */
export function registrosDaEcr(
  registros: readonly RegistroGuardado[],
  chave: string,
  ecrId: number,
  chaveDoFornecedor: (fornecedorId: string) => string | undefined,
  hoje: string,
): RegistroGuardado[] {
  const ordem: Record<Vigencia, number> = { vencido: 0, vence_em_30_dias: 1, vale: 2, produto: 2, lote: 3 };
  return registros
    .filter((r) => r.ecrId === ecrId)
    .filter((r) =>
      (r.empresaRaizId ?? chaveDoFornecedor(r.fornecedorId ?? '') ?? `filial:${r.fornecedorId}`) === chave)
    .sort(
      (a, b) =>
        ordem[vigenciaDoRegistro(a, hoje)] - ordem[vigenciaDoRegistro(b, hoje)] ||
        b.conferidoEm.localeCompare(a.conferidoEm) ||
        b.id - a.id,
    );
}

const NAO_APLICAVEL = /^\s*n[ãa]o\s+aplic[áa]vel\s*\.?\s*$/i;

/**
 * O que a tela diz de uma ECR, na ordem das regras do "pede" do banco
 * (`compras.registro_pede`, CTO-D818 §2): a primeira que vale.
 *
 * 1. a seção diz só "Não aplicável": nenhuma entrega pede;
 * 2. a marca "a cada entrega": a caixa dela já diz, e o aviso fica '';
 * 3. já chegou um papel de lote da empresa: cada entrega pede, mesmo com outro valendo;
 * 4. um "vale até" que vale hoje, e 5. um "vale para o produto": nada a avisar;
 * 6. o resto: o "vale até" venceu, ou nada guardado.
 */
export function avisoDaEcr(
  papeis: readonly RegistroGuardado[],
  hoje: string,
  ecr: { itens: readonly { texto: string }[] | null; temMarca: boolean },
): string {
  if (ecr.itens && ecr.itens.length > 0 && ecr.itens.every((i) => NAO_APLICAVEL.test(i.texto))) {
    return 'A ECR diz "Não aplicável" no registro do fornecedor: nenhuma entrega pede o papel.';
  }
  if (ecr.temMarca) return '';
  if (papeis.some((r) => r.alcance === 'lote')) {
    return 'Esta empresa já mandou papel valendo só para o lote: cada entrega pede o papel, mesmo com outro guardado.';
  }
  const vigencias = papeis.map((r) => vigenciaDoRegistro(r, hoje));
  if (vigencias.some((v) => v === 'vale' || v === 'vence_em_30_dias' || v === 'produto')) return '';
  if (vigencias.includes('vencido')) return 'O papel que valia até uma data venceu. A próxima entrega vai pedir de novo.';
  return 'Nenhum papel guardado para esta ECR.';
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** O que falta para guardar ou corrigir; '' quando pode. */
export function problemaDoAlcance(alcance: Alcance | null, validoAte: string, permitidos: readonly Alcance[]): string {
  if (!alcance) return 'Escolha a quem o papel vale.';
  if (!permitidos.includes(alcance)) return 'O papel "deste lote" se anexa na OC em que chegou.';
  if (alcance === 'vale_ate' && !DIA.test(validoAte)) return 'Escreva até quando o papel vale.';
  return '';
}

/** A correção não muda nada: o banco recusaria ("nada a corrigir"). */
export function correcaoSemMudanca(
  r: Pick<RegistroGuardado, 'alcance' | 'validoAte'>,
  alcance: Alcance,
  validoAte: string,
): boolean {
  return r.alcance === alcance && (alcance !== 'vale_ate' || r.validoAte === validoAte);
}
