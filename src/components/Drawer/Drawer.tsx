import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import { useFocoPreso } from '../../hooks/useFocoPreso';

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
 * entra nela ao abrir, o Tab dá a volta dentro dela, e ao fechar o foco volta
 * para quem a abriu (`useFocoPreso`, D1034k).
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const gaveta = useFocoPreso<HTMLDivElement>(open);

  // Fecha ao pressionar Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Bloqueia scroll do body enquanto a gaveta está aberta.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
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
