/* =====================================================================
   ENTROPI · CONTACT FORM (ported verbatim from the approved homepage script, part 6)
   Client-side validation; submit builds a mailto to the confirmed contact address.
   (Placeholder handler: swap for Formspree or similar when available.)
   Loaded with defer on the front end only.
   ===================================================================== */
(function(){
  'use strict';
  var doc=document;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  /* ---------- 6. Contact form: client-side validation, mailto placeholder ---------- */
  var form=$('#contact-form');
  if(form){
    var MAILTO='entropi.eng@gmail.com'; /* confirmed by client 2026-10-23 */
    var rules={
      nama:function(v){return v.length>=2||'Isi nama Anda.'},
      perusahaan:function(v){return v.length>=2||'Isi nama perusahaan atau institusi.'},
      email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)||'Format email belum benar, contoh: nama@perusahaan.co.id'},
      pesan:function(v){return v.length>=10||'Tulis minimal 10 karakter tentang kebutuhan Anda.'}
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
      if(bad.length){ st.className='form-status err'; st.textContent='Periksa '+bad.length+' kolom yang ditandai.'; bad[0].focus(); return; }
      var v={}; inputs.forEach(function(i){v[i.name]=i.value.trim()});
      var body='Nama: '+v.nama+'\nPerusahaan: '+v.perusahaan+'\nEmail: '+v.email+'\n\n'+v.pesan;
      var href='mailto:'+MAILTO+'?subject='+encodeURIComponent('Minta Demo MPC-901: '+v.perusahaan)+'&body='+encodeURIComponent(body);
      if(MAILTO.charAt(0)==='['){ st.className='form-status ok'; st.textContent='Form valid. Alamat tujuan belum dikonfirmasi ('+MAILTO+'), jadi email belum dibuka.'; return; }
      window.location.href=href;
    });
  }
})();
