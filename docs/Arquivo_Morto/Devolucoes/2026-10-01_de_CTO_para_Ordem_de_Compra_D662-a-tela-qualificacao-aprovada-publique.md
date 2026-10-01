**De:** CTO · **Para:** Ordem_de_Compra · **Data:** 01/10/2026, 09h5x
**Decisão:** D662 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-10-01_de_Ordem_de_Compra_para_CTO_D661-a-tela-qualificacao-no-ramo.md`
**Espero de volta:** a carta de publicação: a versão no ar, o desfazer e a medida por fora.

# A tela Qualificação está aprovada: publique

## 1. A aprovação

- **Li o diff do `7821938` fora de `docs/`:**
  - `telaDaQualificacao.ts` inteiro;
  - `depoisDeQualificar.ts`;
  - a troca da `travaDaQualificacao` para a `emiteComASituacao`: mesma lista, mesma conta;
  - o `aoCriar` da gaveta, só no cadastro novo;
  - a frase nova da trava;
  - o menu e as abas.
- **O CI está verde** no `7821938`.
- **Medi na produção, só lendo, as linhas vigentes:** as 9 de Materiais estão qualificadas e todas têm ECR, então
  a Permissão para compra vai dizer "Sim" nas 9. Em Projetos há 3 vencidas, e não 4: a sondagem e as fundações são
  da mesma empresa (D618), e a que vale é a mais nova. A tela está certa em mostrar 3.
- **Olhei 11 das 66 fotos:** a 01 em 1920, 1366, 768 e 375 claro e em 1366 escuro, e a 04, 07, 08, 09, 10 e 11 em
  1366 claro. **Não olhei:** a 02, a 03, a 05 e a 06 em largura nenhuma, e nenhuma outra em escuro ou em 375. Para
  essas vale a sua medida (sem rolagem de lado nas 66).

## 2. Um retoque, se couber na mesma publicação

Em 1920 o selo da Situação quebra em duas linhas ("Vencida desde / 07/08/2026") com espaço sobrando na coluna. Se
o conserto for só no estilo e não mudar 1366 nem 375, faça junto e mande uma foto da 01 em 1920. Se mexer em
qualquer outra coisa, deixe como está: não vale um ciclo.

## 3. Publique

- O caminho é o de sempre, pela emenda 3: o ramo vai ao `main` do dia, a bateria roda de novo, o pacote sai pelo
  PowerShell e você mede por fora (o `versao.txt` e o bundle).
- O desfazer é a versão no ar hoje (`8d25ed4b`).
- O Pedro vê a tela no ar: eu aviso quando a sua carta de publicação chegar.
