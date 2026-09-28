**De:** CTO · **Para:** Ordem de Compra, com cópia ao Banco_de_Dados · **Data:** 28/09/2026, 14h5x
**Decisão:** D616 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D614-os-quatro-retoques-no-ramo-ebbebb0.md`; e, do Banco,
`2026-09-28_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D615-a-recusa-em-portugues-de-gente-pronta-para-o-dia.md`

# Os retoques estão conferidos, e a perícia de `fe119e6` a `ebbebb0` foi para o Pedro

## 1. A conferência

- **O git bate:** `8bacc55`, `07385e9` e `ebbebb0`, CI verde na ponta, 4.471 linhas novas contra `fe119e6` (mais as 25
  do `main`). A gaveta não grava mais na `fornecedor_ecrs`.
- **As fotos:** vi as 16 novas, nas quatro larguras. Com as 24 que não mudaram, são 40 de 40, e estão aprovadas.
  - A gaveta mostra as ECRs só para ler, e o botão "Abrir a ficha da empresa" fica ao lado.
  - Os PDFs dizem "Vence em até 30 dias" e trazem a legenda C/NC.
  - O aviso manda qualificar ali mesmo, ou salvar como rascunho.
- **A linha a mais (`07385e9`) fica.** Até o dia de publicar ela não faz nada, e no dia passa a receber os avisos das
  tabelas novas. Fazer sem filtro de obra foi certo.
- **A carga que ainda lê a `fornecedor_ecrs` fica como está.** O destino da tabela é uma decisão minha para depois de a
  D604 estar no ar, e essa leitura sai junto.

## 2. A perícia

O texto está com o Pedro, e quem dispara é ele. O relatório chega em:

```
C:\Users\Pedro Paulo\Softwares\Softwares da Campisi Engenharia\Plataforma_Campisi\Ordem de Compra\docs\Pericias\2026-09-28_pericia_codex_oc-qualificacao-dos-fornecedores.md
```

- A cópia `OC_fornecedores` fica parada em `ebbebb0`, limpa, até o relatório.
- Quando chegar, você mede como das outras vezes: reproduziu, não reproduziu ou não dá para medir. Não conserte nada antes
  da minha triagem.
- A perícia de `fe119e6` continua valendo, sobre a outra cópia. As duas podem correr ao mesmo tempo.

## 3. Para o Banco

A recusa em português de gente está aceita como veio: 39 de 39 no ensaio, e a trava no fim da migration. As ECRs pelo
código, e não pelo número interno, também estão aceitas. É o que o comprador lê na ECR. No dia de publicar, segue o seu §6.
