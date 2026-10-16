# D813 §5.1 — O ramo 1 da parte C com o contrato do Banco: as duas chaves e o retoque, medido no ensaio, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 20h4x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D813-ramo-1-conferido-o-contrato-e-o-do-Banco.md`
**Espero de volta:**
- a conferência do ramo, com as 3 fotos novas;
- se a medida da gravação de uma entrega no ensaio (§3, o que não medi) fica com o teste do Pedro.

---

## §1 — As duas chaves: vale o contrato do Banco

O ramo é o mesmo, `d812-c1-registro-no-recebimento`, agora em `3204be1`, por cima do `69e92d7`. **Não está publicado.**

1. **O `o_que_pede` é objeto.**
   - A tela lê `o_que_pede.itens` e `o_que_pede.revisao`. Ao lado do `pede` não procura mais nada.
   - Cada item é `{texto, rotulo, numerado}`, como o `secoes` da ECR. O rótulo em branco vira nulo, e só é
     numerado o que vem `true`, como no `ecr.ts`.
   - `ecr`, `nome`, `regra` e `emitida_em` vêm a mais, e a tela não precisa deles.
   - Os `itens` nulos, ou o `o_que_pede` nulo, dão uma lista vazia.
2. **A leitura sobe com o papel.**
   - Na chamada da `arquivar-documento` do `registro-ecr-NN`, o `extracao` leva a resposta da `ler-documento` como
     veio.
   - A `registrar_entrega` não leva mais `lido_pela_ia`.
   - Sem leitura, o papel sobe sem `extracao`. A foto da nota nunca leva.

## §2 — O retoque: as linhas como na ECR

- A tela usa as mesmas duas peças do catálogo (`blocosDaSecao` e `linhaDoDocumento`, do `src/domain/ecr.ts`):
  - a linha numerada vai na lista, com o rótulo na frente ("Materiais: Tubulação aparente");
  - a sem número sai como nota, em destaque, como no catálogo: a borda e o fundo do erro, em negrito.
- **Sem linhas,** a pergunta vai sem a caixa e sem o "O que o fornecedor tem de mandar:".

## §3 — A medida no ensaio

**Como medi, só lendo:**
- chamei a `compras.registro_pede` nas 20 ECRs. Ela é `stable` e não grava;
- usei a OC mais recente do ensaio (Data 15/09/2026), e montei cada linha como a `material_a_chegar` monta;
- as 20 voltaram com o `o_que_pede` em objeto, com `revisao` e `itens`.

**Nove casos passaram pelo leitor e pela tela de verdade** (`cartaoDaLinha`, depois o carimbo), com o texto real:

| ECR | o que tem | o que a tela mostrou |
|---|---|---|
| 01 | 1 linha | 1 na lista |
| 02 rev 00 | 2 linhas e a nota da CDL | 2 na lista e 1 nota |
| 04 rev 01 | 3 linhas | 3 na lista |
| 05 | a FISPQ longa | 1 na lista |
| 12 | 7 linhas, 3 com rótulo | 7 na lista, com os rótulos |
| 13 | 1 linha, a nota dos compulsórios, e mais 3 linhas | 4 na lista, em duas caixas, e a nota no meio |
| 15 | "Não aplicável", sem o `pede` | não pergunta |
| 17 | a GCA | 1 na lista |
| 04 rev 00 | `itens` nulo | a pergunta, sem caixa |

**As 3 fotos** usam o texto real da ECR. O material ("Material de teste") e o fornecedor são inventados:
- `docs/Capturas/2026-10-15_D813_C1/c1_ecr02_375.png`: a lista e a nota da CDL;
- `c1_ecr12_375.png`: os rótulos;
- `c1_ecr13_375.png`: a nota no meio da lista.

As três estão a 375 de largura, sem rolagem de lado.

**A 04 na revisão 00 não sai no ensaio sem gravar.**
- Nenhuma OC de lá tem a Data antes de 21/04: a primeira é de 15/09.
- Conferi a revisão (`secoes` nulo) e passei pela tela a forma que a função monta: `itens: null`.

**O que eu não medi:**
- **a `material_a_chegar` chamada de verdade:** ela pede o login de um encarregado ou de um comprador, e eu não entro
  com senha;
- **a `registrar_entrega` e a `arquivar-documento`:** elas gravam, e esta casa não grava no banco.
  - Li as duas no ramo do Banco (`0e1b3a9`), e as chaves batem com o que a tela manda.
  - Uma entrega de verdade no ensaio, com a foto do papel, é a medida que falta. **Proponho que ela entre no teste
    do Pedro**, que já tem o login, quando o ramo 1 for juntado à cópia do ensaio. Do lado da tela, não há trabalho a
    mais;
- **a leitura de um papel de verdade:** é a pergunta 4 do Banco, e espera a sua ordem.

## §4 — A prova

- **a bateria:** 1143 testes, com tipos e lint limpos. São 2 novos (a nota e a falta de caixa), e os do serviço e da moldura ajustados ao contrato;
- **40 sabotagens, as 40 vermelhas**, e verde de volta ao restaurar. São as 31 de antes e 9 novas:
  - o `o_que_pede` lido como lista;
  - a revisão fora do `o_que_pede`;
  - o rótulo que some;
  - o rótulo em branco que fica;
  - a leitura que não sobe com o papel;
  - a chamada sem o `extracao`;
  - a leitura sem a resposta como veio;
  - a nota que vira linha da lista;
  - a caixa vazia;
- **o tamanho:** +83 e −24 em `src` sobre o `69e92d7`. O ramo inteiro tem +627 e −14 em `src`, ainda abaixo das mil linhas.

## §5 — Daqui em diante

1. **A D814 vem primeiro, agora:** o perfil sem a Ordem de Compra, num ramo próprio, sem publicar.
2. **Depois, o ramo 2, a qualificação**, contra o banco falso, com os nomes do Banco:
   - `guardar_registro_do_fornecedor`;
   - `corrigir_registro_do_fornecedor`, com a correção na `registros_do_fornecedor_correcoes`;
   - `ecrs_registro_a_cada_entrega`;
   - a origem `qualificacao-fornecedor`, com o `fornecedor_id`.

   Antes de pedir qualquer chamada nova, leio essas no ramo do Banco.
3. **O ramo 1 vai ao ar** depois da medida da gravação e da sua ordem.
4. **O teste do Pedro na parte B** passa na frente quando vier. O servidor dele continua no `1647826`.

**O banco não mudou.** Fiz só leituras no ensaio: três consultas, com funções e tabelas que não gravam.

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** O texto das ECRs é o do
documento. O resto das fotos é inventado.

— `Ordem_de_Compra`
