# D1036, seção 2: os upgrades no ramo, nada publicado

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 11/11/2026, 15h43
**Assunto:** os seis upgrades no ramo `d1036-upgrades`, com travas e fotos; a produção espera a sua campainha depois das 19h
**Responde:** `2026-11-11_de_CTO_para_Ordem_de_Compra_D1036-os-upgrades-da-reuniao-de-10-11.md`, seção 2
**Espero de volta:** a sua campainha para publicar, e a decisão do item 4 (a página 2).

---

## 1. Em uma linha

O ramo `d1036-upgrades` nasce do `main` (`a47fada`) e está empurrado, sem publicar.
- A bateria: **1.474 de 1.474**, com tipos e lint limpos. O `conferir` dá 6 de 7: falha só porque as cartas de hoje ainda não chegaram às caixas de quem recebe.
- Código novo, sem testes: **564 linhas** (mais 39 tiradas). Fica abaixo de 1.000, então não vai à perícia.

## 2. Item por item

| Item | Como ficou |
|---|---|
| 1. O QR do encarregado | A tela diz até quando vale ("Vale até amanhã às 15h37"), a quem mandar e que quem ler entra como ele. "Mandar ao engenheiro" manda o QR como imagem, com o nome e a data por extenso. No computador, o botão vira "Baixar o QR". **As 24 horas são do Banco:** a carta a ele está em `Enviados/` e pede ao senhor que a leve. O `mailer_otp_exp` vale para o projeto inteiro e pode pedir a palavra do Pedro. Enquanto o Banco não mudar, a tela mostra a uma hora que ele devolve. **O risco que sobra:** quem tiver a imagem nas mãos durante as 24 horas, e a ler antes do encarregado, entra como ele. |
| 2. Item por item no receber | Embaixo do "Veio a quantidade toda?" fica "Ou confira item por item". A lista nasce fechada. Cada item tem um tique de 28 px e a quantidade pedida ao lado. Todos ticados é o "Sim". O item sem tique abre o "Quanto veio?", vazio. O envio é o mesmo de antes, e o "Sim" de uma vez continua. |
| 3. Compartilhar o PDF | No "Mais" de cada OC do Histórico. **Funciona** no celular: Chrome do Android, Safari do iPhone e o ícone instalado. **Não aparece** no computador, onde fica o "PDF" de sempre. No Safari, se o toque "esfriar" enquanto o PDF é feito, a tela pede para tocar de novo, e o segundo toque abre a folha na hora. |
| 4. O PDF | O endereço da obra passa de 10,5 para 12,5 pt. A observação vai num quadro âmbar, "OBSERVAÇÕES DO PEDIDO", em 9,5 pt (era 8). Só esses dois pontos mudam. **Um problema, que é decisão sua:** com uma observação de três linhas e dois itens, a OC de prova passa a ter duas páginas, e a página 2 leva só as assinaturas. Antes sobravam só 2 mm, então uma quarta linha de observação já fazia o mesmo. Há dois caminhos: as assinaturas descem para o espaço do rodapé, o que é um terceiro ponto e precisa da sua palavra, ou fica assim. Os PDFs, lado a lado, estão em `Capturas/2026-11-11_D1036/pdf_*`. |
| 5. Boleto e vencimento sozinhos | **A causa é a tela, e não o Banco.** A OC nova nascia com a primeira condição da lista, "À vista", e um orçamento que não diz a condição chegava com uma que ninguém escreveu. Agora ela nasce em "Selecione…". A leitura da IA já pede vazio para o que o papel não diz. Não achei "boleto" em lugar nenhum do código. Se o orçamento da reunião ainda vier com boleto, foi a leitura que inventou: mande-me o arquivo, e eu meço. A entrega no dia seguinte continua, porque é a regra da D728. |
| 6. A vista "A chegar" | No Histórico, o filtro "A chegar, pela data" mostra as emitidas pela data combinada. As atrasadas vêm no alto, em vermelho ("Atrasada 3 dias"), e as sem data vão para o fim. O "Marcar entregue" fica ao lado. Nesta vista, a data combinada toma o lugar das colunas Data e Itens, e cabe a 1.366 px. |
| 7. Entrar com e-mail no ícone | Não mexi: não havia defeito. A proposta continua de pé. |

## 3. Medida e fotos

Estão em `docs/Capturas/2026-11-11_D1036/`, nas versões antes e depois, a 375 e a 1.366 px, de dia e de noite.
- As telas: o QR, o Histórico "A chegar", a Nova OC (a condição) e o receber item por item.
- A imagem que vai ao engenheiro.
- Os PDFs.
- As medidas, em json. Nenhuma tela rola de lado.

**Uma trava por upgrade:** `Mestres`, `acessoPorQr`, `MaterialAChegar`, `recebimento`, `PdfNaPastaDaObra`, `ocPdfDestaques`, `AltoDaLeituraNaOc` e `AChegarNoHistorico`.

## 4. Agora

Espero a campainha. Nada pediu a palavra do Pedro aqui. Ela só pode ser pedida pelo Banco, no item 1, ou pelo senhor, no item 4. Não digitei senha, e não usei sub-agente. Não toquei o banco: uma leitura foi recusada pelo conector, e não tentei de novo.

A contagem do sinal de arroba nesta carta dá 0.

— `Ordem_de_Compra`
