# D805 parte A — A política e o registro por ECR no PDF, e a tela da qualificação, no ramo `d805a-pdf-qualificacao` (`6e2c80f`); e a proposta da parte C

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 15h4x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D805-a-politica-no-PDF-e-a-IA-monta-a-OC.md`, §1 e §3 (e a D806, que
li: nada muda aqui)
**Espero de volta:**
- a sua conferência das fotos e o aviso para publicar a parte A. **Não publiquei;**
- a sua decisão sobre a trava da Data (§4);
- a palavra do Pedro sobre a parte C (§6).

**O banco não mudou.** As medidas na produção foram só leitura, por ordem desta carta (lei 3).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d805a-pdf-qualificacao`, saído do `main` `1804d16`, com um commit: **`6e2c80f`**. Está no GitHub.
- **O tamanho, sem os testes:** 371 linhas a mais e 16 a menos. Os testes somam mais 216.
- **A bateria:**
  - 1091 testes (eram 1075);
  - tipos e lint limpos.
- **As sabotagens:** 14, todas vermelhas (§5). O código restaurado voltou ao verde.
- **As fotos:** 8, em `docs/Capturas/2026-10-15_D805A/`.
  - O PDF saiu do app de verdade, numa página de prova com banco falso.
  - Fornecedor, obra e materiais são inventados. As ECRs são o texto do SGQ, com os mesmos tamanhos da produção: a
    08 tem 9 linhas no registro, a 12 tem 7 e a 13 tem 5.

## §2 — A1: a política da qualidade no PDF

- **Conferi a frase contra o arquivo.** Ela está em `05 - PS e MQ/FO 5.2 - Política de Qualidade.html`, dentro do
  `<script type="__bundler/template">`. Sem as marcas de negrito, o texto bate com a sua cópia, palavra por palavra.
- **O quadro:**
  - o título é "POLÍTICA DA QUALIDADE (FO 5.2)", sem revisão e sem data;
  - embaixo vem só a frase. As sete diretrizes ficaram de fora.
- **Onde está:** depois do registro por ECR e antes das CONDIÇÕES DE CONTRATAÇÃO, uma vez por OC.
- **Onde a frase está guardada:** no código, em `src/domain/qualidadeNaOc.ts`.
  - A configuração não entra: vazia ou cheia, ela não tira e não troca a frase.
  - Um teste confere a constante contra uma cópia da frase. Outro lê o texto do PDF e acha a frase inteira, uma vez.
- **As assinaturas:** a OC de 1 item, com ECR ou sem, cabe numa página só, com as assinaturas (fotos 03 e 04). Um
  teste confere isso.

## §3 — A2: o que cada ECR pede ao fornecedor

- **O quadro novo:** "REGISTRO DO FORNECEDOR, CONFORME A ECR DE CADA ITEM". Ele entrou no lugar do "CRITÉRIO DE
  QUALIFICAÇÃO CONFORME ECR".
- **Para cada ECR dos itens, na ordem da primeira aparição:**
  - o título diz o código, o nome, a revisão e os itens da OC que apontam para ela. Exemplo: "ECR 12 - Materiais
    Hidrossanitários · Rev. 00 · itens 4, 8, 12";
  - embaixo vêm as linhas da seção como estão no documento: a lista com o quadradinho e a nota em vermelho, como no
    PDF da ECR;
  - "Não aplicável" sai "Não aplicável";
  - as outras quatro seções da ECR não vão para a OC.
- **A OC sem ECR em item nenhum:** o quadro fica, com a frase "Nenhum item desta OC tem ECR: esta OC não pede registro
  do fornecedor por ECR." Escolhi assim porque o auditor vê que ninguém esqueceu, em vez de não ver nada.
- **Na produção, 1 das 4 OCs não tem ECR em item nenhum.** Ela está emitida.
- **A ECR que valia na OC: escolhi a revisão pela Data da OC, e não uma fotografia na emissão.**
  - **Por quê:**
    - o banco já guarda o texto inteiro de cada revisão (`compras.ecr_revisoes.secoes`, D588);
    - uma fotografia na emissão pediria uma coluna nova na OC, e esta casa não mexe no banco.
  - **Como funciona:**
    - vale a última revisão com data até a Data da OC;
    - quando a revisão vigente é mais nova que a Data, o PDF pede o texto antigo ao banco, só daquelas ECRs;
    - nos outros casos, que são todos os de hoje, o PDF usa o texto que a tela já tem.
  - **Se a leitura falhar,** o PDF não sai e a tela mostra o erro. **Ele nunca sai com o texto de outra revisão.**
  - **Se o banco não tiver o texto da revisão que valia,** o PDF diz: "O texto da Rev. 00, que valia em dd/mm/aaaa, não
    está no sistema."
    - Só a Rev. 00 da ECR 04 está assim (valeu de 15/04 a 20/04/2026).
    - Nenhuma OC da produção tem Data nesse intervalo.
  - **A Data é a da OC, não o dia da emissão.** O banco não tem a hora da emissão em coluna. A Data é a que está
    impressa no papel, e o PDF fica coerente com ela.
- **Medi na produção, só leitura:**
  - as 20 ECRs têm a seção, e a contagem bate com a sua: de 1 a 9 linhas;
  - as 3 mais longas são a 08 (9), a 12 (7) e a 13 (5);
  - todas estão em Rev. 00 de 15/04, menos a 04, que está em Rev. 01 de 21/04;
  - o texto vigente é igual ao da última linha do histórico em todas.

## §4 — A3: a tela da qualificação

**O que mudou** (fotos 01 e 02, a 1280):
- **no alto, embaixo do subtítulo, duas linhas:**
  - "**Qualificação, ANTES da compra.** Os três critérios do PS.02 dão a nota, e só a empresa qualificada recebe OC."
  - "**Avaliação, DEPOIS da entrega.** É o carimbo do recebimento. As entregas avaliadas contam na próxima
    requalificação."
- **a coluna "Nota de desempenho":**
  - ela mostra a nota dos três critérios, e embaixo as entregas dos últimos 12 meses. Era essa linha de baixo que se
    lia como a avaliação;
  - agora a linha de baixo tem o nome "ENTREGAS AVALIADAS", separada da nota por um traço;
  - o cabeçalho explica a coluna no passar do mouse;
  - o nome do cabeçalho ficou, porque é o da planilha FO 8.4.1.1.
- **a lista de ECRs embaixo do tipo** diz "Qualificada para ECRs 08 e 12". No passar do mouse: "As ECRs para as quais
  a empresa está qualificada. Não são itens comprados."
- **as perguntas dos critérios não mudaram.** Um teste confere isso.

**A medida da Data: sim, a OC pode sair com a Data anterior à qualificação.**
- **Na tela:** o campo Data da Nova OC aceita qualquer dia, sem limite para trás.
- **No banco:**
  - a trava da emissão (`oc_emitida_exige_qualificacao`) olha a qualificação de hoje;
  - ela não compara a Data da OC com a data da qualificação.
- **Na produção, só leitura, as 4 OCs:**
  - nenhuma tem Data anterior à data da qualificação do fornecedor;
  - 3 têm a Data de 9 a 16 dias antes do dia em que a OC foi criada. O campo para trás já é usado;
  - a data da qualificação delas é a de maio, mas a qualificação foi gravada no sistema em 28/09. Por isso a Data
    dessas 3 OCs é anterior ao dia em que a qualificação entrou no sistema.

**A trava que proponho.** Você decide; eu não construí nada.
1. **No banco** (carta ao Banco): a trava da emissão também recusa quando a Data da OC é anterior à data da
   qualificação que cobre a OC. A recusa seria: "a Data da OC (dd/mm/aaaa) é anterior à qualificação do fornecedor
   (dd/mm/aaaa)".
2. **Na tela,** pouco código, nesta casa:
   - o campo Data não aceita dia antes da qualificação do fornecedor escolhido;
   - uma linha embaixo dele diz por quê.

## §5 — As sabotagens

| peça quebrada | resultado |
|---|---|
| A1 — a frase perde "e aplicáveis" | vermelho (4) |
| A1 — o PDF não desenha a frase | vermelho (3) |
| A1 — a configuração cheia troca a frase | vermelho (1) |
| A1 — a frase vai também nas outras páginas | vermelho (1) |
| A2 — volta o quadro genérico | vermelho (3) |
| A2 — as ECRs pela ordem do número, e não da primeira aparição | vermelho (1) |
| A2 — o PDF esconde o "Não aplicável" | vermelho (1) |
| A2 — a OC sem ECR fica sem a frase | vermelho (1) |
| A2 — a OC antiga usa sempre a revisão vigente | vermelho (3) |
| A2 — sem o texto da revisão, usa o da vigente | vermelho (1) |
| A3 — sai o "antes e depois" do alto | vermelho (1) |
| A3 — as entregas perdem o nome | vermelho (1) |
| A3 — a lista de ECRs volta sem dizer o que é | vermelho (2) |
| A3 — o cabeçalho da nota perde a explicação | vermelho (1) |

## §6 — Parte C: os certificados por ECR (só proposta; nada construído)

**O que já existe e serve:**
- **`arquivar-documento`** (do Banco) é a única porta por onde arquivo entra:
  - guarda no Storage, espelha no OneDrive e registra em `core.documentos`, com a impressão digital (SHA-256);
  - já aceita `origem`, `fornecedor_id` e `intervencao_id`.
- **A foto da nota no recebimento** já passa por ela, com a origem `recebimento-obra`. O encarregado já fotografa
  papel na entrega.
- **`ler-documento`** é a leitura por IA que a casa já usa.
- **O que falta:**
  - nenhuma linha do "REGISTRO DO FORNECEDOR" diz se o certificado é por lote ou por validade;
  - nenhuma tabela liga um documento a uma ECR e a uma linha dela.

**Opção 1 — cada linha do registro ganha uma marca, e o certificado fica onde a marca manda.**
- **A marca:** o Pedro, com a consultora, marca cada linha das 20 seções como "por lote" ou "por validade". São cerca
  de 50 linhas.
  - A marca é um dado do sistema, ao lado do texto. O texto da ECR não muda e a revisão não sobe.
- **Por lote:**
  - quem põe o certificado é o encarregado, no recebimento, junto da foto da nota;
  - ele fica ligado à OC e ao item;
  - o carimbo pergunta "veio o certificado?" quando a ECR do item pede.
- **Por validade:**
  - quem põe é o comprador, na tela da qualificação, por empresa e por ECR, com a data de validade;
  - a tela avisa quando ele vencer, como já faz com a qualificação.
- **O banco** precisa de uma tabela que ligue o documento à ECR, à linha, à empresa, e à OC (lote) ou à validade.
  Isso é carta ao Banco.

**Opção 2 — tudo entra pelo recebimento, sem marca.**
- O encarregado fotografa todo certificado que vier junto da nota.
- O sistema guarda cada um ligado à OC, e ninguém classifica nada.
- **É mais simples, mas não resolve o caso do piso:** o certificado por validade não fica "na empresa". Quem procura
  tem de achar em qual entrega ele veio, e o sistema não sabe quando ele vence.

**A minha recomendação: a opção 1, em dois passos.**
1. **Primeiro, só a marca nas linhas.**
   - É a decisão do Pedro com a consultora.
   - Ela não precisa de tela nova para ser feita.
   - Ela sozinha já deixa o PDF da OC dizer "a cada lote" ou "válido até".
2. **Depois, a guarda.**
   - Lote no recebimento, validade na qualificação, pela porta `arquivar-documento` que já existe.
   - Assim, o financeiro pelo e-mail fica fora no começo. Ele entra depois pela mesma porta, se o Pedro quiser.

## §7 — O que fica para o CTO e o Pedro

1. **Publicar a parte A,** depois de você conferir as fotos. Eu junto no `main`, anoto o desfazer (hoje `ea46638b`,
   com o anterior `685ccd1c`), publico pela emenda 3 e meço na produção.
2. **A trava da Data** (§4): a sua decisão.
3. **A parte C** (§6): a palavra do Pedro.
4. **Uma sobra pequena:**
   - a Configuração ainda mostra o campo "Requisito de Qualidade", só leitura e vazio na produção;
   - o PDF não o usa mais;
   - posso tirá-lo junto, se você quiser.

**A parte B vem a seguir, num ramo próprio, com a campainha dela.**

— Ordem_de_Compra
