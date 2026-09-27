# D570 — os dois retoques estão no ramo (`2f499c1`), com as fotos refeitas. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 23h5x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D570-a-tela-aceita-dois-retoques-antes-do-Pedro.md`
**Corrida:** esta é a minha ativação 2 de 8.
**Espero de volta:** o seu olhar nas fotos refeitas. **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d557-lista-em-texto`, último commit **`2f499c1`**, empurrado. O `main` continua sem a D557, a
  D567 e a D570.
- **Testes:** 285, todos verdes. Tipos e lint limpos.
- **Travas:** 7 sabotagens novas (17 a 23). Todas mordem, e o hash volta igual.
- **Fotos:** a mesma pasta, `Ordem de Compra\docs\Capturas\2026-09-26_D567\`, agora com 40.

## §2 — Retoque 1: uma mensagem de cada vez

- A mensagem de leitura agora tem uma **chave**, e a mensagem nova tira a velha da mesma chave. As outras
  mensagens do sistema não mudam: há teste que garante isso.
- A troca diz **"O certeiro trocou os 8 itens."**
- **Foto 05, nas quatro larguras:** aparece só essa mensagem.
- **Uma coisa que fica, para o senhor saber:** a 375, essa mensagem única ainda cobre metade do botão
  laranja por 3,4 s, e depois some. Toda mensagem do sistema faz isso. Não mexi no lugar das mensagens,
  porque vale para o sistema inteiro e não foi pedido. Se quiser, é uma carta à parte.

## §3 — Retoque 2: o 422 cortado, na imagem

- **O que escolhi:** na imagem, sai a frase que fala da "lista", e entra **"Se foram várias páginas, mande
  menos de cada vez."** O teto é da leitura inteira, então menos páginas ajudam. Ao lado continua o "Ler
  com o certeiro".
- **Frase do servidor que não fala da lista** passa como veio.
- **Na caixa de texto, a frase inteira fica.**
- **A trava** usa a frase real do servidor, copiada do código da `extrair-itens`.
- **Foto 07:** a imagem. **Foto 10, nova:** a caixa de texto, com a frase inteira.
- A frase ajustada continua sendo tratada como "do servidor": vai para a tela sem o prefixo "Erro na
  importação:". Há sabotagem para isso.

## §4 — As fotos refeitas

| # | Arquivo | O que mostra |
|---|---|---|
| 4 | `04_resultado_do_rapido_<L>.png` | refeita; saiu **idêntica, byte a byte** |
| 5 | `05_resultado_do_certeiro_<L>.png` | uma mensagem só: "O certeiro trocou os 8 itens." |
| 7 | `07_erro_do_rapido_oferece_certeiro_<L>.png` | o 422 da imagem, sem o conselho da lista |
| 10 | `10_erro_do_texto_com_a_frase_inteira_<L>.png` | o 422 na caixa de texto, com a frase inteira |

- **Medida:** rolagem de lado 0 e nada fora da tela, nas 16.
- **De onde veio a resposta:** do mesmo servidor falso dentro da página. Agora o 422 dele usa a frase real
  do servidor, palavra por palavra.

— Ordem_de_Compra
