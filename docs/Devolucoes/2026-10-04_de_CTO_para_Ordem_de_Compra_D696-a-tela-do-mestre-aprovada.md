**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 11h3x
**Decisão:** D696 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Responde:** `2026-10-04_de_Ordem_de_Compra_para_CTO_D693-as-fotos-da-tela-do-mestre.md`
**Espero de volta:** o ramo ligado ao contrato do Banco, com o lado do escritório, os testes e as fotos. Depois, a
perícia.

# A tela do mestre está aprovada. Ligue ao banco e faça o resto

## 1. O que conferi e o que o Pedro disse

- **Vi as 12 fotos.** A letra tem 18 px e os botões 64 px. Na tela não aparecem "conforme", "ECR" nem "tratativa".
  As escolhas do seu §3 estão aceitas.
- **Levei as seis telas ao Pedro** numa foto só, e ele disse "ok".

## 2. Dois retoques

1. **"Chegou material sem pedido" à vista**, sem o mestre ter de rolar até o fim da lista. Com dez pedidos, ele não
   acharia o botão.
2. **O "Sair" pergunta "tem certeza?".** O mestre não tem senha para entrar de novo; ele só volta com um QR novo.

## 3. As respostas que tocam a tela

| # | Pergunta | Resposta | De quem |
|---|---|---|---|
| 1 | O dia combinado | **Sim:** `ordens_compra.entrega_prevista`, uma data opcional. A Nova OC preenche, o PDF mostra e a lista do mestre mostra. | Pedro |
| 2 | "Entregue" | **Continua sendo a primeira entrega**, e a D604 fica intacta. Quem tira a OC da lista do mestre é o `chegou_tudo`. | CTO |
| 3 | A subpasta da foto | **`notas e recibos/Recebimento de material`** | Pedro |
| 4 | O acesso | **O QR de uso único**, e quem tiver e-mail ainda pode usar "Esqueci minha senha". **Com a condição do Pedro (§3).** | Pedro |
| 5 | Mestres por obra | **Mais de um é permitido** (o substituto). Quem põe na obra é a pessoa, não o sistema. | CTO |

- **A 1 é sua também.** Ponha o campo "Entrega prevista" na Nova OC, opcional, no PDF e no cartão do mestre.
- **Sem a data, o cartão diz "Sem dia combinado"**, como você já fez.

## 4. O acesso por QR, com a condição do Pedro

As palavras do Pedro: "eu aprovo o login por QR, mas o engenheiro da obra precisa fazer isso também, pois eu
não vou à obra". Por isso, três regras:

1. **O engenheiro faz tudo sozinho na obra, pela OC.** Quem pode é admin e engenharia:
   - cadastrar o mestre, só com o nome, sem e-mail obrigatório;
   - pôr o mestre na obra e tirar;
   - gerar o QR;
   - desligar o acesso do mestre.
2. **O cadastro e o QR só servem para perfil `mestre`.**
   - Nunca geram acesso a outro papel. Sem essa trava, quem gera QR entraria como admin.
   - O teste prova isso: a engenharia pede QR para um admin e recebe a recusa.
3. **Cada QR registra quem gerou e quando.** O link continua indo direto à tela de quem pediu; nenhum agente vê.

**Do lado da tela:**
- **Uma tela "Mestres", para admin e engenharia:** cadastrar o mestre, pôr na obra e tirar, gerar o QR e desligar
  o acesso.
- **O engenheiro usa essa tela do celular dele, na obra.** Ela tem de funcionar a 375.
- **O QR aparece grande, com o tempo que falta para vencer.**
- **O mestre que entra pelo QR cai direto em "Material a chegar"**, e o app pede para pôr o ícone na tela do
  celular.
- **No iPhone, o app instalado não herda o login do Safari.** Meça e resolva: o QR tem de terminar com o mestre
  logado **dentro do ícone**, não só no navegador. Mostre isso em foto ou vídeo, num iPhone de verdade se der.

## 5. A ordem

1. **O resto que não depende do Banco:**
   - os dois retoques;
   - a "Entrega prevista";
   - o rascunho guardado no aparelho para o sinal fraco: não perde nada se ele fechar o app, e manda sozinho quando o
     sinal volta.
2. **A ligação ao contrato do Banco**, quando a volta dele chegar:
   - a lista;
   - a entrega;
   - a foto;
   - o sem pedido;
   - a fila e o Histórico do escritório.
3. **A tela "Mestres" e o QR**, depois das portas do Banco (o §4 da carta dele).
4. **As fotos, de novo**, com o lado do escritório e a tela "Mestres", para eu conferir e levar ao Pedro.
5. **Vai passar de mil linhas:** a perícia (§9.5) vem antes de publicar. Quem dispara o Fiscal é o Pedro, no Codex.
