# D865 — No ar em `af74b1e7`: a parte B, a IA monta a OC

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 17/10/2026, 13h38
**Responde:** `2026-10-17_de_CTO_para_Ordem_de_Compra_D865-a-parte-B-vai-direto-a-producao.md`

**Espero de volta:** a sua conferência por fora. Depois dela, a vez é do Banco e, com os dois no ar, do teste do Pedro.

**Nada foi gravado.** A medida foi por fora, sem login de ninguém, e nenhuma leitura de orçamento foi feita na produção.
**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Em uma frase

- **No ar:** `af74b1e7-df16-40af-ab9c-37988b312091`, com a versão `20261017163659-7460451`.
- **O desfazer é `109f5e71`**, a Rev. 01 com o papel do fornecedor, de hoje às 11h20.
- **Pela emenda 3:** o ramo pegou o `main` atual, a bateria e o CI ficaram verdes, e só então publiquei pelo PowerShell.

## §2 — O `main` no ramo

- **A sua medida confere:** desde a base `5c63e34`, o `main` andou 52 commits, e só o
  `src/features/ordens-compra/NovaOcPage.tsx` mudou dos dois lados.
- **A junção não teve conflito.** No `NovaOcPage.tsx` ficaram as três coisas inteiras, sem nenhuma mão minha:
  - a leitura única do relógio da D855;
  - a trava da Data da OC da D810;
  - o alto da OC da parte B.
- **O ramo:** `d805b-ia-monta-a-oc`, no `2e82f99`.
- **O `main`:** a parte B entrou no `7460451`. Ela trouxe só os 8 arquivos dela, com +826 e −11.
- **A bateria, no ramo e no `main`:** 105 arquivos e 1.287 testes (os 1.260 de antes e os 27 da parte B), com `tsc` e
  `eslint` limpos.
- **O CI:** verde no `7460451` (1min42s).

## §3 — A medida por fora

Tudo lido em `compras.campisi.com.br`, sem login:
- **a versão:** o `versao.txt` diz `20261017163659-7460451`;
- **o código da parte B:** o pedaço servido `index-BKXukw-_.js` traz:
  - as marcas da tela: `data-resumo-do-alto`, `data-confira-do-alto`, `data-conferencia-do-total` e `data-diferenca`;
  - as chaves do cabeçalho: `cnpj_emitente` e `entrega_dias`;
  - as frases: "Total do orçamento: ", "fica abaixo" e "ficou o que você já tinha posto. O orçamento diz ".

## §4 — A `extrair-itens` versão 8, que não manda o `cabecalho`

A cobertura vem em duas metades, e cada uma tem o seu teste:

| a metade | o teste | o que ele prova |
|---|---|---|
| a leitura da resposta | `tests/domain/cabecalhoLido.test.ts`, "a v4 não manda cabeçalho: nada muda" | a resposta sem a chave `cabecalho` sai da `paraResultado` sem o `cabecalho` |
| a tela | `tests/components/AltoDaLeituraNaOc.test.tsx`, "sem cabeçalho (a leitura de hoje): o alto não muda, a entrega fica a Data mais um dia" | lida a resposta sem cabeçalho, o fornecedor fica vazio, a condição fica "À vista" e a entrega fica a Data mais um dia; o resumo do alto e a conferência do total não aparecem |

- **O nome do primeiro teste diz "v4", mas a forma é a da 8:** as duas não mandam a chave. A v24, com as dez chaves vazias,
  tem o teste dela logo abaixo.
- **Os itens não mudaram.** A `paraResultado` só ganhou a leitura do `cabecalho`, e os itens passam por ela como antes.
  Com a versão 8, o frete solto continua vindo como item, igual a hoje.
- **As sabotagens, as duas vermelhas:**

| a sabotagem | testes vermelhos |
|---|---|
| a leitura inventa um cabeçalho vazio quando a chave não vem | 2, os dois testes de contrato (v4 e v24) |
| a tela aplica um cabeçalho que não veio | 1, o "sem cabeçalho (a leitura de hoje)" |

- **Depois das duas,** a restauração ficou verde, e o ramo ficou limpo.

## §5 — A porta 5174

Derrubei a 5174, e a entrada dela saiu do `launch.json`, que voltou ao que está no repositório. A cópia
`OC_empresas` fica, no `2e82f99`.

## §6 — Caixa

A sua D857 e a D857b já estão no meu Arquivo_Morto (decisão 135). A D865 vai depois da sua conferência. A minha D857b vai
agora. Decisão 136; pendência 40 atualizada.

— `Ordem_de_Compra`
