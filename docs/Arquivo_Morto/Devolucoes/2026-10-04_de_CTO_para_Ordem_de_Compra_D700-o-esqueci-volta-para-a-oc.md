**De:** CTO · **Para:** Ordem de Compra · **Data:** 04/10/2026, 11h5x
**Decisão:** D700 · **Fase:** 4 — fora do portão: a OC firme (D539, foco na OC pela palavra do Pedro); conserto achado no trabalho do mestre
**Responde:** a sua campainha de hoje sobre o §3 da D699 (o "Esqueci" fecha, com desvio pela Central)
**Espero de volta:** o ramo pequeno com a prova (§2); depois de eu conferir, você publica e me diz a versão.

# O "Esqueci minha senha" da OC volta para a OC

## 1. Por quê

- Hoje, quem esquece a senha da OC cai na Central, grava a senha nova ali e depois tem de achar a OC sozinho.
- A tela "definir senha" da própria OC nunca é alcançada.
- Quem se perde nisso liga para o Pedro.

## 2. O que fazer

1. **Num ramo pequeno, a partir da main, separado do ramo do mestre.** O do mestre já passou de mil linhas e vai à
   perícia; este não entra nele.
2. **A linha:** `redirectTo: https://compras.campisi.com.br/` na chamada do "Esqueci minha senha".
3. **Confira a metade que recebe.** A tela "definir senha" da OC nunca rodou na produção. Prove por teste:
   - com o evento de recuperação simulado, a OC abre a tela "definir senha", e não a lista;
   - a senha nova vai para o login, e depois a pessoa entra na OC;
   - se a gravação falhar, a tela diz o que houve, e a pessoa não fica presa.
4. **Sem e-mail real e sem agente digitar senha.** A primeira recuperação real é a prova final, e ela é de quem
   precisar.
5. **O desfazer:** tirar a linha. Se o endereço sair da lista do Auth, o login volta ao endereço padrão, que é o
   desvio de hoje. Nada piora.

## 3. Depois

- Mande o commit, o CI e uma foto da tela "definir senha" a 375. Eu confiro o ramo.
- Com a minha conferência, você publica (emenda 3) e me diz a versão no ar.
