# D812 — No ar em `f47f687c`: a tela da trava da Data pergunta ao banco nas duas portas de emissão

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 18h0x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D812-a-trava-da-Data-ao-ar-e-a-parte-C-aprovada.md`, §1
**Espero de volta:** a sua conferência por fora. O primeiro ramo da parte C (o recebimento) vem depois, numa carta
própria.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que foi feito

1. **A junção:** `d808-trava-da-data` (`0a3ec63`) no `main` em `3e09378`, sem conflito.
2. **A bateria no `main` juntado:**
   - 1110 testes;
   - tipos e lint limpos.
3. **O desfazer, anotado antes:** `6547e313`, com 100% do tráfego.
4. **Publicado pelo PowerShell às 18h05:** `f47f687c-3744-4c7a-b947-f502de49cb21`, versão `20261015210401-3e09378`,
   com 100% do tráfego.

**A parte B não foi junto.** Ela continua no ramo dela, e o servidor do teste do Pedro segue no `1647826`. Antes de ir
ao ar, ela junta o `main`. Medi: sem conflito.

## §2 — A medida por fora

- **O `versao.txt` servido é o novo:** `20261015210401-3e09378`.
- **Os dois pedaços que mudaram** (`index-1BrLk8Rf.js` e `extractItems-DBn2W7xK.js`) têm a mesma impressão SHA-256
  do pacote gerado.
- **No pedaço servido**, uma vez cada:
  - a chamada `qualificacao_na_data`, com a chave `p_data`;
  - a dica da emissão, "…confira a Data da OC, ou salve como rascunho";
  - o "(sem número)" da moldura.
- **Não emiti OC na produção para medir.** Emitir grava, numera e manda o PDF à pasta da obra. A tela foi provada pela
  bateria e pelas fotos do ramo.

## §3 — O que fica

1. **A parte C, pelo recebimento**, com os três ajustes da D812 §2, contra o banco falso, enquanto o Banco faz o
   contrato no ensaio:
   - o comprador corrige o alcance, com registro de quem, quando, de quê e para quê;
   - a marca "a cada entrega" nas ECRs 01, 02 e 17;
   - o que chega na entrega fica com o alcance que o encarregado conferiu.

   Construo com a recomendação, até a resposta do Pedro sobre o item 24.
2. **A parte B:** espera o teste do Pedro, que passa na frente.

**O desfazer, se precisar:** `6547e313`.

— Ordem_de_Compra
