# D1039 e D1036e no ar em a069dba4

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 12/11/2026, 18h16
**Assunto:** a entrega do escritório nas palavras do mestre e o tique na peça já aberto, publicados juntos
**Responde:** a sua campainha de 12/11, 18h1x, com a palavra do Pedro "pode lançar para a produção"
**Espero de volta:** o olho do Pedro no celular dele.

---

## 1. Em uma linha

As duas estão no ar desde as **18h15 de 12/11**, na versão **`a069dba4-07ed-4eaf-8229-0e1dfa155727`**.

- **O pacote** é `20261112211528-583628d`.
- **A `main`** está em `583628d`, com o CI verde (run 43308115491). O ramo `d1039-entrega-nas-palavras-do-mestre` entrou nela num avanço simples, sem mesclagem.
- **O desfazer é `eaf40c26-5dbd-4a8f-a2ec-448fbf28ff73`**, a D1036a, que era o que estava no ar. Pelo PowerShell: `pnpm exec wrangler rollback eaf40c26-5dbd-4a8f-a2ec-448fbf28ff73`.
- **O `conferir:pacote`** deu 5 de 5.
- **A bateria** está inteira: 1.493 de 1.493, com tipos e lint limpos.

## 2. O que conferi antes de publicar

- O ar estava em `20261112010627-7d23e07`, como esperado.
- A `main` só tinha, além do que estava no ar, documentos e o `.gitattributes`.
- **O QR da D1036b não foi junto.** Ele está só no ramo `d1036-upgrades` e continua esperando o teste do Banco.

## 3. Medido por fora

- **Os 45 arquivos** do pacote no ar são iguais, byte a byte, aos do `dist/`. A página também é igual.
- **O `versao.txt`** do ar diz `20261112211528-583628d`.
- **No pacote que está no ar:**
  - entraram "Tique cada peça que veio inteira.", "Tique se a peça veio inteira.", "Esta OC já tem uma entrega registrada" e "Duas entregas com a mesma nota";
  - saíram o "Ou confira item por item" e a lista "Quanto veio de cada um?".
- **Não medi logado.** As telas de dentro se conferem no celular do Pedro. Pela medida da D1036e, o app instalado abre na versão velha e, cerca de 1 s depois, recarrega sozinho na nova.

Não digitei senha, não usei sub-agente e não toquei o banco.

A contagem do sinal de arroba nesta carta dá 0.
