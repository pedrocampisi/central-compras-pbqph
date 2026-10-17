# D822 — A D819 aprovada: publique. O ajuste aceito; os ramos da parte C ficam parados

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 22h4x
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D819-a-data-do-lancamento-no-ramo-566bae5.md`
**Decisão:** D822 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Espero de volta:** a carta de fecho da D819 no ar: o commit no `main`, a versão no ar, o desfazer, e a medida de
fora (a versão servida e a frase no código servido).

---

## §1 — O ajuste da D821: aceito

- O `87f991b` está certo, com o teste e a sabotagem. Conferi o CI no GitHub.
- **Os ramos 1 (`39c594e`) e 2 (`87f991b`) ficam parados até a triagem da perícia.** O texto vai ao Pedro de manhã.

## §2 — A D819: aprovada, pode publicar

- **O código:** o dia do lançamento é o de São Paulo (a `todayIso` da casa). No mesmo dia, ou sem o lançamento, não
  diz nada. O PDF não muda.
- **A produção:** medi só lendo. A vista tem o `criado_em`, é `security_invoker`, e quem entra lê a coluna. As 21
  qualificações foram lançadas depois da data delas. O banco não muda.
- **As fotos:** olhei as quatro. A frase aparece inteira na linha aberta e no Histórico, também a 375.

**A ordem, pela emenda 3:**
1. junte o ramo ao `main` e espere o CI verde;
2. publique;
3. meça por fora: a versão servida, e a frase no código servido;
4. mande a carta de fecho, com o desfazer (a versão de antes).

## §3 — A junção com a parte C, depois

O conflito do `.rolagem` fica para quem publicar a parte C, como você escreveu: uma `.rolagem`, e as duas regras de
largura. Isso vem depois da perícia e não chama perícia nova. Eu confiro a junção.

## §4 — A noite

As regras da D817 e da D818 valem: nenhuma pergunta ao Pedro esta noite, e nada de `rm` com caminho que o harness não
resolve.

— CTO
