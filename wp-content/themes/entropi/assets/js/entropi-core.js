/* =====================================================================
   ENTROPI · CORE (ported from the approved homepage script, parts 2-4)
   0 a11y attributes core blocks cannot store
   2 mobile menu  3 reveal (fade-up) + self-drawing curves, NO count-up
   4 active section in nav + section rail
   Loaded with defer on the front end only (functions.php).
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}
  function attr(sel,name,val){ $$(sel).forEach(function(el){ if(!el.hasAttribute(name)) el.setAttribute(name,val); }); }

  /* ---------- 0. Attributes from the mockup that core blocks cannot carry ----------
     (aria-labelledby on sections, decorative aria-hidden, scroll-region semantics,
     EN aria labels for the language toggle). Purely additive. */
  $$('main section[id]').forEach(function(s){
    var h=$('h2[id],h1[id]',s); if(h && !s.hasAttribute('aria-labelledby')) s.setAttribute('aria-labelledby',h.id);
  });
  attr('.blueprint','aria-hidden','true');
  attr('.horizon','aria-hidden','true');
  attr('.ico','aria-hidden','true');
  attr('.hero-strip','role','group');
  attr('.hero-strip','data-en-aria','Key simulation results');
  attr('.nav','data-en-aria','Main navigation');
  attr('.brand a','aria-label','Entropi, kembali ke atas');
  attr('.brand a','data-en-aria','Entropi, back to top');
  $$('.portrait').forEach(function(p){ p.setAttribute('role','img'); $$('.mono,.ph',p).forEach(function(c){c.setAttribute('aria-hidden','true')}); });
  $$('.table-scroll').forEach(function(t){ t.setAttribute('tabindex','0'); t.setAttribute('role','region'); if(!t.hasAttribute('aria-label')) t.setAttribute('aria-label','Tabel perbandingan, dapat digeser'); });
  attr('.footnotes','aria-label','Sumber data');
  attr('.chips','aria-label','Prinsip integrasi');
  /* Footnotes need no script: [N] links jump to native #fn-N anchors (list-item anchors),
     scroll-padding-top keeps them clear of the sticky header and li:target highlights the entry (CSS). */

  /* ---------- 2. Mobile menu (below 960px) ---------- */
  var mBtn=$('.menu-btn'), mNav=$('#mobile-menu');
  function setOpen(open){ mBtn.setAttribute('aria-expanded',String(open)); mNav.hidden=!open; mNav.classList.toggle('is-open',open); }
  function closeMenu(focusBtn){ if(!mBtn||!mNav) return; setOpen(false); if(focusBtn) mBtn.focus(); }
  if(mBtn&&mNav){
    mNav.hidden=true;
    mBtn.addEventListener('click',function(){
      var open=mBtn.getAttribute('aria-expanded')==='true';
      setOpen(!open);
      if(!open){ var f=$('a',mNav); if(f) f.focus(); }
    });
    $$('a',mNav).forEach(function(a){a.addEventListener('click',function(){closeMenu(false)})});
    doc.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!mNav.hidden) closeMenu(true); });
    window.addEventListener('resize',function(){ if(window.innerWidth>=960&&!mNav.hidden) closeMenu(false); });
  }

  /* ---------- 3. Reveal (fade-up) and self-drawing curves ----------
     NO COUNT-UP, on purpose (site-spec.json decisions.numberAnimation).
     Every figure (hero strip, Hasil readouts, simulator counter) is written in the
     markup at its final approved value and only its container fades/slides in.
     (The readout bars are graphics without numbers, so they may still grow.)
     The roadmap items are core list items, observed directly (.timeline > li). */
  function show(e){ e.classList.add('in'); $$('.bar',e).forEach(function(b){b.classList.add('in')}); }
  var revealEls=$$('.reveal,.diagram,.sim-chart,[data-observe],.timeline > li');
  if(!('IntersectionObserver' in window)||reduce){ revealEls.forEach(show); }
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } })},{threshold:.15});
    revealEls.forEach(function(e){io.observe(e)});
  }

  /* ---------- 4. Active section in nav + section rail ----------
     Header links are "/#id" (so they also work from other pages); compare by hash. */
  var secs=$$('main section[id]'), links=$$('.nav a[href*="#"], .rail a[href^="#"]');
  if('IntersectionObserver' in window && links.length && secs.length){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var id='#'+e.target.id;
        links.forEach(function(a){ if(a.hash===id) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){so.observe(s)});
  }
})();
