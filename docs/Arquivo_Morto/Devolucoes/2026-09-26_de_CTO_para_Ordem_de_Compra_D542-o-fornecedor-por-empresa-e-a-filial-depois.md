# D542 — O fornecedor por empresa, e a filial depois: a pessoa lê o apelido, e a filial se distingue pelo que ela é, nunca por "····5245"

**De:** CTO · **Para:** `Ordem_de_Compra` · **Data:** 26/09/2026, 11h1x
**Responde:** nada sua; é palavra do Pedro na minha janela. A sua publicação da D541 (`0439a829`) está conferida e
arquivada.
**Decisão:** D542 · **Fase:** 4 — a equipe trabalha nas telas primeiro
**Espero de volta:** a carta de publicação, com a versão no ar, o desfazer, as medidas e as linhas prontas para o Pedro
conferir; e a campainha.

## §0 — A palavra do Pedro, com as quatro coisas (lei 3 §7.2)

- **Quem:** Pedro Paulo Campisi.
- **Quando e onde:** 26/09/2026, perto das 11h, na janela do CTO, com a foto da lista de Fornecedor da Nova OC aberta.
- **O que ele disse:** *"essa forma como as filiais estão aparecendo da OC não está legal. Melhore"*.
- **O que a foto mostra:**
  - "BEIJA FLOR COMERCIO DE TINTAS LTDA · UBERLANDIA/MG · ····NNNN", oito vezes seguidas, em maiúsculas;
  - e duas linhas da ArcelorMittal, com a razão social escrita de dois jeitos.
- **O contexto:** a D541 continua valendo. Ninguém da equipe usa a OC, então publica direto.

## §1 — O que eu medi na produção, só lendo

- **138 filiais** ativas que vendem material, de **114 empresas** (o `empresa_id` da `fornecedor_resolvido`).
  - São 112 apelidos, e nenhuma dessas filiais está sem empresa.
- **14 empresas** têm mais de uma filial na lista, somando 40 filiais.
  - A maior é a Império das Tintas, com 11. Oito delas têm a razão social da Beija Flor.
- **Dois apelidos estão em duas empresas cada:** Império das Tintas e Triângulo Cercas. São duas raízes de CNPJ com a
  mesma marca.
- **A ArcelorMittal é UMA empresa,** com 2 filiais em 2 cidades. As duas razões sociais são o mesmo nome escrito de
  dois jeitos.
- **Das 40 filiais dessas empresas, 37 não têm rua nem bairro.** No total, 122 das 138 estão sem rua.
  - A cidade, todas têm.
  - Em 19 filiais, a cidade é a mesma de uma irmã.
- **2 filiais da Império estão com `bloqueado_para_compra_nova = true`** (BAIXADA na Receita) e hoje aparecem na
  Nova OC. O motivo: `fornecedoresParaOc` filtra só `ativo` e `fornece_material`.

## §2 — O que muda

1. **A lista do Fornecedor mostra EMPRESAS,** uma linha cada, pelo apelido (`empresa_apelido`).
   - O grupo é o `empresa_id` que o banco dá, **nunca** a raiz do CNPJ calculada na tela. Mesmo motivo do portal (D504):
     quem diz que uma filial é de uma empresa é o banco.
   - **A linha menor** diz, por exemplo, "11 filiais · Uberlândia/MG e Araguari/MG". Quando a empresa tem uma filial
     só, a linha menor é a cidade dela.
   - **Quando duas empresas têm o mesmo apelido** (Império e Triângulo Cercas), a linha menor de cada uma leva também a
     razão social. Assim as duas linhas não parecem repetidas.
   - **A pesquisa** continua achando pelo apelido e pela razão social e pelo fantasia de qualquer filial.
   - **A ordem** é a do apelido, que é o nome que a pessoa lê.
2. **Empresa com UMA filial na lista:** escolher a empresa já escolhe a filial. Nada mais muda.
3. **Empresa com mais de uma filial:** logo abaixo aparece o campo **"Filial"**, obrigatório, numa lista simples, sem
   pesquisa (são no máximo 11). Cada filial aparece assim:
   - a cidade/UF;
   - se outra filial da mesma empresa estiver na mesma cidade, a rua e o número, e o bairro quando houver;
   - se ainda empatar, por falta de rua: "matriz" ou "filial nº N", pelo número de ordem do CNPJ. São os quatro dígitos
     depois da barra, e 0001 é a matriz. É a numeração da Receita, e dá para ler. Os quatro últimos dígitos
     ("····5245") levam o dígito verificador e não dizem nada a ninguém. **Eles saem.**
   - Se o grupo juntar duas razões sociais, a linha da filial leva a razão social dela.
   - O Banco vai preencher a rua e o bairro das filiais em branco (carta D543, em paralelo). Quando isso chegar, o
     "filial nº N" some sozinho, porque a rua passa a desempatar. **Não espere por isso.**
4. **Filial bloqueada** (`bloqueado_para_compra_nova`) **não entra na Nova OC.** No Histórico, ela entra, porque uma OC
   antiga pode ser dela.
5. **Depois de escolher, a pista abaixo do campo não muda.** Ela continua com a razão social, o CNPJ inteiro e o
   endereço (`enderecoResumido`). O PDF também não muda: a OC vai para uma filial, com CNPJ.
6. **Um rascunho ou uma OC antiga cuja filial hoje não entraria na lista** (bloqueada ou inativa) abre mostrando a
   filial gravada, sem trocar sozinha. Diga na carta como ficou.
7. **No Histórico, o filtro de Fornecedor passa a ser por empresa.** Escolher a Império traz as OCs de todas as filiais
   dela.
8. **Alguns apelidos ainda têm cara de razão social.** Exemplos: "CIPLAN - CIMENTO PLANALTO S/A" e "BJB COMERCIO E
   SERVICOS LTDA". Isso é dado, não é tela: mostre como vem. Diga na carta quantos são na lista da Nova OC, que eu levo
   ao lugar certo.
9. **O campo novo cabe a 375 px,** como o resto da Nova OC (D541), e funciona pelo teclado.

## §3 — Como publicar

- Igual à D541: **direto na produção,** pela palavra do Pedro e pela emenda 3.
- **Antes de publicar:** typecheck, testes e build. Travas com sabotagem para:
  - (a) cada filial da lista cai em exatamente uma empresa, e a soma das filiais dos grupos é o tamanho da entrada;
  - (b) nenhum rótulo leva os quatro últimos dígitos do CNPJ;
  - (c) a filial bloqueada fica fora da Nova OC e dentro do Histórico;
  - (d) a empresa com uma filial só escolhe a filial sozinha;
  - (e) duas empresas com o mesmo apelido nunca saem com a mesma linha inteira.
- **Depois de publicar:** meça por fora (o pacote servido e o ref da produção) e anote a versão que saiu do ar, que é
  o desfazer.
- **As linhas prontas para o Pedro,** numeradas, incluindo estas:
  - digitar "império" e ver as duas empresas, cada uma com a sua linha menor;
  - escolher uma delas e ver o campo Filial;
  - escolher a ArcelorMittal e ver as duas cidades;
  - escolher uma empresa de filial única e ver o campo Filial não aparecer.
