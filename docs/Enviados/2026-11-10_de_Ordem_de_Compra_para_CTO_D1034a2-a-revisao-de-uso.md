# D1034a2: a revisão de uso, os doze itens, no ramo da casca

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 13h36
**Assunto:** o lote (a2) feito no ramo `d1034-a-casca`, com fotos de antes e depois e uma medida por item; nada na produção
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034f-o-lote-a-conferido-e-a-revisao-de-uso.md`
**Espero de volta:** a perícia do (a) e do (a2) juntos, quando o Pedro disparar. O lote (b) começa agora, como a carta manda.

---

## 1. Em uma linha

Os doze itens estão no ramo `d1034-a-casca`, empurrado, e **fora da produção**. O item 12 é só proposta, com foto. A bateria passa inteira: **1.388 de 1.388**, com tipos e lint limpos. O `conferir_casas` dá "em dia". O `src/domain` não mudou.

As fotos de antes são as do lote (a), em `docs/Capturas/2026-11-10_D1034a/depois/`. As de depois estão em `docs/Capturas/2026-11-10_D1034a2/depois/`, 35 fotos, junto do `medidas_a2.json`. Foram tiradas na página de prova, com banco falso e dados inventados.

## 2. Os doze itens

| # | O que ficou | Antes (lote a) | Depois (a2) | Trava |
|---|---|---|---|---|
| 1 | Cada linha tem uma ação principal, em contorno: rascunho "Editar", emitida "Marcar entregue", entregue "Outra entrega", cancelada "Duplicar". O resto vai para o "Mais", nesta ordem: Duplicar, PDF, Anexar papel, Enviar ou Reenviar para a pasta da obra, Cancelar. A coluna de ações tem 13rem fixos. **A linha emitida mede 69 px a 1.366** (meta: 72). | `depois_historico_dia_1366` | `depois_historico_dia_1366`, `depois_historico_mais_aberto_dia_1366` | `AnexarPapelNaOc` (itens 1, 4 e 5), `PecasDaRevisaoDeUso` (o "Mais") |
| 2 | A linha recebe o foco, e o clique, o Enter e o Espaço abrem. Em Fornecedores saiu o "Editar". Em Obras saiu o "Ver / Pasta": ele só abria a ficha, e a pasta das OCs se conecta dentro dela. O Enter num botão de dentro continua sendo do botão. | `depois_fornecedores_dia_1366`, `depois_obras_dia_1366` | `depois_fornecedores_dia_1366`, `depois_obras_dia_1366` | `PecasDaRevisaoDeUso`, `FornecedoresPorEmpresa` |
| 3 | "Não está" virou "Não está na pasta da obra". | `depois_historico_dia_1366` | `depois_historico_dia_1366` | `PdfNaPastaDaObra` |
| 4 | Abaixo de 720 px as cinco listas viram cartões. Em cima, o número (ou o nome) e o selo. Embaixo, os detalhes com o nome da coluna, e no pé a ação principal e o "Mais". **Nenhuma lista rola de lado a 375**: página, conteúdo e caixa da tabela medem 0 px. No Histórico saiu do cartão só a contagem de itens; a data ficou. | `depois_historico_dia_375`, `depois_fornecedores_dia_375` | `depois_historico_cartoes_rolado_dia_375`, `depois_fornecedores_noite_375`, `depois_obras_dia_375`, `depois_qualificacao_dia_375` | `AnexarPapelNaOc`, `PecasDaRevisaoDeUso` |
| 5 | A busca fica. Os filtros entram no botão "Filtros", que mostra quantos estão ligados. Exportar CSV e PDF das avaliações vão para o "Mais" do alto, e a "+ Nova OC" fica à vista. **A primeira OC aparece a 365 px do topo**; a carta media 560. | `depois_historico_dia_375` | `depois_historico_dia_375`, `depois_historico_filtros_abertos_dia_375`, `depois_historico_mais_do_alto_dia_375` | `AnexarPapelNaOc`, `PecasDaRevisaoDeUso` |
| 6 | A barra de baixo usa a peça BarraDoCelular, abaixo de 960 px: Painel, Nova OC, Histórico, **Recebidos** e Mais. O "Mais" abre o menu; o Esc fecha e o foco volta a ele (medido). O botão de três traços do alto saiu, porque o "Mais" faz o trabalho dele. | `depois_menu_dia_375` | `depois_painel_barra_dia_375`, `depois_painel_barra_noite_375`, `depois_menu_pelo_mais_dia_375` | `Moldura375` |
| 7 | Os grupos de filtro de Fornecedores levam o nome antes: "Tipo" e "Situação". A busca diz "Buscar por nome ou CNPJ…": o texto precisa de 203 px e a caixa tem 231. | `depois_fornecedores_dia_1366` | `depois_fornecedores_dia_1366` | `FornecedoresPorEmpresa` |
| 8 | Os títulos da Qualificação cabem inteiros: "Atendimento", "Entrega", "Documentos". O nome inteiro do critério está no "?" de cada título e no passar do mouse. **A última coluna cabe a 1.366**, sem rolar de lado. "Requalificar" é a principal; "Histórico" e "Papéis" vão no "Mais". Quem só lê fica com "Histórico" como principal. | `depois_qualificacao_dia_1366` | `depois_qualificacao_dia_1366`, `depois_qualificacao_mais_aberto_dia_1366` | `TelaQualificacao`, `RegistrosNaQualificacao` |
| 9 | A ficha mostra o CNPJ com pontuação, igual à lista (medido: `44.555.666/0001-01`). O que se grava não muda, porque a linha do banco já levava só os dígitos. | `depois_gaveta_dia_1366` | `depois_ficha_cnpj_dia_1366` | `FornecedoresPorEmpresa` |
| 10 | O aviso de erro fica até a pessoa fechar, no X ("Fechar o aviso") ou num clique nele. O de sucesso continua sumindo sozinho. | sem foto | **sem foto**: a página de prova não tem como provocar um aviso de erro sem mexer no código. A prova é o teste. | `PecasDaRevisaoDeUso` |
| 11 | "Fornecedores com mais compras" soma por empresa, igual ao número de cima e à tela de Fornecedores (D644). A empresa com uma filial só mostra o CNPJ; a de várias mostra "N filiais". | `depois_painel_dia_1366` | `depois_painel_dia_1366` | `DashboardEmpresas` |
| 12 | **Só a proposta, não construída.** Título, contagem e ações numa faixa só a partir de 1.280. Na foto, a primeira OC sobe cerca de 50 px. O tamanho do título é seu: a foto usa 2rem, só de mostra. | `depois_historico_dia_1366` | `depois_proposta12_historico_dia_1366` | nenhuma: não foi construído |

## 3. O que pede o seu olho

1. **O nome "Recebidos" na barra.** "Recebimentos" não cabe inteiro em um quinto de 375 px, e a peça manda o nome caber. O leitor de tela ouve "Recebimentos", e o menu continua dizendo "Recebimentos". Se preferir outro nome curto, é uma linha.
2. **O botão de três traços do alto saiu abaixo de 960 px.** A peça diz que a barra substitui o menu lateral, e dois botões abrindo a mesma gaveta seriam repetição. O menu inteiro continua no "Mais".
3. **As peças novas nasceram como candidatas `cc-`**, em `src/styles/candidatas.css`:
   - 4, o "Mais";
   - 5, a linha que abre;
   - 6, os cartões.

   Com as três do lote (a), são seis para levar ao pacote. O "Mais" é um componente, `src/components/Mais/Mais.tsx`. O menu dele flutua fixo, medido no botão, para a caixa da tabela não o cortar.
4. **Tamanho e perícia.** O ramo ganhou cerca de 800 linhas fora de teste e de documento, e perdeu 189. Os testes ganharam cerca de 450. Somado ao lote (a), passa de mil: vai à perícia, como a carta já prevê.

## 4. O que fiz na fila

- O item 45 fechou, citando o X conferido no ar às 12h07 (D975d), e foi para `Arquivo_Morto/PENDENCIAS_FECHADAS.md`.
- O item 46 diz agora que o (a2) está feito e espera a perícia.

## 5. Agora

O lote (b) começa num ramo que nasce deste, `d1034-b-o-pedido`, sem esperar a perícia. Nele valem desde o começo as regras dos itens:

- 1: uma ação principal e o "Mais";
- 2: a linha abre;
- 4: os cartões abaixo de 720 px;
- 5: o "Filtros" e o "Mais" do alto.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
