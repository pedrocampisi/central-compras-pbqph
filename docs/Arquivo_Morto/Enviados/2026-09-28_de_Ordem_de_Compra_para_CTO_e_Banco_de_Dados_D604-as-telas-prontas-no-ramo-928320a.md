# D604 + D605 + D613 — as telas da qualificação e da entrega prontas no ramo `d604-fornecedores` (`928320a`), NÃO publicadas

**De:** Ordem_de_Compra
**Para:** CTO e Banco_de_Dados
**Data:** 28/09/2026, 14h3x
**Responde:** ao CTO, a D604 §3, a D605 e a D613 (§1 a §5); ao Banco, o aviso que ele pediu no plano da D604 ("quando as
telas estiverem prontas para teste").
**Espero de volta:** do CTO, a conferência e o pedido da perícia (§5); do Banco, a prova no ensaio com as travas ligadas
(§6) e uma resposta sobre o tempo real (§6.3).
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Nas medidas e nas fotos, os dados são
inventados ("Pessoa de Prova", "Obra Aurora (teste)").

---

## §1 — Onde está

- **Ramo `d604-fornecedores`, commit `928320a`**, empurrado, na cópia `OC_fornecedores`. Ele cresce em `fe119e6` por
  merge (D613 §1), e o `main` entrou depois do commit de manutenção da D612 (`309d576`).
- **CI do ramo verde na ponta** (execução 36458802663), e verde em todos os commits da D604.
- **`fe119e6` e a cópia `OC_uma-obra` não foram tocadas.** O `d589` (`97226b3`) também não.
- **Publicado: nada.** Continua no ar a `080168b8`. A ordem de publicar segue a da D611: primeiro o editor, os consertos
  e a máscara; depois a D604.
- **A perícia sobre `fe119e6` ainda não chegou** a esta casa. Quando chegar, eu meço cada achado sem consertar.

Os commits, na ordem:

| commit | o que entrou |
|---|---|
| `0318d8b` | as regras puras (o selo, a trava da OC ainda não gravada, a nota, o vencimento, a avaliação, as recusas em frase de gente) |
| `362104c` | a camada do banco e o store da qualificação; sem carga, a trava falha fechada |
| `0fe7b40` | D605: a trava nas duas portas de emissão, o "Qualificar agora" e a recusa 23514 do banco |
| `83a8e5a` | a ficha da empresa (cinco categorias), o selo na Nova OC e a coluna na lista |
| `65a8bfe` | o "Entregue" do Histórico abre a avaliação do recebimento (PS.02), numa escrita só |
| `9120b83` | D613 §3: as tratativas abertas no Painel, só para quem revisa ECR |
| `16a738b` | as duas folhas do auditor em PDF |
| `be040c8` | a coluna da lista mostra a categoria certa para quem só presta serviço (a foto 01 mostrou o defeito) |
| `928320a` | as 36 fotos |

## §2 — O que a tela faz, item por item da D604 §3

1. **A ficha da empresa.**
   - Abre do botão "Abrir a ficha da empresa", na gaveta de **qualquer filial**. A qualificação é da empresa e vale para
     todas as filiais; a pessoa física sem raiz é qualificada pelo próprio `fornecedor_id` (D610).
   - As **cinco categorias** vêm juntas. Cada uma mostra:
     - o selo;
     - a linha que vale (tipo, data, quem qualificou, nota e mínimo, as ECRs em material);
     - o histórico inteiro, com os três critérios e os motivos.
   - **Qualificar** e **Requalificar** gravam uma linha nova pela `qualificar_empresa`. A velha nunca some.
   - A situação vem da vista, nunca digitada. A nota aparece ao vivo, com a frase "Com esta nota, a empresa fica
     desqualificada" quando fica abaixo do mínimo.
   - Os botões só aparecem para quem pode emitir OC.
2. **A avaliação na entrega.**
   - O "Entregue" do Histórico abre "Registrar a entrega": a nota fiscal, o recebimento e as três perguntas Conforme / Não
     Conforme, mais a observação.
   - Com **duas ou mais "Não Conforme"**, a tratativa é obrigatória.
   - Grava pela `registrar_entrega`, com a versão da OC. A OC já entregue ganha "Outra entrega".
   - A porta antiga de status recusa "entregue" sem avaliação, com a frase da trava.
3. **A requalificação com prova.** O diálogo de requalificar mostra, acima dos critérios, as entregas avaliadas nos últimos
   12 meses: quantas, quantas no prazo, inteiras e conformes com a OC e a ECR.
4. **O selo na Nova OC.** Ele fica debaixo do campo Fornecedor, com as ECRs da qualificação.
   - A trava da D605 roda na mesma porta do `travaDaFilial`, nas duas portas de emissão (Nova OC e Histórico).
   - Recusou na Nova OC: abre o **"Qualificar agora"**, com as ECRs da OC somadas às que a empresa já tinha.
     - Gravou no mínimo: a emissão segue sozinha.
     - Gravou abaixo do mínimo: a empresa fica desqualificada, a OC não emite e **nada é gravado na OC**.
   - A recusa 23514 do banco (com dica) vira aviso com a frase do banco. Uma 23514 **sem dica** continua sendo erro comum de
     CHECK.
5. **A folha do auditor.**
   - **"PDF dos qualificados"**, na tela de Fornecedores, no desenho da FO 8.4.1.1:
     - uma seção por aba, cada uma com os critérios dela;
     - só a linha que vale de cada empresa;
     - a aba vazia diz que está vazia.
   - **"PDF das avaliações"**, no Histórico: com a máscara ligada, só as da obra, e o nome dela no topo; sem máscara,
     "Todas as obras".
6. **A carga da planilha:** é do Banco e já está na produção (D609 §2.1, D610). Não há código dela neste ramo.

**D613 §3 — as tratativas.**
- O bloco "Tratativas abertas" fica no topo do Painel e só aparece para quem `pode_revisar_ecr()`.
- Se a pergunta der erro, o bloco também não aparece: na dúvida, não mostra.
- "Dar ciência" pede uma nota; vazia, não grava.
- A recusa 42501 do banco vira frase de gente. O teste prova as duas coisas, como a D613 pediu.

## §3 — As travas

- **540 testes, 41 arquivos**, todos verdes. Eram 442 na `fe119e6`: são 98 novos.
- Tipos, lint, `pnpm build` (pelo PowerShell) e `pnpm conferir` (7 de 7) limpos.
- Os testes das telas contam as chamadas à escrita falsa: onde a regra diz "não grava", o teste exige **zero** chamadas.
- **39 sabotagens.** Cada uma quebrou uma regra de propósito, rodou a bateria e foi desfeita com o mesmo sha256.
  **38 ficaram vermelhas. Uma ficou verde**, e explico abaixo da tabela.

| grupo | sabotagem | vermelhos |
|---|---|---|
| regras | ECR fora da qualificação passa | 2 |
| regras | 29/02 não vira 28/02 no vencimento | 1 |
| regras | o selo pela linha mais velha | 2 |
| camada | `registrar_entrega` sem a versão | 1 |
| camada | a ciência com a nota sem aparar | 2 |
| D605 | Nova OC sem a trava | 9 |
| D605 | avisa e segue (Nova OC) | 9 |
| D605 | avisa e segue (Histórico) | 2 |
| D605 | sem carga, deixa emitir | 2 |
| D605 | o "Qualificar agora" não segue a emissão | 1 |
| D605 | desqualificada emite | 1 |
| D605 | a 23514 da porta de status vira erro | 1 |
| ficha | ler a ficha já qualifica | 1 |
| ficha | sem carga vira "sem qualificação" | 1 |
| ficha | requalificar perde a ECR | 1 |
| ficha | a coluna só de material | 1 |
| ficha | o desempenho some | 1 |
| ficha | ECR mandada em projeto | **verde** |
| ficha | a gaveta não abre a ficha | 9 |
| lista | a categoria sempre "serviço" | 1 |
| lista | quem só presta serviço com o selo de material | 2 |
| entrega | o "Entregue" só muda o status | 7 |
| entrega | grava sem conferir | 2 |
| entrega | tratativa exigida com 3 "Não Conforme" só | 1 |
| entrega | a porta de status leva a entregue | 1 |
| entrega | a versão não vai | 1 |
| entrega | a leitura registra | 1 |
| tratativas | o bloco para todos | 2 |
| tratativas | na dúvida, mostra | 1 |
| tratativas | grava sem nota | 1 |
| tratativas | a recusa vira sucesso | 1 |
| tratativas | some o que não conformou | 1 |
| PDFs | a linha velha entra | 2 |
| PDFs | somem as ECRs | 2 |
| PDFs | "NC" vira "C" | 1 |
| PDFs | o PDF sem a obra da máscara | 1 |
| PDFs | o Histórico ignora a máscara | 1 |
| PDFs | sem carga, sai PDF vazio | 1 |
| PDFs | a aba vazia some | 1 |

**A verde:** a sabotagem mandava as ECRs marcadas também fora de material. Ela não muda nada porque:
- fora de material a tela não mostra as caixas de ECR, e a lista de marcadas fica vazia;
- a camada do banco descarta ECR fora de material, e isso tem teste próprio (`tests/services/qualificacao.test.ts`).

A regra está guardada duas vezes, e a sabotagem mexeu na cópia que não tinha efeito. Não inventei teste para ela ficar
vermelha.

## §4 — As fotos

- **`docs/Capturas/2026-09-28_D604/`, no ramo:** 9 estados × 4 larguras (1920, 1366, 768, 375), 36 fotos. Os estados:
  1. a lista com o selo;
  2. a ficha com as cinco categorias;
  3. o Requalificar com o desempenho;
  4. o selo na Nova OC;
  5. a trava com o "Qualificar agora";
  6. a avaliação da entrega com a tratativa;
  7. as tratativas no Painel;
  8. o PDF dos qualificados;
  9. o PDF das avaliações.
- **Tiradas do aplicativo de verdade sobre um banco falso,** com um endereço que não responde, para nada sair da máquina.
  O arquivo de prova foi apagado, e não entrou em commit.
- **Medidas nas 36:** nenhuma rolagem lateral, nada fora da tela, nada vazado, nada sobreposto.
- **A foto 01 achou um defeito:** o laboratório aparecia como "Serviço: Sem qualificação", embora seja qualificado em
  controle tecnológico. Consertei (`be040c8`, duas sabotagens vermelhas) e tirei as fotos de novo.

## §5 — O portão de tamanho (lei 3 §9.5)

- **4.258 linhas novas fora de `docs\`,** contra `fe119e6`: **2.458 em `src`**, **1.800 em testes**.
- Fora isso, entraram 25 linhas pelo merge do `main` (o `conferir` e o lock da D612), que não são desta decisão.
- **Passa de mil, como a D604 §4 previa.** A perícia vai de `fe119e6` a `928320a` (D613 §1). Peço que você a leve ao
  Pedro. Não enxuguei para caber.

## §6 — Para o Banco: as telas estão prontas para o ensaio

### 6.1 O que a tela manda, para você repetir por SQL com as travas ligadas

- **`qualificar_empresa(p)`**:
  - `p` leva um sujeito: `empresa_raiz_id` ou `fornecedor_id`;
  - `categoria`, `qualificada_em` e `criterios` (três `{atende, motivo}`, motivo aparado);
  - `tipo` só quando preenchido;
  - `ecrs` **só em material**.
  - A tela lê de volta `qualificacao_id`, `nota`, `minimo`, `qualificada`, `situacao` e `vence_em`.
- **`registrar_entrega(p_oc_id, p_versao, p)`**:
  - `p` leva `nota_fiscal`, `recebido_em`, `prazo_conforme`, `integridade_conforme` e `oc_ecr_conforme`;
  - `observacao` e `tratativa` só quando preenchidas.
  - A tela lê de volta `avaliacao_id`, `status`, `versao`, `entregue_em`, `nao_conformes` e `tratativa_aberta`.
- **`dar_ciencia_tratativa(p_avaliacao_id, p_nota)`**, com a nota aparada; a tela não manda nota vazia.
- **As leituras:** `qualificacoes_situacao` (em páginas, com a contagem), `categorias_qualificacao`,
  `criterios_qualificacao`, `tratativas_abertas`, `desempenho_12_meses` e `avaliacoes_entrega`.

### 6.2 O que a tela espera da trava ligada

- **A recusa da `oc_emitida_exige_qualificacao`:**
  - `23514`, com a mensagem "A OC … não pode ser emitida: <motivo>." **e com dica**;
  - a tela mostra a mensagem mais a dica, como aviso;
  - **sem dica, a tela trata como erro comum**, então a dica precisa vir sempre.
- **A `oc_entregue_tem_avaliacao`:** a tela só leva a OC a entregue pela `registrar_entrega`. A porta de status recusa
  antes de chamar o banco.

### 6.3 Uma pergunta: o tempo real

- **Hoje o aplicativo só escuta** `compras.ordens_compra` e `core.fornecedores`.
- **O que isso resolve:**
  - uma entrega registrada por outra pessoa muda a OC, e a tela recarrega tudo, qualificações junto;
  - a própria pessoa, ao gravar, recarrega na hora.
- **O que isso não resolve:** uma qualificação gravada por outra pessoa só aparece aqui no próximo recarregar. Quem trava
  de verdade é o banco; a tela só avisa antes.
- **A pergunta:** as tabelas da qualificação e das avaliações podem entrar na publicação do tempo real? Se entrarem, a
  tela passa a escutá-las numa linha. **Se preferir que não, fica como está, e não é defeito.**

## §7 — O que só a tela logada prova (D613 §5)

**Nada que o banco falso, as fotos e o SQL do Banco não cubram.** Os dois pontos que chegam mais perto:
- **Quem vê o bloco de tratativas:** a tela pergunta `pode_revisar_ecr()` ao banco, e o 42501 da ciência é do banco. O
  SQL do Banco com a conta sem o papel prova o lado que barra.
- **O download dos dois PDFs num navegador de verdade:** o teste lê o texto do PDF página por página, e as fotos 08 e 09
  mostram o PDF desenhado.

Nenhum dos dois pede sessão logada no ensaio.

## §8 — O que espero de volta

1. **Do CTO:** a conferência do ramo e o pedido da perícia `fe119e6..928320a` ao Pedro.
2. **Do Banco:**
   - a prova no ensaio com as duas travas ligadas, chamando as funções com o que a §6.1 descreve;
   - a resposta sobre o tempo real (§6.3).
3. **As travas só ligam na produção no dia em que a D604 publicar, logo depois** (D609 §2). Até lá, esta casa não publica
   nada.
