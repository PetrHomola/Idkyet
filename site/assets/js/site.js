/* CIRUS Origin website behaviour, shared by the landing, methodology, data and offer pages.
   Classic deferred script, no dependencies, no network requests. Everything here is progressive
   enhancement: the pages are complete and readable without it. The inline snippet in <head> adds
   class "js" to <html>; only then does site.css collapse the mobile navigation behind the menu button.

   - mobile menu (.menu-btn)
   - table of contents highlight on document pages
   - contact form: prepares a mailto: message, nothing is sent to a server
   - print button on the offer sheet
   - SHA-256 of the offline calculator on request ([data-hash-src]), computed locally in the browser */
(function () {
  'use strict';

  var root = document.documentElement;
  var lang = (root.getAttribute('lang') || 'cs').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'cs';
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------ header */

  function initHeader() {
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;

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
    var wide = mq('(min-width: 1080px)');
    if (wide.addEventListener) wide.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
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

  // SHA-256 of a published file (the offline calculator), computed here in the browser on request,
  // so IT can compare it with the hash of the copy they downloaded.
  var HASH_TEXT = {
    cs: { busy: 'Počítám…', fail: 'Otisk se nepodařilo spočítat. Spočítejte ho ze staženého souboru příkazem níže.' },
    en: { busy: 'Calculating…', fail: 'The hash could not be calculated. Compute it from the downloaded file with the command below.' },
  };
  function initHash() {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || !window.fetch) return;
    $$('[data-hash-src]').forEach(function (box) {
      var btn = box.querySelector('.hash__btn');
      var out = box.querySelector('.hash__v');
      if (!btn || !out) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = HASH_TEXT[lang].busy;
        fetch(box.getAttribute('data-hash-src'), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
          .then(function (buf) { return subtle.digest('SHA-256', buf); })
          .then(function (d) {
            out.textContent = Array.prototype.map.call(new Uint8Array(d), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join('');
            out.hidden = false;
            btn.hidden = true;
          })
          .catch(function () {
            out.textContent = HASH_TEXT[lang].fail;
            out.hidden = false;
            btn.disabled = false;
            btn.textContent = label;
          });
      });
    });
  }

  function safe(fn) {
    try { fn(); } catch (err) { if (window.console && console.warn) console.warn('site.js:', err); }
  }

  function init() {
    safe(initHeader);
    safe(initToc);
    safe(initContactForm);
    safe(initPrint);
    safe(initHash);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
