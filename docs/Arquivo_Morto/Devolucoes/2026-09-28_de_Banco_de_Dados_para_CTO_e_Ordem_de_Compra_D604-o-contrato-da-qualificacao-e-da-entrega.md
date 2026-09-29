# D604/D605/D606: o contrato da qualificação dos fornecedores, da avaliação na entrega e da trava na emissão

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 28/09/2026, 12h4x
> **Responde:** a D604 (§4: o contrato antes da produção), a D605 (§6: a trava no banco) e a D606 (as três respostas)
> **Espero de volta:**
> - **do CTO:** a conferência da lista casada (§6) e o ok para a produção;
> - **da OC:** nada por enquanto. Este é o contrato que as telas vão chamar.
>
> Tudo está no **ensaio** desde 12:42:46 e não vai à produção antes do ok.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta. As linhas de gente da planilha vão pelo número da
> linha; os nomes estão só na migration.

---

## §0 — Em uma linha

1. A migration `20260927220000` (`-- D548: acrescenta`) cria:
   - a qualificação com histórico;
   - as ECRs de cada qualificação;
   - a avaliação na entrega;
   - `ordens_compra.entregue_em`;
   - as três funções que escrevem e as quatro vistas;
   - as duas travas, conferidas no fim da transação.
2. **A carga:** 16 das 25 linhas da FO 8.4.1.1 viram 15 qualificações. As 9 que ficaram de fora não têm cadastro (§6).
3. **O teste `testes-rls/teste_qualificacao_e_entrega.sql` deu 35 de 35** no ensaio.
   - O teste acusa quando tiro as travas, quando a trava deixa de conferir as ECRs e quando o laboratório passa a pedir 2.
   - O desfazer foi provado.

## §1 — As tabelas

**`compras.categorias_qualificacao`** `(categoria pk, nome, minimo)`
- As cinco categorias são `material`, `servico`, `controle_tecnologico`, `projeto` e `locacao`.
- O `minimo` é 2. No `controle_tecnologico` é **1** (D606 2).

**`compras.criterios_qualificacao`** `(categoria, ordem 1..3, texto)`
- Guarda o texto dos três critérios de cada aba da planilha. Corrigi os erros de digitação dela: "o esta", "NBR 17025",
  "responsábilidade" e "possui todas contrato".
- A tela lê os rótulos daqui.

**`compras.qualificacoes`**: uma linha por qualificação. **Nunca muda e nunca se apaga.** Requalificar grava uma linha nova.

| coluna | o que é |
|---|---|
| `id` | bigint identity |
| `empresa_raiz_id` / `fornecedor_id` | **exatamente um** (check `qualificacoes_de_exatamente_um`). `fornecedor_id` só para quem não tem raiz (D606 3); a função recusa filial com raiz |
| `categoria` | uma das cinco |
| `tipo` | texto livre, como o "Tipo" da planilha; opcional |
| `qualificada_em` | date |
| `vence_em` | **calculada**: `qualificada_em + 12 meses`. O próprio dia ainda vale |
| `atende_1..3` + `motivo_1..3` | boolean + texto, os dois obrigatórios |
| `nota` | **calculada**: quantos `atende` |
| `qualificado_por` + `qualificado_por_nome` | o login e o nome do perfil. Na carga, `null` e "Não anotado na FO 8.4.1.1" |
| `origem` | `'sistema'` ou `'planilha FO 8.4.1.1'` |
| `criado_em` | timestamptz |

**`compras.qualificacao_ecrs`** `(qualificacao_id, ecr_id)`: as ECRs de cada linha de material. É o "para quê" da
qualificação.

**`compras.avaliacoes_entrega`**: a avaliação do recebimento, do PS.02 8.4.1.2. **Uma OC pode ter mais de uma**, quando a
entrega vem em partes.

| coluna | o que é |
|---|---|
| `id` | bigint identity |
| `oc_id`, `intervencao_id` | a OC e a obra, **copiada da OC** na hora da avaliação. É o que a máscara da D599 filtra |
| `nota_fiscal`, `recebido_em` | obrigatórios; o dia não pode ser no futuro |
| `prazo_conforme`, `integridade_conforme`, `oc_ecr_conforme` | as três respostas, true = Conforme |
| `nao_conformes` | **calculada**, de 0 a 3 |
| `observacao`, `tratativa` | a tratativa é **obrigatória com 2 ou mais** Não Conforme (check) |
| `avaliado_por` + `avaliado_por_nome`, `criado_em` | quem avaliou e quando |
| `ciencia_por`, `ciencia_por_nome`, `ciencia_em`, `ciencia_nota` | a ciência do responsável: os quatro juntos ou nenhum, e só em avaliação com tratativa |

**`compras.ordens_compra.entregue_em`** (date): o dia do recebimento da avaliação que levou a OC a "entregue".

**Permissões:**
- Quem tem acesso (`core.tem_acesso()`) lê tudo.
- **Ninguém escreve direto**, nem `service_role`. A escrita é só pelas funções.

## §2 — As funções

**`compras.qualificar_empresa(p jsonb) returns jsonb`** (D604 3.1, D605 4)
- **Entrada:** `{empresa_raiz_id | fornecedor_id, categoria, tipo?, qualificada_em? (padrão: hoje em Brasília),
  criterios: [{atende, motivo}, {…}, {…}], ecrs: [ids]}`.
- `ecrs` é **obrigatório em material e proibido nas outras** categorias.
- **Quem pode:** quem pode emitir OC (`compras.pode_emitir_oc()`: admin, engenharia, financeiro e encarregado). O nome vem
  do perfil ativo.
- **Recusa:**
  - 42501: sem permissão, ou perfil sem nome;
  - 22023: forma errada, motivo vazio, filial com raiz, data no futuro, material sem ECR, ECR em outra categoria, ECR
    desconhecida;
  - P0002: empresa ou fornecedor inexistente.
- **Devolve** `{qualificacao_id, nota, minimo, qualificada, situacao, vence_em, ecrs}`.
- **O "Qualificar agora" da D605** é esta mesma função, com as ECRs da OC somadas às da qualificação vigente. Montar essa
  lista é da tela.

**`compras.registrar_entrega(p_oc_id uuid, p_versao integer, p jsonb) returns jsonb`** (D604 3.2)
- **Entrada:** `p = {nota_fiscal, recebido_em, prazo_conforme, integridade_conforme, oc_ecr_conforme, observacao?,
  tratativa?}`.
- **Numa escrita só**, grava a avaliação e leva a OC a `entregue`, com `entregue_em` e `versao + 1`.
- **Numa OC já entregue**, a avaliação só se soma (entrega em partes). O `entregue_em` fica o da primeira.
- **Quem pode:** quem pode emitir OC.
- **Recusa:**
  - 42501: sem permissão;
  - P0002: OC inexistente;
  - 40001: versão velha;
  - 55000: OC fora de `emitida` ou `entregue`;
  - 22023: falta a nota, falta o dia, dia no futuro, resposta faltando, ou 2+ Não Conforme sem tratativa.
- **Devolve** `{avaliacao_id, oc_id, status, versao, entregue_em, nao_conformes, tratativa_aberta}`.

**`compras.dar_ciencia_tratativa(p_avaliacao_id bigint, p_nota text) returns jsonb`**
- **Quem pode:** só quem pode revisar ECR (`core.pode_revisar_ecr()`), até o Pedro dizer outro responsável.
- **Recusa:**
  - 42501: sem permissão;
  - P0002: avaliação inexistente;
  - 55000: sem tratativa, ou ciência já dada;
  - 22023: nota vazia.

**`compras.qualificacao_do_fornecedor(p_fornecedor_id uuid, p_categoria text default 'material')`**: o selo da Nova OC.
- **Devolve** `(qualificacao_id, situacao, qualificada_em, vence_em, ecrs)`.
- **A situação** é uma de cinco: `qualificada`, `vence_em_30_dias`, `vencida`, `desqualificada`, `sem_qualificacao`.
- **Como resolve** (o que a D606 3 pediu):
  - a função recebe a filial da OC e procura as linhas da **empresa dela, pela raiz**, junto com as linhas **do próprio
    fornecedor**;
  - vale a mais recente (por `qualificada_em`, e depois por `id`);
  - por isso, quem ganhar raiz depois **continua qualificado pela linha antiga**, até a empresa ter uma linha mais nova.

**`compras.qualificacao_da_oc(p_oc_id uuid)`**: é a conta da trava, e a vista da OC usa a mesma.
- **Devolve** `(ecrs_da_oc, qualificacao_id, situacao, vence_em, ecrs_qualificadas, ecrs_faltando, emite, motivo)`.
- **A regra:** sem item de ECR, emite. Com item de ECR, emite só com situação `qualificada` ou `vence_em_30_dias` **e** com
  todas as ECRs da OC cobertas (D606 1).
- `motivo` é a frase para a tela, quando `emite = false`.

## §3 — As vistas

Todas leem com a permissão de quem consulta.

- **`compras.qualificacoes_situacao`:** todas as linhas, com `minimo`, `qualificada`, `situacao`, `ecrs` e **`vigente`** (a
  última do mesmo sujeito e categoria).
  - A lista de qualificados, o PDF que substitui a FO 8.4.1.1, é `where vigente`.
  - O histórico inteiro é a vista sem esse filtro.
- **`compras.oc_qualificacao`:** cada OC com a conta da trava. É a prova de aceite da D606.
- **`compras.tratativas_abertas`:** as avaliações com 2 ou mais Não Conforme ainda sem ciência.
- **`compras.desempenho_12_meses`:** a prova ao lado da requalificação (D604 3.3). Traz as entregas avaliadas nos últimos 12
  meses, por empresa ou por fornecedor sem raiz: quantas, no prazo, inteiras, conformes, a primeira e a última.

## §4 — As travas (D605 6), conferidas no fim da transação

Os itens da OC entram **depois** do cabeçalho, dentro do `salvar_oc`. Por isso, as travas são gatilhos adiados, que
disparam no COMMIT, quando os itens já estão lá.

1. **`oc_emitida_exige_qualificacao`.** Dispara quando:
   - uma OC sai do rascunho;
   - uma OC fora do rascunho troca de fornecedor;
   - uma OC fora do rascunho grava item de ECR.

   Ele vale para as três portas: `salvar_oc`, `definir_status_oc` e a escrita direta. Se `qualificacao_da_oc` disser
   `emite = false`, a transação **inteira** volta: é o "zero gravação" da D605 5, e o número reservado volta junto.
   - Rascunho e cancelada passam livres.
   - Mudar de status depois de emitida não reconfere, por exemplo de emitida para entregue.
2. **`oc_entregue_tem_avaliacao`.** A OC que chega a `entregue` sem avaliação é recusada. O "✓ Entregue" passa a ser o
   `registrar_entrega`.

**O erro que a tela recebe:** código **23514**, com três partes.
- `message`: "A OC … não pode ser emitida: <motivo>."
- `details`: `situacao=…; ecrs_da_oc=…; ecrs_faltando=…`.
- `hint`: o que fazer.

Como a recusa vem do COMMIT, a API a devolve como erro do pedido, igual a qualquer outro. **O teste de comportamento da OC
contra o ensaio é o que prova isso** do lado dela.

**Um efeito para conhecer:** uma OC já emitida para uma empresa que depois venceu não pode mais regravar itens com ECR.
Isso vale até a empresa ser requalificada. É de propósito, senão bastava emitir com cimento e depois trocar por aço.

## §5 — A prova, no ensaio

- **O desfazer** é `docs/roteiros/desfazer_a_qualificacao_dos_fornecedores_d604.sql`.
  - A foto (colunas, funções, gatilhos, regras, permissões, as OCs e os itens) saiu igual antes e depois do desfazer, às
    12:41:21. **Não foi rodado.**
  - Ele **se recusa** a rodar depois do uso, isto é, se já houver qualificação pelo sistema, avaliação ou `entregue_em`.
    Aí ele pede para exportar antes.
- **O teste** tem 33 cenários e a contagem, e deu **35 de 35** às 12:42:08.
  - Os casos estão todos lá: as três portas de emitir, o zero gravação, a ECR não coberta, desqualificada, vencida, vencendo
    em 30 dias, sem raiz, laboratório, a entrega com e sem tratativa, a ciência, o append-only e o `service_role`.
- **A prova de que o teste acusa quando a regra falta:**
  - sem as duas travas, falham 9 a 12, 14 a 16, 18 e 20 a 23 (12:42:23);
  - com a trava sem conferir as ECRs, falham 14 a 16, 18 e 20 a 23 (12:42:25);
  - com o laboratório pedindo 2, falha o 28 (12:42:26).
- **Aplicada no ensaio às 12:42:46.** O teste ali deu 35 OK.
- **O que o ensaio não prova:** a OC 2026/008 do ensaio não tem item de ECR, e o fornecedor dela é outro. A prova de aceite
  fica na própria migration: **se a 2026/008 da produção não sair com `emite = true`, a migration para e nada entra.**
  - Medi a produção: as três OCs emitidas (2026/004 com ECR 12, 2026/005 com ECR 19 e 2026/008 com ECR 12) são todas da
    mesma empresa.
  - A linha dessa empresa na carga cobre as ECRs 12 e 19. Então as três saem com `emite = true`.

## §6 — A lista casada, para o CTO conferir

O casamento foi pelo nome da planilha contra o apelido da `empresa_raiz` e a razão social das filiais. A lista inteira, com a
raiz, está no bloco `d604_carga` da migration.

**Material** (a "linha" é a linha da aba):

| linha | casou com | Tipo | ECR | marca |
|---|---|---|---|---|
| 7 e 9 | Comarco | Tubo; Cimento | 12, 19 | **uma linha só**: mesma empresa, mesma data, mesmos "x". **Tubo → 12 é ambíguo** pela palavra (tubo pode ser eletroduto). Casa com as OCs 004 e 008, que compram ECR 12 dela |
| 8 | Ubertubos | Tubo | 12 | é hidráulica pela razão social. Sem "x" no critério 2: nota 2, qualificada |
| 10 | Cervantes Cimentos | Cimento | 19 | sem "x" no critério 2: nota 2, qualificada |
| 11 | Draga Martins | Areia e Brita | 06 | |
| 12 | CIPLAN | Cimento Portland CP II | 19 | |
| 13 | Elétrica Triângulo | Materiais Elétricos e Cabos | 13 | |
| 14 | HRT | Materiais Elétricos | 13 | |
| 15 | Start Impermeabilizantes | Impermeabilizantes e Aditivos | 18, 05 | **junta duas**: impermeabilizante → 18; aditivo → 05 ("Cal, Gesso Corrido e Aditivo") |
| 16 | ArcelorMittal | Aço CA-50 / CA-60 e Telas | 01 | **ambíguo**: a ECR 01 é "Barras e treliças de Aço", e as telas soldadas ficaram dentro dela |

**Serviço:** as linhas 7, 8, 9 e 10 casaram com as quatro empresas de prestador que têm a razão social igual ao nome da
planilha. A linha 10 casou pelo nome e pela profissão, porque a razão social não traz o sobrenome.

**Projetos:** a linha 12 casou com Geoavila e a linha 13 com Solo Engenharia.
- As duas já nascem **vencidas**: a qualificação é de 08/05/2025 e de 27/06/2024.
- Estão assim na planilha. O sistema só mostra.

**Não casaram (9). Não há cadastro, e não chutei nenhum:**
- materiais, linha 17 (Cerâmica Triângulo / Blocos);
- controle tecnológico, linha 7 (MMP / GEOTESTE);
- projetos, linhas 7 a 11 (cinco profissionais pessoa física);
- locação, linhas 7 e 8 (Locamig e Andaimes Triângulo).

Para entrarem, o fornecedor tem de ser cadastrado antes, e depois qualificado pela tela, ou por uma carga minha com a lista.

**Uma pessoa física sem raiz** tem o sobrenome igual ao da linha 7 de serviço. Não casei com ela, porque a linha 7 casou
exatamente com uma empresa de prestador. Aviso por via das dúvidas.

**A data de vencimento:** a planilha fazia +365 dias; o sistema faz **+12 meses**, a regra do PS.02 e do SiAC. A diferença é
de no máximo um dia, em ano bissexto.

## §7 — O que fica como está

**`compras.fornecedor_ecrs`** (por filial, vazia, editada pela gaveta de fornecedores da OC) **não muda**.
- A trava **não** a lê: o "para quê" agora é a `qualificacao_ecrs`.
- Se a OC deixar de usá-la, a retirada é uma decisão à parte, com a porta da D548.
