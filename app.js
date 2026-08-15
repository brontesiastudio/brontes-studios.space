(function(){
  "use strict";
  var quiz=window.QUIZ_DATA,app=document.getElementById("app"),progress=document.getElementById("progress"),stepIndex=0,answers={},timers=[];
  function clearTimers(){timers.forEach(function(id){clearInterval(id);clearTimeout(id)});timers=[]}
  function el(tag,cls,content){var x=document.createElement(tag);if(cls)x.className=cls;if(content!=null)x.innerHTML=content;return x}
  function validName(v){return String(v||"").trim().length>=2&&/[A-Za-zÀ-ÿ]/.test(v)}
  function phoneDigits(v){var d=String(v||"").replace(/\D/g,"");if((d.length===12||d.length===13)&&d.slice(0,2)==="55")d=d.slice(2);return d}
  function validPhone(v){var d=phoneDigits(v);return(d.length===10||d.length===11)&&!(/^(\d)\1+$/.test(d))&&Number(d.slice(0,2))>=11&&Number(d.slice(0,2))<=99&&(d.length!==11||d[2]==="9")}
  function maskPhone(v){var d=phoneDigits(v).slice(0,11);if(d.length<=2)return d;if(d.length<=6)return"("+d.slice(0,2)+") "+d.slice(2);if(d.length<=10)return"("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6);return"("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7)}
  function next(){if(stepIndex<quiz.steps.length-1){stepIndex++;render()}}
  function navigate(url){if(url)window.location.href=url}
  function text(l){return el("div","layer-text",l.html||"")}
  function image(l){var w=el("div","image-wrap"),i=document.createElement("img");i.src=l.src;i.alt=l.alt||"";i.className="media"+(l.src.indexOf("presente")>=0?" gift-transparent":"");i.style.width=Math.min(100,l.widthPct||100)+"%";w.appendChild(i);return w}
  function carousel(l){var w=el("div","carousel-wrap"),r=el("div","carousel");(l.items||[]).forEach(function(item){var f=el("figure","slide"),i=document.createElement("img");i.src=item.src;i.alt=item.alt||item.caption||"Imagem";f.appendChild(i);if(item.caption)f.appendChild(el("figcaption","",item.caption));r.appendChild(f)});w.appendChild(r);if((l.items||[]).length>1)w.appendChild(el("p","swipe","Deslize para ver mais"));return w}
  function field(l){var w=el("div","field"),label=el("label","",l.title||""),i=document.createElement("input");i.placeholder=l.placeholder||"";i.required=!!l.required;i.autocomplete=l.fieldType==="phone"?"tel":"name";i.inputMode=l.fieldType==="phone"?"tel":"text";i.dataset.key=l.fieldKey||l.fieldType;i.value=answers[i.dataset.key]||"";i.addEventListener("input",function(){if(l.fieldType==="phone")i.value=maskPhone(i.value);answers[i.dataset.key]=i.value;updateCapture()});w.append(label,i);return w}
  function button(l){var b=el("button","btn btn-"+(l.style||"theme")+(l.pulse?" pulse":""),l.label||"Continuar");b.type="button";if(quiz.steps[stepIndex].id==="captacao")b.dataset.capture="1";b.onclick=function(){if(l.checkoutRole==="basico"||l.upsell)return showUpgradeModal();var d=l.destination;if(typeof d==="object"&&d.url)return navigate(d.url);if(typeof d==="string"&&d!=="next")return navigate(d);next()};return b}
  function options(l){var w=el("div","options");(l.options||[]).forEach(function(o){var b=el("button","option",(o.emoji?'<span class="emoji">'+o.emoji+'</span>':"")+o.label);b.type="button";b.onclick=function(){answers[quiz.steps[stepIndex].id]=o.id;b.style.borderColor="#22c55e";b.style.background="#f0fdf4";timers.push(setTimeout(next,180))};w.appendChild(b)});return w}
  function video(l){return el("div","video-wrap",l.embed||"")}
  function alertBox(l){return el("div","alert alert-"+(l.style||"light"),l.html||"")}
  function price(l){var c=el("div","price "+(l.style==="danger"?"danger":""));c.appendChild(el("div","price-title",l.titleHtml||""));c.appendChild(el("div","price-caption",l.before||""));c.appendChild(el("div","price-value",l.value||""));c.appendChild(el("div","price-caption",l.after||""));if(l.destinationUrl)c.onclick=function(){if(l.checkoutRole==="basico")return showUpgradeModal();navigate(l.destinationUrl)};return c}
  function metric(l){var c=el("div","metric");c.appendChild(el("div","metric-head","<span>"+(l.label||"")+"</span><span>"+(l.percent||0)+"%</span>"));var t=el("div","metric-track"),f=el("div","metric-fill");f.style.width=(l.percent||0)+"%";t.appendChild(f);c.appendChild(t);return c}
  function args(l){var c=el("div","arguments");(l.items||[]).forEach(function(item){var x=el("div","argument");x.appendChild(el("h3","",item.title||""));if(item.text)x.appendChild(el("div","",item.text));c.appendChild(x)});return c}
  function chart(l){
    var c=el("div","chart-line"),points=((l.datasets||[])[0]||{}).points||[];
    var labels=l.xAxis||["HOJE","7 DIAS","30 DIAS"];
    var coords=[[34,196],[184,142],[334,38]];
    var tooltips=["Hoje · R$ 0","R$ 1.000","R$ 5.000"];
    var svg='<svg viewBox="0 0 370 250" role="img" aria-label="Projeção de resultados de hoje a 30 dias">'+
      '<defs><linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c55e" stop-opacity=".35"/><stop offset="1" stop-color="#22c55e" stop-opacity="0"/></linearGradient><linearGradient id="lineProgress" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dc2626"/><stop offset=".42" stop-color="#f59e0b"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs>'+
      '<g class="grid-lines"><line x1="34" y1="196" x2="346" y2="196"/><line x1="34" y1="142" x2="346" y2="142"/><line x1="34" y1="88" x2="346" y2="88"/><line x1="34" y1="34" x2="346" y2="34"/></g>'+
      '<g class="axis-values"><text x="16" y="201">0</text><text x="10" y="147">25</text><text x="10" y="93">50</text><text x="10" y="39">100</text></g>'+
      '<path class="chart-area" d="M34 196 L184 142 L334 38 L334 196 Z"/>'+
      '<path class="chart-path" d="M34 196 L184 142 L334 38"/>';
    coords.forEach(function(p,i){
      var tag=i===0?'Hoje · R$ 0':tooltips[i];
      var width=i===1?102:88, x=Math.max(8,p[0]-width/2), y=p[1]-39;
      var fill=i===0?'#dc2626':(i===2?'#16a34a':'#f3f4f6');
      var color=i===1?'#111827':'#ffffff';
      svg+='<g class="chart-point point-'+i+'"><rect x="'+x+'" y="'+y+'" width="'+width+'" height="28" rx="14" fill="'+fill+'"/><text x="'+(x+width/2)+'" y="'+(y+19)+'" text-anchor="middle" fill="'+color+'" font-weight="800">'+tag+'</text><circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#fff" stroke="#9ca3af" stroke-width="3"/><text x="'+p[0]+'" y="232" text-anchor="middle" class="x-label">'+labels[i]+'</text></g>';
    });
    svg+='</svg>';c.innerHTML=svg;return c
  }
  function timer(l){var c=el("div","timer",(l.label||"")+"<strong>10:00</strong>"),s=c.querySelector("strong"),left=Number(l.seconds||600);function tick(){var m=Math.floor(left/60),x=left%60;s.textContent=String(m).padStart(2,"0")+":"+String(x).padStart(2,"0");if(left>0)left--}tick();timers.push(setInterval(tick,1000));return c}
  function loading(l){var c=el("div","loading");c.appendChild(el("div","spinner"));c.appendChild(el("h2","",l.title||"Carregando..."));c.appendChild(el("p","",l.description||""));timers.push(setTimeout(next,l.durationMs||2500));return c}
  function safe(v){return String(v||"").replace(/[&<>\"]/g,function(x){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]})}
  function closeUpgradeModal(){var o=document.querySelector(".upgrade-overlay");if(o)o.remove();document.body.classList.remove("modal-open")}
  function showUpgradeModal(){
    closeUpgradeModal();
    var m=quiz.upsellModal||{},o=el("div","upgrade-overlay"),d=el("div","upgrade-modal");
    o.setAttribute("role","presentation");d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","upgrade-title");
    var extras=(m.proExtras||[]).map(function(x){return'<li><span>✓</span>'+safe(x)+'</li>'}).join("");
    d.innerHTML='<button class="upgrade-close" type="button" aria-label="Fechar">×</button>'+
      '<div class="upgrade-eyebrow">'+safe(m.eyebrow||"ANTES DE CONTINUAR")+'</div>'+
      '<h2 id="upgrade-title">'+safe(m.headline||"Leve o plano completo")+'</h2>'+
      '<p class="upgrade-description">'+safe(m.description||"")+'</p>'+
      '<div class="upgrade-price-compare"><div><small>'+safe(m.basicLabel||"BÁSICO")+'</small><strong>'+safe(m.basicPrice||"R$ 9,90")+'</strong></div><b>→</b><div class="featured"><small>'+safe(m.proLabel||"PRO")+'</small><strong>'+safe(m.discountedPrice||"R$ 19,90")+'</strong></div><em>'+safe(m.difference||"+ R$10")+'</em></div>'+
      '<div class="upgrade-pro"><div class="upgrade-recommended">MAIS ESCOLHIDO · RECOMENDADO</div><h3>Com o Pro você recebe:</h3><ul>'+extras+'</ul></div>'+
      '<button class="upgrade-accept" type="button">'+safe(m.acceptLabel||"QUERO O PRO")+'</button>'+
      '<p class="upgrade-caption">'+safe(m.priceCaption||"")+'</p>'+
      '<button class="upgrade-decline" type="button">'+safe(m.declineLabel||"Continuar com o Básico")+'</button>';
    o.appendChild(d);document.body.appendChild(o);document.body.classList.add("modal-open");
    d.querySelector(".upgrade-close").onclick=closeUpgradeModal;
    d.querySelector(".upgrade-accept").onclick=function(){navigate(quiz.checkouts.pro)};
    d.querySelector(".upgrade-decline").onclick=function(){navigate(quiz.checkouts.basico)};
    o.onclick=function(e){if(e.target===o)closeUpgradeModal()};
    d.querySelector(".upgrade-accept").focus();
  }
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeUpgradeModal()});
  function layer(l){switch(l.kind){case"text":return text(l);case"image":return image(l);case"carousel":return carousel(l);case"field":return field(l);case"button":return button(l);case"options":return options(l);case"video":return video(l);case"alert":return alertBox(l);case"price":return price(l);case"metric":return metric(l);case"arguments":return args(l);case"chart":return chart(l);case"timer":return timer(l);case"loading":return loading(l);case"clear":return el("div","clear");default:return el("div","")}}
  function updateCapture(){var b=app.querySelector("[data-capture]");if(!b)return;var ok=validName(answers.name)&&validPhone(answers.whatsapp);b.disabled=!ok;var m=app.querySelector(".validation");if(m)m.hidden=ok}
  function render(){clearTimers();app.innerHTML="";var s=quiz.steps[stepIndex];progress.style.width=((stepIndex+1)/quiz.steps.length*100)+"%";var section=el("section","step");section.dataset.step=s.id;(s.layers||[]).forEach(function(l,i){var node=layer(l);node.dataset.layerIndex=i;section.appendChild(node)});if(s.id==="captacao"){var m=el("p","validation","Digite seu nome e um WhatsApp válido para continuar."),b=section.querySelector("[data-capture]");if(b)b.insertAdjacentElement("afterend",m)}app.appendChild(section);updateCapture();window.scrollTo(0,0)}
  if(!quiz||!Array.isArray(quiz.steps)){app.innerHTML='<div class="error-box">Não foi possível carregar o quiz.</div>';return}render();
})();
