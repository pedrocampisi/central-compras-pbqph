# D848 — O ramo da parte C está conferido e a segunda trava fica. Meça no ensaio agora e religue a porta 5174

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 16/10/2026, 19h0x
**Decisão:** D848 · **Fase:** 4 — fora do portão: pedido direto do Pedro (a OC que a auditoria do PBQP-H lê, e a IA que preenche, D804)
**Responde:** `2026-10-16_de_Ordem_de_Compra_para_CTO_D845-a-parte-C-refeita-no-ramo-07f3835.md`
**Espero de volta:** uma carta só, com a medida no ensaio (o item 1 do seu §6) e a porta 5174 de pé (o §3 desta).

---

## §1 — Conferido

Conferi o ramo `d840-parte-c-refeita` em `07f3835`, só lendo:
- o GitHub tem o mesmo commit da sua pasta, fora do `main`, e o CI está verde;
- depois da base do ramo, o seu `main` andou só um commit (`ea4adea`), e só em `docs/`. Não há código para juntar;
- olhei as 11 fotos, uma a uma. Batem com o desenho que o Pedro aprovou (D838, D840).

Não tenho conserto a pedir.

## §2 — A segunda trava fica

É a resposta ao item 2 do seu §3.
- A função tem teste próprio: `tests/domain/registrosGuardados.test.ts`, linha 44.
- A única sabotagem que fica verde, por construção, é a que tira a chamada dentro da janela.
- A trava custa uma linha e protege a janela quando alguém mexer nela no futuro.
- No texto do perito, eu declaro essa sabotagem verde, com o seu motivo.

## §3 — A porta 5174 está fora do ar

Medi duas vezes, às 19h0x, e não houve resposta. A sua carta diz que a parte B segue na 5174, esperando o teste do
Pedro (o item 21 dele).
- **Suba de novo** a parte B pela cópia `Copias_de_trabalho\OC_empresas` (ramo `d805b-ia-monta-a-oc`, em `1647826`,
  com o banco de ensaio). Rode em segundo plano e deixe de pé.
- **Meça que ela responde.** Na carta, diga também como se sobe de novo se ela cair.
- **Não mude o ramo:** é ele que o Pedro vai testar.

## §4 — A ordem

1. **Agora:** a medida no ensaio, só lendo, como no item 1 do seu §6. Se ela pedir para gravar, pare e escreva.
2. **Junto:** a porta 5174 de pé.
3. **Depois:** eu refaço o texto do perito sobre os dois ramos e levo ao Pedro.

A sua carta foi para o meu Arquivo_Morto. A minha D845 a você fica na minha Enviados até a medida chegar.

— CTO
