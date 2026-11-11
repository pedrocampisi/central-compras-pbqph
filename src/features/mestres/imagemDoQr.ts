/**
 * O QR do encarregado como imagem, para mandar ao engenheiro (CTO-D1036 §2.1).
 *
 * O engenheiro recebe a imagem no celular dele e a mostra ao encarregado na
 * obra; a câmera do encarregado lê da tela. Por isso é PNG, que todo
 * aplicativo de mensagem abre, com o nome e a validade escritos embaixo: quem
 * recebe sabe de quem é e até quando vale.
 *
 * Onde o aparelho deixa mandar arquivo (`services/compartilhar`: o
 * celular, Android e iPhone), o botão abre a folha de compartilhar. Onde não
 * deixa (o computador, quase sempre), o mesmo botão baixa a imagem.
 */

import { desenhoDoQr } from './desenhoDoQr';

const PX = 10; // pixels por módulo: um QR de ~41 módulos sai com ~410 px

/** O nome do arquivo da imagem, sem acento nem espaço. */
export function nomeDaImagemDoQr(nome: string): string {
  const limpo = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `QR-de-entrada-${limpo || 'encarregado'}.png`;
}

/** O PNG do QR, com duas linhas de texto embaixo. */
export async function imagemDoQr(endereco: string, linhas: [string, string]): Promise<Blob> {
  const { lado, caminho } = desenhoDoQr(endereco);
  const largura = lado * PX;
  const altura = largura + 96;
  const tela = document.createElement('canvas');
  tela.width = largura;
  tela.height = altura;
  const c = tela.getContext('2d');
  if (!c) throw new Error('O aparelho não desenhou a imagem do QR.');
  // Preto no branco, sempre: a câmera lê melhor, de dia e de noite.
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, largura, altura);
  c.fillStyle = '#000000';
  c.save();
  c.scale(PX, PX);
  c.fill(new Path2D(caminho));
  c.restore();
  c.textAlign = 'center';
  c.font = 'bold 22px sans-serif';
  c.fillText(linhas[0], largura / 2, largura + 30, largura - 24);
  c.font = '18px sans-serif';
  c.fillText(linhas[1], largura / 2, largura + 66, largura - 24);
  return new Promise((ok, falha) =>
    tela.toBlob((b) => (b ? ok(b) : falha(new Error('O aparelho não gerou a imagem do QR.'))), 'image/png'),
  );
}
