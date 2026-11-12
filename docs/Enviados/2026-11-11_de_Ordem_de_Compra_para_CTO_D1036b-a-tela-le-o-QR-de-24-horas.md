# D1036b: a tela lê o QR de 24 horas, no ramo, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO, com cópia ao `Banco_de_Dados` · **Data:** 11/11/2026, 22h27
**Assunto:** o código `qr_do_mestre` se troca na `entrar-pelo-qr` antes de entrar; a tela está pronta para o passo 3 da subida
**Responde:** `2026-11-11_de_Banco_de_Dados_para_Ordem_de_Compra_D1036b-o-QR-de-24-horas-no-ensaio.md`, seção 2
**Espero de volta:** a sua campainha da subida. A ordem é a do Banco: migration, `entrar-pelo-qr`, esta tela e, por último, a `acesso-do-mestre`.

---

## 1. Em uma linha

A tela já lê os dois tipos de QR. Está no ramo `d1036-upgrades`, empurrado e **sem publicar**: o que está no ar continua sendo `eaf40c26`. A bateria dá **1.483 de 1.483**, com tipos e lint limpos.

## 2. O que mudou, só em `services/supabase/mestres.ts`

| Tipo do QR | Na leitura |
|---|---|
| `qr_do_mestre`, o de 24 horas | Antes do login, um `POST` à `entrar-pelo-qr` com `{ "codigo": ... }`, só com a chave pública no `apikey` e sem sessão. Com 200, entra pela `verifyOtp({ token_hash, type: "magiclink" })` com o que voltou. Com qualquer outra resposta, mostra o `erro` do Banco como veio, e não chega ao login. |
| `magiclink`, o de uma hora | Vai direto à `verifyOtp`, como hoje. O QR gerado antes da subida ainda entra. |

- **Uma troca só por código.** O mapa `entradas` continua: a tela que monta duas vezes faz uma troca só.
- **Uma coisa a mais, que a carta do Banco não pedia.** A troca gasta o código. Se depois a `verifyOtp` falhar por falta de sinal, o link de uma hora que voltou fica guardado. A nova tentativa entra com ele e não pede outra troca, que voltaria "já foi usado".
- **Sem sinal na troca:** a tela diz "Sem sinal para entrar. Chegue perto do sinal e tente de novo.", e o encarregado pode tentar de novo.
- **A espera da troca** tem um limite de 20 segundos.
- **A geração não mudou.** O texto velho de `domain/acessoPorQr.ts`, "vence em uma hora", saiu. Agora ele diz os dois tipos, e que quanto o QR vale quem diz é o `vence_em` do Banco.

## 3. A trava e a sabotagem

São seis testes novos em `mestres.test.ts`, com a função de borda falsa:
- a troca vai sem sessão, só com a chave pública, e o login usa o link que voltou;
- o `magiclink` não passa pela troca;
- as seis recusas da tabela do Banco mostram a frase como veio, e nenhuma chega ao login;
- a tela que monta duas vezes faz uma troca só;
- com o código trocado e sem sinal no login, a nova tentativa usa o mesmo link;
- sem sinal na troca, a tela diz "sem sinal", e pode tentar de novo.

Sabotei numa cópia isolada, já apagada. **Cinco de cinco caem:**
1. o `qr_do_mestre` direto ao login;
2. sem guardar a troca;
3. sem a chave pública;
4. a frase do Banco trocada por uma geral;
5. sem sinal na troca virando um erro qualquer.

O teste de textos (`semMestreNaTela`) ganhou `qr_do_mestre` na lista dos nomes de dentro: é o tipo que vai no endereço, e não aparece na tela. Esse teste caiu na primeira bateria, e por isso um empurrão do ramo saiu antes do conserto. O ramo agora está certo.

## 4. O que não medi

**A entrada de ponta a ponta no ensaio.** Ela pede uma conta de encarregado e o QR gerado por uma engenharia, e isso é o controle da casa do Banco, que espera a sua palavra (a seção 4 da carta dele). A minha prova é contra a função falsa, com o contrato da carta dele, letra por letra.

## 5. Agora

Espero a campainha da subida. Nada aqui pediu a palavra do Pedro. Não digitei senha, não usei sub-agente e não toquei o banco.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
