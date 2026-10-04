/**
 * A fila do celular do mestre (CTO-D696 §5.1): o "Pronto" guarda PRIMEIRO no
 * aparelho e só depois tenta mandar. Sem sinal, fica guardado e vai sozinho:
 * ao abrir o app, quando o celular diz que voltou a rede, e a cada 30 s
 * enquanto houver algo esperando.
 *
 * Cada envio leva a sua `chave`. Se a resposta do banco se perde no caminho
 * (gravou, mas o celular não soube), a mesma chave vai de novo, e o banco
 * responde que já estava — sem receber a mesma entrega duas vezes.
 *
 * Dois desfechos de falha, e só dois:
 *   - qualquer erro comum (rede, tempo, servidor fora): fica esperando;
 *   - `RecusaDefinitiva` (o banco disse não, e repetir não muda): para de
 *     tentar e mostra o motivo, na fala do canteiro, para ele ou o escritório.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Avaliacao } from '../../domain/qualificacao';
import type { CartaoAChegar, RespostasDoMestre } from '../../domain/recebimento';
import type { GuardaDoAparelho } from '../../services/guardaDoAparelho';

export interface SemPedido {
  foto: File | null;
  numeroDaNota: string;
  deQuem: string;
  oQueChegou: string;
  comEstrago: boolean;
}

export interface EnvioDeRecebimento {
  tipo: 'receber';
  chave: string;
  cartao: CartaoAChegar;
  avaliacao: Avaliacao;
  soUmaParte: boolean;
  foto: File | null;
}

export interface EnvioSemPedido {
  tipo: 'sem-pedido';
  chave: string;
  registro: SemPedido;
}

export type Envio = EnvioDeRecebimento | EnvioSemPedido;

export interface Guardado {
  envio: Envio;
  guardadoEm: string;
  estado: 'esperando' | 'recusado';
  motivo?: string;
}

/** O banco disse não, e mandar de novo não muda: a fila para de tentar este. */
export class RecusaDefinitiva extends Error {}

/** O que ele preencheu no recebimento de um pedido, e ainda não foi. */
export interface RascunhoDoReceber {
  r: RespostasDoMestre;
  numero: string;
  texto: string;
}

/** O que ele preencheu no "sem pedido", e ainda não foi. */
export interface RascunhoSemPedido {
  numero: string;
  deQuem: string;
  oQueChegou: string;
  semEstrago: boolean | null;
}

export const CHAVES = {
  fila: 'fila:',
  receber: (ocId: string) => `rascunho:receber:${ocId}`,
  fotoDoReceber: (ocId: string) => `foto:receber:${ocId}`,
  semPedido: 'rascunho:sem-pedido',
  fotoDoSemPedido: 'foto:sem-pedido',
};

export const TENTAR_DE_NOVO_MS = 30_000;

export const novaChave = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type Desfecho = { foi: true } | { foi: false; motivo?: string };

export function useFilaDoMestre(
  guarda: GuardaDoAparelho,
  aoReceber: (e: EnvioDeRecebimento) => Promise<void>,
  aoRegistrarSemPedido: (e: EnvioSemPedido) => Promise<void>,
) {
  const [guardados, setGuardados] = useState<Guardado[]>([]);
  const ocupada = useRef(false);
  // As funções de gravar chegam novas a cada desenho da tela; a fila usa sempre
  // a última, sem recomeçar as tentativas por causa disso.
  const enviar = useRef({ aoReceber, aoRegistrarSemPedido });
  useEffect(() => {
    enviar.current = { aoReceber, aoRegistrarSemPedido };
  });

  const recarregar = useCallback(async () => {
    const ks = await guarda.chaves(CHAVES.fila);
    const gs = await Promise.all(ks.map((k) => guarda.ler<Guardado>(k)));
    setGuardados(gs.filter((g): g is Guardado => !!g));
  }, [guarda]);

  /** Manda um; com sucesso, tira da fila e apaga o rascunho dele. */
  const mandarUm = useCallback(
    async (g: Guardado): Promise<Desfecho> => {
      const k = CHAVES.fila + g.envio.chave;
      try {
        if (g.envio.tipo === 'receber') await enviar.current.aoReceber(g.envio);
        else await enviar.current.aoRegistrarSemPedido(g.envio);
      } catch (e) {
        if (!(e instanceof RecusaDefinitiva)) return { foi: false };
        await guarda.gravar(k, { ...g, estado: 'recusado', motivo: e.message } satisfies Guardado);
        return { foi: false, motivo: e.message };
      }
      await guarda.apagar(k);
      if (g.envio.tipo === 'receber') {
        await guarda.apagar(CHAVES.receber(g.envio.cartao.ocId));
        await guarda.apagar(CHAVES.fotoDoReceber(g.envio.cartao.ocId));
      }
      return { foi: true };
    },
    [guarda],
  );

  /** Tenta tudo o que está esperando, um de cada vez, nunca dois ao mesmo tempo. */
  const tentarTodos = useCallback(async () => {
    if (ocupada.current) return;
    ocupada.current = true;
    try {
      for (const k of await guarda.chaves(CHAVES.fila)) {
        const g = await guarda.ler<Guardado>(k);
        if (g?.estado === 'esperando') await mandarUm(g);
      }
    } finally {
      ocupada.current = false;
      await recarregar();
    }
  }, [guarda, mandarUm, recarregar]);

  /**
   * O "Pronto": guarda no aparelho e tenta já. Se a fila estiver ocupada
   * mandando outro, este fica guardado e vai na próxima volta.
   */
  const mandar = useCallback(
    async (envio: Envio): Promise<Desfecho> => {
      const g: Guardado = { envio, guardadoEm: new Date().toISOString(), estado: 'esperando' };
      await guarda.gravar(CHAVES.fila + envio.chave, g);
      if (ocupada.current) {
        await recarregar();
        return { foi: false };
      }
      ocupada.current = true;
      try {
        return await mandarUm(g);
      } finally {
        ocupada.current = false;
        await recarregar();
      }
    },
    [guarda, mandarUm, recarregar],
  );

  /** Tira da fila um que o banco recusou, quando ele vai preencher de novo. */
  const esquecer = useCallback(
    async (chave: string) => {
      await guarda.apagar(CHAVES.fila + chave);
      await recarregar();
    },
    [guarda, recarregar],
  );

  // Ao abrir, quando a rede volta, quando o app volta à frente, e a cada 30 s.
  const esperando = guardados.some((g) => g.estado === 'esperando');
  useEffect(() => {
    void tentarTodos();
    const tentar = () => void tentarTodos();
    const aVista = () => document.visibilityState === 'visible' && tentar();
    window.addEventListener('online', tentar);
    document.addEventListener('visibilitychange', aVista);
    return () => {
      window.removeEventListener('online', tentar);
      document.removeEventListener('visibilitychange', aVista);
    };
  }, [tentarTodos]);
  useEffect(() => {
    if (!esperando) return;
    const t = setInterval(() => void tentarTodos(), TENTAR_DE_NOVO_MS);
    return () => clearInterval(t);
  }, [esperando, tentarTodos]);

  return { guardados, mandar, esquecer };
}
