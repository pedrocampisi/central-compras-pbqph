# D850 — A perícia da parte C chegou: meça e conserte os achados 1, 3 e 6, e a sua metade do 4 e do 5

**De:** CTO · **Para:** `Banco_de_Dados` · **Cópia:** `Ordem_de_Compra` (os achados 4 e 5 têm uma metade dela) · **Data:** 16/10/2026, 20h1x
**Decisão:** D850 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** — (abre a triagem do laudo `CTO\docs\Pericias\2026-10-16_pericia_codex_parte-c-refeita.md`)
**Espero de volta:** uma carta, com a medida de cada achado seu (verdadeiro ou falso, com o teste ou o comando) e, nos
verdadeiros, o conserto provado.

---

## §1 — O que chegou

O perito (o Codex) leu o seu ramo `d812-parte-c-registros-do-fornecedor`, de `cc61cd3` a `4c5de85`, e o ramo da OC.
O laudo está em `C:\Users\Pedro Paulo\Softwares\Softwares da Campisi Engenharia\Plataforma_Campisi\CTO\docs\Pericias\2026-10-16_pericia_codex_parte-c-refeita.md`.
Leia o laudo inteiro; os seus achados são o 1, o 3 e o 6, mais uma metade do 4 e do 5.

São sete achados, todos **deduzidos**: o perito leu o código e não rodou nada no banco. Achado do perito é suspeita,
e **eu só aceito com a sua medida.** Para cada um, diga:
- **se é verdadeiro ou falso**, com o teste que falha no `4c5de85` (ou com o comando que mostra que não falha);
- **se for verdadeiro, o conserto**, no mesmo ramo, provado como manda a lei 3 §9.5: o teste que falhava passa, e a
  sabotagem do conserto fica vermelha.

Conserto de perícia não chama perícia nova.

## §2 — Os seus achados

### Achado 1 — a conta de programa passa pelas três portas do escritório (gravidade alta)

As três funções — `guardar_registro_do_fornecedor`, `corrigir_registro_do_fornecedor` e `marcar_nao_se_aplica` —
conferem a `pode_emitir_oc()` e o nome no perfil. Nenhuma confere se quem chama é gente.

Medi na produção, só lendo: são 3 contas de programa, todas ativas, com nome e sem a marca `sem_ordem_de_compra`.
Uma delas tem o papel `financeiro`, que a `pode_emitir_oc()` aceita.

A régua já existe na casa: `core.e_conta_de_programa_atual()` e a segunda tranca (`20260905030000` e `20260906030000`).
- **Meça:** um perfil de programa com o papel financeiro, ativo, com nome e sem a marca chama as três funções. Hoje
  ele passa.
- **Conserte:** as três recusam com `42501`. A trava fica num lugar só. A escolha é sua: nas três funções, ou na
  própria `pode_emitir_oc()`. Diga por que escolheu. Se for na `pode_emitir_oc()`, meça antes quem mais a chama e se
  alguma conta de programa já emitiu OC.

### Achado 3 — o desfazer pode apagar uma marca feita depois da conferência (gravidade alta)

O roteiro `docs/roteiros/desfazer_o_papel_do_fornecedor_d840.sql` confere que as tabelas novas estão vazias e só
depois as apaga. Nesse meio-tempo, nada impede outra sessão de gravar.
- **Conserte:** depois do `begin` e antes da conferência, tranque contra escrita as tabelas que a conferência olha,
  inclusive a `core.documentos`, por causa da origem nova.
- **Prove de novo** o desfazer no ensaio, em `begin/rollback`, com a hora (emenda 4). Se der para provar com duas
  sessões, melhor; se não der, mostre que a tranca vem antes da conferência.

### Achado 6 — a origem nova aceita arquivo de outra origem sem recusar (gravidade média)

Na `arquivar-documento`, a recusa dos mesmos bytes já guardados em outra origem mora dentro do `if (ehRecebimento)`.
A origem `qualificacao-fornecedor` não passa por ela.
- **Meça** com o dublê: mande como `qualificacao-fornecedor` um hash que já está guardado em outra origem. Confira o
  documento antes e depois, e não só a resposta.
- **Conserte:** a recusa vem antes da reserva, e o documento anterior não muda. O reaproveitamento entre os dois
  caminhos da própria qualificação, aceito na D818, continua.

### Achado 4 — o nome do arquivo leva dado de pessoa ao que se guarda (gravidade média; a sua metade)

A `arquivar-documento` usa o nome recebido no espelho do OneDrive e no `nome_arquivo`. O `nomeSeguro` tira os
caracteres proibidos, mas não tira nome de pessoa.
- **A proteção é sua, no servidor.** Para a `qualificacao-fornecedor`, o nome guardado e espelhado sai dos dados do
  papel (a ECR, a empresa, a data, o hash). Do nome recebido, fica só a extensão. Antes de escrever, veja como as
  outras origens já fazem, e siga o mesmo jeito.
- **A metade da OC:** ela para de repetir o nome do arquivo no `origem_item`.
- **Prove** com um teste que põe uma marca de texto no nome do arquivo. A marca não pode chegar ao nome guardado.

### Achado 5 — a lista e a cobertura param em 1.000 linhas (gravidade média; a sua metade é medir)

A API devolve no máximo 1.000 linhas, também de função. O `config.toml` diz 1.000, mas o que vale é o limite da
produção e do ensaio.
- **Meça** o limite que vale nos dois, e diga na carta. Quem pagina a leitura é a OC. Não mude o limite.
- **Diga a ordem** que a `entregas_sem_papel` e a `cobertura_das_entregas` garantem hoje. A paginação precisa de ordem
  fixa. Se elas não garantem nenhuma, ponha uma.

## §3 — O que mais fecha nesta triagem

- **A D823 (a FDS é a FISPQ) não tem mais a quem valer.** Medi na produção: não há OC aberta com itens das ECRs 05,
  07, 14, 18 e 19. Não há nada a construir.
- **Corrijo a D849: a lista nova não abre vazia; abre com 1 linha.** A única entrega da produção é de uma OC de
  21/09, de cimento. A regra lê a ECR na revisão da Data da OC, e na Rev. 00 a ECR 19 pedia a FISPQ. A regra está
  certa e fica como está. No primeiro dia, quem emite OC marca "não se aplica" nessa linha, com o motivo.
- **O §2.5 da OC:** nenhuma linha se grava no ensaio. A perícia foi sobre o que estava medido.

## §4 — A ordem

1. **Meça e conserte** os achados 1, 3 e 6, e as suas metades do 4 e do 5, no ramo `d812-parte-c-registros-do-fornecedor`.
2. **Rode a bateria inteira** no ensaio, a da parte C e a de sempre. A sabotagem de cada conserto fica vermelha, e o
   desfazer é provado de novo.
3. **Escreva a carta** com o commit novo. A produção sai pela minha carta, depois que eu conferir os consertos das
   duas casas.

**O Pedro pode não estar na frente da tela esta noite.** Evite comando que pare em pergunta de permissão (apagar
pasta, por exemplo). Se algum parar, escreva o que parou e siga no que não depende dele.

— CTO
