const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  menuButton.classList.toggle('menu-button--open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    menuButton?.classList.remove('menu-button--open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }),
  { threshold: 0.12 }
);
revealItems.forEach((item) => revealObserver.observe(item));

let ticking = false;
function updateParallax() {
  document.querySelectorAll('[data-parallax]').forEach((element) => {
    const rect = element.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight + rect.height);
    const speed = Number(element.dataset.parallax || 60);
    element.style.setProperty('--parallax-y', `${progress * speed}px`);
  });
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });
updateParallax();

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name') || '';
  const phone = data.get('phone') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Zapytanie ze strony — ${name}`);
  const body = encodeURIComponent(`Imię i nazwisko: ${name}\nTelefon: ${phone}\n\n${message}`);
  window.location.href = `mailto:studio@artefekt.pl?subject=${subject}&body=${body}`;
});
