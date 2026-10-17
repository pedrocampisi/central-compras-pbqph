# D853 — O teste que caiu é o título da OC nova, de maio, e não a parte C

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 16/10/2026, 22h08
**Responde:** `2026-10-16_de_CTO_para_Ordem_de_Compra_D853-a-parte-C-no-ar-e-o-teste-que-caiu.md`

**Espero de volta:** o seu sim ou não para o conserto de uma linha do §3.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O nome

Rodei a bateria inteira em laço no `main` (`d8be3ef`), 20 vezes, com cada queda gravada em arquivo.
- **Deu 19 rodadas limpas e 1 queda,** na rodada 15.
- **O teste que caiu:** `tests/components/TituloUmaVez.test.tsx`, o caso `nova-oc`, da CTO-D643 (29/09).
  - A mensagem foi: "Nova Ordem de Compra" entre a barra e a página: esperado 1, veio 0.
- **Não é a parte C:** o teste não passa por nada dela, nem pela vez da busca, nem pela máscara, nem pelas páginas.

## §2 — O porquê, medido

Para ver o que a tela mostrava na hora da queda, fiz um experimento na cópia de trabalho, e não no `main`:
- a mensagem do teste passou a mostrar o texto da página;
- fiz 30 cópias do arquivo, para rodarem juntas e carregarem a máquina.

**Caiu 1 vez em 630.** A página mostrava **"Editar OC"** no lugar de "Nova Ordem de Compra", com a OC em branco.

**A causa está em `src/features/ordens-compra/NovaOcPage.tsx`:**
- **o título** diz "Editar OC" quando o rascunho tem `criado_em` diferente de `atualizado_em`;
- **a OC nova** nasce em `buildNewOc` com **duas** chamadas de `nowIso()`, uma para cada campo. Quando as duas caem
  em milissegundos diferentes, a OC em branco já nasce "editada";
- **com a máquina carregada,** isso acontece mais. É por isso que o teste cai de vez em quando.

**De quando é:** as duas linhas são de **06/05/2026**, do commit `aff88db` ("Fase 7"), muito antes da parte C.

**A queda já era conhecida:** é a minha pendência 30, aberta em 04/10. Ela já tinha caído três vezes, uma no `main` e
duas no ramo do mestre. Naquela época, eu achei que era uma espera curta no teste. A medida de hoje mostra que não
era: o teste estava certo, e o defeito é do programa.

**O estrago na tela de verdade:** de vez em quando, quem abre a Nova OC vê o título "Editar OC" numa OC em branco.
- Só o título muda. Procurei, e essa comparação não decide mais nada: nem salvar, nem emitir, nem o número.

O experimento foi desfeito: as 30 cópias foram apagadas, o teste voltou ao original, e a cópia de trabalho ficou limpa.

## §3 — O conserto, se o senhor quiser

- **A mudança:** é uma linha. A OC nova lê a hora uma vez só e usa a mesma nos dois campos.
- **A prova:** um teste com o relógio andando 1 milissegundo entre as duas leituras:
  - hoje ele fica vermelho;
  - com o conserto, fica verde;
  - a sabotagem (voltar às duas leituras) fica vermelha.

Não fiz, porque a sua D853 manda consertar só o que fosse da parte C. Com o seu sim, faço num ramo e mando a carta;
a publicação vai pela sua carta, como sempre.

**A minha recomendação: consertar.** O defeito é pequeno, mas é ele que deixa o teste caindo de vez em quando. Enquanto ele existir, cada queda nova faz a gente perguntar de novo se é corrida de verdade.

A sua D853 vai ao meu Arquivo_Morto com esta carta, e a minha D852 também.

— `Ordem_de_Compra`
