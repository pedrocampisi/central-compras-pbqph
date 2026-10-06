/**
 * A forma do documento de procedimento, traduzida de `core.procedimento_fora_da_forma`
 * (a peça do Banco que a carga e a porta de revisar usam, CTO-D736). Devolve o que
 * está fora da forma, em palavras, ou `null`. Só para os testes: a prova de verdade
 * é a peça do Banco (CTO-D739 §1 mediu o rascunho nela: null).
 */

type Obj = Record<string, unknown>;

const DO_DOCUMENTO = ['objetivo', 'qualificacao', 'contratacao', 'avaliacao', 'laboratorios', 'registros', 'revisoes',
  'materiais', 'servicos', 'locacao', 'projetos'];

const ehObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const chaves = (v: unknown) => (ehObj(v) ? Object.keys(v).sort().join(',') : null);
const cheio = (v: unknown) => typeof v === 'string' && v.trim() !== '';
const lista = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);

function rico(v: unknown, obrigatorio: boolean): boolean {
  const l = lista(v);
  if (!l) return false;
  if (!l.every((t) => chaves(t) === 'negrito,texto' && typeof (t as Obj)['texto'] === 'string' && typeof (t as Obj)['negrito'] === 'boolean')) {
    return false;
  }
  return !obrigatorio || l.map((t) => (t as Obj)['texto']).join('').trim() !== '';
}

/** Toda chave `ancora`, em qualquer nível, menos as do sumário (`core.ancoras_do_procedimento`). */
export function ancorasDoDocumento(doc: Obj): unknown[] {
  const out: unknown[] = [];
  const anda = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(anda);
    else if (ehObj(v)) {
      for (const [k, x] of Object.entries(v)) {
        if (k === 'ancora') out.push(x);
        else anda(x);
      }
    }
  };
  anda(Object.fromEntries(Object.entries(doc).filter(([k]) => k !== 'sumario')));
  return out;
}

function bloco(b: Obj): boolean {
  const k = chaves(b);
  switch (b['tipo']) {
    case 'paragrafo':
      return k === 'ancora,miudo,texto,tipo' && typeof b['miudo'] === 'boolean' && rico(b['texto'], true);
    case 'aviso':
      return k === 'ancora,texto,tipo,tom' && (b['tom'] === 'info' || b['tom'] === 'warn') && rico(b['texto'], true);
    case 'quadros': {
      const itens = lista(b['itens']);
      return k === 'ancora,itens,tipo' && !!itens?.length && itens.every((i) => {
        const q = i as Obj;
        return (chaves(q) === 'ancora,texto,titulo' || chaves(q) === 'ancora,endereco,texto,titulo')
          && typeof q['ancora'] === 'string' && cheio(q['titulo']) && rico(q['texto'], true)
          && (!('endereco' in q) || cheio(q['endereco']));
      });
    }
    case 'tabela': {
      const colunas = lista(b['colunas']);
      const linhas = lista(b['linhas']);
      return k === 'ancora,colunas,linhas,tipo' && !!colunas?.length && colunas.every(cheio) && !!linhas?.length
        && linhas.every((l) => {
          const o = l as Obj;
          const celulas = lista(o['celulas']);
          return chaves(o) === 'ancora,celulas' && typeof o['ancora'] === 'string' && !!celulas
            && celulas.length === colunas.length && celulas.every((c) => rico(c, false));
        });
    }
    case 'lista': {
      const itens = lista(b['itens']);
      return k === 'ancora,itens,ordenada,tipo' && typeof b['ordenada'] === 'boolean' && !!itens?.length
        && itens.every((i) => chaves(i) === 'ancora,texto' && typeof (i as Obj)['ancora'] === 'string' && rico((i as Obj)['texto'], true));
    }
    case 'historico': {
      const colunas = lista(b['colunas']);
      return k === 'ancora,colunas,tipo' && !!colunas?.length && colunas.every(cheio);
    }
    default:
      return false;
  }
}

export function foraDaForma(doc: unknown): string | null {
  if (chaves(doc) !== 'cabecalho,como_usar,fluxo,linha_de_cima,rodape,secoes,subtitulo,sumario') return 'as partes de cima';
  const d = doc as Obj;
  if (!cheio(d['linha_de_cima']) || !cheio(d['subtitulo'])) return 'linha_de_cima e subtitulo';
  if (!rico(d['como_usar'], true)) return 'como_usar';

  const cab = lista(d['cabecalho']);
  if (!cab) return 'o cabecalho e uma lista';
  for (const c of cab) {
    const o = c as Obj;
    const k = chaves(o);
    const temCampo = ehObj(o) && 'campo' in o;
    const temValor = ehObj(o) && 'valor' in o;
    if (!k || !k.split(',').every((x) => ['campo', 'etiqueta', 'rotulo', 'valor'].includes(x)) || !cheio(o['rotulo'])
      || temCampo === temValor
      || (temCampo && !['codigo', 'revisao', 'emitida_em'].includes(o['campo'] as string))
      || (temValor && !cheio(o['valor'])) || ('etiqueta' in o && !cheio(o['etiqueta']))) {
      return 'campo do cabecalho';
    }
  }
  if (cab.filter((c) => 'campo' in (c as Obj)).map((c) => (c as Obj)['campo']).sort().join(',') !== 'codigo,emitida_em,revisao') {
    return 'codigo, revisao e data uma vez cada';
  }

  const su = d['sumario'] as Obj;
  const itens = lista(su?.['itens']);
  if (chaves(su) !== 'itens,rotulo' || !cheio(su['rotulo']) || !itens?.length
    || !itens.every((i) => chaves(i) === 'ancora,texto' && typeof (i as Obj)['ancora'] === 'string' && cheio((i as Obj)['texto']))) {
    return 'o sumario';
  }

  const f = d['fluxo'] as Obj;
  if (chaves(f) !== 'cartoes,sequencia,texto,titulo' || !cheio(f['titulo']) || !rico(f['texto'], true)) return 'o fluxo';
  const cartoes = lista(f['cartoes']);
  if (!cartoes?.length || !cartoes.every((c) => {
    const o = c as Obj;
    return chaves(o) === 'ancora,destino,texto,titulo,tom' && typeof o['ancora'] === 'string' && typeof o['destino'] === 'string'
      && cheio(o['tom']) && cheio(o['titulo']) && rico(o['texto'], true);
  })) {
    return 'os cartoes';
  }
  const seq = f['sequencia'] as Obj;
  const passos = lista(seq?.['passos']);
  if (chaves(seq) !== 'passos,titulo' || !cheio(seq['titulo']) || !passos?.length || !passos.every((p) => {
    const o = p as Obj;
    return chaves(o) === 'ancora,rotulo,texto' && typeof o['ancora'] === 'string' && cheio(o['rotulo']) && rico(o['texto'], true);
  })) {
    return 'a sequencia';
  }

  const rodape = lista(d['rodape']);
  if (!rodape || !rodape.every((r) => chaves(r) === 'texto,titulo' && cheio((r as Obj)['titulo']) && cheio((r as Obj)['texto']))) {
    return 'o rodape';
  }

  const secoes = lista(d['secoes']);
  if (!secoes?.length) return 'as secoes';
  let historicos = 0;
  for (const s of secoes) {
    const o = s as Obj;
    const blocos = lista(o['blocos']);
    if (chaves(o) !== 'ajuda,ancora,blocos,numero,selo,titulo' || !['ajuda', 'ancora', 'numero', 'selo', 'titulo'].every((k) => cheio(o[k]))
      || !blocos?.length) {
      return `secao ${String(o['ancora'])}`;
    }
    for (const b of blocos) {
      const bo = b as Obj;
      if (!cheio(bo['ancora'])) return `secao ${String(o['ancora'])}: bloco sem ancora`;
      if (bo['tipo'] === 'historico') historicos++;
      if (!bloco(bo)) return `secao ${String(o['ancora'])}, bloco ${String(bo['ancora'])}`;
    }
  }
  if (historicos !== 1) return 'o historico uma vez';

  const anc = ancorasDoDocumento(d);
  if (anc.some((a) => typeof a !== 'string' || a.trim() === '')) return 'ancora vazia';
  const repetidas = [...new Set(anc.filter((a, i) => anc.indexOf(a) !== i))];
  if (repetidas.length) return `ancora repetida: ${repetidas.join(', ')}`;
  const faltam = DO_DOCUMENTO.filter((a) => !anc.includes(a));
  if (faltam.length) return `faltam: ${faltam.join(', ')}`;
  const alvos = [...cartoes.map((c) => (c as Obj)['destino']), ...itens.map((i) => (i as Obj)['ancora'])];
  const soltos = alvos.filter((a) => !anc.includes(a));
  if (soltos.length) return `apontando para o nada: ${soltos.join(', ')}`;
  return null;
}
