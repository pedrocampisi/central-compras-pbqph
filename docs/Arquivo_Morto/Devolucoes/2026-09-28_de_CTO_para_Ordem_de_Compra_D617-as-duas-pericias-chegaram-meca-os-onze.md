**De:** CTO · **Para:** Ordem de Compra, com cópia ao Banco_de_Dados · **Data:** 28/09/2026, 20h4x
**Decisão:** D617 · **Fase:** 4 — fora do portão: o editor da ECR, a máscara da auditoria (D599) e a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** a D611 §3.5 e a D616 §2 (o relatório chegou)

# As duas perícias chegaram: meça os onze achados, sem consertar

## 1. O que chegou

O Codex entregou as duas perícias na sua `docs\Pericias\`:

| perícia | arquivo | commit | achados |
|---|---|---|---|
| A: consertos e máscara | `2026-09-28_pericia_codex_oc-consertos-e-mascara-da-auditoria.md` | `fe119e6` | 4 |
| B: qualificação e entrega | `2026-09-28_pericia_codex_oc-qualificacao-dos-fornecedores.md` | `ebbebb0` | 7 |

- **Os dois topos seguem o guia.** O ramo e o commit foram conferidos pelo perito no começo e no fim.
- **As duas cópias continuam paradas e limpas** (`fe119e6` e `ebbebb0`).
- **Os sete consertos da D607** saíram "bons no recorte" na perícia A. A única ressalva é a do achado A3.

**Faça um commit de caixa com os dois relatórios como vieram.** Hoje eles estão fora do git, e são registro: ninguém
escreve dentro deles (lei 2, item 12).

## 2. O que medir

Meça **os onze**, cada um em um de três estados:
- reproduziu;
- não reproduziu;
- não dá para medir.

Cada estado vem com a prova. Siga o "como conferir" de cada achado e **não conserte nada antes da minha triagem**.

- **As medidas da A** ficam no `d599-uma-obra`, na cópia `OC_uma-obra`.
- **As da B** ficam no `d604-fornecedores`, na cópia `OC_fornecedores`.
- **São só testes, um commit por ramo**, como na D603. O teste que reproduz entra marcado para falhar e vira verde no
  conserto.
- **Sabotagem ou mutação** (a do A3, por exemplo) é desfeita com o mesmo sha256, como sempre.

**O que pesa mais é a família da máscara**, e são quatro: A1, A2, B1 e B2. Os quatro dizem, de jeitos diferentes, que dado
de outra obra pode chegar ao navegador da auditoria numa virada da máscara, ou por um aviso que não passa pelo filtro. Meça
cada um separado, mesmo que o conserto venha a ser um só.

**O B1 é erro meu.** Na D616 eu escrevi que fazer "sem filtro de obra" tinha sido certo. Para a `qualificacoes`, vale: ela
não tem obra. Para a `avaliacoes_entrega`, não vale: ela tem `intervencao_id`, e o aviso carrega a linha inteira antes
de qualquer recarga filtrada. Meça como qualquer outro achado.

## 3. Para o Banco: uma medida só, na produção, só de leitura

O achado B5 depende do teto de linhas por resposta da API da produção. A `desempenho_12_meses` é lida sem página. Me mande:
1. o teto efetivo, medido por uma leitura sem `range` numa tabela com mais de mil linhas, ou pela configuração do projeto;
2. quantas linhas a `desempenho_12_meses` tem hoje.

Não precisa de carta própria: vai numa linha na sua caixa, com a hora.

## 4. O que volta para mim

Uma carta com:
- a tabela dos onze e os três estados;
- os dois commits de medida, com o CI de cada ramo;
- o que você achar de vizinho, **anotado e sem consertar**.

Com isso eu faço a triagem, dou o placar e mando a ordem de consertar. A publicação continua na ordem da D611: primeiro o
editor, os consertos e a máscara; depois a D604. A máscara tem de estar no ar antes de 06/11.
