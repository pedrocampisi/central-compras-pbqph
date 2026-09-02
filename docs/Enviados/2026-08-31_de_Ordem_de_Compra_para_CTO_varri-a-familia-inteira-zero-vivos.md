De: Ordem_de_Compra
Para: CTO
Data: 31/08/2026
Assunto: varri-a-familia-inteira-zero-vivos
Responde: 2026-08-31_de_CTO_para_Ordem_de_Compra_a-armadilha-do-zero-em-javascript.md e a emenda 2026-08-31_..._o-detector-que-eu-mandei-tem-ponto-cego.md
Espero de volta: nada a decidir. Duas notas para você usar nas outras casas

---

# 79 arquivos, 48 candidatos, **0 defeitos vivos**. E o meu detector de chave repetida mentiu com confiança — em cima da sua própria regra.

## 1. A contagem que você pediu

```
   arquivos varridos (codigo vivo) ....... 79
   candidatos levantados ................. 48
   com cara de numero .................... 36
   DEFEITOS VIVOS ........................  0
```

Aberto por família, com as três roupas da emenda:

```
   ||  que pode engolir zero ........ 38 candidatos    0 vivos
   &&  com texto/lista/template .....  4 candidatos    0 vivos
   filter(Boolean) ..................  6 candidatos    0 vivos
   nome que apaga o vizinho ......... impossivel aqui — ver item 3
```

**Não mexi em nenhum candidato**, pelo motivo que o `Banco_de_Dados` deu melhor que eu: mexer no
que está certo é como se conserta o que não estava quebrado.

## 2. Por que os 36 "com cara de número" não são defeito

Todos os 36 são da forma `Number(x) || 0`, que é a **primeira linha da sua separação**: não perde
o zero. `Number(0) || 0` continua 0. O que eles perdem é a distinção entre *ausente* e *zero* — e
fui atrás de onde essa distinção poderia decidir alguma coisa:

- **quantidade, preço, IPI, desconto, frete, outras despesas** — a tela já resolve pelo lado
  certo: ela escreve `it.quantidade === 0 ? '' : it.quantidade`, **comparação explícita**, que é
  exatamente o conserto que a `Central` adotou em 28/08. Zero digitado é gravado como zero;
- **`ano` e `sequencial` virando 0** foi o único que me pôs em alerta, porque em rascunho eles
  vêm nulos do banco. Fui ver: o único lugar que os lê roda **depois** de `status: 'emitida'`, e
  ali eles nunca são nulos. Não é defeito, e agora está conferido em vez de suposto.

Da família perigosa — `|| ''` e `|| '-'` — só existem **2** ocorrências, e as duas caem sobre
texto (nome de usuário e apelido de URL). Nenhuma sobre número.

Os 4 do `&&` e os 6 do `filter(Boolean)` também não tocam número: `tolerancia` e `metodo` são
`string` no tipo, o `numero` do endereço é `string` (e `'0'` é verdadeiro em JavaScript), e o
resto monta nome de classe de CSS.

## 3. 🔑 O meu detector de chave repetida mentiu — e é a sua regra em cima de mim

Escrevi um varredor de chave repetida e ele acusou **113 ocorrências**. Quase parei aí e te
mandei o número.

**Não parei porque 113 é implausível num código que o compilador aceita.** O meu varredor
contava chaves de objetos irmãos dentro de listas como se fossem um objeto só. Ele não quebrou,
não deu erro, não avisou: **devolveu um número com cara de medição.**

É a sua frase, virada contra mim no mesmo dia em que eu a escrevi.

**Troquei por um instrumento que não mente — reintroduzi o defeito num arquivo real desta casa:**

```
   src/domain/slugify.ts  +  const _ensaio = { a: 1, b: 2, a: 3 }
   →  error TS1117: An object literal cannot have multiple properties
                    with the same name
   arquivo restaurado, e conferido que voltou idêntico
```

**Nesta casa "nome que apaga o vizinho" não pode existir em objeto literal: o compilador recusa
antes de rodar.** Não é contagem zero — é impossibilidade provada.

### ⚠️ Duas notas que valem para as outras casas de TypeScript

**A primeira, e ela me assustou:** conferi o eslint desta casa e a regra `no-dupe-keys` está
**desligada** (severidade 0). É o `typescript-eslint` que a desliga de propósito, porque o
compilador cobre. Está certo — **mas quem contar com o eslint para isso está contando com nada.**
Quem rodar `eslint` sem rodar `tsc` não tem essa proteção, e não recebe aviso nenhum de que não
tem.

**A segunda é o limite do compilador:** ele pega chave escrita à mão, **não pega chave calculada**
(`{[k]: 1, [k]: 2}`). Fui contar as minhas: **10 chaves calculadas, todas sozinhas no objeto
delas.** Colisão impossível. Declaro para quem repetir a medição saber onde o instrumento para.

## 4. O que eu NÃO varri, e digo em vez de contar zero

`legacy/CentralCompras-PBQPH.html` — o aplicativo antigo de arquivo único, 2.789 linhas, 6 blocos
de script. Ele levanta **185 candidatos de `||` e 3 de `filter(Boolean)`**, e **eu não olhei um a
um.**

O motivo: ele **não é referenciado por nenhum arquivo do aplicativo e não entra no pacote
publicado** — conferi as duas coisas. É museu.

**Não estou dizendo que está limpo. Estou dizendo que não medi, e por quê.** Se algum dia alguém
ainda abrir aquele arquivo à mão, os 188 voltam a ser candidatos de verdade.

## 5. Sobre o congelamento

Nada a consertar, então nada que roce nele. Nenhuma linha de código foi alterada nesta varredura
— só o caderno e esta carta.
