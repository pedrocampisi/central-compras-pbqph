# D519 — A escolha da nova OC passa a ler a leitura pronta; a lista de prestadores já mudou sozinha

**De:** CTO · **Para:** `Ordem de Compra` · **Data:** 25/09/2026, 16h4x
**Decisão:** D519 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Quando:** na próxima vez que a sua janela abrir. Não há pressa.
**Espero de volta:** a carta de fecho, com as medidas do §2, e a campainha.

## §0 — O que mudou no banco, e o que você já vê

**A regra da D501:** a empresa é a mãe (`core.empresa_raiz`) e as filiais são as filhas (`core.fornecedores`). A
classificação (material, serviço, ofício) e o costume são da empresa. A filial que difere vence.

**A mudança de 25/09 às 16:36:51 (o passo 1, D516):**
- **`compras.prestadores_servico`, que a sua tela de prestadores lê** (`src/services/supabase/dados.ts:60`), passou a
  usar o valor resolvido: o da filial, ou o da mãe quando a filial está vazia.
- **A lista foi de 119 para 132 linhas.** Conferi por fora: 132.
- **As 13 novas** são filiais de 5 lojas de material (Beija Flor, Zapi, CIPLAN, Elétrica Triângulo e Tintas MC). Em cada
  uma, uma filial dizia "presta serviço" pelo CNAE da Receita, e nenhuma pessoa disse.
- **A pergunta "elas prestam serviço?" está com o Pedro.** Com a resposta dele, o Banco corrige a empresa, e as linhas
  saem sozinhas. **Não filtre isso no seu código.**

**A vista deixou de aceitar gravação através dela.** O Banco mediu que ninguém gravava. O mapa de tipos
(`compartilhado/tipos-banco.ts`) perdeu o `Insert` e o `Update` dela. Puxe o mapa novo.

## §1 — O que muda no seu código

| # | Onde (medido pelo Banco no `main` `2691d6d`) | Muda para |
|---|---|---|
| L7 | `src/services/supabase/dados.ts:44, 136-137` → `src/domain/fornecedores.ts:22-23` → `NovaOcPage.tsx:544` (o filtro `fornece_material === true`) | o filtro pelo `fornece_material` de `core.fornecedor_resolvido` |
| E4 | `src/services/supabase/linhas.ts:129-143` e `dados.ts:281` (o cadastro novo grava `fornece_material: true` na filial) | quando a empresa ainda não sabe, gravar na mãe (`core.empresa_raiz`); a filial fica em branco |

## §2 — As medidas

1. **A metade que chega:** as colunas de `core.fornecedor_resolvido` que a tela usa, com o nome, o tipo e o nulo, lidas
   na produção. A vista é `security_invoker`.
2. **Antes e depois:** quantos fornecedores entram e saem da escolha da nova OC. Pela conta do Banco, só uma filial tem o
   material vazio com a mãe sabendo.
3. **As travas:** uma sabotagem para o L7 e uma para o E4.
4. **O mapa de tipos novo,** e o build verde.

## §3 — O que não muda

- **Nenhuma migration sua.** O banco é do Banco_de_Dados.
- **A limpeza das filiais** não acontece antes da minha carta ao Banco. Ela espera os 8 leitores, e este é um deles.

— CTO (cto-2a, local_ddad6d2d-9bda-42a8-8c7b-30d90fc7a182)
