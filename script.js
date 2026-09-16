(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const siteHeader = document.querySelector('.site-header');
  const brandImage = siteHeader?.querySelector('.brand img');

  /* Header — jeden lekki update na klatkę, bez migania logo na podstronach. */
  if (siteHeader) {
    const forceSolid = body.classList.contains('header-solid') || siteHeader.classList.contains('subpage-header');
    let headerTicking = false;

    const updateHeaderState = () => {
      headerTicking = false;
      const scrolled = forceSolid || window.scrollY > 22;
      siteHeader.classList.toggle('is-scrolled', scrolled);
      if (brandImage) {
        const nextLogo = scrolled ? 'logo-primary.png' : 'logo-white.png';
        if (!brandImage.src.endsWith(nextLogo)) brandImage.src = nextLogo;
      }
    };

    const requestHeaderUpdate = () => {
      if (headerTicking) return;
      headerTicking = true;
      requestAnimationFrame(updateHeaderState);
    };

    updateHeaderState();
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
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

  /* Jednolity reveal: mały dystans, jedno tempo, maks. 3 krótkie opóźnienia. */
  const motionObserver = !reduceMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-motion-visible');
          motionObserver.unobserve(entry.target);
        });
      }, { threshold: 0.07, rootMargin: '0px 0px -5% 0px' })
    : null;

  const registerMotion = (root = document) => {
    const sections = [...(root.querySelectorAll?.('main > section, .site-footer') || [])];
    sections.forEach(section => {
      if (section.classList.contains('motion-section')) return;
      section.classList.add('motion-section');
    });

    const itemSelector = [
      '.section-kicker','.sub-kicker','.intro-main','.service-row','.services-lead','.services-index a',
      '.featured-card','.oversize-card','.process-editorial figure','.home-process-grid li','.home-contact-grid > *',
      '.social-faq-grid > *','.process-list li','.offer-detail-list article','.deliverables-grid > div',
      '.offer-wide-head > *','.offer-wide-item','.offer-wide-item > *','.offer-process-content > *','.offer-process-media',
      '.contact-layout > *','.accordion-item','.sub-title-hero-inner > *','.sub-gallery-head > *','[data-project-filters] button',
      '.gallery-card','.contact-editorial-head > *','.contact-channel','.contact-brief-aside-inner > *',
      '.contact-brief-form-wrap > *','.contact-social-row a','.contact-studio-meta > *','.contact-signoff-inner > *',
      '.footer-grid > *','.footer-bottom > *','.about-v3 .kicker','.about-origin-copy > *','.about-process-grid > *',
      '.about-team-grid > *','.about-showroom-shell > *','.about-why-grid > *','.nb-card'
    ].join(',');

    const items = [...(root.querySelectorAll?.(itemSelector) || [])];
    items.forEach((item, index) => {
      if (item.classList.contains('motion-item')) return;
      item.classList.add('motion-item');
      item.style.setProperty('--motion-delay', `${Math.min(index % 3, 2) * 36}ms`);
      if (motionObserver) motionObserver.observe(item);
      else item.classList.add('is-motion-visible');
    });

    root.querySelectorAll?.('figure,.featured-card,.oversize-card,.gallery-card,.offer-process-media')
      .forEach(el => el.classList.add('motion-media'));
  };

  registerMotion(document);

  /* Hero — czyste przesuwanie zdjęć bez fade/migania. */
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('[data-slider-dots] button')];
  const currentSlide = document.querySelector('[data-slide-current]');
  const sliderHost = document.querySelector('[data-slider]');

  if (slides.length) {
    let activeSlide = 0;
    let sliderTimer = null;
    let transitionLocked = false;
    const transitionMs = 1080;
    const intervalMs = 6200;

    const applySlideState = (nextSlide, direction) => {
      const previousSlide = activeSlide;

      slides.forEach((slide, slideIndex) => {
        slide.classList.remove('is-active', 'is-prev', 'is-next');
        slide.setAttribute('aria-hidden', slideIndex === nextSlide ? 'false' : 'true');

        if (slideIndex === nextSlide) {
          slide.classList.add('is-active');
        } else if (slideIndex === previousSlide) {
          slide.classList.add(direction >= 0 ? 'is-prev' : 'is-next');
        } else {
          slide.classList.add(direction >= 0 ? 'is-next' : 'is-prev');
        }
      });

      activeSlide = nextSlide;
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeSlide));
      if (currentSlide) currentSlide.textContent = String(activeSlide + 1).padStart(2, '0');
    };

    const showSlide = (index, forcedDirection = null) => {
      const nextSlide = (index + slides.length) % slides.length;
      if (nextSlide === activeSlide || transitionLocked) return;

      let direction = forcedDirection;
      if (direction == null) {
        direction = nextSlide > activeSlide ? 1 : -1;
      }

      transitionLocked = true;
      applySlideState(nextSlide, direction);
      window.setTimeout(() => { transitionLocked = false; }, transitionMs);
    };

    const stopAutoplay = () => {
      if (sliderTimer) window.clearInterval(sliderTimer);
      sliderTimer = null;
    };

    const startAutoplay = () => {
      if (reduceMotion || document.hidden || slides.length < 2) return;
      stopAutoplay();
      sliderTimer = window.setInterval(() => showSlide(activeSlide + 1, 1), intervalMs);
    };

    slides.forEach((slide, index) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      slide.classList.add(index === 0 ? 'is-active' : 'is-next');
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });

    dots.forEach((dot, index) => dot.addEventListener('click', () => {
      if (index === activeSlide) return;
      const direction = index > activeSlide ? 1 : -1;
      showSlide(index, direction);
      startAutoplay();
    }));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    sliderHost?.addEventListener('mouseenter', stopAutoplay);
    sliderHost?.addEventListener('mouseleave', startAutoplay);
    sliderHost?.addEventListener('focusin', stopAutoplay);
    sliderHost?.addEventListener('focusout', startAutoplay);
    startAutoplay();
  }

  const projects = window.ARTEFEKT_PROJECTS || [];
  const featuredHost = document.querySelector('[data-featured-projects]');
  if (featuredHost && projects.length) {
    [17, 19, 26, 29, 40, 44].map(index => projects[index]).filter(Boolean).forEach(project => {
      const card = document.createElement('figure');
      card.className = 'featured-card';
      card.innerHTML = `<a href="projekty.html"><img src="${project.img}" alt="${project.title} — projekt Artefekt" loading="lazy" decoding="async"><figcaption><span>${project.title}</span><span>${project.number} ↗</span></figcaption></a>`;
      featuredHost.appendChild(card);
    });
    registerMotion(featuredHost);
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
      card.innerHTML = `<img src="${project.img}" alt="${project.title} — wizualizacja Artefekt" loading="lazy" decoding="async"><span>${project.number} · ${project.title}</span>`;
      card.addEventListener('click', () => openLightbox(index));
      galleryHost.appendChild(card);
    });

    registerMotion(galleryHost);
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

  const syncAccordionPanel = (item, open) => {
    const panel = item.querySelector('.accordion-panel');
    if (!panel) return;
    panel.style.maxHeight = open ? `${panel.scrollHeight + 12}px` : '0px';
  };

  document.querySelectorAll('.accordion-item').forEach(item => {
    const button = item.querySelector('button');
    const panel = item.querySelector('.accordion-panel');
    if (panel) syncAccordionPanel(item, item.classList.contains('is-open'));

    button?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      item.parentElement.querySelectorAll('.accordion-item').forEach(entry => {
        entry.classList.remove('is-open');
        entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
        const icon = entry.querySelector('b');
        if (icon) icon.textContent = '+';
        syncAccordionPanel(entry, false);
      });

      if (willOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        const icon = item.querySelector('b');
        if (icon) icon.textContent = '−';
        requestAnimationFrame(() => syncAccordionPanel(item, true));
      }
    });
  });

  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
      resizeTicking = false;
      document.querySelectorAll('.accordion-item.is-open').forEach(item => syncAccordionPanel(item, true));
    });
  }, { passive: true });

  const socialFloat = document.querySelector('[data-social-float]');
  const socialFloatClose = document.querySelector('[data-social-float-close]');
  if (socialFloat) {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('artefekt-social-float-dismissed') === '1'; } catch (e) {}

    if (!dismissed) {
      window.setTimeout(() => {
        socialFloat.classList.add('is-visible');
        socialFloat.setAttribute('aria-hidden', 'false');
      }, 1800);
    }

    socialFloatClose?.addEventListener('click', () => {
      socialFloat.classList.remove('is-visible');
      socialFloat.setAttribute('aria-hidden', 'true');
      try { sessionStorage.setItem('artefekt-social-float-dismissed', '1'); } catch (e) {}
    });
  }

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
