# D1034b: o pedido pintado, no ramo do pedido

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 13h50
**Assunto:** o lote (b) feito no ramo `d1034-b-o-pedido`, com fotos de antes e depois; vai à perícia; nada na produção
**Responde:** `2026-11-10_de_CTO_para_Ordem_de_Compra_D1034f-o-lote-a-conferido-e-a-revisao-de-uso.md`, e o recado D1034g ("siga com o lote b")
**Espero de volta:** a perícia do (a), do (a2) e do (b), quando o Pedro disparar. Depois do laudo, a triagem com medida e a carta ao senhor, como manda o D1034g.

---

## 1. Em uma linha

O lote (b) está no ramo `d1034-b-o-pedido`, que nasce do `d1034-a-casca` em `17fba73`. O ramo está empurrado e **fora da produção**. A bateria passa inteira, **1.412 de 1.412**, com tipos e lint limpos. O ramo da casca não foi tocado.

As fotos de antes, tiradas do ramo da casca, estão em `docs/Capturas/2026-11-10_D1034b/antes/` (27). As de depois estão em `.../depois/` (26). Cada pasta tem o seu json de medidas. Foram tiradas na página de prova, com banco falso e dados inventados.

## 2. O que foi feito, em três passos

| Passo | Commit | O que ficou |
|---|---|---|
| 1 | `a825fa8` | **280 nomes velhos da ponte** trocados pelos do padrão. Valeu para as folhas da Nova OC, da importação, da entrega, do tutorial, do Procedimento, dos diálogos da qualificação, do Stepper e das Configurações. A tela não muda. A transição solta virou `--dur-resposta`. O branco solto do Stepper virou `--painel`. |
| 2 | `0ba6c14` | **A Nova OC.** No celular, as ações de apoio do alto (Tutorial, Visualizar o PDF, Emitir, Cancelar) vão para o "Mais", e nada some, porque o pé continua com Cancelar, Visualizar e Emitir. O título fica inteiro e a fila de botões desce. O vazio dos itens é o compacto, sem o mascote no meio do formulário. O desconto só fica vermelho quando existe. **43 letras abaixo de 13 px** subiram para 13 px. **4 regras de caixa alta** saíram. |
| 3 | o desta carta | **Caixa de frase nos rótulos que sobraram:** "Condição de pagamento", "Preço unit.", "+ Adicionar item", e nas Configurações "Importação de pedidos por IA", "Condições de pagamento", "Textos legais", "Condições de contratação" e "Instrução para envio de NF". |

A trava nova é `tests/components/PinturaDoLoteB.test.ts`, com 24 testes. Ela confere que nenhuma das dez folhas do lote tem nome da ponte, letra abaixo de 13 px, caixa alta ou cor solta. Também confere que a Nova OC tem o título inteiro, o "Mais" no celular e o vazio compacto.

## 3. As regras dos itens 1, 2, 4 e 5 no lote (b)

- **Item 1, uma ação principal.** Conferi tela por tela e diálogo por diálogo:
  - a entrega, o qualificar, o registro e a correção da qualificação, e a revisão do Procedimento têm um destaque cada, e o resto vai em contorno;
  - a importação só tem botões de contorno, porque a ação principal da tela continua sendo o "Emitir".
- **Item 2, a linha que abre.** Nenhuma tela do lote tem lista de linhas que abre coisa, porque a tabela de itens da Nova OC é de editar, então a regra não se aplica.
- **Item 4, os cartões abaixo de 720 px.** Também não se aplica, pelo mesmo motivo. Nenhuma tela do lote rola de lado a 375 px: as medidas dão 0 px na página e no conteúdo.
- **Item 5, o "Mais" do alto.** Aplicado na Nova OC, como descrito no passo 2.

## 4. O que pede o seu olho

1. **Mudou uma linha do `src/domain`.** Só o texto `VAZIO_DOS_ITENS`, que diz "+ Adicionar item" para bater com o botão. A regra não mudou.
2. **As fotos de depois são do passo 2.** As das Configurações ainda mostram os títulos com maiúscula no meio. O passo 3 só troca letras, e os testes provam a troca.
3. **O Procedimento não tem foto do texto.** Na página de prova ele diz "O texto do procedimento ainda não foi carregado", porque o banco falso não guarda o PS.02. As folhas dele foram pintadas e travadas, mas o olho só vê o texto na perícia ou na produção.
4. **O tutorial no celular não tem foto de depois,** porque agora ele mora no "Mais". O teste prova que o item está lá.
5. **Tamanho.** Fora de teste e de documento, o ramo do (b) muda 374 linhas e tira 340, quase tudo troca de nome. Os testes ganharam 77 linhas. Somado ao (a) e ao (a2), passa de mil. Vai à perícia, como o plano manda.

## 5. O que fiz na fila

O item 46 da PENDENCIAS diz agora que o (a2) foi aceito (D1034g), que o ramo da casca fica parado até a perícia, e que o (b) está feito e espera a perícia, com o laudo em `docs/Pericias/`.

## 6. Agora

Espero a campainha. O lote (c), o do mestre, só começa quando o senhor mandar.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
