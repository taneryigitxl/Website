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

  const particleCanvas = document.querySelector('[data-page-particles]');
  const particleContext = particleCanvas?.getContext('2d');

  if (particleCanvas && particleContext) {
    const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const pointer = { x: null, y: null, radius: 150 };
    const frameInterval = 1000 / 30;
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;
    let connectionDistance = 136;
    let particleFrame;
    let scrollFrame;
    let resizeTimer;
    let lastParticleFrame = 0;
    let particlesVisible = false;
    let particlesRunning = false;

    function createParticles() {
      const mobileDensity = canvasWidth < 768;
      const area = canvasWidth * canvasHeight;
      const count = mobileDensity
        ? Math.min(24, Math.max(14, Math.floor(area / 22000)))
        : Math.min(54, Math.max(28, Math.floor(area / 26000)));

      connectionDistance = mobileDensity ? 108 : 136;
      pointer.radius = mobileDensity ? 112 : 150;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - .5) * .28,
        vy: (Math.random() - .5) * .28,
        radius: Math.random() * 1.15 + .55
      }));
    }

    function sizeParticleCanvas() {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      particleCanvas.width = Math.round(canvasWidth * pixelRatio);
      particleCanvas.height = Math.round(canvasHeight * pixelRatio);
      particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createParticles();
    }

    function drawParticles(advance = true) {
      particleContext.clearRect(0, 0, canvasWidth, canvasHeight);

      particles.forEach((particle, index) => {
        if (advance) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x <= 0 || particle.x >= canvasWidth) {
            particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
            particle.vx *= -1;
          }
          if (particle.y <= 0 || particle.y >= canvasHeight) {
            particle.y = Math.max(0, Math.min(canvasHeight, particle.y));
            particle.vy *= -1;
          }
        }

        particleContext.beginPath();
        particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        particleContext.fillStyle = 'rgba(197, 167, 255, .48)';
        particleContext.fill();

        if (precisePointer.matches && pointer.x !== null && pointer.y !== null) {
          const pointerX = particle.x - pointer.x;
          const pointerY = particle.y - pointer.y;
          const pointerDistance = Math.hypot(pointerX, pointerY);

          if (pointerDistance < pointer.radius) {
            const proximity = 1 - pointerDistance / pointer.radius;
            particleContext.beginPath();
            particleContext.moveTo(particle.x, particle.y);
            particleContext.lineTo(pointer.x, pointer.y);
            particleContext.strokeStyle = `rgba(197, 167, 255, ${proximity * .2})`;
            particleContext.lineWidth = .75;
            particleContext.stroke();

            if (advance && pointerDistance > 0) {
              const push = proximity * .004;
              particle.vx += (pointerX / pointerDistance) * push;
              particle.vy += (pointerY / pointerDistance) * push;
              const speed = Math.hypot(particle.vx, particle.vy);
              if (speed > .38) {
                particle.vx = particle.vx / speed * .38;
                particle.vy = particle.vy / speed * .38;
              }
            }
          }
        }

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance >= connectionDistance) continue;

          const proximity = 1 - distance / connectionDistance;
          particleContext.beginPath();
          particleContext.moveTo(particle.x, particle.y);
          particleContext.lineTo(other.x, other.y);
          particleContext.strokeStyle = `rgba(155, 108, 255, ${proximity * .105})`;
          particleContext.lineWidth = .65;
          particleContext.stroke();
        }
      });
    }

    function stopParticleAnimation() {
      cancelAnimationFrame(particleFrame);
      particlesRunning = false;
    }

    function animateParticles(timestamp) {
      if (!particlesVisible || document.hidden || reducedMotion.matches) {
        particlesRunning = false;
        return;
      }

      particleFrame = requestAnimationFrame(animateParticles);
      if (timestamp - lastParticleFrame < frameInterval) return;
      lastParticleFrame = timestamp - ((timestamp - lastParticleFrame) % frameInterval);
      drawParticles(true);
    }

    function startParticleAnimation() {
      if (particlesRunning || !particlesVisible || document.hidden || reducedMotion.matches) return;
      particlesRunning = true;
      lastParticleFrame = 0;
      particleFrame = requestAnimationFrame(animateParticles);
    }

    function updateParticleVisibility() {
      scrollFrame = undefined;
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      const visibleFrom = Math.max(0, Math.min(canvasHeight, heroBottom));
      particleCanvas.style.clipPath = `inset(${visibleFrom}px 0 0 0)`;
      particlesVisible = visibleFrom < canvasHeight;

      if (reducedMotion.matches) {
        stopParticleAnimation();
        drawParticles(false);
      } else if (particlesVisible) {
        startParticleAnimation();
      } else {
        stopParticleAnimation();
      }
    }

    function scheduleParticleVisibility() {
      if (scrollFrame !== undefined) return;
      scrollFrame = requestAnimationFrame(updateParticleVisibility);
    }

    addEventListener('pointermove', event => {
      if (!precisePointer.matches || event.pointerType !== 'mouse') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      pointer.x = null;
      pointer.y = null;
    });

    addEventListener('scroll', scheduleParticleVisibility, { passive: true });
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeParticleCanvas();
        updateParticleVisibility();
      }, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopParticleAnimation();
      else updateParticleVisibility();
    });

    reducedMotion.addEventListener('change', updateParticleVisibility);
    precisePointer.addEventListener('change', event => {
      if (!event.matches) {
        pointer.x = null;
        pointer.y = null;
      }
    });

    sizeParticleCanvas();
    updateParticleVisibility();
  }

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
