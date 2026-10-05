/**
 * O aparelho e o ícone na tela do celular (CTO-D696 §4): se a OC está aberta
 * pelo ícone, se é iPhone, e o pedido de instalar do Android.
 *
 * E o acesso que chegou no endereço (`/#entrar=…`, o QR do mestre): ele sai do
 * endereço na primeira leitura, para não ficar no histórico do navegador nem
 * ser reaproveitado por um recarregar.
 */

import { acessoDoHash, ehAparelhoDaApple, type AcessoPorQr } from '../domain/acessoPorQr';

/** Aberta pelo ícone (sem a barra do navegador)? */
export function estaNoIcone(): boolean {
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  } catch {
    /* navegador sem matchMedia: não é ícone */
  }
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function ehDaApple(): boolean {
  return ehAparelhoDaApple(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}

// ---------------------------------------------------------------------------
// O acesso do QR que chegou no endereço
// ---------------------------------------------------------------------------

let lido = false;
let acessoGuardado: AcessoPorQr | null = null;

/**
 * O acesso do `#entrar=` do endereço, lido uma vez só (o React em modo
 * estrito chama duas vezes; a segunda tem de dar o mesmo). Tira do endereço.
 */
export function acessoQueChegouNoEndereco(): AcessoPorQr | null {
  if (!lido) {
    lido = true;
    acessoGuardado = acessoDoHash(window.location.hash);
    if (acessoGuardado) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
  return acessoGuardado;
}

/** Só para os testes: esquece o que leu. */
export function esquecerAcessoLido(): void {
  lido = false;
  acessoGuardado = null;
}

// ---------------------------------------------------------------------------
// O pedido de instalar (Android e computador; o iPhone não tem)
// ---------------------------------------------------------------------------

interface PedidoDeInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let pedido: PedidoDeInstalar | null = null;
const quemEspera = new Set<() => void>();

// O navegador avisa uma vez, logo ao abrir: guarda-se o aviso para o botão
// "Pôr o ícone na tela" usar quando o mestre tocar.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pedido = e as PedidoDeInstalar;
    quemEspera.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    pedido = null;
    quemEspera.forEach((f) => f());
  });
}

export function podePedirParaInstalar(): boolean {
  return pedido !== null;
}

/** Abre o pedido do navegador; true se a pessoa aceitou. */
export async function pedirParaInstalar(): Promise<boolean> {
  const p = pedido;
  if (!p) return false;
  pedido = null; // o navegador só deixa usar uma vez
  await p.prompt();
  const escolha = await p.userChoice;
  quemEspera.forEach((f) => f());
  return escolha.outcome === 'accepted';
}

export function aoMudarPedidoDeInstalar(f: () => void): () => void {
  quemEspera.add(f);
  return () => quemEspera.delete(f);
}
