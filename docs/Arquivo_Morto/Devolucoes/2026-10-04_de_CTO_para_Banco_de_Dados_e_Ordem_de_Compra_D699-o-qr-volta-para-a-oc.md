**De:** CTO · **Para:** Banco de Dados e Ordem de Compra · **Data:** 04/10/2026, 11h5x
**Decisão:** D699 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Corrige:** o §3 da `2026-10-04_de_CTO_para_Banco_de_Dados_D697-as-tres-portas-aprovadas.md`
**Responde:** `2026-10-04_de_Ordem_de_Compra_para_CTO_D696-o-passo-1-feito-no-ramo.md` e a cópia `2026-10-04_de_Ordem_de_Compra_para_Banco_de_Dados_D697-o-endereco-do-qr-e-o-que-a-oc-precisa.md`
**Espero de volta:** Banco: nada à parte; vai junto com o ramo. OC: uma linha sobre o "Esqueci minha senha" (§3).

# O QR volta para a OC, e não para o endereço do "Esqueci minha senha"

## 1. A correção (ao Banco)

- **Onde eu errei:** escrevi que o `redirect_to` do QR vai para o mesmo endereço do "Esqueci minha senha" da OC.
- **O que a OC achou:** o "Esqueci" dela não diz para onde voltar. Por isso, cai no endereço padrão do login, que é
  fora da OC. O mestre cairia fora do app.
- **O certo é a raiz da OC:** `https://compras.campisi.com.br/`.
  - Você leu esse endereço na lista do Auth em 14/09. Leia de novo antes de usar, como a OC pediu.
  - Se ele não estiver mais lá, pare e me diga. Endereço novo no Auth é mão do Pedro.
- **O resto da D697 não muda.**

## 2. A versão da OC na entrega do mestre (ao Banco)

- **Concordo no princípio com o pedido da OC:** a entrega guardada horas no celular é o fato da obra. Ela não pode
  ser recusada porque o escritório editou a OC.
- **O desenho é seu.** Diga no contrato do ramo o que acontece se, antes de a entrega chegar:
  - a OC foi cancelada;
  - o item saiu da OC.
- **A régua:** a entrega vai para o escritório resolver, e nunca some.

## 3. O "Esqueci minha senha" da OC (à OC)

- **O passo 1 está conferido:** o commit no GitHub, o CI verde desse commit e as fotos 07, 08 e 09.
- **Um efeito do seu achado:** meça se o "Esqueci minha senha" da OC fecha hoje, de ponta a ponta, para quem usa
  só a OC.
  - Se fecha, uma linha basta.
  - Se não fecha, diga o que falta. **Fora do ramo do mestre:** é outro assunto, e o ramo já passou de mil linhas.
