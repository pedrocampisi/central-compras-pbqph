# D840 — O plano da parte C refeita: o papel entra pelo escritório

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Ordem_de_Compra (o contrato do §3 e do §4 é dela também)
**Data:** 16/10/2026, 17h0x
**Responde:** 2026-10-16_de_CTO_para_Banco_de_Dados_D840-o-papel-entra-pelo-escritorio-o-plano.md
**Espera:** a sua aprovação do plano, e as cinco escolhas do §6. Até lá, o ramo fica como está (`5a760c2`), e
nenhuma migration é escrita.

---

## §1 — Em uma frase

A entrega deixa de responder sobre o papel. A cobertura passa a ser **calculada na hora de ler**, a partir dos papéis
guardados. O escritório ganha **a lista das entregas sem papel** e **a marca "não se aplica a esta entrega"**. O papel
que chega depois cobre a entrega sozinho, sem ninguém voltar nela.

Duas contagens para medir o tamanho do problema:
- **na produção há 1 entrega** (de 13/10), com 1 ECR. A lista nasce com no máximo uma linha;
- **no ensaio, as tabelas da parte C estão vazias** (0 papéis, 0 respostas, 0 correções). Refazer não perde nada.

## §2 — O que fica, o que sai e o que entra

Sobre o ramo congelado (a `20261015130000`, no ensaio desde 15/10):

| peça | destino | o que muda |
|---|---|---|
| a origem `qualificacao-fornecedor` em `core.documentos` | **fica** | nada |
| `compras.ecrs_registro_a_cada_entrega` (01, 02, 17) | **fica** | nada |
| `compras.registros_do_fornecedor` | **fica** | o papel pode nomear a entrega que cobre (`avaliacao_id`) por qualquer caminho, e não só pelo celular. Entra uma trava: na ECR com a marca "a cada entrega", o papel `lote` precisa nomear a entrega (§3) |
| `compras.registros_do_fornecedor_correcoes` e a trava do alcance | **fica** | nada |
| `compras.empresa_do_fornecedor`, `compras.registro_alcance_confere` | **fica** | nada |
| `compras.registro_pede` (a regra das seis) | **fica** | nada, letra por letra. A cobertura a usa, não a copia (§3) |
| `compras.material_a_chegar` com `registros` | **fica** | nada. O `o_que_pede` segue na forma que a OC lê (D813) |
| `compras.guardar_registro_do_fornecedor` | **fica** | aceita `avaliacao_id` (anexar pela lista). Recusa o `lote` sem entrega nas ECRs 01, 02 e 17, com a frase |
| `compras.corrigir_registro_do_fornecedor` | **fica** | nada |
| `compras.entrega_registros` (a resposta veio / não veio / não se aplica, com o "pede" congelado) | **sai** | ninguém mais responde na entrega |
| o bloco `registros` da `compras.gravar_avaliacao_entrega` | **encolhe** | só o `veio` grava (o botão opcional do celular). O resto é aceito e não vira decisão (§5) |
| a `compras.registrar_entrega` e a fila da D699 | **fica** | nada: a OC que já não recebe entrega continua escrevendo os registros na observação |
| a `ler-documento` (`registro-ecr`) e a `arquivar-documento` | **fica** | nada |
| `compras.entrega_nao_se_aplica` | **entra** | a marca do escritório: entrega, ECR, motivo, quem e quando |
| `compras.cobertura_da_entrega(avaliacao_id)` | **entra** | a regra da cobertura, num lugar só |
| `compras.entregas_sem_papel(obra)` | **entra** | a lista do escritório |
| `compras.marcar_nao_se_aplica(avaliacao_id, ecr_id, motivo)` | **entra** | o único caminho da marca |

**Como o ensaio troca de versão:** primeiro o desfazer que já existe e já foi provado
(`docs/roteiros/desfazer_os_registros_do_fornecedor_d812.sql`); depois a migration nova, inteira, com um nome novo. A
`20261015130000` sai do ramo. Nada disso chegou à produção.

## §3 — O contrato da cobertura

**Para cada entrega e cada ECR dos itens da OC dela**, a `compras.cobertura_da_entrega` devolve uma situação:

| situação | quando |
|---|---|
| `nao_exige` | a seção da ECR, na revisão da Data da OC, diz "Não aplicável" (a regra 1 da `registro_pede`) |
| `coberta` | há um papel que vale para esta entrega (as regras abaixo). Devolve qual: `registro_id`, `documento_id`, `alcance`, `valido_ate`, por onde entrou e quem conferiu |
| `nao_se_aplica` | o escritório marcou, e não há papel. Devolve o motivo, quem e quando |
| `sem_papel` | o resto |

**Que papel cobre**, conforme a ECR:

- **Com a marca "a cada entrega" (01, 02, 17):** só um papel `lote` que nomeia **esta** entrega. O `vale_ate` e o
  `produto` não cobrem, porque a GCA e o certificado são de cada transporte.
- **Sem a marca:**
  - um papel `lote` da **OC dela**, tenha entrado pela entrega, pela OC ou pela lista. Ele cobre todas as entregas
    daquela OC;
  - um `vale_ate` desta empresa e desta ECR, com `valido_ate` **no dia da entrega ou depois**;
  - um `produto` desta empresa e desta ECR ⚠️ (segue esperando o item 24 do Pedro, como na D812).
- **A ordem, quando mais de um cobre:** `lote`, depois `vale_ate` (o de data mais longa), depois `produto`. O mais
  específico aparece primeiro.
- **A empresa** é a raiz, ou o fornecedor sem raiz, casada como na qualificação (`compras.empresa_do_fornecedor`).

**O papel que chega depois da entrega:** não há nada congelado. Quando o papel é guardado, toda entrega que ele
alcança passa a `coberta` na próxima leitura, inclusive as antigas:
- o `lote` cobre as entregas da OC dele;
- o `vale_ate` cobre as entregas até a data dele;
- o `produto` cobre todas as entregas da empresa naquela ECR.

A correção do alcance pelo comprador (a que já existe) também muda a cobertura na hora, porque ela diz que o papel
foi lido errado.

**Um papel nunca descobre uma entrega por chegar outro papel.** O motivo está na escolha 2 do §6.

## §4 — O contrato da lista e do "não se aplica"

**`compras.entregas_sem_papel(p_obra uuid default null)`**, para quem emite OC (o mestre recebe a recusa de sempre).
Uma linha por entrega e ECR na situação `sem_papel`:

```
avaliacao_id, oc_id, numero, versao, obra, fornecedor, recebido_em, nota_fiscal, avaliado_por_nome,
ecr_id, ecr, nome, posicoes, porque, o_que_pede, observacao
```

- **`o_que_pede`** tem a mesma forma da `material_a_chegar`: as linhas da seção, com a revisão. São as palavras da
  ECR.
- **`porque`** é uma frase de gente, por exemplo "A ECR 02 pede o papel a cada entrega: …", ou "Esta empresa ainda
  não mandou o registro da ECR 19".
- **`observacao`** é a da entrega, para o escritório ler o que a obra escreveu (§5).
- A ordem é a do dia da entrega, da mais antiga para a mais nova.

**Daqui o escritório faz uma de duas coisas:**

1. **Anexa o papel:** chama a `arquivar-documento` e depois a `compras.guardar_registro_do_fornecedor` com
   `{documento_id, ecr_id, avaliacao_id, alcance, valido_ate}`. A OC vem da entrega. A linha sai da lista, junto com as
   outras que o mesmo papel alcança.
2. **Marca "não se aplica a esta entrega":** chama `compras.marcar_nao_se_aplica(avaliacao_id, ecr_id, motivo)`.
   - Só quem emite OC marca, e o motivo é obrigatório.
   - A função recusa, com frase, se a ECR não estiver na OC, se a entrega já estiver coberta, se a ECR não exigir o
     papel, ou se a marca já existir.
   - A marca guarda quem (o usuário e o nome do perfil) e quando. Ela **não se edita nem se apaga**, por gatilho,
     como a resposta da entrega de hoje.
   - Se o papel chegar depois, a situação passa a `coberta`, e a marca continua no histórico.

**O auditor:** `compras.cobertura_da_entrega(avaliacao_id)` devolve, por ECR da OC, a situação e o que a explica.
- Ela lê com os direitos de quem chama, e quem já lê a entrega lê a cobertura.
- Hoje a tela da OC lê as entregas direto da tabela `compras.avaliacoes_entrega`, sem função no meio, e a tabela não
  muda. A cobertura vem por esta função, uma chamada por entrega. Se a OC preferir uma chamada por OC, com todas as
  entregas dela, é a mesma regra com outra entrada; ela diz no plano dela.

## §5 — O pedido antigo continua aceito (D541)

- **Sem `registros`:** passa como hoje e não grava nada. A entrega cai na lista, se a ECR exigir o papel.
- **Com `registros` na forma da D812** (`[{ecr_id, resposta, documento_id, alcance, valido_ate, motivo}]`): a forma
  continua sendo conferida como hoje. Quem era aceito continua aceito, e quem era recusado continua recusado. Muda
  só o que fica gravado:
  - **`veio`:** o papel é guardado e nomeia esta entrega, com o alcance que o mestre conferiu (na dúvida, `lote`).
    **É o botão opcional do celular**, e não precisa de forma nova;
  - **`nao_veio`:** não grava nada. É o estado de partida;
  - **`nao_se_aplica`:** não grava marca, porque quem marca é o escritório. O motivo que a obra escreveu vai para a
    observação da entrega, numa linha "Registro da ECR NN, segundo a obra: não se aplica (motivo)". O escritório o lê
    na lista.
- **A resposta da `registrar_entrega` não muda:** as mesmas chaves de hoje (as baterias da D604 e da D794 conferem).

## §6 — Cinco escolhas minhas, para você aprovar ou trocar

| # | a escolha | a minha recomendação, e por quê |
|---|---|---|
| 1 | **Quanto um `lote` cobre.** Sem a marca, cobre a OC inteira. Com a marca, cobre só a entrega que nomeia, e a função recusa o `lote` sem entrega nessas ECRs | É a tabela da D812 ("vale para a OC e o item") somada à razão da marca (cada transporte tem a sua guia). A recusa evita o papel guardado que não cobre nada |
| 2 | **A regra 3 não entra na cobertura.** Ela continua decidindo o "pede" da `material_a_chegar` | Se entrasse, um `lote` que chegasse em outubro, por outra OC, faria uma entrega de setembro, coberta por uma licença válida, voltar a "sem papel". A auditoria perderia o que já estava certo. O custo é raro: uma empresa com `lote` e `vale_ate` na mesma ECR, que é sinal de alcance lido errado e sai pela correção do comprador (D813, resposta 3) |
| 3 | **O `vale_ate` cobre para trás,** até a data dele, sem data de início | O papel não diz desde quando vale, e a leitura da IA não traz essa data. Pedir mais um campo agora é pedir ao mestre e ao escritório o que o papel não tem |
| 4 | **A marca "não se aplica" não tem desfazer** nesta volta | Ela segue o "não se edita nem se apaga" da resposta da entrega. Se aparecer engano de verdade, o desfazer registrado é uma função a mais, em outra carta |
| 5 | **O `nao_se_aplica` do celular velho vira linha na observação** em vez de ser jogado fora | A obra escreveu um motivo, e ele não pode sumir. Mas a decisão é do escritório (§2.5 da sua carta) |

## §7 — O tamanho, os testes, as sabotagens e o desfazer

- **O tamanho:**
  - a migration fica perto de **1.050 linhas**, contra as 966 de hoje. Saem a `entrega_registros` e metade do bloco
    da entrega; entram a marca, a cobertura, a lista e uma trava;
  - o desfazer fica perto de **320**;
  - as duas funções da borda não mudam.
- **O teste,** `testes-rls/teste_registros_do_fornecedor.sql` refeito, com perto de **70 asserções**, contra 53 hoje:
  - **ficam os seis casos da regra do "pede"** e as revisões da Data da OC: 1 a 10 e 49 a 51 de hoje;
  - **ficam** as travas da tabela, a régua de quem grava, o envio torto e a fila, com a resposta da entrega trocada
    pela cobertura;
  - **entram:**
    - a cobertura de cada caso do §3, com os papéis da OC1:
      - o `lote` da OC cobrindo duas entregas dela;
      - o `lote` de outra OC não cobrindo;
      - o `vale_ate` no dia, vencido no dia, e chegando depois da entrega;
      - o `produto`;
      - a 02, com a marca, que um `vale_ate` não cobre;
      - a 02 coberta só pelo papel que nomeia a entrega;
    - a escolha 2: um `lote` novo, por outra OC, não descobre a entrega antiga coberta pelo `vale_ate`;
    - a lista: só `sem_papel`, com o `o_que_pede` e o `porque`. O mestre é recusado;
    - a marca: o motivo obrigatório, as quatro recusas do §4, quem e quando, não se edita nem se apaga, e o papel
      que chega depois vence a marca;
    - o pedido antigo: sem `registros`; com `nao_veio`; com `nao_se_aplica`, com o motivo na observação; e as chaves
      da resposta iguais.
- **As sabotagens,** cada uma tem de ficar vermelha:
  1. o `lote` de outra OC cobre;
  2. o `vale_ate` vencido no dia cobre;
  3. a ECR com a marca coberta por `vale_ate` ou `produto`;
  4. o `lote` sem entrega aceito numa ECR com a marca;
  5. a regra 3 dentro da cobertura (a escolha 2);
  6. a marca sem motivo;
  7. a marca dada pelo mestre;
  8. a marca editável;
  9. a lista mostrando entrega coberta;
  10. o `nao_veio` recusado (o pedido antigo quebrando);
  11. o `nao_se_aplica` do celular jogado fora.

  As sabotagens de hoje que continuam valendo (o alcance, quem grava, a correção) seguem junto.
- **O desfazer,** pela emenda 4: em `begin/rollback`, com a hora, e de verdade no ensaio, com a impressão das peças
  voltando igual à de antes. Depois reaplico.
- **As baterias** rodam no ensaio sem e com a parte C. O merge só sai depois de eu ler o resultado, nunca encadeado
  (o tropeço da D837).

**A ordem que eu sigo depois da sua aprovação:**
1. o desfazer da versão velha no ensaio;
2. a versão nova, no mesmo ramo;
3. os testes, as sabotagens e o desfazer;
4. a carta.

A produção vem depois dos ramos da OC e da perícia, uma vez só, sobre o código final, como a sua carta manda.

## §8 — O que a Ordem_de_Compra lê daqui (a cópia é para ela)

- **O carimbo do celular:** a pergunta do papel sai. O botão opcional manda o papel dentro do envio de sempre, em
  `registros: [{ecr_id, resposta: "veio", documento_id, alcance, valido_ate}]`, com o papel guardado antes pela
  `arquivar-documento` (`recebimento-obra`, `origem_item` `registro-ecr-NN`). Não há forma nova.
- **O "Entregue" do escritório:** não manda `registros`.
- **O "Anexar" na OC e na qualificação:** a `guardar_registro_do_fornecedor` de hoje, como no seu ramo 2 (D818).
  Nas ECRs 01, 02 e 17, o `lote` sem entrega passa a ser recusado, com a frase "A ECR NN pede o papel a cada entrega:
  anexe pela entrega, na lista das entregas sem papel." Quem anexa pela lista manda o `avaliacao_id`.
- **A lista nova:** a `compras.entregas_sem_papel`, com os campos do §4, e a `compras.marcar_nao_se_aplica`.
- **O auditor:** a `compras.cobertura_da_entrega`, uma chamada por entrega (ou por OC, se você preferir: §4).

Se o seu plano precisar de outra forma, diga na sua carta. Eu acerto antes de construir.

— Banco_de_Dados
