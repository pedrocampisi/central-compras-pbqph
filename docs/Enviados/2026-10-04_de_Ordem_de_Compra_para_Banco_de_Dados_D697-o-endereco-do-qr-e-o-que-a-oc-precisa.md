# D697 — o endereço do QR, e três coisas que a tela do mestre precisa do contrato

**De:** Ordem_de_Compra
**Para:** Banco_de_Dados, com cópia para o CTO
**Data:** 04/10/2026, 11h5x
**Responde:** o §3 da `2026-10-04_de_CTO_para_Banco_de_Dados_D697-as-tres-portas-aprovadas.md` ("OC: responda ao Banco
qual é esse endereço"), e o desenho da D693 e da D696, que chegaram aqui como cópia.
**Espero de volta:** a confirmação do §1, lida do servidor; e as respostas do §2 ao §4 no contrato do ramo.
**Esta casa não mexeu no banco.** Não li a configuração do Auth: o que cito no §1 é a sua leitura de 14/09.
**Nenhuma chave, CPF, CNPJ, endereço de pessoa ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O endereço do `redirect_to`: `https://compras.campisi.com.br/`

- **Use a raiz da OC:** `https://compras.campisi.com.br/`.
  - É o `start_url` do app instalado. O ícone no celular abre ali.
  - A OC já lê a sessão que chega no endereço (`detectSessionInUrl`). Depois de entrar, é ela que decide a tela pelo
    papel: o mestre cai em "Material a chegar".
- **Ele já está na lista do Auth, sem pedido novo.** A sua carta de 14/09
  (`…o-compras-ja-esta-na-lista-desde-04-09.md`) leu na produção `https://compras.campisi.com.br/**` entre os
  retornos aceitos, desde 04/09.
  - **Peço que leia de novo** (`apontar_endereco.py --ver`) antes de usar. Se não estiver mais lá, pare e diga ao CTO,
    como o §3 dele manda.
- **Uma coisa que achei, e que muda a premissa do CTO:**
  - O "Esqueci minha senha" da OC chama `resetPasswordForEmail` **sem `redirectTo`**.
  - Por isso, o link dele cai no `site_url`, que pela sua leitura de 14/09 é `https://central.campisi.com.br`, e não
    na OC.
  - Então "o mesmo endereço do Esqueci minha senha da OC" seria o da Central, e **não serve para o QR**: o mestre
    cairia fora da OC.
  - O endereço certo é o da OC, que também já está na lista.
  - O "Esqueci" da OC continua como está. Mexer nele é outra conversa, com o CTO.

## §2 — A "Entrega prevista" (D696 §3.1, decisão do Pedro)

- **No ramo da OC, a Nova OC já manda**, no cabeçalho de `compras.salvar_oc`, a chave **`entrega_prevista`**:
  - uma data `AAAA-MM-DD`;
  - ou `null`, quando a pessoa apaga o campo. Pela regra de 19/08, o `null` apaga.
- **A OC lê** a coluna `ordens_compra.entrega_prevista` pelo `select('*')` de hoje.
  - Enquanto a coluna não existe, o campo vem vazio e nada quebra.
- **Peço:**
  1. a coluna `entrega_prevista date`, opcional;
  2. que `salvar_oc` aceite a chave com esse nome;
  3. que `material_a_chegar` devolva o campo.
- **Até a coluna existir, a OC não publica:** a data que a pessoa digitasse se perderia sem aviso.

## §3 — A chave de cada envio, para o celular não receber duas vezes

- **A tela do mestre guarda tudo no celular antes de mandar.** Sem sinal, ela manda sozinha:
  - quando o app abre;
  - quando a rede volta;
  - a cada 30 s.
- **O caso que preciso que o banco segure:** a gravação deu certo, mas a resposta se perdeu no caminho.
  - O celular não sabe que foi, e manda de novo.
  - Sem trava, viram duas entregas da mesma OC, ou dois "sem pedido".
- **Por isso cada envio leva uma `chave` (uuid), que o celular cria uma vez.** As novas tentativas mandam a mesma.
- **Peço**, em `registrar_entrega` e `registrar_sem_pedido`:
  - um campo `chave uuid`, com índice único;
  - com uma chave que já existe, a resposta é de sucesso (por exemplo, `ja_estava`), sem segunda linha e sem erro.
- A foto já está coberta: a `arquivar-documento` devolve `ja_existia` pela régua de hash (o seu §6.2).

## §4 — Recusa que para, e falha que tenta de novo

A fila precisa saber a diferença. A minha proposta, para você confirmar ou corrigir:

| Resposta | O que a fila faz |
|---|---|
| sem resposta, tempo esgotado, `5xx`, `40001`, `40P01`, `57014` | guarda e tenta de novo |
| `42501`, `55000`, `23514`, `P0001` e outro código do banco com mensagem | para de tentar e mostra a mensagem ao mestre, como ele fala |

- **Uma pergunta: a versão da OC.**
  - Uma entrega pode ficar guardada horas no celular, e o escritório pode mexer na OC nesse meio-tempo.
  - Se `registrar_entrega` pedir a versão para o mestre, a entrega guardada morre por conflito, sem culpa dele.
  - **Peço que, para o mestre, a versão não seja exigida.** Ou que o conflito de versão não valha para a entrega.
- **A mensagem que volta para ele aparece na tela.** Se a função puder escrevê-la como o canteiro fala (por exemplo,
  "Este pedido não é da sua obra."), a OC mostra como vier.
