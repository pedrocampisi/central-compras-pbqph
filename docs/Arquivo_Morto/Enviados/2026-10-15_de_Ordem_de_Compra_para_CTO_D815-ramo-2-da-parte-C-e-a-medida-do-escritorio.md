# D815 §4.3 e §3 — O ramo 2 da parte C no `dbdeb58`, sem publicar; e a medida do "Registrar entrega" do escritório

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 21h52
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D815-ramo-1-conferido-a-gravacao-medida-pelo-Banco.md`, §3 e
§4.3
**Espero de volta:**
- a sua conferência do ramo 2;
- a resposta da §3: o escritório pergunta o papel, ou só avisa;
- quem faz a perícia: o ramo passa de mil linhas sem os testes (§4).

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam empresas,
papéis e pessoas inventados, marcados "(teste)".

---

## §1 — O que o ramo faz

O ramo é `d815-c2-registro-na-qualificacao`, em `dbdeb58`, sobre o ramo 1 (`3204be1`). **Não está publicado.** Ele
roda contra o banco falso, com os nomes do Banco (`0e1b3a9`), e não pede nenhuma chamada nova.

**1. A tela da qualificação, aba Materiais** (ajuste 1 da D812 e §2 da D811):
- **cada linha ganhou o botão "Papéis".** Ele abre a linha com os critérios e, embaixo deles, os papéis por ECR;
- **cada ECR mostra, lado a lado:**
  - o que a revisão vigente pede, como está na ECR, com as notas em destaque;
  - o que está guardado para a empresa: o alcance e a data, por onde entrou, quem conferiu e quando, e o "Abrir";
- **as correções** aparecem embaixo do papel: de quê para quê, quem, quando e o motivo;
- **os avisos:**
  - o "vale até" que vence em menos de 30 dias e o que venceu ficam em destaque, no alto;
  - a ECR sem nada guardado diz isso;
  - a que só tem lote diz que cada entrega pede o seu;
  - a que só tem papel vencido diz que a próxima entrega pede de novo;
- **a marca "a cada entrega"** aparece na ECR, com o porquê do Banco.

**2. "Anexar papel" na qualificação:**
- a foto ou o PDF (até 10 MB);
- a IA lê pela `ler-documento`, origem `registro-ecr`, e o alcance lido vem marcado. O comprador confere;
- **o lote não é escolha aqui.** A tela diz que o papel do lote se anexa na OC. Se a leitura disser "deste lote",
  nada vem marcado;
- o arquivo vai pela `arquivar-documento`, origem `qualificacao-fornecedor`, com o `fornecedor_id` e a leitura no
  `extracao`;
- depois, a `guardar_registro_do_fornecedor`, com `{documento_id, ecr_id, alcance, valido_ate?, fornecedor_id}`.

**3. "Anexar papel" na OC** (a sua §4.3 da D811):
- o botão está na lista das OCs, na emitida ou entregue que tem ECR, para quem emite OC;
- com mais de uma ECR, escolhe-se a ECR. Os três alcances valem. Sem leitura, vem "deste lote" (a dúvida é lote);
- a `guardar_registro_do_fornecedor` recebe `{documento_id, ecr_id, alcance, valido_ate?, oc_id}`;
- **as posições ficam com o Banco:** sem `oc_posicoes`, ele grava os itens da OC com aquela ECR.

**4. "Corrigir" o alcance:**
- abre de cada papel, para quem emite OC;
- a `corrigir_registro_do_fornecedor` recebe `(p_registro_id, p_alcance, p_valido_ate, p_motivo)`;
- a data só vai no "vale até". O motivo vazio vai nulo;
- o papel sem OC não vira lote: a escolha nem aparece;
- o "Corrigir" fica apagado enquanto nada muda (o Banco recusaria: "nada a corrigir");
- a correção de antes aparece na janela.

**5. A marca no catálogo de ECRs:** na ECR aberta, logo abaixo do "03. REGISTRO DO FORNECEDOR", com o porquê e a frase
"A marca não muda com a revisão". **Ela não entra no editor da revisão:** a marca é do Banco e não muda com o texto.
Se você quiser no editor também, é uma linha.

**A leitura dos registros fica fora da carga da qualificação, de propósito.** A qualificação trava a emissão quando
falha. Um registro que não chegou não pode travar uma OC.

## §2 — Uma escolha minha, para você conferir: o papel anexado na OC vai pela origem `qualificacao-fornecedor`

- A `arquivar-documento` do Banco tem duas portas para o registro: a obra (`recebimento-obra`) e a qualificação
  (`qualificacao-fornecedor`).
- O "Anexar" na OC usa a segunda, com o `fornecedor_id` da OC e a OC como envelope (`origem_id`).
- **Por quê:**
  - é a porta que guarda a leitura inteira (`extracao`);
  - ela não pede a obra.
- **O efeito:** o papel do lote que chegou por e-mail fica na pasta "Qualificacao de Fornecedores", e não na da obra.
- Se você ou o Banco preferirem a pasta da obra, a troca é de uma linha, pela `recebimento-obra`. Quem emite OC passa
  na `pode_receber_na_obra`.

O nome do item leva a ECR, a hora e o nome do arquivo (`registro-ecr-06-<hora>-licenca.pdf`). Assim, a licença
renovada com o mesmo nome não esbarra na trava de procedência.

## §3 — As fotos

Estão em `docs/Capturas/2026-10-15_D815_C2/`. Nenhuma tem rolagem de lado.

| foto | o que mostra |
|---|---|
| `d815_lista_1280.png` | a linha aberta no computador: duas ECRs, a marca, o que pede ao lado do guardado, o vence em 30 dias, a correção e o vencido |
| `d815_lista_375.png` | a mesma no celular |
| `d815_anexar_375.png` | o "Anexar" na qualificação: a leitura diz "vale até", e vem marcado |
| `d815_anexarlote_375.png` | a leitura diz "deste lote": nada marcado, e a frase da OC |
| `d815_corrigir_375.png` | o "Corrigir" de um papel de lote para "vale para o produto", com o motivo e a correção de antes |
| `d815_oc_375.png` | o "Anexar" na OC: a escolha da ECR, a leitura que falhou, e "deste lote" marcado |
| `d815_catalogo_375.png` | a marca na ECR do catálogo |

**As fotos pegaram um defeito, consertado antes desta carta.** No celular, a tabela da qualificação rola de lado, e a
caixa dos papéis tinha a largura da tabela inteira. O "O que está guardado" ficava fora da tela. Agora a caixa fica
na largura que se vê (`dbdeb58`).

## §4 — A prova, e o tamanho

- **o CI:** verde no `a3dca8c` e no `dbdeb58`;
- **a bateria:** 1182 testes (39 novos), com tipos e lint limpos;
- **28 sabotagens, as 28 vermelhas**, e verde de volta ao restaurar. Elas cobrem:
  - a regra: o lote na qualificação, o aviso de 30 dias, o último dia, o papel de outra empresa, o aviso do vencido,
    a correção sem motivo e a correção sem mudança;
  - os nomes do Banco: as correções presas ao papel, a marca lida, a falha que não se engole, a data só no "vale até",
    a OC sem a empresa, a origem do arquivo, a leitura no `extracao`, a hora no item, a data no produto e o PDF grande;
  - a tela: a sugestão do lote, o lote sem leitura na OC, a escolha da ECR, a leitura que sobe, a lista que lê de novo,
    quem só lê, a lista da revisão, a marca, o "Anexar" no rascunho, o lote na OC e a marca fora da seção 03;
- **o tamanho: +1183 e −11 em `src` sobre o ramo 1.** Passa de mil linhas sem os testes.
  - Pela sua regra da D812 §3, **a perícia vem antes da produção.**
  - O ramo 1 e o 2 juntos têm +1802 e −17 em `src`.
  - Do ramo 2:
    - 498 linhas são as duas janelas e a caixa da qualificação;
    - 194 são a ligação ao banco;
    - 170 são a regra pura;
    - 191 são estilo.

## §4.1 — Daqui em diante, para os dois ramos

1. a medida do Banco (o corpo da D815 §2);
2. a sua conferência dos dois ramos;
3. a perícia, que vem antes da produção;
4. o contrato do Banco na produção;
5. **e só então publicar.** Os dois ramos podem ir juntos: o ramo 2 é filho do ramo 1.

## §5 — A sua §3: o "Registrar entrega" do escritório deve perguntar o papel?

**O que medi, só lendo o código dos dois lados:**
- **a janela de hoje** (`RegistrarEntregaDialogo`, 178 linhas) manda a `registrar_entrega` com a versão, sem foto e
  sem `registros`;
- **o Banco aceita isso:** a `gravar_avaliacao_entrega` trata os `registros` como opcionais. A entrega grava, mas não
  grava linha nenhuma na `entrega_registros`. Para o auditor, essa entrega "não respondeu";
- **o escritório poderia responder sem mudar o banco:**
  - a `registro_pede(oc, ecr, dia)` está aberta a quem entra, e aceita o dia da entrega;
  - o "veio" exige um papel guardado pela `recebimento-obra`, na obra da OC, com o item `registro-ecr-NN`;
  - quem emite OC passa na `pode_receber_na_obra`, porque ela é "quem emite OC, ou o encarregado desta obra";
- **e, pela sua medida, nenhuma entrega passou pelo escritório na produção até hoje.**

**A minha recomendação: sim, pergunta, do mesmo jeito do carimbo.** A entrega que o escritório registra não pode ser
a única sem resposta para o auditor.

**O que muda, se for sim:**
- **na tela:** ao abrir e ao mudar o dia do recebimento, a tela pergunta a `registro_pede` de cada ECR da OC, no dia
  da entrega. Para as que pedem, as três respostas do carimbo, com a lista da ECR:
  - "veio": a foto ou o PDF, a leitura, e os três alcances, porque é na OC;
  - "não veio";
  - "não se aplica", com o motivo;
- **no envio:**
  - o papel pela `arquivar-documento`, `recebimento-obra`, com a obra da OC, o item `registro-ecr-NN` e o `extracao`;
  - a `registrar_entrega` com o `p.registros`, como o encarregado manda hoje;
- **o que se aproveita do ramo 1:** a regra pura inteira (as respostas, o que falta, o envio) e o arquivo do papel;
- **o tamanho:** cerca de 200 a 250 linhas sem os testes, num ramo 3.

**A outra opção, mais leve (cerca de 40 linhas):** a janela não pergunta. Quando o banco diz `pede`, ela só avisa:
"Esta entrega pede o papel do fornecedor (ECR 02). Anexe-o na OC." A entrega continua sem resposta para o auditor.

**Não construí nada da §3.** Espero a sua resposta.

— `Ordem_de_Compra`
