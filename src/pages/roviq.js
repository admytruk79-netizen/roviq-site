import { richText, renderBullets, mediaFull, escapeHtml } from "../layout.js";

const FRONT_ENDS = [
  { key: "customer", title: "Customer App", accent: "navy" },
  { key: "diagnostic", title: "Diagnostic App", accent: "teal" },
  { key: "shop", title: "Shop Partner App", accent: "gold" },
  { key: "vendor", title: "Parts Vendor App", accent: "navy" },
  { key: "tow", title: "Tow Truck App", accent: "teal" }
];

const PARTNER_TYPES = [
  { key: "dealership", title: "Dealerships", accent: "navy", cta: "Explore Dealership Partnerships" },
  { key: "diagnostic", title: "Diagnostic Partners", accent: "teal", cta: "Become a Diagnostic Partner" },
  { key: "repair", title: "Repair & Service Providers", accent: "gold", cta: "Join as a Repair Partner" },
  { key: "transport", title: "Vehicle Transport & Towing", accent: "navy", cta: "Partner for Transport" },
  { key: "mobility", title: "Mobility Providers", accent: "teal", cta: "Explore Mobility Partnerships" }
];

const PLATFORM_IMAGES = [
  ["/images/Roviq AI Auto Service Dashboard.png", "Roviq automotive service dashboard"],
  ["/images/Roviq Smart Mobility Network Mockup.png", "Roviq smart mobility network platform concept"]
];

export function roviqPage(c) {
  return `
<style>
  .roviq-visual .media-full{height:auto!important;overflow:visible!important;box-shadow:0 12px 34px rgba(11,37,69,.12)}
  .roviq-visual .media-full img{display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important}
  .roviq-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;margin-top:2rem;align-items:stretch}
  .roviq-gallery-item{background:#fff;border:1px solid var(--line);border-radius:14px;padding:1rem;box-shadow:0 8px 24px rgba(11,37,69,.07);min-width:0;display:flex;align-items:center;justify-content:center;aspect-ratio:4/3}
  .roviq-gallery-item .media-full{border:0;border-radius:8px;background:#f7f4ec;box-shadow:none;width:100%;height:100%!important;display:flex;align-items:center;justify-content:center;overflow:hidden!important}
  .roviq-gallery-item .media-full img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
  .transport-visual{max-width:430px;margin:2rem auto 0;padding:.75rem;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 24px rgba(11,37,69,.07)}
  .transport-visual .media-full{height:250px!important;display:flex;align-items:center;justify-content:center;overflow:hidden!important;background:#f7f4ec;border:0;box-shadow:none}
  .transport-visual .media-full img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
  .transport-visual p{margin:.65rem .25rem .15rem;font-size:.82rem;color:var(--muted);text-align:center}
  .local-card{padding:2.5rem;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 10px 28px rgba(11,37,69,.07)}
  .local-tags{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.25rem}.local-tags span{padding:.45rem .75rem;border-radius:999px;background:#f3efe4;font-size:.82rem;font-weight:700;color:var(--navy)}
  @media(max-width:760px){.roviq-gallery{grid-template-columns:1fr}.roviq-gallery-item{padding:.65rem;aspect-ratio:auto}.roviq-gallery-item .media-full{height:auto!important}.roviq-gallery-item .media-full img{height:auto!important}.transport-visual{max-width:100%}.transport-visual .media-full{height:auto!important}.transport-visual .media-full img{height:auto!important}.local-card{padding:1.6rem}}
</style>
<section class="hero section--tight"><div class="container"><div class="grid grid--2" style="align-items:center;"><div><span class="eyebrow">${escapeHtml(c["roviq.hero_eyebrow"])}</span><h1>${escapeHtml(c["roviq.hero_heading"])}</h1><p class="lead">${escapeHtml(c["roviq.hero_sub"])}</p></div><div style="text-align:center;"><img src="/brand/roviq-lockup.png" alt="Roviq — Stations, Fleet, Parts, People." style="max-width:280px;width:100%;margin:0 auto;border-radius:12px;"></div></div></div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">How it works</span><h2>${escapeHtml(c["roviq.howitworks_heading"])}</h2>${renderBullets(c["roviq.howitworks_steps"])}</div></section>
<section class="section"><div class="container"><div class="grid grid--2" style="align-items:center;gap:2.5rem;"><div><span class="eyebrow">One coordination layer</span><h2>${escapeHtml(c["roviq.core_heading"])}</h2>${richText(c["roviq.core_body"])}<p class="pullquote" style="font-size:1rem;">${escapeHtml(c["roviq.core_flow"])}</p></div><div class="roviq-visual">${mediaFull("/images/Roviq AI Auto Service Dashboard.png","Roviq automotive service dashboard concept")}</div></div></div></section>
<section class="section section--navy"><div class="container"><span class="eyebrow">Multiple front ends. One coordinated backend.</span><h2>Built around each participant in the service journey</h2><p class="lead" style="max-width:860px;">Roviq presents the right interface to each participant while keeping the service journey connected behind the scenes. Public materials describe the experience and network value without exposing proprietary matching, scoring, routing, or decision logic.</p></div></section>
<section class="section"><div class="container"><span class="eyebrow">Role-based experiences</span><h2>Different doors into the same coordinated system</h2><div class="grid grid--3">${FRONT_ENDS.map((f)=>`<div class="card card--accent-${f.accent}"><h3>${f.title}</h3><p>${escapeHtml(c[`roviq.frontend_${f.key}_body`])}</p></div>`).join("\n")}</div></div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Platform concepts</span><h2>ROVIQ interfaces and service coordination in practice</h2><p class="lead" style="max-width:820px;">A focused view of the ROVIQ digital platform. Station renders, unrelated brand concepts and duplicate towing visuals are excluded from this page.</p><div class="roviq-gallery roviq-visual">${PLATFORM_IMAGES.map(([src,alt])=>`<div class="roviq-gallery-item">${mediaFull(src,alt)}</div>`).join("\n")}</div></div></section>
<section class="section"><div class="container"><span class="eyebrow">Partner network</span><h2>${escapeHtml(c["roviq.dealership_heading"])}</h2>${richText(c["roviq.dealership_body"])}${renderBullets(c["roviq.dealership_pillars"])}<div class="transport-visual roviq-visual">${mediaFull("/images/Roviq Station_ Tow and Parts Hub.png","Roviq towing and vehicle transport partner concept")}<p>Towing and vehicle transport are one connected handoff within the wider ROVIQ service network.</p></div></div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Diagnostics</span><h2>${escapeHtml(c["roviq.diagnostic_partners_heading"])}</h2>${richText(c["roviq.diagnostic_partners_body"])}<p class="pullquote" style="font-size:1rem;">${escapeHtml(c["roviq.diagnostic_partners_flow"])}</p></div></section>
<section class="section"><div class="container"><span class="eyebrow">Mobility</span><h2>${escapeHtml(c["roviq.mobility_heading"])}</h2>${richText(c["roviq.mobility_body"])}</div></section>
<section class="section section--cream-alt"><div class="container"><div class="local-card"><span class="eyebrow">In development</span><h2>ROVIQ Vehicle Local</h2><p class="lead">Discover what is actually worth stopping for.</p><p>Vehicle Local is a driver-powered local discovery experience for people passing through, working on the road, or arriving somewhere new. It is designed around contributed and verified places rather than another generic directory: independent food and coffee, unusual local finds, useful stops, viewpoints and nature.</p><p>The goal is to turn knowledge from people who actually travel through a place into a more useful local layer for the wider ROVIQ ecosystem.</p><div class="local-tags"><span>Food</span><span>Coffee</span><span>Local finds</span><span>Nature</span><span>Useful stops</span></div></div></div></section>
<section class="section"><div class="container"><span class="eyebrow">Connected capacity</span><h2>${escapeHtml(c["roviq.capacity_heading"])}</h2>${richText(c["roviq.capacity_body"])}</div></section>
<section class="section section--navy"><div class="container"><span class="eyebrow">Why Roviq</span><h2>Coordination instead of fragmentation</h2><p class="lead" style="max-width:900px;">Vehicle service today spans owners, diagnostics, repair facilities, dealerships, parts providers, towing and mobility. Roviq is designed to connect those handoffs into one managed journey while each business keeps its own operational role.</p><p class="pullquote">&ldquo;${escapeHtml(c["roviq.pullquote"])}&rdquo;</p></div></section>
<section class="section"><div class="container"><span class="eyebrow">The ecosystem</span><h2>${escapeHtml(c["roviq.station_teaser_heading"])}</h2>${richText(c["roviq.station_teaser_body"])}<a href="/station" class="btn btn--navy" style="margin-top:1rem;">See Roviq Station &rarr;</a></div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">For partners</span><h2>${escapeHtml(c["roviq.partners_heading"])}</h2><div class="grid grid--3">${PARTNER_TYPES.map((p)=>`<div class="card card--accent-${p.accent}"><h3>${p.title}</h3><p>${escapeHtml(c[`roviq.partners_${p.key}_body`])}</p><a href="/about" class="btn btn--navy" style="margin-top:.75rem;font-size:.85rem;padding:.5rem .9rem;">${p.cta} &rarr;</a></div>`).join("\n")}</div></div></section>
<section class="section section--navy"><div class="container"><span class="eyebrow">${escapeHtml(c["roviq.why_heading"])}</span><h2>Built to be trusted with the whole journey</h2>${renderBullets(c["roviq.why_pillars"])}</div></section>
`;
}
