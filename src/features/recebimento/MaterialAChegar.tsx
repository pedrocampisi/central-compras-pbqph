/**
 * "Material a chegar" — a tela do mestre de obra, no celular (CTO-D693, D696).
 *
 * Para quem não tem intimidade com tecnologia, no canteiro, no sol, com a mão
 * suja e sinal fraco: uma coisa por vez, botões grandes, as palavras dele. Sem
 * menu: ele entra e cai aqui, na obra dele.
 *
 *   lista ──toque no cartão──▶ receber ──Pronto──▶ pronto ──▶ lista
 *     └──"Chegou material sem pedido"──▶ sem pedido ──Pronto──▶ pronto
 *
 * A tela não fala com o banco: quem a monta passa os pedidos e as funções de
 * gravar. O que ele preenche fica guardado no celular a cada toque, e o
 * "Pronto" guarda antes de mandar: sem sinal, vai sozinho depois (`fila.ts`).
 */

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { formatBrl } from '../../domain/format';
import {
  PERGUNTAS_DO_MESTRE, SEM_RESPOSTA, avaliacaoDoMestre, diaCombinado, oQueAconteceuObrigatorio, oQueFalta,
  perguntaOQueAconteceu, quantidadeFalada, type CartaoAChegar, type ObraDoMestre, type RespostasDoMestre,
} from '../../domain/recebimento';
import { guardaDoAparelho, type GuardaDoAparelho } from '../../services/guardaDoAparelho';
import {
  CHAVES, novaChave, useFilaDoMestre, type Desfecho, type Envio, type EnvioDeRecebimento, type EnvioSemPedido,
  type Gravar, type Guardado, type RascunhoDoReceber, type RascunhoSemPedido,
} from './fila';
import styles from './MaterialAChegar.module.css';

export type { EnvioDeRecebimento, EnvioSemPedido, SemPedido } from './fila';

export interface MaterialAChegarProps {
  /** As obras em que ele recebe. Com mais de uma, o "sem pedido" pergunta qual. */
  obras: ObraDoMestre[];
  hoje: string;
  cartoes: CartaoAChegar[];
  /** Lê o número da nota na foto; '' quando não conseguiu. */
  lerNumeroDaNota: (foto: File) => Promise<string>;
  /**
   * Grava a entrega; devolve o recado do banco, quando há um. Lança
   * `RecusaDefinitiva` quando o banco diz não e repetir não muda.
   */
  aoReceber: Gravar<EnvioDeRecebimento>;
  aoRegistrarSemPedido: Gravar<EnvioSemPedido>;
  aoSair?: () => void;
  /** Um recado sobre a lista, debaixo do título (por exemplo: sem sinal, é a lista de antes). */
  aviso?: string;
  /** Onde guardar no celular; o IndexedDB do aparelho, se não vier. */
  guarda?: GuardaDoAparelho;
}

type Tela =
  | { tipo: 'lista' }
  | { tipo: 'receber'; cartao: CartaoAChegar; rascunho?: RascunhoDoReceber; foto?: File; recusado?: string }
  | { tipo: 'sem-pedido'; rascunho?: RascunhoSemPedido; foto?: File }
  | { tipo: 'pronto'; titulo: string; texto: string; guardou: boolean };

const NAO_GUARDOU =
  'Não consegui guardar nem mandar. O que você preencheu continua aqui. Toque em "Pronto" de novo.';
const GUARDADO = { titulo: 'Guardado no celular.', texto: 'Vai sozinho para o escritório quando o sinal voltar.' };

/** O que o "Pronto" faz depois de mandar: termina, ou fica e diz o motivo. */
type AoMandar = (envio: Envio, foi: Desfecho) => Promise<void> | void;

export function MaterialAChegar(props: MaterialAChegarProps) {
  const guarda = useMemo(() => props.guarda ?? guardaDoAparelho(), [props.guarda]);
  const fila = useFilaDoMestre(guarda, props.aoReceber, props.aoRegistrarSemPedido);
  const [tela, setTela] = useState<Tela>({ tipo: 'lista' });
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const voltar = () => setTela({ tipo: 'lista' });

  const doCartao = new Map<string, Guardado>();
  for (const g of fila.guardados) if (g.envio.tipo === 'receber') doCartao.set(g.envio.cartao.ocId, g);
  const esperando = fila.guardados.filter((g) => g.estado === 'esperando').length;
  const semPedidoRecusados = fila.guardados.filter((g) => g.envio.tipo === 'sem-pedido' && g.estado === 'recusado');
  // O recusado cujo pedido saiu da lista (ele foi tirado da obra, por exemplo): não está no
  // banco, e só existe neste celular. Fica à vista para ele mostrar ao engenheiro (D697 §4).
  const naLista = new Set(props.cartoes.map((c) => c.ocId));
  const recusadosForaDaLista = fila.guardados.filter(
    (g) => g.envio.tipo === 'receber' && g.estado === 'recusado' && !naLista.has(g.envio.cartao.ocId),
  );

  async function abrirCartao(c: CartaoAChegar) {
    const [rascunho, foto] = await Promise.all([
      guarda.ler<RascunhoDoReceber>(CHAVES.receber(c.ocId)),
      guarda.ler<File>(CHAVES.fotoDoReceber(c.ocId)),
    ]);
    setTela({ tipo: 'receber', cartao: c, rascunho, foto, recusado: doCartao.get(c.ocId)?.envio.chave });
  }

  async function abrirSemPedido() {
    const [rascunho, foto] = await Promise.all([
      guarda.ler<RascunhoSemPedido>(CHAVES.semPedido),
      guarda.ler<File>(CHAVES.fotoDoSemPedido),
    ]);
    setTela({ tipo: 'sem-pedido', rascunho, foto });
  }

  /** O sem pedido que o banco recusou volta para o formulário, como ele deixou. */
  async function reabrirSemPedido(g: Guardado) {
    if (g.envio.tipo !== 'sem-pedido') return;
    const s = g.envio.registro;
    await fila.esquecer(g.envio.chave);
    setTela({
      tipo: 'sem-pedido',
      rascunho: { numero: s.numeroDaNota, deQuem: s.deQuem, oQueChegou: s.oQueChegou, semEstrago: !s.comEstrago },
      foto: s.foto ?? undefined,
    });
  }

  const terminar = (titulo: string) => (_: Envio, d: Desfecho) =>
    setTela(
      d.foi
        ? { tipo: 'pronto', titulo, texto: d.aviso || 'O escritório já vê.', guardou: false }
        : { tipo: 'pronto', ...GUARDADO, guardou: true },
    );

  if (tela.tipo === 'receber') {
    return (
      <Receber
        key={tela.cartao.ocId}
        {...props}
        {...tela}
        guarda={guarda}
        mandar={fila.mandar}
        esquecer={fila.esquecer}
        aoVoltar={voltar}
        aoTerminar={terminar('Recebido.')}
      />
    );
  }
  if (tela.tipo === 'sem-pedido') {
    return (
      <ChegouSemPedido
        {...props}
        {...tela}
        guarda={guarda}
        mandar={fila.mandar}
        esquecer={fila.esquecer}
        aoVoltar={voltar}
        aoTerminar={terminar('Registrado.')}
      />
    );
  }
  if (tela.tipo === 'pronto') {
    return (
      <div className={styles.tela} data-tela-do-mestre="pronto">
        <div className={styles.pronto} role="status">
          <span className={tela.guardou ? styles.prontoSeloGuardado : styles.prontoSelo}>
            <Icon name={tela.guardou ? 'history' : 'check'} size={56} />
          </span>
          <h1 className={styles.prontoTitulo}>{tela.titulo}</h1>
          <p className={styles.prontoTexto}>{tela.texto}</p>
        </div>
        <button type="button" className={styles.primario} onClick={voltar}>
          Voltar para a lista
        </button>
      </div>
    );
  }

  const { obras, hoje, cartoes, aoSair } = props;
  const variasObras = obras.length > 1;
  return (
    <div className={styles.tela} data-tela-do-mestre="lista">
      <header className={styles.topo}>
        <p className={styles.obra}>{obras.map((o) => o.nome).filter(Boolean).join(' · ')}</p>
        <h1 className={styles.titulo}>Material a chegar</h1>
        {props.aviso && (
          <p className={styles.dica} role="status" data-aviso-da-lista>
            {props.aviso}
          </p>
        )}
      </header>

      {/* No alto, à vista: com dez pedidos na lista, no pé ele não acharia (D696 §2.1). */}
      {obras.length > 0 && (
        <button type="button" className={styles.secundario} onClick={() => void abrirSemPedido()}>
          Chegou material sem pedido
        </button>
      )}

      {esperando > 0 && (
        <p className={styles.guardado} role="status" data-fila-do-mestre>
          <Icon name="history" size={20} />
          {esperando === 1 ? '1 recebimento guardado no celular.' : `${esperando} recebimentos guardados no celular.`}{' '}
          Vai sozinho quando o sinal voltar.
        </p>
      )}
      {semPedidoRecusados.map((g) => (
        <div key={g.envio.chave} className={styles.aviso} role="alert">
          <span>Um material sem pedido não foi: {g.motivo}</span>
          <button type="button" className={styles.link} onClick={() => void reabrirSemPedido(g)}>
            Abrir de novo
          </button>
        </div>
      ))}

      {recusadosForaDaLista.map((g) => (
        <RecusadoForaDaLista key={g.envio.chave} guardado={g} aoApagar={() => void fila.esquecer(g.envio.chave)} />
      ))}

      {cartoes.length === 0 ? (
        <p className={styles.vazio}>
          {obras.length === 0
            ? 'Você ainda não está em nenhuma obra. Fale com o engenheiro.'
            : 'Nenhum material a chegar nesta obra.'}
        </p>
      ) : (
        <ul className={styles.lista}>
          {cartoes.map((c) => {
            const g = doCartao.get(c.ocId);
            // Guardado esperando sinal não abre: receber de novo faria duas entregas.
            if (g?.estado === 'esperando') {
              return (
                <li key={c.ocId}>
                  <div className={styles.cartaoGuardado}>
                    <ResumoDoPedido cartao={c} hoje={hoje} comObra={variasObras} />
                    <span className={styles.cartaoNota}>
                      <Icon name="history" size={18} /> Guardado no celular. Vai quando tiver sinal.
                    </span>
                  </div>
                </li>
              );
            }
            return (
              <li key={c.ocId}>
                <button type="button" className={styles.cartao} onClick={() => void abrirCartao(c)}>
                  <ResumoDoPedido cartao={c} hoje={hoje} comObra={variasObras} />
                  {g?.estado === 'recusado' ? (
                    <span className={styles.cartaoRecusado}>Não foi: {g.motivo} Toque para ver.</span>
                  ) : (
                    <span className={styles.cartaoAcao}>
                      Toque para receber <Icon name="chevron" size={18} className={styles.seta} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {aoSair &&
        (confirmarSaida ? (
          // Ele não tem senha: sair é precisar de um QR novo para voltar (D696 §2.2).
          <div className={styles.confirmar} role="alertdialog" aria-labelledby="sair-titulo">
            <p id="sair-titulo" className={styles.perguntaTexto}>
              Sair mesmo?
            </p>
            <p className={styles.dica}>
              Para entrar de novo, você vai precisar de um QR novo do escritório.
              {esperando > 0 && ' O que está guardado no celular só vai quando você entrar de novo neste celular.'}
            </p>
            <button type="button" className={styles.primario} onClick={() => setConfirmarSaida(false)}>
              Não, ficar
            </button>
            <button type="button" className={styles.secundario} onClick={aoSair}>
              Sim, sair
            </button>
          </div>
        ) : (
          <button type="button" className={styles.sair} onClick={() => setConfirmarSaida(true)}>
            Sair
          </button>
        ))}
    </div>
  );
}

/**
 * O recebimento que o banco recusou e cujo pedido já não está na lista. Apagar
 * pergunta antes: o que está aqui não chegou ao escritório.
 */
function RecusadoForaDaLista({ guardado: g, aoApagar }: { guardado: Guardado; aoApagar: () => void }) {
  const [confirmar, setConfirmar] = useState(false);
  if (g.envio.tipo !== 'receber') return null;
  const c = g.envio.cartao;
  return (
    <div className={styles.aviso} role="alert" data-recusado-fora-da-lista>
      <span>
        O recebimento do pedido {c.numero} ({c.fornecedor}) não foi: {g.motivo} Mostre ao engenheiro da obra.
      </span>
      {confirmar ? (
        <>
          <span>Apagar do celular? Ele não chegou ao escritório.</span>
          <button type="button" className={styles.link} onClick={() => setConfirmar(false)}>
            Não, deixar
          </button>
          <button type="button" className={styles.link} onClick={aoApagar}>
            Sim, apagar
          </button>
        </>
      ) : (
        <button type="button" className={styles.link} onClick={() => setConfirmar(true)}>
          Apagar do celular
        </button>
      )}
    </div>
  );
}

function ResumoDoPedido({ cartao: c, hoje, comObra = false }: { cartao: CartaoAChegar; hoje: string; comObra?: boolean }) {
  const dia = diaCombinado(c.combinadoPara, hoje);
  return (
    <span className={styles.resumo}>
      {comObra && c.obra && <span className={styles.obraDoCartao}>{c.obra}</span>}
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

interface PassoProps {
  guarda: GuardaDoAparelho;
  lerNumeroDaNota: (foto: File) => Promise<string>;
  mandar: (envio: Envio) => Promise<Desfecho>;
  esquecer: (chave: string) => Promise<void>;
  aoVoltar: () => void;
  aoTerminar: AoMandar;
}

/** As perguntas, a foto da nota, o "O que aconteceu?" e o "Pronto". */
function Receber({
  cartao, hoje, rascunho, foto: fotoGuardada, recusado, guarda, lerNumeroDaNota, mandar, esquecer, aoVoltar, aoTerminar,
}: PassoProps & { cartao: CartaoAChegar; hoje: string; rascunho?: RascunhoDoReceber; foto?: File; recusado?: string }) {
  const [r, setR] = useState<RespostasDoMestre>(rascunho?.r ?? SEM_RESPOSTA);
  const [foto, setFoto] = useState<File | null>(fotoGuardada ?? null);
  const [numero, setNumero] = useState(rascunho?.numero ?? '');
  const [texto, setTexto] = useState(rascunho?.texto ?? '');
  const [aviso, setAviso] = useState('');
  const [mandando, setMandando] = useState(false);

  // Cada toque fica no celular: fechar o app não apaga nada (D696 §5.1).
  useEffect(() => {
    void guarda.gravar(CHAVES.receber(cartao.ocId), { r, numero, texto } satisfies RascunhoDoReceber).catch(() => undefined);
  }, [guarda, cartao.ocId, r, numero, texto]);
  useEffect(() => {
    const k = CHAVES.fotoDoReceber(cartao.ocId);
    void (foto ? guarda.gravar(k, foto) : guarda.apagar(k)).catch(() => undefined);
  }, [guarda, cartao.ocId, foto]);

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
      if (recusado) await esquecer(recusado);
      const envio: EnvioDeRecebimento = {
        tipo: 'receber',
        chave: novaChave(),
        cartao,
        avaliacao: avaliacaoDoMestre(r, numero, texto, hoje),
        soUmaParte: r.tudo === false,
        foto,
      };
      const d = await mandar(envio);
      if (!d.foi && d.motivo) {
        await esquecer(envio.chave);
        setAviso(`Não foi: ${d.motivo}`);
        return;
      }
      await aoTerminar(envio, d);
    } catch {
      setAviso(NAO_GUARDOU);
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

/** O material que chegou sem pedido: a obra (se ele tem mais de uma), a foto, de quem, o que chegou e se veio sem estrago. */
function ChegouSemPedido({
  obras, hoje, rascunho, foto: fotoGuardada, guarda, lerNumeroDaNota, mandar, esquecer, aoVoltar, aoTerminar,
}: PassoProps & { obras: ObraDoMestre[]; hoje: string; rascunho?: RascunhoSemPedido; foto?: File }) {
  const [obra, setObra] = useState(() => {
    if (obras.length === 1) return obras[0]!.id;
    return obras.some((o) => o.id === rascunho?.obra) ? (rascunho?.obra ?? '') : '';
  });
  const [foto, setFoto] = useState<File | null>(fotoGuardada ?? null);
  const [numero, setNumero] = useState(rascunho?.numero ?? '');
  const [deQuem, setDeQuem] = useState(rascunho?.deQuem ?? '');
  const [oQueChegou, setOQueChegou] = useState(rascunho?.oQueChegou ?? '');
  const [semEstrago, setSemEstrago] = useState<boolean | null>(rascunho?.semEstrago ?? null);
  const [aviso, setAviso] = useState('');
  const [mandando, setMandando] = useState(false);

  useEffect(() => {
    void guarda
      .gravar(CHAVES.semPedido, { numero, deQuem, oQueChegou, semEstrago, obra } satisfies RascunhoSemPedido)
      .catch(() => undefined);
  }, [guarda, numero, deQuem, oQueChegou, semEstrago, obra]);
  useEffect(() => {
    void (foto ? guarda.gravar(CHAVES.fotoDoSemPedido, foto) : guarda.apagar(CHAVES.fotoDoSemPedido)).catch(
      () => undefined,
    );
  }, [guarda, foto]);

  async function pronto() {
    if (obras.length === 0) return setAviso('Você ainda não está em nenhuma obra. Fale com o engenheiro.');
    if (!obra) return setAviso('Falta responder: Em qual obra?');
    if (!foto && !numero.trim()) return setAviso('Tire a foto da nota, ou escreva o número dela.');
    if (!oQueChegou.trim()) return setAviso('Conte o que chegou.');
    if (semEstrago === null) return setAviso('Falta responder: Chegou sem estrago?');
    setAviso('');
    setMandando(true);
    try {
      const envio: EnvioSemPedido = {
        tipo: 'sem-pedido',
        chave: novaChave(),
        recebidoEm: hoje,
        intervencaoId: obra,
        registro: { foto, numeroDaNota: numero.trim(), deQuem: deQuem.trim(), oQueChegou: oQueChegou.trim(), comEstrago: !semEstrago },
      };
      const d = await mandar(envio);
      if (!d.foi && d.motivo) {
        await esquecer(envio.chave);
        setAviso(`Não foi: ${d.motivo}`);
        return;
      }
      // Já está na fila: o formulário fica limpo para o próximo sem pedido.
      await guarda.apagar(CHAVES.semPedido);
      await guarda.apagar(CHAVES.fotoDoSemPedido);
      await aoTerminar(envio, d);
    } catch {
      setAviso(NAO_GUARDOU);
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

      {obras.length > 1 && (
        <fieldset className={styles.pergunta}>
          <legend className={styles.perguntaTexto}>Em qual obra?</legend>
          <div className={styles.botoesEmPe}>
            {obras.map((o, n) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={obra === o.id}
                className={`${styles.resposta} ${obra === o.id ? styles.sim : ''}`}
                onClick={() => setObra(o.id)}
              >
                {o.nome || `Obra ${n + 1}`}
              </button>
            ))}
          </div>
        </fieldset>
      )}

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
