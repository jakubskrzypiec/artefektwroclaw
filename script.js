const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('nav-open');
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});
navLinks.forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('nav-open'); menuButton.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
}));

const reveals = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((items) => items.forEach((item) => {
  if (item.isIntersecting) item.target.classList.add('is-visible');
}), { threshold: 0.12 });
reveals.forEach((item) => observer.observe(item));

const parallax = document.querySelectorAll('[data-parallax]');
let frame = 0;
function refreshParallax() {
  parallax.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const speed = Number(element.dataset.parallax || 40);
    const ratio = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) / (window.innerHeight + rect.height);
    element.style.setProperty('--scroll-shift', `${Math.max(-1, Math.min(1, ratio)) * speed}px`);
  });
  frame = 0;
}
window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(refreshParallax); }, { passive: true });
refreshParallax();

const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dots button');
let active = 0;
function showSlide(index) {
  active = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle('active', position === active));
  dots.forEach((dot, position) => dot.classList.toggle('active', position === active));
}
dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
setInterval(() => showSlide(active + 1), 5200);

document.querySelectorAll('.faq-item button').forEach((button) => button.addEventListener('click', () => {
  const item = button.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach((entry) => { entry.classList.remove('open'); entry.querySelector('button').setAttribute('aria-expanded', 'false'); entry.querySelector('b').textContent = '+'; });
  if (!isOpen) { item.classList.add('open'); button.setAttribute('aria-expanded', 'true'); button.querySelector('b').textContent = '−'; }
}));

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name') || '';
  const contact = data.get('contact') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Zapytanie ze strony — ${name}`);
  const body = encodeURIComponent(`Imię i nazwisko: ${name}\nTelefon lub e-mail: ${contact}\n\n${message}`);
  window.location.href = `mailto:studio@artefekt.pl?subject=${subject}&body=${body}`;
});
