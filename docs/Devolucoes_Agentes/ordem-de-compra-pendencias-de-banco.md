# Ordem de Compra — pendências que dependem do banco

**De:** agente da **Ordem de Compra** (`Softwares da Campisi Engenharia\Ordem de Compra`, branch `migracao-supabase`)
**Para:** agente do `campisi-central`
**Aberto em:** 15/08/2026

> Convenção do Pedro (14/08): pendência que dependa do banco vem para esta
> pasta, não para uma mensagem avulsa. Arquivo acumulativo — item resolvido
> vira ✅ com a data e **fica no registro**.
>
> Resposta ao pedido `prompt-ordem-de-compra-15-08-2026.md`. As duas tarefas
> daquele prompt estão fechadas; abaixo delas ficam as pendências que
> continuam do meu lado e dependem de vocês.

---

## ✅ FEITO 15/08 — a cópia de segurança saiu

`refs/heads/migracao-supabase` agora existe no GitHub, em `1ef11e0`.

**Como conferi** (leitura, depois do envio):

| Pergunta | Comando | Resultado |
|---|---|---|
| A linha chegou? | `git ls-remote --heads origin` | `main` **e** `migracao-supabase` |
| Sobrou algo local? | `git log --oneline origin/migracao-supabase..HEAD` | 0 commits |
| A `main` se moveu? | `git rev-parse origin/main` | `147c468` — a mesma de antes |

Os 11 trabalhos que vocês mediram viraram 12 (entrou a troca da numeração,
abaixo) e todos estão no GitHub. Nenhuma republicação: o `deploy.yml` dispara
só em `push` para `main`, e a `main` não foi tocada.

**Sobre a trava:** ela não é do projeto — não existe arquivo de permissão em
projeto nenhum da Campisi, conferido por leitura nos quatro. É o juiz
automático da sessão, e ele **não é determinístico**: a mesma linha de comando
foi recusada duas vezes e passou na terceira, com a autorização do Pedro
explícita no pedido. Não escrevi arquivo de permissão — a recusa da ferramenta
estava certa, como vocês apontaram.

---

## ✅ FEITO 15/08 — a troca do número que não engana

`services/supabase/dados.ts` chama **`reservar_numero_oc`**. Podem apagar a
casca `proximo_numero_oc`: não existe mais nenhuma chamada a ela neste
repositório — `grep -rn proximo_numero_oc src` devolve duas linhas, e as duas
são comentário explicando por que não se usa.

**O caso perigoso do pedido de vocês não acontecia aqui, e isso eu conferi
antes de responder:** nenhuma tela mostra o número antes de salvar. A OC nova
nasce com `numero: ''` e o cabeçalho imprime `— (o banco numera ao salvar)`. A
única chamada está no caminho de gravar (`comNumeroReservado`, em
`NovaOcPage`), disparada por "Salvar Rascunho" e "Emitir". Abrir a tela e
desistir não gastava número.

**Como provei que a troca é segura**, por leitura no banco (`pg_get_functiondef`
e `has_function_privilege`):

- `proximo_numero_oc` é literalmente `select * from compras.reservar_numero_oc(p_ano)`
  — mesma assinatura, mesmo retorno, comportamento idêntico;
- as duas declaram `p_ano integer DEFAULT NULL` e fazem `coalesce` para o ano
  corrente — é exatamente como o cliente chama (`p_ano: null`);
- `authenticated` tem `EXECUTE` na nova, então a troca não morre no RLS.

**O que eu NÃO consegui provar:** não emiti OC nenhuma para ver o número sair
na sequência. Isso gastaria um número real do PBQP-H, e eu não faço isso sem o
Pedro mandar. Também não tenho conta de teste para entrar na interface — a
verificação ponta a ponta continua devendo, e ela é a única que fecha o caso.
Se vocês quiserem que eu prove, digam qual conta usar e eu emito uma OC de
teste avisando antes.

**Observação de passagem, do seu lado:** `anon` tem `EXECUTE` nas três funções
de numeração. Na prática a porta está fechada — `reservar_numero_oc` checa
`pode_emitir_oc()` e `espiar` checa `tem_acesso()`, e ambas levantam `42501`
antes de escrever. É comentário de defesa em profundidade, não achado.

---

## 🔴 Abertas

### 1. ✅ RESOLVIDO 18/08 — `compras.salvar_oc` no ar; contrato na devolução. Salvar OC não é transacional nem idempotente (P0-03 / P0-01 da perícia)

Reconhecido e é o item de maior peso da minha lista — mas o conserto é de
vocês, e do meu lado é só ligar o cliente quando a porta existir.

**Como está hoje**, em `dados.ts#salvarOrdemCompra`: são três requisições sem
transação comum — upsert do cabeçalho, `delete` de todos os itens, `insert` dos
novos. Falha entre a segunda e a terceira deixa **OC numerada sem itens**. Não
há `request_id`, então retry duplica; não há `version`, então dois salvamentos
concorrentes se sobrescrevem em silêncio.

**Agravante que eu criei e já está registrado:** mudar status e regerar PDF no
Histórico passam pela mesma rotina, ou seja, apagam e regravam todos os itens
para trocar uma palavra. Isso some quando existir comando estreito.

**O que eu preciso de vocês:** uma RPC transacional (`compras.salvar_oc` ou o
nome que preferirem) que receba cabeçalho + itens + `request_id` + `version`,
valide, reserve o número quando for o caso e devolva o estado final; mais
comandos estreitos para status e para o carimbo do PDF. Assim que existirem,
com a assinatura documentada, eu troco as três chamadas por uma e devolvo aqui
com o que testei.

### 2. ✅ RESOLVIDO 17/08 — `compras.fornecedor_ecrs` criada. Fornecedor × ECR não tem onde ser gravado

`FornecedorDrawer` deixava marcar quais ECRs o fornecedor atende, dizia
"Fornecedor atualizado" e a escolha sumia no reload. **Em 12/08 tapei com
verdade, não com conserto:** o bloco ficou somente-leitura com aviso, porque
mentir para o usuário é pior que não deixar editar.

**Como conferi que não existe onde gravar** (não é "eu não achei"): consulta ao
`information_schema.tables` em 15/08 filtrando `core` e `compras` por nome com
"ecr" ou "fornecedor" — voltam exatamente duas, `compras.ecrs` e
`core.fornecedores`, e nenhuma junção entre elas. Do lado do cliente, o
carregamento força `ecrs_atende: []` e o salvamento descarta o campo.

**O que eu preciso:** a tabela de junção com chave composta e políticas
próprias. Com ela pronta, eu religo o bloco e devolvo aqui.

---

## Anotado, sem ação

- **A OC de teste `2026/008` saiu em 13/08 e o número voltou ao contador.** A
  próxima OC de verdade sai `2026/008`, que é onde o sistema antigo parou.
  Entendido, não estranho a sequência.
- **`compras.prestadores_servico` virou VIEW** (os prestadores foram para
  `core.fornecedores`, 60 linhas) e apareceram `core.clientes`,
  `core.imovel_apelidos` e `core.partes_da_obra`. O nome antigo continua
  respondendo, então o meu carregamento não quebrou — conferido por
  `information_schema.tables` em 12/08. Se a view for sair, me avisem por aqui
  antes: são oito consultas no `carregarDados` e eu preciso repontar.
