/**
 * O PDF da OC na pasta da obra, pelo servidor (CTO-D685, palavra do Pedro de
 * 04/10: "guardar de forma automática uma OC na pasta da OBRA via Microsoft
 * Graph"). Quem grava é a função `guardar-oc-na-obra` do Banco (D682); aqui
 * mora só a leitura da resposta e o aviso que a tela mostra.
 *
 * A regra: o Graph primeiro. Respondeu 200, o PDF está na pasta da obra e NÃO
 * é salvo de novo pela pasta do navegador — dois arquivos da mesma OC na mesma
 * pasta é a confusão que o Pedro quer acabar. Qualquer outra resposta, ou
 * nenhuma, cai no caminho de hoje. A emissão nunca desfaz por causa disso.
 *
 * Lógica pura, sem tela e sem rede.
 */

/** O que a função respondeu, já lido. `ok` só no 200. */
export interface RespostaDaPasta {
  ok: boolean;
  /** O HTTP; 0 quando a função nem respondeu. */
  status: number;
  /** `gravado`, `substituido`, `ja_estava`, `sem_pasta`, `falhou`…; `sem_resposta` quando não respondeu. */
  desfecho: string;
  /** A frase da função, pronta para gente; vazia se ela não mandou. */
  mensagem: string;
  webUrl: string;
  nome: string;
  /** Com 200: o arquivo está na pasta, mas algo não saiu inteiro (o ✓ não ficou, o nome é o antigo). */
  aviso: string;
}

/** Onde o caminho de hoje deixou o PDF, quando a função falhou. */
export type CaminhoDeHoje = 'saved' | 'downloaded';

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** A resposta crua (status + corpo JSON, ou nada) → o que a tela usa. */
export function lerRespostaDaPasta(status: number, corpo: unknown): RespostaDaPasta {
  const c = (corpo && typeof corpo === 'object' ? corpo : {}) as Record<string, unknown>;
  return {
    ok: status === 200,
    status,
    desfecho: texto(c['desfecho']) || (status === 200 ? 'gravado' : status === 0 ? 'sem_resposta' : 'falhou'),
    mensagem: texto(c['mensagem']),
    webUrl: texto(c['web_url']),
    nome: texto(c['nome']),
    aviso: texto(c['aviso']),
  };
}

/** Quando a função não respondeu: a rede caiu, o tempo acabou, ou não havia login. */
export function semResposta(mensagem = ''): RespostaDaPasta {
  return lerRespostaDaPasta(0, { mensagem });
}

/** O link que a tela abre: só https. O banco já recusa outro (D682 §3); aqui é a segunda porta. */
export function linkSeguro(url: string): string {
  return /^https:\/\//i.test(url.trim()) ? url.trim() : '';
}

export interface AvisoDoPdf {
  texto: string;
  tom: 'success' | 'warning';
}

/**
 * O aviso depois de emitir (`emissao`) ou de mandar de novo pelo Histórico
 * (`mandar`). Diz a `mensagem` da função; quando ela não diz o que aconteceu
 * com a OC e com o PDF, a tela completa — e nunca repete o que ela já disse.
 */
export function avisoDoPdf(
  numero: string,
  r: RespostaDaPasta,
  caminho: CaminhoDeHoje | null,
  porta: 'emissao' | 'mandar',
): AvisoDoPdf {
  const oc = porta === 'emissao' ? `OC ${numero} emitida.` : `OC ${numero}:`;
  if (r.ok) {
    const base = `${oc} ${r.mensagem || 'PDF guardado na pasta da obra.'}`;
    return r.aviso ? { texto: `${base} Atenção: ${r.aviso}.`, tom: 'warning' } : { texto: base, tom: 'success' };
  }
  const motivo = r.mensagem || 'A pasta da obra não respondeu.';
  // As frases do 422 e do 502 já dizem que a OC está emitida e que o PDF ficou neste aparelho.
  if (/emitida do mesmo jeito/i.test(motivo)) return { texto: `OC ${numero}: ${motivo}`, tom: 'warning' };
  const onde =
    caminho === 'saved'
      ? 'O PDF ficou salvo na pasta ligada neste computador.'
      : 'O PDF ficou baixado neste aparelho.';
  const deNovo = porta === 'emissao' ? ' Dá para mandar de novo pelo Histórico.' : '';
  return { texto: `${oc} O PDF não foi para a pasta da obra: ${motivo} ${onde}${deNovo}`, tom: 'warning' };
}

/** Os bytes em base64, em pedaços: um `String.fromCharCode(...tudo)` estoura a pilha num PDF grande. */
export function paraBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

/** O ✓ de uma OC: a linha de `compras.oc_pdf_na_pasta`. */
export interface PdfNaPasta {
  ocId: string;
  webUrl: string;
  nome: string;
  gravadoEm: string;
  vezes: number;
}
