# Perícia de código — consertos e máscara da auditoria

**Data:** 28/09/2026  
**Quem fez:** Codex, auditor externo  
**Estado:** CONCLUÍDO — é registro  
**Escopo:** checkout `OC_uma-obra`, ramo `d599-uma-obra`; mudanças fora de `docs/` entre `7edb715` e `fe119e6`: 31 arquivos, 2.514 linhas acrescentadas e 150 retiradas. Consertos dos sete itens aceitos na D607, máscara de uma obra e integração dos dois trabalhos. Leitura das peças chamadas pelo código alterado e dos testes pertinentes.  
**Commit periciado:** `fe119e6e335bdb48252e39dd99a4db34f66fe86d` (`fe119e6`). Ramo e HEAD conferidos no início e no encerramento, sem mudança; checkout limpo nas duas conferências.  
**NÃO foi olhado:** banco real, produção, implantação, permissões efetivamente instaladas, tráfego real, aparência em navegador e renderização visual dos PDFs. SQL lido somente como contrato da revisão de ECR. Documentação serviu como requisito, sem perícia documental. Não foi lida a perícia anterior. O código posterior a este commit tem relatório separado. Não houve ensaio de mutação de código nem criação de testes.

## Para o dono da empresa

A máscara pode continuar mostrando outras obras quando entra em vigor, inclusive depois de informar que está ligada. Também há uma diferença de até quase 15 segundos, em condições normais, entre o horário escolhido e a conferência automática da tela. São os dois pontos de maior consequência para a apresentação ao auditor.

Os testes dos sete consertos passaram. Há uma ressalva na prova dos sinais do PDF: ela usa a mesma tabela de conversão do código que deveria fiscalizar. Isso não prova que o PDF atual esteja errado; enfraquece a proteção contra uma troca futura de “≥” por “≤”.

## Base e evidência

Régua: guia do auditor; D599, D601, D602, D607, D608 e D611 do planejamento do CTO; triagem `CTO/docs/Arquivo_Morto/Enviados/2026-09-27_de_CTO_para_Ordem_de_Compra_e_Banco_de_Dados_D607-triagem-sete-aceitos.md` e cartas correspondentes. Decisões foram comparadas com o código, sem tomar declarações de sucesso por evidência de funcionamento.

**Verificado:** `pnpm test`, no checkout identificado: **33 arquivos de teste, 442 testes aprovados, 44,32 segundos, saída 0**. A primeira tentativa foi impedida pelo ambiente com `spawn EPERM`, antes da execução dos testes; a repetição autorizada da mesma bateria terminou normalmente. Houve avisos de `act` do React; eles não foram tratados como falha de produção. Não rodei `typecheck`, `lint`, servidor ou comando de banco nesta perícia.

Os achados abaixo são **deduções do código**. Os roteiros de reprodução são propostas para a triagem, com dublês locais; não foram executados nem incorporados ao software. Teste verde não equivale a aprovação da produção. Cada achado é suspeita para decisão do CTO.

## Achados, por consequência

### Achado 1 — dados de outras obras sobrevivem à ativação da máscara e podem voltar por uma resposta atrasada

**Gravidade:** alta.  
**Onde:** `src/App.tsx:179`, `src/App.tsx:209`, `src/App.tsx:389`; `src/services/supabase/sync.ts:12`; `src/services/supabase/dados.ts:96`.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável.  
**O que está errado:** mudar a obra ativa inicia outra carga, mas deixa os dados anteriores na loja e as páginas continuam sendo desenhadas. A limpeza do efeito marca `ativo = false`, porém essa marca não alcança o `setData` de `recarregarDados`. Uma leitura iniciada sem máscara pode terminar depois da leitura filtrada e sobrescrevê-la. O filtro é escolhido no início da carga, inclusive para suas páginas seguintes; a resposta não é conferida contra a máscara vigente antes de entrar na loja. Na D599, filtrar a consulta deveria impedir que as outras obras chegassem à apresentação; filtrar somente a próxima consulta não cobre essa transição.  
**Consequência:** com 2 obras carregadas, ligar a máscara para 1 pode deixar ambas na tela durante a espera. Se a carga filtrada falhar, os dados anteriores permanecem; se a resposta antiga chegar por último, ambas podem reaparecer. No sentido inverso, uma resposta filtrada atrasada pode voltar a esconder obras depois do desligamento. Não foi medido um tempo máximo: depende das respostas e das próximas recargas.  
**Como conferir se ainda é verdade:** num teste local com o `App` e o `sync` reais, carregar duas obras; ligar a máscara e reter ou rejeitar a resposta filtrada. Conferir imediatamente histórico, lista de obras e totais. Em outro caso, reter uma carga sem filtro, concluir primeiro a carga com filtro e só então soltar a primeira. A loja não deve aceitar a resposta de um contexto vencido. Repetir desligando a máscara. Os dublês imediatos de `tests/components/UmaObra.test.tsx:47` não exercitam essa inversão.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — segui os efeitos, a loja e o ponto de publicação da resposta; não provoquei a concorrência em navegador ou banco.

### Achado 2 — a virada da janela depende de uma conferência a cada 15 segundos; o teste chama a conferência por fora

**Gravidade:** média.  
**Onde:** `src/App.tsx:122`; `tests/components/UmaObra.test.tsx:214`, especialmente as chamadas nas linhas 222 e 228.  
**Degrau da régua:** 1 — correto e seguro; 6 — testável.  
**O que está errado:** a comparação dos instantes é correta, mas sua ligação com a tela usa `setInterval(..., 15_000)`. A janela não provoca uma transição exatamente no limite. O teste da virada muda a data e chama `useUmaObraStore.getState().conferir()` diretamente; assim, prova a função de conferência, mas não prova que o relógio do aplicativo a acione no horário exigido.  
**Consequência:** se a última conferência ocorrer às 23:59:59, a próxima será aproximadamente às 00:00:14. Na entrada, a tela pode mostrar outras obras nesses 14 segundos; na saída, pode continuar escondendo-as. Soma-se a isso a espera da carga, tratada no achado 1. O requisito pede início em 16/11 às 00:00 e fim depois do último minuto de 17/11, sem esconder fora da janela.  
**Como conferir se ainda é verdade:** montar o `App` com relógio e temporizadores falsos um segundo antes do início, avançar dois segundos sem chamar a loja manualmente e verificar tela e assinatura de eventos. Repetir no término. Como controle da qualidade do teste, retirar o acionamento periódico numa cópia descartável: um teste de acionamento automático deve falhar. Essa alteração não foi feita nesta perícia.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — o intervalo e a chamada manual estão no código; não medi atraso real do navegador.  
**Fonte e interpretação:** a [documentação de `setInterval` da MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval#delay_restrictions) explica que o atraso efetivo pode superar o configurado. A fonte fundamenta a ausência de garantia temporal; os 14 segundos do exemplo e a incompatibilidade com esta janela são análise minha do código.

### Achado 3 — a prova de “≥” e “≤” no PDF usa a própria conversão sob teste como gabarito

**Gravidade:** média.  
**Onde:** `src/domain/letrasDoPdf.ts:31`, `src/domain/letrasDoPdf.ts:105`; `tests/services/ecrPdf.test.ts:166`, `tests/services/ecrPdf.test.ts:195`.  
**Degrau da régua:** 6 — testável.  
**O que está errado:** o PDF transforma o sinal em um código da fonte Symbol. O teste lê o resultado usando `SINAL_DO_CODIGO`, montado invertendo a mesma tabela `SINAIS` da produção. Se os códigos de “≥” e “≤” forem trocados nessa tabela, a leitura do teste também se troca e recupera o texto esperado. As duas larguras são iguais na tabela usada, portanto a verificação de largura positiva não identifica essa troca.  
**Consequência:** 1 regressão pode inverter uma exigência como “resistência ≥ 30 MPa” no documento entregue e ainda satisfazer a trava apresentada como prova de impressão. **Não encontrei essa inversão no código atual**; o achado é sobre a proteção prometida pelo teste.  
**Como conferir se ainda é verdade:** numa cópia descartável, trocar apenas os dois códigos em `SINAIS` e rodar a prova dos sinais de `tests/services/ecrPdf.test.ts`. Comparar os bytes/fontes com uma tabela independente ou abrir o PDF em um leitor independente. O teste deve acusar a troca mesmo que a conversão inversa de produção também tenha mudado. Não fazer essa mutação no checkout de trabalho.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — a dependência circular do gabarito foi lida; não alterei a tabela nem executei mutação. A bateria original passou.  
**Fonte e interpretação:** a [tabela Symbol da Adobe](https://help.adobe.com/en_US/framemaker/using/using-framemaker/user-guide/symbol-zapfdingbats.html) associa `0xA3` a “≤” e `0xB3` a “≥”, como faz o código atual. A tabela é a referência externa; a conclusão sobre o teste aceitar uma inversão é minha.

### Achado 4 — apagar uma data ou hora impede a mensagem de validação ao armar

**Gravidade:** baixa.  
**Onde:** `src/features/configuracoes/MostrarUmaObra.tsx:58`; `src/domain/umaObra.ts:43`, `src/domain/umaObra.ts:54`, `src/domain/umaObra.ts:116`.  
**Degrau da régua:** 1 — correto; 6 — testável.  
**O que está errado:** o clique converte os quatro campos em instantes antes de validar se estão preenchidos. Um campo vazio produz um instante inválido, passado a `Intl.DateTimeFormat.formatToParts`, que lança erro. A mensagem preparada em `problemaParaArmar` para pedir datas e horas fica depois desse ponto e não é alcançada. O manipulador não trata a exceção.  
**Consequência:** basta apagar 1 dos quatro campos e clicar em Armar para a ação falhar sem a orientação prevista. A equipe precisa descobrir o campo faltante por tentativa. Não há evidência de gravação no banco ou perda de dados nesse caso.  
**Como conferir se ainda é verdade:** no componente com permissão simulada, escolher uma obra, limpar o campo “Liga em (dia)” e clicar em Armar; repetir com a hora. Esperar uma mensagem acessível e nenhuma exceção. Passar `new Date(NaN)` diretamente ao validador não cobre o caminho de conversão anterior.  
**Eu verifiquei, ou eu deduzi?** **deduzido** — análise da sequência de conversão e validação; não executei o clique.

## Os sete consertos da D607

Os números desta tabela são os da triagem, não os achados novos acima. “Bom no recorte” significa que não encontrei outro defeito naquele caminho, dentro dos limites declarados.

| Item da triagem | Resultado no código atual e nas provas locais |
|---|---|
| 1. Edição durante a releitura da IA | Bom no recorte. A resposta é comparada com o estado atual; os testes editam durante uma promessa pendente e exercitam manter ou trocar a correção. |
| 2. Revisão de ECR aberta sobre base velha | Bom no recorte. A revisão de origem acompanha o rascunho, a tela confere novamente ao gravar e manda `p_revisao_de` na assinatura de quatro argumentos. A recusa `40001` recebe mensagem própria. A eficácia do banco não foi ensaiada. |
| 3. Texto aceito pelo editor e sinais no PDF | O código separa Helvetica e Symbol, admite os sinais previstos e recusa caracteres/quebras não admitidos nas linhas da ECR. Os códigos de “≥” e “≤” coincidem com a Adobe. Ressalva: achado 3 sobre a independência da prova. |
| 4. Rascunho entre contas | Bom no recorte. Saída limpa o rascunho, troca de conta confere dono e o catálogo confere permissão/dono antes de desenhar o editor. Há teste com a mesma instância do aplicativo, inclusive troca sem saída intermediária. |
| 5. Carga das seis listas e filial desconhecida | Bom para a carga estável ensaiada. Paginação com contagem, ordem com desempate e erro quando falta contagem ou a carga para antes do total. A filial cujo bloqueio não veio confirmado não emite. Não foi ensaiado um banco mudando entre páginas. |
| 6. Trava nas duas portas de emissão | Bom no recorte. As provas acionam os caminhos reais, contam zero chamada de gravação na recusa e possuem casos de controle em que a gravação é chamada. São mais fortes que procurar uma frase no código. |
| 7. Histórico e descrição no PDF | Bom no recorte local: paginação do histórico, reserva do rodapé e limite de 500 caracteres alinhado ao contrato. Passaram as verificações estruturais e de conservação do PDF sem sinais. Isso não substitui inspeção visual das páginas. |

## Demais áreas e números

**Máscara em situação estável:** as consultas de obras e OCs recebem filtro antes da leitura; o aviso de alteração de OC também recebe o filtro. Fornecedores, ECRs e numeração permanecem globais conforme a decisão. O rascunho de outra obra é guardado e restaurado ao desligar, sem exclusão do banco. O armazenamento bloqueado é tratado. Não encontrei outro achado nesses caminhos estáveis.

**Brasília e fim do dia:** o domínio usa `America/Sao_Paulo`, começo inclusivo e fim exclusivo no minuto seguinte. A escolha até 17/11 às 23:59 inclui 23:59:59. Não encontrei erro nessa conta; os achados 1 e 2 são da aplicação da conta à tela.

**Integração do merge:** a leitura de `App.tsx` e `dados.ts` mostrou as duas funcionalidades presentes. Não encontrei remoção dos consertos por resolução de conflito; a ressalva é o gerenciamento de cargas descrito no achado 1.

**Eficiência, contagem deduzida do código:** uma carga pequena faz 7 consultas de dados: 6 listas paginadas e 1 de numeração. Se cada uma das seis listas tiver 1.001 registros e a página comportar 1.000, serão 13 consultas: 12 páginas e 1 numeração. As listas começam em paralelo; páginas de uma mesma lista são sequenciais. Isso não inclui autenticação/perfil nem é medição de latência. Não medi tempo por clique, volume real, memória ou capacidade de produção com 10 vezes a carga. Não atribuo lentidão sem medição.

**Simplicidade e organização:** regras de janela, armazenamento, estado e consulta estão separadas; a paginação é compartilhada pelas seis listas e os sinais têm uma peça própria. Não encontrei duplicação ou abstração futura com consequência suficiente para outro achado. O principal limite de manutenção é a atualização global sem identificar o contexto da resposta, já descrita no achado 1.

## Conferência de entrega

- [x] Um único Markdown para este escopo, no destino solicitado.
- [x] Data, autoria, estado, escopo, commit e exclusões explícitos.
- [x] Achados numerados com gravidade, localização, degrau, consequência, reprodução e natureza da evidência.
- [x] Fontes externas separadas das conclusões do auditor.
- [x] Sem credenciais ou dados identificadores de pessoas/empresas no conteúdo.
- [x] Ramo e commit conferidos antes e depois; nenhum arquivo de código alterado, nenhum commit, banco ou implantação.
- [x] Somente este relatório foi criado para esta perícia; o segundo escopo pedido tem sua entrega própria.
