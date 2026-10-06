# D733 — o ajuste ao contrato do Banco no ramo (`130e7a5`, CI verde), com os dois retoques da D732; sem a foto do ensaio (D734)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 14h5x
**Responde:** a D733 §3, a D732 §3 e a D734
**Espero de volta:** a sua conferência da diferença e, depois, o texto do perito para o Pedro (D733 §2).

**O banco não mudou.** Nada no `main` de código e nada publicado.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Onde está

- O ramo é `d730-ps02`, e o commit final é **`130e7a5`**, empurrado. O CI 37492084724 está verde.
- A diferença para conferir é `cf9413e..130e7a5`, em dois commits:
  - `5b85d02` — os dois retoques da D732;
  - `130e7a5` — o ajuste ao contrato.
- Os retoques chegaram um commit antes do ajuste, e não no mesmo. Adiantei os dois quando a D732 deixou. O par
  segue junto no ramo e na perícia.

## §2 — O ajuste, ponto por ponto da D733 §3

1. **A coluna é `documento`.** O `select` agora nomeia as colunas do contrato:
   - `codigo`, `titulo`, `revisao`, `emitida_em` e `documento`;
   - e, embutido, o histórico: `id`, `revisao`, `emitida_em`, `descricao`, `revisado_por_nome` e
     `aprovado_por_nome`.

   Antes era `*`.
2. **O `aviso` guarda o tom.** O `warn` desenha a faixa de aviso, e o `info` a de informação, as mesmas das fotos.
   Na forma da OC, o tom fica no `destaque` do bloco: é ele que desenha a faixa. Não é o parágrafo comum.
   - As quatro estão certas: `qualificacao.a1` e `laboratorios.a1` (aviso), `avaliacao.a1` e `revisoes.a1`
     (informação).
   - O `miudo` do parágrafo virou a letra miúda.
3. **Código, Revisão e Data vêm das colunas.** A etiqueta "Emissão inicial formal" vem do campo `revisao` do
   cabeçalho. Os outros três campos vêm pelo `valor`, achados pelo rótulo.
4. **O `endereco` do quadro FO 8.4.1.1 não vira link.** O quadro fica como texto: "FO 8.4.1.1 / Qualificação de
   fornecedores".
   - **O caminho da planilha não aparece.** No HTML ele só existe dentro do link, e não se vê na página.
   - Se você quiser o caminho escrito, é uma linha.

**Uma coisa a mais, fora dos dois arquivos: o sumário.**
- O documento escreve "1. Objetivo", "2. Qualificação"… A página escrevia o título inteiro da seção ("1. Objetivo
  e responsabilidades").
- Passou nas fotos do `cf9413e`, e eu não tinha visto.
- Agora o sumário vem do `sumario` do documento. Para isso, o `Procedimento` ganhou um campo, e a página lê dele.
  São 3 arquivos a mais: o tipo, a página e o dado de teste. Na Rev. 00 o texto vale palavra por palavra (D586), e
  por isso não deixei para depois.

**O que a tela ainda mostra sem negrito:** o texto dos quadros, dos itens de lista, dos cartões e dos passos do
fluxo, e o "?" das seções. Na Rev. 00 nenhum deles tem negrito. Se a Rev. 01 trouxer, a tela muda junto. Está escrito
no cabeçalho de `procedimentoDoBanco.ts`.

## §3 — A prova

- **988 testes**, tipos e lint limpos.
- **29 sabotagens, todas vermelhas.** São as 21 da D730 e 8 novas do contrato:
  - o aviso perde o tom;
  - `warn` e `info` trocados;
  - a revisão não vem da coluna;
  - a coluna volta a ser `secoes`;
  - a letra miúda some;
  - o passo da sequência perde o rótulo;
  - o responsável sai do cabeçalho;
  - o sumário volta ao título da seção.
- **O dado de teste é a carga do Banco.**
  - `tests/fixtures/ps02Rev00DoBanco.json` é o jsonb tirado da migration do `6e8a0a8`, sem mudar uma letra.
  - Tem a **mesma digital do ensaio**: md5 do `documento::text` `1c82ab10d235f276e236a4760b362f3a`, 15.561
    caracteres, medido por SQL só leitura (emenda 3).
  - Ele tem as 59 âncoras, nenhuma repetida.
  - **A leitura dele dá o procedimento do dado de teste antigo, palavra por palavra.** Só as âncoras de posição
    diferem. O teste compara tudo, menos essas âncoras.
- **O caminho do `select`, pela porta pública do ensaio, sem login:**
  - a ligação `procedimento_revisoes` passa da checagem do PostgREST e para em `42501` ("permission denied for
    schema core"), porque o `anon` não lê;
  - uma ligação inventada para antes, em `PGRST200`.

  É a mesma conclusão que você mediu no código: o histórico vem pela chave estrangeira.

## §4 — As fotos

Ficam em `docs/Capturas/2026-10-06_D730/`, no ramo, sobre o banco falso:
- **o topo e o menu**: `41_ps02_o_topo_1366x768.png` e `41_ps02_o_topo_375.png`. O menu diz "Procedimento de
  Compras", numa linha a 1366;
- **a linha marcada pelo pulo**: `43_ps02_o_cartao_leva_a_linha_projetos_1366x768.png` e `…_375.png`. O contorno
  fica por dentro da tabela;
- **o contorno antes e depois**: `49_D732_o_contorno_da_linha_antes_e_depois.png`.

**Foto nova do sumário:** não tenho. As fotos 40 a 47 são do `cf9413e`, ainda com o sumário antigo e, a 1366, com o
nome antigo no menu.

**A foto do ensaio** saiu pela D734. O pedido de subir a prova com a linha lida do ensaio foi recusado pelo controle
de permissão desta máquina, e não insisti.

## §5 — O tamanho

- **`src/`, sem os testes: 1.526 linhas novas** contra o `main`, mais 4 trocadas. Antes eram 1.494; o ajuste e os
  retoques somam 32.
- **Com as 901 do Banco, são 2.427.**

— Ordem_de_Compra
