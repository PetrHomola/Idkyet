/* CIRUS Origin website behaviour, shared by the landing, methodology, data and offer pages.
   Classic deferred script, no dependencies, no network requests. Everything here is progressive
   enhancement: the pages are complete and readable without it. The inline snippet in <head> adds
   class "js" to <html>; only then does site.css hide .reveal elements until they scroll into view.

   - scroll reveal (.reveal -> .is-in), light stagger for elements that appear together
   - Commission example: bars fill and percentages count up once ([data-meters], [data-count])
   - sticky header state (.topbar.is-scrolled) and the mobile menu (.menu-btn)
   - FAQ: smooth open/close fallback for browsers without interpolate-size
   - table of contents highlight on document pages
   - contact form: prepares a mailto: message, nothing is sent to a server
   - print button on the offer sheet, two-letter initials for founder avatars */
(function () {
  'use strict';

  var root = document.documentElement;
  var lang = (root.getAttribute('lang') || 'cs').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'cs';
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------ count-up numbers */

  var numberFormats = {};
  function formatNumber(value, decimals) {
    var key = String(decimals);
    if (!numberFormats[key]) {
      try {
        numberFormats[key] = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'cs-CZ', {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        });
      } catch (e) {
        numberFormats[key] = { format: function (v) { return v.toFixed(decimals); } };
      }
    }
    return numberFormats[key].format(value);
  }

  function countTargets(scope) {
    return $$('[data-count]', scope).map(function (el) {
      return {
        el: el,
        to: parseFloat(el.getAttribute('data-count')) || 0,
        decimals: parseInt(el.getAttribute('data-decimals') || '0', 10) || 0,
        delay: parseFloat(el.getAttribute('data-delay') || '0') || 0,
        final: el.textContent,
      };
    });
  }

  // `after` is the reveal delay of the figure, so the count starts once the figure is fading in.
  function runCount(t, after) {
    var duration = 900;
    var start = null;
    function frame(now) {
      if (start === null) start = now + t.delay + (after || 0);
      var p = Math.min(1, Math.max(0, (now - start) / duration));
      var eased = 1 - Math.pow(1 - p, 4);
      t.el.textContent = p >= 1 ? t.final : formatNumber(t.to * eased, t.decimals);
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------- scroll reveal */

  var pendingCounts = new Map();

  function onRevealed(el, delay) {
    var targets = pendingCounts.get(el);
    if (targets) {
      pendingCounts.delete(el);
      targets.forEach(function (t) { runCount(t, delay); });
    }
  }

  function initReveal() {
    var items = $$('.reveal');
    var animate = !reduceMotion && hasIO;

    if (animate) {
      // Start the counters from zero while their figure is still hidden.
      $$('[data-meters]').forEach(function (fig) {
        var targets = countTargets(fig);
        targets.forEach(function (t) { t.el.textContent = formatNumber(0, t.decimals); });
        pendingCounts.set(fig, targets);
      });
    }

    if (!animate) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      root.classList.add('reveal-armed');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      var shown = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      shown.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      shown.forEach(function (el, i) {
        // Light stagger; an element can fix its own delay (the hero figure must not wait for the text column).
        var fixed = el.getAttribute('data-reveal-delay');
        var delay = fixed !== null ? parseFloat(fixed) || 0 : Math.min(i, 5) * 80;
        if (delay > 0) el.style.setProperty('--reveal-delay', delay + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
        onRevealed(el, delay);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    items.forEach(function (el) { io.observe(el); });
    // Figures with counters that are not themselves .reveal still get their animation.
    pendingCounts.forEach(function (_targets, fig) {
      if (!fig.classList.contains('reveal')) io.observe(fig);
    });
    root.classList.add('reveal-armed');
  }

  /* ------------------------------------------------------ header */

  function initHeader() {
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;

    var ticking = false;
    function update() {
      ticking = false;
      topbar.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 4);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    var btn = topbar.querySelector('.menu-btn');
    var nav = document.getElementById(btn ? btn.getAttribute('aria-controls') : '');
    if (!btn || !nav) return;
    var label = btn.querySelector('.sr-only');
    var labels = lang === 'en' ? ['Open menu', 'Close menu'] : ['Otevřít menu', 'Zavřít menu'];

    function setOpen(open) {
      topbar.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = labels[open ? 1 : 0];
    }
    setOpen(false);
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (topbar.classList.contains('is-open') && !topbar.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && topbar.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });
    var wide = mq('(min-width: 960px)');
    if (wide.addEventListener) wide.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  /* --------------------------------------------------------- FAQ */

  // Browsers with interpolate-size animate <details> in CSS. Elsewhere animate the answer height.
  function initFaq() {
    var cssAnimates = window.CSS && CSS.supports && CSS.supports('interpolate-size', 'allow-keywords');
    if (cssAnimates || reduceMotion || !Element.prototype.animate) return;
    $$('.faq details').forEach(function (details) {
      var summary = details.querySelector('summary');
      var body = details.querySelector('.faq__a');
      if (!summary || !body) return;
      var running = null;
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (running) running.cancel();
        var opening = !details.open;
        if (opening) details.open = true;
        var full = body.scrollHeight;
        var from = opening ? 0 : body.offsetHeight;
        var to = opening ? full : 0;
        body.style.overflow = 'hidden';
        running = body.animate(
          [{ height: from + 'px', opacity: opening ? 0 : 1 }, { height: to + 'px', opacity: opening ? 1 : 0 }],
          { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        running.onfinish = function () {
          running = null;
          body.style.overflow = '';
          if (!opening) details.open = false;
        };
        running.oncancel = function () { body.style.overflow = ''; };
      });
    });
  }

  /* ------------------------------------------- table of contents */

  function initToc() {
    var links = $$('.toc a[href^="#"]');
    if (!links.length) return;
    var items = links.map(function (a) {
      return { link: a, section: document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))) };
    }).filter(function (it) { return it.section; });
    var current = null;
    var ticking = false;
    // The active entry is the last section whose top has passed 30 % of the viewport.
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.3;
      var active = null;
      items.forEach(function (it) { if (it.section.getBoundingClientRect().top <= line) active = it; });
      if (active === current) return;
      if (current) { current.link.classList.remove('is-active'); current.link.removeAttribute('aria-current'); }
      current = active;
      if (current) { current.link.classList.add('is-active'); current.link.setAttribute('aria-current', 'true'); }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------ contact form */

  var FORM_TEXT = {
    cs: {
      name: 'Jméno', company: 'Firma', email: 'E-mail', phone: 'Telefon', topic: 'Zájem', program: 'Program',
      opening: function (to) { return 'Otevíráme váš poštovní program s připravenou zprávou. Pokud se neotevřel, napište nám přímo na ' + to + ' nebo '; },
      again: 'zkuste to znovu',
    },
    en: {
      name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', topic: 'Interested in', program: 'Programme',
      opening: function (to) { return 'Opening your mail program with the prepared message. If nothing opens, write to us directly at ' + to + ' or '; },
      again: 'try again',
    },
  };

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('cf-status');
    if (!form || !status) return;
    var t = FORM_TEXT[lang];
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var v = function (key) { return String(data.get(key) || '').trim(); };
      var to = form.getAttribute('data-to') || '';
      var brand = root.getAttribute('data-brand') || '';
      var subject = [brand, v('topic'), v('company')].filter(Boolean).join(' – ');
      var lines = [v('message'), '', '--', t.name + ': ' + v('name'), t.company + ': ' + v('company'), t.email + ': ' + v('email')];
      if (v('phone')) lines.push(t.phone + ': ' + v('phone'));
      lines.push(t.topic + ': ' + v('topic'), t.program + ': ' + v('program'));
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
      status.textContent = t.opening(to);
      var again = document.createElement('a');
      again.href = href;
      again.textContent = t.again;
      status.append(again, '.');
      window.location.href = href;
    });
  }

  /* ------------------------------------------------------ small bits */

  function initPrint() {
    var btn = document.getElementById('print-btn');
    if (btn) btn.addEventListener('click', function () { window.print(); });
  }

  // "Petr Novák" -> "PN"; placeholder text in [brackets] is ignored.
  function initAvatars() {
    $$('.avatar__i').forEach(function (el) {
      var words = el.textContent.replace(/\[[^\]]*\]?/g, ' ').split(/\s+/).filter(function (w) { return /^\p{L}/u.test(w); });
      if (!words.length) return;
      var initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
      el.textContent = initials;
      el.classList.add('is-set');
    });
  }

  function safe(fn) {
    try { fn(); } catch (err) { if (window.console && console.warn) console.warn('site.js:', err); }
  }

  function init() {
    safe(initReveal);
    safe(initHeader);
    safe(initFaq);
    safe(initToc);
    safe(initContactForm);
    safe(initPrint);
    safe(initAvatars);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
