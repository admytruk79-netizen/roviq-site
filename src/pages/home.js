import { escapeHtml } from "../layout.js";

const ECOSYSTEM = [
  {
    title: "ROVIQ Core",
    body: "The coordination layer connecting drivers, service providers, parts, towing and handoffs into one managed journey.",
    image: "/images/Roviq AI Auto Service Dashboard.png",
    alt: "ROVIQ automotive service dashboard",
    href: "/roviq"
  },
  {
    title: "ROVIQ Station",
    body: "A premium physical hub combining fuel, charging, food, retail, vehicle care and selected service handoffs.",
    image: "/images/roviq-hero-forecourt.png",
    alt: "ROVIQ Station forecourt",
    href: "/station"
  },
  {
    title: "ROVIQ Shop",
    body: "A service-facing experience for diagnostics, repairs, workflow visibility and connected customer handoffs.",
    image: "/images/roviq-motorcourt.png",
    alt: "ROVIQ service and motor court concept",
    href: "/roviq#shop"
  },
  {
    title: "ROVIQ Mobility",
    body: "Connected towing, transport and mobility capacity supporting the wider automotive service network.",
    image: "/images/Roviq Smart Mobility Network Mockup.png",
    alt: "ROVIQ smart mobility network",
    href: "/roviq#mobility"
  },
  {
    title: "ROVIQ Parts",
    body: "Parts coordination and pickup concepts designed to connect supply, service providers and physical network nodes.",
    image: "/images/Roviq Station_ Tow and Parts Hub.png",
    alt: "ROVIQ parts and service hub concept",
    href: "/station"
  }
];

export function homePage(c) {
  const headline = c["home.headline"] || "The Automotive Service Coordination Platform";
  const sub = c["home.subheadline"] || "One network. Every journey.";
  return `
<section class="hero home-hero">
  <img class="home-hero-bg" src="/images/roviq-hero-forecourt.png" alt="ROVIQ Station at dusk">
  <div class="container">
    <div class="home-hero-copy">
      <h1>ROVIQ</h1>
      <h2>${escapeHtml(headline)}</h2>
      <div class="home-kicker">${escapeHtml(sub)}</div>
      <p class="lead">ROVIQ connects vehicle owners with the businesses and infrastructure that diagnose, maintain, repair, move, provision and support vehicles.</p>
      <p class="lead"><strong>Multiple front ends. One coordinated backend. One ROVIQ engine.</strong></p>
      <div class="cta-row">
        <a href="/roviq" class="btn btn--gold">Explore Platform</a>
        <a href="/station" class="btn btn--outline">Explore Station</a>
      </div>
    </div>
  </div>
</section>
<section class="section home-ecosystem"><div class="container"><div class="home-ecosystem-head"><span class="eyebrow">One ecosystem. Multiple front ends.</span><h2>Built around the whole automotive journey.</h2><p>Each ROVIQ experience serves a different participant while remaining connected to the same coordination layer, service network and operating discipline.</p></div><div class="home-ecosystem-grid">${ECOSYSTEM.map((item) => `<article class="eco-card"><div class="eco-card-media"><img src="${item.image}" alt="${item.alt}" loading="lazy"></div><div class="eco-card-body"><h3>${item.title}</h3><p>${item.body}</p><a href="${item.href}">Learn more &rarr;</a></div></article>`).join("\n")}</div></div></section>
<section class="vehicle-local" id="vehicle-local"><div class="container"><div class="vehicle-local-panel"><div class="vehicle-local-image"><img src="/images/Oregon.png" alt="Scenic Oregon destination representing Vehicle Local discovery" loading="lazy"></div><div class="vehicle-local-copy"><span class="status-chip">In development</span><h2>ROVIQ Vehicle Local</h2><p class="lead">Discover what’s actually worth stopping for.</p><p>A driver-powered local discovery experience for people passing through, working on the road, or arriving somewhere new. Vehicle Local surfaces useful places and local discoveries contributed through the ROVIQ community.</p><div class="local-tags"><span>Food</span><span>Coffee</span><span>Local finds</span><span>Nature</span><span>Useful stops</span></div></div></div></div></section>
<section class="section home-team" id="team"><div class="container"><div class="home-team-grid"><div><span class="eyebrow">Team &amp; progress</span><h2>Beyond concept. Development is underway.</h2><p>ROVIQ is being developed by a multidisciplinary team spanning software, finance, entrepreneurship, partnerships and business operations. Platform prototypes are in development while the Station and wider ecosystem continue to be refined.</p></div><div class="team-points"><div class="team-point"><strong>Technical development</strong><span>Platform architecture, coding and prototype development.</span></div><div class="team-point"><strong>Commercial &amp; financial</strong><span>Business planning, financial discipline and market development.</span></div><div class="team-point"><strong>Entrepreneurial experience</strong><span>Hands-on operating and product-building experience across multiple ventures.</span></div><div class="team-point"><strong>Partnership liaison</strong><span>Stakeholder introductions, relationship support and strategic connections.</span></div></div></div></div></section>
<section class="section home-contact" id="contact"><div class="container"><div class="contact-strip" style="grid-template-columns:1fr;"><div class="contact-tile" style="border-right:0;"><span class="eyebrow">Contact</span><h3>Get in touch</h3><p>Partnerships, investment, press, project questions or general enquiries — one contact point for ROVIQ.</p><a href="/contact">Contact ROVIQ &rarr;</a></div></div></div></section>`;
}
