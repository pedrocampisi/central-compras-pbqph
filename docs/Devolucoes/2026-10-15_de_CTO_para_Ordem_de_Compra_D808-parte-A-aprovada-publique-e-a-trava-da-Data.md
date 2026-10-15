# D808 — A parte A está aprovada: publique. A trava da Data: sim. O campo velho sai da tela

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 16h0x
**Decisão:** D808 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D805-parte-A-no-ramo-6e2c80f-e-a-proposta-C.md`
**Espero de volta:** a carta de fecho da parte A, com a medida na produção. Depois da parte B, a tela da trava da Data num ramo, com fotos e sabotagens.

---

## §1 — A parte A está aprovada

Conferi:
- **As 8 fotos.**
  - A política sai palavra por palavra, uma vez por OC, antes das condições.
  - O registro de cada ECR vem na ordem da primeira aparição, com a revisão e os itens.
  - A OC sem ECR traz a frase.
  - A OC de 1 item cabe numa página, com as assinaturas.
  - A tela da qualificação ganhou o "antes e depois", o "Qualificada para" e as "ENTREGAS AVALIADAS".
- **O código do ramo** (`6e2c80f`):
  - a revisão que vale é a última com data até a Data da OC;
  - quando a leitura falha, o PDF não sai. Ele nunca sai com o texto de outra revisão;
  - a política não depende da configuração;
  - as datas são `date` no banco (`ecrs`, `ecr_revisoes`, `ordens_compra`), então a comparação por texto
    AAAA-MM-DD vale.
- **O CI:** verde no ramo.
- **O tamanho:** +371 linhas sem os testes, abaixo das mil da D624. Não pede perícia.

**Publique pela emenda 3:**
1. Tire antes o campo "Requisito de Qualidade" da Configuração (§3), no mesmo ramo, com o teste.
2. Junte no `main`, anote o desfazer (`ea46638b`) e publique.
3. Meça na produção sem gravar nada:
   - leia o texto do PDF de uma OC com ECR e o de uma OC sem ECR: a política, o título de cada ECR e a frase da OC
     sem ECR;
   - se o botão do PDF também guarda o arquivo na pasta da obra, use outro caminho;
   - não guarde foto da produção.

## §2 — A trava da Data: sim

A consultora disse na aula que a data da qualificação tem de ser anterior à do pedido. O PS.02 escreve o mesmo:
"A qualificação ocorre antes da compra/contratação".

**A regra mora no banco.** A carta ao Banco vai junto. Em resumo:
- é a mesma conferência que a emissão já faz, olhada em dois dias: hoje, como já é, e na Data da OC;
- a qualificação que vale na Data é a última de material da empresa com "qualificada em" até a Data. O mesmo dia
  vale;
- conta a data "qualificada em", e não o dia em que a qualificação entrou no sistema;
- a recusa sai com a mesma constraint de hoje, `oc_emitida_exige_qualificacao`.

**A frase da recusa:**
- sem qualificação na Data, mas com uma depois: "a Data da OC (dd/mm/aaaa) é anterior à qualificação de material do fornecedor (dd/mm/aaaa)";
- nos outros casos, o motivo de hoje, no passado, com "na Data da OC (dd/mm/aaaa), " na frente. Exemplo: "na Data da OC (15/09/2026), a qualificação de material do fornecedor não cobria a ECR 12".
- As frases exatas vêm na carta de volta do Banco, e eu as repasso.

**A sua parte vem depois da parte B e depois que a do Banco estiver no ensaio:**
- a tela antecipa a mesma regra, como já faz com a qualificação de hoje (D605, D609), nas duas portas de emissão: a
  Nova OC e a "emitida" do Histórico;
- como mostrar é seu. A regra e a frase são as do banco;
- um teste prova que o mesmo caso dá a mesma resposta na tela e no banco.

**Medi na produção, só lendo:** as 3 OCs com ECR têm a Data depois da qualificação de 07/05/2026, e a 2026/010 não
tem ECR. Nenhuma seria recusada.

## §3 — O campo "Requisito de Qualidade" sai da tela

- O PDF não o usa mais, e na produção ele está vazio.
- A coluna no banco fica. Um cliente antigo, em cache no navegador, ainda pode lê-la, e apagá-la não vale uma
  migration.

## §4 — A parte C vai ao Pedro hoje

Levo a ele as suas duas opções e a sua recomendação.

A minha recomendação a ele é a sua opção 1, sem a marca nas 50 linhas. Em vez da marca, a IA lê no próprio
certificado se ele tem validade, e quem põe confere.

Nada se constrói antes da palavra dele. Quando ela vier, vem carta.

Siga na parte B.

— CTO
