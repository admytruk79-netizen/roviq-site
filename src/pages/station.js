import { richText, mediaFull, renderBullets, escapeHtml } from "../layout.js";
import { STATION_IMAGES } from "../../content/station-images.js";

const SERVICES = [
  { key: "fuel", title: "Fuel", accent: "gold" },
  { key: "ev", title: "EV Charging", accent: "teal" },
  { key: "cafe", title: "Café", accent: "navy" },
  { key: "wine", title: "Market & Retail", accent: "gold" },
  { key: "wash", title: "Car Wash", accent: "teal" }
];

export function stationPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <div class="grid grid--2" style="align-items:center;">
      <div>
        <span class="eyebrow">${escapeHtml(c["station.hero_eyebrow"])}</span>
        <h1>${escapeHtml(c["station.hero_heading"])}</h1>
        <p class="lead" style="font-family:'Cinzel', serif; color: var(--gold-light); font-size:1.2rem;">${escapeHtml(c["station.tagline"])}</p>
        <p class="lead">${escapeHtml(c["station.hero_sub"])}</p>
      </div>
      ${mediaFull(STATION_IMAGES["hero-forecourt"].file, STATION_IMAGES["hero-forecourt"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The concept</span>
    <h2>${escapeHtml(c["station.concept_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>${richText(c["station.concept_body"])}</div>
      ${mediaFull(STATION_IMAGES["forecourt-secondary"].file, STATION_IMAGES["forecourt-secondary"].alt)}
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">A physical node in the Roviq network</span>
    <h2>More than a stop: a coordinated automotive service hub</h2>
    <p class="lead" style="max-width:900px;">Roviq Station is envisioned as a premium travel-center format that can combine conventional fuel, EV charging, café and market retail, vehicle care, and selected Roviq-enabled service handoffs in one recognizable location.</p>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Product &amp; service mix</span>
    <h2>Multiple needs, one visit</h2>
    <div class="grid grid--5">
      ${SERVICES.map(
        (s) => `<div class="card card--accent-${s.accent}">
          <h3>${s.title}</h3>
          <p>${escapeHtml(c[`station.service_${s.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
    <div class="grid grid--2" style="margin-top:2rem;">
      ${mediaFull(c["station.image_fuel"], "Roviq Station fuel and forecourt detail")}
      ${mediaFull(STATION_IMAGES["ev-charging"].file, STATION_IMAGES["ev-charging"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Customer experience</span>
    <h2>${escapeHtml(c["station.layout_heading"])}</h2>
    ${richText(c["station.layout_body"])}
    <div style="margin-top:1.5rem;">
      ${mediaFull(STATION_IMAGES["interior-cafe"].file, STATION_IMAGES["interior-cafe"].alt)}
      <p class="diagram-caption">A travel-center interior designed to keep quick-stop convenience distinct from café dwell time while remaining clearly part of the forecourt experience.</p>
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Market entry</span>
    <h2>${escapeHtml(c["station.portland_heading"])}</h2>
    ${richText(c["station.portland_body"])}
    ${mediaFull(c["station.image_portland"], "Portland-area Roviq Station concept")}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Future modules</span>
    <h2>${escapeHtml(c["station.expansion_heading"])}</h2>
    ${richText(c["station.expansion_body"])}

    <div class="grid grid--3" style="margin-top:2rem; align-items:start;">
      <div class="card card--accent-rust">
        <h3>Motor Court <span class="tag-inline tag-inline--tier3">Concept</span></h3>
        <p>${escapeHtml(c["station.expansion_motor_court_body"])}</p>
        ${mediaFull(STATION_IMAGES["motorcourt"].file, STATION_IMAGES["motorcourt"].alt)}
      </div>

      <div class="card card--accent-rust">
        <h3>Swap Station <span class="tag-inline tag-inline--tier3">Concept</span></h3>
        <p>${escapeHtml(c["station.expansion_post_station_body"])}</p>
        ${mediaFull(STATION_IMAGES["swap-station"].file, STATION_IMAGES["swap-station"].alt)}
      </div>

      <div class="card card--accent-rust">
        <h3>Vehicle Relay <span class="tag-inline tag-inline--tier3">Concept</span></h3>
        <p>${escapeHtml(c["station.expansion_vehicle_relay_body"])}</p>
        ${mediaFull(STATION_IMAGES["relay-station"].file, STATION_IMAGES["relay-station"].alt)}
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Explore the connection</span>
    <h2>Physical infrastructure connected to the coordination platform</h2>
    <p class="lead">The Station concept is designed to complement Roviq's software layer rather than replace existing automotive businesses. It can serve as a visible service point, customer handoff location, and future network node.</p>
    <a href="/roviq-x-station" class="btn btn--outline" style="margin-top:1rem;">See Roviq × Station &rarr;</a>
  </div>
</section>
`;
}
