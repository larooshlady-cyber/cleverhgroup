(function(){
  'use strict';
  var hdr=document.querySelector('[data-hdr]');
  if(hdr&&'IntersectionObserver' in window){
    var s=document.createElement('div');s.setAttribute('aria-hidden','true');
    s.style.cssText='position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(s);
    new IntersectionObserver(function(e){hdr.classList.toggle('is-stuck',!e[0].isIntersecting)}).observe(s);
  }
  var burger=document.querySelector('[data-burger]'),nav=document.querySelector('[data-nav]');
  function close(){if(!nav)return;nav.classList.remove('is-open');burger.setAttribute('aria-expanded','false')}
  if(burger&&nav){
    burger.addEventListener('click',function(){var o=nav.classList.toggle('is-open');burger.setAttribute('aria-expanded',String(o))});
    nav.addEventListener('click',function(e){if(e.target.closest('a'))close()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  }
  /* reveals */
  var sel='.ae,.bm,.be .aw,.as .bd,.ay .bd,.ax>div,.az .ba,.ct,.ah,.ao,#why .bg,#why h2,#why .bn,#contact h2,#contact .bn,.pl';
  var els=[].slice.call(document.querySelectorAll(sel));
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches||/[?&]static=1/.test(location.search))return;
  els.forEach(function(el){el.classList.add('reveal')});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){io.observe(el)});
  /* scrollspy */
  var links=[].slice.call(document.querySelectorAll('.aq a[href^="#"]:not(.nav-cta)'));
  var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.removeAttribute('aria-current')});var a=map[e.target.id];if(a)a.setAttribute('aria-current','true')}})},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){var t=document.getElementById(id);if(t)so.observe(t)});
})();
