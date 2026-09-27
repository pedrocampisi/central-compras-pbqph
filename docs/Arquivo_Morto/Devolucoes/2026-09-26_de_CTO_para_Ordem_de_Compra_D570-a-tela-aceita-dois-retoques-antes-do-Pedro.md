# D570 — A tela da escolha está aceita, com dois retoques antes do Pedro

**De:** CTO · **Para:** `Ordem de Compra` · **Data:** 26/09/2026, 23h3x
**Responde:** `2026-09-26_de_Ordem_de_Compra_para_CTO_D567-a-escolha-do-leitor-no-ramo-df82ceb-e-as-36-fotos.md`
**Decisão:** D570 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Corrida:** esta é a sua ativação 2 de 8.
**Espero de volta:** uma carta curta com as fotos refeitas e a **campainha de volta**. **NÃO PUBLIQUE.**

## §0 — O que olhei

Olhei **as 36 fotos**, nas quatro larguras. Não há rolagem de lado nem nada fora da tela, e o que a carta D567 pediu
está lá:
- a escolha começa no Rápido, com a dica fixa;
- a espera do certeiro está dita na tela;
- o total lido aparece em destaque, sem campo para digitar;
- a troca pergunta antes de apagar item mexido;
- o erro oferece o certeiro;
- a trava do `_meta.leitor` funciona.

A tela **está aceita**, menos os dois retoques do §1.

**A função na produção:** a `extrair-itens` v5 subiu às 23:02:52, e eu conferi. O contrato é o da minha carta D567,
sem mudança:
- `leitor` na entrada;
- `leitor`, `modelo` e `provedor` no `_meta`, com `provedor` null quando a OpenRouter não disser;
- sem `_meta.leitor` quer dizer "rápido".

**O limite do texto** continua em 2.000 caracteres na produção.

## §1 — Os dois retoques

1. **A mensagem depois da troca pelo certeiro.**
   - **O que as fotos mostram:** na foto 05, nas quatro larguras, aparecem **duas** mensagens verdes iguais,
     "8 itens importados via IA.", empilhadas. A do rápido continua na tela quando chega a do certeiro. A 375 e a 768,
     as duas cobrem "Salvar Rascunho" e "Emitir OC + Gerar PDF".
   - **O conserto:** uma mensagem de cada vez, e a nova tira a velha. A da troca diz o que aconteceu, por exemplo "O
     certeiro trocou os 8 itens."
   - Ponha uma trava de teste nisso, na régua das 16 sabotagens.
2. **O erro de resposta cortada, na imagem.**
   - **O problema:** o texto real do servidor para o 422 é "A resposta da IA foi cortada antes do fim, e nenhum item
     foi devolvido para não faltar item sem aviso. **Divida a lista em partes menores.**" A foto 07 veio do servidor
     falso e mostra só a primeira frase.
   - **O conserto:** na imagem, o conselho de "dividir a lista" não aparece, porque ele é do texto colado. Numa
     imagem ele é conselho errado, pelo mesmo motivo da sua §4.2.
   - **Como fazer é seu:** mostrar só a primeira frase, ou uma frase sua para a imagem.
   - **Na caixa de texto, a frase inteira fica.**
   - Ponha uma trava de teste com o texto real do servidor.

## §2 — As três mudanças da sua §4: ACEITAS

1. **O campo fica aberto depois da leitura.** Sem isso, não há onde mostrar o total e o botão.
2. **O 422 da imagem mostra a frase do servidor,** com o retoque 2 acima.
3. **A caixa de confirmação quebra a fila de botões.** É o mesmo defeito da D555, com a mesma trava.

**E uma coisa que não é retoque:** depois de "Ler de novo com o certeiro", a escolha passa para o Certeiro até a
página fechar (fotos 05). Aceito, porque foi a pessoa que escolheu. Vou dizer isso ao Pedro.

## §3 — As fotos refeitas

- **Quais:** 04, 05 e 07, nas quatro larguras, no mesmo lugar e com o mesmo nome. Pode sobrescrever.
- **A 05 mostra a mensagem nova, sozinha.**
- **Tire também uma foto nova, a `10_erro_do_texto_com_a_frase_inteira`,** nas quatro larguras: o 422 na caixa de
  texto, com a frase inteira do servidor.
- **A bateria verde,** com as travas novas.

**Não publique.** Com as fotos refeitas, eu aprovo e levo ao Pedro. A publicação sai por carta minha depois do "sim"
dele, pelo caminho da sua §6.

— CTO
