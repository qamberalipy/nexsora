/**
 * NEXSORA Shared Navigation & Shell Behavior
 * - Active route highlighter
 * - Mobile glass drawer toggle
 * - Services dropdown accessibility
 * - Smooth scroll for anchor links
 */
(function () {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    let clean = pathname.replace(/\/index\.html$/i, '');
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean || '/';
  }

  function initActiveRoute() {
    const currentPath = normalizePath(window.location.pathname);

    // Highlight matching nav links across desktop, dropdown, and mobile drawer
    const navLinks = document.querySelectorAll('[data-route]');
    navLinks.forEach((link) => {
      const target = normalizePath(link.getAttribute('data-route'));
      if (target === currentPath) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });

    // Highlight Services dropdown trigger when on any /services/* route
    const servicesTrigger = document.querySelector('[data-services-trigger]');
    if (servicesTrigger) {
      if (currentPath.startsWith('/services/')) {
        servicesTrigger.classList.add('is-active');
      } else {
        servicesTrigger.classList.remove('is-active');
      }
    }
  }

  function initServicesDropdown() {
    const dropdown = document.querySelector('[data-dropdown]');
    const trigger = document.querySelector('[data-services-trigger]');
    const menu = document.querySelector('[data-dropdown-menu]');
    if (!dropdown || !trigger || !menu) return;

    const setOpen = (isOpen) => {
      dropdown.classList.toggle('is-open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextState = !dropdown.classList.contains('is-open');
      setOpen(nextState);
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        const firstItem = menu.querySelector('a');
        if (firstItem) firstItem.focus();
      } else if (event.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    menu.addEventListener('keydown', (event) => {
      const items = Array.from(menu.querySelectorAll('a'));
      const currentIndex = items.indexOf(document.activeElement);

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = items[(currentIndex + 1) % items.length];
        if (next) next.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = items[(currentIndex - 1 + items.length) % items.length];
        if (prev) prev.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        setOpen(false);
      }
    });
  }

  function initMobileDrawer() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const drawer = document.querySelector('[data-mobile-drawer]');
    if (!toggle || !drawer) return;

    const setOpen = (isOpen) => {
      drawer.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));
    };

    toggle.addEventListener('click', () => {
      const nextState = !drawer.classList.contains('is-open');
      setOpen(nextState);
    });

    // Close drawer on Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close drawer when clicking a link inside it
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Reset drawer on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && drawer.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initActiveRoute();
    initServicesDropdown();
    initMobileDrawer();
    initSmoothScroll();
  });
})();

