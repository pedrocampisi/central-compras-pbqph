# D603 — a medida dos sete achados da perícia: seis reproduzem, um reproduz por mutação

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 22h0x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D603-a-pericia-chegou-meca-os-sete-achados.md`, itens 1 a 4.
**Espero de volta:** a sua triagem, achado por achado. Nada foi consertado.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** Os dados das medidas são sintéticos.

---

## §1 — O que foi feito, e onde

- **A perícia e as cartas estão no `main`** (`7b3bd50`, empurrado):
  - o relatório `docs/Pericias/2026-09-27_pericia_codex_oc-desde-15-09-e-tela-de-editar-ecr.md`;
  - a D602 (a sua ordem: copiar junto com a perícia);
  - a D603, a D604 e a D605.
- **As medidas estão no ramo `d589-editar-ecr`, commit `5f287cd`**, empurrado. São só testes (385 linhas em 5 arquivos, nenhuma fora de `tests/`); nenhuma linha de `src/` mudou.
- **Cada medida segue o "como conferir" do perito,** e é escrita pelo lado do certo: ela passa quando o defeito não existe.
  - As que reproduzem ficam como **`it.fails`**, e a bateria continua verde: 377 testes, sendo 368 de antes e 9 medidas.
  - No dia em que o conserto entrar, a medida passa a acusar ("Expect test to fail"). Aí o `.fails` sai e ela vira trava.
  - **Conferi que a medida morde:** no achado 4, pus um conserto de mentira no `App.tsx` (fechar o rascunho da ECR na saída), e a medida ficou vermelha. Depois restaurei com o mesmo sha256.
- **A cópia `OC_uma-obra` continua parada em `bfb37be`.** Nada foi publicado; continua no ar a `080168b8`.

## §2 — Os sete, um por um

| # | Achado | Resultado |
|---|---|---|
| 1 | a releitura apaga a correção feita durante a espera | **reproduziu** |
| 2 | o rascunho velho desfaz a revisão mais nova | **reproduziu** |
| 3 | "≥", "≤" e a quebra de linha viram "?" no PDF | **reproduziu** |
| 4 | o rascunho da ECR atravessa a troca de conta | **reproduziu** |
| 5 | a página incompleta de fornecedores solta a trava | **reproduziu no banco falso**; o limite e o volume reais não dá para medir daqui |
| 6 | o teste das portas não prova a interrupção | **reproduziu, por mutação** |
| 7 | o histórico no rodapé cobre o conteúdo | **reproduziu**, e o efeito é maior que o previsto |

### Achado 1 — a releitura apaga a correção feita durante a espera: **reproduziu**

- **O teste:** `tests/components/LeitorDaIA.test.tsx`.
- **O cenário:**
  1. o rápido lê 2 itens;
  2. "Ler de novo com o certeiro", com a resposta presa. Os itens estavam intactos, e a tela não perguntou;
  3. durante a espera, a quantidade do cimento vai de 10 para 12 pelo campo da tela;
  4. a IA responde com 10.
- **Saída:** `{"perguntou":false,"quantidade":10}`. A correção sumiu sem pergunta.

### Achado 2 — o rascunho velho desfaz a revisão mais nova: **reproduziu**

- **O teste:** `tests/components/EditarEcr.test.tsx`.
- **O cenário:**
  1. abre a ECR 03 na Rev. 00 e muda a linha A (seção 01, linha 1);
  2. os dados recarregam com uma Rev. 01 em que a linha B (seção 01, linha 2) mudou;
  3. salva o rascunho aberto.
- **Saída:** `{"recusou":false,"linhaB":"NBR 8953 - Concreto para fins estruturais;"}`.
  - A linha B foi ao banco com o texto da **Rev. 00**; a mudança da 01 seria desfeita.
  - A tela não recusou a base velha, e a gravação completou: o diálogo fechou.

### Achado 3 — "≥", "≤" e a quebra de linha viram "?" no PDF: **reproduziu**

- **O teste:** `tests/services/ecrPdf.test.ts`.
- **O cenário:** uma ECR sintética com "Resistência ≥ 30 MPa", "Abatimento ≤ 10 cm" e "Linha um⏎Linha dois". O esperado **não** passa por `paraAFonteDoPdf`.
- **Saída:** `{"recusou":false,"problemas":0,"trechos":["Resistência ? 30 MPa","Abatimento ? 10 cm","um?Linha"]}`.
  - As regras do editor aceitam tudo, com zero problemas.
  - No PDF, os dois sinais opostos saem iguais ("?"), e a quebra de linha também vira "?".
- **Um aviso:** o teste velho que exige "?" para um sinal fora da fonte (`ecrPdf.test.ts`, "um caractere que a fonte não tem vira "?"") continua verde. Ele é o comportamento que o achado questiona; se a triagem mudar a regra, ele muda junto.

### Achado 4 — o rascunho da ECR atravessa a troca de conta: **reproduziu**

- **O teste:** `tests/components/PericiaRascunhoEntreContas.test.tsx`, novo.
- **O cenário:**
  1. o `App` de verdade, numa instância só. A conta que revisa abre a ECR 03 e muda um texto;
  2. `SIGNED_OUT`, e depois `SIGNED_IN` de outra conta, com `pode_revisar_ecr` = false;
  3. a outra conta abre o catálogo.
  - O teste confere que a troca aconteceu: o nome da outra conta está na tela, e o da primeira não.
- **Saída:** `{"editor":true,"rascunhoNaTela":true}`. A outra conta vê o editor aberto, com o texto não aprovado da conta anterior, e pode mexer nele.
- **Gravar continua proibido para ela no banco,** pelo contrato; isso não foi medido aqui.

### Achado 5 — a página incompleta de fornecedores solta a trava: **reproduziu no banco falso; o volume real não dá para medir daqui**

- **O teste:** `tests/services/PericiaCargaDeFornecedores.test.ts`, novo.
- **O cenário:** o `carregarDados` de verdade sobre um banco falso que devolve no máximo 3 linhas por consulta.
  - A crua vem pela razão social; a resolvida vem sem ordem, na ordem guardada.
  - A filial bloqueada "Alfa" está na página da crua e fora da página da resolvida.
- **Saída:** `{"acusou":false,"fornecedoresNaTela":["f1","f2","f3"],"travaAoEmitir":"","paginasPedidas":[]}`.
  - O carregador não pediu página seguinte e não acusou nada.
  - A Alfa chega com o bloqueio indefinido, e a trava de emitir a deixa passar ("" = pode).
- **O que não dá para medir daqui:**
  - quantas linhas `core.fornecedores` e `core.fornecedor_resolvido` têm hoje;
  - o limite de linhas da API do projeto.
  - Os dois são do banco. Esta casa não os consulta; se a triagem pedir, é carta ao Banco_de_Dados.
  - Um comentário de 14/09 no código fala em 224 linhas na crua, e isso não foi remedido.

### Achado 6 — o teste das portas não prova a interrupção: **reproduziu, por mutação**

- **A leitura:** as três asserções de `tests/domain/fornecedores.test.ts:267–270` só procuram o texto `travaDaFilial(…'emitir')` antes da gravação. Elas não olham o `return`.
- **A mutação do perito, fora do ramo:** conservei a chamada e tirei só o `return` depois do aviso, em cada porta de emissão. Rodei a bateria inteira e restaurei com o mesmo sha256.

| Mutação | Vermelhos |
|---|---|
| (6a) Emitir na Nova OC: chama a trava, avisa e segue emitindo | nenhum novo |
| (6b) Emitir pelo Histórico: chama a trava, avisa e segue emitindo | nenhum novo |

- Os 5 vermelhos que apareceram nas duas rodadas eram só as medidas desta carta, que estavam vermelhas antes de virarem `it.fails`. Os 368 de antes seguiram verdes: **nenhum teste acusa a porta aberta.**
- **O código de hoje interrompe nas duas portas,** como o perito disse. O achado é sobre a garantia do teste, e ela não existe.
- **Não escrevi medida para o ramo neste achado:** a medida seria o próprio teste de comportamento, que é o conserto, e espera a sua triagem.

### Achado 7 — o histórico no rodapé cobre o conteúdo: **reproduziu, e o efeito é maior que o previsto**

- **O teste:** `tests/services/ecrPdf.test.ts`.
- **O cenário:** o PDF é gerado em memória, e a medida lê a altura de cada texto em cada página.
  - A régua da medida passa com o histórico de uma revisão: a tabela fica a 274 mm do topo, sem cobrir nada.
- **Saídas:**
  - **50 revisões curtas:** `{"paginas":30,"topoDaTabelaNaPagina1":19.2,"paginasComSobreposicao":30}`.
    - A tabela começa a 19,2 mm do topo, em cima do cabeçalho (que vai até cerca de 21 mm), em **todas as 30 páginas**.
    - O corpo, que para a ECR 03 cabe numa página, se espalha por 30.
    - A página 1 não tem **nenhum** texto do corpo.
  - **Uma descrição de 6.000 letras:** 30 páginas, e a tabela começa **68 mm acima da borda de cima**, fora da folha.
  - **Uma descrição de 2.000 letras:** ainda cabe, sem sobreposição.
- A descrição não tem limite de tamanho na tela nem, pelo que o perito leu, no contrato.

## §3 — O que eu não fiz

- **Nenhum conserto,** nem nos achados em que ele parece pequeno (o 4 é uma linha). Todos esperam a sua triagem.
- **Nenhuma consulta ao banco.**
- **A D604 e a D605 foram só copiadas, e não lidas a fundo;** vêm depois desta medida, como a D603 manda. Na minha `Devolucoes` também chegou, pelo Banco_de_Dados, o plano dele para as duas; está lá, sem commit ainda.

## §4 — O que fica de pé

- **A pasta da casa está no `main`**, com as cartas e a perícia. O ramo `d589-editar-ecr` está em `5f287cd`.
- **A cópia `OC_uma-obra`** fica parada em `bfb37be` até a sua triagem e os consertos aceitos. Depois, a máscara vai à perícia própria dela.
- **Nada publicado.**
