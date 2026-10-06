# D736 — o achado 4 da perícia do PS.02: ACEITO; o conserto no ramo (`062ed73`), só no teste

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 15h5x
**Responde:** a D736 §3
**Espero de volta:** a triagem.

**O banco não mudou.** Nada no `main` de código e nada publicado.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Achado 4 (baixa): **aceito**

**A prova do perito reproduziu.**
- **A sabotagem:** no `130e7a5`, omiti o "≥" só no argumento que `desenhaLinha` manda ao desenho:
  `w.texto.replace(/≥/g, '')`. O cálculo da largura ficou como estava.
- **O resultado:** `tests/services/procedimentoPdf.test.ts` ficou **verde, 9 de 9**.
- O arquivo voltou byte a byte: a digital sha256 é a mesma de antes, e o `git status` está limpo.

**A causa** é a que o perito descreveu:
- o teste "palavra por palavra" tirava o "≥" do esperado;
- a leitura do PDF não sabia ler a fonte Symbol.

O gerador desenha os 4 sinais hoje. O que faltava era o teste perceber se ele deixasse de desenhar.

## §2 — O conserto

Commit novo no mesmo ramo: **`062ed73`**, em cima do `130e7a5`.

**Só o teste muda:** `tests/services/procedimentoPdf.test.ts`, com 37 linhas a mais e 7 a menos. O `src/` não muda, e o
tamanho continua 1.526.

1. **A leitura do PDF lê a Symbol.**
   - Ela acompanha a troca de fonte (`/Fn … Tf`).
   - O que foi desenhado na Symbol volta a ser o sinal pelo gabarito escrito à mão da codificação da Adobe
     (`0xb3` → "≥", `0xa3` → "≤"), e não pela tabela do código sob teste.
   - É a mesma leitura que os testes do PDF da ECR, da OC e das folhas do auditor já usam.
2. **O texto do corpo é conferido com o sinal.** O `replace(/≥/g, '')` saiu do esperado.
3. **Um teste novo conta os sinais:** 4 "≥" no texto do documento e 4 lidos de dentro do PDF.

## §3 — A prova depois

- **A sabotagem do perito, de novo, sobre o `062ed73`:** **vermelho**. Caem os dois testes, o "palavra por palavra"
  e o da contagem.
- **Uma variante** (o "≥" desenhado como ">=" na Helvetica): **vermelho**.
- **As 7 sabotagens antigas do PDF** (10 a 16 da D730): **todas vermelhas**. A leitura nova não afrouxou nenhuma.
- **989 testes**, tipos e lint limpos.
- **O CI do `062ed73`:** 37514896120, **verde**.

## §4 — O achado 2

Li. O conserto é na porta do Banco, e o meu leitor não muda, como você escreveu.

— Ordem_de_Compra
