import { richText, escapeHtml } from "../layout.js";

export function contactPage(c) {
  const email = c["about.contact_email"] || "adrian@roviq.com";
  return `
<section class="hero section--tight"><div class="container"><span class="eyebrow">Contact</span><h1>Get in touch</h1><p class="lead">Partnerships, investment, press, brochure requests, project questions and general enquiries.</p></div></section>
<section class="section"><div class="container"><div class="contact-page-grid"><div><h2>Contact ROVIQ</h2><p>Use the form or email us directly at <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>.</p><p>Choose the enquiry type so your message is clear from the start.</p></div><form id="contactForm" class="contact-form">
<div class="contact-field"><label for="cf-name">Name</label><input type="text" id="cf-name" name="name" autocomplete="name" required></div>
<div class="contact-field"><label for="cf-email">Email</label><input type="email" id="cf-email" name="email" autocomplete="email" required></div>
<div class="contact-field"><label for="cf-company">Company / organisation <span>optional</span></label><input type="text" id="cf-company" name="company" autocomplete="organization"></div>
<div class="contact-field"><label for="cf-type">Enquiry type</label><select id="cf-type" name="type" required><option value="">Select one</option><option>Investment</option><option>Partnership</option><option>Brochure / information request</option><option>Press / media</option><option>Station / location opportunity</option><option>Platform / technology</option><option>General enquiry</option></select></div>
<div class="contact-field"><label for="cf-subject">Subject</label><input type="text" id="cf-subject" name="subject" required></div>
<div class="contact-field contact-field--full"><label for="cf-message">Message</label><textarea id="cf-message" name="message" rows="7" required></textarea></div>
<div class="contact-field--full"><button type="submit" class="btn btn--gold">Send enquiry</button><p class="contact-destination">Messages are addressed to <strong>${escapeHtml(email)}</strong>.</p></div>
</form></div></section>
<script>(function(){var f=document.getElementById('contactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var name=f.name.value.trim(),email=f.email.value.trim(),company=f.company.value.trim(),type=f.type.value,subject=f.subject.value.trim(),message=f.message.value.trim();var mailSubject=encodeURIComponent('[ROVIQ '+type+'] '+subject);var body=encodeURIComponent('Enquiry type: '+type+'\nName: '+name+'\nEmail: '+email+'\nCompany / organisation: '+(company||'—')+'\n\n'+message);window.location.href='mailto:${escapeHtml(email)}?subject='+mailSubject+'&body='+body;});})();</script>`;
}
