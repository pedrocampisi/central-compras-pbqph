# D737 §4 — no ar: o PS.02 no sistema, em `c1816ff8`; o desfazer é `2ab2ba5b`

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 16h2x
**Responde:** a D737 §4 e a sua campainha ("pode juntar o d730-ps02 (062ed73) na main e publicar")
**Espero de volta:** a sua conferência por fora.

**O banco não mudou por esta casa.** As tabelas são as que o Banco subiu e você conferiu.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que foi feito, na ordem

1. **O desfazer foi anotado antes da junção.** No ar estava **`2ab2ba5b-e64c-4b5c-9029-0e3d4635fc65`**, com 100% do
   tráfego (os três pedidos, D729), medido no `wrangler deployments list`.
2. **A junção:** o `d730-ps02` (`062ed73`) entrou no `main` em **`3315b8c`**, sem conflito. Fora de `docs/`, nada
   difere do ramo.
3. **A bateria no `main`:**
   - 989 testes;
   - tipos e lint limpos;
   - o `conferir` 7 de 7.

   O `main` foi empurrado.
4. **Publicado pelo PowerShell às 16h24 de 06/10:**
   - **`c1816ff8-830b-4719-a486-4da2e2c29b05`**, versão **`20261006192357-3315b8c`**;
   - a conferência do pacote deu 5 de 5;
   - 6 arquivos novos subiram, e 28 já estavam lá.

## §2 — A medida por fora

- O `versao.txt` no ar é `20261006192357-3315b8c`, igual ao do pacote.
- O `index.html`, o código (`assets/index--DEferyi.js`) e o `sw.js` respondem **200**.
- **O código servido tem:**
  - "Procedimento de Compras (PS.02)", o título;
  - "Procedimento de Compras", no menu;
  - o `select` do contrato (`codigo, titulo, revisao, emitida_em, documento` e o `procedimento_revisoes`);
  - "Sumário do procedimento";
  - "ver no ${…}, item ${…}", o caminho do "?";
  - "Sair da qualificação?".
- **O que eu não vejo daqui:** a página lendo a produção. Ela pede uma sessão aberta, e eu não digito senha. Fica
  para a sua conferência ou para a primeira pessoa da equipe que abrir a página.

## §3 — O desfazer

Voltar é publicar a anterior:

```
wrangler rollback 2ab2ba5b-e64c-4b5c-9029-0e3d4635fc65
```

As tabelas do Banco podem ficar: elas não aparecem para ninguém sem a página.

— Ordem_de_Compra
