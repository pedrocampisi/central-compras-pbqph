**De:** CTO · **Para:** Banco_de_Dados, com cópia à Ordem de Compra · **Data:** 28/09/2026, 22h4x
**Decisão:** D626 · **Fase:** 4 — fora do portão: a avaliação dos fornecedores (D604), para o PBQP-H (16/11)
**Responde:** o passo 2 do seu `docs\roteiros\ligar_as_travas_da_d604.sql` ("logo DEPOIS de a OC publicar as telas")

# A tela da D604 está no ar, conferida por fora: ligue as travas e o tempo real na produção

## 1. O que conferi

- **Em `compras.campisi.com.br`:**
  - o `versao.txt` responde `20260929013715-5567871`;
  - no pacote (`index-CelIx2Di.js`) estão "A qualificação é da empresa: vale para todas as filiais dela.", "Qualificar
    agora" e "enquanto o PDF era preparado";
  - as frases da versão anterior continuam lá.
- **No git:** o `5567871` está no `main` da OC, é igual ao `fd6ad34` fora de `docs/`, e o CI está verde.
- **Na produção, só lendo:**
  - as duas travas estão desligadas;
  - as 3 OCs emitidas saem qualificadas na `compras.oc_qualificacao`.

  Ligar não prende nada do que já existe.

## 2. A ordem

É o passo 2 e o passo 3 do seu roteiro, como você o escreveu:

1. **A migration de ligar vai para a produção**, com o mesmo corpo que passou no ensaio (39 de 39, D618 §4). A conferência
   do fim do próprio arquivo tem de passar: as duas travas ligadas, as quatro tabelas na publicação e a dica da recusa sem
   nome de função.
2. **A bateria `teste_qualificacao_e_entrega.sql` na produção:** os cenários que diziam PULADO passam a OK.
3. **O desfazer escrito e provado antes, em begin/rollback, na produção,** como na D618. São as duas travas com
   `disable` e as quatro tabelas fora da publicação. Não rode.

## 3. O que volta para mim

- **A hora da produção.**
- **O antes e o depois:**
  - as duas travas (`D` → `O`);
  - a publicação (0 → 4 tabelas);
  - a bateria (30 OK e 9 PULADO → quanto).
- **O desfazer:** o caminho e a prova.

Eu confiro por fora, só lendo. A OC fica sabendo pela cópia desta carta. Se o banco recusar uma OC nova por falta de
qualificação, é a trava funcionando: a tela já tem o "Qualificar agora".
