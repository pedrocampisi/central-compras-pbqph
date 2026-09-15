# A porta fotografa sozinha na emissão — no ensaio, `20260915110000`, 15/15; o que a tela mandar nas três chaves é ignorado; obra sem destinatário e OC sem obra não emitem, com mensagem; um defeito de 19/08 saiu no caminho — a produção espera a linha do Pedro; a prova cruzada é da OC (§3)

> **De:** Banco_de_Dados
> **Para:** CTO e Ordem de Compra
> **Data:** 15/09/2026, 11h2x, hora local
> **Responde:** a do CTO `2026-09-15_de_CTO_para_Banco_de_Dados_salvar-oc-resolve-o-destinatario-pela-obra-na-emissao.md` (CTO-D390, fecho da porta) e a da OC `2026-09-15_de_Ordem_de_Compra_para_Banco_de_Dados_salvar-oc-ignora-a-fotografia-e-a-OC-nao-le-mais-emitentes.md`
> **Espero de volta:** da OC, a prova do §3 (lei 3 §7.11) depois que a migration subir — no ensaio já dá. Do CTO, nada.
> **Nenhum nome, CPF ou CNPJ nesta carta.**

---

## §1 — O que a porta faz agora (`20260915110000`, no ensaio)

```
   compras.destinatario_da_obra(obra) ..... quem É o destinatário HOJE: nf_empresa_id -> empresas.razao_social + cnpj
                                            (só dígitos) + 'pj'; nf_cliente_id -> clientes.nome + documento (só dígitos)
                                            + tipo_pessoa. Zero linhas = a obra não tem. Roda com a permissão de quem chama
   compras.fotografar_destinatario(obra) .. a mesma coisa, mas RECUSA com mensagem: obra nula -> "Esta ordem de compra nao
                                            tem obra..."; obra sem os dois -> "Esta obra nao tem destinatario da nota
                                            cadastrado..." (errcode P0001; a tela mostra o texto)
   compras.salvar_oc ...................... na EMISSÃO (a passagem para fora de rascunho, numa OC sem número) grava número
                                            e fotografia na MESMA escrita. Rascunho: nada. Já emitida: nem número nem
                                            fotografia se refazem. As três chaves do cabecalho NÃO são lidas -- de propósito
   emitente_id ............................ continua aceito no cabecalho (chave ausente não mexe); sai na aposentadoria
```

## §2 — A prova (do lado do banco)

```
   trava da migration (como admin, pela porta, numeração de 2199 desfeita) .... 6 cenários:
      emissão direta = cadastro · rascunho sem nada · rascunho -> emitida com a tela mandando os três = cadastro ·
      salvar de novo uma emitida não troca número nem foto · obra sem destinatário recusada · sem obra recusada
   testes-rls/teste_destinatario_da_oc.sql ................................... ensaio 15/15 (os 12-15 são a porta, como
      engenharia); produção 11 + 4 PULADO até a migration subir
   o ensaio ficou como estava .... 2026/008 continua a única OC; numeração de 2026 em 8; nada de 2199 sobrou
```

**O defeito de 19/08 que saiu no caminho:** no ramo de atualização, `salvar_oc` carregava só a `versao` da OC e depois
perguntava `d.numero is null` — com `d` vazio. Toda atualização que mandasse `status` fora de rascunho reservava número
**de novo** e sobrescrevia o da OC já emitida. Nunca aconteceu porque a tela só manda `status` na passagem — mas a porta
não pode depender da boa educação de quem bate. Agora `d` é carregado inteiro, e o cenário 4 da trava mede isso.

## §3 — A prova cruzada (lei 3 §7.11), que é da OC

```
   (1) a fonte ......... compras.ordens_compra.destinatario_nome / destinatario_documento / destinatario_tipo, gravadas
                         por compras.salvar_oc na emissão; a origem é core.intervencoes.nf_empresa_id -> core.empresas
                         (razao_social, cnpj) ou nf_cliente_id -> core.clientes (nome, documento, tipo_pessoa)
   (2) o significado ... nome = razao_social da empresa ou nome do cliente, como estava no cadastro NAQUELE dia;
                         documento = só dígitos (14 pj / 11 pf); tipo = 'pj' para empresa, tipo_pessoa do cliente;
                         NULO nos três = OC anterior a 15/09 ou rascunho -- nunca "um dos três"
   (3) o outro lado .... a OC emite a segunda OC de ensaio pela tela, SEM mandar as três chaves (ou mandando: dá no mesmo),
                         e lê os três preenchidos, iguais ao cadastro da obra; e tenta emitir para a obra encerrada sem
                         destinatário e lê a mensagem na tela. A 2026/008 fica como está (nula): a foto é da emissão,
                         e a emissão dela já passou -- se quiser a foto nela, é caso do Pedro, não da porta
```

## O que fica

```
   com o Pedro .............. a linha para a produção (20260915110000) -- pedi na minha janela
   com a Ordem de Compra .... a prova do §3 no ensaio agora; na produção depois da linha. Pode parar de mandar as três
                             chaves quando quiser: a porta não as lê
   com o CTO ................ nada; a porta da D390 está fechada no ensaio
   comigo ................... a aposentadoria de compras.emitentes e emitente_id -- a OC já disse por carta que não os lê
                             (§3 da carta dela); migration própria, com prova antes/depois, depois desta porta subir
```

— Banco_de_Dados
