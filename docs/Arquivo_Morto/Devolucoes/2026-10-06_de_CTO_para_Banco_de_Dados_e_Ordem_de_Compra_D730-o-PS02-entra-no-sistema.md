# D730 — O PS.02 entra no sistema e vira o manual de compras

**De:** CTO · **Para:** `Banco_de_Dados` e `Ordem_de_Compra` · **Data:** 06/10/2026, 11h0x
**Decisão:** D730 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o procedimento de compras que a auditoria de 16/11 lê)
**Espero de volta:** de cada casa, o plano em até dez linhas **antes de começar**, dizendo o que leu do HTML.

O Pedro, na minha janela:

> "acho que seria interessante trazer a PS.02 para o sistema né? E atualizar ela. Para ela servir como um Manual"

E, à minha proposta: "pode mandar".

O caminho é o das ECRs: D586 (palavra por palavra), D588 (o sistema é o que vale, com histórico) e D589 (só o Pedro
revisa; o PDF). Releiam as três antes do plano.

## §0 — Por quê

1. **O "?" da D728 é cópia do PS.02.** Cópia envelhece calada. Com o procedimento no sistema há um texto só.
2. **O PS.02 descreve um processo que já mudou:**
   - diz que o registro é a FO 8.4.1.1, aposentada pela D604;
   - diz que o recebimento é por "formulário digital ou bot", e hoje é o app do mestre e o "Entregue";
   - não fala da trava da emissão;
   - manda para o "item 6", e os laboratórios são o item 5.
3. **O auditor de 16/11 confere o procedimento contra a prática.**

## §1 — A fonte

- **O arquivo:** `C:\Users\Pedro Paulo\Dropbox\SGQ - Campisi\11 - PS - Procedimento Sistêmico\PS.02 - PS - Procedimento Sistêmico - Aquisição.html`
  - 41.584 bytes, gravado em 29/09 às 19:18;
  - o sha256 começa por `bf295a90ff8eede3`. A digital inteira vai no cabeçalho da migration.
- **As versões da subpasta Arquivo Morto são velhas:** não entram.
- **É um documento editável.** Tem os botões Salvar Rascunho, Salvar revisão, Restaurar e Imprimir, e guarda
  rascunho no navegador (localStorage, regra do AGENTS.md do SGQ).
  - **A carga é o ARQUIVO, nunca um rascunho de navegador.**
  - Os textos dos botões não são conteúdo.
- **O que é conteúdo:**
  - o cabeçalho: código, revisão vigente, data, responsável, referência e escopo;
  - o "Como usar";
  - o fluxo didático das cinco categorias e a sequência mínima;
  - as seções 1 a 7, com as tabelas;
  - **o "?" de cada seção** (o texto dele é conteúdo e entra);
  - a tabela de revisões e a nota "Conteúdo preparado para a próxima revisão formal...".
- **A revisão vigente é a Rev. 00 de 31/08/2026.** Ela entra como está, com a nota, sem consertar nada (nem o "item
  6"). Consertar é a Rev. 01.
- **Os nomes da tabela de revisões** entram no histórico do banco, pela regra da D588: com o HTML aposentado, não
  sobra outro registro. Em carta, nunca.

## §2 — Banco_de_Dados

1. **Duas tabelas:**
   - o procedimento: código, título, revisão, data, e as seções com âncoras estáveis por item e por linha de tabela;
   - o histórico, com o texto inteiro de cada revisão, como em `compras.ecr_revisoes`.

   O esquema deve servir também aos outros PS (o PS.01, o 03 e o 04 podem vir um dia). O nome é seu.
2. **A carga fiel:**
   - um programa que lê o HTML e dá 0 diferenças no ensaio e na produção, com a sabotagem que prova que ele morde;
   - o mesmo programa diz se o arquivo do Dropbox mudou depois da carga.
3. **A trava:**
   - o texto e a revisão só se gravam por migration ou pela única porta de revisar;
   - só o Pedro revisa, a mesma regra da D589 (aproveite a de `core.pode_revisar_ecr`);
   - o histórico não tem escrita para ninguém.
4. **A leitura:** quem entra na OC lê. É o manual da equipe.
5. **Ensaio primeiro.** A produção vai por carta minha, com o desfazer provado (emenda 4) e o código que roda lá.

## §3 — Ordem_de_Compra

1. **A página "Procedimento de Compras (PS.02)",** no menu, ao lado do Catálogo de ECRs.
   - Mostra: o cabeçalho, as seções, as tabelas, os "?" das seções e o histórico no fim.
   - Lê-se como manual: título, subtítulo e contexto (D475).
   - A estrutura é a do HTML do SGQ; a cara é a da OC.
2. **O PDF parecido com o documento,** como o da ECR (D589).
3. **O "?" das telas (D728)** ganha o caminho para o item ("ver no PS.02, item 2"), que abre a página no lugar
   certo. O texto do "?" fica como está até a Rev. 01.
4. **Ramo, bateria, fotos a 1366 e a 375, a minha avaliação.** Publique só com as tabelas do Banco na produção:
   migration e ramo são um par (D433).

## §4 — Depois: a Rev. 01, o manual

Isto começa só com a Rev. 00 e a página no ar. Antes, nada.

1. **A OC escreve o rascunho da Rev. 01:** o PS.02 dizendo o que o sistema faz hoje, como manual (o que fazer, em que
   tela).
   - Cada mudança vai marcada, com o motivo.
   - **Nenhum requisito do SiAC da Rev. 00 sai.** Se o rascunho tirar um, ele vai marcado em vermelho para o Pedro.
2. **As mudanças já conhecidas:**
   - a FO 8.4.1.1 vira a tela Qualificação;
   - o recebimento vira o app do mestre e o "Entregue" com a avaliação;
   - a trava da emissão;
   - as ECRs viram o Catálogo de ECRs;
   - o "item 6" vira "item 5";
   - as 5 diferenças da D729: o rascunho propõe um texto só para o critério e a pergunta, e o Pedro escolhe.
3. **Eu confiro o rascunho** contra a Rev. 00 e contra o sistema (o que o texto diz que o sistema faz, medido). Depois
   o Pedro senta e aprova.
4. **Como a Rev. 01 entra no banco**, com o nome dele como quem aprovou, decide-se nessa hora.
5. **Com a Rev. 01 no ar,** o "?" das telas lê o texto do procedimento pela âncora. Fica um texto só.

## §5 — Prazos, tamanho e o Dropbox

- **As metas:**
  - a Rev. 00 e a página no ar, até 13/10;
  - o rascunho da Rev. 01, até 23/10;
  - tudo antes do ensaio de 09/11.
- **O tamanho:** contem as linhas. Passando de mil linhas novas de código somadas (sem os testes), há perícia antes da
  produção (capítulo 9 da lei 3).
- **O HTML do Dropbox:** ninguém mexe nele até o fim. Depois da Rev. 01 aprovada, uma carta minha manda pôr o PDF na
  pasta e o HTML no Arquivo Morto, pelas regras do AGENTS.md do SGQ.
- **A pausa da OC** abre só para esta lista.
- **Nada inventado:** o que o HTML não diz, o sistema não diz.

— CTO
