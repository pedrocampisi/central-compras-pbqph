/**
 * O balão do tutorial "Fazer uma OC" (CTO-D763). Componente da casa, sem
 * biblioteca: as duas permitidas escurecem a página fora do campo aceso, e
 * a lista do fornecedor abre por fora dele — a pessoa não conseguiria
 * escolher. Aqui nada cobre a página: o campo ganha um contorno, o balão fica
 * ao lado, e a tela inteira continua respondendo.
 *
 * O balão não toca na OC. Ele lê a OC para saber se a pessoa agiu, e só.
 * Sem movimento: o balão aparece no lugar, e a rolagem até o campo é seca.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button/Button';
import type { OrdemCompra } from '../../domain/types';
import {
  PASSOS_DA_NOVA_OC, passoSeguiu, rotuloDoAvancar, type AlvoDoTutorial, type PassoDoTutorial,
} from '../../domain/tutorialDaNovaOc';
import styles from './TutorialDaNovaOc.module.css';

/** Abaixo disto o balão vira uma faixa no pé da tela. */
const LARGURA_DA_FAIXA = 700;
const MARGEM = 16;
const DISTANCIA = 12;

interface Props {
  oc: OrdemCompra;
  indice: number;
  onIr: (indice: number) => void;
  onSair: () => void;
  passos?: readonly PassoDoTutorial[];
}

type Lugar = { faixa: 'embaixo' | 'em-cima' } | { faixa: false; top: number; left: number };

function alvoNaTela(passo: PassoDoTutorial): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tutorial="${passo.alvo}"]`);
}

/**
 * Os totais ficam na coluna da direita, e em cima deles está a tabela de
 * itens: o balão vai para o vão da esquerda (CTO-D764 §2.1).
 */
const VAI_PARA_A_ESQUERDA: ReadonlySet<AlvoDoTutorial> = new Set(['totais']);

/**
 * Nunca embaixo do alvo, se der: a lista do campo abre para baixo, e o balão
 * a cobriria. Acima; sem espaço, ao lado (direita, depois esquerda); só então
 * embaixo. Na tela pequena, a faixa fica no pé — e sobe quando o alvo está lá.
 */
function lugarDoBalao(alvo: HTMLElement | null, balao: HTMLElement | null, esquerdaPrimeiro = false): Lugar {
  if (!alvo || !balao) return { faixa: 'embaixo' };
  const r = alvo.getBoundingClientRect();
  const h = balao.offsetHeight;
  const w = balao.offsetWidth;
  const altura = window.innerHeight;
  const largura = window.innerWidth;
  if (largura < LARGURA_DA_FAIXA) return { faixa: r.bottom > altura - h - 2 * DISTANCIA ? 'em-cima' : 'embaixo' };
  const naAltura = (top: number) => Math.max(MARGEM, Math.min(top, altura - h - MARGEM));
  const naLargura = (left: number) => Math.max(MARGEM, Math.min(left, largura - w - MARGEM));
  if (esquerdaPrimeiro && r.left - DISTANCIA - w >= MARGEM) {
    return { faixa: false, top: naAltura(r.top), left: r.left - DISTANCIA - w };
  }
  if (r.top - DISTANCIA - h >= MARGEM) return { faixa: false, top: r.top - DISTANCIA - h, left: naLargura(r.left) };
  if (r.right + DISTANCIA + w <= largura - MARGEM) return { faixa: false, top: naAltura(r.top), left: r.right + DISTANCIA };
  if (r.left - DISTANCIA - w >= MARGEM) return { faixa: false, top: naAltura(r.top), left: r.left - DISTANCIA - w };
  return { faixa: false, top: naAltura(r.bottom + DISTANCIA), left: naLargura(r.left) };
}

export function TutorialDaNovaOc({ oc, indice, onIr, onSair, passos = PASSOS_DA_NOVA_OC }: Props) {
  const passo = passos[indice]!;
  const ultimo = indice === passos.length - 1;
  const idDoTitulo = useId();
  const balaoRef = useRef<HTMLDivElement>(null);
  const [lugar, setLugar] = useState<Lugar>({ faixa: 'embaixo' });
  // O retrato da OC quando o passo começou: o passo segue quando ele muda.
  const naEntrada = useRef('');

  // Acende o alvo do passo e rola até ele.
  useLayoutEffect(() => {
    naEntrada.current = passo.retrato?.(oc) ?? '';
    const alvo = alvoNaTela(passo);
    if (!alvo) return;
    alvo.setAttribute('data-tutorial-aceso', '');
    alvo.scrollIntoView?.({ block: window.innerWidth < LARGURA_DA_FAIXA ? 'start' : 'center' });
    return () => alvo.removeAttribute('data-tutorial-aceso');
    // O retrato é do começo do passo: a OC mudando não reacende.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  // A pessoa agiu: o passo segue.
  useEffect(() => {
    if (!ultimo && passoSeguiu(passo, naEntrada.current, oc)) onIr(indice + 1);
  }, [oc, passo, indice, ultimo, onIr]);

  // O balão acompanha o alvo quando a página rola ou muda de tamanho.
  useEffect(() => {
    let quadro = 0;
    let antes = '';
    const medir = () => {
      const novo = lugarDoBalao(alvoNaTela(passo), balaoRef.current, VAI_PARA_A_ESQUERDA.has(passo.alvo));
      const chave = JSON.stringify(novo);
      if (chave !== antes) {
        antes = chave;
        setLugar(novo);
      }
      quadro = requestAnimationFrame(medir);
    };
    medir();
    return () => cancelAnimationFrame(quadro);
  }, [passo]);

  return (
    // Esc sai só com o foco no balão: na página, o Esc já fecha a lista do
    // campo, o "?" e a importação, e não pode levar o tutorial junto.
    <div
      ref={balaoRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={idDoTitulo}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onSair();
      }}
      className={[styles.balao, lugar.faixa ? styles.faixa : '', lugar.faixa === 'em-cima' ? styles.faixaEmCima : '']
        .filter(Boolean)
        .join(' ')}
      style={lugar.faixa ? undefined : { top: lugar.top, left: lugar.left }}
      data-tutorial-balao={passo.alvo}
    >
      <div aria-live="polite">
        <span className={styles.contagem}>
          Passo {indice + 1} de {passos.length}
        </span>
        <h3 id={idDoTitulo} className={styles.titulo}>{passo.titulo}</h3>
        <p className={styles.texto}>{passo.texto}</p>
        {passo.fazer && <p className={styles.fazer}>{passo.fazer}</p>}
      </div>
      <div className={styles.acoes}>
        <Button variant="ghost" size="sm" onClick={onSair}>Sair</Button>
        <span className={styles.direita}>
          <Button variant="outline" size="sm" onClick={() => onIr(indice - 1)} disabled={indice === 0}>
            Voltar
          </Button>
          <Button variant="navy" size="sm" onClick={() => (ultimo ? onSair() : onIr(indice + 1))}>
            {rotuloDoAvancar(indice, passos.length, passo)}
          </Button>
        </span>
      </div>
    </div>
  );
}
