# Prestadores de Serviço — Fase 2: Documentos & Alertas

## Status: ⏸️ Não implementado (roadmap)

## Contexto

A Fase 1 (MVP) entrega cadastro de prestadores e avaliação digital (3 critérios CONFORME/NÃO CONFORME do carimbo PBQP-H). Para auditoria PBQP-H Nível A completa, ainda faltam:

1. **Rastreamento de documentos obrigatórios** com data de validade — sem isso, um auditor pode perguntar "esse prestador tem ASO em dia?" e a resposta fica em pastas físicas.
2. **Indicadores objetivos** — quantos prestadores estão com performance ruim? Quais obras concentram não-conformidades?
3. **Alertas proativos** — documento vencendo, taxa de não-conformidade subindo.

## Escopo proposto

### 1. Documentos vinculados ao prestador

Adicionar à interface `PrestadorServico`:

```typescript
interface DocumentoPrestador {
  tipo: 'ASO' | 'NR18' | 'CONTRATO' | 'PES' | 'OUTRO';
  numero: string;            // número do documento (livre)
  emissao: string;           // ISO date
  validade: string;          // ISO date (vazio = sem validade)
  arquivo_path: string;      // path no OneDrive ou data URL
  observacao: string;
}

interface PrestadorServico {
  // ...campos da Fase 1...
  documentos: DocumentoPrestador[];
}
```

**Tipos de documento relevantes em obra:**
- **ASO** (Atestado de Saúde Ocupacional) — validade anual
- **NR-18** (Treinamento em Segurança em Obras de Construção) — validade 2 anos
- **Contrato** de prestação de serviço — período de vigência
- **PES** (Procedimento de Execução de Serviço) — versão atual aplicável

### 2. Anexar arquivos

Reusar o padrão de `FileSystemDirectoryHandle` já implementado em `src/services/storage/handles.ts` (mesmo usado para PDFs de OC). Cada documento pode apontar para um arquivo na pasta do prestador (ex: `OneDrive/Prestadores/<id>/aso-2026.pdf`).

Alternativa mais simples: salvar como base64 no próprio JSON (rápido, mas infla o arquivo).

### 3. Indicadores por prestador

Calcular em runtime (não persistir):

```typescript
interface IndicadoresPrestador {
  total_avaliacoes: number;
  taxa_conformidade_pct: number;     // CONFORMEs / total
  ultima_avaliacao: string | null;
  nao_conformidades_recentes: number;  // últimos 90 dias
  documentos_vencidos: DocumentoPrestador[];
  documentos_vencendo_30d: DocumentoPrestador[];
}
```

Mostrar na lista (`PrestadoresPage`) e no drawer do prestador.

### 4. Dashboard de não-conformidades

Adicionar widgets ao `Dashboard.tsx`:

- **"Prestadores em alerta"** — prestadores com >2 não-conformidades nos últimos 90 dias
- **"Documentos vencendo"** — documentos com validade < 30 dias
- **"Não-conformidades por obra"** — barra horizontal mostrando quantas NCs cada obra acumulou

### 5. Visualização do histórico

Dentro do drawer do prestador, adicionar uma timeline visual (ou tabela colorida) mostrando avaliações ao longo do tempo. Cores: verde = todas CONFORMEs, amarelo = pelo menos uma NC, vermelho = todas NCs.

## Mudanças técnicas

- **Schema migration v4 → v5**: adiciona `documentos: []` em cada prestador
- **Novo componente** `DocumentoUploadField` — reuso de input file + integração com handle storage
- **Componente** `ChartBar` simples para os widgets do Dashboard (sem dependência nova — SVG inline)
- **Hook** `usePrestadorIndicadores(prestador_id)` — calcula sob demanda

## Riscos / Considerações

- Anexos podem inflar o JSON; preferir referência a arquivo externo via FileSystemDirectoryHandle
- Sincronização cross-device do OneDrive Desktop tem delay — alertas podem ficar desatualizados em 1-2 min
- Cálculo de indicadores deve ser memoizado para listas com muitos prestadores

## Estimativa

~3-5 dias de implementação considerando a base da Fase 1 já pronta.
