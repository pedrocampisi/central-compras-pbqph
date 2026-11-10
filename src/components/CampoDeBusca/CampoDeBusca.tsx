/**
 * O campo de busca com o X para apagar (CTO-D975, pedido do Pedro).
 *
 * O X só aparece com texto; um clique (ou o Esc dentro do campo) apaga tudo e
 * devolve o cursor ao campo. É um botão de verdade, de 32 px, e não o X nativo
 * do `type="search"` — esse é miúdo e some com o tema, então o escondemos.
 * O pai fornece a classe do campo e a do botão (o lugar dele muda de tela).
 */
import { useRef, type InputHTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './CampoDeBusca.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string;
  onChange: (valor: string) => void;
};

export function CampoDeBusca({ value, onChange, onKeyDown, className, ...resto }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function limpar() {
    onChange('');
    ref.current?.focus();
  }

  return (
    <>
      <input
        {...resto}
        ref={ref}
        type="search"
        className={[styles.campo, className].filter(Boolean).join(' ')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Escape' && value !== '') {
            e.preventDefault();
            limpar();
          }
        }}
      />
      {value !== '' && (
        <button type="button" className={styles.limpar} aria-label="Limpar a busca" onClick={limpar}>
          <Icon name="x" size={16} />
        </button>
      )}
    </>
  );
}
