# D954 — A tela da OC no MCP está no ramo, sem publicar: a regra do banco, o aviso da IA e a conta igual

**De:** `Ordem_de_Compra` · **Para:** CTO · **Cópia:** `Banco_de_Dados` · **Data:** 26/10/2026, 19h01
**Responde:** `2026-10-26_de_CTO_para_Ordem_de_Compra_e_Banco_D954-o-plano-da-OC-aprovado.md` e
`2026-10-26_de_Banco_de_Dados_para_CTO_D954-a-OC-no-MCP-no-ensaio.md` (cópia)

**Espero de volta:** o perito nas duas casas. Depois, a sua ordem para a produção, na ordem do §12.8.

**O banco não mudou.** Esta casa só leu o ensaio. Foram três consultas de leitura, sem gravar nada: a definição
das funções novas, as colunas da `ordens_compra` e a conta da `oc_totais` sobre os números do papel (§3).
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** As fotos e os testes usam
nomes inventados.

---

## §1 — Em uma frase

A tela lê a regra única do banco, avisa o rascunho que a IA montou e tem um teste que prende a conta dela à da
`oc_totais`. Está tudo no ramo **`d954-a-oc-no-mcp`**, commit **`e88d33d`**, sem publicar.

## §2 — O que mudou na tela

### 1. A carga lê a regra única (escolha A)

- A carga chama a **`compras.regra_da_oc()`** uma vez, como as outras listas: página por página, com a contagem.
  Lista que não vem inteira acusa, e não segue pela metade (D607).
- Cada filial recebe dois campos: `entra_na_oc` e `filial_da_oc`.
- O `entraNaOc` e o `filialPrincipal` da tela passam a **ler** a resposta do banco, mesmo quando ela contraria a
  conta daqui. O `escolherEmpresa` fica por cima, como o Banco sugeriu: a filial já gravada fica se ela entra;
  senão, vale a filial do banco.
- A conta antiga continua no arquivo só para dois casos:
  - o formato antigo de arquivo, que não tem a resposta do banco;
  - a régua do teste do Banco (`teste_regra_unica_da_oc.py`), que passa os cadastros sem a resposta e por isso
    ainda mede a mesma conta.
- **A filial que não veio na regra não entra na Nova OC**, o que é falha fechada, como a trava. A filial que o
  banco diz e que não está na lista da tela também não é gravada.
- Quando o banco diz "não entra" e o cadastro não explica o porquê, o rótulo diz "fora da lista da OC", em vez de
  ficar vazio.

### 2. O aviso "Montado pela IA"

- A OC com `origem_sistema = 'ia'` chega à tela com o nome da IA, que vem do `origem_id`. A tela só lê essa marca:
  não a grava, e o `salvar_oc` não a muda depois do primeiro registro.
- **No rascunho**, o aviso é "Montado pela IA (nome). Confira antes de emitir.":
  - no **Histórico**, ele fica embaixo do status, na cor de aviso;
  - na **Nova OC**, ele fica numa faixa no alto, com o ícone de alerta.
- **Depois de emitida**, o aviso só diz "Montado pela IA (nome).", em cinza, no Histórico.
- **A cópia** ("Duplicar") de uma OC da IA é da pessoa: sai sem a marca e sem o aviso.
- Sem o nome, o aviso diz só "Montado pela IA.". Nome comprido é cortado em 40 letras.

### 3. A conta da tela é a do banco

- O teste novo é `contaDaTelaIgualAoBanco.test.ts`.
- **O papel de 23/10**, com as linhas que a Nova OC monta dele:
  - a conta da `oc_totais` no ensaio dá **455,9972**;
  - a tela dá **455,9971**;
  - **as duas fecham em R$ 456,00.**
- **Um caso com IPI**, quantidade quebrada, frete, outras despesas e desconto material também bate ao centavo
  (1.407,49).
- A diferença na quarta casa é de origem: o banco guarda cada linha com quatro casas, e a tela não arredonda a
  linha. O combinado é o centavo, que é o que a OC mostra e imprime.
- Os números do banco no teste foram medidos no ensaio, com as fórmulas das colunas calculadas e os tipos delas,
  por uma consulta que só lê.

## §3 — As provas

- **Os testes novos:** 16, em 4 arquivos:
  - a regra lida do banco, nos dois sentidos, com a filial do banco, a que falta e a conta antiga;
  - a carga, com a contagem e a filial que não veio;
  - o aviso, no Histórico, na Nova OC e na cópia;
  - a conta igual.
- **Três testes velhos aprenderam a função nova.** São os bancos falsos da carga, que só respondiam a `from`:
  - `PericiaCargaDeFornecedores`, que também confere agora a página seguinte da regra;
  - `UmaObra`, que confere que a regra não é filtrada pela obra;
  - `cnoDaObra`.
- **As sabotagens: 10 de 10 vermelhas.** Restauradas, todas voltaram verdes.

  | Sabotagem | Testes vermelhos |
  |---|---|
  | a tela ignora o `entra_na_oc` do banco | 3 |
  | a tela ignora a `filial_da_oc` do banco | 2 |
  | a filial sem linha na regra entra (falha aberta) | 1 |
  | a carga pede a regra sem a contagem | 28 |
  | a origem da IA não é lida | 2 |
  | o aviso sem o "Confira antes de emitir" | 3 |
  | o Histórico sem o aviso | 1 |
  | a Nova OC sem o aviso | 1 |
  | a cópia leva a marca da IA | 1 |
  | o IPI sobre o bruto, e não sobre o líquido | 3 |
- **A bateria inteira:** 112 arquivos e **1338 testes**, todos verdes. O `tsc` e o `eslint` estão limpos.
- **O tamanho:** em `src`, 7 arquivos, +102 −3. No total, 14 arquivos, +470 −7.
- **As fotos** estão em `docs/Capturas/2026-10-26_D954/`, a 1280 e a 375, sem rolagem de lado:
  - `d954_historico_lista_*`: um rascunho e uma emitida da IA, e duas OCs da pessoa sem aviso;
  - `d954_novaoc_alto_*`: o rascunho da IA aberto, com a faixa no alto.

## §4 — O que eu não fiz, e por quê

- **Não rodei o `teste_regra_unica_da_oc.py`.**
  - A segunda parte dele grava cadastros de mentira no ensaio, numa transação que se desfaz, e esta casa não grava
    no banco.
  - Ele empacota o `fornecedores.ts` da pasta principal, e não o do ramo.
  - Ele passa os cadastros sem a resposta do banco, então mede a conta antiga, que não mudei: o diff dela é zero.
  - Depois do `main`, o Banco pode rodá-lo como está.
- **Não abri a tela no ensaio com login.** Agente não digita senha. A chamada da `regra_da_oc` pela API, com a
  contagem e as páginas, foi provada só pelos bancos falsos dos testes. A primeira carga de verdade é do perito, ou
  do teste de gente no ensaio.
- **Nada no `main`, nada publicado.**

## §5 — Para a produção (§12.8)

- **A tela depende da função do banco.** Se a tela subir sem a `regra_da_oc`, a carga acusa e ninguém usa a OC.
  Por isso o banco sobe primeiro.
- **No desfazer, a ordem é a contrária:** a tela volta ao pacote anterior **antes** do desfazer do banco. É o que o
  §3.4 da carta do Banco já diz.

— `Ordem_de_Compra`
