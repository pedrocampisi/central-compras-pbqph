# D816 — No ar em `9178a00a`: o perfil sem a Ordem de Compra vê o aviso e não entra

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 21h1x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D816-o-aviso-sem-a-OC-conferido-vai-ao-ar.md`
**Espero de volta:** a sua conferência por fora. O ramo 2 da parte C vem depois, numa carta própria.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O que foi feito

1. **O retoque (§2):** o comentário "Logado, mas sem acesso concedido" voltou para cima da `SemAcessoPage`. A
   `SemOrdemDeCompraPage` ficou antes dele, com o comentário dela. Só comentário.
   - O commit é o `14fe8a4`, no ramo `d814-perfil-sem-oc`, com o CI verde (38828476712).
2. **A junção:** o ramo no `main` em `b3e7722`, sem conflito. São +71 e −10 em `src`, como no ramo.
3. **A bateria no `main` juntado:** 1119 testes, com tipos e lint limpos.
4. **O desfazer, anotado antes:** `f47f687c`, com 100% do tráfego. É a versão `20261015210401-3e09378`.
5. **Publicado pelo PowerShell às 21h18:** `9178a00a-4913-4a4d-8f34-f7b707af2d11`, versão
   `20261016001818-b3e7722`, com 100% do tráfego.
   - A hora da versão é a de Greenwich: 00h18 de 16/10 lá, 21h18 de 15/10 aqui.

**A parte C não foi junto.** O ramo 1 segue no `3204be1`, esperando a medida do Banco. A parte B segue no ramo dela, e
o servidor do teste do Pedro continua no `1647826`.

## §2 — A medida por fora

- **O `versao.txt` servido é o novo:** `20261016001818-b3e7722`, igual ao do pacote gerado.
- **Os dois pedaços que mudaram** (`index-Das_nBNK.js` e `extractItems-DRGBZ1jR.js`) têm a mesma impressão SHA-256 do
  pacote gerado.
- **No pedaço servido** (`index-Das_nBNK.js`):
  - a frase "Seu acesso não inclui a Ordem de Compra." aparece uma vez;
  - a coluna `sem_ordem_de_compra` aparece.
- **Não medi com uma pessoa marcada.** A marca é do Banco, e pela sua carta a coluna chega com a migration dele. Até
  lá, o `42703` lê o perfil como antes, e todo mundo entra como entrava. A tela foi provada pela bateria e pelas fotos
  do ramo.

## §3 — Daqui em diante

1. **O ramo 2 da parte C**, que já tinha começado: a qualificação com os registros do fornecedor, contra o banco falso,
   sem publicar.
2. **O teste do Pedro na parte B** passa na frente quando vier.

**O desfazer, se precisar:** `f47f687c`.

— `Ordem_de_Compra`
