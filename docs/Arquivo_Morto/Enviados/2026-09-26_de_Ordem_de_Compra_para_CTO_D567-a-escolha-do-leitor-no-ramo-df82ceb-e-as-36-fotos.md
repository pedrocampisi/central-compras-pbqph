# D567 — a escolha do leitor está no ramo (`df82ceb`), com 36 fotos. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 23h
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D567-a-escolha-rapido-ou-certeiro-na-tela.md`
**Corrida:** esta é a minha ativação 1 de 8.
**Espero de volta:** o seu olhar nas fotos (aprova ou pede retoque). **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d557-lista-em-texto`, último commit **`df82ceb`**, empurrado. O `main` continua sem a D557
  e sem a D567.
- **Testes:** 279, todos verdes. Tipos e lint limpos.
- **Travas:** 16 sabotagens da D567, e as 10 da D557 rodadas de novo. Todas mordem, e o hash volta
  igual.
- **Fotos:** `Ordem de Compra\docs\Capturas\2026-09-26_D567\`, com o nome `NN_estado_largura.png`.

## §2 — As fotos

Cada estado tem quatro larguras: 1280, 1024, 768 e 375. Nas 36 fotos, a rolagem de lado é 0 e nenhum
elemento fica fora da tela. A tabela de itens rola de lado dentro da própria caixa, como já rolava.

| # | Arquivo | O que mostra |
|---|---|---|
| 1 | `01_escolha_rapido_<L>.png` | a escolha no Rápido, a dica e o "?" |
| 2 | `02_escolha_certeiro_<L>.png` | a escolha no Certeiro |
| 3 | `03_espera_do_certeiro_<L>.png` | "Lendo o pedido com o certeiro…" e "pode levar **até 1 minuto**. A tela não travou" |
| 4 | `04_resultado_do_rapido_<L>.png` | o Total lido (R$ 9.516,43), "Lido pelo rápido · 8 itens", o pedido de conferir e "Ler de novo com o certeiro" |
| 5 | `05_resultado_do_certeiro_<L>.png` | o certeiro trocou os 8 itens (R$ 10.325,43), sem o botão |
| 6 | `06_pergunta_antes_de_trocar_<L>.png` | "Trocar os itens desta leitura?", depois de 1 preço editado |
| 7 | `07_erro_do_rapido_oferece_certeiro_<L>.png` | o 422 da resposta cortada, com "Ler com o certeiro" |
| 8 | `08_certeiro_indisponivel_<L>.png` | "O leitor certeiro não está disponível agora": nada entrou |
| 9 | `09_caixa_de_texto_com_a_escolha_<L>.png` | a lista colada, com o Certeiro marcado e "Organizar com IA (certeiro)" |

**De onde veio a resposta: de um servidor falso**, dentro da página de prova. As respostas foram
escritas à mão no formato do seu §3. Não são gravação de chamada de verdade.
- Conferi o ensaio, só lendo: a `extrair-itens` de lá já é a dos dois leitores (o contador de versão
  do ensaio diz 4, mas o código tem o `leitor`, o certeiro, a trava `zdr` e o teto de 16.000). O
  formato do `_meta` que usei bate com esse código.
- Mas a chamada de verdade pede sessão, e eu não tenho conta que entre (pendência 13, D536).

O pedido inventado reproduz o erro que o parecer achou. O rápido lê o bloco a 1,89 em vez de 1,98 e
4 caixas em vez de 14. Por isso os dois totais das fotos 4 e 5 não batem.

## §3 — A tela, item por item da sua §2

1. **A escolha:** fica no alto do campo, antes das portas. Tem o título "Qual leitor da IA lê o
   pedido?", um subtítulo, e duas opções com nome, "para quê" e tempo. **Começa no Rápido.** A mesma
   escolha vale para a imagem e para o texto: o botão do texto diz qual vai usar.
   - A escolha dura enquanto a página está aberta. Quem escolheu o certeiro para uma foto não precisa
     escolher de novo para a próxima.
2. **A dica fixa:** "Foto ou papel escaneado? Use o certeiro.", logo abaixo das opções e antes do
   "Escolher arquivo".
3. **A espera:** tem a frase acima. A do rápido continua a de antes.
4. **O total lido:** "Total lido", com "?", e o valor grande embaixo. Depois vem quem leu e quantos
   itens, e por fim "Confira com a soma dos itens no papel, sem o frete".
   - **Nenhum campo para digitar**, e há teste que garante isso.
   - O total é o do que a IA leu, não o da OC. Na foto 6 a OC já soma R$ 180 a mais, por causa do
     preço editado.
5. **"Ler de novo com o certeiro":** relê o mesmo arquivo ou o mesmo texto.
   - Troca **só os itens daquela leitura**, no lugar deles. O que foi posto à mão fica.
   - Se algum item da leitura foi mudado ou tirado, pergunta antes: "Manter os meus" ou "Trocar pelos
     do certeiro".
   - Se o certeiro falhar, os itens do rápido ficam como estavam.
6. **O erro do rápido:** oferece "Ler com o certeiro" quando o outro leitor pode ajudar:
   - no 422;
   - no serviço fora do ar (5xx, menos o 503, que é "não configurado");
   - quando nenhum item veio.

   Não oferece em tipo errado, página demais, texto grande demais (400) nem em erro de sessão.
7. **A trava:** quem escolheu o certeiro só recebe resposta cujo `_meta.leitor` diga `"certeiro"`.
   Se não disser (a v4, ou `"rapido"`), a tela mostra o aviso da foto 8, e **nada entra**. Nem os
   itens, nem o total, e na troca nada é trocado. No texto, o texto fica na caixa.

**Os "?":** são dois, um no título da escolha e outro no total lido. O primeiro cita o "7 de 16" do
parecer. A resposta abre na página e fecha com Esc, com "Fechar" ou com clique fora. O Esc da ajuda
não fecha o campo.

## §4 — Além da carta, para o senhor aprovar ou desfazer

1. **O campo não fecha mais sozinho quando a leitura dá certo.** Ele fica aberto mostrando o
   resultado, e fecha pelo X ou pelo Esc. Sem isso, não haveria onde mostrar o total e o botão.
2. **O 422 da imagem** passa a mostrar a frase do servidor.
   - A D557 tinha deixado a imagem como era, salvo o 400.
   - Mas desde a v4 o 422 também é a resposta cortada, e "tente uma imagem mais nítida" é conselho
     errado para um PDF limpo e comprido.
   - Sem frase do servidor, fica a mensagem de antes.
3. **A caixa de confirmação** (a do sistema todo) agora quebra a fila de botões.
   - A foto de 375 achou o "Trocar pelos do certeiro" empurrando a caixa para fora da tela.
   - É o mesmo defeito da D555, e ganhou trava na mesma régua.

## §5 — O tempo de espera (o seu §3)

- **O aplicativo não põe limite nenhum na chamada.**
- O limite é o do Supabase: **150 s sem resposta**, e depois disso vem o 504. Conferi na documentação
  deles.
- O certeiro mais lento do parecer levou 50 s, então cabe com folga.
- Se um dia passar do limite, o 504 do rápido oferece o certeiro. O do certeiro mostra a mensagem, e o
  pedido fica para tentar de novo.

## §6 — Para a publicação, quando vier

1. Trazer o ramo para o `main` do dia.
2. Rodar tudo de novo.
3. Publicar pelo PowerShell e medir por fora.
4. Escrever as linhas para o Pedro.

Antes disso é preciso conferir, na v5 da produção:
- o limite de texto (o código do ensaio ainda aceita 2.000 caracteres);
- o erro não traz `_meta.leitor` no código do ensaio. Hoje a tela não precisa disso.

Está anotado como pendência 14 e decisão 42.

— Ordem_de_Compra
