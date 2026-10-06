/**
 * Procedimento de Compras (PS.02) — o manual de compras da equipe (CTO-D730
 * §3.1, palavra do Pedro: "Para ela servir como um Manual").
 *
 * A estrutura é a do documento do SGQ; a cara é a da OC:
 * - o cabeçalho (os seis campos), o sumário, o "Como usar" e o fluxo didático;
 * - as seções 1 a 7, cada uma com o selo, o "?" (o texto dele é conteúdo) e os
 *   blocos na ordem do documento; o histórico de revisões é a seção 7.
 *
 * Só leitura. O texto é o que vale, palavra por palavra: a tela não resume e
 * não conserta (nem o "item 6" da tabela do item 2: isso é a Rev. 01). Sem
 * emoji nos cartões do fluxo (regra 6 da casa; o banco guarda o que o arquivo
 * tem). Ir a um lugar do documento é pulo, sem rolagem animada (regra 8).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CAMPOS_DO_CABECALHO,
  COLUNAS_DAS_REVISOES,
  FALHA_AO_LER,
  NENHUMA_REVISAO,
  NOME_DA_PAGINA,
  O_QUE_E_A_PAGINA,
  PS02,
  SEM_PROCEDIMENTO,
  SEM_REVISOES,
  SUMARIO,
  linhaDaRevisao,
  semEmoji,
  type Bloco,
  type Procedimento,
  type RevisaoDoProcedimento,
  type TextoRico,
} from '../../domain/procedimento';
import { formatDate } from '../../domain/format';
import { lerProcedimento } from '../../services/supabase/procedimento';
import { baixarPdfDoProcedimento } from '../../services/pdf/generateProcedimentoPdf';
import { useUiStore } from '../../stores/useUiStore';
import { Ajuda } from '../../components/Ajuda/Ajuda';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Loader } from '../../components/Loader/Loader';
import styles from './ProcedimentoPage.module.css';

/** A frase com o negrito do documento. */
function Rico({ texto }: { texto: TextoRico }) {
  return (
    <>
      {texto.map((p, i) => (p.negrito ? <strong key={i}>{p.texto}</strong> : <span key={i}>{p.texto}</span>))}
    </>
  );
}

function Revisoes({ revisoes }: { revisoes: RevisaoDoProcedimento[] | null }) {
  if (!revisoes) return <p className={styles.semTexto}>{SEM_REVISOES}</p>;
  if (revisoes.length === 0) return <p className={styles.semTexto}>{NENHUMA_REVISAO}</p>;
  return (
    <table className={`${styles.tabela} ${styles.empilha}`} data-historico="">
      <thead>
        <tr>
          {COLUNAS_DAS_REVISOES.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {revisoes.map((r, i) => (
          <tr key={i}>
            {linhaDaRevisao(r).map((c, j) => (
              <td key={j} data-coluna={COLUNAS_DAS_REVISOES[j]}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const CLASSE_DO_DESTAQUE = { aviso: styles.aviso, informacao: styles.informacao, miudo: styles.miudo } as const;

function BlocoDoDocumento({ bloco, revisoes }: { bloco: Bloco; revisoes: RevisaoDoProcedimento[] | null }) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return (
        <p id={bloco.ancora} className={bloco.destaque ? CLASSE_DO_DESTAQUE[bloco.destaque] : styles.paragrafo}>
          <Rico texto={bloco.texto} />
        </p>
      );
    case 'quadros':
      return (
        <div id={bloco.ancora} className={styles.quadros}>
          {bloco.quadros.map((q) => (
            <div key={q.ancora} id={q.ancora} className={styles.quadro}>
              <strong>{q.titulo}</strong>
              <span>{q.texto}</span>
            </div>
          ))}
        </div>
      );
    case 'lista':
      return (
        <ol id={bloco.ancora} className={styles.lista}>
          {bloco.itens.map((it) => (
            <li key={it.ancora} id={it.ancora}>
              {it.texto}
            </li>
          ))}
        </ol>
      );
    case 'tabela':
      return (
        <table id={bloco.ancora} className={`${styles.tabela} ${styles.empilha}`}>
          <thead>
            <tr>
              {bloco.colunas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloco.linhas.map((l) => (
              <tr key={l.ancora} id={l.ancora}>
                {l.celulas.map((c, j) => (
                  <td key={j} data-coluna={bloco.colunas[j]}>
                    <Rico texto={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'historico':
      return (
        <div id={bloco.ancora}>
          <Revisoes revisoes={revisoes} />
        </div>
      );
  }
}

function Documento({ p, irPara }: { p: Procedimento; irPara: (ancora: string) => void }) {
  return (
    <>
      <header className={styles.cabecalho}>
        <span className={styles.sobretitulo}>{p.sobretitulo}</span>
        <h3 className={styles.titulo}>{p.titulo}</h3>
        <span className={styles.subtitulo}>{p.subtitulo}</span>
        <dl className={styles.campos}>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.codigo}</dt>
            <dd>{p.codigo}</dd>
          </div>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.revisao}</dt>
            <dd>
              Rev. {p.revisao}
              {p.situacao && <span className={styles.situacao}>{p.situacao}</span>}
            </dd>
          </div>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.data}</dt>
            <dd>{formatDate(p.data)}</dd>
          </div>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.responsavel}</dt>
            <dd>{p.responsavel}</dd>
          </div>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.referencia}</dt>
            <dd>{p.referencia}</dd>
          </div>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.escopo}</dt>
            <dd>{p.escopo}</dd>
          </div>
        </dl>
      </header>

      <nav className={styles.sumario} aria-label="Sumário do procedimento">
        <strong>{SUMARIO}</strong>
        {p.sumario.map((s) => (
          <button key={s.ancora} type="button" onClick={() => irPara(s.ancora)}>
            {s.texto}
          </button>
        ))}
      </nav>

      <p className={styles.comoUsar}>
        <Rico texto={p.comoUsar} />
      </p>

      <section className={styles.fluxo} aria-labelledby="fluxo-titulo">
        <h3 id="fluxo-titulo">{p.fluxo.titulo}</h3>
        <p className={styles.fluxoIntro}>{p.fluxo.introducao}</p>
        <div className={styles.cartoes}>
          {p.fluxo.cartoes.map((c, i) => {
            const conteudo = (
              <>
                <strong>{semEmoji(c.titulo)}</strong>
                <span>{c.texto}</span>
              </>
            );
            // O cartão leva aonde o documento leva: a linha da tabela ou a seção.
            return c.destino ? (
              <button key={i} type="button" className={styles.cartao} onClick={() => irPara(c.destino!)}>
                {conteudo}
              </button>
            ) : (
              <div key={i} className={styles.cartao}>
                {conteudo}
              </div>
            );
          })}
        </div>
        <h4>{p.fluxo.tituloDaSequencia}</h4>
        <ol className={styles.sequencia}>
          {p.fluxo.sequencia.map((s, i) => (
            <li key={i}>
              <strong>{s.titulo}</strong>
              <span>{s.texto}</span>
            </li>
          ))}
        </ol>
      </section>

      {p.secoes.map((s) => (
        <section key={s.ancora} id={s.ancora} className={styles.secao} aria-labelledby={`${s.ancora}-titulo`}>
          <div className={styles.cabecaDaSecao}>
            <span className={styles.numero}>{s.numero}</span>
            <h3 id={`${s.ancora}-titulo`}>{s.titulo}</h3>
            {s.selo && <span className={styles.selo}>{s.selo}</span>}
            {s.ajuda && <Ajuda sobre={`O que diz o item ${s.numero}`}>{s.ajuda}</Ajuda>}
          </div>
          {s.blocos.map((b) => (
            <BlocoDoDocumento key={b.ancora} bloco={b} revisoes={p.revisoes} />
          ))}
        </section>
      ))}

      {p.rodape && (
        <footer className={styles.rodape}>
          <strong>{p.rodape.titulo}</strong>
          <span>{p.rodape.texto}</span>
        </footer>
      )}
    </>
  );
}

type Estado = { tipo: 'lendo' } | { tipo: 'falhou' } | { tipo: 'pronto'; p: Procedimento | null };

export function ProcedimentoPage() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'lendo' });
  const [vez, setVez] = useState(0);
  const [gerando, setGerando] = useState(false);
  const ancora = useUiStore((s) => s.ancoraDoProcedimento);
  const chegou = useUiStore((s) => s.chegouNoProcedimento);
  const showToast = useUiStore((s) => s.showToast);
  const marcado = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let vivo = true;
    lerProcedimento(PS02).then(
      (p) => vivo && setEstado({ tipo: 'pronto', p }),
      () => vivo && setEstado({ tipo: 'falhou' }),
    );
    return () => {
      vivo = false;
    };
  }, [vez]);

  // Pula para o lugar e o marca, sem animação; a marca fica até o próximo pulo.
  const irPara = useCallback((destino: string) => {
    marcado.current?.removeAttribute('data-alvo');
    const el = document.getElementById(destino);
    if (!el) return;
    el.setAttribute('data-alvo', '');
    marcado.current = el;
    el.scrollIntoView({ block: 'start' });
  }, []);

  // O "ver no PS.02, item N" das outras telas: com o texto na tela, vai ao lugar.
  useEffect(() => {
    if (!ancora || estado.tipo !== 'pronto') return;
    irPara(ancora);
    chegou();
  }, [ancora, estado, irPara, chegou]);

  async function pdf(p: Procedimento) {
    setGerando(true);
    try {
      await baixarPdfDoProcedimento(p);
    } catch (err) {
      showToast(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'erro desconhecido'}`, 'error');
    } finally {
      setGerando(false);
    }
  }

  const p = estado.tipo === 'pronto' ? estado.p : null;

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>{NOME_DA_PAGINA}</h2>
          <p className="section-sub">{O_QUE_E_A_PAGINA}</p>
        </div>
        {p && (
          <Button variant="outline" size="sm" loading={gerando} onClick={() => void pdf(p)} aria-label={`PDF do ${p.codigo}`}>
            {!gerando && <Icon name="download" size={14} />}
            PDF
          </Button>
        )}
      </div>

      {estado.tipo === 'lendo' && <Loader texto="Lendo o procedimento…" />}
      {estado.tipo === 'falhou' && (
        <div className={styles.aviso} role="alert">
          {FALHA_AO_LER}{' '}
          <Button variant="outline" size="sm" onClick={() => {
              setEstado({ tipo: 'lendo' });
              setVez((v) => v + 1);
            }}>
            Tentar de novo
          </Button>
        </div>
      )}
      {estado.tipo === 'pronto' && !p && <p className={styles.semTexto}>{SEM_PROCEDIMENTO}</p>}
      {p && (
        <article className={styles.documento} data-procedimento={p.codigo}>
          <Documento p={p} irPara={irPara} />
        </article>
      )}
    </div>
  );
}
