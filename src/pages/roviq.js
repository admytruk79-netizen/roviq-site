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

export function roviqPage(c) {
  return `
<section class="hero section--tight"><div class="container"><div class="grid grid--2" style="align-items:center;"><div><span class="eyebrow">Automotive service coordination</span><h1>${escapeHtml(c["roviq.hero_heading"] || "One engine behind the automotive journey")}</h1><p class="lead">ROVIQ connects vehicle owners, diagnostics, repair, parts, towing, mobility and physical infrastructure through one coordinated platform.</p><p class="lead"><strong>Multiple front ends. One coordinated backend. One ROVIQ engine.</strong></p></div><div style="text-align:center;"><img src="/brand/roviq-lockup.png" alt="Roviq — Stations, Fleet, Parts, People." style="max-width:280px;width:100%;margin:0 auto;border-radius:12px;"></div></div></div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">What ROVIQ does</span><h2>Turns fragmented service steps into one connected journey.</h2><div class="grid grid--3"><div class="card card--accent-navy"><h3>For drivers</h3><p>One place to begin a service journey, understand the next step and stay connected as the vehicle moves between providers.</p></div><div class="card card--accent-teal"><h3>For service partners</h3><p>Role-specific tools that improve visibility, handoffs and coordination without forcing every participant into the same interface.</p></div><div class="card card--accent-gold"><h3>For the network</h3><p>A shared coordination layer linking software experiences with real-world automotive capacity and infrastructure.</p></div></div></div></section>

<section class="section" id="shop"><div class="container"><span class="eyebrow">Five role-based experiences</span><h2>Different doors into the same platform.</h2><div class="grid grid--3">${FRONT_ENDS.map((f)=>`<div class="card card--accent-${f.accent}"><h3>${f.title}</h3><p>${escapeHtml(c[`roviq.frontend_${f.key}_body`] || "A role-specific ROVIQ experience connected to the shared coordination layer.")}</p></div>`).join("\n")}</div><div class="roviq-app-showcase"><div class="roviq-app-frame">${mediaFull("/images/Roviq AI Auto Service Dashboard.png","Roviq AI auto service dashboard concept")}</div><div class="roviq-app-frame">${mediaFull("/images/Roviq Smart Mobility Network Mockup.png","Roviq smart mobility network app concept")}</div></div><p class="roviq-app-caption">Selected interface concepts illustrate the product direction. Internal routing logic, scoring, decision rules and proprietary data architecture are not published.</p></div></section>

<section class="section section--navy"><div class="container"><span class="eyebrow">Connected handoffs</span><h2>From request to resolution without losing the thread.</h2><p class="lead">ROVIQ is designed to keep the customer journey connected as responsibility moves between diagnostics, service, parts, transport and mobility providers.</p><div class="roviq-tow-feature"><div class="roviq-tow-image">${mediaFull("/images/Roviq Station_ Tow and Parts Hub.png","Roviq tow truck and vehicle transport handoff")}</div><div><span class="eyebrow">Vehicle transport &amp; towing</span><h3>Transport becomes part of the service journey.</h3><p>When a vehicle needs to move, the handoff can remain connected to the surrounding diagnostic, repair and customer experience instead of becoming a separate dead end.</p></div></div></div></section>

<section class="section section--cream-alt" id="mobility"><div class="container"><span class="eyebrow">Mobility</span><h2>Support the customer while the vehicle is being serviced.</h2><p>ROVIQ’s wider mobility layer is designed to coordinate the practical gap between handing over a vehicle and getting it back — connecting available transport options into the same service experience.</p></div></section>

<section class="section"><div class="container"><span class="eyebrow">Physical + digital</span><h2>ROVIQ Station extends the platform into the real world.</h2><p>ROVIQ Station is the physical expression of the same ecosystem: fuel, charging, food, retail, vehicle care and selected automotive service handoffs brought together in one branded hub.</p><a href="/station" class="btn btn--outline" style="margin-top:1rem;">Explore ROVIQ Station &rarr;</a></div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Partners</span><h2>Built for the businesses already serving vehicles.</h2><div class="grid grid--3">${PARTNER_TYPES.map((p)=>`<div class="card card--accent-${p.accent}"><h3>${p.title}</h3><p>${escapeHtml(c[`roviq.partners_${p.key}_body`] || "A connected partner role within the ROVIQ service ecosystem.")}</p><a href="/contact" class="btn btn--outline" style="margin-top:.75rem;font-size:.85rem;padding:.5rem .9rem;">${p.cta} &rarr;</a></div>`).join("\n")}</div></div></section>

<section class="section section--navy"><div class="container"><span class="eyebrow">Public architecture</span><h2>Enough to understand the system. Not enough to copy it.</h2><p class="lead">The public site describes the participant roles, customer value and ecosystem structure. Matching algorithms, scoring weights, internal decision rules, partner-routing logic, proprietary data models and detailed unit economics remain private.</p></div></section>

<section class="section"><div class="container"><span class="eyebrow">Get involved</span><h2>Partnership, investment and pilot conversations.</h2><p>ROVIQ is actively developing the platform and partner network. For deeper technical, commercial or investment materials, contact the team directly.</p><a href="/contact" class="btn btn--gold" style="margin-top:1rem;">Contact ROVIQ &rarr;</a></div></section>
`;
}
