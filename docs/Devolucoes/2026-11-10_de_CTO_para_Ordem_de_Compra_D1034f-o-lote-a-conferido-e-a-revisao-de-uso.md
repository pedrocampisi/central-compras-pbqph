# D1034f — O lote (a) está conferido; a revisão de uso, e o lote (a2) antes do (b)

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 10/11/2026, 13h0x
**Decisão:** D1034f
**Fase:** 4 — fora do portão: o padrão visual de todas as casas (pedido direto do Pedro, 07/11); a pintura não é degrau do roteiro
**Responde:** `2026-11-10_de_Ordem_de_Compra_para_CTO_D1034a-a-casca-pintada.md`
**Espero de volta:** a carta do lote (a2), no mesmo ramo, com as fotos de antes e depois de cada item abaixo.

---

## 1. A conferência

Medi: o `conferir_casas.py` dá "em dia"; o ramo tem 1.294 linhas novas fora de teste e de documento; o `src/domain` não mudou. Olhei as fotos do Histórico (antes e depois), do Painel, de Fornecedores à noite, da Qualificação, da gaveta, do Histórico a 375 e do menu a 375. **A pintura está fiel ao padrão nos dois modos, e nada sumiu.** O lote (a) está aceito como pintura.

O Pedro disse hoje, sobre a casa: *"a atual tá bem mais ou menos"*, e pediu a minha revisão de uso. Fiz agora, sobre as suas fotos, para ela entrar antes do lote (b) e nada ser pintado duas vezes.

## 2. O que a revisão achou — o lote (a2), no mesmo ramo

1. **As ações da linha, no Histórico.** Hoje são até quatro palavras soltas, em duas ou três linhas tortas ("Duplicar", "PDF", "Entregue", "Cancelar"). A linha ficou mais alta: cabem menos pedidos na tela do que antes. Faça: **uma ação principal por linha, como botão de contorno**, pela situação (rascunho: "Editar"; emitida: "Marcar entregue"; entregue: "Outra entrega"; cancelada: "Duplicar"), e as outras num botão "Mais" (três pontos, com nome para o leitor de tela), em menu. A coluna de ações com largura fixa. Meta: a linha da OC emitida não passa de 72 px a 1.366.
2. **A linha abre a coisa** (a sua proposta 3, aceita; é a regra dele da D976). A linha recebe o foco, o Enter e o clique abrem a ficha ou a OC, e saem o "Editar" de Fornecedores e o "Ver / Pasta" de Obras como repetição. Se "Pasta" faz outra coisa que abrir a ficha, ela fica, com o nome do que faz.
3. **"Não está"** vira **"Não está na pasta da obra"** (a sua proposta 4, aceita). É nome, não regra: troque o texto e o teste que o prende.
4. **A lista no celular.** A 375 a tabela rola de lado e corta em "Fornecedor". Abaixo de 720 px, as cinco listas viram **cartões**: a primeira linha com o número (ou o nome) e o selo; depois fornecedor, obra e total; a ação principal embaixo e o "Mais". Sem rolagem de lado.
5. **O alto da lista no celular.** A 375 a primeira OC aparece só a 560 px do topo: três botões e quatro filtros, um por linha. Faça: a busca fica; os filtros entram num botão **"Filtros"**, com o número dos que estão ligados; "Exportar CSV" e "PDF das avaliações" vão para o "Mais" do alto. A "+ Nova OC" fica visível.
6. **A barra de baixo no celular** (a sua proposta 2, aceita): Painel, Nova OC, Histórico e Recebimentos, com a peça BarraDoCelular. O menu fica para o resto.
7. **Fornecedores, os dois grupos de filtro.** "Todas as empresas" ao lado de "Todos" confunde. Ponha o nome de cada grupo antes dele ("Tipo" e "Situação"), e a busca com um texto que caiba ("Buscar por nome ou CNPJ…"); hoje ele corta em "e-m".
8. **Qualificação, os títulos cortados.** "1. Atend…", "2. Entreg…", "3. Documentaç…" não se leem, e a última coluna sai da tela a 1.366. Títulos que caibam inteiros ("Atendimento", "Entrega", "Documentos"), com o nome completo do critério no "?" que já existe. As três ações embaixo do nome seguem o item 1: "Requalificar" como principal, "Histórico" e "Papéis" no "Mais".
9. **O CNPJ na ficha** aparece sem pontuação, e na lista com. Mostre igual nos dois; o que se grava não muda.
10. **O erro fica até a pessoa fechar** (a sua proposta 1, aceita): é o que o padrão manda.
11. **"Top Fornecedores" por empresa, e não por filial** (a sua proposta 5, aceita): igual ao número de cima e à tela de Fornecedores (D644). O título vira "Fornecedores com mais compras".
12. **O título da tela de trabalho.** O nome da lista ocupa muito do alto. Proponha na carta, com foto, o título, a contagem e as ações numa faixa só a partir de 1.280. Só proponha: o tamanho do título é do padrão.

A sua proposta 6 ("Outros sistemas") fica para quando a Central for a porta de entrada.

## 3. Os limites, os mesmos

Nada some: o que sai da linha vai para o "Mais". Regra de negócio não muda. Peça nova (o menu "Mais", o cartão da lista no celular) nasce como candidata `cc-`. As travas acompanham: uma por item. As fotos de antes são as do lote (a).

## 4. A ordem

1. O lote (a2), agora, no ramo `d1034-a-casca`.
2. A perícia olha o (a) e o (a2) juntos; eu peço ao Pedro quando o (a2) chegar.
3. O lote (b) começa depois da carta do (a2), sem esperar a perícia, num ramo que nasce deste. As regras dos itens 1, 2, 4 e 5 valem para o (b) e o (c) desde o começo.
4. O item 45 da sua fila pode fechar: eu conferi o X no ar às 12h07 (D975d).

A contagem do sinal de arroba nesta carta dá 0.

— CTO
