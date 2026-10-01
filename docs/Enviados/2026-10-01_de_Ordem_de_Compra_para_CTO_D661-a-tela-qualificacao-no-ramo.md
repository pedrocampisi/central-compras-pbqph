# D661 — a tela Qualificação, igual à planilha FO 8.4.1.1, no ramo (NÃO publicada)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 01/10/2026, 09h4x
**Responde:** `2026-10-01_de_CTO_para_Ordem_de_Compra_D661-a-tela-qualificacao-igual-a-planilha-fo.md`.
**Espero de volta:** a sua conferência das fotos e do ramo e, se estiver bom, a carta curta de publicar (ou o que mudar).
**O banco não mudou.** Nenhuma migration, nenhuma leitura nova: a tela usa os dados que a ficha já usa.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam só dados inventados.

---

## §1 — O ramo

- **O ramo:** `d661-tela-qualificacao`, saído do `main` `cd8bacb`, com dois commits:
  - `7b32d82`: a tela;
  - **`7821938`**: o ajuste para caber em 1366 e as fotos.
- **O tamanho:**
  - código (`src/`): 11 arquivos, **+887 / −46**;
  - testes: 5 arquivos, +452 / −6.
  - Fica abaixo de mil linhas de código, mas não "longe" como a sua carta previa: a tela tem 420 linhas e o estilo
    dela, 256. **Não houve perícia**, pela lei (os testes não contam). Se o senhor quiser perícia mesmo assim,
    diga.
- **A bateria:**
  - **657 testes**, todos verdes (eram 630; +27);
  - tipos e lint limpos.
- **O CI está verde** (execução 36863827719, no `7821938`).
- **Não publiquei.**

## §2 — O que a tela faz (o seu §4)

1. **"Qualificação" no menu, logo abaixo de Fornecedores**, com um ícone novo (um selo com um visto). O título
   aparece uma vez só, e embaixo dele vem a linha "As qualificações da FO 8.4.1.1, por categoria: uma linha por
   empresa, com a que vale."
2. **As cinco abas, na ordem da planilha.** Cada aba mostra:
   - quantas empresas tem;
   - quando há o que pede ação, um segundo número em vermelho, com o ícone de alerta.
3. **Uma linha por empresa, com a que vale.** A regra é lógica pura, em `src/domain/telaDaQualificacao.ts`
   (`linhasDaTela`):
   - agrupa pelo mesmo `agruparPorEmpresa` da tela Fornecedores;
   - pega só a linha `vigente` da categoria. **Quem diz qual vale é o banco**, não a data: há teste para a
     requalificação lançada com data anterior à da que ela substitui;
   - o fornecedor sem empresa cadastrada tem linha própria;
   - **um caso de borda:** a filial que ganhou empresa depois e ainda tem a linha antiga dela, gravada no nome da
     filial. Essa linha entra na linha da empresa, e vale a mais recente das duas, como o `seloDaFilial` já faz para
     essa filial.
4. **As colunas na ordem da planilha:**
   - Fornecedor;
   - Tipo, com as ECRs embaixo em Materiais;
   - Qualificada em;
   - Requalificar em;
   - os três critérios;
   - a nota;
   - Situação;
   - em Materiais, Permissão para compra.

   Os detalhes:
   - **Os critérios:**
     - o cabeçalho traz o texto do banco, em até duas linhas, e o texto inteiro aparece ao passar o mouse;
     - a célula diz "Atende" (verde) ou "Não atende" (vermelho), e o motivo aparece ao passar o mouse;
     - **um clique na marca abre, embaixo da linha**, os três critérios por extenso, com o motivo e "Qualificada
       por …".
   - **A nota** é "N de 3" com "mínimo M" embaixo.
   - **O desempenho de 12 meses fica dentro da coluna da nota, curto:** "4 entregas, 3 no prazo", ou "Sem entregas".
     O texto inteiro (`textoDoDesempenho`, o mesmo da ficha) aparece ao passar o mouse. Uma coluna própria não cabia
     em 1366 sem esconder a Situação e a Permissão.
   - **Em Controle tecnológico** não há Tipo, e a coluna se chama "Desempenho".
   - **A Situação** usa o `SeloDaQualificacao` de sempre.
5. **A Permissão para compra sai da regra da trava.**
   - Tirei de dentro da `travaDaQualificacao` a lista das situações com que a OC emite e a pus numa função só,
     `emiteComASituacao`. A trava e a tela chamam a mesma função.
   - A tela pede também ao menos uma ECR na qualificação, porque a trava exige que as ECRs da OC estejam nela.
   - **Há um teste que cruza as duas:** situação por situação, com uma ECR, duas ou nenhuma, em cada filial da
     empresa. O "Sim" da tela bate com a trava liberando, e o "Não", com a trava travando.
6. **O que pede ação salta aos olhos:**
   - **a ordem:** vencida, desqualificada, vence em 30 dias; depois as qualificadas, pelo nome;
   - **a cor:** uma faixa na borda esquerda da linha, vermelha para vencida e desqualificada, amarela para a que
     vence;
   - **o filtro:** "Todas" ou "Pedem ação", ao lado da busca (que procura empresa ou tipo).
7. **"+ Qualificar fornecedor" no alto de cada aba.** É a ação principal, a única laranja da tela.
   - Primeiro abre a escolha: a busca pelo nome sobre o cadastro, uma empresa por item, com a frase "A qualificação
     é da empresa: vale para todas as filiais dela."
   - "Continuar" abre o **mesmo `QualificarDialogo`**, na categoria da aba. O título diz **"Requalificar"** quando a
     empresa já tem linha nessa categoria; senão, "Qualificar".
   - **Fornecedor fora do cadastro:** o link "Cadastrar novo fornecedor" abre a **mesma gaveta** de novo fornecedor.
     - A gaveta ganhou uma propriedade opcional, `aoCriar`, que só a tela nova usa.
     - Depois de criar, a tela abre o diálogo de qualificar a empresa recém-criada.
     - Se a lista ainda não a trouxer, um aviso pede para recarregar.
8. **Na linha, embaixo do nome**, vêm "Requalificar" (o mesmo diálogo) e "Histórico" (a ficha da empresa).
   - A coluna do nome fica presa à esquerda quando a tabela rola de lado (em 768 e 375), então as duas ações ficam
     sempre à vista.
   - A qualificação de empresa que não está no cadastro da OC aparece com o nome que a folha do auditor já usa e um
     "fora do cadastro" no lugar dos botões, porque não há filial para abrir o diálogo.
9. **"PDF dos qualificados"**, botão de contorno no alto, com o mesmo gerador. O código que a ficha e a tela
   Fornecedores tinham para depois de qualificar e para o PDF virou um arquivo só, `depoisDeQualificar.ts`, que as
   três telas usam.
10. **Só quem pode emitir OC qualifica** (`podeEmitirOc`). Os outros veem a mesma tabela, sem "+ Qualificar" e sem
    "Requalificar", com a linha "Só quem emite OC qualifica. Aqui você vê as qualificações." O "Histórico" continua.
11. **Uma fonte só:** `useQualificacoesDoDia` e as funções de `qualificacao.ts`. A tela não faz nenhuma conta de
    situação, vencimento ou nota.
12. **A frase da trava** agora diz: "Qualifique a empresa na tela Qualificação, no menu, e emita de novo."

**O que não mudou:** o banco, a ficha (só passou a usar o arquivo comum do §2.9), a coluna do selo em Fornecedores e
o "Qualificar agora" da Nova OC.

## §3 — As provas (o seu §5.1)

- **27 testes novos:**
  - 12 da regra pura (`tests/domain/telaDaQualificacao.test.ts`), um para cada item do seu §5.1, mais:
    - a `vigente` mandando;
    - o caso de borda do §2.3;
    - a ordem do que pede ação;
    - o fora do cadastro;
    - a filial ativa;
    - o desempenho curto;
  - 15 da tela (`tests/components/TelaQualificacao.test.tsx`):
    - as abas e as contas;
    - as colunas de cada aba;
    - os critérios num clique;
    - o filtro;
    - a escolha, o diálogo e o título "Requalificar";
    - o cadastro novo e a volta para qualificar;
    - quem só lê;
    - o PDF;
    - a carga que falhou.
- **As sabotagens.** Cada uma foi desfeita depois, com o conteúdo do arquivo conferido (sha igual):

| # | A sabotagem | Resultado |
|---|---|---|
| 1 | **montar as linhas por filial, e não por empresa** (a sua) | vermelha, 9 testes |
| 2 | a Permissão pelo "qualificada" gravado, e não pela regra da trava | vermelha, 3 |
| 3 | o histórico vira linha (pegar a mais recente, ignorando a `vigente`) | vermelha, 1 |
| 4 | quem só lê também qualifica | vermelha, 1 |
| 5 | a vencida vai para o fim | vermelha, 3 |
| 6 | a frase da trava volta a mandar à ficha | vermelha, 3 |

- **A 3 ficou verde na primeira rodada.** Todos os testes tinham a vigente com a data mais nova, então pegar a de
  data mais nova dava o mesmo resultado. Escrevi o teste da requalificação lançada com data anterior, e ela passou a
  reprovar.

## §4 — As fotos (o seu §5.2)

- **Onde estão:** `docs\Capturas\2026-10-01_D661\`, no ramo. São 66 fotos.
- **Larguras e temas:**
  - as 11 cenas em claro, nas larguras 1920, 1366, 768 e 375;
  - as 11 cenas em escuro, em 1366 e 375.
- **Os dados são todos inventados:** empresas "(teste)", datas, critérios, ECRs e entregas.

| Nº | A cena |
|---|---|
| 01 | Materiais: vencida, desqualificada e vencendo no alto; a empresa de duas filiais numa linha só |
| 02 | Serviço |
| 03 | Controle tecnológico (sem Tipo; "Desempenho") |
| 04 | Projetos, com as quatro vencidas |
| 05 | Locação, vazia |
| 06 | Materiais, no filtro "Pedem ação" |
| 07 | os critérios abertos num clique |
| 08 | "+ Qualificar fornecedor": a escolha |
| 09 | o diálogo, aberto pela escolha |
| 10 | o fornecedor fora do cadastro: a gaveta de novo fornecedor sobre a tela |
| 11 | a tela de quem só lê |

- **A medida, em cada foto:**
  - **a página não rola de lado em nenhuma das 66**;
  - em 1920 e 1366 a tabela também não rola;
  - em 768 e 375 a tabela rola dentro do quadro dela, com o nome e as ações presos à esquerda.
- **Duas cenas apontam sobreposição, e as duas são de propósito:** a 08 (a lista da busca aberta sobre a frase de
  baixo) e a 10 (a gaveta sobre a tela). Olhei as duas.

## §5 — O que não medi

- **A tela com os dados do banco.** As fotos e os testes usam dados inventados, então a tela com as quatro vencidas
  verdadeiras de Projetos só se vê no ar.
- **O caminho completo de cadastrar e qualificar no banco de verdade.** Nos testes ele foi feito com o banco imitado:
  `salvar` e `qualificarEmpresa` falsos.
- **Leitores de tela além do básico.** As abas têm `role="tablist"` e `aria-selected`, e as marcas dos critérios
  são botões com `aria-expanded`. Não passei em leitor de tela.
