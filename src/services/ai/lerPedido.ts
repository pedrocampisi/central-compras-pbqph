/**
 * Uma leitura do "Importar Pedido (IA)": os arquivos que entraram de uma vez
 * — arrastados, colados ou escolhidos — viram UMA chamada ao servidor, como
 * páginas de um mesmo pedido (CTO-D554).
 *
 * A ordem é a trava: tipo, depois páginas, e só então desenhar e enviar. Tipo
 * errado ou página demais param antes de qualquer coisa sair do navegador.
 * As dependências entram por parâmetro para o teste provar exatamente isso:
 * que `enviar` nunca é chamado nos dois casos.
 */

import type { ResultadoDaLeitura } from './extractItems';
import {
  MAX_PAGINAS,
  mensagemDePaginas,
  mensagemDeTipo,
  tipoDoArquivo,
  type TipoDoArquivo,
} from '../../domain/importacao';
import type { ArquivoAberto } from './pdfToImages';

export interface DepsDaLeitura {
  abrir: (arquivo: File, tipo: TipoDoArquivo) => Promise<ArquivoAberto>;
  enviar: (imagens: string[]) => Promise<ResultadoDaLeitura>;
}

/** Erro que a própria importação explica — a mensagem vai inteira para a tela. */
export class ErroDaImportacao extends Error {}

async function depsReais(): Promise<DepsDaLeitura> {
  const [{ abrirArquivo }, { extractItemsFromImages }] = await Promise.all([
    import('./pdfToImages'),
    import('./extractItems'),
  ]);
  return { abrir: abrirArquivo, enviar: extractItemsFromImages };
}

export async function lerPedido(arquivos: File[], deps?: DepsDaLeitura): Promise<ResultadoDaLeitura> {
  if (arquivos.length === 0) throw new ErroDaImportacao('Nenhum arquivo chegou.');

  // 1. Tipo — todos, antes de abrir qualquer um.
  const recusados = arquivos.filter((a) => tipoDoArquivo(a) === null);
  if (recusados.length > 0) throw new ErroDaImportacao(mensagemDeTipo(recusados.map((a) => a.name)));

  const d = deps ?? (await depsReais());

  // 2. Páginas — a soma de tudo o que entrou.
  const abertos: ArquivoAberto[] = [];
  for (const a of arquivos) {
    try {
      abertos.push(await d.abrir(a, tipoDoArquivo(a) as TipoDoArquivo));
    } catch {
      throw new ErroDaImportacao(`Não foi possível abrir "${a.name}". Nada foi lido.`);
    }
  }
  const total = abertos.reduce((s, x) => s + x.paginas, 0);
  if (total > MAX_PAGINAS) throw new ErroDaImportacao(mensagemDePaginas(total));
  if (total === 0) throw new ErroDaImportacao('O arquivo não tem páginas. Nada foi lido.');

  // 3. Desenhar e enviar — uma leitura só, as páginas na ordem em que chegaram.
  const imagens: string[] = [];
  for (const x of abertos) imagens.push(...(await x.imagens()));
  if (imagens.length > MAX_PAGINAS) throw new ErroDaImportacao(mensagemDePaginas(imagens.length));

  return d.enviar(imagens);
}

/**
 * A lista de materiais colada em texto (CTO-D557): vai inteira, como veio —
 * quem organiza é a IA, e os limites são do servidor. Caixa vazia não sai do
 * navegador.
 */
export async function lerLista(
  texto: string,
  enviar?: (texto: string) => Promise<ResultadoDaLeitura>,
): Promise<ResultadoDaLeitura> {
  if (texto.trim() === '') throw new ErroDaImportacao('Cole a lista de materiais na caixa de texto.');
  const e = enviar ?? (await import('./extractItems')).organizarTexto;
  return e(texto);
}
