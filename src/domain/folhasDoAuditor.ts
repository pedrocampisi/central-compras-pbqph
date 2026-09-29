/**
 * O que vai nas duas folhas do auditor (CTO-D604 §3.5), separado do desenho
 * para o teste ler sem PDF:
 *
 * - a lista de qualificados, no desenho da FO 8.4.1.1: uma seção por aba (as
 *   cinco), as mesmas colunas — fornecedor, tipo, a data da qualificação, a
 *   de requalificar, os três critérios com "x", a nota e a situação, que a
 *   planilha deixava em branco e aqui vem calculada pelo banco. Só a linha
 *   que vale de cada empresa. Sai inteira: é da empresa, não da obra;
 * - as avaliações de entrega (PS.02, 8.4.1.2), uma linha por entrega. Com a
 *   máscara da D599 ligada, a carga já trouxe só as da obra.
 */

import { hojeEmSaoPaulo } from './ecr';
import { agruparPorEmpresa } from './fornecedores';
import { dataBr, nomeDasEcrs, pedeTratativa, type Categoria, type LinhaDeQualificacao, type Situacao } from './qualificacao';
import type { Fornecedor, Obra, OrdemCompra } from './types';

const SITUACAO: Record<Situacao, string> = {
  qualificada: 'Qualificada',
  // "até": o auditor lê ao pé da letra, e a data está na coluna ao lado (CTO-D614 §2.2).
  vence_em_30_dias: 'Vence em até 30 dias',
  vencida: 'Vencida',
  desqualificada: 'Desqualificada',
  sem_qualificacao: 'Sem qualificação',
};

export interface SecaoDosQualificados {
  categoria: Categoria;
  nome: string;
  criterios: string[];
  /** Fornecedor, tipo, qualificada em, requalificar, os três "x", nota, situação — e as ECRs, em material. */
  linhas: string[][];
}

/** O nome da empresa na folha: o apelido do grupo (o mesmo da lista da OC), ou o do fornecedor sem raiz. */
function nomes(fornecedores: readonly Fornecedor[]): (l: LinhaDeQualificacao) => string {
  const porChave = new Map(agruparPorEmpresa([...fornecedores]).map((g) => [g.chave, g.apelido]));
  return (l) =>
    (l.empresaRaizId ? porChave.get(l.empresaRaizId) : porChave.get(`filial:${l.fornecedorId}`)) ||
    'Empresa fora do cadastro da OC';
}

export function secoesDosQualificados(
  linhas: readonly LinhaDeQualificacao[],
  categorias: readonly { categoria: Categoria; nome: string; criterios: string[] }[],
  fornecedores: readonly Fornecedor[],
): SecaoDosQualificados[] {
  const nome = nomes(fornecedores);
  return categorias.map((c) => ({
    categoria: c.categoria,
    nome: c.nome,
    criterios: c.criterios,
    linhas: linhas
      .filter((l) => l.vigente && l.categoria === c.categoria)
      .map((l) => ({ l, empresa: nome(l) }))
      .sort((a, b) => a.empresa.localeCompare(b.empresa, 'pt-BR') || a.l.tipo.localeCompare(b.l.tipo, 'pt-BR'))
      .map(({ l, empresa }) => [
        empresa,
        l.tipo || '—',
        dataBr(l.qualificadaEm),
        dataBr(l.venceEm),
        ...l.criterios.map((k) => (k.atende ? 'x' : '')),
        String(l.nota),
        SITUACAO[l.situacao],
        ...(c.categoria === 'material' ? [nomeDasEcrs(l.ecrs) || '—'] : []),
      ]),
  }));
}

export interface AvaliacaoParaFolha {
  ocId: string;
  intervencaoId: string;
  notaFiscal: string;
  recebidoEm: string;
  prazoConforme: boolean;
  integridadeConforme: boolean;
  ocEcrConforme: boolean;
  observacao: string;
  tratativa: string;
  avaliadoPorNome: string;
  cienciaPorNome: string;
  cienciaEm: string;
}

const C = (ok: boolean) => (ok ? 'C' : 'NC');

/**
 * A coluna da ciência. "Aberta" só do que o Painel e a ciência oferecem: com
 * tratativa e duas ou mais "Não Conforme", a condição da `tratativas_abertas`
 * (perícia 28/09, B6). A data da ciência é a de Brasília (B7).
 */
function cienciaDaFolha(a: AvaliacaoParaFolha): string {
  if (!a.tratativa) return '—';
  if (a.cienciaPorNome) return `${a.cienciaPorNome}, ${dataBr(diaEmBrasilia(a.cienciaEm))}`;
  return pedeTratativa(a) ? 'Aberta' : '—';
}

/** O dia, em Brasília, de um instante do banco: primeiro converte, depois corta (perícia 28/09, B7). */
function diaEmBrasilia(instante: string): string {
  const t = Date.parse(instante);
  return Number.isNaN(t) ? instante.slice(0, 10) : hojeEmSaoPaulo(new Date(t));
}

/** OC, fornecedor, obra, NF, recebida em, prazo, integridade, OC/ECR, observação e tratativa, avaliada por, ciência. */
export function linhasDasAvaliacoes(
  avaliacoes: readonly AvaliacaoParaFolha[],
  ocs: readonly Pick<OrdemCompra, 'id' | 'numero' | 'fornecedor_id'>[],
  fornecedores: readonly Pick<Fornecedor, 'id' | 'razao_social'>[],
  obras: readonly Pick<Obra, 'id' | 'nome'>[],
): string[][] {
  const oc = new Map(ocs.map((o) => [o.id, o]));
  const forn = new Map(fornecedores.map((f) => [f.id, f.razao_social]));
  const obra = new Map(obras.map((o) => [o.id, o.nome]));
  return avaliacoes.map((a) => {
    const o = oc.get(a.ocId);
    return [
      o?.numero || '—',
      (o && forn.get(o.fornecedor_id)) || '—',
      obra.get(a.intervencaoId) || '—',
      a.notaFiscal,
      dataBr(a.recebidoEm),
      C(a.prazoConforme),
      C(a.integridadeConforme),
      C(a.ocEcrConforme),
      [a.observacao, a.tratativa && `Tratativa: ${a.tratativa}`].filter(Boolean).join(' · ') || '—',
      a.avaliadoPorNome || '—',
      cienciaDaFolha(a),
    ];
  });
}
