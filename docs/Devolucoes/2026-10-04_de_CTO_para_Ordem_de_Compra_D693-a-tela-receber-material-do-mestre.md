**De:** CTO · **Para:** Ordem de Compra (cópia ao Banco de Dados) · **Data:** 04/10/2026, 11h1x
**Decisão:** D693 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Espero de volta:** primeiro as fotos da tela com dados de mentira, a 375, para eu conferir e levar ao Pedro.
Depois o ramo ligado ao contrato do Banco, com testes e CI.

# A tela "Material a chegar", para o mestre de obra receber o material pelo celular

## 1. O que o Pedro decidiu (D693)

O Pedro decidiu, na minha janela, depois de ver o que existe hoje:

- **Sai o bot do Telegram.** Quem recebe o material é **o mestre de cada obra**, numa tela simples no celular.
  As palavras dele: "acho que um app bem simples seria mais intuitivo, pensando que quem irá receber o material é
  um mestre de obra, que não possui um bom domínio de tecnologia".
- O mestre **vê só a obra dele**.
- **O login é dele**: entra uma vez e o celular lembra.
- **Ele vê preço** (vê o pedido como ele é).
- **Material que chega sem pedido também se registra**; o escritório liga a um pedido depois.
- Ele aprovou o desenho ("Eu aprovo esse desenho do app"), e **o app mora na OC**: "Na OC, pode mandar".

O banco é do Banco de Dados (carta irmã, `2026-10-04_de_CTO_para_Banco_de_Dados_D693-o-recebimento-pelo-mestre-de-obra.md`): o papel novo que só recebe, a obra dele, a lista, o
"chegou tudo", a foto e o sem pedido. A volta dele vem para você também.

## 2. Para quem é

Para um mestre de obra com pouca intimidade com tecnologia. Ele usa a tela no canteiro, no sol, às vezes com a
mão suja e com sinal fraco. A tela é medida por ele, não pelo escritório.

## 3. A tela do mestre

1. **Ele entra e já cai em "Material a chegar"**, da obra dele.
   - Sem menu e sem as outras telas.
   - Instalado como app no celular (a OC já é instalável).
2. **Cada cartão mostra:**
   - o fornecedor, pelo apelido;
   - os itens e as quantidades;
   - o preço;
   - o dia combinado.
3. **Quando ele toca no cartão, vêm as perguntas, cada uma com dois botões grandes:**

   | Pergunta | Botões |
   |---|---|
   | Chegou no dia combinado? | Sim / Não |
   | Chegou sem estrago? | Sim / Não |
   | Chegou o que foi pedido? | Sim / Não |
   | Chegou tudo? | Sim / Só uma parte |

4. **A foto da nota:** um botão abre a câmera.
   - O número vem da leitura da foto e ele confirma.
   - Se a leitura falhar, ele digita.
5. **Se alguma resposta for "Não",** aparece "O que aconteceu?".
   - Ele pode escrever ou usar o microfone do teclado.
   - Com dois ou mais "Não", a resposta é obrigatória (é a tratativa do PS.02).
6. **"Pronto"** termina com uma confirmação clara, como "Recebido. O escritório já vê."
7. **Um botão "Chegou material sem pedido":** a foto da nota, o que chegou e se chegou com estrago.
8. **Sinal fraco:**
   - não perde o que ele preencheu nem a foto se a rede cair;
   - tenta de novo;
   - se não der, diz isso com clareza.
9. **Palavras do canteiro.**
   - Nada de "Conforme", "Não Conforme", "ECR" ou "tratativa" na tela dele.
   - O banco guarda os nomes certos; a tela fala como ele fala.
   - Letra e botões maiores que os do escritório.
   - A cara é o padrão Creme da casa. As fotos ao Pedro decidem o tamanho.

## 4. O escritório

- No Histórico, a entrega do mestre aparece como a de hoje: quem recebeu, as respostas e a foto.
- A fila "chegou sem pedido": quem pode emitir OC vê e liga o registro ao pedido certo.

## 5. A ordem

1. **Depois da D685 publicada.**
2. **As fotos com dados de mentira, sem esperar o Banco.** A 375, em seis telas:
   - a lista;
   - as perguntas;
   - a foto;
   - um "Não" com o texto;
   - o "Pronto";
   - o sem pedido.

   Eu confiro e levo ao Pedro. Ele conhece o mestre e é quem diz se está simples o bastante.
3. **Ligue ao contrato do Banco** quando a volta dele chegar.
4. **Ramo, testes e CI.** Publicar é seu (emenda 3), depois da minha conferência.
5. **Perícia** pela §9.5 se passar de mil linhas novas fora dos testes.
