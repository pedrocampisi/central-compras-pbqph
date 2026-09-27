/**
 * O campo do "Importar Pedido (IA)" (CTO-D554): o botão abre ESTE campo, e
 * não a pasta. Três portas para arquivo, e uma para texto (CTO-D557):
 *
 *   arrastar ............ os arquivos soltos dentro do campo
 *   Ctrl+V .............. decide pelo que VEIO (destinoDaColagem): imagem ou
 *                         arquivo importam, mesmo com o cursor na caixa de
 *                         texto do campo; texto vai para a caixa. Fora do
 *                         campo, num campo de texto da OC, cola como sempre
 *   "Escolher arquivo" .. a pasta, como antes (no celular: câmera ou galeria)
 *   a caixa de texto .... a lista de materiais do jeito que veio, e o
 *                         "Organizar com IA"
 *
 * E a escolha do leitor (CTO-D567): rápido ou certeiro, ANTES de ler, a mesma
 * para a imagem e para o texto. Depois da leitura, o campo fica aberto com o
 * resultado: o total lido em destaque, quem leu, e — se foi o rápido — o "Ler
 * de novo com o certeiro".
 *
 * O campo não lê nada sozinho: fecha pelo X ou pelo Esc, e quem lê é a página
 * (`onArquivos`, `onOrganizar`). Enquanto lê, as portas ficam fechadas. O texto
 * da caixa é da página, e por isso não se perde quando a leitura falha.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { Ajuda } from '../../components/Ajuda/Ajuda';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Loader } from '../../components/Loader/Loader';
import {
  ACCEPT_DA_IMPORTACAO,
  MAX_PAGINAS,
  destinoDaColagem,
  foraDeCampoDeTexto,
  juntarTexto,
} from '../../domain/importacao';
import { CERTEIRO_INDISPONIVEL, DICA_DO_LEITOR, LEITORES, type Leitor } from '../../domain/leitor';
import { formatBrl } from '../../domain/format';
import styles from './CampoDeImportacao.module.css';

export interface ResultadoNaTela {
  leitor: Leitor;
  itens: number;
  total: number;
}

interface Props {
  lendo: boolean;
  /** O que está sendo lido, para a frase da espera. */
  oQueLe?: 'arquivo' | 'texto';
  erro: string;
  onArquivos: (arquivos: File[]) => void;
  onFechar: () => void;
  texto?: string;
  onTexto?: (texto: string) => void;
  onOrganizar?: () => void;
  /** As linhas da última leitura que não viraram item — ficam até fechar. */
  ignoradas?: string[];
  /** A escolha do leitor (D567). Sem `onLeitor`, o campo não mostra a escolha. */
  leitor?: Leitor;
  onLeitor?: (l: Leitor) => void;
  /** Quem está lendo agora, para a espera dizer quanto pode levar. */
  lendoCom?: Leitor;
  resultado?: ResultadoNaTela | null;
  onLerDeNovoComCerteiro?: () => void;
  /** A leitura do rápido falhou de um jeito que o certeiro pode resolver. */
  oferecerCerteiro?: boolean;
  onLerComCerteiro?: () => void;
  /** Escolheu o certeiro e a resposta não era dele: nada entrou. */
  certeiroIndisponivel?: boolean;
}

const LEITORES_NA_ORDEM: Leitor[] = ['rapido', 'certeiro'];

function contarItens(n: number): string {
  return n === 1 ? '1 item' : `${n} itens`;
}

export function CampoDeImportacao({
  lendo,
  oQueLe = 'arquivo',
  erro,
  onArquivos,
  onFechar,
  texto = '',
  onTexto,
  onOrganizar,
  ignoradas = [],
  leitor = 'rapido',
  onLeitor,
  lendoCom = 'rapido',
  resultado = null,
  onLerDeNovoComCerteiro,
  oferecerCerteiro = false,
  onLerComCerteiro,
  certeiroIndisponivel = false,
}: Props) {
  const [arrastando, setArrastando] = useState(false);
  const zonaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const caixaRef = useRef<HTMLTextAreaElement>(null);
  const idDoLeitor = useId();

  // As portas leem a versão mais nova das props sem religar os ouvintes.
  const atual = useRef({ lendo, onArquivos, onFechar, texto, onTexto });
  useEffect(() => {
    atual.current = { lendo, onArquivos, onFechar, texto, onTexto };
  });

  // Ao abrir, o foco vem para o campo: o Ctrl+V já vale sem clicar em nada.
  useEffect(() => {
    zonaRef.current?.focus();
  }, []);

  useEffect(() => {
    const colar = (e: ClipboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const naCaixa = !!alvo && alvo === caixaRef.current;
      // Num campo de texto da OC (Descrição, Observações…), colar é colar.
      if (!naCaixa && !foraDeCampoDeTexto(alvo)) return;

      const arquivos = Array.from(e.clipboardData?.files ?? []);
      const dt = e.clipboardData as (DataTransfer & { getData?: unknown }) | null;
      const colado = dt && typeof dt.getData === 'function' ? dt.getData('text/plain') : '';
      const destino = destinoDaColagem(arquivos, colado);
      if (destino === 'nada') return;

      if (destino === 'arquivos') {
        e.preventDefault();
        if (!atual.current.lendo) atual.current.onArquivos(arquivos);
        return;
      }
      // Texto: dentro da caixa, o navegador cola onde está o cursor.
      if (naCaixa) return;
      e.preventDefault();
      const { lendo: l, onTexto: definir, texto: t } = atual.current;
      if (l || !definir) return;
      definir(juntarTexto(t, colado));
      caixaRef.current?.focus();
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

  const comTexto = !!onTexto;
  const comEscolha = !!onLeitor;
  const certeiroLendo = comEscolha && lendoCom === 'certeiro';

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
          <strong className={styles.titulo}>
            {oQueLe === 'texto' ? 'Organizando a lista' : 'Lendo o pedido'}
            {comEscolha ? ` com o ${LEITORES[lendoCom].nome.toLowerCase()}` : ''}…
          </strong>
          {certeiroLendo ? (
            <span className={styles.nota} data-espera-certeiro="">
              O certeiro pode levar <strong>até 1 minuto</strong>. A tela não travou: os itens entram
              na OC assim que a leitura terminar.
            </span>
          ) : (
            <span className={styles.nota}>Os itens entram na OC assim que a leitura terminar.</span>
          )}
          <div className={styles.espera}>
            <Loader />
          </div>
        </div>
      ) : (
        <>
          {resultado && (
            <section className={styles.resultado} aria-label="Resultado da leitura" data-resultado="">
              <div className={styles.linhaComAjuda}>
                <span className={styles.rotuloTotal}>Total lido</span>
                <Ajuda sobre="Por que conferir o total lido">
                  O rápido pode trocar um preço em foto ou papel escaneado. Nos testes, quando isso
                  aconteceu, o total lido quase sempre deixou de bater com o do papel. Conferir o total é
                  o jeito mais rápido de pegar o erro. Se não bater, leia de novo com o certeiro.
                </Ajuda>
              </div>
              <strong className={styles.totalLido} data-total-lido="">
                {formatBrl(resultado.total)}
              </strong>
              <span className={styles.subtitulo}>
                Lido pelo <strong>{LEITORES[resultado.leitor].nome.toLowerCase()}</strong> ·{' '}
                {contarItens(resultado.itens)}
              </span>
              <span className={styles.contexto}>
                Confira com a soma dos itens no papel, sem o frete. Se não bater, algum preço ou
                quantidade saiu errado.
              </span>
              {resultado.leitor === 'rapido' && onLerDeNovoComCerteiro && (
                <div className={styles.acaoDoResultado}>
                  <Button variant="outline" size="sm" onClick={onLerDeNovoComCerteiro}>
                    <Icon name="reload" size={13} /> Ler de novo com o certeiro
                  </Button>
                  <span className={styles.contexto}>
                    Troca os {contarItens(resultado.itens)} desta leitura pelos do certeiro. Leva até 1
                    minuto.
                  </span>
                </div>
              )}
            </section>
          )}

          {certeiroIndisponivel && (
            <div className={styles.avisoLeitor} role="alert" data-certeiro-indisponivel="">
              <strong>{CERTEIRO_INDISPONIVEL.titulo}</strong>
              <span>{CERTEIRO_INDISPONIVEL.texto}</span>
            </div>
          )}

          {erro && (
            <div className={styles.erroComAcao}>
              <p className={styles.erro} role="alert">
                {erro}
              </p>
              {oferecerCerteiro && onLerComCerteiro && (
                <div className={styles.acaoDoResultado}>
                  <Button variant="outline" size="sm" onClick={onLerComCerteiro}>
                    <Icon name="reload" size={13} /> Ler com o certeiro
                  </Button>
                  <span className={styles.contexto}>O mesmo pedido, pelo outro leitor. Leva até 1 minuto.</span>
                </div>
              )}
            </div>
          )}

          {ignoradas.length > 0 && (
            <div className={styles.ignoradas} role="status" aria-label="Linhas ignoradas">
              <strong>
                {ignoradas.length === 1 ? '1 linha ficou de fora' : `${ignoradas.length} linhas ficaram de fora`}{' '}
                — não viraram item:
              </strong>
              <ul>
                {ignoradas.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}

          {comEscolha && (
            <div className={styles.leitor} role="radiogroup" aria-labelledby={idDoLeitor}>
              <div className={styles.linhaComAjuda}>
                <span id={idDoLeitor} className={styles.tituloDoLeitor}>
                  Qual leitor da IA lê o pedido?
                </span>
                <Ajuda sobre="Os dois leitores">
                  Os dois leem o mesmo pedido, e você escolhe. No PDF que o fornecedor gera no
                  computador, os dois acertaram tudo nos testes. Em foto, papel escaneado, página de
                  lado ou letra miúda, o rápido errou preço em 7 de 16 leituras, e o certeiro em
                  nenhuma — mas ele demora mais. Na dúvida, leia com o rápido e confira o total: se não
                  bater, leia de novo com o certeiro.
                </Ajuda>
              </div>
              <span className={styles.subtituloDoLeitor}>A escolha vale para o arquivo e para a lista em texto.</span>
              <div className={styles.opcoes}>
                {LEITORES_NA_ORDEM.map((l) => (
                  <label
                    key={l}
                    className={[styles.opcao, leitor === l ? styles.opcaoMarcada : ''].filter(Boolean).join(' ')}
                  >
                    <input
                      type="radio"
                      name="oc-leitor"
                      value={l}
                      checked={leitor === l}
                      onChange={() => onLeitor?.(l)}
                    />
                    <span className={styles.opcaoTexto}>
                      <span className={styles.opcaoNome}>{LEITORES[l].nome}</span>
                      <span className={styles.opcaoParaQue}>{LEITORES[l].paraQue}</span>
                      <span className={styles.opcaoEspera}>{LEITORES[l].espera}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className={styles.dica} data-dica-do-leitor="">
                <Icon name="alerta" size={13} /> {DICA_DO_LEITOR}
              </p>
            </div>
          )}

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

          {comTexto && (
            <div className={styles.lista}>
              <label className={styles.rotuloDaLista} htmlFor="oc-lista-texto">
                ou cole aqui a lista de materiais, do jeito que veio
              </label>
              <textarea
                ref={caixaRef}
                id="oc-lista-texto"
                className={styles.caixa}
                rows={5}
                value={texto}
                placeholder={'Ex.:\n10 sacos de cimento\nareia média 3 m³\nvergalhão 10mm'}
                onChange={(e) => onTexto?.(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onOrganizar}
                disabled={texto.trim() === ''}
                title={texto.trim() === '' ? 'Cole a lista na caixa acima' : undefined}
              >
                <Icon name="sparkles" size={13} /> Organizar com IA
                {comEscolha ? ` (${LEITORES[leitor].nome.toLowerCase()})` : ''}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
