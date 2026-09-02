# Esta pasta é a sua caixa de correio com o agente do banco

> **Data:** 18/08/2026
> **Estado:** SUBSTITUÍDO por `00_Diretrizes_e_padroes/Padrao_Ouro/3_AGENTES_E_CORREIO.md`
> **Escopo:** era a convenção original da caixa de correio (14–18/08/2026). Hoje quem manda é a lei do correio, e os dois cadernos acumulativos que este texto descreve foram **fechados pela Decisão 7**. Fica como registro de onde a convenção nasceu — **não é o lugar de aprender o protocolo de hoje**.

**Convenção do Pedro** — criada em 14/08/2026, e estendida em 17/08 para que a
devolução chegue **dentro da pasta de cada programa**, e não só no repositório do
banco.

---

## Como funciona

| Arquivo | O que é |
|---|---|
| `<seu-programa>-pendencias-de-banco.md` | **você escreve.** Toda pendência sua que dependa do banco entra aqui |
| `banco-respostas-a-<seu-programa>.md` | **o banco escreve.** A resposta, item por item |

Os dois são **acumulativos**: item resolvido vira ✅ com a data e **fica no
registro**. Nada é apagado — é isso que impede a mesma pendência de ser tratada
duas vezes, por você ou por mim.

## Duas regras que evitam retrabalho

**1. O original mora no `campisi-central`.** Esta pasta recebe a cópia atualizada
a cada devolução nova. Se as duas divergirem, **vale a do `campisi-central`** —
é a que eu mantenho. Você pode escrever nas duas; eu leio as duas.

**2. Escreva o que você já conferiu, e COMO.** "Não existe" e "eu não achei"
levam a consertos opostos: um cria tabela, o outro corrige a consulta. Já perdi
meia hora projetando uma tabela que existia, cheia, e visível para o crachá de
quem tinha perguntado.

Modelo do que funciona bem:

> Conferi por `select ... from core.empresas` com o crachá X: devolveu 0 linhas.

Modelo do que custa tempo:

> A tabela não foi migrada.

## O que NÃO fazer

- **não peça banco por mensagem avulsa ao Pedro.** Ele não é o carteiro entre
  agentes, e pedido em conversa se perde;
- **não altere o banco pelo painel.** Schema só muda por migration versionada no
  `campisi-central`. Se você precisa de coluna, tabela ou permissão, o pedido
  vem para cá;
- **não conclua que algo não existe sem ter olhado.** Ver a regra 2.

## Do outro lado, o compromisso é

A devolução diz **o que foi provado e o que não foi**. Quando eu errar — e já
errei — a correção vem **no mesmo arquivo, marcada**, em vez de o texto antigo
sumir: você precisa saber que a resposta mudou, não achar que sempre foi assim.

---

## Arquivo Morto — a gaveta do que já foi respondido

**Regra do Pedro, 18/08/2026:** toda devolução ensina esta convenção ao agente
que a recebe. O motivo é o mesmo que fez a caixa de correio existir: **documento
vencido lido como atual é pior que documento nenhum.**

### O problema que ela resolve

Uma pasta `docs/` de projeto vivo acumula, em duas semanas, uma mistura de:

- documento que descreve **como é hoje**;
- pedido que **já foi respondido** e virou registro;
- relatório que era **a foto de um dia** e nunca mais foi atualizado.

Quem abre a pasta não distingue os três. E quem lê o terceiro achando que é o
primeiro toma decisão em cima de um estado que não existe mais.

### Como funciona aqui, e o que copiar

**1. Dois níveis, dois índices.**

```
docs/
  INDICE.md              → só o que está VIVO ou EM ABERTO
  Arquivo_Morto/
    INDICE.md            → o que já fechou, e POR QUE fechou
```

**2. Cada linha do índice diz por que aquilo saiu de circulação.** Não basta
mover: "13/08 — busca por apelido. Respondido" resolve em cinco palavras a
dúvida de quem for procurar.

**3. Arquivar não é apagar.** Link de fora que aponte para um documento
arquivado **continua funcionando** — o conteúdo vale como registro do que foi
pedido e do que foi respondido. Só deixou de ser o lugar de procurar "como é
hoje".

**4. ⚠️ Documento novo NUNCA nasce no Arquivo Morto.** Ele nasce vivo e é movido
quando fecha. Criar direto lá é como arquivar a planta antes de construir: o
documento nunca esteve em circulação e ninguém o viu.

**5. O que move, e quando:**

| Situação | Para onde |
|---|---|
| pedido respondido, assunto encerrado | Arquivo Morto |
| relatório/perícia de uma data, que não se atualiza | Arquivo Morto |
| conversa que continua, item ainda aberto | fica viva |
| documento que descreve o estado de hoje | fica vivo, e se corrige quando muda |

**6. Amarre com uma conferência automática.** Aqui,
`scripts/conferir_tudo.py` reprova quando existe documento fora de qualquer
índice, ou link apontando para arquivo que não existe. Sem isso, a organização
dura duas semanas — foi o que aconteceu antes de 14/08, quando 27 documentos
não eram apontados por índice nenhum e ninguém sabia quais valiam.

**A regra curta:** o índice de cima responde *"o que vale hoje?"*. O de baixo
responde *"onde foi parar aquilo?"*. Nenhum documento fica sem responder a uma
das duas.
