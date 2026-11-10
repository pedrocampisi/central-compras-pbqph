# D1034l: a pintura no ar em d9b0a5cc

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 10/11/2026, 15h36
**Assunto:** a pintura "Dia e noite" inteira na produção, com a triagem do laudo; o desfazer anotado; medido por fora
**Responde:** a D1034l, recebida por campainha (a triagem aceita, 6 de 6, e a ordem de publicar o ramo `d1034-d-a-triagem`)
**Espero de volta:** a sua conferência no ar, logado.

---

## 1. Em uma linha

A pintura subiu inteira às **15h33 de 10/11**, na versão **`d9b0a5cc-136a-4696-9398-012a1e4b124e`**: os lotes (a), (a2), (b), (b2) e (c), e mais a triagem.

- O pacote é `20261110183233-b8b948b`.
- A `main` está em `b8b948b`, com o CI verde (run 42875842969).
- **O desfazer é `378ff412-1051-4fab-a469-23ac7333bdcf`**, a D975, que estava no ar desde as 12h07. Pelo PowerShell: `pnpm exec wrangler rollback 378ff412-1051-4fab-a469-23ac7333bdcf`.

## 2. Medido por fora

| O que | Medida |
|---|---|
| `versao.txt` servido | `20261110183233-b8b948b`, igual ao do `dist/` |
| Os arquivos do pacote | **45 de 45 iguais byte a byte** ao `dist/`, contando o `sw.js`, o `index.html`, o `versao.txt` e todo `.js` e `.css` |
| A página `/` | igual ao `index.html` do `dist/` |
| A folha do `padrao_campisi` | `tokens.css` e `componentes.css` ligados na página e servidos iguais |
| O `sw.js` | servido com `max-age=0, must-revalidate`, como antes |

**Não medi logado.** A tela de verdade, com a sessão, fica para o senhor ou para o Pedro.

## 3. Dois avisos

1. **Um defeito meu, consertado antes de publicar.** O primeiro CI da `main`, no `11c9c44`, reprovou no `conferir` dos documentos: o laudo entrou no repositório sem linha no `INDICE.md`. O código e os testes tinham passado. Consertei em `b8b948b`, e o CI ficou verde antes do pacote. **Faltou eu rodar o `pnpm conferir` na triagem.** Fica como passo da casa antes de dar uma carta por pronta.
2. **A `main` local desta pasta tem o `2bc863d` (D1018).** Ele não está na `origin` e nunca foi publicado: a D975 o deixou de fora de propósito. Não mexi nele. Publiquei empurrando o ramo direto para a `origin/main`, que era ancestral dele. Se o senhor quiser esse commit na `main`, é uma ordem à parte.

## 4. O que fiz na fila

O item 46 da PENDENCIAS diz agora que a pintura está no ar, com a versão e o desfazer. Espera só a conferência logada.

## 5. Agora

Espero a campainha: a sua conferência no ar.

Nada pediu a palavra do Pedro. Não digitei senha, e não usei sub-agente.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
