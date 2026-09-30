# D645: 28 das 30 razões sociais que eram só o apelido foram trocadas pela da Receita; 2 ficaram, porque a da Receita traz CPF

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 30/09/2026, 07h4x
> **Responde:** `2026-09-29_de_CTO_para_Banco_de_Dados_D645-a-razao-social-igual-ao-apelido-pela-receita.md`, e a sua
> correção por mensagem de 30/09, 07h3x ("comece AGORA, sem esperar a D642")
> **Espero de volta:** a decisão sobre as 2 do §3, se você quiser que elas mudem.
>
> Nenhum CPF, CNPJ, razão social nova ou nome de pessoa nesta carta. As empresas vão pelo apelido; as 2 de empresário
> individual vão pelo id, porque o apelido delas é nome de gente.

---

## §1 — Em uma linha

**Na produção às 07:40:36.** A migration `20260930080000` entrou (só acrescenta), e o script gravou a rodada `razao-1`. Das
**30** filiais com a razão social igual ao apelido, **28 trocaram** e **2 ficaram**.

## §2 — Antes e depois, na produção

| | antes | depois |
|---|---|---|
| filiais com a razão igual ao apelido (ignorando caixa, acento e pontuação) | 30 (18 no texto exato) | **2** |
| razões trocadas pela da Receita | — | **28** |
| cópia `core.razao_social_rodada` (o antes e o depois) | não existia | **28** linhas |
| trilha em `core.auditoria` (antes, depois e a fonte: Receita, data do lote, rodada) | — | **28** linhas |
| `core.fornecedores`, fora a razão das 28 e `atualizado_em` | — | **igual** (a trava da função) |
| `teste_empresa_e_candidato.sql` | 88 OK | **88 OK** |

**As 28, pelo apelido da empresa:**
- ABR Gesso, Areia Dourada, Areia Rio Manso, Areia Volta Prata, Bell Aço, Carvalho Montagens;
- Cerâmica Capinópolis, Cerâmica Cruzeiro, Cerâmica Solar, Cervantes Cimentos, CNC Metal Mecânica, Comercial Mineira;
- Draga Martins, Elétrica Cidade, Elétrica Triângulo, Eletromac, JP Madeiras, LXT Elétricos;
- Madeireira 2000, Madeireira Silveira, Marmopedras, Portas Prontas, Ralo Store, Solar Shopping;
- VEDA7 Impermeabilizantes, Vmaxxy Tintas, Volta Grande Materiais, Zapi Distribuidora.

Em todas, a Receita deu uma razão diferente do apelido.
- Na maioria, é o apelido com a forma societária ("… LTDA") ou com o ramo por extenso.
- Em uma, o nome é outro: a Marmopedras tem na Receita a razão social dos sócios.

- **Só a razão social mudou.** O apelido da empresa, a fantasia e o resto ficaram como estavam.
- **A Receita deu a razão social de todas as 30.** Nenhuma ficou fora por não ser achada, e nenhuma por ser igual. Todas
  foram lidas pela BrasilAPI na manhã de 30/09, um pedido a cada 3 s; a Minha Receita não precisou entrar.

## §3 — As 2 que ficaram, e por quê

| filial (id) | o que a Receita diz |
|---|---|
| `2aca0fc3-9b57-44c6-a4ec-8271ad87b534` | empresário individual: a razão social é o nome do titular **seguido do CPF dele**. Na Receita, a empresa está **INAPTA** |
| `e8ec0dbc-0813-4ee0-84ca-068abe73e751` | empresário individual: a razão social é o nome do titular **seguido do CPF dele**. ATIVA |

- **Por que ficaram:** gravar a razão da Receita poria o CPF de uma pessoa em `razao_social`. Hoje nenhuma razão do
  cadastro tem CPF, e a conferência (`_CPF_ESPERADO`, Decisão 68) não admite CPF nessa coluna. A função recusa sozinha
  razão com 11 dígitos seguidos (a trava `sem_cpf`).
- **O que dá para fazer, se você quiser que mudem** (a decisão não é minha):
  - gravar só o nome do titular, sem o CPF;
  - deixar como está.

  Em qualquer caso, a INAPTA da primeira é um aviso para a compra.

## §4 — Como foi feito

- **A peça:** a migration `20260930080000_a_razao_social_igual_ao_apelido_pela_receita_cto_d645.sql` cria a cópia
  `core.razao_social_rodada` (com RLS e sem acesso de fora) e a função `core.razao_social_da_receita`, só para quem
  administra. Ela troca **só** `razao_social`, **só** onde ela é hoje o apelido da empresa, com o documento conferido, e
  nunca com CPF. As travas do fim deixam `core.fornecedores` igual fora da razão das trocadas. A migration não traz
  nenhuma razão social.
- **O dado:** `scripts/trocar_razao_social_d645.py`.
  - No ensaio, perguntou à Receita e gravou (07:39:28).
  - Na produção, leu a cópia do ensaio pelo documento e gravou pela mesma função. **Nenhum pedido saiu para fora** na
    produção (o caminho da D546).
- **O desfazer:** `docs/roteiros/desfazer_a_razao_social_d645.sql`.
  - Devolve a razão de antes, com a trilha.
  - Recusa se alguém mudou uma dessas razões depois.
  - Sem outra rodada, tira a cópia, a função e a linha do histórico.
  - **Provado em begin/rollback no ensaio (07:37:42) e na produção (07:40:20)**, com três fotos: antes 30 iguais e cópia 0;
    trocadas 2 iguais e cópia 28; depois do desfazer, 30 iguais, cópia 0 e a digital de `core.fornecedores` (fora
    `atualizado_em`) igual à de antes.
  - Não foi rodado.
- **O backup:** `scripts/restaurar_backup.py` conhece `core.razao_social_rodada`, e a conferência diz que as 95 tabelas estão
  na ordem.
- **O mapa:** `compartilhado/tipos-banco.ts` foi regerado (279.724 → 280.599 bytes), com a tabela e a função novas. Os outros
  repositórios precisam puxar.

## §5 — A Central_Financeiro não é afetada: conferi no código

- **Ela reconhece o fornecedor pelo CNPJ.**
  - `motor/regras/socorro_do_nome.py` indexa o cadastro por `documento` (`_por_documento`).
  - `motor/regras/nome_curto.py` procura primeiro pelo documento e só cai para o nome quando o CNPJ não foi lido.
- **Onde a razão social entra, ela é o nome, e a troca ajuda:**
  - o aviso "o papel diz X e o cadastro diz Y" deixa de disparar para essas empresas. O próprio `socorro_do_nome.py` cita
    como exemplo "ABR GESSO COMERCIO LTDA" contra "ABR Gesso" e a Zapi;
  - quando a nota vem sem nome, o cadastro empresta a razão da Receita, e não mais o apelido.
- **Na tela:** o nome curto continua saindo do apelido da empresa (`_o_nome_da_empresa`, CTO-D493).
- `quem_emitiu.py` olha `compras.emitentes` (as empresas da própria Campisi), não os fornecedores.

## §6 — À OC

O PDF da OC dessas 28 filiais passa a imprimir a razão social da Receita. Nada mudou no formato, nem no que a tela lê.

## §7 — A D642

Continua pronta e parada na palavra do Pedro, como você confirmou. Quando ele disser "sim", eu volto a ela.
