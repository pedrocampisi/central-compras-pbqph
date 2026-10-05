import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import {
  acessoDoHash, acessoDoLink, acessoDoTextoLido, ehAparelhoDaApple, enderecoDoQr, oQueFazerComOAcesso, tempoQueFalta,
} from '../../src/domain/acessoPorQr';
import { desenhoDoQr } from '../../src/features/mestres/desenhoDoQr';
import { lerQrDoDesenho } from '../fixtures/lerQrDoDesenho';

/**
 * CTO-D696 §4: o QR de entrada do mestre. O código do link do Banco vai para
 * o endereço da OC, depois do `#`; no iPhone, o ícone lê o mesmo QR. Links e
 * códigos INVENTADOS, em endereços `.invalid`.
 */

const SERVIDOR = 'https://banco-de-teste.invalid';
const OC = 'https://oc-de-teste.invalid';
const CODIGO = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8';
const LINK = `${SERVIDOR}/auth/v1/verify?token=${CODIGO}&type=magiclink&redirect_to=https://compras.campisi.com.br/`;

describe('o código do link do Banco', () => {
  it('sai do link: o token e o tipo', () => {
    expect(acessoDoLink(LINK)).toEqual({ codigo: CODIGO, tipo: 'magiclink' });
  });

  it('link sem código, com código curto ou com sujeira: nada', () => {
    expect(acessoDoLink(`${SERVIDOR}/auth/v1/verify?type=magiclink`)).toBeNull();
    expect(acessoDoLink(`${SERVIDOR}/auth/v1/verify?token=abc&type=magiclink`)).toBeNull();
    expect(acessoDoLink(`${SERVIDOR}/auth/v1/verify?token=${CODIGO}"><script>&type=magiclink`)).toBeNull();
    expect(acessoDoLink('não é endereço')).toBeNull();
  });
});

describe('o endereço do QR', () => {
  it('é a raiz da OC com o acesso depois do # (nada vai ao servidor da OC); e volta igual', () => {
    const e = enderecoDoQr(`${OC}/`, { codigo: CODIGO, tipo: 'magiclink' });
    expect(e).toBe(`${OC}/#entrar=${CODIGO}&tipo=magiclink`);
    const u = new URL(e);
    expect(u.search).toBe('');
    expect(acessoDoHash(u.hash)).toEqual({ codigo: CODIGO, tipo: 'magiclink' });
  });

  it('o # de outra coisa (o login do e-mail, por exemplo) não é acesso de QR', () => {
    expect(acessoDoHash('#access_token=x&type=recovery')).toBeNull();
    expect(acessoDoHash('')).toBeNull();
  });

  it('o QR desenhado é lido pela câmera e devolve o endereço inteiro', () => {
    const texto = enderecoDoQr(OC, { codigo: CODIGO, tipo: 'magiclink' });
    const { lado, caminho } = desenhoDoQr(texto);
    expect(lerQrDoDesenho(lado, caminho)).toBe(texto);
  });

  it('com a margem branca de 4 módulos em volta, que a câmera de verdade precisa (o leitor de teste lê sem ela)', () => {
    const texto = enderecoDoQr(OC, { codigo: CODIGO, tipo: 'magiclink' });
    const qr = qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    const { lado, caminho } = desenhoDoQr(texto);
    expect(lado).toBe(qr.getModuleCount() + 8);
    const posicoes = [...caminho.matchAll(/M(\d+) (\d+)/g)].flatMap(([, x, y]) => [Number(x), Number(y)]);
    expect(Math.min(...posicoes)).toBe(4);
    expect(Math.max(...posicoes)).toBe(lado - 5);
  });
});

describe('o QR lido pelo ícone', () => {
  const aceitas = [OC, SERVIDOR];

  it('o QR da OC e o link do próprio servidor de login entram', () => {
    expect(acessoDoTextoLido(enderecoDoQr(OC, { codigo: CODIGO, tipo: 'magiclink' }), aceitas)).toEqual({
      codigo: CODIGO, tipo: 'magiclink',
    });
    expect(acessoDoTextoLido(LINK, aceitas)).toEqual({ codigo: CODIGO, tipo: 'magiclink' });
  });

  it('QR de outro lugar, mesmo com o mesmo formato, não vira tentativa de entrar', () => {
    expect(acessoDoTextoLido(`https://outro-lugar.invalid/#entrar=${CODIGO}&tipo=magiclink`, aceitas)).toBeNull();
    expect(acessoDoTextoLido('PIX 000201...', aceitas)).toBeNull();
    expect(acessoDoTextoLido(`${OC}/`, aceitas)).toBeNull();
  });
});

describe('o tempo que falta', () => {
  const agora = new Date('2026-10-04T15:00:00Z');
  it('em minutos e segundos; arredonda para cima (não diz 0:00 com o QR valendo)', () => {
    expect(tempoQueFalta('2026-10-04T16:00:00Z', agora)).toBe('60:00');
    expect(tempoQueFalta('2026-10-04T15:01:05Z', agora)).toBe('1:05');
    expect(tempoQueFalta('2026-10-04T15:00:00.300Z', agora)).toBe('0:01');
  });
  it('vencido, ou data que não se lê: null', () => {
    expect(tempoQueFalta('2026-10-04T15:00:00Z', agora)).toBeNull();
    expect(tempoQueFalta('2026-10-04T14:00:00Z', agora)).toBeNull();
    expect(tempoQueFalta('', agora)).toBeNull();
  });
});

describe('o aparelho e o que fazer com o acesso', () => {
  it('iPhone e iPad (o novo, que se diz Mac, mas tem toque); Android e computador não', () => {
    expect(ehAparelhoDaApple('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)', 5)).toBe(true);
    expect(ehAparelhoDaApple('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true);
    expect(ehAparelhoDaApple('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false);
    expect(ehAparelhoDaApple('Mozilla/5.0 (Linux; Android 14)', 5)).toBe(false);
  });

  it('só o iPhone fora do ícone guarda o QR para o ícone; o resto entra já', () => {
    expect(oQueFazerComOAcesso(true, false)).toBe('por-o-icone');
    expect(oQueFazerComOAcesso(true, true)).toBe('entrar');
    expect(oQueFazerComOAcesso(false, false)).toBe('entrar');
    expect(oQueFazerComOAcesso(false, true)).toBe('entrar');
  });
});
