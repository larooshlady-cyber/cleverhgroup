(function(){
  var els=[].slice.call(document.querySelectorAll('[data-ka]'));
  els.forEach(function(e){e.setAttribute('data-en',e.innerHTML);});
  function set(l){
    els.forEach(function(e){e.innerHTML=e.getAttribute(l==='ka'?'data-ka':'data-en');});
    document.documentElement.lang=l;
    [].forEach.call(document.querySelectorAll('.lang button'),function(b){b.className=b.getAttribute('data-lang')===l?'on':'';});
    try{localStorage.setItem('lang',l);}catch(e){}
  }
  [].forEach.call(document.querySelectorAll('.lang button'),function(b){b.addEventListener('click',function(){set(b.getAttribute('data-lang'));});});
  var l=null,m=/[?&]lang=(en|ka)/.exec(location.search);
  if(m)l=m[1];
  if(!l){try{l=localStorage.getItem('lang');}catch(e){}}
  if(!l&&/^ka/i.test(navigator.language||''))l='ka';
  if(l==='ka')set('ka');
})();
