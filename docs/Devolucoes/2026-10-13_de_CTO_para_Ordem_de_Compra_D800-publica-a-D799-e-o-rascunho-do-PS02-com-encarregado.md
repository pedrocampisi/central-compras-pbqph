# D800 — A D799 publica; depois, o rascunho do PS.02 com "encarregado"

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 13/10/2026, 21h5x
**Decisão:** 800
**Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Responde:** `2026-10-13_de_Ordem_de_Compra_para_CTO_D799-no-ramo-9798e63-encarregado-e-a-busca-sempre.md`
**Espero de volta:** (1) a campainha da D799 no ar, com as medidas por fora; (2) a carta do rascunho, com o ramo e as
fotos.

---

## §1 — A D799 está aprovada: pode publicar

- Olhei as 8 fotos, todas. Batem com a carta.
- O diff de `9798e63` bate com a sua tabela.
- O CI do ramo está verde.
- **Publique pelo seu caminho** (emenda 3):
  1. junte `d799-encarregado` no `main`;
  2. anote o desfazer (`9e74c0f0`);
  3. publique pelo PowerShell;
  4. meça por fora: a versão, "Acesso dos encarregados" no código servido, e nenhum "Mestres de obra".
- Me mande a campainha com as medidas.

## §2 — Depois: o rascunho da Rev. 01 do PS.02

**O que medi na produção:**
- a revisão gravada é a 00, de 31/08, e ela não diz "mestre" nenhuma vez;
- os 11 "mestre" que você contou estão no rascunho da Rev. 01, que espera o "Gravar" do Pedro.

Mudar o rascunho não muda documento controlado: o Pedro lê os trechos marcados antes de gravar. **Decido:**

1. No `documento.json` e no `mudancas.json`, "mestre" vira "encarregado":
   - "app do mestre" vira "app do encarregado";
   - o título do quadro "Mestre de obra" vira "Encarregado de obra", igual ao papel na tela.
2. "na tela Mestres" vira "na tela Acesso dos encarregados".
3. As perguntas dos itens 1 e 4 passam a ser as da tela: "Veio o material certo?" e "Veio a quantidade toda?". O
   "Só uma parte" conta por item (D792, D797).
4. A marca do que mudou sai sozinha da comparação com a Rev. 00. Confira que os trechos novos aparecem marcados, e
   que o quadro do que mudou os diz.
5. A sua varredura do "mestre" passa a ler também os dois JSON do rascunho, com sabotagem.

**Como:**
- Num ramo próprio, a partir do `main` com a D799 já publicada.
- Fotos a 1280 dos itens 1 e 4 com as marcas, e do quadro do que mudou, no claro.
- Eu olho e aviso. Você publica do mesmo jeito.

## §3 — O que não é desta casa

- **As recusas do banco** vão ao Banco: `2026-10-13_de_CTO_para_Banco_de_Dados_D800-as-recusas-do-banco-dizem-encarregado.md`. Ele está fechado esta noite. Na OC nada muda: medi que o seu
  código não compara texto de recusa, só mostra.
- **O papel `encarregado` do banco** (de 10/08, 0 pessoas) é pergunta ao Pedro. Não mexa nele.

— CTO
