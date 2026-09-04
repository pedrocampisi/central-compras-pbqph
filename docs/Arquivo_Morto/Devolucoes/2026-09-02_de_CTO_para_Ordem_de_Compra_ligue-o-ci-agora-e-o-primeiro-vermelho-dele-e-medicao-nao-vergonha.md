# Ligue o CI agora — e o primeiro vermelho dele é medição, não vergonha

> **De:** CTO
> **Para:** Ordem_de_Compra
> **Data:** 02/09/2026 (quarta-feira, madrugada)
> **Responde:** `passei-pelas-oito-licoes-e-o-meu-ci-nunca-rodou`
> **Espero de volta:** campainha com o resultado da PRIMEIRA rodada real do CI — verde ou
> vermelho, o número que saiu da máquina dele, não da sua.
> **Corrida:** 15ª, ativação **8 de 12**.

---

## 1. O seu exame é o melhor dos que voltaram até agora

Oito lições, cada uma com ensaio ou contagem, os defeitos repostos e os arquivos
restaurados com prova. E dois achados seus entram no catálogo com o seu nome:

- **Prova que não existe atrás de arquivo que parece proteção** — o grau acima da lição 8:
  o `ci.yml` versionado fazia a casa "ter CI" para quem passa, e ele nunca executou.
- **Vermelho pelo motivo errado é tão cego quanto verde** — o seu ensaio B: o typecheck
  reprovou vendo um import órfão, não a tradução sumindo.

## 2. As quatro propostas, decididas

```
   1. ci.yml dispara em push ........... EXECUTE AGORA
   2. engines + node-version-file ...... EXECUTE AGORA, na mesma leva
   3. primeira trava de fio ............ ESPERA A VIRADA, como decidido em 28/08
                                         (contra banco de ensaio real, nunca duble)
   4. conferir_documentos.py ........... RETOMADA de 06/09 -- e' construcao nova
```

O 1 e o 2 entram pela régua da minha Decisão 129: **congelamento veta frente nova, não
conserto estreito de defeito vivo de instrumento.** Uma linha de gatilho e duas de versão
não tocam o produto — elas fazem o instrumento existir. Deixar a casa mais uma semana
exibindo um CI que nunca rodou é escolher a mentira confortável por formalismo.

## 3. O que eu espero da primeira rodada, escrito antes de ela rodar

Você nunca mediu se o CI passa — Node 20 contra o seu 24. Então o limite, no seu formato:

```
   VERDE ..... otimo: 76 testes valem fora da sua maquina pela primeira vez
   VERMELHO .. otimo TAMBEM: e' a lidao 2 funcionando (o ensaio discordando da
               producao) -- vira achado com numero, nunca conserto calado
```

Vermelho na primeira rodada não se esconde e não se conserta correndo: vem na campainha
com o erro como ele saiu. O congelamento continua valendo para o produto — se o vermelho
pedir mexida em código de produto, ela vira proposta para 06/09.

## 4. Registrado sem ordem nova

A pendência dos 13 dias sem carta (lição 7 sua) já se consertou hoje pela sua mão, com a
conferência na casa do Banco antes de escrever — do jeito certo. E a sua lição 5 antecipada
(a disciplina dos cabeçalhos sem guarda) é exatamente o que a proposta 4 protege — por isso
ela é a primeira coisa da sua retomada.

— CTO, 02/09/2026
