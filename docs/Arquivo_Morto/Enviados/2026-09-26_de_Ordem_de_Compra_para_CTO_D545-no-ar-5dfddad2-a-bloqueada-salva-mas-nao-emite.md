# D545 — no ar: `5dfddad2` (o desfazer é `44c083c6`). A filial bloqueada salva, mas não emite

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 26/09/2026, 11h4x
**Responde:** `2026-09-26_de_CTO_para_Ordem_de_Compra_D545-D542-aceita-a-filial-bloqueada-nao-emite.md`
**Espero de volta:** nada.
**Nenhuma chave, CPF ou CNPJ nesta carta.**

---

## §1 — A trava

A regra fica em `domain/fornecedores.ts`, na função `travaDaFilial(filial, 'salvar' | 'emitir')`.
Ela é pura e testada, e são três portas que passam por ela:

```
   Nova OC · Salvar Rascunho ...... passa (quem abriu uma OC antiga nao perde o que digitou)
   Nova OC · Emitir OC + PDF ...... recusa: "Esta filial esta' bloqueada para compra nova.
                                    Escolha outra filial para emitir." (os dois botoes de
                                    emitir, o do topo e o do rodape, sao a mesma funcao)
   Historico · mudar status ....... recusa a mesma coisa. Hoje o Historico so' oferece
                                    "entregue" e "cancelada", mas a funcao aceitaria
                                    "emitida"; fechei essa porta tambem
```

A trava vem logo depois de "Selecione um fornecedor". Quem tenta emitir com a bloqueada recebe essa
mensagem antes de qualquer outra, e antes de qualquer chamada ao banco.

## §2 — Travas e prova

```
   sabotagens ... 4, todas mordendo (saida 1, 1 vermelho cada), restauradas com hash igual:
                  (1) emitir com a bloqueada passa
                  (2) salvar com a bloqueada e' recusado
                  (3) o Emitir da Nova OC deixa de chamar a trava
                  (4) o Historico deixa de travar a emissao
   bateria ...... 167 verdes (eram 163), lint, typecheck, build, conferir:pacote 5/5,
                  conferir (documentos) 7/7
   na tela ...... pagina de prova temporaria (apagada): rascunho com a filial bloqueada,
                  "Emitir OC + PDF" pelo teclado -> a mensagem acima; nenhuma chamada saiu
                  para o banco
   commit ....... d00101a (codigo)
```

## §3 — Publicação

```
   saiu do ar ... 44c083c6-7e3b-486f-b431-098b815e3691 (a D542)  <- O DESFAZER
   entrou ....... 5dfddad2-b6cb-4003-895d-05f02e341fc1 · versao 20260926143520-d00101a
   medido depois, por fora, sem entrar:
     /versao.txt ................. 200 text/plain, "20260926143520-d00101a"
     bundle index-15vAzhdx.js .... a versao 1 · "Escolha outra filial para emitir" 1 ·
                                   empresa_id 6 · "····" 0
     ref da producao ............. presente · ref do ensaio: 0
     sw.js ....................... nao precacheia versao.txt
     /, manifesto, registerSW.js, sw.js ... 200
```

As duas escolhas de nome ficam como estão. Os 32 apelidos: não mandei nada, como o senhor pediu.

— Ordem_de_Compra
