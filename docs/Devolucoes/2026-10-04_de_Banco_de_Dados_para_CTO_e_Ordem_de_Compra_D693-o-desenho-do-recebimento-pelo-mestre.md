**De:** Banco de Dados · **Para:** CTO, com cópia para Ordem de Compra · **Data:** 04/10/2026, 11h4x
**Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D693-o-recebimento-pelo-mestre-de-obra.md`
**Decisão:** D693, o desenho, antes da migration
**Espero de volta:** a sua aprovação do desenho e as respostas do §10. Depois disso: o ramo, o ensaio e os testes.

# O recebimento pelo mestre de obra: o desenho

Nada foi construído. Esta carta é o desenho e o que medi na produção para chegar nele, só lendo, às 11h1x–11h3x.

## 1. O que a medida mudou no pedido

**`core.tem_acesso()` é "tem perfil ativo", e nada mais:**

```sql
select core.papel_atual() is not null
```

- **Um papel novo passaria nele sozinho.** Ele leria as 49 políticas que usam `tem_acesso` (OC, cadastro,
  intervenções, avaliações…).
- **Por isso a trava não pode morar só em "não dar permissão ao mestre".** Ela tem de morar no próprio `tem_acesso`.
  Se não morar, cada tabela nova nasce aberta para ele.

Medi as outras portas por onde alguém logado chega a dado:

| Porta | Medida | O mestre chega? |
|---|---|---|
| 49 políticas com `tem_acesso` | — | **sim, hoje** → fecha no `tem_acesso` (§3.1) |
| as outras 102 políticas | todas pedem papel nomeado (`e_admin`, `pode_editar_cadastro`, `pode_lancar_documento`, `pode_conferir_despesa`, `e_extrator`, `pode_emitir_oc`, listas de papel) ou o próprio `auth.uid()` | não |
| 53 vistas | 52 com `security_invoker` (seguem a RLS) | não |
| `core.equipe` | **sem** `security_invoker`: devolve nome, papel e ativo de **todos** os perfis a qualquer logado | **sim** → ganha a guarda (§3.1) |
| funções `security definer` que qualquer logado executa | 47; as de `correio` conferem capacidade | **9 sem conferência nenhuma** → ganham a guarda (§3.1) |
| storage `documentos` | a escrita pede `pode_lancar_documento` | não |
| funções de borda | `guardar-oc-na-obra` pede `pode_emitir_oc`; `ler-documento` e `extrair-itens` só passam quem lê `emitentes`/`ecrs` (RLS com `tem_acesso`) | não depois do §3.1; o `ler-documento` precisa abrir para ele (§6.3) |

As 9 funções sem conferência:

- `core.acervo_sem_byte`
- `core.chegada_descartavel`
- `core.chegada_sem_referencia`
- `core.cobertura_do_acervo`
- `core.identidade_ja_lancada`
- `core.obra_em_orcamento`
- `core.onde_esta_o_byte`
- `core.remetente_monitorado`
- `compras.itens_sem_quantidade`, a minha da D683

Hoje elas são abertas a quem tem papel `leitura`, e ninguém reclamou. Para o mestre, o desenho fecha todas.

## 2. Os nomes

- O papel: **`mestre`**.
- Uma origem nova de arquivo: **`recebimento-obra`**.
- Duas tabelas novas: **`core.mestre_da_obra`** e **`compras.recebimento_sem_pedido`**.

## 3. O papel e a obra dele

### 3.1 O papel `mestre`, e o que fecha

1. **`alter type core.papel add value 'mestre'`, numa migration própria.** O Postgres não deixa usar o valor novo na
   mesma transação que o cria, então são duas migrations: a do valor e a do resto.
2. **`core.e_mestre()`:** `papel_atual() = 'mestre'`.
3. **`core.tem_acesso()`** passa a ser `papel_atual() is not null and papel_atual() <> 'mestre'`.
   - Para todos os papéis de hoje, a resposta é a mesma.
   - O teste prova isso papel por papel.
4. **A guarda "mestre não":** `if core.e_mestre() then raise 42501`, ou `where not core.e_mestre()` nas de SQL.
   - Entra nas 9 funções do §1 e em `core.equipe`.
   - É uma guarda negativa de propósito. Uma guarda positiva (`tem_acesso`) quebraria quem as chama com a chave do
     servidor, que não tem papel. A negativa só morde o mestre.
5. **O mestre não ganha nenhuma política de tabela.** Tudo o que ele lê e escreve passa por funções
   `security definer` filtradas pela obra dele (§4 e §5).
   - Pela API direta ele vê **zero linhas** em qualquer tabela, como o login sem perfil de hoje.
   - Exceção: `core.perfis`, onde ele vê a própria linha (a política de hoje já é assim).

### 3.2 A obra dele: `core.mestre_da_obra`

| Coluna | |
|---|---|
| `id` | bigint identity |
| `user_id` | → `auth.users`, o mestre |
| `intervencao_id` | → `core.intervencoes` |
| `desde` / `ate` | timestamptz; `ate` nulo = está na obra |
| `posto_por`, `posto_por_nome` | quem pôs |
| `tirado_por`, `tirado_por_nome`, `motivo_saida` | quem tirou, e por quê (obrigatório ao tirar) |

- **Nunca se apaga, nunca se reescreve.** Trocar o mestre é fechar a linha (`ate`) e abrir outra.
- É único o par (mestre, obra) enquanto aberto.
- **Uma pessoa pode ter várias obras, e uma obra pode ter mais de um mestre ao mesmo tempo** (o substituto). Se você
  quiser um só por obra, é um índice a mais.
- **Quem mantém:** admin e engenharia, por `core.por_mestre_na_obra(p_user, p_obra)` e
  `core.tirar_mestre_da_obra(p_id, p_motivo)`.
  - A escrita direta não tem política: só essas duas funções escrevem.
  - Pôr na obra exige o perfil com papel `mestre` e ativo.
- **Quem lê:** quem tem acesso (`tem_acesso`), pela política.
- **Auditoria:** o gatilho de `core.auditoria`, como as outras tabelas de cadastro.
- **As funções de uso interno:**
  - `core.obras_do_mestre()` devolve as obras abertas de quem chama;
  - `core.e_mestre_da_obra(p_obra)`.

## 4. A lista "material a chegar": `compras.material_a_chegar(p_obra uuid default null)`

- **Quem chama:**
  - **o mestre:** só as obras dele; um `p_obra` de outra obra devolve vazio, sem erro;
  - **quem emite OC:** qualquer obra, para a tela do escritório ver o que o mestre vê.
- **O que devolve, uma linha por OC:**
  - `oc_id`, `numero`, `versao`, `data`, a obra (código e nome curto);
  - **o fornecedor pelo apelido** (`core.fornecedor_resolvido.empresa_apelido`, e a razão social se não houver
    apelido);
  - `itens` (jsonb: posição, descrição, quantidade, unidade, preço unitário, total, prazo);
  - o valor total (`compras.oc_totais`);
  - `entregas` (quantas avaliações já tem) e `ultima_entrega`.
- **Quais OCs entram:** status `emitida` ou `entregue`, **e nenhuma avaliação com `chegou_tudo`**. Assim, a que
  recebeu parte continua na lista até alguém dizer "chegou tudo".
- **O preço vai**, como o Pedro decidiu.
- **O "dia combinado" é o problema que a medida mostrou** (pergunta no §10.1):
  - a OC não tem data de entrega;
  - o que existe é `oc_itens.prazo_entrega`, texto livre por item, e **está vazio nos 14 itens da produção**;
  - a lista devolve o prazo por item como está.

## 5. A entrega

### 5.1 "Chegou tudo?": `compras.avaliacoes_entrega.chegou_tudo`

- **A coluna:** `chegou_tudo boolean not null default true`.
- **O default `true` mantém o que a tela de hoje faz.** Ela não manda o campo, e a primeira entrega fecha, como hoje.
  - Na produção há 0 avaliações, então nenhuma linha muda de sentido.
- **A tela do mestre manda sempre** `true` ("chegou tudo") ou `false` ("só uma parte").
- **Não é "Não Conforme":** ele não entra na conta das três respostas.
- **O status da OC fica como a D604 deixou:** a primeira entrega leva a `entregue`, e `entregue_em` é o dia dela.
  - Quem tira a OC da lista do mestre é o `chegou_tudo`, não o status.
  - Assim nada da D604 muda: os 38 cenários dela continuam valendo.
  - Se você preferir que `entregue` passe a significar "chegou tudo", é o §10.2.

### 5.2 `compras.registrar_entrega`: o que muda

| Hoje | Depois |
|---|---|
| só `pode_emitir_oc()` | `pode_emitir_oc()` **ou** `e_mestre_da_obra(oc.intervencao_id)`; o mestre de outra obra recebe `42501` |
| — | `chegou_tudo` (opcional, `true` se ausente) |
| — | `foto_documento_id` (opcional): precisa ser um `core.documentos` de origem `recebimento-obra`, da mesma obra, e ainda sem avaliação |
| o resto | **igual**: as três respostas, a tratativa com duas ou mais "Não", a nota obrigatória, o dia não futuro, a versão, o nome de quem recebeu |

- **Uma função só, e não uma irmã.** A regra do PS.02 fica num lugar só, e a diferença é só quem pode.
- `avaliacoes_entrega` ganha `foto_documento_id uuid` (→ `core.documentos`) e `sem_pedido_id bigint` (§7).

## 6. A foto da nota

### 6.1 A origem `recebimento-obra` na `arquivar-documento`

- **Destino:** a pasta da obra, na subpasta **`notas e recibos/Recebimento de material`**.
  - Ela fica sem ano/mês, como as outras de obra.
  - O nome é proposta, e decidir é com o Pedro (§10.3).
- **Quem pode:**
  - antes de tudo, a função pergunta ao banco, com o crachá de quem chamou, `compras.pode_receber_na_obra(obra)`:
    o mestre da obra, ou quem emite OC;
  - `obra` é obrigatória nesta origem.
- **A reserva e o storage vão com a chave do servidor, só nesta origem**, depois daquela pergunta.
  - **Motivo:** abrir `core.documentos` e o storage ao mestre pela RLS deixaria ele gravar documento direto pela API.
    Assim, a única porta dele é esta.
  - **A origem é fixada pelo servidor**, e `criado_por` é quem chamou.
- **Sem destino 2:** nada vai a "Notas baixadas".

### 6.2 Como a foto não briga com a nota da esteira, nos dois sentidos

1. **A foto não é barrada pela nota já lançada.** Na origem `recebimento-obra`, a função **não pergunta**
   `identidade_ja_lancada`.
   - A régua de hash continua: a mesma foto duas vezes devolve `ja_existia`.
2. **A nota que chega depois pela esteira não é barrada pela foto.** Este é o risco que a medida mostrou:
   - `core.identidade_ja_lancada` olha os lançamentos **e os documentos guardados**;
   - se a linha da foto tivesse o CNPJ e o número da nota, a nota de verdade chegaria pelo e-mail e seria descartada
     como `ja_lancada`.
   - Por isso, **duas travas**:
     - a linha da foto **não leva** número nem CNPJ em `core.documentos`. O número mora em
       `avaliacoes_entrega.nota_fiscal`, ou em `recebimento_sem_pedido.nota_fiscal`;
     - `identidade_ja_lancada` passa a **ignorar** documentos de origem `recebimento-obra`.
   - O teste prova as duas: com a foto da nota N guardada, a nota N da esteira continua entrando.
3. **A foto não vira lançamento.**
   - Medi a Central: ela casa documento por `origem_item` (o anexo do envelope). A foto não tem `origem_item`, então
     não entra.
   - A origem nova também não está em nenhuma lista de lançamento.

### 6.3 A leitura do número: `ler-documento`

- **Hoje o portão da `ler-documento` é "consegue ler `compras.emitentes`"**, que é RLS com `tem_acesso`. O mestre
  passa a falhar nele.
- **A mudança:** se a leitura de `emitentes` voltar vazia, a função pergunta `core.e_mestre()`, com o crachá de quem
  chamou. Sim → passa.
- **O mestre não recebe a lista de emitentes no corpo.** A função já não devolve ela: usa só para o portão.
- **A tela:** a leitura sugere o número, o mestre confirma, e digita se a leitura falhar. O que vale é o que ele
  confirma.

## 7. Sem pedido: `compras.recebimento_sem_pedido`

| Coluna | |
|---|---|
| `id`, `intervencao_id`, `recebido_em` | a obra e o dia |
| `fornecedor_texto` | o nome que o mestre lê na nota, em texto livre |
| `nota_fiscal` | confirmada pelo mestre |
| `o_que_chegou` | texto livre |
| `chegou_com_estrago` | boolean |
| `observacao` | |
| `foto_documento_id` | → `core.documentos` |
| `registrado_por`, `registrado_por_nome`, `criado_em` | |
| `ligado_oc_id`, `ligado_avaliacao_id`, `ligado_por`, `ligado_por_nome`, `ligado_em` | preenchidos ao ligar |
| `descartado_por`, `descartado_motivo`, `descartado_em` | preenchidos ao descartar |

**As funções:**

- **`compras.registrar_sem_pedido(p jsonb)`:** o mestre da obra, ou quem emite OC. Pede a foto ou a nota.
- **`compras.ligar_sem_pedido(p_id, p_oc_id, p_versao, p jsonb)`:** quem emite OC.
  - Cria a avaliação da OC pela mesma regra da `registrar_entrega`, com o número e a foto do registro.
  - **A OC precisa ser da mesma obra.**
- **`compras.descartar_sem_pedido(p_id, p_motivo)`:** quem emite OC, para o duplicado ou o engano. Nada se apaga.
- **A fila do escritório:** a vista `compras.sem_pedido_na_fila` (`security_invoker`, leitura com `tem_acesso`), com
  o que não está ligado nem descartado.

**Quem responde as três perguntas do PS.02 nesse caso. Proponho como você sugeriu:**

| Pergunta | Quem responde |
|---|---|
| integridade | o mestre: `integridade_conforme = not chegou_com_estrago` |
| prazo | o escritório, na hora de ligar, com o que o mestre disse à vista |
| confere com o pedido | o escritório, na hora de ligar, com o que o mestre disse à vista |

- A tratativa com duas ou mais "Não" vale igual.
- `avaliado_por_nome` é quem recebeu, o mestre. Quem ligou fica em `ligado_por_nome`. As duas pessoas ficam
  registradas.

## 8. A conta do mestre

- **`scripts/criar_usuario.py` ganha o papel `mestre`.** Depois, a obra: `core.por_mestre_na_obra`, pelo admin.
- **A senha, sem ninguém ditar:** o script já gera uma senha aleatória que ninguém vê. O acesso sai por um destes dois
  caminhos (§10.4):
  - **(a) Com e-mail:** o mestre usa "Esqueci minha senha" uma vez, no celular dele, e define a dele. É o caminho
    de hoje, sem nada novo.
  - **(b) Sem e-mail:** um **QR de acesso de uso único**.
    - O admin gera o QR numa tela da OC, e o mestre escaneia na frente dele. O link entra uma vez e vence em 1 hora.
    - Nada passa por chat.
    - Pede uma função de borda pequena, só para admin, com a chave do servidor. **O agente não vê o link:** ele vai
      direto à tela de quem pediu.
- **"O celular lembra":** é a sessão do Supabase guardada no aparelho, do lado da tela da OC.
  - O banco pode pôr validade (`perfis.acesso_expira_em` já existe), se o Pedro quiser que o acesso vença sozinho.

## 9. Os testes (`testes-rls/teste_mestre_da_obra.sql`) e o desfazer

### 9.1 Os testes, além das sabotagens de cada trava

- **O mestre da obra A:**
  - vê a lista de A e não vê a de B;
  - registra na A e recebe `42501` na B;
  - liga foto da A e é recusado com foto de B;
  - registra sem pedido na A e não na B.
- **O mestre pela API direta:**
  - 0 linhas em `ordens_compra`, `oc_itens`, `fornecedores`, `empresa_raiz`, `clientes`, `intervencoes`,
    `lancamento`, `documentos` e `core.equipe`;
  - as 9 funções recusam;
  - não emite OC (`salvar_oc` e `definir_status_oc`);
  - não põe ninguém em obra;
  - não liga nem descarta sem-pedido.
- **Todos os papéis de hoje:** `tem_acesso` igual a antes, papel por papel. As baterias D604 e D683 seguem verdes.
- **A esteira:** com a foto da nota N guardada, `identidade_ja_lancada(N)` responde "não lançada".
- **"Chegou tudo":** a OC fica na lista depois de uma parte e sai depois do "tudo".
- **A arquivar:** controle com origem `recebimento-obra` na pasta de teste.

### 9.2 O desfazer, escrito antes, como sempre

- **Ele tira:** as tabelas, as funções, as colunas novas e a origem; e volta `tem_acesso`, `registrar_entrega`,
  `identidade_ja_lancada`, as 9 funções e `core.equipe` ao texto de hoje.
- **O valor `mestre` do tipo não sai.** O Postgres não tira valor de enum.
  - Fica sem uso, e o desfazer **para** se existir perfil `mestre` ativo.
  - Apagar conta de gente é decisão do Pedro.
- **As duas funções de borda voltam pelo `--do-commit`.**

### 9.3 O tamanho

- Estimo 700 a 900 linhas novas fora dos testes, entre a migration e as duas funções de borda.
- **Deve ficar abaixo das mil da §9.5.** Se passar, aviso antes de pedir a produção.

## 10. O que preciso que você decida (ou leve ao Pedro)

1. **O dia combinado.** A OC não tem data de entrega, e o prazo por item está vazio nas 14 linhas.
   - Sem data, o mestre responde "chegou no prazo?" no escuro.
   - **Proposta:** uma coluna `ordens_compra.entrega_prevista date`, opcional, que a tela de emitir preenche e a
     lista mostra.
   - É mudança na OC também. Faço a coluna se você mandar.
2. **"Entregue" continua sendo a primeira entrega** (o desenho, sem mexer na D604)? Ou passa a ser "chegou tudo"?
3. **O nome da subpasta da foto:** `notas e recibos/Recebimento de material`. Precisa do Pedro.
4. **O acesso sem senha ditada:**
   - (a) e-mail e "Esqueci minha senha", sem nada novo;
   - (b) o QR de uso único, com a função de borda do admin;
   - ou os dois, conforme o mestre.
5. **Um mestre só por obra, ou mais de um?** O desenho deixa mais de um.
