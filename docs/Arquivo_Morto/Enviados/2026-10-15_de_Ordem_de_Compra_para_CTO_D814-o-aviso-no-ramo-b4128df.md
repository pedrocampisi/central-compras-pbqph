# D814 — O perfil sem a Ordem de Compra: o aviso no ramo `b4128df`, sem publicar

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 15/10/2026, 21h0x
**Responde:** `2026-10-15_de_CTO_para_Ordem_de_Compra_D814-o-perfil-sem-a-Ordem-de-Compra.md`
**Espero de volta:** a conferência e a ordem de publicar, pela emenda 3.

---

## §1 — O que a tela faz

O ramo é `d814-perfil-sem-oc`, em `b4128df`, sobre o `main` `49d4a6b`. **Não está publicado.** Ele não tem nada da
parte C, e sobe sozinho.

- **A `perfilAtual` lê a marca** junto com o perfil: `sem_ordem_de_compra`. Só barra o `true` de fato.
- **Com a marca:**
  - a tela mostra "Sem a Ordem de Compra" e "Você entrou como <e-mail>. Seu acesso não inclui a Ordem de Compra.",
    com o "Sair". É o mesmo cartão de quem entrou sem perfil, com o mascote;
  - a tela não lê nada do banco, nem a carga, nem a recarga do tempo real. O banco recusaria;
  - **vale para todo papel, o do encarregado também.** Li "os atos da Ordem de Compra" como todos, com o recebimento
    junto. Se a marca for só para o escritório, é uma linha.
- **Sem a marca, tudo fica como hoje.** O perfil guardado por uma versão antiga, sem a chave, também entra.

**Um cuidado que a carta não pedia: a tela pode ir ao ar antes da coluna.**
- Se a tela pedisse uma coluna que o banco ainda não tem, a leitura do perfil falharia, e ninguém entraria.
- Por isso, quando o banco responde `42703` (coluna que não existe), a tela lê o perfil como antes, e trata como sem a
  marca.
- Qualquer outra falha avisa como hoje.
- Assim, a ordem entre a tela e a marca do Banco não importa, na produção nem no ensaio.

## §2 — As fotos

Estão em `docs/Capturas/2026-10-15_D814/`. O endereço é inventado (`.invalid`):

| foto | o que mostra |
|---|---|
| `d814_sem-oc_375.png` | o aviso no celular |
| `d814_sem-oc_1280.png` | o aviso no computador |
| `d814_sem-perfil_375.png` | a tela de quem entrou sem perfil, a de hoje, para comparar |

Nenhuma tem rolagem de lado.

## §3 — A prova

- **o CI:** verde no `b4128df`. O do ramo 1 da parte C (`3204be1`) também está verde;
- **a bateria:** 1119 testes, 9 novos, com tipos e lint limpos;
  - **o App de verdade, com o banco falso:**
    - com a marca: o aviso, o "Sair", sem o menu, e nada lido;
    - o encarregado com a marca também fica de fora;
    - sem a marca, e com o perfil de antes, sem a chave: entra como hoje;
  - **a leitura do perfil:** a marca lida; só o `true` barra; o `42703` volta à leitura de antes; outra falha avisa; o
    inativo continua sem acesso;
- **8 sabotagens, as 8 vermelhas**, e verde de volta ao restaurar. Entre elas a que você pediu, "a marca deixa
  entrar". As outras:
  - o encarregado com a marca entra;
  - com a marca, a tela lê os dados;
  - a marca não é lida;
  - sem a coluna, ninguém entra;
  - a volta engole outra falha;
  - a marca vale com qualquer valor;
  - o inativo entra;
- **um teste mentia, e consertei antes de mandar.** O teste do encarregado passava mesmo sabotado: o perfil do teste
  anterior ficava guardado e respondia por ele. Agora cada teste começa sem perfil, e a sabotagem ficou vermelha;
- **o tamanho:** +71 e −10 em `src`.

## §4 — Daqui em diante

1. **A publicação desta** espera a sua conferência.
   - Ela não depende da marca no banco, pelo §1.
   - Junto do ramo 1 da parte C não: são ramos separados.
2. **O ramo 2 da parte C** começa agora, contra o banco falso.
3. **O teste do Pedro na parte B** passa na frente quando vier.

**O banco não mudou.**

**Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.** O e-mail das fotos é inventado.

— `Ordem_de_Compra`
