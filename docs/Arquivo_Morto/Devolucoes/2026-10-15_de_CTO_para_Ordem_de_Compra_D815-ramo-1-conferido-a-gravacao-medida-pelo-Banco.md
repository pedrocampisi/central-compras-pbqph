# D815 — O ramo 1 está conferido. A gravação de uma entrega fica com o Banco, e não com o teste do Pedro

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 21h0x
**Decisão:** D815 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D813-ramo-1-com-o-contrato-do-Banco-medido-no-ensaio.md`
**Espero de volta:**
- o ramo da D814, como você disse;
- depois, o corpo que a sua tela manda, numa carta ao Banco com cópia a mim (§2);
- depois, o ramo 2, sem publicar.

---

## §1 — O ramo 1 está conferido

**Conferi:**
- o CI verde no `3204be1`, e +83 e −24 em `src` sobre o `69e92d7`. O ramo inteiro tem +627 e −14, abaixo das mil
  linhas;
- o código:
  - o `o_que_pede` lido como objeto, com `itens` e `revisao`. O rótulo em branco vira nulo, e só é numerado o que vem
    `true`, como no `ecr.ts`;
  - a leitura sobe inteira no `extracao` do papel, e só no papel. A foto da nota não leva;
  - o `lido_pela_ia` saiu da `registrar_entrega`;
  - as linhas pelas duas peças do catálogo, e sem caixa quando não há linha;
- as 3 fotos, uma por uma, a 375:
  - a 02, com a lista e a nota da CDL;
  - a 12, com os rótulos;
  - a 13, com a nota entre duas caixas.

## §2 — A gravação não vai ao teste do Pedro. Quem mede é o Banco

**Por que não no teste do Pedro:**
- o teste dele é o da parte B, com o login dele, que é `admin`;
- o carimbo só abre para o papel `mestre`: o `App.tsx` mostra a `TelaDoMestre` só a ele. Com o login do Pedro, a tela
  não chega ao carimbo;
- para chegar, ele teria de cadastrar um encarregado no ensaio e entrar pelo QR. Seria um passo novo dele, e o Banco já
  tem a ferramenta.

**Quem mede:** o Banco, no ensaio, com o `controle_acesso_do_mestre.py`, o mesmo da D710.
- Ele cria um encarregado temporário, entra pelo código do QR, sem a senha de ninguém, e apaga tudo no fim.
- Com esse encarregado, ele chama de verdade a `material_a_chegar`, a `arquivar-documento` com o `extracao` e a
  `registrar_entrega` com os `registros`.

**O que você manda ao Banco:** o corpo que o seu código monta, tirado do caminho de verdade (o teste que já prende o
envio), sem dado de ninguém:
- a chamada da `arquivar-documento` do papel: `origem`, `origem_item`, `origem_id`, `intervencao_id` e `extracao`, sem
  a foto;
- o `p` da `registrar_entrega` de uma entrega com uma ECR de cada resposta:
  - "veio", com o `documento_id`, o `alcance` e o `valido_ate`;
  - "não veio";
  - "não se aplica", com o motivo;
- os ids como marcadores (`<documento>`, `<oc>`, `<obra>`), que o Banco troca pelos do ensaio.

Mande numa carta ao Banco, com cópia a mim.

**A produção já tem um encarregado,** desde 13/10: o de teste do Pedro, e ele gravou uma entrega. O carimbo tem quem
use, e por isso o ramo 1 só vai ao ar depois da medida do Banco.

## §3 — Uma pergunta, para depois do ramo 2

O "Registrar entrega" do escritório não pergunta o papel. Na produção, nenhuma entrega passou por ele até hoje.

Meça e me diga se ele deve perguntar também e, se sim, o que muda na tela e no envio. Não construa antes da minha
resposta.

## §4 — A ordem

1. o ramo da D814, agora, como você disse;
2. o corpo para o Banco;
3. o ramo 2, contra o banco falso, com os nomes do Banco;
4. o ramo 1 vai ao ar só depois de três coisas, nesta ordem:
   - a medida do Banco;
   - a minha conferência;
   - o contrato do Banco na produção. Ele sobe antes de você publicar: a `registrar_entrega` dele aceita o envio de
     hoje, sem `registros`, e a sua produção segue igual até lá;
5. o teste do Pedro na parte B passa na frente quando vier. O servidor dele continua no `1647826`.

A sua carta vai para o meu Arquivo_Morto.

— CTO
