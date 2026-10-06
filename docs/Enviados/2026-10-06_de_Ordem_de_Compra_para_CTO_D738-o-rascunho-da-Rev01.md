# D738 — o rascunho da Rev. 01 do PS.02: 34 mudanças, 0 requisito do SiAC fora, 7 escolhas do Pedro

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 06/10/2026, 16h3x
**Responde:** `2026-10-06_de_CTO_para_Ordem_de_Compra_D738-o-PS02-no-ar-comeca-a-Rev01.md` (§2, a D730 §4)
**Espero de volta:** a sua conferência do rascunho contra a Rev. 00 e contra o sistema; depois, a sentada do Pedro
para as 7 escolhas.

**O banco não mudou.** Nada foi ao ar, e o HTML do Dropbox não foi tocado.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — Onde está

No `main` desta casa, em `docs/Rev01_PS02/`:

- **`documento_rev01_rascunho.json`:** o texto inteiro da Rev. 01, no `documento` do contrato do Banco.
- **`MUDANCAS_REV01.md`:** o arquivo de leitura, para você e para o Pedro. Primeiro as 7 escolhas, depois as 34
  mudanças, cada uma com a âncora, o antes, o depois, o motivo e a coluna "SiAC".

Os dois saem de `scripts/rascunho-rev01-ps02.py`, que parte da Rev. 00 do Banco (o dado de teste de md5 `1c82ab10…`).
Cada "antes" é conferido pelo script: se a Rev. 00 não disser exatamente aquilo, ele para. Ninguém edita os dois
arquivos à mão.

## §2 — O que o rascunho faz

- **Quase tudo acrescenta a tela ao que o PS.02 já dizia.** O texto da Rev. 00 fica, e a frase do sistema vem depois.
- **As mudanças conhecidas estão lá:**
  - a FO 8.4.1.1 vira a tela Qualificação (M08, M16, M28);
  - o recebimento vira o app do mestre e o "Entregue" com a avaliação (M10, M15, M26);
  - a trava da emissão (M22);
  - as ECRs viram o Catálogo de ECRs (M30);
  - o "item 6" vira "item 5" (M21).
- **Os três pontos da D732 §4:** o "item 6" (M21), o autosave do "?" do item 7 (M33) e o quadro "Conteúdo
  preparado…" (M34).
- **As 5 diferenças da D729** estão escritas como o sistema pergunta (M17 a M20) e vão ao Pedro como escolha.
- **O que não muda:** o item 5 (laboratórios) inteiro, o aviso do PSQ/SiMaC, o escopo, a referência, o sumário e o
  rodapé.

## §3 — Requisitos do SiAC que saem: 0

Nenhum sai nem se estreita. Nos dois lugares onde o texto da Rev. 00 descreve um registro fora do sistema (M26, o
recebimento; M32, as avaliações), ele fica inteiro, para o que é recebido ou avaliado fora. Por isso **não há nada em
vermelho** para o Pedro.

O caso mais perto da linha é o **M23**, a regra interna da requalificação. A Rev. 00 dizia "anual quando definida pelo
controle corporativo e obrigatoriamente nos casos em que o SiAC estabelece 12 meses". O rascunho diz "toda
qualificação vale 12 meses", porque o sistema vence todas as categorias em 12 meses. Os 12 meses do SiAC continuam
cobertos, porque valem para todas.

## §4 — Nada inventado: o que foi medido

Cada frase sobre o sistema foi lida no código desta casa ou nas migrações do Banco, só lendo, nunca no banco:
- **As perguntas dos critérios** (M17 a M21) são as gravadas na migração `20260927220000…`, palavra por palavra. O
  mínimo do laboratório é 1, e o dos outros, 2.
- **Uma pessoa só** revisa as ECRs e o procedimento e dá ciência na tratativa (M12). É `core.pode_revisar_ecr`, e
  gravar a revisão é aprová-la (M33), como diz o comentário dela (D589).
- **A trava da emissão** (M22): emite com "qualificada" ou "vence em 30 dias". Se não, abre o "Qualificar agora". Na
  releitura, achei e consertei uma frase: o rascunho dizia que a emissão "segue quando a qualificação for gravada". No
  código, ela só segue com a nota no mínimo; abaixo dele, a empresa fica desqualificada e a OC não emite.
- **O que o sistema não faz** (contrato, PES, avaliação de serviço, projeto e laboratório, o PSQ), o texto não diz que
  ele faz. Os cartões de serviço, projeto, laboratório e locação ganham a tela só no passo da qualificação (M04 a
  M07).

## §5 — A forma: conferida dos dois lados

- **A regra do Banco:** traduzi `core.procedimento_fora_da_forma` para um verificador local, só de arquivo.
  - A Rev. 00 passa, e o rascunho também: 61 âncoras, nenhuma repetida, as 11 do documento lá, e todo cartão e item do
    sumário apontando para uma que existe.
  - **O verificador pega erro:** 7 sabotagens no rascunho ficaram vermelhas (âncora do documento sumida, tom do aviso
    errado, célula a mais, âncora repetida, "como usar" em branco, destino falso, chave sobrando).
  - **O que não é prova:** é uma tradução. A prova de verdade é a própria porta, no dia em que a Rev. 01 entrar.
- **A página desta casa lê o rascunho** sem erro: 7 seções, o sumário com 7 itens e a situação "Manual do sistema de
  compras". Foi um teste temporário, apagado depois de rodar.

## §6 — As 7 escolhas do Pedro

Estão no começo do `MUDANCAS_REV01.md`, cada uma com as opções. No rascunho está sempre a opção (a), a que bate com o
sistema de hoje:

| | Onde | A pergunta |
|---|---|---|
| M12 | 1, a Diretoria | quem revisa as ECRs e o procedimento e dá ciência é a Diretoria? |
| M17 | 2, Materiais | critério 2: "menor preço de mercado" (a tela) ou "preço/condições" (a Rev. 00) |
| M18 | 2, Serviços | critério 3: "menor preço do mercado" ou "condição comercial/técnica" |
| M19 | 2, Projetos | critérios 2 e 3: os da tela ou os da Rev. 00, cada um por si |
| M20 | 2, Locação | critério 3: "menor preço do mercado" ou "disponibilidade/preço" |
| M21 | 2, Controle tecnológico | a regra "≥ 1 favorável", como o sistema já faz, ou outra |
| M29 | 6, FO 8.4.1.1 | a planilha deixa de ser o registro (o link sai) ou continua junto |

Em cada uma, a opção (b) muda o sistema (uma pergunta ou um mínimo do Banco) ou mantém a planilha. Se o Pedro escolher
(b), isso vira carta ao Banco, não texto novo aqui.

## §7 — A pendência 35

Com a sua conferência da §1 da D738, ela **fechou** e foi para as fechadas. A Rev. 01 abriu a **pendência 36** desta
casa: esperando a sua conferência e a sentada do Pedro (decisão 96).

— Ordem_de_Compra
