# D696 — o ramo do mestre completo: ligado ao Banco, o escritório, a tela "Mestres" e as fotos (NÃO publicado)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 13h58
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D696-a-tela-do-mestre-aprovada.md` (o §5, passos 2 a 4) e a D698.
**Espero de volta:** que você confira as fotos e as leve ao Pedro; a sua palavra sobre as duas bibliotecas (§5); e a
perícia (§9.5), que **o Pedro dispara** no Codex, sobre os dois ramos.
**O banco não mudou.** **Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d693-material-a-chegar`, no commit **`7bb679e`**, com **CI verde** (37218498162).
- **A `main` está dentro** (o "Esqueci minha senha" da D700/D701), junta sem conflito em `d027bf7`.
- **A prova:**
  - **895 testes**, tipos e lint limpos;
  - **67 sabotagens novas, as 67 vermelhas** (23 na ligação, 21 no escritório, 23 na tela "Mestres" e no QR).
- **O tamanho, contra a `main`:** cerca de 4.300 linhas de código e 2.500 de teste. Passou de mil: a perícia vem antes
  de publicar.

## §2 — O passo 2: a ligação ao contrato do Banco (carta D697 dele, ramo `dd852d2`)

1. **A tela do mestre fala com o banco:**
   - a lista pela `material_a_chegar`, guardada no celular; sem sinal, mostra a última, com a hora;
   - a foto da nota vai reduzida para a `arquivar-documento` e não sobe de novo na nova tentativa;
   - o número da nota é lido na foto pela `ler-documento`;
   - a entrega vai **sem a versão**, com a chave de cada envio e o "chegou tudo";
   - o sem pedido leva a obra e o dia; com mais de uma obra, a tela pergunta "Em qual obra?".
2. **A régua da fila mora no domínio:** sem rede ou servidor caído, **espera**; chave repetida, **tenta uma vez**;
   recusa de verdade, **para e mostra**. A entrega de uma OC cancelada aparece ao mestre com o recado do banco
   ("vai para o escritório").
3. **O lado do escritório:**
   - **uma aba nova, "Recebimentos"**: a fila do "chegou sem pedido", com a obra, o dia, o estrago e a foto da nota.
     - **Ligar a uma OC** mostra só as OCs emitidas ou entregues da mesma obra; a que o mestre informou vem primeiro.
     - Pede o número da nota quando o mestre mandou só a foto.
     - A integridade é a resposta do mestre. Com duas ou mais "Não Conforme", contando o estrago, a tratativa é
       obrigatória.
     - **Descartar** pede o motivo.
     - Quem só lê não vê os botões.
   - **o Histórico:** debaixo do status de cada OC, a última entrega, com o dia, quem recebeu, "Só uma parte: espera o
     resto" e o link da foto.
   - **"Registrar entrega" do escritório** ganhou "Chegou só uma parte". Com ele marcado, a OC continua na lista do
     mestre, esperando o resto (o seu §3.2).

## §3 — O passo 3: a tela "Mestres" e o QR (o seu §4)

- **A tela "Mestres", só para admin e engenharia**, cabe a 375:
  - cadastrar só com o nome (e-mail e telefone, se tiver);
  - pôr na obra e tirar, com o motivo;
  - gerar o QR;
  - desligar o acesso, com o motivo, e religar.
- **O QR aparece grande, com o tempo que falta** ("Vence em 58:53 (às 14:50)"). Quando vence, o QR some da tela e
  aparece "Gerar outro".
- **O QR não desenha o link do servidor.** Ele leva à OC com o código do link depois do `#`:
  - o que vem depois do `#` não vai ao servidor da OC nem ao registro dele;
  - é o mesmo segredo, com as mesmas travas: uso único, uma hora, só perfil mestre;
  - um teste lê o QR da caixa como a câmera lê e confere que sai o endereço da OC, nunca o do servidor.
- **O mestre cai direto em "Material a chegar"** (a tela vem pelo papel), e **a lista pede para pôr o ícone**:
  - no Android, com o botão do próprio navegador;
  - no iPhone, com os três passos do Safari.

## §4 — O iPhone: medido e resolvido (o seu §4, último ponto)

- **A medida, na fonte da Apple** (WWDC23, "What's new in web apps"):
  - **no iPhone, o ícone tem cookies e memória separados do Safari, e nada passa de um para o outro;**
  - a cópia dos cookies quando se instala é **só do Mac**.
  - Com o link do Banco, a câmera gastaria o QR no Safari, e o ícone abriria sem ninguém. É o que o senhor previu.
- **A solução (a 19 e a 20 das fotos):**
  1. a câmera abre o QR no Safari, e no iPhone a OC **não gasta o QR**: mostra "Primeiro, o ícone" e os três passos;
  2. o mestre abre o ícone, que mostra **"Ler o QR"**;
  3. o ícone lê **o mesmo QR** pela câmera e entra ele mesmo, com uma sessão só dele.
  - Dá tempo, porque o QR vale uma hora e o engenheiro está do lado.
  - Quem quiser pode tocar em "Usar aqui no Safari mesmo".
  - No Android e no computador, entra na hora.
- **O que NÃO está provado, e por quê:**
  - **Num iPhone de verdade, não.** Não tenho aparelho. Está provado com o App de verdade sobre um banco falso, em
    teste e nas fotos.
  - **A entrada pelo código (`verifyOtp`) contra o login de verdade, também não.** Eu não entro com senha em lugar
    nenhum. Pedi ao Banco que prove isso no ensaio pelo controle dele, sem a senha de ninguém (§6).
  - **Proposta:** depois da perícia, um ensaio de cinco minutos num iPhone, com um mestre de teste: o engenheiro gera
    o QR, a câmera abre, põe o ícone, lê o QR, e entra. Quem segura o iPhone é o Pedro, ou quem ele mandar.

## §5 — Duas bibliotecas novas: a escolha é sua (lei 3, a tabela de quem decide)

| Biblioteca | Para quê | Licença | Dependências |
|---|---|---|---|
| `qrcode-generator` 2.0.4 | desenhar o QR na tela do engenheiro | MIT | nenhuma |
| `jsqr` 1.4.0 | ler o QR pela câmera dentro do ícone do iPhone | Apache-2.0 | nenhuma |

- **Escolhi as duas para o ramo andar.** Se o senhor preferir outras, a troca é pequena: cada uma é usada em um
  arquivo só.
- **O peso:** o leitor fica num pedaço à parte, com 47 KB comprimidos, e não pesa ao abrir a tela. O app instalado
  baixa esse pedaço uma vez, em segundo plano, porque guarda todos os pedaços para funcionar sem sinal.
- **Sem o `jsqr`**, a saída do iPhone seria pedir ao Banco um código curto para digitar, e o mestre teria de digitar.

## §6 — A carta ao Banco (cópia na sua caixa)

`2026-10-04_de_Ordem_de_Compra_para_Banco_de_Dados_D697-o-ramo-ligado-e-dois-pedidos.md`:

1. **o ramo está ligado ao contrato dele**, sem nenhuma mudança no que ele escreveu;
2. **provar no ensaio** que o código do link entra pela `verifyOtp` (§4);
3. **a sugestão dele do envio parado** (o mestre tirado da obra com envio guardado) já estava feita: o envio fica à
   vista, com a mensagem, e não some;
4. **um pedido pequeno:** o nome das obras do mestre. Hoje ele lê o nome só nas linhas da lista. Numa obra sem pedido
   a chegar, a pergunta "Em qual obra?" ficaria sem o nome.

## §7 — O que fica anotado

- **O teste da D643** (o título de cada tela uma vez só) falhou duas vezes hoje, uma na `main` (na publicação da D701) e
  uma no ramo, sempre no meio da bateria inteira; nas rodadas seguintes, sozinho e junto, passou. Ele oscila. Fica como pendência minha, fora deste ramo.
- **As fotos novas:** `docs\Capturas\2026-10-04_D696\`, no ramo, de **10 a 20**: 22 fotos a 375, no claro e no
  escuro. Nenhuma rola para o lado.
  - `10`: a Nova OC com a "Entrega prevista";
  - `11`, `12` e `13`: a fila de Recebimentos, o "Ligar a uma OC" e o Histórico com o recebimento;
  - `14`, `15` e `16`: a tela "Mestres", o cadastro e o QR com o tempo;
  - `17` e `18`: a lista do mestre pedindo o ícone, no Android e no iPhone;
  - `19` e `20`: o "Primeiro, o ícone" do Safari e o "Ler o QR" dentro do ícone.
  - **A foto 12 achou um defeito**, já corrigido: a lista de OCs estava sem o estilo dos campos.
- **Publicar, só com a sua carta**, depois da perícia, e com o ramo do Banco no ar antes.
