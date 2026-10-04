/**
 * A tela do mestre de obra ligada ao banco (CTO-D696 §5.2): quem entra com o
 * papel `mestre` cai aqui, sem menu, e só aqui.
 *
 * A lista vem da `compras.material_a_chegar` e fica guardada no celular: sem
 * sinal, ele abre o app e vê os pedidos da última vez que leu, e recebe do mesmo
 * jeito — a fila manda quando o sinal voltar. A lista é lida de novo ao abrir,
 * quando a rede volta, quando o app volta à frente e depois de cada envio.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from '../../components/Loader/Loader';
import { todayIso } from '../../domain/format';
import { obrasDoMestre, type CartaoAChegar } from '../../domain/recebimento';
import { guardaDoAparelho, type GuardaDoAparelho } from '../../services/guardaDoAparelho';
import {
  lerMaterialAChegar, lerNumeroDaNotaNaFoto, registrarEntregaDoMestre, registrarSemPedidoDoMestre,
} from '../../services/supabase/recebimento';
import type { EnvioDeRecebimento, EnvioSemPedido } from './fila';
import { MaterialAChegar } from './MaterialAChegar';
import styles from './MaterialAChegar.module.css';

export const CHAVE_DA_LISTA = 'lista:ultima';

interface ListaGuardada {
  cartoes: CartaoAChegar[];
  obras: string[];
  lidaEm: string;
}

/** "14h05", na hora de Brasília. */
function horaDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const [h, m] = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
  }).format(d).split(':');
  return `${h}h${m}`;
}

export function TelaDoMestre({ aoSair, guarda: guardaDeFora }: { aoSair: () => void; guarda?: GuardaDoAparelho }) {
  const guarda = useMemo(() => guardaDeFora ?? guardaDoAparelho(), [guardaDeFora]);
  const [lista, setLista] = useState<ListaGuardada | null>(null);
  const [semSinal, setSemSinal] = useState(false);

  const ler = useCallback(async () => {
    try {
      const l = await lerMaterialAChegar();
      const nova: ListaGuardada = { ...l, lidaEm: new Date().toISOString() };
      setLista(nova);
      setSemSinal(false);
      await guarda.gravar(CHAVE_DA_LISTA, nova).catch(() => undefined);
    } catch {
      setSemSinal(true);
    }
  }, [guarda]);

  useEffect(() => {
    let viva = true;
    // A guardada aparece logo; a do banco, quando chegar, passa por cima.
    void guarda
      .ler<ListaGuardada>(CHAVE_DA_LISTA)
      .then((l) => viva && l && setLista((atual) => atual ?? l))
      .catch(() => undefined);
    const tentar = () => void ler();
    const primeira = setTimeout(tentar, 0);
    const aVista = () => document.visibilityState === 'visible' && tentar();
    window.addEventListener('online', tentar);
    document.addEventListener('visibilitychange', aVista);
    return () => {
      viva = false;
      clearTimeout(primeira);
      window.removeEventListener('online', tentar);
      document.removeEventListener('visibilitychange', aVista);
    };
  }, [guarda, ler]);

  const aoReceber = useCallback(
    async (e: EnvioDeRecebimento) => {
      const aviso = await registrarEntregaDoMestre({
        chave: e.chave,
        ocId: e.cartao.ocId,
        intervencaoId: e.cartao.intervencaoId,
        avaliacao: e.avaliacao,
        soUmaParte: e.soUmaParte,
        foto: e.foto,
      });
      void ler();
      return aviso;
    },
    [ler],
  );

  const aoRegistrarSemPedido = useCallback(async (e: EnvioSemPedido) => {
    await registrarSemPedidoDoMestre({
      chave: e.chave,
      intervencaoId: e.intervencaoId,
      recebidoEm: e.recebidoEm,
      foto: e.registro.foto,
      numeroDaNota: e.registro.numeroDaNota,
      deQuem: e.registro.deQuem,
      oQueChegou: e.registro.oQueChegou,
      comEstrago: e.registro.comEstrago,
    });
  }, []);

  if (!lista) {
    if (!semSinal) return <Loader texto="Buscando os pedidos…" />;
    return (
      <div className={styles.tela} data-tela-do-mestre="sem-lista">
        <header className={styles.topo}>
          <h1 className={styles.titulo}>Material a chegar</h1>
        </header>
        <p className={styles.vazio}>Sem sinal para buscar os pedidos.</p>
        <button type="button" className={styles.primario} onClick={() => void ler()}>
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <MaterialAChegar
      obras={obrasDoMestre(lista.obras, lista.cartoes)}
      hoje={todayIso()}
      cartoes={lista.cartoes}
      lerNumeroDaNota={lerNumeroDaNotaNaFoto}
      aoReceber={aoReceber}
      aoRegistrarSemPedido={aoRegistrarSemPedido}
      aoSair={aoSair}
      aviso={semSinal ? `Sem sinal. Esta é a lista das ${horaDe(lista.lidaEm)}.` : undefined}
      guarda={guarda}
    />
  );
}
