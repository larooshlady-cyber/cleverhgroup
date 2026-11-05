/* ============================================================
   Clever H, shared behaviour
   Deliberately small. No scroll-position reads in a scroll
   handler: header state and nav highlighting both use
   IntersectionObserver, so nothing forces synchronous layout.
   ============================================================ */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- header: stuck state via a sentinel, not scrollY --- */
  function initHeader() {
    var hdr = document.querySelector('[data-hdr]');
    if (!hdr) return;
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) {
      hdr.classList.toggle('is-stuck', !e[0].isIntersecting);
    }).observe(sentinel);
  }

  /* --- mobile nav --- */
  function initNav() {
    var burger = document.querySelector('[data-burger]');
    var nav = document.querySelector('[data-nav]');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    addEventListener('resize', function () {
      if (innerWidth > 900) close();
    }, { passive: true });
  }

  /* --- reveal on enter; unobserve immediately after --- */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal,[data-stagger]');
    if (!targets.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* --- active section link, observer-based --- */
  function initSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-spy] a[href^="#"]'));
    if (!links.length) return;
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; sections.push(el); }
    });
    if (!sections.length) return;
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target.id);
        else visible.delete(en.target.id);
      });
      var current = sections.filter(function (s) { return visible.has(s.id); })[0];
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (current && map[current.id]) map[current.id].setAttribute('aria-current', 'true');
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* --- count-up, runs once per element --- */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (reduced) {
      els.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var prefix = el.dataset.prefix || '';
        var dur = 1100, t0 = 0;
        requestAnimationFrame(function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target % 1 ? (target * eased).toFixed(1) : Math.round(target * eased);
          el.textContent = prefix + val + suffix;
          if (p < 1) requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- hero video: poster paints first, video attaches after load --- */
  function initHeroVideo() {
    var v = document.querySelector('[data-hero-video]');
    if (!v) return;
    if (reduced || (navigator.connection && navigator.connection.saveData)) return;
    var src = v.dataset.heroVideo;
    if (!src) return;
    var start = function () {
      var s = document.createElement('source');
      s.src = src; s.type = 'video/mp4';
      v.appendChild(s);
      v.load();
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      v.addEventListener('playing', function () { v.classList.add('is-ready'); }, { once: true });
    };
    if (document.readyState === 'complete') requestIdleCallbackShim(start);
    else addEventListener('load', function () { requestIdleCallbackShim(start); }, { once: true });
  }
  function requestIdleCallbackShim(fn) {
    (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(fn, { timeout: 1500 });
  }

  /* --- smooth anchor scroll that respects the fixed header --- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var hdr = document.querySelector('[data-hdr]');
      var offset = hdr ? hdr.offsetHeight : 0;
      var y = el.getBoundingClientRect().top + scrollY - offset;
      scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  }

  /* --- contact form: no backend, so hand off to the visitor's mail app --- */
  function initForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var to = form.dataset.fallbackEmail || 'info@cleverhgroup.com';
      var get = function (n) { var f = form.elements[n]; return f && f.value ? f.value.trim() : ''; };
      var body = [['Name', get('name')], ['Email', get('email')], ['Phone', get('phone')],
        ['Office location', get('office')], ['Message', get('message')]]
        .filter(function (r) { return r[1]; })
        .map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      var subject = 'Enquiry from ' + (get('email') || 'cleverhgroup.com');
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var note = form.querySelector('[data-form-note]');
      if (note) {
        note.hidden = false;
        note.innerHTML = 'Your mail app should open with the message ready to send. ' +
          'Prefer chat? <a href="https://wa.me/6581891411" target="_blank" rel="noopener">WhatsApp us</a>.';
      }
    });
  }

  function boot() {
    initHeader(); initNav(); initReveal(); initSpy();
    initCounters(); initHeroVideo(); initAnchors(); initForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
