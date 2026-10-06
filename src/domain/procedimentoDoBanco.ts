/**
 * O procedimento como vem do banco (CTO-D730 §2: `core.procedimentos` e
 * `core.procedimento_revisoes`, plano do Banco de 06/10).
 *
 * ⚠️ A FORMA AINDA É A DO RAMO: a linha traz `codigo`, `titulo`, `revisao`,
 * `emitida_em` e o documento inteiro no jsonb `secoes`, na forma de
 * `domain/procedimento`. Quando a carta de fecho do Banco trouxer o contrato,
 * só este arquivo muda: a tela e o PDF leem `Procedimento`.
 *
 * Aceita só a forma esperada; o que não for texto vira texto vazio, e nada é
 * reescrito. Um bloco de tipo desconhecido não some calado: vira parágrafo com
 * o que houver de texto nele.
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

const DESTAQUES: readonly Destaque[] = ['aviso', 'informacao', 'miudo'];

function bloco(v: unknown, i: number, secao: string): Bloco {
  const o = obj(v);
  const ancora = texto(o['ancora']) || `${secao}.b${i + 1}`;
  switch (o['tipo']) {
    case 'quadros':
      return {
        tipo: 'quadros',
        ancora,
        quadros: lista(o['quadros']).map((q, k) => {
          const qo = obj(q);
          return { ancora: texto(qo['ancora']) || `${ancora}.${k + 1}`, titulo: texto(qo['titulo']), texto: texto(qo['texto']) };
        }),
      };
    case 'lista':
      return {
        tipo: 'lista',
        ancora,
        itens: lista(o['itens']).map((it, k) => {
          const io = obj(it);
          return { ancora: texto(io['ancora']) || `${ancora}.${k + 1}`, texto: texto(io['texto']) };
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
    default: {
      const d = o['destaque'];
      return {
        tipo: 'paragrafo',
        ancora,
        texto: rico(o['texto']),
        destaque: DESTAQUES.includes(d as Destaque) ? (d as Destaque) : null,
      };
    }
  }
}

function secao(v: unknown, i: number): Secao {
  const o = obj(v);
  const ancora = texto(o['ancora']) || `secao-${i + 1}`;
  return {
    numero: typeof o['numero'] === 'number' ? o['numero'] : i + 1,
    ancora,
    titulo: texto(o['titulo']),
    selo: texto(o['selo']),
    ajuda: texto(o['ajuda']),
    blocos: lista(o['blocos']).map((b, k) => bloco(b, k, ancora)),
  };
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
  const doc = obj(l['secoes']);
  if (!Array.isArray(doc['secoes'])) return null;
  const fluxo = obj(doc['fluxo']);
  const rodape = obj(doc['rodape']);
  return {
    codigo: texto(l['codigo']),
    titulo: texto(l['titulo']),
    subtitulo: texto(doc['subtitulo']),
    sobretitulo: texto(doc['sobretitulo']),
    revisao: texto(l['revisao']),
    situacao: texto(doc['situacao']),
    data: texto(l['emitida_em']),
    responsavel: texto(doc['responsavel']),
    referencia: texto(doc['referencia']),
    escopo: texto(doc['escopo']),
    comoUsar: rico(doc['comoUsar']),
    fluxo: {
      titulo: texto(fluxo['titulo']),
      introducao: texto(fluxo['introducao']),
      cartoes: lista(fluxo['cartoes']).map((c): CartaoDoFluxo => {
        const o = obj(c);
        return { titulo: texto(o['titulo']), texto: texto(o['texto']), destino: texto(o['destino']) || null };
      }),
      tituloDaSequencia: texto(fluxo['tituloDaSequencia']),
      sequencia: lista(fluxo['sequencia']).map((p): PassoDaSequencia => {
        const o = obj(p);
        return { titulo: texto(o['titulo']), texto: texto(o['texto']) };
      }),
    },
    secoes: lista(doc['secoes']).map(secao),
    rodape: rodape['titulo'] || rodape['texto'] ? { titulo: texto(rodape['titulo']), texto: texto(rodape['texto']) } : null,
    revisoes: revisoesDoProcedimentoDoBanco(revisoes),
  };
}
