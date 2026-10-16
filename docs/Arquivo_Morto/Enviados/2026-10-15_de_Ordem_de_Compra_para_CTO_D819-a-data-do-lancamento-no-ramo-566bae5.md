# D819 — A data do lançamento, no ramo `d819-qualificacao-lancada` (`566bae5`), sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 22h41
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D819-a-data-em-que-a-qualificacao-foi-lancada.md`
**Espero de volta:** a sua conferência e, se for o caso, a ordem de publicar pela emenda 3.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos usam empresas e
pessoas inventadas, marcadas "(teste)".

---

## §1 — A medida do §2.4, só lendo, na produção

- **A vista `compras.qualificacoes_situacao`** já tem a coluna `criado_em` (`timestamp with time zone`).
  - É `security_invoker`.
  - Quem entra (`authenticated`) tem leitura da vista e da coluna, e da tabela `compras.qualificacoes` também.
  - A leitura da tabela passa pela política `qualificacoes_leitura`: `core.tem_acesso()`.
- **A tela já lê a vista com `select('*')`.** Então a coluna já chegava, e ninguém olhava para ela. **Não precisa de
  nada do Banco.**
- **Os números batem com os seus:**
  - 21 qualificações;
  - as 21 lançadas depois da data delas;
  - todas no mesmo dia de lançamento, 28/09/2026.
- Só rodei consultas de leitura. Nenhum nome saiu da consulta.

## §2 — O que o ramo faz

- **A frase:** `textoDoLancamento`, em `src/domain/qualificacao.ts`, diz "lançada no sistema em DD/MM/AAAA" quando o
  dia do lançamento, em São Paulo, é depois da data da qualificação.
  - Lançada no mesmo dia, ela não diz nada.
  - Sem o lançamento, também não.
- **A leitura:** a `carregarQualificacoes` passa o `criado_em` como `lancadaEm`.
- **Onde aparece:**
  - na linha aberta da tela Qualificação, depois de "Qualificada por …" e da origem;
  - no Histórico da ficha da empresa, em cada qualificação, inclusive na que vale.
- **Não trava nada.** A data da qualificação continua a do papel, na coluna, no selo e na trava da Data.
- **O PDF dos qualificados não muda.** Um teste prende isso: as seções e o texto do PDF são os mesmos com o lançamento.
- **Um retoque que as fotos pediram:**
  - no celular, a tabela rola de lado, e a linha aberta tinha a largura da tabela inteira. A frase ficava fora da tela;
  - os critérios e o "Qualificada por" agora ficam na largura que se vê (`566bae5`), do mesmo jeito do ramo 2 da
    parte C.

## §3 — A junção com a parte C, quando chegar a hora

Os dois ramos põem a mesma regra `.rolagem` no mesmo lugar do `QualificacaoPage.module.css`. Medi com `git merge-tree`:
- **dá um conflito, só nesse arquivo;**
- o `.tsx` junta sozinho, porque a linha é igual nos dois;
- **o conserto:** ficar com uma `.rolagem` e manter as duas regras de largura, a dos papéis e a da linha aberta.

Quem publicar o segundo dos dois faz esse conserto.

## §4 — A prova

- **o CI:** verde no `9a6c795` e no `566bae5`;
- **a bateria:** 1126 testes (7 novos), com tipos e lint limpos;
- **7 sabotagens, as 7 vermelhas:**
  - o serviço sem o `criado_em`;
  - o mesmo dia também diz;
  - o dia de Greenwich no lugar do de São Paulo;
  - sem conferir a data;
  - a linha aberta sem a frase;
  - o Histórico sem a frase;
  - o PDF com a frase.

## §5 — As fotos

Estão em `docs/Capturas/2026-10-15_D819/`. Nenhuma tem rolagem de lado.

| foto | o que mostra |
|---|---|
| `d819_linha_1280.png` | a linha aberta da empresa da planilha: "… · planilha FO 8.4.1.1 · lançada no sistema em 28/09/2026" |
| `d819_linha_375.png` | a mesma no celular, com a frase inteira à vista |
| `d819_historico_1280.png` | o Histórico da ficha: as duas qualificações, cada uma com a frase |
| `d819_historico_375.png` | o mesmo no celular |

A empresa lançada no mesmo dia da qualificação não mostra a frase. Isso não está nas fotos (a tela abre uma linha por
vez), mas o teste da tela prende.

## §6 — O tamanho

**+33 e −3 em `src`, em 5 arquivos.** Não vai à perícia.

— `Ordem_de_Compra`
