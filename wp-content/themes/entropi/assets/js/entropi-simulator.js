/* =====================================================================
   ENTROPI · DUCK CURVE SIMULATOR (Demo page only, defer)
   Procedural dummy data, labelled ILLUSTRATION. 96 samples (15 min). Load = industrial day profile.
   Solar = bell with cloud dips scaled by the cloud slider. Gas turbine = residual (load - solar).
   PID only: lagged with a derivative kick, so it overshoots and chases clouds.
   PID + MPC: forward-looking window + small reserve, so it ramps earlier and moves less.
   v3: no result numbers anywhere (REVISI-V3 5.4) and no embedded console (5.3).
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  var sim=$('#sim');
  if(sim){
    var N=96, X0=44, X1=624, Y0=252, Y1=24, VMAX=.85;
    var pLoad=$('#sim-load'), pSun=$('#sim-sun'), pNet=$('#sim-net'), pShort=$('#sim-short'), pLine=$('#sim-pltg'), pGhost=$('#sim-ghost');
    var cloud=$('#sim-cloud'), cloudOut=$('#sim-cloud-out'), modeTxt=$('#sim-mode-txt'), desc=$('#sim-desc'), live=$('#sim-live');
    var modeBtns=$$('[data-mode]', sim), mode='pid', data=null, shown=null, anim=null;
    var TEXT={
      pid:{name:'PID only',desc:'The governor reacts after the net load has already moved, so the gas turbine chases every passing cloud and overshoots.'},
      mpc:{name:'PID + MPC',desc:'Setpoints are planned ahead from the forecast, so the gas turbine ramps earlier, moves less and stays closer to the net load.'}
    };
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
    function setMode(m){
      mode=m;
      modeBtns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mode===m))});
      modeTxt.textContent=TEXT[m].name;
      desc.textContent=TEXT[m].desc;
      if(live) live.textContent='Mode '+TEXT[m].name+'. '+TEXT[m].desc;
      render(true);
    }
    modeBtns.forEach(function(b){b.addEventListener('click',function(){ if(b.dataset.mode!==mode) setMode(b.dataset.mode); })});
    if(cloud){ cloud.addEventListener('input',function(){ cloudOut.textContent=cloud.value+'%'; data=gen(cloud.value/100); render(true); }); }
    data=gen(cloud?cloud.value/100:.4); render(false);
  }
})();
