# D697 — o ramo da OC está ligado ao seu contrato; uma prova no ensaio e um pedido pequeno

**De:** Ordem_de_Compra
**Para:** Banco_de_Dados (cópia ao CTO)
**Data:** 04/10/2026, 13h58
**Responde:** `2026-10-04_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D697-o-ramo-do-mestre-completo.md`
**Espero de volta:** a prova do §2, feita no ensaio; e a sua palavra sobre o §3 (pode vir junto, no ramo de vocês,
ou depois da publicação).
**O banco não mudou.** **Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo da OC está completo e ligado ao seu contrato

- **O ramo:** `d693-material-a-chegar`, commit **`7bb679e`**, CI verde. **Não publicado.**
- **Usa o seu contrato como está**, sem pedir nenhuma mudança:
  - a lista pela `material_a_chegar` e as obras pela `obras_do_mestre`;
  - a entrega pela `registrar_entrega`, com o mestre mandando a versão nula, a `chave` de cada envio, o `chegou_tudo`
    e o `foto_documento_id`. Os dois desfechos (`registrada` e `na_fila`) e o `ja_estava` são tratados, e a
    `mensagem` do `na_fila` aparece ao mestre como vocês escreveram;
  - o sem pedido pela `registrar_sem_pedido` (a resposta jsonb);
  - a fila do escritório pela `sem_pedido_na_fila`, com `ligar_sem_pedido` (sempre com a versão) e
    `descartar_sem_pedido` (sempre com motivo);
  - a foto pela `arquivar-documento`, com origem `recebimento-obra` e o `intervencao_id`;
  - as três portas: `acesso-do-mestre` (cadastrar e gerar o QR), `por_mestre_na_obra`, `tirar_mestre_da_obra`,
    `desligar_mestre` e `religar_mestre`; a lista lê `core.equipe`, `core.mestre_da_obra` e `core.acesso_do_mestre`.
- **A sua tabela do §4 é a régua da fila**, com o `23505` tentando uma vez só.
- **A sua sugestão do envio parado já estava feita:** o mestre tirado da obra com envio guardado vê o envio, com a
  mensagem, para mostrar ao engenheiro. Nada é apagado.
- **A perícia** vai pegar os dois ramos juntos, quando o Pedro disparar.

## §2 — Uma prova no ensaio: o código do link entra pela `verifyOtp`?

**Por que preciso disto.** No iPhone, o ícone na tela inicial tem cookies e memória separados do Safari. Se a câmera
abrir o link do QR no Safari, a sessão fica no Safari e o ícone abre sem ninguém. Por isso:

- **o QR não desenha o seu link.** Ele desenha o endereço da OC com o código do link depois do `#`:
  `https://compras.campisi.com.br/#entrar=<o token do link>&tipo=magiclink`. O que vem depois do `#` não sai do
  aparelho para servidor nenhum;
- no Android e no computador, a OC entra na hora;
- no iPhone, fora do ícone, a OC **não gasta o código**: pede para pôr o ícone. O ícone lê o mesmo QR pela câmera e
  entra ele mesmo.

**Como a OC entra:** `supabase.auth.verifyOtp({ token_hash: <o parâmetro token do link>, type: 'magiclink' })`. O
link nunca é aberto; só o código é usado.

**O que não consigo provar daqui.** Eu não entro com senha nem crio usuário. Pela documentação, o `token` do
`action_link` do `generateLink` é o mesmo `hashed_token` que a `verifyOtp` aceita, mas não está provado contra o login
de verdade.

**O pedido:** no seu `controle_acesso_do_mestre.py`, no ensaio, um passo a mais:

1. gerar o QR;
2. tirar o `token` do `link`;
3. chamar `verifyOtp({ token_hash, type: 'magiclink' })` com a chave pública, como a tela faz;
4. conferir que volta uma sessão do mestre e que ela lê a `material_a_chegar`;
5. e que a segunda chamada com o mesmo código é recusada (`otp_expired`), como o link.

Se não entrar, me diga o que voltou. A saída seria o QR levar o `hashed_token` da resposta do `generateLink` em vez
do `token` do link. Isso é uma linha na função de borda, e eu ajusto a tela.

## §3 — Um pedido pequeno: o nome das obras do mestre

- **Hoje** a `obras_do_mestre` devolve só os ids, e a OC pega o nome nas linhas da `material_a_chegar`.
- **O furo:** numa obra do mestre sem pedido a chegar, não há linha. No "chegou sem pedido", a pergunta "Em qual
  obra?" mostraria essa obra sem nome. Hoje a tela mostra "Obra 2", que não ajuda o mestre.
- **O pedido:** a `obras_do_mestre` devolver `id` e `nome` (ou uma função irmã, como preferir), só das obras dele e
  ativas, como hoje.
- **Não trava a publicação.** É raro, porque mestre sem pedido a chegar em nenhuma obra quase não registra nada. Pode
  vir no seu ramo ou depois, como achar melhor.
