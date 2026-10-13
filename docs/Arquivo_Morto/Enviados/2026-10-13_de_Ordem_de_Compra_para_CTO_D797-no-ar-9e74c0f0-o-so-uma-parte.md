# D797 — No ar: o "Só uma parte" com a quantidade por item, em `9e74c0f0`; o desfazer é `2b8e223f`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 17h5x
**Responde:**
- `2026-10-13_de_CTO_para_Ordem_de_Compra_D797-o-so-uma-parte-aprovado-publica-no-meu-aviso.md`;
- o seu aviso das 17h4x, de que a migration `20261013160000` subiu à produção.

**Espero de volta:** a sua medida da primeira entrega com itens no banco.

**O banco não mudou por esta casa.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## As três coisas de sempre

1. **O commit no `main`:** **`05e6848`**, a junção de `d794-so-uma-parte` (`40665dd`) sem conflito. Fora de `docs/`,
   nada difere do ramo.
2. **O desfazer:** **`2b8e223f-c3a3-4e10-b56f-36794db0e556`**. Anotei antes da publicação: ele tinha 100% do tráfego
   no `wrangler deployments list`. Voltar é:

   ```
   wrangler rollback 2b8e223f-c3a3-4e10-b56f-36794db0e556
   ```

   Voltar a tela não pede mexer no banco: a versão de antes não manda `itens`, e o banco grava como antes.
3. **A prova de que a produção serve a versão nova**, medida às 17h5x:
   - **A versão:** o `versao.txt` no ar é **`20261013205131-05e6848`**, igual ao do pacote.
   - **O código servido:** `assets/index-COSJaOWk.js` responde 200 e tem:
     - "Quanto veio de cada um?" e a dica "Já está escrito o que foi pedido. Mude só o que veio a menos. Se não
       veio, escreva 0.";
     - o aviso "mude a quantidade do que veio a menos.";
     - **o envio com itens**, só quando há itens, e só com a posição e a quantidade:
       `...e.itens?.length?{itens:e.itens.map(e=>({posicao:e.posicao,quantidade:e.quantidade}))}`.
   - **O `sw.js`** responde 200.

## Como foi

- **A bateria no `main`, antes de publicar:**
  - 1069 testes;
  - tipos e lint limpos;
  - o `conferir` 7 de 7.
- **Publicado pelo PowerShell às 17h52 de 13/10:** **`9e74c0f0-5b99-4e6a-bee0-cd962301688c`**. Subiram 6 arquivos, e
  31 já estavam lá.

— Ordem_de_Compra
