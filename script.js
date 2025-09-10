// script.js — Éclaïr shared UI
// - Background color transition by section
// - Smooth parallax for hero images (target/current easing)
// - Floating image drift without breaking your scale/rotate reveal
// - Robust hamburger (click-outside, Escape, scroll lock, resize reset)
// - iOS 100vh fix via --vh
// - Time-of-day greeting fade-in
// - Decor images reveal on scroll
// - Smooth anchor scrolling with fixed nav offset

(function () {
  'use strict';

  // Avoid double-init if script is included twice
  if (window.__ECLAIR_INIT__) return;
  window.__ECLAIR_INIT__ = true;

  // ---------------- iOS 100vh fix ----------------
  function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // ---------------- Hamburger ----------------
  function setupHamburger() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const btn = nav.querySelector('.menu-toggle');
    const list = nav.querySelector('.nav-links');
    if (!btn || !list) return;

    const closeMenu = () => {
      list.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open'); // lock/unlock body scroll
    };

    const toggleMenu = (e) => {
      e?.stopPropagation?.();
      const isOpen = list.classList.toggle('show');
      btn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    };

    btn.addEventListener('click', toggleMenu);

    // Close when a link is clicked
    list.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (list.classList.contains('show') && !e.target.closest('nav')) closeMenu();
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Reset on resize (desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  // ---------------- Background color per section ----------------
  function setupBackgroundColorTransition() {
    const sections = document.querySelectorAll('section, header');
    if (!sections.length) return;

    // Feel free to edit palette
    const colors = [
      '#ffe6e6',
      '#9b667b',
      '#ffeaf5',
      '#9b667b'
    ];

    function applyBg() {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      sections.forEach((section, index) => {
        if (section.offsetTop <= scrollPos &&
            section.offsetTop + section.offsetHeight > scrollPos) {
          // Cycle colors if there are more sections than colors
          const color = colors[index % colors.length];
          document.body.style.backgroundColor = color;
        }
      });
    }

    applyBg();
    window.addEventListener('scroll', applyBg, { passive: true });
    window.addEventListener('resize', applyBg);
  }

  // ---------------- Smooth parallax for hero ----------------
  function setupSmoothParallax() {
    const heroImages = document.querySelector('.hero-images');
    if (!heroImages) return;

    let targetOffset = 0;
    let currentOffset = 0;

    function raf() {
      currentOffset += (targetOffset - currentOffset) * 0.1; // easing
      heroImages.style.transform = `translateY(${currentOffset}px)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    function onScroll() {
      targetOffset = Math.min(window.scrollY * 0.4, 120); // cap so it doesn’t drift too far
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------------- Floating images drift (without killing your reveal transforms) ----------------
  function setupFloatingImages() {
    const imgs = document.querySelectorAll('.item img, .decor-img img');
    if (!imgs.length) return;

    function onScroll() {
      const vh = window.innerHeight;
      imgs.forEach((img) => {
        const rect = img.getBoundingClientRect();
        // Smaller factor near viewport center for a soft effect
        const factor = 0.10;
        const move = Math.round(rect.top * factor);

        // Preserve your reveal transforms:
        // - When not yet visible, you had: scale(0.8) rotate(-10deg)
        // - When visible, you had:        scale(1) rotate(0deg)
        // We compose translateY on top of those states.
        const isVisible = img.classList.contains('visible');
        const base = isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)';
        img.style.transform = `translateY(${move}px) ${base}`;
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // ---------------- Greeting (time-of-day) ----------------
  function setupGreeting() {
    const el = document.getElementById('greeting');
    if (!el) return;
    const hour = new Date().getHours();
    let text = 'Welcome to Éclaïr';
    if (hour >= 5 && hour < 12) text = 'Good Morning 🌞🥐✨';
    else if (hour >= 12 && hour < 18) text = 'Good Afternoon 🥂🍰🌿';
    else text = 'Good Evening 🌙🍷🎻';
    el.textContent = text;
    setTimeout(() => el.classList.add('show'), 100);
  }

  // ---------------- Reveal decorative images on scroll ----------------
  function setupDecorReveal() {
    const imgs = document.querySelectorAll('.decor-img img');
    if (!imgs.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); // animate once
        }
      });
    }, { threshold: 0.3 });

    imgs.forEach((img) => obs.observe(img));
  }

  // ---------------- Smooth anchor scroll with fixed nav offset ----------------
  function setupAnchorOffset() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const getOffset = () => nav.getBoundingClientRect().height || 0;

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset() - 6;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    });
  }

  // ---------------- Active link highlight ----------------
  function highlightActiveLink() {
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const links = document.querySelectorAll('nav .nav-links a');
    links.forEach((a) => a.classList.remove('active'));
    const active = Array.from(links).find((a) => {
      const file = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      return file && here === file;
    });
    if (active) active.classList.add('active');
  }

  // ---------------- Init ----------------
  document.addEventListener('DOMContentLoaded', () => {
    setVh();
    setupHamburger();
    setupBackgroundColorTransition();
    setupSmoothParallax();
    setupFloatingImages();
    setupGreeting();
    setupDecorReveal();
    setupAnchorOffset();
    highlightActiveLink();
  });

  window.addEventListener('resize', setVh);
})();
