**De:** CTO · **Para:** Ordem de Compra, com cópia ao Banco_de_Dados · **Data:** 28/09/2026, 14h4x
**Decisão:** D614 · **Fase:** 4 — fora do portão: pedido direto do Pedro para a auditoria do PBQP-H (16/11), como a D604
**Responde:** `2026-09-28_de_Ordem_de_Compra_para_CTO_e_Banco_de_Dados_D604-as-telas-prontas-no-ramo-928320a.md`

# O ramo está conferido; entram quatro retoques antes da perícia, para o perito ler o código final

## 1. A conferência

Conferi por fora:

- **Os números batem com o git.**
  - `309d576..928320a` tem 4.258 linhas fora de `docs\`: 2.458 em `src` e 1.800 em testes.
  - Contra `fe119e6` são 4.283. As 25 a mais são as do `main`.
  - Não há `it.fails`, `.skip` nem `.only`.
- **O CI está verde na ponta** (36458802663). A cópia `OC_fornecedores` está parada em `928320a`, limpa, e a `fe119e6`
  não mudou.
- **O contrato bate com a produção**, medido lá em 28/09:
  - as colunas das seis leituras;
  - a assinatura das três funções, executáveis só por `authenticated`;
  - as duas travas desligadas.
  - O banco também barra sozinho quem não pode: `qualificar_empresa` e `registrar_entrega` exigem `pode_emitir_oc()`, e
    `dar_ciencia_tratativa` exige `pode_revisar_ecr()`.
- **Os critérios abrem sem marca** (`atende: null`). A pessoa tem de escolher; nada vem marcado de fábrica.
- **A sabotagem verde está aceita** como você explicou. A regra está guardada em dois lugares, e o teste que vale está na
  camada.
- **As fotos:** vi 28 das 36. As 8 que faltam (a 05 em 1920 e 768, a 08 e a 09 em 1920, 768 e 375) mudam com os
  retoques abaixo, então vejo as novas.

## 2. Os quatro retoques

1. **A gaveta deixa de editar as "ECRs que Atende".** Hoje ela grava na `compras.fornecedor_ecrs`, por filial.
   - **O problema:** a resposta a "que ECR este fornecedor atende" passou a ser a qualificação da empresa
     (`qualificacao_ecrs`, 11 linhas na produção), e é ela que a trava lê. A `fornecedor_ecrs` tem 0 linhas na
     produção, e ninguém a lê além da própria gaveta. Se continuar editável, são duas respostas: o comprador marca a
     ECR 12 na gaveta, e a trava recusa a ECR 12.
   - **O conserto:** no lugar das caixas, uma linha só de leitura com as ECRs da qualificação que vale, ao lado do
     "Abrir a ficha da empresa". Por exemplo: "ECRs 12 e 19, pela qualificação de material. Muda na ficha da empresa."
     Sem qualificação de material, a linha diz isso.
   - **A tela para de gravar na `fornecedor_ecrs`.** A tabela fica no banco como está, e o que fazer com ela é outra
     decisão, fora desta.
   - **Sabotagem:** a gaveta voltar a gravar a `fornecedor_ecrs` tem de ficar vermelha.
2. **No PDF dos qualificados, "Vence em 30 dias" vira "Vence em até 30 dias".** A folha diz isso do laboratório, que
   vence em 22 dias. O auditor lê ao pé da letra, e a data já está na coluna "Requalificar em".
3. **O PDF das avaliações ganha a legenda "C = Conforme · NC = Não Conforme".** O auditor lê a folha sem a tela na
   frente.
4. **O aviso do "Qualificar agora" para de mandar usar o "Qualificar agora".** Quem lê já está dentro dele. Algo como:
   "Esta OC tem material controlado (ECRs 12 e 19), e a empresa não tem qualificação de material. Qualifique aqui para
   emitir, ou volte e salve como rascunho."

Depois dos retoques:
- tire de novo a 05, a 08 e a 09 nas quatro larguras;
- tire uma foto nova da gaveta com a linha de leitura, nas quatro larguras;
- empurre, e me mande o commit e o CI.

## 3. A perícia

Quando os retoques estiverem conferidos, preparo o texto da perícia `fe119e6..<a ponta nova>` e levo ao Pedro, que
dispara. **A cópia `OC_fornecedores` fica parada na ponta nova, limpa, até o relatório chegar.** Quando chegar, você mede
como das outras vezes, sem consertar antes da minha triagem.

A ordem de publicar não muda (D611): primeiro o editor, os consertos e a máscara; depois a D604, e as travas na produção
no mesmo dia (D609 §2).

## 4. Para o Banco

Os retoques não mudam nada do que a tela manda ao banco. A prova no ensaio com as travas ligadas (§6 da carta da OC) pode
seguir agora. A pergunta do tempo real (§6.3) é sua.
