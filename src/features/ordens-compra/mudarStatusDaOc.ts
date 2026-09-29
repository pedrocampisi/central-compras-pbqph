/**
 * Mudar o status de uma OC pelo Histórico (cancelada — e emitida, que é a
 * segunda porta de emissão). Entregue não passa por aqui desde a D604: vai
 * pelo `registrar_entrega`, com a avaliação. Mora fora da tela desde a perícia de
 * 27/09 (achado 6, CTO-D607): assim o teste de COMPORTAMENTO chega nela e
 * conta as gravações, em vez de procurar texto no código.
 */

import type { Fornecedor, OrdemCompra } from '../../domain/types';
import type { StatusOc } from '../../domain/constants';
import { travaDaFilial } from '../../domain/fornecedores';
import { definirStatusOc, ConflitoDeVersao, TravaDoBanco } from '../../services/supabase/dados';
import { qualificacaoParaEmitir } from './qualificacaoParaEmitir';
import { recarregarDados } from '../../services/supabase/sync';

export const ENTREGUE_SO_COM_AVALIACAO =
  'A entrega se registra pelo botão "Entregue" do Histórico, com a avaliação do recebimento.';

type Avisar = (texto: string, tom: 'success' | 'warning' | 'error') => void;

export async function mudarStatusDaOc(
  oc: OrdemCompra,
  status: StatusOc,
  fornecedores: readonly Fornecedor[],
  avisar: Avisar,
): Promise<void> {
  // Entregue só com a avaliação do recebimento, pelo `registrar_entrega`
  // (CTO-D604 §3.2): este comando estreito não leva a OC a entregue.
  if (status === 'entregue') { avisar(ENTREGUE_SO_COM_AVALIACAO, 'warning'); return; }
  // A filial bloqueada não emite, por nenhuma porta (D545).
  if (status === 'emitida') {
    const trava = travaDaFilial(fornecedores.find((f) => f.id === oc.fornecedor_id), 'emitir');
    if (trava) { avisar(trava, 'warning'); return; }
    // Material controlado só com empresa qualificada para as ECRs dele (CTO-D605).
    const q = qualificacaoParaEmitir(oc, fornecedores);
    if (q.trava) { avisar(q.trava, 'warning'); return; }
  }
  try {
    // Comando estreito: muda o status e nada mais. Vai com a versão que esta
    // tela leu — se outra pessoa mexeu na OC nesse meio-tempo, o banco recusa
    // em vez de sobrescrever o trabalho dela.
    // Emitir daqui também é o que reserva o número, se ainda não houver.
    const gravada = await definirStatusOc(oc.id, status, oc.versao);
    await recarregarDados();
    avisar(
      status === 'emitida' && gravada.numero
        ? `OC emitida com o número ${gravada.numero}.`
        : `Status alterado para "${status}".`,
      'success',
    );
  } catch (err) {
    if (err instanceof ConflitoDeVersao || err instanceof TravaDoBanco) {
      avisar(err.message, 'warning');
      return;
    }
    avisar(`Erro ao alterar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
  }
}
