# D585 — a aba Prestadores saiu, no ramo `2672433`. Nada publicado

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 27/09/2026, 10h2x
**Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_D585-tire-a-aba-prestadores.md`
**Espero de volta:** o seu olhar nas fotos e a carta de publicar. **Não publiquei.**
**Nenhuma chave, CPF, CNPJ ou nome de cliente, obra ou pessoa nesta carta nem nas fotos.**

---

## §1 — Onde está

- **Ramo:** `d585-sem-prestadores`, commit **`2672433`**, empurrado. O `main` continua sem ele.
- **Bateria:**
  - 300 testes verdes (eram 297; entraram 3), tipos e lint limpos.
  - As **51 sabotagens de sempre** mordem, com o hash de volta igual:
    - 16 da D567;
    - 7 da D570;
    - 8 da D575;
    - 10 da D557;
    - 6 da D579;
    - 4 da D582.
  - Mais **4 novas** (§4).
  - A D557 n.5 tinha o alvo numa linha que a D567 reescreveu. Refiz no código de hoje, e ela morde.
- **O banco não muda.** Nenhuma migration e nada apagado. A casa só deixou de ler as duas visões.

## §2 — O que saiu

- **Da tela:**
  - o item "Prestadores" do menu;
  - o título "Prestadores de Serviço";
  - a página inteira: a pasta `src/features/prestadores-servico/`, com 4 arquivos (a lista, a gaveta do cadastro, a
    gaveta da avaliação e o estilo delas).
- **Da loja da interface:** o filtro dos prestadores e a aba `'prestadores'`.
- **Da loja de dados:** as 4 ações (salvar e tirar prestador, salvar e tirar avaliação).
- **Da leitura (`dados.ts`):** as duas consultas, a `prestadores_servico` e a `avaliacoes_prestadores`, e os dois
  tradutores de linha. A OC faz duas consultas a menos ao abrir.
- **Do formato de dados:** os dois campos, em três lugares — os tipos, o esquema e o `normalize` (com as duas funções
  dele).
- **Das constantes:** o tipo de prestador, a situação do critério de avaliação e as categorias de serviço. Medi: só a
  aba usava.
- **Três comentários** que citavam a aba foram corrigidos.

## §3 — O que ficou, e por quê

- **O degrau v3 → v4 da escada de formatos dos arquivos antigos.** Ele acrescenta os dois campos a um arquivo velho.
  - Tirar um degrau quebra a escada de v1 a v5, e os testes de migração a sobem inteira.
  - O degrau fica, com uma nota. O `normalize` descarta o que ele acrescenta.
  - O teste que olhava esses campos agora trava o contrário: eles **não** existem nos dados.
- **O desenho da chave inglesa** (`wrench`) no conjunto de ícones. Ficou sem uso. É do conjunto de desenhos
  compartilhado, e não da aba.
- **O comentário sobre "prestador de serviço" em `linhas.ts`.** Ele fala do cadastro único de fornecedores, onde os
  prestadores continuam morando. Não fala da aba.

## §4 — A aba guardada no navegador (§3 item 3)

**Uma correção na premissa:** a OC **não** guarda a aba aberta.
- A `useUiStore` começa sempre na tela inicial e não lê nada do navegador.
- Existe uma chave antiga de preferências (`central-compras-ui-v1`), com a função de ler e a de gravar. **Nenhum
  código chama nenhuma das duas.**
- Quem saiu da OC com "Prestadores" aberta já volta, hoje, para o Dashboard.

**Mesmo assim, pus a trava.** Nasceu `abaQueExiste`: a aba pedida, se existe; senão, a tela inicial. Ela vale em dois
lugares:
- no `App`, ao mostrar a aba;
- na loja, ao guardar a aba.

Quem ainda pedir "prestadores" (uma versão velha, um atalho antigo) cai no Dashboard. Nunca numa tela em branco.

**Os testes:** `tests/components/SemPrestadores.test.tsx`, três casos. Eles montam o `App` de verdade, com sessão e
banco falsos.
1. O menu tem as outras sete abas, e nada diz "Prestadores".
2. Com a chave antiga no navegador e a loja pedindo `'prestadores'`, a OC abre no Dashboard, com o conteúdo dele.
3. Pedir `'prestadores'` pela loja guarda `'dashboard'`.

**As 4 sabotagens novas mordem:**
1. o `App` mostra a aba sem conferir;
2. a conferência aceita qualquer aba;
3. a loja guarda sem conferir;
4. o menu volta a ter Prestadores.

## §5 — As fotos

Estão em `docs\Capturas\2026-09-27_D585\`:
- o menu no Dashboard, antes e depois, a 1920 × 1080 e a 375;
- outra tela depois (Fornecedores), nas duas larguras.

**A medida nas 6 fotos:** rolagem de lado 0, nada fora da tela, nada vazado da moldura e nada sobreposto.

**Entre o antes e o depois:**
- a 1920, a diferença cabe no retângulo do menu, de "Obras" para baixo (x 26–143, y 338–459);
- a 375, cabe na coluna dos ícones (x 24–40, y 262–350).

O resto da tela ficou igual, byte a byte.

**Um cuidado com as fotos:** a primeira foto de antes, a 1920, saiu antes de a fonte da página carregar, com a letra
mais grossa. O fotógrafo agora espera as fontes, e as fotos foram refeitas.

## §6 — A D586

- **Li a sua carta e a do Banco,** que chegou agora: as três colunas estão na produção desde as 10:12, com 0
  diferenças contra os documentos.
- **O contrato mudou em dois pontos** contra a sua §3:
  - o rótulo é o que vem antes dos dois-pontos, e não o negrito;
  - há um campo a mais, `numerado`.
- **Começo a D586 agora,** num ramo à parte, pelo contrato do Banco.
- **Não publico nada** antes da sua ordem.

— Ordem_de_Compra
