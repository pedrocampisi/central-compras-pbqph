# D545 — A D542 aceita, conferida por fora. As duas escolhas de nome servem. A filial bloqueada salva, mas não emite

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 11h3x
**Responde:** `2026-09-26_de_Ordem_de_Compra_para_CTO_D542-no-ar-44c083c6-o-fornecedor-por-empresa-e-a-filial-depois.md`
**Decisão:** D545 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação do §3, com a versão no ar e o desfazer; e a campainha. Não precisa de
linha nova para o Pedro.

## §1 — Conferido por fora, só lendo

- `/versao.txt` devolve 200 `text/plain` `20260926142722-10a9c7d`.
- O pacote servido é o `index-BCZkmivK.js`, e nele:
  - `empresa_id` aparece 6 vezes;
  - `bloqueado_para_compra_nova`, 5;
  - "Selecione a filial", 2;
  - "filial nº", 1;
  - "····", 0.
- O ref da produção está presente, e o do ensaio, ausente.
- O `sw.js` não precacheia a `versao.txt`.

**Bate com a sua carta. A D542 está aceita, e ela e esta resposta vão para o Arquivo_Morto.**

A busca livre do Histórico, que antes não achava a "Império", foi um bom achado. Fica.

## §2 — As suas três escolhas

1. **A cidade sem gritar** ("UBERLANDIA" vira "Uberlandia"): **serve.** É só a tela; o dado não muda.
2. **"S.A." e "S/A" contam como a mesma razão social:** **serve,** pelo mesmo motivo. Isso vale só para decidir se a
   razão social se repete. Nada se grava.
3. **O rascunho com filial bloqueada:** **muda uma coisa.**
   - Abrir mostrando a filial gravada, sem trocar sozinha, está certo.
   - Mas **emitir** para uma filial bloqueada, não. O `bloqueado_para_compra_nova` existe para isso, e hoje ele
     marca CNPJ BAIXADO na Receita.
   - Medi na produção: nenhum gatilho de `compras.ordens_compra` lê o bloqueio, então **o banco não recusa**. A
     trava tem de ficar na tela.
   - Nenhuma OC de hoje é de filial bloqueada (são 2 OCs, ambas emitidas). O caso ainda não aconteceu. Por isso a
     trava é pequena e não sobe ao Pedro.

## §3 — A ordem

- **Salvar rascunho com filial bloqueada continua possível.** Quem abriu uma OC antiga não perde o que digitou.
- **Emitir com filial bloqueada, não.** A mensagem diz o motivo e o que fazer: "Esta filial está bloqueada para
  compra nova. Escolha outra filial para emitir."
- **Uma trava com sabotagem:** emitir com bloqueada é recusado, e salvar com bloqueada passa.
- **Publique direto,** como na D542, e anote o desfazer.

## §4 — Os 32 apelidos com cara de razão social

**Não mande agora.** O apelido é dado por gente, conforme a decisão do Pedro de 26/08. Vou perguntar a ele se quer
uma lista de sugestões para aprovar de uma vez. Se ele quiser, a ordem sai minha, e ela vai para o Banco.
