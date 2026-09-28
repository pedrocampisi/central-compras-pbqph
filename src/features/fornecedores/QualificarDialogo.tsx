/**
 * O "Qualificar agora" (CTO-D605) e o "Qualificar/Requalificar" da ficha da
 * empresa (D613 §2): a linha da FO 8.4.1.1 numa caixa só.
 *
 * - Três critérios, cada um com "atende / não atende" e o motivo, que é
 *   obrigatório nos dois casos (o auditor pergunta o porquê).
 * - Em material, as ECRs para que a empresa é qualificada. O "Qualificar
 *   agora" já traz marcadas as da OC somadas às que ela tinha.
 * - A nota aparece enquanto se marca, com o mínimo da categoria.
 *
 * Quem calcula a nota, o vencimento e a situação é o banco: a tela só mostra
 * o que ele vai calcular. A caixa não decide nada sobre a OC — devolve o que
 * o banco gravou, e quem abriu decide o que fazer.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import {
  dataBr,
  notaAoVivo,
  problemaDaQualificacao,
  sujeitoParaGravar,
  vencimentoDe,
  type SujeitoDaFilial,
} from '../../domain/qualificacao';
import {
  qualificarEmpresa,
  type CategoriaDaQualificacao,
  type QualificacaoGravada,
} from '../../services/supabase/qualificacao';
import type { Ecr } from '../../domain/types';
import styles from './QualificarDialogo.module.css';

interface Props {
  /** A filial escolhida: a qualificação vai para a empresa dela (ou para ela, se não tiver raiz). */
  filial: SujeitoDaFilial & { razao_social: string };
  categoria: CategoriaDaQualificacao;
  /** Todas as ECRs do catálogo, para marcar (só em material). */
  ecrs: readonly Pick<Ecr, 'id' | 'codigo' | 'nome'>[];
  /** As que já vêm marcadas. */
  ecrsMarcadas: readonly number[];
  /** O motivo de a caixa ter aberto (a frase da trava), quando houver. */
  porque?: string;
  titulo?: string;
  aoGravar: (r: QualificacaoGravada) => void | Promise<void>;
  aoVoltar: () => void;
}

type Marca = { atende: boolean | null; motivo: string };

export function QualificarDialogo({ filial, categoria, ecrs, ecrsMarcadas, porque, titulo, aoGravar, aoVoltar }: Props) {
  const hoje = hojeEmSaoPaulo();
  const [marcas, setMarcas] = useState<Marca[]>(() => categoria.criterios.map(() => ({ atende: null, motivo: '' })));
  const [marcadas, setMarcadas] = useState<number[]>(() => [...ecrsMarcadas]);
  const [qualificadaEm, setQualificadaEm] = useState(hoje);
  const [tipo, setTipo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  const material = categoria.categoria === 'material';
  const nota = notaAoVivo(marcas.map((m) => ({ atende: m.atende === true, motivo: m.motivo })));
  const passa = nota >= categoria.minimo;

  function marcar(i: number, parte: Partial<Marca>) {
    setMarcas((ms) => ms.map((m, j) => (j === i ? { ...m, ...parte } : m)));
  }

  function alternarEcr(id: number) {
    setMarcadas((ms) => (ms.includes(id) ? ms.filter((e) => e !== id) : [...ms, id].sort((a, b) => a - b)));
  }

  async function gravar() {
    const semMarca = marcas.findIndex((m) => m.atende === null);
    if (semMarca >= 0) {
      setErro(`Marque se o critério ${semMarca + 1} atende ou não atende.`);
      return;
    }
    const criterios = marcas.map((m) => ({ atende: m.atende === true, motivo: m.motivo }));
    const problema = problemaDaQualificacao(categoria.categoria, criterios, material ? marcadas : [], qualificadaEm, hoje);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setGravando(true);
    try {
      const r = await qualificarEmpresa({
        sujeito: sujeitoParaGravar(filial),
        categoria: categoria.categoria,
        tipo,
        qualificadaEm,
        criterios,
        ecrs: material ? marcadas : [],
      });
      await aoGravar(r);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a qualificação.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="qualificar-titulo">
      <div className={styles.caixa} data-dialogo-qualificar="">
        <h3 id="qualificar-titulo" className={styles.titulo}>
          {titulo ?? 'Qualificar agora'}
        </h3>
        <p className={styles.quem}>
          {filial.razao_social} · {categoria.nome}
        </p>
        {porque && (
          <p className={styles.porque} data-porque="">
            {porque}
          </p>
        )}

        {categoria.criterios.map((texto, i) => (
          <fieldset key={i} className={styles.criterio} data-criterio={i + 1}>
            <legend>
              {i + 1}. {texto}
            </legend>
            <div className={styles.escolha}>
              <label>
                <input
                  type="radio"
                  name={`criterio-${i}`}
                  checked={marcas[i]!.atende === true}
                  onChange={() => marcar(i, { atende: true })}
                />
                Atende
              </label>
              <label>
                <input
                  type="radio"
                  name={`criterio-${i}`}
                  checked={marcas[i]!.atende === false}
                  onChange={() => marcar(i, { atende: false })}
                />
                Não atende
              </label>
            </div>
            <textarea
              className={styles.motivo}
              rows={2}
              aria-label={`Motivo do critério ${i + 1}`}
              placeholder="Por que atende, ou por que não atende."
              value={marcas[i]!.motivo}
              onChange={(e) => marcar(i, { motivo: e.target.value })}
            />
          </fieldset>
        ))}

        {material && ecrs.length > 0 && (
          <fieldset className={styles.criterio}>
            <legend>Qualificada para as ECRs</legend>
            <div className={styles.ecrs}>
              {ecrs.map((e) => (
                <label key={e.id} className={styles.ecr} data-marcada={marcadas.includes(e.id) || undefined}>
                  <input type="checkbox" checked={marcadas.includes(e.id)} onChange={() => alternarEcr(e.id)} />
                  {e.codigo} — {e.nome}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className={styles.linhaDeCampos}>
          <label className={styles.campo}>
            <span>Data da qualificação</span>
            <input type="date" max={hoje} value={qualificadaEm} onChange={(e) => setQualificadaEm(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Tipo (opcional)</span>
            <input type="text" value={tipo} placeholder="Ex.: tubos e conexões" onChange={(e) => setTipo(e.target.value)} />
          </label>
        </div>

        <p className={styles.nota} data-passa={passa || undefined} aria-live="polite">
          Nota {nota} de {categoria.criterios.length} — o mínimo é {categoria.minimo}.{' '}
          {passa
            ? `Qualificada até ${/^\d{4}-\d{2}-\d{2}$/.test(qualificadaEm) ? dataBr(vencimentoDe(qualificadaEm)) : '—'}.`
            : 'Com esta nota, a empresa fica desqualificada.'}
        </p>

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoes}>
          <Button variant="outline" onClick={aoVoltar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={gravar} loading={gravando}>
            Gravar qualificação
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
