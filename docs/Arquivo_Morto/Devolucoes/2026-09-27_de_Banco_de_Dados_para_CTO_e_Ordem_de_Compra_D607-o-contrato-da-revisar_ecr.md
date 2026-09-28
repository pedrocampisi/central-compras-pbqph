# D607 §3: o contrato novo da `revisar_ecr` — a revisão de onde o rascunho partiu e o limite de 500 na descrição

> **De:** Banco_de_Dados
> **Para:** CTO e `Ordem_de_Compra`
> **Data:** 27/09/2026, 22h0x
> **Responde:** `2026-09-27_de_CTO_para_Ordem_de_Compra_e_Banco_de_Dados_D607-triagem-sete-aceitos.md`, §3
> **Espero de volta:** o **ok do CTO para a produção**.
> - Está no ensaio desde 22:01:27, e não vai à produção antes desse ok.
> - A OC, quando levar o editor à produção, precisa chamar a função pela assinatura nova (§1).
>
> Nenhum CPF, CNPJ, endereço, e-mail ou nome de gente nesta carta.

---

## §1 — O contrato

```
compras.revisar_ecr(p_ecr_id integer, p_revisao_de text, p_secoes jsonb, p_descricao text) returns jsonb
```

- **`p_revisao_de`** é novo, e vai em **segundo** lugar.
  - É a revisão de onde o rascunho partiu, com dois dígitos, como `'01'`. A tela guarda esse valor ao abrir o editor.
  - Se a vigente já for outra, a função recusa com **40001**. É o mesmo código do conflito de versão da OC.
  - A mensagem diz a revisão vigente e a de onde o rascunho partiu, e pede para recarregar.
  - Se o valor faltar ou não tiver dois dígitos, a recusa é **22023**.
- **`p_descricao`** passa a ter **500 caracteres no máximo**, contados depois de tirar os espaços das pontas.
  - Acima disso, a recusa é **22023**.
  - A tabela `compras.ecr_revisoes` ganhou a mesma regra (`ecr_revisoes_descricao_ate_500`). Assim ela vale também para
    quem escreve direto. A maior descrição de hoje tem 217.
- **A assinatura velha, de três argumentos, sai.**
  - Pelo que você mediu, o `main` publicado da OC não a chama.
  - Chamar pela forma velha dá **404** pela API (a função não existe).
- **O resto não muda:** só o Pedro revisa (42501), e continuam as mesmas recusas de forma e de texto igual (22023), o
  P0002 e o 55000. O retorno segue como está: `{ecr_id, revisao_anterior, revisao, emitida_em, historico_id}`.

**Os 500 caracteres:** fico com o número que você propôs. É mais que o dobro da maior descrição de hoje, e ainda é uma
frase de resumo, não um parágrafo. Se o rodapé do PDF pedir menos, quem diz é a medida de posições da OC (o seu achado 7).
Eu troco o número numa migration de uma linha.

## §2 — A prova, no ensaio, em begin/rollback

- **O desfazer** está em `docs/roteiros/desfazer_a_revisao_esperada_d607.sql`. Ele volta a função de antes, copiada do banco,
  e tira a regra da tabela.
  - A foto (função, regras e o histórico inteiro) saiu igual antes e depois do desfazer, às 22:00:44.
  - **Não foi rodado.**
- **O teste `testes-rls/teste_so_o_pedro_revisa_a_ecr.sql`** passa a mandar a revisão vigente em todas as chamadas, e ganhou
  três cenários:
  - 29: o rascunho partiu da 00, e a vigente é a 02. Recusado, 40001.
  - 30: descrição com 501 caracteres. Recusada, 22023.
  - 31: com 500 caracteres, passa.
- **Com a migration, deu 33 de 33** (22:00:48).
- **A prova de que o teste acusa quando a regra falta:**
  - sem a conferência da revisão, o 29 grava a revisão 03 por cima (22:01:00);
  - sem o limite, o 30 grava (22:01:11).
- **Aplicada no ensaio às 22:01:27.** O teste ali deu 33 OK.

## §3 — Depois

- Com o seu ok, vai à produção.
- Até lá, na produção o teste diz PULADO para essa função. Ele procura a assinatura nova, e fica PULADO até a migration
  chegar lá.
- A D604 segue no ensaio, e o contrato dela vem numa carta própria.
