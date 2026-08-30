document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  function updateActiveNav() {
    var y = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) current = sec;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 600);
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (header) onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  function revealNow(el) { el.classList.add('in-view'); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      // Content already in (or above) the initial viewport: show right away —
      // a scroll-triggered animation only makes sense for below-the-fold content,
      // and waiting on IO here risks leaving it stuck invisible.
      if (rect.top < window.innerHeight) {
        revealNow(el);
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(revealNow);
  }

  // Safety net: never leave content permanently hidden if IO misbehaves.
  setTimeout(function () { revealEls.forEach(revealNow); }, 2500);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Contact tabs ---------- */
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var target = btn.getAttribute('data-tab');
      document.querySelectorAll('.form-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
      });
    });
  });

  /* ---------- Forms (no backend — demo confirmation) ---------- */
  function handleForm(formId, successId) {
    var form = document.getElementById(formId);
    var success = document.getElementById(successId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.style.display = 'none';
      success.classList.add('show');
    });
  }
  handleForm('rdvForm', 'rdvSuccess');
  handleForm('msgForm', 'msgSuccess');

  /* ---------- Bascule Formulaire du site / Doctolib ---------- */
  var rdvModeBtns = document.querySelectorAll('.rdv-mode-btn');
  rdvModeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      rdvModeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var target = btn.getAttribute('data-rdvmode');
      document.querySelectorAll('.rdv-mode-content').forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-rdvmode-panel') === target);
      });
    });
  });

  /* ---------- Cookie banner ---------- */
  var cookieBanner = document.getElementById('cookieBanner');
  var manageCookies = document.getElementById('manageCookies');
  var CONSENT_KEY = 'cabinet-artix-cookie-consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; }
  }
  function setConsent(analytics) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: analytics, date: new Date().toISOString() }));
  }

  if (cookieBanner) {
    if (!getConsent()) {
      setTimeout(function () { cookieBanner.classList.add('show'); }, 900);
    }
    var cookieAccept = document.getElementById('cookieAccept');
    var cookieDecline = document.getElementById('cookieDecline');
    if (cookieAccept) cookieAccept.addEventListener('click', function () {
      setConsent(true);
      cookieBanner.classList.remove('show');
      syncCookiePrefUI();
    });
    if (cookieDecline) cookieDecline.addEventListener('click', function () {
      setConsent(false);
      cookieBanner.classList.remove('show');
      syncCookiePrefUI();
    });
    if (manageCookies) {
      manageCookies.addEventListener('click', function (e) {
        e.preventDefault();
        cookieBanner.classList.add('show');
      });
    }
  }

  /* ---------- Page "Gestion des cookies" : interrupteur ---------- */
  function syncCookiePrefUI() {
    var toggle = document.getElementById('analyticsToggle');
    if (!toggle) return;
    var consent = getConsent();
    toggle.checked = !!(consent && consent.analytics);
  }
  var analyticsToggle = document.getElementById('analyticsToggle');
  if (analyticsToggle) {
    syncCookiePrefUI();
    analyticsToggle.addEventListener('change', function () {
      setConsent(analyticsToggle.checked);
    });
  }
  var savePrefsBtn = document.getElementById('saveCookiePrefs');
  if (savePrefsBtn) {
    savePrefsBtn.addEventListener('click', function () {
      var confirmEl = document.getElementById('cookiePrefsSaved');
      if (confirmEl) {
        confirmEl.classList.add('show');
        setTimeout(function () { confirmEl.classList.remove('show'); }, 3000);
      }
    });
  }

  /* ---------- Set min date on RDV date input to today ---------- */
  var rdvDate = document.getElementById('rdvDate');
  if (rdvDate) {
    var today = new Date().toISOString().split('T')[0];
    rdvDate.setAttribute('min', today);
  }

  /* ---------- Pré-remplissage du formulaire de contact via l'URL ---------- */
  var params = new URLSearchParams(window.location.search);
  var wantedTab = params.get('tab');
  if (wantedTab) {
    var tabBtn = document.querySelector('.tab-btn[data-tab="' + wantedTab + '"]');
    if (tabBtn) tabBtn.click();
  }
  var motif = params.get('motif');
  var rdvSoin = document.getElementById('rdvSoin');
  if (motif && rdvSoin) {
    var motifLabels = {
      implant: 'Bilan implantaire',
      esthetique: 'Esthétique du sourire',
      parodontologie: 'Parodontologie',
      urgence: 'Urgence dentaire'
    };
    var label = motifLabels[motif];
    if (label) {
      Array.prototype.forEach.call(rdvSoin.options, function (opt) {
        if (opt.text === label) rdvSoin.value = opt.value;
      });
    }
  }

});
