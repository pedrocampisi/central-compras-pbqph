# Agente.md — Central de Compras PBQP-H

> **Data:** 02/09/2026
> **Estado:** VALE HOJE
> **Escopo:** arquitetura, contratos e constantes das duas branches, com a **seção 0** vencendo sobre o resto. **NÃO** guarda o *motivo* das decisões — isso é `PLANEJAMENTO.md`.

> Público: IA de manutenção. Densidade máxima, zero prosa.

## 0. Duas branches, dois contratos — leia antes de usar este arquivo

As seções 1–8 descrevem a arquitetura **da branch `main`** (JSON via File
System Access API, sem login). Na branch `migracao-supabase` valem estas
diferenças; onde houver conflito, o que está aqui na seção 0 vence:

| Assunto | `main` | `migracao-supabase` |
|---|---|---|
| Fonte da verdade | `services/storage/fileSystem.ts` | `services/supabase/dados.ts` (`carregarDados`, `salvarOrdemCompra`, `definirStatusOc`, `marcarPdfGerado`, `salvarFornecedor`) |
| Auth | inexistente | `services/supabase/auth.ts` — `perfilAtual()`, `podeEditar()`, `podeEmitirOc()`; espelho do RLS, não a trava |
| Bootstrap | cache → handle → seed | sessão → `perfilAtual` → `recarregarDados` → realtime (`assinarMudancas`) |
| Persistência | Ctrl+S → `saveData` | cada ação grava direto; `useAutoSave`/`useDirtyGuard` **não montados** |
| Numeração OC | `config.ultimo_numero_oc` no navegador | do banco, e **só na emissão** — dentro de `salvar_oc` / `definir_status_oc`. Rascunho fica sem número |
| IA | `services/ai/openRouterClient.ts` (chave no JSON) | Edge Function `extrair-itens` (chave no servidor); `openRouterClient.ts` não existe |
| Env | — | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client.ts lança sem elas) |
| Stores | +`useFileHandleStore` | +`useAuthStore`; `useDataStore.data` é populado só a partir do banco |
| Schema version | 4 | 5 — `CURRENT_SCHEMA_VERSION` é a única fonte (Zod e `dados.ts` importam) |

Telas deliberadamente somente-leitura na branch de migração (a camada não
grava): obras, prestadores, avaliações e configurações. Padrão:
`<AvisoSomenteLeitura>` + campos `disabled`. Regra que originou isso: a tela
não pode dizer "salvo" e perder no reload. *(Os ECRs do fornecedor saíram desta
lista em 19/08: ganharam tabela no banco e voltaram a ser editáveis.)*

## 0.1 Padrão visual (direção "Creme") — regras que valem para todo CSS daqui

Fonte oficial: `00_Diretrizes_e_padroes/Padrao_Front_end/` (`DESIGN.md`,
`tokens.css`, `template-base.html`, `template-login.html`). Aplicado aqui em
12/08/2026. **O motivo de cada regra está nas decisões 14, 15 e 16 do
[`PLANEJAMENTO.md`](PLANEJAMENTO.md)** — aqui fica só a regra.

- `src/styles/tokens.css` é a **única fonte de cor/sombra/raio/fonte**. Nada de
  hex solto em módulo — o bloco de apelidos no fim traduz os nomes antigos
  (`--navy`, `--bg`, `--text`…) para os novos; em código novo use os oficiais
  (`--marca`, `--fundo`, `--texto`, `--acento`…). · **decisão 14**
- Tema escuro: `data-tema="escuro"` no `<html>`, por script inline no
  `index.html` **antes da primeira pintura**; `hooks/useTema.ts` só lê e
  alterna. Escolha manual manda e fica salva; sem escolha, segue o sistema.
  · **decisão 14**
- **Uma ação primária (laranja) por tela.** `<Button variant="primary">` é o
  laranja; qualquer segundo botão é `outline`. Em Nova OC o laranja é o
  "Emitir OC" do rodapé — o atalho do topo é secundário. · **decisão 15**
- **Ícone é `<Icon>` (traço 1.6), nunca emoji.** · **decisão 15**
- Selo (`<Pill>`) é **neutro por padrão**; verde/vermelho só quando a
  informação for mesmo situação. · **decisão 15**
- **Mascote longe de dado.** `<EmptyState>` mostra o mascote quando o vazio é a
  tela; dentro de cartão que convive com números, use `compacto`.
  · **decisão 15**
- **Movimento só em espera e no login.** `<Loader>` (martelo) é o único
  permitido nas telas de trabalho, e só aparece depois de 250ms. · **decisão 16**
- **Sem portão de boas-vindas e sem animação de entrada neste aplicativo.** Por
  isso `public/marca/` não tem `anim-entrada.mp4`, `anim-poster-final.png` nem
  `efeito-entrada.mp3` — a fonte deles, se um dia precisar, é
  `00_Diretrizes_e_padroes/Padrao_Front_end/assets/`. E os quadros do martelo
  ficam **fora do pré-carregamento** do service worker (`globIgnores` no
  `vite.config.ts`). · **decisão 16**
- Documentos, códigos e chaves em `var(--fonte-mono)`; números de tabela em
  `font-variant-numeric: tabular-nums`.

## 0.2 Contrato de gravação da OC — leia antes de mexer em `salvarOrdemCompra`

Vigente desde 18–19/08/2026. Quem manda é o banco; o cliente só obedece.
**Por que o contrato tem esta forma: decisão 17 do
[`PLANEJAMENTO.md`](PLANEJAMENTO.md)** — aqui fica só o contrato.

```
compras.salvar_oc(p jsonb) → a linha inteira de compras.ordens_compra
compras.definir_status_oc(p_oc_id uuid, p_status compras.status_oc, p_versao integer) → a linha
compras.marcar_pdf_gerado(p_oc_id uuid) → timestamptz
```

- **Uma chamada, uma transação.** Cabeçalho e itens juntos. Não volte a gravar
  cabeçalho e itens em requisições separadas.
- **`request_id` é obrigatório** e é a identidade da TENTATIVA, não da OC.
  Repetido, devolve a mesma OC. Gere um por tentativa e **reaproveite no
  retry** — em `NovaOcPage` isso é o `tentativaRef`, descartado só quando a
  gravação dá certo.
- **`versao` é obrigatória ao atualizar.** Conflito volta como
  `serialization_failure` (código `40001`), que a camada converte em
  `ConflitoDeVersao` — a mensagem do banco já está pronta para a tela, não
  reescreva.
- **Os três casos de cada campo do `cabecalho`:** chave ausente = não mexe;
  chave com valor = grava; **chave com `null` = APAGA**. Exceções declaradas,
  que continuam em `coalesce` (null mantém): `data`, `status`, `frete`,
  `outras_despesas`, `desconto_material`.
- **`itens` ausente ≠ `itens: []`.** Ausente não mexe nos itens; lista vazia
  apaga todos. A tela edita a lista inteira, então manda sempre.
- **Status e PDF têm comando estreito.** Trocar status não regrava itens;
  `marcar_pdf_gerado` não mexe na versão e é chamado **depois** de o arquivo
  existir.

Dívida conhecida: `docs/Arquivo_Morto/PERICIA-BANCO-DE-DADOS-SUPABASE-2026-08-10.md`. O
P0-01 (gravação não-transacional) foi fechado em 18–19/08. Segue aberto o
P0-02 (CI que reconstrói o banco e testes de RLS), que é trabalho do
`campisi-central`.

⚠️ **Nada disso foi provado na tela ainda:** ninguém emitiu OC por este
aplicativo depois da troca. O contrato foi conferido campo a campo por leitura
no banco, o que é outra coisa.

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
// Lê schema_version (default 1). Roda em ordem tudo que faltar até v5.
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
| `CURRENT_SCHEMA_VERSION` | `domain/constants.ts` | 5 | Bump exige criar `vN-to-vN+1.ts` em `domain/migrations/` e registrar no `index.ts`. `data.schema.ts` e `services/supabase/dados.ts` importam a constante — não duplicar o número |
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
| `base` | `vite.config.ts` | `/` sempre, em dev e em build | Era `/central-compras-pbqph/` (subendereço do GitHub Pages) até 02/09/2026. O Pages saiu, o subendereço morreu e a variável `VITE_BASE_PATH` saiu junto. `scripts/conferir-pacote.js` impede o subendereço de voltar sem ninguém ver |

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
- **Ordem de cálculo de item:** `bruto → desconto → líquido → IPI → total`. **IPI é sobre o líquido**, não sobre o bruto — parece defeito e não é: **decisão 18**. Não "conserte".
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
| Mudar URL prod | `wrangler.jsonc#routes` (endereço próprio) + `start.bat` (URL hardcoded) + `SUBENDERECO_MORTO` em `scripts/conferir-pacote.js` se o nome antigo mudar. O `base` do Vite **não** entra mais nessa lista: ele é `/` e fica |
| Novo schema Zod | `domain/schemas/data.schema.ts` (sem throw — todos os campos têm `.default()`) |

## 8. Inconsistências conhecidas (avisos)

- ~~`react-router-dom` está em `package.json` mas **nunca é importado**.~~ **Resolvido:** removido do `package.json`. Roteamento continua via `useUiStore.activeTab`.
- Cálculos monetários usam `number` (IEEE 754) — possíveis erros de centavos em volumes grandes; sem `Decimal.js`.
- Sem mutex de servidor no save: duas abas/dispositivos salvando simultâneo podem perder dados (conflito é só pré-write check, não atomic CAS). Para a numeração específica de OCs há mitigação local em `NovaOcPage#ensureUniqueNumero` (re-checa antes de gravar e reatribui `max+1`).
- `verifyHandlePermission` falha → fallback silencioso para `showSaveFilePicker`. Pode confundir o usuário.
- PDF worker assume path `/assets/pdfjs/pdf.worker.min.mjs` no build; alterar `assetsDir` do Vite quebra OCR de PDFs importados.
- `OpenRouter API key` é gravada em texto puro em `config.openrouter_api_key` no JSON — input em `ConfigPage` já mascara (password) e desativa autocomplete/spellcheck/gerenciadores de senha; tratar arquivo (e backups) como sensível.
- ~~`DashboardPage.tsx` e `CatalogoPage.tsx` têm comentários `TODO Fase 7`.~~ **Resolvido:** comentários atualizados; implementações estavam completas.
- ~~Build local sem env `GITHUB_ACTIONS` gera `dist/` com base `/`.~~ **Sem objeto desde 02/09/2026:** o subendereço saiu com o GitHub Pages, o base é `/` em todo build, e não há mais nada que possa divergir.
- Auto-save (`useAutoSave`, 800ms) **só grava no localStorage** — perceptível para o operador. Persistência no JSON só ocorre via Ctrl+S / botão Salvar.
- Backups: dependem de pasta escolhida em Configurações. Quando ausente, `ConfigPage` agora mostra um banner amarelo de aviso explícito acima do seletor.
