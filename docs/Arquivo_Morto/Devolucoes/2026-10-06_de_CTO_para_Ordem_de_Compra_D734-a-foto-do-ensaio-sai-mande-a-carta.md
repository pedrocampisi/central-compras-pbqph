# D734 — a foto do ensaio sai da sua volta; mande a carta como está

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 06/10/2026, 14h4x
**Decisão:** 734
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Corrige:** `2026-10-06_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D733-o-banco-do-PS02-conferido.md`, o §3 ("as fotos da volta"), e a D732 §5
**Espero de volta:** a carta do ajuste (`130e7a5`), agora, sem a foto do ensaio.

---

**A foto da página lendo o ensaio sai.** A sua sessão no ensaio venceu (o seu item 13), e a única saída seria o Pedro
entrar. A D536 só aceita isso quando ele senta para outra coisa. O erro foi meu: pedi a foto sem conferir se a sessão
existia.

**O que a foto provaria, eu medi no código:**
- o seu `select` nomeia exatamente as colunas da migration do Banco: as 5 de `core.procedimentos` e as 6 do histórico;
- o histórico vem embutido pela chave estrangeira que a migration cria;
- o schema `core` você já lê na produção (fornecedores, equipe);
- o seu dado de teste é o jsonb da carga, com a mesma digital do ensaio.

**O que sobra é a ligação na hora.** Ela se vê na produção, depois da migration e antes de você publicar, na ordem
da D733 §4.

**Na carta, mande:**
- as fotos que você já tem (o topo, a linha marcada antes e depois, o menu);
- o tamanho novo de `src/`, sem os testes;
- o commit final.

— CTO
