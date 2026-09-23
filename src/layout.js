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

// Locally generated WebP variants (see scripts/optimize-images.mjs). Keyed by
// the full-size path so mediaFull()/responsiveImg() can add a srcset for our
// own static images while still passing through admin-supplied URLs as-is
// (we can't generate resized variants for a photo an admin pastes in later).
export const RESPONSIVE_IMAGES = {
  "/images/roviq-hero-forecourt.webp": { small: "/images/roviq-hero-forecourt-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-forecourt-secondary.webp": { small: "/images/roviq-forecourt-secondary-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-ev-charging.webp": { small: "/images/roviq-ev-charging-sm.webp", w: 1639, h: 960, sw: 700 },
  "/images/roviq-portable-cafe.webp": { small: "/images/roviq-portable-cafe-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-oregon.webp": { small: "/images/roviq-oregon-sm.webp", w: 1536, h: 898, sw: 700 },
  "/images/roviq-interior-cafe.webp": { small: "/images/roviq-interior-cafe-sm.webp", w: 1642, h: 958, sw: 700 },
  "/images/roviq-motorcourt.webp": { small: "/images/roviq-motorcourt-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-swap-station.webp": { small: "/images/roviq-swap-station-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-relay-station.webp": { small: "/images/roviq-relay-station-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-car-wash.webp": { small: "/images/roviq-car-wash-sm.webp", w: 1448, h: 1086, sw: 700 },
  "/images/roviq-auto-service-dashboard.webp": { small: "/images/roviq-auto-service-dashboard-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-smart-mobility-network.webp": { small: "/images/roviq-smart-mobility-network-sm.webp", w: 1536, h: 1024, sw: 700 },
  "/images/roviq-vehicle-local-app.webp": { small: "/images/roviq-vehicle-local-app-sm.webp", w: 1024, h: 1536, sw: 700 },
  "/images/roviq-parts-locker.webp": { w: 517, h: 525 },
  "/images/roviq-tow-dropoff.webp": { w: 517, h: 525 }
};

// mediaFull's default two-column layouts collapse to one column at 820px
// (see the site-wide breakpoint in styles-dark.js), so below that the image
// is full viewport width; above it, roughly half the container.
const DEFAULT_SIZES = "(max-width:820px) 100vw, 50vw";

export function mediaFull(url,alt,ratio){
  if(!url)return "";
  const style=ratio?` style="aspect-ratio:${ratio};object-fit:contain"`:"";
  const r=RESPONSIVE_IMAGES[url];
  if(r){
    const dims=` width="${r.w}" height="${r.h}"`;
    const srcset=r.small?` srcset="${escapeHtml(r.small)} ${r.sw}w, ${escapeHtml(url)} ${r.w}w" sizes="${DEFAULT_SIZES}"`:"";
    return `<div class="media-full"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"${dims}${srcset}${style}></div>`;
  }
  return `<div class="media-full"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"${style}></div>`;
}

function brandLockup() {
  return `<span class="brand-lockup" aria-label="ROVIQ"><img src="/brand/roviq-mark-2026.svg?v=20260917" alt="" aria-hidden="true"><span>ROVIQ</span></span>`;
}

function sharedBanner() {
  return `<section class="site-shared-banner" aria-label="ROVIQ automotive service coordination">
    <img class="site-shared-banner-bg" src="/images/roviq-banner-site-hq.webp?v=20260917-hq2" alt="ROVIQ — Keeping You Moving Forward">
  </section>`;
}

export function renderPage({title,description,activePath,body}) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#071f35"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description||"")}"><link rel="icon" href="/brand/roviq-mark-2026.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${CSS}
.brand-lockup{display:flex;align-items:center;gap:.65rem;color:#f4f2ed;font-family:Inter,sans-serif;font-weight:800;letter-spacing:.035em;white-space:nowrap}.brand-lockup img{display:block;width:72px;height:auto;flex:0 0 auto}.brand-lockup span{font-size:2.15rem;line-height:1}.site-header .brand-lockup{max-width:calc(100vw - 115px)}
.site-shared-banner{position:relative;overflow:hidden;background:#07131f;border-bottom:1px solid rgba(200,146,69,.25)}
.site-shared-banner-bg{display:block;width:100%;height:clamp(150px,30vw,380px);object-fit:cover;object-position:center 38%;background:#07131f}
@media(max-width:560px){
  .section>.container{padding-left:1.05rem!important;padding-right:1.05rem!important}
  .roviq-tow-feature{margin-left:0!important;margin-right:0!important;padding:.75rem!important;gap:1rem!important;border-radius:10px!important}
  .roviq-tow-feature .media-full{border-radius:8px!important}
  .roviq-tow-feature>div:last-child{padding:.25rem .35rem .5rem!important}
  .roviq-tow-feature h3{font-size:1.12rem!important;line-height:1.35!important}
  .roviq-tow-feature p{font-size:.96rem!important;line-height:1.55!important}
  .grid>.card{padding:1.25rem!important}
  .site-header .brand-lockup{gap:.42rem}.site-header .brand-lockup img{width:54px}.site-header .brand-lockup span{font-size:1.72rem}
}
</style><script>document.documentElement.classList.add('js');</script></head><body><header class="site-header"><div class="container"><a href="/" class="wordmark" aria-label="ROVIQ home">${brandLockup()}</a><button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">&#9776;</button><nav class="site-nav" id="siteNav">${NAV_LINKS.map((l)=>`<a href="${l.href}" class="${l.href===activePath?"active":""}">${l.label}</a>`).join("\n")}<a href="/contact" class="nav-access">Request Access</a></nav></div></header>${sharedBanner()}<main>${body}</main><footer class="site-footer"><div class="container"><div>&copy; ${new Date().getFullYear()} ROVIQ. Automotive service coordination, physical infrastructure and local discovery.</div><div><a href="/contact">Contact</a> &middot; <a href="/admin">Admin</a></div></div></footer><script>
document.getElementById('navToggle').addEventListener('click',function(){document.getElementById('siteNav').classList.toggle('open');});if(location.hash){window.addEventListener('load',function(){var target=document.getElementById(location.hash.slice(1));if(target)target.scrollIntoView();});}if('IntersectionObserver' in window){var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});document.querySelectorAll('main section:not(.hero)').forEach(function(el){revealObserver.observe(el);});}else{document.querySelectorAll('main section').forEach(function(el){el.classList.add('is-visible');});}</script><script>if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));}</script>
</body></html>`;
}
