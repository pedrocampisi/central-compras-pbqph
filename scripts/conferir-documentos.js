#!/usr/bin/env node
/**
 * Conferência automática dos documentos desta casa.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------------------------------------------------------
 * A organização dos documentos foi conferida à mão UMA vez, em 19/08/2026.
 * Conferência que se faz à mão dura poucas semanas — a observação é do
 * `Banco_de_Dados`, que já viu 27 documentos sem índice nenhum na casa dele.
 *
 * E o dia 02/09/2026 ensinou o resto: o `ci.yml` desta casa existia, era
 * lido por quem passasse, e NUNCA tinha executado uma vez (0 de 16 execuções
 * na história do repositório). **Instrumento que não roda é instrumento que
 * não existe.** Por isso este arquivo nasce ligado ao `pnpm conferir` e ao
 * CI, no mesmo commit — não depois.
 *
 * ---------------------------------------------------------------------------
 * DE ONDE VEIO O DESENHO, E O QUE FOI MUDADO DE PROPÓSITO
 * ---------------------------------------------------------------------------
 * O desenho é do `scripts/conferir_tudo.py` do `Banco_de_Dados` (lido, não
 * pedido: estava à mão). Duas coisas mudaram, e a segunda é a que importa:
 *
 *  1. é JavaScript, e não Python, porque roda no Node que esta casa já
 *     declara (`.nvmrc`) — nenhuma ferramenta nova entra na casa por isto;
 *
 *  2. ⚠️ **na casa dele as cartas são listadas no `INDICE.md`; aqui NÃO.**
 *     A decisão 4 e a 7 desta casa tiraram a tabela de cartas do índice: a
 *     gaveta é a verdade, e lista que repete a gaveta desatualiza. Copiar a
 *     regra dele para cá acusaria TODAS as cartas vivas como órfãs — um
 *     vermelho errado, que é pior que verde nenhum. Instrumento se adapta à
 *     casa, não se copia por cima dela.
 *
 * ---------------------------------------------------------------------------
 * O QUE ESTA CONFERÊNCIA **NÃO** OLHA — declarado antes de medir
 * ---------------------------------------------------------------------------
 *  · não lê o CONTEÚDO de carta nenhuma, e não julga se está certo;
 *  · não sabe se um documento está DESATUALIZADO — só se ele DECLARA o
 *    estado em que diz estar. Documento mentiroso passa verde aqui;
 *  · não segue link http/https, só caminho local;
 *  · não olha `legacy/`, `node_modules/`, `dist/` nem `.git/`;
 *  · fora desta casa, só responde a UMA pergunta: "a carta que eu mandei
 *    chegou?". Não confere mais nada na casa dos outros;
 *  · e não escreve NADA, em lugar nenhum — a trava 7 existe para provar isso.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, basename, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CASA = resolve(AQUI, '..');
const PLATAFORMA = resolve(CASA, '..');

const IGNORAR = new Set(['node_modules', 'dist', '.git', 'legacy', 'coverage']);
const ESTADOS = ['VALE HOJE', 'PROPOSTA', 'CONCLUÍDO', 'SUBSTITUÍDO'];
const PORTAS_FORA_DE_DOCS = new Set(['CLAUDE.md', 'README.md']);
const GAVETAS_DE_CARTA = ['Devolucoes', 'Enviados'];

// -------------------------------------------------------------- ferramentas

function todosOsMd(raiz) {
  const achados = [];
  (function andar(dir) {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORAR.has(entrada.name)) continue;
      const caminho = join(dir, entrada.name);
      if (entrada.isDirectory()) andar(caminho);
      else if (entrada.name.endsWith('.md')) achados.push(caminho);
    }
  })(raiz);
  return achados.sort();
}

/** Carta é o que mora numa gaveta de correio — viva ou arquivada. */
function ehCarta(caminho) {
  const partes = relative(CASA, caminho).split(/[\\/]/);
  return partes.some((p) => GAVETAS_DE_CARTA.includes(p));
}

const dizer = (caminho) => relative(CASA, caminho).split('\\').join('/');

/** Alvos `.md` de links markdown relativos, sem âncora e sem http. */
function linksMd(texto) {
  const alvos = [];
  for (const [, alvo] of texto.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) {
    if (!/^[a-z]+:/i.test(alvo)) alvos.push(decodeURIComponent(alvo));
  }
  return alvos;
}

/** Nomes de arquivo `.md` apontados por um índice. */
function nomesApontados(indice) {
  if (!existsSync(indice)) return new Set();
  return new Set(linksMd(readFileSync(indice, 'utf8')).map((a) => posix.basename(a)));
}

// ------------------------------------------------------------- as travas

/** 1. Todo documento que não é carta diz, no topo, em que estado está. */
function cabecalhoEmTodoDocumento(mds) {
  const faltando = [];
  for (const md of mds) {
    if (ehCarta(md)) continue; // decisão 13: o estado da carta é a gaveta dela
    const topo = readFileSync(md, 'utf8').split('\n').slice(0, 14).join('\n');
    const falta = ['Data', 'Estado', 'Escopo'].filter(
      (campo) => !new RegExp(`^> *\\**${campo}:?\\**`, 'mi').test(topo),
    );
    if (falta.length) faltando.push(`${dizer(md)} (falta ${falta.join(', ')})`);
  }
  return faltando.length
    ? [false, `${faltando.length} documento(s) sem cabeçalho: ${faltando.join(' · ')}`]
    : [true, `${mds.filter((m) => !ehCarta(m)).length} documentos, todos com Data/Estado/Escopo`];
}

/** 2. O estado declarado é um dos quatro que a lei admite. */
function estadoValido(mds) {
  const errados = [];
  for (const md of mds) {
    if (ehCarta(md)) continue;
    const topo = readFileSync(md, 'utf8').split('\n').slice(0, 14).join('\n');
    const linha = topo.match(/^> *\**Estado:?\**(.*)$/mi);
    if (!linha) continue; // a trava 1 já cuida disto
    const valor = linha[1].replace(/\*/g, '').trim();
    if (!ESTADOS.some((e) => valor.toUpperCase().startsWith(e))) {
      errados.push(`${dizer(md)} → "${valor}"`);
    }
  }
  return errados.length
    ? [false, `${errados.length} estado(s) fora dos quatro da lei: ${errados.join(' · ')}`]
    : [true, `todo estado é um de: ${ESTADOS.join(' | ')}`];
}

/** 3. Nenhum link para `.md` aponta para arquivo que não existe. */
function semLinkMorto(mds) {
  const mortos = [];
  let total = 0;
  for (const md of mds) {
    for (const alvo of linksMd(readFileSync(md, 'utf8'))) {
      total += 1;
      if (!existsSync(join(dirname(md), alvo))) mortos.push(`${dizer(md)} → ${alvo}`);
    }
  }
  return mortos.length
    ? [false, `${mortos.length} link(s) morto(s) de ${total}: ${mortos.slice(0, 5).join(' · ')}`]
    : [true, `${total} links conferidos, nenhum morto`];
}

/**
 * 4. Todo documento é apontado por um índice — MENOS as cartas vivas, que a
 *    gaveta já explica (decisões 4 e 7). Carta ARQUIVADA precisa da linha,
 *    porque o índice do Arquivo Morto responde "por que saiu de circulação".
 */
function documentoAmarrado(mds) {
  const noMorto = nomesApontados(join(CASA, 'docs', 'Arquivo_Morto', 'INDICE.md'));
  const portas = new Set(['INDICE.md', 'PENDENCIAS.md', 'PLANEJAMENTO.md']);

  // Dois níveis, como na casa do Banco: o índice de cima responde "o que vale
  // hoje?" e o do Arquivo Morto responde "onde foi parar aquilo?". Uma pasta
  // com índice PRÓPRIO (`INDICE.md` ou `README.md`) responde pelos filhos dela
  // — e esse índice próprio precisa estar no de cima, senão a pasta inteira
  // sai do mapa sem nada acusar.
  const indiceDaPasta = (md) => {
    for (const nome of ['INDICE.md', 'README.md']) {
      const candidato = join(dirname(md), nome);
      if (basename(md) !== nome && existsSync(candidato)) return candidato;
    }
    return join(CASA, 'docs', 'INDICE.md');
  };

  const orfaos = [];
  for (const md of mds) {
    const nome = basename(md);
    const rel = dizer(md);
    if (rel.includes('docs/Arquivo_Morto/')) {
      if (nome !== 'INDICE.md' && !noMorto.has(nome)) orfaos.push(rel);
      continue;
    }
    if (ehCarta(md)) continue; // gaveta viva: a pasta é a verdade (decisões 4 e 7)
    if (PORTAS_FORA_DE_DOCS.has(rel)) continue;
    if (portas.has(nome) && dirname(md) === join(CASA, 'docs')) continue;
    if (!nomesApontados(indiceDaPasta(md)).has(nome)) orfaos.push(rel);
  }
  return orfaos.length
    ? [false, `${orfaos.length} documento(s) fora de índice: ${orfaos.slice(0, 5).join(' · ')}`]
    : [
        true,
        `${nomesApontados(join(CASA, 'docs', 'INDICE.md')).size} no índice de cima, ` +
          `${noMorto.size} no do Arquivo Morto`,
      ];
}

/** 5. Só `CLAUDE.md` e `README.md` moram fora de `docs/`. */
function mdForaDeDocs(mds) {
  const fora = mds
    .map(dizer)
    .filter((r) => !r.startsWith('docs/') && !PORTAS_FORA_DE_DOCS.has(r));
  return fora.length
    ? [false, `${fora.length} .md fora de docs/: ${fora.join(' · ')}`]
    : [true, 'só CLAUDE.md e README.md fora de docs/, como manda a lei'];
}

/**
 * 6. Toda carta em `Enviados/` chegou de fato na casa do destinatário.
 *    A pergunta certa não é "eu escrevi?" — é "chegou?" (lição 7 do CTO).
 */
function cartaEnviadaChegou() {
  const gaveta = join(CASA, 'docs', 'Enviados');
  if (!existsSync(gaveta)) return [true, 'nenhuma carta esperando resposta'];

  const casas = readdirSync(PLATAFORMA, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(PLATAFORMA, e.name, 'docs')))
    .map((e) => e.name);
  if (!casas.length) return [null, 'não deu para medir: não achei as outras casas da plataforma'];

  const presas = [];
  const naoSei = [];
  const cartas = readdirSync(gaveta).filter((n) => n.endsWith('.md'));

  for (const carta of cartas) {
    const trecho = carta.match(/_para_(.+?)_[a-z0-9]+-/i);
    if (!trecho) {
      naoSei.push(carta);
      continue;
    }
    const destinos = casas.filter(
      (c) => c !== 'Ordem de Compra' && trecho[1].includes(c.replace(/ /g, '_')),
    );
    if (!destinos.length) {
      naoSei.push(carta);
      continue;
    }
    for (const destino of destinos) {
      if (!todosOsMd(join(PLATAFORMA, destino, 'docs')).some((m) => basename(m) === carta)) {
        presas.push(`${carta.slice(0, 46)}… não está em ${destino}`);
      }
    }
  }

  if (presas.length) return [false, `${presas.length} carta(s) que não chegaram: ${presas.join(' · ')}`];

  // ⚠️ Verde aqui só vale se ALGUMA carta foi mesmo conferida. Dentro do CI só
  // existe esta casa — as outras não estão no checkout —, então nenhum
  // destinatário é reconhecido e a resposta honesta é "não deu para medir", e
  // não um verde que significaria nada (lição 8 do CTO: prova que fica verde
  // quando nada aconteceu não é prova de que aconteceu).
  const conferidas = cartas.length - naoSei.length;
  if (cartas.length && !conferidas) {
    return [null, `não deu para medir: ${cartas.length} carta(s), nenhum destinatário aqui do lado`];
  }
  const nota = naoSei.length ? ` (${naoSei.length} com destinatário que não reconheci)` : '';
  return [true, `${conferidas} carta(s) conferidas na casa de quem recebeu${nota}`];
}

/**
 * 7. A conferência apenas OLHA.
 *    A lição 1 do catálogo do CTO: conferência que conserta calada relata
 *    como medição o que ela mesma acabou de tornar verdade. Esta trava lê o
 *    próprio código-fonte e reprova se aparecer qualquer chamada de escrita.
 */
function aConferenciaNaoEscreve() {
  // ⚠️ A primeira versão desta trava REPROVOU A SI MESMA: ela procurava os
  // nomes proibidos com uma expressão que continha os nomes proibidos. Vigia
  // que inventa achado (lição 6 do CTO), na primeira execução da vida dela.
  // Agora procura CHAMADA — `nome(` — e pula as linhas marcadas `nao-conta`,
  // que são as que apenas citam os nomes.
  const ESCRITA = ['writeFileSync', 'appendFileSync', 'mkdirSync', 'rmSync', // nao-conta
    'unlinkSync', 'renameSync', 'execSync', 'spawnSync', 'copyFileSync']; // nao-conta
  const fonte = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const corpo = fonte
    .split('\n')
    .filter((l) => !l.includes('nao-conta') && !l.trimStart().startsWith('*'))
    .join('\n');
  const achadas = ESCRITA.filter((n) => new RegExp(`\\b${n}\\s*\\(`).test(corpo));
  return achadas.length
    ? [false, `a conferência ganhou poder de escrever: ${achadas.join(', ')}`]
    : [true, 'o código desta conferência não tem uma única chamada de escrita'];
}

// ------------------------------------------------------------------- corrida

const mds = todosOsMd(CASA);
const TRAVAS = [
  ['cabeçalho em todo documento', () => cabecalhoEmTodoDocumento(mds)],
  ['estado dentro dos quatro da lei', () => estadoValido(mds)],
  ['nenhum link morto', () => semLinkMorto(mds)],
  ['todo documento amarrado a um índice', () => documentoAmarrado(mds)],
  ['só as duas portas fora de docs/', () => mdForaDeDocs(mds)],
  ['carta enviada chegou na casa de quem recebe', cartaEnviadaChegou],
  ['a conferência não escreve', aConferenciaNaoEscreve],
];

console.log(`\nConferência dos documentos — ${mds.length} arquivos .md\n`);
let reprovou = 0;
let naoMediu = 0;

for (const [nome, rodar] of TRAVAS) {
  let passou;
  let recado;
  try {
    [passou, recado] = rodar();
  } catch (erro) {
    // ⚠️ Trava que ESTOURA não é trava que "não deu para medir" — é trava
    // quebrada, e conferência quebrada tem de ficar vermelha. O "não deu para
    // medir" honesto é o que a própria trava DECLARA devolvendo null (a carta
    // que chegou, por exemplo, não tem como ser conferida dentro do CI, onde
    // só existe esta casa). Esta distinção nasceu de um defeito real: na
    // primeira versão, uma variável apagada virou "não medi" e o programa
    // saiu com código 0. Verde por engano é o que esta casa mais teme.
    passou = false;
    recado = `a trava quebrou: ${erro.message}`;
  }
  const selo = passou === true ? '  ok  ' : passou === null ? ' ???? ' : ' FALHA';
  if (passou === false) reprovou += 1;
  if (passou === null) naoMediu += 1;
  console.log(`[${selo}] ${nome}\n         ${recado}`);
}

console.log(
  `\n${TRAVAS.length - reprovou - naoMediu} passaram · ${reprovou} reprovaram` +
    (naoMediu ? ` · ${naoMediu} NÃO deram para medir` : '') +
    '\n',
);
process.exit(reprovou > 0 ? 1 : 0);
