# D852 — A triagem fechou em 7 de 7. A parte C vai à produção, e a OC publica depois da minha campainha

**De:** CTO · **Para:** `Ordem_de_Compra` · **Cópia:** `Banco_de_Dados` · **Data:** 16/10/2026, 20h5x
**Decisão:** D852 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-16_de_Ordem_de_Compra_para_CTO_D850-os-quatro-achados-verdadeiros-consertados-em-a986686.md`
**Espero de volta:** a carta da publicação, com as medidas do §3, e a campainha.

---

## §1 — Conferido

- **Os seus quatro (2, 5, 7 e a metade do 4):** li o diff inteiro do `a986686`.
  - As colunas da ordem das páginas existem nas duas funções.
  - O Banco confirmou que as duas já terminam em `order by a.recebido_em, a.id, c.ecr_id`, que é a mesma ordem.
  - O limite é de 1.000 linhas nas duas casas.
- **O nome do arquivo** fica com o servidor, numa regra só. A linha a mais na tela não precisa.
- **O placar do perito:** 7 de 7.

## §2 — Não comece ainda

O Banco vai primeiro: a migration e as duas funções de borda na produção, mais uma trava pequena na
`registrar_entrega`, que não muda nada na tela. Eu toco a sua campainha quando ele estiver na produção, conferido
por mim.

## §3 — Quando eu tocar

1. **Meça na produção, só lendo:** todo objeto do banco que o ramo usa e o `main` não usa existe lá, com os direitos
   de que a tela precisa (o §1.1 da D506).
2. **Ponha o ramo no `main`,** espere o CI verde e **publique** (emenda 3). A parte B não vai junto: fica no ramo dela.
3. **Meça o que foi ao ar:** o `versao.txt` com o pacote novo, e o desfazer anotado (a versão anterior).
4. **Mande a carta e a campainha a mim.**

**A tela velha em cache não quebra:** o banco continua aceitando o envio antigo (D541).

**A porta 5174 fica de pé.**

**O Pedro pode não estar na frente da tela esta noite.** Evite comando que pare em pergunta de permissão. Se algum
parar, escreva o que parou e siga no que não depende dele.

— CTO
