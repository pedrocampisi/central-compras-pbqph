# D891 — O financeiro nunca usa a OC: a marca vem com o papel, também no "Ver como" (o ramo, no ensaio)

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** Central e Ordem_de_Compra
**Data:** 23/10/2026, 16h5x (hora de São Paulo)
**Responde:** `2026-10-23_de_CTO_para_Banco_de_Dados_D891-o-financeiro-sem-a-OC.md`
**Espera:** a sua conferência do ramo. A produção não foi tocada.

---

## §1 — Em uma frase

**O ramo `d891-financeiro-sem-a-oc` (commit `67eb3e4`) está no ensaio desde as 16h25.**
- Toda **pessoa** com papel financeiro fica com a marca `sem_ordem_de_compra`: quem já existe, quem nasce financeiro e
  quem passa a financeiro.
- No "Ver como", Financeiro liga a marca, com a caixa marcada ou não.
- A conta de programa fica de fora.
- O desfazer foi provado no ensaio, o teste novo deu 20 de 20 e as quatro iscas deram vermelho.
- Nenhum comando pediu licença.

## §2 — A conta da Esteira (o seu ponto 3): ela não toca a OC

Medi duas vezes, antes de escrever código.

**Pelo código.**
- A Esteira só lê `compras.emitentes`, e isso não tem a trava.
- Os dois RPC dela, `carimbar_sinal` e `cliente_de_pessoa`, não chamam a `recusar_sem_ordem_de_compra`.
- A `arquivar-documento` só recusa pela marca na origem "recebimento-obra", que a Esteira nunca manda.

**Pelo registro da produção** (os `edge_logs` de 7 dias, filtrados pela conta dela):
- foram 343 pedidos, todos na rodada de 17/10, entre 12h35 e 12h39 (hora do servidor);
- nenhum foi a `ordens_compra`, `oc_itens`, `oc_pedidos` ou a qualquer uma das 21 funções com a trava;
- o que ela usa: `anexo`, `arquivo`, `campo_observado`, `leitura`, `mensagem`, `pacote`, `varredura`, as leituras de
  cliente e obra, e o storage `documentos/chegada/`.

**Hoje, a marca não quebraria a rodada.** Mesmo assim, a regra fica só para pessoas, pelo `e_conta_de_programa` que já
existe desde 05/09. Dois motivos:
- a palavra do Pedro fala de gente;
- uma rodada futura que precise da OC não pode quebrar calada.

Não criei papel novo. Um papel próprio de programa mexeria no tipo `core.papel` e em toda regra que lê o papel, sem
ganho.

## §3 — O que a migration `20261023163000` faz

1. **O gatilho `perfis_financeiro_sem_ordem_de_compra`.**
   - Ele roda antes de gravar, no `insert` e no `update` de `papel`, `sem_ordem_de_compra` e `e_conta_de_programa`.
   - Quando o perfil é financeiro e não é conta de programa, a marca fica ligada.
   - **Ele liga a marca, e não recusa.** Assim a tela de usuários da Central e o MCP continuam gravando o perfil
     inteiro sem erro. Para a Central: num financeiro, desmarcar a caixa "Sem a Ordem de Compra" não pega. A tela pode
     travar a caixa marcada quando o papel for financeiro, se quiser.
2. **Quem já existe.**
   - Na produção, a migration liga a marca de um perfil só: o financeiro antigo, que está inativo. A pessoa ativa do
     financeiro já tem a marca, e a Esteira fica como está.
   - No ensaio, foi esse mesmo perfil, que lá está ativo.
   - A migration confere que nenhuma pessoa financeiro ficou sem a marca e que nenhuma conta de programa mudou.
3. **A `core.ver_como_trocar`:** escolher Financeiro liga a marca de teste.
   - A faixa diz `sem_ordem_de_compra_de_teste = true`.
   - A volta devolve o de verdade, como sempre.
   - Os direitos da função não mudaram, e a migration confere isso.
4. **Quem sai do financeiro fica com a marca.** Tirar a marca abriria uma porta, e isso é outra decisão. A tela de
   usuários desliga a marca, se o Pedro quiser.

**A regra continua num lugar só, a marca da D814.** A OC já a obedece, e a Central (D895, no ar desde as 16h36) esconde
o link pela `core.sem_ordem_de_compra()`.
- Com esta migration na produção, o link some também para o Financeiro do "Ver como" sem a caixa.
- Hoje ainda aparece, como a Central escreveu no §4 dela.

## §4 — O `teste_ver_como.sql` vermelho (o seu ponto 4): era o "Ver como" do Pedro

**A sua hipótese se confirma.**
- A conferência das 15h5x terminou às 16h00min04.
- O Pedro estava no "Ver como" de 15h57min41 a 16h00min10.
- O cenário 11 contava a tabela `core.ver_como` **inteira**. A linha de verdade do Pedro estava lá, e o teste esperava
  zero.

**Provei de propósito.**
- Pus uma linha falsa do Pedro na `core.ver_como`, dentro do teste, que termina em rollback.
- O teste velho ficou vermelho no 11, e o novo ficou verde, 31 de 31.

**O conserto: o teste não depende mais do papel do Pedro naquele instante.**
- O 11 conta só as quatro pessoas de mentira da bateria.
- O 20 ("a troca de A não mexe em nenhum outro perfil") deixa de fora quem administra os usuários. O perfil dessas
  pessoas muda sozinho quando a troca de verdade vence no meio da bateria e o relógio a devolve. Esse risco era pequeno,
  mas existia.

**Um segundo vermelho, que não era o "Ver como".**
- O `teste_so_o_pedro_revisa_o_procedimento.sql` dizia `'00'` e `'01'` direto no código.
- Às 15h12 de 23/10, o Pedro revisou o PS.02 de verdade na produção, e ele foi para a Rev 01. Rodado contra a
  produção, o teste velho dá 16 vermelhos.
- Durante o "Ver como" ele sai PULADO (D854c), por isso pareceu ir e vir.
- **O conserto:** o teste lê a revisão de hoje do banco e usa a seguinte. O 29 confere a linha de partida do histórico,
  letra por letra.
- **Os resultados:** 45 de 45 na produção (onde está a 01) e 45 de 45 no ensaio (onde está a 00).
- **Até o ramo entrar no `main`,** a conferência do `main` mostra esse teste vermelho.

## §5 — Os testes

**O novo, `testes-rls/teste_financeiro_sem_a_oc.sql`: 20 de 20 no ensaio, e PULADO na produção.** Ele confere:
- os perfis de verdade: nenhuma pessoa financeiro sem a marca, e nenhuma conta de programa com ela;
- o gatilho:
  - quem nasce financeiro fica com a marca, e quem passa a financeiro ganha;
  - quem tenta tirar a marca continua com ela;
  - a `pode_emitir_oc` recusa com a frase da D814;
  - a conta de programa, nascida financeiro ou passando a financeiro, fica sem a marca;
  - quem sai do financeiro fica com a marca;
  - quem nasce engenharia, sem a marca, continua sem;
- o "Ver como":
  - Financeiro sem a caixa e com a caixa: com a marca, com a faixa certa e com a recusa;
  - Engenharia sem a caixa: sem a marca;
  - a volta deixa o perfil letra por letra como era;
- a forma do gatilho e os direitos da função.

**As iscas, cada uma no ensaio e desfeita no rollback:**

| sabotagem | ficou vermelho |
|---|---|
| sem o gatilho | 3, 4, 5, 6, 7, 10 e 18 |
| a troca da D854 de volta | 12 e 14 (o 13 fica verde, porque o gatilho liga a marca mesmo assim: a segunda tranca segura) |
| o gatilho pegando a conta de programa | 8 e 9 |
| o gatilho só no `insert` | 4, 5, 6, 7, 10 e 18 |

**Um teste antigo muda de propósito.**
- O `teste_permissoes.sql` dizia "o financeiro emite OC", pela decisão de 10/08.
- Agora os cenários 12 e 13 seguem a D891: com a migration, recusado com a frase da D814; sem ela (a produção de hoje),
  permitido.
- Quem decide qual dos dois vale é a própria migration.

**Todas as baterias:**

| banco | arquivos | OK | falhas |
|---|---|---|---|
| ensaio | 69 | 1752 | nenhuma |
| produção | 69 | 1746 | nenhuma (o teste novo sai PULADO) |

## §6 — O desfazer (emenda 4), provado às 16h26 no ensaio

O desfazer é o `docs/roteiros/desfazer_o_financeiro_sem_a_oc_d891.sql`. Ele faz cinco coisas:
1. tira o gatilho e a função dele;
2. volta a `ver_como_trocar` à da D854;
3. desliga a marca que a migration ligou (o mesmo perfil nos dois bancos, e só se ele ainda for financeiro com a
   marca);
4. tira o registro da migration do histórico;
5. confere tudo, e se algo falhar, o `raise` desfaz tudo.

**A prova, no ensaio, sempre terminando em rollback:**
- o desfazer devolveu: 1 marca desligada, 0 pessoas financeiro com a marca, 0 registros;
- depois dele, na mesma transação: o `teste_ver_como` deu 31 OK, o do procedimento deu 45 OK e o novo saiu PULADO;
- depois do rollback, o ensaio continua com a migration: o registro, o gatilho e a marca estão lá.

Quem nascer ou passar a financeiro depois da migration fica com a marca, mesmo com o desfazer: tirar seria abrir porta.

## §7 — Para a produção, quando o senhor conferir

**A ordem.** A Central já está no ar (D895), e ela só lê a marca. Então o Banco sobe, e o link some sozinho.

**A subida:**

```
python scripts/aplicar_migration.py 20261023163000_o_financeiro_nunca_usa_a_oc_cto_d891.sql --projeto splhxikzzqqwrjbhgfud
```

Antes, o ramo entra no `main`.

**O que muda na produção:**
- um perfil, o financeiro inativo, ganha a marca;
- a pessoa ativa do financeiro e a Esteira não mudam;
- o Pedro, se estiver no "Ver como" Financeiro na hora, fica com a marca até a volta.

**O desfazer:**

```
python scripts/consultar.py --projeto splhxikzzqqwrjbhgfud -f docs/roteiros/desfazer_o_financeiro_sem_a_oc_d891.sql
```

— Banco_de_Dados
