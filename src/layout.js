import { CSS } from "./styles-dark.js";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/roviq", label: "Platform" },
  { href: "/station", label: "Station" },
  { href: "/#vehicle-local", label: "Vehicle Local" },
  { href: "/about", label: "About" },
  { href: "/#team", label: "Team" },
  { href: "/contact", label: "Contact" }
];

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
export function richText(str) {
  return String(str ?? "").split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("\n");
}
export function renderList(str) {
  const lines=String(str??"").split("\n").map((l)=>l.trim()).filter(Boolean);
  return `<ol class="steps">${lines.map((l)=>`<li>${escapeHtml(l)}</li>`).join("")}</ol>`;
}
export function renderStats(str) {
  const lines=String(str??"").split("\n").map((l)=>l.trim()).filter(Boolean);
  return `<div class="stat-grid">${lines.map((l)=>{const idx=l.indexOf("|");const value=idx===-1?l:l.slice(0,idx).trim();const label=idx===-1?"":l.slice(idx+1).trim();return `<div class="stat-tile"><div class="stat-value">${escapeHtml(value)}</div><div class="stat-label">${escapeHtml(label)}</div></div>`;}).join("")}</div>`;
}
export function renderBullets(str) {
  const lines=String(str??"").split("\n").map((l)=>l.trim()).filter(Boolean);
  return `<ul class="bullets">${lines.map((l)=>{const idx=l.indexOf("—");if(idx===-1)return `<li>${escapeHtml(l)}</li>`;return `<li><strong>${escapeHtml(l.slice(0,idx).trim())}</strong> — ${escapeHtml(l.slice(idx+1).trim())}</li>`;}).join("")}</ul>`;
}
export function mediaBlock(url,alt,placeholderLabel){if(url)return `<div class="media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;return `<div class="media"><div class="media-placeholder">${escapeHtml(placeholderLabel)}<br><small>Add a real photo URL in /admin</small></div></div>`;}
export function diagramImage(src,alt,caption){return `<div class="diagram-frame"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"></div><p class="diagram-caption">${escapeHtml(caption)}</p>`;}
export function mediaFull(url,alt,ratio){if(!url)return "";const style=ratio?` style="aspect-ratio:${ratio};object-fit:contain"`:"";return `<div class="media-full"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"${style}></div>`;}

function brandLockup() {
  return `<span class="brand-lockup" aria-label="ROVIQ"><img src="/brand/roviq-mark-2026.svg?v=20260917" alt="" aria-hidden="true"><span>ROVIQ</span></span>`;
}

function sharedBanner() {
  return `<section class="site-shared-banner" aria-label="ROVIQ intelligent service coordination">
    <img class="site-shared-banner-bg" src="/images/roviq-hero-forecourt.png?v=20260917b" alt="ROVIQ automotive mobility hub at dusk">
    <div class="site-shared-banner-overlay"></div>
    <div class="site-shared-banner-content">
      <div class="site-shared-banner-kicker">DRIVERS <span>•</span> PARTNERS <span>•</span> STRONGER TOGETHER</div>
      <div class="site-shared-banner-logo">${brandLockup()}</div>
      <div class="site-shared-banner-title">INTELLIGENT SERVICE COORDINATION</div>
      <div class="site-shared-banner-subline">FOR A MORE MOBILE TOMORROW</div>
    </div>
  </section>`;
}

export function renderPage({title,description,activePath,body}) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description||"")}"><link rel="icon" href="/brand/roviq-mark-2026.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${CSS}
.brand-lockup{display:flex;align-items:center;gap:.65rem;color:#f4f2ed;font-family:Inter,sans-serif;font-weight:800;letter-spacing:.035em;white-space:nowrap}.brand-lockup img{display:block;width:72px;height:auto;flex:0 0 auto}.brand-lockup span{font-size:2.15rem;line-height:1}.site-header .brand-lockup{max-width:calc(100vw - 115px)}
.site-shared-banner{position:relative;overflow:hidden;background:#07131f;min-height:420px;height:min(47vw,620px);border-bottom:1px solid rgba(200,146,69,.25)}
.site-shared-banner-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 55%;display:block}
.site-shared-banner-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,16,.56),rgba(3,10,16,.18) 42%,rgba(3,10,16,.32)),linear-gradient(180deg,rgba(3,10,16,.08),rgba(3,10,16,.34))}
.site-shared-banner-content{position:absolute;left:6vw;top:50%;transform:translateY(-50%);width:min(620px,52vw);padding:1.25rem 1.4rem 1.4rem;background:rgba(4,12,20,.43);border-left:3px solid #e46e35;backdrop-filter:blur(2px)}
.site-shared-banner-kicker{font:600 .82rem/1.4 Inter,sans-serif;letter-spacing:.13em;color:#e46e35}.site-shared-banner-kicker span{color:#f4f2ed;opacity:.7;padding:0 .18rem}
.site-shared-banner-logo{margin:.7rem 0 .45rem}.site-shared-banner-logo .brand-lockup{gap:.8rem}.site-shared-banner-logo .brand-lockup img{width:88px}.site-shared-banner-logo .brand-lockup span{font-size:clamp(3rem,5.5vw,5.9rem);letter-spacing:.02em}
.site-shared-banner-title{font:700 clamp(1.15rem,2.1vw,2.2rem)/1.08 Inter,sans-serif;letter-spacing:.08em;color:#f4f2ed}.site-shared-banner-subline{margin-top:.72rem;font:600 clamp(.72rem,1.15vw,1rem)/1.3 Inter,sans-serif;letter-spacing:.18em;color:#e46e35}
@media(max-width:560px){
  .section>.container{padding-left:1.05rem!important;padding-right:1.05rem!important}
  .roviq-tow-feature{margin-left:0!important;margin-right:0!important;padding:.75rem!important;gap:1rem!important;border-radius:10px!important}
  .roviq-tow-feature .media-full{border-radius:8px!important}
  .roviq-tow-feature>div:last-child{padding:.25rem .35rem .5rem!important}
  .roviq-tow-feature h3{font-size:1.12rem!important;line-height:1.35!important}
  .roviq-tow-feature p{font-size:.96rem!important;line-height:1.55!important}
  .grid>.card{padding:1.25rem!important}
  .site-header .brand-lockup{gap:.42rem}.site-header .brand-lockup img{width:54px}.site-header .brand-lockup span{font-size:1.72rem}
  .site-shared-banner{height:360px;min-height:360px}.site-shared-banner-bg{object-position:center 55%}.site-shared-banner-overlay{background:linear-gradient(180deg,rgba(3,10,16,.12),rgba(3,10,16,.24)),linear-gradient(90deg,rgba(3,10,16,.5),rgba(3,10,16,.12))}.site-shared-banner-content{left:1rem;right:1rem;top:auto;bottom:1.1rem;transform:none;width:auto;padding:.85rem .9rem 1rem}.site-shared-banner-kicker{font-size:.56rem;letter-spacing:.08em}.site-shared-banner-logo{margin:.5rem 0 .35rem}.site-shared-banner-logo .brand-lockup img{width:58px}.site-shared-banner-logo .brand-lockup span{font-size:2.25rem}.site-shared-banner-title{font-size:.92rem;letter-spacing:.055em}.site-shared-banner-subline{font-size:.56rem;letter-spacing:.12em;margin-top:.5rem}
}
</style><script>document.documentElement.classList.add('js');</script></head><body><header class="site-header"><div class="container"><a href="/" class="wordmark" aria-label="ROVIQ home">${brandLockup()}</a><button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">&#9776;</button><nav class="site-nav" id="siteNav">${NAV_LINKS.map((l)=>`<a href="${l.href}" class="${l.href===activePath?"active":""}">${l.label}</a>`).join("\n")}<a href="/contact" class="nav-access">Request Access</a></nav></div></header>${sharedBanner()}<main>${body}</main><footer class="site-footer"><div class="container"><div>&copy; ${new Date().getFullYear()} ROVIQ. Automotive service coordination, physical infrastructure and local discovery.</div><div><a href="/contact">Contact</a> &middot; <a href="/admin">Admin</a></div></div></footer><script>document.getElementById('navToggle').addEventListener('click',function(){document.getElementById('siteNav').classList.toggle('open');});if(location.hash){window.addEventListener('load',function(){var target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView();});}if('IntersectionObserver' in window){var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});document.querySelectorAll('main section:not(.hero)').forEach(function(el){revealObserver.observe(el);});}else{document.querySelectorAll('main section').forEach(function(el){el.classList.add('is-visible');});}</script></body></html>`;
}
