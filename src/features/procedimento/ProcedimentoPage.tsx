/**
 * Procedimento de Compras (PS.02) — o manual de compras da equipe (CTO-D730
 * §3.1, palavra do Pedro: "Para ela servir como um Manual").
 *
 * A estrutura é a do documento do SGQ; a cara é a da OC:
 * - o cabeçalho (os seis campos), o sumário, o "Como usar" e o fluxo didático;
 * - as seções 1 a 7, cada uma com o selo, o "?" (o texto dele é conteúdo) e os
 *   blocos na ordem do documento; o histórico de revisões é a seção 7.
 *
 * Para todos, só leitura. O texto é o que vale, palavra por palavra: a tela não
 * resume e não conserta. Sem emoji nos cartões do fluxo (regra 6 da casa; o
 * banco guarda o que o arquivo tem). Ir a um lugar do documento é pulo, sem
 * rolagem animada (regra 8).
 *
 * Para quem revisa ECR (o Pedro), a revisão pela mão dele (CTO-D739 §4): o
 * rascunho da revisão seguinte, desenhado como a página, com os trechos que
 * mudaram marcados e o motivo no "?" de cada um, e o "Gravar", que chama a
 * porta do Banco. O PDF é só da vigente: rascunho não se imprime.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { procedimentoDoBanco } from '../../domain/procedimentoDoBanco';
import {
  ANCORA_DA_SITUACAO,
  ANCORA_DO_CABECALHO,
  ANCORA_DO_COMO_USAR,
  ANCORA_DO_FLUXO,
  ANCORA_DO_RODAPE,
  MARCA_DA_MUDANCA,
  O_QUE_GRAVAR_FAZ,
  fraseDoQueSaiu,
  frasePainelNaVigente,
  frasePainelNoRascunho,
  motivosPorAncora,
  oQueMudou,
  perguntaDeGravar,
  revisaoSeguinte,
  tituloDoPainel,
} from '../../domain/revisaoDoProcedimento';
import { LIMITE_DA_DESCRICAO, descricaoParaGravar, hojeEmSaoPaulo, nomeDasLetras } from '../../domain/ecr';
import { letrasQueOPdfNaoImprime } from '../../domain/letrasDoPdf';
import { formatDate } from '../../domain/format';
import { lerProcedimento, revisarProcedimento } from '../../services/supabase/procedimento';
import { podeRevisarEcr } from '../../services/supabase/ecrs';
import { baixarPdfDoProcedimento } from '../../services/pdf/generateProcedimentoPdf';
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Ajuda } from '../../components/Ajuda/Ajuda';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Loader } from '../../components/Loader/Loader';
import { carregarRascunho, type RascunhoDoProcedimento } from './rev01';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import styles from './ProcedimentoPage.module.css';

/** Os trechos marcados e o motivo de cada um; `null` quando se lê a vigente. */
type Marcas = { mudaram: ReadonlySet<string>; motivos: ReadonlyMap<string, string[]> } | null;

/** `data-mudou` no que mudou: é por ele que a marca se desenha. */
const mudou = (marcas: Marcas, ancora: string) => (marcas?.mudaram.has(ancora) ? '' : undefined);

/** A etiqueta "Mudou" e o "?" com o motivo, no trecho que mudou. */
function Mudou({ marcas, ancora }: { marcas: Marcas; ancora: string }) {
  if (!marcas?.mudaram.has(ancora)) return null;
  const motivos = marcas.motivos.get(ancora) ?? [];
  return (
    <span className={styles.mudou} data-marca-de={ancora}>
      <span className={styles.etiquetaMudou}>{MARCA_DA_MUDANCA}</span>
      {motivos.length > 0 && <Ajuda sobre="Por que este trecho mudou">{motivos.join(' ')}</Ajuda>}
    </span>
  );
}

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

function BlocoDoDocumento({
  bloco,
  revisoes,
  marcas,
}: {
  bloco: Bloco;
  revisoes: RevisaoDoProcedimento[] | null;
  marcas: Marcas;
}) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return (
        <p
          id={bloco.ancora}
          className={bloco.destaque ? CLASSE_DO_DESTAQUE[bloco.destaque] : styles.paragrafo}
          data-mudou={mudou(marcas, bloco.ancora)}
        >
          <Rico texto={bloco.texto} />
          <Mudou marcas={marcas} ancora={bloco.ancora} />
        </p>
      );
    case 'quadros':
      return (
        <div id={bloco.ancora} className={styles.quadros} data-mudou={mudou(marcas, bloco.ancora)}>
          {bloco.quadros.map((q) => (
            <div key={q.ancora} id={q.ancora} className={styles.quadro} data-mudou={mudou(marcas, q.ancora)}>
              <strong>{q.titulo}</strong>
              <span>{q.texto}</span>
              <Mudou marcas={marcas} ancora={q.ancora} />
            </div>
          ))}
          <Mudou marcas={marcas} ancora={bloco.ancora} />
        </div>
      );
    case 'lista':
      return (
        <ol id={bloco.ancora} className={styles.lista} data-mudou={mudou(marcas, bloco.ancora)}>
          {bloco.itens.map((it) => (
            <li key={it.ancora} id={it.ancora} data-mudou={mudou(marcas, it.ancora)}>
              {it.texto}
              <Mudou marcas={marcas} ancora={it.ancora} />
            </li>
          ))}
        </ol>
      );
    case 'tabela':
      return (
        <table id={bloco.ancora} className={`${styles.tabela} ${styles.empilha}`} data-mudou={mudou(marcas, bloco.ancora)}>
          {marcas?.mudaram.has(bloco.ancora) && (
            <caption className={styles.legendaDaMudanca}>
              <Mudou marcas={marcas} ancora={bloco.ancora} />
            </caption>
          )}
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
              <tr key={l.ancora} id={l.ancora} data-mudou={mudou(marcas, l.ancora)}>
                {l.celulas.map((c, j) => (
                  <td key={j} data-coluna={bloco.colunas[j]}>
                    <Rico texto={c} />
                    {j === 0 && <Mudou marcas={marcas} ancora={l.ancora} />}
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

function Documento({ p, irPara, marcas }: { p: Procedimento; irPara: (ancora: string) => void; marcas: Marcas }) {
  return (
    <>
      <header id={ANCORA_DO_CABECALHO} className={styles.cabecalho} data-mudou={mudou(marcas, ANCORA_DO_CABECALHO)}>
        <span className={styles.sobretitulo}>{p.sobretitulo}</span>
        <h3 className={styles.titulo}>{p.titulo}</h3>
        <span className={styles.subtitulo}>{p.subtitulo}</span>
        <Mudou marcas={marcas} ancora={ANCORA_DO_CABECALHO} />
        <dl className={styles.campos}>
          <div>
            <dt>{CAMPOS_DO_CABECALHO.codigo}</dt>
            <dd>{p.codigo}</dd>
          </div>
          <div id={ANCORA_DA_SITUACAO} data-mudou={mudou(marcas, ANCORA_DA_SITUACAO)}>
            <dt>{CAMPOS_DO_CABECALHO.revisao}</dt>
            <dd>
              Rev. {p.revisao}
              {p.situacao && <span className={styles.situacao}>{p.situacao}</span>}
              <Mudou marcas={marcas} ancora={ANCORA_DA_SITUACAO} />
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

      <p id={ANCORA_DO_COMO_USAR} className={styles.comoUsar} data-mudou={mudou(marcas, ANCORA_DO_COMO_USAR)}>
        <Rico texto={p.comoUsar} />
        <Mudou marcas={marcas} ancora={ANCORA_DO_COMO_USAR} />
      </p>

      {/* A âncora do fluxo é o título dele: as seções com id são só as 7 do documento. */}
      <section className={styles.fluxo} aria-labelledby={ANCORA_DO_FLUXO}>
        <h3 id={ANCORA_DO_FLUXO} data-mudou={mudou(marcas, ANCORA_DO_FLUXO)}>
          {p.fluxo.titulo}
        </h3>
        <Mudou marcas={marcas} ancora={ANCORA_DO_FLUXO} />
        <p className={styles.fluxoIntro}>{p.fluxo.introducao}</p>
        <div className={styles.cartoes}>
          {p.fluxo.cartoes.map((c) => {
            const conteudo = (
              <>
                <strong>{semEmoji(c.titulo)}</strong>
                <span>{c.texto}</span>
              </>
            );
            // O cartão leva aonde o documento leva: a linha da tabela ou a seção.
            // A marca fica fora do botão: um "?" não cabe dentro de outro botão.
            return (
              <div key={c.ancora} id={c.ancora} className={styles.lugarDoCartao} data-mudou={mudou(marcas, c.ancora)}>
                {c.destino ? (
                  <button type="button" className={styles.cartao} onClick={() => irPara(c.destino!)}>
                    {conteudo}
                  </button>
                ) : (
                  <div className={styles.cartao}>{conteudo}</div>
                )}
                <Mudou marcas={marcas} ancora={c.ancora} />
              </div>
            );
          })}
        </div>
        <h4>{p.fluxo.tituloDaSequencia}</h4>
        <ol className={styles.sequencia}>
          {p.fluxo.sequencia.map((s) => (
            <li key={s.ancora} id={s.ancora} data-mudou={mudou(marcas, s.ancora)}>
              <strong>{s.titulo}</strong>
              <span>{s.texto}</span>
              <Mudou marcas={marcas} ancora={s.ancora} />
            </li>
          ))}
        </ol>
      </section>

      {p.secoes.map((s) => (
        <section
          key={s.ancora}
          id={s.ancora}
          className={styles.secao}
          aria-labelledby={`${s.ancora}-titulo`}
          data-mudou={mudou(marcas, s.ancora)}
        >
          <div className={styles.cabecaDaSecao}>
            <span className={styles.numero}>{s.numero}</span>
            <h3 id={`${s.ancora}-titulo`}>{s.titulo}</h3>
            {s.selo && <span className={styles.selo}>{s.selo}</span>}
            {s.ajuda && <Ajuda sobre={`O que diz o item ${s.numero}`}>{s.ajuda}</Ajuda>}
            <Mudou marcas={marcas} ancora={s.ancora} />
          </div>
          {s.blocos.map((b) => (
            <BlocoDoDocumento key={b.ancora} bloco={b} revisoes={p.revisoes} marcas={marcas} />
          ))}
        </section>
      ))}

      {p.rodape && (
        <footer id={ANCORA_DO_RODAPE} className={styles.rodape} data-mudou={mudou(marcas, ANCORA_DO_RODAPE)}>
          <strong>{p.rodape.titulo}</strong>
          <span>{p.rodape.texto}</span>
          <Mudou marcas={marcas} ancora={ANCORA_DO_RODAPE} />
        </footer>
      )}
    </>
  );
}

/** A revisão que o rascunho propõe, pronta para a tela; existe só se ele parte da vigente. */
interface RevisaoProposta {
  de: string;
  nova: string;
  doc: Procedimento;
  documento: unknown;
  descricao: string;
  mudaram: string[];
  sairam: string[];
  motivos: Map<string, string[]>;
}

function revisaoProposta(vigente: Procedimento, r: RascunhoDoProcedimento): RevisaoProposta | null {
  const de = r.mudancas.revisao_de;
  // Só vale contra a revisão de onde partiu: gravada a seguinte, ele some.
  if (vigente.revisao !== de) return null;
  const nova = revisaoSeguinte(de);
  const lido = procedimentoDoBanco(
    { codigo: vigente.codigo, titulo: vigente.titulo, revisao: nova, emitida_em: hojeEmSaoPaulo(), documento: r.documento },
    null,
  );
  if (!lido) return null;
  // O histórico é o de hoje: a linha da revisão nova só existe depois de gravada.
  const doc = { ...lido, revisoes: vigente.revisoes };
  const { mudaram, sairam } = oQueMudou(vigente, doc);
  return { de, nova, doc, documento: r.documento, descricao: r.mudancas.descricao, mudaram, sairam, motivos: motivosPorAncora(r.mudancas.mudancas) };
}

/** O quadro de quem revisa, no alto: o que muda, a leitura do rascunho e o "Gravar". */
function PainelDaRevisao({
  r,
  lendo,
  aoLer,
  aoVoltar,
  aoIrAProxima,
  aoGravar,
}: {
  r: RevisaoProposta;
  lendo: boolean;
  aoLer: () => void;
  aoVoltar: () => void;
  aoIrAProxima: () => void;
  aoGravar: () => void;
}) {
  return (
    <section className={styles.painel} aria-labelledby="painel-da-revisao" data-painel-da-revisao="">
      <strong id="painel-da-revisao">{tituloDoPainel(r.nova)}</strong>
      <p>{lendo ? frasePainelNoRascunho(r.mudaram.length, r.nova) : frasePainelNaVigente(r.mudaram.length, r.de)}</p>
      {r.sairam.length > 0 && <p className={styles.saiu}>{fraseDoQueSaiu(r.sairam)}</p>}
      <div className={styles.acoesDoPainel}>
        {lendo ? (
          <>
            <Button variant="outline" size="sm" onClick={aoIrAProxima}>
              Próxima mudança
            </Button>
            <Button variant="outline" size="sm" onClick={aoVoltar}>
              Voltar à Rev. {r.de}
            </Button>
            <Button variant="primary" size="sm" onClick={aoGravar}>
              Gravar a Rev. {r.nova}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={aoLer}>
            Ler o rascunho
          </Button>
        )}
      </div>
    </section>
  );
}

/** A pergunta antes de gravar (D739 §4.2), com a descrição que vai para o histórico. */
function DialogoDeGravar({
  codigo,
  r,
  aoVoltar,
  aoGravar,
}: {
  codigo: string;
  r: RevisaoProposta;
  aoVoltar: () => void;
  aoGravar: (revisao: string, emitidaEm: string) => void;
}) {
  const [descricao, setDescricao] = useState(r.descricao);
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    const oQue = descricaoParaGravar(descricao);
    if (!oQue) return setErro('Escreva o que mudou: é a descrição desta revisão no histórico.');
    if (oQue.length > LIMITE_DA_DESCRICAO) {
      return setErro(`A descrição tem ${oQue.length} caracteres; o limite é ${LIMITE_DA_DESCRICAO}. Resuma o que mudou.`);
    }
    // A descrição vai para o histórico do PDF: o que ele não desenha não entra.
    const fora = letrasQueOPdfNaoImprime(oQue);
    if (fora.length > 0) return setErro(`A descrição tem ${nomeDasLetras(fora)}, que o PDF não imprime: troque ou apague.`);
    setErro(null);
    setGravando(true);
    try {
      const g = await revisarProcedimento(codigo, r.de, r.documento, oQue);
      aoGravar(g.revisao, g.emitida_em);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a revisão.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="gravar-revisao-titulo">
      <div className={styles.caixa} data-dialogo-gravar="">
        <h3 id="gravar-revisao-titulo" className={styles.tituloDoDialogo}>
          {perguntaDeGravar(r.nova)}
        </h3>
        <p className={styles.resumo}>{O_QUE_GRAVAR_FAZ}</p>
        <label className={styles.rotuloDoCampo} htmlFor="gravar-revisao-descricao">
          O que mudou<span className={styles.obrigatorio}>*</span>
        </label>
        <textarea
          id="gravar-revisao-descricao"
          className={styles.descricao}
          rows={4}
          value={descricao}
          maxLength={LIMITE_DA_DESCRICAO}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <span className={styles.dica}>
          Vai para a coluna "Descrição" do histórico de revisões. Até {LIMITE_DA_DESCRICAO} caracteres (
          {descricaoParaGravar(descricao).length} agora).
        </span>
        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoesDoDialogo}>
          <Button variant="outline" onClick={aoVoltar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={gravar} loading={gravando}>
            Gravar a Rev. {r.nova}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
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

  // Só quem revisa ECR revisa o procedimento (D739 §4). O banco responde; na
  // dúvida, nada aparece. A resposta vale só para a conta que perguntou.
  const meuId = useAuthStore((s) => s.sessao?.user.id ?? '');
  const [resposta, setResposta] = useState<{ conta: string; pode: boolean } | null>(null);
  const podeRevisar = !!resposta && resposta.conta === meuId && resposta.pode;
  const [rascunho, setRascunho] = useState<RascunhoDoProcedimento | null>(null);
  const [lendoRascunho, setLendoRascunho] = useState(false);
  const [perguntando, setPerguntando] = useState(false);
  const proxima = useRef(0);

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

  useEffect(() => {
    let vivo = true;
    podeRevisarEcr().then(
      (ok) => vivo && setResposta({ conta: meuId, pode: ok }),
      () => vivo && setResposta({ conta: meuId, pode: false }),
    );
    return () => {
      vivo = false;
    };
  }, [meuId]);

  // O rascunho só desce para quem revisa.
  useEffect(() => {
    if (!podeRevisar || rascunho) return;
    let vivo = true;
    carregarRascunho().then(
      (r) => vivo && setRascunho(r),
      () => undefined,
    );
    return () => {
      vivo = false;
    };
  }, [podeRevisar, rascunho]);

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
  const proposta = useMemo(() => (p && rascunho && podeRevisar ? revisaoProposta(p, rascunho) : null), [p, rascunho, podeRevisar]);
  const noRascunho = lendoRascunho && !!proposta;
  const mostrado = noRascunho ? proposta.doc : p;
  const marcas: Marcas = noRascunho ? { mudaram: new Set(proposta.mudaram), motivos: proposta.motivos } : null;

  function irAProxima() {
    if (!proposta || proposta.mudaram.length === 0) return;
    const i = proxima.current % proposta.mudaram.length;
    proxima.current = i + 1;
    const alvo = proposta.mudaram[i];
    if (alvo) irPara(alvo);
  }

  function gravada(revisao: string, emitidaEm: string) {
    setPerguntando(false);
    setLendoRascunho(false);
    showToast(`${p?.codigo ?? PS02} revisado: Rev. ${revisao}, emitida em ${formatDate(emitidaEm)}.`, 'success');
    setEstado({ tipo: 'lendo' });
    setVez((v) => v + 1);
  }

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>{NOME_DA_PAGINA}</h2>
          <p className="section-sub">{O_QUE_E_A_PAGINA}</p>
        </div>
        {p && !noRascunho && (
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
      {proposta && (
        <PainelDaRevisao
          r={proposta}
          lendo={noRascunho}
          aoLer={() => {
            proxima.current = 0;
            setLendoRascunho(true);
          }}
          aoVoltar={() => setLendoRascunho(false)}
          aoIrAProxima={irAProxima}
          aoGravar={() => setPerguntando(true)}
        />
      )}
      {mostrado && (
        <article
          className={styles.documento}
          data-procedimento={mostrado.codigo}
          data-rascunho={noRascunho ? '' : undefined}
        >
          <Documento p={mostrado} irPara={irPara} marcas={marcas} />
        </article>
      )}
      {perguntando && proposta && p && (
        <DialogoDeGravar codigo={p.codigo} r={proposta} aoVoltar={() => setPerguntando(false)} aoGravar={gravada} />
      )}
    </div>
  );
}
