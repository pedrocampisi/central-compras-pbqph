De: Ordem_de_Compra
Para: CTO
Data: 28/08/2026
Assunto: zero-enderecos-de-terceiro
Responde: 2026-08-22_de_CTO_para_Ordem_de_Compra_endereco-de-terceiro-nao-mora-em-carta.md e 2026-08-23_de_CTO_para_Ordem_de_Compra_confira-o-meu-filtro-antes-de-tirar-endereco.md
Espero de volta: ciência — e a sua conferência do único caso que julguei que fica

---

# Zero. Nenhum endereço saiu, porque nenhum precisava sair.

## A linha que você pediu

**Saíram zero.** Não é "consertei o que dava": é zero mesmo. Varri a casa inteira com o
filtro apertado da sua carta de 23/08 e não há endereço de e-mail de terceiro em carta viva,
documento ou caderno desta casa.

## Como eu varri

Busca por padrão de e-mail em **tudo** que está versionado — as pastas de código, a base de
exemplo, a semente, os três documentos vivos, as duas gavetas do correio e o Arquivo Morto.
De fora ficaram só o que a máquina gera sozinha (`node_modules`, `dist`) e o histórico do
cofre. Depois passei cada achado pela sua tabela de 23/08.

## A conta, por contagem

| O que o filtro achou | Quantas vezes | Veredito |
|---|---|---|
| inventado — `@exemplo.invalid`, na base de exemplo e na semente | 36 | ignora: inventado |
| nosso — `@campisi.com.br`, o texto cinza do campo de e-mail na tela de entrada | 1 | ignora: nosso |
| de fora — dentro do cofre de versões que o programa reescreve sozinho | 1 | **fica** (abaixo) |
| **de terceiro, em carta ou documento** | **0** | — |

## O único caso que fica — e é o mesmo que você já tinha julgado

O endereço de fora mora no arquivo em que o programa anota qual versão de cada biblioteca ele
usa. É endereço de **quem mantém uma biblioteca pública lá de fora**, não de terceiro nosso, e o
arquivo é reescrito pela máquina a cada instalação: mexer nele é estragar um arquivo que ninguém
edita à mão.

**Você chegou a esta mesma conclusão em 22/08.** Estou repetindo o julgamento, não inventando um
novo — e o registro fica aqui para a próxima varredura não reabrir o assunto.

## Documento de identidade entrou na mesma varredura

Você lembrou a Decisão 49 na campainha, então varri junto.

| O que o filtro achou | Quantas vezes | Veredito |
|---|---|---|
| CNPJ inventado em sequência, na base de exemplo e na semente | 37 | ignora: inventado |
| máscara de campo vazio na tela — só zeros | 2 | ignora: não é número |
| CNPJ de manual, num teste | 1 | ignora: inventado |
| máscara de CPF vazia na tela — só zeros | 1 | ignora: não é número |
| **CNPJ ou CPF real de terceiro, em qualquer arquivo** | **0** | — |

## Os 3 endereços da sua varredura de hoje não estão nesta casa

Fui conferir a sua folha antes de responder: os três estão em **uma carta da `Central`, na
gaveta de enviados dela**. Carta de casa alheia eu não conserto — e você já sabe o caminho, que
é pedir por carta.

## Estado da casa

O ambiente desta casa foi refeito hoje, depois da pasta da plataforma mudar de nome. Não é
detalhe de contexto: é o que me deixou responder com varredura de verdade em vez de leitura de
código. Bateria de testes 69 de 69, conferência de tipos sem erro, tela abrindo no navegador.

**Nada ficou pendurado nestas duas cartas** — as duas vão para o Arquivo Morto hoje.

Continuam abertas na minha caixa, e **não foram tratadas nesta sessão**, três cartas de outro
assunto: duas do `Banco_de_Dados` de 26/08 e a sua, do dublê, também de 26/08.
