/* Site cart: add to cart on product pages, cart icon + drawer, Square checkout */
(function(){
  var API='/cart-api/api',KEY='ddCart',d=document;
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function save(c){try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}render();}
  function ga(){try{if(window.gtag)gtag.apply(null,arguments);}catch(e){}}
  function gaItems(c){return c.map(function(x){return{item_id:x.v,item_name:x.name,item_variant:x.variant,price:x.price/100,quantity:x.qty};});}
  function offer(){try{var o=JSON.parse(localStorage.getItem('ddOffer'));return o&&o.exp>Date.now()?o:null;}catch(e){return null;}}
  function money(c){return '$'+(c/100).toFixed(2);}
  function esc(s){return String(s).replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});}
  var st=d.createElement('style');st.textContent=
  '.dd-cartbtn{position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:2px solid var(--dd-ink);border-radius:12px;background:#fff;cursor:pointer;padding:0;color:var(--dd-ink);flex:0 0 auto;margin-left:12px}'+
  '.dd-cartbtn svg{width:22px;height:22px}'+
  '.dd-cartbtn b{position:absolute;top:-8px;right:-8px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--dd-orange);color:#fff;font:700 12px/20px "DM Sans",sans-serif;text-align:center;border:2px solid var(--dd-ink)}'+
  '.dd-cartbtn b:empty{display:none}.dd-cartbtn.bump{animation:ddBump .4s ease}@keyframes ddBump{40%{transform:scale(1.2)}}'+
  '@media(max-width:991px){.dd-cartbtn{position:absolute;right:20px;top:50%;transform:translateY(-50%);margin:0}.dd-cartbtn.bump{animation:none}}'+
  '.dd-cart{position:fixed;top:0;right:0;bottom:0;width:92%;max-width:400px;background:var(--dd-cream);border-left:3px solid var(--dd-ink);box-shadow:-6px 0 24px rgba(0,0,0,.2);transform:translateX(105%);transition:transform .28s ease;z-index:1003;display:flex;flex-direction:column;font-family:"DM Sans",sans-serif;color:var(--dd-ink)}'+
  'body.dd-cart-open .dd-cart{transform:none}.dd-cart-ov{position:fixed;inset:0;background:rgba(30,27,24,.45);z-index:1002;display:none}body.dd-cart-open .dd-cart-ov{display:block}body.dd-cart-open{overflow:hidden}'+
  '.dd-cart-h{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:2px solid var(--dd-ink);font:700 22px "Fredoka",sans-serif}'+
  '.dd-cart-x{width:40px;height:40px;border:2px solid var(--dd-ink);border-radius:10px;background:#fff;font-size:24px;line-height:1;cursor:pointer}'+
  '.dd-cart-list{flex:1;overflow-y:auto;padding:8px 20px}.dd-cart-empty{text-align:center;padding:40px 0;opacity:.7}'+
  '.dd-ci{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(30,27,24,.12)}'+
  '.dd-ci img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:2px solid var(--dd-ink);background:#fff}'+
  '.dd-ci a{color:inherit;text-decoration:none;font-weight:700;line-height:1.2;display:block}.dd-ci small{display:block;opacity:.7;margin-top:4px}'+
  '.dd-qty{display:inline-flex;align-items:center;gap:8px;margin-top:6px}.dd-qty button{width:28px;height:28px;border:2px solid var(--dd-ink);border-radius:8px;background:#fff;cursor:pointer;font-weight:700}'+
  '.dd-ci-r{text-align:right;font-weight:700}.dd-ci-r button{display:block;margin-top:6px;border:0;background:none;color:inherit;opacity:.6;text-decoration:underline;cursor:pointer;font-size:13px}'+
  '.dd-cart-f{padding:18px 20px;border-top:2px solid var(--dd-ink)}.dd-cart-row{display:flex;justify-content:space-between;font-weight:700;font-size:18px}.dd-cart-note{font-size:14px;opacity:.75;margin:4px 0 14px}'+
  '.dd-cart-go{width:100%;padding:16px;border:3px solid var(--dd-ink);border-radius:999px;background:var(--dd-orange);color:#fff;font:700 18px "DM Sans",sans-serif;cursor:pointer;box-shadow:0 4px 0 var(--dd-ink)}.dd-cart-go:disabled{opacity:.6;cursor:wait}'+
  '.dd-cart-err{color:#B42318;font-size:14px;margin-top:10px;min-height:1em}'+
  '.dd-add{display:flex;flex-direction:column;gap:12px;margin:8px 0 16px}.dd-add label{font-weight:700}'+
  '.dd-add select{padding:12px 14px;border:2px solid var(--dd-ink);border-radius:12px;font:500 16px "DM Sans",sans-serif;background:#fff;color:var(--dd-ink)}'+
  '.dd-add-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.dd-add-price{font:700 26px "Fredoka",sans-serif}'+
  '.dd-add button{padding:14px 26px;border:3px solid var(--dd-ink);border-radius:999px;background:var(--dd-orange);color:#fff;font:700 18px "DM Sans",sans-serif;cursor:pointer;box-shadow:0 4px 0 var(--dd-ink)}'+
  '.dd-cart-disc{display:flex;justify-content:space-between;font-weight:700;color:#1F7A3A;margin-top:6px}.dd-cart-disc:empty{display:none}'+
  '.dd-cart-email{width:100%;box-sizing:border-box;padding:12px 14px;border:2px solid var(--dd-ink);border-radius:12px;font:500 15px "DM Sans",sans-serif;margin:0 0 12px;background:#fff;color:var(--dd-ink)}'+
  '.dd-offer{position:fixed;left:12px;right:12px;bottom:12px;max-width:520px;margin:0 auto;display:flex;align-items:center;gap:12px;padding:12px 14px 12px 18px;background:var(--dd-orange);color:#fff;border:3px solid var(--dd-ink);border-radius:18px;box-shadow:0 5px 0 var(--dd-ink);z-index:1001;font:700 15px/1.3 "DM Sans",sans-serif}'+
  '.dd-offer b{font:700 22px "Fredoka",sans-serif;background:var(--dd-ink);padding:2px 10px;border-radius:10px;font-variant-numeric:tabular-nums}.dd-offer span{flex:1}.dd-offer button{border:0;background:none;color:#fff;font-size:22px;cursor:pointer;line-height:1}body.dd-cart-open .dd-offer{display:none}'+
  '.dd-cookie{position:fixed;left:12px;bottom:12px;max-width:360px;padding:14px 16px;background:#fff;color:var(--dd-ink);border:2px solid var(--dd-ink);border-radius:14px;box-shadow:0 4px 0 var(--dd-ink);z-index:1000;font:500 14px/1.4 "DM Sans",sans-serif}.dd-cookie button{margin-top:10px;padding:8px 18px;border:2px solid var(--dd-ink);border-radius:999px;background:var(--dd-orange);color:#fff;font-weight:700;cursor:pointer}'+
  '.dd-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,140%);background:var(--dd-ink);color:#fff;padding:14px 20px;border-radius:999px;font:700 15px "DM Sans",sans-serif;z-index:1004;transition:transform .3s ease;white-space:nowrap}.dd-toast.on{transform:translate(-50%,0)}';
  d.head.appendChild(st);

  /* header button */
  var inner=d.querySelector('.nav .nav-inner');if(!inner)return;
  var btn=d.createElement('button');btn.type='button';btn.className='dd-cartbtn';btn.setAttribute('aria-label','Open cart');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg><b></b>';
  inner.appendChild(btn);

  /* drawer */
  var ov=d.createElement('div');ov.className='dd-cart-ov';
  var dr=d.createElement('aside');dr.className='dd-cart';dr.setAttribute('aria-label','Shopping cart');
  dr.innerHTML='<div class="dd-cart-h"><span>Your cart</span><button type="button" class="dd-cart-x" aria-label="Close cart">&times;</button></div><div class="dd-cart-list"></div><div class="dd-cart-f"><div class="dd-cart-row"><span>Subtotal</span><span class="dd-cart-sub">$0.00</span></div><div class="dd-cart-disc"></div><div class="dd-cart-note">Free shipping. Taxes calculated at checkout.</div><input type="email" class="dd-cart-email" placeholder="Email (we\'ll save your cart)" autocomplete="email"><button type="button" class="dd-cart-go">Checkout</button><div class="dd-cart-err" role="alert"></div></div>';
  d.body.appendChild(ov);d.body.appendChild(dr);
  var list=dr.querySelector('.dd-cart-list'),sub=dr.querySelector('.dd-cart-sub'),go=dr.querySelector('.dd-cart-go'),err=dr.querySelector('.dd-cart-err'),disc=dr.querySelector('.dd-cart-disc'),em=dr.querySelector('.dd-cart-email');
  try{em.value=localStorage.getItem('ddEmail')||'';}catch(e){}
  function okEmail(v){return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);}
  function lead(){var v=em.value.trim(),c=load();if(!okEmail(v)||!c.length)return;try{localStorage.setItem('ddEmail',v);}catch(e){}
    fetch(API+'/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v,items:c.map(function(x){return{name:x.name,variant:x.variant,qty:x.qty};})}),keepalive:true}).catch(function(){});}
  em.addEventListener('change',lead);
  function open(o){d.body.classList.toggle('dd-cart-open',o);if(o)err.textContent='';}
  btn.addEventListener('click',function(){open(true);});ov.addEventListener('click',function(){open(false);});
  dr.querySelector('.dd-cart-x').addEventListener('click',function(){open(false);});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')open(false);});

  function render(){
    var c=load(),n=0,t=0,h='',lg=d.querySelector('.nav-logo img'),ls=lg?(lg.currentSrc||lg.src):'';
    c.forEach(function(x){if(x.img&&(x.img===ls||(lg&&x.img===lg.src)))x.img='';});
    c.forEach(function(x,i){n+=x.qty;t+=x.price*x.qty;
      h+='<div class="dd-ci"><img alt="" src="'+esc(x.img||'')+'"><div><a href="'+esc(x.url||'#')+'">'+esc(x.name)+'</a><small>'+esc(x.variant)+'</small><div class="dd-qty"><button type="button" data-i="'+i+'" data-d="-1" aria-label="Less">−</button><span>'+x.qty+'</span><button type="button" data-i="'+i+'" data-d="1" aria-label="More">+</button></div></div><div class="dd-ci-r">'+money(x.price*x.qty)+'<button type="button" data-r="'+i+'">Remove</button></div></div>';});
    list.innerHTML=h||'<div class="dd-cart-empty">Your cart is empty.</div>';
    sub.textContent=money(t);var o=offer();disc.innerHTML=o&&t?'<span>Welcome offer 25% off</span><span>−'+money(Math.round(t*.25))+'</span>':'';btn.querySelector('b').textContent=n?String(n):'';go.disabled=!n;
  }
  list.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var c=load();
    if(b.dataset.r!=null){c.splice(+b.dataset.r,1);}else if(b.dataset.i!=null){var x=c[+b.dataset.i];x.qty=Math.max(1,Math.min(99,x.qty+(+b.dataset.d)));}save(c);});
  go.addEventListener('click',function(){var c=load();if(!c.length)return;lead();var o=offer();ga('event','begin_checkout',{currency:'USD',items:gaItems(c)});try{localStorage.setItem('ddLastOrder',JSON.stringify(c));}catch(e){}go.disabled=true;go.textContent='Opening secure checkout…';err.textContent='';
    fetch(API+'/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:c.map(function(x){return{variationId:x.v,qty:x.qty};}),offer:o?o.token:null,email:em.value.trim()})})
    .then(function(r){return r.json().then(function(j){if(!r.ok||!j.url)throw j;return j;});})
    .then(function(j){location.href=j.url;})
    .catch(function(){err.textContent='Checkout is unavailable right now. Please try again in a moment.';go.disabled=false;go.textContent='Checkout';});});

  function toast(m){var t=d.createElement('div');t.className='dd-toast';t.textContent=m;d.body.appendChild(t);requestAnimationFrame(function(){t.classList.add('on');});setTimeout(function(){t.classList.remove('on');setTimeout(function(){t.remove();},400);},2600);}

  /* order complete */
  if(/[?&]order=thanks/.test(location.search)){try{var lo=JSON.parse(localStorage.getItem('ddLastOrder')||'[]');if(lo.length)ga('event','purchase',{transaction_id:'web-'+Date.now(),currency:'USD',value:lo.reduce(function(a,x){return a+x.price*x.qty;},0)/100,items:gaItems(lo)});localStorage.removeItem('ddLastOrder');localStorage.removeItem('ddOffer');localStorage.removeItem(KEY);}catch(e){}setTimeout(function(){toast('Thank you! Your order is in. ♥');},600);history.replaceState(null,'',location.pathname);}
  /* cookie notice */
  try{if(!localStorage.getItem('ddCookieOk')){var ck=d.createElement('div');ck.className='dd-cookie';ck.innerHTML='We use cookies to keep your cart, remember your offer and understand how people use our site.<br><button type="button">OK</button>';d.body.appendChild(ck);ck.querySelector('button').addEventListener('click',function(){try{localStorage.setItem('ddCookieOk','1');}catch(e){}ck.remove();});}}catch(e){}

  /* 25% off welcome offer: first visit only, 15 minute countdown */
  var bar=null,tick=null;
  function showOffer(){var o=offer();if(!o)return;
    bar=d.createElement('div');bar.className='dd-offer';bar.setAttribute('role','status');
    bar.innerHTML='<span>Welcome! Take <u>25% off</u> your order if you check out in</span><b></b><button type="button" aria-label="Hide">&times;</button>';
    d.body.appendChild(bar);var b=bar.querySelector('b');
    bar.querySelector('button').addEventListener('click',function(){bar.style.display='none';});
    bar.querySelector('span').addEventListener('click',function(){open(true);});
    function step(){var ms=o.exp-Date.now();if(ms<=0){clearInterval(tick);bar.remove();try{localStorage.removeItem('ddOffer');}catch(e){}render();return;}
      var m=Math.floor(ms/60000),s2=Math.floor(ms%60000/1000);b.textContent=m+':'+(s2<10?'0':'')+s2;}
    step();tick=setInterval(step,1000);}
  var seen=null;try{seen=localStorage.getItem('ddSeen');localStorage.setItem('ddSeen','1');}catch(e){seen='1';}
  if(!seen&&!/[?&]order=thanks/.test(location.search)){fetch(API+'/offer').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){try{localStorage.setItem('ddOffer',JSON.stringify(j));}catch(e){}showOffer();render();ga('event','view_promotion',{promotion_name:'Welcome 25% off'});}).catch(function(){});}
  else showOffer();
  render();

  /* product page: color picker + add to cart */
  var slot=d.querySelector('[data-dd-addcart]');var id=slot&&slot.getAttribute('data-square-item');
  if(!slot||!id)return;
  fetch(API+'/item?id='+encodeURIComponent(id)).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(it){
    var vs=it.variations||[];if(!vs.length)return;
    var name=(d.querySelector('h1')||{}).textContent||it.name;
    /* product photo: the largest image on the page outside the header */
    var imgEl=null,best=0;d.querySelectorAll('img').forEach(function(im){if(im.closest('.nav,.announce-bar,footer,.dd-cart'))return;var r=im.getBoundingClientRect(),a=r.width*r.height;if(a>best){best=a;imgEl=im;}});
    var opts=vs.map(function(v,i){return '<option value="'+i+'">'+esc(v.name)+(vs.some(function(o){return o.price!==v.price;})?' – '+money(v.price):'')+'</option>';}).join('');
    slot.className='dd-add';
    slot.innerHTML=(vs.length>1?'<label for="dd-var">Choose your option</label><select id="dd-var">'+opts+'</select>':'')+'<div class="dd-add-row"><span class="dd-add-price"></span><button type="button">Add to cart</button></div>';
    var sel=slot.querySelector('select'),pr=slot.querySelector('.dd-add-price');
    function cur(){return vs[sel?+sel.value:0];}
    function upd(){pr.textContent=money(cur().price);}upd();if(sel)sel.addEventListener('change',upd);
    var buy=slot.parentNode.querySelector('a.btn:not(.btn-outline)');if(buy&&/buy now/i.test(buy.textContent))buy.style.display='none';
    slot.querySelector('button').addEventListener('click',function(){var v=cur(),c=load(),f=c.find(function(x){return x.v===v.id;});
      if(f)f.qty=Math.min(99,f.qty+1);else c.push({v:v.id,name:name.trim(),variant:vs.length>1?v.name:'',price:v.price,img:imgEl?(imgEl.currentSrc||imgEl.src):'',url:location.pathname,qty:1});
      save(c);ga('event','add_to_cart',{currency:'USD',value:v.price/100,items:[{item_id:v.id,item_name:name.trim(),item_variant:v.name,price:v.price/100,quantity:1}]});btn.classList.remove('bump');void btn.offsetWidth;btn.classList.add('bump');toast('Added to cart');});
  }).catch(function(){});
})();
