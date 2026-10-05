import jsQR from 'jsqr';

/**
 * Lê um QR desenhado pela OC (o caminho SVG de `desenhoDoQr`) do jeito que a
 * câmera lê: pinta os módulos num quadro de pixels e passa no leitor. Devolve
 * o texto, ou null se não leu.
 */
export function lerQrDoDesenho(lado: number, caminho: string, pixelsPorModulo = 6): string | null {
  const largura = lado * pixelsPorModulo;
  const pixels = new Uint8ClampedArray(largura * largura * 4).fill(255);
  for (const [, x, y] of caminho.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
    for (let dy = 0; dy < pixelsPorModulo; dy++) {
      for (let dx = 0; dx < pixelsPorModulo; dx++) {
        const i = ((Number(y) * pixelsPorModulo + dy) * largura + Number(x) * pixelsPorModulo + dx) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
      }
    }
  }
  return jsQR(pixels, largura, largura)?.data ?? null;
}
