(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const navigation = document.getElementById('site-navigation');
  const toggle = document.querySelector('.nav-toggle');
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const mobile = window.matchMedia('(max-width: 1099px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ambientVideo = document.querySelector('.hero-video');
  const hero = document.querySelector('.hero');

  header.classList.add('nav-ready');

  function setMenu(open, restoreFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    navigation.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open && mobile.matches);
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) links[0]?.focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });

  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });

  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  mobile.addEventListener('change', () => setMenu(false));

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }

  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  function syncAmbientVideo() {
    if (!ambientVideo) return;
    if (reducedMotion.matches) {
      ambientVideo.pause();
      hero?.classList.remove('video-active');
      return;
    }
    ambientVideo.play().catch(() => {
      // The wallpaper remains as a complete visual fallback when autoplay is blocked.
      hero?.classList.remove('video-active');
    });
  }

  if (ambientVideo) {
    ambientVideo.muted = true;
    ambientVideo.playsInline = true;
    ambientVideo.addEventListener('playing', () => hero?.classList.add('video-active'));
    ['error', 'emptied'].forEach(eventName => {
      ambientVideo.addEventListener(eventName, () => hero?.classList.remove('video-active'));
    });
  }

  syncAmbientVideo();
  reducedMotion.addEventListener('change', syncAmbientVideo);

  const trackedSections = links
    .map(link => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  let positions = [];
  let ticking = false;

  function measureSections() {
    positions = trackedSections.map(section => ({
      id: section.id,
      top: section.getBoundingClientRect().top + window.scrollY
    }));
  }

  function updateNavigation() {
    ticking = false;
    const marker = window.scrollY + Math.min(window.innerHeight * .34, 230);
    let current;
    positions.forEach(section => {
      if (section.top <= marker) current = section.id;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = positions.at(-1)?.id;
    }
    links.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleNavigation(measure = false) {
    if (measure) measureSections();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateNavigation);
  }

  measureSections();
  updateNavigation();
  addEventListener('scroll', () => scheduleNavigation(), { passive: true });
  addEventListener('resize', () => scheduleNavigation(true), { passive: true });
  addEventListener('load', () => scheduleNavigation(true), { once: true });
  if (document.fonts) document.fonts.ready.then(() => scheduleNavigation(true));

  // Deep links should render their target immediately instead of waiting for a reveal frame.
  if ('IntersectionObserver' in window && !reducedMotion.matches && !window.location.hash) {
    const revealItems = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });

    revealItems.forEach(item => {
      if (item.getBoundingClientRect().top < window.innerHeight * .92) return;
      item.classList.add('reveal-pending');
      observer.observe(item);
    });

    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      revealItems.forEach(item => item.classList.remove('reveal-pending'));
      observer.disconnect();
    });
  }

  const tiltCards = [...document.querySelectorAll('[data-tilt-card]')];
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function resetTilt(card) {
    card.classList.remove('is-tilting');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.querySelectorAll('[data-tilt-depth]').forEach(item => {
      item.style.transform = 'translateZ(0)';
    });
  }

  tiltCards.forEach(card => {
    let animationFrame;

    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !fineHover.matches || reducedMotion.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        card.classList.add('is-tilting');
        card.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
        card.querySelectorAll('[data-tilt-depth]').forEach(item => {
          const depth = Number(item.dataset.tiltDepth) || 40;
          item.style.transform = `translateZ(${Math.round(depth * .5)}px)`;
        });
      });
    });

    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(animationFrame);
      resetTilt(card);
    });
  });

  reducedMotion.addEventListener('change', event => {
    if (event.matches) tiltCards.forEach(resetTilt);
  });
  fineHover.addEventListener('change', event => {
    if (!event.matches) tiltCards.forEach(resetTilt);
  });

  const copyButton = document.querySelector('.copy-email');
  const status = document.querySelector('.copy-status');
  if (copyButton && window.isSecureContext && navigator.clipboard?.writeText) {
    const icon = copyButton.querySelector('use');
    let resetTimer;
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      copyButton.disabled = true;
      try {
        await navigator.clipboard.writeText('taneryigit.it@gmail.com');
        icon.setAttribute('href', '#i-check');
        status.textContent = 'E-posta adresi kopyalandı.';
        resetTimer = setTimeout(() => {
          icon.setAttribute('href', '#i-copy');
          status.textContent = '';
        }, 2000);
      } catch {
        status.textContent = 'Kopyalanamadı; adresi seçerek kopyalayabilirsiniz.';
      } finally {
        copyButton.disabled = false;
      }
    });
  }
})();
