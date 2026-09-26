/**
 * O campo do "Importar Pedido (IA)" (CTO-D554): o botão abre ESTE campo, e
 * não a pasta. Três portas para o mesmo lugar:
 *
 *   arrastar ............ os arquivos soltos dentro do campo
 *   Ctrl+V .............. um print ou arquivos copiados no Explorer — só com o
 *                         campo aberto e o cursor fora de um campo de texto
 *   "Escolher arquivo" .. a pasta, como antes (no celular: câmera ou galeria)
 *
 * O campo não lê nada sozinho: fecha pelo X ou pelo Esc, e quem lê é a página
 * (`onArquivos`), pela `lerPedido`. Enquanto lê, as três portas ficam fechadas.
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Loader } from '../../components/Loader/Loader';
import { ACCEPT_DA_IMPORTACAO, MAX_PAGINAS, foraDeCampoDeTexto } from '../../domain/importacao';
import styles from './CampoDeImportacao.module.css';

interface Props {
  lendo: boolean;
  erro: string;
  onArquivos: (arquivos: File[]) => void;
  onFechar: () => void;
}

export function CampoDeImportacao({ lendo, erro, onArquivos, onFechar }: Props) {
  const [arrastando, setArrastando] = useState(false);
  const zonaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // As portas leem a versão mais nova das props sem religar os ouvintes.
  const atual = useRef({ lendo, onArquivos, onFechar });
  useEffect(() => {
    atual.current = { lendo, onArquivos, onFechar };
  });

  // Ao abrir, o foco vem para o campo: o Ctrl+V já vale sem clicar em nada.
  useEffect(() => {
    zonaRef.current?.focus();
  }, []);

  useEffect(() => {
    const colar = (e: ClipboardEvent) => {
      if (!foraDeCampoDeTexto(e.target as HTMLElement | null)) return;
      const arquivos = Array.from(e.clipboardData?.files ?? []);
      if (arquivos.length === 0) return;
      e.preventDefault();
      if (!atual.current.lendo) atual.current.onArquivos(arquivos);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || atual.current.lendo) return;
      if (!foraDeCampoDeTexto(e.target as HTMLElement | null)) return;
      atual.current.onFechar();
    };
    // Arquivo solto FORA do campo não pode virar navegação para o arquivo —
    // o navegador abriria o PDF por cima da OC e o rascunho iria junto.
    const soltarFora = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
    };
    document.addEventListener('paste', colar);
    document.addEventListener('keydown', tecla);
    window.addEventListener('dragover', soltarFora);
    window.addEventListener('drop', soltarFora);
    return () => {
      document.removeEventListener('paste', colar);
      document.removeEventListener('keydown', tecla);
      window.removeEventListener('dragover', soltarFora);
      window.removeEventListener('drop', soltarFora);
    };
  }, []);

  const entregar = (lista: FileList | null | undefined) => {
    const arquivos = Array.from(lista ?? []);
    if (arquivos.length > 0 && !lendo) onArquivos(arquivos);
  };

  return (
    <div
      ref={zonaRef}
      className={[styles.zona, arrastando ? styles.arrastando : ''].filter(Boolean).join(' ')}
      role="group"
      aria-label="Importar pedido pela IA"
      aria-busy={lendo}
      tabIndex={-1}
      data-campo-importacao=""
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = lendo ? 'none' : 'copy';
        if (!arrastando) setArrastando(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setArrastando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        entregar(e.dataTransfer.files);
      }}
    >
      <button
        type="button"
        className={styles.fechar}
        onClick={onFechar}
        disabled={lendo}
        aria-label="Fechar a importação"
        title="Fechar (Esc)"
      >
        <Icon name="x" size={16} />
      </button>

      {lendo ? (
        <div className={styles.lendo}>
          <strong className={styles.titulo}>Lendo o pedido…</strong>
          <span className={styles.nota}>Os itens entram na OC assim que a leitura terminar.</span>
          <div className={styles.espera}>
            <Loader />
          </div>
        </div>
      ) : (
        <>
          <span className={styles.icone}>
            <Icon name="upload" size={26} />
          </span>
          <strong className={styles.titulo}>
            <span className={styles.soComputador}>Arraste o pedido para cá ou cole com Ctrl+V</span>
            <span className={styles.soCelular}>Escolha o PDF ou as fotos do pedido</span>
          </strong>
          <span className={styles.nota}>
            PDF, JPG ou PNG, ou um print. Até {MAX_PAGINAS} páginas por leitura, somando tudo o que
            entrar junto.
          </span>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Escolher arquivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_DA_IMPORTACAO}
            hidden
            onChange={(e) => {
              entregar(e.target.files);
              e.target.value = ''; // o mesmo arquivo pode ser escolhido de novo
            }}
          />
        </>
      )}

      {erro && !lendo && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
