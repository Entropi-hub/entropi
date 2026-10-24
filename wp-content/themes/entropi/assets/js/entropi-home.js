/* =====================================================================
   ENTROPI · HOME (front page only, defer)
   1 Scroll-driven intro: one pinned stage. Scroll progress p (0..1) through .intro-track drives, with no
     dead time between steps: lid opens 0 -> 105 deg while the view flattens (55 -> 15 deg) and the headline
     fades up; screen lights past 60 deg; chart draws load -> solar -> net load; at the evening peak the three
     problems appear on the left, then the solution on the right, then the smoother PID + MPC curve.
     Scrolling is never intercepted: the page simply stays pinned (CSS position: sticky) until p = 1.
     Below 1024 px the problems and solution move under the pinned stage and appear after the chart.
     prefers-reduced-motion or no JS: nothing is added, CSS shows the finished state.
   The film below the intro plays in place with native controls and needs no script.
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}
  function clamp(v){return v<0?0:v>1?1:v}
  function seg(p,a,b){return clamp((p-a)/(b-a))}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}

  /* ---------- 1. Scroll-driven intro ---------- */
  var intro=$('#intro');
  if(intro){
    var track=$('.intro-track',intro), stage=$('.intro-stage',intro), grid=$('.intro-grid',intro), after=$('.intro-after',intro);
    var lap=$('.laptop',intro), body=$('.lt-body',intro), chart=$('.chart',intro), head=$('.intro-head',intro);
    var probs=$('.ps-problems',intro), sol=$('.ps-solution',intro), items=$$('.ps-item',intro), pk=$('.ps-k',probs);
    var reduce=matchMedia('(prefers-reduced-motion: reduce)'), wide=matchMedia('(min-width: 1024px)');
    var on=false, ticking=false, io=null;
    /* Phase tables (fractions of the pinned scroll). Desktop has problems + solution inside the pin. */
    var DESK={lift:-.1,open:[0,.26],head:[.02,.16],load:[.26,.38],sun:[.38,.50],net:[.50,.62],peak:[.60,.63],items:[.63,.69,.75],sol:.81,mpc:[.85,.97]};
    var MOB ={lift:.45,open:[0,.36],head:[.02,.2],load:[.36,.52],sun:[.52,.68],net:[.68,.84],peak:[.82,.85],mpc:[.86,.98]};

    var place=function(){
      if(on&&!wide.matches){ after.appendChild(probs); after.appendChild(sol); }
      else { grid.insertBefore(probs,lap); grid.appendChild(sol); }
    };
    var set=function(el,k,v){ el.style.setProperty(k,v); };
    var reset=function(){
      ['--open','--tilt','--lift','--scale'].forEach(function(k){lap.style.removeProperty(k)});
      ['--c1','--c2','--c3','--c4','--pk'].forEach(function(k){chart.style.removeProperty(k)});
      ['--head-o','--head-y','--head-pe'].forEach(function(k){head.style.removeProperty(k)});
      lap.classList.remove('is-on');
      items.concat([pk,sol]).forEach(function(el){el.classList.remove('is-shown','is-current')});
    };
    var update=function(){
      ticking=false;
      if(!on) return;
      var T=wide.matches?DESK:MOB;
      var r=track.getBoundingClientRect(), total=track.offsetHeight-innerHeight;
      var p=total>0?clamp(-r.top/total):1;
      var o=ease(seg(p,T.open[0],T.open[1]));
      var open=105*o, h=body.offsetHeight;
      set(lap,'--open',open.toFixed(2)+'deg');
      set(lap,'--tilt',(55-40*o).toFixed(2)+'deg');
      set(lap,'--lift',((1-o)*T.lift*h).toFixed(1)+'px');
      set(lap,'--scale',(.66+.34*o).toFixed(3));
      lap.classList.toggle('is-on',open>60);
      var hf=seg(p,T.head[0],T.head[1]);
      set(head,'--head-o',(1-hf).toFixed(3));
      set(head,'--head-y',(-48*hf).toFixed(1)+'px');
      set(head,'--head-pe',hf>.6?'none':'auto');
      set(chart,'--c1',seg(p,T.load[0],T.load[1]).toFixed(3));
      set(chart,'--c2',seg(p,T.sun[0],T.sun[1]).toFixed(3));
      set(chart,'--c3',seg(p,T.net[0],T.net[1]).toFixed(3));
      set(chart,'--pk',seg(p,T.peak[0],T.peak[1]).toFixed(3));
      set(chart,'--c4',seg(p,T.mpc[0],T.mpc[1]).toFixed(3));
      if(T.items){
        var cur=-1;
        items.forEach(function(it,i){ var s=p>=T.items[i]; it.classList.toggle('is-shown',s); if(s) cur=i; });
        items.forEach(function(it,i){ it.classList.toggle('is-current',i===cur); });
        pk.classList.toggle('is-shown',p>=T.items[0]-.02);
        sol.classList.toggle('is-shown',p>=T.sol);
      }
    };
    var onScroll=function(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } };
    /* Below 1024 px the problems and solution sit after the stage and fade in when reached. */
    var watchAfter=function(){
      if(io){ io.disconnect(); io=null; }
      if(!on||wide.matches||!('IntersectionObserver' in window)) return;
      io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-shown'); io.unobserve(en.target); } }); },{rootMargin:'0px 0px -10% 0px'});
      items.concat([pk,sol]).forEach(function(el){ el.classList.remove('is-shown'); io.observe(el); });
    };
    var apply=function(){
      on=!reduce.matches;
      intro.classList.toggle('is-scrolly',on);
      reset(); place(); watchAfter();
      if(on){ update(); }
    };
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll,{passive:true});
    [reduce,wide].forEach(function(m){ (m.addEventListener?m.addEventListener('change',apply):m.addListener(apply)); });
    apply();
    /* "Skip intro" lands after the pinned stage. */
    var skip=$('.skip-intro',intro);
    if(skip) skip.addEventListener('click',function(e){
      e.preventDefault();
      var target=wide.matches||!on?intro.nextElementSibling:after;
      var y=target.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(doc.documentElement).scrollPaddingTop)||0);
      scrollTo({top:y,behavior:reduce.matches?'auto':'smooth'});
      if(!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
    });
  }
})();
