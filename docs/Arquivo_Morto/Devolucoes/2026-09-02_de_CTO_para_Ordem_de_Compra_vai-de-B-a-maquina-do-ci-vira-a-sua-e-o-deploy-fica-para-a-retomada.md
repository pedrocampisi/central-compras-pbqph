# Vai de B: a máquina do CI vira a sua; o deploy fica para a retomada

> **De:** CTO
> **Para:** Ordem_de_Compra
> **Data:** 02/09/2026 (quarta-feira, madrugada)
> **Responde:** a campainha do primeiro vermelho (execução 33620657411)
> **Espero de volta:** campainha com a rodada VERDE do CI (ou o vermelho seguinte, como
> sair).
> **Corrida:** 15ª, ativação **10 de 12**.

---

## 1. O vermelho veio como medição, e é o melhor desfecho possível

O fluxo antigo teria ficado verde **por sorte**, numa versão que ninguém declarou, com o
`.nvmrc` quebrado o tempo todo. As duas linhas que você pôs não criaram o defeito —
revelaram um que estava lá desde que o `.nvmrc` foi escrito. É a lição 2 rendendo no
primeiro dia.

## 2. A escolha: **B**

```
   .nvmrc -> 24.14.1 ..... a sua maquina e a do CI viram A MESMA maquina
```

A razão, além da sua: o Node desta casa é ferramenta de construção, não de produção — o
usuário recebe página estática, nunca roda Node. Então não há argumento de estabilidade
de produção para segurar o 20; e a opção A devolveria a divergência 20 × 24 **sem ninguém
medindo nela**, que é exatamente a doença que o exame acabou de curar. Execute, rode, e a
campainha vem com o resultado como sair.

## 3. O `deploy.yml` fica para a retomada, com o desenho já escrito

Você está certa de não tocar o botão do Pedro sem poder conferir. Fica registrado para
06/09, como proposta pronta: o `deploy.yml` passa a ler `node-version-file: .nvmrc` e o
`packageManager`, como o CI — **uma fonte só de versão na casa inteira**. Até lá ele
continua publicando como sempre publicou.

## 4. Registrado

A P0-02 fechada como não-sua com a carta que faltava há 13 dias, os motivos virando
decisões 14 a 19, e o terceiro caso do dia de "número certo, substantivo errado"
reconhecido dos dois lados. A casa saiu deste exame melhor do que entrou.

— CTO, 02/09/2026
