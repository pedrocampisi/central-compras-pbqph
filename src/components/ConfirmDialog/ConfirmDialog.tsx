import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { useFocoPreso } from '../../hooks/useFocoPreso';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A peça Janela do pacote (pecas\Janela): painel-alto, raio-g, o véu atrás,
 * até 400 px. Fecha no Esc, como a peça manda. O foco entra nela ao abrir, o
 * Tab dá a volta dentro dela, e ao fechar o foco volta para quem a abriu
 * (`useFocoPreso`, D1034k): o teclado não fica na tela de trás.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const caixa = useFocoPreso<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    // Na captura, e parando ali: com a janela aberta por cima de uma gaveta, o
    // Esc fecha só a janela.
    const noEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onCancel();
    };
    window.addEventListener('keydown', noEsc, true);
    return () => window.removeEventListener('keydown', noEsc, true);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal aria-labelledby="confirm-title">
      <div className={`cp-janela ${styles.box}`} ref={caixa} tabIndex={-1}>
        <h3 id="confirm-title" className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={`acoes ${styles.actions}`}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
