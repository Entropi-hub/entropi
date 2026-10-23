/* =====================================================================
   ENTROPI · ID/EN LANGUAGE TOGGLE (ported from the approved homepage script, part 1)
   Elements carry their Indonesian copy in the DOM and English in data-en
   (HTML allowed). aria-label / placeholder use data-en-aria / data-en-ph.
   Choice is remembered per viewer (try/catch storage).
   EN copy is pending client review (site-spec.json decisions.pendingClientReview).
   Loaded with defer after entropi-core.js (which adds the data-en-aria values
   that core blocks cannot store).
   ===================================================================== */
(function(){
  'use strict';
  var doc=document, root=doc.documentElement;
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  function setLang(lang){
    $$('[data-en]').forEach(function(el){
      if(el.dataset.idHtml===undefined) el.dataset.idHtml=el.innerHTML;
      el.innerHTML = lang==='en' ? el.getAttribute('data-en') : el.dataset.idHtml;
    });
    $$('[data-en-aria]').forEach(function(el){
      if(el.dataset.idAria===undefined) el.dataset.idAria=el.getAttribute('aria-label')||'';
      el.setAttribute('aria-label', lang==='en' ? el.getAttribute('data-en-aria') : el.dataset.idAria);
    });
    $$('[data-en-ph]').forEach(function(el){
      if(el.dataset.idPh===undefined) el.dataset.idPh=el.getAttribute('placeholder')||'';
      el.setAttribute('placeholder', lang==='en' ? el.getAttribute('data-en-ph') : el.dataset.idPh);
    });
    root.setAttribute('lang', lang);
    $$('.lang button').forEach(function(b){b.setAttribute('aria-pressed', String(b.dataset.lang===lang))});
    try{localStorage.setItem('entropi-lang',lang)}catch(e){}
  }
  $$('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang)})});
  try{ if(localStorage.getItem('entropi-lang')==='en') setLang('en'); }catch(e){}
})();
