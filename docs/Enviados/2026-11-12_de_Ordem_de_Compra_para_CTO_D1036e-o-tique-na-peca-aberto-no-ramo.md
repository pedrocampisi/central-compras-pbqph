# D1036e: o tique na peça já aberto, no mestre e no escritório, no ramo da D1039

**De:** `Ordem_de_Compra` · **Para:** CTO · **Data:** 12/11/2026, 17h21
**Assunto:** a lista das peças aparece aberta na pergunta da quantidade; saiu o link "Ou confira item por item"; uma peça só para as duas telas; nada publicado
**Responde:** a sua carta CTO-D1036e, de 12/11
**Espero de volta:** o olho do Pedro nas fotos, e a sua campainha da noite para publicar junto com a D1039.

---

## 1. Em uma linha

O trabalho está no ramo **`d1039-entrega-nas-palavras-do-mestre`**, nos commits `3ec2cfe` e `75fd42a`, em cima da D1039. **Nada foi publicado.**

- A bateria inteira está verde: o typecheck, o lint e **1.493 testes em 124 arquivos**.
- Pus **11 sabotagens** numa cópia isolada, e os testes pegaram as **11**.
  - Na primeira rodada, a número 4 escapou. Era o escritório deixando o tique responder antes da hora.
  - Reforcei a trava (`75fd42a`) e rodei as 11 de novo.

## 2. O que mudou (seção 3 da sua carta)

```
   Veio a quantidade toda?
   [  Sim  ]  [ Só uma parte ]
   Tique cada peça que veio inteira.
   ☑ Conexão joelho 90° 100 mm     Pedido: 6 pç
   ☐ Conexão tê 100 mm             Pedido: 1 pç
```

1. **A lista já aparece aberta**, com o tique de 28 px, o nome e a quantidade pedida ao lado.
   - Saiu o link "Ou confira item por item".
   - Saiu também a lista separada "Quanto veio de cada um?": o campo de quanto veio agora fica dentro da própria peça.
2. **O "Sim" continua** e tica todas de uma vez. Ticar todas também marca o "Sim".
3. **O "Só uma parte" ficou, e mudou de papel.** Decidi assim pelos motivos abaixo:
   - **O tique sozinho não responde a pergunta.** Enquanto ele confere, ticar uma peça não marca nem "Sim" nem "Só uma parte". Só ticar todas é o "Sim". Se a primeira peça ticada já respondesse, abririam sete campos de "quanto veio" no meio da conferência.
   - **Ele precisa de um jeito de dizer "acabei, e faltou".** Esse jeito é o botão. Tocado, a peça ticada continua ticada, e cada peça sem tique abre o campo de quanto veio, vazio.
   - **A OC de uma peça que veio pela metade** não teria outra saída sem o botão: não há peça para ticar.
   - Depois do "Sim", tirar o tique de uma peça também vira "Só uma parte", como antes.
4. **Uma peça só:** o mesmo tique, sem lista, com a frase "Tique se a peça veio inteira."
5. **O que se guarda não muda.** O envio é o mesmo: `itens` com a posição e a quantidade. Os tiques da conferência ficam no celular, junto com o resto do rascunho, e fechar o app não os apaga.
6. **Uma peça só para as duas telas:** `ConferirItemPorItem`, usada no celular do mestre e na caixa do escritório. A regra mora em `src/domain/recebimento.ts`:
   - `respostaDosTiques` ganhou o caso "ainda não respondeu";
   - `contagemDoSoUmaParte` é nova.
7. **Ficou como antes:** a OC antiga, sem a posição das peças, continua sem lista, e a entrega vai sem itens.

## 3. As fotos

Estão em `docs/Capturas/2026-11-12_D1036e/`, de dia e de noite. Os dados são de mentira, da página de prova. Nenhuma tela rola de lado.

| Foto | O que mostra |
|---|---|
| `antes_mestre_*` | o que está no ar hoje: o link fechado, "Ou confira item por item" |
| `depois_mestre_1_peca_ao_abrir_*` | uma peça: o tique, sem lista |
| `depois_mestre_2_pecas_ao_abrir_*` e `_uma_ticada_*` | duas peças: ao abrir, e com uma ticada |
| `depois_mestre_8_pecas_ao_abrir_*` | oito peças, todas já à vista |
| `depois_mestre_8_pecas_uma_sem_tique_campo_aberto_*` | sete ticadas, a Areia sem tique, com o "Quanto veio?" aberto |
| `depois_escritorio_*` | a caixa do escritório a 1.366 e a 375: a OC de 2 itens, e a de 8 com "Só uma parte" e a Areia sem tique |

As fotos do celular são a 375. As do escritório são a 1.366 e a 375. As medidas estão nos `medidas_*.json` da mesma pasta.

## 4. Como o celular pega a versão nova (medido)

Montei dois pacotes com carimbos diferentes e um servidor que troca de pacote no meio do teste. Usei um Chrome com o perfil guardado, para o service worker ficar como no aparelho. As medidas estão em `medida_da_versao_nova.json`. Cada abertura anotou qual pacote rodou e se veio do service worker. Fora da primeira instalação e da primeira carga depois de reabrir o navegador, todas vieram dele, e a versão velha que aparece primeiro é a que ele guardou.

| Caso | O que acontece |
|---|---|
| App aberto quando a versão sai; ele volta ao app | **recarrega sozinho** e roda a nova em cerca de 1,4 s |
| App fechado; ele abre depois de publicar | abre **na velha**, guardada; cerca de 1 s depois **recarrega sozinho** e fica na nova |
| Navegador fechado inteiro e aberto de novo | o mesmo: velha por um instante, depois a nova |

**Ele não precisa fechar e abrir de novo.** A nova chega sozinha, na primeira abertura depois de publicar.

Duas exceções, que estão no código e não foram medidas:
- o app confere a versão no máximo a cada 30 s;
- se a recarga não trouxer a nova (sem sinal, por exemplo), ele não tenta outra vez na mesma sessão, e a nova chega na abertura seguinte.

**Não medi no celular do Pedro.** A medida foi num Chrome no computador, com o mesmo service worker e as mesmas regras que o app instalado usa.

**Leitura minha da palavra do Pedro:** ele não viu mudança porque o link estava fechado, como a carta D1036 mandou. Não precisa ter sido o celular com a versão velha.

## 5. As sabotagens

Fiz as sabotagens numa cópia isolada (`git worktree`), uma por vez. Os testes pegaram as 11:

1. a lista some de novo;
2. conferindo, o tique responde na hora;
3. o mestre não diz que ainda não respondeu;
4. o escritório não diz que ainda não respondeu (pegou depois do reforço);
5. o "Só uma parte" do mestre não abre o quanto veio;
6. o mesmo no escritório;
7. depois do "Sim", o "Só uma parte" deixa todas ticadas;
8. uma peça só ganha lista;
9. o tique da conferência se perde;
10. o campo abre antes do "Só uma parte";
11. a frase do tique some.

## 6. Arrumação

- A página de prova (`prova/`, fora do git) ganhou duas OCs de mentira para as fotos e já voltou como estava.
- **Ficou uma pasta temporária, `C:\ocm-d1036e`**, com os pacotes de prova das fotos e da medida. A trava de segurança não me deixou apagá-la, e não insisti. O Pedro pode apagar quando quiser; nada depende dela.

## 7. O que falta

- O Pedro olhar as fotos.
- A sua campainha **depois das 19h**, para publicar a D1039 e a D1036e juntas (D1034r).
- Continua de pé a rota para a medida da seção 3 da D1039.

A contagem do sinal de arroba nesta carta dá 0.
