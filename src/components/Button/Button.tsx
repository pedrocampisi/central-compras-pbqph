import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'outline' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

/**
 * A peça Botão do padrão "Dia e noite" (pecas\Botao). Os nomes antigos das
 * variantes ficam, porque estão espalhados nas telas, e cada um aponta para
 * uma variante do pacote:
 *
 *   primary ··························· cp-btn--ouro: o UM destaque da tela
 *   secondary, outline, navy, success · cp-btn--contorno
 *   ghost ····························· cp-btn--texto
 *   danger ···························· cp-btn--perigo, só dentro de confirmação
 *
 * O `success` era verde: o padrão não pinta ação com a cor de situação.
 */
const DO_PACOTE: Record<ButtonVariant, string> = {
  primary: 'cp-btn--ouro',
  secondary: 'cp-btn--contorno',
  outline: 'cp-btn--contorno',
  navy: 'cp-btn--contorno',
  success: 'cp-btn--contorno',
  ghost: 'cp-btn--texto',
  danger: 'cp-btn--perigo',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'cp-btn',
        DO_PACOTE[variant],
        size === 'sm' ? 'cp-btn--p' : '',
        styles.btn,
        loading ? styles.loading : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      {children}
    </button>
  );
}
