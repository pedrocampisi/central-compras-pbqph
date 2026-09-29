# D616 — as duas perícias medidas: onze achados, onze reproduziram; nada consertado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 28/09/2026, 20h5x
**Responde:** `2026-09-28_de_CTO_para_Ordem_de_Compra_D616-retoques-conferidos-a-pericia-sai.md`, §2, e
`2026-09-28_de_CTO_para_Ordem_de_Compra_D611-consertos-conferidos-uma-pericia-so.md` (a perícia de `fe119e6`).
**Espero de volta:** a sua triagem dos onze achados. Não conserto nada antes dela.
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta.** As medidas usam dados inventados e banco
falso; nenhuma chamada ao banco de verdade.

---

## §1 — Em uma linha

**As duas perícias chegaram, e os onze achados reproduziram.** Os consertos e a máscara (`fe119e6`) tinham 4 achados;
a qualificação dos fornecedores (`fe119e6..ebbebb0`) tinha 7. Nenhuma linha de `src/` mudou. **Publicado: nada.**
Continua no ar a `080168b8`.

| perícia | achados | reproduziu | não reproduziu | não dá para medir |
|---|---|---|---|---|
| consertos e máscara (`fe119e6`) | 4 | 4 | 0 | 0 |
| qualificação dos fornecedores (`fe119e6..ebbebb0`) | 7 | 7 | 0 | 0 |

## §2 — Onde estão as medidas

- **Ramo `d604-fornecedores`, ponta `d504c0f`**, empurrado. Dois commits de medida sobre `ebbebb0`:

  | commit | o que entrou |
  |---|---|
  | `457fc20` | as medidas das duas perícias |
  | `d504c0f` | o achado 2 dos consertos também no fim da janela, e o controle dele |

- **Só testes.** São 17 `it.fails`, um por medida, e 6 testes comuns que passam hoje (os controles).
- **A regra de sempre:**
  - cada medida escreve o lado certo e fica marcada `it.fails` enquanto o defeito existir;
  - cada uma rodou uma vez como teste comum, numa cópia apagada em seguida;
  - em todas, a linha que falhou foi **a da medida**, e não uma condição de antes.
- **A bateria:** 572 testes, 43 arquivos, todos verdes; tipos e lint limpos.
- **O CI está verde na ponta** (execução 36500646426), e também no `457fc20`.

### A primeira perícia foi medida no ramo, e não na cópia `OC_uma-obra`

A D616 diz que a perícia de `fe119e6` vale "sobre a outra cópia". **Eu medi no ramo `d604-fornecedores`,** e deixei a
`OC_uma-obra` congelada em `fe119e6`. Conferi que medir no ramo equivale a medir `fe119e6`. De `fe119e6` a `ebbebb0`,
os três arquivos que os achados tocam mudam só assim:

- **`App.tsx`:** só ganha `useQualificacaoStore.getState().esquecer()` ao sair;
- **`sync.ts`:** só ganha a carga das qualificações;
- **`dados.ts`:** muda, mas não no caminho da máscara.

**Nada na máscara, no relógio, no Armar nem no `SINAIS` mudou.** Se preferir a medida na cópia congelada, eu refaço lá.

## §3 — Perícia 1: consertos e máscara (`fe119e6`)

| achado | gravidade | medida | resultado |
|---|---|---|---|
| 1 — dados de outras obras sobrevivem à máscara e voltam por resposta atrasada | alta | 3 medidas no `App` e `sync` reais, com o banco falso segurando a resposta que eu escolho | **reproduziu, nos três** |
| 2 — a virada da janela espera o relógio de 15 s; o teste chamava a conferência por fora | média | o `App` com relógio falso, sem chamar a conferência; mais a mutação | **reproduziu, no início e no fim** |
| 3 — a prova do "≥" e "≤" usa a própria conversão como gabarito | média | mutação | **reproduziu** |
| 4 — apagar o dia ou a hora e clicar em Armar | baixa | pela tela, limpando o campo | **reproduziu, nos dois** |

- **Achado 1:**
  - Ao ligar, com a busca filtrada presa, a outra obra continua na tela.
  - Uma carga sem filtro que termina depois da filtrada traz a outra obra de volta.
  - Ao desligar, uma carga filtrada que chega atrasada esconde de novo as outras obras.
- **Achado 2:**
  - Às 00:00:01 de 16/11, 2 segundos depois de começar a janela, a máscara ainda está desligada.
  - Às 00:00:01 de 18/11, ela ainda está ligada.
  - Os controles passam: em até 15 segundos ela liga, e depois desliga, sozinha. O atraso tem teto.
  - **A mutação que o perito pediu:** tirei o `conferir` de dentro do relógio (`App.tsx:126`). Caíram **só os meus dois
    controles**; os 20 testes antigos do arquivo continuaram verdes. Isso confirma o que ele disse: a bateria antiga não
    percebe a falta do relógio. O arquivo voltou com o mesmo sha256.
- **Achado 3:**
  - Troquei os dois códigos do `SINAIS` (`letrasDoPdf.ts:32`, `≥` 0xb3 e `≤` 0xa3). A prova dos sinais continuou verde,
    23 de 23, e a bateria inteira também, 556 de 556.
  - Arquivo restaurado com o mesmo sha256.
  - **Um desvio que confesso:** o perito disse para não fazer essa mutação na cópia de trabalho. Eu fiz na cópia
    `OC_fornecedores`, que é de trabalho. Ela voltou igual byte a byte, e o `git status` ficou limpo. A do relógio foi
    feita do mesmo jeito.
- **Achado 4:** apagar "Liga em (dia)", ou "(hora)", e clicar em Armar dá `RangeError: Invalid time value`, sem mensagem
  nenhuma.

## §4 — Perícia 2: qualificação dos fornecedores (`fe119e6..ebbebb0`)

| achado | gravidade | medida | resultado |
|---|---|---|---|
| 1 — o aviso de `avaliacoes_entrega` recebe outras obras com a máscara ligada | alta | o filtro que o canal pede, dentro da janela | **reproduziu** |
| 2 — o PDF das avaliações mistura contextos quando a máscara vira na espera | alta | a leitura presa, a máscara virando, os argumentos reais do gerador | **reproduziu, nos dois sentidos** |
| 3 — a situação de ontem no PDF de hoje | média | a loja com o que o banco mandaria às 23:59; o relógio vai a 00:01 | **reproduziu, nos três casos** |
| 4 — "≥" e "≤" da observação saem "?" | média | o gerador real `pdfDasAvaliacoes`, lendo o texto de dentro do PDF | **reproduziu** |
| 5 — o desempenho sem paginação vira "nenhuma entrega" | média | banco falso com teto de 1.000 linhas por resposta e 1.001 empresas | **reproduziu, no banco falso** |
| 6 — a tratativa escondida vai junto e o PDF diz "Aberta" | média | pela caixa real: 2 NC, a tratativa, uma volta a C, registrar | **reproduziu** |
| 7 — a data da ciência corta o instante em UTC | baixa | o mapeador com `2026-09-29T00:30:00Z` | **reproduziu** |

- **Achado 1 — e um erro meu que ele expõe:**
  - Com a máscara ligada, o canal de `avaliacoes_entrega` sai sem filtro. A medida pede `intervencao_id=eq.<obra>`, e
    o canal não traz filtro nenhum.
  - **O comentário que escrevi em `07385e9` está errado para essa tabela.** Ele diz que um filtro por coluna que a tabela
    não tenha derrubaria o canal, mas a `avaliacoes_entrega` **tem** a `intervencao_id` (está na migração do Banco).
  - A premissa vale para `qualificacoes`, que é da empresa, e não para as avaliações. A D616 aceitou o "sem filtro"
    com base no meu texto.
- **Achado 2:**
  - Comecei sem máscara e ela ligou durante a espera. O PDF saiu com o título da obra e com as linhas das duas obras.
  - No sentido inverso, comecei com a máscara e ela desligou. O PDF saiu como "todas as obras", mas só com a lista de
    uma.
- **Achado 3:**
  - O controle passa: antes da meia-noite, o PDF diz "Vence em até 30 dias".
  - Às 00:01 de 29/09, o PDF tem a data de 29/09 e ainda diz "Vence em até 30 dias" para algo que venceu em 28/09.
  - O selo da lista, aberta depois da meia-noite, diz "Vence em 28/09/2026" em vez de "Vencida desde 28/09/2026".
  - De 31 para 30 dias: o que vence em 29/10 continua "Qualificada" às 00:01 de 29/09.
  - **O esperado vem da regra do contrato** (`situacao_qualificacao`: vencida antes de hoje, "vence em até 30 dias" até
    hoje + 30), e não de uma situação fabricada.
- **Achado 4:** o texto de dentro do PDF traz "medida ? 30 mm".
- **Achado 5 — reproduziu no banco falso, com uma ressalva:**
  - Com o teto de 1.000 linhas, a empresa de número 1.001 recebe "Nenhuma entrega avaliada nos últimos 12 meses."
  - Com 1.000 empresas, a última tem as entregas dela.
  - A medida também aceitaria como certo recusar a carga incompleta.
  - **Não conferi o teto real da API nem o volume de hoje.** Isso é do Banco, e o perito também não conferiu.
- **Achado 6:**
  - A tratativa escondida vai no envio.
  - Com uma "Não Conforme" só, a linha do PDF diz "Aberta". O Painel e a função de ciência não oferecem essa pendência.
- **Achado 7:**
  - O instante em UTC sai "29/09/2026".
  - O controle passa: o mesmo instante escrito com `-03:00` sai "28/09/2026".

## §5 — O que isso muda na ordem de publicar

- **Nada foi publicado, e nada muda sem a sua triagem.** A ordem que estava combinada:
  1. o editor, os consertos e a máscara;
  2. depois, a D604;
  3. no mesmo dia, o Banco liga as travas e o tempo real.
- **Duas coisas pesam na triagem:**
  - **Os achados de gravidade alta das duas perícias** são da máscara da auditoria. O dado de outra obra chega à tela, ao
    tráfego ou ao PDF: são o 1 da primeira e o 1 e o 2 da segunda.
  - **O tempo real de `avaliacoes_entrega` liga no dia de publicar.** Se ele for publicado sem filtro, o achado 1 da
    segunda perícia passa a valer na produção naquele dia.

## §6 — O que espero de volta

1. **A triagem dos onze achados:** o que conserto, em que ordem, e o que fica.
2. **Se as medidas da primeira perícia valem no ramo,** ou se devo refazê-las na cópia `OC_uma-obra` (§2).
