/* =========================================================
   AGORA EXCHANGE — script.js
   View Switching · Navigation · Basic Form Handling
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const appViews = document.querySelectorAll(".view");

  const brand = document.querySelector(".brand");
  const footerYearEl = document.getElementById("footer-year");

  const contactForm = document.querySelector(".contact-form");
  const footerForm = document.querySelector(".footer-form");

  // Discord Webhook for contact + newsletter
  const DISCORD_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1442083773519892581/ffzwiAhvS4yTMdzNj3V3bvFhBZk4urxHORkREcLQc5VtWnk4n49ZjDegISW1Z-hj_iGo";

  // Shared email validator (must have "@", dot, and no spaces)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------------------------------------------------------
     Helper: Smooth Scroll to Top
     --------------------------------------------------------- */
  function smoothScrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const siteMain = document.querySelector(".site-main");
    if (siteMain && typeof siteMain.scrollTo === "function") {
      siteMain.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /* ---------------------------------------------------------
     Helper: Prefill Contact Form based on source button
     --------------------------------------------------------- */
  function prefillContactFromSource(sourceEl) {
    if (!contactForm || !sourceEl) return;

    const focusSelect = contactForm.querySelector("#contact-focus");
    const messageField = contactForm.querySelector("#contact-message");

    if (!focusSelect && !messageField) return;

    let label = (sourceEl.textContent || "").trim().toLowerCase();

    let focusValue = "";
    let message = "";

    // Package-specific logic based on button text
    if (label.includes("cyber landing") || label.includes("portfolio")) {
      focusValue = "cyber-landing";
      message =
        "I’m interested in the Cyber Landing / Portfolio package. I’d like a custom cyber-styled site that covers:\n\n" +
        "- Who I am / what I do\n" +
        "- My work, tools, or portfolio\n" +
        "- A clear way for people to reach out or book me\n\n" +
        "Here’s more context about my brand and what I’m looking for:";
    } else if (label.includes("ops console")) {
      focusValue = "ops-console";
      message =
        "I’m interested in the Ops Console / Web App package. I’m looking for an internal console or dashboard that helps with:\n\n" +
        "- Monitoring, investigations, or client workflows\n" +
        "- Role-based views or permissions\n" +
        "- Fast access to the data and actions I care about\n\n" +
        "Here’s more about my environment and what the console should do:";
    } else if (label.includes("script kit") || label.includes("automation")) {
      focusValue = "script-kit";
      message =
        "I’m interested in the Script & Automation Kit package. I’d like help with:\n\n" +
        "- Custom Python or automation scripts\n" +
        "- Log / data wrangling or enrichment\n" +
        "- Small utilities that plug into my existing stack\n\n" +
        "Here’s more about my stack and what I’d like automated:";
    } else if (label.includes("red team") || label.includes("hacker")) {
      // Red Team Simulation / Hire Hacker style
      focusValue = "other";
      message =
        "I’m interested in a Red Team Simulation style engagement. I’d like to safely test my environment using:\n\n" +
        "- Recon and surface mapping\n" +
        "- Controlled attack-path exploration\n" +
        "- Practical recommendations based on real findings\n\n" +
        "Here’s more about my environment, goals, and concerns:";
      // Custom Gadgets / Modules / Tinker Hardware
    } else if (
      label.includes("gadget") ||
      label.includes("tinker") ||
      label.includes("module")
    ) {
      focusValue = "other";
      message =
        "I’m interested in a custom hardware / tinker build. I’d like to create a device such as:\n\n" +
        "- ESP32 / ESP8266 module\n" +
        "- Raspberry Pi portable rig or embedded system\n" +
        "- Flipper Zero GPIO add-on or extension board\n" +
        "- A small RF gadget, tool, or payload module\n\n" +
        "Here’s the idea, purpose, and any technical details I already know:";
    } else {
      // Generic Contact / Engage Agora / Contact buttons:
      // Only prefill if the message box is currently empty
      if (!messageField || messageField.value.trim()) return;

      message = "Here’s what I’m trying to build or secure:";
    }

    if (focusSelect && focusValue) {
      focusSelect.value = focusValue;
    }

    if (messageField && message) {
      // Don’t overwrite if the user already started typing
      if (!messageField.value.trim()) {
        messageField.value = message;
      }
    }
  }

  /* ---------------------------------------------------------
     Helper: Set Active View
     --------------------------------------------------------- */
  function setActiveView(targetView, sourceEl) {
    if (!targetView) return;

    appViews.forEach((view) => {
      const viewName = view.getAttribute("data-view");
      if (viewName === targetView) {
        view.classList.add("is-active");
        view.removeAttribute("hidden");
      } else {
        view.classList.remove("is-active");
        view.setAttribute("hidden", "true");
      }
    });

    // Sync nav active state
    navLinks.forEach((link) => {
      const viewName = link.getAttribute("data-view");
      if (viewName === targetView) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });

    // Close mobile nav if open
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
      }
    }

    // Prefill contact form if we just navigated there from a specific button
    if (targetView === "contact" && sourceEl) {
      prefillContactFromSource(sourceEl);
    }

    // Always scroll to top when switching views
    smoothScrollToTop();
  }

  /* ---------------------------------------------------------
     Global: Click any [data-view] trigger
     --------------------------------------------------------- */
  function handleViewTriggerClick(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const targetView = target.getAttribute("data-view");
    if (!targetView) return;
    setActiveView(targetView, target);
  }

  const viewTriggers = document.querySelectorAll("[data-view]");
  viewTriggers.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "button" || tag === "a") {
      el.addEventListener("click", handleViewTriggerClick);
    }
  });

  /* ---------------------------------------------------------
     Brand click: always go Home
     --------------------------------------------------------- */
  if (brand) {
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveView("home", brand);
    });
  }

  /* ---------------------------------------------------------
     Mobile Nav Toggle
     --------------------------------------------------------- */
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close nav when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      const isClickInsideNav = nav.contains(e.target);
      const isClickToggle = navToggle.contains(e.target);
      if (!isClickInsideNav && !isClickToggle) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------
     Footer Year
     --------------------------------------------------------- */
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     Contact Form Handling
     - Sends nicely formatted embed to Discord Webhook
     --------------------------------------------------------- */
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameEl = contactForm.querySelector("#contact-name");
      const emailEl = contactForm.querySelector("#contact-email");
      const orgEl = contactForm.querySelector("#contact-org");
      const focusEl = contactForm.querySelector("#contact-focus");
      const budgetEl = contactForm.querySelector("#contact-budget");
      const messageEl = contactForm.querySelector("#contact-message");

      const nameVal = nameEl ? nameEl.value.trim() : "";
      const emailVal = emailEl ? emailEl.value.trim() : "";
      const orgVal = orgEl ? orgEl.value.trim() : "";
      const focusVal = focusEl ? focusEl.value : "";
      const budgetVal = budgetEl ? budgetEl.value : "";
      const messageVal = messageEl ? messageEl.value.trim() : "";

      // Require valid email
      if (!nameVal || !emailVal || !emailPattern.test(emailVal)) {
        alert("Please enter a valid name and email so Agora can respond.");
        return;
      }

      const focusLabelMap = {
        "cyber-landing": "Cyber-styled website / portfolio",
        "ops-console": "Internal console / web app",
        "script-kit": "Script & automation kit (legal scope)",
        other: "Not sure / something else",
      };

      const budgetLabelMap = {
        "under-5k": "Under $100",
        "5k-25k": "$100 – $350",
        "25k-100k": "$500 – $1,000",
        "100k-plus": "$1,000+",
      };

      const focusLabel = focusLabelMap[focusVal] || "Not specified";
      const budgetLabel = budgetLabelMap[budgetVal] || "Not specified";

      const embed = {
        title: "New Agora Exchange Contact Request",
        description: "A new client filled out the contact form on the Agora site.",
        color: 0x00c8ff,
        fields: [
          {
            name: "Name",
            value: nameVal || "N/A",
            inline: true,
          },
          {
            name: "Email",
            value: emailVal || "N/A",
            inline: true,
          },
          {
            name: "Team / Brand / Project",
            value: orgVal || "N/A",
            inline: false,
          },
          {
            name: "Primary Need",
            value: focusLabel,
            inline: true,
          },
          {
            name: "Rough Budget",
            value: budgetLabel,
            inline: true,
          },
          {
            name: "Mission / Details",
            value: messageVal || "No message provided.",
            inline: false,
          },
        ],
        footer: {
          text: "Agora Exchange · From concept to code",
        },
        timestamp: new Date().toISOString(),
      };

      const payload = {
        content: "📥 **New contact submission received via Agora Exchange.**",
        embeds: [embed],
      };

      try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error(
            "Discord webhook error (contact):",
            res.status,
            res.statusText
          );
          alert(
            "We hit an issue sending your request to Agora. Please try again in a moment."
          );
          return;
        }

        contactForm.reset();
        alert("Thank you. Your details were sent to Agora successfully.");
      } catch (err) {
        console.error("Discord webhook fetch failed (contact):", err);
        alert(
          "Something went wrong while sending your request. Check your connection and try again."
        );
      }
    });
  }

  /* ---------------------------------------------------------
     Gallery Filters (Software / Websites / Tinker)
     --------------------------------------------------------- */
  const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");

        // toggle active state
        filterButtons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
        });

        // show / hide gallery items
        galleryItems.forEach((item) => {
          const category = item.getAttribute("data-category");
          const shouldShow = filter === "all" || category === filter;
          item.classList.toggle("is-hidden", !shouldShow);
        });

        // scroll to top of gallery when changing filter (nice UX)
        const gallerySection = document.querySelector(".view-gallery.is-active");
        if (gallerySection) {
          const top = gallerySection.offsetTop - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Hades / Agora Signal Toast
     --------------------------------------------------------- */
  const hadesToast = document.getElementById("hades-toast");
  const hadesMessageEl = document.getElementById("hades-message");
  const hadesCloseBtn = document.getElementById("hades-close");

  if (hadesToast && hadesMessageEl) {
    const signals = [
      {
        name: "Plutous",
        line:
          "New crypto performance update deployed <hours> ago. Visit <span>Showcase</span> to see what changed.",
      },
      {
        name: "Security Automation Suite",
        line:
          "Fresh automation runbooks landed <hours> ago. Check <span>Showcase</span> for the latest panels.",
      },
      {
        name: "Operator Toolkit",
        line:
          "New operator shortcuts synced <hours> ago. Explore them in the <span>Showcase</span> grid.",
      },
      {
        name: "ESP32 Field Module",
        line:
          "Telemetry profiles were tuned <hours> ago. Hardware details live under <span>Showcase</span>.",
      },
      {
        name: "Raspberry Pi Ops Rig",
        line:
          "Dashboards and images refreshed <hours> ago. Scroll the <span>Showcase</span> to inspect.",
      },
      {
        name: "Flipper-1",
        line:
          "Field module presets updated <hours> ago. See the new loadout in the <span>Showcase</span>.",
      },
      {
        name: "AGORA Signal Beacon",
        line:
          "Sensor profiles recalibrated <hours> ago. Latest spec is pinned in <span>Showcase</span>.",
      },
    ];

    function getRandomSignal() {
      const pick = signals[Math.floor(Math.random() * signals.length)];
      const hours = Math.floor(Math.random() * 10) + 1; // 1–10 hours
      const line = pick.line.replace(
        "<hours>",
        `${hours} hour${hours === 1 ? "" : "s"}`
      );
      return line;
    }

    function showHadesToast() {
      // respect reduced motion users – still show but no slide animation
      const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      hadesMessageEl.innerHTML = getRandomSignal();

      if (prefersReducedMotion) {
        hadesToast.style.transform = "none";
        hadesToast.style.opacity = "1";
        hadesToast.classList.add("is-visible");
      } else {
        hadesToast.classList.add("is-visible");
      }

      // Auto-hide after ~4 seconds
      setTimeout(() => {
        hadesToast.classList.add("is-hiding");
        setTimeout(() => {
          hadesToast.classList.remove("is-visible", "is-hiding");
        }, 420);
      }, 4000);
    }

    let hadesShown = false;

    // trigger once shortly after initial load
    setTimeout(() => {
      if (!hadesShown) {
        hadesShown = true;
        showHadesToast();
      }
    }, 900);

    if (hadesCloseBtn) {
      hadesCloseBtn.addEventListener("click", () => {
        hadesToast.classList.add("is-hiding");
        setTimeout(() => {
          hadesToast.classList.remove("is-visible", "is-hiding");
        }, 300);
      });
    }
  }

  /* ---------------------------------------------------------
     Showcase Updates Modal (first-time only)
     --------------------------------------------------------- */
  const SHOWCASE_SEEN_KEY = "agoraShowcaseSeen";
  const showcaseModal = document.getElementById("showcase-modal");
  const showcaseModalClose = document.getElementById("showcase-modal-close");
  const showcaseModalCta = document.getElementById("showcase-modal-cta");

  function openShowcaseModalOnce() {
    if (!showcaseModal) return;

    const alreadySeen = localStorage.getItem(SHOWCASE_SEEN_KEY) === "true";
    if (alreadySeen) return;

    // mark as seen so we only show this the first time
    localStorage.setItem(SHOWCASE_SEEN_KEY, "true");
    showcaseModal.classList.add("is-open");
  }

  function closeShowcaseModal() {
    if (!showcaseModal) return;
    showcaseModal.classList.remove("is-open");
  }

  if (showcaseModalClose) {
    showcaseModalClose.addEventListener("click", closeShowcaseModal);
  }

  if (showcaseModalCta) {
    showcaseModalCta.addEventListener("click", closeShowcaseModal);
  }

  // Click outside the panel to close
  if (showcaseModal) {
    showcaseModal.addEventListener("click", (event) => {
      if (event.target === showcaseModal) {
        closeShowcaseModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      showcaseModal &&
      showcaseModal.classList.contains("is-open")
    ) {
      closeShowcaseModal();
    }
  });

  // Any Showcase / Gallery trigger should be able to open it
  const showcaseTriggers = document.querySelectorAll(
    '[data-view="showcase"], [data-view="gallery"]'
  );

  showcaseTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      // let the view transition settle, then show modal (if first time)
      setTimeout(openShowcaseModalOnce, 600);
    });
  });

  /* ---------------------------------------------------------
     Footer Newsletter Handling
     - Sends newsletter signup to Discord Webhook
     --------------------------------------------------------- */
  if (footerForm) {
    footerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = footerForm.querySelector("#footer-email");
      const emailVal = emailInput ? emailInput.value.trim() : "";

      // Require valid email
      if (!emailVal || !emailPattern.test(emailVal)) {
        alert("Please enter a valid email address to receive updates.");
        return;
      }

      const embed = {
        title: "New Newsletter Signup",
        description:
          "A user requested to receive updates, product news, and possible discounts from Agora Exchange.",
        color: 0x00c8ff,
        fields: [
          {
            name: "Email",
            value: emailVal,
            inline: false,
          },
          {
            name: "Source",
            value: "Footer newsletter form on Agora site",
            inline: false,
          },
        ],
        footer: {
          text: "Agora Exchange · Signal, not noise.",
        },
        timestamp: new Date().toISOString(),
      };

      const payload = {
        content: "📡 **New newsletter signup received.**",
        embeds: [embed],
      };

      try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error(
            "Discord webhook error (newsletter):",
            res.status,
            res.statusText
          );
          alert(
            "We hit an issue adding this email to the updates queue. Please try again shortly."
          );
          return;
        }

        footerForm.reset();
        alert(
          "Subscribed. You’ll be added to the Agora updates list for news, releases, and occasional discounts."
        );
      } catch (err) {
        console.error("Discord webhook fetch failed (newsletter):", err);
        alert(
          "Something went wrong while sending this signup. Check your connection and try again."
        );
      }
    });
  }

  /* ---------------------------------------------------------
     Initial State
     --------------------------------------------------------- */
  setActiveView("home");
});

// ======================================================
// AGORA EXCHANGE — Subtle Cyber Background Mesh
// Adds a low-key animated node network behind the app
// ======================================================
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const appShell = document.getElementById("app-shell");
    if (!appShell) return;

    // Create background canvas
    const canvas = document.createElement("canvas");
    canvas.id = "agora-bg-mesh";
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "0",
      pointerEvents: "none",
      opacity: "0.45", // subtle
    });

    // Put canvas at the very back
    document.body.insertBefore(canvas, document.body.firstChild);

    // Make sure the main app sits above it
    appShell.style.position = appShell.style.position || "relative";
    appShell.style.zIndex = "1";

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const NODE_COUNT_DESKTOP = 42;
    const NODE_COUNT_MOBILE = 22;
    const LINK_DISTANCE = 150;
    const nodes = [];

    function initNodes() {
      nodes.length = 0;
      const count =
        window.innerWidth < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3, // slow drift
          vy: (Math.random() - 0.5) * 0.3,
          r: 1.2 + Math.random() * 1.2,
          hueShift: Math.random(),
        });
      }
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    }

    window.addEventListener("resize", () => {
      // Throttle resize a bit
      clearTimeout(resize._t);
      resize._t = setTimeout(resize, 150);
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Soft vignette gradient
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        0,
        width * 0.5,
        height * 0.6,
        Math.max(width, height)
      );
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.0)");
      gradient.addColorStop(1, "rgba(15, 23, 42, 0.9)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINK_DISTANCE) {
            const alpha = 1 - dist / LINK_DISTANCE;
            ctx.strokeStyle = `rgba(100, 255, 218, ${alpha * 0.18})`; // teal
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Soft glow
        ctx.beginPath();
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Core dot (mix of teal + subtle blue)
        const t = n.hueShift;
        const teal = `rgba(100,255,218,0.85)`;
        const blue = `rgba(130,160,255,0.9)`;
        ctx.beginPath();
        ctx.fillStyle = t > 0.6 ? blue : teal;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function update() {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Gentle wrap around edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    // Init & start
    resize();
    loop();
  });
})();

// ======================================================
// Force scroll-to-top on any internal "page" change
// (for anything using data-view="...")
// ======================================================
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-view]");
  if (!trigger) return;

  const targetView = trigger.getAttribute("data-view");
  if (!targetView) return;

  // Tiny delay so the view swap logic runs first
  setTimeout(() => {
    // Try scrolling the main window
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Also try scrolling main app containers, in case they’re scrollable
    const possibleScrollers = [
      document.querySelector(".site-main"),
      document.querySelector(".app-shell"),
      document.documentElement,
      document.body,
    ];

    possibleScrollers.forEach((el) => {
      if (!el || typeof el.scrollTo !== "function") return;
      el.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }, 10);
});

/* =========================================================
   AGORA EXCHANGE — Showcase Modal Mesh Background
   Re-uses the main site mesh logic but scoped to modal only
   ========================================================= */

(function () {
  const modalPanel = document.querySelector(".showcase-modal-panel");
  const modalCanvas = document.getElementById("showcase-mesh");
  if (!modalPanel || !modalCanvas) return;

  const ctx = modalCanvas.getContext("2d");

  function resizeCanvas() {
    modalCanvas.width = modalPanel.offsetWidth;
    modalCanvas.height = modalPanel.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const nodes = [];
  const LINK_DIST = 120;
  const COUNT = 26;

  function init() {
    nodes.length = 0;
    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * modalCanvas.width,
        y: Math.random() * modalCanvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

    // Links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DIST) {
          const alpha = 1 - dist / LINK_DIST;
          ctx.strokeStyle = `rgba(100,255,218,${alpha * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.fillStyle = "rgba(100,255,218,0.9)";
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function update() {
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -10) n.x = modalCanvas.width + 10;
      if (n.x > modalCanvas.width + 10) n.x = -10;
      if (n.y < -10) n.y = modalCanvas.height + 10;
      if (n.y > modalCanvas.height + 10) n.y = -10;
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  init();
  loop();
})();
