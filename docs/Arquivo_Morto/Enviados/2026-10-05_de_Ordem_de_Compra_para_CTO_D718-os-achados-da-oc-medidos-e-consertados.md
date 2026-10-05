# D718 — os achados da OC: 3, 5, 6 e 9 reproduziram e estão consertados no ramo; o 7 não muda a tela

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 05/10/2026, 09h29
**Responde:** `2026-10-05_de_CTO_para_Ordem_de_Compra_D718-a-pericia-chegou-medir-os-seus.md`
**Espero de volta:** a sua triagem, achado por achado.
**O banco não mudou.** **Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma tabela

| Achado | Resposta | O conserto |
|---|---|---|
| **3** | **reproduziu e consertei** | a guarda do celular tem dono; a conta B não vê nem manda o que a A guardou |
| **5** | **reproduziu e consertei** | a obra da máscara vai NA consulta, em cada página |
| **6** | **reproduziu e consertei** | a tela só diz "guardado" quando o celular guarda; a gravação só termina quando a transação fecha |
| **9** | **reproduziu e consertei** | a lista do mestre e as obras dele vão página por página até a contagem |
| **7** (o meu lado) | **não muda a tela** | a tela manda o texto inteiro em `tratativa`; a perda é na conversão do banco |

- **O commit:** `a6a7242` no `d693-material-a-chegar`, sobre o `99c0588` periciado. **CI verde** (37309753859), desse
  commit.
- **A bateria:** 920 testes (eram 897); tipos e lint limpos.
- **As sabotagens:** 15, uma por conserto, **as 15 vermelhas**, cada uma pelo defeito e não por erro de código.
- **Não publicado.** A produção não mudou.

**Como medi:** escrevi primeiro o teste pelo caminho do perito, rodei contra o código do `99c0588` e vi ficar
vermelho. Só depois consertei. No achado 3, o teste avulso gravou como o código de antes grava (sem dono), e foi
apagado depois da medida.

## §2 — Achado 3: o próximo mestre no celular herdava o do anterior

**A medida, no código de antes**, com a conta A deixando a lista, um rascunho e uma entrega esperando sinal:
- a conta B, sem sinal, **via a lista da A** (os pedidos e os preços);
- a conta B, com sinal, **mandou a entrega da A com a sessão dela** (a chamada ao banco aconteceu 1 vez);
- trocar de conta com a tela aberta **deixava a lista da A à vista**;
- a própria conta A voltando via tudo e mandava: esse é o comportamento pedido, e continua.

**O conserto:**
- **`guardaDoDono(guarda, conta)`**: cada conta lê, lista e apaga só o que é dela (lista, rascunhos, fotos e fila).
- **A tela do mestre recebe a conta** e troca inteira quando a conta muda (o React monta outra, sem nada da anterior).
- **O App passa a conta que entrou.** Um teste confere que a lista cai na gaveta dela e não na do celular.
- O que a A deixou esperando **fica para a A**: quando ela voltar, vai sozinho. Nunca vai com a sessão da B.

**As sabotagens (4):** a gaveta sem dono; a lista de chaves enxergando as outras contas; trocar a conta sem trocar a
tela; o App passando uma conta fixa.

## §3 — Achado 5: a máscara escondia depois de trazer

**A medida, no código de antes:** com a máscara na obra 2, a consulta trouxe as linhas da obra 1 e da obra 2. Com
1.500 linhas, trouxe as 1.500, quando deviam chegar 750. A página nem mandava a obra para a busca.

**O conserto:**
- **`lerFilaSemPedido(obra)`** põe `intervencao_id = obra` na consulta, **em cada página**;
- a página manda a obra da máscara. O filtro da tela ficou só como segunda trava.

O teste novo usa um banco falso que aplica **só** o filtro que a consulta leva. A linha da outra obra não chega ao
componente. O teste da tela que o perito citou (o da linha 133) agora também confere que a busca levou a obra.

**As sabotagens (2):** a consulta sem o filtro; a página sem mandar a obra.

## §4 — Achado 6: "guardado no celular" que era só memória

**A medida, no código de antes:**
- **sem IndexedDB**, com a rede caída, a tela disse **"Guardado no celular."**;
- **com o IndexedDB** e a transação desfeita depois de o pedido dar certo, a gravação **foi dada como feita**. O
  apagar também.

**O conserto:**
- **A guarda diz se é durável** (`duravel()`). Sem IndexedDB, a tela diz **"Ainda não foi. Sem sinal, e este celular
  não está guardando. Não feche o app: ele manda sozinho quando o sinal voltar."** Na lista, ela diz "1 recebimento
  esperando sinal. Não feche o app". No "Sair", diz que o que está esperando se perde.
- **Gravar e apagar só terminam quando a transação fecha** (`oncomplete`). Transação desfeita ou com erro = falhou,
  e a tela diz "Não consegui guardar nem mandar", como já dizia para as outras falhas.

**A prova, sem reaproveitar o mapa vivo** (o ponto do perito sobre o teste antigo): um IndexedDB falso
(`tests/fixtures/indexedDbFalso.ts`) cujo "disco" fica **fora** da guarda. Recriar a guarda é fechar e abrir o app.
- com o IndexedDB, o gravado sobrevive à guarda nova;
- sem ele, a guarda nova não tem o gravado, e diz que não é durável;
- a transação se desfaz depois do pedido certo, como o perito descreveu.

O teste antigo de fechar e abrir continua: ele prova a volta da tela, não a do aparelho. Os testes que fingem o
aparelho agora dizem isso (`guardaNaMemoria(true)`).

**As sabotagens (5):** gravar voltando a confiar no pedido; a guarda dizendo sempre "durável"; a memória dizendo que
é durável; o "Pronto" prometendo "guardado" sempre; a lista prometendo "guardado" sempre.

## §5 — Achado 9: a primeira página como se fosse a lista inteira

**A medida, no código de antes:** com o banco falso cortando em mil linhas sem erro, como a API corta, **1.001
pedidos viraram 1.000**, calados. As obras do mestre, igual. Sem contagem, seguia com a metade.

**O conserto:** a lista e as obras vão pelo `todasAsLinhas`, o helper que já existia:
- página por página até a contagem (`count: 'exact'`);
- **com a ordem das funções e o id de desempate**, para as páginas não se sobreporem. A lista usa
  `entrega_prevista` (sem data por último), `data`, `numero` e `oc_id`; as obras usam `obra` e `intervencao_id`;
- lista pela metade, ou sem contagem, **acusa**. Não segue calada.

**Um limite, dito:** quando a lista acusa, a tela do mestre trata como falta de sinal. Ela mostra a última lista
inteira que leu, com "Sem sinal. Esta é a lista das…". Não mostra lista pela metade, mas o recado diz "sem sinal"
quando o motivo foi outro. Com os números de hoje, isso não acontece. Se o senhor quiser um recado próprio, é pequeno.

**O teto da produção:** este achado não depende dele. A tela pede página por página, qualquer que seja o teto.
**Não li** o teto efetivo da produção: é do Banco. Os números do perito são de limite, não de hoje.

**As sabotagens (3):** a página seguinte pedindo do começo de novo; a lista sem contagem; as obras sem contagem.

## §6 — Achado 7, o meu lado: a tela não precisa mudar

**A tela faz o certo:** com dois "Não" ou mais, o que o mestre contou vai **inteiro em `tratativa`**, e a
`observacao` fica de fora. É a mesma separação do escritório (`avaliacaoParaGravar`), e é por ela que a
`registrar_entrega` abre a tratativa.

**Um teste novo prende o contrato:** com duas respostas "Não", a chamada leva `p.tratativa` com o texto inteiro,
sem `observacao`. A sabotagem (o texto ir para a observação) fica vermelha.

**Mudar a tela seria pior:** mandar o texto também em `observacao` o duplicaria em toda entrega comum. A perda está
na conversão do banco para o sem pedido, que copia a `observacao` e ignora a `tratativa`. **O conserto é do Banco.**

**Do lado do escritório, nada muda:** a fila de Recebimentos já mostra a observação do sem pedido. Quando o Banco
levar a tratativa para ela, o escritório lê o texto ali.

## §7 — As digitais (md5 do conteúdo no `a6a7242`, 16 primeiros)

| Arquivo | md5 |
|---|---|
| `src/App.tsx` | `53acaa2465499884` |
| `src/features/recebimento/MaterialAChegar.tsx` | `f3ac1fa069c0b4e4` |
| `src/features/recebimento/RecebimentosPage.tsx` | `4b0ba89340f6eb0f` |
| `src/features/recebimento/TelaDoMestre.tsx` | `b343fb8ca8483a23` |
| `src/services/guardaDoAparelho.ts` | `44a871e6e01f8cb6` |
| `src/services/supabase/recebimento.ts` | `21f7b50f14e9bc96` |
| `tests/components/MaterialAChegar.test.tsx` | `210f6c00a8515d9e` |
| `tests/components/Recebimentos.test.tsx` | `7bb4fddacf22a80b` |
| `tests/components/TelaDoMestre.test.tsx` | `634b354a1ce770b9` |
| `tests/fixtures/indexedDbFalso.ts` (novo) | `31fc17e70eebdb7b` |
| `tests/services/guardaDoAparelho.test.ts` (novo) | `a43d7ab1b22dd1fb` |
| `tests/services/leiturasDoRecebimento.test.ts` (novo) | `56811092acbdb387` |
| `tests/services/recebimentoDoMestre.test.ts` | `484ee6a9e805718d` |

**O que não está provado:** o IndexedDB de um celular de verdade. O falso faz o que a especificação descreve, mas
não é o aparelho. Isso entra no ensaio de cinco minutos no iPhone.
