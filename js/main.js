/* =========================================
   SafeSip — Main JavaScript
   ========================================= */

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── MOBILE BURGER ──
const burger = document.getElementById('navBurger');
if (burger) {
  burger.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (links) {
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '70px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(10,15,30,0.98)';
      links.style.padding = '24px';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    }
  });
}

// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isDecimal = el.dataset.decimal === 'true';
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
  }
  requestAnimationFrame(update);
}

// Intersection Observer for counters
const counters = document.querySelectorAll('.stat-num[data-target]');
if (counters.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.step, .feature-card, .science-block, .testimonial');
if (reveals.length) {
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 80);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revObs.observe(el);
  });
}

// ── HERO DEVICE DEMO ──
const heroStatus = document.getElementById('heroStatus');
const heroBar = document.getElementById('heroBar');
if (heroStatus && heroBar) {
  const states = [
    { text: 'SCANNING…', class: '', barClass: 'safe' },
    { text: 'SAFE', class: '', barClass: 'safe' },
    { text: 'SCANNING…', class: '', barClass: 'safe' },
    { text: '⚠ THREAT', class: 'danger', barClass: 'danger' },
    { text: 'SOS SENT', class: 'danger', barClass: 'danger' },
    { text: 'SAFE', class: '', barClass: 'safe' },
  ];
  let si = 0;
  setInterval(() => {
    si = (si + 1) % states.length;
    const s = states[si];
    heroStatus.textContent = s.text;
    heroStatus.className = 'device-status ' + s.class;
    heroBar.className = 'device-bar ' + s.barClass;
  }, 2000);
}

// ── SMOOTH ANCHOR SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
