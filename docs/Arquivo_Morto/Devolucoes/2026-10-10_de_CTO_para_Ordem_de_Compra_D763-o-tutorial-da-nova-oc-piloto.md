# D763 — O tutorial da Nova OC (piloto)

**De:** CTO
**Para:** Ordem_de_Compra
**Data:** 10/10/2026, 08h5x
**Decisão:** 763
**Fase:** 4 — fora do portão: pedido direto do Pedro (ensinar alguém a usar a tela de compras)
**Espero de volta:** o ramo pronto, com as fotos e o texto de cada passo, antes de publicar.

---

## §0 — De onde vem

O Pedro quer ensinar alguém a usar a OC, e o procedimento (PS.02) não serve para isso: ele é escrito para o auditor.
A ideia dele, num vídeo da tela Nova OC: **um botão "Tutorial" na tela; a pessoa clica, e ele vai mostrando o passo
a passo — "clica aqui, depois clica aqui".** Ele pediu a forma mais intuitiva, e disse "pode" à minha recomendação,
que vai abaixo.

## §1 — O que construir (o piloto é só a Nova OC)

1. **Um botão "Tutorial"** no alto da tela, sempre no mesmo lugar.
2. **Um tutorial por tarefa, curto:** "Fazer uma OC", de 4 a 7 passos.
3. **A pessoa faz de verdade:**
   - o balão acende o campo, por exemplo "Escolha o fornecedor";
   - o tutorial avança quando a pessoa age: escolheu o fornecedor, vai para a obra.
   - "Voltar", "Pular" e "Sair" sempre à vista.
4. **O tutorial nunca emite uma OC.**
   - O último passo acende o "Emitir OC + PDF" e explica o que ele faz: dá o número, gera o PDF e guarda na pasta
     da obra.
   - Quem aperta é a pessoa, quando quiser. O tutorial não clica em nada, e sair dele não grava nada.
5. **Opcional, nunca forçado.** A quem entra pela primeira vez, o sistema oferece uma vez: "Quer ver como
   funciona?". Recusou, não pergunta de novo.
6. **Os balões usam o texto do "?" que já existe** nos campos. Uma fonte só: se o texto do "?" mudar, o tutorial
   muda junto.
7. **Funciona na tela pequena (375)** e no escuro.

## §2 — A ferramenta

- **Pode:** driver.js ou React Joyride (as duas MIT), ou um componente seu, se ficar menor e mais simples.
- **Não pode:** Shepherd (desde a versão 14) e Intro.js. São AGPL, com licença comercial paga.
- Diga qual escolheu e quanto ela pesa no pacote.

## §3 — A prova antes de publicar

1. **As fotos de cada passo**, numeradas, a 1366 e a 375, claras e escuras.
2. **O texto de cada balão**, em lista, na carta.
3. **O tutorial inteiro de ponta a ponta no ensaio**, por programa, e a contagem de OCs antes e depois: igual.
4. **A oferta de uma vez só**: aparece na primeira entrada e não volta.
5. **O tamanho**, pela régua da D756 (linhas de código, sem testes e sem dados).

Eu confiro, e o Pedro testa com uma pessoa de verdade. Se funcionar, o mesmo jeito vai às outras telas
(Qualificação, Recebimentos e o app do mestre).

## §4 — O que fica igual

- O PS.02 continua o documento formal da auditoria. A Rev. 01 espera o "Gravar" do Pedro.
- A carta D757 (a frase do 502) continua no meu Enviados. Se ainda não fez, faça junto.

— CTO
