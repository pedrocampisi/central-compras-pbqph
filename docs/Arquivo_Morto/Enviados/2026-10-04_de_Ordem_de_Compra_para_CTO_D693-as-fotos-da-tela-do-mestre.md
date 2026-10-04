# D693 — as fotos da tela "Material a chegar", do mestre de obra (no ramo, NÃO ligada ao banco)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 11h2x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D693-a-tela-receber-material-do-mestre.md`, o passo 2 do §5.
**Espero de volta:** a sua conferência das fotos e a palavra do Pedro sobre elas. Depois, a volta do Banco aprovada,
para eu ligar a tela ao contrato (o passo 3).
**O banco não mudou, e a tela não fala com ele.** Nada foi publicado.
**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta, nem nas fotos.**

---

## §1 — O ramo

- **O ramo:** `d693-material-a-chegar`, no commit **`8ec0027`**, saído do `main` de hoje (`a69524d`, o que está no ar).
  - As fotos são do primeiro commit (`ea0f12b`).
  - O segundo conserta o pedido sem data (§4.3), que não aparece em nenhuma foto.
- **A prova:**
  - **737 testes** (eram 712), tipos e lint limpos;
  - **25 testes novos:**
    - 15 da lógica (`tests/domain/recebimento.test.ts`);
    - 10 da tela (`tests/components/MaterialAChegar.test.tsx`), por comportamento;
  - **16 sabotagens, as 16 vermelhas, com o hash igual na volta.**
    - A 13 (o segundo toque rápido apagava o primeiro) passou verde da primeira vez.
    - Ganhou um teste próprio e ficou vermelha.
  - **CI verde** (37209382216).
- **Os arquivos novos:**
  - `src/domain/recebimento.ts`: a lógica pura, que traduz a fala do mestre para o PS.02;
  - `src/features/recebimento/MaterialAChegar.tsx` e o `.module.css`: a tela;
  - o ícone da câmera no `Icon.tsx`.

## §2 — As fotos

- **Onde estão:** `docs\Capturas\2026-10-04_D693\`, no ramo. Estão também na cópia de trabalho:
  `C:\Users\Pedro Paulo\Softwares\Copias_de_trabalho\OC_empresas\docs\Capturas\2026-10-04_D693\`.
- **São 12:** as seis telas do seu §5, a 375, no claro e no escuro. **Nenhuma rola para o lado.**

| Foto | O que mostra |
|---|---|
| `01_a_lista` | a obra no alto, "Material a chegar" e três cartões: o apelido, "Combinado para hoje / amanhã / sexta, 02/10", os itens com a quantidade, o número do pedido e o preço, e "Toque para receber" |
| `02_as_perguntas` | o cartão aberto e as quatro perguntas, com duas já respondidas "Sim" (o verde) |
| `03_a_foto_da_nota` | a foto tirada, "Tirar outra foto" e "Confira o número da nota:" com o número lido |
| `04_um_nao_com_o_texto` | dois "Não" e "Só uma parte" (o vermelho), e o "O que aconteceu?" preenchido |
| `05_o_pronto` | "Recebido." e "O escritório já vê.", com "Voltar para a lista" |
| `06_chegou_sem_pedido` | a foto da nota, o número, "De quem? (se souber)", "O que chegou?" e "Chegou sem estrago?" |

- **Os dados são inventados:** a obra é a "Obra Aurora (teste)" de sempre. Os pedidos, as quantidades, os preços, o
  número e a nota também são inventados; a nota foi desenhada pela própria prova.
- **Os apelidos "Comarco (teste)" e "ABR Gesso (teste)"** são os dois fornecedores que as cartas da D680 já traziam.
  O terceiro, "Areal Rio Claro (teste)", é inventado.

## §3 — As escolhas que o Pedro vai ver

1. **As palavras.** A tela fala como o mestre fala, e a lógica traduz para o que o banco guarda:

   | O mestre vê | O banco guarda |
   |---|---|
   | Chegou no dia combinado? | prazo conforme |
   | Chegou sem estrago? | integridade conforme |
   | Chegou o que foi pedido? | confere com a OC e a ECR |
   | Chegou tudo? / Só uma parte | entrega parcial (`chegou_tudo` no desenho do Banco) |
   | O que aconteceu? | observação; ou tratativa, com dois ou mais "Não" |

   - Um teste lê a tela inteira, com três "Não" e o aviso na tela.
   - Ele quebra se aparecer "conforme", "ECR" ou "tratativa".
2. **"Só uma parte" não é "Não".** É entrega parcial, como o desenho do Banco (§5.1 dele).
   - Abre o "O que aconteceu? (se quiser)", que fica opcional.
   - Não conta para os dois "Não" que tornam o texto obrigatório.
3. **Com um "Não", o texto é "(se quiser)". Com dois ou mais, é obrigatório.**
   - O "Pronto" avisa: `Conte o que aconteceu: tem mais de um "Não".`
   - É a mesma regra do escritório (`pedeTratativa`), chamada do mesmo lugar.
4. **A nota pode vir pela foto ou pelo número escrito.**
   - Sem foto, um link pequeno, "Sem foto? Escreva o número", abre o campo.
   - Se a leitura falha, a tela diz "Não consegui ler. Escreva o número da nota:".
5. **No sem pedido, a pergunta é "Chegou sem estrago?"**, e não "chegou com estrago?".
   - Assim o "Sim" é sempre o lado bom, nas cinco perguntas da tela.
   - Para o banco, vira `chegou_com_estrago = não(resposta)`.
6. **O tamanho:**
   - a letra é de 18 px (o escritório usa 14 a 15);
   - as perguntas, de 20 px;
   - os botões de resposta têm 64 px de altura;
   - uma ação laranja por tela, o resto de contorno;
   - o padrão Creme, que também funciona no escuro.
7. **Sem menu.** A tela é só esta. "Sair" é um link pequeno, no pé da lista.
8. **O "Pronto"** diz "Recebido." no recebimento e "Registrado." no sem pedido. As duas frases terminam com "O escritório
   já vê."

## §4 — O que a tela ainda NÃO faz

1. **Falar com o banco.**
   - A tela recebe os pedidos e as funções de gravar de quem a monta; hoje, quem monta é a prova.
   - A ligação é o passo 3, depois da volta do Banco aprovada.
2. **O sinal fraco, pela metade.**
   - **Hoje:** se a gravação falha, nada se perde enquanto a tela está aberta (as respostas, o número, o texto e a foto).
     - A tela diz: "Não consegui mandar agora. O que você preencheu continua aqui. Toque em "Pronto" de novo quando
       tiver sinal."
     - O teste derruba a rede e confere isso.
   - **Falta:**
     - guardar no aparelho, para não perder se ele fechar o app;
     - mandar de novo sozinho quando o sinal voltar.
   - Faço isso na ligação, porque depende de como a foto sobe (a `arquivar-documento` do desenho do Banco).
3. **O dia combinado.**
   - O cartão precisa de **uma data por pedido**, e o Banco mediu que a OC não tem nenhuma (o §10.1 dele).
   - Sem ela, o cartão diz "Sem dia combinado", e a primeira pergunta fica no escuro.
   - Esta frase saiu de um defeito que achei escrevendo esta carta: a tela dizia "Combinado para sem dia combinado".
     O conserto está no segundo commit, com um teste e duas sabotagens.
   - **O meu voto:** é a coluna `entrega_prevista` que o Banco propõe.
     - Do lado desta casa, entra um campo de data na Nova OC, opcional.
     - É trabalho pequeno, e entra no passo 3 se você mandar.
4. **O lado do escritório** (o Histórico com a entrega do mestre e a fila do sem pedido), o login do mestre caindo
   direto nesta tela e a leitura do número pela `ler-documento`: tudo isso vem na ligação.

## §5 — O tamanho

- **Agora:** 933 linhas novas fora dos testes:
  - 415 na tela;
  - 387 no estilo;
  - 122 na lógica;
  - 9 no ícone.
- **Com a ligação e o lado do escritório, vai passar de mil.**
  - A perícia da §9.5 vai ser necessária antes de publicar.
  - Aviso de novo quando o ramo estiver completo.

## §6 — A caixa

- **A carta do Banco**, `..._de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D693-o-desenho-do-recebimento-pelo-mestre.md`,
  chegou como cópia e foi lida.
  - O desenho cabe na tela como ela está:
    - o "chegou tudo" que ela manda;
    - a foto como documento à parte;
    - os campos do sem pedido: de quem, a nota, o que chegou e o estrago.
  - **As perguntas do §10 dele são suas.** Nesta casa, só a 10.1 (o dia combinado) toca a tela, e o meu voto está no §4.
- **A sua D693 e a carta do Banco ficam na `Devolucoes/`** até a ligação: são a base do trabalho que falta.
- A decisão 80 registra este passo, e a pendência 28 abre para a D693.
