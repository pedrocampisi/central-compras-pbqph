# D700 — o "Esqueci minha senha" volta para a OC, no ramo (NÃO publicado)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 12h0x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D700-o-esqueci-volta-para-a-oc.md`
**Espero de volta:** a sua conferência; depois dela, publico pela emenda 3 e digo a versão.
**O banco não mudou. Nenhum e-mail saiu, e nenhum agente digitou senha.**
**Nenhuma chave, CPF, CNPJ, endereço de pessoa ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d700-esqueci-volta-para-a-oc`, no commit **`bf1b026`**, saído do `main` (`e232063`). É separado do
  ramo do mestre.
- **O que muda fora de `docs/`:** três arquivos, +145 −5. Uma linha de código e os testes.
- **A prova:**
  - **716 testes** (eram 712), tipos e lint limpos;
  - **8 sabotagens, as 8 vermelhas, com o hash igual na volta**;
  - **CI verde** (37211710363).

## §2 — A linha

- **A chamada:** `resetPasswordForEmail(email, { redirectTo: 'https://compras.campisi.com.br/' })`, em
  `LoginPage.tsx`. O endereço tem nome próprio, `VOLTA_DO_LINK`, e um comentário diz por que existe.
- **"Primeiro acesso" usa a mesma chamada,** e por isso também volta para a OC. É o mesmo conserto. Quem cria a senha
  pela primeira vez também deixa de cair na Central.
- **O desfazer:** tirar a linha. Se o endereço sair da lista do login, o link volta ao endereço padrão, que é o
  desvio de hoje. Nada piora.

## §3 — A metade que recebe, provada

`tests/components/DefinirSenhaPeloLink.test.tsx` monta o **App de verdade**, com o login e o banco falsos, e dispara
o evento que a biblioteca do login manda quando a pessoa chega pelo link (`PASSWORD_RECOVERY`).

| O seu §2.3 | O teste |
|---|---|
| o evento abre "Definir nova senha", e não a lista | a tela aparece, e o menu da OC some |
| a senha nova vai ao login, e depois a pessoa entra | `updateUser` recebe a senha; a tela some e o menu volta, com "Senha definida com sucesso!" |
| a falha diz o que houve, e a pessoa não fica presa | com o login recusando, aparece "A senha nova precisa ser diferente da antiga."; o botão fica livre, e a segunda tentativa entra |
| (mais um) | as duas senhas diferentes: avisa, e nada vai ao login |

- **As senhas do teste são inventadas** e não saem do teste.
- **As sabotagens:**
  1. o link volta ao padrão;
  2. o endereço errado;
  3. o evento ignorado;
  4. a senha que não vai ao login;
  5. a tela que prende depois de gravar;
  6. a falha que passa por sucesso;
  7. o botão que trava depois da falha;
  8. as senhas diferentes que passam.

### Um cuidado que medi na biblioteca

- **A tela só abre porque a OC ouve o evento `PASSWORD_RECOVERY`.** A biblioteca o dispara uma vez só.
  - Isso acontece depois de ela conferir o link com o servidor, que é uma ida e volta pela rede.
  - A OC começa a ouvir no primeiro desenho da tela, que vem antes.
- **Na prática, ela já está ouvindo quando o evento chega.** Não mexi nisso: seria mais do que a linha que a carta
  pede.
- **Se a primeira recuperação real cair direto na lista,** sem a tela de senha, é aqui que se olha.

## §4 — A foto

- **Onde estão:** `docs\Capturas\2026-10-04_D700\`, no ramo. São `01_definir_nova_senha_375_claro.png` e
  `_escuro.png`.
- **Como foi tirada:** a tela vazia, a 375, sem rolagem para o lado, numa página de prova com o endereço do banco
  falso. Ninguém digitou senha. A página de prova foi apagada.

## §5 — O que não fiz

- **Não disparei e-mail.** A primeira recuperação real é a prova final, como o seu §2.4 diz.
- **Não li a lista do login de novo.** O endereço está lá pela leitura do Banco de 14/09. Se tiver saído, o link
  só volta ao desvio de hoje.
