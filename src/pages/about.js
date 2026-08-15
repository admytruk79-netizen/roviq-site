import { richText, escapeHtml } from "../layout.js";

export function aboutPage(c) {
  return `
<section class="hero section--tight"><div class="container"><h1>${escapeHtml(c["about.hero_heading"])}</h1></div></section>

<section class="section"><div class="container"><span class="eyebrow">Founder story</span><h2>${escapeHtml(c["about.founder_heading"])}</h2>${richText(c["about.founder_body"])}</div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Team</span><h2>A real operating team with complementary experience</h2><p class="lead" style="max-width:860px;">ROVIQ is being developed by a multidisciplinary team spanning software and platform development, finance, entrepreneurship, commercial operations and stakeholder relationships.</p><div class="grid grid--3" style="margin-top:1.75rem;"><div class="card card--accent-navy"><h3>Technology &amp; product</h3><p>Hands-on software and platform-building capability, including experience creating connected digital products and moving ideas into working prototypes.</p></div><div class="card card--accent-gold"><h3>Business &amp; finance</h3><p>Entrepreneurial and financial experience across operating businesses, commercial planning and building new products in real-world markets.</p></div><div class="card card--accent-teal"><h3>Partnerships &amp; liaison</h3><p>Relationship-building and stakeholder coordination that help connect the project with partners, communities and the people needed to move it forward.</p></div></div><div style="margin-top:1.75rem;">${richText(c["about.team_body"])}</div></div></section>

<section class="section"><div class="container"><span class="eyebrow">Project status</span><h2>Beyond concept — prototype work is underway</h2><p class="lead" style="max-width:850px;">The ROVIQ ecosystem has moved beyond a presentation-stage concept. Product definition, platform prototyping and the physical Station model are being developed in parallel, with individual components advancing at different stages.</p></div></section>

<section class="section section--cream-alt"><div class="container"><span class="eyebrow">Contact &amp; interest</span><h2>${escapeHtml(c["about.contact_heading"])}</h2>${richText(c["about.contact_body"])}<p><a href="mailto:${escapeHtml(c["about.contact_email"])}" class="btn btn--navy">${escapeHtml(c["about.contact_email"])}</a>${c["about.contact_phone"] ? `<span style="margin-left:1rem;font-weight:600;">${escapeHtml(c["about.contact_phone"])}</span>` : ""}</p>
<form id="contactForm" style="max-width:38rem;margin-top:2rem;">
  <div class="admin-field"><label for="cf-interest">I’m interested in</label><select id="cf-interest" name="interest" required><option value="">Choose one</option><option>Requesting a brochure</option><option>Investor information</option><option>Partnership opportunity</option><option>General enquiry</option></select></div>
  <div class="admin-field"><label for="cf-name">Name</label><input type="text" id="cf-name" name="name" required></div>
  <div class="admin-field"><label for="cf-email">Your email</label><input type="email" id="cf-email" name="email" required></div>
  <div class="admin-field"><label for="cf-message">Message</label><textarea id="cf-message" name="message" rows="5" required></textarea></div>
  <button type="submit" class="btn btn--navy">Send enquiry</button>
  <p style="font-size:.82rem;color:#666;margin-top:.75rem;">For now, enquiries are sent directly by email. A structured interest database can be added when the intake volume warrants it.</p>
  <p id="cf-fallback" style="font-size:.85rem;color:#666;margin-top:.75rem;display:none;">Your device didn't open a mail app. Email us directly at <a href="mailto:${escapeHtml(c["about.contact_email"])}">${escapeHtml(c["about.contact_email"])}</a>.</p>
</form>
<noscript><p style="margin-top:1.5rem;">Email us directly at <a href="mailto:${escapeHtml(c["about.contact_email"])}">${escapeHtml(c["about.contact_email"])}</a>.</p></noscript>
</div></section>

<script>
(function(){var form=document.getElementById('contactForm');if(!form)return;form.addEventListener('submit',function(e){e.preventDefault();var name=form.name.value.trim();var email=form.email.value.trim();var interest=form.interest.value.trim();var message=form.message.value.trim();var subject=encodeURIComponent(interest+' — '+name+' via the Roviq site');var body=encodeURIComponent('Interest: '+interest+'\\n\\n'+message+'\\n\\n— '+name+' ('+email+')');window.location.href=${JSON.stringify(`mailto:${c["about.contact_email"]}`)}+'?subject='+subject+'&body='+body;document.getElementById('cf-fallback').style.display='block';});})();
</script>
`;
}
