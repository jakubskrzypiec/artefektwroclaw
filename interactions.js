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

  /* ---------- social popup + ikony stopki ---------- */
  var socialFloat = document.querySelector('[data-social-float]');

  var footerIcons = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.35" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.35" cy="6.85" r="1.05" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.7 20v-7h2.35l.35-2.75h-2.7V8.5c0-.8.22-1.35 1.38-1.35H16.6V4.7c-.26-.04-1.16-.1-2.2-.1-2.17 0-3.65 1.32-3.65 3.76v1.89H8.3V13h2.45v7h2.95Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14.1 4.2h2.15c.2 1.45 1.02 2.5 2.55 3.1v2.15a6.8 6.8 0 0 1-2.55-.85v5.65a5.1 5.1 0 1 1-5.1-5.1c.3 0 .58.02.85.07v2.3a2.8 2.8 0 1 0 1.95 2.67V4.2h.15Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.55 7.15c-.22-.82-.86-1.46-1.68-1.68C17.38 5.07 12 5.07 12 5.07s-5.38 0-6.87.4c-.82.22-1.46.86-1.68 1.68C3.05 8.64 3.05 12 3.05 12s0 3.36.4 4.85c.22.82.86 1.46 1.68 1.68 1.49.4 6.87.4 6.87.4s5.38 0 6.87-.4c.82-.22 1.46-.86 1.68-1.68.4-1.49.4-4.85.4-4.85s0-3.36-.4-4.85Z"/><path fill="#0b3342" d="m10.2 15.2 4.9-3.2-4.9-3.2v6.4Z"/></svg>'
  };

  function normalizeFooterIcon(el, svg) {
    if (!el) return;
    el.innerHTML = svg;
    el.style.setProperty('display', 'grid', 'important');
    el.style.setProperty('place-items', 'center', 'important');
    el.style.setProperty('width', '38px', 'important');
    el.style.setProperty('height', '38px', 'important');
    el.style.setProperty('min-width', '38px', 'important');
    el.style.setProperty('min-height', '38px', 'important');
    el.style.setProperty('padding', '0', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('border', '1px solid rgba(255,255,255,.22)', 'important');
    el.style.setProperty('border-radius', '50%', 'important');
    el.style.setProperty('background', 'rgba(255,255,255,.04)', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('filter', 'none', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('color', '#fff', 'important');
    el.style.setProperty('transform', 'none', 'important');
    var svgEl = el.querySelector('svg');
    if (svgEl) {
      svgEl.style.setProperty('display', 'block', 'important');
      svgEl.style.setProperty('width', '16px', 'important');
      svgEl.style.setProperty('height', '16px', 'important');
      svgEl.style.setProperty('overflow', 'visible', 'important');
      svgEl.style.setProperty('filter', 'none', 'important');
      svgEl.style.setProperty('opacity', '1', 'important');
    }
  }

  function normalizeFloatYoutube(el) {
    if (!el) return;
    el.innerHTML = footerIcons.youtube;
    el.style.setProperty('display', 'grid', 'important');
    el.style.setProperty('place-items', 'center', 'important');
    el.style.setProperty('width', '36px', 'important');
    el.style.setProperty('height', '36px', 'important');
    el.style.setProperty('border-radius', '11px', 'important');
    el.style.setProperty('background', 'var(--navy)', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('filter', 'none', 'important');
    el.style.setProperty('color', '#fff', 'important');
    var svgEl = el.querySelector('svg');
    if (svgEl) {
      svgEl.style.setProperty('display', 'block', 'important');
      svgEl.style.setProperty('width', '17px', 'important');
      svgEl.style.setProperty('height', '17px', 'important');
      svgEl.style.setProperty('filter', 'none', 'important');
      svgEl.style.setProperty('opacity', '1', 'important');
    }
  }

  function rebuildSocialIcons() {
    document.querySelectorAll('.footer-social-icons').forEach(function (group) {
      normalizeFooterIcon(group.querySelector('[aria-label="Instagram"]'), footerIcons.instagram);
      normalizeFooterIcon(group.querySelector('[aria-label="Facebook"]'), footerIcons.facebook);
      normalizeFooterIcon(group.querySelector('[aria-label="TikTok"]'), footerIcons.tiktok);
      normalizeFooterIcon(group.querySelector('[aria-label*="YouTube"]'), footerIcons.youtube);
    });
    document.querySelectorAll('.social-float-icons [aria-label*="YouTube"]').forEach(normalizeFloatYoutube);
  }

  rebuildSocialIcons();

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

  positionSocialFloat();
  window.addEventListener('resize', function () {
    positionSocialFloat();
    rebuildSocialIcons();
  });

  if (socialFloat) {
    try { sessionStorage.removeItem('artefekt-social-float-dismissed'); } catch (e) {}
    window.setTimeout(function () {
      socialFloat.classList.add('is-visible');
      socialFloat.setAttribute('aria-hidden', 'false');
      positionSocialFloat();
      rebuildSocialIcons();
    }, 1800);
  }

  if (reduce) return;

  /* ---------- 3. odsłanianie kadrów przy wejściu w kadr ---------- */
  if ('IntersectionObserver' in window) {
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
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) return;
        el.classList.add('fx-wipe');
        pendingWipes.push(el);
        wipeObserver.observe(el);
      });
    };

    registerWipes(document);

    window.setTimeout(function () {
      document.querySelectorAll('.fx-wipe:not(.fx-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) el.classList.add('fx-in');
      });
    }, 6000);

    var gallery = document.querySelector('[data-project-gallery]');
    if (gallery && 'MutationObserver' in window) {
      new MutationObserver(function () { registerWipes(gallery); })
        .observe(gallery, { childList: true });
    }
  }

})();
