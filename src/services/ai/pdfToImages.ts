/**
 * Converte um arquivo (PDF ou imagem) em lista de data URLs JPEG.
 * Usado como etapa de pré-processamento para a extração de itens via IA.
 * Portado de CentralCompras-PBQPH.html linhas 2404-2431.
 *
 * Limitação: máximo 5 páginas de PDF para controlar custo de tokens.
 */

const MAX_PDF_PAGES = 5;
const RENDER_SCALE = 1.6;
const JPEG_QUALITY = 0.75;

/**
 * Retorna uma lista de data URLs JPEG — uma por página de PDF, ou uma para imagem.
 * Aceita: image/*, application/pdf, arquivos .pdf sem MIME.
 */
export async function fileToImagesBase64(file: File): Promise<string[]> {
  // ── Imagem direta ──────────────────────────────────────────────────────────
  if (file.type.startsWith('image/')) {
    const dataUrl = await readAsDataUrl(file);
    return [dataUrl];
  }

  // ── PDF ────────────────────────────────────────────────────────────────────
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return renderPdfPages(file);
  }

  throw new Error('Formato não suportado. Use PDF ou imagem (JPEG, PNG, WebP).');
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

async function renderPdfPages(file: File): Promise<string[]> {
  // Import dinâmico de pdfjs-dist (evita bundle enorme no carregamento inicial)
  const pdfjsLib = await import('pdfjs-dist');

  // Worker path — Vite copia para /assets/ no build; em dev usa o módulo diretamente
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const images: string[] = [];

  for (let p = 1; p <= pageCount; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível criar contexto 2D.');

    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL('image/jpeg', JPEG_QUALITY));

    // Limpa o canvas para liberar memória
    page.cleanup();
  }

  return images;
}
