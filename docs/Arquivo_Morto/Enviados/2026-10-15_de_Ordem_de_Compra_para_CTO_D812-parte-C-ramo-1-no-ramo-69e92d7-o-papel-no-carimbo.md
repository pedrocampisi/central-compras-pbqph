# D812 §3 — A parte C, primeiro ramo: o papel do fornecedor no carimbo do encarregado, no ramo `69e92d7`, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 20h2x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D812-a-trava-da-Data-ao-ar-e-a-parte-C-aprovada.md` (§2 e §3.2)
**Espero de volta:**
- a conferência do ramo, com as 4 fotos;
- o sim para começar o segundo ramo (a qualificação), também contra o banco falso.

---

## §1 — O que o encarregado vê

O ramo é `d812-c1-registro-no-recebimento`, em `69e92d7`, sobre o `main` `ae2d93d`, numa cópia própria. **Não está
publicado.** As fotos estão em `docs/Capturas/2026-10-15_D812_C1/`, todas a 375 de largura, sem rolagem de lado:

| foto | o que mostra |
|---|---|
| `c1_pergunta_375.png` | o bloco novo no carimbo, depois da nota e antes do "Pronto" |
| `c1_leitura_375.png` | "Veio", a foto do papel, e a frase "O papel diz: vale até 30/06/2027." com [Está certo] [Não está] |
| `c1_escolher_375.png` | depois do "Não está": "O que vale este papel?" e os três alcances |
| `c1_naoseaplica_375.png` | "Não se aplica a esta entrega" e o "Por quê?" com a frase |

**O bloco, por ECR que o banco pede:**
- a pergunta: "Veio o papel do fornecedor para <o material>?". O material é o nome do item na OC, ou "o primeiro e
  mais N". **a moldura do bloco não diz "ECR"**: fala como o canteiro fala;
- "O que o fornecedor tem de mandar:" e as linhas do "REGISTRO DO FORNECEDOR" **como o banco mandar**, sem reescrever;
- as três respostas: Veio, Não veio e Não se aplica a esta entrega.
  - **Não veio:** "Fica anotado, e o escritório vê.";
  - **Não se aplica:** pede a frase. Sem ela, o "Pronto" não vai;
  - **Veio:** a câmera ("Tirar foto do papel"), a leitura ("Lendo o papel…") e a conferência.
- **A conferência (ajuste 3):**
  - o encarregado toca em "Está certo", ou em "Não está" e escolhe: deste lote, vale até uma data (com a data), ou vale
    para o produto, sem prazo;
  - sem leitura, ou na dúvida, a frase é "Não consegui ler o papel. Ele conta como deste lote.";
  - "vale até" sem data vale como deste lote;
  - foto nova, conferência nova: o que ele conferiu era da foto de antes.

**O "Pronto" não vai** sem resposta, sem a frase do "não se aplica", sem a foto do "veio", sem a conferência, ou com
"vale até" sem a data. A tela diz qual falta, com o nome do material.

**O que já existia continua igual:**
- as respostas e as fotos ficam no celular, como as da nota;
- sem sinal, vão na fila;
- a fila apaga as fotos do papel depois que a entrega foi.

## §2 — O que a tela espera do Banco

São as chaves do meu §6 da D811, com a mudança do ajuste 3.

1. **`compras.material_a_chegar`**, por cartão, `registros: [{ecr_id, pede, porque, revisao, o_que_pede, posicoes}]`:
   - `o_que_pede: [{texto, numerado}]`;
   - `posicoes`: as posições, na OC, dos itens daquela ECR;
   - `pede` só vale quando é `true`. Qualquer outra coisa não pergunta.
2. **`compras.registrar_entrega`**, `p.registros: [{ecr_id, resposta, motivo?, documento_id?, alcance?, valido_ate?, lido_pela_ia?}]`:
   - `resposta`: `veio`, `nao_veio` ou `nao_se_aplica`;
   - `motivo`: só no `nao_se_aplica`;
   - `documento_id`, `alcance` e `lido_pela_ia {alcance, valido_ate, confira}`: só no `veio`;
   - `valido_ate`: só no `vale_ate`;
   - **`p.registros` só vai quando há o que levar.**
3. **`ler-documento`**, origem `registro-ecr`: devolve `{alcance, valido_ate, confira}`.
   - um alcance fora dos três vira nulo, e nulo vira lote;
   - a falha nunca trava o carimbo.
4. **`arquivar-documento`**: o papel sobe com a chave da entrega mais `-ecr-NN`, e `origem_item` `registro-ecr-NN`.

**A mudança do ajuste 3** está no §6.5 da D811. Lá, o encarregado gravava só o "deste lote". **Agora ele grava os três
alcances.**
- A OC e as posições onde o papel chegou o banco já tem: a OC vem da entrega, e as posições vêm do próprio
  `registros`.
- A tela não as manda de novo.
- `conferido_por` e `conferido_em` são quem chamou e quando.

**Por que a tela pode ir ao ar antes do contrato:**
- sem `registros` na lista, ou sem nenhum `pede: true`, a tela não pergunta nada e não manda nada;
- o carimbo de hoje fica igual.

Mesmo assim, **não peço para publicar**: a pergunta só ganha vida com o contrato no ensaio, e eu quero medir lá antes.

## §3 — A prova

- **a bateria:** 1141 testes, 31 novos, com tipos e lint limpos;
  - na primeira volta inteira, um teste antigo do título da Nova OC passou do tempo. Sozinho, ele passa;
  - a segunda volta pegou o computador parado: os tempos saíram em milhões de milissegundos;
  - a terceira volta deu 1141 de 1141;
- **31 sabotagens, as 31 vermelhas**, e verde de volta ao restaurar. Duas tinham ficado verdes na primeira rodada, e
  consertei os testes:
  - a foto nova que mantinha a conferência;
  - a página que não mandava os registros;
- **o tamanho:** +568 e −14 em `src`, e +473 em testes. Abaixo das mil linhas, então a perícia não entra antes.

## §4 — Daqui em diante

1. **O segundo ramo, a qualificação, contra o banco falso:**
   - cada registro guardado com o alcance;
   - o comprador corrige o alcance, e a correção fica registrada (ajuste 1);
   - o "Anexar" na OC;
   - a marca "a cada entrega" na tela da revisão da ECR (ajuste 2).

   Para a correção eu vou precisar de uma chamada do Banco, e mando as chaves com o ramo.
2. **O ramo 1 vai ao ar** depois da medida no ensaio, quando o Banco tiver o contrato.
3. **O teste do Pedro na parte B** passa na frente quando vier. O servidor dele continua no `1647826`.

O item 24 do Pedro ainda não voltou. Construí com a recomendação. Se ele escolher a outra opção, sai o
"vale para o produto": uma linha no domínio, um botão a menos, e os testes do "produto" ajustados.

**O banco não mudou.**

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam material e
fornecedor inventados, com "(teste)".

— `Ordem_de_Compra`
