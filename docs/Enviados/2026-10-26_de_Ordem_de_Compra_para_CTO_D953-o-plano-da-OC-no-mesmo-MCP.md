# D953 — O plano: a IA monta o rascunho da OC pelo mesmo MCP, e quem emite é a pessoa, na tela

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` e `Central` · **Data:** 26/10/2026, 16h38
**Responde:** `2026-10-26_de_CTO_para_Ordem_de_Compra_D953-a-OC-no-mesmo-MCP-o-plano.md`

**Espero de volta:**
- a sua aprovação, com as três escolhas do §7;
- do Banco, os nomes das ferramentas (§1) e o lado dele: as funções `ia_*`, a trava e o "Permitir".

**Nada de código.** Li a lei 4, §12, inteira. Li também o código desta casa, as migrations do Banco (a `salvar_oc`, a
`pode_emitir_oc`, a D808 e a D814) e a função `mcp` da Central, tudo só lendo.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §0 — O caso, em uma linha

A pessoa aponta a pasta, e a IA lê a cotação. Depois:
1. a IA acha o fornecedor e a obra;
2. a IA propõe o rascunho;
3. a pessoa vê tudo, com o dinheiro em destaque, e diz sim;
4. o banco grava um **rascunho**, sem número, pela mesma `compras.salvar_oc` do botão "Salvar Rascunho";
5. a pessoa abre o rascunho na tela, confere e emite, como hoje.

**A IA nunca emite.** O portão de gente é a emissão na tela, e é ele que segura o pior caso do §6.

## §1 — As ferramentas, uma por botão (§12.2)

Os nomes são a minha proposta; o Banco confirma.

| Ferramenta | O botão que ela espelha | A função do banco por trás | O que devolve |
|---|---|---|---|
| `buscar_fornecedor_e_obra_da_oc` | os campos "Fornecedor" e "Obra" da Nova OC (a busca de empresa e de obra) | nova `ia_buscar_para_oc`, só leitura, com os direitos da pessoa | até 10 empresas que entram na OC, cada uma com a filial que a OC usaria e o selo da qualificação de material (como a tela mostra); até 10 obras visíveis à pessoa; as ECRs (código e nome) para os itens |
| `buscar_ordens_de_compra` | a busca do Histórico | nova `ia_buscar_ocs`, só leitura | até 20 OCs: número (ou "rascunho"), status, data, fornecedor pelo apelido, obra e total geral. Serve para a IA não montar de novo o que já existe |
| `propor_rascunho_de_oc` | o "Salvar Rascunho" da Nova OC | nova `ia_propor_rascunho_de_oc`, que **não grava** | o rascunho inteiro como vai ficar (§4), com o pedido e o código de conferência |
| `confirmar` | o "sim" da pessoa | a `ia_confirmar` que já existe, com um caso a mais | a OC gravada: o id, o status "rascunho" e a frase de onde abrir |

- **A `buscar` da Central fica como está.** Ela é da Central, e a regra de quem entra na OC é desta casa.
- **Nenhuma ferramenta muda OC que já existe.** A IA só cria um rascunho novo; editar, emitir, cancelar e marcar
  entrega continuam só na tela.

## §2 — O que a tela ainda grava direto, ou decide sozinha

**A gravação da OC já passa pelas funções:** `salvar_oc`, `definir_status_oc` e `marcar_pdf_gerado`. As outras
escritas da casa também são `rpc`: a qualificação, o recebimento, os registros e o procedimento.

**Gravam direto na tabela, e ficam fora do MCP:**
- a gaveta do fornecedor (`FornecedorDrawer`), que faz `upsert` em `core.fornecedores` (`dados.ts:337`);
- o cadastro novo, que faz `update` em `core.empresa_raiz.fornece_material` (`dados.ts:388`).

É a D877b e a D878: a gaveta fica como está. Nenhuma ferramenta cadastra nem corrige fornecedor. Se a cotação é de
quem não está cadastrado, a IA diz isso e para, e a pessoa cadastra na tela.

**O achado que pesa: duas regras moram só na tela,** e o rascunho da IA depende delas:
- **`entraNaOc`** (`fornecedores.ts:41`): ativo, da lista de material e não bloqueada para compra nova. O comentário da
  própria tela diz: "nenhum gatilho do banco o lê: se a tela não travar, ninguém trava" (D545, D607);
- **`filialPrincipal` e `escolherEmpresa`** (`fornecedores.ts:406`): a matriz, ou a de menor ordem que pode (D549,
  D888b).

Se a função da IA escolher a filial por conta própria, nascem duas regras, e isso é o que o §12.2 proíbe. A minha
proposta é a regra única primeiro (escolha A do §7):
- o Banco escreve `compras.entra_na_oc` e `compras.filial_da_oc`;
- a carga desta casa passa a ler as duas;
- as funções da tela viram leitoras do que o banco disse.

Antes de trocar, um teste compara as duas regras com os mesmos cadastros.

## §3 — O que a IA não pode, porque a pessoa também não pode

- **A marca `sem_ordem_de_compra` (D814, D891).** A recusa mora dentro da `compras.pode_emitir_oc`, e a `salvar_oc`
  pergunta a ela na primeira linha. A OC fecha a tela inteira para quem tem a marca (`App.tsx:363`). Proposta:
  - as quatro ferramentas perguntam à `pode_emitir_oc` antes de qualquer coisa, inclusive as de busca;
  - quem tem a marca nem vê as ferramentas da OC no `tools/list`, do mesmo jeito que a Central esconde as de gravar.
- **Emitir fica na tela.** Não achei motivo para ser pela IA, e há três contra:
  1. a emissão gasta o número do PBQP-H e fotografa o destinatário da nota;
  2. a emissão passa pela trava da qualificação na Data (D808, D810) e pela trava da filial bloqueada, que é só da
     tela (§2);
  3. o PDF que vai ao fornecedor e à pasta da obra nasce no navegador (jsPDF e `guardar-oc-na-obra`). Uma OC
     emitida pela IA ficaria sem PDF.
- **A `propor_rascunho_de_oc` força o status "rascunho".** A `salvar_oc` aceita `status` no cabeçalho e, com ele,
  emite: reserva o número e fotografa o destinatário. A função da IA nunca passa a chave `status`, nem `oc_id`, nem
  `versao`.
- **Pix e dado de banco.** A OC não tem esses campos no fornecedor (a gaveta é de material). Mesmo assim, as buscas
  devolvem uma lista fechada de colunas, nunca a linha inteira. O CPF de fornecedor pessoa física sai mascarado,
  como na Central.

## §4 — A gravação em dois passos (§12.3)

**O que a `propor_rascunho_de_oc` recebe:**
- a empresa e a obra (os ids da busca), a condição de pagamento como está escrita, a entrega prevista (só se o papel
  disser), o frete, as outras despesas, o desconto material e a observação;
- **os itens, de 1 a 60:** descrição, observação, quantidade, unidade, preço, IPI, desconto (até 4 casas), o código
  da ECR, e o total que o papel imprime na linha;
- **o total do papel.**

**O que ela devolve, antes de gravar:**
- **o dinheiro em destaque, no alto:** o TOTAL GERAL que a OC vai somar e o total que o papel diz, lado a lado, com
  "batem" ou "diferença de R$ X". É a frase do cartão "Total lido" (D893);
- **linha por linha:** quantidade × preço, o desconto, o total da linha pela conta do banco e o total do papel. A
  linha que não fecha ao centavo vem marcada;
- a empresa pelo apelido, a filial que a OC vai usar e o selo da qualificação de material **na Data de hoje**. Se a
  qualificação não cobre, a proposta grava o rascunho mesmo assim, como a tela faz, mas avisa que a emissão vai ser
  recusada e por quê;
- o que ficou de fora e por quê: a ECR que não existe, a quantidade 0 ou negativa, a linha em branco;
- o pedido e o código de conferência, que valem 15 minutos e uma vez só, como na Central.

**O que a `confirmar` grava:**
- exatamente o que foi mostrado (o md5 do pedido), pela mesma pessoa e pela mesma IA;
- pela `salvar_oc`, com o `request_id` tirado do pedido. Assim, repetir a confirmação devolve a mesma OC, sem criar
  outra;
- `origem_sistema = 'ia'` e `origem_id` com o nome do cliente OAuth. Essas colunas já existem na
  `compras.ordens_compra` e hoje ficam vazias. A tela não as manda no `update`, então a marca fica quando a pessoa
  salvar depois;
- o carimbo `pela_ia` na auditoria, se a `core.auditar` já cobre a `ordens_compra`. **Isso o Banco confirma**: eu
  vi a auditoria da OC nascer em `20260813230000`, mas não conferi que ela pega a coluna nova da D860.

**A "tranca antes de comparar" não se aplica aqui:** a OC é nova, e não há linha de outra pessoa para sobrescrever.
O que se tranca é o pedido.

**O teto de 60 itens é chute meu.** A cotação de 23/10 tinha 11. Peço ao Banco que meça o maior número de itens
de uma OC na produção, e aí o teto fica acima dele.

## §5 — As regras de negócio, lidas e não inventadas

| Regra | Onde mora hoje | Como a ferramenta respeita |
|---|---|---|
| quem cria OC: admin, engenharia, financeiro, encarregado | `compras.pode_emitir_oc` (`20260810234000`) | a `salvar_oc` pergunta; as buscas também (§3) |
| a marca `sem_ordem_de_compra` | dentro da mesma régua (D814) | recusa com "Seu acesso não inclui a Ordem de Compra." |
| rascunho sem número e sem fotografia; número só na emissão | `salvar_oc` (18/08) | a proposta nunca manda `status` |
| o clique duplo não vira duas OCs | `request_id` na `salvar_oc` | o `request_id` vem do pedido |
| a filial que entra e a matriz | só na tela, por enquanto (`entraNaOc`, `filialPrincipal`) | a regra única primeiro (§2, escolha A) |
| a qualificação que valia na Data | gatilho `oc_emitida_exige_qualificacao` (D808, D810), só na emissão | a proposta mostra o selo e avisa; quem recusa é a emissão, na tela |
| quantidade 0 não emite | D683 (banco) e `itensDaEmissao.ts` (tela) | a proposta recusa quantidade 0 ou negativa |
| o total ao centavo | `compute.ts` (tela) e `compras.oc_totais` (banco) | a proposta mostra a conta do banco ao lado do total do papel; a IA manda o desconto com 4 casas para a linha fechar |
| o desconto entra uma vez só | a conta do rodapé (D888) | a IA manda `desconto_material` só se as linhas não trazem o desconto; a diferença aparece antes do sim |
| o destinatário da nota (o nome no papel) | a fotografia na emissão, pela obra (D655, `fotografar_destinatario`) | a IA não manda: a emissão resolve |

Duas correções ao que a D953 cita:
- **a D797 é a quantidade por item do "Só uma parte" do recebimento**, e não da OC. A regra de quantidade da OC é a
  D683;
- **"o papel no nome do cliente"** eu li como o destinatário da nota, que a emissão fotografa pela obra. Se o senhor
  quis dizer outra coisa, me corrija.

## §6 — A prova e o desfazer

**No ensaio, com papel de mentira:**
- uma cotação inventada de 11 linhas (a do teste de 23/10, com nomes trocados) e uma de 61 linhas, para o teto;
- os casos tortos:
  - a empresa fora da OC;
  - a filial bloqueada;
  - a pessoa com a marca;
  - o papel `leitura`;
  - a ECR que não existe;
  - a quantidade 0;
  - o pedido vencido e o repetido;
  - a proposta com a chave `status` enfiada;
- as sabotagens: tirar a régua, deixar passar o `status`, devolver uma coluna a mais na busca.

**De quem é cada parte:**
- o Banco prova as funções nos `testes-rls`;
- eu provo a tela: o rascunho que veio da IA aparece no Histórico e abre na Nova OC com um aviso "Montado pela IA
  (nome). Confira antes de emitir.". A prova é por tela de prova com dados inventados, porque agente não entra com
  senha.

**O meu pedaço de código, depois da aprovação:**
- o aviso no Histórico e na Nova OC, lido de `origem_sistema`;
- a carga lendo `entra_na_oc` e `filial_da_oc`, se a escolha A passar;
- um teste que confere se a conta da tela (`computeOcTotals`) e a `oc_totais` dão o mesmo número no papel de
  23/10.

São umas 150 linhas de produto e 250 de teste. **Perito sempre**, pelo §12.8.

**A ordem na produção (§12.8):**
1. o banco: a regra única e as funções;
2. a tela desta casa;
3. a ferramenta no `mcp`;
4. o registro do Antigravity, à mão.

**O desfazer:**
- o Banco tira as quatro ferramentas e as funções `ia_*` da OC, e **deixa a trava** (§12.4);
- os rascunhos que a IA já gravou continuam rascunhos comuns. A pessoa os vê no Histórico e, se não servirem, os
  cancela lá, como qualquer outro rascunho;
- a tela volta ao pacote anterior. O aviso só aparece quando há `origem_sistema = 'ia'`, então ele não atrapalha
  quem fica.

## §7 — As escolhas que ficam com o senhor

- **A.** A regra de quem entra na OC e da matriz vai para o banco **antes** da ferramenta (a minha recomendação), ou
  a função da IA copia a regra, com um teste que compara as duas. A segunda é mais rápida e deixa duas regras.
- **B.** A busca de OCs entra já, ou só a de fornecedor e obra. Recomendo entrar: é só leitura, e evita que a IA monte
  duas vezes a mesma cotação.
- **C.** O teto de itens: 60, até a medida do Banco.

## §8 — Uma coisa do §12.6 que precisa de olho

O Antigravity trabalha como agente, e ele pode chamar `confirmar` sem perguntar à pessoa. O §12.6 diz que a IA só é
ligada numa conta em que uma pessoa confirma cada gravação. Aqui o estrago possível é pequeno, porque o pior caso é
um rascunho sem número, que ninguém emite sem abrir a tela. Mesmo assim:
- vale conferir se o Antigravity da pessoa está no modo que pede licença antes de cada ferramenta;
- vale desligar o treino da IA antes do primeiro dado de verdade.

O nome da obra pode ser o de um cliente.

— `Ordem_de_Compra`
