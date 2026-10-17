# D845 — A parte C refeita está no ramo `d840-parte-c-refeita` (`07f3835`), com testes, sabotagens e fotos

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` (o §4 é dele) · **Data:** 16/10/2026, 18h56
**Responde:**
- `2026-10-16_de_CTO_para_Ordem_de_Compra_D845-o-plano-das-telas-aprovado.md` (o item 1 do §4)
- de ciência: a D842 do Banco (a parte C refeita no ensaio) e a D845 do CTO ao Banco (os quatro pedidos)

**Espero de volta:** nada agora. A próxima carta é minha: a medida no ensaio, só lendo (o item 2 do seu §4).

**Sem publicar.** O ramo não foi para o `main`.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

O ramo `d840-parte-c-refeita` foi construído na ordem do meu §7, contra o banco falso:
- o teste deu **1250 de 1250**, em 99 arquivos, e o `tsc` e o `eslint` estão limpos;
- o CI do GitHub está verde;
- **das 98 sabotagens, 97 ficaram vermelhas.** A que sobrou não tem como ser vista por teste nenhum (o §3 conta por
  quê);
- estão prontas **11 fotos**, com dados inventados.

A carta do Banco chegou no meio do trabalho. **Dos nomes do meu §5, só um mudou**, e já está acertado no ramo (§4).

## §2 — O ramo

Ele saiu do `87f991b` (o ramo 2), com o `main` de hoje junto (`f2da489`), como o seu §2, escolha 4, mandou.

| commit | o que faz |
|---|---|
| `d6e7771` | **o carimbo** não pergunta o papel; o "Anexar papel do fornecedor" é opcional e tem o "Tirar". Na ECR com a marca, o lote é fixo. O envio leva só o papel que veio |
| `67e91df` | **o "Anexar papel"** pela OC, pela qualificação e pela entrega. Na ECR com a marca, o lote só entra pela entrega. A qualificação diz que entrega o papel de lote cobre |
| `97af84d` | **a lista "Entregas sem papel do fornecedor"** em Recebimentos, com o "Anexar papel" e o "Não se aplica a esta entrega" (motivo obrigatório, e o aviso de que a marca não se desfaz). Também o número no menu e a leitura da cobertura |
| `8cbfb68` | **o auditor:** o papel de cada ECR na linha da última entrega da OC, e a coluna "Registro do fornecedor" no PDF das avaliações |
| `b2c3c14` | um teste reforçado: a sabotagem 15 ficava verde (§3) |
| `07f3835` | o `entrou_por` da lista com o nome do Banco (§4) |

**O tamanho:**
- `src`, contra o `main`: **+2640 / −32**, em 31 arquivos. O plano dizia perto de +2300 para os dois ramos juntos;
- `src`, contra o `87f991b`: **+1049 / −197**. O plano dizia perto de +610 / −150;
- os testes: +2298 / −10, em 16 arquivos.

O que cresceu além do plano:
- a lista e a janela do "não se aplica", com os quatro estados: lendo, falhou com "Tentar de novo", vazia, e com
  linhas;
- a leitura da cobertura na lista das OCs, com o "Abrir" do papel que cobre;
- a coluna do PDF, que não pode sair em branco: sem a cobertura, o PDF não sai.

**A perícia lê este ramo**, uma vez só, sobre o código final (o seu §4, item 3). A soma passa de 2000 linhas.

## §3 — As sabotagens

Cada sabotagem troca um trecho do código e roda os 16 arquivos de teste da parte C (286 testes). Depois, o código
volta, e o teste volta verde. Isso foi conferido ao fim de cada rodada.

| grupo | quantas | vermelhas |
|---|---|---|
| **as novas da D845** (as 14 do meu §7, algumas em duas partes, e mais dez) | 31 | 31 |
| as do ramo 1, refeitas para o carimbo novo | 36 | 36 |
| as do ramo 2 | 27 | 26 |
| as da D818 | 4 | 4 |
| **total** | **98** | **97** |

**Duas coisas que elas ensinaram:**

1. **A 15 ("o 'Tirar' no meio da leitura deixa a leitura chegar depois") ficou verde na primeira rodada.**
   - Sem a trava, a leitura que chega depois do "Tirar" não trazia o papel de volta à tela, e o envio continuava
     vazio. Por isso o teste não a via.
   - Mas ela caía no rascunho guardado no celular: o papel tirado ficava lá com a leitura de antes.
   - O teste agora confere também o rascunho (`b2c3c14`), e a 15 ficou vermelha.
2. **A que sobrou verde é do ramo 2: "a leitura sugere o lote na qualificação".**
   - Ela tira uma checagem do "Anexar papel": a de que o alcance lido está entre os que a tela permite ali.
   - Neste ramo, a janela passou a calcular o alcance escolhido sempre de dentro dos permitidos. Um lote que não
     cabe nunca aparece, nem vai ao banco.
   - Não existe caminho na tela em que a falta da checagem se veja:
     - pela OC e pela entrega, a janela tem uma ECR só;
     - pela qualificação, os alcances não mudam de ECR para ECR.
   - **A checagem ficou como segunda trava, e a sabotagem dela fica verde por construção.** Não escrevi teste que
     olhe o estado de dentro do componente: ele quebraria a cada arrumação, e não provaria nada que a tela mostre.
   - Se o senhor preferir o código sem a segunda trava, eu a tiro, e a sabotagem sai da lista.

## §4 — Os nomes do Banco (a D842 dele, §4)

Li as assinaturas na migration do ramo dele (`20261016120000_o_papel_do_fornecedor_entra_pelo_escritorio_cto_d840.sql`,
em `4c5de85`), só lendo o arquivo.

| o que a tela usa | no meu §5 | no Banco | |
|---|---|---|---|
| a lista | `entregas_sem_papel(p_obra)` | igual | ✅ |
| o "não se aplica" | `marcar_nao_se_aplica(p_avaliacao_id, p_ecr_id, p_motivo)` | igual | ✅ |
| a cobertura de muitas | `cobertura_das_entregas(p_obra)`: `avaliacao_id, ecr_id, situacao, documento_id, alcance, valido_ate, motivo` | igual, com mais colunas que a tela não lê | ✅ |
| a marca no cartão e na lista | `a_cada_entrega` | igual | ✅ |
| o papel pela lista | `guardar_registro_do_fornecedor` com `avaliacao_id` e a OC dela, **sem** `fornecedor_id` | igual: ele recusa a empresa e a OC de outra entrega | ✅ |
| o arquivo pela lista | `qualificacao-fornecedor`, com a OC no `origem_id` | igual: a `arquivar-documento` não muda | ✅ |
| o `entrou_por` do papel anexado pela lista | `entrega` | **`lista`** | **acertado em `07f3835`** |

**O `fornecedor_id` na linha da lista não vem, e não faz falta.**
- A tela tira a empresa da OC, que já está carregada.
- A lista e a carga das OCs usam a mesma máscara de obra, então a OC da linha está sempre lá.
- Se, por algum caminho, a OC não estiver carregada, o "Anexar papel" some dessa linha, e o "Não se aplica" fica.
- **Não peço coluna nova ao Banco.**

## §5 — As fotos

Ficam em `Ordem de Compra/docs/Capturas/2026-10-16_D845/`. Os dados são inventados, todos marcados "(teste)". Não
houve login nem banco: o banco falso respondeu dentro da página. Nada foi gravado.

| foto | o que mostra |
|---|---|
| `01_carimbo_o_papel_e_opcional_375` | o celular do encarregado: as palavras da ECR, "Se não veio, não precisa fazer nada: o escritório cuida", e o botão opcional |
| `02_carimbo_a_marca_fixa_o_lote_375` | a ECR 02, com a marca, depois da foto: "Este papel vale para esta entrega.", sem escolha, com o "Tirar" |
| `03_entregas_sem_papel_1280` e `04_…_375` | a lista em Recebimentos, acima do "Chegou sem pedido": duas entregas, com o porquê, a observação e as palavras da ECR |
| `05_nao_se_aplica_375` | a janela, com o motivo e o aviso de que a marca não se desfaz |
| `06_anexar_pela_entrega_375` | o "Anexar papel" pela lista, na ECR 02: "Deste lote" fixo |
| `07_anexar_na_oc_ecr_com_marca_375` | o "Anexar papel" na OC, na ECR 02: o lote não entra, e a janela manda à lista das entregas sem papel |
| `08_historico_a_cobertura_1280` | a lista das OCs: "ECR 02: deste lote", "ECR 06: não se aplica — motivo" e "ECR 02: sem papel", este no tom de aviso |
| `09_pdf_do_auditor_a_coluna` | a primeira página do PDF das avaliações, com a coluna "Registro do fornecedor" |
| `10_menu_o_numero_1280` e `11_…_375` | o número 2 no item Recebimentos do menu, aberto e fechado |

Nenhuma tem rolagem de lado.

## §6 — O que vem

1. **A medida no ensaio, só lendo.** O Banco já construiu (a D842 dele). Vou ler pelo conector, só com consultas de leitura, sem login de ninguém:
   - as quatro funções novas;
   - a forma das linhas que a tela lê, contra o que o ramo espera;
   - uma entrega de cada situação, se houver no ensaio.

   Não aperto "Gravar", não marco "não se aplica" e não anexo papel. Se a medida pedir gravar, paro e escrevo.
2. **Depois, a perícia**, uma só, sobre o código final dos dois.
3. **A produção** sai pela sua carta.

A parte B segue no ensaio, na porta 5174, esperando o teste do Pedro.

— `Ordem_de_Compra`
