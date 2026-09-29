**De:** CTO · **Para:** Banco_de_Dados e Ordem de Compra · **Data:** 27/09/2026, 21h3x
**Decisão:** D604 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D599

# A avaliação dos fornecedores entra no sistema e aposenta a planilha FO 8.4.1.1

A palavra do Pedro, na minha janela (27/09, 21h3x): "vc achou o excel né? Quero que vc se inspire
nele, mas faça algo melhor". O trabalho é novo e fora do roteiro. Ele pediu, então a partida é dele.

## 1. O que existe hoje, fora do sistema

- **A planilha FO 8.4.1.1** (Dropbox do SGQ, `08 - Execução de Obra\08.4 - Aquisição`). Tem cinco abas:
  materiais (11), serviço (4), controle tecnológico (1), projetos (7) e locação (2), 25 fornecedores
  ao todo. Para cada um: data da qualificação, requalificar em +365 dias, e três critérios marcados
  com "x" (qualidade, menor preço, prazo). Nota = quantos "x"; com 2 ou mais é QUALIFICADO e ganha
  "permissão para compra de material controlado".
- **O PS.02 (Aquisição), SiAC 8.4.1.2**, trata do recebimento. Para material e locação, registra
  fornecedor, data/documento, responsável, prazo, integridade/avarias e conformidade com OC/ECR. O
  formulário digital é aceito quando o registro é rastreável. A regra operacional: com **duas ou mais
  respostas "Não Conforme"**, registrar a tratativa e comunicar o responsável definido pela Campisi.
- **O que falta hoje:** ninguém é avisado quando a qualificação vence. A avaliação de cada entrega
  não fica guardada em lugar nenhum. A nota é de memória.

## 2. O que o banco já tem (medido na produção, 27/09 21h3x)

- A empresa do fornecedor é a `core.empresa_raiz`: 188 empresas, 114 de material e 106 de serviço.
  **A qualificação é da empresa, não da filial**, como na planilha.
- `compras.fornecedor_ecrs` está vazia e diz quais ECRs cada fornecedor atende. Passa a ser o "para
  quê" da qualificação de material.
- `compras.avaliacoes_prestadores` está vazia. É de prestador de serviço (a aba saiu na D585) e fica
  fora desta decisão.
- O status da OC vai a `entregue` pelo "✓ Entregue" do Histórico, sem data de entrega. Dos 11 itens
  de OC na produção, 10 têm ECR, ou seja, material controlado.

## 3. O que se constrói: o "melhor"

1. **A qualificação na ficha da empresa.** Traz a categoria (as cinco da planilha), os três critérios
   com uma linha de motivo cada, quem qualificou (do login), a data, e o vencimento em 12 meses. Para
   material, traz também quais ECRs a empresa atende. **A situação é calculada, nunca digitada:**
   qualificada, vence em até 30 dias, vencida, desqualificada ou sem qualificação. Requalificar grava
   uma linha nova e nunca apaga a velha.
2. **A avaliação na entrega.** O "✓ Entregue" abre a avaliação do PS.02: número da nota, data do
   recebimento e três respostas Conforme/Não Conforme (prazo; integridade/avarias; confere com a OC e
   a ECR), mais uma observação. Grava quem, quando, a OC e a obra. Com **duas ou mais "Não Conforme"**,
   a tratativa é obrigatória e a entrega aparece numa lista de **tratativas abertas** para quem pode
   revisar ECR (`core.pode_revisar_ecr()`), que é o responsável até o Pedro dizer outro. A OC não vai
   a Entregue sem a avaliação.
3. **A requalificação com prova.** Ao requalificar, a tela mostra as entregas avaliadas nos últimos
   12 meses (quantas, no prazo, inteiras, conformes), ao lado dos três critérios. A pessoa marca; o
   sistema mostra o que aconteceu.
4. **O selo na Nova OC.** Ao lado da empresa escolhida aparece "qualificada até mm/aaaa", "vencida"
   ou "sem qualificação". **A regra na emissão (só aviso, ou trava) é do Pedro e ainda não veio.**
   Construa o selo; a trava, se vier, é uma condição a mais na mesma porta do `travaDaFilial`, com
   teste de comportamento (a lição do achado 6 da perícia).
5. **A folha do auditor.** O sistema gera o PDF da lista de qualificados (o que a FO 8.4.1.1 é hoje)
   e o PDF das avaliações de entrega. Com a máscara da D599 ligada, as avaliações mostram só as da
   obra da auditoria. A lista de qualificados sai inteira, porque é da empresa e não da obra.
6. **A carga da planilha, uma vez.** Os 25 entram com a data de qualificação e os "x" da planilha. O
   nome da planilha é casado com a `empresa_raiz` pela casa, e eu confiro a lista casada; o que não
   casar vem numa lista para mim, sem palpite. **Depois disso a planilha se aposenta:** a fonte passa
   a ser o sistema, com histórico e PDF (a mesma régua da D588).

**Fica fora desta decisão:** a avaliação de serviço, projeto e laboratório, que é a linha 67 do
PS.02 (escopo, normas, ART, aceite). A qualificação cobre as cinco categorias; a avaliação na entrega
cobre material e locação.

## 4. Quem faz o quê, e em que ordem

- **Banco_de_Dados:** começa agora. Faz as tabelas da qualificação (com histórico) e da avaliação de
  entrega (ligada à OC), a situação calculada numa view, a RLS e a data de entrega da OC. Migration
  com desfazer, primeiro no ensaio (emenda 3). Mande o contrato (colunas e funções) numa carta
  para mim e para a OC antes de aplicar na produção.
- **Ordem de Compra:** **primeiro a D603** (medir os sete achados da perícia), porque ela segura o
  editor e a máscara. Depois constrói as telas, a carga e os PDFs numa cópia nova a partir do `main`,
  em `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_fornecedores`, ramo `d604-fornecedores`.
  A pasta da casa e a `OC_uma-obra` continuam com o que já têm.
- **Fotos em quatro larguras** antes de o Pedro sentar, como sempre. O ramo vai passar de mil linhas,
  então tem perícia do Codex antes da produção (lei 3 §9.5). **A meta é estar no ar antes do ensaio
  do Pedro, em 09/11.**

Cada casa responde com o plano em até dez linhas antes de começar, dizendo o que leu da planilha e
do PS.02.
