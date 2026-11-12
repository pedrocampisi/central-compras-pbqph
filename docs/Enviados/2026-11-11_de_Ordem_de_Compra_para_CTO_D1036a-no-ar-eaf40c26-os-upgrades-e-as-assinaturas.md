# D1036a: os upgrades da seção 2 no ar em eaf40c26, com as assinaturas na página 1

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 11/11/2026, 22h08
**Assunto:** o PDF não deixa mais as assinaturas sozinhas numa página; a seção 2 inteira, com o item 7, publicada
**Responde:** a sua mensagem CTO-D1036a, de 11/11 às 22h
**Espero de volta:** o olho do Pedro no celular dele.

---

## 1. Em uma linha

A seção 2 inteira está no ar desde as **22h06 de 11/11**, na versão **`eaf40c26-5dbd-4a8f-a2ec-448fbf28ff73`**. Ela leva os itens 1 a 7 e as assinaturas do item 4.

- O pacote é `20261112010627-7d23e07`. A `main` está em `7d23e07`, com o CI verde (run 43132094758). O ramo `d1036-upgrades` entrou nela num avanço simples, sem mesclagem.
- **O desfazer é `44e9ce89-4b3b-448b-a7b1-0f28ec85a7be`**, a D1034p, que era o que estava no ar. Pelo PowerShell: `pnpm exec wrangler rollback 44e9ce89-4b3b-448b-a7b1-0f28ec85a7be`.
- **Medido por fora:** os 45 arquivos do pacote são iguais, byte a byte, aos do `dist/`, e a página também. O `versao.txt` do ar diz `20261112010627-7d23e07`.
- A bateria passa inteira: **1.477 de 1.477**, com tipos e lint limpos. O `conferir:pacote` deu 5 de 5. O `conferir` deu 6 de 7, e a falha é a de sempre: as cartas de hoje ainda não chegaram às caixas de quem recebe.

## 2. As assinaturas, item 1 da sua mensagem

| O que mudou | Como ficou |
|---|---|
| As assinaturas descem até o espaço do rodapé | A linha da assinatura pode ir até 6 mm acima da linha do rodapé. Antes, ela parava 16 mm acima. A legenda termina antes da linha do rodapé. |
| Um espaço em branco contado duas vezes | Depois das condições havia 4 mm de folga, e mais 8 mm até a assinatura. Ficaram cerca de 8 mm do último texto até a linha da assinatura. |
| As condições andam com as assinaturas | Se as duas não cabem no resto da página, as condições descem junto. A página 2 nunca leva só as assinaturas. |
| O que não mudou | O que está escrito, o 12,5 do endereço e o 9,5 da observação. Não mexi nos outros quadros. |

**As provas** estão em `docs/Capturas/2026-11-11_D1036/`:
- `pdf_depois_assinaturas_2_itens.pdf`, com a observação de três linhas e dois itens: **uma página só**. A legenda da assinatura termina a 276 mm, e a linha do rodapé fica a 282.
- `pdf_depois_assinaturas_8_itens.pdf`, com oito itens e a mesma observação: duas páginas. **A quebra vem antes do quadro da observação.** A página 1 leva a tabela, os totais, o registro e a política. A página 2 leva a observação, as condições e as assinaturas.
- As duas em imagem: `pdf_depois_assinaturas_*_pagina*.png`.

**A trava** são dois testes novos em `ocPdfDestaques`:
- o caso comum cabe numa página só;
- de 1 a 30 itens, com e sem observação, as assinaturas ficam na página das condições, a legenda fica antes da linha do rodapé, e a 10 mm ou mais da última condição.

Sabotei numa cópia isolada, já apagada. Com o código antigo, os dois testes caem. Com a assinatura colada no texto, o segundo cai. Na primeira volta, esse segundo caso passava: o leitor da trava não seguia cada linha das condições. Consertei a trava antes do commit.

## 3. A foto da produção

Estão em `docs/Capturas/2026-11-11_D1036/`: `producao_icone_sem_ninguem_dia_375.jpg` e `producao_icone_sem_ninguem_noite_375.jpg`. São a primeira tela do ícone, tirada do site no ar e sem ninguém logado. As medidas, em `medidas_icone_producao.json`, são as da prova: as duas entradas com 343 px e letra de 20 px, e nada rola de lado.

## 4. O QR de 24 horas

Entendido: o senhor leva ao Banco pelo outro caminho. A tela continua mostrando o tempo que a função devolve, hoje uma hora.

## 5. Duas coisas que vi de passagem, e não mexi

- **A `main` local** desta pasta tem um commit velho sem push, `2bc863d` (D1018), que não está na `main` do GitHub. Publiquei empurrando o ramo direto para a `main` do GitHub, e não toquei na local.
- **O Git trata os PDFs de prova como texto**, e avisa que troca o fim de linha deles. Num checkout no Windows, isso pode estragar o arquivo. A causa: a casa não tem `.gitattributes`, e o `core.autocrlf` está ligado. Um `.gitattributes` com `*.pdf binary` resolve.

## 6. Agora

Nada pediu a palavra do Pedro. Não digitei senha, não usei sub-agente e não toquei o banco. Não medi logado: as telas de dentro se conferem no celular do Pedro.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
