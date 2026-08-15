import { escapeHtml } from "../layout.js";

export function contactPage(c) {
  const email = "admytruk79@gmail.com";
  return `
<section class="hero section--tight"><div class="container"><span class="eyebrow">Contact</span><h1>Get in touch</h1><p class="lead">Partnerships, investment, press, brochure requests, project questions and general enquiries.</p></div></section>
<section class="section"><div class="container"><div class="contact-page-grid"><div><h2>Contact ROVIQ</h2><p>Use the form or email us directly at <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>.</p><p>Choose the enquiry type so your message is clear from the start.</p></div><form id="contactForm" class="contact-form">
<div class="contact-field"><label for="cf-name">Name</label><input type="text" id="cf-name" name="name" autocomplete="name" required></div>
<div class="contact-field"><label for="cf-email">Email</label><input type="email" id="cf-email" name="email" autocomplete="email" required></div>
<div class="contact-field"><label for="cf-company">Company / organisation <span>optional</span></label><input type="text" id="cf-company" name="company" autocomplete="organization"></div>
<div class="contact-field"><label for="cf-type">Enquiry type</label><select id="cf-type" name="type" required><option value="">Select one</option><option>Investment</option><option>Partnership</option><option>Brochure / information request</option><option>Press / media</option><option>Station / location opportunity</option><option>Platform / technology</option><option>General enquiry</option></select></div>
<div class="contact-field"><label for="cf-subject">Subject</label><input type="text" id="cf-subject" name="subject" required></div>
<div class="contact-field contact-field--full"><label for="cf-message">Message</label><textarea id="cf-message" name="message" rows="7" required></textarea></div>
<div class="contact-field--full"><button id="contactSubmit" type="submit" class="btn btn--gold">Send enquiry</button><p id="contactStatus" class="contact-destination" aria-live="polite">Messages are securely submitted to ROVIQ and emailed to <strong>${escapeHtml(email)}</strong>.</p></div>
</form></div></section>
<script>(function(){
var f=document.getElementById('contactForm'),btn=document.getElementById('contactSubmit'),status=document.getElementById('contactStatus');if(!f)return;
var endpoint='https://wiafdkxfgwazprjucspg.supabase.co/functions/v1/send-contact-email';
var key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpYWZka3hmZ3dhenByanVjc3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDE4NDgsImV4cCI6MjEwMjM3Nzg0OH0.qghDfY_FIOEoqmoQWFDmvLTqhKbuJDOi5MmmkG7nhv8';
f.addEventListener('submit',async function(e){e.preventDefault();
var payload={name:f.name.value.trim(),email:f.email.value.trim(),company:f.company.value.trim()||null,enquiry_type:f.type.value,subject:f.subject.value.trim(),message:f.message.value.trim()};
if(!payload.name||!payload.email||!payload.enquiry_type||!payload.subject||!payload.message){status.textContent='Please complete all required fields.';return;}
btn.disabled=true;btn.textContent='Sending…';status.textContent='Sending your enquiry…';
try{var r=await fetch(endpoint,{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload)});var data=await r.json().catch(function(){return {};});if(!r.ok||data.notified===false)throw new Error(data.error||'email delivery failed');f.reset();status.innerHTML='Thank you — your enquiry has been received and emailed to ROVIQ.';}
catch(err){status.innerHTML='We could not send the form. Please email <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a> directly.';}
finally{btn.disabled=false;btn.textContent='Send enquiry';}
});})();</script>`;
}
