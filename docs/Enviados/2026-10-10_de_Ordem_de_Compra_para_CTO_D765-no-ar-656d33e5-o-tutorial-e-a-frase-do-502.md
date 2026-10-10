# D765 — No ar: o tutorial da Nova OC e a frase do 502, em `656d33e5`; o desfazer é `36e26eab`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 10/10/2026, 09h3x
**Responde:** `2026-10-10_de_CTO_para_Ordem_de_Compra_D765-pode-publicar-o-tutorial.md`
**Espero de volta:** a sua conferência por fora. Depois dela, o teste do Pedro com uma pessoa de verdade.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — As três coisas que você pediu

1. **O commit no main:** **`0e7717e`**, a junção de `d763-tutorial` (`35d79ea`) sem conflito. Fora de `docs/`, nada
   difere do ramo.
2. **O desfazer:** **`36e26eab-ddbe-49b5-a6b1-b41ac0e4de99`**, a Rev. 01 pela mão do Pedro. Ele foi anotado antes da
   publicação: tinha 100% do tráfego no `wrangler deployments list`. Voltar é:

   ```
   wrangler rollback 36e26eab-ddbe-49b5-a6b1-b41ac0e4de99
   ```

   O banco não mudou, então não há o que desfazer nele. A oferta já guardada em algum navegador fica lá, sem efeito.
3. **A prova de que a produção serve a versão nova:**
   - o `versao.txt` no ar é **`20261010123530-0e7717e`**, igual ao do pacote;
   - o `index.html` responde 200 e aponta para `assets/index-DaoiLIFr.js`, que também responde 200;
   - **o código servido tem:**
     - a oferta ("Quer ver como funciona?", "Ver o tutorial");
     - o balão (`data-tutorial-balao`);
     - os "?" novos ("Como escolher o fornecedor", "O que o Emitir faz");
   - **a D757:** o pedaço da importação (`assets/extractItems-CeQrVKin.js`) responde 200, tem "Os serviços de IA estão
     fora do ar", e a palavra "OpenRouter" não aparece nele nem no código principal;
   - o `sw.js` responde 200.

## §2 — Como foi

- **A bateria no `main`, antes de publicar:**
  - 1035 testes;
  - tipos e lint limpos;
  - o `conferir` 7 de 7.
- **O CI:**
  - o do ramo em `35d79ea` deu verde;
  - o do `main` (`0e7717e`) estava rodando quando escrevi. Se ele não ficar verde, eu te escrevo.
- **Publicado pelo PowerShell às 09h35 de 10/10:** **`656d33e5-b679-4538-b6eb-0ba09cbfe441`**. Subiram 6 arquivos
  novos, e 30 já estavam lá.
- **O dia:** o Pedro testa hoje o app do mestre. Esta publicação não toca no código do mestre. A tela dele pode pedir
  para recarregar, e a versão nova traz o mesmo app do mestre.

## §3 — O que eu não vejo daqui

A tela com sessão aberta, porque eu não entro com senha. Na primeira Nova OC de cada pessoa, a oferta aparece no
alto. O botão "Tutorial" fica no alto da tela, à esquerda do "Cancelar".

## §4 — Depois

1. Você confere por fora.
2. O Pedro testa com uma pessoa de verdade, e você conta as OCs antes e depois.
3. Se der certo, o mesmo jeito vai às outras telas (Qualificação, Recebimentos e o app do mestre), quando você mandar.

— Ordem_de_Compra
