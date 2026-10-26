# D954 — A OC no MCP está no ensaio: a regra única, as ferramentas, o teto e o plano do servidor

**De:** Banco_de_Dados
**Para:** CTO (cópia à Ordem_de_Compra e à Central)
**Data:** 26/10/2026, 18h4x (hora de São Paulo)
**Responde:** `..._D954-o-plano-da-OC-aprovado.md` e `..._D953-a-OC-no-mesmo-MCP.md` (o plano do servidor)
**Espera:** a tela da OC no ensaio (a campainha já foi, às 18h4x), depois o perito nas duas casas. A produção espera a sua carta.

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

**Os cinco itens estão feitos no ensaio, e a produção não foi tocada.**
- A migration `20261026190000_a_oc_no_mcp_cto_d954.sql` está aplicada **só no ensaio**.
- O desfazer está **provado no ensaio**: desfeita, as baterias seguiram verdes, depois reaplicada e testada de novo.
- A Ordem de Compra já tem a campainha, com os nomes e as assinaturas, para fazer a tela.

## §2 — Os cinco itens

### 1. A regra única (escolha A)

| função | o que devolve |
|---|---|
| `compras.regra_da_oc()` | uma linha por fornecedor que quem chama vê: a empresa, se entra na OC e a filial que a OC grava para aquela empresa |
| `compras.entra_na_oc(uuid)` | ativa, da lista de material (a resolvida: a filial, ou a mãe) e não bloqueada para compra nova |
| `compras.filial_da_oc(uuid)` | a filial que entra com a menor ordem do CNPJ (a matriz, quando ela entra); nenhuma, se nenhuma entra |

As três rodam com os direitos de quem chama. São o `entraNaOc` e o `filialPrincipal` da tela, escritos no banco.

**O teste que compara as duas regras** é o `testes-rls/teste_regra_unica_da_oc.py`:
- ele **não copia** a regra da tela;
- o esbuild que mora no `node_modules` da OC empacota o próprio `src/domain/fornecedores.ts` na memória, e o Node
  o executa com os mesmos cadastros que o banco recebe;
- se a OC mudar a regra dela, o teste vê.

| com os cadastros | entra na OC | filial da OC |
|---|---|---|
| os de verdade do ensaio: 223 fornecedores, 136 entram | bate em todos | bate em todos |
| 12 de mentira, para os cantos (matriz bloqueada, matriz inativa, filial que diz "não vende" com a mãe que diz "vende", mãe em branco, nenhuma filial que entre, CPF) — numa transação que termina em rollback | bate em todos | bate em todos |
| **a isca** (`--isca`: o banco "erra" um fornecedor) | **pega** | — |

Os números da produção são os mesmos do ensaio, medidos hoje: 223, 136 e 113 empresas que entram, e nenhum empate
de ordem. Na produção o teste só roda depois da migration, porque é ele que lê a `regra_da_oc`.

### 2. As funções `ia_*`

Os nomes são os da OC (D953 §1). As quatro ferramentas passam pelo portão da OC
(`core.ia_portao_da_oc`), inclusive as buscas:
1. o portão da Central: IA registrada, ligação viva e a marca `usa_ia` da pessoa;
2. depois, a régua da tela, `compras.pode_emitir_oc`: é lá dentro que a marca `sem_ordem_de_compra` recusa.

| ferramenta | função | o que faz |
|---|---|---|
| `buscar_fornecedor_e_obra_da_oc` | `core.ia_buscar_para_oc(text)` | até 10 empresas que entram, cada uma com a filial que a OC usaria e o selo de qualificação de material; quem não entra aparece só pelo nome, para a IA não insistir; até 10 obras visíveis à pessoa; as ECRs. Pede pelo menos 3 letras |
| `buscar_ordens_de_compra` | `core.ia_buscar_ocs(text)` | até 20 OCs: número (ou rascunho), status, data, fornecedor, obra, itens, total e se foi montada pela IA |
| `propor_rascunho_de_oc` | `core.ia_propor_rascunho_de_oc(jsonb)` | **não grava.** Devolve o rascunho como vai ficar, linha a linha, com o pedido e o código de conferência (15 minutos) |
| `confirmar` | `core.ia_confirmar` (a que já existe, com um caso a mais) | grava o rascunho pela `compras.salvar_oc` |

**As contas da proposta são as do banco.**
- A proposta roda a própria `compras.salvar_oc` dentro de um bloco que se desfaz no fim. Com isso, as colunas
  calculadas dos itens e o total geral saem exatamente como a tela os grava.
- Os gatilhos e as permissões recusam ali mesmo, do mesmo jeito que recusariam na tela.
- Nada fica: o teste confere que a proposta não deixou nada gravado.
- Se a cotação trouxe o total, a resposta diz, por linha e no fim, se **batem** ou a diferença em reais e para
  que lado.

**Linha errada recusa a proposta inteira.**
- A proposta não descarta a linha ruim calada.
- Ela devolve até 10 erros de uma vez, cada um dizendo a linha e o campo, para a IA corrigir tudo numa volta.
- As chaves são fechadas. `status`, `oc_id`, `versao`, `numero` e `origem` são recusados pelo nome.
- O teto é de 1 a 60 itens.

**O `confirmar` confere antes de gravar:**
- recusa se o fornecedor mudou desde a proposta (bloqueado, inativado, saiu da lista);
- grava com o `request_id` `ia-<pedido>`, então o mesmo pedido não grava duas vezes;
- confere que nasceu **rascunho, sem número**;
- recusa se o total gravado não é o proposto (essa recusa é uma rede: com a filial e as linhas iguais, a conta
  é a mesma, e a bateria não tem como provocá-la).

**A IA nunca emite, nem por outro caminho:**
- a `compras.salvar_oc` recusa uma IA fora do `confirmar`, e também com `oc_id` (mudar OC que existe), com
  `versao` ou com status diferente de rascunho;
- a `compras.definir_status_oc` (emitir, cancelar, entregar) recusa toda IA;
- as duas recusas valem também para quem chamar a API direto com a chave da IA, e a trava já barra isso antes.

**A trava (§12.4).** A lista da `core.trava_da_chave_de_ia` ganhou as três funções novas. A `ia_confirmar` já
estava nela.

### 3. A auditoria `pela_ia` na `ordens_compra`

**Já cobre, e não precisou de nada.**
- A `compras.ordens_compra` tem o gatilho `auditar` desde a `20260813230000`.
- A `core.auditar` grava o `pela_ia` desde a D864.
- A OC que a IA cria fica com o nome da IA na auditoria e com a pessoa no `quem`. Isso está provado no cenário 38
  da bateria.
- Além disso, a OC nasce com `origem_sistema = 'ia'` e `origem_id` = o nome da IA, que é o que a tela da OC lê para
  o aviso "Montado pela IA".

Uma nota: os **itens** (`compras.oc_itens`) não têm auditoria, nem pela tela. Não mexi, porque é igual para os dois
caminhos. Se o senhor quiser a auditoria nos itens, é uma carta à parte.

### 4. A medida do teto

| banco | OCs | o maior número de itens | rascunhos |
|---|---|---|---|
| produção, hoje | 4 | **11** (as quatro: 11, 8, 5 e 1) | 0 |
| ensaio | 2 | 1 | — |

**O teto fica em 60**, acima do maior medido, como a escolha C pede. A amostra ainda é pequena (4 OCs). Proponho
medir de novo quando a produção passar de 30 OCs; o teto é um número só, na função.

### 5. O plano do servidor (D953) — §3 abaixo

## §3 — O plano do servidor da D953 (nada construído na função `mcp`)

**1. Como as ferramentas entram na `mcp`.** Tudo é em `supabase/functions/mcp/logica.ts`, no padrão das três que
já existem:
- três constantes novas: `BUSCAR_PARA_OC`, `BUSCAR_OCS` e `PROPOR_RASCUNHO_DE_OC`;
- cada uma com o `inputSchema` fechado e com `readOnlyHint` (verdadeiro nas buscas e na proposta);
- no `tools/call`, cada uma só recusa cedo o que não tem a forma certa (texto, objeto, lista) e passa adiante.
  Quem confere campo, teto e permissão é o banco;
- o `tools/list` passa a ler os dois campos novos da `core.ia_quem_sou`:
  - `ordem_de_compra` (a régua da tela, com a marca) mostra as duas buscas da OC;
  - `grava_oc` (IA que grava e pessoa com a OC) mostra a proposta;
  - o `confirmar` aparece se `grava` **ou** `grava_oc`;
- o log continua só com nomes fixos: os três nomes novos entram no `FERRAMENTAS_DO_LOG`, e nada do conteúdo entra;
- o `INSTRUCOES` ganha uma frase: "Para montar uma OC: busque o fornecedor e a obra, proponha o rascunho, mostre à
  pessoa cada linha e o total, e só então confirme. A OC nasce rascunho: emitir é na tela da Ordem de Compra.";
- **a conferência das portas:**
  - o teste da `mcp` (o de hoje, mais os casos novos) prova que quem tem a marca não vê as ferramentas da OC;
  - prova também que o "só busca" vê as buscas e não vê a proposta;
  - e prova que um nome fora da lista vira "desconhecido" no log.

**2. O escopo: quem já ligou não precisa refazer nada.** É seguro, por três motivos:
- a permissão OAuth é `openid email profile`, sem consentimento por ferramenta, e o `tools/list` é perguntado ao
  banco a cada ligação. A IA ligada passa a ver as ferramentas na próxima vez que listar (o Antigravity lista ao
  reconectar ou ao atualizar a lista);
- o que a IA ganha é **menos** do que a pessoa já pode na tela: rascunho, nunca emissão, sempre com o "sim" dela
  no `confirmar`, e com os acessos dela;
- quem não deve usar a OC não vê nada: a marca `sem_ordem_de_compra` e o papel sem a OC tiram as ferramentas do
  `tools/list`, e o banco recusa mesmo se a IA chamar o nome.

**Mas a página "Permitir" tem de dizer a verdade a quem permitir daqui para frente (§12.5).** É código da Central
(`app/permitir.js`), então vira carta à Central:
- duas linhas na lista `FERRAMENTAS`: "procurar fornecedores, obras e ordens de compra, como na Ordem de Compra" e
  "montar o rascunho de uma ordem de compra a partir de uma cotação, para você conferir e emitir na tela";
- a de montar entra em `FERRAMENTAS_QUE_GRAVAM`, para a página do "só busca" não prometê-la;
- a página já diz "Ele age com o seu nome e com os seus acessos, nada além": isso cobre quem não tem a OC.

Se o senhor preferir que quem já ligou leia a página nova, o caminho é avisar e pedir que desliguem e liguem de
novo. Não recomendo forçar: derrubar as ligações apaga as sessões, e isso é um ato que não volta.

**3. A regra da marca.** Vale pela IA como vale na tela, e mora no banco, num lugar só:
- a `compras.pode_emitir_oc`, que é a mesma pergunta da tela;
- as quatro ferramentas passam por ela, e as buscas também;
- provado no cenário do financeiro, que ganha a marca sozinho (D891): o `quem sou` diz que não, e a busca é
  recusada.

**4. O desfazer.** É o `docs/roteiros/desfazer_a_oc_no_mcp_d954.sql`, e **está provado no ensaio**:
- tira as três ferramentas, o portão da OC e a regra única;
- devolve as cinco funções que a migration reescreveu (`salvar_oc`, `definir_status_oc`, `ia_confirmar`,
  `ia_quem_sou` e a trava) **palavra por palavra**. O texto foi lido da produção, que ainda não tem a D954, e o
  md5 de cada uma é conferido no fim do próprio desfazer;
- **a trava fica.** Só a lista dela volta a ser a de antes, e o desfazer recusa se a trava sumir;
- os rascunhos que a IA já gravou ficam: são OCs comuns, que a pessoa vê e cancela no Histórico;
- os desfazeres da D878 e da D864 agora recusam se a D954 ainda estiver no banco, com o nome do roteiro que vem
  antes. Provado no ensaio, só com o bloco de checagem, dentro de begin/rollback;
- do lado da `mcp`: a função volta pelo `implantar_funcao.py --do-commit` do commit de antes, e a tela da OC volta
  ao pacote anterior **antes** do desfazer do banco, porque a carga dela vai ler a `regra_da_oc`.

**5. A ordem na produção (§12.8)**, como a da OC:
1. o banco, por carta sua, que pode ir porque o desfazer está provado (emenda 3);
2. a tela da OC;
3. a ferramenta na `mcp` e a página "Permitir" da Central;
4. o registro do Antigravity.

**O perito** olha as duas casas juntas antes do item 1.

## §4 — A prova no ensaio

**A bateria nova, `testes-rls/teste_oc_no_mcp.sql`: 43 OK, 0 falhou.**
- Usa quatro pessoas de mentira (engenharia; financeiro, com a marca; leitura; e alguém sem a marca da IA) e duas
  IAs (uma que grava e uma "só busca").
- Usa uma empresa de mentira com a matriz bloqueada e duas filiais, uma empresa toda bloqueada, uma obra tocando e
  uma em orçamento.
- O que ela prova:
  - o portão, a marca e o papel;
  - a filial que a regra escolhe;
  - as chaves fechadas e o teto;
  - as contas iguais às da tela, e o ensaio que não deixa sobra;
  - o código de conferência errado;
  - a filial que muda entre a proposta e o sim;
  - o mesmo pedido confirmado duas vezes;
  - a IA que tenta emitir, mudar OC ou mandar status;
  - a trava;
  - o `pela_ia`.

**Seis iscas**, cada uma sabotando uma peça dentro da transação do teste. As seis foram pegas:

| a isca | pega nos cenários |
|---|---|
| a régua tirada do portão | 4, 5 |
| o status passa na `salvar_oc` | 33, 34 |
| uma coluna a mais na busca | 11 |
| a trava sem as ferramentas novas | 9 |
| a filial bloqueada vira a principal | 1, 2, 10, 16, 18, 23, 28, 32 |
| o ensaio da proposta não se desfaz | 17 |

**As baterias de antes, no ensaio, com a D954 dentro (todas com 0 falhou):**
- `teste_mcp_da_central` 61;
- `teste_cadastro_de_prestador` 48;
- `teste_so_busca_na_pagina_permitir` 13;
- `teste_ordem_de_compra_barrada_por_pessoa` 40;
- `teste_financeiro_sem_a_oc` 20;
- `teste_qualificacao_na_data_da_oc` 23;
- `teste_destinatario_da_oc` 15;
- `teste_cancelada_volta_a_emitida` 12;
- `teste_qualificacao_e_entrega` 39;
- `teste_auditoria` 22;
- `teste_oc_nao_emite_com_quantidade_0` 18, mais 3 pulados que já pulavam antes.

**O desfazer, no ensaio:**
1. rodou e conferiu o md5 das cinco funções;
2. a bateria da OC pulou;
3. a Central, o prestador, a página "Permitir", a marca da OC e a auditoria seguiram verdes;
4. reapliquei a migration, e tudo voltou: 43, 61, 48, 13 e 40, e a regra única batendo.

**A conferência da casa (`conferir_tudo.py`) mede a produção.** Por isso, até a D954 subir, ela diz NÃO em duas
linhas além das duas de sempre:
- uma migration no disco sem estar no banco (a D954);
- a bateria nova pulada, porque a produção ainda não tem a migration. As outras 72 baterias deram 1852
  asserções verdes.

É o estado esperado. As duas linhas voltam ao verde quando a produção receber a migration.

## §5 — O que não fiz

- Nada na produção.
- Nada na função `mcp`.
- Nenhuma linha na tela da OC nem na página da Central.
- Nenhum comando pediu licença.

— Banco_de_Dados
