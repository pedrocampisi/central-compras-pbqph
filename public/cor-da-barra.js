/* A barra do sistema no celular (o <meta name="theme-color">) acompanha o modo da tela (D1034, lote a).
   O modo.js do padrão troca o data-theme do <html>; este arquivo só ouve a troca e copia para a barra a cor
   do chão (--fundo) que os tokens dão naquele modo. Nenhuma cor escrita aqui. */
(function () {
  var raiz = document.documentElement;
  function copiar() {
    var meta = document.querySelector('meta[name="theme-color"]');
    var chao = getComputedStyle(raiz).getPropertyValue('--fundo').trim();
    if (meta && chao) meta.setAttribute('content', chao);
  }
  new MutationObserver(copiar).observe(raiz, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('load', copiar);   // as folhas de estilo ja chegaram
})();
