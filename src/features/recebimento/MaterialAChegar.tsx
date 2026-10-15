/**
 * "Material a chegar" — a tela do mestre de obra, no celular (CTO-D693, D696).
 *
 * Para quem não tem intimidade com tecnologia, no canteiro, no sol, com a mão
 * suja e sinal fraco: uma coisa por vez, botões grandes, as palavras dele. Sem
 * menu: ele entra e cai aqui, na obra dele.
 *
 *   lista ──toque no cartão──▶ abre ──Receber──▶ receber ──Pronto──▶ pronto ──▶ lista
 *                                                  └ o papel do fornecedor, por ECR, quando o banco pede (D811)
 *     └──"Chegou material sem pedido"──▶ sem pedido ──Pronto──▶ pronto
 *
 * Na lista, o cartão fica fechado numa linha, a empresa e o valor, e abre no
 * toque; com muitos pedidos, a busca acha a empresa pelo começo do nome
 * (CTO-D793, palavra do Pedro: "Comarco R$ 290, aí ele clica para ver o que é").
 *
 * A tela não fala com o banco: quem a monta passa os pedidos e as funções de
 * gravar. O que ele preenche fica guardado no celular a cada toque, e o
 * "Pronto" guarda antes de mandar: sem sinal, vai sozinho depois (`fila.ts`).
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { blocosDaSecao, linhaDoDocumento } from '../../domain/ecr';
import { formatBrl } from '../../domain/format';
import {
  BUSCA_A_PARTIR_DE, PERGUNTAS_DO_MESTRE, SEM_RESPOSTA, avaliacaoDoMestre, contaPorItem, diaCombinado, empresaAchada,
  escritoNoItem, itensDoEnvio, numeroDaNotaEmDigitos, oQueAconteceuObrigatorio, oQueFalta, perguntaOQueAconteceu,
  problemaDaContagem, quantidadeEscrita, quantidadeFalada,
  type CartaoAChegar, type ContagemDoMestre, type ObraDoMestre, type RespostasDoMestre,
} from '../../domain/recebimento';
import {
  ALCANCES, SEM_REGISTRO, alcanceDaLeitura, fraseDaLeitura, materialDoRegistro, perguntaDoRegistro, problemaDoRegistro,
  registrosDoEnvio, registrosPedidos, textoDoAlcance,
  type Alcance, type LeituraDoRegistro, type RegistroPedido, type RegistroRespondido, type RespostaDoRegistro,
} from '../../domain/registroDoFornecedor';
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
  /** Lê o papel de uma ECR na foto; `null` quando não conseguiu (conta como deste lote). */
  lerRegistro?: (foto: File) => Promise<LeituraDoRegistro | null>;
  /**
   * Grava a entrega; devolve o recado do banco, quando há um. Lança
   * `RecusaDefinitiva` quando o banco diz não e repetir não muda.
   */
  aoReceber: Gravar<EnvioDeRecebimento>;
  aoRegistrarSemPedido: Gravar<EnvioSemPedido>;
  aoSair?: () => void;
  /** Um recado sobre a lista, debaixo do título (por exemplo: sem sinal, é a lista de antes). */
  aviso?: string;
  /** No pé da lista, antes do "Sair": o pedido de pôr o ícone na tela (D696 §4). */
  rodape?: ReactNode;
  /** Onde guardar no celular; o IndexedDB do aparelho, se não vier. */
  guarda?: GuardaDoAparelho;
}

type Tela =
  | { tipo: 'lista' }
  | {
      tipo: 'receber';
      cartao: CartaoAChegar;
      rascunho?: RascunhoDoReceber;
      foto?: File;
      fotosDosPapeis?: Record<number, File>;
      recusado?: string;
    }
  | { tipo: 'sem-pedido'; rascunho?: RascunhoSemPedido; foto?: File }
  | { tipo: 'pronto'; titulo: string; texto: string; guardou: boolean };

const NAO_GUARDOU =
  'Não consegui guardar nem mandar. O que você preencheu continua aqui. Toque em "Pronto" de novo.';
const GUARDADO = { titulo: 'Guardado no celular.', texto: 'Vai sozinho para o escritório quando o sinal voltar.' };
// O celular que não guarda (sem IndexedDB): não se promete o que fechar o app
// apaga (perícia 05/10, achado 6).
const SO_COM_O_APP_ABERTO = {
  titulo: 'Ainda não foi.',
  texto: 'Sem sinal, e este celular não está guardando. Não feche o app: ele manda sozinho quando o sinal voltar.',
};

/** As fotos dos papéis de um pedido que ficaram no celular, pela ECR. */
async function lerFotosDosPapeis(guarda: GuardaDoAparelho, ocId: string): Promise<Record<number, File>> {
  const fotos: Record<number, File> = {};
  for (const k of await guarda.chaves(CHAVES.fotoDoRegistro(ocId))) {
    const ecr = Number(k.slice(CHAVES.fotoDoRegistro(ocId).length));
    const f = await guarda.ler<File>(k);
    if (Number.isInteger(ecr) && f) fotos[ecr] = f;
  }
  return fotos;
}

/** O que o "Pronto" faz depois de mandar: termina, ou fica e diz o motivo. */
type AoMandar = (envio: Envio, foi: Desfecho) => Promise<void> | void;

export function MaterialAChegar(props: MaterialAChegarProps) {
  const guarda = useMemo(() => props.guarda ?? guardaDoAparelho(), [props.guarda]);
  const fila = useFilaDoMestre(guarda, props.aoReceber, props.aoRegistrarSemPedido);
  const [tela, setTela] = useState<Tela>({ tipo: 'lista' });
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  // Um cartão aberto por vez. A busca fica ao voltar do receber; o cartão volta fechado.
  const [aberto, setAberto] = useState('');
  const [busca, setBusca] = useState('');
  // Só se diz "guardado no celular" quando o celular guarda de verdade.
  const [duravel, setDuravel] = useState(false);
  useEffect(() => {
    let viva = true;
    guarda
      .duravel()
      .then((d) => viva && setDuravel(d))
      .catch(() => undefined);
    return () => {
      viva = false;
    };
  }, [guarda]);
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
    const [rascunho, foto, fotosDosPapeis] = await Promise.all([
      guarda.ler<RascunhoDoReceber>(CHAVES.receber(c.ocId)),
      guarda.ler<File>(CHAVES.fotoDoReceber(c.ocId)),
      lerFotosDosPapeis(guarda, c.ocId),
    ]);
    setTela({ tipo: 'receber', cartao: c, rascunho, foto, fotosDosPapeis, recusado: doCartao.get(c.ocId)?.envio.chave });
    // De volta à lista, os cartões vêm fechados: o que ele recebeu não fica aberto à toa.
    setAberto('');
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

  const terminar = (titulo: string) => async (_: Envio, d: Desfecho) => {
    if (d.foi) return setTela({ tipo: 'pronto', titulo, texto: d.aviso || 'O escritório já vê.', guardou: false });
    const guardou = await guarda.duravel().catch(() => false);
    setTela({ tipo: 'pronto', ...(guardou ? GUARDADO : SO_COM_O_APP_ABERTO), guardou: true });
  };

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
  // Sem a caixa de busca à vista (a lista encolheu), nenhuma busca esquecida esconde pedido.
  const comBusca = cartoes.length >= BUSCA_A_PARTIR_DE;
  const achados = comBusca ? cartoes.filter((c) => empresaAchada(c.fornecedor, busca)) : cartoes;
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

      {/* No alto, à vista: com dez pedidos na lista, no pé ele não acharia (D696 §2.1). Menor que o
          botão principal: a lista é o que ele mais usa (D793 §2.1). */}
      {obras.length > 0 && (
        <button type="button" className={styles.semPedido} onClick={() => void abrirSemPedido()}>
          <Icon name="plus" size={18} /> Chegou material sem pedido
        </button>
      )}

      {esperando > 0 && (
        <p className={styles.guardado} role="status" data-fila-do-mestre>
          <Icon name="history" size={20} />
          {duravel ? (
            <>
              {esperando === 1 ? '1 recebimento guardado no celular.' : `${esperando} recebimentos guardados no celular.`}{' '}
              Vai sozinho quando o sinal voltar.
            </>
          ) : (
            <>
              {esperando === 1 ? '1 recebimento esperando sinal.' : `${esperando} recebimentos esperando sinal.`} Não feche
              o app: este celular não está guardando.
            </>
          )}
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
        <>
          {comBusca && (
            <label className={styles.busca}>
              <Icon name="search" size={20} />
              <input
                type="search"
                className={styles.buscaCampo}
                aria-label="Procurar a empresa"
                placeholder="Procurar a empresa"
                autoComplete="off"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          )}
          {achados.length === 0 ? (
            <div className={styles.semAchado}>
              <p className={styles.vazio}>Nenhuma empresa começa com “{busca.trim()}”.</p>
              <button type="button" className={styles.link} onClick={() => setBusca('')}>
                Limpar a busca
              </button>
            </div>
          ) : (
            <ul className={styles.lista}>
              {achados.map((c) => (
                <CartaoDaLista
                  key={c.ocId}
                  cartao={c}
                  hoje={hoje}
                  comObra={variasObras}
                  guardado={doCartao.get(c.ocId)}
                  duravel={duravel}
                  aberto={aberto === c.ocId}
                  aoTocar={() => setAberto((a) => (a === c.ocId ? '' : c.ocId))}
                  aoReceber={() => void abrirCartao(c)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {props.rodape}

      {aoSair &&
        (confirmarSaida ? (
          // Ele não tem senha: sair é precisar de um QR novo para voltar (D696 §2.2).
          <div className={styles.confirmar} role="alertdialog" aria-labelledby="sair-titulo">
            <p id="sair-titulo" className={styles.perguntaTexto}>
              Sair mesmo?
            </p>
            <p className={styles.dica}>
              Para entrar de novo, você vai precisar de um QR novo do engenheiro.
              {esperando > 0 &&
                (duravel
                  ? ' O que está guardado no celular só vai quando você entrar de novo neste celular.'
                  : ' O que está esperando sinal se perde: este celular não está guardando.')}
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

/**
 * O pedido na lista (D793 §2.2): fechado, uma linha — a empresa e o valor, e o
 * dia combinado quando há. O toque abre os itens, o número e o "Receber".
 */
function CartaoDaLista({
  cartao: c, hoje, comObra, guardado: g, duravel, aberto, aoTocar, aoReceber,
}: {
  cartao: CartaoAChegar;
  hoje: string;
  comObra: boolean;
  guardado: Guardado | undefined;
  duravel: boolean;
  aberto: boolean;
  aoTocar: () => void;
  aoReceber: () => void;
}) {
  const dia = diaCombinado(c.combinadoPara, hoje);
  const esperando = g?.estado === 'esperando';
  const recusado = g?.estado === 'recusado';
  return (
    <li data-cartao={c.ocId} className={esperando ? styles.cartaoGuardado : styles.cartao}>
      <button type="button" className={styles.linhaDoCartao} aria-expanded={aberto} onClick={aoTocar}>
        {comObra && c.obra && <span className={`${styles.obraDoCartao} ${styles.larga}`}>{c.obra}</span>}
        <span className={styles.fornecedorNaLinha}>{c.fornecedor}</span>
        <strong className={styles.valorNaLinha}>{formatBrl(c.total)}</strong>
        <Icon name="chevron" size={20} className={aberto ? styles.setaAberta : styles.setaFechada} />
        {dia && (
          <span className={`${styles.combinado} ${styles.larga}`}>
            Combinado para <strong>{dia}</strong>
          </span>
        )}
        {esperando && (
          <span className={`${styles.cartaoNota} ${styles.larga}`}>
            <Icon name="history" size={18} />{' '}
            {duravel ? 'Guardado no celular. Vai quando tiver sinal.' : 'Esperando sinal. Não feche o app.'}
          </span>
        )}
        {recusado && <span className={`${styles.cartaoRecusado} ${styles.larga}`}>Não foi: {g.motivo}</span>}
      </button>
      {aberto && (
        <div className={styles.detalhe}>
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
          <span className={styles.valor}>Pedido {c.numero}</span>
          {/* Guardado esperando sinal não abre: receber de novo faria duas entregas. */}
          {!esperando && (
            <button type="button" className={styles.primario} onClick={aoReceber}>
              {recusado ? 'Abrir de novo' : 'Receber'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/** O pedido inteiro, no alto da tela do receber. */
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

interface PassoProps {
  guarda: GuardaDoAparelho;
  lerNumeroDaNota: (foto: File) => Promise<string>;
  mandar: (envio: Envio) => Promise<Desfecho>;
  esquecer: (chave: string) => Promise<void>;
  aoVoltar: () => void;
  aoTerminar: AoMandar;
}

/** As perguntas, a foto da nota, o papel do fornecedor, o "O que aconteceu?" e o "Pronto". */
function Receber({
  cartao, hoje, rascunho, foto: fotoGuardada, fotosDosPapeis: fotosGuardadas, recusado, guarda, lerNumeroDaNota,
  lerRegistro = semLeitura, mandar, esquecer, aoVoltar, aoTerminar,
}: PassoProps & {
  cartao: CartaoAChegar;
  hoje: string;
  rascunho?: RascunhoDoReceber;
  foto?: File;
  fotosDosPapeis?: Record<number, File>;
  recusado?: string;
  lerRegistro?: (foto: File) => Promise<LeituraDoRegistro | null>;
}) {
  const [r, setR] = useState<RespostasDoMestre>(rascunho?.r ?? SEM_RESPOSTA);
  const [foto, setFoto] = useState<File | null>(fotoGuardada ?? null);
  const [numero, setNumero] = useState(rascunho?.numero ?? '');
  const [texto, setTexto] = useState(rascunho?.texto ?? '');
  const [contagem, setContagem] = useState<ContagemDoMestre>(rascunho?.contagem ?? {});
  // O papel do fornecedor: só das ECRs em que o banco manda perguntar (D811 §3).
  const pedidos = useMemo(() => registrosPedidos(cartao.registros), [cartao.registros]);
  const [registros, setRegistros] = useState<Record<number, RegistroRespondido>>(rascunho?.registros ?? {});
  const [fotosDosPapeis, setFotosDosPapeis] = useState<Record<number, File>>(fotosGuardadas ?? {});
  const [aviso, setAviso] = useState('');
  const [mandando, setMandando] = useState(false);

  // Cada toque fica no celular: fechar o app não apaga nada (D696 §5.1).
  useEffect(() => {
    void guarda
      .gravar(CHAVES.receber(cartao.ocId), { r, numero, texto, contagem, registros } satisfies RascunhoDoReceber)
      .catch(() => undefined);
  }, [guarda, cartao.ocId, r, numero, texto, contagem, registros]);
  useEffect(() => {
    for (const p of pedidos) {
      const k = CHAVES.fotoDoRegistro(cartao.ocId, p.ecrId);
      const f = fotosDosPapeis[p.ecrId];
      void (f ? guarda.gravar(k, f) : guarda.apagar(k)).catch(() => undefined);
    }
  }, [guarda, cartao.ocId, pedidos, fotosDosPapeis]);
  useEffect(() => {
    const k = CHAVES.fotoDoReceber(cartao.ocId);
    void (foto ? guarda.gravar(k, foto) : guarda.apagar(k)).catch(() => undefined);
  }, [guarda, cartao.ocId, foto]);

  const obrigatorio = oQueAconteceuObrigatorio(r);

  async function pronto() {
    const falta =
      oQueFalta(r, numero, texto, problemaDaContagem(cartao, contagem)) ||
      problemaDoRegistro(pedidos, registros, (ecr) => !!fotosDosPapeis[ecr], (p) => materialDoRegistro(p, cartao.itens));
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
        itens: itensDoEnvio(cartao, r.tudo, contagem),
        registros: registrosDoEnvio(pedidos, registros).map((x) => ({
          ...x,
          foto: x.resposta === 'veio' ? (fotosDosPapeis[x.ecrId] ?? null) : null,
        })),
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
          {p.dica && <p className={styles.dica}>{p.dica}</p>}
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

      {r.tudo === false && contaPorItem(cartao) && (
        <ContagemPorItem
          cartao={cartao}
          contagem={contagem}
          aoMudar={(posicao, escrito) => setContagem((c) => ({ ...c, [posicao]: escrito }))}
        />
      )}

      <FotoDaNota foto={foto} numero={numero} aoMudarFoto={setFoto} aoMudarNumero={setNumero} lerNumeroDaNota={lerNumeroDaNota} />

      {pedidos.map((p) => (
        <PapelDoFornecedor
          key={p.ecrId}
          pedido={p}
          material={materialDoRegistro(p, cartao.itens)}
          registro={registros[p.ecrId] ?? SEM_REGISTRO}
          foto={fotosDosPapeis[p.ecrId] ?? null}
          lerRegistro={lerRegistro}
          aoMudar={(mudar) => setRegistros((x) => ({ ...x, [p.ecrId]: { ...(x[p.ecrId] ?? SEM_REGISTRO), ...mudar } }))}
          aoMudarFoto={(f) =>
            setFotosDosPapeis((x) => {
              const resto = { ...x };
              delete resto[p.ecrId];
              return f ? { ...resto, [p.ecrId]: f } : resto;
            })
          }
        />
      ))}

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

const semLeitura = async (): Promise<LeituraDoRegistro | null> => null;

const RESPOSTAS_DO_PAPEL: { valor: RespostaDoRegistro; texto: string }[] = [
  { valor: 'veio', texto: 'Veio' },
  { valor: 'nao_veio', texto: 'Não veio' },
  { valor: 'nao_se_aplica', texto: 'Não se aplica a esta entrega' },
];

/**
 * O papel do fornecedor de uma ECR (D811 §3): o que a ECR pede, com as
 * palavras dela, e as três respostas. Veio: a foto, a leitura do alcance, e
 * ele confere (D812 §2, ajuste 3). Não se aplica: a frase do porquê.
 */
function PapelDoFornecedor({
  pedido, material, registro: g, foto, lerRegistro, aoMudar, aoMudarFoto,
}: {
  pedido: RegistroPedido;
  material: string;
  registro: RegistroRespondido;
  foto: File | null;
  lerRegistro: (foto: File) => Promise<LeituraDoRegistro | null>;
  aoMudar: (mudar: Partial<RegistroRespondido>) => void;
  aoMudarFoto: (f: File | null) => void;
}) {
  const [lendo, setLendo] = useState(false);
  const [escolhendo, setEscolhendo] = useState(false);
  const miniatura = useMemo(() => (foto ? URL.createObjectURL(foto) : ''), [foto]);
  useEffect(() => () => {
    if (miniatura) URL.revokeObjectURL(miniatura);
  }, [miniatura]);

  async function escolheu(f: File | undefined) {
    if (!f) return;
    aoMudarFoto(f);
    setEscolhendo(false);
    // Foto nova, conferência nova: o que ele conferiu era da foto de antes.
    aoMudar({ lido: null, alcance: 'lote', validoAte: '', conferido: false });
    setLendo(true);
    try {
      const lido = await lerRegistro(f).catch(() => null);
      aoMudar({ lido, ...alcanceDaLeitura(lido) });
    } finally {
      setLendo(false);
    }
  }

  function escolher(alcance: Alcance) {
    aoMudar({ alcance, conferido: true, ...(alcance === 'vale_ate' ? {} : { validoAte: '' }) });
    if (alcance !== 'vale_ate') setEscolhendo(false);
  }

  return (
    <fieldset className={styles.pergunta} data-papel-da-ecr={pedido.ecrId}>
      <legend className={styles.perguntaTexto}>{perguntaDoRegistro(material)}</legend>
      {/* As linhas como na ECR: a numerada na lista, a sem número como nota. Sem texto no sistema, sem caixa. */}
      {pedido.linhas.length > 0 && (
        <div className={styles.palavrasDaEcr} data-palavras-da-ecr="">
          <p className={styles.dica}>O que o fornecedor tem de mandar:</p>
          {blocosDaSecao(pedido.linhas).map((b, i) =>
            b.tipo === 'lista' ? (
              <ul key={i} className={styles.oQuePede}>
                {b.itens.map((l, j) => (
                  <li key={j}>{linhaDoDocumento(l)}</li>
                ))}
              </ul>
            ) : (
              <p key={i} className={styles.notaDaEcr}>
                {linhaDoDocumento(b.item)}
              </p>
            ),
          )}
        </div>
      )}
      <div className={styles.botoesDoPapel}>
        {RESPOSTAS_DO_PAPEL.map((b) => (
          <button
            key={b.valor}
            type="button"
            aria-pressed={g.resposta === b.valor}
            className={`${styles.resposta} ${g.resposta === b.valor ? (b.valor === 'veio' ? styles.sim : styles.marcado) : ''}`}
            onClick={() => aoMudar({ resposta: b.valor })}
          >
            {b.texto}
          </button>
        ))}
      </div>

      {g.resposta === 'nao_veio' && <p className={styles.dica}>Fica anotado, e o escritório vê.</p>}

      {g.resposta === 'nao_se_aplica' && (
        <label className={styles.campo}>
          <span className={styles.dica}>Por quê?</span>
          <textarea
            className={styles.caixa}
            rows={2}
            value={g.motivo}
            onChange={(e) => aoMudar({ motivo: e.target.value })}
            placeholder="Ex.: é compensado. Ou: este material não está na lista."
          />
        </label>
      )}

      {g.resposta === 'veio' && (
        <div className={styles.foto}>
          {miniatura && <img className={styles.miniatura} src={miniatura} alt={`A foto do papel de ${material}`} />}
          <label className={styles.secundario}>
            <Icon name="camera" size={22} /> {foto ? 'Tirar outra foto' : 'Tirar foto do papel'}
            <input
              className={styles.escondido}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => void escolheu(e.target.files?.[0])}
            />
          </label>
          {lendo && <p className={styles.dica}>Lendo o papel…</p>}
          {foto && !lendo && (
            <div className={styles.alcance} data-alcance={g.alcance}>
              {g.conferido && !escolhendo ? (
                <p className={styles.dica}>
                  Conferido: <strong>{textoDoAlcance(g.alcance, g.validoAte)}</strong>.{' '}
                  <button type="button" className={styles.link} onClick={() => setEscolhendo(true)}>
                    Mudar
                  </button>
                </p>
              ) : !escolhendo ? (
                <>
                  <p className={styles.dica}>{fraseDaLeitura(g.lido)}</p>
                  <div className={styles.botoes}>
                    <button type="button" className={styles.resposta} onClick={() => aoMudar({ conferido: true })}>
                      Está certo
                    </button>
                    <button type="button" className={styles.resposta} onClick={() => setEscolhendo(true)}>
                      Não está
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.dica}>O que vale este papel?</p>
                  <div className={styles.botoesEmPe}>
                    {ALCANCES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={g.conferido && g.alcance === a}
                        className={`${styles.resposta} ${g.conferido && g.alcance === a ? styles.marcado : ''}`}
                        onClick={() => escolher(a)}
                      >
                        {textoDoAlcance(a, '')}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {g.conferido && g.alcance === 'vale_ate' && (
                <label className={styles.campo}>
                  <span className={styles.dica}>Vale até:</span>
                  <input
                    className={styles.linha}
                    type="date"
                    value={g.validoAte}
                    onChange={(e) => aoMudar({ validoAte: e.target.value })}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}

/**
 * "Só uma parte": quanto veio de cada item (CTO-D794). O que foi pedido já vem
 * escrito; ele muda só o que veio a menos, e 0 quando não veio.
 */
function ContagemPorItem({
  cartao, contagem, aoMudar,
}: {
  cartao: CartaoAChegar;
  contagem: ContagemDoMestre;
  aoMudar: (posicao: number, escrito: string) => void;
}) {
  return (
    <fieldset className={styles.pergunta} data-contagem-por-item>
      <legend className={styles.perguntaTexto}>Quanto veio de cada um?</legend>
      <p className={styles.dica}>Já está escrito o que foi pedido. Mude só o que veio a menos. Se não veio, escreva 0.</p>
      <ul className={styles.contagem}>
        {cartao.itens.map((i) => {
          const escrito = escritoNoItem(i, contagem);
          const q = quantidadeEscrita(escrito);
          return (
            <li key={i.posicao} className={styles.itemContado}>
              <label className={styles.itemContadoNome} htmlFor={`contagem-${i.posicao}`}>
                {i.descricao}
                <span className={styles.dica}>
                  Pedido: {quantidadeFalada(i.quantidade)} {i.unidade}
                </span>
              </label>
              <span className={styles.itemContadoCampo}>
                <input
                  id={`contagem-${i.posicao}`}
                  className={`${styles.numeroDoItem} ${q !== null && q < i.quantidade ? styles.aMenos : ''}`}
                  inputMode="decimal"
                  autoComplete="off"
                  value={escrito}
                  onChange={(e) => aoMudar(i.posicao!, e.target.value)}
                />
                <span>{i.unidade}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </fieldset>
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
      const n = numeroDaNotaEmDigitos(await lerNumeroDaNota(f));
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
            onChange={(e) => aoMudarNumero(numeroDaNotaEmDigitos(e.target.value))}
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
    if (!foto && !numeroDaNotaEmDigitos(numero)) return setAviso('Tire a foto da nota, ou escreva o número dela.');
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
        registro: { foto, numeroDaNota: numeroDaNotaEmDigitos(numero), deQuem: deQuem.trim(), oQueChegou: oQueChegou.trim(), comEstrago: !semEstrago },
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
