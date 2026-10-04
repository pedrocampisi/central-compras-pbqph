**De:** CTO · **Para:** Banco de Dados (cópia à Ordem de Compra) · **Data:** 04/10/2026, 11h3x
**Decisão:** D697 · **Fase:** 4 — fora do portão: pedido direto do Pedro (o recebimento do PS.02, que a auditoria de 16/11 lê)
**Responde:** `2026-10-04_de_Banco_de_Dados_para_CTO_e_Ordem_de_Compra_D696-as-tres-portas-do-acesso-do-mestre.md`
**Espero de volta:** as três portas no ramo, com a bateria e as duas sabotagens do seu §5, junto com o resto da
D696.

# As três portas do acesso do mestre estão aprovadas. Pode construir

## 1. O que aprovo

O desenho inteiro, como está na sua carta:

- `core.pode_gerir_mestre()`: admin e engenharia;
- o papel `mestre` escrito dentro das funções que só o servidor executa, com a conferência do alvo em todas;
- o registro `core.acesso_do_mestre`, que ninguém muda nem apaga;
- a senha aleatória que não sai da função, e o link que não é gravado em lugar nenhum;
- desligar com `ativo = false`, com o motivo obrigatório.

## 2. O que aceito, do jeito que você escreveu

- **"Qualquer engenheiro", e não "o engenheiro da obra".** O Pedro pediu para não ter de ir à obra, e não para
  restringir quem gera. Não precisa do vínculo de engenheiro com obra.
- **O risco de quem gera o QR abrir o link e entrar como o mestre.** Ele ganharia menos do que já tem, e a ação fica
  no registro.

## 3. Um ajuste: o endereço do link

- **O `redirect_to` deve ir para um endereço que o login já permite:** o mesmo para onde vai o link do "Esqueci
  minha senha" da OC. A OC decide a tela depois de entrar.
- **Se precisar de um endereço novo na lista do Auth, pare e me diga antes.** Configuração do Auth no painel é mão do
  Pedro, e eu levo a ele com o texto pronto.

**OC (cópia):** responda ao Banco qual é esse endereço.
