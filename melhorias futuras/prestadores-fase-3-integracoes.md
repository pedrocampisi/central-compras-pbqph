# Prestadores de Serviço — Fase 3: Integrações

## Status: ⏸️ Não implementado (roadmap longo prazo)

## Contexto

Com Fase 1 (MVP) e Fase 2 (documentos + indicadores) entregues, o módulo já é robusto. A Fase 3 mira **reduzir fricção operacional** e **automatizar coleta de dados** via integrações:

1. Avaliar prestador no canteiro pelo Telegram (foto + voz)
2. Vincular comprovantes de pagamento já processados pelo outro sistema
3. Gerar PDFs auditáveis automaticamente
4. Bloqueio inteligente baseado em histórico

## Integrações propostas

### 1. Avaliação via Bot Telegram

**Bot existente:** `C:\Users\Pedro Paulo\OneDrive\Deveres\Programação\Bot Telegram`

**Fluxo proposto:**
1. Mestre de obras tira foto do carimbo preenchido à mão (durante transição) OU envia áudio descrevendo a avaliação
2. Bot envia ao OpenRouter (Claude Haiku 4.5) com prompt estruturado para extrair: prestador, obra, critérios, observações
3. Bot escreve um JSON no OneDrive em pasta watched
4. Sistema web detecta o JSON novo e oferece "Importar avaliação pendente"

**Componentes necessários:**
- No bot: novo módulo `bots/avaliador_prestadores/`
- No web: handler de "avaliações pendentes" + drawer de revisão antes de aceitar
- Compartilhar API key OpenRouter já configurada

**Variante:** o web só lê uma planilha Excel/CSV no OneDrive (mais simples, sem JSON intermediário).

### 2. Vínculo com comprovantes de pagamento

**Bot existente:** `bots/controle_comprovantes/controle_campisi/`

Hoje o bot processa comprovantes de pagamento Campisi e salva no Excel. Estender para:

1. Identificar quando um pagamento foi feito a um prestador cadastrado (fuzzy match por CNPJ ou nome)
2. Criar um "evento" associado: `{ prestador_id, data, valor, comprovante_path }`
3. No drawer do prestador, mostrar histórico financeiro (totais pagos por obra, último pagamento)

**Valor:** auditor PBQP-H quer ver "esse prestador entregou X serviço e foi pago Y em Z data" — hoje precisa cruzar 2 sistemas.

### 3. Relatório PDF consolidado para auditoria

Botão "Exportar relatório PBQP-H" na `PrestadoresPage` que gera PDF com:

- Lista de prestadores ativos no período
- Por prestador:
  - Dados cadastrais
  - Documentos com validade
  - Todas as avaliações no período (tabela)
  - Indicadores (taxa de conformidade, etc.)
- Resumo: total de prestadores, total de avaliações, total de NCs

Reusar `jspdf` + `jspdf-autotable` já no projeto (`src/services/pdf/`).

### 4. Bloqueio automático

Definir regras em `Config`:

```typescript
interface ConfigPrestadores {
  max_nao_conformidades_periodo: number;   // ex: 3
  periodo_dias: number;                    // ex: 90
  acao: 'alertar' | 'bloquear';            // bloquear = ativo=false forçado
}
```

Quando um prestador acumula N NCs no período P, sistema:
- **Alertar:** mostra badge vermelho na listagem e toast no Dashboard
- **Bloquear:** marca `ativo=false` automaticamente, gera log da decisão, permite reativar manualmente

### 5. Notificações por e-mail / Telegram

Quando uma NC é registrada, opcionalmente:
- E-mail ao responsável da obra
- Mensagem no Telegram (grupo da obra)

Reusar o `telegram_sender.py` do bot.

## Riscos / Considerações

- Bot ↔ Web compartilham OneDrive como "barramento" — não há real-time, há delay
- Auto-bloqueio é decisão sensível; precisa de override fácil para mestre de obras experiente
- Custo OpenRouter sobe com mais chamadas — manter monitoramento de saldo

## Estimativa

~1-2 semanas dependendo do escopo de quais integrações priorizar. Cada integração pode ser implementada independentemente.
