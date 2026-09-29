# Perícia de código — qualificação dos fornecedores e avaliação na entrega

**Data:** 28/09/2026  
**Quem fez:** Codex, auditor externo  
**Estado:** CONCLUÍDO — é registro  
**Escopo:** checkout `OC_fornecedores`, ramo `d604-fornecedores`; mudanças fora de `docs/` entre `fe119e6` e `ebbebb0`. O diff bruto tem 38 arquivos e 4.496 linhas novas; excluídas as 25 linhas de `scripts/conferir-documentos.js` e `pnpm-lock.yaml` trazidas do main, o acréscimo periciado é de 4.471 linhas. Ficha, qualificação, emissão, entrega, tratativas, PDFs e novas assinaturas de tempo real, com seus testes e chamadas.  
**Commit periciado:** `ebbebb0ae0d95b7de2a1c5a04f4fd707e802963f` (`ebbebb0`). Ramo e HEAD conferidos no início e no encerramento, sem mudança; checkout limpo nas duas conferências.  
**NÃO foi olhado:** alterações até `fe119e6`, que têm perícia própria; as 25 linhas excluídas acima; banco real, produção, publicação das tabelas, ativação dos gatilhos, implantação, tráfego real, aparência em navegador e renderização visual dos PDFs. Migration e roteiro SQL foram lidos somente como contrato, sem perícia do banco ou execução. Documentação foi usada como requisito. Não houve criação de testes ou alteração de código para reproduzir suspeitas.

## Para o dono da empresa

O novo aviso de entrega em tempo real pode trazer dados de outra obra para o navegador com a máscara ligada. Um PDF iniciado antes da ativação também pode terminar depois e incluir entregas das demais obras. Esses são os pontos de maior consequência para a apresentação ao auditor.

Há ainda riscos de documento incorreto: a situação da qualificação pode ficar no dia anterior, sinais técnicos podem virar “?” e uma tratativa pode aparecer como aberta no PDF sem existir como pendência no Painel. As travas locais de emissão e entrega passaram nos testes. Isso não comprova que as travas estejam instaladas no banco de produção.

## Base e evidência

Requisitos lidos: D604, D605, D606, D609, D610, D613, D614, D615 e D616 no planejamento do CTO, com as cartas pertinentes. Contratos lidos: migration `Banco_de_Dados/supabase/migrations/20260927220000_a_qualificacao_dos_fornecedores_e_a_avaliacao_na_entrega_cto_d604_d605_d606.sql` e roteiro `Banco_de_Dados/docs/roteiros/ligar_as_travas_da_d604.sql`. As decisões foram usadas como régua, sem aceitar seus relatos de funcionamento como prova.

**Verificado:** `pnpm test`, neste checkout: **42 arquivos de teste, 549 testes aprovados, 32,45 segundos, saída 0**. A tentativa inicial foi impedida por `spawn EPERM` antes dos testes; a repetição autorizada da mesma bateria terminou normalmente. Houve avisos de `act` do React. Não executei `typecheck`, `lint`, servidor, banco ou publicação.

Todos os achados abaixo são **deduzidos**. A bateria existente foi executada; os cenários adicionais indicados para conferir cada suspeita não foram executados nem escritos no repositório. A triagem cabe ao CTO, achado por achado.

## Achados, por consequência

### Achado 1 — o novo aviso de avaliação recebe outras obras mesmo com a máscara ligada

**Gravidade:** alta.  
**Onde:** `src/services/supabase/dados.ts:529`, especialmente a assinatura de `avaliacoes_entrega` na linha 533; `tests/components/UmaObra.test.tsx:170`.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável.  
**O que está errado:** a nova assinatura de `avaliacoes_entrega` não tem filtro por `intervencao_id`. O código comenta que a recarga posterior aplica a máscara, mas o aviso de alteração já transporta a linha alterada. Ignorar o argumento no callback não impede sua chegada ao navegador. Diferentemente de `qualificacoes`, a tabela de avaliações possui obra no contrato. A D616 registra a escolha de não filtrar: não é uma instrução esquecida pelo implementador; é uma escolha que conflita com a exigência desta perícia de nenhum dado de outra obra chegar ao navegador armado. O teste acrescentado conta as quatro assinaturas, sem exigir filtro na avaliação.  
**Consequência:** basta 1 nova avaliação de outra obra, enquanto a assinatura estiver publicada e a sessão puder lê-la, para seu conteúdo chegar ao navegador da auditoria, incluindo observação, tratativa e identificação de quem avaliou. Pode não aparecer na tabela da tela, mas estará no tráfego recebido. Não afirmo que isso já ocorreu em produção.  
**Como conferir se ainda é verdade:** armar a máscara no dublê local de `UmaObra.test.tsx` e inspecionar as opções registradas de `postgres_changes`: exigir o filtro da obra também para `avaliacoes_entrega`. Confirmar no contrato que existe `intervencao_id`. Em eventual ensaio integrado autorizado, conferir os quadros recebidos pelo navegador diante de uma avaliação de outra obra, sem imprimir dados pessoais em evidências. A prova deve observar o aviso recebido, e não apenas a consulta de recarga.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — assinatura e contrato lidos; nenhum evento real de banco foi provocado ou observado. A manifestação depende da publicação prevista no roteiro, não verificada nesta perícia.  
**Fonte e interpretação:** a [documentação oficial de Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) descreve o filtro de eventos e informa que, por padrão, o evento contém a linha completa. Essa é a informação da fonte. A conclusão de que a recarga filtrada chega tarde demais para impedir a chegada dessa linha é minha análise da assinatura acima.

### Achado 2 — o PDF pode misturar a consulta sem máscara com o título de uma obra só

**Gravidade:** alta.  
**Onde:** `src/services/supabase/qualificacao.ts:291`; `src/features/ordens-compra/HistoricoPage.tsx:170`; `src/domain/folhasDoAuditor.ts:97`.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável.  
**O que está errado:** a leitura das avaliações escolhe a máscara uma vez, antes da consulta e de suas páginas. Depois da espera, o manipulador consulta a máscara novamente para escrever o título, mas não confere se ela mudou nem descarta as linhas fora do novo contexto. `linhasDasAvaliacoes` transforma todas as avaliações recebidas em linhas do PDF. É um caminho novo de exportação deste intervalo, independente da atualização global examinada na outra perícia.  
**Consequência:** iniciar o PDF com 2 obras antes de 16/11 às 00:00 e receber a resposta depois da ativação pode gerar 1 arquivo intitulado como a obra escolhida contendo entregas das duas. O arquivo pode levar para fora observações e identificação de avaliadores da outra obra. Na saída da janela, o caso inverso pode produzir uma lista parcial com título de todas as obras.  
**Como conferir se ainda é verdade:** no teste do botão do Histórico, reter a promessa de `lerAvaliacoesDeEntrega` enquanto a máscara está desligada; ativá-la; devolver duas avaliações de obras diferentes; examinar os argumentos reais enviados ao gerador. Não aceitar apenas um título correto: nenhuma linha da segunda obra deve permanecer. Repetir a transição inversa. Os testes atuais de `tests/components/RegistrarEntrega.test.tsx:220` usam uma máscara estável; o caso com máscara confere o nome no título, sem exercitar a transição.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — leitura dos dois momentos de consulta da máscara e do mapeamento sem filtro; não foi gerado um PDF com esse atraso durante a perícia.

### Achado 3 — a situação de ontem pode sair no PDF com a data de hoje

**Gravidade:** média.  
**Onde:** `src/services/supabase/qualificacao.ts:98`; `src/domain/qualificacao.ts:105`; `src/features/fornecedores/FornecedoresPage.tsx:55`; `src/domain/folhasDoAuditor.ts:64`.  
**Degrau da régua:** 1 — correto; 6 — testável.  
**O que está errado:** `situacao` é calculada pelo banco na leitura e fica guardada na loja. A passagem de um dia não invalida essa leitura. O PDF de qualificados usa as linhas guardadas e acrescenta a data atual de Brasília, sem atualizar as situações. Os eventos de alteração não resolvem a passagem do tempo sem uma gravação, e o relógio da máscara só dispara nova carga quando muda a obra ativa.  
**Consequência:** uma qualificação válida até 28/09, carregada às 23:59 desse dia, pode continuar aparecendo como “Vence em até 30 dias” às 00:01 de 29/09, inclusive num PDF emitido em 29/09. Uma situação pode ficar desatualizada até a próxima carga. A tela também pode encaminhar uma tentativa de emissão que o banco, com as travas ligadas, recusará por vencimento. **Não é achado de emissão aceita pelo banco sem qualificação.**  
**Como conferir se ainda é verdade:** carregar a loja com uma qualificação no último dia válido, avançar a data de Brasília para o dia seguinte sem recarga ou evento de escrita e acionar o PDF. Conferir a situação enviada ao gerador e o selo. Repetir a passagem de 31 para 30 dias antes do vencimento. O esperado deve vir da data e da regra do contrato, não de um campo `situacao` fabricado já com o valor desejado.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — segui a origem e a conservação da situação. Não ensaiei uma aba real atravessando meia-noite. O contrato SQL estabelece a data de Brasília e a mudança de situação; não foi auditada sua execução no banco.

### Achado 4 — os novos PDFs apagam sinais técnicos aceitos nos campos de texto

**Gravidade:** média.  
**Onde:** `src/services/pdf/generateFolhasDoAuditor.ts:67`, `src/services/pdf/generateFolhasDoAuditor.ts:132`; `src/features/ordens-compra/RegistrarEntregaDialogo.tsx:133`; apoio em `src/domain/letrasDoPdf.ts:101`.  
**Degrau da régua:** 1 — correto; 6 — testável.  
**O que está errado:** todas as células passam por `paraAHelvetica`, que troca os caracteres fora dessa fonte por “?”. As observações e tratativas são texto livre e não recebem a restrição de caracteres do editor de ECR. O suporte Symbol existente na base não é usado por este novo gerador.  
**Consequência:** 1 observação como “medida ≥ 30 mm” pode ser gravada integralmente e sair como “medida ? 30 mm” no relatório da entrega. A evidência entregue ao auditor perde o sentido de comparação que estava no registro.  
**Como conferir se ainda é verdade:** acrescentar, em ensaio local, uma avaliação com “medida ≥ 30 mm” e outra com “medida ≤ 10 mm”; passá-las pelo gerador real `pdfDasAvaliacoes` e conferir os sinais por leitor independente ou pelos bytes/fontes corretos. O teste precisa comparar o conteúdo, não só o tamanho do arquivo ou a quantidade de linhas. Nenhum registro real precisa ser usado.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — o caminho de substituição é explícito no código; não executei esses exemplos nem renderizei seus PDFs.

### Achado 5 — a carga do desempenho pode cortar empresas e transformar “não carregou” em “nenhuma entrega”

**Gravidade:** média.  
**Onde:** `src/services/supabase/qualificacao.ts:153`; `src/domain/qualificacao.ts:141`, `src/domain/qualificacao.ts:146`.  
**Degrau da régua:** 5 — escalável; 1 — correto.  
**O que está errado:** qualificações e tratativas têm paginação com contagem, mas `desempenho_12_meses` é lido com um único `select('*')`, sem paginação ou prova de completude. Quando uma empresa não está no resultado, a apresentação diz que não houve entrega, em vez de distinguir ausência de histórico de ausência na carga.  
**Consequência:** se o limite da API for 1.000 linhas e houver desempenho para 1.001 sujeitos, ao menos 1 ficará fora da resposta. Sua ficha pode afirmar “Nenhuma entrega avaliada nos últimos 12 meses” apesar de haver avaliações. Num exemplo de crescimento de 200 para 2.000 sujeitos com histórico, 10 vezes a base inicial, até metade ficaria fora de uma resposta limitada a 1.000. São cenários de capacidade, não contagens da empresa.  
**Como conferir se ainda é verdade:** no dublê de consultas, representar 1.001 sujeitos com desempenho e impor teto de 1.000 na primeira resposta. Abrir a ficha de um sujeito que ficou na página seguinte. Exigir a leitura da página restante ou uma indicação de carga incompleta, nunca a frase de ausência de entregas. Conferir separadamente a configuração efetiva da API quando houver autorização; não foi consultada aqui.  
**Eu verifiquei, ou eu deduzi?** **deduzido**, condicionado ao teto e ao volume; não medi o volume nem o limite deste banco.  
**Fonte e interpretação:** a [documentação oficial de leitura do Supabase](https://supabase.com/docs/reference/python/select) registra o limite padrão de 1.000 linhas por resposta e que ele é configurável no projeto. Embora a página exemplifique Python, a observação é sobre a API do projeto. A aplicação desse limite à consulta TypeScript sem paginação e a consequência da frase de ausência de histórico são minhas deduções.

### Achado 6 — corrigir as respostas pode deixar no PDF uma tratativa “aberta” que o Painel não oferece

**Gravidade:** média.  
**Onde:** `src/features/ordens-compra/RegistrarEntregaDialogo.tsx:59`, `src/features/ordens-compra/RegistrarEntregaDialogo.tsx:136`; `src/services/supabase/qualificacao.ts:248`; `src/domain/folhasDoAuditor.ts:110`.  
**Degrau da régua:** 1 — correto; 6 — testável.  
**O que está errado:** depois de preencher uma tratativa com duas respostas “Não Conforme”, mudar uma delas para “Conforme” esconde o campo, mas conserva seu texto no estado. O serviço ainda o envia. Isso é aceito pelo contrato, que exige tratativa com duas ou mais não conformidades, mas não proíbe texto com menos. O PDF decide escrever “Aberta” apenas pela existência do texto; o Painel e a função de ciência usam o critério de duas ou mais não conformidades.  
**Consequência:** uma avaliação que terminou com apenas 1 resposta “Não Conforme” pode aparecer no PDF com 1 pendência aberta, embora não apareça nas tratativas do Painel. A função do banco recusa dar ciência nesse caso. A equipe pode procurar uma pendência que não tem como encerrar por essa tela. O texto não é perdido; o estado apresentado é que diverge.  
**Como conferir se ainda é verdade:** abrir a avaliação no dublê, marcar duas respostas “Não Conforme”, preencher a tratativa, mudar uma dessas respostas para “Conforme” e registrar. Examinar o objeto enviado; gerar a linha do PDF com a avaliação resultante e comparar com a condição do contrato de `tratativas_abertas`. O PDF não deve classificar como pendente apenas porque restou texto.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — comparei formulário, envio, PDF e contrato; não registrei entrega nem executei esse percurso adicional.

### Achado 7 — a data da ciência no PDF corta o instante antes de convertê-lo para Brasília

**Gravidade:** baixa.  
**Onde:** `src/domain/folhasDoAuditor.ts:110`; `src/services/supabase/qualificacao.ts:311`.  
**Degrau da régua:** 1 — correto.  
**O que está errado:** o PDF usa os dez primeiros caracteres de `cienciaEm`. Esse valor é um instante do banco, não uma data civil já convertida para Brasília. Quando a API o representa em UTC, cortar a string escolhe o dia de UTC.  
**Consequência:** uma ciência dada em 28/09 às 21:30 em Brasília, representada como `2026-09-29T00:30:00Z`, pode aparecer em 29/09: diferença de 1 dia na evidência. O registro no banco não é alterado.  
**Como conferir se ainda é verdade:** passar ao mapeador uma avaliação com ciência nesse instante, sem identidade real; esperar a data 28/09/2026. Conferir também uma representação com deslocamento `-03:00` do mesmo instante: as duas devem produzir o mesmo dia.  
**Eu verifiquei, ou eu deduzi?** **deduzido**, condicionado à representação do instante em UTC; não consultei uma resposta real da API.

## Áreas boas e limites da conclusão

**Emissão:** não encontrei caminho novo que dispense a qualificação na emissão de material controlado. Nova OC e mudança de status no Histórico usam a mesma regra de cobertura de ECRs, recusam situação desconhecida e verificam antes da chamada de gravação da OC. Os testes têm recusa com zero chamada e controles que de fato chamam a gravação. Rascunho e OC sem ECR continuam livres conforme D605. A recusa `23514` do banco vira aviso; conflito de versão continua distinto. A constatação é sobre chamadas da aplicação e contrato, não sobre gatilhos ativos em produção. A situação guardada pode envelhecer, conforme achado 3.

**Qualificar agora:** o diálogo reúne as ECRs da OC e as já cobertas, exige as três respostas e seus motivos, grava a qualificação e recarrega antes de retomar a emissão. A recusa ou nota insuficiente não emite a OC nos testes. O Histórico orientar a ficha da empresa, sem abrir esse diálogo, foi aceito nas decisões posteriores; não foi reaberto como achado.

**Entrega e concorrência:** o botão abre a avaliação; a gravação usa `registrar_entrega` com `p_oc_id`, `p_versao` e as três respostas. O comando genérico de mudança de status recusa `entregue`. Os testes conferem uma chamada de registro, zero chamada de status, exigência da tratativa e conservação do formulário na recusa de versão. Não encontrei desvio desse contrato. Não ensaiei atomicidade ou permissões no banco.

**Datas e escolha da qualificação:** o cálculo local de vencimento soma 12 meses e trata 29/02 como 28/02 no ano seguinte; há teste específico. O contrato usa a data de Brasília, considera válido o dia do vencimento e inclui o limite de 30 dias. O selo escolhe a mais recente por data e depois identificador, considerando empresa e histórico próprio da filial conforme o contrato. Não encontrei divergência nessa resolução. A situação é recebida do banco; os testes com situações prontas não demonstram atualização automática na virada do dia.

**Histórico e permissões:** a ficha conserva qualificações anteriores; categoria e nota mínima vêm do contrato. Qualificar acompanha a permissão de emitir. O Painel consulta `pode_revisar_ecr`, esconde o bloco na negativa ou falha e envia a ciência à função própria. A gaveta passou a ler as ECRs da qualificação e o salvamento do fornecedor não escreve mais a ligação antiga. Não encontrei outro achado nesses recortes. Não equivale a uma auditoria de RLS instalada.

**PDFs em contexto estável:** o de qualificações filtra `vigente` como determina o contrato e separa as cinco categorias. O de avaliações aplica o filtro de obra na consulta quando a máscara já está ligada. Os testes estruturais de tabelas, múltiplas páginas e legenda C/NC passaram. As ressalvas de transição e fidelidade estão nos achados; não foi feita inspeção visual.

**Simplicidade e organização:** domínio, serviço, estado, formulário e composição das folhas estão separados. A decisão de emissão é compartilhada pelas duas portas. Não encontrei abstração futura ou repetição com consequência suficiente para outro achado. A existência de dublês é apropriada para uma bateria sem banco; a limitação aparece quando o dublê entrega pronta justamente a propriedade que se pretende provar, como situação atualizada e escopo do PDF.

## Eficiência e escala: o que foi contado e o que não foi medido

Contagem deduzida do código: uma recarga com listas de uma página inicia **7 consultas dos dados básicos e 5 da qualificação**, total de **12 consultas de dados**, fora autenticação/perfil. Os grupos começam em paralelo; listas paginadas pedem páginas adicionais em sequência. Gerar o PDF de avaliações acrescenta a leitura paginada dessa lista. O PDF de qualificados usa a memória, o que evita consulta no clique, mas tem o limite do achado 3.

Cada aviso de tempo real que sobreviver ao agrupamento de 600 ms pode disparar outra carga completa. Dez avisos espaçados e dez cargas sem páginas adicionais correspondem a 120 consultas de dados, por navegador. É uma contagem de caminhos, não medição de custo ou latência. O aviso de outra obra também provoca esse trabalho, além do problema de escopo do achado 1.

Não medi tempo por clique, memória, volume real, número de conexões ou capacidade com dez vezes o uso. O ponto concreto de truncamento está no achado 5; não há evidência para afirmar que o sistema já esteja lento ou truncando dados atuais.

## Conferência de entrega

- [x] Um único Markdown para este escopo, no destino solicitado.
- [x] Topo completo, hash e exclusões, inclusive as 25 linhas fora do escopo.
- [x] Achados numerados, por consequência, com gravidade, localização, degrau, número, como conferir e dedução explícita.
- [x] Fontes oficiais separadas da interpretação do auditor.
- [x] Sem credenciais ou dados identificadores de pessoas/empresas no conteúdo.
- [x] Ramo e commit conferidos antes e depois; nenhum arquivo de código alterado, nenhum commit, banco ou implantação.
- [x] Contrato do banco consultado sem transformá-lo em perícia de migrations.
- [x] Somente este relatório foi criado para esta perícia; o intervalo anterior tem a outra entrega solicitada.
