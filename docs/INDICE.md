# Índice — o que vale hoje

> **Data:** 02/09/2026
> **Estado:** VALE HOJE
> **Escopo:** a porta de `docs/` — o que vale hoje e onde está. **NÃO** lista cartas (a gaveta é a verdade, Decisão 7) nem o que já fechou (`Arquivo_Morto/INDICE.md`).

**Projeto:** Central de Compras PBQP-H (Ordem de Compra) · branch de trabalho
`migracao-supabase` · **atualizado em 28/08/2026**

> Este índice responde **"o que vale hoje?"**. O que já fechou está em
> [`Arquivo_Morto/INDICE.md`](Arquivo_Morto/INDICE.md), que responde
> *"onde foi parar aquilo?"*.
>
> Convenção do Pedro (18/08/2026), adotada aqui em 19/08. **Documento novo
> nasce vivo** — nunca direto no Arquivo Morto. Nenhum documento pode ficar
> fora dos dois índices.

## Vivos — descrevem o estado de hoje

| Documento | Para quem | O que responde |
|---|---|---|
| [Agente.md](Agente.md) | IA de manutenção | Arquitetura, contratos, constantes. **Comece pela seção 0**: as duas branches divergem, e a 0 vence sobre o resto. A 0.1 é o padrão visual; a 0.2 é o contrato de gravação da OC |
| [roteiros/guia-do-desenvolvedor.md](roteiros/guia-do-desenvolvedor.md) | dev humano que nunca viu o projeto | Como rodar, mapa de arquivos, como adicionar coisas comuns. **Descreve a branch `main`** (arquivo JSON) |
| [melhorias-futuras/README.md](melhorias-futuras/README.md) | Pedro e IA | O índice das ideias ainda não implementadas — ele responde pelos arquivos da pasta dele. É **proposta**, não plano de execução |
| [Fluxo.md](Fluxo.md) | dono/operador | O que acontece na tela, sem abrir código |

## Vivos — conversa em andamento

A caixa de correio segue a lei da casa
(`..\..\00_Diretrizes_e_padroes\Padrao_Ouro\3_AGENTES_E_CORREIO.md`). **A gaveta diz a
direção da carta** — não é preciso abrir para saber quem deve resposta:

| Gaveta | O que é |
|---|---|
| [Devolucoes/](Devolucoes/) | **Chegou para mim e eu ainda não tratei.** Quem espera sou eu |
| [Enviados/](Enviados/) | **Eu pedi e ainda não me responderam.** Quem espera são eles |
| [Arquivo_Morto/](Arquivo_Morto/) | Fechado. Serve para não tratar duas vezes; não serve para saber como as coisas estão hoje |

**Toda pendência que dependa do banco entra na caixa**, nunca em mensagem avulsa ao Pedro.

**Não há tabela de cartas aqui, e é de propósito.** Os dois cadernos acumulativos que ocupavam
este lugar foram encerrados em 28/08/2026 — caderno que nunca fecha não pode ser arquivado,
porque metade dele está sempre em aberto. Hoje **cada assunto é uma carta datada**, e a gaveta
em que ela está diz tudo o que o índice diria. Listá-las aqui seria a segunda lista que a lei
proíbe.

| Registro | O que é |
|---|---|
| [Arquivo_Morto/LEIA-ME.md](Arquivo_Morto/LEIA-ME.md) | A convenção antiga do correio, **substituída pela lei em 20/08/2026**. É registro |
| [Arquivo_Morto/INDICE.md](Arquivo_Morto/INDICE.md) | Onde foi parar cada carta encerrada, e **por quê** |

## Onde está o estado da migração

Não existe um documento único de status, e é de propósito: relatório de status
envelhece calado. O estado vivo está em dois lugares —

- **o que falta do meu lado e o que espera o banco:** a caixa de correio acima;
- **o que já está ligado e como funciona:** seção 0.2 do `Agente.md`.

## O que continua aberto

**Não está aqui, de propósito.** A lei proíbe segunda lista: duas listas da mesma coisa divergem,
e a errada é sempre a que alguém lê.

```
   o que é trabalho MEU ··············· PENDENCIAS.md, em ordem
   o que espera OUTRO agente ········· a pasta Enviados/
   o que chegou e não tratei ········· a pasta Devolucoes/
```

Os três itens que ficavam nesta tabela foram transcritos para
[`PENDENCIAS.md`](PENDENCIAS.md) em 20/08/2026, sem alteração de conteúdo.
