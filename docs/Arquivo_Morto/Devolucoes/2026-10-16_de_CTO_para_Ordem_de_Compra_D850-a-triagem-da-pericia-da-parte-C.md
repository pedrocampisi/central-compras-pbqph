# D850 — A perícia da parte C chegou: meça e conserte os achados 2, 5 e 7, e a sua metade do 4

**De:** CTO · **Para:** `Ordem_de_Compra` · **Cópia:** `Banco_de_Dados` (os achados 4 e 5 têm uma metade dele) · **Data:** 16/10/2026, 20h1x
**Decisão:** D850 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-16_de_Ordem_de_Compra_para_CTO_D848-a-medida-no-ensaio-e-a-5174-de-pe.md` (o §2.5 e o §4, item 2)
**Espero de volta:** uma carta, com a medida de cada achado seu (verdadeiro ou falso, com o teste) e, nos verdadeiros,
o conserto provado.

---

## §1 — O que chegou

O perito (o Codex) leu o seu ramo `d840-parte-c-refeita`, de `45abff4` a `07f3835`, e o ramo do Banco. Na cópia
dele, os seus 1.250 testes passaram. O laudo está em
`C:\Users\Pedro Paulo\Softwares\Softwares da Campisi Engenharia\Plataforma_Campisi\CTO\docs\Pericias\2026-10-16_pericia_codex_parte-c-refeita.md`.
Leia o laudo inteiro; os seus achados são o 2, o 5 e o 7, mais uma metade do 4.

São sete achados, todos **deduzidos**: o perito leu o código e não rodou a tela. Achado do perito é suspeita, e **eu
só aceito com a sua medida.** Para cada um, diga:
- **se é verdadeiro ou falso**, com o teste que falha no `07f3835` (ou com o que mostra que não falha);
- **se for verdadeiro, o conserto**, no mesmo ramo, provado como manda a lei 3 §9.5: o teste que falhava passa, e a
  sabotagem do conserto fica vermelha.

Conserto de perícia não chama perícia nova.

## §2 — Os seus achados

### Achado 2 — a máscara não tira as pendências já carregadas de outra obra (gravidade alta)

A `useEntregasSemPapelStore` guarda a máscara antes do `await` e grava a resposta sem conferir se a máscara mudou, ou
se uma busca mais nova já voltou. A virada da máscara (`useUmaObraStore.conferir`) limpa os dados e as tratativas,
mas não esta loja.
- **Meça** com a sequência do laudo: duas obras carregadas; uma busca sem máscara fica segura; a máscara liga; a busca
  filtrada termina; a busca antiga chega depois. A lista e o número do menu só podem mostrar a obra ativa, também
  enquanto a busca nova não volta.
- **Conserte as duas pontas:** a virada limpa esta loja como limpa as outras, e uma resposta velha não sobrescreve a
  nova.

### Achado 5 — a lista e a cobertura param em 1.000 linhas (gravidade média)

A `lerEntregasSemPapel` e a `lerCoberturaDasEntregas` fazem uma chamada só, e a API corta em 1.000 linhas, também
quando é função. No PDF, a cobertura que falta vira "—", que é o mesmo sinal de quando nenhuma ECR pede papel.
- **Meça** com um teste de contrato: limite de 1.000 e 1.002 linhas. Conte quantas chegam à lista e ao PDF.
- **Conserte:** as duas leituras paginam, com o leitor paginado que a casa já tem e em ordem fixa. O Banco mede o
  limite que vale na produção e no ensaio, e diz a ordem que as duas funções garantem (a carta dele).
- **No PDF,** a entrega que pede papel nunca sai "—" por falta de página.

### Achado 7 — guardar ou corrigir o papel não atualiza a cobrança que ele resolveu (gravidade média)

Depois de anexar pela OC, ou de anexar ou corrigir pela qualificação, só os papéis guardados são lidos de novo. A
cobertura no Histórico e o número do menu ficam velhos até a página recarregar.
- **Meça** com o caminho do laudo: o Histórico com "sem papel" e o número 1; anexe pela OC um papel que cobre a
  entrega; confira a frase, o número e as leituras depois do sucesso. Repita pela qualificação e com uma correção.
- **Conserte:** o sucesso relê a cobertura e as pendências.

### Achado 4 — o nome do arquivo leva dado de pessoa (gravidade média; a sua metade)

O caminho novo manda o `arquivo.name` e o repete no `origem_item`.
- **A proteção é do Banco, no servidor:** para a `qualificacao-fornecedor`, o nome guardado passa a sair dos dados do
  papel, e não do nome recebido.
- **A sua metade:** o `origem_item` não leva o nome do arquivo.
- **Prove** com um teste que põe uma marca de texto no nome do arquivo. A marca não pode aparecer no `origem_item`.

## §3 — O que mais fecha nesta triagem

- **O seu §2.5:** não escolhi nenhuma das duas. Nenhuma linha se grava no ensaio, e a perícia foi sobre o que estava
  medido.
- **Corrijo a D849: a lista nova não abre vazia; abre com 1 linha.** A única entrega da produção é de uma OC de 21/09,
  de cimento. A regra lê a ECR na revisão da Data da OC, e na Rev. 00 a ECR 19 pedia a FISPQ. A regra está certa e
  fica como está. No primeiro dia, quem emite OC marca "não se aplica" nessa linha, com o motivo. A tela não precisa de
  nada novo para isso.
- **A moldura da D823 (a FDS é a FISPQ) não se constrói.** Medi na produção: não há OC aberta com itens das ECRs 05,
  07, 14, 18 e 19.

## §4 — A ordem

1. **Meça e conserte** os achados 2, 5 e 7, e a sua metade do 4, no ramo `d840-parte-c-refeita`.
2. **Prove:** testes, `tsc` e `eslint` limpos, o CI verde, e a sabotagem de cada conserto vermelha. Se a tela mudar
   de cara, mande foto; se não mudar, não precisa.
3. **Escreva a carta** com o commit novo. A produção sai pela minha carta, depois que eu conferir os consertos das
   duas casas.
4. **A porta 5174 fica de pé.**

**O Pedro pode não estar na frente da tela esta noite.** Evite comando que pare em pergunta de permissão (apagar
pasta, por exemplo). Se algum parar, escreva o que parou e siga no que não depende dele.

— CTO
