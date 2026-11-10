/**
 * O botão "Mais" (CANDIDATA `cc-mais`, CTO-D1034f itens 1, 5 e 8): os três
 * pontos que guardam as ações que não são a principal da linha ou da tela.
 * Nada some: o que sai da linha vem para cá.
 *
 * Teclado, como manda o padrão para menu: Enter ou Espaço abre e o foco vai à
 * primeira ação; setas, Home e End andam; Esc e Tab fecham, e o foco volta ao
 * botão. O clique fora fecha.
 *
 * A lista é `position: fixed`, medida a partir do botão: dentro da tabela, que
 * rola de lado, uma lista `absolute` seria cortada pela caixa da tabela.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Icon } from '../Icon/Icon';

export interface AcaoDoMais {
  rotulo: string;
  aoEscolher: () => void;
  desabilitada?: boolean;
  /** O porquê, quando desabilitada, ou o que a ação faz. */
  titulo?: string;
}

interface MaisProps {
  acoes: (AcaoDoMais | false | null | undefined)[];
  /** O nome para o leitor de tela: "Mais ações da OC 2026/031". */
  rotulo?: string;
  className?: string;
}

const LARGURA = 232;

export function Mais({ acoes, rotulo = 'Mais ações', className }: MaisProps) {
  const lista = acoes.filter((a): a is AcaoDoMais => !!a);
  const [aberto, setAberto] = useState(false);
  const [onde, setOnde] = useState<CSSProperties>({});
  const botao = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();

  const fechar = (devolverFoco = true) => {
    setAberto(false);
    if (devolverFoco) botao.current?.focus();
  };

  // A lista abre embaixo do botão, alinhada à direita dele; sem espaço embaixo, abre em cima.
  useLayoutEffect(() => {
    if (!aberto || !botao.current) return;
    const r = botao.current.getBoundingClientRect();
    const altura = menu.current?.offsetHeight ?? 0;
    const esquerda = Math.max(8, Math.min(r.right - LARGURA, window.innerWidth - LARGURA - 8));
    const embaixo = r.bottom + 4 + altura <= window.innerHeight - 8;
    setOnde(embaixo ? { left: esquerda, top: r.bottom + 4 } : { left: esquerda, bottom: window.innerHeight - r.top + 4 });
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }, [aberto]);

  // Clique fora, rolagem e mudança de tamanho fecham (a lista mediu o botão parado).
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!menu.current?.contains(alvo) && !botao.current?.contains(alvo)) setAberto(false);
    };
    const mexeu = (e: Event) => {
      if (e.target instanceof Node && menu.current?.contains(e.target)) return;
      setAberto(false);
    };
    document.addEventListener('pointerdown', fora);
    window.addEventListener('scroll', mexeu, true);
    window.addEventListener('resize', mexeu);
    return () => {
      document.removeEventListener('pointerdown', fora);
      window.removeEventListener('scroll', mexeu, true);
      window.removeEventListener('resize', mexeu);
    };
  }, [aberto]);

  if (lista.length === 0) return null;

  const andar = (e: KeyboardEvent<HTMLDivElement>) => {
    const itens = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [])];
    const i = itens.indexOf(document.activeElement as HTMLElement);
    const ir = (j: number) => itens[(j + itens.length) % itens.length]?.focus();
    if (e.key === 'ArrowDown') ir(i + 1);
    else if (e.key === 'ArrowUp') ir(i - 1);
    else if (e.key === 'Home') ir(0);
    else if (e.key === 'End') ir(itens.length - 1);
    else if (e.key === 'Escape') fechar();
    else if (e.key === 'Tab') fechar(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
    e.stopPropagation(); // o Esc aqui fecha só a lista, e não a gaveta ou o menu por trás
  };

  return (
    <div className={`cc-mais ${className ?? ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        ref={botao}
        type="button"
        className="cp-icone cc-mais-botao"
        aria-label={rotulo}
        title={rotulo}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? id : undefined}
        onClick={() => setAberto((a) => !a)}
      >
        <Icon name="mais" size={18} />
      </button>
      {aberto && (
        <div ref={menu} id={id} role="menu" aria-label={rotulo} className="cc-mais-lista" style={onde} onKeyDown={andar}>
          {lista.map((a) => (
            <button
              key={a.rotulo}
              type="button"
              role="menuitem"
              disabled={a.desabilitada}
              title={a.titulo}
              onClick={() => {
                fechar();
                a.aoEscolher();
              }}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
