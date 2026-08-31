# Pendências — Ordem de Compra

> **Data:** 28/08/2026
> **Estado:** VALE HOJE
> **Escopo:** o que **esta casa** tem para fazer, na ordem em que se faz. O que espera outro
> agente está na pasta [`Enviados/`](Enviados/); o que chegou e não foi tratado, em
> [`Devolucoes/`](Devolucoes/).

**De cima para baixo é a ordem em que se faz.** Item novo entra na posição que merece, não no
fim.

---

## 🔴 Abertas

### 1. Cumprir a lei da organização dos documentos

A lei — `..\..\00_Diretrizes_e_padroes\Padrao_Ouro\2_ORGANIZACAO_DOS_DOCUMENTOS.md` — pede coisas
que esta casa ainda não tem. **O esqueleto foi montado em 20/08/2026; falta o conteúdo, que só
quem conhece o software sabe escrever.**

| O que falta | O que fazer |
|---|---|
| **Estado em todo documento** | Cada `.md` desta casa ganha `Data`, `Estado` e `Escopo` no topo. Estado é um de: *vale hoje · proposta · concluído (é registro) · substituído por X*. Sem isso, uma IA nova reexecuta plano pronto |
| **Os motivos saem do `Agente.md`** | O que lá é **motivo** vem para `PLANEJAMENTO.md`, numerado. O que é **descrição** fica. Documento que descreve e justifica junto não envelhece em partes |
| **`Readme.md` → `README.md`** | O arquivo hoje está em `docs/` e com nome que o GitHub não reconhece. A porta do humano é `README.md` na raiz |
| **`pecas/` e `roteiros/`** | Nascem com o primeiro documento de cada uma — pasta vazia não se cria. Peça descreve *o que a coisa é*; roteiro manda *executar passo a passo* |

### 2. Provar na tela: ninguém emitiu OC por este aplicativo depois da troca para `salvar_oc`

*Meu, quando houver conta de ensaio.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.

### 3. Perícia P0-02: CI que reconstrói o banco do zero e testa as permissões

*Espera o `Banco_de_Dados`.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.

⚠️ Este item **não tem carta em `Enviados/`**. Enquanto não tiver, o `Banco_de_Dados` não sabe
que está sendo esperado — e a lei diz que o que espera outro agente vive na pasta, não numa
lista. **Escrever a carta.**

### 4. A camada que fala com o banco não tem verificação nenhuma

> **Verde, nesta casa, quer dizer "o domínio está certo" — não "o programa grava certo".**

*Decidida pelo `CTO` em 28/08/2026: fica para DEPOIS da virada (decisão 86 do caderno dele).*
A conversa que decidiu isto está fechada, em [`Arquivo_Morto/Devolucoes/`](Arquivo_Morto/Devolucoes/) e [`Arquivo_Morto/Enviados/`](Arquivo_Morto/Enviados/). **Ninguém está esperando ninguém: o item é meu, e o que falta é o gatilho chegar.**

São 730 linhas, 15 leituras/escritas de tabela e 3 chamadas de função do banco, com **zero**
verificações e **zero** dublês. Os três defeitos apontados pelo `Banco_de_Dados` em 26/08 foram
achados por ele lendo o meu código — nenhum deles seria pego pela bateria daqui, com ela toda
verde.

**O gatilho, por escrito:** quando a virada fechar **e** o cadastro de fornecedor novo estiver
usando a fila de aprovação do banco, este item sobe para o topo da lista. A primeira coisa que ele
cobre são os três defeitos que o `Banco_de_Dados` achou lendo este código em 26/08 — eles já
provaram que a bateria verde de hoje não os pega.

**E o caminho está decidido junto: ensaio contra o banco de ensaio de verdade, nunca dublê fiel
inventado.** Dublê fiel de banco é a armadilha seguinte; banco de ensaio não finge.

### 5. Não existe conferência automática dos documentos

*Meu.* Vindo do caderno de convenção antiga encerrado em 28/08/2026.

O `Banco_de_Dados` tem um programa que reprova documento fora do índice e link morto
(`conferir_tudo.py`). Aqui a checagem é manual, e foi feita uma vez, em 19/08. **Sem ela a
organização dura poucas semanas** — a observação é do próprio Banco, e vale para esta casa.

### 6. Virada: Supabase gratuito → pago, migração dos dados reais, endereço do piloto

*Decisão do Pedro.* Transcrito do `INDICE.md` em 20/08/2026, sem alteração.

---

## ✅ Fechadas (registro)

### A tela de fornecedor NÃO classifica — e nunca classificou por engano — 28/08/2026

Era a pendência aberta em 28/08 (o upsert não escrever `fornece_material` nem `presta_servico`).
**Fechou por decisão do Pedro, sem uma linha de código:** a classificação vem do CNAE, não da
tela. Deixar nulo era a resposta certa desde sempre — agora tem decisão por trás em vez de ser
acidente. Ver `PLANEJAMENTO.md`, decisão 8.

### As duas recusas do banco pararam de subir cruas na tela — 28/08/2026

`fornecedores_cpf_pessoa_exige_pessoa` e `fornecedores_raiz_pendura_na_empresa` agora viram frase
sem jargão. Os nomes das duas foram conferidos no banco, não copiados da carta. Ver
`PLANEJAMENTO.md`, decisão 5. **Falta a prova visual** — ver as frases na tela exige fazer o
banco recusar de verdade, e esta casa não escreve no banco para ensaiar.

### Endereço de terceiro em carta viva: zero nesta casa — 28/08/2026

Varredura das cartas, documentos e código a pedido do `CTO`. Nenhum endereço a tirar, e nenhum
CPF ou CNPJ real. Ver `Arquivo_Morto/Devolucoes/` e a carta de resposta.

### `CLAUDE.md` na porta, apontando para a lei — 20/08/2026

Esta casa não tinha arquivo de leis. Quem abrisse uma conversa aqui trabalhava sem as regras,
achando que estava com elas. Ver `PLANEJAMENTO.md`, decisão 2.

### Caixa de correio no desenho da lei — 20/08/2026

`Devolucoes_Agentes/` deu lugar a `Devolucoes/` + `Enviados/` + `Arquivo_Morto/`. Ver
`PLANEJAMENTO.md`, decisão 3.
