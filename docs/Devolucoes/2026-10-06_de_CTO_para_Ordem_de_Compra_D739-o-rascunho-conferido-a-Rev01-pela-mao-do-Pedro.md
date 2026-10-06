# D739 — o rascunho da Rev. 01 conferido: uma frase a consertar; a Rev. 01 entra pela mão do Pedro

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 06/10/2026, 16h4x
**Decisão:** 739
**Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Responde:** `2026-10-06_de_Ordem_de_Compra_para_CTO_D738-o-rascunho-da-Rev01.md`
**Espero de volta:** uma carta com o rascunho consertado (§2), a página do rascunho com o botão (§4), o teste, o CI
e as fotos, **antes de publicar**.

---

## §1 — A conferência

**A forma.** Medi com a peça real do Banco, por SELECT na produção. Ela não escreve nada.
- `core.procedimento_fora_da_forma`: **null**.
- 61 âncoras, eram 59. Nenhuma sumiu. As duas novas: `objetivo.q1.i4` e `qualificacao.p3`.

A sua tradução local acertou. Agora a prova é a peça mesmo.

**O texto.** Li as 36 diferenças entre a Rev. 00 e o rascunho, âncora por âncora.
- **Nenhum requisito do SiAC sai.**
- A regra dos 12 meses fica mais dura, e o banco faz isso mesmo: `vence_em` é gerado, 12 meses para toda categoria.
- Os três pontos da D732 §4 estão lá.

**O sistema, medido** no banco da produção (funções, views, checks) e na sua `main`. Bate:
- a trava da emissão: o gatilho só deixa emitir com "qualificada" ou "vence em 30 dias", e com todas as ECRs
  cobertas;
- o "Qualificar agora";
- o aviso dos 30 dias;
- a tratativa obrigatória com 2 ou mais "Não Conforme", no check e na função;
- a ciência só por quem revisa ECR;
- o mestre e o escritório gravando pela mesma função;
- o sem pedido ligado a uma OC ou descartado com o motivo;
- a qualificação da empresa valendo para as filiais;
- os mestres geridos pela engenharia;
- os PDFs;
- as entregas de 12 meses na caixa de qualificar.

## §2 — A frase a consertar: a nota

"Com a foto ou o número da nota" aparece em dois lugares: no quadro do mestre (`objetivo.q1.i4`) e nos materiais do
item 4 (`avaliacao.q1.i1`). **Na entrega da OC não é assim:**
- o número é sempre exigido: o banco recusa sem ele ("Falta o numero da nota");
- a foto é opcional, e serve para o app ler o número, que o mestre confere;
- "foto **ou** número" é a regra do sem pedido.

Escreva, nos dois lugares, que o número da nota é registrado, e que o app pode ler o número da foto. Conserte pelo
script, que confere o "antes".

## §3 — As 7 escolhas não vão ao Pedro

Todas já estavam decididas:

| | Quem decidiu |
|---|---|
| M17 a M20 | as 5 perguntas da D729: levei ao Pedro com "recomendo deixar", e a D730 ("pode mandar") as pôs na Rev. 01. São as da própria planilha FO 8.4.1.1 (D604) |
| M21 | a D606 §2: o laboratório segue o PS.02, basta um enquadramento |
| M29 | a D604 aposentou a planilha |
| M12 | a D589: só o Pedro revisa; a §4 torna o "revisa este procedimento" verdade |

Fica no rascunho a opção (a) de cada uma. No `MUDANCAS_REV01.md`, troque o título "7 escolhas do Pedro" por "7
pontos já decididos", com a decisão de cada um. Na sentada, o Pedro lê o texto inteiro e pode recusar qualquer frase.

## §4 — Como a Rev. 01 entra (a D730 §4.4): pela mão do Pedro

Na página do PS.02, **só para quem revisa ECR** (a mesma regra do "Editar" do Catálogo):

1. **O rascunho, desenhado como a página.** Os blocos que mudaram vêm marcados, pela comparação por âncora com a
   revisão vigente, para ele ler só o que mudou. O motivo de cada mudança fica à mão, curto, no "?" que a casa já
   usa.
2. **O botão "Gravar a Rev. 01".**
   - Ele chama `core.revisar_procedimento('PS.02', '00', documento, descrição)`.
   - A descrição tem até 500 caracteres; o quadro "Conteúdo desta revisão" é uma boa base.
   - Antes de gravar, uma pergunta: "Gravar a Rev. 01? Ela passa a valer hoje e entra no histórico."
3. **Depois de gravada,** a página mostra a Rev. 01. O rascunho sai na publicação seguinte.

**Por quê:**
- o histórico registra quem aprovou pela sessão dele, sem migration escrevendo o nome de ninguém;
- "gravar a revisão é aprová-la" (M33) e "revisa este procedimento" (M12) passam a ser verdade ao pé da letra;
- a sentada e a aprovação viram um ato só;
- a Rev. 02 segue o mesmo caminho;
- a porta já existe e passou na perícia.

**As regras:**
- O `documento` é o que o script gera, com o conserto da §2. Ninguém o edita à mão.
- **O teste:**
  - o rascunho passa no seu verificador;
  - o botão chama a porta com `'00'`;
  - quem não revisa ECR não vê o rascunho nem o botão.
- **As fotos:** a 1366 e a 375, clara e escura, locais, com o dado de teste. Sem o login do Pedro (D536).
- **O CI verde.**
- **Se passar de mil linhas novas de código,** sem contar testes, me avise antes de publicar: aí é perícia.
- **Nada publicado** antes da minha conferência das fotos. Depois, você publica (emenda 3), eu confiro por fora, e só
  então o Pedro senta.

— CTO
