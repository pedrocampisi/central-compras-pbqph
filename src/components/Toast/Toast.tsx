import { createPortal } from 'react-dom';
import { useUiStore } from '../../stores/useUiStore';
import { Icon } from '../Icon/Icon';
import styles from './Toast.module.css';

/**
 * Renderiza todos os toasts da fila do useUiStore via portal. O de erro não some
 * sozinho (CTO-D1034f item 10): fica até a pessoa fechar, no X ou num clique no aviso.
 *
 * Na tela ficam no máximo três, os mais novos (D1034k, achado 4): seis erros
 * seguidos empurravam o mais novo para fora da tela. Os de trás esperam na
 * fila, e cada um que se fecha dá a vez ao seguinte.
 */
const NA_TELA = 3;

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return createPortal(
    <div className={styles.container} aria-live="polite">
      {toasts.slice(-NA_TELA).map((t) => (
        <div
          key={t.id}
          className={[styles.toast, styles[t.tone]].join(' ')}
          role="alert"
          onClick={() => dismiss(t.id)}
        >
          <span className={styles.texto}>{t.message}</span>
          {t.tone === 'error' && (
            <button
              type="button"
              className={`cp-icone ${styles.fechar}`}
              aria-label="Fechar o aviso"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      ))}
    </div>,
    document.body,
  );
}
