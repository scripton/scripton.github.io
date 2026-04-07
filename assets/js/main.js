/* =============================================
   Daniel De Schrijver — Portfolio
   main.js
   ============================================= */

(function () {
  'use strict';

  // --- Footer year ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Hero reveal (staggered on load) ---
  function triggerHeroReveals() {
    document.querySelectorAll('.reveal-hero').forEach(function (el) {
      requestAnimationFrame(function () { el.classList.add('visible'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerHeroReveals);
  } else {
    triggerHeroReveals();
  }

  // --- Scroll reveal (IntersectionObserver) ---
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -56px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // Stagger delays for tag groups
  document.querySelectorAll('.skill-tags .tag').forEach(function (el, i) {
    el.style.transitionDelay = (i * 45) + 'ms';
  });
  document.querySelectorAll('.cert-tags .cert-tag').forEach(function (el, i) {
    el.style.transitionDelay = (i * 50) + 'ms';
  });

  // --- Nav scroll style ---
  var siteNav = document.getElementById('siteNav');

  function updateNav() {
    if (siteNav) siteNav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // --- Active nav link via IntersectionObserver ---
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = document.querySelectorAll('section[id]');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(function (section) { sectionObserver.observe(section); });

  // --- Mobile menu ---
  var menuBtn    = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuOpen   = false;

  function openMenu() {
    menuOpen = true;
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    var firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    menuOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    menuBtn.focus();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      menuOpen ? closeMenu() : openMenu();
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

})();
