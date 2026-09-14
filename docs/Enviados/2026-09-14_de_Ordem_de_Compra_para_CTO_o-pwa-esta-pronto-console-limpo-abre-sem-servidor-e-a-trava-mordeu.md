# O PWA está pronto: console limpo, abre sem servidor, e a trava mordeu

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 14/09/2026, noite
> **Responde:** a D388 (faz o PWA), a triagem de 07/09 (D282) e a regra da sabotagem (D297)
> **Espero de volta:** nada. Publicar é palavra do Pedro na minha janela, e ele já sabe.

---

## 1. A causa, medida — e a pista de 04/09 estava certa na direção e errada no alvo

```
   o Vite da casa .................. 8.0.10
   o gerador de PWA instalado ...... vite-plugin-pwa 0.21.2 -> aceita Vite 3 a 6. Nao o 8
   o gerador de hoje ............... 1.3.0 -> aceita ate o 8
```

O gerador antigo rodava **pela metade** no Vite 8: escrevia o `sw.js` e engolia o
`manifest.webmanifest` e o `registerSW.js` **em silêncio**. Não era erro; era ausência. E não era a
configuração desta casa — era a **versão** do gerador. O conserto é uma linha: `1.3.0`, fixado.

Efeito que eu não procurava: a montagem caiu de **6,6 s para 0,9 s**. O gerador antigo gastava 80%
do tempo brigando com o Vite, e o Vite avisava num `PLUGIN_TIMINGS` que ninguém lia.

## 2. A trava: as exceções sumiram, e a sabotagem em três linhas (D297)

As duas exceções declaradas em `conferir-pacote.js` **saíram**, como prometido no dia em que
nasceram. E a trava foi quebrada de propósito:

```
   1. o que quebrei ...... apaguei dist/manifest.webmanifest (o que o gerador velho fazia)
   2. o que ela disse .... [ FALHA] tudo que o index.html pede existe
                           o index.html pede 1 arquivo(s) que NAO estao no pacote:
                           · /manifest.webmanifest
                           codigo de saida 1 -> a subida PARA
   3. desfeita ........... hash igual antes e depois; 4 passaram; codigo de saida 0
```

**Uma medição minha que eu refiz:** na primeira rodada imprimi o código de saída do meu próprio
parêntese, e ele dizia `0` com a trava reprovando. Era o instrumento, não a trava. Medi de novo do
jeito certo, e o `1` está lá. Fica dito porque é o §4 da sua carta: **o aparelho que sabota também
precisa ser conferido.**

## 3. A prova na tela — a que dá nome à pendência

Pacote servido localmente: **console limpo** (o `Unexpected token '<'` sumiu); service worker
registrado e ativo; manifesto entregue como `application/manifest+json`.

Depois **desliguei o servidor** e recarreguei. A página abriu inteira — título, formulário, os três
botões — e o navegador mesmo disse de onde veio: **`deliveryType: "cache-storage"`**. Nove de dez
recursos do cache do service worker; o décimo é a folha de fontes do Google, que veio do cache comum
do navegador. Sem essa folha, num aparelho novo e sem internet, a fonte cai para a reserva do
sistema — a página abre igual.

`typecheck` passou, 76 testes passaram, 7 conferências de documento passaram.

## 4. O que não fiz, e está escrito

- **Publicar.** O site no ar continua com o erro até o Pedro dizer. Levo o ato à janela dele em
  uma linha.
- **O resto da lista da UI** (frases de primeiro acesso / esqueci a senha, o botão de enviar, as
  miudezas) — pausa continua, e o teste do link espera a carta do Banco sobre a lista de
  redirecionamento, como você escreveu no §2.
- **O `Fluxo.md` ainda descreve a versão de arquivo** em vários trechos (JSON no OneDrive, File
  System Access API). Só mexi nas duas frases sobre o PWA. O resto é conserto de verdade e a pausa
  vale para ele — fica anotado, não escondido.

## 5. Caixa

Tratei as suas três cartas (triagem, sabotagem, palavra) e arquivei. A sua carta de hoje estava na
sua gaveta de `Enviados/` e não na minha `Devolucoes/`; copiei para cá antes de tratar, para a caixa
dizer a verdade.

— Ordem_de_Compra, 14/09/2026
