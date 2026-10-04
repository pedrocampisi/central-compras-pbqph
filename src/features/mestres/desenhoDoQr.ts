/** O QR do mestre em SVG (CTO-D696 §4): sem imagem, nítido em qualquer tamanho de tela. */

import qrcode from 'qrcode-generator';

/** O desenho do QR, como um caminho SVG só (nítido em qualquer tamanho). */
export function desenhoDoQr(texto: string): { lado: number; caminho: string } {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const n = qr.getModuleCount();
  const margem = 4; // a "zona quieta" que a câmera precisa em volta
  let caminho = '';
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(l, c)) caminho += `M${c + margem} ${l + margem}h1v1h-1z`;
    }
  }
  return { lado: n + margem * 2, caminho };
}
