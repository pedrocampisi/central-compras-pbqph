/**
 * O procedimento como vem do banco (CTO-D730 §2; o contrato é o §3 da carta do
 * Banco de 06/10, conferido pelo CTO na D733).
 *
 * - `core.procedimentos`: Código, Revisão e Data são colunas (`codigo`,
 *   `revisao`, `emitida_em`), e o resto do documento mora no jsonb `documento`.
 * - `core.procedimento_revisoes`: o histórico, uma linha por revisão.
 *
 * Aceita só a forma do contrato; o que não for texto vira texto vazio, e nada é
 * reescrito. Um bloco de tipo desconhecido não some calado: vira parágrafo com
 * o que houver de texto nele.
 *
 * O que a tela ainda mostra sem negrito: o texto dos quadros, dos itens de
 * lista, dos cartões e dos passos do fluxo, e o "?" das seções. Na Rev. 00
 * nenhum deles tem negrito.
 */

import type {
  Bloco,
  CartaoDoFluxo,
  Destaque,
  PassoDaSequencia,
  Procedimento,
  RevisaoDoProcedimento,
  Secao,
  TextoRico,
} from './procedimento';
import { CAMPOS_DO_CABECALHO, textoSimples } from './procedimento';

type Obj = Record<string, unknown>;

const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const texto = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** A frase com negrito: uma lista de `{texto, negrito}`, ou um texto simples. */
function rico(v: unknown): TextoRico {
  if (typeof v === 'string') return [{ texto: v, negrito: false }];
  return lista(v).map((p) => {
    const o = obj(p);
    return { texto: texto(o['texto']), negrito: o['negrito'] === true };
  });
}

/** A frase sem o negrito, para o que a tela mostra como texto simples. */
const simples = (v: unknown): string => textoSimples(rico(v));

/** O tom do aviso vira o destaque que desenha a faixa: `warn` é o aviso, `info` a informação. */
const TOM_DO_AVISO: Record<string, Destaque> = { warn: 'aviso', info: 'informacao' };

function bloco(v: unknown, i: number, secao: string): Bloco {
  const o = obj(v);
  const ancora = texto(o['ancora']) || `${secao}.b${i + 1}`;
  switch (o['tipo']) {
    case 'quadros':
      return {
        tipo: 'quadros',
        ancora,
        // O `endereco` (o link da planilha, na seção 6) não vira link: o quadro fica como texto (D732 §2).
        quadros: lista(o['itens']).map((q, k) => {
          const qo = obj(q);
          return { ancora: texto(qo['ancora']) || `${ancora}.${k + 1}`, titulo: texto(qo['titulo']), texto: simples(qo['texto']) };
        }),
      };
    case 'lista':
      return {
        tipo: 'lista',
        ancora,
        itens: lista(o['itens']).map((it, k) => {
          const io = obj(it);
          return { ancora: texto(io['ancora']) || `${ancora}.${k + 1}`, texto: simples(io['texto']) };
        }),
      };
    case 'tabela':
      return {
        tipo: 'tabela',
        ancora,
        colunas: lista(o['colunas']).map(texto),
        linhas: lista(o['linhas']).map((l, k) => {
          const lo = obj(l);
          return { ancora: texto(lo['ancora']) || `${ancora}.${k + 1}`, celulas: lista(lo['celulas']).map(rico) };
        }),
      };
    case 'historico':
      return { tipo: 'historico', ancora };
    case 'aviso':
      return { tipo: 'paragrafo', ancora, texto: rico(o['texto']), destaque: TOM_DO_AVISO[texto(o['tom'])] ?? 'aviso' };
    default:
      return { tipo: 'paragrafo', ancora, texto: rico(o['texto']), destaque: o['miudo'] === true ? 'miudo' : null };
  }
}

function secao(v: unknown, i: number): Secao {
  const o = obj(v);
  const ancora = texto(o['ancora']) || `secao-${i + 1}`;
  const numero = Number(o['numero']);
  return {
    numero: Number.isInteger(numero) && numero > 0 ? numero : i + 1,
    ancora,
    titulo: texto(o['titulo']),
    selo: texto(o['selo']),
    ajuda: simples(o['ajuda']),
    blocos: lista(o['blocos']).map((b, k) => bloco(b, k, ancora)),
  };
}

/** Os três campos do cabeçalho que têm `valor` no documento, pelo rótulo dele. */
function valorDoCabecalho(cabecalho: Obj[], rotulo: string): string {
  return texto(cabecalho.find((c) => texto(c['rotulo']) === rotulo)?.['valor']);
}

/**
 * O histórico como veio de `core.procedimento_revisoes`, ou `null` se não veio.
 * A ordem é a das ECRs: a data e, no empate, a chave.
 */
export function revisoesDoProcedimentoDoBanco(v: unknown): RevisaoDoProcedimento[] | null {
  if (!Array.isArray(v)) return null;
  const data = (o: Obj) => texto(o['emitida_em']);
  return v
    .map(obj)
    .sort((a, b) => data(a).localeCompare(data(b)) || Number(a['id'] ?? 0) - Number(b['id'] ?? 0))
    .map((o) => ({
      revisao: texto(o['revisao']),
      data: o['emitida_em'] == null ? null : texto(o['emitida_em']),
      descricao: texto(o['descricao']),
      revisado_por: texto(o['revisado_por_nome']),
      aprovado_por: texto(o['aprovado_por_nome']),
    }));
}

/** A linha de `core.procedimentos` com o histórico; `null` se não há documento nela. */
export function procedimentoDoBanco(linha: unknown, revisoes: unknown): Procedimento | null {
  const l = obj(linha);
  const doc = obj(l['documento']);
  if (!Array.isArray(doc['secoes'])) return null;
  const cabecalho = lista(doc['cabecalho']).map(obj);
  const fluxo = obj(doc['fluxo']);
  const sequencia = obj(fluxo['sequencia']);
  // O documento tem uma parte só no rodapé; se um dia vier mais de uma, vão todas, uma depois da outra.
  const rodape = lista(doc['rodape']).map(obj);
  return {
    codigo: texto(l['codigo']),
    titulo: texto(l['titulo']),
    subtitulo: texto(doc['subtitulo']),
    sobretitulo: texto(doc['linha_de_cima']),
    revisao: texto(l['revisao']),
    situacao: texto(cabecalho.find((c) => c['campo'] === 'revisao')?.['etiqueta']),
    data: texto(l['emitida_em']),
    responsavel: valorDoCabecalho(cabecalho, CAMPOS_DO_CABECALHO.responsavel),
    referencia: valorDoCabecalho(cabecalho, CAMPOS_DO_CABECALHO.referencia),
    escopo: valorDoCabecalho(cabecalho, CAMPOS_DO_CABECALHO.escopo),
    sumario: lista(obj(doc['sumario'])['itens']).map((it) => {
      const o = obj(it);
      return { texto: texto(o['texto']), ancora: texto(o['ancora']) };
    }),
    comoUsar: rico(doc['como_usar']),
    fluxo: {
      titulo: texto(fluxo['titulo']),
      introducao: simples(fluxo['texto']),
      cartoes: lista(fluxo['cartoes']).map((c): CartaoDoFluxo => {
        const o = obj(c);
        return { titulo: texto(o['titulo']), texto: simples(o['texto']), destino: texto(o['destino']) || null };
      }),
      tituloDaSequencia: texto(sequencia['titulo']),
      sequencia: lista(sequencia['passos']).map((p): PassoDaSequencia => {
        const o = obj(p);
        return { titulo: texto(o['rotulo']), texto: simples(o['texto']) };
      }),
    },
    secoes: lista(doc['secoes']).map(secao),
    rodape: rodape.length
      ? {
          titulo: rodape.map((r) => texto(r['titulo'])).filter(Boolean).join(' · '),
          texto: rodape.map((r) => texto(r['texto'])).filter(Boolean).join(' · '),
        }
      : null,
    revisoes: revisoesDoProcedimentoDoBanco(revisoes),
  };
}
