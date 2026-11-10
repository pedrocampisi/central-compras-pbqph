import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * A gaveta lateral da ficha: a candidata `cc-gaveta` (styles/candidatas.css),
 * com o véu do pacote (`cp-veu`) atrás. Fecha no Esc, no X e no véu; o foco
 * entra nela ao abrir e volta para quem a abriu ao fechar.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const gaveta = useRef<HTMLDivElement>(null);

  // Fecha ao pressionar Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Bloqueia scroll do body; o foco entra e, ao fechar, volta para quem abriu.
  useEffect(() => {
    if (!open) return;
    const antes = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    gaveta.current?.focus();
    return () => {
      document.body.style.overflow = '';
      antes?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="cp-veu aberto" onClick={onClose} aria-hidden />
      <div className="cc-gaveta" role="dialog" aria-modal aria-label={title} ref={gaveta} tabIndex={-1}>
        <div className="cc-gaveta-topo">
          <h2>{title}</h2>
          <button type="button" className="cp-icone" onClick={onClose} aria-label="Fechar" title="Fechar">
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="cc-gaveta-miolo">{children}</div>
        {footer && <div className="cc-gaveta-pe">{footer}</div>}
      </div>
    </>,
    document.body,
  );
}
