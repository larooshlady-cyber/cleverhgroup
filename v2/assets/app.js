/* ============================================================
   Clever H: shared behaviour
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

    var hdr = document.querySelector('[data-hdr]');
    function close() {
      nav.classList.remove('is-open');
      if (hdr) hdr.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      if (hdr) hdr.classList.toggle('is-open', open);
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

  /* --- hero video: poster paints first, video attaches right after.
     Muted + playsinline + the muted property set in JS is what lets
     iOS and Chrome autoplay. Paused while off screen. --- */
  function initHeroVideo() {
    var v = document.querySelector('[data-hero-video]');
    if (!v) return;
    if (reduced || (navigator.connection && navigator.connection.saveData)) return;
    var base = (v.getAttribute('data-hero-video') || 'assets/hero-720').replace(/\.(mp4|webm)$/, '');
    if (base === '' || base === 'true') base = 'assets/hero-720';
    v.muted = true; v.defaultMuted = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('autoplay', '');
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
      var s = document.createElement('source');
      s.src = base + '.' + t[0]; s.type = t[1];
      v.appendChild(s);
    });
    v.preload = 'auto';
    v.addEventListener('playing', function () { v.classList.add('is-ready'); }, { once: true });
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    v.load();
    play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) play(); else v.pause();
      }).observe(v);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) play();
    });
  }

  /* --- smooth anchor scroll that respects the fixed header --- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
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

  /* --- shared contact details --- */
  var EMAIL = 'info@cleverhgroup.com';
  var WA = 'https://wa.me/6581891411';
  function waLink(text) { return WA + '?text=' + encodeURIComponent(text); }

  function scrollToForm(topic) {
    var form = document.querySelector('[data-form]');
    var target = document.getElementById('contact');
    if (!form || !target) return;
    if (topic) {
      var sel = form.querySelector('[name="topic"]');
      if (sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.text === topic) sel.value = o.value || o.text; });
    }
    var hdr = document.querySelector('[data-hdr]');
    var y = target.getBoundingClientRect().top + scrollY - (hdr ? hdr.offsetHeight : 0);
    scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(function () {
      var first = form.querySelector('input,select,textarea');
      if (first) first.focus({ preventScroll: true });
    }, reduced ? 0 : 650);
  }

  /* --- Talk to a Specialist: a sheet with WhatsApp, email and the form --- */
  function initSheet() {
    var sheet = document.querySelector('[data-sheet]');
    var triggers = document.querySelectorAll('[data-contact]');
    if (!sheet || !triggers.length || typeof sheet.showModal !== 'function') return;
    var topicEl = sheet.querySelector('[data-sheet-topic]');
    var wa = sheet.querySelector('[data-sheet-wa]');
    var mail = sheet.querySelector('[data-sheet-mail]');
    var formLink = sheet.querySelector('[data-sheet-form]');
    var current = '';

    function open(topic) {
      current = topic || '';
      topicEl.textContent = current ? ' about ' + current : '';
      var hello = 'Hello Clever H Group, I would like to talk to a specialist' + (current ? ' about ' + current : '') + '.';
      wa.href = waLink(hello);
      mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry' + (current ? ': ' + current : '') + ' (cleverhgroup.com)') +
        '&body=' + encodeURIComponent(hello + '\n\n');
      sheet.showModal();
      document.documentElement.classList.add('has-sheet');
    }
    function close() { sheet.close(); }
    sheet.addEventListener('close', function () { document.documentElement.classList.remove('has-sheet'); });

    Array.prototype.forEach.call(triggers, function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        var nav = document.querySelector('[data-nav]');
        if (nav && nav.classList.contains('is-open')) document.querySelector('[data-burger]').click();
        open(t.getAttribute('data-topic'));
      });
    });
    sheet.querySelector('[data-sheet-close]').addEventListener('click', close);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    [wa, mail].forEach(function (a) { a.addEventListener('click', function () { setTimeout(close, 150); }); });
    formLink.addEventListener('click', function (e) {
      e.preventDefault();
      close();
      scrollToForm(current);
    });
  }

  /* --- contact form: no backend, so validate and hand off to the
     visitor's mail app with everything prefilled --- */
  function initForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return;
    var note = form.querySelector('[data-form-note]');
    var to = form.dataset.fallbackEmail || EMAIL;

    function setErr(field, msg) {
      var wrap = field.closest('.field');
      var err = wrap.querySelector('.err');
      if (msg) {
        wrap.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        if (!err) { err = document.createElement('span'); err.className = 'err'; err.id = field.id + '-err'; wrap.appendChild(err); }
        err.textContent = msg;
        field.setAttribute('aria-describedby', err.id);
      } else {
        wrap.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
        if (err) err.remove();
      }
    }
    function check(field) {
      var v = field.value.trim();
      if (field.required && !v) { setErr(field, 'Please fill this in.'); return false; }
      if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setErr(field, 'Please enter a valid email.'); return false; }
      setErr(field, ''); return true;
    }
    form.addEventListener('input', function (e) {
      if (e.target.closest('.is-invalid')) check(e.target);
    });

    form.addEventListener('submit', function (e) {
      var endpoint = form.getAttribute('action');
      if (endpoint && endpoint !== '#') return;
      e.preventDefault();
      var fields = form.querySelectorAll('input,textarea');
      var ok = true, firstBad = null;
      Array.prototype.forEach.call(fields, function (f) {
        if (!check(f)) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (!ok) { firstBad.focus(); return; }

      var d = {};
      Array.prototype.forEach.call(form.elements, function (f) { if (f.name) d[f.name] = f.value.trim(); });
      var topic = d.topic || 'General enquiry';
      var subject = 'Enquiry: ' + topic + ' from ' + d.name;
      var body = [
        'Name: ' + d.name,
        'Email: ' + d.email,
        'Phone: ' + (d.phone || 'not given'),
        'Office location: ' + (d.office || 'not given'),
        'Interested in: ' + topic,
        '',
        d.message
      ].join('\n');
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var waHref = waLink('Hello Clever H Group, this is ' + d.name + '. ' + d.message);

      note.hidden = false;
      note.className = 'form-note';
      note.innerHTML = '<b>Thank you, ' + escapeHtml(d.name.split(' ')[0]) + '. Your email is ready to send.</b>' +
        'We opened your mail app with everything filled in, just press send. ' +
        'If nothing opened, write to <a href="' + href + '">' + to + '</a> or message us on WhatsApp.' +
        '<span class="note-actions"><a class="wa" href="' + waHref + '" target="_blank" rel="noopener">WhatsApp +65 8189 1411</a>' +
        '<a href="' + href + '">Open email again</a></span>';
      window.location.href = href;
    });
  }
  function escapeHtml(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function boot() {
    initHeader(); initNav(); initReveal(); initSpy();
    initCounters(); initHeroVideo(); initSheet(); initAnchors(); initForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
