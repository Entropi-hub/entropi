/* =====================================================================
   ENTROPI · DUCK CURVE SIMULATOR (ported verbatim from the approved homepage script, part 5)
   Markup lives in a core/html block (#sim) in pages/homepage.html.
   Counter flips between the two approved values only (79,8 <-> 69,8 MWh/minggu);
   no count-up, no interpolated numbers (site-spec.json decisions.numberAnimation).
   Loaded with defer on the front end only.
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}
  function fmt(v,dec){return v.toFixed(dec).replace('.',',')}

  /* ---------- 5. Duck Curve Simulator (procedural dummy data, ILUSTRASI) ----------
     96 samples (15 min). Load = industrial day profile. PLTS = bell with
     cloud dips scaled by the cloud slider. PLTG = residual (load - PLTS).
     PID mode: lagged, derivative kick, so it overshoots and chases clouds.
     MPC mode: forward-looking window + small reserve, so it ramps earlier
     and moves less. The counter only ever shows the approved simulation
     values 79,8 (PID) and 69,8 (PID+MPC) MWh/minggu. */
  var sim=$('#sim');
  if(sim){
    var N=96, X0=44, X1=624, Y0=252, Y1=24, VMAX=.85;
    var pLoad=$('#sim-load'), pSun=$('#sim-sun'), pNet=$('#sim-net'), pShort=$('#sim-short'), pLine=$('#sim-pltg'), pGhost=$('#sim-ghost');
    var cloud=$('#sim-cloud'), cloudOut=$('#sim-cloud-out'), counter=$('#sim-counter'), delta=$('#sim-delta'), modeTxt=$('#sim-mode-txt');
    var modeBtns=$$('[data-mode]', sim), mode='pid', data=null, shown=null, anim=null;
    var VALUES={pid:79.8, mpc:69.8}, curVal=VALUES.pid;
    function rnd(seed){ var s=seed; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
    function gen(c){
      var r=rnd(7), load=[], sun=[], net=[], i, t, dips=[[9.6,.35,.55],[10.9,.25,.7],[12.4,.45,.8],[13.6,.3,.6],[15.1,.35,.65],[16.2,.2,.5]];
      for(i=0;i<N;i++){
        t=i/4;
        var l=.58+.13*Math.exp(-Math.pow((t-13.5)/5,2))+.05*Math.exp(-Math.pow((t-19.5)/1.8,2))-.05*Math.exp(-Math.pow((t-3)/2.6,2))+(r()-.5)*.012;
        var s=0;
        if(t>6&&t<18){
          s=.52*Math.pow(Math.sin(Math.PI*(t-6)/12),1.4);
          var cf=1; dips.forEach(function(d){ cf-=c*d[2]*Math.exp(-Math.pow((t-d[0])/d[1],2)); });
          s*=Math.max(.08,cf);
        }
        load.push(l); sun.push(s); net.push(l-s);
      }
      var pid=[net[0],net[1]], mpc=[];
      for(i=2;i<N;i++){ var p=pid[i-1]+.5*(net[i-1]-pid[i-1])+.65*(net[i-1]-net[i-2]); pid.push(p); }
      for(i=0;i<N;i++){ var a=0,k=0; for(var j=i-2;j<=i+5;j++){ if(j>=0&&j<N){a+=net[j];k++;} } mpc.push(a/k+.012); }
      for(i=1;i<N;i++) mpc[i]=mpc[i-1]+.6*(mpc[i]-mpc[i-1]);
      return {load:load,sun:sun,net:net,pid:pid,mpc:mpc};
    }
    function xy(i,v){ return (X0+(X1-X0)*i/(N-1)).toFixed(1)+' '+(Y0-(Y0-Y1)*Math.max(0,v)/VMAX).toFixed(1); }
    function line(a){ return 'M'+a.map(function(v,i){return xy(i,v)}).join(' L'); }
    function area(a){ return line(a)+' L'+X1+' '+Y0+' L'+X0+' '+Y0+' Z'; }
    function shortfall(net,g){
      var top=net.map(function(v,i){return xy(i,v)}), bot=[];
      for(var i=N-1;i>=0;i--) bot.push(xy(i,Math.min(g[i],net[i])));
      return 'M'+top.join(' L')+' L'+bot.join(' L')+' Z';
    }
    function paint(g){
      pLine.setAttribute('d',line(g));
      pShort.setAttribute('d',shortfall(data.net,g));
      pGhost.setAttribute('d',line(mode==='mpc'?data.pid:data.mpc));
    }
    function render(animate){
      var target=data[mode];
      pLoad.setAttribute('d',line(data.load)); pSun.setAttribute('d',area(data.sun)); pNet.setAttribute('d',line(data.net));
      if(anim) cancelAnimationFrame(anim);
      if(!animate||reduce||!shown){ shown=target.slice(); paint(shown); return; }
      var from=shown.slice(), t0=null;
      function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/650,1), e=1-Math.pow(1-p,3);
        shown=from.map(function(v,i){return v+(target[i]-v)*e}); paint(shown); if(p<1) anim=requestAnimationFrame(step); }
      anim=requestAnimationFrame(step);
    }
    /* Flip straight between the two approved values only (79,8 / 69,8 MWh/minggu).
       No count-up and no interpolation: the old value fades out, the new FINAL value
       is written in one step, then fades back in (decisions.numberAnimation). */
    function flipCounter(to){
      curVal=to;
      if(reduce){ counter.textContent=fmt(to,1); return; }
      counter.classList.add('swap');
      setTimeout(function(){ counter.textContent=fmt(to,1); counter.classList.remove('swap'); },220);
    }
    function setMode(m){
      mode=m;
      modeBtns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mode===m))});
      flipCounter(VALUES[m]);
      delta.textContent = m==='mpc' ? '-12,5% vs PID saja' : 'baseline PID';
      if(modeTxt) modeTxt.textContent = m==='mpc' ? 'PID + MPC' : 'PID saja';
      var live=$('#sim-live'); if(live) live.textContent='Mode '+(m==='mpc'?'PID + MPC':'PID saja')+'. Energi tak terlayani '+fmt(VALUES[m],1)+' MWh per minggu, hasil simulasi.';
      render(true);
    }
    modeBtns.forEach(function(b){b.addEventListener('click',function(){ if(b.dataset.mode!==mode) setMode(b.dataset.mode); })});
    if(cloud){ cloud.addEventListener('input',function(){ cloudOut.textContent=cloud.value+'%'; data=gen(cloud.value/100); render(true); }); }
    data=gen(cloud?cloud.value/100:.4); render(false);
    /* "Buka demo console": the ~2,7 MB console is never requested on page load.
       The iframe is created on the first click only, then reused. Sandbox = allow-scripts
       only: opaque origin, no forms, popups, downloads or top-level navigation.
       The console runs in its offline demo mode (live mode needs a ?t= token, never passed). */
    var cBtn=$('#console-btn'), dlg=$('#console-dialog'), cFrame=$('#console-frame'), cClose=$('#console-close');
    if(cBtn&&dlg&&cFrame){
      var CONSOLE_SRC='wp-content/themes/entropi/assets/demo/mpc-901-console-demo.html' /* relative for the static export */;
      var loaded=false;
      function openConsole(){
        if(!loaded){
          var f=doc.createElement('iframe');
          f.src=CONSOLE_SRC;
          f.title='Demo console MPC-901 (data simulasi contoh)';
          f.setAttribute('sandbox','allow-scripts');
          f.setAttribute('referrerpolicy','no-referrer');
          f.addEventListener('load',function(){ var l=$('#console-loading'); if(l) l.remove(); });
          cFrame.appendChild(f);
          loaded=true;
        }
        if(typeof dlg.showModal==='function') dlg.showModal(); else dlg.setAttribute('open','');
      }
      function closeConsole(){ if(typeof dlg.close==='function') dlg.close(); else dlg.removeAttribute('open'); }
      cBtn.addEventListener('click',openConsole);
      if(cClose) cClose.addEventListener('click',closeConsole);
      dlg.addEventListener('click',function(e){ if(e.target===dlg) closeConsole(); }); /* click on backdrop */
      dlg.addEventListener('close',function(){ cBtn.focus(); });
    }
  }
})();
