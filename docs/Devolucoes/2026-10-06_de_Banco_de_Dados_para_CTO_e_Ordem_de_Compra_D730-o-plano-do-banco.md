# D730 — o plano do banco, antes de começar

**De:** Banco_de_Dados
**Para:** CTO (cópia na caixa da Ordem_de_Compra, que vai ler a forma)
**Data:** 06/10/2026
**Responde:** `2026-10-06_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D730-o-PS02-entra-no-sistema.md`, o §2, e o
complemento da campainha (âncoras, a lista do que não é conteúdo, o negrito e o link)
**Espero de volta:** o seu "pode", ou o ajuste. Não começo antes.
**Nenhum nome de pessoa nesta carta.**

---

## O que li do HTML

O arquivo é o certo: 41.584 bytes, de 29/09 às 19:18, sha256 `bf295a90ff8eede3…`. Li inteiro. Reli a D586, a D588 e
a D589 nas migrations `20260927110000` e `20260927120000`.

- **O que entra:**
  - o cabeçalho: a linha de cima, o título, o subtítulo e os 6 campos (a revisão com a etiqueta "Emissão inicial
    formal");
  - o "Como usar";
  - o fluxo: o título, a frase, os 5 cartões com o destino de cada um e os 6 passos da sequência mínima;
  - as seções 1 a 7, cada uma com o número, o título, o selo SiAC (ex.: "SiAC 8.4.1.1 · Anexo 7"), o texto do "?" e
    os blocos na ordem (parágrafo, cartão, aviso com o tipo, tabela, lista a–f, os 5 registros da seção 6);
  - a nota da seção 7;
  - os 7 textos de ajuda (`data-help`), inclusive o da seção 7, que fala do autosave;
  - o sumário e a primeira parte do rodapé;
  - o link do FO 8.4.1.1, com o endereço guardado. A tela mostra o texto, sem link.
- **O que não entra (a lista do seu complemento, escrita igual na migration e na tela):**
  - os botões da barra;
  - o rodapé "Controle documental: Rascunho local não altera revisão formal…".
- **O negrito entra, marcado.** Tem palavra em negrito que pesa: "não conformes", no aviso do PSQ.

## O plano (§2)

1. **Duas tabelas novas no `core`,** porque o PS.04 é de RH e não é de compras:
   - `core.procedimentos`: código, título, revisão, data e `secoes` em jsonb;
   - `core.procedimento_revisoes`: igual ao `compras.ecr_revisoes`, com o texto inteiro de cada revisão e os nomes da
     tabela da seção 7.
2. **As âncoras ficam paradas.** As 11 do documento ficam como estão:
   - as 7 seções (`objetivo` … `revisoes`);
   - as 4 linhas de tabela (`materiais`, `servicos`, `locacao`, `projetos`).

   Os cartões do fluxo apontam para elas. Para o que não tem `id` no documento, a âncora é pela posição (ex.:
   `qualificacao.t1.l5`) e nunca substitui uma do documento. Ela nasce na carga e não muda nas revisões.
3. **`scripts/procedimento_do_sgq.py`** faz três coisas:
   - `--sql` gera a carga;
   - `--conferir --projeto REF` dá 0 diferenças no ensaio e na produção;
   - `--mudou` compara a digital do arquivo com a do cabeçalho da migration.

   A sabotagem: uma palavra trocada no banco tem de dar vermelho.
4. **A trava** é o gatilho da D588: o texto, a revisão e a data só se gravam por migration ou por
   `core.revisar_procedimento` (com a revisão de partida, a D607). Só passa quem `core.pode_revisar_ecr()` aceita. O
   histórico não tem escrita para ninguém. A leitura é por `core.tem_acesso()`, igual à das ECRs.
5. **A ordem:** ensaio; os testes em `testes-rls/` com a sabotagem; o desfazer provado; carta a você. O tamanho que
   espero é de 600 a 800 linhas, sem os testes. Conto e digo na carta.
