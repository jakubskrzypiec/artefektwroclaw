(() => {
  const body = document.body;
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const siteHeader = document.querySelector('.site-header');
  const brandImage = siteHeader?.querySelector('.brand img');

  if (siteHeader) {
    const updateHeaderState = () => {
      const scrolled = window.scrollY > 22;
      siteHeader.classList.toggle('is-scrolled', scrolled);
      if (brandImage) {
        const nextLogo = scrolled ? 'logo-primary.png' : 'logo-white.png';
        if (!brandImage.src.endsWith(nextLogo)) brandImage.src = nextLogo;
      }
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
    };
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }

  const revealItems = document.querySelectorAll('.section-kicker, .intro-main, .service-row, .services-lead, .services-index a, .featured-card, .oversize-card, .process-editorial figure, .home-process-grid li, .home-contact-grid > *, .social-faq-grid > *, .process-list li, .offer-detail-list article, .deliverables-grid > div, .offer-wide-intro > *, .offer-wide-item, .offer-wide-item > *, .offer-process-content > *, .offer-process-media, .contact-layout > *, .accordion-item, .sub-title-hero-inner > *, .sub-gallery-head > *, [data-project-filters] button, .gallery-card, .contact-editorial-head > *, .contact-channel, .contact-brief-aside-inner > *, .contact-brief-form-wrap > *, .contact-social-row a, .contact-studio-meta > *, .contact-signoff-inner > *');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(item => {
      item.classList.add('reveal');
      revealObserver.observe(item);
    });
  }

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('[data-slider-dots] button')];
  const currentSlide = document.querySelector('[data-slide-current]');
  if (slides.length) {
    let activeSlide = 0;
    const showSlide = index => {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeSlide));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeSlide));
      if (currentSlide) currentSlide.textContent = String(activeSlide + 1).padStart(2, '0');
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    window.setInterval(() => showSlide(activeSlide + 1), 5600);
  }

  const projects = window.ARTEFEKT_PROJECTS || [];
  const featuredHost = document.querySelector('[data-featured-projects]');
  if (featuredHost && projects.length) {
    [17, 19, 26, 29, 40, 44].map(index => projects[index]).filter(Boolean).forEach(project => {
      const card = document.createElement('figure');
      card.className = 'featured-card';
      card.innerHTML = `<a href="projekty.html"><img src="${project.img}" alt="${project.title} — projekt Artefekt" loading="lazy"><figcaption><span>${project.title}</span><span>${project.number} ↗</span></figcaption></a>`;
      featuredHost.appendChild(card);
    });
  }

  const galleryHost = document.querySelector('[data-project-gallery]');
  const filterButtons = [...document.querySelectorAll('[data-project-filters] button')];
  let visibleProjects = [...projects];
  let lightboxIndex = 0;

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxTitle = document.querySelector('[data-lightbox-title]');
  const lightboxType = document.querySelector('[data-lightbox-type]');
  const lightboxNumber = document.querySelector('[data-lightbox-number]');

  const showLightboxItem = index => {
    if (!visibleProjects.length || !lightbox) return;
    lightboxIndex = (index + visibleProjects.length) % visibleProjects.length;
    const project = visibleProjects[lightboxIndex];
    lightboxImage.src = project.img;
    lightboxImage.alt = `${project.title} — projekt Artefekt`;
    lightboxTitle.textContent = project.title;
    lightboxType.textContent = 'Artefekt Interior Design';
    lightboxNumber.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(visibleProjects.length).padStart(2, '0')}`;
  };

  const openLightbox = index => {
    if (!lightbox) return;
    showLightboxItem(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  };

  const renderGallery = filter => {
    if (!galleryHost) return;
    visibleProjects = filter === 'all' ? [...projects] : projects.filter(project => project.category === filter);
    galleryHost.innerHTML = '';
    visibleProjects.forEach((project, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-card';
      card.setAttribute('aria-label', `Otwórz: ${project.title}`);
      card.innerHTML = `<img src="${project.img}" alt="${project.title} — wizualizacja Artefekt" loading="lazy"><span>${project.number} · ${project.title}</span>`;
      card.addEventListener('click', () => openLightbox(index));
      galleryHost.appendChild(card);
    });
  };

  if (galleryHost) {
    renderGallery('all');
    filterButtons.forEach(button => button.addEventListener('click', () => {
      filterButtons.forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      renderGallery(button.dataset.filter);
    }));
  }

  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showLightboxItem(lightboxIndex - 1));
  document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showLightboxItem(lightboxIndex + 1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showLightboxItem(lightboxIndex - 1);
    if (event.key === 'ArrowRight') showLightboxItem(lightboxIndex + 1);
  });

  const quotes = [...document.querySelectorAll('.quote')];
  if (quotes.length) {
    let quoteIndex = 0;
    const showQuote = index => {
      quoteIndex = (index + quotes.length) % quotes.length;
      quotes.forEach((quote, itemIndex) => quote.classList.toggle('is-active', itemIndex === quoteIndex));
    };
    document.querySelector('[data-quote-prev]')?.addEventListener('click', () => showQuote(quoteIndex - 1));
    document.querySelector('[data-quote-next]')?.addEventListener('click', () => showQuote(quoteIndex + 1));
  }

  document.querySelectorAll('.accordion-item').forEach(item => {
    const button = item.querySelector('button');
    button?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(entry => {
        entry.classList.remove('is-open');
        entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
        const icon = entry.querySelector('b');
        if (icon) icon.textContent = '+';
      });
      if (willOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        const icon = item.querySelector('b');
        if (icon) icon.textContent = '−';
      }
    });
  });

  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Zapytanie ze strony Artefekt — ${data.get('name') || ''}`);
    const message = [
      `Imię i nazwisko: ${data.get('name') || ''}`,
      `E-mail: ${data.get('email') || ''}`,
      `Telefon: ${data.get('phone') || ''}`,
      `Rodzaj inwestycji: ${data.get('type') || ''}`,
      `Lokalizacja: ${data.get('location') || ''}`,
      `Metraż: ${data.get('size') || ''}`,
      '',
      data.get('message') || ''
    ].join('\n');
    window.location.href = `mailto:studio@artefekt.pl?subject=${subject}&body=${encodeURIComponent(message)}`;
  });
})();
