# D740 — no ar: a Rev. 01 pela mão do Pedro, em `36e26eab`; o desfazer é `c1816ff8`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 17h2x
**Responde:** `2026-10-06_de_CTO_para_Ordem_de_Compra_D740-a-Rev01-aprovada-no-ramo-pode-publicar.md`
**Espero de volta:** a sua conferência por fora. Depois dela, a sentada do Pedro.

**O banco não mudou. Ninguém apertou o "Gravar":** a Rev. 01 não foi gravada. A vigente no banco continua a Rev. 00.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que foi feito, na ordem

1. **O desfazer foi anotado antes da junção.** No ar estava **`c1816ff8-830b-4719-a486-4da2e2c29b05`**, com 100% do
   tráfego, medido no `wrangler deployments list`.
2. **A junção:** o `d739-rev01` (`81f6bef`) entrou no `main` em **`e5944b6`**, sem conflito. Fora de `docs/`, nada
   difere do ramo.
3. **A bateria no `main`:**
   - 1013 testes;
   - tipos e lint limpos;
   - o `conferir` 7 de 7.

   O `main` foi empurrado.
4. **O dia:** o primeiro uso do mestre ainda não tem data, então hoje é fora dele.
5. **Publicado pelo PowerShell às 17h23 de 06/10:**
   - **`36e26eab-ddbe-49b5-a6b1-b41ac0e4de99`**, versão **`20261006202414-e5944b6`**;
   - a conferência do pacote deu 5 de 5;
   - 8 arquivos novos subiram, e 28 já estavam lá.

## §2 — A medida por fora

- O `versao.txt` no ar é `20261006202414-e5944b6`, igual ao do pacote.
- O `index.html`, o código (`assets/index-BVPIl_9I.js`) e o `sw.js` respondem **200**.
- **O código servido tem:**
  - o quadro ("em rascunho", "Ler o rascunho", "Próxima mudança");
  - o "?" do motivo ("Por que este trecho mudou");
  - a pergunta ("Ela passa a valer hoje e entra no histórico.");
  - a chamada `revisar_procedimento`.
- **Os dois pedaços do rascunho** (`documento-ByiOftKY.js` e `mudancas-dQ0AJY_U.js`) respondem 200. Eles só descem
  para quem revisa.
- **O rascunho servido tem a frase da nota consertada** ("registra o número da nota"), e a velha ("com a foto ou o
  número da nota") não aparece.
- **O que eu não vejo daqui:** a página com sessão aberta, porque eu não entro com senha. E o "Gravar" não se aperta
  para prova (D740). Na sessão do Pedro, o quadro deve aparecer em cima da Rev. 00.

## §3 — O desfazer

Voltar é publicar a anterior:

```
wrangler rollback c1816ff8-830b-4719-a486-4da2e2c29b05
```

O banco não mudou, então não há o que desfazer nele. Se o Pedro já tiver gravado a Rev. 01, o rollback só tira a
página de revisar: a Rev. 01 continua valendo no banco, e a página da `c1816ff8` a lê normalmente.

## §4 — Depois

1. Você confere por fora.
2. O Pedro senta, lê o que mudou e grava com a mão dele, ou recusa uma frase. Se recusar, a frase muda pelo script e
   passa por você de novo.
3. Gravada a Rev. 01, a publicação seguinte tira o rascunho do código (D739 §4.3).

— Ordem_de_Compra
