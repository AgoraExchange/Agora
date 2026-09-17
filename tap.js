"use strict";
(() => {
  const presets = {
    salon: { name: "Studio & Shears", tagline: "Good hair. Your kind of place.", primary: "Book your next cut", label: "Booking", services: "Services & prices", theme: "THE EDITORIAL COLLECTION", cover: "THE ART OF YOU.", category: "STYLE / CARE / CONFIDENCE", quote: "A little time for myself, and a look I love.", detail: "Your customer opens your existing booking service to pick a time and service.", menu: "Haircuts, color, styling, and your current prices. Your real page can showcase your work and link to your full service list." },
    auto: { name: "South Bay Detail", tagline: "Precision care. A finish that speaks.", primary: "Get my quote", label: "Quote request", services: "Explore the packages", theme: "THE PERFORMANCE COLLECTION", cover: "DETAILS MATTER.", category: "DETAIL / PROTECT / RESTORE", quote: "That fresh-off-the-lot feeling, all over again.", detail: "Your customer opens your existing quote form or preferred contact link. Custom forms and photo uploads can be scoped separately.", menu: "Interior refresh. Exterior detail. Paint protection. Show customers your packages, pricing, and the work behind the finish." },
    cafe: { name: "Corner & Coffee", tagline: "Slow mornings. Good coffee. Your corner.", primary: "Find your next favorite", label: "Menu / ordering", services: "Come on over", theme: "THE COFFEEHOUSE COLLECTION", cover: "STAY A LITTLE.", category: "COFFEE / COMMUNITY / EVERY DAY", quote: "My favorite corner to slow down and start the day.", detail: "Your customer opens your menu or existing online ordering service. Your real photos and seasonal favorites can make this page your own.", menu: "Show your opening hours, address, and directions so customers can find their way to your counter." }
  };
  const $ = id => document.getElementById(id);
  const name = $('business-name'), type = $('business-type'), tagline = $('business-tagline'), reviews = $('review-mode');
  const toggles = [...document.querySelectorAll('[data-toggle]')];
  const params = new URLSearchParams(location.search);
  type.value = Object.hasOwn(presets, params.get('type')) ? params.get('type') : 'salon';
  const googleInput = $('google-link');
  function safeGoogleLink(value) {
    try {
      const url = new URL(value);
      const hosts = ['share.google','maps.app.goo.gl','goo.gl','g.page','google.com','www.google.com','maps.google.com'];
      return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.includes(url.hostname) ? url.href : '';
    } catch { return ''; }
  }
  googleInput.value = safeGoogleLink(params.get('google'));
  let previous = presets[type.value];
  name.value = (params.get('name') || previous.name).slice(0,60);
  tagline.value = (params.get('tagline') ?? previous.tagline).slice(0,100);
  reviews.value = ['button','featured','popup','hidden'].includes(params.get('reviews')) ? params.get('reviews') : 'button';
  if (params.has('actions')) {
    const actions = params.get('actions').split(',');
    toggles.forEach(input => input.checked = actions.includes(input.dataset.toggle));
  }
  function render() {
    const p = presets[type.value], title = name.value.trim() || p.name;
    $('customer-preview').dataset.theme = type.value;
    $('shop-name').textContent = title;
    $('shop-initials').textContent = title.split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word)).slice(0,2).map(word => Array.from(word)[0]).join('').toUpperCase() || 'A';
    $('shop-tagline').textContent = tagline.value.trim();
    $('primary-action').textContent = p.primary + ' \u2197';
    $('primary-label').textContent = p.label;
    $('services-action').textContent = p.services + ' \u2197';
    $('theme-label').textContent = p.theme;
    $('cover-word').textContent = p.cover;
    $('shop-category').textContent = p.category;
    $('review-quote').textContent = '\u201c' + p.quote + '\u201d';
    toggles.forEach(input => document.querySelector('[data-demo-action="' + input.dataset.toggle + '"]').hidden = !input.checked);
    const googleEnabled = toggles.find(input => input.dataset.toggle === 'google').checked;
    $('google-settings').hidden = !googleEnabled;
    googleInput.disabled = !googleEnabled;
    const invalidGoogle = googleEnabled && googleInput.value.trim() && !safeGoogleLink(googleInput.value.trim());
    googleInput.setCustomValidity(invalidGoogle ? 'Use an HTTPS Google share or Google Maps link.' : '');
    googleInput.setAttribute('aria-invalid', String(Boolean(invalidGoogle)));
    $('google-link-error').textContent = invalidGoogle ? 'Use an HTTPS Google share or Google Maps link.' : '';
    $('wifi-editor-note').hidden = !toggles.find(input => input.dataset.toggle === 'wifi').checked;
    $('featured-review').hidden = reviews.value !== 'featured';
    $('review-action').hidden = reviews.value === 'hidden';
    $('review-action').textContent = reviews.value === 'popup' ? '\u2606 Read customer reviews \u2197' : '\u2606 Leave a review \u2197';
    const socialGrid = document.querySelector('.customer-actions .mock-grid');
    const socialCount = [...socialGrid.querySelectorAll('button')].filter(button => !button.hidden).length;
    socialGrid.hidden = socialCount === 0;
    socialGrid.classList.toggle('single-action', socialCount === 1);
    const actions = document.querySelector('.customer-actions');
    const actionCount = [...actions.querySelectorAll('[data-demo-action]')].filter(button => !button.hidden).length;
    actions.classList.toggle('solo-action', actionCount === 1);
    actions.hidden = actionCount === 0 && reviews.value !== 'featured';
    const slug = title.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'').slice(0,45) || 'yourbusiness';
    $('domain-example').textContent = 'www.' + slug + '.com';
    $('copy-status').textContent = '';
    $('share-label').hidden = $('share-link').hidden = true;
  }
  googleInput.addEventListener('input',render);
  $('google-example').addEventListener('click', () => { googleInput.value = 'https://share.google/4ke7QfInM1Zb2xqi5'; render(); });
  name.addEventListener('input',render);
  tagline.addEventListener('input',render);
  reviews.addEventListener('change',render);
  toggles.forEach(input => input.addEventListener('change',render));
  type.addEventListener('change', () => {
    const next = presets[type.value];
    if (!name.value.trim() || name.value === previous.name) name.value = next.name;
    if (!tagline.value.trim() || tagline.value === previous.tagline) tagline.value = next.tagline;
    previous = next; render();
  });
  $('reset-demo').addEventListener('click', () => {
    googleInput.value = '';
    type.value = 'salon'; previous = presets.salon; name.value = previous.name; tagline.value = previous.tagline; reviews.value = 'button';
    toggles.forEach(input => input.checked = ['primary','services','contact','instagram'].includes(input.dataset.toggle)); render();
  });
  $('present-toggle').addEventListener('click', () => {
    const presenting = document.body.classList.toggle('presenting');
    $('present-toggle').setAttribute('aria-pressed',String(presenting));
    $('present-toggle').textContent = presenting ? 'Back to customizer' : 'Present preview \u2197';
  });
  $('demo-editor').addEventListener('submit',async event => {
    event.preventDefault();
    const url = new URL(location.protocol === 'http:' || location.protocol === 'https:' ? location.href : 'https://agoraexchange.xyz/tap.html');
    url.search = ''; url.hash = '';
    url.searchParams.set('type',type.value); url.searchParams.set('name',name.value.trim()); url.searchParams.set('tagline',tagline.value.trim()); url.searchParams.set('reviews',reviews.value);
    url.searchParams.set('actions',toggles.filter(input => input.checked).map(input => input.dataset.toggle).join(','));
    if (toggles.find(input => input.dataset.toggle === 'google').checked && safeGoogleLink(googleInput.value.trim())) url.searchParams.set('google',safeGoogleLink(googleInput.value.trim()));
    try { await navigator.clipboard.writeText(url.href); $('copy-status').textContent = 'Copied! This link recreates your preview. Local changes must be uploaded before sharing publicly.'; }
    catch { $('share-link').value = url.href; $('share-link').hidden = $('share-label').hidden = false; $('share-link').focus(); $('share-link').select(); $('copy-status').textContent = 'Copy your preview link below. Upload the updated demo before sharing publicly.'; }
  });
  const dialog = $('demo-dialog');
  function reviewExplanation() { $('dialog-title').textContent = 'Make honest feedback easy'; $('dialog-body').textContent = "Your real page opens your Google review link. Customers share their own experience, with no rewards or filtering by rating. This preview does not post a review."; $('dialog-review').hidden = true; }
  document.querySelectorAll('[data-demo-action]').forEach(button => button.addEventListener('click', () => {
    const p = presets[type.value], action = button.dataset.demoAction;
    $('dialog-review').hidden = true;
    $('wifi-details').hidden = $('google-details').hidden = true;
    $('wifi-copy-status').textContent = '';
    const messages = { primary: [p.primary,p.detail], services: [p.services,p.menu], contact: ['Start a conversation','Connect your public phone number, email, or existing contact page. Your customer chooses how to get in touch.'], instagram: ['Your brand on Instagram','Open your business profile so customers can explore your photos, see your work, and follow along.'], facebook: ['Your community on Facebook','Take customers straight to your business page, updates, and community.'], tiktok: ['Your business in motion','Connect your TikTok profile to share your process, personality, and latest videos.'] };
    if (action === 'wifi') {
      $('dialog-title').textContent = 'Connect to Wi-Fi';
      $('dialog-body').textContent = 'A little hospitality, one tap away. Copy the guest password, then choose the network in your device Wi-Fi settings. These are sample details; this demo does not connect your device.';
      $('wifi-network').textContent = (name.value.trim() || p.name) + ' Guest';
      $('wifi-details').hidden = false;
    } else if (action === 'google') {
      const link = safeGoogleLink(googleInput.value.trim());
      $('dialog-title').textContent = 'Find us on Google';
      $('dialog-body').textContent = link ? 'Explore the business listing, photos, hours, and directions on Google. This opens the link supplied in the customizer.' : 'Your customers can open your Google listing for photos, hours, and directions. Add your business link in the customizer, or try the labeled Massage Envy example.';
      if (link) {
        $('google-destination').href = $('open-google').href = link;
        $('google-destination').textContent = link;
        $('google-details').hidden = false;
      }
    } else if (action === 'review') {
      reviewExplanation();
      if (reviews.value === 'popup') { $('dialog-title').textContent = 'What your customers could see'; $('dialog-body').textContent = 'SAMPLE REVIEW - NOT REAL CUSTOMER FEEDBACK: \u201c' + p.quote + '\u201d Your finished page can showcase real customer feedback with agreed sourcing and permission. Live Google review syncing is scoped separately.'; $('dialog-review').hidden = false; }
    } else { const [title,body] = messages[action]; $('dialog-title').textContent = title; $('dialog-body').textContent = body; }
    dialog.showModal();
  }));
  $('copy-wifi').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('wifi-password').textContent); $('wifi-copy-status').textContent = 'Sample password copied. Choose the guest network in Wi-Fi settings.'; }
    catch { $('wifi-copy-status').textContent = 'Copy the sample password shown above: WelcomeGuest!'; }
  });
  $('dialog-review').addEventListener('click',reviewExplanation);
  $('dialog-close').addEventListener('click',() => dialog.close());
  render();
})();
