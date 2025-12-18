/* =========================================================
   AGORA EXCHANGE — career-script.js
   Careers search + application flow (Discord webhook submit)
   + fixes: apply stays hidden until click, more roles, more questions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Config
  // -------------------------
  const DISCORD_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1442083773519892581/ffzwiAhvS4yTMdzNj3V3bvFhBZk4urxHORkREcLQc5VtWnk4n49ZjDegISW1Z-hj_iGo";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // -------------------------
  // DOM
  // -------------------------
  const yearEl = document.getElementById("career-year");
  const locationInput = document.getElementById("career-location");
  const keywordInput = document.getElementById("career-keyword");
  const searchBtn = document.getElementById("career-search-btn");
  const resetBtn = document.getElementById("career-reset-btn");
  const resultsEl = document.getElementById("career-results");
  const resultsMeta = document.getElementById("results-meta");

  const applySection = document.getElementById("career-apply");
  const confirmSection = document.getElementById("career-confirm");

  const applyTitle = document.getElementById("apply-title");
  const applySub = document.getElementById("apply-sub");
  const applyForm = document.getElementById("apply-form");

  const progressFill = document.getElementById("apply-progress-fill");
  const progressText = document.getElementById("apply-progress-text");

  const btnPrev = document.getElementById("apply-prev");
  const btnNext = document.getElementById("apply-next");
  const btnSubmit = document.getElementById("apply-submit");

  const reviewPanel = document.getElementById("review-panel");
  const confirmBody = document.getElementById("confirm-body");
  const confirmSearch = document.getElementById("confirm-search");

  // ✅ HARD GUARANTEE: apply stays hidden until a job Apply is clicked
  if (applySection) applySection.setAttribute("hidden", "true");
  if (confirmSection) confirmSection.setAttribute("hidden", "true");

  // -------------------------
  // Jobs (example listings)
  // -------------------------
  const JOBS = [
    {
      id: "agx-swe-01",
      title: "Software Developer (Web Systems)",
      location: "Remote / Bay Area",
      type: "Contract",
      pay: "$45–$85/hr (DOE)",
      short:
        "Build cyber-styled UIs, fast dashboards, and polished client pages with clean architecture.",
      about:
        "You’ll ship production-grade front ends and small web apps that feel premium. Expect UI polish, performance, and readable code.",
      expected: [
        "Build responsive views and reusable components",
        "Improve performance and accessibility",
        "Ship features with clean, documented changes",
      ],
      required: [
        "Strong HTML/CSS/JS fundamentals",
        "Comfortable with modern tooling and debugging",
        "Good taste (yes, it counts)",
      ],
      keywords: ["frontend", "fullstack", "web", "ui", "javascript"],
    },
    {
      id: "agx-net-01",
      title: "Network Engineer (Defense & Diagnostics)",
      location: "Bay Area / Hybrid",
      type: "Part-time",
      pay: "$55–$110/hr (DOE)",
      short:
        "Help design safe network diagnostics, telemetry views, and hardening checklists for real environments.",
      about:
        "You’ll assist with network visibility, safe configuration review, and building dashboards that make signals readable.",
      expected: [
        "Work with network concepts and visibility tooling",
        "Turn messy signals into clean operator dashboards",
        "Document findings and hardening recommendations",
      ],
      required: [
        "Networking fundamentals (routing/DNS/TLS)",
        "Comfortable reading logs and tracing issues",
        "Clear writing and documentation habits",
      ],
      keywords: ["network", "dns", "tls", "security", "telemetry"],
    },
    {
      id: "agx-fs-01",
      title: "Full-Stack Developer (Operator Consoles)",
      location: "Remote",
      type: "Full-time",
      pay: "$120k–$190k (DOE)",
      short:
        "Build multi-view consoles: search, filters, logs, and role-aware panels that feel like a real ops cockpit.",
      about:
        "You’ll build app-style UIs with real interaction. Think dashboards, ingestion, safe API wiring, and tight UX.",
      expected: [
        "Build web app flows (views, state, routing patterns)",
        "Integrate APIs (auth-ready patterns, safe defaults)",
        "Ship maintainable code with strong structure",
      ],
      required: [
        "Experience with web app architecture",
        "Comfortable with APIs and data handling",
        "Strong debugging + performance mindset",
      ],
      keywords: ["fullstack", "api", "dashboard", "node", "python"],
    },
    {
      id: "agx-soc-01",
      title: "SOC Analyst (Threat Triage)",
      location: "San Francisco, CA",
      type: "Full-time",
      pay: "$95k–$150k (DOE)",
      short:
        "Triage alerts, spot patterns, and turn noise into clean, actionable incident notes.",
      about:
        "You’ll handle alert triage, log correlation, and light investigation writeups. Strong signal sense > buzzwords.",
      expected: [
        "Triage alerts and correlate telemetry",
        "Write short incident narratives + next steps",
        "Help tune detections and reduce false positives",
      ],
      required: [
        "Comfortable reading logs (auth, web, endpoint, cloud)",
        "Good writing + calm under pressure",
        "Ethical mindset; no cowboy stuff",
      ],
      keywords: ["soc", "blue team", "siem", "incident", "logs", "detections"],
    },
    {
      id: "agx-ux-01",
      title: "Product Designer (Cyber UI/UX)",
      location: "San Francisco, CA / Hybrid",
      type: "Contract",
      pay: "$55–$120/hr (DOE)",
      short:
        "Design luxury-grade cyber interfaces that feel like a real operator cockpit.",
      about:
        "You’ll design clean, high-contrast dashboards, interaction patterns, and component systems that feel premium on mobile + desktop.",
      expected: [
        "Design flows for dashboards, search, and review states",
        "Create component guidelines and layout rules",
        "Collaborate closely with dev on implementation",
      ],
      required: [
        "Strong UI taste (spacing, type, hierarchy)",
        "Comfortable designing for dark themes",
        "Portfolio showing system-level thinking",
      ],
      keywords: ["designer", "ux", "ui", "figma", "design system"],
    },
    {
      id: "agx-ea-01",
      title: "Executive Personal Assistant (Ops Support)",
      location: "San Jose, CA",
      type: "Part-time",
      pay: "$22–$35/hr",
      short:
        "Keep ops moving: scheduling, client follow-ups, basic reporting, and keeping the pipeline organized.",
      about:
        "You’ll coordinate communication, keep tasks tracked, and keep the inbox from turning into chaos.",
      expected: [
        "Schedule coordination and follow-ups",
        "Light documentation and note taking",
        "Keep projects organized and moving",
      ],
      required: [
        "Strong communication + organization",
        "Comfortable with Google tools + email",
        "Professional discretion",
      ],
      keywords: ["assistant", "ops", "admin", "coordination"],
    },
  ];

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
    return String(s || "").trim().toLowerCase();
  }

  function matchesJob(job, loc, kw) {
    const locN = normalize(loc);
    const kwN = normalize(kw);

    const hayLoc = normalize(job.location);
    const hayTitle = normalize(job.title);
    const hayShort = normalize(job.short);
    const hayKeys = (job.keywords || []).map(normalize).join(" ");

    const locOk = !locN || hayLoc.includes(locN);
    const kwOk =
      !kwN ||
      hayTitle.includes(kwN) ||
      hayShort.includes(kwN) ||
      hayKeys.includes(kwN);

    return locOk && kwOk;
  }

  function setResultsMeta(text) {
    if (resultsMeta) resultsMeta.textContent = text;
  }

  function scrollIntoViewNice(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // -------------------------
  // Render jobs
  // -------------------------
  function renderJobs(list) {
    if (!resultsEl) return;

    resultsEl.innerHTML = "";

    if (!list.length) {
      resultsEl.innerHTML =
        '<div class="job-card"><h3 class="job-title">No matches</h3><p class="job-mini">Try a different keyword or clear filters.</p></div>';
      return;
    }

    list.forEach((job) => {
      const card = document.createElement("article");
      card.className = "job-card";
      card.dataset.jobId = job.id;

      card.innerHTML = `
        <h3 class="job-title">${escapeHtml(job.title)}</h3>
        <p class="job-mini">${escapeHtml(job.short)}</p>

        <div class="job-meta">
          <span class="job-pill">${escapeHtml(job.location)}</span>
          <span class="job-pill">${escapeHtml(job.type)}</span>
          <span class="job-pill">${escapeHtml(job.pay)}</span>
        </div>

        <div class="job-actions">
          <button class="btn btn-secondary js-details" type="button">View details</button>
          <button class="btn btn-primary js-apply" type="button">Apply</button>
        </div>

        <div class="job-details" hidden>
          <p><strong>Role overview:</strong> ${escapeHtml(job.about)}</p>

          <p><strong>What you’ll do:</strong></p>
          <ul>${(job.expected || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

          <p><strong>What we’re looking for:</strong></p>
          <ul>${(job.required || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
      `;

      resultsEl.appendChild(card);
    });
  }

  // -------------------------
  // Search
  // -------------------------
  function runSearch() {
    const loc = locationInput ? locationInput.value : "";
    const kw = keywordInput ? keywordInput.value : "";

    const list = JOBS.filter((j) => matchesJob(j, loc, kw));
    renderJobs(list);

    const locLabel = normalize(loc) ? `Location: "${loc.trim()}"` : "Any location";
    const kwLabel = normalize(kw) ? `Keyword: "${kw.trim()}"` : "Any keyword";
    setResultsMeta(`${list.length} result(s). ${locLabel} · ${kwLabel}.`);
  }

  function resetSearch() {
    if (locationInput) locationInput.value = "";
    if (keywordInput) keywordInput.value = "";
    renderJobs(JOBS);
    setResultsMeta("Showing all listings.");
  }

  // -------------------------
  // Application flow (multi-step)
  // -------------------------
  let currentJob = null;
  let currentStep = 1;
  const TOTAL_STEPS = 4;

  function stepEls() {
    return Array.from(document.querySelectorAll(".apply-step"));
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

    const pct = Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}% complete`;

    if (btnPrev) btnPrev.disabled = currentStep === 1;
    if (btnNext) btnNext.hidden = currentStep === TOTAL_STEPS;
    if (btnSubmit) btnSubmit.hidden = currentStep !== TOTAL_STEPS;

    if (currentStep === 4) buildReview();
    scrollIntoViewNice(applySection);
  }

  function getFormValues() {
    const get = (id) => {
      const el = document.getElementById(id);
      if (!el) return "";
      if (el.type === "file") return el.files && el.files[0] ? el.files[0] : null;
      if (el.type === "checkbox") return el.checked;
      return (el.value || "").trim();
    };

    return {
      role: currentJob ? currentJob.title : "",
      roleId: currentJob ? currentJob.id : "",
      roleLocation: currentJob ? currentJob.location : "",
      roleType: currentJob ? currentJob.type : "",
      rolePay: currentJob ? currentJob.pay : "",

      name: get("app-name"),
      email: get("app-email"),
      location: get("app-location"),
      availability: get("app-availability"),

      years: get("app-years"),
      stack: get("app-stack"),
      exp: get("app-exp"),
      summary: get("app-summary"),

      why: get("app-why"),
      training: get("app-training"),
      workAuth: get("app-workauth"),
      start: get("app-start"),
      comp: get("app-comp"),

      portfolio: get("app-portfolio"),
      links: get("app-github"),

      resume: get("app-resume"),
      photo: get("app-photo"),
      consent: get("app-consent"),
    };
  }

  function fileMeta(file) {
    if (!file) return "None";
    const kb = Math.round(file.size / 1024);
    return `${file.name} (${kb} KB)`;
  }

  function buildReview() {
    if (!reviewPanel) return;

    const v = getFormValues();
    reviewPanel.innerHTML = `
      <div class="review-grid">
        <div class="review-item">
          <div class="review-key">Role</div>
          <div class="review-val"><strong>${escapeHtml(v.role || "N/A")}</strong></div>
        </div>
        <div class="review-item">
          <div class="review-key">Role location</div>
          <div class="review-val">${escapeHtml(v.roleLocation || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Name</div>
          <div class="review-val">${escapeHtml(v.name || "N/A")}</div>
        </div>
        <div class="review-item">
          <div class="review-key">Email</div>
          <div class="review-val">${escapeHtml(v.email || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Availability</div>
          <div class="review-val">${escapeHtml(v.availability || "N/A")}</div>
        </div>
        <div class="review-item">
          <div class="review-key">Experience</div>
          <div class="review-val">${escapeHtml(v.years || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Primary stack</div>
          <div class="review-val">${escapeHtml(v.stack || "N/A")}</div>
        </div>
        <div class="review-item">
          <div class="review-key">Comp expectations</div>
          <div class="review-val">${escapeHtml(v.comp || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Work auth</div>
          <div class="review-val">${escapeHtml(v.workAuth || "N/A")}</div>
        </div>
        <div class="review-item">
          <div class="review-key">In-office training</div>
          <div class="review-val">${escapeHtml(v.training || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Portfolio</div>
          <div class="review-val">${escapeHtml(v.portfolio || "N/A")}</div>
        </div>
        <div class="review-item">
          <div class="review-key">GitHub/LinkedIn</div>
          <div class="review-val">${escapeHtml(v.links || "N/A")}</div>
        </div>

        <div class="review-item">
          <div class="review-key">Resume file</div>
          <div class="review-val">${escapeHtml(fileMeta(v.resume))}</div>
        </div>
        <div class="review-item">
          <div class="review-key">Photo file</div>
          <div class="review-val">${escapeHtml(fileMeta(v.photo))}</div>
        </div>
      </div>

      <div style="margin-top:12px;">
        <div class="review-key">Experience highlights</div>
        <div class="review-val">${escapeHtml(v.exp || "N/A")}</div>
      </div>

      <div style="margin-top:12px;">
        <div class="review-key">Why Agora</div>
        <div class="review-val">${escapeHtml(v.why || "N/A")}</div>
      </div>

      <div style="margin-top:12px;">
        <div class="review-key">Short pitch</div>
        <div class="review-val">${escapeHtml(v.summary || "N/A")}</div>
      </div>
    `;
  }

  function openApplication(job) {
    currentJob = job;

    if (applySection) applySection.removeAttribute("hidden");
    if (confirmSection) confirmSection.setAttribute("hidden", "true");

    if (applyTitle) applyTitle.textContent = `Apply: ${job.title}`;
    if (applySub) applySub.textContent = `${job.location} · ${job.type} · ${job.pay}`;

    if (applyForm) applyForm.reset();
    showStep(1);
  }

  function closeApplicationToSearch() {
    if (applySection) applySection.setAttribute("hidden", "true");
    if (confirmSection) confirmSection.setAttribute("hidden", "true");
    scrollIntoViewNice(document.querySelector(".career-search"));
  }

  // -------------------------
  // Submit -> Discord
  // -------------------------
  async function submitToDiscord(v) {
    const embed = {
      title: "New Careers Application — Agora Exchange",
      description: "A candidate submitted an application from career.html.",
      color: 0x00c8ff,
      fields: [
        { name: "Role", value: v.role || "N/A", inline: false },
        {
          name: "Location / Type / Pay",
          value: `${v.roleLocation || "N/A"} · ${v.roleType || "N/A"} · ${v.rolePay || "N/A"}`,
          inline: false,
        },

        { name: "Name", value: v.name || "N/A", inline: true },
        { name: "Email", value: v.email || "N/A", inline: true },

        { name: "Candidate location", value: v.location || "N/A", inline: false },
        { name: "Availability", value: v.availability || "N/A", inline: true },
        { name: "Experience", value: v.years || "N/A", inline: true },

        { name: "Primary stack", value: v.stack || "N/A", inline: false },
        { name: "Experience highlights", value: (v.exp || "N/A").slice(0, 900), inline: false },

        { name: "Why Agora", value: (v.why || "N/A").slice(0, 900), inline: false },
        { name: "In-office training", value: v.training || "N/A", inline: true },
        { name: "Work authorization", value: v.workAuth || "N/A", inline: true },
        { name: "Earliest start", value: v.start || "N/A", inline: true },
        { name: "Comp expectations", value: v.comp || "N/A", inline: true },

        { name: "Portfolio", value: v.portfolio || "N/A", inline: false },
        { name: "Links", value: v.links || "N/A", inline: false },

        { name: "Resume file (metadata)", value: fileMeta(v.resume), inline: false },
        { name: "Photo file (metadata)", value: fileMeta(v.photo), inline: false },

        { name: "Short pitch", value: (v.summary || "N/A").slice(0, 900), inline: false },
      ],
      footer: { text: "Agora Exchange · Careers intake" },
      timestamp: new Date().toISOString(),
    };

    const payload = {
      content: "🧾 **New career application received.**",
      embeds: [embed],
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  }

  // -------------------------
  // Events
  // -------------------------
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderJobs(JOBS);

  if (searchBtn) searchBtn.addEventListener("click", runSearch);
  if (resetBtn) resetBtn.addEventListener("click", resetSearch);

  [locationInput, keywordInput].forEach((el) => {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      }
    });
  });

  if (resultsEl) {
    resultsEl.addEventListener("click", (e) => {
      const detailsBtn = e.target.closest(".js-details");
      const applyBtn = e.target.closest(".js-apply");
      const card = e.target.closest(".job-card");
      if (!card) return;

      const jobId = card.dataset.jobId;
      const job = JOBS.find((j) => j.id === jobId);
      if (!job) return;

      if (detailsBtn) {
        const panel = card.querySelector(".job-details");
        const isHidden = panel ? panel.hasAttribute("hidden") : true;
        if (panel) {
          if (isHidden) panel.removeAttribute("hidden");
          else panel.setAttribute("hidden", "true");
        }
        detailsBtn.textContent = isHidden ? "Hide details" : "View details";
      }

      if (applyBtn) {
        openApplication(job);
      }
    });
  }

  if (btnPrev) btnPrev.addEventListener("click", () => showStep(currentStep - 1));
  if (btnNext) btnNext.addEventListener("click", () => showStep(currentStep + 1));

  if (confirmSearch) {
    confirmSearch.addEventListener("click", () => {
      closeApplicationToSearch();
    });
  }

  if (applyForm) {
    applyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const v = getFormValues();

      if (!v.name || !v.email || !emailPattern.test(v.email)) {
        alert("Please enter a valid name + email.");
        showStep(1);
        return;
      }

      if (!v.consent) {
        alert("Please confirm the accuracy checkbox before submitting.");
        showStep(4);
        return;
      }

      if (btnSubmit) btnSubmit.disabled = true;
      if (btnNext) btnNext.disabled = true;
      if (btnPrev) btnPrev.disabled = true;

      try {
        const ok = await submitToDiscord(v);

        if (!ok) {
          alert("We couldn’t submit your application right now. Please try again.");
          return;
        }

        if (applySection) applySection.setAttribute("hidden", "true");
        if (confirmSection) confirmSection.removeAttribute("hidden");

        if (confirmBody) {
          confirmBody.textContent = `You applied for “${v.role || "a role"}”. If you’re a fit, Agora will reach out to ${v.email}.`;
        }

        scrollIntoViewNice(confirmSection);
      } catch (err) {
        console.error("Careers submit failed:", err);
        alert("Network issue while submitting. Check connection and try again.");
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnNext) btnNext.disabled = false;
        if (btnPrev) btnPrev.disabled = false;
      }
    });
  }

  injectMeshBackground();
});

/* =========================================================
   Mesh background (low-key node network)
   ========================================================= */
function injectMeshBackground() {
  const shell = document.getElementById("career-shell");
  if (!shell) return;

  if (document.getElementById("agora-bg-mesh")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "agora-bg-mesh";

  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "0",
    pointerEvents: "none",
    opacity: "0.45",
  });

  document.body.insertBefore(canvas, document.body.firstChild);

  shell.style.position = shell.style.position || "relative";
  shell.style.zIndex = "1";

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
      ctx.fillStyle =
        n.tone > 0.6 ? "rgba(130,160,255,0.9)" : "rgba(100,255,218,0.85)";
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
