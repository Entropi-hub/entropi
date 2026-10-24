/* =====================================================================
   ENTROPI · CORE (every page, defer)
   1 Demo dropdown: hover (pointer, ~150 ms intent), click/tap, Enter/Space; Esc or outside click closes
   2 mobile menu   3 current page in the nav   4 reveal (fade-up) with IntersectionObserver
   5 light/dark toggle (stored choice, otherwise the device setting)
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  /* ---------- 1. Demo dropdown ---------- */
  var item=$('.has-menu'), toggle=$('.menu-toggle'), menu=$('#demo-menu');
  if(item&&toggle&&menu){
    var timer=null, INTENT=150;
    var setOpen=function(open){
      clearTimeout(timer);
      if(!open) byHover=false;
      toggle.setAttribute('aria-expanded',String(open));
      menu.classList.toggle('is-open',open);
    };
    var isOpen=function(){return toggle.getAttribute('aria-expanded')==='true'};
    var byHover=false;
    /* Click, tap, Enter and Space all arrive as "click" on the button. A click right after a hover-open keeps it open. */
    toggle.addEventListener('click',function(){ if(byHover&&isOpen()){ byHover=false; return; } setOpen(!isOpen()); });
    /* Hover intent only for real pointers (not touch), so a tap does not open and close at once. */
    item.addEventListener('pointerenter',function(e){ if(e.pointerType!=='mouse') return; clearTimeout(timer); timer=setTimeout(function(){ if(!isOpen()) byHover=true; setOpen(true); },INTENT); });
    item.addEventListener('pointerleave',function(e){ if(e.pointerType!=='mouse') return; clearTimeout(timer); timer=setTimeout(function(){setOpen(false)},INTENT); });
    item.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&isOpen()){ setOpen(false); toggle.focus(); }
      if(e.key==='ArrowDown'&&e.target===toggle){ e.preventDefault(); setOpen(true); $('a',menu).focus(); }
    });
    item.addEventListener('focusout',function(e){ if(!item.contains(e.relatedTarget)) setOpen(false); });
    doc.addEventListener('click',function(e){ if(isOpen()&&!item.contains(e.target)) setOpen(false); });
  }

  /* ---------- 2. Mobile menu ---------- */
  var mBtn=$('.menu-btn'), mNav=$('#mobile-menu');
  if(mBtn&&mNav){
    var setMobile=function(open,focusBtn){
      mBtn.setAttribute('aria-expanded',String(open));
      mBtn.setAttribute('aria-label',open?'Close menu':'Open menu');
      mNav.classList.toggle('is-open',open);
      if(focusBtn) mBtn.focus();
    };
    mBtn.addEventListener('click',function(){ var open=mBtn.getAttribute('aria-expanded')!=='true'; setMobile(open); if(open) $('a',mNav).focus(); });
    $$('a',mNav).forEach(function(a){ a.addEventListener('click',function(){ setMobile(false); }); });
    doc.addEventListener('keydown',function(e){ if(e.key==='Escape'&&mBtn.getAttribute('aria-expanded')==='true') setMobile(false,true); });
  }

  /* ---------- 3. Current page (works on WordPress and on the static export) ---------- */
  var path=location.pathname.replace(/index\.html$/,'');
  var page=/\/demo\/$/.test(path)?'demo':/\/company\/$/.test(path)?'company':'home';
  $$('.nav-list > li > a, .mobile-menu a, .foot a').forEach(function(a){
    var h=a.getAttribute('href')||'';
    var target=/demo\/$/.test(h)?'demo':/company\/$/.test(h)?'company':/^(\.\.\/|\.\/|\/)?$/.test(h)?'home':null;
    if(target===page) a.setAttribute('aria-current','page');
  });
  if(page==='demo'&&toggle) toggle.classList.add('is-current');

  /* ---------- 5. Light/dark toggle ----------
     data-theme is already set before first paint (inline script in functions.php). Clicking stores the choice;
     until then the page keeps following the device setting, live. */
  var root=doc.documentElement, themeBtn=$('.theme-btn'), KEY='entropi-theme';
  var stored=function(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } };
  var device=matchMedia('(prefers-color-scheme: light)');
  var applyTheme=function(t){
    root.setAttribute('data-theme',t);
    $$('meta[name="theme-color"]').forEach(function(m){ m.setAttribute('content',t==='light'?'#ffffff':'#0a1120'); });
    if(themeBtn){
      /* Pressed = dark mode on; the label names the mode the button controls. */
      themeBtn.setAttribute('aria-pressed',String(t==='dark'));
      themeBtn.setAttribute('title',t==='dark'?'Switch to light mode':'Switch to dark mode');
    }
  };
  applyTheme(root.getAttribute('data-theme')==='light'?'light':'dark');
  if(themeBtn) themeBtn.addEventListener('click',function(){
    var t=root.getAttribute('data-theme')==='light'?'dark':'light';
    try{ localStorage.setItem(KEY,t); }catch(e){}
    applyTheme(t);
  });
  var onDevice=function(){ var s=stored(); if(s!=='light'&&s!=='dark') applyTheme(device.matches?'light':'dark'); };
  if(device.addEventListener) device.addEventListener('change',onDevice); else if(device.addListener) device.addListener(onDevice);

  /* ---------- 4. Reveal ---------- */
  var els=$$('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(el){io.observe(el)});
  } else els.forEach(function(el){el.classList.add('in')});
})();
