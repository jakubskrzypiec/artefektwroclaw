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

})();
