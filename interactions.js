/* ===========================================================
   ARTEFEKT — warstwa interakcji
   Każdy efekt jest opcjonalny: jeśli brakuje elementu albo API,
   po prostu się nie włącza i strona działa jak wcześniej.
   =========================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var body = document.body;

  /* ---------- 1. pasek postępu czytania ---------- */
  var progress = null;
  if (!reduce) {
    progress = document.createElement('div');
    progress.className = 'fx-progress';
    progress.setAttribute('aria-hidden', 'true');
    body.appendChild(progress);
  }

  /* ---------- 2. powrót na górę ---------- */
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'fx-top';
  toTop.setAttribute('aria-label', 'Wróć na górę strony');
  toTop.innerHTML = '<span aria-hidden="true">↑</span>';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  body.appendChild(toTop);

  /* ---------- 3. parallax tła hero ---------- */
  var hero = document.querySelector('.hero-home');
  if (hero && !reduce) body.classList.add('fx-hero');

  /* ---------- wspólna pętla scrolla ---------- */
  var scrollTicking = false;
  var pendingWipes = [];

  function onScrollFrame() {
    scrollTicking = false;
    var y = window.pageYOffset || root.scrollTop || 0;

    // siatka bezpieczeństwa: gdyby IntersectionObserver nie zadziałał,
    // kadr i tak odsłoni się po wejściu w widok — nic nie zostaje ukryte
    if (pendingWipes.length) {
      pendingWipes = pendingWipes.filter(function (el) {
        if (el.classList.contains('fx-in')) return false;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
          el.classList.add('fx-in');
          return false;
        }
        return true;
      });
    }

    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.setProperty('--fx-progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }

    toTop.classList.toggle('is-visible', y > 700);

    if (hero && !reduce) {
      var h = hero.offsetHeight || 1;
      // tło przesuwa się wolniej niż strona, z zapasem 7% wysokości
      var shift = Math.min(y * 0.16, h * 0.065);
      root.style.setProperty('--fx-hero', (y < h * 1.2 ? shift : h * 0.065).toFixed(1) + 'px');
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(onScrollFrame);
    else onScrollFrame();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollFrame();

  if (reduce) return;

  /* ---------- 4. odsłanianie kadrów przy wejściu w kadr ---------- */
  if ('IntersectionObserver' in window) {
    var wipeSelector = [
      '.manifesto-image',
      '.oversize-card img',
      '.process-notebook img',
      '.offer-item-media',
      '.offer-process-media',
      '.sub-statement figure img',
      '.gallery-card img',
      '.nb-card'
    ].join(',');

    var wipeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fx-in');
        wipeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    var registerWipes = function (scope) {
      (scope || document).querySelectorAll(wipeSelector).forEach(function (el) {
        if (el.classList.contains('fx-wipe')) return;
        // element już w kadrze przy wejściu na stronę — pokazujemy bez animacji
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) return;
        el.classList.add('fx-wipe');
        pendingWipes.push(el);
        wipeObserver.observe(el);
      });
    };

    registerWipes(document);

    // ostateczny bezpiecznik — po 6 s nic nie ma prawa zostać zasłonięte
    window.setTimeout(function () {
      document.querySelectorAll('.fx-wipe:not(.fx-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) el.classList.add('fx-in');
      });
    }, 6000);

    // galeria projektów powstaje z JS — dorejestrowujemy nowe kadry
    var gallery = document.querySelector('[data-project-gallery]');
    if (gallery && 'MutationObserver' in window) {
      new MutationObserver(function () { registerWipes(gallery); })
        .observe(gallery, { childList: true });
    }
  }

  /* ---------- 5. zdjęcie podąża za kursorem ---------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (canHover) {
    document.querySelectorAll('.oversize-card, .offer-item-media, .nb-card').forEach(function (card) {
      var img = card.tagName === 'IMG' ? card : card.querySelector('img');
      if (!img) return;
      card.classList.add('fx-pan');

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--fx-x', (nx * 14).toFixed(1) + 'px');
        card.style.setProperty('--fx-y', (ny * 14).toFixed(1) + 'px');
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--fx-x', '0px');
        card.style.setProperty('--fx-y', '0px');
      });
    });
  }
})();
