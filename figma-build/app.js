/* Clever H Group — behaviour.
   Everything observer-driven; nothing reads scroll position in a handler. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header shadow, via a sentinel rather than scrollY */
  var hdr = document.querySelector('[data-hdr]');
  if (hdr) {
    var s = document.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(s);
    new IntersectionObserver(function (e) {
      hdr.classList.toggle('stuck', !e[0].isIntersecting);
    }).observe(s);
  }

  /* mobile nav */
  var burger = document.querySelector('[data-burger]');
  var nav = document.querySelector('[data-nav]');
  if (burger && nav) {
    var close = function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    addEventListener('resize', function () { if (innerWidth > 1000) close(); }, { passive: true });
  }

  /* reveal on enter, then stop watching */
  var targets = document.querySelectorAll('.rv,[data-stag]');
  if (targets.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
      targets.forEach(function (t) { io.observe(t); });
    }
  }

  /* active nav link */
  var links = [].slice.call(document.querySelectorAll('[data-spy] a[href^="#"]'));
  if (links.length) {
    var map = {}, secs = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; secs.push(el); }
    });
    if (secs.length) {
      var vis = new Set();
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (en) { en.isIntersecting ? vis.add(en.target.id) : vis.delete(en.target.id); });
        var cur = secs.filter(function (x) { return vis.has(x.id); })[0];
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (cur && map[cur.id]) map[cur.id].setAttribute('aria-current', 'true');
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (x) { spy.observe(x); });
    }
  }

  /* anchor scroll that clears the fixed header */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var off = hdr ? hdr.offsetHeight : 0;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
  });

  /* forms have no backend yet — say so rather than fake a success state */
  document.querySelectorAll('[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var action = f.getAttribute('action');
      if (action && action !== '#') return;
      e.preventDefault();
      var note = f.querySelector('[data-note]');
      if (note) {
        note.hidden = false;
        note.textContent = 'This form is not connected to a mail service yet — reach us at ' +
          (f.dataset.email || 'info@cleverhgroup.com') + '.';
      }
    });
  });
})();
