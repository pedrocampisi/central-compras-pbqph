/**
 * As qualificações carregadas do banco (CTO-D604), fora do `Data` de
 * propósito: o `Data` é o formato das OCs, com esquema e migração de versão,
 * e a qualificação é do banco, sem arquivo antigo para ler.
 *
 * `dados === null` quer dizer "não se sabe": ainda não chegou, ou falhou. A
 * trava da emissão lê isso como "não deu para confirmar" e não deixa emitir
 * OC com ECR — falha fechada (perícia de 27/09, achado 5).
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import { linhasDoDia } from '../domain/qualificacao';
import { useHojeEmSaoPaulo } from '../hooks/useHojeEmSaoPaulo';
import type { DadosDaQualificacao } from '../services/supabase/qualificacao';

interface QualificacaoState {
  dados: DadosDaQualificacao | null;
  erro: string;
  definir: (dados: DadosDaQualificacao) => void;
  falhou: (erro: string) => void;
  esquecer: () => void;
}

export const useQualificacaoStore = create<QualificacaoState>((set) => ({
  dados: null,
  erro: '',
  definir: (dados) => set({ dados, erro: '' }),
  falhou: (erro) => set({ dados: null, erro }),
  esquecer: () => set({ dados: null, erro: '' }),
}));

/** As qualificações com a situação do dia `hoje` (perícia 28/09, B3). */
export function qualificacoesDoDia(dados: DadosDaQualificacao, hoje: string): DadosDaQualificacao {
  return { ...dados, linhas: linhasDoDia(dados.linhas, hoje) };
}

/** O que as telas leem: a loja, com a situação de hoje, redesenhada à meia-noite. */
export function useQualificacoesDoDia(): DadosDaQualificacao | null {
  const dados = useQualificacaoStore((s) => s.dados);
  const hoje = useHojeEmSaoPaulo();
  return useMemo(() => (dados ? qualificacoesDoDia(dados, hoje) : null), [dados, hoje]);
}
