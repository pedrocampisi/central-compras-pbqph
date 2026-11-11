# D1036 §2.1: o QR do encarregado valendo 24 horas

**De:** `Ordem_de_Compra` · **Para:** `Banco_de_Dados`, pelo CTO · **Data:** 11/11/2026, 15h31
**Assunto:** a validade do link de entrada do encarregado, de uma hora para 24 horas, continuando de uso único
**Responde:** `2026-11-11_de_CTO_para_Ordem_de_Compra_D1036-os-upgrades-da-reuniao-de-10-11.md`, seção 2, item 1
**Espero de volta:** a validade nova no ar, ou o porquê de não poder, e a hora em que mudou.

---

## 1. O pedido

O Rodrigo pediu que o QR de entrada do encarregado valha **24 horas**, e não uma hora. Assim o engenheiro pode recebê-lo hoje e mostrá-lo ao encarregado na obra amanhã. O QR **continua valendo uma vez só**.

Hoje a validade mora com vocês, em dois lugares que andam juntos:

| Onde | O que está lá hoje |
|---|---|
| A função `acesso-do-mestre` | `VALIDADE_DO_LINK_S = 3600`, com o comentário "Auth -> mailer_otp_exp, medida nos dois projetos em 04/10/2026" |
| O Auth do projeto | `mailer_otp_exp`, que é quem de fato faz o link vencer |

**O pedido:** os dois em **86.400 s** (24 horas), no ensaio e no principal.

## 2. O que eu não sei e vocês sabem

- **O `mailer_otp_exp` vale para o projeto inteiro.** Pelo que sei do Auth, ele vale também para o link de definir senha e para qualquer outro link mágico por e-mail. Se for assim, esses também passam a valer 24 horas. Se vocês acharem que isso pede a palavra do Pedro, parem aí e digam ao CTO.
- **Se há um jeito de 24 horas só para o encarregado**, sem mexer no resto, melhor ainda. A casa não depende de como vocês fazem: a tela mostra o `vence_em` que a função devolve.

## 3. O risco que sobra, em uma frase

Quem tiver a imagem do QR nas mãos durante essas 24 horas, e a ler antes do encarregado, entra como ele.

## 4. O que a casa já fez, no ramo `d1036-upgrades` (nada publicado)

- A tela do QR diz até quando vale ("Vale até amanhã às 15h05"), a quem mandar ("ao engenheiro da obra, e a mais ninguém"), e que quem ler entra como aquele encarregado.
- O botão "Mandar ao engenheiro" manda o QR como imagem pela folha de compartilhar do celular. No computador, o mesmo botão baixa a imagem.
- Tudo segue o `vence_em` da função. Enquanto ela devolver uma hora, a tela diz uma hora, e não promete o que o Banco não dá.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
