/**
 * Mestres — o acesso do mestre de obra, feito pelo engenheiro na obra (CTO-D696 §4).
 *
 * As palavras do Pedro: "o engenheiro da obra precisa fazer isso também, pois
 * eu não vou à obra". Por isso tudo cabe no celular do engenheiro (375 px):
 *   - cadastrar o mestre, só com o nome (e-mail e telefone, se tiver);
 *   - pôr na obra e tirar (com o motivo; mais de um mestre por obra é permitido);
 *   - gerar o QR de entrada (uso único, uma hora);
 *   - desligar o acesso (com o motivo) e religar.
 *
 * Só admin e engenharia veem esta tela. A trava de verdade mora no banco
 * (`pode_gerir_mestre`, e "só perfil mestre"): a tela só não oferece o que o
 * banco recusaria.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { formatDate, formatTimestamp } from '../../domain/format';
import {
  cadastrarMestre, desligarMestre, gerarQr, lerMestres, porNaObra, religarMestre, tirarDaObra,
  type MestreNaLista, type NovoMestre,
} from '../../services/supabase/mestres';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import caixa from '../ordens-compra/RegistrarEntregaDialogo.module.css';
import { QrDoMestre } from './QrDoMestre';
import styles from './MestresPage.module.css';

type Pedindo =
  | { o: 'cadastrar' }
  | { o: 'tirar'; mestre: MestreNaLista; vinculo: number; obra: string }
  | { o: 'desligar'; mestre: MestreNaLista };

export function MestresPage() {
  const data = useDataStore((s) => s.data);
  const [mestres, setMestres] = useState<MestreNaLista[] | null>(null);
  const [erro, setErro] = useState('');
  const [pedindo, setPedindo] = useState<Pedindo | null>(null);
  const [qr, setQr] = useState<{ mestre: MestreNaLista; link: string; venceEm: string } | null>(null);
  const [ocupado, setOcupado] = useState('');

  const ler = useCallback(async () => {
    try {
      setMestres(await lerMestres());
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao ler os mestres.');
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void ler(), 0);
    return () => clearTimeout(t);
  }, [ler]);

  const obras = useMemo(
    () => (data?.obras ?? []).filter((o) => o.ativa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [data],
  );
  const nomeDaObra = useMemo(() => new Map((data?.obras ?? []).map((o) => [o.id, o.nome])), [data]);

  const avisar = (m: string, tom: 'success' | 'warning' | 'error' = 'success') => useUiStore.getState().showToast(m, tom);

  /** Uma ação de um botão do cartão: trava o botão, avisa, relê. */
  async function fazer(chave: string, acao: () => Promise<void>, ok: string) {
    setOcupado(chave);
    try {
      await acao();
      avisar(ok);
      await ler();
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'Não deu certo.', 'error');
    } finally {
      setOcupado('');
    }
  }

  async function pedirQr(m: MestreNaLista) {
    setOcupado(`qr:${m.userId}`);
    try {
      const r = await gerarQr(m.userId);
      setQr({ mestre: m, ...r });
      void ler(); // o "último QR" do cartão
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'Não deu para gerar o QR.', 'error');
    } finally {
      setOcupado('');
    }
  }

  if (!data) return null;

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Mestres de obra</h2>
          <p className="section-sub">
            O mestre entra só pelo QR, sem senha. Cadastre, ponha na obra e gere o QR com ele do seu lado.
          </p>
        </div>
        <Button variant="primary" onClick={() => setPedindo({ o: 'cadastrar' })}>
          Cadastrar mestre
        </Button>
      </div>

      {erro && (
        <p className={caixa.erro} role="alert">
          {erro}
        </p>
      )}

      {mestres && mestres.length === 0 && (
        <EmptyState title="Nenhum mestre" description="Cadastre o primeiro mestre de obra para ele receber material pelo celular." />
      )}

      {mestres && mestres.length > 0 && (
        <ul className={styles.lista}>
          {mestres.map((m) => (
            <CartaoDoMestre
              key={m.userId}
              mestre={m}
              obras={obras}
              nomeDaObra={nomeDaObra}
              ocupado={ocupado}
              aoGerarQr={() => void pedirQr(m)}
              aoPorNaObra={(obraId) =>
                void fazer(`obra:${m.userId}`, () => porNaObra(m.userId, obraId), `${m.nome} está na obra ${nomeDaObra.get(obraId) ?? ''}.`)
              }
              aoTirar={(vinculo, obra) => setPedindo({ o: 'tirar', mestre: m, vinculo, obra })}
              aoDesligar={() => setPedindo({ o: 'desligar', mestre: m })}
              aoReligar={() => void fazer(`religar:${m.userId}`, () => religarMestre(m.userId), `O acesso de ${m.nome} voltou.`)}
            />
          ))}
        </ul>
      )}

      {pedindo?.o === 'cadastrar' && (
        <CadastrarDialogo
          obras={obras}
          aoFechar={() => setPedindo(null)}
          aoCadastrar={async (novo) => {
            const r = await cadastrarMestre(novo);
            setPedindo(null);
            avisar(`${novo.nome.trim()} cadastrado. Gere o QR para ele entrar.`);
            if (r.aviso) avisar(r.aviso, 'warning');
            await ler();
          }}
        />
      )}
      {pedindo?.o === 'tirar' && (
        <MotivoDialogo
          titulo={`Tirar ${pedindo.mestre.nome} da obra`}
          quem={pedindo.obra}
          rotulo="Motivo de tirar da obra"
          botao="Tirar da obra"
          aoFechar={() => setPedindo(null)}
          aoConfirmar={async (motivo) => {
            await tirarDaObra(pedindo.vinculo, motivo);
            setPedindo(null);
            avisar(`${pedindo.mestre.nome} saiu da obra ${pedindo.obra}.`);
            await ler();
          }}
        />
      )}
      {pedindo?.o === 'desligar' && (
        <MotivoDialogo
          titulo={`Desligar o acesso de ${pedindo.mestre.nome}`}
          quem="Na hora, ele deixa de ver a lista e de registrar. As obras dele ficam como estão: religar devolve tudo."
          rotulo="Motivo de desligar"
          botao="Desligar"
          aoFechar={() => setPedindo(null)}
          aoConfirmar={async (motivo) => {
            await desligarMestre(pedindo.mestre.userId, motivo);
            setPedindo(null);
            avisar(`O acesso de ${pedindo.mestre.nome} foi desligado.`);
            await ler();
          }}
        />
      )}
      {qr && (
        <QrDoMestre
          nome={qr.mestre.nome}
          link={qr.link}
          venceEm={qr.venceEm}
          aoFechar={() => setQr(null)}
          aoGerarOutro={() => {
            const m = qr.mestre;
            setQr(null);
            void pedirQr(m);
          }}
        />
      )}
    </div>
  );
}

function CartaoDoMestre({
  mestre: m, obras, nomeDaObra, ocupado, aoGerarQr, aoPorNaObra, aoTirar, aoDesligar, aoReligar,
}: {
  mestre: MestreNaLista;
  obras: { id: string; nome: string }[];
  nomeDaObra: Map<string, string>;
  ocupado: string;
  aoGerarQr: () => void;
  aoPorNaObra: (obraId: string) => void;
  aoTirar: (vinculo: number, obra: string) => void;
  aoDesligar: () => void;
  aoReligar: () => void;
}) {
  const [obraNova, setObraNova] = useState('');
  const jaEsta = new Set(m.obras.map((o) => o.obraId));
  const livres = obras.filter((o) => !jaEsta.has(o.id));

  return (
    <li className={styles.cartao} data-mestre={m.userId} data-desligado={m.ativo ? undefined : ''}>
      <div className={styles.cabeca}>
        <strong>{m.nome}</strong>
        {!m.ativo && <span className={styles.desligado}>Desligado</span>}
      </div>
      {!m.ativo && m.motivoDesligado && <p className={styles.miudo}>Motivo: {m.motivoDesligado}</p>}

      <div className={styles.obras}>
        {m.obras.length === 0 && <span className={styles.miudo}>Ainda não está em nenhuma obra.</span>}
        {m.obras.map((o) => {
          const nome = nomeDaObra.get(o.obraId) ?? 'Obra';
          return (
            <span key={o.vinculo} className={styles.obra} data-vinculo={o.vinculo}>
              <span>
                {nome} <small>desde {formatDate(o.desde.slice(0, 10))}</small>
              </span>
              <button type="button" className={styles.tirar} onClick={() => aoTirar(o.vinculo, nome)}>
                Tirar
              </button>
            </span>
          );
        })}
      </div>

      {m.ativo && livres.length > 0 && (
        <div className={styles.porNaObra}>
          <label className={styles.campoSelect}>
            <span className={styles.somenteLeitor}>Pôr {m.nome} numa obra</span>
            <select value={obraNova} onChange={(e) => setObraNova(e.target.value)}>
              <option value="">Pôr numa obra…</option>
              {livres.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={!obraNova}
            loading={ocupado === `obra:${m.userId}`}
            onClick={() => {
              aoPorNaObra(obraNova);
              setObraNova('');
            }}
          >
            Pôr
          </Button>
        </div>
      )}

      <p className={styles.miudo}>
        {m.ultimoQr ? `Último QR: ${formatTimestamp(m.ultimoQr.em)}, por ${m.ultimoQr.porNome}.` : 'Nenhum QR gerado ainda.'}
      </p>

      <div className={styles.acoes}>
        {m.ativo ? (
          <>
            <Button variant="outline" size="sm" loading={ocupado === `qr:${m.userId}`} onClick={aoGerarQr}>
              Gerar QR
            </Button>
            <Button variant="ghost" size="sm" onClick={aoDesligar}>
              Desligar
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" loading={ocupado === `religar:${m.userId}`} onClick={aoReligar}>
            Religar
          </Button>
        )}
      </div>
    </li>
  );
}

function CadastrarDialogo({
  obras, aoFechar, aoCadastrar,
}: {
  obras: { id: string; nome: string }[];
  aoFechar: () => void;
  aoCadastrar: (m: NovoMestre) => Promise<void>;
}) {
  const [m, setM] = useState<NovoMestre>({ nome: '', email: '', telefone: '', obraId: obras.length === 1 ? obras[0]!.id : '' });
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const mudar = (p: Partial<NovoMestre>) => setM((x) => ({ ...x, ...p }));

  async function gravar() {
    if (!m.nome.trim()) {
      setErro('Escreva o nome do mestre.');
      return;
    }
    setErro('');
    setGravando(true);
    try {
      await aoCadastrar(m);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para cadastrar.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="cadastrar-titulo">
      <div className={caixa.caixa} data-dialogo-cadastrar="">
        <h3 id="cadastrar-titulo" className={caixa.titulo}>
          Cadastrar mestre
        </h3>
        <p className={caixa.quem}>Ele entra pelo QR, sem senha. O e-mail é só para quem tiver e quiser usar “Esqueci minha senha”.</p>
        <label className={caixa.campo}>
          <span>
            Nome<span className={caixa.obrigatorio}>*</span>
          </span>
          <input type="text" autoComplete="off" value={m.nome} onChange={(e) => mudar({ nome: e.target.value })} />
        </label>
        <label className={caixa.campo}>
          <span>E-mail (se tiver)</span>
          <input type="email" autoComplete="off" value={m.email} onChange={(e) => mudar({ email: e.target.value })} />
        </label>
        <label className={caixa.campo}>
          <span>Telefone (se quiser)</span>
          <input type="tel" autoComplete="off" value={m.telefone} onChange={(e) => mudar({ telefone: e.target.value })} />
        </label>
        <label className={`${caixa.campo} ${styles.campoSelect}`}>
          <span>Obra (pode ser depois)</span>
          <select value={m.obraId} onChange={(e) => mudar({ obraId: e.target.value })}>
            <option value="">Depois</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>
        {erro && (
          <p className={caixa.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={caixa.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void gravar()} loading={gravando}>
            Cadastrar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MotivoDialogo({
  titulo, quem, rotulo, botao, aoFechar, aoConfirmar,
}: {
  titulo: string;
  quem: string;
  rotulo: string;
  botao: string;
  aoFechar: () => void;
  aoConfirmar: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    if (!motivo.trim()) {
      setErro('Escreva o motivo.');
      return;
    }
    setErro('');
    setGravando(true);
    try {
      await aoConfirmar(motivo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu certo.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="motivo-titulo">
      <div className={caixa.caixa} data-dialogo-motivo="">
        <h3 id="motivo-titulo" className={caixa.titulo}>
          {titulo}
        </h3>
        <p className={caixa.quem}>{quem}</p>
        <label className={caixa.campo}>
          <span>
            {rotulo}
            <span className={caixa.obrigatorio}>*</span>
          </span>
          <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
        {erro && (
          <p className={caixa.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={caixa.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void gravar()} loading={gravando}>
            {botao}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
