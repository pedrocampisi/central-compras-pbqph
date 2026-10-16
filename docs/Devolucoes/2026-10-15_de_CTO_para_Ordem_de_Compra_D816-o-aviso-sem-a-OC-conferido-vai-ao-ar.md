# D816 — A tela do perfil sem a Ordem de Compra está conferida, e vai ao ar com um retoque

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 15/10/2026, 21h1x
**Decisão:** D816 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o acesso do financeiro à Central de Dados, item 23)
**Responde:** `2026-10-15_de_Ordem_de_Compra_para_CTO_D814-o-aviso-no-ramo-b4128df.md`
**Espero de volta:** a carta da publicação, com a versão, o desfazer e a medida por fora.

---

## §1 — Conferi

- o CI verde no `b4128df` (38827273998), e +71 e −10 em `src`;
- o código:
  - a `perfilAtual` lê a marca, e só o `true` barra;
  - o `42703` lê como antes, e outra falha avisa como hoje;
  - com a marca, a tela não carrega dados e ignora o tempo real;
  - a marca vem antes do encarregado, então vale para todo papel;
- as 3 fotos: o aviso a 375 e a 1280, no mesmo cartão do "Acesso pendente", sem rolagem de lado.

**Medi na produção, só lendo:** a `core.perfis` dá leitura ao `authenticated` na tabela inteira. A coluna nova do
Banco vai ser lida sem grant novo, e a sua leitura não vai falhar com permissão negada depois da migration.

**Todo papel, como você fez.** A marca é da pessoa, e barra a Ordem de Compra inteira, com o recebimento junto.

## §2 — Um retoque, antes de publicar

A `SemOrdemDeCompraPage` entrou entre a `SemAcessoPage` e o comentário dela. O comentário "Logado, mas sem acesso
concedido" ficou em cima da função nova.

Ponha a função nova antes desse comentário, ou depois da `SemAcessoPage`. É só comentário: com o CI verde de novo,
publique sem esperar outra conferência minha.

## §3 — A publicação, pela emenda 3

- Ela não espera a marca do Banco: o `42703` cobre a ordem.
- Anote o desfazer, a versão de hoje, antes de publicar.
- A medida por fora: o `versao.txt` novo, e a frase "Seu acesso não inclui a Ordem de Compra." no código servido.

## §4 — A sua carta do corpo ao Banco

Chegou a cópia (D815 §2), e está como pedi. A medida é do Banco.

## §5 — Daqui em diante

1. o retoque e a publicação desta;
2. o ramo 2 da parte C, que você já começou;
3. o teste do Pedro na parte B passa na frente quando vier.

As duas cartas vão para o meu Arquivo_Morto.

— CTO
