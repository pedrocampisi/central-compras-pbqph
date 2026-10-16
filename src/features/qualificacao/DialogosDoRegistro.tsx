/**
 * As duas janelas do registro do fornecedor no escritório (CTO-D812 §2,
 * D813 §4):
 *
 * - **Anexar papel:** o comprador escolhe a foto ou o PDF, a IA lê, ele confere
 *   o alcance e guarda. Pela qualificação, o papel vale para a empresa; pela
 *   OC, ele fica anotado na OC e nos itens daquela ECR.
 * - **Corrigir o alcance:** de um papel já guardado. A correção fica escrita,
 *   com quem, quando e de quê para quê, e aparece embaixo do papel.
 *
 * Só quem emite OC vê os botões; o banco recusa os outros do mesmo jeito.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { Loader } from '../../components/Loader/Loader';
import { useUltimaEscolha } from '../../hooks/useUltimaEscolha';
import { alcanceDaLeitura, fraseDaLeitura, type Alcance, type LeituraDoRegistro } from '../../domain/registroDoFornecedor';
import {
  NOME_DO_ALCANCE,
  alcancesPossiveis,
  correcaoSemMudanca,
  problemaDoAlcance,
  textoDaCorrecao,
  textoDaVigencia,
  type RegistroGuardado,
} from '../../domain/registrosGuardados';
import {
  arquivarPapelDoFornecedor,
  corrigirRegistroDoFornecedor,
  guardarRegistroDoFornecedor,
  lerPapelDoFornecedor,
  prepararPapel,
  type OndeEntra,
} from '../../services/supabase/registrosDoFornecedor';
import { useUiStore } from '../../stores/useUiStore';
import styles from '../fornecedores/QualificarDialogo.module.css';
import meu from './DialogosDoRegistro.module.css';

/** O alcance em botões de escolha, e a data quando é "vale até". */
function EscolhaDoAlcance({
  permitidos, alcance, validoAte, aoMudar,
}: {
  permitidos: readonly Alcance[];
  alcance: Alcance | null;
  validoAte: string;
  aoMudar: (alcance: Alcance, validoAte: string) => void;
}) {
  return (
    <fieldset className={styles.criterio} data-alcance-escolha="">
      <legend>A quem o papel vale</legend>
      <div className={meu.alcances}>
        {permitidos.map((a) => (
          <label key={a}>
            <input type="radio" name="alcance" checked={alcance === a} onChange={() => aoMudar(a, validoAte)} />
            {NOME_DO_ALCANCE[a]}
          </label>
        ))}
      </div>
      {alcance === 'vale_ate' && (
        <label className={styles.campo}>
          Vale até
          <input type="date" value={validoAte} onChange={(e) => aoMudar('vale_ate', e.target.value)} />
        </label>
      )}
      {!permitidos.includes('lote') && (
        <p className={meu.dica}>O papel deste lote se anexa na OC em que ele chegou, em Ordens de compra.</p>
      )}
    </fieldset>
  );
}

export interface EcrParaAnexar {
  id: number;
  /** "ECR 06 — Madeira" */
  rotulo: string;
}

export function AnexarPapelDialogo({
  quem, naOc, ecrs, onde, aoFechar, aoGuardar,
}: {
  /** A empresa, ou a OC e a empresa, numa linha. */
  quem: string;
  /** Pelo "Anexar" na OC: o lote entra. Pela qualificação, não. */
  naOc: boolean;
  ecrs: readonly EcrParaAnexar[];
  /** Onde o papel entra, para cada ECR (a OC dá as posições dos itens daquela ECR). */
  onde: (ecrId: number) => OndeEntra;
  aoFechar: () => void;
  aoGuardar: () => void;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const [ecrId, setEcrId] = useState<number | null>(ecrs.length === 1 ? ecrs[0]!.id : null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [papel, setPapel] = useState<{ base64: string; mime: string } | null>(null);
  const [lendo, setLendo] = useState(false);
  const [leitura, setLeitura] = useState<LeituraDoRegistro | null | undefined>(undefined);
  const [alcance, setAlcance] = useState<Alcance | null>(null);
  const [validoAte, setValidoAte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState('');
  const novaEscolha = useUltimaEscolha();

  const permitidos = alcancesPossiveis(naOc);

  async function escolher(f: File | null) {
    // Um arquivo trocado no meio da leitura: o que chega do de antes não sobe com o nome do novo.
    const daVez = novaEscolha();
    setArquivo(f);
    setPapel(null);
    setLeitura(undefined);
    setAlcance(null);
    setValidoAte('');
    setErro('');
    // A escolha vazia (a janela de arquivo cancelada) tirou a vez da leitura de antes: o "Lendo" sai aqui (CTO-D821).
    if (!f) return setLendo(false);
    setLendo(true);
    try {
      const pronto = await prepararPapel(f);
      if (!daVez()) return;
      setPapel(pronto);
      const lido = await lerPapelDoFornecedor(pronto);
      if (!daVez()) return;
      setLeitura(lido);
      // A leitura sugere; na dúvida é deste lote (D809 §3). Onde o lote não entra, ninguém escolhe por ele.
      const sugerido = alcanceDaLeitura(lido);
      if (permitidos.includes(sugerido.alcance) && (lido?.alcance || naOc)) {
        setAlcance(sugerido.alcance);
        setValidoAte(sugerido.validoAte);
      }
    } catch (e) {
      if (daVez()) setErro(e instanceof Error ? e.message : 'Não consegui usar este arquivo.');
    } finally {
      if (daVez()) setLendo(false);
    }
  }

  async function guardar() {
    const problema = ecrId === null
      ? 'Escolha a ECR do papel.'
      : !papel
        ? 'Escolha a foto ou o PDF do papel.'
        : problemaDoAlcance(alcance, validoAte, permitidos);
    if (problema || ecrId === null || !papel || !alcance || !arquivo) {
      setErro(problema);
      return;
    }
    setGuardando(true);
    setErro('');
    try {
      const destino = onde(ecrId);
      const documentoId = await arquivarPapelDoFornecedor(papel, arquivo.name, ecrId, destino, leitura?.bruta);
      await guardarRegistroDoFornecedor({ documentoId, ecrId, alcance, validoAte, onde: destino });
      showToast('Papel guardado.', 'success');
      aoGuardar();
      aoFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'O papel não foi guardado.');
    } finally {
      setGuardando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="anexar-titulo">
      <div className={styles.caixa} data-dialogo-anexar="">
        <h3 id="anexar-titulo" className={styles.titulo}>Anexar papel do fornecedor</h3>
        <p className={styles.quem}>{quem}</p>

        {ecrs.length > 1 && (
          <label className={styles.campo}>
            ECR do papel
            <select
              className={meu.select}
              value={ecrId ?? ''}
              onChange={(e) => setEcrId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Escolha…</option>
              {ecrs.map((e) => (
                <option key={e.id} value={e.id}>{e.rotulo}</option>
              ))}
            </select>
          </label>
        )}
        {ecrs.length === 1 && <p className={meu.ecr}>{ecrs[0]!.rotulo}</p>}

        <label className={styles.campo}>
          A foto ou o PDF do papel
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => void escolher(e.target.files?.[0] ?? null)}
            disabled={guardando}
          />
        </label>

        {lendo && <Loader texto="Lendo o papel…" />}
        {leitura !== undefined && !lendo && (
          <p className={styles.porque} data-leitura="">
            {fraseDaLeitura(leitura)}
            {leitura?.confira && <> Confira: {leitura.confira}</>}
          </p>
        )}

        {papel && !lendo && (
          <EscolhaDoAlcance
            permitidos={permitidos}
            alcance={alcance}
            validoAte={validoAte}
            aoMudar={(a, d) => {
              setAlcance(a);
              setValidoAte(d);
            }}
          />
        )}

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={guardando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void guardar()} loading={guardando} disabled={lendo}>
            Guardar papel
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CorrigirAlcanceDialogo({
  registro, ecr, hoje, aoFechar, aoCorrigir,
}: {
  registro: RegistroGuardado;
  /** "ECR 06 — Madeira" */
  ecr: string;
  hoje: string;
  aoFechar: () => void;
  aoCorrigir: () => void;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const permitidos = alcancesPossiveis(!!registro.ocId);
  const [alcance, setAlcance] = useState<Alcance>(registro.alcance);
  const [validoAte, setValidoAte] = useState(registro.validoAte);
  const [motivo, setMotivo] = useState('');
  const [corrigindo, setCorrigindo] = useState(false);
  const [erro, setErro] = useState('');
  const igual = correcaoSemMudanca(registro, alcance, validoAte);

  async function corrigir() {
    const problema = igual ? 'O papel já está com esse alcance.' : problemaDoAlcance(alcance, validoAte, permitidos);
    if (problema) {
      setErro(problema);
      return;
    }
    setCorrigindo(true);
    setErro('');
    try {
      await corrigirRegistroDoFornecedor(registro.id, alcance, validoAte, motivo);
      showToast('Alcance corrigido. A correção ficou registrada.', 'success');
      aoCorrigir();
      aoFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'A correção não foi gravada.');
    } finally {
      setCorrigindo(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="corrigir-titulo">
      <div className={styles.caixa} data-dialogo-corrigir="">
        <h3 id="corrigir-titulo" className={styles.titulo}>Corrigir o alcance</h3>
        <p className={styles.quem}>{ecr}</p>
        <p className={meu.ecr}>Hoje: {textoDaVigencia(registro, hoje)}</p>

        <EscolhaDoAlcance
          permitidos={permitidos}
          alcance={alcance}
          validoAte={validoAte}
          aoMudar={(a, d) => {
            setAlcance(a);
            setValidoAte(d);
          }}
        />
        <label className={styles.campo}>
          Por que corrigir (opcional)
          <textarea
            className={styles.motivo}
            rows={2}
            value={motivo}
            placeholder="Ex.: a FISPQ não tem lote; vale para o produto."
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        {registro.correcoes.length > 0 && (
          <ul className={meu.correcoes} data-correcoes-antes="">
            {registro.correcoes.map((c, i) => (
              <li key={i}>{textoDaCorrecao(c)}</li>
            ))}
          </ul>
        )}

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={corrigindo}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void corrigir()} loading={corrigindo} disabled={igual}>
            Corrigir
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
