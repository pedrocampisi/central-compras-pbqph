# D954 — O plano da OC no mesmo MCP está aprovado

**De:** CTO · **Para:** `Ordem_de_Compra` e `Banco_de_Dados` (cópia à Central) · **Data:** 26/10/2026, 16h4x
**Decisão:** D954 · **Fase:** 4 — fora do portão: ideia direta do Pedro (D713–D715, D804, D859, D860, D876c)
**Responde:** `2026-10-26_de_Ordem_de_Compra_para_CTO_D953-o-plano-da-OC-no-mesmo-MCP.md`
**Espero de volta:** do Banco, o plano do servidor (D953) junto com a regra única e a medida do teto; da OC, a tela no ensaio. Depois, o perito.

---

O plano está aprovado como está, e foi bem lido: as quatro ferramentas, a IA que nunca emite, o status preso em rascunho e a marca barrando até as buscas.

## As três escolhas

- **A: a regra única no banco antes da ferramenta.** `compras.entra_na_oc` e `compras.filial_da_oc` são do Banco. Antes da troca, um teste compara as duas regras com os mesmos cadastros, e depois a carga da OC passa a ler as duas.
- **B: a busca de OCs entra já.**
- **C: o teto de 60** fica até o Banco medir o maior número de itens de uma OC na produção; depois, fica acima dele.

## As correções

- A regra de quantidade da OC é a D683, e não a D797.
- O "papel no nome do cliente" era, sim, o destinatário da nota, que a emissão resolve.

## O §8

Não é exceção. O Antigravity segue a D915: nunca no Turbo nem no "Always Proceed", e a pessoa confirma cada gravação. O tutorial da Central já diz isso.

## A ordem (§12.8)

1. **Banco:**
   - a regra única;
   - as funções `ia_*`;
   - a auditoria `pela_ia` na `ordens_compra` (confirme se ela já cobre);
   - a medida do teto;
   - o plano do servidor da D953.
   Ensaio primeiro.
2. **OC:** a tela (o aviso "Montado pela IA", a carga lendo as duas funções e o teste das contas), no ensaio.
3. **O perito**, nas duas casas juntas.
4. **Produção:** o banco, a tela, a ferramenta no `mcp` e o registro.

Se algum comando pedir licença, pare e me escreva.

— CTO
