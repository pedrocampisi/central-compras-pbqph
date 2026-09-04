# Devolução — Ordem de Compra → agente central (10/08/2026)

> **Data:** 10/08/2026
> **Estado:** CONCLUÍDO — é registro
> **Escopo:** a devolução ao agente central em **10/08/2026**, com as decisões do Pedro daquele dia. **NÃO reexecute os passos**; o que vale são as decisões, hoje numeradas em `PLANEJAMENTO.md`.

> **De:** agente do repositório `Ordem de Compra`
> **Para:** agente central (`campisi-central`), com decisões do Pedro registradas
> **Anexos:** `RELATORIO-RODADA-2-2026-08-10.md` (verificação completa da rodada 2)

---

## 1. Estado: rodada 2 concluída

Todas as 6 tarefas do seu prompt executadas e verificadas — detalhes no relatório
anexo. Resumo do placar: 8 itens **passou**, 1 **não deu para testar**
(item 7 — não existe conta de papel `financeiro` no banco para o teste real).
`main` intocado; nenhuma OC emitida; banco e Edge Functions não alterados.
Branch `migracao-supabase` em `aa9e468`.

## 2. Decisão do Pedro: troca de modelo para Gemini Flash-Lite ✅

O Pedro aprovou a troca para o **Flash-Lite** (pedido dele em 10/08: "pode
trocar essa OC para o flash_lite"). Encaminhamento que proponho, separando as
duas funções como a sua própria regra manda:

1. **`ler-documento` (Bot/textExtractor): APLICAR agora a config C2**
   (`gemini-3.5-flash-lite` + `reasoning: minimal`) — era exatamente a
   aprovação que o benchmark de vocês aguardava; o diff está pronto na seção 4
   do `scratchpad/teste_modelos/RELATORIO.md`. Zero regressões em 30 docs, 4x
   mais rápido, 98% mais barato. Atualizar o comentário de decisão do arquivo,
   como o relatório pede, citando a aprovação do Pedro de 10/08.
2. **`extrair-itens` (Ordem de Compra): o pedido do Pedro está registrado,
   mas a troca direta violaria a regra que vocês mesmos escreveram** ("não
   trocar sem medir — o benchmark mediu outra tarefa"). Proposta: **rodar o
   mini-benchmark da tarefa certa** (extração de tabela de orçamento:
   Haiku 4.5 × Flash-Lite C2, orçamentos reais, validação de total por linha e
   classificação de ECR — os scripts de `teste_modelos/` se adaptam em ~1h).
   Se o Flash-Lite empatar ou vencer, troca com evidência; se perder, o Pedro
   economizou o erro caro (OC com preço errado). Eu não toco nas funções — são
   de vocês.

## 3. Próximos passos para destravar o piloto dos engenheiros

O Pedro quer colocar os engenheiros para testar. O que precisa acontecer:

### 3.1 Criar as contas da equipe (ação de vocês, com dados do Pedro)
- **Pedro:** informar nomes/e-mails e papel de cada engenheiro
  (`engenharia` ou `financeiro`).
- **Vocês:** criar as contas + perfis (mesmo fluxo das 3 existentes). Cada
  pessoa define a própria senha pelo "Primeiro acesso — definir minha senha"
  da tela de login (fluxo testado ponta a ponta pelo Pedro em 08/08).
- **Incluir ao menos 1 conta de papel `financeiro`** — além do uso real,
  fecha o item 7 da verificação da rodada 2 (teste de permissões na
  interface com usuário de verdade).

### 3.2 URL do piloto (decisão do Pedro, pendente)
- **Cloudflare Pages** (caminho do plano): Pedro cria a organização em nome
  da Campisi; o agente do Ordem de Compra configura build e variáveis.
- **Alternativa imediata:** URL de teste no GitHub Pages, sem tocar na
  produção atual — o agente do Ordem de Compra publica no mesmo dia.
- **Regra do piloto, em qualquer opção:** OC oficial continua no sistema
  antigo até a virada; o piloto é para clicar, emitir de brincadeira e dar
  feedback. Dois sistemas valendo divergem.

### 3.3 Fila da virada (inalterada, para referência)
1. Supabase **Free → Pro** (Pedro, antes de operação real — backup).
2. **Migração final dos dados** (vocês): incremental JSON→banco, com
   congelamento curto aprovado pelo Pedro — **incluindo apagar a OC de teste
   2026/008** (colide com a 008 real se houver; cancelar não libera o número).
3. **Site URL do Supabase** → URL de produção nova (e-mails de senha).
4. Variáveis no CI + merge para `main` (agente do Ordem de Compra, após
   aprovação do Pedro).

## 4. Aviso técnico para quem montar o deploy ⚠️

**`VITE_BASE_PATH=/ pnpm build` NO GIT BASH corrompe o base path** — o MSYS
converte `/` para `C:/Program Files/Git/` e o site sobe com tela branca
(assets 404 em `/Program Files/Git/assets/…`). Aconteceu na prática na rodada
2 e custou o diagnóstico mais longo do dia. Funciona correto via PowerShell
(`$env:VITE_BASE_PATH='/'`) ou CI Linux. Recomendo fixar isso no procedimento
de deploy (ou trocar a mecânica do base path por algo à prova de MSYS).

## 5. O que o agente do Ordem de Compra fica aguardando

| De quem | O quê |
|---|---|
| Pedro | Nomes/e-mails/papéis dos engenheiros · decisão Cloudflare vs GitHub Pages · Free→Pro |
| Vocês | Contas criadas · aplicação do C2 na `ler-documento` · (proposta) mini-benchmark da `extrair-itens` · migração final + limpeza da 2026/008 |
| Eu | Configurar o deploy do piloto assim que a URL for decidida · merge na virada · qualquer ajuste de interface que o piloto apontar |
