# D582 — o rápido primeiro: os três textos novos, no ramo `2482612`. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 09h4x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D582-o-rapido-primeiro-o-texto-da-escolha.md`
**Espero de volta:** o seu olhar nas fotos e a carta de publicar. **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d582-rapido-primeiro`, commit **`2482612`**, empurrado. O `main` continua sem ele.
- **O que mudou:** só `src/domain/leitor.ts`, com os três textos da sua tabela, palavra por palavra.
- **Ficou igual:** as duas esperas, o título, o subtítulo, a ordem, o Rápido marcado ao abrir, as cores e o ícone.
- **Bateria:** 297 testes verdes, tipos e lint limpos.

## §2 — As travas

- **As três que conferem os textos** mudaram junto com eles.
- **Uma trava nova:** a espera do rápido ("Leva uns segundos.") agora também é conferida. Antes, só a do certeiro era.
- **4 sabotagens, todas mordendo,** com o hash de volta igual:
  1. o rápido volta ao texto antigo;
  2. o certeiro volta ao texto antigo;
  3. a dica volta ao texto antigo;
  4. a espera do rápido muda.

## §3 — As fotos

Estão em `docs\Capturas\2026-09-27_D582\`: os 10 estados a 1920 × 1080 e a 01 a 375. Mandei também o antes da 01, nas
duas larguras, com o sufixo `_antes`.

- **A escolha aparece em 6 estados:** 01, 02, 07, 08, 09 e 10. Nos seis, o texto mudou.
- **Nos outros 4** (03, 04, 05 e 06) a escolha não está na tela. As fotos saíram **idênticas às de antes, byte a
  byte**.
- **Nas 11 fotos:** rolagem de lado 0 e nada fora da tela.

## §4 — Um texto quebra em mais linhas que o antigo (o senhor pediu que eu dissesse)

- **A dica** passou de 1 linha para **2 a 1920**, e de 2 para **3 a 375**.
  - A 1920, a segunda linha fica só com a palavra "conta.". A coluna da escolha tem 560 px, e a frase passa dela por
    pouco.
  - Tudo o que vem abaixo desce 20 px. Nada se sobrepõe e nada sai da tela.
- **Os dois "para quê"** continuam em 2 linhas, nas duas larguras.

**Não mexi.** Se o senhor quiser a dica numa linha só a 1920, há dois caminhos:
- um texto mais curto — é seu, com o Pedro;
- ou a dica usar a largura toda do campo, e não só a coluna da escolha — é meu, por carta.

## §5 — Outro texto que manda ao certeiro antes do rápido

**Não achei nenhum.** Procurei em todos os textos da tela que falam do certeiro:
- os dois "?" (que ficam, como o senhor disse);
- o "Ler de novo com o certeiro" e o "Ler com o certeiro" do erro;
- a pergunta antes de trocar;
- o aviso do certeiro indisponível.

Todos falam do certeiro **depois** do rápido, ou quando o rápido falhou.

Um detalhe, só para o senhor saber: o "?" dos leitores começa com "Os dois leem o mesmo pedido, e você escolhe". Ele
põe os dois como iguais, mas termina com "Na dúvida, leia com o rápido". Não mudei.

— Ordem_de_Compra
