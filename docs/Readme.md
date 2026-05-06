# Central de Compras PBQP-H — Guia para Desenvolvedores

> Última atualização: 2026-05-06

## Visão geral

A **Central de Compras PBQP-H** é uma aplicação web (PWA instalável) usada pela Campisi Construtora para gerenciar todo o ciclo de **ordens de compra (OCs)** dentro do escopo do PBQP-H (Programa Brasileiro da Qualidade e Produtividade do Habitat). Ela cadastra fornecedores, obras e emitentes, permite criar OCs com itens vinculados a categorias do catálogo ECR (Especificação de Compras e Recebimento — 20 categorias normatizadas), gera o PDF da OC com layout fiel ao padrão da empresa, e importa pedidos do Sigescom (PDF ou imagem) usando IA visual (Claude Haiku via OpenRouter) para extrair itens automaticamente.

Toda a persistência é feita em um **único arquivo JSON** salvo via File System Access API — tipicamente em uma pasta no OneDrive — que serve como base compartilhada e é versionado com backups rotativos. Não há servidor: o app roda 100% no navegador, e os dados pertencem ao usuário. Isso simplifica a operação (sem login, sem banco) ao custo de não ter concorrência real (último a salvar vence; o app detecta e avisa, mas é o usuário que decide).

A versão atual (`2.0.0`) é uma reescrita em **React 19 + Vite + TypeScript + Zustand + Zod**, refatorada do código legado `legacy/CentralCompras-PBQPH.html` (single-file, ~2800 linhas). A UI e os fluxos foram preservados; o que mudou é a estrutura interna — modular, tipada, testável.

## Como rodar

### Pré-requisitos

- **Node.js** 20 LTS (há um `.nvmrc`).
- **pnpm** 9 (definido em `packageManager` do `package.json`).
- Navegador baseado em **Chromium** (Chrome, Edge, Brave) — File System Access API não funciona em Firefox/Safari.

### Comandos

```bash
pnpm install        # instala deps (lockfile commitado)
pnpm dev            # http://localhost:5173 com HMR
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest run (one-shot)
pnpm test:watch     # Vitest watch
pnpm lint           # ESLint
pnpm build          # tsc -b && vite build → dist/
pnpm preview        # serve dist/ localmente
```

### Variáveis de ambiente

- **`VITE_BASE_PATH`** — opcional. Sobrescreve o `base` em build (default `/central-compras-pbqph/` em qualquer `vite build`). Use `VITE_BASE_PATH=/` para hospedar na raiz de outro domínio.
- **OpenRouter API key** — *não* é variável de ambiente; é armazenada em `config.openrouter_api_key` dentro do JSON do usuário (configurada na aba "Configurações"). Trocar de modelo/conta é por lá. **Atenção:** chave fica em texto puro no JSON; trate o arquivo (e os backups rotativos) como dado sensível.

### URL de produção

`https://pedrocampisi.github.io/central-compras-pbqph/` — atualizada automaticamente pelo workflow `deploy.yml` a cada push em `main`.

## Mapa de arquivos

### Raiz e configuração

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Casca HTML; monta `<div id="root">` |
| `vite.config.ts` | Plugins (React, PWA), `base` condicional por env, `manualChunks` (pdf-libs, react-vendor, state-vendor) |
| `vitest.config.ts` | Configuração separada do Vitest (jsdom, setup) |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | strict, paths `@/* → src/*` |
| `start.bat` | Atalho desktop: abre URL de produção no navegador |
| `.github/workflows/ci.yml` | PR check (typecheck + test + build) |
| `.github/workflows/deploy.yml` | Push em main → build → upload Pages artifact → deploy |

### `src/`

| Pasta | Responsabilidade |
|---|---|
| `main.tsx` | Entry React; importa estilos na ordem (tokens → reset → animations → global) |
| `App.tsx` | Shell: sidebar + topbar + render condicional da aba ativa; bootstrap (cache → handle → seed); hooks transversais |
| `domain/` | Lógica pura (sem React/IO): types, constants, compute, normalize, format, slugify, id, schemas Zod, migrations |
| `services/` | I/O e integrações: storage (handles, fileSystem, backups, concurrency, cache, permissions), pdf, ai |
| `stores/` | Zustand: useDataStore, useOcEditingStore, useUiStore, useFileHandleStore |
| `hooks/` | useAutoSave (800ms debounce → cache), useDirtyGuard (beforeunload), useKeyboardShortcuts (Ctrl+S/N/Esc), useDebounce |
| `components/` | UI reutilizável: Button, Field, FieldGroup, DataTable, Drawer, Toast, ConfirmDialog, Pill, EmptyState, Stepper |
| `features/` | Páginas: dashboard, ordens-compra (NovaOc + Historico), fornecedores, obras, catalogo-ecr, configuracoes |
| `styles/` | tokens.css (~28 CSS vars), reset.css, animations.css, global.css |
| `types/` | Ambient types para File System Access API |

### `tests/`

| Arquivo | Cobertura |
|---|---|
| `tests/domain/compute.test.ts` | `computeItemTotal`, `computeOcTotals` (incluindo IPI sobre líquido, frete, descontos) |
| `tests/domain/migrations.test.ts` | v1→v2 (emitente legado), v2→v3 (campos ricos ECR), idempotência |
| `tests/domain/normalize.test.ts` | `normalizeData`, defaults, asArr/toNum |
| `tests/setup.ts` | jsdom + jest-dom matchers |
| `tests/fixtures/central-compras-data.legacy.json` | Snapshot real do JSON antigo p/ migration test |

### `public/`

| Arquivo | Uso |
|---|---|
| `seed-data.json` | Base inicial embutida (carregada se cache+handle falham) |
| `brazao1.png` / `brazao-nome.png` | Logo Campisi (header do PDF) |
| `icons/` | PWA icons 192/512/maskable |

## Guia por arquivo (foco em código)

### `src/domain/`

**`types.ts`** — Tipos canônicos (`Data`, `OrdemCompra`, `Item`, `Fornecedor`, `Obra`, `Ecr`, `Emitente`, `Config`, `Endereco`).

**`constants.ts`** — `STATUS_OC`, `STATUS_LABEL`, `UN_PADRAO` (12 unidades), `TIPOS_EMITENTE`, `CURRENT_SCHEMA_VERSION = 3`.

**`compute.ts`**
- `computeItemTotal(item)` → `{ liquido, ipi, total }`. **Atenção: IPI é aplicado sobre o líquido, não sobre o bruto.**
- `computeOcTotals(oc)` → `{ sub_total, desc_itens, total_ipi, total_geral }`. `total_geral = sub - desc + ipi + frete + outras - desc_material`.

**`normalize.ts`** — Funções `normalizeData`, `normalizeOC`, `normalizeItem`, `normalizeFornecedor`, `normalizeObra`, `normalizeEcr`, `normalizeEmitente`, `normalizeEndereco`. Helpers: `toNum` (aceita "1.234,56"), `asArr` (garante array). Nunca lança — sempre devolve estrutura válida com defaults.

**`format.ts`** — `formatBrl`, `formatDate`, `formatTimestamp`, `todayIso`, `nowIso`.

**`slugify.ts`** — Normaliza acentos, remove não-alfanuméricos, lowercase. Usado em nome de PDF.

**`id.ts`** — `uid(prefix='id')` → string `${prefix}-${ts36}-${rand6}`.

**`schemas/data.schema.ts`** — Zod schemas com `.default()` em todos campos (não-bloqueante).

**`migrations/`**
- `index.ts#runMigrations(raw)` lê `schema_version` e roda v1→v2 e/ou v2→v3.
- `v1-to-v2.ts` — Promove `config.emitente` (objeto) para `config.emitentes[]` (array com id `emit-legacy-01`).
- `v2-to-v3.ts` — Popula campos ricos do ECR (`objetivo`, `escopo`, `ensaios[]`, etc.) com defaults vazios.

### `src/services/`

**`storage/handles.ts`** — IndexedDB (`central-compras-db` / `handles`). `saveFileHandle`, `getFileHandle`, `saveHandleByKey`, `getHandleByKey`. Browser não permite handles em localStorage.

**`storage/permissions.ts`** — `verifyHandlePermission(handle, write)` faz query → request prompt se preciso.

**`storage/cache.ts`** — localStorage (`central-compras-cache-v1`). `loadCache`, `saveCache`, `loadUiPrefs`, `saveUiPrefs`, `clearCache`.

**`storage/backups.ts`** — `writeRotatingBackup(payloadJson)` grava `central-compras-data-{ISO}.json` na pasta escolhida; mantém 10 mais recentes (FIFO). Best-effort silencioso.

**`storage/concurrency.ts`** — `checkConcurrency(handle, knownSavedAt)` lê arquivo, compara `last_saved` ISO. Retorna `{conflict, remoteTs}`. Falha de leitura = sem conflito.

**`storage/fileSystem.ts`** — Pipeline central:
- `connectFile()` → `showOpenFilePicker` → persiste handle → load.
- `loadFromFileHandle(h)` → ler → migrate → normalize.
- `tryRestoreFileHandle()` → recupera do IndexedDB + verifica permission.
- `reloadFromHandle(h)` → re-load.
- `saveData({ data, fileHandle, sourceName, lastKnownSavedAt })` → check conflito → write → cache → backup.

**`pdf/generateOcPdf.ts`** — `generateOcPdfBlob(oc, data)` monta PDF A4 com jsPDF + autotable; layout idêntico ao legado. `savePdfToFile(blob, filename)` mostra `showSaveFilePicker` ou faz download.

**`pdf/pdfFilename.ts`** — `buildPdfFilename(oc, fornNome)` → `"{slug fornec} {YYYY-MM-DD} R{valor} oc.pdf"`.

**`ai/pdfToImages.ts`** — `fileToImagesBase64(file)`. Se imagem, lê direto. Se PDF, importa pdfjs-dist dinamicamente, renderiza até 5 páginas em `RENDER_SCALE = 1.6`, exporta JPEG `0.75`.

**`ai/openRouterClient.ts`** — `callOpenRouter(apiKey, messages)` → POST a `https://openrouter.ai/api/v1/chat/completions` com modelo `anthropic/claude-haiku-4.5`, temperature 0, max_tokens 4000.

**`ai/extractItems.ts`** — `extractItemsFromImages(imagesDataUrls, ecrs, apiKey)` constrói prompt PT-BR listando os ECRs disponíveis, envia imagens, parseia JSON da resposta, normaliza unidades via `UN_MAP`.

### `src/stores/`

**`useDataStore`** — `data`, `dirty`, `dirtySince`, `lastKnownSavedAt`. Actions: `setData`, `markDirty`, `clearDirty`, `updateOrdemCompra`, `removeOrdemCompra`, `upsertFornecedor`, `removeFornecedor`, `upsertObra`, `removeObra`, `updateConfig`. Toda mutação chama `markDirty` internamente.

**`useOcEditingStore`** — `ocEditing` (clone isolado da OC em edição). Actions: `startEditing`, `stopEditing`, `updateField`, `addItem`, `updateItem`, `removeItem`, `replaceItems`, `appendItems`. Commit no `useDataStore` é manual (handler do botão Salvar).

**`useUiStore`** — `activeTab`, filtros (`histFilter`, `fornFilter`, `obraFilter`, `catalogoFilter`), `toasts[]`. Actions: `setActiveTab`, `set*Filter`, `showToast(msg, tone?)`, `dismissToast`. **Roteamento é por essa store, não por react-router.**

**`useFileHandleStore`** — `fileHandle`, `sourceName`. Actions: `setFileHandle`, `clearFileHandle`.

### `src/hooks/`

**`useAutoSave`** — Watch `dirty`. Quando true, debounce 800ms → `saveCache(data, sourceName)`. **Não escreve no JSON.**

**`useDirtyGuard`** — Quando `dirty`, instala `beforeunload` listener; navegador pergunta "Tem certeza que quer sair?".

**`useKeyboardShortcuts`** — `Ctrl+S` / `Cmd+S` → save. `Ctrl+N` / `Cmd+N` → nova OC (não dispara em campos de texto). `Esc` → handler customizável.

### `src/features/`

**`dashboard/DashboardPage.tsx`** — Cards de KPI (total OCs, emitidas, rascunhos, volume, fornecedores ativos, obras ativas), últimas 8 OCs, top 5 fornecedores.

**`ordens-compra/NovaOcPage.tsx`** — Editor de OC. Form principal (fornecedor, obra, data, condição, emitente, observações), tabela de itens inline, painel de totais, botões: Adicionar Item, Importar Pedido (IA), Gerar PDF, Salvar Rascunho, Emitir, Cancelar. Inicialização guarda `initializedRef` (evita loop de bump de número ao re-render).

**`ordens-compra/HistoricoPage.tsx`** — Lista filtrável (search, status, fornecedor, obra). Ações por linha: Editar (rascunho), Duplicar, Regenerar PDF, Marcar Entregue, Cancelar, Excluir.

**`fornecedores/FornecedoresPage.tsx`** + **`FornecedorDrawer.tsx`** — CRUD com filtros (search + ativo/inativo). Drawer tem todos os campos: identificação, contato, endereço, ECRs que atende, observações.

**`obras/ObrasPage.tsx`** + **`ObraDrawer.tsx`** — CRUD. Drawer permite escolher pasta da obra via `showDirectoryPicker` (usado pelo PDF futuramente).

**`catalogo-ecr/CatalogoPage.tsx`** + **`EcrCard.tsx`** + **`MateriaisTable.tsx`** — Visualização e edição inline de materiais por ECR (objetivo, escopo, normas, documentos obrigatórios, critérios de recebimento, ensaios, materiais).

**`configuracoes/ConfigPage.tsx`** + **`EmitenteDrawer.tsx`** + **`EmitentesList.tsx`** + **`BackupsFolderPicker.tsx`** — Emitentes (lista + drawer PJ/PF), API key OpenRouter (input com show/hide), condições de pagamento (chips), textos customizáveis (envio NF, contratação, qualidade), endereço de cobrança, pasta de backups.

## Como adicionar funcionalidades comuns

### Adicionar campo na OC

1. Adicione em `src/domain/types.ts#OrdemCompra`.
2. Em `src/domain/normalize.ts#normalizeOC` adicione default seguro.
3. Em `src/domain/schemas/data.schema.ts` (se a entidade é validada) adicione com `.default()`.
4. Se for relevante para cálculo: ajuste `src/domain/compute.ts` + `tests/domain/compute.test.ts`.
5. UI: `src/features/ordens-compra/NovaOcPage.tsx` (form principal ou tabela de itens).
6. PDF: `src/services/pdf/generateOcPdf.ts` (se aparece no documento).

### Adicionar nova migração de schema

1. Crie `src/domain/migrations/v3-to-v4.ts` com função pura `(raw) => raw`.
2. Em `src/domain/migrations/index.ts` adicione `if (version < 4) data = migrateV3toV4(data);`.
3. Bumpe `CURRENT_SCHEMA_VERSION` em `src/domain/constants.ts` para 4.
4. Adicione caso em `tests/domain/migrations.test.ts` cobrindo subida v3→v4 e idempotência.

### Adicionar novo status de OC

1. Adicione em `src/domain/constants.ts#STATUS_OC` e `STATUS_LABEL`.
2. Estilize cor em `src/components/Pill/Pill.module.css`.
3. Em `src/features/ordens-compra/HistoricoPage.tsx` adicione transição (botão de ação) + filtro.
4. Considere migração se OCs antigas precisam mapear status legado.

### Adicionar nova unidade

1. `src/domain/constants.ts#UN_PADRAO` adiciona o código.
2. `src/services/ai/extractItems.ts#UN_MAP` adiciona variações que a IA pode escrever.

### Trocar modelo de IA

Edite `MODEL` em `src/services/ai/openRouterClient.ts`. Se trocar de família (ex: GPT-4o), revise `MAX_TOKENS` e o formato do prompt em `extractItems.ts`.

### Adicionar nova aba

1. Crie pasta `src/features/<nome>/<NomePage>.tsx`.
2. Adicione `<id>` em `src/stores/useUiStore.ts#TabId`.
3. Em `src/App.tsx`: adicione em `NAV_COMPRAS` ou `NAV_SISTEMA`, em `TAB_TITLES`, e no `switch` que renderiza a página ativa.

## Armadilhas conhecidas

- **PWA cache em produção** — após push, o Service Worker pode servir versão antiga. Sempre teste com `Ctrl+Shift+R` (hard reload) ou DevTools → Application → Service Workers → Update.
- **Build local com `base` errado** — antes precisava `GITHUB_ACTIONS=true`. Agora `vite.config.ts` deriva o `base` de `command === 'build'`, então `pnpm build` sempre gera `/central-compras-pbqph/`. Se você quiser subir para outro caminho, use `VITE_BASE_PATH=/seu-caminho/ pnpm build`.
- **File System Access API não funciona em `file://`** — abra o app via dev server, preview, ou produção HTTPS. Firefox e Safari não suportam (sem fallback gracioso).
- **Selectors do Zustand** — nunca retorne objeto/array novo direto: `useStore(s => [s.a, s.b])` cria nova referência a cada render, causando **loop infinito de re-render** (esse bug existiu até o commit `1757ae7`). Use seletores separados ou `useShallow`.
- **`fetch` de assets relativos ao base** — sempre use `${import.meta.env.BASE_URL}arquivo.json`, nunca `/arquivo.json` (em prod o base path quebra).
- **IPI é sobre o líquido** — não confunda com ERPs que aplicam IPI sobre o bruto. A ordem é: bruto → desconto → líquido → IPI sobre líquido → total = líquido + IPI.
- **Numeração concorrente** — não há lock de servidor. Duas abas geram o mesmo número durante a edição. Há mitigação local em `NovaOcPage#ensureUniqueNumero`: ao salvar/emitir, re-checa se o número da OC ainda está livre no array e reatribui `max+1` se necessário (avisa via toast). Conflitos cruzando dispositivos ainda podem ocorrer e só são detectados no save explícito do JSON.
- **OpenRouter key em texto puro no JSON** — o app é offline/local; o input em Configurações já bloqueia autocomplete e gerenciadores de senha (`autoComplete=off`, `data-lpignore`, `data-1p-ignore`). Trate o JSON e os backups como dados sensíveis.
- **Auto-save vai só para o localStorage** — `useAutoSave` (800ms debounce) **não escreve no JSON do OneDrive**. Persistência real exige Ctrl+S / botão Salvar.
- **Backups dependem de `dirHandle` no IndexedDB** — se o usuário não escolher pasta em Configurações, simplesmente não há backup. `ConfigPage` agora exibe um banner amarelo explícito acima do seletor enquanto a pasta não estiver definida.
- **PDF worker path** — `pdfjs-dist` é configurado para procurar worker em `/assets/pdfjs/pdf.worker.min.mjs`. Se você mudar `assetsDir` do Vite, quebra a importação de pedidos via IA.
- **`updateConfig` é merge shallow** — passar `config = { emitentes: [...] }` substitui o array inteiro; não merge profundo.
