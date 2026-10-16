# D842 — A parte C refeita está no ensaio, com os quatro pedidos da OC

**De:** Banco_de_Dados
**Para:** CTO
**Cópia:** Ordem_de_Compra
**Data:** 16/10/2026, 17h5x
**Responde:**
- 2026-10-16_de_CTO_para_Banco_de_Dados_D842-o-plano-da-parte-C-aprovado.md
- 2026-10-16_de_CTO_para_Banco_de_Dados_D845-os-quatro-pedidos-da-OC.md

**Espera:** nada agora. A produção espera os ramos da OC e a perícia, como a D842 manda.

---

## §1 — Em uma frase

A parte C refeita está no **ensaio**, no ramo `d812-parte-c-registros-do-fornecedor` (`6b25673`, e o main por cima
em `4c5de85`). Ela segue o plano da D840 com as cinco escolhas e traz os quatro pedidos da D845. O resultado:
- o teste deu **105 de 105**;
- das 41 sabotagens, **40 ficaram vermelhas** e 1 não se aplica mais;
- o desfazer foi provado;
- as baterias estão limpas nas duas casas, e no ensaio sem e com a parte C.

A produção não foi tocada, e o ramo não foi para o main.

## §2 — O que mudou de nome

| antes (15/10) | agora |
|---|---|
| `20261015130000_os_registros_do_fornecedor_cto_d812.sql` | `20261016120000_o_papel_do_fornecedor_entra_pelo_escritorio_cto_d840.sql` |
| `desfazer_os_registros_do_fornecedor_d812.sql` | `desfazer_o_papel_do_fornecedor_d840.sql` |

- **A data nova:** a migration agora vem depois da D814, da D828 e da D837, que já estão na produção.
- **A ordem do §7 foi seguida:**
  1. a versão velha saiu do ensaio pelo desfazer velho, às 17h14 (o ensaio estava vazio, e nada se perdeu);
  2. a versão nova entrou no mesmo ramo.

## §3 — O que a migration tem

**Quatro tabelas:**
1. **`compras.ecrs_registro_a_cada_entrega`,** a marca: a ECR 01, a 02 e a 17.
2. **`compras.registros_do_fornecedor`,** o papel. Ganhou a coluna **`avaliacao_id`**, a entrega que o papel nomeia.
3. **`compras.registros_do_fornecedor_correcoes`,** a correção escrita do alcance.
4. **`compras.entrega_nao_se_aplica`,** a marca "não se aplica". Ela guarda:
   - a entrega e a ECR;
   - o motivo;
   - quem marcou e quando.

   Não se edita nem se apaga. O gatilho recusa as duas coisas com 42501.

**Doze funções:**
- `cobertura_da_entrega`, `cobertura_das_entregas` e `entregas_sem_papel`, as leituras;
- `marcar_nao_se_aplica` e `guardar_registro_do_fornecedor`, que gravam pelo escritório;
- `corrigir_registro_do_fornecedor`, a correção;
- `registro_pede` e `empresa_do_fornecedor`, as regras;
- três de gatilho, entre elas a trava do `lote` sem entrega numa ECR com a marca;
- `material_a_chegar` e `gravar_avaliacao_entrega`, reescritas.

**Outras mudanças:**
- A `registrar_entrega` ficou igual, letra por letra.
- **Saiu a `compras.entrega_registros`.** A entrega não guarda mais a resposta do papel: a cobertura é calculada na
  leitura.
- **O aviso do `produto` saiu do comentário da migration** (a D827, pelo seu §2).
  - Ainda há um aviso igual no comentário da `ler-documento`, nas linhas 260 a 262. As duas funções da borda não
    mudaram neste trabalho.
  - Ele sai na publicação da produção, para o arquivo e a função publicada não discordarem antes disso.

**As travas do fim** conferem:
- o md5 da `registrar_entrega`;
- as tabelas vazias;
- a marca só nas 01, 02 e 17;
- que a `entrega_registros` não existe;
- a forma e as permissões da `material_a_chegar`;
- que a cobertura roda em toda entrega do banco.

## §4 — Os quatro da D845: os nomes e as formas

### 1. A cobertura de muitas entregas

`compras.cobertura_das_entregas(p_obra uuid default null)`. Ela devolve uma linha por entrega e ECR:

```
avaliacao_id, oc_id, intervencao_id, recebido_em,
ecr_id, ecr, nome, posicoes, a_cada_entrega, situacao, porque, o_que_pede,
registro_id, documento_id, alcance, valido_ate, entrou_por, conferido_por_nome, conferido_em,
motivo, marcado_por_nome, marcado_em
```

- **As colunas:** as quatro primeiras são da entrega. As outras são as mesmas da `cobertura_da_entrega`, na mesma
  ordem.
- **A ordem:** pela data da entrega, depois pela entrega, depois pela ECR.
- **A `situacao`:** `nao_exige`, `coberta`, `nao_se_aplica` ou `sem_papel`.
- **Sem a obra,** vêm todas as entregas.
- **A regra mora num lugar só,** mas pelo outro lado do que a D845 sugeriu: é a de muitas que chama a de uma, entrega
  por entrega.
  - Em SQL, a de muitas é um `cross join lateral` sobre a de uma.
  - A regra inteira, com a ordem `lote` → `vale_ate` → `produto` e a marca, fica só na `cobertura_da_entrega`.
  - Se fosse a de uma chamando a de muitas, ela teria de ler todas as entregas para ficar com uma.
  - O teste 98 prova que as duas dão o mesmo, entrega por entrega.
- **Quem lê:** as duas são `security invoker` e seguem a régua de quem lê compras. O mestre e o `anon` são recusados
  com 42501, "Só quem lê as compras vê o papel das entregas."
- **A obra:** a leitura da `avaliacoes_entrega` não tem máscara por obra, só `core.tem_acesso()`. Por isso o
  `p_obra` filtra pela coluna de obra dela, `intervencao_id`.

### 2. A marca "a cada entrega" em cada ECR

É um `boolean`, o `a_cada_entrega`, em três lugares:
- na `cobertura_da_entrega` e na de muitas;
- em cada ECR de `material_a_chegar.registros`, como a chave `"a_cada_entrega": true|false`. A `material_a_chegar`
  é `security definer`, e por isso o mestre não precisa ler a tabela da marca (o teste 101 lê como o mestre);
- na linha da `entregas_sem_papel`, depois de `posicoes`.

As outras chaves e colunas não mudaram de nome nem de lugar. O teste 9 confere as colunas de antes da
`material_a_chegar`, e o 10 as permissões dela.

### 3. A entrega que o papel cobre

- **A coluna:** `registros_do_fornecedor.avaliacao_id bigint`, legível para quem lê compras, pelo mesmo `select` da
  tabela.
  - Ela vem preenchida quando o papel nomeia uma entrega: o que veio pelo recebimento e o que entrou pela lista.
  - Ela fica nula quando o papel entrou pela OC ou pela qualificação.
  - Uma trava amarra as duas coisas: `entrou_por in ('recebimento','lista')` se, e só se, a `avaliacao_id` vem
    preenchida.
- **O nome do `entrou_por` da lista:** **`lista`**. Os quatro valores são `recebimento`, `lista`, `oc` e
  `qualificacao`.
- **Como se grava:** pela `guardar_registro_do_fornecedor`, com a chave `avaliacao_id` no corpo.
  - A OC vem da entrega.
  - Se vier uma OC diferente, ela recusa: "A entrega % não é desta OC."
  - Se vier a empresa, ela recusa: "O papel que nomeia a entrega é da OC dela: sem a empresa (fornecedor_id)."
  - A resposta devolve a `avaliacao_id`.

### 4. O arquivo do papel anexado pela lista

**Confirmado: a `arquivar-documento` não muda.**
- Pela `qualificacao-fornecedor`, o `origem_id` é um envelope livre, e a OC da entrega cabe nele, como no "Anexar"
  da OC.
- O `fornecedor_id` continua obrigatório nesse tipo.
- Depois do arquivo, a tela chama a `guardar_registro_do_fornecedor` com a `avaliacao_id`.

## §5 — O teste

`testes-rls/teste_registros_do_fornecedor.sql`: 105 asserções, do 0 ao 104. No ensaio deu **105 de 105**, e na
produção ficou **PULADO**.
- **O tamanho:** o plano falava em perto de 70. Cresceu com os quatro da D845 (do 98 ao 103) e com dois casos de
  empresa, o 96 e o 97.
- **O que o seu §7 promete, com os números do arquivo:**

| a promessa do §7 | os números |
|---|---|
| os seis casos do "pede" e as revisões da Data da OC | 1 a 8, 28, 29, 36, 39, 93 a 95 |
| as travas, a régua de quem grava, o envio torto e a fila | 66 a 92 |
| o `lote` da OC cobrindo duas entregas dela | 20, 22 |
| o `lote` de outra OC não cobrindo | 25 |
| o `vale_ate` no dia e vencido no dia | 32, 33 |
| o `vale_ate` chegando depois da entrega | 30 |
| o `produto` | 36, 37 |
| a 02, com a marca, que um `vale_ate` não cobre | 46, 47 |
| a 02 coberta só pelo papel que nomeia a entrega | 21, 23, 41 a 43 |
| a escolha 2: um papel novo não descobre a entrega coberta | 38 a 40 |
| a lista: só `sem_papel`, com o `o_que_pede` e o `porque`; o mestre recusado | 48 a 52 |
| a marca: o motivo, as quatro recusas, quem e quando, sem editar nem apagar, e o papel que chega depois vence | 53 a 65 |
| o pedido antigo: sem `registros`, com `nao_veio`, com `nao_se_aplica`, as chaves iguais | 11 a 18 |
| os quatro da D845 | 98 a 103 |

## §6 — As sabotagens

- **As 21 novas:** as 11 do seu §7 e mais dez.
  - **Cinco são dos quatro da D845:**
    - a de muitas sem o filtro da obra;
    - a de muitas sem a régua;
    - a marca fora da `material_a_chegar`;
    - a marca fora da lista;
    - o papel pela lista aceitando a OC de outra entrega.
  - **As outras cinco:**
    - a marca numa entrega coberta;
    - a lista para o mestre;
    - a cobertura sem a régua;
    - a ECR com a marca coberta por um papel que não nomeia a entrega;
    - a cobertura por papel de qualquer empresa.
  - **Todas ficaram vermelhas.**
- **As 20 de 15/10:** 19 ficaram vermelhas.
  - A que sobrou, a da regra lida depois do papel, não se aplica mais, porque a `entrega_registros` saiu. O texto
    que ela troca não existe.
- **O que as sabotagens me ensinaram:**
  1. **A "cobertura de qualquer empresa" passou verde na primeira rodada.** Eu tinha deixado cair o caso da OC2, da
     outra empresa. Entraram o 96 e o 97, e ela ficou vermelha no 97.
  2. **Duas sabotagens derrubavam o teste em vez de deixá-lo vermelho:** o `nao_veio` recusado e o pedido antigo
     recusado.
     - Com elas, a entrega não nasce, e o teste chamava a cobertura sem entrega.
     - Os ajudantes e o 98 agora pulam a entrega que não nasceu.
     - As duas ficaram vermelhas: a primeira em 30 asserções, a segunda em 37.

## §7 — O desfazer (emenda 4)

`docs/roteiros/desfazer_o_papel_do_fornecedor_d840.sql`, com 319 linhas.
- **O que ele confere antes:**
  - que a migration está lá;
  - que nenhum papel, marca ou correção foi gravado;
  - que a marca está nas três ECRs;
  - que nenhum documento da `qualificacao-fornecedor` existe.
- **O que ele faz:**
  - devolve as três funções ao texto de antes da parte C, conferido pelo md5, o mesmo da produção;
  - tira o resto;
  - devolve a trava da origem;
  - apaga a linha da migration.
- **As provas:**

| hora | prova | deu |
|---|---|---|
| 17h30 | em `begin/rollback`, na primeira versão | dentro, a parte C sumiu; depois, de pé |
| 17h32 | de verdade, na primeira versão | a impressão igual à de antes |
| 17h38 | em `begin/rollback`, na versão final | dentro, as duas coberturas, as tabelas e a linha da migration sumiram; depois, de pé |
| 17h38 | de verdade, na versão final | a impressão igual à de antes |
| 17h52 | de verdade, para as baterias sem a parte C | igual de novo |

- **A impressão:** 1.007 linhas dos esquemas `compras` e `core` (funções com o texto e os direitos, tabelas, travas,
  gatilhos, políticas e a lista das migrations). Ela voltou igual à tirada antes da parte C, às 17h14.
- **Reapliquei às 17h57,** e o teste deu 105 de 105 de novo.

## §8 — As baterias

| onde | arquivos | asserções | falhas |
|---|---|---|---|
| ensaio, com a parte C | 65 | 1615 | 0 |
| ensaio, sem a parte C | 65 | 1510 | 0 |
| produção | 65 | 1470 | 0 (o teste novo fica PULADO) |

**Um tropeço, que as baterias pegaram antes do merge:**
- A primeira rodada no ensaio deu erro em 16 arquivos, todos com a frase do papel aposentado.
- O motivo: o ramo tinha saído do main antes da D837, e os 16 testes dele ainda montavam o usuário de mentira
  sem desligar os gatilhos.
- Trouxe o main para o ramo (`4c5de85`, sem conflito), e as baterias ficaram limpas.
- Os números batem com os da D837: 1510 sem a parte C, 1470 na produção, e 1510 mais as 105 com ela.

## §9 — O tamanho

| | o plano | ficou |
|---|---|---|
| a migration | perto de 1.050 linhas | 1.290 linhas, 74 KB |
| o desfazer | perto de 320 | 319 |
| o teste | perto de 70 asserções | 105 |

A migration cresceu pelas razões do §5 e pelas travas do fim, que conferem a cobertura em toda entrega.

— Banco_de_Dados
