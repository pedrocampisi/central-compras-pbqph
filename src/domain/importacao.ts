/**
 * As regras do "Importar Pedido (IA)" que não dependem da tela (CTO-D554).
 *
 * O campo recebe arquivos por três portas — arrastar, colar com Ctrl+V e o
 * "Escolher arquivo" — e as três passam por aqui antes de qualquer coisa ir
 * para o servidor: tipo errado e página demais param AQUI, com mensagem, e
 * nada é lido.
 */

/**
 * Páginas por leitura, somando tudo o que entrou de uma vez (PDFs, fotos e
 * prints). É o limite de antes da D554: o teto de tokens da função
 * `extrair-itens` (8000) foi feito para ele. A diferença é que antes o PDF de
 * 6 páginas perdia a sexta em silêncio; agora nada é lido e a pessoa é avisada.
 */
export const MAX_PAGINAS = 5;

/** O `accept` do "Escolher arquivo" — os mesmos tipos de antes da D554. */
export const ACCEPT_DA_IMPORTACAO = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

export type TipoDoArquivo = 'pdf' | 'imagem';

/**
 * PDF, JPG ou PNG — pelo tipo que o navegador diz, ou pela extensão quando ele
 * não diz (PDF copiado de alguns lugares chega sem tipo). O print colado com
 * Ctrl+V chega como `image/png`. Qualquer outra coisa: `null`.
 */
export function tipoDoArquivo(a: { name: string; type: string }): TipoDoArquivo | null {
  const tipo = (a.type || '').toLowerCase();
  const nome = (a.name || '').toLowerCase();
  if (tipo === 'application/pdf') return 'pdf';
  if (tipo === 'image/jpeg' || tipo === 'image/png') return 'imagem';
  if (tipo !== '') return null;
  if (nome.endsWith('.pdf')) return 'pdf';
  if (/\.(jpe?g|png)$/.test(nome)) return 'imagem';
  return null;
}

/** A mensagem do tipo errado: diz o que não serve e o que serve. */
export function mensagemDeTipo(recusados: string[]): string {
  const nomes = recusados.filter(Boolean);
  const quais =
    nomes.length === 0 ? 'Este arquivo' :
    nomes.length === 1 ? `"${nomes[0]}"` :
    `${nomes.length} arquivos (${nomes.map((n) => `"${n}"`).join(', ')})`;
  const verbo = nomes.length > 1 ? 'não servem' : 'não serve';
  return `${quais} ${verbo}. A importação lê PDF, JPG ou PNG, ou um print colado com Ctrl+V. Nada foi lido.`;
}

/** A mensagem de página demais: quantas chegaram, qual é o limite, e o que fazer. */
export function mensagemDePaginas(total: number): string {
  return (
    `Chegaram ${total} páginas, e o limite de uma leitura é ${MAX_PAGINAS}. Nada foi lido: ` +
    'mande em duas vezes — os itens de cada leitura se somam aos que já estão na OC.'
  );
}

/**
 * O alvo do Ctrl+V (ou do Esc) está FORA de um campo de texto?
 *
 * Com o campo de importação aberto, colar na página vai para a importação —
 * mas colar na Descrição de um item continua colando texto. Campo de texto é
 * input que se digita, textarea, select e qualquer coisa editável.
 */
const INPUTS_QUE_NAO_SAO_TEXTO = new Set(['button', 'checkbox', 'radio', 'file', 'submit', 'reset', 'image', 'range', 'color']);

export function foraDeCampoDeTexto(
  alvo: { tagName?: string; type?: string; isContentEditable?: boolean } | null | undefined,
): boolean {
  if (!alvo) return true;
  if (alvo.isContentEditable) return false;
  const tag = (alvo.tagName ?? '').toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return false;
  if (tag === 'INPUT') return INPUTS_QUE_NAO_SAO_TEXTO.has((alvo.type ?? 'text').toLowerCase());
  return true;
}

// ── A lista em texto (CTO-D557) ──────────────────────────────────────────────

export type DestinoDaColagem = 'arquivos' | 'texto' | 'nada';

/**
 * O Ctrl+V com o campo aberto decide pelo que VEIO, e não pelo lugar do cursor:
 * imagem ou arquivo importam (mesmo com o cursor na caixa de texto do campo);
 * texto vai para a caixa.
 *
 * Uma exceção, de propósito: quando vêm os dois — texto de verdade E imagem —,
 * vale o texto. É o Ctrl+C de uma planilha ou de um documento: o Excel põe na
 * área de transferência o texto das células e também uma FOTO delas, e o
 * navegador entrega as duas. Quem copiou uma lista quer a lista. O print
 * (Win+Shift+S) não traz texto, e o arquivo copiado no Explorer, quando traz,
 * traz só o caminho — esses continuam indo para a importação.
 */
export function destinoDaColagem(arquivos: { name: string }[], texto: string): DestinoDaColagem {
  const t = texto.trim();
  if (arquivos.length === 0) return t ? 'texto' : 'nada';
  if (!t) return 'arquivos';
  const umaLinha = !/[\r\n]/.test(t);
  // C:\…, \\servidor\…, /…, file:… — ou termina no nome do próprio arquivo.
  const ehCaminho =
    umaLinha && (/^([a-z]:\\|\\\\|\/|file:)/i.test(t) || arquivos.some((a) => a.name !== '' && t.endsWith(a.name)));
  return ehCaminho ? 'arquivos' : 'texto';
}

/** O texto colado entra no fim do que já está na caixa, numa linha nova. */
export function juntarTexto(atual: string, colado: string): string {
  if (atual.trim() === '') return colado;
  return atual.replace(/\s*$/, '') + '\n' + colado;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** O aviso do fim da leitura: quantos itens entraram, e quantas linhas ficaram de fora. */
export function avisoDaLeitura(itens: number, ignoradas: number): string {
  const entraram = `${plural(itens, 'item importado', 'itens importados')} via IA`;
  return ignoradas > 0 ? `${entraram} · ${plural(ignoradas, 'linha ignorada', 'linhas ignoradas')}.` : `${entraram}.`;
}
