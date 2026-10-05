/**
 * Aba Histórico de OCs — filtros + ações: editar, duplicar, regerar PDF, excluir.
 * Portado de renderHistorico (CentralCompras-PBQPH.html).
 *
 * A coluna Pasta (CTO-D685): o ✓ de cada OC emitida cujo PDF está na pasta da
 * obra, com o link, e o botão de mandar de novo pelo servidor.
 */

import { useEffect, useMemo, useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useOcEditingStore } from '../../stores/useOcEditingStore';
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { podeEmitirOc } from '../../services/supabase/auth';
import { DataTable } from '../../components/DataTable/DataTable';
import { Pill } from '../../components/Pill/Pill';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { formatBrl, formatDate, nowIso, todayIso } from '../../domain/format';
import { computeOcTotals } from '../../domain/compute';
import { uid } from '../../domain/id';
import { generateOcPdfBlob, savePdfToFile } from '../../services/pdf/generateOcPdf';
import { buildPdfFilename } from '../../services/pdf/pdfFilename';
import { downloadBlob } from '../../services/storage/download';
import type { OrdemCompra } from '../../domain/types';
import type { Column } from '../../components/DataTable/DataTable';
import type { StatusOc } from '../../domain/constants';
import { marcarPdfGerado } from '../../services/supabase/dados';
import { mudarStatusDaOc } from './mudarStatusDaOc';
import { RegistrarEntregaDialogo } from './RegistrarEntregaDialogo';
import { lerAvaliacoesDeEntrega } from '../../services/supabase/qualificacao';
import { linhasDasAvaliacoes } from '../../domain/folhasDoAuditor';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import { baixarPdfDasAvaliacoes } from '../../services/pdf/generateFolhasDoAuditor';
import { obraDaMascara } from '../../services/storage/umaObra';
import { recarregarDados } from '../../services/supabase/sync';
import { ListToolbar, FilterSelect } from '../../components/ListToolbar/ListToolbar';
import { CampoPesquisavel } from '../../components/CampoPesquisavel/CampoPesquisavel';
import {
  agruparPorEmpresa, apelidoDoFornecedor, chaveDaEmpresa, opcoesDeEmpresa, opcoesDeObra,
} from '../../domain/fornecedores';
import { normalizarBusca, notaDaBusca, pelaNota } from '../../domain/pesquisa';
import { entregarPdfDaOc, lerPdfsNaPasta } from '../../services/supabase/pastaDaObra';
import type { AvaliacaoGravada } from '../../services/supabase/qualificacao';
import { lerLinksDasFotos } from '../../services/supabase/recebimento';
import { ultimaEntregaPorOc } from '../../domain/recebimento';
import { avisoDoPdf, linkSeguro, type PdfNaPasta } from '../../domain/pastaDaObra';

export function HistoricoPage() {
  const data = useDataStore((s) => s.data);

  const startEditing = useOcEditingStore((s) => s.startEditing);
  const startNova = useOcEditingStore((s) => s.startNova);

  // Espelho da permissão do banco: quem não pode gravar OC não deve ver botão
  // que só vai tomar erro do RLS depois do clique. A trava real é do banco.
  const perfil = useAuthStore((s) => s.perfil);
  const gravaOk = podeEmitirOc(perfil?.papel);
  const semPermissao = 'Seu acesso é somente leitura para ordens de compra';

  const histFilter = useUiStore((s) => s.histFilter);
  const setHistFilter = useUiStore((s) => s.setHistFilter);
  const setTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);
  /** A OC cuja entrega está sendo registrada (PS.02, CTO-D604 §3.2). */
  const [entregando, setEntregando] = useState<OrdemCompra | null>(null);
  /** O ✓ de cada OC (D685); `null` enquanto não leu, ou se a leitura falhou: aí a coluna não aparece. */
  const [naPasta, setNaPasta] = useState<Map<string, PdfNaPasta> | null>(null);
  /** A OC que está indo para a pasta agora: o botão dela espera. */
  const [mandando, setMandando] = useState<string | null>(null);

  // Relê o ✓ quando os dados mudam: outra pessoa pode ter emitido, ou mandado de novo.
  useEffect(() => {
    let vivo = true;
    void lerPdfsNaPasta().then((m) => {
      if (vivo) setNaPasta(m);
    });
    return () => {
      vivo = false;
    };
  }, [data]);

  /**
   * A última entrega de cada OC, e a foto da nota que o mestre tirou (CTO-D696
   * §5.2): debaixo do status, quem recebeu, quando, e se foi só uma parte.
   * Sem leitura, nada aparece — o Histórico não depende dela.
   */
  const [entregas, setEntregas] = useState<Map<string, AvaliacaoGravada>>(new Map());
  const [fotosDasEntregas, setFotosDasEntregas] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const ultimas = ultimaEntregaPorOc(await lerAvaliacoesDeEntrega());
        if (!vivo) return;
        setEntregas(ultimas);
        const fotos = await lerLinksDasFotos([...ultimas.values()].map((a) => a.fotoDocumentoId));
        if (vivo) setFotosDasEntregas(fotos);
      } catch {
        /* sem a linha do recebimento: o resto do Histórico segue */
      }
    })();
    return () => {
      vivo = false;
    };
  }, [data]);

  // ── Lookups e filtros (memoizados — busca deixa de ser O(n×m) por tecla) ──
  const fornecedorNome = useMemo(
    () => new Map((data?.fornecedores ?? []).map((f) => [f.id, f.razao_social])),
    [data],
  );
  // O filtro de fornecedor é por empresa: todas as filiais, a bloqueada também —
  // uma OC antiga pode ser dela (D542).
  const empresaDoFornecedor = useMemo(
    () => new Map((data?.fornecedores ?? []).map((f) => [f.id, chaveDaEmpresa(f)])),
    [data],
  );
  const fornecedorBusca = useMemo(
    () =>
      new Map(
        (data?.fornecedores ?? []).map((f) => [
          f.id,
          normalizarBusca([f.razao_social, f.nome_fantasia, f.empresa_apelido ?? ''].join(' ')),
        ]),
      ),
    [data],
  );
  const fornecedorApelido = useMemo(
    () => new Map((data?.fornecedores ?? []).map((f) => [f.id, apelidoDoFornecedor(f)])),
    [data],
  );
  const opcoesDeEmpresaDoFiltro = useMemo(
    () => opcoesDeEmpresa(agruparPorEmpresa(data?.fornecedores ?? [])),
    [data],
  );
  const obraNome = useMemo(
    () => new Map((data?.obras ?? []).map((o) => [o.id, o.nome])),
    [data],
  );

  const ocs = useMemo(() => {
    if (!data) return [];
    let list = [...data.ordens_compra].sort((a, b) => (b.criado_em > a.criado_em ? 1 : -1));
    if (histFilter.search) {
      // Pelo número, e pelo fornecedor como a pessoa o chama: razão social,
      // fantasia ou o apelido da empresa ("imperio" acha a Beija Flor, D542).
      const q = normalizarBusca(histFilter.search);
      list = list.filter(
        (o) =>
          o.numero.toLowerCase().includes(q) ||
          (fornecedorBusca.get(o.fornecedor_id) ?? '').includes(q),
      );
      // A que bate melhor pelo fornecedor (o apelido, ou a razão social que a
      // coluna mostra) ou pelo número no alto; a cancelada desce; na mesma nota,
      // a mais nova primeiro, como sempre (D680).
      list = pelaNota(
        list,
        (o) =>
          notaDaBusca(histFilter.search, [
            fornecedorApelido.get(o.fornecedor_id) ?? '',
            fornecedorNome.get(o.fornecedor_id) ?? '',
            o.numero,
          ]),
        (o) => o.status === 'cancelada',
      );
    }
    if (histFilter.status) list = list.filter((o) => o.status === histFilter.status);
    // Por EMPRESA (D542): escolher a Império traz as OCs de todas as filiais dela.
    if (histFilter.fornecedor) {
      list = list.filter((o) => empresaDoFornecedor.get(o.fornecedor_id) === histFilter.fornecedor);
    }
    if (histFilter.obra) list = list.filter((o) => o.obra_id === histFilter.obra);
    return list;
  }, [data, histFilter, fornecedorBusca, fornecedorApelido, fornecedorNome, empresaDoFornecedor]);

  if (!data) return null;

  // ── Ações ──────────────────────────────────────────────────────────────────

  function handleEdit(oc: OrdemCompra) {
    startEditing(oc);
    setTab('nova-oc');
  }

  function handleDuplicate(oc: OrdemCompra) {
    // Cópia nova: sem número (ele nasce na emissão), sem versão (ainda não
    // existe no banco) e sempre como rascunho.
    const duplicated: OrdemCompra = {
      ...structuredClone(oc),
      id: uid('oc'),
      numero: '',
      sequencial: 0,
      ano: Number(todayIso().slice(0, 4)),
      status: 'rascunho',
      data: todayIso(),
      criado_em: nowIso(),
      atualizado_em: nowIso(),
      pdf_gerado_em: '',
      versao: 0,
    };
    // A cópia é OC que nasce agora: a entrega prevista no dia seguinte (CTO-D728 §2).
    startNova(duplicated);
    setTab('nova-oc');
  }

  async function handleRegenPdf(oc: OrdemCompra) {
    try {
      const blob = await generateOcPdfBlob(oc, data!);
      const fornNome = apelidoDoFornecedor(data!.fornecedores.find((f) => f.id === oc.fornecedor_id));
      const filename = buildPdfFilename(oc, fornNome);
      await savePdfToFile(blob, filename);
      // Comando estreito: carimba a data e não toca em mais nada. Antes isto
      // passava pela gravação inteira da OC, que apagava e regravava todos os
      // itens só para anotar uma data.
      // Quem é somente-leitura leva o PDF do mesmo jeito (é consulta, não edição),
      // mas não tenta gravar: o banco recusaria e a tela mostraria um erro à toa.
      if (gravaOk) {
        await marcarPdfGerado(oc.id);
        await recarregarDados();
      }
      showToast('PDF regenerado.', 'success');
    } catch (err) {
      showToast(`Erro ao gerar PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  /**
   * Manda o PDF para a pasta da obra pelo servidor (D685 §3.4). Ele substitui
   * o arquivo que a casa gravou, e nunca cria cópia. Se falhar, o caminho de
   * hoje, como na emissão.
   */
  async function handleMandarParaAPasta(oc: OrdemCompra) {
    setMandando(oc.id);
    try {
      const blob = await generateOcPdfBlob(oc, data!);
      const fornNome = apelidoDoFornecedor(data!.fornecedores.find((f) => f.id === oc.fornecedor_id));
      const { resposta, caminho } = await entregarPdfDaOc(oc, blob, buildPdfFilename(oc, fornNome));
      const aviso = avisoDoPdf(oc.numero, resposta, caminho, 'mandar');
      showToast(aviso.texto, aviso.tom);
      setNaPasta(await lerPdfsNaPasta());
    } catch (err) {
      showToast(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    } finally {
      setMandando(null);
    }
  }

  async function handleStatusChange(oc: OrdemCompra, status: StatusOc) {
    await mudarStatusDaOc(oc, status, data!.fornecedores, showToast);
  }

  /**
   * A folha do auditor das entregas (CTO-D604 §3.5): todas as avaliações, ou
   * só as da obra da máscara da D599 — a leitura já filtra. O título e as
   * linhas vêm do mesmo retrato da máscara: se ela virou durante a leitura, o
   * PDF não sai misturado (perícia 28/09, B2).
   */
  async function handlePdfDasAvaliacoes() {
    try {
      const mascara = obraDaMascara();
      const avaliacoes = await lerAvaliacoesDeEntrega(mascara);
      if (obraDaMascara() !== mascara) {
        showToast('A opção "mostrar só uma obra" ligou ou desligou enquanto o PDF era preparado. Gere o PDF de novo.', 'warning');
        return;
      }
      await baixarPdfDasAvaliacoes(
        linhasDasAvaliacoes(avaliacoes, data!.ordens_compra, data!.fornecedores, data!.obras),
        mascara ? (obraNome.get(mascara) ?? 'Obra da auditoria') : null,
        hojeEmSaoPaulo(),
      );
    } catch (err) {
      showToast(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  /** Exporta as OCs visíveis (com filtros aplicados) em CSV compatível com Excel pt-BR. */
  function handleExportCsv() {
    const header = ['Número', 'Data', 'Fornecedor', 'Obra', 'Status', 'Qtd. Itens', 'Total (R$)'];
    const rows = ocs.map((o) => [
      o.numero,
      formatDate(o.data),
      fornecedorNome.get(o.fornecedor_id) ?? '',
      obraNome.get(o.obra_id) ?? '',
      o.status,
      String(o.itens.length),
      computeOcTotals(o).total_geral.toFixed(2).replace('.', ','),
    ]);
    const escape = (c: string) => `"${c.replace(/"/g, '""')}"`;
    // BOM + separador ';' → abre direto no Excel brasileiro com acentos corretos.
    const csv = '\ufeff' + [header, ...rows].map((r) => r.map(escape).join(';')).join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `historico-ocs-${todayIso()}.csv`);
    showToast(`${ocs.length} OC(s) exportada(s) para CSV.`, 'success');
  }

  // Excluir OC não existe nesta versão (a camada de dados não apaga no banco,
  // e o número da OC precisa continuar ocupado). Use "Cancelar" para
  // invalidar uma OC — ela permanece no histórico, como manda o PBQP-H.

  /** O ✓ (D685): com o link para abrir o PDF na pasta; "Não está" só quando o ✓ foi lido. */
  function seloDaPasta(o: OrdemCompra) {
    if (!naPasta) return null;
    const p = naPasta.get(o.id);
    if (!p) return <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>Não está</span>;
    const link = linkSeguro(p.webUrl);
    const rotulo = (
      <>
        <Icon name="check" size={13} /> Na pasta
      </>
    );
    return link ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        title={`Abrir "${p.nome}" na pasta da obra`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        {rotulo}
      </a>
    ) : (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: 12, whiteSpace: 'nowrap' }}>
        {rotulo}
      </span>
    );
  }

  /** A última entrega: o dia, quem recebeu, "só uma parte" e a foto da nota. */
  function recebimentoDaOc(o: OrdemCompra) {
    const a = entregas.get(o.id);
    if (!a) return null;
    const foto = linkSeguro(fotosDasEntregas.get(a.fotoDocumentoId) ?? '');
    return (
      <div data-recebimento-da-oc style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>
          Recebido {formatDate(a.recebidoEm)}
          {a.avaliadoPorNome ? ` · ${a.avaliadoPorNome}` : ''}
        </span>
        {!a.chegouTudo && (
          <span style={{ color: 'var(--aviso)', fontWeight: 600 }}>Só uma parte: espera o resto</span>
        )}
        {foto && (
          <a href={foto} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
            Foto da nota
          </a>
        )}
      </div>
    );
  }

  /**
   * Debaixo do status, nas OCs emitidas (D685): o ✓ com o link e o botão de
   * mandar. Fica na coluna Status e não numa coluna própria: com mais uma
   * coluna a tabela não cabia mais a 1366, e as Ações rolavam para fora.
   */
  function pastaDaOc(o: OrdemCompra) {
    if (o.status !== 'emitida' && o.status !== 'entregue') return null;
    const selo = seloDaPasta(o);
    if (!selo && !gravaOk) return null;
    return (
      <div data-pasta-da-oc style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginTop: 6 }}>
        {selo}
        {/* Só quem emite OC manda para a pasta: é o papel que a função exige (D682 §2). */}
        {gravaOk && (
          <Button
            variant="ghost"
            size="sm"
            loading={mandando === o.id}
            disabled={mandando !== null && mandando !== o.id}
            title={
              naPasta?.has(o.id)
                ? 'Manda o PDF de novo para a pasta da obra: troca o arquivo que está lá, sem fazer cópia'
                : 'Manda o PDF para a pasta da obra'
            }
            onClick={() => void handleMandarParaAPasta(o)}
          >
            {naPasta?.has(o.id) ? 'Reenviar' : 'Enviar'}
          </Button>
        )}
      </div>
    );
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: Column<OrdemCompra>[] = [
    {
      key: 'numero',
      label: 'Número',
      render: (o) =>
        o.numero ? (
          <strong className="doc">{o.numero}</strong>
        ) : (
          <span style={{ color: 'var(--texto-muted)', fontSize: 12 }}>(numera ao emitir)</span>
        ),
    },
    { key: 'data', label: 'Data', render: (o) => formatDate(o.data) },
    {
      key: 'fornecedor',
      label: 'Fornecedor',
      render: (o) => fornecedorNome.get(o.fornecedor_id) || '—',
    },
    {
      key: 'obra',
      label: 'Obra',
      render: (o) => obraNome.get(o.obra_id) || '—',
    },
    {
      key: 'itens',
      label: 'Itens',
      render: (o) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.itens.length}</span>,
    },
    {
      key: 'total',
      label: 'Total',
      render: (o) => (
        <strong style={{ color: 'var(--navy)', fontFamily: 'inherit' }}>
          {formatBrl(computeOcTotals(o).total_geral)}
        </strong>
      ),
      align: 'right',
    },
    {
      key: 'status',
      label: 'Status',
      render: (o) => (
        <>
          <Pill status={o.status} />
          {recebimentoDaOc(o)}
          {pastaDaOc(o)}
        </>
      ),
    },
  ];
  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Histórico de OCs</h2>
          <p className="section-sub">
            {ocs.length} de {data.ordens_compra.length} registro(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={ocs.length === 0}>
            <Icon name="download" size={13} /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handlePdfDasAvaliacoes()}>
            <Icon name="file-text" size={13} /> PDF das avaliações
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setTab('nova-oc')}
            disabled={!gravaOk}
            title={gravaOk ? undefined : semPermissao}
          >
            + Nova OC
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ListToolbar
        searchValue={histFilter.search}
        searchPlaceholder="Buscar por número, fornecedor…"
        onSearchChange={(v) => setHistFilter({ search: v })}
      >
        <FilterSelect
          value={histFilter.status}
          onChange={(e) => setHistFilter({ status: e.target.value as StatusOc | '' })}
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="emitida">Emitida</option>
          <option value="entregue">Entregue</option>
          <option value="cancelada">Cancelada</option>
        </FilterSelect>
        {/* Fornecedor e Obra aceitam texto (CTO-D541); o status continua lista. */}
        <CampoPesquisavel
          variante="filtro"
          ariaLabel="Filtrar por fornecedor"
          rotuloVazio="Todos fornecedores"
          opcoes={opcoesDeEmpresaDoFiltro}
          valor={histFilter.fornecedor}
          onEscolher={(v) => setHistFilter({ fornecedor: v })}
        />
        <CampoPesquisavel
          variante="filtro"
          ariaLabel="Filtrar por obra"
          rotuloVazio="Todas obras"
          opcoes={opcoesDeObra(data.obras)}
          valor={histFilter.obra}
          onEscolher={(v) => setHistFilter({ obra: v })}
        />
      </ListToolbar>

      {/* Tabela */}
      {ocs.length === 0 ? (
        <EmptyState
          title="Nenhuma OC encontrada"
          description={
            data.ordens_compra.length === 0
              ? 'Crie a primeira OC clicando em "+ Nova OC".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.ordens_compra.length === 0 && gravaOk
              ? { label: '+ Nova OC', onClick: () => setTab('nova-oc') }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={ocs}
          rowKey={(o) => o.id}
          emptyTitle="Nenhuma OC encontrada"
          rowActions={(o) => (
            <div style={{ display: 'flex', gap: 4 }}>
              {o.status === 'rascunho' && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => handleEdit(o)}>Editar</Button>
              )}
              {gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(o)}>Duplicar</Button>
              )}
              {o.status !== 'rascunho' && (
                <Button variant="ghost" size="sm" onClick={() => void handleRegenPdf(o)}>PDF</Button>
              )}
              {/* A entrega se registra com a avaliação do recebimento: a OC
                  não vai a entregue sem ela (CTO-D604 §3.2). A já entregue
                  aceita outra entrega — a parcial. */}
              {(o.status === 'emitida' || o.status === 'entregue') && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => setEntregando(o)}>
                  {o.status === 'emitida' ? 'Entregue' : 'Outra entrega'}
                </Button>
              )}
              {o.status !== 'cancelada' && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => void handleStatusChange(o, 'cancelada')}>
                  Cancelar
                </Button>
              )}
            </div>
          )}
        />
      )}

      {entregando && (
        <RegistrarEntregaDialogo
          oc={entregando}
          fornecedor={fornecedorNome.get(entregando.fornecedor_id) ?? ''}
          obra={obraNome.get(entregando.obra_id) ?? ''}
          aoFechar={() => setEntregando(null)}
        />
      )}
    </div>
  );
}
