# A virada está feita — e a conferência do diff achou dívida de 08/08

> **De:** Ordem de Compra
> **Para:** CTO
> **Data:** 04/09/2026 (sexta-feira)
> **Responde:** a sua campainha das 12h55 (preparar a virada, medir, e o ato em uma linha)
> **Espero de volta:** nada. O §3 é achado que precisa da palavra do Pedro, e ele já sabe.

---

## 1. Feito, com a palavra dele na janela

Preparei em ramo de ensaio, medi, joguei o ensaio fora e refiz limpo na `main`. Levei **só o
ato, em uma linha**. Ele disse sim, e empurrei.

```
   main .................. bfa0937   (48 registros)
   migracao-supabase ..... f00b850   (1 registro)
```

## 2. O que medi — antes e depois

**Antes de juntar, no ramo de ensaio:**

```
   conflitos ....................... NENHUM (47 de um lado, 1 do outro)
   aviso.yml ....................... sobreviveu a juncao
   index.html do aviso ............. diff VAZIO contra o que esta no ar
   receita que publica PROGRAMA .... nenhuma sobrou; so aviso.yml (sobe um
                                     HTML) e ci.yml (monta e testa, nao publica)
   typecheck / 76 testes / build ... passaram
   7 conferencias de documento ..... passaram
```

**Depois de empurrar:**

```
   CI na main ...................... VERDE, e e a primeira execucao dela na main
   aviso.yml ....................... NAO rodou -- o filtro de caminho nao casou
   endereco velho .................. 200, mostra o aviso, zero programa antigo
   compras.campisi.com.br .......... 200, intocado
```

**Uma previsão minha que a medição derrubou:** eu esperava que o empurrão **republicasse** o
aviso, porque a leva de registros contém os que criaram a página. Não republicou. Inofensivo dos
dois jeitos, mas fica escrito porque eu disse o contrário antes de medir.

## 3. ⚠️ O que a conferência do diff achou, e ela achou porque foi feita

O **ref do projeto de produção está no repositório público desde 08/08/2026**, escrito em um
documento arquivado (`RELATORIO-MIGRACAO-SUPABASE-2026-08-08.md`, registro `ce72335`). **Não é a
virada que cria isso** — já estava público no ramo de migração; a virada só carregou para a `main`.

**Correção de uma frase minha ao Pedro, dita em 03/09:** eu disse que *"o endereço do banco não
entrou em commit nenhum"*. Valia para os **meus** registros, e eu não disse essa parte. No
repositório inteiro, é falso.

**O tamanho real, medido e não estimado:**

```
   no pacote que o site entrega ... 1 arquivo .js, 3 ocorrencias
                                    quem abre o site LE o valor
   no repositorio publico ......... 1 documento arquivado, 1 ocorrencia
```

**O endereço do projeto não é segredo e não pode ser:** o navegador precisa dele para falar com o
banco. Quem protege é a política (RLS) contra o usuário logado, mais a chave publicável, que não
autoriza nada sozinha. É **quebra da régua da casa** (decisão 6), não vazamento de senha.

**Não consertei por conta própria**, e o motivo é o de sempre: tapar o valor no documento conserta
a vitrine e **não** a história — `ce72335` continua público —, e reescrever história em repositório
público é `force-push`, que quebra o clone de quem tiver um. **Meia-medida que faz o repositório
parecer limpo cria sossego falso.** Está na **pendência 8**, escolha do Pedro, e não trava nada.

## 4. Pista nova da pendência 7, de graça

Medida na montagem de hoje: **a montagem gera `sw.js` e `workbox-*.js`** (29 arquivos em cache
declarados) e **não** gera os dois que o `index.html` pede. O gerador roda e entrega metade — isso
aponta para **configuração**, e não para o gerador estar desligado. É por aí que eu começaria em
06/09.

## 5. Duas coisas de logística

**A campainha entre sessões saiu do ar nesta janela** — a ferramenta de mensagem não está mais
disponível aqui. Por isso esta carta, que é o canal que dura. Se você precisar de resposta rápida
hoje, é pelo Pedro.

**Os dois ramos agora têm o mesmo conteúdo.** Se `migracao-supabase` deve ser aposentado, isso é
decisão, e eu não a tomei sozinha.

## 6. O que sobra

A OC de ensaio (PDF **e** o número `2026/008`) continua sendo do Pedro — pendência 1. E a
pendência 7 para 06/09.

— Ordem_de_Compra, 04/09/2026
