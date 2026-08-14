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

/* Curated current ROVIQ platform set. Keep station/tow concept art out of this gallery. */
const PLATFORM_IMAGES = [
  ["/images/Roviq AI Auto Service Dashboard.png", "Roviq automotive service dashboard"],
  ["/images/1.png", "Roviq customer platform interface"],
  ["/images/2.png", "Roviq diagnostic platform interface"],
  ["/images/3.png", "Roviq service partner platform interface"],
  ["/images/4.png", "Roviq parts platform interface"],
  ["/images/5.png", "Roviq mobility platform interface"],
  ["/images/6.png", "Roviq coordination platform interface"],
  ["/images/8.png", "Roviq platform interface"]
];

export function roviqPage(c) {
  return `
<style>
  .roviq-visual .media-full{height:auto!important;overflow:visible!important;box-shadow:0 12px 34px rgba(11,37,69,.12)}
  .roviq-visual .media-full img{display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important}
  .roviq-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;margin-top:2rem;align-items:start}
  .roviq-gallery-item{background:#fff;border:1px solid var(--line);border-radius:14px;padding:1rem;box-shadow:0 8px 24px rgba(11,37,69,.07);min-width:0}
  .roviq-gallery-item .media-full{border:0;border-radius:8px;background:#f7f4ec;box-shadow:none}
  .roviq-gallery-item img{max-height:620px!important;margin:auto!important}
  @media(max-width:760px){.roviq-gallery{grid-template-columns:1fr}.roviq-gallery-item{padding:.65rem}}
</style>

<section class="hero section--tight"><div class="container"><div class="grid grid--2" style="align-items:center;"><div><span class="eyebrow">${escapeHtml(c["roviq.hero_eyebrow"])}</span><h1>${escapeHtml(c["roviq.hero_heading"])}</h1><p class="lead">${escapeHtml(c["roviq.hero_sub"])}</p></div><div style="text-align:center;"><img src="/brand/roviq-lockup.png" alt="Roviq — Stations, Fleet, Parts, People." style="max-width:280px;width:100%;margin:0 auto;border-radius:12px;"></div></div></div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">How it works</span><h2>${escapeHtml(c["roviq.howitworks_heading"])}</h2>${renderBullets(c["roviq.howitworks_steps"])}</div></section>

<section class="section"><div class="container"><div class="grid grid--2" style="align-items:center;gap:2.5rem;"><div><span class="eyebrow">One coordination layer</span><h2>${escapeHtml(c["roviq.core_heading"])}</h2>${richText(c["roviq.core_body"])}<p class="pullquote" style="font-size:1rem;">${escapeHtml(c["roviq.core_flow"])}</p></div><div class="roviq-visual">${mediaFull("/images/Roviq AI Auto Service Dashboard.png","Roviq automotive service dashboard concept")}</div></div></div></section>

<section class="section section--navy"><div class="container"><span class="eyebrow">Multiple front ends. One coordinated backend.</span><h2>Built around each participant in the service journey</h2><p class="lead" style="max-width:860px;">Roviq presents the right interface to each participant while keeping the service journey connected behind the scenes. Public materials describe the experience and network value without exposing proprietary matching, scoring, routing, or decision logic.</p></div></section>

<section class="section"><div class="container"><span class="eyebrow">Role-based experiences</span><h2>Different doors into the same coordinated system</h2><div class="grid grid--3">${FRONT_ENDS.map((f)=>`<div class="card card--accent-${f.accent}"><h3>${f.title}</h3><p>${escapeHtml(c[`roviq.frontend_${f.key}_body`])}</p></div>`).join("\n")}</div></div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Platform concepts</span><h2>ROVIQ interfaces and service coordination in practice</h2><p class="lead" style="max-width:820px;">A curated view of the current ROVIQ digital interfaces. Repeated towing imagery and unrelated brand explorations are intentionally excluded.</p><div class="roviq-gallery roviq-visual">${PLATFORM_IMAGES.map(([src,alt])=>`<div class="roviq-gallery-item">${mediaFull(src,alt)}</div>`).join("\n")}</div></div></section>

<section class="section"><div class="container"><span class="eyebrow">Partner network</span><h2>${escapeHtml(c["roviq.dealership_heading"])}</h2>${richText(c["roviq.dealership_body"])}${renderBullets(c["roviq.dealership_pillars"])}</div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Diagnostics</span><h2>${escapeHtml(c["roviq.diagnostic_partners_heading"])}</h2>${richText(c["roviq.diagnostic_partners_body"])}<p class="pullquote" style="font-size:1rem;">${escapeHtml(c["roviq.diagnostic_partners_flow"])}</p></div></section>
<section class="section"><div class="container"><span class="eyebrow">Mobility</span><h2>${escapeHtml(c["roviq.mobility_heading"])}</h2>${richText(c["roviq.mobility_body"])}</div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Connected capacity</span><h2>${escapeHtml(c["roviq.capacity_heading"])}</h2>${richText(c["roviq.capacity_body"])}</div></section>
<section class="section section--navy"><div class="container"><span class="eyebrow">Why Roviq</span><h2>Coordination instead of fragmentation</h2><p class="lead" style="max-width:900px;">Vehicle service today spans owners, diagnostics, repair facilities, dealerships, parts providers, towing and mobility. Roviq is designed to connect those handoffs into one managed journey while each business keeps its own operational role.</p><p class="pullquote">&ldquo;${escapeHtml(c["roviq.pullquote"])}&rdquo;</p></div></section>
<section class="section"><div class="container"><span class="eyebrow">The ecosystem</span><h2>${escapeHtml(c["roviq.station_teaser_heading"])}</h2>${richText(c["roviq.station_teaser_body"])}<a href="/station" class="btn btn--navy" style="margin-top:1rem;">See Roviq Station &rarr;</a></div></section>
<section class="section section--cream-alt"><div class="container"><span class="eyebrow">For partners</span><h2>${escapeHtml(c["roviq.partners_heading"])}</h2><div class="grid grid--3">${PARTNER_TYPES.map((p)=>`<div class="card card--accent-${p.accent}"><h3>${p.title}</h3><p>${escapeHtml(c[`roviq.partners_${p.key}_body`])}</p><a href="/about" class="btn btn--navy" style="margin-top:.75rem;font-size:.85rem;padding:.5rem .9rem;">${p.cta} &rarr;</a></div>`).join("\n")}</div></div></section>
<section class="section section--navy"><div class="container"><span class="eyebrow">${escapeHtml(c["roviq.why_heading"])}</span><h2>Built to be trusted with the whole journey</h2>${renderBullets(c["roviq.why_pillars"])}</div></section>
`;
}
