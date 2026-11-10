/* Modo diurno (Creme) e modo noturno (Marinho e Ouro) da Plataforma Campisi.
   Entra no <head>, antes das folhas de estilo, para a tela nunca piscar na cor errada.
   Todo mundo comeca no Creme, o modo do dia, seja qual for o ajuste do computador; quem escolhe a noite fica
   com a escolha (palavra do Pedro, 08/11/2026: "por padrao deixe o creme e a pessoa configura").
   Todo botao com o atributo data-trocar-modo troca o modo. */
(function () {
  var CHAVE = 'tema';   // a mesma chave e os mesmos valores da Central: quem ja escolheu la nao perde a escolha
  var raiz = document.documentElement;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

  function escolha() {
    try { return window.localStorage.getItem(CHAVE); } catch (e) { return null; }   // janela privada: segue sem guardar
  }
  function modoDaPessoa() {
    // so' a noite escolhida muda o modo; nada guardado, 'claro' ou valor estranho: o dia
    return escolha() === 'escuro' ? 'noturno' : 'diurno';
  }
  function pintar(modo) { raiz.setAttribute('data-theme', modo); }
  function trocar() {
    var novo = raiz.getAttribute('data-theme') === 'diurno' ? 'noturno' : 'diurno';
    try { window.localStorage.setItem(CHAVE, novo === 'diurno' ? 'claro' : 'escuro'); } catch (e) {}
    // a tela inteira se funde na outra; quem pediu menos movimento troca na hora
    if (document.startViewTransition && !calmo.matches) document.startViewTransition(function () { pintar(novo); });
    else pintar(novo);
  }

  pintar(modoDaPessoa());
  document.addEventListener('click', function (e) { if (e.target.closest('[data-trocar-modo]')) trocar(); });
  window.addEventListener('storage', function (e) { if (e.key === CHAVE) pintar(modoDaPessoa()); });   // outra aba trocou
})();
