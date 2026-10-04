/**
 * A tela Qualificação (CTO-D661, palavra do Pedro em 01/10/2026: "pode, vamos
 * ver se fica melhor"): a planilha FO 8.4.1.1 no sistema. Uma aba por
 * categoria, na ordem da planilha; uma linha por empresa, com a qualificação
 * que vale; as colunas da planilha, com a data para requalificar, a nota e a
 * situação já calculadas pelo banco.
 *
 * Não grava nada por conta própria: qualificar e requalificar abrem o mesmo
 * `QualificarDialogo` da ficha da empresa, e os dados são os mesmos
 * (`useQualificacoesDoDia`). A ficha e a gaveta continuam: esta tela só mostra
 * de outro jeito o que existe, e a pessoa acha a qualificação no menu, em vez
 * de cinco passos adentro de Fornecedores.
 *
 * Quem pode emitir OC qualifica (D605 §4); os outros só leem.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import { CampoPesquisavel } from '../../components/CampoPesquisavel/CampoPesquisavel';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import tabela from '../../components/DataTable/DataTable.module.css';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { ListToolbar, ToggleGroup } from '../../components/ListToolbar/ListToolbar';
import { agruparPorEmpresa, opcoesDeEmpresa } from '../../domain/fornecedores';
import { normalizarBusca, notaDaBusca, pelaNota } from '../../domain/pesquisa';
import {
  CATEGORIAS,
  dataBr,
  desempenhoDaFilial,
  historicoDaFilial,
  nomeDasEcrs,
  seloDaFilial,
  textoDoDesempenho,
  type Categoria,
} from '../../domain/qualificacao';
import { desempenhoCurto, linhasDaTela, type LinhaDaTela } from '../../domain/telaDaQualificacao';
import type { Fornecedor } from '../../domain/types';
import { podeEmitirOc } from '../../services/supabase/auth';
import type { CategoriaDaQualificacao, QualificacaoGravada } from '../../services/supabase/qualificacao';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useQualificacaoStore, useQualificacoesDoDia } from '../../stores/useQualificacaoStore';
import { useUiStore } from '../../stores/useUiStore';
import { depoisDeQualificar, pdfDosQualificados } from '../fornecedores/depoisDeQualificar';
import { FichaDaEmpresa } from '../fornecedores/FichaDaEmpresa';
import { FornecedorDrawer } from '../fornecedores/FornecedorDrawer';
import { QualificarDialogo } from '../fornecedores/QualificarDialogo';
import { SeloDaQualificacao } from '../fornecedores/SeloDaQualificacao';
import styles from './QualificacaoPage.module.css';

/** O nome da aba quando o banco não mandou a categoria (não deve acontecer; a aba não some por isso). */
const NOME_PADRAO: Record<Categoria, string> = {
  material: 'Materiais',
  servico: 'Serviço',
  controle_tecnologico: 'Controle tecnológico',
  projeto: 'Projetos',
  locacao: 'Locação',
};

type Filtro = 'todas' | 'pedem ação';

export function QualificacaoPage() {
  const data = useDataStore((s) => s.data);
  const dados = useQualificacoesDoDia();
  const erro = useQualificacaoStore((s) => s.erro);
  const perfil = useAuthStore((s) => s.perfil);
  const showToast = useUiStore((s) => s.showToast);

  const [aba, setAba] = useState<Categoria>('material');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [aberta, setAberta] = useState<string | null>(null);
  const [escolhendo, setEscolhendo] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [qualificando, setQualificando] = useState<Fornecedor | null>(null);
  const [ficha, setFicha] = useState<Fornecedor | null>(null);

  if (!data) return null;
  const podeQualificar = podeEmitirOc(perfil?.papel);

  const categoria = (c: Categoria): CategoriaDaQualificacao =>
    dados?.categorias.find((x) => x.categoria === c) ?? { categoria: c, nome: NOME_PADRAO[c], minimo: 0, criterios: [] };
  const atual = categoria(aba);
  const material = aba === 'material';
  const comTipo = aba !== 'controle_tecnologico';

  const todas = dados ? linhasDaTela(dados.linhas, aba, data.fornecedores) : [];
  const termo = normalizarBusca(busca);
  const casadas = todas.filter(
    (l) => (filtro === 'todas' || l.pedeAcao) && (!termo || normalizarBusca(`${l.nome} ${l.vale.tipo}`).includes(termo)),
  );
  // Com busca, a empresa que bate melhor pelo nome vem no alto; o que casou só
  // pelo tipo, depois. Na mesma nota fica a ordem da tela: o que pede ação primeiro (D680).
  const visiveis = termo ? pelaNota(casadas, (l) => notaDaBusca(busca, [l.nome])) : casadas;

  function desempenhoDe(l: LinhaDaTela) {
    if (!dados) return undefined;
    const sujeito = l.filial ?? { id: l.vale.fornecedorId ?? '', empresa_id: l.vale.empresaRaizId ?? undefined };
    return desempenhoDaFilial(sujeito, dados.desempenho);
  }

  async function gravou(r: QualificacaoGravada) {
    setQualificando(null);
    await depoisDeQualificar(atual, r, showToast);
  }

  /** O cadastro novo, de volta para qualificar (CTO-D661 §4.7). */
  function criado(id: string) {
    const f = useDataStore.getState().data?.fornecedores.find((x) => x.id === id);
    if (f) setQualificando(f);
    else showToast('O fornecedor foi criado, mas não apareceu na lista. Recarregue a página e qualifique de novo.', 'warning');
  }

  const colunas = 8 + (comTipo ? 1 : 0) + (material ? 1 : 0);

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Qualificação</h2>
          <p className="section-sub">
            As qualificações da FO 8.4.1.1, por categoria: uma linha por empresa, com a que vale.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void pdfDosQualificados(dados, data.fornecedores, showToast)}>
          <Icon name="file-text" size={13} /> PDF dos qualificados
        </Button>
      </div>

      <div className={styles.abas} role="tablist" aria-label="Categorias da FO 8.4.1.1">
        {CATEGORIAS.map((c) => {
          const linhas = dados ? linhasDaTela(dados.linhas, c, data.fornecedores) : [];
          const acao = linhas.filter((l) => l.pedeAcao).length;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={aba === c}
              data-aba={c}
              className={aba === c ? `${styles.aba} ${styles.abaAtiva}` : styles.aba}
              onClick={() => {
                setAba(c);
                setAberta(null);
              }}
            >
              {categoria(c).nome}
              <span className={styles.conta} title={`${linhas.length} ${linhas.length === 1 ? 'empresa' : 'empresas'}`}>
                {linhas.length}
              </span>
              {acao > 0 && (
                <span className={styles.pede} title={`${acao} ${acao === 1 ? 'pede' : 'pedem'} ação`}>
                  <Icon name="alerta" size={12} /> {acao}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!dados ? (
        <p className={styles.semCarga} role="alert">
          As qualificações não carregaram{erro ? ` (${erro})` : ''}. Recarregue a página para ver e qualificar.
        </p>
      ) : (
        <div role="tabpanel" data-categoria={aba}>
          <div className={styles.barra}>
            <ListToolbar searchValue={busca} searchPlaceholder="Buscar empresa ou tipo…" onSearchChange={setBusca}>
              <ToggleGroup options={['todas', 'pedem ação'] as const} value={filtro} onChange={setFiltro} />
            </ListToolbar>
            {podeQualificar && (
              <Button variant="primary" size="sm" onClick={() => setEscolhendo(true)}>
                + Qualificar fornecedor
              </Button>
            )}
          </div>
          {!podeQualificar && (
            <p className={styles.soLeitura} data-so-leitura="">
              Só quem emite OC qualifica. Aqui você vê as qualificações.
            </p>
          )}

          {visiveis.length === 0 ? (
            <EmptyState
              compacto
              title={todas.length === 0 ? `Nenhuma empresa qualificada em ${atual.nome}` : 'Nenhuma empresa nesta busca'}
              description={
                todas.length === 0
                  ? podeQualificar
                    ? 'Qualifique a primeira pelo "+ Qualificar fornecedor".'
                    : 'Quando alguém qualificar, ela aparece aqui.'
                  : 'Tente outra busca, ou mostre todas.'
              }
            />
          ) : (
            <div className={tabela.wrap}>
              <table className={`${tabela.table} ${styles.tabela}`} data-tabela-da-qualificacao="">
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    {comTipo && <th>Tipo</th>}
                    <th>Qualificada em</th>
                    <th>Requalificar em</th>
                    {[0, 1, 2].map((i) => (
                      <th key={i} className={styles.criterioTh} title={atual.criterios[i] ?? ''}>
                        <span className={styles.criterioTexto}>
                          {i + 1}. {atual.criterios[i] ?? `Critério ${i + 1}`}
                        </span>
                      </th>
                    ))}
                    <th>{comTipo ? 'Nota de desempenho' : 'Desempenho'}</th>
                    <th>Situação</th>
                    {material && <th>Permissão para compra</th>}
                  </tr>
                </thead>
                <tbody>
                  {visiveis.flatMap((l) => {
                    const v = l.vale;
                    const d = desempenhoDe(l);
                    const aberto = aberta === l.chave;
                    const alternar = () => setAberta(aberto ? null : l.chave);
                    const linha = (
                      <tr key={l.chave} data-linha={l.chave} data-situacao={v.situacao} className={styles.linha}>
                        {/* As ações moram embaixo do nome, que fica preso à esquerda: com a tabela
                            rolada para o lado, o "Requalificar" continua à vista. */}
                        <td className={styles.nome}>
                          {l.nome}
                          <div className={styles.acoesDaLinha}>
                            {l.filial && podeQualificar && (
                              <Button variant="outline" size="sm" onClick={() => setQualificando(l.filial)}>
                                Requalificar
                              </Button>
                            )}
                            {l.filial ? (
                              <Button variant="ghost" size="sm" onClick={() => setFicha(l.filial)}>
                                Histórico
                              </Button>
                            ) : (
                              <span className={styles.fora} title="Esta empresa não tem filial no cadastro da OC.">
                                fora do cadastro
                              </span>
                            )}
                          </div>
                        </td>
                        {comTipo && (
                          <td className={styles.tipo}>
                            {v.tipo || '—'}
                            {material && v.ecrs.length > 0 && <div className={styles.ecrs}>{nomeDasEcrs(v.ecrs)}</div>}
                          </td>
                        )}
                        <td className="mono">{dataBr(v.qualificadaEm)}</td>
                        <td className="mono">{dataBr(v.venceEm)}</td>
                        {[0, 1, 2].map((i) => {
                          const k = v.criterios[i];
                          return (
                            <td key={i}>
                              {k ? (
                                <button
                                  type="button"
                                  className={styles.marca}
                                  data-atende={k.atende || undefined}
                                  aria-expanded={aberto}
                                  title={`${atual.criterios[i] ?? `Critério ${i + 1}`}: ${k.atende ? 'atende' : 'não atende'}${k.motivo ? ` — ${k.motivo}` : ''}`}
                                  onClick={alternar}
                                >
                                  {k.atende ? 'Atende' : 'Não atende'}
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                        {/* A nota dos critérios, e embaixo as entregas dos últimos 12 meses: a prova do que se marcou. */}
                        <td className={styles.nota}>
                          {v.nota} de {v.criterios.length || 3}
                          <div className={styles.minimo}>mínimo {v.minimo}</div>
                          <div className={styles.entregas} title={textoDoDesempenho(d)} data-entregas="">
                            {desempenhoCurto(d)}
                          </div>
                        </td>
                        <td className={styles.situacao}>
                          <SeloDaQualificacao selo={{ situacao: v.situacao, qualificadaEm: v.qualificadaEm, venceEm: v.venceEm, ecrs: v.ecrs }} />
                        </td>
                        {material && (
                          <td>
                            <span className={styles.permissao} data-pode={l.podeComprar || undefined}>
                              {l.podeComprar ? 'Sim' : 'Não'}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                    if (!aberto) return [linha];
                    return [
                      linha,
                      <tr key={`${l.chave}-criterios`} className={styles.detalhe} data-criterios-de={l.chave}>
                        <td colSpan={colunas}>
                          <ol className={styles.criterios}>
                            {v.criterios.map((k, i) => (
                              <li key={i}>
                                <strong>{atual.criterios[i] ?? `Critério ${i + 1}`}</strong>: {k.atende ? 'atende' : 'não atende'}
                                {k.motivo && <> — {k.motivo}</>}
                              </li>
                            ))}
                          </ol>
                          <p className={styles.quem}>
                            {[v.qualificadoPorNome && `Qualificada por ${v.qualificadoPorNome}`, v.origem].filter(Boolean).join(' · ')}
                          </p>
                        </td>
                      </tr>,
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {escolhendo && (
        <EscolherFornecedor
          categoria={atual}
          fornecedores={data.fornecedores}
          aoEscolher={(f) => {
            setEscolhendo(false);
            setQualificando(f);
          }}
          aoCadastrar={() => {
            setEscolhendo(false);
            setCadastrando(true);
          }}
          aoVoltar={() => setEscolhendo(false)}
        />
      )}

      {cadastrando && (
        <FornecedorDrawer open fornecedor={null} onClose={() => setCadastrando(false)} aoCriar={criado} />
      )}

      {qualificando && dados && (
        <QualificarDialogo
          filial={qualificando}
          categoria={atual}
          ecrs={data.ecrs}
          ecrsMarcadas={material ? seloDaFilial(qualificando, dados.linhas).ecrs : []}
          desempenho={textoDoDesempenho(desempenhoDaFilial(qualificando, dados.desempenho))}
          titulo={`${historicoDaFilial(qualificando, dados.linhas, aba).length > 0 ? 'Requalificar' : 'Qualificar'} — ${atual.nome}`}
          aoGravar={gravou}
          aoVoltar={() => setQualificando(null)}
        />
      )}

      {ficha && <FichaDaEmpresa filial={ficha} aoFechar={() => setFicha(null)} />}
    </div>
  );
}

/**
 * O "+ Qualificar fornecedor": escolhe a empresa do cadastro, pela mesma busca
 * da Nova OC. Quem não está no cadastro é cadastrado sem sair da tela, e volta
 * para qualificar (CTO-D661 §4.7).
 */
function EscolherFornecedor({
  categoria, fornecedores, aoEscolher, aoCadastrar, aoVoltar,
}: {
  categoria: CategoriaDaQualificacao;
  fornecedores: Fornecedor[];
  aoEscolher: (f: Fornecedor) => void;
  aoCadastrar: () => void;
  aoVoltar: () => void;
}) {
  const [chave, setChave] = useState('');
  const empresas = agruparPorEmpresa(fornecedores.filter((f) => f.ativo));
  const escolhida = empresas.find((g) => g.chave === chave);

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="escolher-titulo">
      <div className={styles.escolher} data-escolher-fornecedor="">
        <h3 id="escolher-titulo" className={styles.escolherTitulo}>
          Qualificar fornecedor — {categoria.nome}
        </h3>
        <label className={styles.campo} htmlFor="qualificar-fornecedor">
          Fornecedor
        </label>
        <CampoPesquisavel
          id="qualificar-fornecedor"
          rotuloVazio="Digite o nome da empresa…"
          opcoes={opcoesDeEmpresa(empresas)}
          valor={chave}
          onEscolher={setChave}
        />
        <p className={styles.pista}>A qualificação é da empresa: vale para todas as filiais dela.</p>
        <p className={styles.pista}>
          Não está no cadastro?{' '}
          <button type="button" className={styles.link} onClick={aoCadastrar}>
            Cadastrar novo fornecedor
          </button>{' '}
          e voltar para qualificar.
        </p>
        <div className={styles.acoes}>
          <Button variant="outline" onClick={aoVoltar}>
            Voltar
          </Button>
          <Button
            variant="primary"
            disabled={!escolhida}
            onClick={() => {
              const f = escolhida?.filiais[0];
              if (f) aoEscolher(f);
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

