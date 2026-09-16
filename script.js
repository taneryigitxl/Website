(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const navigation = document.getElementById('site-navigation');
  const toggle = document.querySelector('.nav-toggle');
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  const mobile = matchMedia('(max-width: 1099px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function setMenu(open, restoreFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    navigation.classList.toggle('is-open', open);
    if (restoreFocus) toggle.focus();
  }

  toggle.hidden = false;
  header.classList.add('nav-ready');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) links[0].focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  header.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!header.contains(document.activeElement)) setMenu(false);
    });
  });
  mobile.addEventListener('change', () => {
    setMenu(false, mobile.matches && navigation.contains(document.activeElement));
  });
  links.forEach(link => link.addEventListener('click', () => {
    if (!mobile.matches) return;
    setMenu(false);
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  }));

  let positions = [];
  let needsMeasure = true;
  let framePending = false;
  let currentSection = '';
  let activationOffset = 120;

  function updateNavigation() {
    framePending = false;
    if (needsMeasure) {
      positions = sections.map(section => ({
        id: section.id,
        top: section.getBoundingClientRect().top + window.scrollY
      }));
      activationOffset = Math.min(window.innerHeight * 0.3, header.offsetHeight + 64);
      needsMeasure = false;
    }
    let active = positions[0]?.id;
    for (const section of positions) {
      if (section.top <= window.scrollY + activationOffset) active = section.id;
    }
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
      active = positions[positions.length - 1]?.id;
    }
    if (!active || active === currentSection) return;
    currentSection = active;
    links.forEach(link => {
      if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleUpdate(measure = false) {
    needsMeasure ||= measure;
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateNavigation);
  }

  addEventListener('scroll', () => scheduleUpdate(), { passive: true });
  addEventListener('resize', () => scheduleUpdate(true), { passive: true });
  addEventListener('load', () => scheduleUpdate(true), { once: true });
  addEventListener('pageshow', () => scheduleUpdate(true));
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => scheduleUpdate(true));
    resizeObserver.observe(document.body);
    resizeObserver.observe(header);
  }
  if (document.fonts) document.fonts.ready.then(() => scheduleUpdate(true));
  scheduleUpdate(true);

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const pending = new Set();
    const reveal = element => {
      element.classList.remove('reveal-pending');
      element.classList.add('reveal-visible');
      pending.delete(element);
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { rootMargin: '0px 0px 40px 0px', threshold: 0 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      pending.add(element);
      element.classList.add('reveal-pending');
      observer.observe(element);
    });
    const revealAll = () => [...pending].forEach(reveal);
    reducedMotion.addEventListener('change', event => {
      if (event.matches) revealAll();
    });
    document.addEventListener('focusin', event => {
      const element = event.target.closest('[data-reveal]');
      if (pending.has(element)) reveal(element);
    });
    // Content remains available even if observation stalls in a background tab.
    setTimeout(revealAll, 12000);
  }

  const copyButton = document.querySelector('.copy-email');
  if (copyButton && window.isSecureContext && navigator.clipboard?.writeText) {
    const status = document.querySelector('.copy-status');
    const icon = copyButton.querySelector('use');
    const email = document.querySelector('.email-channel a').getAttribute('href').slice(7);
    let resetTimer;
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      copyButton.disabled = true;
      status.textContent = '';
      icon.setAttribute('href', '#i-copy');
      try {
        await navigator.clipboard.writeText(email);
        icon.setAttribute('href', '#i-check');
        status.textContent = 'E-posta kopyalandı';
        resetTimer = setTimeout(() => {
          icon.setAttribute('href', '#i-copy');
          status.textContent = '';
        }, 1800);
      } catch {
        status.textContent = 'Kopyalanamadı. E-posta adresini seçerek kopyalayabilirsiniz.';
      } finally {
        copyButton.disabled = false;
      }
    });
  }
})();
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
// Aceternity 3D Card Effect
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.aceternity-container');
  containers.forEach(container => {
    const card = container.querySelector('.aceternity-card');
    if (!card) return;

    let isMouseEntered = false;

    container.addEventListener('mouseenter', () => {
      isMouseEntered = true;
      card.style.transition = 'none';
      const innerItems = card.querySelectorAll('.aceternity-item');
      innerItems.forEach(item => {
        const translateZ = item.getAttribute('data-translate-z') || '50px';
        item.style.transform = \	ranslateZ(\)\;
      });
    });

    container.addEventListener('mousemove', (e) => {
      if (!isMouseEntered) return;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      card.style.transform = \otateY(\deg) rotateX(\deg)\;
    });

    container.addEventListener('mouseleave', () => {
      isMouseEntered = false;
      card.style.transition = 'all 0.5s ease';
      card.style.transform = 'rotateY(0deg) rotateX(0deg)';
      const innerItems = card.querySelectorAll('.aceternity-item');
      innerItems.forEach(item => {
        item.style.transform = 'translateZ(0px)';
      });
    });
  });
});
