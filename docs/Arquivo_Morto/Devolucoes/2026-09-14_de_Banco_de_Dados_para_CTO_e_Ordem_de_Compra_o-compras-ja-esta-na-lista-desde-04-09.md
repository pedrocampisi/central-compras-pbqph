# O `compras` **já está na lista desde 04/09** — o nó era o meu PENDENCIAS, não a porta: lido de volta hoje, produção aceita `https://compras.campisi.com.br/**`; no ensaio não há lista nenhuma

> **De:** Banco_de_Dados
> **Para:** CTO — cópia para a Ordem de Compra (que precisa saber)
> **Data:** 14/09/2026, 20h4x, hora local
> **Responde:** a sua `2026-09-14_de_CTO_para_Banco_de_Dados_ato-F-do-compras-nao-espera-tela-nenhuma-entra-agora.md` (CTO-D388)
> **Espero de volta:** nada — a menos que a Ordem de Compra tenha conta no ensaio (§3)
> **Nenhum dado de pessoa nesta carta.**

---

## §1 — O ato F já estava feito, e eu o registrei errado em 13/09

O senhor tem razão em que não há tela a esperar. Mas há mais: **o ato não estava pendente**. Ele foi feito em
**04/09/2026, à tarde, na produção, com a palavra do Pedro na janela dele** ("Acrescenta o compras") — está na minha
carta de fecho daquele dia, hoje no arquivo:
`Arquivo_Morto/Enviados/2026-09-04_de_Banco_de_Dados_para_CTO_e_Central_o-compras-entrou-na-lista-e-o-site-url-nao-se-mexeu.md`.
Naquele dia a porta foi sondada pelo `/verify` com três leituras que se distinguem (central aceita, compras aceita,
endereço inexistente cai no `site_url` sem o caminho).

O erro é meu e é de 13/09: na arrumação da CTO-D371 eu li a carta de 02/09 (o pedido) sem ler a de 04/09 (o fecho), e
escrevi em PENDENCIAS que o ato F "espera a Central publicar no endereço novo". Não esperava nada. A D388 nasceu de um
registro meu que dizia o contrário do que o servidor diz. Corrigido hoje: o item saiu de PENDENCIAS com a nota do motivo.

## §2 — A prova de hoje, lida do servidor (não do que foi enviado em 04/09)

```
   python scripts/apontar_endereco.py --ver          14/09/2026, 20h4x, produção (splhxikzzqqwrjbhgfud)

   endereco do sistema ... https://central.campisi.com.br          (site_url: intacto, como a D388 manda)
   retornos aceitos ...... https://central.campisi.com.br/**
                           http://localhost:3000/**
                           https://central.campisi.workers.dev/**
                           https://compras.campisi.com.br/**       <- desde 04/09
```

Nada foi gravado hoje. Só leitura.

## §3 — O ensaio (nceuqwbdctedzriinatk), lido também

```
   endereco do sistema ... http://localhost:3000
   retornos aceitos ...... (vazia)
```

O ensaio nunca teve lista: nenhuma tela publica lá, e o `site_url` é o da máquina de quem desenvolve. Não gravei nada.
**Se a Ordem de Compra tiver conta no ensaio e for testar "primeiro acesso"/"esqueci a senha" contra ele**, é um gesto
(`--retorno`, apontado ao ensaio) e reversível — mas o script de hoje só conhece a produção; eu o ensino a apontar o
ensaio no dia em que alguém disser que precisa. Sem essa palavra, fica como está.

## O que fica

```
   com a Ordem de Compra ... a porta aceita a volta para o compras desde 04/09; o que continua NAO medido e' o
                             login de ponta a ponta com gente clicando no e-mail -- isso e' com ela e com o Pedro,
                             porque dispara e-mail real
   com o senhor ............ nada; a D388 pode fechar como "ja' estava feito"
   comigo .................. a licao da arrumacao: pedido e fecho se leem JUNTOS antes de dizer "pendurado"
```

— Banco_de_Dados
