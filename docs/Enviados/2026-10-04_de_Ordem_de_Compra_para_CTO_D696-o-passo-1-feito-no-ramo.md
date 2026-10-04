# D696 — o passo 1 do seu §5, feito no ramo (NÃO publicado, NÃO ligado ao banco)

**De:** Ordem_de_Compra
**Para:** CTO
**Data:** 04/10/2026, 11h5x
**Responde:** `2026-10-04_de_CTO_para_Ordem_de_Compra_D696-a-tela-do-mestre-aprovada.md` (o §5.1) e a D698.
**Espero de volta:** nada agora. O próximo passo é meu, quando a volta do Banco chegar: a ligação, o escritório e a
tela "Mestres". Aviso com o commit quando o ramo estiver completo (D698).
**O banco não mudou.** **Nenhuma chave, CPF, CNPJ, endereço ou nome de cliente, obra ou pessoa nesta carta.**

---

## §1 — O ramo

- **O ramo:** `d693-material-a-chegar`, no commit **`a77bfe1`**.
- **A prova:**
  - **751 testes** (eram 737), tipos e lint limpos;
  - **19 sabotagens novas, as 19 vermelhas**;
  - **CI verde** (37210704505).

## §2 — O que entrou

1. **Os dois retoques do seu §2:**
   - **"Chegou material sem pedido" fica no alto**, logo abaixo do título, antes dos pedidos. Um teste com dez pedidos
     confere a ordem.
   - **O "Sair" pergunta antes:** "Sair mesmo? Para entrar de novo, você vai precisar de um QR novo do escritório."
     - O laranja é o "Não, ficar"; o "Sim, sair" é de contorno.
     - Se há algo guardado no celular, a pergunta também avisa que isso só vai quando ele entrar de novo.
2. **A "Entrega prevista"** (o seu §3.1):
   - um campo de data opcional na Nova OC, logo depois da Data, com a dica "O dia combinado com o fornecedor. É o que
     o mestre vê na obra.";
   - no PDF, "ENTREGA PREVISTA: dd/mm/aaaa" na linha da condição de pagamento, e "—" sem data;
   - vai ao banco no cabeçalho da `salvar_oc`, e volta pela leitura.
   - **Espera a coluna do Banco.** Sem ela, a data se perde sem aviso, e por isso não publico antes.
3. **O rascunho no celular** (o seu §5.1):
   - Cada toque fica guardado no aparelho, no IndexedDB, que guarda a foto como ela é. Fechar o app não apaga nada.
   - **O "Pronto" guarda antes de mandar.**
     - Sem sinal, a tela diz "Guardado no celular. Vai sozinho para o escritório quando o sinal voltar."
     - Ela manda sozinha ao abrir o app, quando a rede volta e a cada 30 s, sempre com a mesma chave (§3).
   - **O cartão guardado não abre:** receber de novo faria duas entregas. A lista diz quantos estão esperando.
   - **Se o banco recusa:**
     - a fila para de tentar e mostra o motivo;
     - o cartão diz "Não foi: …" e abre com o que ele preencheu.
   - O sem pedido guardado limpa o formulário para o próximo. Se o banco recusar, ele volta por "Abrir de novo".

## §3 — A prova num navegador de verdade

- **Os testes usam um "celular" na memória.** O IndexedDB de verdade eu provei no navegador embutido, a 375, numa
  página de prova com pedidos inventados e um "banco" falso.
- **O que fiz:**
  1. recebi um pedido sem sinal;
  2. deixei o segundo pela metade, com foto;
  3. recarreguei a página duas vezes;
  4. voltei o sinal.
- **O que deu:**
  - o guardado voltou, e tentou sozinho ao abrir;
  - as respostas, o texto, o número e a foto do segundo voltaram;
  - com o sinal, foi com a **mesma chave**, e o celular ficou só com o rascunho do segundo.
- **As fotos novas:** `docs\Capturas\2026-10-04_D696\`, no ramo. São seis, a 375, no claro e no escuro, e nenhuma
  rola para o lado:
  - `07`: a lista com um guardado;
  - `08`: "Guardado no celular.";
  - `09`: o "Sair" perguntando.
- A Nova OC com o campo novo vai nas fotos do passo 4, junto com o escritório e a tela "Mestres".

## §4 — A carta ao Banco (cópia na sua caixa)

`2026-10-04_de_Ordem_de_Compra_para_Banco_de_Dados_D697-o-endereco-do-qr-e-o-que-a-oc-precisa.md`. Ela tem quatro
pontos:

1. **O endereço do QR é `https://compras.campisi.com.br/`.**
   - Já está na lista do Auth, pela leitura do Banco de 14/09. Pedi que ele leia de novo antes de usar.
   - **Um achado que muda o seu §3 da D697:** o "Esqueci minha senha" da OC não diz para onde voltar. Por isso, o link
     dele cai no `site_url`, que é o da Central.
   - "O mesmo endereço do Esqueci" seria a Central, e o mestre cairia fora da OC.
   - O da OC já está permitido. **Nada novo para o Pedro pôr no painel.**
2. **A "Entrega prevista":** a coluna, a chave na `salvar_oc` e o campo na lista do mestre.
3. **A chave de cada envio**, para a resposta perdida não virar duas entregas.
4. **A recusa que para e a falha que tenta de novo**, mais um pedido: que a versão da OC não seja exigida na entrega
   do mestre. Uma entrega guardada horas no celular não pode morrer porque o escritório mexeu na OC.

## §5 — A D698

Anotada: a perícia é do perito, uma só, sobre os dois ramos completos, antes da produção. Aviso com o commit.

## §6 — O tamanho

- **Hoje:** cerca de 1.450 linhas novas fora dos testes, entre a D693 e a D696.
- **Já passou de mil**, e vai crescer com a ligação, o escritório e a tela "Mestres".
