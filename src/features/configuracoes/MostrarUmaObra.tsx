/**
 * "Mostrar só uma obra" (CTO-D599, palavra do Pedro): para a auditoria do
 * PBQP-H. O Pedro escolhe a obra e a janela (hora de Brasília) e arma; a
 * máscara liga sozinha no começo e desliga sozinha no fim, só neste
 * navegador. Aparece só para quem vê o "Editar" das ECRs (a mesma checagem,
 * `pode_revisar_ecr`): não há nada novo no banco.
 */

import { useEffect, useState } from 'react';
import type { Obra } from '../../domain/types';
import {
  JANELA_SUGERIDA,
  janelaEscolhida,
  mascaraDeEnsaio,
  problemaParaArmar,
  textoEmBrasilia,
  ultimoMinuto,
} from '../../domain/umaObra';
import { podeRevisarEcr } from '../../services/supabase/ecrs';
import { useUmaObraStore } from '../../stores/useUmaObraStore';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { FieldShell } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import styles from './ConfigPage.module.css';

const NAO_GUARDA =
  'Este navegador não guarda a opção (janela anônima ou armazenamento bloqueado). A máscara não foi ligada.';

export function MostrarUmaObra({ obras }: { obras: Obra[] }) {
  const [pode, setPode] = useState(false);
  useEffect(() => {
    let vivo = true;
    podeRevisarEcr().then(
      (ok) => vivo && setPode(ok),
      () => vivo && setPode(false),
    );
    return () => {
      vivo = false;
    };
  }, []);

  const armada = useUmaObraStore((s) => s.armada);
  const obraAtiva = useUmaObraStore((s) => s.obraAtiva);
  const armar = useUmaObraStore((s) => s.armar);
  const desarmar = useUmaObraStore((s) => s.desarmar);

  const [obraId, setObraId] = useState('');
  const [deDia, setDeDia] = useState<string>(JANELA_SUGERIDA.deDia);
  const [deHora, setDeHora] = useState<string>(JANELA_SUGERIDA.deHora);
  const [ateDia, setAteDia] = useState<string>(JANELA_SUGERIDA.ateDia);
  const [ateHora, setAteHora] = useState<string>(JANELA_SUGERIDA.ateHora);
  const [erro, setErro] = useState('');

  if (!pode) return null;

  const nomeDaObra = (id: string) => obras.find((o) => o.id === id)?.nome ?? '';

  function armarJanela() {
    const { inicio, fim } = janelaEscolhida(deDia, deHora, ateDia, ateHora);
    const problema = problemaParaArmar(obraId, inicio, fim, new Date());
    if (problema) return setErro(problema);
    const ok = armar({ obraId, obraNome: nomeDaObra(obraId), inicio: inicio.toISOString(), fim: fim.toISOString(), ensaio: false });
    setErro(ok ? '' : NAO_GUARDA);
  }

  function verAgora() {
    if (!obraId) return setErro('Escolha a obra.');
    const ok = armar(mascaraDeEnsaio(obraId, nomeDaObra(obraId), new Date()));
    setErro(ok ? '' : NAO_GUARDA);
  }

  // A loja confere o relógio: na virada, a frase muda de "Armada" para "Ligada".
  const ligada = !!armada && obraAtiva === armada.obraId;
  const ordenadas = [...obras].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Separada do resto da página (CTO-D601): o aviso "somente leitura" fala do
  // resto, e esta opção grava.
  return (
    <FieldGroup title="Mostrar só uma obra" className={styles.opcaoSeparada}>
      <p className={styles.hint}>
        Neste navegador, durante a janela, todas as telas mostram só a obra escolhida. Os outros computadores continuam
        vendo tudo. As horas são as de Brasília.
      </p>

      {armada ? (
        <div className={styles.rowFull} data-estado-mascara="">
          <p className={styles.estadoDaMascara}>
            {ligada
              ? `Ligada até ${textoEmBrasilia(ultimoMinuto(armada))}${armada.ensaio ? ' (ensaio)' : ''}.`
              : `Armada: liga em ${textoEmBrasilia(new Date(armada.inicio))} e desliga em ${textoEmBrasilia(ultimoMinuto(armada))}.`}{' '}
            Obra: {armada.obraNome || '—'}.
          </p>
          <Button variant="outline" size="sm" onClick={desarmar}>
            {ligada ? 'Desligar agora' : 'Desarmar'}
          </Button>
        </div>
      ) : (
        <>
          <FieldShell label="Obra" htmlFor="uma-obra-obra" span2>
            <select id="uma-obra-obra" value={obraId} onChange={(e) => setObraId(e.target.value)}>
              <option value="">Selecione…</option>
              {ordenadas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Liga em (dia)" htmlFor="uma-obra-de-dia">
            <input id="uma-obra-de-dia" type="date" value={deDia} onChange={(e) => setDeDia(e.target.value)} />
          </FieldShell>
          <FieldShell label="Liga em (hora)" htmlFor="uma-obra-de-hora">
            <input id="uma-obra-de-hora" type="time" value={deHora} onChange={(e) => setDeHora(e.target.value)} />
          </FieldShell>
          <FieldShell label="Desliga depois de (dia)" htmlFor="uma-obra-ate-dia">
            <input id="uma-obra-ate-dia" type="date" value={ateDia} onChange={(e) => setAteDia(e.target.value)} />
          </FieldShell>
          <FieldShell label="Desliga depois de (hora)" htmlFor="uma-obra-ate-hora">
            <input id="uma-obra-ate-hora" type="time" value={ateHora} onChange={(e) => setAteHora(e.target.value)} />
          </FieldShell>
          {erro && (
            <p className={styles.erroDaMascara} role="alert">
              {erro}
            </p>
          )}
          <div className={styles.rowFull}>
            <Button variant="primary" size="sm" onClick={armarJanela}>
              Armar
            </Button>
            <Button variant="outline" size="sm" onClick={verAgora}>
              Ver agora (ensaio)
            </Button>
          </div>
        </>
      )}
    </FieldGroup>
  );
}
