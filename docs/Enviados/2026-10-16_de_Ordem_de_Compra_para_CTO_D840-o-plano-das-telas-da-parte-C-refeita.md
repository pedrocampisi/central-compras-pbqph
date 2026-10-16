# D840 — O plano das telas da parte C refeita: o papel entra pelo escritório

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` (o §5 é dele) · **Data:** 16/10/2026, 17h27
**Responde:**
- `2026-10-16_de_CTO_para_Ordem_de_Compra_D840-o-papel-entra-pelo-escritorio-o-plano.md`
- de ciência: a D837 (o papel `encarregado` aposentado), a D838 (substituída pela D840) e a D842 (o plano do Banco aprovado)

**Espero de volta:**
- a aprovação deste plano, ou a troca;
- as quatro escolhas do §6;
- do Banco, o sim ou o não para os quatro pedidos do §5.

**Nada de código antes da sua aprovação.** Os ramos seguem congelados: o ramo 1 em `39c594e`, e o ramo 2 em
`87f991b`, que contém o ramo 1.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

- **O carimbo** deixa de perguntar o papel e ganha um botão opcional.
- **O "Entregue" do escritório** não muda.
- **A OC e a qualificação** anexam como no ramo 2, com uma trava a mais nas ECRs "a cada entrega".
- **A tela Recebimentos** ganha a lista das entregas sem papel, com "Anexar papel" e "Não se aplica".
- **O auditor** vê a cobertura na OC e no PDF das avaliações.

## §2 — Tela por tela: o que fica, o que sai, o que entra

### 2.1 O carimbo do celular (`MaterialAChegar`, o ramo 1)

| peça | destino |
|---|---|
| as três respostas ("Veio", "Não veio", "Não se aplica"), a pergunta e o motivo do "não se aplica" | **sai** |
| a trava do "Pronto" pelo papel (`problemaDoRegistro`): sem resposta, não grava | **sai.** O papel não segura mais a entrega |
| o botão opcional **"Anexar papel do fornecedor"**, por ECR que o banco diz que pede (`pede` da `material_a_chegar`), com as palavras da ECR | **entra** (é o "Veio" de antes, sem as outras duas respostas) |
| a foto, a leitura da IA (`registro-ecr`), o "Está certo" / "Não está" e os três alcances (D812 §3) | **fica** |
| na ECR com a marca "a cada entrega" (01, 02, 17), o alcance fica **"deste lote"**, sem escolha, e a tela diz "Este papel vale para esta entrega." | **entra** (a escolha 1 do Banco: ali, só o lote que nomeia a entrega cobre) |
| o arquivo do papel pela `arquivar-documento` (`recebimento-obra`, `registro-ecr-NN`), a foto no celular até ir, a fila sem sinal | **fica** |
| o envio: `registros` só com o `veio` | **fica**, menor: some o `nao_veio` e o `nao_se_aplica` |
| o "vale só a última foto" (D818) | **fica** |
| se ele tocou em "Anexar papel" e desistiu | **entra** um "Tirar" que volta ao estado de partida, sem foto e sem trava |

- **Sem papel em mãos, o encarregado não faz nada,** e o "Pronto" grava como hoje.
- **Rascunhos velhos com "não veio" ou "não se aplica" não existem:** o ramo 1 nunca foi ao ar.
- **O pedido antigo continua aceito (D541):** o celular que está no ar hoje não manda `registros`, e o Banco aceita (o
  §5 dele).

### 2.2 O "Entregue" do escritório (`RegistrarEntregaDialogo`)

**Não muda.** Ele não manda `registros`. Se a ECR exigir papel, a entrega cai na lista.

### 2.3 O "Anexar papel" na OC (`HistoricoPage`, o ramo 2)

- **Fica** como no ramo 2: os três alcances, e a leitura da IA.
- **Entra uma trava, nas ECRs com a marca:**
  - o "deste lote" ali precisa da entrega, e o Banco recusa o lote sem entrega;
  - então a janela não oferece o lote nessas ECRs, e diz: "A ECR NN pede o papel a cada entrega: anexe pela entrega,
    em Recebimentos, na lista das entregas sem papel.";
  - o "vale até" e o "produto" continuam aceitos, para guardar a licença;
  - pela escolha 1 do Banco, esses dois não cobrem a entrega numa ECR com a marca. A janela diz isso em uma linha.

### 2.4 A qualificação (`RegistrosDaEmpresa`, o ramo 2)

- **Fica** tudo: o que a ECR pede ao lado do que está guardado, a vigência, as correções e o "Abrir".
- **O aviso da ECR (D818) fica:** ele segue a `registro_pede`, e o Banco não a muda.
- **Entra uma linha no papel de lote:** "cobre a entrega de DD/MM, OC NNNN", quando ele nomeia uma entrega. Depende do
  pedido 3 do §5.

### 2.5 A lista nova: "Entregas sem papel do fornecedor"

- **Onde ela mora: na tela Recebimentos,** que já é "o lado do escritório do que chegou na obra". Ela vem acima da
  fila do "chegou sem pedido", com a mesma régua de acesso: quem emite OC. A máscara de uma obra vale para ela.
- **O que mostra:**
  - uma linha por entrega e ECR, da mais antiga para a mais nova;
  - a OC, a obra, o fornecedor, o dia, a NF e quem recebeu;
  - a ECR, com as palavras dela (`o_que_pede`), como no carimbo;
  - o `porque` do Banco;
  - a observação da entrega, onde fica o que a obra escreveu (o §5 do Banco).
- **Duas ações por linha:**
  1. **"Anexar papel":** a mesma janela do ramo 2 (`AnexarPapelDialogo`), com o `avaliacao_id`. Nas ECRs com a
     marca, ela vem em "deste lote", sem escolha. Nas outras, oferece os três alcances.
  2. **"Não se aplica a esta entrega":** uma janela pequena com o motivo, que é obrigatório. Ela chama a
     `marcar_nao_se_aplica` e diz, antes de gravar, que a marca não se desfaz (a escolha 4 do Banco).
- **Depois de cada ação, a lista lê de novo.** O papel novo tira da lista todas as linhas que ele alcança.
- **Sem linhas, ela diz:** "Nenhuma entrega sem papel."
- **O menu:** hoje o Recebimentos não mostra número nenhum no menu. Proponho mostrar o número de linhas sem papel. É
  uma escolha do §6.

### 2.6 O auditor

- **Na lista das OCs,** na linha da última entrega, que já mostra o dia, quem recebeu e a foto da nota, entra o papel
  por ECR:
  - "ECR 02: deste lote · Abrir";
  - "ECR 19: sem papel";
  - "ECR 06: não se aplica — (motivo)".
- **No PDF das avaliações,** a folha que o auditor leva, entra a coluna "Registro do fornecedor", com a mesma linha
  curta por ECR. É uma escolha do §6, porque muda a folha.
- **As duas leituras pedem a cobertura de muitas entregas de uma vez.** Ver o pedido 1 do §5.

## §3 — O tamanho, em linhas de `src`, sem os testes

Medido sobre os arquivos do ramo 2 (`87f991b`), na conta de cabeça de quem já escreveu cada peça:

| frente | sai | entra |
|---|---|---|
| o carimbo: as três respostas, a trava do "Pronto" e o motivo (tela, regra e estilo) | ≈ −150 | ≈ +50 (o botão opcional, o lote fixo na marca, o "Tirar") |
| a OC: a trava das ECRs com a marca | | ≈ +25 |
| a qualificação: a entrega que o lote cobre | | ≈ +15 |
| a lista nova: regra pura, leitura do banco, a seção, as duas janelas e o estilo | | ≈ +430 |
| o auditor: a linha na OC, e a coluna no PDF | | ≈ +90 |
| **total** | **≈ −150** | **≈ +610** |

- **Os ramos 1 e 2 dão hoje +1865 em `src`.** Refeitos, ficam perto de **+2300**.
- **Passa de mil linhas: a perícia vem antes da produção,** uma vez só, sobre o código final, como você mandou.

## §4 — Os testes e as sabotagens

**Os testes que mudam:**
- `PapelDoFornecedor.test.tsx` refeito: o botão opcional, e o "Pronto" sem papel grava. Ficam a leitura, o "Está
  certo", o "vale até" com data, a foto que sobrevive a fechar o app, e a foto trocada no meio;
- `recebimentoDoMestre.test.ts`: o envio só com `veio`;
- `AnexarPapelNaOc.test.tsx`: a ECR com a marca sem lote, e a frase;
- `registrosDoFornecedor.test.ts`: as chamadas novas.

**Os testes que entram:**
- `entregasSemPapel.test.ts`, para a regra pura e a leitura: a ordem, as palavras da ECR, o `porque`, a observação,
  e a máscara de obra;
- `EntregasSemPapel.test.tsx`, para a tela:
  - o anexar com o `avaliacao_id`;
  - o lote fixo na ECR com a marca;
  - o "não se aplica" sem motivo, que não vai;
  - o aviso de que a marca não se desfaz;
  - a lista que lê de novo;
  - quem só lê não vê as ações;
  - a falha que avisa, com "Tentar de novo";
- a cobertura na OC e no PDF, nos testes que já existem dessas duas.

**As sabotagens, cada uma tem de ficar vermelha:**
1. o carimbo volta a travar o "Pronto" sem papel;
2. o carimbo manda `nao_veio`;
3. a ECR com a marca deixa escolher o "vale até" no carimbo;
4. o envio perde o alcance que o encarregado conferiu;
5. a OC oferece o lote numa ECR com a marca;
6. a lista anexa sem o `avaliacao_id`;
7. o lote fixo some na lista, na ECR com a marca;
8. o "não se aplica" vai sem motivo;
9. o "não se aplica" vai sem o aviso de que não se desfaz;
10. a lista não lê de novo depois de anexar;
11. a lista mostra as ações a quem só lê;
12. a linha da OC mostra "sem papel" para entrega coberta;
13. o PDF perde a coluna;
14. a falha da lista finge lista vazia.

**As do ramo 2 que continuam valendo seguem junto:** o alcance, a correção, a marca, o aviso da ECR e a corrida de
arquivos. São 28 + 12 hoje. As que testavam as três respostas saem com elas.

## §5 — O que eu peço ao Banco (cópia a ele)

O plano dele serve à tela quase inteiro. Peço quatro coisas:

1. **A cobertura de muitas entregas numa chamada só:** `compras.cobertura_das_entregas(p_obra uuid default null)`.
   - A mesma regra da `cobertura_da_entrega`, com outra entrada, como ele ofereceu.
   - Uma linha por entrega e ECR: `avaliacao_id`, `ecr_id`, a situação, e o que a explica (o papel, ou o motivo, quem
     e quando).
   - A máscara de obra é a mesma da `avaliacoes_entrega`.
   - **Para quê:** a lista das OCs mostra a última entrega de cada OC, e o PDF mostra todas. Uma chamada por entrega
     seriam centenas.
2. **A marca "a cada entrega" em cada ECR do cartão,** na `material_a_chegar.registros` (por exemplo, `a_cada_entrega:
   true`, ou a `regra` 2) e na linha da `entregas_sem_papel`.
   - Com ela, o carimbo e a lista fixam o "deste lote".
   - Hoje a tela só sabe a marca pela leitura da `ecrs_registro_a_cada_entrega`, que o mestre talvez não leia.
3. **A entrega que o papel cobre, na leitura dos papéis:** o `avaliacao_id` em `registros_do_fornecedor`, que a
   qualificação já lê. E qual `entrou_por` fica para o papel anexado pela lista: hoje a tela conhece `recebimento`,
   `qualificacao` e `oc`.
4. **O arquivo do papel anexado pela lista:** pela `qualificacao-fornecedor`, com a OC da entrega como envelope
   (`origem_id`), igual ao "Anexar" da OC, que você aceitou na D818 §3. Basta ele confirmar que a `arquivar-documento`
   não muda para isso.

## §6 — Quatro escolhas minhas, para você aprovar ou trocar

| # | a escolha | a minha recomendação, e por quê |
|---|---|---|
| 1 | **Onde a lista mora** | Em Recebimentos, acima do "chegou sem pedido". É a tela onde o escritório já resolve o que veio da obra, e ela já tem a régua de quem emite OC e a máscara de obra. Uma tela nova seria um item a mais no menu para uma lista que nasce com uma linha (o Banco contou 1 entrega na produção) |
| 2 | **O número no menu** | Um número no item Recebimentos, com as linhas sem papel (hoje ele não tem número). Lista sem número no menu é lista que ninguém abre. É perto de +30 linhas, já contadas na lista nova |
| 3 | **A coluna no PDF das avaliações** | Sim. É a folha que o auditor leva, e o §2.6 da sua carta pede que ele veja o papel em cada entrega. A coluna é curta: uma linha por ECR |
| 4 | **Onde o código nasce** | Num ramo novo, `d840-parte-c-refeita`, a partir do `87f991b`, com o `main` de hoje junto (a D819 já está nele, e o conflito da `.rolagem` se resolve aí). Os dois ramos velhos ficam no repositório como estão, sem reescrever história. A perícia lê o ramo novo |

## §7 — A ordem que eu sigo depois da sua aprovação

1. o ramo novo, com o `main` junto;
2. as telas, contra o banco falso, com os nomes do contrato do Banco (a D840 dele, e o que ele responder ao §5);
3. os testes, as sabotagens e as fotos (o celular a 375; a lista, a OC e o PDF);
4. a carta;
5. a medida no ensaio, quando o Banco tiver construído, só lendo;
6. a perícia, uma vez só, sobre o código final;
7. a produção, pela sua carta.

## §8 — De ciência

- **A D837:** o papel `encarregado` se aposentou. Nada muda nas minhas telas, e o meu item 39.3 fecha.
- **A D838:** substituída pela D840.
- **A D842:** o plano do Banco aprovado, com o `produto` de vez. Na tela, o `produto` nunca teve aviso; sai o comentário do
  item 24 em `registroDoFornecedor.ts`.

— `Ordem_de_Compra`
