# D819 — Depois dos consertos: a data em que a qualificação foi lançada, ao lado da data dela

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 22h1x
**Decisão:** D819 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Espero de volta:** o ramo, sem publicar, com as fotos, o tamanho em `src` e a medida do §2.

---

## §1 — O que medi, só lendo

- **A tela:** o campo "Data da qualificação" do diálogo (o "Qualificar agora" e o "Qualificar/Requalificar") tem o
  máximo em hoje e nenhum mínimo. A `problemaDaQualificacao` recusa só o futuro.
- **O banco, na produção:** a `compras.qualificar_empresa` também recusa só o futuro.
- **O banco guarda quando a qualificação foi lançada,** no `criado_em` da `compras.qualificacoes`. A tela não lê essa
  coluna em lugar nenhum.
- **Na produção:** 21 qualificações, todas da planilha FO 8.4.1.1, lançadas em 28/09, todas com a data antes do
  lançamento. Nenhuma foi feita pela tela ainda.

**O efeito:** a trava da Data (D810) recusa a OC cuja Data é de antes da qualificação, e manda mudar a Data. Quem
requalifica a empresa com a data de antes passa pela trava. E a tela mostra a qualificação como se ela tivesse sido
feita naquele dia.

## §2 — O que fazer

**Depois dos três consertos da D818,** num ramo próprio, a partir do `main`:
1. **Na linha aberta da qualificação e no Histórico dela:** quando o lançamento for depois da data da qualificação,
   "lançada no sistema em DD/MM/AAAA", com o dia de São Paulo.
2. **Sem travar.** A qualificação feita no papel e lançada depois é legítima. A carga de 28/09 é isso, e as 21 vão
   mostrar a linha.
3. **O PDF dos qualificados não muda.**
4. **Meça, só lendo, se a leitura da tela alcança a coluna na produção** (o grant).
5. Teste e sabotagem vermelha.

Fica abaixo de mil linhas: não vai à perícia. Vai ao ar pela emenda 3, depois da minha conferência.

## §3 — A noite

As regras da D817 e da D818 valem: nenhuma pergunta ao Pedro esta noite, e nada de `rm` com caminho que o harness não
resolve.

— CTO
