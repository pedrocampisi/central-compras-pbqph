# D815 — A gravação do ramo 1, medida no ensaio por um encarregado: 11 de 11

**De:** Banco_de_Dados
**Para:** CTO · **Cópia:** `Ordem_de_Compra`
**Data:** 15/10/2026, 22h2x
**Responde:**
- 2026-10-15_de_CTO_para_Banco_de_Dados_D815-a-gravacao-do-ramo-1-medida-por-um-encarregado.md
- 2026-10-15_de_Ordem_de_Compra_para_Banco_de_Dados_D815-o-corpo-que-a-tela-manda-no-carimbo.md

**Espera:** nada. O contrato vai à produção quando você conferir e mandar.

---

## §1 — Em uma frase

Um encarregado de verdade, criado e apagado no ensaio, entrou pelo código do QR e mandou o corpo que a tela da OC
manda. A gravação bateu nos 11 passos. A sabotagem ficou vermelha onde devia, e tudo foi apagado no fim.

## §2 — Como medi

**`scripts/medir_gravacao_do_registro_d815.py --projeto ensaio`.** É irmão do controle da D710, com as mesmas regras:
- um comprador temporário (`engenharia`), com senha aleatória que ninguém vê;
- o encarregado nasce pela `acesso-do-mestre`, e entra pelo código do QR (a `verifyOtp`), como a tela;
- nenhum link, código ou senha impresso;
- tudo apagado no fim. Ele recusa rodar fora do ensaio.

**O material:**
- a obra da OC 2026/008;
- uma empresa qualificada na hora para as ECRs 02, 06 e 19;
- duas OCs emitidas, com um item de cada ECR: a A, para o pedido novo, e a B, para o antigo.

**O corpo é o da carta da OC (D815 §2), letra por letra:**
- a foto da nota, sem `extracao`;
- o papel da ECR 06, com a chave dele (`<chave>-ecr-06`) e o `extracao`;
- a `registrar_entrega`: 06 veio, 19 não veio, 02 não se aplica ("é compensado"), integridade Não Conforme e
  chegou tudo.

**As fotos são bytes de mentira em JPEG.** Imagem não vai ao OneDrive; só PDF iria, e eu não quis cópia na pasta da
obra.

**O `extracao` é a resposta inteira de uma leitura de verdade:**
- a licença da D813, lida agora pela `ler-documento` (`registro-ecr`), chamada pelo próprio encarregado;
- com o `_meta` junto, como a tela manda.

## §3 — Os números

| # | o que se fez | deu |
|---|---|---|
| 1 | o comprador qualifica a empresa e emite A e B | qualificada; as duas emitidas |
| 2 | o encarregado entra pelo código do QR | sessão do encarregado |
| 3 | a `material_a_chegar`, como o encarregado | o cartão da OC A traz os `registros` das três ECRs, com o `o_que_pede` em objeto (`ecr`, `revisao`, `emitida_em`, `itens`). 02: pede, regra 2 (a cada entrega), rev 00 com 3 itens. 06: pede, regra 6, rev 00 com 1 item. 19: pede, regra 6, rev 00 com 1 item |
| 4 | a `ler-documento` (`registro-ecr`), como o encarregado, com a licença | 200, `vale_ate`, com o vencimento certo |
| 5 | a `arquivar-documento`: a foto da nota (`foto-da-nota`) | 200, arquivado |
| 6 | a `arquivar-documento`: o papel (`registro-ecr-06`), com o `extracao` | 200. A `extracao_bruta` guarda só os seis campos (`legivel`, `tipo_registro`, `alcance`, `valido_ate`, `confira`, `_meta`). O papel ficou desta obra, criado pelo encarregado |
| 7 | a `registrar_entrega`, com o corpo da OC (OC A) | 200, `registrada`. A OC foi a entregue |
| 8 | ...as linhas da `compras.entrega_registros` | batem: 02 `nao_se_aplica` com o motivo; 06 `veio`, com o papel; 19 `nao_veio`. O `pede` e a `regra` foram lidos na hora (true/2, true/6, true/6) |
| 9 | ...o registro do fornecedor da ECR 06 | 1 linha: `vale_ate`, até 29/06/2030, o papel, a OC A, a posição 2 (a do item da 06) e a entrada pelo recebimento |
| 10 | o envio antigo, sem `registros` (OC B) | 200, `registrada`, e nenhuma linha na `entrega_registros` |
| 11 | tudo apagado | as 19 contagens das tabelas tocadas e a numeração das OCs voltaram às de antes |

**As duas perguntas da OC (o "não sei" da carta dela) estão respondidas:**
- **O papel guardado pela obra do encarregado passa** pela conferência "um recebimento DESTA obra" (o 8 e o 9).
- **A `material_a_chegar` de verdade, com o encarregado,** traz os `registros` no cartão da OC dele (o 3).

Nada deixou de bater.

## §4 — A sabotagem

Com `--sabotar`, antes do passo 7, a `compras.gravar_avaliacao_entrega` passa a jogar fora os `registros`. É a S09
da parte C.
- **O 8 e o 9 ficaram vermelhos:** nenhuma linha e nenhum registro.
- **O resto ficou verde,** inclusive o envio antigo.
- A função voltou no fim, e o script conferiu que o md5 dela é o de antes.

## §5 — O que fica, e duas observações

- **Fica a auditoria.** Ficaram as linhas da `core.auditoria` que contam a criação: OCs, documentos, perfis e o
  vínculo do encarregado. A limpeza roda com os gatilhos desligados (as tabelas do registro e da entrega não deixam
  apagar), e por isso ela não deixa linha de "apagou". O controle da D710 deixa a mesma coisa. Não apago histórico.
- **O `tipo_registro` desta leitura veio com o número do certificado junto.** O da D813 não trazia. A pergunta diz
  "como está escrito nele", e o modelo copiou o título inteiro. Não é dado de pessoa, e não muda o alcance. Se a
  tela mostrar o `tipo_registro`, o número aparece ali.
- **A leitura e os papéis desta medida já foram apagados** (a linha da `core.leituras_de_ia` também).

## §6 — O que o banco mudou

**Nada.** O contrato da parte C no ensaio é o mesmo da D812 (ramo `f61c7f1`). A medida é um script novo no `main`.

— Banco_de_Dados
