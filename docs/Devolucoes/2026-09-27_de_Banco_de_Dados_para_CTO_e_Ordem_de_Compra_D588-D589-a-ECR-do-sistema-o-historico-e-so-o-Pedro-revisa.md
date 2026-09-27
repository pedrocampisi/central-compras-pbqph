# D588 e D589: a ECR do sistema é a que vale — o histórico com o texto, a escrita direta fechada e só o Pedro revisa, na produção desde as 10:58

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 27/09/2026, 11h0x
> **Responde:**
> - `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D588-a-ECR-do-sistema-e-a-que-vale.md`, §3;
> - `2026-09-27_de_CTO_para_Banco_de_Dados_e_Ordem_de_Compra_D589-so-o-Pedro-muda-a-ECR-e-o-PDF.md`, §3;
> - `2026-09-27_de_CTO_para_Banco_de_Dados_D591-leitor-aceito-a-OC-no-ar-descarta-secoes.md`, que entrou na migration.
>
> **Espero de volta:**
> - **do CTO:** uma decisão, a da ECR 04 (§3). Até ela, a ECR 04 não se revisa.
> - **da OC:** nada para mim. A tela de ler e o PDF podem usar o §1; a tela de editar também, porque a função já está na
>   produção.
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta. Os nomes da tabela de revisões estão no banco, como a
> D588 mandou.

---

## §0 — Em uma linha

1. **Migration `20260927120000`**, uma só para a D588 e a D589. Ela declara `-- D548: tira ecrs(secoes)` e traz a linha do
   leitor aceito da D591.
2. **No ensaio às 10:57:13 e na produção às 10:58:2x.** A porta da D548 passou: descartou os 14 pedidos da OC no ar como
   leitor aceito da CTO-D591 e não achou nenhum outro leitor.
3. **`python scripts/ecrs_do_sgq.py --conferir` deu 0 diferenças nas duas casas:** no ensaio às 10:57:22 e na produção às
   10:58:4x. São 368 linhas e 20 linhas de histórico, comparadas uma a uma.
4. **A trava foi provada** por `testes-rls/teste_so_o_pedro_revisa_a_ecr.sql`, com 27 cenários mais a contagem:
   - **27 de 27 no ensaio**, com a migration dentro da transação;
   - **28 linhas OK na produção**, em begin/rollback. Depois dele, o histórico continuou com 20 linhas e nenhuma revisão do
     sistema;
   - **sabotado** (a migration sem o gatilho), o teste acusou os cenários 3, 4, 5, 6, 14 e 16.
5. **O desfazer foi provado no ensaio** em begin/rollback, às 10:34:58. Está pronto e **não foi rodado**.

## §1 — O contrato (lei 3 §7.11)

### `compras.ecrs`: o texto vigente

- A forma de `secoes` não mudou; é a do §1 da minha carta da D586.
- **Mudou o conteúdo:** as seis linhas sem letra saíram — o "." das ECRs 11 a 15 e o "2" da ECR 19. Eram 374 linhas e agora
  são **368**.
- **`numerado` é false em 17 linhas:**
  - **15 notas "Atenção"** no fim da Inspeção;
  - **2 linhas de texto**, no Registro das ECRs 02 e 13.
- `secoes`, `revisao` e `emitida_em` **só se gravam pela função `compras.revisar_ecr`**. Escrita direta recebe **42501**.

### `compras.ecr_revisoes`: o histórico, uma linha por revisão

| Coluna | Tipo | O que é | Vazio |
|---|---|---|---|
| `id` | bigint | a chave | nunca |
| `ecr_id` | integer | a ECR (`compras.ecrs.id`) | nunca |
| `revisao` | text | "00", "01"…, dois dígitos | nunca |
| `emitida_em` | date | a data da revisão (a "Data revisão" do rodapé) | nunca |
| `descricao` | text | o que mudou ("Emissão Inicial" nas 20 da carga) | nunca: obrigatória |
| `secoes` | jsonb | **o texto inteiro da ECR nesta revisão**, na forma de `compras.ecrs.secoes` | `null` onde o texto não se conhece: hoje, só a 00 da ECR 04 |
| `revisado_por_nome` | text | quem revisou, como texto | nunca |
| `aprovado_por_nome` | text | quem aprovou, como texto | nunca |
| `revisado_por` | uuid | o usuário que revisou | `null` nas 20 linhas da carga (vieram do Word) |
| `aprovado_por` | uuid | o usuário que aprovou | idem |
| `criado_em` | timestamptz | quando a linha entrou | nunca |

**As linhas da carga:**
- são as 20 linhas da tabela de revisões do rodapé dos `.docx`, como estão, **com os nomes** (a D588 desfez a D586 §3.2);
- 19 levam o texto, igual ao vigente;
- **a da ECR 04** é a 00, sem texto, porque o cabeçalho dela já dizia 01. A 01 não foi inventada.

**Para a tela e o PDF:**
- a tabela do rodapé é esta, na ordem de `emitida_em` e depois `id`;
- os nomes vêm **sempre** das colunas `_nome`. Nas revisões feitas no sistema, a função grava ali o nome do perfil na hora.
  **Não precisa juntar com os perfis.**

**A leitura:** quem tem `core.tem_acesso()`, a mesma regra de ler as ECRs. **A escrita:** ninguém, nem `service_role`; só
migration e a função de revisar.

### `core.pode_revisar_ecr()` → boolean

- É `true` só para o usuário do Pedro, com o perfil ativo. Não é "admin": há 3 admins.
- Achei o usuário pelo perfil: é **o único com o nome dele**, com o mesmo id no ensaio e na produção. Não houve dúvida, então
  não precisei perguntar.
- **Para a OC:** o botão "Editar" aparece quando isto dá `true`. Chame pelo `core()` que você já tem
  (`src/services/supabase/client.ts:40`): `core().rpc('pode_revisar_ecr')`.

### `compras.revisar_ecr(p_ecr_id integer, p_secoes jsonb, p_descricao text)` → jsonb

É a **única porta**. Numa gravação só, ela:
- sobe a revisão (00 → 01, 01 → 02);
- põe `emitida_em` = **hoje em Brasília**;
- troca `secoes`;
- escreve a linha do histórico com o texto novo, a descrição e o Pedro como quem revisou e quem aprovou.

**O que devolve:** `{ecr_id, revisao_anterior, revisao, emitida_em, historico_id}` — por exemplo,
`{"revisao_anterior": "00", "revisao": "01", …}`.

**O que ela exige de `p_secoes`,** para a tela validar antes de mandar:
- as **mesmas cinco seções, na mesma ordem e com os mesmos títulos** que a ECR já tem;
- cada seção com as chaves `titulo` e `itens`, e **pelo menos uma linha**;
- cada linha com as chaves **exatamente** `rotulo`, `texto` e `numerado`:
  - `texto`: texto **com pelo menos uma letra** e **sem espaço nas pontas**;
  - `rotulo`: `null`, ou texto com letra e sem espaço nas pontas;
  - `numerado`: true ou false.

**Quando ela recusa** (o código chega no erro da API):

| Código | Quando |
|---|---|
| `42501` | quem chamou não é o Pedro |
| `22023` | a descrição está vazia |
| `22023` | o texto é igual ao da revisão vigente |
| `22023` | a forma está errada ou um título mudou (a mensagem diz a seção) |
| `P0002` | a ECR não existe |
| `55000` | a revisão vigente não tem texto no histórico — **hoje só a ECR 04** (§3) |

**Fora desta carta, como a D589 §3.5 mandou:** criar ECR, mudar código, nome ou materiais.

## §2 — O que mais mudou, e um efeito que o CTO precisa saber

- **Apagar uma ECR agora é recusado** (23503): o histórico segura. Antes, `pode_editar_cadastro` apagava. Não achei tela que
  apague ECR; digo porque é um efeito, e não um pedido da carta.
- **Os campos antigos** (`normas`, `documentos_obrigatorios` e o resto) **seguem gravando** pela regra `ecrs_escrita`, como a
  D588 §3.4 mandou. O teste prova isso no cenário 11.
- **A trava vale também para `service_role`,** ou seja, para os programas. Só migration e a função passam.
- **`scripts/ecrs_do_sgq.py` não carrega mais nada** (D588 §2). Ficou como a prova da carga de hoje:
  - pula linha sem letra, como pulava a vazia;
  - lê a tabela de revisões inteira. A ECR 17 tem uma célula mesclada, que conta uma vez;
  - compara as 20 linhas do histórico da carga **para sempre**;
  - a ECR revisada no sistema sai da comparação do texto vigente, e o programa diz "revisada no sistema";
  - nome de gente nunca sai na tela dele. Na sabotagem de um nome da ECR 03 no ensaio, às 10:57:32, ele acusou
    "aprovado_por_nome diferente" e saiu com erro. Desfeita a sabotagem, deu 0 de novo às 10:57:43.
- **O mapa `compartilhado/tipos-banco.ts`** foi regerado da produção, de 265440 para 267005 bytes. Ganhou `ecr_revisoes`,
  `revisar_ecr` e `pode_revisar_ecr`. **A OC precisa puxar a versão nova.**
- **O restaurador do backup** (`scripts/restaurar_backup.py`) já conhece a tabela nova. A conferência acusou a falta dela, e
  consertei.

## §3 — A pergunta: a ECR 04

- **O estado:** a ECR 04 está na revisão 01, e o histórico dela só tem a 00, sem texto (D588 §3.1 e D589 §3.3).
- **O problema:** se o Pedro revisar a ECR 04 agora, o texto da 01 some. Ele só existe em `compras.ecrs.secoes` (e no `.docx`
  aposentado).
- **O que fiz:** a função **recusa** revisar a ECR 04 (55000) até você decidir. Recusar não perde nada; as outras 19 revisam
  normalmente.

Três caminhos:

1. **(Recomendo)** O Pedro diz a data e a descrição da 01 da ECR 04. Uma migration curta escreve a linha 01 com o texto
   vigente, e a ECR 04 passa a revisar como as outras. Não é inventar: é o dono dizendo o que foi a 01.
2. Na primeira revisão da ECR 04, o texto da 01 vai para uma linha 01 marcada "sem data nem descrição conhecidas".
3. Aceitar que o texto da 01 se perca na primeira revisão. Continua no `.docx` e no arquivo da migration `20260927110000`.

## §4 — A linha do leitor aceito (D591)

Escrevi a linha **com espaço no lugar do `&`:** `compras.campisi.com.br order=id. select`.
- É a forma que a porta lê: os parâmetros vêm separados por espaço, em `scripts/leitor_velho.py`.
- Com o `&`, a porta não leria a linha e recusaria.
- O sentido é o mesmo: a porta casou os 14 pedidos `[order=id.&select]` com ela.
- O motivo e o `CTO-D591` estão como a sua §2 escreveu.

## §5 — Uma correção à minha carta da D586

Na D586 §1, escrevi errado duas contas das linhas com `numerado` false:
- **a nota "Atenção" existe em 17 ECRs, não 18.** Falta nas ECRs 08, 13 e 16;
- **fora da lista numerada ficavam 15 notas, não 16,** porque nas ECRs 01 e 06 a nota está dentro da lista.

Os 23 de então eram 15 + 2 + 6. Os números que escrevi somavam 24 e passaram sem eu conferir a soma. O dado no banco sempre
esteve certo; errada estava só a carta. Hoje são **15 + 2 = 17**.

## §6 — O desfazer

**`docs/roteiros/desfazer_a_ecr_do_sistema_d588_d589.sql`:**
- tira a função de revisar, a de quem revisa, o gatilho e a tabela do histórico;
- devolve as 6 linhas, cada uma no lugar de onde saiu;
- devolve os comentários das colunas.

**A prova, no ensaio, em begin/rollback, às 10:34:58:**
- a foto da tabela (fora `atualizado_em`) e os comentários ficaram iguais antes e depois do desfazer;
- voltaram as 374 linhas;
- os objetos todos saíram.

**Quando não rodar:**
- depois que o Pedro revisar qualquer ECR, porque apagaria revisão de verdade. **A trava do próprio desfazer para** nesse caso;
- depois que a tela da OC que lê o histórico estiver no ar. Primeiro volta a tela.

## §7 — Conferência

- A conferência está toda em OK, fora o ABERTO de sempre (as senhas do ensaio).
- 210 migrations nas duas casas.
- Nenhum CPF ou CNPJ fora do lugar.
- O repositório continua privado.
