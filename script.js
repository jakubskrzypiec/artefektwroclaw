
(() => {
  const body = document.body;

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const revealElements = document.querySelectorAll('.section, .project-card, .info-card, .accordion-item, .cta-band-inner, .page-hero-grid > *, .split-card > *, .contact-grid > *');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.08 });
  revealElements.forEach(el => { el.classList.add('reveal'); observer.observe(el); });

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('[data-slider-dots] button')];
  if (slides.length) {
    let active = 0;
    const showSlide = index => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    setInterval(() => showSlide(active + 1), 5400);
  }

  const featuredHost = document.querySelector('[data-featured-projects]');
  const galleryHost = document.querySelector('[data-project-gallery]');
  const projects = window.ARTEFEKT_PROJECTS || [];

  const makeCard = (project, options = {}) => {
    const buttonMode = options.buttonMode ?? false;
    const wrapper = document.createElement(buttonMode ? 'button' : 'article');
    wrapper.className = `project-card ${project.size || 'medium'}`;
    if (buttonMode) wrapper.type = 'button';
    wrapper.innerHTML = `
      <img src="${project.img}" alt="${project.title}">
      <div class="project-meta">
        <small>${project.type}</small>
        <h3>${project.title}</h3>
      </div>
    `;
    return wrapper;
  };

  if (featuredHost) {
    projects.slice(0, 6).forEach(project => featuredHost.appendChild(makeCard(project)));
  }

  const renderGallery = filter => {
    if (!galleryHost) return;
    galleryHost.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(project => project.category === filter);
    filtered.forEach(project => {
      const card = makeCard(project, { buttonMode: true });
      card.addEventListener('click', () => openLightbox(project));
      galleryHost.appendChild(card);
    });
  };

  const filterButtons = document.querySelectorAll('[data-project-filters] button');
  if (galleryHost) {
    renderGallery('all');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        renderGallery(button.dataset.filter);
      });
    });
  }

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxTitle = document.querySelector('[data-lightbox-title]');
  const lightboxType = document.querySelector('[data-lightbox-type]');
  const lightboxClose = document.querySelector('.lightbox-close');

  const openLightbox = project => {
    if (!lightbox) return;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxImage.src = project.img;
    lightboxImage.alt = project.title;
    lightboxTitle.textContent = project.title;
    lightboxType.textContent = project.type;
    body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  };

  if (lightbox) {
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });
    lightboxClose?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeLightbox();
    });
  }

  document.querySelectorAll('.accordion-item').forEach(item => {
    const button = item.querySelector('button');
    const icon = item.querySelector('b');
    button?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      const list = item.parentElement;
      if (list.classList.contains('compact-accordion') || list.classList.contains('accordion-list')) {
        [...list.children].forEach(entry => {
          entry.classList.remove('is-open');
          entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
          const entryIcon = entry.querySelector('b');
          if (entryIcon) entryIcon.textContent = '+';
        });
      }
      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '−';
      }
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(contactForm);
      const subject = encodeURIComponent(`Zapytanie ze strony Artefekt — ${data.get('name') || ''}`);
      const bodyContent = [
        `Imię i nazwisko: ${data.get('name') || ''}`,
        `E-mail: ${data.get('email') || ''}`,
        `Telefon: ${data.get('phone') || ''}`,
        `Rodzaj inwestycji: ${data.get('type') || ''}`,
        `Lokalizacja: ${data.get('location') || ''}`,
        `Metraż: ${data.get('size') || ''}`,
        '',
        `${data.get('message') || ''}`
      ].join('\n');
      window.location.href = `mailto:studio@artefekt.pl?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
    });
  }
})();
