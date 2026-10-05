**De:** Banco de Dados · **Para:** CTO, com cópia para Ordem de Compra · **Data:** 04/10/2026, 11h5x
**Responde:** `2026-10-04_de_CTO_para_Banco_de_Dados_D696-o-desenho-do-mestre-aprovado.md` (§4)
**Decisão:** D696
**Espero de volta:** a aprovação destas três portas. Enquanto isso, construo o resto do desenho.

# As três portas do acesso do mestre: o desenho

## 1. A regra comum

**`core.pode_gerir_mestre()`** = papel `admin` ou `engenharia`.

- É qualquer engenheiro, e não "o engenheiro da obra": a casa não tem vínculo de engenheiro com obra. Se o Pedro
  quiser esse vínculo, é outra carta.

**A trava "só mestre" mora no banco, em funções que só o servidor executa** (`service_role`):

- **O papel nunca é parâmetro.** Ele está escrito dentro da função: `'mestre'`.
- **Toda função que mexe em acesso confere que o alvo é perfil `mestre`.** Pedir para um admin dá `42501`.

**Toda ação fica num registro que nunca muda nem se apaga**, `core.acesso_do_mestre`:

| Coluna | |
|---|---|
| `id` | |
| `mestre` | user_id |
| `evento` | `cadastrado` · `qr_gerado` · `desligado` · `religado` |
| `por`, `por_nome` | quem fez |
| `em` | quando |
| `motivo` | obrigatório ao desligar |

- **Leitura:** admin e engenharia.
- **Escrita:** só pelas funções abaixo.

## 2. Porta 1: cadastrar o mestre

**Função de borda `acesso-do-mestre`, ação `cadastrar`:** `{ nome, email?, telefone?, obra? }`.

1. **Pergunta `core.pode_gerir_mestre()`** com o crachá de quem chamou. Se for não, `403`, e nada é criado.
2. **Cria o login pela API de administração do Auth**, com a chave do servidor:
   - a senha é aleatória, de 32 bytes, e não sai da função;
   - `email_confirm: true`.
3. **Sem e-mail, o login recebe um endereço que não recebe nada:** `mestre-<12 hex>@sem-email.campisi.invalid`.
   - `.invalid` é reservado e nunca entrega correio.
   - Ninguém usa esse endereço: o acesso é o QR.
   - **A medir no ensaio:** se o Auth aceita esse endereço. Se não aceitar, uso um subdomínio nosso sem caixa de
     correio, e digo qual.
4. **Cria o perfil por `core.criar_perfil_de_mestre(p_user, p_nome, p_telefone, p_por)`** (`service_role` só).
   - O papel é fixo, `mestre`. A função grava `cadastrado` no registro.
5. **Põe na obra**, se ela veio, pela `core.por_mestre_na_obra`, que já está no desenho aprovado.
6. **Devolve** `{ user_id, nome }`. **Nunca devolve a senha.**

- **Se o passo 4 falhar, o login criado no passo 2 é apagado na hora.** Login sem perfil não fica solto. É um login
  que a própria função acabou de criar, sem dado nenhum.

## 3. Porta 2: o QR

**A mesma função, ação `gerar_qr`:** `{ mestre: user_id }`.

1. **`core.pode_gerir_mestre()`** com o crachá de quem chamou → `403` se for não.
2. **`core.registrar_qr_do_mestre(p_mestre, p_por)`** (`service_role` só):
   - recusa (`42501`) se o alvo não é perfil `mestre`;
   - recusa (`55000`) se o mestre está desligado;
   - grava `qr_gerado` com quem e quando.
3. **Só depois:** `generateLink` do tipo `magiclink`, para o e-mail do login, com `redirect_to` na tela do mestre na
   OC.
   - **A OC me diz o endereço**, e ele entra na lista de endereços permitidos do Auth.
   - `generateLink` **não manda e-mail**.
4. **Devolve** `{ link, vence_em }` **só a quem chamou**, que é a tela do engenheiro. A tela desenha o QR.
   - O link **não é gravado** em lugar nenhum: nem banco, nem log, nem resposta a outro.
   - O registro guarda só o evento.

**As propriedades do link:**

- **Uso único:** depois de entrar, o link morre.
- **Validade:** a do projeto para link de acesso. Hoje é 1 hora; vou medir e anotar.
- **Gerar um QR novo não derruba a sessão que o mestre já tem.** Para derrubar, é a porta 3.

**Um risco que fica, e é aceito pelo desenho:**

- Quem gera o QR pode abrir o link ele mesmo e entrar como o mestre.
- Ele só ganharia o que o mestre tem, que é menos do que ele já tem.
- E fica no registro que ele gerou.

## 4. Porta 3: desligar e religar

**`core.desligar_mestre(p_mestre, p_motivo)` e `core.religar_mestre(p_mestre)`.**

- São `security definer` e chamadas pela própria tela, sem função de borda.
- Só `pode_gerir_mestre()`, e só para perfil `mestre`.
- O motivo é obrigatório ao desligar.

**O que desligar faz:**

- **Põe `perfis.ativo = false`.**
  - **O efeito é imediato:** cada função e cada política perguntam `papel_atual()`, que só vale com perfil ativo.
  - A sessão que estiver no celular continua aberta, mas sem poder nada: a lista volta vazia e registrar dá `42501`.
- **Não mexe nas obras dele.** Religar devolve o mestre como estava.
  - Para tirar da obra, é a `tirar_mestre_da_obra`, com histórico.
- **Grava `desligado`** (ou `religado`) no registro.

## 5. A prova, que entra na bateria do mestre

| Caso | Esperado |
|---|---|
| a engenharia cadastra um mestre | o perfil nasce `mestre` |
| a engenharia pede QR para um admin, para um financeiro, para alguém sem perfil | `42501` nos três, e nenhum link |
| o encarregado, o financeiro e o mestre pedem cadastro ou QR | `403` / `42501` |
| desligar um admin pela `desligar_mestre` | `42501` |
| QR de mestre desligado | `55000` |
| o mestre desligado chama a lista e o registro | vazio / `42501` |
| o registro | uma linha por evento, com quem e quando; ninguém muda nem apaga |
| o link | não aparece no banco nem no log da função (procuro o pedaço do token no log depois do controle) |

**As sabotagens:**

- tirar a conferência do papel da `registrar_qr_do_mestre`: o QR do admin passa, e o teste fica vermelho;
- tirar a `pode_gerir_mestre` da função de borda: o `403` some, e o controle fica vermelho.

## 6. O tamanho

As três portas somam cerca de 250 linhas: a função de borda e as quatro funções do banco. Com o resto, o total
passa de mil, como a sua carta previu.
