**De:** CTO · **Para:** Banco_de_Dados e Ordem de Compra · **Data:** 28/09/2026, 12h5x
**Decisão:** D609 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-28_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D604-o-contrato-da-qualificacao-e-da-entrega.md`

# A lista casada está conferida; vai à produção tudo menos as duas travas, que entram depois da tela

## 1. A lista casada (§6): conferida, com os três ambíguos aceitos

Conferi as ECRs na produção. As três marcas ficam como você casou:

- **Tubo → 12.** A 12 é a única ECR de tubo hidráulico. Eletroduto seria a 13. E a empresa é comprada
  pela 12: as OCs 2026/004 e 2026/008 são dela.
- **Aditivos → 05.** A 05 ("Cal, Gesso Corrido e Aditivo") é a única ECR com aditivo.
- **Telas → 01.** Não existe ECR de tela. A tela soldada é armadura de aço, então vai na 01.

Os 9 que não casaram, eu procurei de novo na produção, pelos nomes da planilha, e não há cadastro
deles. O que fazer com eles é do Pedro (§3).

## 2. O ok para a produção, com uma mudança: as duas travas ficam para depois

Conferi a metade que recebe: **a OC que está no ar** (`main` `cd863fb`) emite pelo `salvar_oc` e
marca "✓ Entregue" pelo `definir_status_oc`. Se as duas travas entrarem hoje:

- **o "✓ Entregue" dá erro para todo mundo**, porque não existe avaliação e a tela no ar não tem como
  fazer uma;
- **uma OC com ECR para qualquer uma das empresas sem qualificação não emite**, e a tela no ar não
  tem o "Qualificar agora". Não há saída.

Então:

1. **Vão à produção agora:** as tabelas, as funções, as vistas, o `entregue_em` e a carga, com a
   prova de aceite da 2026/008 dentro da migration.
2. **As duas travas (`oc_emitida_exige_qualificacao` e `oc_entregue_tem_avaliacao`) não ficam ativas na
   produção.** Você escolhe o jeito: uma migration separada, ou criadas desligadas. Diga qual. Elas
   ligam **no mesmo dia em que a OC publicar as telas da D604**, logo depois da publicação: a tela
   primeiro, a trava depois. O contrário deixa a equipe sem saída.
3. **O teste na produção** diz PULADO nos cenários das travas até elas ligarem. Diga como ele sabe
   disso.

O resto do contrato está aceito como veio. Isso inclui o efeito do §4: a OC emitida para empresa
que venceu não regrava item com ECR.

## 3. Para a Ordem de Compra, no plano da D604

Diga numa linha se a gaveta de fornecedores da OC **cadastra fornecedor novo na produção hoje**, pessoa
jurídica e pessoa física. É o caminho para os 9 da planilha que não têm cadastro, se o Pedro disser
que entram.
