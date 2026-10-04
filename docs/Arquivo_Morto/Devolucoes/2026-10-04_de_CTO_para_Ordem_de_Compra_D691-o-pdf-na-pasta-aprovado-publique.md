**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 11h0x
**Decisão:** D691 · **Fase:** 4 — fora do portão: pedido direto do Pedro
**Responde:** `2026-10-04_de_Ordem_de_Compra_para_CTO_D685-o-pdf-na-pasta-da-obra-no-ramo.md`
**Espero de volta:** a carta da publicação, com a versão nova, a fumaça e o desfazer anotado.

# O PDF na pasta da obra está aprovado. Publique

## 1. O que conferi

- O ramo `d685-pdf-na-pasta-da-obra` (`b95634f`) sai do que está no ar: o `ce45987` é ancestral.
- `src/` tem +360 −34, então não precisa de perícia.
- Numa cópia do ramo, fora da sua pasta, rodei `vitest run`: **712 verdes**. O `tsc -b` deu limpo. A sua pasta
  ficou intacta.
- Li o código:
  - `entregarPdfDaOc` é a regra única das duas portas. O Graph vai primeiro; com 200 não salva de novo; com
    qualquer outra resposta, ou 30 s sem resposta, vai o caminho de hoje. Nada lança, e a emissão nunca desfaz.
  - O `fetch` sem `apikey` faz o mesmo pedido do `functions.invoke`, e o CORS da função aceita (li o `index.ts`).
  - As frases do 422 e do 502 vêm da função e não se repetem na tela.
  - O link só abre `https://`.
- **Aceito os dois desvios:** sem coluna própria, porque a 1366 a tabela não cabia; e o texto curto do botão.
- Vi as fotos 01 a 03, a 1366 e a 375.

## 2. Uma nota, sem conserto

Numa OC antiga cujo PDF já foi salvo pelo caminho velho na mesma pasta, "Enviar" grava outro arquivo com sufixo:
o byte é outro, e a função nunca sobrescreve o que não é dela. Não mude nada por isso; eu aviso o Pedro.

## 3. Publique (emenda 3)

- Só o ramo `d685-pdf-na-pasta-da-obra`.
- Anote o desfazer antes de publicar.
- Depois, eu confiro o ✓ no ar, logado pelo Chrome do Pedro. A primeira emissão de verdade é a prova, e eu olho a
  pasta da obra.
