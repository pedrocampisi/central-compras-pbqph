# D567 — A escolha do leitor na tela: rápido ou certeiro

**De:** CTO · **Para:** `Ordem de Compra` · **Data:** 26/09/2026, 22h4x
**Decisão:** D567 (a corrida) sobre a D566 (a triagem do parecer 4) · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Corrida:** largada às 22h4x, com freio de 8 ativações batido pelo Pedro. Esta é a sua ativação 1.
**Espero de volta:** uma carta curta na minha `Devolucoes\`, com as fotos, e a **campainha de volta** (lei 3 §7.1).
**NÃO PUBLIQUE.** A publicação espera o Pedro olhar as fotos.

## §0 — A palavra do Pedro

- **Às 21h25, na janela do Pesquisador,** ele trouxe à minha às 22h1x: a leitura do pedido do fornecedor passa a ter
  **dois leitores**, e **a pessoa escolhe** qual usa. Nada de escolha automática. Na OC a pessoa vê o resultado na hora;
  se saiu ruim, manda ler de novo com o outro.
- **Na minha janela, às 22h4x:** "sim, 8. janelas abertas, pode largar".

A sua D559 (a D557 guardada no ramo) **volta agora**. O parecer que mediu os dois leitores está em
`Pesquisador\docs\Pareceres\2026-09-26_parecer_D556-D565-modelo-le-pedido-OC.md`.

## §1 — O que o parecer mediu, para a tela dizer a verdade

| | Rápido (o de hoje) | Certeiro |
|---|---|---|
| Papel limpo (PDF do fornecedor) | acertou tudo | acertou tudo |
| Foto, papel escaneado, página de lado, letra miúda | **errou preço em 7 de 16 leituras** | não errou nenhum |
| Espera na tela | uns 7 s | uns 16 s; até 50 s em 5 páginas fotografadas |

**O erro que a tela precisa ajudar a pegar.** Em 6 dos 7 erros do rápido, o total lido **não bate** com o do papel.
No outro, uma foto de página de lado, o total bateu no centavo com o preço de 8 linhas trocado entre si.

## §2 — O que construir, no ramo `d557-lista-em-texto` (`320dd21`)

Construa no ramo da D557, para a publicação levar tudo junto.

1. **A escolha, antes de ler:** duas opções, **Rápido** e **Certeiro**, cada uma com uma linha que diga para quê.
   - O rápido é para o PDF do fornecedor e o papel limpo, e leva uns segundos.
   - O certeiro é para foto, papel escaneado e tabela cheia, e leva até 1 minuto.
   - **A tela começa no Rápido.** A pessoa troca com um clique.
   - A mesma escolha vale para a **imagem** e para a **caixa de texto** da D557.
2. **A dica fixa, perto do botão de ler:** "Foto ou papel escaneado? Use o certeiro."
3. **A espera dita na tela.** Quando o certeiro está lendo, a tela diz que pode levar até 1 minuto. Ninguém deve achar
   que travou.
4. **O total lido em destaque, no resultado.** Diga qual leitor leu, e peça para conferir o total com o total do
   papel.
   - **Não crie campo para a pessoa digitar o total do papel.** É um passo novo, e o Pedro recusa passo novo quando
     existe caminho sem ele.
5. **O botão "Ler de novo com o certeiro"** no resultado do rápido.
   - Ele troca os itens lidos pelos do certeiro.
   - **Se a pessoa já editou algum item, a tela pergunta antes.** Nada some calado.
6. **O erro do rápido.** Quando a leitura volta com erro (o 422 da resposta cortada, ou outro), a mensagem oferece "Ler
   com o certeiro".
7. **A trava contra o engano:** a tela confere o `_meta.leitor` da resposta.
   - Se a pessoa escolheu o certeiro e a resposta não diz `"certeiro"`, a tela **avisa que o certeiro não está
     disponível**. Nunca mostra a leitura do rápido como se fosse do certeiro.
   - **O motivo:** a função que está no ar hoje (v4) ignora o campo `leitor` e lê sempre pelo rápido.

**A régua de tela do Pedro (D475):** cada campo diz o que é, com título, subtítulo e contexto. E toda dúvida ganha um
"?".

## §3 — O contrato com a função (o Banco está fazendo agora a v5)

**A entrada:** a mesma de hoje, mais o campo `leitor`, com o valor `"rapido"` ou `"certeiro"`, nas duas formas:
- `{ imagens: [...], leitor }`
- `{ texto, leitor }`

Sem o campo, a função lê pelo rápido. Qualquer outro valor volta 400.

**A saída:** a mesma de hoje. O `_meta` ganha dois campos:
- `leitor`: `"rapido"` ou `"certeiro"`;
- `provedor`: quem atendeu, em texto.

O `modelo` passa a dizer o modelo que leu.

**Os tempos:** o teto de resposta sobe para 16.000 nos dois leitores. O 422 continua existindo, mas raro. O certeiro
pode levar até 1 minuto: confira se o tempo de espera da sua chamada aguenta isso.

## §4 — As fotos

- **Onde:** na sua pasta de provas de sempre, numeradas, com o caminho na carta.
- **Larguras:** 1280, 1024, 768 e 375.
- **Os estados:**
  1. a escolha, com o Rápido marcado e a dica;
  2. a escolha, com o Certeiro marcado;
  3. a espera do certeiro;
  4. o resultado do rápido, com o total em destaque e o botão "Ler de novo com o certeiro";
  5. o resultado do certeiro;
  6. a pergunta antes de trocar itens já editados;
  7. o erro do rápido, oferecendo o certeiro;
  8. o aviso de "certeiro não disponível";
  9. a caixa de texto com a escolha.
- **De onde vem a resposta:** se a v5 já estiver no ensaio quando você fotografar, o resultado sai de chamada de
  verdade. Se não estiver, sai de resposta gravada. **Diga na carta qual foi.**

**A bateria verde,** com os testes novos da escolha, da troca e da trava do `_meta.leitor`.

**Não publique.** Eu olho as fotos, aprovo ou peço retoque, e levo ao Pedro. Com o "sim" dele, a publicação sai junto
com a caixa de texto da D557, depois da v5 na produção e da medida do texto. O aviso de publicar vai por carta
minha.

— CTO
