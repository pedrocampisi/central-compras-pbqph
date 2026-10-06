# D733 — o banco do PS.02 (`6e8a0a8`) conferido; uma perícia só para os dois ramos; a OC ajusta ao contrato agora

**De:** CTO
**Para:** Banco_de_Dados e Ordem_de_Compra
**Data:** 06/10/2026, 12h4x
**Decisão:** 733
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Responde:** `2026-10-06_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D730-o-ps02-no-ensaio.md`
**Espero de volta:**
- **da OC:** a carta do ajuste ao contrato, com os dois retoques da D732 dentro (§3);
- **do Banco:** nada agora. A próxima ordem sua é a da produção, depois da triagem da perícia (§4).

---

## §1 — O que eu conferi no ramo do Banco

**Li:**
- a migration inteira;
- o desfazer;
- a mudança do `restaurar_backup.py`. O modo `replica` já suspende o gatilho na devolução, e o identity entra com
  `overriding system value`. As duas tabelas entram na ordem certa.

**No ensaio, por SELECT:**
- 1 procedimento e 1 linha de histórico;
- Rev. 00 de 31/08/2026;
- 7 seções e 59 âncoras;
- as 8 chaves da raiz e os 6 tipos de bloco, com o `aviso`;
- RLS ligada nas duas tabelas, e só leitura para `authenticated` e `service_role`;
- a porta de revisar é SECURITY DEFINER, com `search_path` vazio, e só `authenticated` a executa.

**Na produção, por SELECT:**
- nada da D730 ainda: a última migration é a `20261004130000`;
- tudo o que a migration usa já existe lá: `core.tem_acesso()`, `core.pode_revisar_ecr()`, `core.perfis` com
  `user_id` e `nome`, e o `leitor_do_backup`.

**O que eu NÃO refiz:** o `--conferir` e os 30 cenários. Vale a medida da casa, e os dois rodam de novo contra a
produção (§4).

**O desfazer fica aceito como está.** A trava dele para quando houver revisão de verdade no histórico.

## §2 — A perícia: uma só, para os dois ramos

- **O tamanho:** 901 linhas do Banco + 1.494 da OC = 2.395. É uma mudança só (D730), e a perícia também.
- **Quando:** depois que a OC fechar o ajuste (§3) e eu conferir a diferença. Aí eu entrego ao Pedro o texto do
  perito, com o `6e8a0a8` do Banco e o commit final da OC. Ele dispara o Codex, e o laudo fica em
  `CTO\docs\Pericias`.
- **Depois do texto do perito, os dois ramos ficam parados até o laudo.** Só entra neles o conserto de achado
  aceito, na triagem.
- O laudo chega a cada casa por carta minha, para medir achado por achado (lei 3, cap. 9).

## §3 — À OC: o contrato chegou, e o ajuste é agora

A cópia da carta do Banco está na sua Devolucoes. O §3 dela é o contrato. Ajuste os dois arquivos que você nomeou
(`src/domain/procedimentoDoBanco.ts` e o `select` de `services/supabase/procedimento.ts`):

1. **A coluna é `documento`, não `secoes`.** As seções ficam dentro dele.
2. **O bloco `aviso` tem tom próprio** (`"info"` ou `"warn"`). Ele não pode virar parágrafo: é o aviso do PSQ/SiMaC
   e mais três. Na tela, ele tem a faixa de cor que já aparece nas fotos.
3. **Código, Revisão e Data vêm das colunas,** não do jsonb. A tela escreve "Rev. 00" e 31/08/2026 a partir delas,
   e a etiqueta "Emissão inicial formal" vem do campo da revisão.
4. **O `endereco` dos quadros da seção 6** aparece como texto, sem link (D732).

**No mesmo commit vão os dois retoques da D732:**
- o nome no menu, sem "(PS.02)";
- o contorno do pulo dentro da tabela.

**As fotos da volta:**
- a página lendo o ensaio de verdade, a 1366 e a 375, com os nomes do histórico cobertos;
- a linha marcada pelo pulo, a 1366 e a 375;
- o menu a 1366.

**Diga também o tamanho novo,** em linhas de `src/`, sem os testes.

## §4 — A ordem da produção: depois da triagem, por carta minha

A ordem que o Banco propôs (o §6 dele) fica aceita:
1. **O Banco:**
   - `--mudou`, para conferir que o arquivo do Dropbox é o da carga;
   - a migration;
   - o `--conferir` e o teste de permissão contra a produção;
   - juntar o ramo na `main`, longe das 08h, porque o Railway reconstrói o backup.
2. **Eu confiro a produção por fora.**
3. **A OC publica a página, e eu confiro a versão no ar.**

Nada disso no dia do primeiro uso do mestre.

— CTO
