# D586: as 20 ECRs do SGQ, palavra por palavra, estão na produção desde as 10:12, com 0 diferenças contra os 20 documentos

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 27/09/2026, 10h1x
> **Responde:** `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D586-as-ECRs-iguais-as-do-SGQ.md` (commit
> `424abbe` do CTO), §3
> **Espero de volta:** nada do CTO. **A OC pode começar a §4** pelo contrato do §1 abaixo. Ele mudou em dois pontos
> contra a proposta da carta: o rótulo não vem do negrito, e há um campo a mais, `numerado`.
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta. Os nomes do rodapé dos documentos não entraram no
> banco.

---

## §0 — Em uma linha

1. **Migration `20260927110000`** (`-- D548: acrescenta`):
   - três colunas novas em `compras.ecrs`: `revisao`, `emitida_em` e `secoes`;
   - a carga dos 20 `.docx`: 374 linhas, 65/60/49/112/88 por seção, as mesmas contas da sua §2.
2. **Ensaio às 10:11:37 e produção às 10:12:3x.** `python scripts/ecrs_do_sgq.py --conferir` deu **0 diferenças nas
   duas**: produção às 10:12:40, ensaio às 10:12:06.
3. **A sabotagem, no ensaio às 10:11:54:** troquei "6 peças" por "7 peças" na regra de rejeição da ECR 04. O programa
   acusou **1 diferença, na linha certa**, e saiu com erro. Voltei a palavra e deu 0 de novo.
4. **O desfazer foi PROVADO no ensaio, em begin/rollback, às 10:11:02.** Está pronto e **não rodado**.
5. **Nada mais mudou:**
   - `id`, `codigo`, `nome`, `categoria`, `unidades_padrao`, os materiais e os campos antigos estão intocados;
   - os 20 nomes batem com os dos documentos, nas duas casas;
   - o mapa `compartilhado/tipos-banco.ts` foi regerado e só ganhou as três colunas (265137 → 265440 bytes).

## §1 — O contrato (lei 3 §7.11)

**A fonte:** os 20 `.docx` da pasta que o Pedro apontou, só lidos. A digital sha256 de cada um está no cabeçalho da
migration.

| Coluna | Tipo | O que o Banco grava | Vazio |
|---|---|---|---|
| `revisao` | text | o "Rev.:" do **cabeçalho** do documento, como está escrito: `"00"`, e `"01"` na ECR 04 (§3) | `null` só em ECR que ainda não foi carregada |
| `emitida_em` | date | a data da **última linha** da tabela de revisões do rodapé: `2026-04-15` nas 20 | idem |
| `secoes` | jsonb | as cinco seções, na ordem do documento | idem: **a tela tem de aguentar `null`** (§4.4 da sua carta) |

**A forma de `secoes`:**
```
[{"titulo": "REFERÊNCIA",
  "itens": [{"rotulo": null,   "texto": "NBR 7212 - Execução de Concreto Dosado em Central - Especificação;", "numerado": true}, ...]},
 {"titulo": "ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO", "itens": [...]},
 {"titulo": "REGISTRO DO FORNECEDOR", "itens": [...]},
 {"titulo": "INSPEÇÃO DO RECEBIMENTO",
  "itens": [{"rotulo": "Lote", "texto": "cada entrega será considerada um lote para inspeção.", "numerado": true}, ...,
            {"rotulo": "Atenção", "texto": "Qualquer divergência entre material entregue, ...", "numerado": false}]},
 {"titulo": "MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO", "itens": [...]}]
```

**Os títulos:**
- são sempre estes cinco, nesta ordem;
- saem sem o espaço do fim que alguns documentos têm;
- se um documento vier com outro título ou outra ordem, **o programa para** e nada é carregado.

**`rotulo`: mudou contra a proposta, porque o negrito não serve.** Medi os 20 documentos:
- o "Lote:" é negrito na ECR 01 e não é na ECR 03;
- na ECR 12, o negrito é o **conteúdo** ("Material: **Para tubulações prediais**");
- separar pelo negrito daria rótulos diferentes para a mesma coisa.

A regra medida é esta: **o que vem antes do primeiro ":", quando tem até 4 palavras.**
- Isso pega "Lote", "Aspecto geral", "Especificações/Dimensão/Lado de abertura" e "Atenção".
- Com 5 palavras ou mais é frase, e a linha fica inteira no `texto`, com `rotulo` `null`. São 3 linhas assim: "As
  pilhas devem ser de, no máximo: 10 sacos…", nas ECRs 05 e 19, e "O empilhamento máximo deve seguir:", na ECR 16.
- Nada se perde. O programa confere que a linha original é exatamente `rotulo + ":" + texto`, e só saem os espaços em
  volta dos dois-pontos.
- **Para a tela:** mostrar como `rotulo: texto`, com o rótulo em negrito, reproduz a linha do documento.

**`numerado`: campo a mais, que a proposta não tinha.**
- É `true` quando a linha está na lista numerada do documento. **São 351 das 374.**
- **É `false` em 23 linhas,** que ficam fora da lista no documento. A tela pode mostrá-las como nota, sem número:
  - **16 notas "Atenção: …"** no fim da Inspeção. A nota existe em 18 ECRs: nas ECRs 01 e 06 ela está **dentro** da
    lista (`numerado` true); as ECRs 08, 13 e 16 não a têm;
  - **2 linhas de texto:** "No caso da inexistência das licenças…", no Registro da ECR 02, e "Materiais que necessitam
    de certificados…", no Registro da ECR 13;
  - **5 parágrafos com só "."**, nas Inspeções das ECRs 11, 12, 13, 14 e 15, e **um "2" solto** na ECR 19 (§3).
    Entraram como estão.

**O `texto`:**
- vai sem os espaços das pontas;
- o espaço de dentro fica como está, inclusive o duplo;
- os caracteres especiais também ficam, como o "mᶟ" da ECR 03.

**O que não entra:** os nomes de gente da tabela de revisões (§3.2 da sua carta), a numeração automática (1.1, 1.2…),
que não é texto no documento, e as linhas vazias.

## §2 — O programa que fica

**`scripts/ecrs_do_sgq.py`** é o que roda de novo na próxima revisão do SGQ:

| Modo | O que faz |
|---|---|
| `--mostrar` | lê os 20 e mostra, por ECR, a revisão, a data, os itens por seção, os rótulos e a digital |
| `--sql ARQUIVO` | escreve o bloco de dados da carga, que a migration seguinte usa |
| `--conferir --projeto REF` | compara banco e documento seção por seção e linha por linha. Com diferença, **sai com erro** e mostra a linha dos dois lados. Sem as colunas no banco, também diz, e sai com erro |

**Ele para sozinho quando:**
- a pasta não tem 20 arquivos;
- os códigos não são ECR 01 a 20;
- o nome do cabeçalho não é o do arquivo;
- o cabeçalho não se lê;
- aparece uma tabela no corpo;
- há texto antes do primeiro título;
- os títulos estão fora da ordem.

## §3 — O que achei nos documentos e **não consertei**

- **A ECR 04** diz "Rev.: 01" no cabeçalho, e a tabela de revisões dela só tem a linha 00. Carreguei `"01"`, como
  manda a sua §3.5.
- **A ECR 19** tem um parágrafo com só **"2"**, entre o último item da Inspeção e a nota "Atenção". **As ECRs 11 a 15**
  têm um parágrafo com só **"."**, depois da nota "Atenção". Os seis entraram como estão (`rotulo` null, `numerado`
  false). Parecem caracteres digitados por engano; consertar é do SGQ.
  - **Para a OC:** a tela vai mostrar esses seis se mostrar tudo o que está no banco. Esconder linha é decisão sua e do
    CTO, não do banco. O banco guarda o documento.
- **A ECR 12 e a ECR 19 estavam abertas no Word** enquanto eu lia: os arquivos `~$` de trava estão na pasta, e
  continuavam lá às 10:1x.
  - O que carreguei é o que estava salvo no disco. A conferência de 10:12:40 releu os arquivos e deu 0.
  - **Se alguém estiver revisando essas duas agora e salvar,** a próxima `--conferir` vai mostrar a diferença. Aí é uma
    carga nova, pelo caminho de sempre.

## §4 — O desfazer, e dois cuidados

**`docs/roteiros/desfazer_as_ecrs_do_sgq_d586.sql`** tira as três colunas.
- Tem uma trava que para se as colunas não estiverem lá.
- Foi provado no ensaio às **10:11:02**, em begin/rollback: a foto da tabela sem o `atualizado_em` saiu igual antes,
  depois da carga e depois do desfazer, e as colunas voltaram às de antes.
- **Não se roda depois que a tela nova da OC estiver no ar:** ela ficaria sem o que mostrar. Primeiro volta a tela.
- **Não devolve o `atualizado_em`.** O gatilho da tabela carimbou as 20 linhas às 10:12, e isso fica.

**Quem pode mudar uma ECR:** a regra de hoje, `ecrs_escrita`, deixa editar a tabela a quem tem
`core.pode_editar_cadastro()`. Isso inclui as `secoes`, pela API.
- Não mexi nisso: não é desta carta.
- **Mas é por ali que a cópia pode se afastar do documento.** É o `--conferir` que pega isso.
- Se o CTO quiser, uma carta à parte fecha as três colunas para escrita e deixa só a carga gravar.

## §5 — Conferência

- A conferência está toda em OK, fora o ABERTO de sempre (as senhas do ensaio).
- 209 migrations nas duas casas.
- Nenhum CPF ou CNPJ fora do lugar.
- O repositório continua privado.
