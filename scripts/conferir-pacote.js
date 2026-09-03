#!/usr/bin/env node
/**
 * Conferência do PACOTE, rodada entre montar e subir.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ESTE ARQUIVO EXISTE, E POR QUE ELE É LOCAL E NÃO FICA NO CI
 * ---------------------------------------------------------------------------
 * Estas três perguntas moravam no `deploy.yml`, no GitHub. Em 02/09/2026 o
 * Pedro mandou este aplicativo morar no Cloudflare, junto com o resto da
 * plataforma, e o GitHub Pages saiu. Com ele saiu o fluxo que publicava — e
 * as travas precisavam de casa nova.
 *
 * Elas vieram para cá, e não para o CI, por um motivo medido: para conferir
 * o pacote é preciso MONTAR o pacote, e montar exige o endereço e a chave do
 * banco. No CI isso obrigaria o Pedro a digitar as duas coisas também lá,
 * criando MAIS UM lugar no mundo com o nome do banco dentro. Aqui elas vêm do
 * `.env.local`, que já está nesta pasta, que o Vite já lê sozinho, e que
 * nenhum agente nunca abriu.
 *
 * E tem um ganho que o CI não dava: agora a trava roda no caminho do ato real.
 * `pnpm deploy` monta, confere e só então sobe. Antes, a conferência era num
 * lugar e a publicação em outro.
 *
 * ---------------------------------------------------------------------------
 * O QUE ELE NÃO FAZ, DECLARADO
 * ---------------------------------------------------------------------------
 * - não abre o navegador: não sabe se a tela funciona, só se o pacote tem
 *   dentro dele o que precisa ter;
 * - não confere se o endereço do banco é o banco CERTO — só que existe um.
 *   Banco de teste passaria verde aqui;
 * - não imprime o endereço do banco, nunca. Conta ocorrências e mostra o
 *   número. Esta casa é o único repositório PÚBLICO da plataforma (decisão 6),
 *   e log de terminal vira print, e print vira grupo de WhatsApp.
 *
 * ---------------------------------------------------------------------------
 * A REGRA QUE ESTA CASA APRENDEU EM 02/09, E QUE VALE AQUI TAMBÉM
 * ---------------------------------------------------------------------------
 * Trava que ESTOURA fica VERMELHA. Não existe "não deu para medir" com saída
 * 0: isso foi um defeito real do conferidor de documentos, que devolvia
 * tranquilidade quando na verdade tinha quebrado.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PACOTE = 'dist';
const SUBENDERECO_MORTO = 'central-compras-pbqph';

/** Todo arquivo de texto do pacote, com o conteúdo lido uma vez só. */
function arquivosDoPacote(pasta = PACOTE, achados = []) {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) {
      arquivosDoPacote(caminho, achados);
    } else {
      achados.push(caminho);
    }
  }
  return achados;
}

function texto(caminho) {
  try {
    return readFileSync(caminho, 'utf8');
  } catch {
    return ''; // binário (imagem, fonte): não interessa a nenhuma pergunta daqui
  }
}

// ---------------------------------------------------------------------------
// AS TRÊS PERGUNTAS
// ---------------------------------------------------------------------------

/**
 * ⚠️ A pergunta ingênua aqui fica VERDE NUM PACOTE VAZIO. Medido em
 * 02/09/2026: um pacote montado SEM o endereço do banco ainda contém a
 * palavra `supabase.co`, porque a própria biblioteca carrega a string
 * `*.supabase.co` dentro dela. Um `grep supabase.co` daria 1 x 3 e passaria
 * nos dois. O que discrimina é o endereço inteiro: `https://<host>.supabase.co`
 * — aí é 0 x 3.
 */
function oBancoEntrou(arquivos) {
  const padrao = /https:\/\/[a-z0-9-]{10,}\.supabase\.co/g;
  let ocorrencias = 0;
  for (const caminho of arquivos) {
    ocorrencias += (texto(caminho).match(padrao) || []).length;
  }
  if (!ocorrencias) {
    return [
      false,
      'o pacote saiu SEM endereço de banco dentro — subir isto é uma página que não abre.\n' +
        '           Quase sempre é o `.env.local` faltando ou vazio nesta pasta.',
    ];
  }
  // Só o número. O valor nunca.
  return [true, `${ocorrencias} ocorrência(s) do endereço do banco dentro do pacote`];
}

/**
 * ⚠️ Aqui a cegueira é a mesma, do outro lado. Medido em 02/09/2026:
 * `grep /assets/` acha 6 ocorrências no pacote CERTO e 6 no ERRADO, porque
 * `/central-compras-pbqph/assets/` CONTÉM `/assets/`. O que discrimina é a
 * aspa colada: `"/assets/` dá 6 x 0.
 */
function apontaParaARaiz() {
  const indice = texto(join(PACOTE, 'index.html'));
  if (!indice) return [false, 'não há `index.html` no pacote'];
  const achadas = (indice.match(/"\/assets\//g) || []).length;
  if (!achadas) {
    return [false, 'o `index.html` não aponta para `/assets/` na raiz'];
  }
  return [true, `${achadas} caminho(s) de raiz no index.html`];
}

/**
 * O subendereço do GitHub Pages morreu em 02/09/2026. Esta trava existe para
 * ele não voltar sem ninguém ver — é o tipo de coisa que reaparece por uma
 * configuração antiga e só dá as caras como tela branca na mão de uma pessoa.
 */
function oSubenderecoMortoNaoVoltou(arquivos) {
  const sujos = arquivos.filter((c) => texto(c).includes(SUBENDERECO_MORTO));
  if (sujos.length) {
    return [
      false,
      `sobrou o subendereço morto \`/${SUBENDERECO_MORTO}/\` em ${sujos.length} arquivo(s):\n` +
        sujos.map((c) => `           · ${c}`).join('\n'),
    ];
  }
  return [true, `nenhum resto de \`/${SUBENDERECO_MORTO}/\` no pacote`];
}

/**
 * ⚠️ ESTA TRAVA NASCEU DE UM DEFEITO ACHADO NO AR, em 03/09/2026, no primeiro
 * ensaio em `compras.campisi.workers.dev`.
 *
 * O `index.html` pede `/manifest.webmanifest` e `/registerSW.js`. Os dois
 * **não são gerados** pela montagem — e ninguém tinha visto, porque no GitHub
 * Pages eles davam 404 num canto que ninguém olhava, e no Cloudflare o
 * `not_found_handling: single-page-application` faz coisa PIOR: devolve
 * **200 com o `index.html` dentro**. O navegador tenta ler página como
 * programa e estoura `Unexpected token '<'`.
 *
 * É a lição do dia 02/09 outra vez, de cara nova: **a pergunta óbvia (o
 * arquivo respondeu?) fica verde nos dois casos.** A que discrimina é: o
 * arquivo que o `index.html` pede EXISTE no pacote?
 */
const EXCECOES_DECLARADAS = new Map([
  // Defeito ANTIGO, não regressão: medido em 03/09/2026, o site publicado no
  // GitHub Pages (ramo `main`) também devolve 404 nos dois. O PWA desta casa
  // nunca funcionou em produção. A hipótese é o `vite-plugin-pwa` não emitir
  // os arquivos sob o Vite desta casa — o `sw.js` sai, estes dois não.
  //
  // Ficam aqui de propósito, VISÍVEIS, em vez de a trava ser fraca: é a
  // pendência 7, e no dia em que ela fechar estas duas linhas somem. Exceção
  // escrita é dívida que se cobra; trava frouxa é dívida que some.
  ['/manifest.webmanifest', 'pendência 7 — o PWA não é gerado (defeito antigo)'],
  ['/registerSW.js', 'pendência 7 — o PWA não é gerado (defeito antigo)'],
]);

function tudoQueOIndicePedeExiste() {
  const indice = texto(join(PACOTE, 'index.html'));
  if (!indice) return [false, 'não há `index.html` no pacote'];

  const pedidos = new Set();
  for (const m of indice.matchAll(/(?:src|href)="(\/[^"]*)"/g)) {
    pedidos.add(m[1].split(/[?#]/)[0]);
  }

  const faltando = [];
  const perdoados = [];
  for (const pedido of pedidos) {
    if (existsSync(join(PACOTE, pedido))) continue;
    if (EXCECOES_DECLARADAS.has(pedido)) {
      perdoados.push(`${pedido} — ${EXCECOES_DECLARADAS.get(pedido)}`);
    } else {
      faltando.push(pedido);
    }
  }

  if (faltando.length) {
    return [
      false,
      `o index.html pede ${faltando.length} arquivo(s) que NÃO estão no pacote:\n` +
        faltando.map((c) => `           · ${c}`).join('\n') +
        '\n           No ar isto não vira 404: vira 200 com HTML dentro, e o' +
        '\n           navegador estoura "Unexpected token \'<\'".',
    ];
  }

  const recado = `${pedidos.size} pedido(s) do index.html conferido(s)`;
  if (perdoados.length) {
    return [
      true,
      `${recado}\n           ⚠️ ${perdoados.length} exceção(ões) DECLARADA(S), que não são "está tudo bem":\n` +
        perdoados.map((c) => `           · ${c}`).join('\n'),
    ];
  }
  return [true, recado];
}

// ---------------------------------------------------------------------------

function main() {
  if (!existsSync(PACOTE)) {
    console.error(`\n  [FALHA] não existe pasta \`${PACOTE}/\`. Monte antes: pnpm build\n`);
    process.exit(1);
  }

  const arquivos = arquivosDoPacote();
  const perguntas = [
    ['o banco entrou no pacote', () => oBancoEntrou(arquivos)],
    ['o pacote aponta para a raiz', () => apontaParaARaiz()],
    ['o subendereço morto não voltou', () => oSubenderecoMortoNaoVoltou(arquivos)],
    ['tudo que o index.html pede existe', () => tudoQueOIndicePedeExiste()],
  ];

  let reprovadas = 0;
  console.log(`\n  Conferindo o pacote (${arquivos.length} arquivos em \`${PACOTE}/\`)\n`);

  for (const [nome, rodar] of perguntas) {
    let passou;
    let recado;
    try {
      [passou, recado] = rodar();
    } catch (erro) {
      // Estourar é REPROVAR. Ver o cabeçalho deste arquivo.
      passou = false;
      recado = `a trava quebrou: ${erro.message}`;
    }
    if (!passou) reprovadas += 1;
    console.log(`  [${passou ? '  ok  ' : ' FALHA'}] ${nome}`);
    console.log(`           ${recado}`);
  }

  const total = perguntas.length;
  console.log(`\n  ${total - reprovadas} passaram · ${reprovadas} reprovaram\n`);

  if (reprovadas) {
    console.error('  A subida PAROU de propósito. Um pacote assim vira tela branca.\n');
    process.exit(1);
  }
}

main();
