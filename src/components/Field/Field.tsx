import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldBaseProps {
  label: string;
  hint?: string;
  wide?: boolean;
  span2?: boolean;
  required?: boolean;
}

// ── Input Field ────────────────────────────────────────────────────────────────

interface InputFieldProps extends FieldBaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaFieldProps extends FieldBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

interface SelectFieldProps extends FieldBaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select';
  children: ReactNode;
}

export type FieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function Field({ label, hint, wide, span2, required, as: As = 'input', ...rest }: FieldProps) {
  const cls = [styles.field, wide ? styles.wide : '', span2 ? styles.span2 : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <label>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {As === 'textarea' ? (
        <textarea {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : As === 'select' ? (
        <select {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(rest as SelectFieldProps).children}
        </select>
      ) : (
        <input {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
