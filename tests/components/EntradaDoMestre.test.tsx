import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

/**
 * CTO-D696 §4: o QR do mestre termina com ele logado DENTRO do ícone. O App
 * de verdade, com login, câmera e leitor FALSOS. No iPhone, o ícone não
 * herda nada do Safari (Apple, WWDC23): o Safari não gasta o QR, ensina a pôr
 * o ícone, e o ícone lê o mesmo QR. Códigos inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => null,
}));
const srv = vi.hoisted(() => ({}) as { entrar: Mock });
vi.mock('../../src/services/supabase/mestres', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/mestres')>()),
  entrarComOQr: (...a: unknown[]) => srv.entrar(...a),
}));
const leitor = vi.hoisted(() => ({ texto: '' }));
vi.mock('jsqr', () => ({ default: () => (leitor.texto ? { data: leitor.texto } : null) }));

import App from '../../src/App';
import { EntrarNoIcone, PedirOIcone } from '../../src/features/mestres/EntradaDoMestre';
import { esquecerAcessoLido } from '../../src/services/aparelho';

const CODIGO = 'f0'.repeat(28);
const ANDROID = 'Mozilla/5.0 (Linux; Android 14) Chrome/129';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari/604.1';

const aparelho = { ua: ANDROID, noIcone: false };
Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => aparelho.ua });
Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, get: () => 5 });
window.matchMedia = ((q: string) => ({
  matches: q.includes('standalone') ? aparelho.noIcone : false,
  media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

function chegarPeloQr() {
  window.history.replaceState(null, '', `/#entrar=${CODIGO}&tipo=magiclink`);
}

beforeEach(() => {
  esquecerAcessoLido();
  window.history.replaceState(null, '', '/');
  aparelho.ua = ANDROID;
  aparelho.noIcone = false;
  srv.entrar = vi.fn(async () => undefined);
  leitor.texto = '';
});

describe('o QR que chega no endereço', () => {
  it('Android: entra já, com o código e o tipo; e o código sai do endereço', async () => {
    chegarPeloQr();
    render(<App />);
    await waitFor(() => expect(srv.entrar).toHaveBeenCalledWith({ codigo: CODIGO, tipo: 'magiclink' }));
    expect(window.location.hash).toBe('');
    expect(srv.entrar).toHaveBeenCalledTimes(1);
  });

  it('iPhone no Safari: NÃO gasta o QR; ensina a pôr o ícone; "Usar aqui no Safari" entra', async () => {
    aparelho.ua = IPHONE;
    chegarPeloQr();
    render(<App />);
    expect(await screen.findByText('Primeiro, o ícone')).toBeTruthy();
    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeTruthy();
    expect(srv.entrar).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Usar aqui no Safari mesmo' }));
    await waitFor(() => expect(srv.entrar).toHaveBeenCalledWith({ codigo: CODIGO, tipo: 'magiclink' }));
  });

  it('iPhone já dentro do ícone: entra já', async () => {
    aparelho.ua = IPHONE;
    aparelho.noIcone = true;
    chegarPeloQr();
    render(<App />);
    await waitFor(() => expect(srv.entrar).toHaveBeenCalledTimes(1));
  });

  it('QR usado ou vencido: diz o porquê; "Voltar" leva à entrada', async () => {
    srv.entrar = vi.fn(async () => {
      throw new Error('Este QR já foi usado ou venceu. Peça outro ao engenheiro.');
    });
    chegarPeloQr();
    render(<App />);
    expect((await screen.findByRole('alert')).textContent).toBe('Este QR já foi usado ou venceu. Peça outro ao engenheiro.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Central de Compras')).toBeTruthy();
  });

  it('sem QR no endereço, nada de entrada pelo QR', async () => {
    render(<App />);
    expect(await screen.findByLabelText(/E-mail/)).toBeTruthy();
    expect(srv.entrar).not.toHaveBeenCalled();
  });
});

describe('dentro do ícone, sem ninguém', () => {
  it('a entrada é "Ler o QR"; quem tem senha pede o formulário', async () => {
    aparelho.noIcone = true;
    render(<App />);
    expect(await screen.findByRole('button', { name: /Ler o QR/ })).toBeTruthy();
    expect(screen.queryByLabelText(/Senha/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar com e-mail e senha' }));
    expect(await screen.findByLabelText(/Senha/)).toBeTruthy();
  });
});

describe('a câmera do ícone lê o QR', () => {
  const paradas: string[] = [];
  let getUserMedia: Mock;

  beforeEach(() => {
    paradas.length = 0;
    getUserMedia = vi.fn(async () => ({ getTracks: () => [{ stop: () => paradas.push('parou') }] }));
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
    Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: async () => {} });
    Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', { configurable: true, set() {}, get: () => null });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { configurable: true, get: () => 1280 });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { configurable: true, get: () => 960 });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage() {},
      getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    } as unknown as CanvasRenderingContext2D);
  });
  afterEach(() => vi.restoreAllMocks());

  async function lerCom(texto: string) {
    leitor.texto = texto;
    render(<EntrarNoIcone aoUsarSenha={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Ler o QR/ }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' }, audio: false }));
  }

  it('o QR da OC: entra com o código, e a câmera desliga', async () => {
    await lerCom(`${window.location.origin}/#entrar=${CODIGO}&tipo=magiclink`);
    await waitFor(() => expect(srv.entrar).toHaveBeenCalledWith({ codigo: CODIGO, tipo: 'magiclink' }));
    expect(paradas).toContain('parou'); // ao achar, e de novo ao fechar a tela: desligar duas vezes não faz mal
  });

  it('QR de outro lugar: não tenta entrar, e diz qual QR é', async () => {
    await lerCom(`https://outro-lugar.invalid/#entrar=${CODIGO}&tipo=magiclink`);
    expect((await screen.findByRole('alert')).textContent).toMatch(/não é o de entrada da OC/);
    expect(srv.entrar).not.toHaveBeenCalled();
  });

  it('"Voltar" no meio da leitura desliga a câmera', async () => {
    await lerCom('');
    await waitFor(() => expect(document.querySelector('video')).not.toBeNull());
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(paradas).toEqual(['parou']);
    expect(srv.entrar).not.toHaveBeenCalled();
  });

  it('a câmera negada: diz como liberar; "Voltar" volta', async () => {
    getUserMedia.mockRejectedValue(new DOMException('negado', 'NotAllowedError'));
    await lerCom('');
    expect((await screen.findByRole('alert')).textContent).toMatch(/sem permissão para a câmera/);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: /Ler o QR/ })).toBeTruthy();
  });

  it('o QR não entrou: o porquê na tela, e dá para ler de novo', async () => {
    srv.entrar = vi.fn(async () => {
      throw new Error('Este QR já foi usado ou venceu. Peça outro ao engenheiro.');
    });
    await lerCom(`${window.location.origin}/#entrar=${CODIGO}&tipo=magiclink`);
    expect((await screen.findByRole('alert')).textContent).toMatch(/já foi usado ou venceu/);
    expect((screen.getByRole('button', { name: /Ler o QR/ }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('o pedido de pôr o ícone, no pé da lista do mestre', () => {
  it('iPhone no Safari: os passos, e o aviso de que o ícone pede o QR de novo', () => {
    aparelho.ua = IPHONE;
    render(<PedirOIcone />);
    expect(document.querySelector('[data-pedir-o-icone="iphone"]')).not.toBeNull();
    expect(screen.getByText(/o ícone pede o QR de novo/)).toBeTruthy();
  });

  it('Android: o botão só aparece quando o navegador oferece; tocar abre o pedido dele', async () => {
    render(<PedirOIcone />);
    expect(document.querySelector('[data-pedir-o-icone]')).toBeNull();
    const prompt = vi.fn(async () => {});
    const evento = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt, userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    act(() => {
      window.dispatchEvent(evento);
    });
    expect(evento.defaultPrevented).toBe(true);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pôr o ícone na tela' }));
    });
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-pedir-o-icone]')).toBeNull();
  });

  it('já dentro do ícone: nada', () => {
    aparelho.ua = IPHONE;
    aparelho.noIcone = true;
    render(<PedirOIcone />);
    expect(document.querySelector('[data-pedir-o-icone]')).toBeNull();
  });
});
