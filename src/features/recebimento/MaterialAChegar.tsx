/**
 * "Material a chegar" — a tela do mestre de obra, no celular (CTO-D693).
 *
 * Para quem não tem intimidade com tecnologia, no canteiro, no sol, com a mão
 * suja e sinal fraco: uma coisa por vez, botões grandes, as palavras dele. Sem
 * menu: ele entra e cai aqui, na obra dele.
 *
 *   lista ──toque no cartão──▶ receber ──Pronto──▶ pronto ──▶ lista
 *     └──"Chegou material sem pedido"──▶ sem pedido ──Pronto──▶ pronto
 *
 * A tela não fala com o banco: quem a monta passa os pedidos e as funções de
 * gravar. Se a gravação falha, nada do que ele preencheu se perde — a tela
 * fica onde estava e diz o que houve.
 */

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { formatBrl } from '../../domain/format';
import type { Avaliacao } from '../../domain/qualificacao';
import {
  PERGUNTAS_DO_MESTRE, SEM_RESPOSTA, avaliacaoDoMestre, diaCombinado, oQueAconteceuObrigatorio, oQueFalta,
  perguntaOQueAconteceu, quantidadeFalada, type CartaoAChegar, type RespostasDoMestre,
} from '../../domain/recebimento';
import styles from './MaterialAChegar.module.css';

export interface SemPedido {
  foto: File | null;
  numeroDaNota: string;
  deQuem: string;
  oQueChegou: string;
  comEstrago: boolean;
}

export interface MaterialAChegarProps {
  obra: string;
  hoje: string;
  cartoes: CartaoAChegar[];
  /** Lê o número da nota na foto; '' quando não conseguiu. */
  lerNumeroDaNota: (foto: File) => Promise<string>;
  aoReceber: (cartao: CartaoAChegar, avaliacao: Avaliacao, soUmaParte: boolean, foto: File | null) => Promise<void>;
  aoRegistrarSemPedido: (registro: SemPedido) => Promise<void>;
  aoSair?: () => void;
}

type Tela =
  | { tipo: 'lista' }
  | { tipo: 'receber'; cartao: CartaoAChegar }
  | { tipo: 'sem-pedido' }
  | { tipo: 'pronto'; titulo: string };

const FALHOU = 'Não consegui mandar agora. O que você preencheu continua aqui. Toque em "Pronto" de novo quando tiver sinal.';

export function MaterialAChegar(props: MaterialAChegarProps) {
  const [tela, setTela] = useState<Tela>({ tipo: 'lista' });
  const voltar = () => setTela({ tipo: 'lista' });

  if (tela.tipo === 'receber') {
    return (
      <Receber
        {...props}
        cartao={tela.cartao}
        aoVoltar={voltar}
        aoTerminar={() => setTela({ tipo: 'pronto', titulo: 'Recebido.' })}
      />
    );
  }
  if (tela.tipo === 'sem-pedido') {
    return (
      <ChegouSemPedido
        {...props}
        aoVoltar={voltar}
        aoTerminar={() => setTela({ tipo: 'pronto', titulo: 'Registrado.' })}
      />
    );
  }
  if (tela.tipo === 'pronto') {
    return (
      <div className={styles.tela} data-tela-do-mestre="pronto">
        <div className={styles.pronto} role="status">
          <span className={styles.prontoSelo}>
            <Icon name="check" size={56} />
          </span>
          <h1 className={styles.prontoTitulo}>{tela.titulo}</h1>
          <p className={styles.prontoTexto}>O escritório já vê.</p>
        </div>
        <button type="button" className={styles.primario} onClick={voltar}>
          Voltar para a lista
        </button>
      </div>
    );
  }

  const { obra, hoje, cartoes, aoSair } = props;
  return (
    <div className={styles.tela} data-tela-do-mestre="lista">
      <header className={styles.topo}>
        <p className={styles.obra}>{obra}</p>
        <h1 className={styles.titulo}>Material a chegar</h1>
      </header>

      {cartoes.length === 0 ? (
        <p className={styles.vazio}>Nenhum material a chegar nesta obra.</p>
      ) : (
        <ul className={styles.lista}>
          {cartoes.map((c) => (
            <li key={c.ocId}>
              <button type="button" className={styles.cartao} onClick={() => setTela({ tipo: 'receber', cartao: c })}>
                <ResumoDoPedido cartao={c} hoje={hoje} />
                <span className={styles.cartaoAcao}>
                  Toque para receber <Icon name="chevron" size={18} className={styles.seta} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.secundario} onClick={() => setTela({ tipo: 'sem-pedido' })}>
        Chegou material sem pedido
      </button>
      {aoSair && (
        <button type="button" className={styles.sair} onClick={aoSair}>
          Sair
        </button>
      )}
    </div>
  );
}

function ResumoDoPedido({ cartao: c, hoje }: { cartao: CartaoAChegar; hoje: string }) {
  const dia = diaCombinado(c.combinadoPara, hoje);
  return (
    <span className={styles.resumo}>
      <span className={styles.fornecedor}>{c.fornecedor}</span>
      <span className={styles.combinado}>
        {dia ? (
          <>
            Combinado para <strong>{dia}</strong>
          </>
        ) : (
          'Sem dia combinado'
        )}
      </span>
      <span className={styles.itens}>
        {c.itens.map((i, n) => (
          <span key={n} className={styles.item}>
            <span className={styles.qtd}>
              {quantidadeFalada(i.quantidade)} {i.unidade}
            </span>
            <span>{i.descricao}</span>
          </span>
        ))}
      </span>
      <span className={styles.valor}>
        <span>Pedido {c.numero}</span>
        <strong>{formatBrl(c.total)}</strong>
      </span>
    </span>
  );
}

/** As perguntas, a foto da nota, o "O que aconteceu?" e o "Pronto". */
function Receber({
  cartao, hoje, lerNumeroDaNota, aoReceber, aoVoltar, aoTerminar,
}: MaterialAChegarProps & { cartao: CartaoAChegar; aoVoltar: () => void; aoTerminar: () => void }) {
  const [r, setR] = useState<RespostasDoMestre>(SEM_RESPOSTA);
  const [foto, setFoto] = useState<File | null>(null);
  const [numero, setNumero] = useState('');
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState('');
  const [mandando, setMandando] = useState(false);

  const obrigatorio = oQueAconteceuObrigatorio(r);

  async function pronto() {
    const falta = oQueFalta(r, numero, texto);
    if (falta) {
      setAviso(falta);
      return;
    }
    setAviso('');
    setMandando(true);
    try {
      await aoReceber(cartao, avaliacaoDoMestre(r, numero, texto, hoje), r.tudo === false, foto);
      aoTerminar();
    } catch {
      setAviso(FALHOU);
    } finally {
      setMandando(false);
    }
  }

  return (
    <div className={styles.tela} data-tela-do-mestre="receber">
      <button type="button" className={styles.voltar} onClick={aoVoltar}>
        <Icon name="chevron" size={18} className={styles.setaVoltar} /> Voltar
      </button>
      <div className={styles.cartaoAberto}>
        <ResumoDoPedido cartao={cartao} hoje={hoje} />
      </div>

      {PERGUNTAS_DO_MESTRE.map((p) => (
        <fieldset key={p.chave} className={styles.pergunta}>
          <legend className={styles.perguntaTexto}>{p.texto}</legend>
          <div className={styles.botoes}>
            <button
              type="button"
              aria-pressed={r[p.chave] === true}
              className={`${styles.resposta} ${r[p.chave] === true ? styles.sim : ''}`}
              onClick={() => setR((x) => ({ ...x, [p.chave]: true }))}
            >
              {p.sim}
            </button>
            <button
              type="button"
              aria-pressed={r[p.chave] === false}
              className={`${styles.resposta} ${r[p.chave] === false ? styles.nao : ''}`}
              onClick={() => setR((x) => ({ ...x, [p.chave]: false }))}
            >
              {p.nao}
            </button>
          </div>
        </fieldset>
      ))}

      <FotoDaNota foto={foto} numero={numero} aoMudarFoto={setFoto} aoMudarNumero={setNumero} lerNumeroDaNota={lerNumeroDaNota} />

      {perguntaOQueAconteceu(r) && (
        <label className={styles.campo}>
          <span className={styles.perguntaTexto}>
            O que aconteceu?{obrigatorio ? '' : ' (se quiser)'}
          </span>
          <textarea
            className={styles.caixa}
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva, ou toque no microfone do teclado e fale."
          />
        </label>
      )}

      {aviso && (
        <p className={styles.aviso} role="alert">
          {aviso}
        </p>
      )}
      <button type="button" className={styles.primario} onClick={() => void pronto()} disabled={mandando}>
        {mandando ? 'Mandando…' : 'Pronto'}
      </button>
    </div>
  );
}

/** O botão que abre a câmera, a foto tirada e o número lido para ele conferir. */
function FotoDaNota({
  foto, numero, aoMudarFoto, aoMudarNumero, lerNumeroDaNota,
}: {
  foto: File | null;
  numero: string;
  aoMudarFoto: (f: File | null) => void;
  aoMudarNumero: (n: string) => void;
  lerNumeroDaNota: (foto: File) => Promise<string>;
}) {
  const [lendo, setLendo] = useState(false);
  const [leu, setLeu] = useState<boolean | null>(null);
  const [semFoto, setSemFoto] = useState(false);
  // A miniatura nasce da foto; o endereço dela é solto quando a foto muda ou a tela sai.
  const miniatura = useMemo(() => (foto ? URL.createObjectURL(foto) : ''), [foto]);
  useEffect(() => () => {
    if (miniatura) URL.revokeObjectURL(miniatura);
  }, [miniatura]);

  async function escolheu(f: File | undefined) {
    if (!f) return;
    aoMudarFoto(f);
    setLendo(true);
    setLeu(null);
    try {
      const n = (await lerNumeroDaNota(f)).trim();
      if (n) aoMudarNumero(n);
      setLeu(n !== '');
    } catch {
      setLeu(false);
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className={styles.foto}>
      <span className={styles.perguntaTexto}>A nota</span>
      {miniatura && <img className={styles.miniatura} src={miniatura} alt="A foto da nota" />}
      <label className={styles.secundario}>
        <Icon name="camera" size={22} /> {foto ? 'Tirar outra foto' : 'Tirar foto da nota'}
        <input
          className={styles.escondido}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => void escolheu(e.target.files?.[0])}
        />
      </label>
      {lendo && <p className={styles.dica}>Lendo o número da nota…</p>}
      {(foto || semFoto || numero) && !lendo ? (
        <label className={styles.campo}>
          <span className={styles.dica}>
            {leu === true ? 'Confira o número da nota:' : leu === false ? 'Não consegui ler. Escreva o número da nota:' : 'Número da nota:'}
          </span>
          <input
            className={styles.numero}
            inputMode="numeric"
            value={numero}
            onChange={(e) => aoMudarNumero(e.target.value)}
          />
        </label>
      ) : (
        !foto && (
          <button type="button" className={styles.link} onClick={() => setSemFoto(true)}>
            Sem foto? Escreva o número
          </button>
        )
      )}
    </div>
  );
}

/** O material que chegou sem pedido: a foto, de quem, o que chegou e se veio sem estrago. */
function ChegouSemPedido({
  lerNumeroDaNota, aoRegistrarSemPedido, aoVoltar, aoTerminar,
}: MaterialAChegarProps & { aoVoltar: () => void; aoTerminar: () => void }) {
  const [foto, setFoto] = useState<File | null>(null);
  const [numero, setNumero] = useState('');
  const [deQuem, setDeQuem] = useState('');
  const [oQueChegou, setOQueChegou] = useState('');
  const [semEstrago, setSemEstrago] = useState<boolean | null>(null);
  const [aviso, setAviso] = useState('');
  const [mandando, setMandando] = useState(false);

  async function pronto() {
    if (!foto && !numero.trim()) return setAviso('Tire a foto da nota, ou escreva o número dela.');
    if (!oQueChegou.trim()) return setAviso('Conte o que chegou.');
    if (semEstrago === null) return setAviso('Falta responder: Chegou sem estrago?');
    setAviso('');
    setMandando(true);
    try {
      await aoRegistrarSemPedido({ foto, numeroDaNota: numero.trim(), deQuem: deQuem.trim(), oQueChegou: oQueChegou.trim(), comEstrago: !semEstrago });
      aoTerminar();
    } catch {
      setAviso(FALHOU);
    } finally {
      setMandando(false);
    }
  }

  return (
    <div className={styles.tela} data-tela-do-mestre="sem-pedido">
      <button type="button" className={styles.voltar} onClick={aoVoltar}>
        <Icon name="chevron" size={18} className={styles.setaVoltar} /> Voltar
      </button>
      <header className={styles.topo}>
        <h1 className={styles.titulo}>Chegou sem pedido</h1>
        <p className={styles.dica}>O escritório liga ao pedido certo depois.</p>
      </header>

      <FotoDaNota foto={foto} numero={numero} aoMudarFoto={setFoto} aoMudarNumero={setNumero} lerNumeroDaNota={lerNumeroDaNota} />

      <label className={styles.campo}>
        <span className={styles.perguntaTexto}>De quem? (se souber)</span>
        <input className={styles.linha} value={deQuem} onChange={(e) => setDeQuem(e.target.value)} />
      </label>
      <label className={styles.campo}>
        <span className={styles.perguntaTexto}>O que chegou?</span>
        <textarea
          className={styles.caixa}
          rows={3}
          value={oQueChegou}
          onChange={(e) => setOQueChegou(e.target.value)}
          placeholder="Escreva, ou toque no microfone do teclado e fale."
        />
      </label>
      {/* A mesma pergunta do recebimento, com o "Sim" sempre do lado bom. */}
      <fieldset className={styles.pergunta}>
        <legend className={styles.perguntaTexto}>Chegou sem estrago?</legend>
        <div className={styles.botoes}>
          <button
            type="button"
            aria-pressed={semEstrago === true}
            className={`${styles.resposta} ${semEstrago === true ? styles.sim : ''}`}
            onClick={() => setSemEstrago(true)}
          >
            Sim
          </button>
          <button
            type="button"
            aria-pressed={semEstrago === false}
            className={`${styles.resposta} ${semEstrago === false ? styles.nao : ''}`}
            onClick={() => setSemEstrago(false)}
          >
            Não
          </button>
        </div>
      </fieldset>

      {aviso && (
        <p className={styles.aviso} role="alert">
          {aviso}
        </p>
      )}
      <button type="button" className={styles.primario} onClick={() => void pronto()} disabled={mandando}>
        {mandando ? 'Mandando…' : 'Pronto'}
      </button>
    </div>
  );
}
