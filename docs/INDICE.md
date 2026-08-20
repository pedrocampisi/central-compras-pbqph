# Índice — o que vale hoje

**Projeto:** Central de Compras PBQP-H (Ordem de Compra) · branch de trabalho
`migracao-supabase` · **atualizado em 19/08/2026**

> Este índice responde **"o que vale hoje?"**. O que já fechou está em
> [`Arquivo Morto/INDICE.md`](Arquivo%20Morto/INDICE.md), que responde
> *"onde foi parar aquilo?"*.
>
> Convenção do Pedro (18/08/2026), adotada aqui em 19/08. **Documento novo
> nasce vivo** — nunca direto no Arquivo Morto. Nenhum documento pode ficar
> fora dos dois índices.

## Vivos — descrevem o estado de hoje

| Documento | Para quem | O que responde |
|---|---|---|
| [Agente.md](Agente.md) | IA de manutenção | Arquitetura, contratos, constantes. **Comece pela seção 0**: as duas branches divergem, e a 0 vence sobre o resto. A 0.1 é o padrão visual; a 0.2 é o contrato de gravação da OC |
| [Readme.md](Readme.md) | dev humano que nunca viu o projeto | Como rodar, mapa de arquivos, como adicionar coisas comuns |
| [Fluxo.md](Fluxo.md) | dono/operador | O que acontece na tela, sem abrir código |

## Vivos — conversa em andamento

| Documento | O que é |
|---|---|
| [Devolucoes_Agentes/](Devolucoes_Agentes/) | Caixa de correio com o agente do banco. **Toda pendência que dependa do banco entra ali**, nunca em mensagem avulsa ao Pedro. O [LEIA-ME](Devolucoes_Agentes/LEIA-ME.md) explica a convenção |
| [Devolucoes_Agentes/ordem-de-compra-pendencias-de-banco.md](Devolucoes_Agentes/ordem-de-compra-pendencias-de-banco.md) | O que **eu** peço ao banco, e o que já foi respondido |
| [Devolucoes_Agentes/banco-respostas-a-ordem-de-compra.md](Devolucoes_Agentes/banco-respostas-a-ordem-de-compra.md) | O que **o banco** respondeu, item por item |

## Onde está o estado da migração

Não existe um documento único de status, e é de propósito: relatório de status
envelhece calado. O estado vivo está em dois lugares —

- **o que falta do meu lado e o que espera o banco:** a caixa de correio acima;
- **o que já está ligado e como funciona:** seção 0.2 do `Agente.md`.

## O que continua aberto (19/08/2026)

| Item | De quem |
|---|---|
| Provar na tela: ninguém emitiu OC por este aplicativo depois da troca para `salvar_oc` | meu, quando houver conta de ensaio |
| P0-02 da perícia: CI que reconstrói o banco do zero e testa as permissões | `campisi-central` |
| Virada: Supabase Free→Pro, migração dos dados reais, URL do piloto | Pedro |
