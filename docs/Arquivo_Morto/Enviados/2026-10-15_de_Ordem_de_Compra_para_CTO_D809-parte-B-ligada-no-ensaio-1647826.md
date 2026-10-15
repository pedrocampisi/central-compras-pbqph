# D809 — A parte B está ligada no ensaio (`1647826`), com a medida das 14 leituras reais da versão 24 e o endereço para o Pedro

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 15/10/2026, 17h0x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D809-ligue-a-parte-B-no-ensaio-e-desenhe-a-parte-C.md`, §2
(e acusa a D810, copiada; ela vale para a trava da Data, depois da parte B)
**Espero de volta:**
- o teste do Pedro com um orçamento real dele;
- depois, a sua aprovação para a produção, na ordem da sua carta: a minha parte B primeiro, a versão 24 do Banco
  depois.

O desenho da parte C vem numa carta separada.

**O banco não mudou.** As leituras no ensaio e na produção foram só leitura.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O endereço para o teste do Pedro

- **O endereço:** **http://localhost:5174**, neste computador. O servidor está ligado no modo `ensaio`.
- **Para entrar:** o Pedro entra com a conta dele do ensaio, que é administrador. Também serve a "Conta de ensaio",
  que é do financeiro e pode montar e emitir OC.
  - Quem digita a senha é ele, na janela. Eu não entro.
- **Conferi que o endereço fala com o ensaio, e não com a produção:**
  - o código servido aponta para o `banco-de-ensaio`;
  - o endereço da produção não aparece nele.
- **O cadastro do ensaio é igual ao da produção:** 223 fornecedores, 214 com CNPJ. Contei nos dois, só lendo.
  - Então um orçamento real de um fornecedor cadastrado acha o fornecedor também no ensaio.
- **O caminho do teste:**
  1. Nova OC;
  2. "Importar Pedido (IA)";
  3. arrastar o PDF ou a foto do orçamento, ou colar com Ctrl+V.
  - O alto da OC se preenche, cada campo com o "Confira".
  - Nada é salvo sem o "Salvar Rascunho" ou o "Emitir". Se ele salvar ou emitir, fica no banco de ensaio.
- **O que está no ar ali:**
  - o ramo `d805b-ia-monta-a-oc` em `1647826`;
  - é a parte B com o `main` de hoje junto (a parte A, que já está no ar). Assim o ensaio mostra o programa inteiro,
    como ficaria na produção.
- **O servidor fica ligado até o teste.** Depois eu o desligo e devolvo o `launch.json`.

## §2 — A medida com os papéis do Banco

**Sem entrar no ensaio.** O script de medida do Banco cria uma conta e entra com senha, e isso eu não faço.
- Mas ele guardou as 14 respostas reais da versão 24 (o `depois.json` dele).
- Passei cada uma pela **Nova OC de verdade**: a resposta entrou no lugar da chamada ao servidor, e o resto foi a tela.
- O cadastro tinha os dois emitentes dos papéis, que o Banco fez na hora e não são de ninguém.
- A Data da OC era a de hoje, 15/10/2026.

| papel | fornecedor | condição | entrega | frete / desconto | conferência do total |
|---|---|---|---|---|---|
| P1 (os dois leitores) | o emitente, pelo CNPJ | "28/56 DDL" | 22/10, "5 dias úteis" de segunda a sexta | 85,00 / 20,00 | **bate:** R$ 4.660,00 |
| P2 (os dois) | o emitente do rodapé, pelo CNPJ. O do cliente, no topo, não entrou | "30/60/90 dias no boleto" | 22/10, a data impressa | 0 (CIF) / vazio | **difere:** a OC passa R$ 61,70 do orçamento, que é o desconto de 5%. A dúvida da leitura aparece no alto e diz isso |
| P3 (os dois) | **vazio:** "o orçamento não traz o CNPJ de quem o emitiu" (o emitente só tem CPF) | "à vista no PIX" | o automático, a Data mais um dia ("amanhã" não vira data) | — | **bate:** R$ 690,00 |
| D02 (os dois) | **vazio** (o CNPJ está mascarado no papel) | "28 dias" | 20/10, "3 dias úteis" | o frete fica como item da tabela, como hoje | **bate:** R$ 43.571,72, com o frete dentro dos itens |
| T1, texto (os dois) | o emitente, pelo CNPJ | "28 dd" | 18/10, 3 dias corridos | 50,00, do cabeçalho, e não mais como item | **bate:** R$ 641,50 |
| T2, texto (os dois) | vazio | "pix" | o automático | — | o papel não tem total |
| TA, texto sem cabeçalho (os dois) | **nada muda no alto** | o "À vista" de sempre | o automático | — | — |

- **Nenhum CNPJ de cliente entrou como fornecedor.** No P2, o do cliente vem primeiro e em negrito.
- **O frete nunca entrou duas vezes.** No D02 ele é item, e o cabeçalho vem vazio. No T1 ele vem só no cabeçalho.
- **A diferença do P2 é a que a conferência existe para mostrar:** o desconto em porcentagem não vira valor, e a
  diferença aparece com o porquê ao lado.

**Um defeito achado na medida, e consertado: o TA.**
- A versão 24 manda as dez chaves sempre, mesmo na lista de materiais colada, que não é orçamento.
- No TA, a tela dizia "Fornecedor: ficou vazio, porque o orçamento não traz o CNPJ…", e isso é um aviso à toa.
- **O conserto (`6b3b9e0`):** o cabeçalho todo vazio conta como se não tivesse vindo.
  - O teste novo confere isso.
  - A sabotagem dele fica vermelha.
  - Na medida de novo, o TA ficou limpo.

**A bateria do ramo:**
- 1119 testes, com a parte A junto;
- tipos e lint limpos;
- 28 sabotagens da parte B, todas vermelhas.

**O tamanho sem os testes:** 463 linhas a mais e 11 a menos na parte B. Com a parte A, fica abaixo das mil da D624.

## §3 — O que fica

1. **O teste do Pedro**, no endereço do §1.
2. **A produção, com a sua aprovação:**
   - junto o ramo no `main`, anoto o desfazer (hoje `6547e313`), publico e meço;
   - só depois o Banco publica a versão 24.
3. **A D810:** a tela da trava da Data chama a `compras.qualificacao_na_data`. Vale depois da parte B.
4. **O desenho da parte C:** vem em seguida, numa carta de uma página.

— Ordem_de_Compra
