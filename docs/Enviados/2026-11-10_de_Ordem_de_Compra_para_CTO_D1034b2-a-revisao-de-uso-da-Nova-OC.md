# D1034b2: a revisão de uso da Nova OC, os dez itens

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 14h08
**Assunto:** o lote (b2) feito no ramo `d1034-b-o-pedido`, com a conta dos cliques e as fotos de antes e depois; nada na produção
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034h-o-lote-b-aceito-e-a-revisao-de-uso-da-Nova-OC.md`
**Espero de volta:** nada para seguir. O lote (c) começa num ramo que nasce deste, como a carta manda. A segunda perícia olha o (b), o (b2) e o (c) juntos.

---

## 1. Em uma linha

Os dez itens estão no ramo `d1034-b-o-pedido`, empurrado, e **fora da produção**.

- A bateria passa inteira: **1.422 de 1.422**, com tipos e lint limpos.
- O `conferir_casas` dá "em dia".
- A trava nova é `tests/components/NovaOcRevisaoDeUso.test.tsx`, com dez testes, um por item.
- Regra de negócio não mudou: a emissão confere qualificação, filial, data, quantidade e destinatário como antes.

As fotos de antes são do lote (b), e as de depois são do (b2). Estão em `docs/Capturas/2026-11-10_D1034b2/antes/` e `.../depois/`, com 16 fotos e um json de medidas cada. Foram tiradas na página de prova, com banco falso e dados inventados.

## 2. Os dez itens

| # | O que ficou | Medida ou foto |
|---|---|---|
| 1 | **No alto, só "Salvar rascunho" e o "Mais"**, em toda largura. O "Mais" tem Tutorial, Visualizar o PDF e Cancelar. O "Emitir a OC" existe uma vez só, no pé, e é o único destaque da tela. O "?" ao lado dele diz que o PDF sai junto. | `depois_novaoc_vazia_dia_1366` |
| 2 | **O pé gruda embaixo**: o total geral à esquerda, e "Salvar rascunho" e "Emitir a OC" à direita. No celular ele fica logo acima da barra. É a candidata nova `cc-pe-fixo`, a sétima. **Com 12 itens e a página rolada até o meio, o "Emitir" fica à vista nas duas larguras.** Antes, ele ficava a 1.164 px do topo (tela de 768) e a 1.373 px (tela de 812). Agora o pé ocupa de 703 a 768 px a 1.366. A 375 ele ocupa de 652 a 747 px, e a barra começa em 747. | `depois_novaoc_12itens_meio_dia_375`, `antes_novaoc_12itens_meio_dia_375` |
| 3 | **Antes**, o clique em "Emitir" com campo faltando punha um aviso que sumia sozinho: "Selecione um fornecedor.", "Selecione uma obra." ou "Adicione ao menos um item.". A obra só era conferida depois da filial e da qualificação, e o foco não saía do botão. **Agora** o botão fica ligado, e ao lado dele uma linha diz o que falta, por exemplo "Falta o fornecedor, a obra e pelo menos 1 item". O botão aponta essa linha para o leitor de tela. O clique leva o foco ao primeiro campo que falta, sem janela. A lógica é pura, em `src/domain/faltaParaEmitir.ts`. | `depois_novaoc_vazia_dia_1366` |
| 4 | Na tela vazia há **um "+ Adicionar item" só**, dentro do vazio. A fila de baixo só aparece quando já há item, ou com o campo da IA aberto. | `depois_novaoc_vazia_sem_oferta_dia_1366` |
| 5 | **"Importar de um orçamento (IA)" é botão de contorno**, ao lado do "+ Adicionar item", no vazio e na fila. Troquei o nome no tutorial (o texto do vazio e a dica) e nos documentos da casa (`Agente.md`, `Fluxo.md`, guia do desenvolvedor). A casa não tem manual da equipe. | idem |
| 6 | As Observações saíram da identificação e vêm **depois dos Totais**. O topo dos itens a 1.366 por 768 subiu de **797 para 634 px** com a oferta do tutorial na tela. Sem a oferta, subiu de **691 para 527 px**, e o vazio inteiro, com as duas portas, cabe na primeira tela. A 375 subiu de 982 para 870, e o celular continua rolando, como é de esperar. O tutorial não aponta as Observações, por isso a ordem dos passos não mudou. | `depois_novaoc_vazia_sem_oferta_dia_1366`, `antes_novaoc_vazia_sem_oferta_dia_1366` |
| 7 | **A oferta do tutorial** aparece até a pessoa emitir a primeira OC (novo), tocar "Agora não" ou abrir o tutorial pela oferta. Depois o tutorial mora no "Mais". **A escolha fica guardada hoje** no `localStorage` do navegador, na chave `oc-tutorial-nova-oc-oferecido:` seguida do id da pessoa: é por pessoa e por navegador, e em outro computador a oferta volta uma vez. Guardar em qualquer lugar seria coluna no banco, e esta casa não altera o banco. | trava no teste |
| 8 | **Os Totais viraram cartão à direita**, de 300 a 380 px, na beirada da tabela dos itens, e as Observações ocupam o lado que ficava vazio. O cartão guarda só as parcelas, e o total geral está no pé. No celular, os Totais vêm antes das Observações. | `depois_novaoc_12itens_pe_noite_1366` |
| 9 | **Caixa de frase**: "Nova ordem de compra", "Salvar rascunho", "+ Adicionar item", "Condição de pagamento" e "Total geral" (era "TOTAL GERAL:"). A trava procura os nomes velhos. | as fotos |
| 10 | A conta dos cliques e dos Tab, na seção 3. | `medidas_antes.json`, `medidas_depois.json` |

## 3. A conta dos cliques

Contei pelo código e pelas fotos, sem uma pessoa de verdade. O teste de gente continua sendo do senhor.

| Caminho | Antes (b), a 1.366 | Antes (b), a 375 | Depois (b2), nas duas larguras |
|---|---|---|---|
| Emitir uma OC com um item digitado | 9 cliques: fornecedor 2, obra 2, "+ Adicionar item" 1, três campos do item, "Emitir" 1 | 10 cliques ("Mais" e "Emitir OC + PDF") ou 9 e uma rolada até o pé | **9 cliques, sem rolar** |
| Emitir de um orçamento importado | 5 e as conferências: importar 1, escolher o arquivo 1, obra 2, "Emitir" 1, mais um "Está certo" por campo em dúvida. O botão da IA ficava abaixo da primeira tela: mais uma rolada | igual, com a rolada | **5 e as conferências, sem rolar**: o botão da IA está na primeira tela, sem a oferta |
| Duplicar do Histórico e emitir | 3: "Mais" 1, "Duplicar" 1, "Emitir" 1 | 4 ("Mais" e "Emitir" no alto) ou 3 e uma rolada | **3, sem rolar** |

**Tab do campo Fornecedor até o "Emitir":** com a OC vazia, **19 antes e 16 depois**. Com um item, **27 antes e 25 depois**. As medidas são iguais a 1.366 e a 375.

O ganho é a rolada e o nome único, mais que o número de cliques. Se o senhor quiser menos cliques de verdade, o próximo passo seria o fornecedor e a obra virem do último pedido da pessoa, e isso é regra, não pintura.

## 4. O que pede o seu olho

1. **Nova linha no `src/domain`:** o arquivo `faltaParaEmitir.ts`, de lógica pura e testada. Os textos do tutorial também mudaram (`VAZIO_DOS_ITENS`, a dica da importação e o "?" do Emitir). Nenhuma regra mudou.
2. **"Ver o tutorial" também encerra a oferta**, como era desde a D763. A carta fala só de emitir e de "Agora não". Se o senhor quiser que a oferta continue depois de a pessoa ver o tutorial, é uma linha.
3. **No celular o pé tem 95 px**: o total, a frase do que falta, e os dois botões com o "?" na mesma linha. Os botões ganharam folga menor dos lados para caber nos 343 px.
4. **O pé gruda medido por dentro da folga do miolo.** O navegador desconta os 64 px de baixo, por isso a regra usa `bottom` negativo. A conta está escrita na candidata.
5. **Tamanho:** o (b2) muda 271 linhas e tira 149 fora de teste e de documento. Os testes ganharam cerca de 150. Tudo vai à segunda perícia, junto com o (b) e o (c).

## 5. Agora

O lote (c), o do mestre, começa num ramo que nasce deste, `d1034-c-o-mestre`, sem esperar a sua resposta. Nele valem as mesmas regras: uma ação principal, o nome igual e o alcance do polegar.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
