/**
 * A entrada do mestre pelo QR, e o ícone na tela do celular (CTO-D696 §4).
 *
 * O que o CTO pediu: "o QR tem de terminar com o mestre logado DENTRO do
 * ícone, não só no navegador". No Android, o ícone e o Chrome dividem o login:
 * entra no navegador, põe o ícone, e o ícone já abre com ele. No iPhone NÃO:
 * o ícone tem cookies e memória separados do Safari, e nada passa de um para
 * o outro (Apple, WWDC23). Por isso, no iPhone:
 *
 *   1. a câmera abre o QR no Safari, e a OC NÃO gasta o QR ali
 *      (`PorOIconeNoIphone`): ensina a pôr o ícone;
 *   2. o mestre abre o ícone, que mostra "Ler o QR" (`EntrarNoIcone`);
 *   3. o ícone lê o MESMO QR pela câmera e entra ele mesmo.
 *
 * O QR vale uma hora: dá tempo, com o engenheiro do lado.
 */

import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { acessoDoTextoLido } from '../../domain/acessoPorQr';
import {
  aoMudarPedidoDeInstalar, ehDaApple, estaNoIcone, pedirParaInstalar, podePedirParaInstalar,
} from '../../services/aparelho';
import { entrarComOQr } from '../../services/supabase/mestres';
import styles from '../recebimento/MaterialAChegar.module.css';
import meus from './EntradaDoMestre.module.css';

/** Os passos de pôr o ícone no iPhone, pelo Safari. */
function PassosDoIphone() {
  return (
    <ol className={meus.passos}>
      <li>
        Toque em <strong>Compartilhar</strong> (o quadrado com a seta para cima, embaixo da tela).
      </li>
      <li>
        Toque em <strong>Adicionar à Tela de Início</strong> e depois em <strong>Adicionar</strong>.
      </li>
      <li>
        Abra o ícone <strong>Central Compras</strong> na tela do celular.
      </li>
    </ol>
  );
}

/** iPhone, no Safari, com o QR na mão: põe o ícone primeiro; o QR fica para o ícone. */
export function PorOIconeNoIphone({ aoUsarAqui }: { aoUsarAqui: () => void }) {
  return (
    <div className={styles.tela} data-entrada-do-mestre="por-o-icone">
      <header className={styles.topo}>
        <h1 className={styles.titulo}>Primeiro, o ícone</h1>
      </header>
      <p>No iPhone, você entra pelo ícone da OC na tela do celular. Faça assim:</p>
      <PassosDoIphone />
      <p>
        No ícone, toque em <strong>Ler o QR</strong> e aponte para o mesmo QR do engenheiro.
      </p>
      <p className={styles.dica}>Se o ícone já está na tela, é só abrir e ler o QR.</p>
      <button type="button" className={styles.sair} onClick={aoUsarAqui}>
        Usar aqui no Safari mesmo
      </button>
    </div>
  );
}

/** O QR do endereço não entrou (usado, vencido, sem sinal): diz o porquê. */
export function QrNaoEntrou({ erro, aoVoltar }: { erro: string; aoVoltar: () => void }) {
  return (
    <div className={styles.tela} data-entrada-do-mestre="falhou">
      <header className={styles.topo}>
        <h1 className={styles.titulo}>Não entrou</h1>
      </header>
      <p className={styles.aviso} role="alert">
        {erro}
      </p>
      <button type="button" className={styles.secundario} onClick={aoVoltar}>
        Voltar
      </button>
    </div>
  );
}

/** Dentro do ícone, sem ninguém logado: ler o QR do engenheiro. */
export function EntrarNoIcone({ aoUsarSenha }: { aoUsarSenha: () => void }) {
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function aoLer(texto: string) {
    setLendo(false);
    const supabaseUrl = String(import.meta.env['VITE_SUPABASE_URL'] ?? '');
    const origens = [window.location.origin];
    try {
      if (supabaseUrl) origens.push(new URL(supabaseUrl).origin);
    } catch {
      /* endereço mal configurado: fica só a OC */
    }
    const acesso = acessoDoTextoLido(texto, origens);
    if (!acesso) {
      setErro('Este QR não é o de entrada da OC. Peça ao engenheiro o QR da tela Mestres.');
      return;
    }
    setErro('');
    setEntrando(true);
    try {
      await entrarComOQr(acesso);
      // A troca de tela vem do App, quando a sessão chega.
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para entrar.');
      setEntrando(false);
    }
  }

  if (lendo) return <LerQr aoLer={(t) => void aoLer(t)} aoVoltar={() => setLendo(false)} />;

  return (
    <div className={styles.tela} data-entrada-do-mestre="no-icone">
      <header className={styles.topo}>
        <h1 className={styles.titulo}>Central de Compras</h1>
      </header>
      <p>Mestre de obra: peça o QR ao engenheiro e toque no botão.</p>
      {erro && (
        <p className={styles.aviso} role="alert">
          {erro}
        </p>
      )}
      <button
        type="button"
        className={styles.primario}
        disabled={entrando}
        onClick={() => {
          setErro('');
          setLendo(true);
        }}
      >
        <Icon name="qr" size={26} /> {entrando ? 'Entrando…' : 'Ler o QR'}
      </button>
      <button type="button" className={styles.sair} onClick={aoUsarSenha}>
        Entrar com e-mail e senha
      </button>
    </div>
  );
}

/** A câmera de trás, procurando um QR; para sozinha ao achar. */
export function LerQr({ aoLer, aoVoltar }: { aoLer: (texto: string) => void; aoVoltar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState('');
  // A câmera abre uma vez: quem avisa do QR achado pode mudar sem reabrir a câmera.
  const avisar = useRef(aoLer);
  useEffect(() => {
    avisar.current = aoLer;
  }, [aoLer]);

  useEffect(() => {
    let parado = false;
    let fluxo: MediaStream | null = null;
    let relogio: ReturnType<typeof setTimeout> | null = null;

    void (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro('Este celular não abriu a câmera para a OC.');
        return;
      }
      try {
        fluxo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      } catch (e) {
        const nome = e instanceof DOMException ? e.name : '';
        setErro(
          nome === 'NotAllowedError'
            ? 'A OC está sem permissão para a câmera. Libere a câmera e tente de novo.'
            : 'Não deu para abrir a câmera. Feche e tente de novo.',
        );
        return;
      }
      if (parado) {
        fluxo.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = video.current!;
      v.srcObject = fluxo;
      await v.play().catch(() => undefined);
      // O leitor só carrega aqui: quem não lê QR não baixa o leitor.
      const { default: jsQR } = await import('jsqr');
      const quadro = document.createElement('canvas');
      const ctx = quadro.getContext('2d', { willReadFrequently: true });
      const procurar = () => {
        if (parado || !ctx) return;
        if (v.videoWidth > 0) {
          // Reduzido: acha o QR do mesmo jeito, e o celular simples não engasga.
          const escala = Math.min(1, 640 / v.videoWidth);
          quadro.width = Math.round(v.videoWidth * escala);
          quadro.height = Math.round(v.videoHeight * escala);
          ctx.drawImage(v, 0, 0, quadro.width, quadro.height);
          const img = ctx.getImageData(0, 0, quadro.width, quadro.height);
          const achado = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
          if (achado?.data) {
            parado = true;
            fluxo?.getTracks().forEach((t) => t.stop());
            avisar.current(achado.data);
            return;
          }
        }
        relogio = setTimeout(procurar, 200);
      };
      procurar();
    })();

    return () => {
      parado = true;
      if (relogio) clearTimeout(relogio);
      fluxo?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className={styles.tela} data-entrada-do-mestre="lendo">
      <header className={styles.topo}>
        <h1 className={styles.titulo}>Aponte para o QR</h1>
      </header>
      {erro ? (
        <p className={styles.aviso} role="alert">
          {erro}
        </p>
      ) : (
        <video ref={video} className={meus.camera} playsInline muted aria-label="Câmera" />
      )}
      <button type="button" className={styles.secundario} onClick={aoVoltar}>
        Voltar
      </button>
    </div>
  );
}

/**
 * No pé da lista do mestre, fora do ícone: o pedido de pôr o ícone. No
 * Android, o botão abre o pedido do navegador; no iPhone, os passos — e o
 * aviso de que o ícone vai pedir o QR de novo (o login do Safari não vai junto).
 */
export function PedirOIcone() {
  const [, mexeu] = useState(0);
  useEffect(() => aoMudarPedidoDeInstalar(() => mexeu((n) => n + 1)), []);

  if (estaNoIcone()) return null;

  if (ehDaApple()) {
    return (
      <section className={meus.pedido} data-pedir-o-icone="iphone">
        <h2 className={meus.pedidoTitulo}>Ponha a OC na tela do celular</h2>
        <PassosDoIphone />
        <p className={styles.dica}>No iPhone, o ícone pede o QR de novo: peça um ao engenheiro e toque em “Ler o QR”.</p>
      </section>
    );
  }

  if (!podePedirParaInstalar()) return null;
  return (
    <section className={meus.pedido} data-pedir-o-icone="android">
      <h2 className={meus.pedidoTitulo}>Ponha a OC na tela do celular</h2>
      <p className={styles.dica}>Assim você abre direto, sem procurar no navegador.</p>
      <button type="button" className={styles.secundario} onClick={() => void pedirParaInstalar()}>
        Pôr o ícone na tela
      </button>
    </section>
  );
}
