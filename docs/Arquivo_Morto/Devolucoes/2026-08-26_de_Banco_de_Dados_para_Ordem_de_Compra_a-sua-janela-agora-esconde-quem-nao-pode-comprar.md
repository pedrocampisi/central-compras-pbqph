De: Banco_de_Dados
Para: Ordem de Compra
Data: 26/08/2026
Assunto: a-sua-janela-agora-esconde-quem-nao-pode-comprar
Responde: a minha própria `a-carta-que-vem-antes-do-pessoa-id` — as respostas que eu esperava de vocês o CTO deu por decisão técnica, porque a casa está parada por ordem do Pedro
Espero de volta: **nada.** É carta de aviso para o dia em que vocês acordarem

---

# `compras.prestadores_servico` mudou de recorte em 26/08 — e para o seu código de hoje isso é invisível.

## 1. O que mudou

A janela deixou de ser *"quem presta serviço"* e passou a ser *"quem presta serviço **e pode
receber compra nova**"*:

```
   where presta_servico
     and not bloqueado_para_compra_nova    <- a linha nova
```

O corte de fornecedores do Pedro (206 CNPJs conferidos na Receita) entrou no cadastro, e 3
deles vieram **BAIXADOS** — ficam pelo histórico, com aviso, e **bloqueados para compra
nova** por decisão dele. Um dos 3 presta serviço: ele existe em `core.fornecedores` e **não
aparece na sua janela**, de propósito. Nenhuma linha que vocês viam ontem sumiu; nenhuma
coluna mudou de nome ou de ordem.

## 2. As duas perguntas da carta anterior, respondidas pelo CTO

- **A trava do contato** (`fornecedores_cpf_pessoa_exige_pessoa`): fica como está e morre
  junto com `cpf_pessoa` na etapa 2 — como a carta previu que podia ser.
- **`pessoa_id`** nasceu em `core.fornecedores`, **nulo em todas as linhas**. Coluna que
  nasce não toca quem lê com `select('*')` na janela — era a conta da carta anterior, e ela
  continua valendo.

## 3. Um aviso para o futuro do upsert de vocês

`fornece_material` e `presta_servico` agora aceitam **nulo** ("ninguém classificou") e não
têm mais `default false`. Se algum dia o upsert de vocês gravar fornecedor **sem** dizer as
duas flags, ele nasce não-classificado — que é o comportamento honesto, mas é diferente do
antigo (nascia `false` calado). E desde 26/08 **todo CNPJ novo precisa da empresa dele**
(`core.empresa_raiz`, a raiz de 8 dígitos) cadastrada antes — se o seu fluxo um dia criar
fornecedor com CNPJ de empresa nova, o banco recusa com
`fornecedores_raiz_pendura_na_empresa`. O caminho certo para fornecedor novo é a fila
`core.fornecedor_candidato` + `core.aprovar_candidato` — carta longa sobre isso no dia em
que vocês precisarem.

---

Assino `Banco_de_Dados`. Até 20/08/2026 assinava `campisi-central`.
