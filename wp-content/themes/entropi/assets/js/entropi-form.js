/* =====================================================================
   ENTROPI · CONTACT FORM (Company page only, defer)
   Client-side validation; submit builds a mailto to the confirmed contact address.
   (Placeholder handler: swap for Formspree or similar when available.)
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  var form=$('#contact-form');
  if(form){
    var MAILTO='entropi.eng@gmail.com'; /* confirmed by client 2026-10-23 */
    var rules={
      name:function(v){return v.length>=2||'Please enter your name.'},
      company:function(v){return v.length>=2||'Please enter your company or institution.'},
      email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)||'Please enter a valid email, for example name@company.com'},
      message:function(v){return v.length>=10||'Please write at least 10 characters.'}
    };
    function check(input){
      var f=input.closest('.field'), help=$('.help',f), res=rules[input.name](input.value.trim());
      var ok=res===true; f.classList.toggle('error',!ok); f.classList.toggle('valid',ok);
      input.setAttribute('aria-invalid',String(!ok));
      if(!help.dataset.def) help.dataset.def=help.textContent;
      help.textContent= ok ? help.dataset.def : res;
      return ok;
    }
    $$('input,textarea',form).forEach(function(i){
      i.addEventListener('blur',function(){ if(i.value) check(i); });
      i.addEventListener('input',function(){ if(i.closest('.field').classList.contains('error')) check(i); });
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var inputs=$$('input,textarea',form), bad=inputs.filter(function(i){return !check(i)}), st=$('#form-status');
      if(bad.length){ st.className='form-status err'; st.textContent='Please check '+bad.length+(bad.length>1?' fields.':' field.'); bad[0].focus(); return; }
      var v={}; inputs.forEach(function(i){v[i.name]=i.value.trim()});
      var body='Name: '+v.name+'\nCompany: '+v.company+'\nEmail: '+v.email+'\n\n'+v.message;
      st.className='form-status ok'; st.textContent='Opening your email app…';
      window.location.href='mailto:'+MAILTO+'?subject='+encodeURIComponent('MPC-901 enquiry: '+v.company)+'&body='+encodeURIComponent(body);
    });
  }
})();
