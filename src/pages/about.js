import { richText, escapeHtml } from "../layout.js";

export function aboutPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <h1>${escapeHtml(c["about.hero_heading"])}</h1>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Founder story</span>
    <h2>${escapeHtml(c["about.founder_heading"])}</h2>
    ${richText(c["about.founder_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Team</span>
    <h2>${escapeHtml(c["about.team_heading"])}</h2>
    ${richText(c["about.team_body"])}
  </div>
</section>
`;
}
