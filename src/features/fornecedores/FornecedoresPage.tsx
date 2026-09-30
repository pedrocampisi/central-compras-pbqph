/**
 * Aba Fornecedores — a lista por EMPRESA, com as filiais dentro (CTO-D641), e o
 * drawer de cada filial. Portado de renderFornecedores / openFornecedorDrawer
 * (CentralCompras-PBQPH.html); desde 29/09/2026, a empresa uma vez.
 *
 * A palavra do Pedro, com a foto da busca: "aqui ainda está com as filiais".
 * A empresa entra numa linha, com o apelido, a razão social e o selo (a
 * qualificação é da empresa, D604). Ao clicar, as filiais abrem logo abaixo,
 * recuadas: cidade, CNPJ, contato, ativa e o "Editar" de cada uma. A empresa de
 * uma filial só fica num nível só (D523).
 */

import { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { FornecedorDrawer } from './FornecedorDrawer';
import { ListToolbar, ToggleGroup } from '../../components/ListToolbar/ListToolbar';
import { useQualificacoesDoDia } from '../../stores/useQualificacaoStore';
import { CATEGORIAS, linhasDoDia, seloDaFilial } from '../../domain/qualificacao';
import {
  ativoDaEmpresa,
  empresasDaTela,
  localDaFilial,
  razoesDistintas,
  resumoDaEmpresa,
  type EmpresaDaLista,
} from '../../domain/fornecedores';
import { formatarDocumento } from '../../domain/destinatario';
import { SeloDaQualificacao } from './SeloDaQualificacao';
import { secoesDosQualificados } from '../../domain/folhasDoAuditor';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import { baixarPdfDosQualificados } from '../../services/pdf/generateFolhasDoAuditor';
import { Icon } from '../../components/Icon/Icon';
import tabela from '../../components/DataTable/DataTable.module.css';
import styles from './FornecedoresPage.module.css';
import type { Fornecedor } from '../../domain/types';

/** O CNPJ com a pontuação: o banco guarda só os dígitos. Numa linha só: partido no hífen, ele se lê errado. */
function cnpjDe(f: Fornecedor) {
  if (!f.cnpj) return '—';
  return <span className={`doc ${styles.cnpj}`}>{formatarDocumento(f.cnpj, 'pj')}</span>;
}

function contatoDe(f: Fornecedor) {
  if (!f.email && !f.telefones[0]) return '—';
  return (
    <div>
      {f.email && <div className={styles.contato}>{f.email}</div>}
      {f.telefones[0] && <div className={styles.telefone}>{f.telefones[0]}</div>}
    </div>
  );
}

function ativoDaFilial(f: Fornecedor) {
  return <span className={f.ativo ? styles.ativo : styles.inativo}>{f.ativo ? '✓ Ativo' : '— Inativo'}</span>;
}

export function FornecedoresPage() {
  const data = useDataStore((s) => s.data);
  const qualificacoes = useQualificacoesDoDia();
  // Filtro no uiStore: persiste ao trocar de aba (mesmo padrão do Histórico).
  const { search, status: showAtivos } = useUiStore((s) => s.fornFilter);
  const setFornFilter = useUiStore((s) => s.setFornFilter);

  const showToast = useUiStore((s) => s.showToast);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  // O que a pessoa abriu ou fechou à mão, por empresa. Vale para a busca em
  // que foi feito: uma busca nova começa do jeito dela.
  const [abertas, setAbertas] = useState<{ busca: string; mapa: Record<string, boolean> }>({ busca: '', mapa: {} });

  if (!data) return null;

  const { empresas, total, casadas } = empresasDaTela(data.fornecedores, search, showAtivos);
  const filiaisNaTela = empresas.reduce((n, g) => n + g.filiais.length, 0);
  const mapa = abertas.busca === search ? abertas.mapa : {};
  // A busca que dá uma empresa só abre as filiais dela sozinha (D523).
  const sozinha = search.trim() !== '' && empresas.length === 1;
  const aberta = (g: EmpresaDaLista) => mapa[g.chave] ?? sozinha;
  const alternar = (g: EmpresaDaLista) =>
    setAbertas({ busca: search, mapa: { ...mapa, [g.chave]: !aberta(g) } });

  /** A folha do auditor (CTO-D604 §3.5): a FO 8.4.1.1 tirada do sistema, inteira. */
  async function pdfDosQualificados() {
    if (!qualificacoes || !data) {
      showToast('As qualificações não carregaram. Recarregue a página para gerar o PDF.', 'warning');
      return;
    }
    try {
      // A situação do dia do clique: a lista pode ter sido aberta ontem (B3).
      const hoje = hojeEmSaoPaulo();
      await baixarPdfDosQualificados(
        secoesDosQualificados(linhasDoDia(qualificacoes.linhas, hoje), qualificacoes.categorias, data.fornecedores),
        hoje,
      );
    } catch (err) {
      showToast(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  function openNew() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(f: Fornecedor) {
    setEditing(f);
    setDrawerOpen(true);
  }

  // Excluir fornecedor não existe nesta versão (a camada de dados não apaga
  // no banco). Para tirar um fornecedor de circulação, desative-o no drawer.

  /**
   * O selo da empresa. A qualificação é da empresa (D604): qualquer filial dá
   * o mesmo. Quem fornece material mostra o selo de material, o que a OC
   * confere. Quem só presta serviço mostra a primeira categoria em que tem
   * qualificação (serviço, laboratório, projeto, locação), com o nome dela;
   * sem nenhuma, "Serviços: Sem qualificação" (D613 §2). As cinco ficam na
   * ficha da empresa.
   */
  function seloDaEmpresa(g: EmpresaDaLista) {
    if (!qualificacoes) return <SeloDaQualificacao selo={null} />;
    const material = g.filiais.find((f) => f.fornece_material !== false || !f.presta_servico);
    if (material) return <SeloDaQualificacao selo={seloDaFilial(material, qualificacoes.linhas)} />;
    const f = g.filiais[0]!;
    const comQualificacao = CATEGORIAS.filter((c) => c !== 'material').find(
      (c) => seloDaFilial(f, qualificacoes.linhas, c).situacao !== 'sem_qualificacao',
    );
    const categoria = comQualificacao ?? 'servico';
    const nome = qualificacoes.categorias.find((c) => c.categoria === categoria)?.nome ?? 'Serviço';
    return <SeloDaQualificacao selo={seloDaFilial(f, qualificacoes.linhas, categoria)} rotulo={nome} />;
  }

  function ativoDe(g: EmpresaDaLista) {
    const a = ativoDaEmpresa(g);
    const classe = a.ativo === 'misto' ? styles.misto : a.ativo ? styles.ativo : styles.inativo;
    return <span className={classe}>{a.ativo === 'misto' ? a.texto : a.ativo ? '✓ Ativo' : '— Inativo'}</span>;
  }

  function nomeDaEmpresa(g: EmpresaDaLista) {
    const resumo = resumoDaEmpresa(g);
    return (
      <div>
        <div className={styles.nome}>{g.apelido}</div>
        {resumo && <div className={styles.resumo}>{resumo}</div>}
      </div>
    );
  }

  /** A empresa de uma filial só: um nível, como a linha de antes (D523). */
  function linhaDeUmaFilial(g: EmpresaDaLista) {
    const f = g.filiais[0]!;
    return (
      <tr key={g.chave} data-empresa={g.chave} onClick={() => openEdit(f)} style={{ cursor: 'pointer' }}>
        <td>
          <div className={styles.empresa}>
            <span className={styles.semSeta} />
            {nomeDaEmpresa(g)}
          </div>
        </td>
        <td>{cnpjDe(f)}</td>
        <td>{contatoDe(f)}</td>
        <td>{seloDaEmpresa(g)}</td>
        <td>{ativoDaFilial(f)}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className={tabela.rowActions}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>Editar</Button>
          </div>
        </td>
      </tr>
    );
  }

  /** A empresa de várias filiais: a linha dela abre e fecha; as filiais vêm logo abaixo. */
  function linhasDaEmpresa(g: EmpresaDaLista) {
    const aberto = aberta(g);
    const razoesDiferentes = razoesDistintas(g.filiais).length > 1;
    return [
      <tr key={g.chave} data-empresa={g.chave} onClick={() => alternar(g)} style={{ cursor: 'pointer' }}>
        <td colSpan={3}>
          <button
            type="button"
            className={styles.abrir}
            aria-expanded={aberto}
            aria-label={`${g.apelido}: ${aberto ? 'fechar' : 'abrir'} as ${g.filiais.length} filiais`}
            onClick={(e) => {
              e.stopPropagation();
              alternar(g);
            }}
          >
            <Icon name="chevron" size={16} className={aberto ? `${styles.seta} ${styles.setaAberta}` : styles.seta} />
            {nomeDaEmpresa(g)}
          </button>
        </td>
        <td>{seloDaEmpresa(g)}</td>
        <td>{ativoDe(g)}</td>
        <td />
      </tr>,
      ...(aberto
        ? g.filiais.map((f) => {
            const achada = casadas.has(f.id);
            return (
              <tr
                key={f.id}
                data-filial={f.id}
                data-achada={achada || undefined}
                className={achada ? `${styles.filial} ${styles.casou}` : styles.filial}
                onClick={() => openEdit(f)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className={styles.local}>
                    {localDaFilial(f, g.filiais)}
                    {achada && <span className={styles.achada}>achada pela busca</span>}
                  </div>
                  {razoesDiferentes && <div className={styles.razaoDaFilial}>{f.razao_social}</div>}
                </td>
                <td>{cnpjDe(f)}</td>
                <td>{contatoDe(f)}</td>
                <td />
                <td>{ativoDaFilial(f)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className={tabela.rowActions}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>Editar</Button>
                  </div>
                </td>
              </tr>
            );
          })
        : []),
    ];
  }

  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Fornecedores</h2>
          <p className="section-sub">
            {empresas.length} de {total} {total === 1 ? 'empresa' : 'empresas'} · {filiaisNaTela}{' '}
            {filiaisNaTela === 1 ? 'filial' : 'filiais'}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => void pdfDosQualificados()}>
            <Icon name="file-text" size={13} /> PDF dos qualificados
          </Button>
          <Button variant="primary" size="sm" onClick={openNew}>
            + Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ListToolbar
        searchValue={search}
        searchPlaceholder="Buscar por empresa, razão social, CNPJ, e-mail, cidade…"
        onSearchChange={(v) => setFornFilter({ search: v })}
      >
        <ToggleGroup
          options={['todos', 'ativos', 'inativos'] as const}
          value={showAtivos}
          onChange={(v) => setFornFilter({ status: v })}
        />
      </ListToolbar>

      {/* Tabela: uma linha por empresa */}
      {empresas.length === 0 ? (
        <EmptyState
          title="Nenhum fornecedor encontrado"
          description={
            data.fornecedores.length === 0
              ? 'Cadastre o primeiro fornecedor clicando em "+ Novo Fornecedor".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.fornecedores.length === 0
              ? { label: '+ Novo Fornecedor', onClick: openNew }
              : undefined
          }
        />
      ) : (
        <div className={tabela.wrap}>
          <table className={`${tabela.table} ${styles.tabela}`}>
            {/* As larguras fixas (CTO-D644): o cabeçalho não anda entre a lista,
                a busca e os filtros. A empresa fica com o resto. */}
            <colgroup>
              <col />
              <col className={styles.colCnpj} />
              <col className={styles.colContato} />
              <col className={styles.colQualificacao} />
              <col className={styles.colAtivo} />
              <col className={styles.colAcoes} />
            </colgroup>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>E-mail / Telefone</th>
                <th>Qualificação</th>
                <th>Ativo</th>
                <th className={tabela.actionsCol}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.flatMap((g) => (g.filiais.length === 1 ? [linhaDeUmaFilial(g)] : linhasDaEmpresa(g)))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer — montado só quando aberto, para reiniciar o form a cada abertura */}
      {drawerOpen && (
        <FornecedorDrawer
          open
          fornecedor={editing}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
