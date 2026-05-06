# Agente.md — Central de Compras PBQP-H

> Última atualização: 2026-05-06
> Público: IA de manutenção. Densidade máxima, zero prosa.

## 1. Stack e dependências

| Lib | Versão | Uso |
|---|---|---|
| `react` / `react-dom` | 19.2 | UI |
| `vite` | 8 | Build, HMR, base path conditional |
| `typescript` | 6 | strict |
| `zustand` | 5 | 4 stores (data, ocEditing, ui, fileHandle) |
| `zod` | 3 | Schemas em `domain/schemas/`, parse pós-migrations |
| `jspdf` 2.5 + `jspdf-autotable` 3.8 | — | `services/pdf/generateOcPdf.ts` |
| `pdfjs-dist` | 4 | OCR de pedidos importados (`services/ai/pdfToImages.ts`) |
| `openai` | 4 | Cliente HTTP genérico, apontando p/ OpenRouter |
| `vite-plugin-pwa` | 0.21 | Service worker + manifest |
| `vitest` + `@testing-library/react` + `jsdom` | — | Tests `tests/domain/*` |

(Nota: `react-router-dom` foi removido do `package.json` — roteamento é por `useUiStore.activeTab`.)

## 2. Grafo de dependências entre módulos

```
main.tsx → App.tsx
App.tsx → stores/{useDataStore,useUiStore,useFileHandleStore},
          services/storage/{cache,fileSystem},
          domain/{migrations,normalize},
          hooks/{useAutoSave,useDirtyGuard,useKeyboardShortcuts},
          components/{Toast,ConfirmDialog},
          features/*/

features/ordens-compra/NovaOcPage.tsx → stores/{useOcEditingStore,useDataStore,useUiStore},
                                        services/pdf/{generateOcPdf,pdfFilename},
                                        services/ai/{pdfToImages,extractItems},
                                        domain/{compute,id,format}

features/ordens-compra/HistoricoPage.tsx → stores/{useDataStore,useUiStore,useOcEditingStore},
                                           services/pdf/generateOcPdf,
                                           domain/compute

features/{fornecedores,obras,configuracoes}/* → useDataStore (CRUD via upsert/remove)

services/storage/fileSystem.ts → handles, permissions, concurrency, cache, backups
services/pdf/generateOcPdf.ts → domain/{compute,format,slugify}
services/ai/extractItems.ts → openRouterClient
services/ai/pdfToImages.ts → import dinâmico de pdfjs-dist (lazy chunk)

domain/migrations/index.ts → v1-to-v2 → v2-to-v3
domain/normalize.ts → types, constants
domain/compute.ts → types (puro, testável)
```

## 3. Contratos das funções públicas (assinaturas)

### `domain/compute.ts`
```ts
computeItemTotal(item: Item): { liquido: number; ipi: number; total: number }
// bruto = qtd*preco; liquido = bruto*(1-desc/100); ipi = liquido*(ipi/100); total = liquido+ipi
// ⚠ IPI APLICADO SOBRE O LÍQUIDO (após desconto), não sobre bruto

computeOcTotals(oc: OrdemCompra): {
  sub_total: number; desc_itens: number; total_ipi: number;
  total_geral: number; // sub - desc + ipi + frete + outras - desc_material
}
```

### `domain/migrations/index.ts`
```ts
runMigrations(raw: unknown): unknown
// Lê schema_version (default 1). Roda v1→v2 e/ou v2→v3 conforme.
// Não valida com Zod — apenas migra. Validação é em normalizeData.
```

### `domain/normalize.ts`
```ts
normalizeData(raw: unknown): Data       // Retorna Data garantido (defaults), sem throw
normalizeOC(raw: unknown): OrdemCompra
normalizeFornecedor / Obra / Ecr / Emitente / Item / Endereco
toNum(v): number   // Aceita "1.234,56" ou "1234.56" ou number → number
asArr(v): T[]      // Garante array, nunca undefined
```

### `services/storage/fileSystem.ts`
```ts
connectFile(): Promise<LoadResult|null>
// showOpenFilePicker → persiste handle no IndexedDB → load → migrate → normalize

loadFromFileHandle(h: FileSystemFileHandle): Promise<LoadResult>
// throws se inválido. App.tsx envolve em try/catch p/ fallback.

tryRestoreFileHandle(): Promise<FileSystemFileHandle|null>
// Lê handle do IndexedDB; verifica permission; retorna null se sem suporte/sem permissão.

reloadFromHandle(h): Promise<LoadResult>

saveData(args: { data, fileHandle, sourceName, lastKnownSavedAt }): Promise<SaveResult>
// SaveResult = { reason: 'ok'|'conflict'|'aborted'|'download', ... }
// 1. checkConcurrency (se há handle e lastKnownSavedAt)
// 2. clone + payload.last_saved = nowIso()
// 3. write via handle → fallback showSaveFilePicker → fallback download
// 4. saveCache + writeRotatingBackup (best-effort)
```

### `services/storage/concurrency.ts`
```ts
checkConcurrency(handle, knownSavedAt: string): Promise<{conflict, remoteTs}>
// Lê arquivo, compara remote.last_saved (ISO string) > knownSavedAt
// Falha de leitura = sem conflito (não bloqueia)
```

### `services/storage/cache.ts`
```ts
loadCache(): { data: Data; sourceName: string } | null
saveCache(data: Data, sourceName: string): void   // localStorage 'central-compras-cache-v1'
loadUiPrefs / saveUiPrefs                          // 'central-compras-ui-v1'
clearCache()
```

### `services/storage/handles.ts`
```ts
saveFileHandle(handle): Promise<void>     // IndexedDB 'central-compras-db' / 'handles' / key='shared-json'
getFileHandle(): Promise<FileSystemFileHandle|null>
saveHandleByKey(key, handle)              // p/ diretórios (backups)
getHandleByKey<T>(key): Promise<T|null>
```

### `services/storage/backups.ts`
```ts
writeRotatingBackup(payloadJson: string): Promise<void>
// Pega dirHandle pela key 'dir-backups'. Escreve central-compras-data-{ISO}.json.
// Mantém 10 mais recentes (FIFO). Silencia todos erros.
```

### `services/pdf/generateOcPdf.ts`
```ts
generateOcPdfBlob(oc: OrdemCompra, data: Data): Blob
savePdfToFile(blob: Blob, filename: string): Promise<void>
// helpers internos: drawBox, addrLine, safeStr
```

### `services/pdf/pdfFilename.ts`
```ts
buildPdfFilename(oc, fornNome): string
// "{slug fornecedor} {oc.data} R{valor com hífens} oc.pdf"
```

### `services/ai/`
```ts
// pdfToImages.ts
fileToImagesBase64(file: File): Promise<string[]>  // dataURLs JPEG
// limites: MAX_PDF_PAGES=5, RENDER_SCALE=1.6, JPEG_QUALITY=0.75

// openRouterClient.ts
callOpenRouter(apiKey, messages): Promise<string>
// MODEL='anthropic/claude-haiku-4.5', MAX_TOKENS=4000, temperature=0
// Headers: Authorization Bearer, HTTP-Referer=location.origin, X-Title

// extractItems.ts
extractItemsFromImages(imagesDataUrls, ecrs, apiKey): Promise<Item[]>
// Constrói prompt PT-BR com lista de ECRs; parseia JSON; aplica UN_MAP
```

### Stores (Zustand)
```ts
useDataStore(): {
  data: Data | null; dirty: boolean; dirtySince: number|null; lastKnownSavedAt: string;
  setData(data, lastSavedAt?); markDirty(); clearDirty(lastSavedAt?);
  updateOrdemCompra(oc); removeOrdemCompra(id);
  upsertFornecedor(f); removeFornecedor(id);
  upsertObra(o); removeObra(id);
  updateConfig(partial: Partial<Config>);  // merge shallow
}

useOcEditingStore(): {
  ocEditing: OrdemCompra | null;
  startEditing(oc); stopEditing();
  updateField(field, value); addItem(); updateItem(id, partial); removeItem(id);
  replaceItems(items); appendItems(items);
}

useUiStore(): {
  activeTab: TabId; histFilter; fornFilter; obraFilter; catalogoFilter;
  toasts: Toast[];
  setActiveTab; setHistFilter (etc); showToast(msg, tone?); dismissToast(id);
}

useFileHandleStore(): { fileHandle; sourceName; setFileHandle(h, name?); clearFileHandle() }
```

## 4. Constantes críticas

| Constante | Arquivo | Valor | Impacto se alterada |
|---|---|---|---|
| `CURRENT_SCHEMA_VERSION` | `domain/constants.ts` | 3 | Bump exige criar `vN-to-vN+1.ts` em `domain/migrations/` e registrar no `index.ts` |
| `DEBOUNCE_MS` | `hooks/useAutoSave.ts` | 800 | Auto-save mais rápido/lento; só toca cache, não JSON |
| `MAX_BACKUPS` | `services/storage/backups.ts` | 10 | Disco; FIFO |
| `MAX_PDF_PAGES` | `services/ai/pdfToImages.ts` | 5 | Páginas enviadas à IA; afeta tokens |
| `RENDER_SCALE` | idem | 1.6 | Qualidade vs custo de tokens |
| `JPEG_QUALITY` | idem | 0.75 | OCR vs tamanho |
| `MAX_TOKENS` | `services/ai/openRouterClient.ts` | 4000 | Truncamento de resposta |
| `MODEL` | idem | `anthropic/claude-haiku-4.5` | Custo, qualidade, disponibilidade |
| `OPENROUTER_URL` | idem | `https://openrouter.ai/api/v1/chat/completions` | — |
| `DB_NAME` / `STORE` / `FILE_KEY` | `services/storage/handles.ts` | `central-compras-db` / `handles` / `shared-json` | Mudar **invalida o handle persistido** — usuário tem que reconectar arquivo |
| `BACKUP_DIR_KEY` | `services/storage/backups.ts` | `dir-backups` | Mudar invalida pasta de backups |
| `CACHE_KEY` | `services/storage/cache.ts` | `central-compras-cache-v1` | Mudar perde cache |
| `STATUS_OC` | `domain/constants.ts` | `['rascunho','emitida','entregue','cancelada']` | Serialização — mudar exige migration |
| `UN_PADRAO` | idem | 12 unidades | UN_MAP em `extractItems.ts` mapeia variações p/ esses valores |
| `base` | `vite.config.ts` | `/central-compras-pbqph/` em qualquer build (`command === 'build'`), `/` em dev. Override por `VITE_BASE_PATH`. | Mudar nome do repo no GH exige atualizar (ou exportar `VITE_BASE_PATH`) |

## 5. Fluxo de dados (rastreio do `data`)

| Etapa | Onde nasce/muda | Observação |
|---|---|---|
| Boot (cache) | `App.tsx#useEffect` linha ~115 → `loadCache()` → `setData` | localStorage; pode estar stale |
| Boot (handle) | `tryRestoreFileHandle` → `loadFromFileHandle` → `runMigrations` → `normalizeData` → `setData` | source of truth se há handle |
| Boot (seed) | fetch `${import.meta.env.BASE_URL}seed-data.json` → mesmo pipeline | só se cache+handle falham |
| Mutação | qualquer action de `useDataStore` (`updateOrdemCompra`, `upsertFornecedor`, ...) | sempre faz `markDirty()` |
| Auto-save | `useAutoSave` 800ms debounce → `saveCache` | **só localStorage**, nunca JSON |
| Save explícito | `App.tsx#handleSave` → `saveData()` → `clearDirty()` + `setData(data, lastSavedAt)` | escreve JSON, salva cache, escreve backup rotativo |
| Conflito | `saveData` retorna `{reason:'conflict'}` → `conflictRef.current` + `forceRender()` → `<ConfirmDialog>` | usuário decide sobrescrever ou cancelar |
| Edição OC isolada | `useOcEditingStore.startEditing(oc)` faz `structuredClone` | commit em `useDataStore.updateOrdemCompra` |
| PDF | `generateOcPdfBlob(oc, data)` lê estado atual; usa `computeOcTotals` | `oc.pdf_gerado_em = nowIso()` ao gerar |

## 6. Regras de negócio implícitas

- **Numeração de OC:** `${ano}/${seq.padStart(3,'0')}`. Se `new Date().getFullYear() !== data.config.ano_corrente`, **reseta o sequencial para 1** e atualiza `ano_corrente`. Increment ocorre em `NovaOcPage` ao iniciar nova OC (não ao salvar). Sem lock real — `NovaOcPage#ensureUniqueNumero` re-checa colisão no momento do `Salvar Rascunho`/`Emitir` e reatribui `max(sequencial)+1` se necessário (mitigação parcial; conflitos cruzando dispositivos só são detectados no save explícito do JSON, não em tempo real).
- **Ordem de cálculo de item:** `bruto → desconto → líquido → IPI → total`. **IPI é sobre o líquido**, não sobre o bruto. ERPs comuns fazem outro caminho.
- **Total geral:** `Σ sub - Σ desc + Σ IPI + frete + outras_despesas - desconto_material`.
- **Hierarquia de emitente:** `oc.emitente_id` → `config.emitentes[0]` → `config.emitente` legado.
- **Conflito:** comparação ISO string (`"2026-05-06T..."`). Funciona porque ISO é lexicograficamente ordenável. Falha de leitura remota = não bloqueia (assume ok).
- **Auto-save vs save explícito:** auto-save **nunca** escreve no JSON, só localStorage. Para persistir no OneDrive precisa Ctrl+S.
- **Backups:** best-effort silencioso. Se a pasta não foi escolhida em Configurações, simplesmente não escreve.
- **Cache vs file:** ao reconectar, **handle vence cache**. Cache é pre-paint rápido.
- **`UN_MAP` em IA:** entrada da IA é tolerante (ex: "saco", "sac" → "sc"); itens manuais não são normalizados — depende do select.
- **Migração legacy:** `config.emitente` (objeto) é promovido a `config.emitentes[0]` em v1→v2 com id `emit-legacy-01`. v2→v3 popula campos ricos do ECR com defaults vazios.
- **Toast queue:** auto-dismiss em ~3.4s. FIFO.
- **`pdf_gerado_em`:** marcado a cada geração (não só primeira). Histórico mostra "Regenerar".

## 7. Pontos de extensão

| Mudança comum | Onde |
|---|---|
| Nova migração de schema | `domain/migrations/vN-to-vM.ts` + registrar no `index.ts` + bumpar `CURRENT_SCHEMA_VERSION` |
| Novo campo na OC | `domain/types.ts` + `domain/normalize.ts#normalizeOC` (default) + Zod schema + (opcional) UI em `NovaOcPage` |
| Novo status de OC | `domain/constants.ts#STATUS_OC` + `STATUS_LABEL` + `Pill` styles + ações no `HistoricoPage` |
| Novo cálculo no total | `domain/compute.ts#computeOcTotals` + `TotalsPanel` + PDF (`generateOcPdf.ts`) — três lugares |
| Nova unidade | `domain/constants.ts#UN_PADRAO` + `services/ai/extractItems.ts#UN_MAP` |
| Trocar modelo de IA | `services/ai/openRouterClient.ts#MODEL` (e revisar `MAX_TOKENS` se trocar família) |
| Mudar layout do PDF | `services/pdf/generateOcPdf.ts` (paridade visual com legado em `legacy/CentralCompras-PBQPH.html` linhas 1637-1830) |
| Nova feature/aba | criar `src/features/<nome>/` + adicionar em `App.tsx#NAV_*` + `TabId` em `useUiStore` + render condicional no shell |
| Mudar URL prod | `vite.config.ts#base` + `start.bat` (URL hardcoded) + `.github/workflows/deploy.yml` |
| Novo schema Zod | `domain/schemas/data.schema.ts` (sem throw — todos os campos têm `.default()`) |

## 8. Inconsistências conhecidas (avisos)

- ~~`react-router-dom` está em `package.json` mas **nunca é importado**.~~ **Resolvido:** removido do `package.json`. Roteamento continua via `useUiStore.activeTab`.
- Cálculos monetários usam `number` (IEEE 754) — possíveis erros de centavos em volumes grandes; sem `Decimal.js`.
- Sem mutex de servidor no save: duas abas/dispositivos salvando simultâneo podem perder dados (conflito é só pré-write check, não atomic CAS). Para a numeração específica de OCs há mitigação local em `NovaOcPage#ensureUniqueNumero` (re-checa antes de gravar e reatribui `max+1`).
- `verifyHandlePermission` falha → fallback silencioso para `showSaveFilePicker`. Pode confundir o usuário.
- PDF worker assume path `/assets/pdfjs/pdf.worker.min.mjs` no build; alterar `assetsDir` do Vite quebra OCR de PDFs importados.
- `OpenRouter API key` é gravada em texto puro em `config.openrouter_api_key` no JSON — input em `ConfigPage` já mascara (password) e desativa autocomplete/spellcheck/gerenciadores de senha; tratar arquivo (e backups) como sensível.
- ~~`DashboardPage.tsx` e `CatalogoPage.tsx` têm comentários `TODO Fase 7`.~~ **Resolvido:** comentários atualizados; implementações estavam completas.
- ~~Build local sem env `GITHUB_ACTIONS` gera `dist/` com base `/`.~~ **Resolvido:** `vite.config.ts` agora deriva o base de `command === 'build'` (qualquer build → `/central-compras-pbqph/`); override via `VITE_BASE_PATH=/`.
- Auto-save (`useAutoSave`, 800ms) **só grava no localStorage** — perceptível para o operador. Persistência no JSON só ocorre via Ctrl+S / botão Salvar.
- Backups: dependem de pasta escolhida em Configurações. Quando ausente, `ConfigPage` agora mostra um banner amarelo de aviso explícito acima do seletor.
