# Perícia de código — Ordem de Compra e edição de ECR

**Data:** 27/09/2026  
**Quem fez:** Codex, auditor de fora  
**Estado:** CONCLUÍDO — é registro  
**Escopo:** mudanças fora de `docs/` entre `2691d6d` e `7edb715`, no ramo `d589-editar-ecr`: 59 commits, 83 arquivos, 8.413 linhas acrescentadas e 1.934 retiradas. Leitura do código alterado, das peças chamadas por ele e dos testes; confronto com as decisões D541 a D598 de `../CTO/docs/PLANEJAMENTO.md`. Prioridade para edição, consulta e PDF das ECRs, leitura de materiais pela IA e escolha da empresa/filial na OC.  
**Commit periciado:** `7edb715181c1a1e3c3c8c6fb0af9883139bf4950` (`7edb715`). Ramo e hash conferidos antes da análise e novamente no encerramento.  
**NÃO foi olhado:** banco de produção ou ensaio, dados e permissões efetivamente instalados, serviço real de IA, envio real de mensagens, aplicação publicada, comportamento visual em navegador/celular e documentos originais do SGQ. Não houve servidor, build, ensaio de mutação nem teste novo. As duas migrations indicadas, identificadas pelos prefixos `20260927120000` e `20260927130000`, foram lidas exclusivamente como contrato da interface; não foram periciadas nem executadas. Documentação, fotos e cartas não são objeto deste laudo; decisões foram usadas como requisitos. Não foram lidas perícias antigas.

## Para quem decide

A releitura pela IA pode apagar uma quantidade corrigida enquanto a resposta está chegando. A edição da ECR pode reapresentar como aprovada uma versão que desfaz outra revisão mais recente. O PDF pode trocar um sinal de aceitação, como “maior ou igual”, por “?”. São os três pontos com maior consequência direta para compra e conferência de material.

Há também um rascunho de ECR que permanece após sair da conta, uma leitura incompleta de fornecedores que pode enfraquecer o bloqueio de filial, uma trava de teste que não comprova a interrupção da emissão e um limite de crescimento do histórico no PDF. São suspeitas fundamentadas no código, para triagem individual pelo CTO. Não são afirmações de dano já ocorrido nem autorização de publicação.

## Achados, por consequência

### Achado 1 — A releitura pode apagar uma correção feita enquanto a IA responde

**Gravidade:** alta.  
**Onde:** `src/features/ordens-compra/NovaOcPage.tsx:685`, `src/features/ordens-compra/NovaOcPage.tsx:622`, `src/features/ordens-compra/NovaOcPage.tsx:638`; campos dos itens no mesmo arquivo, a partir de `:108`.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável. Requisito: D567, preservar o trabalho humano e pedir confirmação antes de substituir itens alterados.

**O que está errado:** a releitura pelo Certeiro verifica se alguém mexeu nos itens antes de iniciar a chamada. Os campos continuam editáveis durante a espera. Quando a resposta chega, os itens daquela leitura são substituídos pelos identificadores, sem conferir novamente se houve alteração humana. A autorização para perder alterações anteriores não cobre alterações feitas depois dela; quando os itens ainda estavam intactos no início, nem aparece pergunta.

**Consequência:** uma quantidade corrigida de 10 para 12 durante a espera pode voltar a 10 sem aviso. Basta 1 item para a compra sair com quantidade diferente da escolhida. O mesmo caminho substitui todos os itens abrangidos pela releitura. Não medi frequência nem prejuízo financeiro.

**Como conferir se ainda é verdade:** em teste de componente com resposta controlada, carregar uma leitura do Rápido, iniciar a releitura Certeiro e deixar a promessa pendente. Alterar a quantidade de um dos itens; só então devolver a resposta da IA com a quantidade anterior. Conferir se a edição é mantida ou se surge uma nova confirmação antes da troca. Os testes de alteração em `tests/components/LeitorDaIA.test.tsx:335` e `:349` fazem a edição antes do clique; o teste de espera em `:141` não faz essa alteração durante a chamada.

**Eu verifiquei, ou eu deduzi?** **deduzido** — sequência lida no código e comparada com os testes existentes. Não executei esse cenário novo. O achado se refere ao novo caminho de substituição da releitura; não atribui ao ramo a origem de todo problema assíncrono da importação anterior.

### Achado 2 — Um rascunho antigo de ECR pode desfazer parte de uma revisão já aprovada

**Gravidade:** média.  
**Onde:** `src/stores/useRevisaoEcrStore.ts:14`, `src/stores/useRevisaoEcrStore.ts:30`, `src/features/catalogo-ecr/EditorDaEcr.tsx:55`, `src/features/catalogo-ecr/EditorDaEcr.tsx:226`, `src/App.tsx:192`.  
**Degrau da régua:** 1 — correto e seguro. Requisitos: D588 e D589, texto vigente do sistema e salvar como ato de aprovação.

**O que está errado:** o editor guarda as seções vigentes quando a edição começa, mas não vincula o rascunho à revisão de origem. A validação compara o rascunho com essa cópia antiga. Recarregar os dados pode trazer uma ECR mais recente sem invalidar o rascunho aberto. Ao salvar, a interface envia todas as seções antigas com as mudanças locais. Pelo contrato lido, a função do banco grava sobre a revisão então vigente e não recebe uma revisão esperada para comparar. O número mostrado na confirmação pode ser o novo, embora o texto enviado venha do antigo.

**Consequência:** em 2 abas ou aparelhos do mesmo revisor, uma alteração em um item pode desfazer uma alteração aprovada em outro. Das 2 correções pretendidas, apenas 1 fica no texto vigente. O histórico conserva a revisão intermediária, mas recuperar seu conteúdo exige outra conferência e nova revisão; não é perda definitiva do histórico.

**Como conferir se ainda é verdade:** com dublês, abrir a revisão 00 e alterar o item A. Atualizar os dados da aplicação para uma revisão 01 em que o item B mudou, como aconteceria ao usar Recarregar após uma aprovação em outra aba. Salvar o rascunho aberto e inspecionar `p_secoes`: o item B deve manter o conteúdo da 01 ou a tela deve recusar a base antiga. No código periciado ele vem da cópia 00. Não é necessário gravar em banco para verificar o conteúdo enviado.

**Eu verifiquei, ou eu deduzi?** **deduzido** — leitura conjunta do estado do editor, recarga, argumentos da chamada e contrato SQL. Não executei duas sessões reais. O objeto do achado é o uso do contrato pela interface, não a migration.

### Achado 3 — O editor aceita sinais técnicos que o PDF transforma em interrogação

**Gravidade:** média.  
**Onde:** `src/services/pdf/generateEcrPdf.ts:59`, `src/services/pdf/generateEcrPdf.ts:64`, `src/services/pdf/generateEcrPdf.ts:79`; `src/features/catalogo-ecr/EditorDaEcr.tsx:118`; `src/domain/ecr.ts:175`; `tests/services/ecrPdf.test.ts:114` e `:148`.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável. Requisitos: D586, D588 e D589, reprodução do texto vigente da ECR.

**O que está errado:** o campo e a validação aceitam texto com sinais como `≥` e `≤`. O gerador troca qualquer caractere fora de sua lista por `?`. Assim, o texto aprovado na tela pode perder o sentido no PDF. Quebras de linha dentro do texto também passam por essa troca. A exceção autorizada `mᶟ` para `m³` não é o problema.

O teste de integridade calcula o texto esperado com a própria função de conversão usada pelo gerador. Ele comprova a presença do texto já transformado, não a fidelidade ao texto aprovado. Outro teste exige expressamente que um sinal não suportado vire `?`; por isso a bateria verde não elimina esta incompatibilidade com o editor novo.

**Consequência:** uma especificação sintética “Resistência ≥ 30 MPa” vira “Resistência ? 30 MPa”. Os 2 critérios opostos, `≥` e `≤`, podem produzir o mesmo texto no documento entregue à obra ou ao fornecedor. Não afirmo que uma ECR atualmente cadastrada contenha esse caso.

**Como conferir se ainda é verdade:** em teste isolado, usar uma ECR sintética válida com os dois sinais em itens distintos e uma quebra de linha interna; passar pela validação e gerar o PDF em memória. Conferir o texto extraído contra os sinais originais, sem aplicar `paraAFonteDoPdf` ao resultado esperado. A leitura de `:64` já permite conferir por que ambos os sinais são substituídos.

**Eu verifiquei, ou eu deduzi?** **deduzido** — perda de significado inferida da conversão e da entrada aceita. A bateria existente passou, inclusive o teste que espera a interrogação; não renderizei um PDF novo com esse exemplo.

**Fonte externa e interpretação:** a [documentação oficial do jsPDF sobre Unicode](https://github.com/parallax/jsPDF#use-of-unicode-characters--utf-8) explica a limitação das fontes padrão e o uso de fontes com os caracteres necessários. Isso é da fonte. A incompatibilidade entre a entrada permitida pelo editor e a substituição feita pelo software é conclusão desta perícia; não atribuo defeito à biblioteca.

### Achado 4 — O rascunho de ECR atravessa a saída e a entrada de outra conta

**Gravidade:** média.  
**Onde:** `src/App.tsx:141`, `src/stores/useRevisaoEcrStore.ts:25`, `src/features/catalogo-ecr/CatalogoPage.tsx:90`, `src/features/catalogo-ecr/CatalogoPage.tsx:118` e `:150`.  
**Degrau da régua:** 1 — correto e seguro. Requisito: D589, edição restrita ao revisor autorizado.

**O que está errado:** ao sair da sessão, a aplicação limpa os dados e o rascunho da OC, mas não o estado separado da revisão de ECR. Esse estado também não guarda o usuário ao qual pertence. No catálogo, a permissão protege o botão de começar a editar; um editor já aberto é exibido pela igualdade do identificador da ECR, sem a mesma verificação de permissão.

**Consequência:** a segunda conta que entrar na mesma página, sem recarregar o navegador e com acesso ao catálogo, pode encontrar e alterar em memória 1 rascunho não aprovado da conta anterior. O conteúdo pode voltar alterado quando o revisor retorna. Pelo contrato SQL lido, salvar com a conta sem permissão continua proibido; não encontrei aqui uma forma de contornar essa proibição no banco nem comprovei vazamento de dados pessoais.

**Como conferir se ainda é verdade:** em teste de aplicação, abrir a revisão com a conta autorizada, mudar um texto, simular logout e login de outra conta com `podeRevisar=false`, preservando a mesma instância da aplicação. Abrir o catálogo e conferir se aparecem o rascunho e seus campos. Os testes de edição limpam o estado entre os casos; iniciar diretamente com uma conta sem permissão não exercita essa transição.

**Eu verifiquei, ou eu deduzi?** **deduzido** — fluxo de autenticação, estado global e condição de renderização lidos. Não fiz troca de contas reais nem chamada de gravação.

### Achado 5 — Uma página incompleta de fornecedores é tratada como cadastro completo

**Gravidade:** média, condicionada ao volume e ao limite configurado na API.  
**Onde:** `src/services/supabase/dados.ts:53`, `src/services/supabase/dados.ts:95`, `src/services/supabase/dados.ts:128`; `src/services/supabase/linhas.ts:171` e `:188`; `src/domain/fornecedores.ts:27` e `:55`.  
**Degrau da régua:** 5 — escalável; 1 — correto e seguro. Requisitos: D542 e D545, agrupar pela empresa e impedir emissão para filial bloqueada.

**O que está errado:** o cadastro cru e a consulta nova de fornecedor resolvido são carregados separadamente, sem paginação ou verificação de completude. Só o primeiro tem ordenação explícita. As respostas são juntadas pelo identificador. Se uma linha crua não tiver correspondente na página resolvida, classificação, empresa e bloqueio ficam indefinidos. Isso pode retirar fornecedor elegível da lista. Para um rascunho antigo, a filial é mantida mesmo fora da lista, e a trava de emissão só recusa bloqueio explicitamente verdadeiro: bloqueio desconhecido passa por essa trava.

**Consequência:** com limite de 1.000 linhas e 1.001 cadastros, já pode faltar pelo menos 1 fornecedor; páginas com conjuntos diferentes podem deixar mais linhas sem classificação. Se faltar justamente a resolução de uma filial bloqueada presente num rascunho, essa proteção da tela não a impede de emitir. A quantidade real e o limite do projeto são **NÃO MEDIDOS**. Não afirmo que hoje a aplicação esteja truncando dados.

**Como conferir se ainda é verdade:** em teste do carregador com dublês, devolver páginas limitadas de um conjunto sintético maior que o limite, em ordens diferentes para as duas consultas. Deixar uma filial bloqueada presente na resposta crua e ausente na resolvida; abrir um rascunho com ela e inspecionar o resultado de `travaDaFilial(..., 'emitir')`. Conferir também se o carregador procura páginas seguintes ou acusa incompletude. Esse teste dispensa banco real.

**Eu verifiquei, ou eu deduzi?** **deduzido** — comportamento das consultas e dos valores ausentes, condicionado a respostas parciais. A falta geral de paginação já existia na carga antiga; a consequência destacada aqui é a dependência acrescentada da segunda consulta para classificar e bloquear a filial.

**Fonte externa e interpretação:** a [documentação oficial do Supabase sobre seleção de dados](https://supabase.com/docs/reference/python/select) informa limite padrão de 1.000 linhas por projeto, configurável, e paginação por intervalo. A página usa exemplos Python; o ponto citado é a configuração da API do projeto, não a linguagem desta aplicação. A junção incompleta e seu efeito na trava são deduções sobre este código. O limite efetivo instalado não foi consultado.

### Achado 6 — O teste das portas de emissão não comprova que o bloqueio interrompe a ação

**Gravidade:** média.  
**Onde:** `tests/domain/fornecedores.test.ts:262`; usos em `src/features/ordens-compra/NovaOcPage.tsx` e `src/features/ordens-compra/HistoricoPage.tsx`.  
**Degrau da régua:** 6 — testável. Requisito: D545, rascunho pode ser salvo, mas filial bloqueada não pode emitir.

**O que está errado:** o teste chamado “as portas passam pela trava” lê os arquivos como texto e procura a chamada de `travaDaFilial` antes da gravação. Não verifica se a mensagem retornada é usada nem se a execução para. Manter a chamada e retirar a decisão de interromper preservaria as expressões procuradas. Os testes da função pura continuariam comprovando apenas que ela devolve uma mensagem.

**Consequência:** uma regressão em qualquer uma das 2 portas de emissão pode liberar filial bloqueada sem esse teste acusar. A decisão D545 situa essa proteção na aplicação. No código atual, os chamadores consultados usam o retorno para interromper; este achado é sobre a garantia anunciada pelo teste, não sobre uma liberação atual já demonstrada.

**Como conferir se ainda é verdade:** ler as três asserções de `:267` a `:270` e comparar com o desvio que retorna antes de emitir nos chamadores. Para comprovação executável futura, em cópia de teste autorizada, conservar a chamada e retirar somente a interrupção; o teste deve falhar. Alternativamente, um teste de comportamento deve clicar em Emitir com filial bloqueada e comprovar zero chamadas de gravação/alteração de status. Não realizei a mutação no checkout periciado.

**Eu verifiquei, ou eu deduzi?** **deduzido** — a ausência de verificação do efeito é visível nas asserções. A bateria passou no código intacto; não rodei uma versão quebrada.

### Achado 7 — O histórico inteiro no rodapé pode ocupar o espaço do conteúdo em todas as páginas

**Gravidade:** média, por crescimento do histórico ou descrição muito longa.  
**Onde:** `src/services/pdf/generateEcrPdf.ts:94`, `src/services/pdf/generateEcrPdf.ts:110`, `src/services/pdf/generateEcrPdf.ts:190` e `:240`; descrição em `src/features/catalogo-ecr/EditorDaEcr.tsx:252`.  
**Degrau da régua:** 5 — escalável; 1 — correto e seguro. Requisitos: D588 e D589, histórico das revisões e PDF correspondente.

**O que está errado:** todas as revisões são medidas como uma única tabela e repetidas integralmente no rodapé de cada página. Não existe continuação da tabela. Quando a tabela fica alta demais, o limite do texto sobe para antes de seu início. A função que abre outra página mantém o mesmo limite impossível e segue escrevendo. A descrição da revisão não tem limite de tamanho na tela nem no contrato lido.

**Consequência:** no cenário de 50 registros de histórico, cada linha tem no mínimo 5,2 mm. São pelo menos 265,2 mm com o cabeçalho da tabela. Numa página de 297 mm e margem inferior de 16 mm, a tabela começa no máximo a 15,8 mm; o corpo começa a 36 mm. Há sobreposição com cabeçalho e conteúdo em todas as páginas. É um exemplo de crescimento de 5 para 50 revisões, não uma contagem do cadastro atual. Uma descrição suficientemente longa pode antecipar o problema sem chegar a 50 registros.

**Como conferir se ainda é verdade:** gerar, em teste em memória, uma ECR sintética com 50 linhas curtas de histórico e inspecionar a posição dos textos/tabela; repetir com uma descrição longa. O teste existente de várias páginas aumenta as seções do corpo, não o histórico, e procura texto serializado, sem comprovar ausência de sobreposição. A conta acima usa as constantes de `:34`, `:35` e `:39` e a fórmula de `:102`.

**Eu verifiquei, ou eu deduzi?** **deduzido** — limite geométrico calculado a partir do código. Não produzi nem renderizei esse PDF de 50 revisões durante a perícia.

## O que está bom e o que a análise não encontrou

**Contrato de revisão de ECR:** os três argumentos enviados por `src/services/supabase/ecrs.ts:29` correspondem à função indicada: identificador, seções e descrição. O editor limpa os textos, exige descrição, mantém o rascunho quando a gravação falha e recarrega os dados após sucesso. A permissão vem da função de autorização; não foi substituída por um teste genérico de administrador. No contrato SQL lido, a escrita exige o revisor autorizado. Não encontrei argumento incompatível nem chave privilegiada acrescentada nesse caminho. Isso é compatibilidade estática, não prova de RLS instalada.

**Consulta das ECRs:** o catálogo e o PDF usam a ECR do sistema. A carga do histórico pede seus metadados, sem trazer todas as seções antigas. As correções de conteúdo cobertas pela segunda migration indicada foram consideradas no contrato; não foram tratadas como defeitos ainda existentes. A troca tipográfica autorizada pela D593 também não virou achado.

**Lista colada e leitores:** há separação explícita entre Rápido e Certeiro. A resposta identificada como outro leitor é recusada quando o usuário escolhe Certeiro; não encontrei troca automática silenciosa de modelo nesse caminho. A importação agrega leituras novas, limita o conjunto a cinco páginas antes do processamento e mantém os avisos de conferência fora dos campos enviados ao banco e ao PDF. Os testes cobrem esses caminhos com dublês. Precisão real da IA e custo real por chamada não foram medidos.

**Empresa e filial:** com os dados completos, o agrupamento usa a empresa informada pelo banco, a seleção escolhe a filial elegível conforme a regra e o rascunho antigo mantém sua filial. A emissão consulta o bloqueio, enquanto salvar rascunho continua possível. Não encontrei outra divergência funcional nessa seleção além da condição de carga incompleta descrita no achado 5.

**Simplicidade e manutenção, degraus 2 e 3:** regras de ECR, leitura e fornecedores estão separadas em funções de domínio, aproveitadas pelos componentes e serviços. Há componentes grandes, mas tamanho sozinho não justificou um achado. Não encontrei duplicação ou abstração futura com consequência suficiente para entrar nesta triagem.

**Outras mudanças do intervalo:** foram consideradas as alterações de login/primeiro acesso, pesquisa de obras e fornecedores, atualização da aplicação, retirada de Prestadores, tipos, normalização e estilos. Não encontrei outro defeito acionável nesses caminhos após a leitura. Testes de CSS e de componentes não substituem uma conferência visual de 375 px; essa conferência não foi feita nesta perícia.

**Dados e sessão:** além do rascunho que atravessa contas, não identifiquei exposição adicional de dados pessoais sem finalidade nos caminhos alterados examinados. Campos necessários ao destinatário da OC e autoria requerida para a revisão não foram classificados como vazamento apenas por existirem. Esta leitura não comprova segurança do banco, de logs externos ou de respostas reais dos serviços, que ficaram fora do escopo.

## Eficiência: números e limites

Os números abaixo são contagens estáticas de chamadas nos caminhos lidos, não medições de latência em produção.

| Ação | Contagem encontrada | Limite da conclusão |
| --- | --- | --- |
| Carga completa dos dados | 7 consultas iniciadas em paralelo | Não inclui autenticação; volume e tempo reais não medidos |
| Montagem do catálogo | 1 chamada para consultar permissão | Abrir uma ECR já carregada não faz nova leitura do banco |
| Salvar revisão de ECR com sucesso | 1 chamada de gravação e 7 consultas de recarga | 8 operações de banco no caminho normal, sem contar detalhes internos do transporte |
| PDF de ECR já carregada | 0 chamadas ao banco | Usa memória; a marca pode exigir leitura de recurso estático |
| Leitura válida pela IA | 1 solicitação ao serviço por leitura | Uma releitura explícita acrescenta 1; tempo, tokens e valor não medidos |

A carga anterior tinha 8 consultas; a retirada de Prestadores e a nova consulta resolvida resultam nas 7 atuais. Não há fundamento nesta perícia para afirmar que um clique ficou mais rápido em milissegundos. O limite de tamanho do PDF é exercitado pelos testes existentes; não transformei os valores históricos escritos em comentários em medições minhas. Os riscos concretos de crescimento são os achados 5 e 7.

## Verificações executadas

| Verificação autorizada | Resultado observado |
| --- | --- |
| `pnpm test` | 26 arquivos de teste, 368 testes aprovados, 26,74 s, saída 0 |
| `pnpm typecheck` | Aprovado, saída 0 |
| `pnpm lint` | Aprovado, saída 0 |

A primeira tentativa da bateria parou antes dos testes por `spawn EPERM` no ambiente restrito. A repetição do mesmo comando, autorizada pelo mecanismo de execução, concluiu. Houve dois avisos de React sobre `act` nos testes do catálogo, sem falha da bateria. Não os elevei a defeito de produção.

Os três resultados acima são **verificados**. Os sete achados são **deduzidos**, com cenários de conferência separados daquilo que efetivamente rodei. Não foram criados testes, alteradas entradas, sabotadas travas ou executados os cenários novos descritos. A bateria verde não prova integração com banco real, concorrência entre sessões, fidelidade visual de todos os PDFs nem isolamento de rascunhos entre contas.

## Lista de conferência do guia

- [x] Um único arquivo de entrega, em `docs/Pericias/`, com a data pedida no nome.
- [x] Topo com Data, Quem fez, Estado, Escopo, Commit periciado e NÃO foi olhado.
- [x] Cada achado numerado tem gravidade, localização, consequência, degrau, como conferir e distinção entre dedução e verificação.
- [x] Consequências em linguagem de uso, com números e limites explícitos; sem prejuízo financeiro inventado.
- [x] Fontes oficiais citadas onde houve pesquisa, separadas da interpretação do auditor.
- [x] Sem senhas, chaves ou dados pessoais no texto e nos exemplos.
- [x] Nenhum arquivo do software corrigido; somente este relatório foi acrescentado. Sem commit, banco, servidor ou pedido a outro agente.

Este registro encerra a perícia solicitada. A aceitação, rejeição ou priorização de cada suspeita cabe à triagem do CTO.
