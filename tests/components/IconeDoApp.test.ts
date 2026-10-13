import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

/**
 * O ícone do app (CTO-D792 §2, palavra do Pedro: "Coloque a cabeça laranja do
 * castor"). Os de 05/05 eram o castor em contorno fino sobre azul escuro, e no
 * celular quase não se via. Os novos são a cabeça laranja (`marca/mascote-rosto.png`)
 * sobre o creme do tema, e no `maskable` a cabeça inteira fica dentro da área
 * segura, para o Android não cortar o capacete.
 */

/** Lê um PNG RGB de 8 bits sem entrelaçamento — o que os ícones são. */
function lerPng(caminho: string) {
  const b = readFileSync(caminho);
  let i = 8;
  let largura = 0;
  let altura = 0;
  const dados: Buffer[] = [];
  while (i < b.length) {
    const tam = b.readUInt32BE(i);
    const tipo = b.toString('ascii', i + 4, i + 8);
    const corpo = b.subarray(i + 8, i + 8 + tam);
    if (tipo === 'IHDR') {
      largura = corpo.readUInt32BE(0);
      altura = corpo.readUInt32BE(4);
      expect([corpo[8], corpo[9], corpo[12]], `${caminho}: RGB de 8 bits, sem entrelaçar`).toEqual([8, 2, 0]);
    }
    if (tipo === 'IDAT') dados.push(corpo);
    i += 12 + tam;
  }
  const cru = inflateSync(Buffer.concat(dados));
  const linha = largura * 3;
  const px = Buffer.alloc(linha * altura);
  for (let y = 0; y < altura; y++) {
    const filtro = cru[y * (linha + 1)]!;
    for (let x = 0; x < linha; x++) {
      const v = cru[y * (linha + 1) + 1 + x]!;
      const a = x >= 3 ? px[y * linha + x - 3]! : 0;
      const c = y > 0 ? px[(y - 1) * linha + x]! : 0;
      const ac = x >= 3 && y > 0 ? px[(y - 1) * linha + x - 3]! : 0;
      const p = a + c - ac;
      const paeth =
        Math.abs(p - a) <= Math.abs(p - c) && Math.abs(p - a) <= Math.abs(p - ac) ? a : Math.abs(p - c) <= Math.abs(p - ac) ? c : ac;
      const somar = [0, a, c, (a + c) >> 1, paeth][filtro]!;
      px[y * linha + x] = (v + somar) & 0xff;
    }
  }
  return { largura, altura, cor: (x: number, y: number) => [...px.subarray(y * linha + x * 3, y * linha + x * 3 + 3)] };
}

const CREME = [0xfb, 0xf3, 0xde];
const eCreme = (c: number[]) => c.every((v, k) => Math.abs(v - CREME[k]!) <= 3);
/** O laranja do capacete: vermelho alto, azul baixo. */
const eLaranja = (c: number[]) => c[0]! > 200 && c[1]! > 80 && c[1]! < 190 && c[2]! < 80;

const ICONES = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-512-maskable.png', 512],
  ['public/icons/apple-touch-icon.png', 180],
] as const;

describe('o ícone do app é a cabeça laranja do castor sobre o creme (D792 §2)', () => {
  it('o manifesto aponta os três ícones, um deles maskable, e a página aponta o do iPhone', () => {
    const config = readFileSync('vite.config.ts', 'utf-8');
    expect(config).toContain("src: 'icons/icon-192.png', sizes: '192x192'");
    expect(config).toContain("src: 'icons/icon-512.png', sizes: '512x512'");
    expect(config).toMatch(/src: 'icons\/icon-512-maskable\.png',\s*sizes: '512x512',\s*type: 'image\/png',\s*purpose: 'maskable'/);
    expect(config).toContain("background_color: '#FBF3DE'");
    expect(readFileSync('index.html', 'utf-8')).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />');
    for (const [c] of ICONES) expect(existsSync(c), c).toBe(true);
  });

  it.each(ICONES)('%s: o tamanho certo, os cantos creme e o capacete laranja', (caminho, lado) => {
    const png = lerPng(caminho);
    expect([png.largura, png.altura]).toEqual([lado, lado]);
    for (const [x, y] of [[0, 0], [lado - 1, 0], [0, lado - 1], [lado - 1, lado - 1]] as const) {
      expect(eCreme(png.cor(x, y)), `${caminho} canto ${x},${y}: ${png.cor(x, y)}`).toBe(true);
    }
    let laranja = 0;
    for (let y = 0; y < lado; y += 2) for (let x = 0; x < lado; x += 2) if (eLaranja(png.cor(x, y))) laranja++;
    // o capacete ocupa bem mais que 5% do ícone; o castor de contorno azul não tinha nenhum
    expect(laranja / (lado / 2) ** 2).toBeGreaterThan(0.05);
  });

  it('no maskable, nada da cabeça sai da área segura (o círculo de raio 40%)', () => {
    const { largura: lado, cor } = lerPng('public/icons/icon-512-maskable.png');
    let pior = 0;
    for (let y = 0; y < lado; y++) {
      for (let x = 0; x < lado; x++) {
        if (!eCreme(cor(x, y))) pior = Math.max(pior, Math.hypot(x + 0.5 - lado / 2, y + 0.5 - lado / 2) / lado);
      }
    }
    expect(pior).toBeGreaterThan(0.3);
    expect(pior).toBeLessThanOrEqual(0.4);
  });
});
