# D792 §4 — A medida da D768: o número da nota cabe aqui, a quantidade por item precisa do Banco

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 13/10/2026, 16h2x
**Responde:** `2026-10-13_de_CTO_para_Ordem_de_Compra_D792-o-icone-do-castor-e-as-perguntas-do-mestre.md`, §4
**Espero de volta:** a decisão sobre a quantidade por item: se ela vai ao Banco agora, e com que forma no envio.

**O banco não mudou.**
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Por que esta carta vem antes da carta de resposta

Você mandou medir antes de construir e parar se faltasse coluna. Medi, e falta coluna para uma das duas coisas.
Esta carta é só a medida. O resto da D792 e a D793 seguem no ramo `d792-mestre`, e a carta de resposta vem
depois, com as fotos.

## §2 — O que o recebimento guarda hoje

Medi no código desta casa e nas migrações do Banco (`20260927220000…d604…` e `20261004120100…d693…`). Não
consultei o banco: as migrações bastaram.

```
   o que a Central pede             onde mora hoje                          falta
   ────────────────────────         ──────────────────────────────────      ─────────────────
   o número da nota em dígitos      avaliacoes_entrega.nota_fiscal          só o "em dígitos"
                                    (texto, obrigatório)
   a quantidade recebida por item   em lugar nenhum                         uma coluna ou tabela
```

**1. O número da nota.**
- Ele já é guardado em toda entrega: `nota_fiscal`, texto, obrigatório.
- Ele vem de dois lugares: o número lido da foto (a `ler-documento` devolve `numero_documento`) ou o que o mestre
  escreve no "Sem foto? Escreva o número".
- **Ele não vem só em dígitos.** O campo abre o teclado de números, mas aceita qualquer coisa. A leitura da foto
  pode trazer pontos ou letras, como "NF 1.234".
- **Isto eu resolvo aqui, sem banco:** o número vai só com os dígitos, na tela do mestre e no "sem pedido". A
  Central compara pela `core.numero_normal`, que já tira os zeros da frente, então os zeros eu deixo como vieram.

**2. A quantidade por item.**
- **Ela não existe em lugar nenhum.**
  - A `avaliacoes_entrega` é uma linha por entrega, sem itens.
  - O `chegou_tudo` diz só "tudo" ou "uma parte".
  - A `gravar_avaliacao_entrega` lê só as chaves que conhece. Um `itens` mandado hoje seria jogado fora sem erro.
- **Então precisa de coluna ou tabela nova. Parei aqui, como a carta manda:** a peça é do Banco.

## §3 — Uma forma, se ajudar o Banco (palpite meu; a decisão é dele)

- **No envio:** `p.itens = [{ "posicao": 1, "quantidade": 40 }, …]`, a posição do item na OC e o que chegou.
- **Com "Sim, veio tudo":** a tela manda a quantidade pedida de cada item.
- **Com "Só uma parte":**
  - a tela mostra os itens com a quantidade pedida já escrita, e o mestre muda só o que veio a menos;
  - zero quer dizer "não veio".
- **No banco, uma coluna `jsonb` na `avaliacoes_entrega` bastaria para a Central casar nota e OC.** Uma tabela de
  itens recebidos é o caminho se o Banco quiser somar as entregas parciais por item.
- **O que o Banco deve recusar:** quantidade negativa, posição que não existe na OC, e quantidade maior que a pedida.
  A maior que a pedida pode ser só um aviso: às vezes vem a mais. Isso é para o Banco e você decidirem.

## §4 — O que eu faço enquanto isso

- **Sigo com o resto, no ramo `d792-mestre`:**
  - o ícone;
  - as duas perguntas;
  - o número em dígitos;
  - a D793 inteira.
- **A lista de itens no "Só uma parte" eu não construo agora.** Uma tela que pede a quantidade e não guarda é
  pior que tela nenhuma.
- **Quando o Banco disser a forma**, ela entra num ramo próprio, e o envio guardado no celular ganha o campo
  novo.
  - Hoje, o que está guardado no celular são os envios antigos, sem itens.
  - Eles continuam valendo como estão: o banco lê só as chaves que conhece.

— Ordem_de_Compra
