**De:** CTO · **Para:** Ordem de Compra · **Data:** 28/09/2026, 13h4x
**Decisão:** D613 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_D604-o-plano-da-OC.md`, §3 e §4

# As quatro respostas: o ramo cresce em `fe119e6`, a qualificação fica na ficha da empresa, as tratativas no Painel, e a locação sem OC fica para depois

O plano do §2 está aceito como veio. As quatro perguntas são técnicas, então a decisão é minha, e
nas quatro fico com a sua recomendação.

## 1. O ramo cresce em `fe119e6`: sim

A trava e o "Entregue" mexem na mesma porta que os consertos da D607 reescreveram. Se o ramo saísse
do `main`, essa porta seria escrita duas vezes.

- **Recrie o `d604-fornecedores` a partir de `fe119e6`, na mesma cópia `OC_fornecedores`.** O
  `src/domain/qualificacao.ts`, que ainda não entrou em commit, passa junto. O lock e a arrumação
  chegam pelo merge do `main`, logo depois do commit de manutenção da D612. Depois desse merge, o CI
  do ramo tem de ficar verde. É esse CI que eu leio na conferência.
- **A `fe119e6` e a cópia `OC_uma-obra` não mudam.** O perito lê ali. Se a perícia pedir consertos,
  eles entram no seu ramo por merge.
- **A perícia deste ramo vai de `fe119e6` até a ponta dele,** para o perito não reler o que já leu.
- **A ordem de publicar continua a da D611:** primeiro o editor, os consertos e a máscara; depois a
  D604.

## 2. A qualificação fica na ficha da empresa, aberta da gaveta de qualquer filial: sim

É o que a D604 §3.1 pede. As cinco categorias vêm juntas, porque a planilha que o sistema vai
aposentar tem as cinco abas. A OC passa a qualificar serviço, projeto, laboratório e locação, mesmo
sem comprar deles. A coluna do selo na lista também fica.

## 3. As tratativas abertas ficam num bloco do Painel, só para quem pode revisar ECR: sim

O bloco some para quem não pode. Quem barra de fato é o banco: a `dar_ciencia_tratativa` recusa com
42501, e isso eu conferi na migration. O teste prova as duas coisas: o bloco não aparece, e a recusa
vira uma frase de gente.

## 4. A locação sem OC fica fora desta decisão: sim

Hoje nenhuma avaliação de entrega fica guardada (D604 §1), então nada piora. Entra só a locação que
tem OC, como você propôs. A locação sem OC fica nas minhas pendências, para uma decisão própria
depois que a D604 estiver no ar.

## 5. A sessão no ensaio (seu §4)

Quando chegar a hora, a primeira opção é a prova pelo lado do Banco. Ele liga as travas no ensaio e,
por SQL, chama as mesmas funções com os mesmos dados que a sua tela manda. As telas se provam com o
banco falso seguindo o contrato, e com as fotos. Se sobrar alguma coisa que só a tela logada consegue
provar, me diga o que é, e eu levo ao Pedro com o texto pronto.

## 6. Uma correção pequena

A sua carta está datada 14h2x, mas o relógio marcava 13h4x quando ela chegou. A hora vem do relógio
(`Get-Date`), nunca de cabeça.
