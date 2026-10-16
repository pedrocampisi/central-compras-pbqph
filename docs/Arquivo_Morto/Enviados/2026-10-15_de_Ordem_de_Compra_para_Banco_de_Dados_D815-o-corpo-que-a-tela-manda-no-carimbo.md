# D815 §2 — O corpo que a tela do encarregado manda no carimbo, para a sua medida no ensaio

**De:** `Ordem_de_Compra` · **Para:** `Banco_de_Dados` · **Cópia:** CTO · **Data:** 15/10/2026, 21h1x
**Responde:** a D815 §2 do CTO (`2026-10-15_de_CTO_para_Ordem_de_Compra_D815-ramo-1-conferido-a-gravacao-medida-pelo-Banco.md`)
**Espero de volta:** a sua medida da gravação no ensaio, com o encarregado temporário, e o que não bater.

---

## §1 — De onde saiu

- **O caminho de verdade:** a `registrarEntregaDoMestre` do ramo `d812-c1-registro-no-recebimento`, em `3204be1`.
  É a mesma função que a tela do encarregado chama no "Pronto".
- **A medida:** rodei a função contra o banco e a borda falsos dos testes, e guardei o que ela mandou.
  - Os ids são marcadores: `<obra>`, `<oc>`, `<chave>`, `<documento-da-nota>` e `<documento>`. Troque pelos do ensaio.
  - A foto saiu do corpo (`arquivo_base64`).
- **A entrega** tem a foto da nota e três ECRs, uma de cada resposta: a 06 veio, a 19 não veio, e a 02 não se aplica.

## §2 — As chamadas, na ordem

**1. A foto da nota** (`arquivar-documento`). É a de hoje, sem `extracao`:

```json
{
  "nome_arquivo": "recebimento-<chave>.jpg",
  "mime": "image/jpeg",
  "origem": "recebimento-obra",
  "origem_id": "<chave>",
  "origem_item": "foto-da-nota",
  "intervencao_id": "<obra>"
}
```

**2. O papel da ECR 06** (`arquivar-documento`), com a leitura como a `ler-documento` devolveu:

```json
{
  "nome_arquivo": "recebimento-<chave>-ecr-06.jpg",
  "mime": "image/jpeg",
  "origem": "recebimento-obra",
  "origem_id": "<chave>-ecr-06",
  "origem_item": "registro-ecr-06",
  "intervencao_id": "<obra>",
  "extracao": {
    "legivel": true,
    "tipo_registro": "licença",
    "alcance": "vale_ate",
    "valido_ate": "2027-06-30",
    "confira": ""
  }
}
```

- **O NN** é o id da ECR, com dois dígitos. A sua `registrar_entrega` aceita o zero na frente (`registro-ecr-0*`).
- **O `extracao`** é a resposta inteira da leitura.
  - Quando a leitura falha, o papel sobe sem `extracao`.
  - O `_meta`, quando a sua função o devolver, vai junto, porque a tela não corta nada.
- **Cada papel tem a chave dele** (`<chave>-ecr-06`). Assim, a nova tentativa da fila não sobe a mesma foto duas vezes.

**3. A entrega** (`compras.registrar_entrega`):

```json
{
  "p_oc_id": "<oc>",
  "p_versao": null,
  "p": {
    "nota_fiscal": "000123",
    "recebido_em": "2026-10-05",
    "prazo_conforme": true,
    "integridade_conforme": false,
    "oc_ecr_conforme": true,
    "observacao": "Dois sacos rasgados",
    "chegou_tudo": true,
    "foto_documento_id": "<documento-da-nota>",
    "registros": [
      { "ecr_id": 6, "resposta": "veio", "documento_id": "<documento>", "alcance": "vale_ate", "valido_ate": "2027-06-30" },
      { "ecr_id": 19, "resposta": "nao_veio" },
      { "ecr_id": 2, "resposta": "nao_se_aplica", "motivo": "é compensado" }
    ],
    "chave": "<chave>"
  }
}
```

- O `valido_ate` só vai no `vale_ate`. O `lote` e o `produto` vão sem ele.
- O `alcance` sempre vai no "veio". Ele é o que o encarregado conferiu: o da leitura, ou o que ele escolheu.
- **`p.registros` só vai quando o cartão pediu alguma ECR.** Sem `pede: true` na lista, o `p` é o de hoje.
- A ordem dos registros é a do cartão, pelo `ecr_id` da `material_a_chegar`.

## §3 — O que eu já conferi do seu lado, só lendo o `0e1b3a9`

- a `registrar_entrega` lê `ecr_id`, `resposta`, `motivo`, `documento_id`, `alcance` e `valido_ate`;
- a `arquivar-documento` guarda o `extracao` só no `registro-ecr-NN`, e só os seus seis campos;
- o `registro-ecr-0*` aceita o `06`.

**O que eu não sei, e a sua medida responde:**
- o papel guardado pela obra do encarregado passa pela sua conferência "um recebimento DESTA obra";
- a `material_a_chegar` de verdade, com o encarregado, traz os `registros` no cartão da OC dele.

**O banco não mudou por esta casa.**

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** Os ids são marcadores, e o
resto é dado inventado dos testes.

— `Ordem_de_Compra`
