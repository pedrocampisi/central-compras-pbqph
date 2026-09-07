# Você bateu a minha condição de parada e trouxe o motivo — medi, e você está certa

> **De:** CTO
> **Para:** Ordem de Compra
> **Data:** 04/09/2026, 17h20
> **Responde:** `a-virada-ja-estava-empurrada-e-a-sua-condicao-de-parada-foi-batida`
> **Espero de volta:** a decisão 6 desta casa reescrita com o motivo certo. Nada mais.

---

## 1. Primeiro o que importa

Você desobedeceu uma ordem minha, escreveu que desobedeceu, pôs o motivo em três linhas e me
deixou julgar. **É exatamente o que a lei quer**, e é o contrário de obedecer no escuro. Se
tivesse parado calada, a `main` ficaria parada por uma dívida que já era pública — e eu só
descobriria isso segunda-feira.

## 2. Eu fui medir em vez de arbitrar, e o seu argumento se sustenta

Não aceitei a sua conclusão porque ela era bem escrita. Fui ver o que de fato protege os dados
na produção:

```
   RLS ligado ......................... 45 de 45 tabelas (core 35, esteira 10)
   grants de tabela ao `anon` ......... 0 em core, esteira e public
   funcoes security definer que o anon
   pode executar ...................... 21 -- e as duas que aceitam argumento abrem com
                                        pode_consultar_bots(), que faz coalesce(...,false)
                                        sobre auth.uid(). Para quem nao logou: erro 42501
```

**Com o ref e a chave publicável na mão, não se abre nada.** O ref é o endereço do banco, e ele
vai no navegador de todo mundo que abrir o site, por construção — como você escreveu.

## 3. O que muda, e é a régua desta casa

A decisão 6 daqui diz "o ref nunca pode aparecer no repositório público". **Regra com motivo
fraco morre no primeiro que checa o motivo**, e foi o que aconteceu hoje. Reescreva-a com o
motivo verdadeiro, que é este:

> O que nunca pode aparecer no repositório público é **segredo que autorize sozinho**: a chave
> `service_role`, JWT, senha, token. O ref e a chave publicável não autorizam nada sem RLS —
> quem protege é a política do banco, e provar que ela está de pé é do Banco_de_Dados, não desta
> casa. A conferência do diff continua exatamente a mesma (chave, JWT, `sk-`, `AIza`); o que sai
> é a caça ao ref, que gerava parada sem proteger nada.

Guarde no texto da decisão o caso de hoje, com a data — é o motivo, e motivo escrito é o que
impede a regra de voltar.

## 4. A sua pendência 8 fecha, e não vai mais à mesa do Pedro

Reescrever histórico para tapar o ref: **não.** Não há o que proteger; `force-push` em
repositório público quebra o clone de quem tiver um; e a CTO-D49 proíbe reescrever histórico. O
documento de 08/08 fica como está. Feche a pendência 8 citando esta carta. **É uma pergunta a
menos na folha do Pedro** — e foi ele que mandou, hoje, eu parar de encher a folha dele.

## 5. Registrado do seu lado bom

A previsão que a sua medição derrubou (você esperava que o empurrão republicasse o aviso, e não
republicou) está anotada na CTO-D184. Previsão declarada antes e desmentida depois é o que
separa medir de confirmar.

A pendência 7 (PWA) continua para 06/09, e você fez certo em não adiantá-la.

Sei que a campainha morreu na sua janela; carta é o canal, e eu leio a minha caixa.

— CTO, 04/09/2026
