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

  function initFaqAccordion() {
    const triggers = document.querySelectorAll('[data-faq-trigger]');
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('[data-faq-item]');
        const panel = item ? item.querySelector('[data-faq-panel]') : null;
        if (!item || !panel) return;

        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Close sibling items in the same accordion container
        const list = item.closest('[data-faq-list]');
        if (list) {
          list.querySelectorAll('[data-faq-item]').forEach((other) => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherTrigger = other.querySelector('[data-faq-trigger]');
              const otherPanel = other.querySelector('[data-faq-panel]');
              if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
              if (otherPanel) otherPanel.setAttribute('aria-hidden', 'true');
            }
          });
        }

        const nextState = !isOpen;
        item.classList.toggle('is-open', nextState);
        trigger.setAttribute('aria-expanded', String(nextState));
        panel.setAttribute('aria-hidden', String(!nextState));
      });
    });
  }

  function initPortfolioFilter() {
    const buttons = document.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-categories]');
    if (!buttons.length || !cards.length) return;

    const applyFilter = (filterValue) => {
      const normalized = (filterValue || 'all').toLowerCase();

      buttons.forEach((btn) => {
        const isMatch = (btn.getAttribute('data-filter') || '').toLowerCase() === normalized;
        btn.classList.toggle('is-active', isMatch);
        btn.setAttribute('aria-pressed', String(isMatch));
      });

      cards.forEach((card) => {
        const categories = (card.getAttribute('data-categories') || '').toLowerCase().split(/\s+/);
        const show = normalized === 'all' || categories.includes(normalized);
        card.classList.toggle('is-hidden', !show);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-filter'));
      });
    });

    // Optional URL query parameter pre-filtering (e.g., /work?category=crm)
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('category');
    if (initialCategory) {
      const hasMatchingBtn = Array.from(buttons).some(
        (btn) => (btn.getAttribute('data-filter') || '').toLowerCase() === initialCategory.toLowerCase()
      );
      if (hasMatchingBtn) {
        applyFilter(initialCategory);
      }
    }
  }

  function initContactForm() {
    const form = document.getElementById('nexsora-contact-form');
    if (!form) return;

    const serviceSelect = document.getElementById('inquiry-service');
    const planGroup = document.getElementById('hosting-plan-group');
    const planSelect = document.getElementById('hosting-plan');
    const summaryCard = document.getElementById('selection-summary-card');
    const statusBox = document.getElementById('form-status');
    const submitBtn = document.getElementById('contact-submit-btn');

    const HOSTING_PLANS = {
      'Li-One': {
        name: 'Li-One Plan',
        price: 'Rs. 3,600 / yr',
        specs: ['1 GB Disk Space & 10 GB Bandwidth', '25 Emails & 2 MySQL Databases', '2 Subdomains & 2 FTP Accounts', 'Free SSL + Softaculous + Weekly Backups'],
      },
      'Li-Two': {
        name: 'Li-Two Plan',
        price: 'Rs. 6,600 / yr',
        specs: ['Free .com Domain (1st Year)', '3 GB Disk Space & 30 GB Bandwidth', '50 Emails & 4 MySQL Databases', 'Free SSL + Softaculous + Weekly Backups'],
      },
      'Li-Three': {
        name: 'Li-Three Plan (Most Popular)',
        price: 'Rs. 10,800 / yr',
        specs: ['Free .com Domain (1st Year)', '5 GB Disk Space & 50 GB Bandwidth', '100 Emails & 8 MySQL Databases', 'Free SSL + Softaculous + Weekly Backups'],
      },
      'Li-Four': {
        name: 'Li-Four Plan',
        price: 'Rs. 12,000 / yr',
        specs: ['Free .com Domain (1st Year)', '10 GB Disk Space & 100 GB Bandwidth', '200 Emails & 15 MySQL Databases', 'Free SSL + Softaculous + Weekly Backups'],
      },
      'Li-Five': {
        name: 'Li-Five Plan (Unlimited Scale)',
        price: 'Rs. 15,000 / yr',
        specs: ['Free .com Domain (1st Year)', 'Unlimited Disk, Bandwidth & Emails', '20 MySQL Databases & Unlimited Subdomains/FTP', 'Free SSL + Softaculous + Weekly Backups'],
      },
    };

    const SERVICE_INFO = {
      'web-development': { title: 'Web Development Inquiry', desc: 'Custom web architecture, UI/UX design, technical SEO, and fast edge deployment.' },
      'wordpress': { title: 'WordPress & WooCommerce Build', desc: 'Lightweight custom theme engineering, security hardening, and Core Web Vitals optimization.' },
      'shopify': { title: 'Shopify E-Commerce Store', desc: 'Custom Liquid sections, local & global payment gateways, and checkout conversion optimization.' },
      'custom-web': { title: 'Custom Web Application / Portal', desc: 'Sub-second static edge sites, client portals, and REST/GraphQL API integrations.' },
      'launchpad-web': { title: 'LaunchPad Starter Website', desc: 'Up to 5 custom pages, mobile-responsive UI, WhatsApp lead capture, and SSL deployment.' },
      'business-web': { title: 'Growth Business Platform', desc: 'Multi-page WordPress or custom platform with CMS, CRM form sync, and schema SEO.' },
      'ecommerce-web': { title: 'E-Commerce Commerce Pro', desc: 'Full Shopify or WooCommerce store, payment gateways, shipping, and abandoned-cart flows.' },
      'ai-crm': { title: 'AI Automation & CRM Audit', desc: '20-minute architecture review of your lead response, AI workflows, and CRM pipelines.' },
      'ai-automation': { title: 'Custom AI Chatbot & Automation', desc: 'Catalog-trained Web & WhatsApp AI agents plus automated lead routing and API syncing.' },
      'crm-consulting': { title: 'CRM Platform Consulting', desc: 'Objective selection and roadmap across HubSpot, Zoho CRM, Salesforce, and Dynamics 365.' },
      'hubspot-crm': { title: 'HubSpot CRM Implementation', desc: 'Inbound pipelines, custom properties, chatbot lead sync, and clean legacy migration.' },
      'zoho-crm': { title: 'Zoho CRM / Zoho One Setup', desc: 'Deluge workflow automation, quote/invoice pipelines, and multi-branch reporting.' },
      'salesforce-crm': { title: 'Salesforce Cloud Architecture', desc: 'Sales & Service Cloud objects, Flow automation, permissions, and ERP/API integrations.' },
      'dynamics-365': { title: 'Microsoft Dynamics 365', desc: 'Unified CRM/ERP engagement, Power Automate flows, Microsoft 365 sync, and Power BI.' },
      'web-hosting-bundle': { title: 'Website + Linux Hosting Bundle', desc: 'Full website build paired with managed Linux hosting, free DNS setup, and SSL.' },
    };

    const updateUI = () => {
      const svc = serviceSelect.value;
      const showHosting = svc === 'hosting' || svc === 'web-hosting-bundle';
      planGroup.hidden = !showHosting;

      if (!summaryCard) return;

      if (showHosting) {
        const planKey = planSelect.value || 'Li-Three';
        const plan = HOSTING_PLANS[planKey] || HOSTING_PLANS['Li-Three'];
        const bundleNote = svc === 'web-hosting-bundle'
          ? '<p class="summary-desc">Includes website build + zero-downtime DNS &amp; SSL setup on your selected hosting tier.</p>'
          : '<p class="summary-desc">Instant Linux hosting activation with Free SSL, Softaculous, and weekly backups.</p>';

        summaryCard.innerHTML = `
          <span class="case-badge">Selected Hosting Plan</span>
          <h2 class="summary-title">${plan.name}</h2>
          <div class="summary-price">${plan.price}</div>
          ${bundleNote}
          <ul class="deliverables-list">
            ${plan.specs.map((item) => `<li><span class="spec-check">&#10003;</span><span>${item}</span></li>`).join('')}
          </ul>
        `;
      } else {
        const info = SERVICE_INFO[svc] || SERVICE_INFO['web-development'];
        summaryCard.innerHTML = `
          <span class="case-badge">Selected Scope</span>
          <h2 class="summary-title">${info.title}</h2>
          <p class="summary-desc">${info.desc}</p>
          <ul class="deliverables-list">
            <li><span class="spec-check">&#10003;</span><span>Free 20-Min Strategy Call Included</span></li>
            <li><span class="spec-check">&#10003;</span><span>Clear Fixed-Scope Proposal</span></li>
            <li><span class="spec-check">&#10003;</span><span>Response Within 4 Business Hours</span></li>
          </ul>
        `;
      }
    };

    // Hydrate from URL query params (?plan=... & ?service=...)
    const params = new URLSearchParams(window.location.search);
    const paramPlan = params.get('plan');
    const paramService = params.get('service');

    if (paramPlan && HOSTING_PLANS[paramPlan]) {
      serviceSelect.value = 'hosting';
      planSelect.value = paramPlan;
    } else if (paramService) {
      const hasOption = Array.from(serviceSelect.options).some((opt) => opt.value === paramService);
      if (hasOption) {
        serviceSelect.value = paramService;
      }
    }

    updateUI();
    serviceSelect.addEventListener('change', updateUI);
    planSelect.addEventListener('change', updateUI);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      statusBox.className = 'form-status';
      statusBox.textContent = '';

      const formData = new FormData(form);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        service: String(formData.get('service') || '').trim(),
        plan: planGroup.hidden ? '' : String(formData.get('plan') || '').trim(),
        budget: String(formData.get('budget') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        website_url_hp: String(formData.get('website_url_hp') || '').trim(),
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (payload.name.length < 2) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Please enter your full name (at least 2 characters).';
        return;
      }
      if (!emailRegex.test(payload.email)) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Please enter a valid work email address.';
        return;
      }
      if (payload.phone.length < 7) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Please enter a valid phone or WhatsApp number.';
        return;
      }
      if (payload.message.length < 10) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Please share at least 10 characters about your project or hosting needs.';
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Inquiry...';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          statusBox.className = 'form-status is-success';
          statusBox.textContent = data.message;
          form.reset();
          updateUI();
        } else {
          statusBox.className = 'form-status is-error';
          statusBox.textContent = data.error || 'Please check your inputs and try again.';
        }
      } catch (err) {
        const localRef = `NX-${Date.now().toString(36).toUpperCase()}`;
        statusBox.className = 'form-status is-success';
        statusBox.textContent = `Offline preview mode: Inquiry validated locally (Reference ID: ${localRef}). When deployed on Cloudflare Pages, this submits directly to /api/contact.`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function initNexsoraAiWidget() {
    if (document.querySelector('.ai-widget-root')) return;

    const root = document.createElement('div');
    root.className = 'ai-widget-root';
    root.innerHTML = `
      <div id="nexsora-ai-panel" class="glass-card ai-widget-panel" role="dialog" aria-label="NEXSORA AI Assistant" aria-hidden="true">
        <div class="ai-widget-header">
          <div class="ai-widget-title-wrap">
            <span class="pulse-dot" aria-hidden="true"></span>
            <span>NEXSORA AI Assistant</span>
          </div>
          <button type="button" class="ai-widget-close" data-ai-close aria-label="Close AI Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ai-widget-messages" data-ai-messages>
          <div class="ai-msg ai-msg-bot">
            Hi! I&apos;m the NEXSORA AI Assistant. Ask me about our hosting plans, CRM platforms, WordPress/Shopify builds, or request a quote.
          </div>
        </div>
        <div class="ai-quick-chips">
          <button type="button" class="ai-chip" data-ai-chip="hosting">Compare Hosting Plans</button>
          <button type="button" class="ai-chip" data-ai-chip="crm">Which CRM Fits Best?</button>
          <button type="button" class="ai-chip" data-ai-chip="web">WordPress vs Shopify</button>
          <button type="button" class="ai-chip" data-ai-chip="quote">Get a Custom Quote</button>
        </div>
        <form class="ai-widget-form" data-ai-form>
          <input type="text" class="ai-widget-input" data-ai-input placeholder="Ask about hosting, CRM, AI..." aria-label="Ask NEXSORA AI">
          <button type="submit" class="ai-widget-send">Send</button>
        </form>
      </div>
      <button type="button" class="ai-widget-toggle" data-ai-toggle aria-expanded="false" aria-controls="nexsora-ai-panel">
        <span class="pulse-dot" aria-hidden="true"></span>
        <span>Ask NEXSORA AI</span>
      </button>
    `;

    document.body.appendChild(root);

    const panel = root.querySelector('#nexsora-ai-panel');
    const toggleBtn = root.querySelector('[data-ai-toggle]');
    const closeBtn = root.querySelector('[data-ai-close]');
    const messagesEl = root.querySelector('[data-ai-messages]');
    const formEl = root.querySelector('[data-ai-form]');
    const inputEl = root.querySelector('[data-ai-input]');

    const setOpen = (isOpen) => {
      panel.classList.toggle('is-open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen && inputEl) inputEl.focus();
    };

    toggleBtn.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-open'));
    });

    closeBtn.addEventListener('click', () => {
      setOpen(false);
      toggleBtn.focus();
    });

    const addMessage = (htmlContent, sender) => {
      const msg = document.createElement('div');
      msg.className = `ai-msg ${sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;
      if (sender === 'user') {
        msg.textContent = htmlContent;
      } else {
        msg.innerHTML = htmlContent;
      }
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const getBotReply = (query) => {
      const q = query.toLowerCase();
      if (q.includes('hosting') || q.includes('price') || q.includes('li-')) {
        return 'Our 5 Linux plans run from <strong>Li-One (Rs. 3,600/yr)</strong> to <strong>Li-Five (Rs. 15,000/yr)</strong>. Every plan includes Free SSL, Softaculous, and weekly backups—plus a <strong>Free .com domain</strong> on Li-Two &amp; above. <a href="/hosting">Compare all 5 plans &rarr;</a>';
      }
      if (q.includes('crm') || q.includes('hubspot') || q.includes('zoho') || q.includes('salesforce') || q.includes('dynamics')) {
        return '<strong>HubSpot</strong> excels for inbound sales, <strong>Zoho CRM</strong> offers top SME value, <strong>Salesforce</strong> scales for complex enterprise pipelines, and <strong>Dynamics 365</strong> fits Microsoft 365/ERP stacks. <a href="/services/ai-crm">Explore AI &amp; CRM &rarr;</a>';
      }
      if (q.includes('wordpress') || q.includes('shopify') || q.includes('web')) {
        return 'Pick <strong>WordPress</strong> for flexible corporate sites or WooCommerce catalogs, and <strong>Shopify</strong> for fast-scaling retail e-commerce with built-in checkout. <a href="/services/web-development">Explore Web Services &rarr;</a>';
      }
      if (q.includes('ai') || q.includes('bot') || q.includes('whatsapp')) {
        return 'We build custom AI chatbots trained on your catalogs &amp; SOPs for Web and WhatsApp, synced directly to your CRM. <a href="/services/ai-crm">See AI Solutions &rarr;</a>';
      }
      return 'Tell us what you want to build, automate, or host and our team will reply within 4 business hours. <a href="/contact">Get a Custom Quote &rarr;</a>';
    };

    root.querySelectorAll('[data-ai-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.getAttribute('data-ai-chip');
        const label = chip.textContent;
        addMessage(label, 'user');
        if (key === 'quote') {
          addMessage('Ready to start? Fill out our quick project or hosting form and receive a response within 4 business hours. <a href="/contact">Open Quote Form &rarr;</a>', 'bot');
        } else {
          addMessage(getBotReply(key), 'bot');
        }
      });
    });

    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      inputEl.value = '';
      addMessage(getBotReply(text), 'bot');
    });
  }

  function initLiquidAurora() {
    if (document.querySelector('.liquid-aurora')) return;
    const aurora = document.createElement('div');
    aurora.className = 'liquid-aurora';
    aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = `
      <span class="aurora-orb aurora-orb-1"></span>
      <span class="aurora-orb aurora-orb-2"></span>
      <span class="aurora-orb aurora-orb-3"></span>
      <span class="aurora-orb aurora-orb-4"></span>
      <span class="aurora-grid"></span>
    `;
    document.body.prepend(aurora);
  }

  function initSmoothReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grids = document.querySelectorAll('.bento-grid');
    if (!grids.length) return;

    const targets = [];
    grids.forEach((grid) => {
      const items = grid.querySelectorAll('.glass-card, .glass-card-dark, .section-header');
      items.forEach((el, index) => {
        if (el.closest('header') || el.closest('.ai-widget-root')) return;
        const delayMs = (index % 4) * 60;
        el.classList.add('reveal-item');
        el.style.transitionDelay = `${delayMs}ms`;
        targets.push(el);
      });
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLiquidAurora();
    initActiveRoute();
    initServicesDropdown();
    initMobileDrawer();
    initSmoothScroll();
    initFaqAccordion();
    initPortfolioFilter();
    initContactForm();
    initNexsoraAiWidget();
    initSmoothReveal();
  });
})();

