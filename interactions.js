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

  /* ---------- 2. parallax tła hero ---------- */
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

  /* ---------- social popup + spójne ikony ---------- */
  var socialFloat = document.querySelector('[data-social-float]');
  var facebookSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.2c0-.9.3-1.5 1.6-1.5h1.7V5.1c-.3 0-1.3-.1-2.5-.1-2.4 0-4 1.4-4 4.2V11H7.5v3h2.8v8h3.2Z"/></svg>';
  var youtubeSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21.6 7.2c-.2-1-.9-1.8-1.8-2-1.6-.4-7.8-.4-7.8-.4s-6.2 0-7.8.4c-1 .2-1.6 1-1.8 2C2 8.9 2 12 2 12s0 3.1.4 4.8c.2 1 .9 1.8 1.8 2 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c1-.2 1.6-1 1.8-2 .4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>';

  function styleSocialSvg(el, size) {
    el.style.color = '#fff';
    var svg = el.querySelector('svg');
    if (!svg) return;
    svg.style.width = size + 'px';
    svg.style.height = size + 'px';
    svg.style.display = 'block';
    svg.style.fill = 'currentColor';
  }

  function fixSocialIcons() {
    document.querySelectorAll('.footer-social-icons a[aria-label*="Facebook"], .social-float-icons a[aria-label*="Facebook"]').forEach(function (el) {
      el.innerHTML = facebookSvg;
      styleSocialSvg(el, 16);
    });

    document.querySelectorAll('.footer-social-icons span[aria-label*="YouTube"], .social-float-icons span[aria-label*="YouTube"]').forEach(function (el) {
      el.innerHTML = youtubeSvg;
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('background', 'var(--navy)', 'important');
      styleSocialSvg(el, 18);
    });
  }

  function positionSocialFloat() {
    if (!socialFloat) return;
    var isMobile = window.innerWidth <= 640;
    socialFloat.style.setProperty('display', 'block', 'important');
    socialFloat.style.setProperty('right', isMobile ? '14px' : '22px', 'important');
    socialFloat.style.setProperty('bottom', isMobile ? '14px' : '22px', 'important');
    socialFloat.style.setProperty('z-index', '52', 'important');
    if (isMobile) socialFloat.style.setProperty('left', '14px', 'important');
    else socialFloat.style.removeProperty('left');
  }

  fixSocialIcons();
  positionSocialFloat();
  window.addEventListener('resize', function () {
    positionSocialFloat();
    fixSocialIcons();
  });

  if (socialFloat) {
    // Pokazuj przy każdym wejściu na stronę główną, nawet jeśli wcześniej został zamknięty.
    try { sessionStorage.removeItem('artefekt-social-float-dismissed'); } catch (e) {}
    window.setTimeout(function () {
      socialFloat.classList.add('is-visible');
      socialFloat.setAttribute('aria-hidden', 'false');
      fixSocialIcons();
      positionSocialFloat();
    }, 1800);
  }

  if (reduce) return;

  /* ---------- 3. odsłanianie kadrów przy wejściu w kadr ---------- */
  if ('IntersectionObserver' in window) {
    // tylko tam, gdzie kadr nie ma już własnego wejścia z .motion-item —
    // dwie animacje na jednym elemencie wyglądały nerwowo
    var wipeSelector = [
      '.manifesto-image',
      '.process-notebook img',
      '.offer-process-media',
      '.sub-statement figure img'
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

})();