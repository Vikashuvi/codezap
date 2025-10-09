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

// Event Brief modal open/close
(() => {
  const briefBtn = document.getElementById('btn-brief');
  const modal = document.getElementById('brief-modal');
  if (!briefBtn || !modal) return;
  const btnClose = document.getElementById('brief-close');
  const btnOk = document.getElementById('brief-ok');
  const backdrop = document.getElementById('brief-backdrop');
  const panel = document.getElementById('brief-panel');

  const open = () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // start from initial state (already set in HTML)
    // animate to visible
    requestAnimationFrame(() => {
      backdrop && backdrop.classList.remove('opacity-0');
      if (panel) {
        panel.classList.remove('opacity-0', 'translate-y-2', 'scale-95');
      }
    });
  };
  const close = () => {
    // animate out
    backdrop && backdrop.classList.add('opacity-0');
    if (panel) {
      panel.classList.add('opacity-0', 'translate-y-2', 'scale-95');
    }
    const done = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      panel && panel.removeEventListener('transitionend', done);
    };
    // hide after transition
    if (panel) {
      panel.addEventListener('transitionend', done, { once: true });
    } else {
      // fallback
      setTimeout(done, 200);
    }
  };

  briefBtn.addEventListener('click', (e) => { e.preventDefault(); open(); });
  btnClose && btnClose.addEventListener('click', close);
  btnOk && btnOk.addEventListener('click', close);
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    // if clicked on the dark overlay (first child) or outside content
    if (e.target === modal || (e.target instanceof Element && e.target.classList.contains('bg-black/40'))) {
      close();
    }
  });
  // Close on Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
})();

// Lenis smooth scrolling with dynamic offset for fixed header
(() => {
  // Skip if Lenis global not present or user prefers reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || typeof window.Lenis === 'undefined') return;

  const header = document.querySelector('header');
  const getOffset = () => {
    const h = header ? header.offsetHeight : 72;
    return h + 12; // little extra space below navbar
  };

  const lenis = new Lenis({
    // default duration/easing produce a subtle, not-overbearing feel
    duration: 1.0,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Route internal anchor clicks through Lenis with offset
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      // ignore just '#'
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -getOffset() });

      // close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      const navToggle = document.getElementById('nav-toggle');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

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

// Enquiry form: submit to Google Apps Script
(() => {
  const form = document.getElementById('enquiry-form');
  if (!form) return;
  const successModal = document.getElementById('success-modal');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button to prevent double submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    
    const formData = new FormData(form);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      role: formData.get('role'),
      org: formData.get('org'),
      message: formData.get('message'),
      sponsorInterest: formData.get('sponsorInterest') === 'on'
    };
    
    console.log('Submitting data:', data);
    
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzVaeaf3aK_yMzVkWOjS2edtWi7JD8XGsUsM3IIeGDyqWbyoq7A4MWPkU2pOWIP7gt7/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response received');
      
      // Show success modal
      showSuccessModal();
      form.reset();
      
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
      }
    }
  });
  
  // Success modal functions
  function showSuccessModal() {
    if (!successModal) return;
    const btnClose = document.getElementById('success-close');
    const btnOk = document.getElementById('success-ok');
    const backdrop = document.getElementById('success-backdrop');
    const panel = document.getElementById('success-panel');

    const open = () => {
      successModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        backdrop && backdrop.classList.remove('opacity-0');
        if (panel) {
          panel.classList.remove('opacity-0', 'translate-y-2', 'scale-95');
        }
      });
    };
    const close = () => {
      backdrop && backdrop.classList.add('opacity-0');
      if (panel) {
        panel.classList.add('opacity-0', 'translate-y-2', 'scale-95');
      }
      const done = () => {
        successModal.classList.add('hidden');
        document.body.style.overflow = '';
        panel && panel.removeEventListener('transitionend', done);
      };
      if (panel) {
        panel.addEventListener('transitionend', done, { once: true });
      } else {
        setTimeout(done, 200);
      }
    };

    open();
    btnClose && btnClose.addEventListener('click', close);
    btnOk && btnOk.addEventListener('click', close);
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal || (e.target instanceof Element && e.target.classList.contains('bg-black/40'))) {
        close();
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !successModal.classList.contains('hidden')) close(); });
  }
})();
