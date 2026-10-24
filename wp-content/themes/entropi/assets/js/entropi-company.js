/* =====================================================================
   ENTROPI · COMPANY PROFILE (Company page only, defer)
   1 Card carousel with peek. Native scroll-snap does swipe/drag; this adds arrows, dots, keyboard
     (Left/Right/Home/End while the track has focus) and keeps one active card (aria-current + live status).
   2 "How it works" chips: one open at a time; click/tap/Enter/Space; hover opens too on mouse (extra only).
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  /* ---------- 1. Carousel ---------- */
  var track=$('#car-track');
  if(track){
    var cards=$$('.car-card',track), dots=$$('.car-dots button'), prev=$('.car-prev'), next=$('.car-next'), status=$('#car-status');
    var active=0, raf=0, announced=-1;
    var mark=function(i,announce){
      active=i;
      cards.forEach(function(c,k){ c.classList.toggle('is-active',k===i); if(k===i) c.setAttribute('aria-current','true'); else c.removeAttribute('aria-current'); });
      dots.forEach(function(d,k){ if(k===i) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
      prev.disabled=i===0; next.disabled=i===cards.length-1;
      if(announce&&status&&announced!==i){ announced=i; status.textContent='Card '+(i+1)+' of '+cards.length+': '+$('.car-title',cards[i]).textContent; }
    };
    var go=function(i){
      i=Math.max(0,Math.min(cards.length-1,i));
      var c=cards[i];
      track.scrollTo({left:c.offsetLeft-(track.clientWidth-c.offsetWidth)/2,behavior:reduce?'auto':'smooth'});
      mark(i,true);
    };
    /* The card nearest the centre of the track is the active one. */
    var nearest=function(){
      var mid=track.scrollLeft+track.clientWidth/2, best=0, bd=Infinity;
      cards.forEach(function(c,k){ var d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid); if(d<bd){bd=d;best=k;} });
      return best;
    };
    track.addEventListener('scroll',function(){ cancelAnimationFrame(raf); raf=requestAnimationFrame(function(){ var n=nearest(); if(n!==active) mark(n,true); }); },{passive:true});
    prev.addEventListener('click',function(){ go(active-1); });
    next.addEventListener('click',function(){ go(active+1); });
    dots.forEach(function(d,k){ d.addEventListener('click',function(){ go(k); }); });
    track.addEventListener('keydown',function(e){
      var k={ArrowLeft:active-1,ArrowRight:active+1,Home:0,End:cards.length-1}[e.key];
      if(k===undefined) return;
      e.preventDefault(); go(k);
    });
    /* Clicking a peeking neighbour brings it to the centre (links inside still work on the active card). */
    cards.forEach(function(c,k){ c.addEventListener('click',function(e){ if(k!==active&&!e.target.closest('a')){ go(k); } }); });
    mark(0,false);
  }

  /* ---------- 2. How it works ---------- */
  var acc=$$('.acc-item');
  if(acc.length){
    var openOne=function(item){
      acc.forEach(function(it){
        var open=it===item&&!it.classList.contains('is-open');
        if(it!==item) open=false;
        it.classList.toggle('is-open',open);
        $('.acc-btn',it).setAttribute('aria-expanded',String(open));
      });
    };
    var hoverTimer=null;
    acc.forEach(function(it){
      var btn=$('.acc-btn',it);
      btn.addEventListener('click',function(){ openOne(it); });
      /* Hover is only an extra on real pointers; it opens (never closes) after a short intent delay. */
      it.addEventListener('pointerenter',function(e){
        if(e.pointerType!=='mouse'||it.classList.contains('is-open')) return;
        clearTimeout(hoverTimer); hoverTimer=setTimeout(function(){ if(!it.classList.contains('is-open')) openOne(it); },250);
      });
      it.addEventListener('pointerleave',function(){ clearTimeout(hoverTimer); });
    });
  }
})();
