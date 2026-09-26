/**
 * Lista de escolha que aceita texto: a pessoa digita e a lista vai filtrando.
 *
 * Só para Obra e Fornecedor (CTO-D541, palavra do Pedro em 26/09/2026). Os
 * outros campos de escolha continuam `<select>` — de propósito, porque são
 * listas curtas, e o Pedro disse que neles não precisa.
 *
 * Teclado (o padrão "combobox" do WAI-ARIA):
 *   digitar ...... abre e filtra          ↓ / ↑ ...... anda na lista (abre se fechada)
 *   Enter ........ escolhe o destacado    Esc ........ fecha sem mudar nada
 *   Tab / sair ... fecha sem mudar nada   clique ..... escolhe
 *
 * Com a pesquisa vazia aparece a lista inteira, e no topo a opção "vazia"
 * (Selecione… / Todos …), para desfazer uma escolha.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { filtrarOpcoes, type OpcaoPesquisavel } from '../../domain/pesquisa';
import { Icon } from '../Icon/Icon';
import styles from './CampoPesquisavel.module.css';

interface Props {
  opcoes: OpcaoPesquisavel[];
  /** O valor escolhido hoje ('' = nenhum). */
  valor: string;
  onEscolher: (valor: string) => void;
  /** O texto da opção vazia e do campo sem escolha: "Selecione…", "Todos fornecedores". */
  rotuloVazio: string;
  /** `campo` para formulário (Nova OC); `filtro` para a barra de filtros (Histórico). */
  variante?: 'campo' | 'filtro';
  id?: string;
  /** Nome para leitor de tela quando não há `<label>` apontando para o campo. */
  ariaLabel?: string;
  required?: boolean;
}

export function CampoPesquisavel({
  opcoes, valor, onEscolher, rotuloVazio, variante = 'campo', id, ariaLabel, required,
}: Props) {
  const idGerado = useId();
  const idCampo = id ?? `pesq-${idGerado}`;
  const idLista = `${idCampo}-lista`;

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState(0);
  const listaRef = useRef<HTMLUListElement>(null);

  const escolhida = opcoes.find((o) => o.valor === valor);
  const vazia: OpcaoPesquisavel = { valor: '', rotulo: rotuloVazio };

  // A opção vazia só aparece quando não há texto: quem digitou procura alguém.
  const visiveis = useMemo(
    () => (busca.trim() ? filtrarOpcoes(opcoes, busca) : [vazia, ...opcoes]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opcoes, busca, rotuloVazio],
  );

  function abrir() {
    if (aberto) return;
    setBusca('');
    const i = [vazia, ...opcoes].findIndex((o) => o.valor === valor);
    setAtivo(i < 0 ? 0 : i);
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setBusca('');
  }

  function escolher(o: OpcaoPesquisavel | undefined) {
    if (!o) return;
    onEscolher(o.valor);
    fechar();
  }

  // O destacado fica sempre à vista quando se anda pelas setas.
  useEffect(() => {
    if (!aberto) return;
    const el = listaRef.current?.children[ativo] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [ativo, aberto]);

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!aberto) { abrir(); return; }
        setAtivo((i) => Math.min(i + 1, visiveis.length - 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (!aberto) { abrir(); return; }
        setAtivo((i) => Math.max(i - 1, 0));
        return;
      case 'Enter':
        if (aberto) {
          e.preventDefault();
          escolher(visiveis[ativo]);
        }
        return;
      case 'Escape':
        if (aberto) {
          e.preventDefault();
          fechar();
        }
        return;
      case 'Tab':
        fechar();
        return;
    }
  }

  const idAtivo = aberto && visiveis[ativo] ? `${idCampo}-op-${ativo}` : undefined;

  return (
    <div className={[styles.caixa, variante === 'filtro' ? styles.filtro : styles.campo].join(' ')}>
      <Icon name="search" size={14} className={styles.lupa} />
      <input
        id={idCampo}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-activedescendant={idAtivo}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        autoComplete="off"
        spellCheck={false}
        className={styles.entrada}
        value={aberto ? busca : escolhida?.rotulo ?? ''}
        placeholder={aberto ? escolhida?.rotulo ?? rotuloVazio : rotuloVazio}
        onClick={abrir}
        onChange={(e) => {
          setBusca(e.target.value);
          setAtivo(0);
          setAberto(true);
        }}
        onKeyDown={aoTeclar}
        onBlur={fechar}
      />
      {aberto && (
        <ul id={idLista} role="listbox" ref={listaRef} className={styles.lista}>
          {visiveis.length === 0 ? (
            <li className={styles.nada} role="presentation">Nada encontrado para “{busca.trim()}”</li>
          ) : (
            visiveis.map((o, i) => (
              <li
                key={o.valor || '__vazia'}
                id={`${idCampo}-op-${i}`}
                role="option"
                aria-selected={o.valor === valor}
                className={[
                  styles.opcao,
                  i === ativo ? styles.ativa : '',
                  o.valor === valor ? styles.escolhida : '',
                  o.valor === '' ? styles.opcaoVazia : '',
                ].join(' ')}
                // mousedown, e não click: o click chega depois do blur, e o
                // blur já teria fechado a lista.
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(o);
                }}
                onMouseMove={() => setAtivo(i)}
              >
                <span className={styles.rotulo}>{o.rotulo}</span>
                {o.detalhe && <span className={styles.detalhe}>{o.detalhe}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
