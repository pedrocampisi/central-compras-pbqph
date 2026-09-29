**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 13h3x
**Decisão:** D611 · **Fase:** 4 — fora do portão: o editor da ECR e a máscara da auditoria do PBQP-H (D599)
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D607-os-sete-consertos-no-ramo-97226b3.md`

# Os consertos estão conferidos; passou de mil, então vai uma perícia só, com a máscara junto

## 1. A conferência

Conferi por fora:

- **Os números batem com o git.** `5f287cd..97226b3` tem 1.185 linhas novas fora de `docs\`, em 22
  arquivos. `7edb715..fe119e6` tem 2.514 linhas, em 31 arquivos.
- **Zero `it.fails`**, no ramo e na cópia.
- **As fotos.** A 02b mostra ≥, ≤, ±, ∆ e → impressos, e a seta sem encostar. A 04a mostra o corpo
  inteiro na página 1, a nota e as revisões 41–49 no rodapé, sem sobreposição.

As 27 sabotagens novas, as impressões digitais do PDF e o merge com os dois lados estão aceitos como
vieram.

## 2. O portão: você está certa, e o erro foi meu

A D607 §2.2 contou com menos de mil linhas, e deu 1.185. O número é régua (lei 3 §9.5), e não se
enxuga para caber. O editor não vai à produção sem outra perícia.

Então vai **uma perícia só**, sobre a cópia `OC_uma-obra` em `fe119e6`, escopo `7edb715..fe119e6`.
Ela cobre ao mesmo tempo os consertos, as medidas, a máscara e o merge. Assim são duas perícias a
menos no caminho, e **editor, consertos e máscara vão ao ar juntos**, depois da triagem, bem antes de
06/11. O texto do pedido está com o Pedro. Ele dispara.

## 3. O que você faz agora

1. **A cópia `OC_uma-obra` fica parada em `fe119e6`**, com a árvore limpa, até a perícia chegar. É ali
   que o perito lê e roda a bateria.
2. **O ramo `d589-editar-ecr` também fica parado em `97226b3`.** Ele está todo dentro de `fe119e6`.
3. **Nada se publica.** O `080168b8` continua no ar.
4. **Comece a D604, a D605, a D606, a D609 e a D610** numa cópia nova a partir do `main`, em
   `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_fornecedores`, ramo `d604-fornecedores`. O
   contrato do Banco já está na produção, com as travas desligadas (D609). As telas chamam as funções
   dele. Quando estiverem prontas para teste, avise o Banco, que liga as travas no ensaio.
5. **O relatório vai chegar na `docs\Pericias\` da pasta da casa.** Quando chegar, meça como da outra
   vez: reproduziu, não reproduziu ou não dá para medir, sem conserto antes da minha triagem.

A resposta da D609 §3 está anotada: a gaveta cadastra pessoa física, e pessoa jurídica só quando a
empresa já existe. Os 6 que faltam passam pelo Banco quando o Pedro mandar os papéis (D610).
