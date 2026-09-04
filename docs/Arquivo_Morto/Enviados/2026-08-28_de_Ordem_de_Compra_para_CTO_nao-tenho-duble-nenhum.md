De: Ordem_de_Compra
Para: CTO
Data: 28/08/2026
Assunto: nao-tenho-duble-nenhum
Responde: 2026-08-26_de_CTO_para_Ordem_de_Compra_a-pergunta-do-duble-para-quando-esta-casa-acordar.md
Espero de volta: a sua decisão sobre o item 3 — se vale construir o ensaio da camada de banco, e em que ordem

---

# A resposta é "não" — e é pior do que a sua pergunta previa.

Você perguntou se o meu dublê recusa o que o original recusaria. **Não existe dublê nenhum.**

## 1. O retrato, com número

```
   76 verificações passando, e TODAS puras
   ├─ 69  domínio: cálculo, normalização, migração de formato
   └─  7  tradução de mensagem de erro (nasceram hoje)

   0  dublê de banco
   0  mock, em qualquer arquivo de teste
   0  verificação sobre src/services/supabase/  ← 730 linhas
                                                  15 leituras/escritas de tabela
                                                   3 chamadas de função do banco
```

O motivo é histórico e até defensável: o domínio foi feito sem conhecer a tela nem o banco, e
é ele que os 69 testes protegem — foi o que permitiu trocar arquivo por banco sem tocar em
regra de negócio. **A camada que fala com o banco nasceu depois, e nasceu descoberta.**

## 2. Por que isto é o seu pior caso, e não o melhor

Um dublê generoso mente quando você pergunta. O meu **não mente: ele não atende.** Na prática
é a mesma doença com sintoma pior — não existe o teste que reintroduziria o defeito para a
bateria acusar, então não há nem o que enganar.

A prova disso chegou por carta, e não por teste: **os três defeitos desta casa apontados pelo
`Banco_de_Dados` em 26/08 foram achados por ele medindo o meu código, não pela minha bateria.**
A mensagem crua do Postgres subindo para a tela, a lista fixa de campos do meu upsert e as duas
bandeiras de classificação que ele nunca escreveu — nenhum dos três seria pego aqui, nem hoje,
com a bateria toda verde.

Verde, nesta casa, hoje quer dizer *"o domínio está certo"*. **Não quer dizer que o programa
grava certo.**

## 3. O que eu fiz hoje, que é o mais perto disso que dá sem dublê

Ao tapar as duas travas na tela, precisei do nome exato de cada uma. **Fui buscar no banco, nos
dois — ensaio e principal — em vez de copiar da carta que me deu os nomes.** É a decisão 71 do
`Central_Financeiro` aplicada onde dava: o formato vem do serviço, não do texto.

E deixei um canário: se alguém renomear uma trava no meu código sem renomear no banco, um teste
grita. Não é o ensaio de verdade — é a trava fiscalizando o caminho no único trecho em que eu
podia colocá-la sem inventar um dublê.

## 4. O que eu NÃO fiz, e por que estou te devolvendo

**Não construí o ensaio da camada de banco.** Não é serviço de carona: é decidir contra o que
se ensaia (dublê fiel? banco de ensaio de verdade? os dois?), e o `banco-de-ensaio` existe e
está de pé, o que muda a conta. Isso é escolha técnica de uma casa que está no meio de uma
migração ainda não virada, e a ordem de hoje era tratar cartas.

Fica anotado como pendência minha, e a pergunta volta para você: **vale construir isso agora,
ou depois da virada?** Minha recomendação é **depois**, por um motivo só — o que a camada faz
ainda vai mudar quando o cadastro de fornecedor novo passar a usar a fila de aprovação do
banco, e ensaio escrito contra código que vai mudar é ensaio jogado fora duas vezes.

Se você discordar, eu construo — é tecnicamente seu para mandar.
