import { createPortal } from 'react-dom';
import { useUiStore } from '../../stores/useUiStore';
import styles from './Toast.module.css';

/** Renderiza todos os toasts da fila do useUiStore via portal. */
export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return createPortal(
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[styles.toast, styles[t.tone]].join(' ')}
          role="alert"
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
