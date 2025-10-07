// Copy current page URL
const copyBtn = document.getElementById('btn-copy');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const prev = document.getElementById('copy-toast');
      if (prev) prev.remove();
      const toast = document.createElement('div');
      toast.id = 'copy-toast';
      toast.className = 'fixed bottom-4 right-4 z-50 rounded-md bg-gray-900 text-white px-3 py-2 text-sm shadow-soft';
      toast.textContent = 'URL copied to clipboard';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    } catch (e) {
      alert('Unable to copy URL');
    }
  });
}

// Placeholder for Event Brief modal (to be implemented next)
const briefBtn = document.getElementById('btn-brief');
if (briefBtn) {
  briefBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Event Brief modal coming next.');
  });
}

// Mobile nav toggle with animation
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    if (isHidden) {
      // trigger entrance animation
      mobileMenu.classList.remove('menu-animate-in');
      // force reflow to restart animation
      void mobileMenu.offsetWidth;
      mobileMenu.classList.add('menu-animate-in');
    }
    navToggle.setAttribute('aria-expanded', String(isHidden));
  });
  // Close menu on link click
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Hero parallax for decorative layers (respects reduced motion)
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const hero = document.getElementById('hero');
  if (!hero) return;
  const layers = hero.querySelectorAll('[data-depth]');
  if (!layers.length) return;

  let rect = hero.getBoundingClientRect();
  const updateRect = () => { rect = hero.getBoundingClientRect(); };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const move = (x, y) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clamp((x - cx) / (rect.width / 2), -1, 1);
    const dy = clamp((y - cy) / (rect.height / 2), -1, 1);
    layers.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-depth') || '0');
      const tx = dx * depth * 24; // px
      const ty = dy * depth * 18; // px
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      el.style.transition = 'transform 120ms ease-out';
      el.style.willChange = 'transform';
    });
  };

  const onPointer = (e) => {
    if (!rect.width || !rect.height) updateRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    move(x, y);
  };

  window.addEventListener('resize', updateRect, { passive: true });
  hero.addEventListener('mousemove', onPointer, { passive: true });
  hero.addEventListener('touchmove', onPointer, { passive: true });
})();
