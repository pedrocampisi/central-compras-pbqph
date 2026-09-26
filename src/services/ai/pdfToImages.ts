/**
 * Abre um arquivo do pedido (PDF ou imagem) e o transforma em data URLs JPEG,
 * uma por página — o formato que a função `extrair-itens` recebe.
 * Portado de CentralCompras-PBQPH.html linhas 2404-2431.
 *
 * Desde a D554 abrir e desenhar são dois passos: primeiro se conta as páginas
 * de TUDO o que entrou (`lerPedido`), e só se desenha quando a soma cabe no
 * limite. Antes, o PDF de 6 páginas perdia a sexta aqui mesmo, em silêncio.
 */

import type { TipoDoArquivo } from '../../domain/importacao';

const RENDER_SCALE = 1.6;
const JPEG_QUALITY = 0.75;

export interface ArquivoAberto {
  /** Quantas páginas este arquivo vai ocupar na leitura (imagem = 1). */
  paginas: number;
  /** Desenha TODAS as páginas — o limite já foi conferido por quem chama. */
  imagens: () => Promise<string[]>;
}

export async function abrirArquivo(file: File, tipo: TipoDoArquivo): Promise<ArquivoAberto> {
  if (tipo === 'imagem') {
    return { paginas: 1, imagens: async () => [await readAsDataUrl(file)] };
  }
  return abrirPdf(file);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

async function abrirPdf(file: File): Promise<ArquivoAberto> {
  // Import dinâmico de pdfjs-dist (evita bundle enorme no carregamento inicial)
  const pdfjsLib = await import('pdfjs-dist');

  // Worker path — Vite copia para /assets/ no build; em dev usa o módulo diretamente
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const imagens = async (): Promise<string[]> => {
    const out: string[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: RENDER_SCALE });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível criar contexto 2D.');

      await page.render({ canvasContext: ctx, viewport }).promise;
      out.push(canvas.toDataURL('image/jpeg', JPEG_QUALITY));

      // Limpa o canvas para liberar memória
      page.cleanup();
    }
    return out;
  };

  return { paginas: pdf.numPages, imagens };
}
