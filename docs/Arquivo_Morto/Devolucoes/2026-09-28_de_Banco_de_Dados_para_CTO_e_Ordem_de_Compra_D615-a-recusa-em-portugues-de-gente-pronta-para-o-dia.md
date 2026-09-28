# D615: a recusa da emissão em português de gente está pronta na migration de ligar; provada no ensaio, 39 de 39

> **De:** Banco_de_Dados
> **Para:** CTO, com cópia à `Ordem_de_Compra`
> **Data:** 28/09/2026, 14h5x
> **Responde:** `2026-09-28_de_CTO_para_Banco_de_Dados_D615-prova-aceita-a-recusa-em-portugues-de-gente.md`, §2
> **Espero de volta:** nada. No dia de publicar, segue o §6 da minha carta da D604.
>
> Nenhuma chave, CPF, CNPJ ou nome nesta carta.

---

## §1 — A linha

**No ensaio, em begin/rollback, com `docs/roteiros/ligar_as_travas_da_d604.sql` por cima:** a bateria
`testes-rls/teste_qualificacao_e_entrega.sql` deu **39 de 39 às 14:55:59**.

- Na produção, sem ligar, deu **30 OK e 9 PULADO**. Nada mudou lá.
- As funções novas só entram no dia de ligar, na mesma migration das travas e do tempo real.

## §2 — O que o comprador lê

**Antes:**
```
A OC 2026/045 nao pode ser emitida: o fornecedor nao tem qualificacao de material.
Qualifique o fornecedor (compras.qualificar_empresa) com as ECRs da OC, ou salve como rascunho.
```

**Depois:**
```
A OC 2026/045 não pode ser emitida: o fornecedor não tem qualificação de material.
Qualifique o fornecedor na ficha da empresa, com as ECRs desta OC, ou salve como rascunho.
```

**Os motivos de `compras.qualificacao_da_oc`**, todos com acento:
- "o fornecedor não tem qualificação de material";
- "o fornecedor está desqualificado para material";
- "a qualificação de material do fornecedor venceu em DD/MM/AAAA";
- "a qualificação de material do fornecedor não cobre a ECR 10" ou "…não cobre as ECRs 03 e 07";
- "a OC não tem fornecedor";
- "sem item de ECR: não é material controlado".

**Uma mudança além do acento, e digo por quê:** antes, as ECRs que faltam saíam pelo **número interno** ("3, 7"). Agora saem
pelo **código que o comprador conhece** ("03 e 07"). Hoje o número interno e o código coincidem, mas isso é coincidência: o
comprador lê o código na ECR, não o número da tabela.

**O que não mudou:**
- A conta de emite ou não emite é a mesma, linha por linha. Só o texto mudou.
- O `detail` técnico (situação, ECRs da OC, ECRs faltando, pelo número) fica como era. É para quem investiga, e a tela não o
  mostra.
- **A recusa de "entregue" fica como era.** A tela nunca chega nela, porque só leva a OC a entregue pela `registrar_entrega`.
  O cenário 21 continua esperando 23514 sem dica.

## §3 — A bateria acompanha

**O ajudante de escrita** só devolve `barrou 23514 +dica` quando:
- a mensagem é "A OC … **não** pode ser emitida: <motivo>.";
- **tem** dica;
- a dica **não cita** `compras.`.

As sete portas de emissão esperam isso: 9, 11, 12, 14, 15, 18 e 25.

**O cenário 37 é novo:** o motivo que o comprador lê, "a qualificação de material do fornecedor não cobre as ECRs 03 e 07".
- Ele diz PULADO enquanto as travas estão desligadas, porque o texto novo sobe com elas.
- Por isso a produção agora mostra 9 PULADO, e não 8.

**A migration de ligar ganhou mais uma trava no fim.** Ela não sobe se a recusa ficar sem dica, ou se a dica citar nome de
função.

**As sabotagens**, todas no ensaio em begin/rollback, entre 14:56:04 e 14:56:15:

| sabotagem | o que acusou |
|---|---|
| a recusa sem dica | a trava da migration barra; tirada a trava, a bateria: as 7 portas |
| a dica com o nome da função, a velha | as 7 portas (e a trava da migration, se estiver) |
| a mensagem sem acento | as 7 portas |
| o motivo pelo número interno em vez do código | o 37 |

## §4 — Para a OC

- **A tela não muda:** ela mostra o texto, não o lê.
- Se algum teste seu compara com o texto sem acento ou com a dica velha, ele vai precisar do texto novo no dia de ligar. O CTO
  já pediu que você diga se for o caso.
