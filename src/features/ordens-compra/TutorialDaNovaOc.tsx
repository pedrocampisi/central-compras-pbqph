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
  PASSOS_DA_NOVA_OC, passoSeguiu, rotuloDoAvancar, type PassoDoTutorial,
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

type Lugar = { faixa: true } | { faixa: false; top: number; left: number };

function alvoNaTela(passo: PassoDoTutorial): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tutorial="${passo.alvo}"]`);
}

/** Acima do alvo (a lista do campo abre para baixo); sem espaço, embaixo. */
function lugarDoBalao(alvo: HTMLElement | null, balao: HTMLElement | null): Lugar {
  if (window.innerWidth < LARGURA_DA_FAIXA || !alvo || !balao) return { faixa: true };
  const r = alvo.getBoundingClientRect();
  const h = balao.offsetHeight;
  const w = balao.offsetWidth;
  const acima = r.top - DISTANCIA - h;
  const top = acima >= MARGEM ? acima : Math.min(r.bottom + DISTANCIA, window.innerHeight - h - MARGEM);
  const left = Math.max(MARGEM, Math.min(r.left, window.innerWidth - w - MARGEM));
  return { faixa: false, top, left };
}

export function TutorialDaNovaOc({ oc, indice, onIr, onSair, passos = PASSOS_DA_NOVA_OC }: Props) {
  const passo = passos[indice]!;
  const ultimo = indice === passos.length - 1;
  const idDoTitulo = useId();
  const balaoRef = useRef<HTMLDivElement>(null);
  const [lugar, setLugar] = useState<Lugar>({ faixa: true });
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
      const novo = lugarDoBalao(alvoNaTela(passo), balaoRef.current);
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
      className={[styles.balao, lugar.faixa ? styles.faixa : ''].filter(Boolean).join(' ')}
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
