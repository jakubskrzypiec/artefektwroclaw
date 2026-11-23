(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || form.dataset.sending === 'true') return;
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const data = new FormData(form);
    if (data.get('_honey')) return;
    data.set('_subject', `Zapytanie ze strony Artefekt — ${data.get('name')}`);
    form.dataset.sending = 'true';
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    status.textContent = 'Wysyłamy wiadomość…';
    status.classList.remove('is-error');
    try {
      const response = await fetch('https://formsubmit.co/ajax/studio@artefekt.pl', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission rejected');
      status.textContent = 'Dziękujemy, wiadomość została przyjęta do wysyłki. Odpowiadamy w ciągu 2 dni roboczych.';
      form.reset();
    } catch {
      status.textContent = 'Nie udało się potwierdzić wysłania wiadomości. Twoje dane pozostały w formularzu. Spróbuj ponownie albo napisz na studio@artefekt.pl lub zadzwoń: 693 294 393.';
      status.classList.add('is-error');
    } finally {
      clearTimeout(timer);
      form.dataset.sending = 'false';
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      status.focus({ preventScroll: true });
    }
  });

  // No Google request is made before a visitor explicitly allows the map.
  const storageKey = 'artefekt-google-maps';
  let allowed = false;
  try { allowed = localStorage.getItem(storageKey) === 'allowed'; } catch {}
  const maps = [...document.querySelectorAll('[data-map]')];
  const placeholders = maps.map(map => map.innerHTML);
  const loadMaps = () => {
    maps.forEach(map => {
      if (map.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.title = 'Showroom Artefekt — Zwycięska 3, Wrocław';
      iframe.src = 'https://maps.google.com/maps?q=Zwyci%C4%99ska%203%20Wroc%C5%82aw&output=embed';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer';
      iframe.allowFullscreen = true;
      map.replaceChildren(iframe);
    });
  };
  const allowMaps = () => {
    allowed = true;
    try { localStorage.setItem(storageKey, 'allowed'); } catch {}
    loadMaps();
  };
  document.addEventListener('click', event => {
    if (event.target.closest('[data-load-map]')) allowMaps();
    if (event.target.closest('[data-map-settings]')) {
      allowed = false;
      try { localStorage.removeItem(storageKey); } catch {}
      maps.forEach((map, i) => { map.innerHTML = placeholders[i]; });
      let notice = document.querySelector('.map-settings-notice');
      if (!notice) {
        notice = document.createElement('p');
        notice.className = 'map-settings-notice';
        notice.setAttribute('role', 'status');
        document.body.append(notice);
      }
      notice.textContent = 'Mapy Google są wyłączone. Możesz włączyć je przyciskiem „Pokaż mapę Google” w sekcji kontaktu.';
      setTimeout(() => notice.remove(), 6000);
    }
  });
  if (allowed) loadMaps();
})();
