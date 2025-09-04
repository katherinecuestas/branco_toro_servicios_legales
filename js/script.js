/* =========================
   Configuración global
   ========================= */
const WHATSAPP_NUMBER_DEFAULT = "56950944482";
const DEFAULT_MESSAGE = "Hola Branco, quiero hacer una consulta.";

const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

/* WhatsApp en todos los .js-wa-link */
function APPLY_WHATSAPP_LINKS(number=WHATSAPP_NUMBER_DEFAULT, message=DEFAULT_MESSAGE){
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  $$(".js-wa-link").forEach(a => a.href = url);
}

/* Menú móvil accesible */
function setupMenu(){
  const btn = $("#menuBtn"); const menu = $("#menu");
  if(!btn || !menu) return;
  btn.addEventListener("click", ()=>{
    const show = !menu.classList.contains("show");
    menu.classList.toggle("show", show);
    btn.setAttribute("aria-expanded", show);
    if(show) menu.querySelector("a")?.focus();
  });
  menu.addEventListener("click", (e)=>{ if(e.target.tagName==="A"){ menu.classList.remove("show"); btn.setAttribute("aria-expanded","false"); }});
}

/* Respeta prefers-reduced-motion para el video del hero */
function respectReducedMotion(){
  const video = $("#bgVideo");
  if(!video) return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = ()=>{
    if(mq.matches){ video.pause(); video.removeAttribute("autoplay"); video.currentTime=0; }
    else{ video.muted = true; const p = video.play(); if(p && p.catch) p.catch(()=>{}); }
  };
  toggle();
  try{ mq.addEventListener("change", toggle); }catch{ mq.onchange = toggle; }
}

/* Formulario de contacto */
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).toLowerCase()); }
function showSnackbar(msg="Mensaje enviado ✅"){ const bar=$("#snackbar"); if(!bar) return; bar.textContent=msg; bar.setAttribute("data-show","true"); setTimeout(()=>bar.setAttribute("data-show","false"),2200); }
function setupForm(){
  const f = $("#contactForm"); if(!f) return;
  f.addEventListener("submit",(e)=>{
    e.preventDefault();
    const name=$("#name"), email=$("#email"), msg=$("#message");
    const errs=$$(".error", f); errs.forEach(err=>err.setAttribute("aria-hidden","true"));
    let ok=true;
    if(!name.value.trim()){ $("#err-name").setAttribute("aria-hidden","false"); ok=false; }
    if(!isValidEmail(email.value)){ $("#err-email").setAttribute("aria-hidden","false"); ok=false; }
    if(!msg.value.trim()){ $("#err-message").setAttribute("aria-hidden","false"); ok=false; }
    if(!ok){
      const first=errs.find(e=>e.getAttribute("aria-hidden")==="false");
      if(first){ const ctl=$("#"+first.id.replace("err-","")); ctl&&ctl.focus(); }
      return;
    }
    f.reset(); showSnackbar();
  });
}

/* Carrusel de Testimonios (1/2/4 por vista, autoplay 5s, pausa hover/focus, teclas) */
function setupTestimonialSlider(){
  const track = $("#sliderTrack");
  if(!track) return;
  const viewport = track.parentElement;
  const prevBtn = $("#prevBtn"), nextBtn = $("#nextBtn"), status = $("#sliderStatus");
  let itemsPerView = getItemsPerView(), index=0, timer=null;
  function getItemsPerView(){ if (matchMedia("(min-width:1024px)").matches) return 4; if (matchMedia("(min-width:640px)").matches) return 2; return 1; }
  function totalPages(){ return Math.max(1, Math.ceil(track.children.length / itemsPerView)); }
  function goTo(newIndex, animate=true){
    const pages = totalPages(); index = (newIndex + pages) % pages;
    const pageWidth = viewport.clientWidth;
    if(!animate){ track.style.transition="none"; }
    track.style.transform = `translateX(-${index * pageWidth}px)`;
    if(!animate){ track.getBoundingClientRect(); track.style.transition=""; }
    if(status) status.textContent = `Mostrando ${index+1} de ${pages}`;
  }
  function next(){ goTo(index+1); } function prev(){ goTo(index-1); }
  nextBtn?.addEventListener("click", next); prevBtn?.addEventListener("click", prev);
  viewport.addEventListener("keydown",(e)=>{ if(e.key==="ArrowRight"){e.preventDefault();next()} if(e.key==="ArrowLeft"){e.preventDefault();prev()} });
  function start(){ stop(); timer=setInterval(next,5000); } function stop(){ if(timer) clearInterval(timer); timer=null; }
  viewport.addEventListener("mouseenter", stop); viewport.addEventListener("mouseleave", start);
  viewport.addEventListener("focusin", stop); viewport.addEventListener("focusout", start);
  window.addEventListener("resize", ()=>{ const old=itemsPerView; itemsPerView=getItemsPerView(); if(old!==itemsPerView) goTo(0,false); });
  goTo(0,false); start();
}

/* Buscador + "paginación" simple en derechos.html */
function setupPostsSearch(){
  const q = $("#q"); const cat = $("#cat"); const wrap = $("#postsWrap"); const cards = $$(".post-card", wrap||document);
  if(!q || !wrap) return;
  function apply(){
    const t = q.value.trim().toLowerCase(); const c = (cat?.value||"").toLowerCase();
    cards.forEach(card=>{
      const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const meta  = card.dataset.cat?.toLowerCase() || "";
      const show = (!t || title.includes(t)) && (!c || c==="todas" || meta===c);
      card.style.display = show ? "" : "none";
    });
  }
  q.addEventListener("input", apply); cat?.addEventListener("change", apply); apply();
}

/* JSON-LD LegalService en todas las páginas */
function injectLegalServiceJSONLD(){
  const data = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Serlex Servicios Legales",
    "url": location.origin + location.pathname,
    "areaServed": "Chile",
    "telephone": "+56 9 5094 4482",
    "email": "contacto@serlex.cl",
    "address": {"@type":"PostalAddress","addressLocality":"Santiago","addressCountry":"CL"},
    "openingHours": "Mo-Fr 09:00-18:00",
    "employee": {"@type":"Person","name":"Branco Toro","jobTitle":"Abogado (placeholder)"},
    "sameAs": []
  };
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

/* Año en footer */
function setYear(){ const y = new Date().getFullYear(); $$("#year").forEach(el=>el.textContent=y); }

/* INIT */
document.addEventListener("DOMContentLoaded", ()=>{
  APPLY_WHATSAPP_LINKS();
  setupMenu();
  respectReducedMotion();
  setupForm();
  setupTestimonialSlider();
  setupPostsSearch();
  injectLegalServiceJSONLD();
  setYear();
});
