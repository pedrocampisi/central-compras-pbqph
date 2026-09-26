# D549 — A OC escolhe só a empresa. O campo Filial sai, e a OC grava a matriz sozinha. O vendedor decide a loja, e a nota diz qual foi

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 12h5x
**Responde:** nada sua; é palavra do Pedro na minha janela. Muda o item 3 da D542.
**Decisão:** D549 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação, com a versão no ar, o desfazer, as medidas e as linhas prontas para o
Pedro; e a campainha.

## §0 — A palavra do Pedro (lei 3 §7.2)

- **Quem:** Pedro Paulo Campisi.
- **Quando e onde:** 26/09/2026, perto das 12h5x, na janela do CTO.
- **O que ele disse:** *"essa parada da filial na ordem de compra vai dar muita dor de cabeça para os meus
  engenheiros. Pq eles pedem o material para o vendedor e ele que faz o manejo para qual loja vai sair o material
  […] As vezes só deixamos a matriz"*. Ele pediu que eu avaliasse, lendo também a Central_Financeiro.

## §1 — O que eu medi

- **Na Central_Financeiro, a filial é necessária, mas no cadastro, não na OC.** O `main` reconhece o fornecedor de
  cada nota pelo CNPJ impresso, exato (`bandeja_da_quarta.py:464`, `por_documento`). CNPJ que não está no cadastro vira
  "CNPJ lido não está em core.fornecedores". Por isso as filiais continuam no cadastro.
- **A Central_Financeiro não lê OC nenhuma** (`git grep` no `main`). A decisão 20 dela reserva para o futuro o
  casamento nota ↔ OC pelo número da OC impresso na nota, mas ele ainda não existe.
- **Os lançamentos da produção confirmam o que o Pedro disse.** São 27. Dos 17 que são de empresas com mais de uma
  filial, **13 vieram de filial e 4 da matriz**, e **2 das 4 empresas faturaram por mais de uma loja**. A loja não se
  sabe na hora da OC. Quem diz qual foi é a nota.
- **A matriz e as filiais de uma mesma raiz são a mesma pessoa jurídica.** Uma OC endereçada à matriz vale para a
  empresa, e a nota pode sair de qualquer loja dela.
- **Das 14 empresas com mais de uma filial na Nova OC,** 12 têm a matriz (0001) no cadastro e 2 não têm.

## §2 — A ordem

1. **O campo "Filial" sai da Nova OC.** A pessoa escolhe a empresa, e acabou.
2. **A OC grava a filial principal da empresa, sozinha.** A regra fica numa função só:
   - a **matriz** (a ordem 0001 do CNPJ), se ela estiver na lista da Nova OC;
   - senão, a filial de **menor ordem** que estiver na lista;
   - bloqueada ou inativa nunca é principal. A regra `entraNaOc` já tira as duas.
3. **A pista embaixo do campo diz o que vai no PDF,** sem pedir nada: a razão social, o CNPJ inteiro e o endereço da
   principal. O PDF não muda: ele imprime a filial gravada, que agora é a principal.
4. **Rascunho ou OC antiga com outra filial gravada** abre com a filial que está gravada, sem trocar. A trava da D545
   continua valendo para ela: bloqueada salva, mas não emite.
5. **O Histórico não muda.** Ele já filtra por empresa, e OC antiga continua mostrando a filial dela.
6. **O que sai junto com o campo:** o aviso "Selecione a filial do fornecedor.", o `<select>` e as travas dele. As
   regras de rótulo da filial (cidade, rua, "matriz", "filial nº N") só ficam se ainda tiverem uso, por exemplo no
   Histórico. Senão, saem com as travas delas.

## §3 — Travas, com sabotagem

- Empresa com matriz na lista: grava a matriz.
- Empresa sem matriz na lista: grava a de menor ordem.
- Matriz bloqueada: não é escolhida, e vai a próxima.
- A Nova OC não tem campo Filial.
- Rascunho com outra filial abre com ela, sem trocar.

## §4 — Como publicar

- **Direto na produção,** como na D541 e na D542.
- **Depois de publicar,** meça por fora e anote o desfazer.
- **As linhas prontas para o Pedro,** incluindo estas:
  - escolher a Império e ver que **não aparece** campo Filial, e que a pista embaixo mostra a matriz;
  - fazer o mesmo com a ArcelorMittal;
  - "Visualizar" o PDF e ver a razão social e o CNPJ da matriz.

## §5 — O que fica para depois, e não é seu

**Quando a Central_Financeiro voltar e casar a nota com a OC,** ela compara pela **empresa** (o `empresa_id` da
`fornecedor_resolvido`) e nunca pelo CNPJ da filial. Anoto isso no bloco da pausa dela.
