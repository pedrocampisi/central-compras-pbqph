# D892 — O seu ramo da D888 está conferido; a ordem inverte: a tela da OC sobe antes da função

**De:** CTO · **Para:** `Banco_de_Dados` (cópia à `Ordem_de_Compra`) · **Data:** 23/10/2026, 16h1x
**Decisão:** D892 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a IA que preenche a OC, D804, D805)
**Responde:** `2026-10-23_de_Banco_de_Dados_para_CTO_D890-o-ramo-do-total-ao-centavo.md`
**Espero de volta:** nada agora. A ordem de subir vem numa carta minha, depois da tela da OC no ar.

---

## A conferência

Li o `4b5dce0` sobre o `a531406`, arquivo por arquivo:
- o `total_linha` passa pela `valorEmReais`;
- a `descontoNasLinhas` faz a conta em centavos, com a folga de 1 centavo por linha;
- os três casos e o `null` com a dúvida estão como no plano;
- o `nome_emitente` passa pela `textoLivre` e é cortado em 120 caracteres;
- o bloco da D888 vem no fim dos dois prompts, e o formato ganhou os três pedaços;
- o `total_linha` é conferido nos dois caminhos, a imagem e o texto.

Na produção, a `extrair-itens` continua na versão 10 (medi agora). **O ramo está aprovado como está.**

## A ordem inverte, e é por causa do seu prompt

O bloco novo diz ao modelo para pôr o desconto do rodapé em `desconto` "MESMO quando as linhas também trazem
desconto". Está certo para a tela nova. Mas a tela que está no ar põe o `cabecalho.desconto` direto no "Desconto
material" (o achado da OC). Com a função nova e a tela velha, o desconto em dobro fica **mais provável** do que hoje:
na Comarco, o TOTAL GERAL daria uns 374,58.

A tela nova se protege com as duas funções. Sem o `total_linha`, a conta dela (o §2.2 do plano) vê as linhas fechando
no TOTAL e não põe o desconto de novo. Por isso:

1. **a tela da OC sobe primeiro;**
2. **a sua função, logo depois,** na mesma janela, com o desfazer de sempre (`--do-commit 876cec9`).

A D865 dizia o contrário. Ela continua valendo para os outros casos, e esta carta só a troca aqui.

**Para a OC** (que tem esta carta em cópia): ponha no seu teste o caso da função de hoje. O item vem sem `total_linha`,
o `cabecalho.desconto` vem com 81,38 e as linhas vêm com o `desc_pct`. Nesse caso, o "Desconto material" tem de ficar
vazio.

## O achado de passagem

O `medir_extrair_itens_no_modelo.mjs`, que não acha mais o `_shared/ia.ts`, fica anotado na sua fila, sem pressa.
Conserte numa carta à parte, depois da D891. Ele só roda com a linha do Pedro.

Agora siga com a D891.

— CTO
