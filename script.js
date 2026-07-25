/* =========================================================
   AGORA EXCHANGE — script.js
   View Switching · Navigation · Basic Form Handling
   + Careers (career.html) safe linking support
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
     Hero motion: typewriter, word reels, and staggered updates
     --------------------------------------------------------- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionDelay = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function waitForVisiblePage() {
    while (document.hidden && !reducedMotion.matches) {
      await motionDelay(600);
    }
  }

  async function runTypewriter(element) {
    const target = element?.dataset.typewriter || "";
    if (!element || !target || reducedMotion.matches) return;

    element.classList.add("is-animated");
    await motionDelay(420);

    while (!reducedMotion.matches && document.documentElement.contains(element)) {
      element.textContent = "";

      for (let index = 1; index <= target.length; index += 1) {
        if (reducedMotion.matches) break;
        await waitForVisiblePage();
        element.textContent = target.slice(0, index);
        await motionDelay(index === target.length ? 150 : 105);
      }

      if (reducedMotion.matches) break;
      element.classList.add("is-complete");
      await motionDelay(3400);
      element.classList.remove("is-complete");

      for (let index = target.length - 1; index >= 0; index -= 1) {
        if (reducedMotion.matches) break;
        await waitForVisiblePage();
        element.textContent = target.slice(0, index);
        await motionDelay(48);
      }

      await motionDelay(520);
    }

    element.textContent = target;
    element.classList.remove("is-animated", "is-complete");
  }

  async function runWordReel(element, words, initialDelay, holdTime) {
    if (!element || !words.length || reducedMotion.matches) return;
    let wordIndex = Math.max(0, words.indexOf(element.textContent.trim()));
    await motionDelay(initialDelay);

    while (!reducedMotion.matches && document.documentElement.contains(element)) {
      await waitForVisiblePage();
      element.classList.add("is-exiting");
      await motionDelay(280);

      if (reducedMotion.matches) break;
      wordIndex = (wordIndex + 1) % words.length;
      element.textContent = words[wordIndex];
      element.classList.remove("is-exiting");
      element.classList.add("is-entering");
      await motionDelay(480);
      element.classList.remove("is-entering");
      await motionDelay(holdTime);
    }

    element.classList.remove("is-exiting", "is-entering");
  }

  const headlineWordSets = [
    ["websites", "software", "platforms", "dashboards"],
    ["tools", "consoles", "modules", "automations"],
    ["scripts", "systems", "workflows", "integrations"],
  ];
  const solutionWordSets = [
    ["Web", "Software", "Games", "Coding", "Botnet"],
    ["Tools", "Tinkers", "Gadgets", "Modules", "Hacks"],
    ["Scripts", "Zerosploits", "Exploits", "Payloads"],
    ["Cheats", "Unlock-Alls", "Backdoors", "Hacking"],
  ];
  const clientWordSets = [
    ["Creators", "Founders", "Startups"],
    ["Teams", "Agencies", "Studios"],
    ["Operators", "Researchers", "Enterprises"],
  ];

  if (!reducedMotion.matches) {
    void runTypewriter(document.querySelector("[data-typewriter]"));

    document.querySelectorAll("[data-headline-cycle]").forEach((element, index) => {
      void runWordReel(element, headlineWordSets[index] || [], 4400 + index * 1250, 5900 + index * 430);
    });

    document.querySelectorAll("[data-solution-cycle]").forEach((element, index) => {
      void runWordReel(element, solutionWordSets[index] || [], 1300 + index * 1350, 3500 + index * 520);
    });

    document.querySelectorAll("[data-client-cycle]").forEach((element, index) => {
      void runWordReel(element, clientWordSets[index] || [], 3200 + index * 1900, 5400 + index * 650);
    });
  }

  /* ---------------------------------------------------------
     Helper: identify external / real navigation anchors
     --------------------------------------------------------- */
  function isExternalOrRealNav(el) {
    if (!el) return false;
    if (el.tagName && el.tagName.toLowerCase() !== "a") return false;

    const href = (el.getAttribute("href") || "").trim();

    // Real navigation: career.html, /path, https://, mailto:, tel:, etc.
    if (!href) return false;
    if (href === "#") return false;

    // allow normal navigation for anything not a hash-only link
    return true;
  }

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

    // Sync nav active state (only for internal SPA links that have data-view)
    navLinks.forEach((link) => {
      const viewName = link.getAttribute("data-view");
      if (!viewName) return;
      link.classList.toggle("is-active", viewName === targetView);
    });

    // Close mobile nav if open
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    }

    // Prefill contact form if we just navigated there from a specific button
    if (targetView === "contact" && sourceEl) {
      prefillContactFromSource(sourceEl);
    }

    // Always scroll to top when switching views
    smoothScrollToTop();
  }

  /* ---------------------------------------------------------
     Global: Click any [data-view] trigger (SPA only)
     --------------------------------------------------------- */
  function handleViewTriggerClick(event) {
    const target = event.currentTarget;

    // ✅ If someone accidentally adds data-view to a real link like career.html,
    // let the browser navigate normally.
    if (isExternalOrRealNav(target)) return;

    event.preventDefault();
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

    // ✅ Close nav when clicking any real <a href="..."> inside it (like career.html)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = (a.getAttribute("href") || "").trim();
      if (!href || href === "#") return;

      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
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
          { name: "Name", value: nameVal || "N/A", inline: true },
          { name: "Email", value: emailVal || "N/A", inline: true },
          { name: "Team / Brand / Project", value: orgVal || "N/A", inline: false },
          { name: "Primary Need", value: focusLabel, inline: true },
          { name: "Rough Budget", value: budgetLabel, inline: true },
          { name: "Mission / Details", value: messageVal || "No message provided.", inline: false },
        ],
        footer: { text: "Agora Exchange · From concept to code" },
        timestamp: new Date().toISOString(),
      };

      const payload = {
        content: "📥 **New contact submission received via Agora Exchange.**",
        embeds: [embed],
      };

      try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Discord webhook error (contact):", res.status, res.statusText);
          alert("We hit an issue sending your request to Agora. Please try again in a moment.");
          return;
        }

        contactForm.reset();
        alert("Thank you. Your details were sent to Agora successfully.");
      } catch (err) {
        console.error("Discord webhook fetch failed (contact):", err);
        alert("Something went wrong while sending your request. Check your connection and try again.");
      }
    });
  }

  /* ---------------------------------------------------------
     Gallery Filters (Software / Websites / Tinker / Tools)
     --------------------------------------------------------- */
  const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");

        filterButtons.forEach((b) => b.classList.toggle("is-active", b === btn));

        galleryItems.forEach((item) => {
          const category = item.getAttribute("data-category");
          const shouldShow = filter === "all" || category === filter;
          item.classList.toggle("is-hidden", !shouldShow);
        });

        const gallerySection = document.querySelector(".view-gallery.is-active");
        if (gallerySection) {
          const top = gallerySection.offsetTop - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Showcase image viewer and inquiry routing
     --------------------------------------------------------- */
  const imageLightbox = document.getElementById("image-lightbox");
  const imageLightboxImage = document.getElementById("image-lightbox-img");
  const imageLightboxClose = document.getElementById("image-lightbox-close");
  const galleryImages = document.querySelectorAll(".gallery-item .gallery-figure img");
  let activeGalleryImage = null;

  function openImageLightbox(image) {
    if (!imageLightbox || !imageLightboxImage || !image) return;
    activeGalleryImage = image;
    imageLightboxImage.src = image.currentSrc || image.src;
    imageLightboxImage.alt = image.alt || "Expanded showcase image";
    imageLightbox.classList.add("is-open");
    imageLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("image-lightbox-open");
    imageLightboxClose?.focus({ preventScroll: true });
  }

  function closeImageLightbox() {
    if (!imageLightbox) return;
    imageLightbox.classList.remove("is-open");
    imageLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("image-lightbox-open");
    activeGalleryImage?.focus({ preventScroll: true });
    activeGalleryImage = null;
  }

  galleryImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `View full-size image: ${image.alt || "Showcase item"}`);
    image.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageLightbox(image);
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        openImageLightbox(image);
      }
    });
  });

  imageLightboxClose?.addEventListener("click", closeImageLightbox);
  imageLightbox?.addEventListener("click", (event) => {
    if (event.target === imageLightbox) closeImageLightbox();
  });

  function openGalleryInquiry(card) {
    if (!card || !contactForm) return;
    const title = card.querySelector(".gallery-title")?.textContent.trim() || "this item";
    const category = card.dataset.category || "showcase";
    const typeLabels = {
      software: "Software",
      websites: "Website",
      tinker: "Tinker project",
      tools: "Tool",
    };
    const focusValues = {
      software: "ops-console",
      websites: "cyber-landing",
      tinker: "other",
      tools: "script-kit",
    };
    const typeLabel = typeLabels[category] || "Item";
    const focusSelect = contactForm.querySelector("#contact-focus");
    const messageField = contactForm.querySelector("#contact-message");

    if (focusSelect) focusSelect.value = focusValues[category] || "other";
    if (messageField) {
      messageField.value =
        `I'm interested in the ${typeLabel} “${title}” listed in your Showcase.\n\n` +
        "I'd like to discuss availability, pricing, and the best way to purchase or customize it. " +
        "Here are a few details about what I need:";
    }
    setActiveView("contact");
    requestAnimationFrame(() => messageField?.focus({ preventScroll: true }));
  }

  galleryItems.forEach((card) => {
    if (card.hasAttribute("data-product")) return;
    card.classList.add("gallery-item-inquiry");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const title = card.querySelector(".gallery-title")?.textContent.trim() || "showcase item";
    card.setAttribute("aria-label", `Ask Agora about ${title}`);
    card.addEventListener("click", () => openGalleryInquiry(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGalleryInquiry(card);
      }
    });
  });

  /* ---------------------------------------------------------
     Purchasable Tool Details
     --------------------------------------------------------- */
  const productModal = document.getElementById("product-modal");
  const productModalClose = document.getElementById("product-modal-close");
  const productModalImage = document.getElementById("product-modal-image");
  const productModalKicker = document.getElementById("product-modal-kicker");
  const productModalTitle = document.getElementById("product-modal-title");
  const productModalDescription = document.getElementById("product-modal-description");
  const productModalPrice = document.getElementById("product-modal-price");
  const productModalBilling = document.getElementById("product-modal-billing");
  const productModalRequirement = document.getElementById("product-modal-requirement");
  const productModalCheckout = document.getElementById("product-modal-checkout");
  const productCards = document.querySelectorAll(".gallery-item[data-product]");
  let activeProductCard = null;

  function openProductModal(card) {
    if (!productModal || !card) return;

    activeProductCard = card;
    const productTitle = card.dataset.productTitle || "Agora Tool";
    const checkoutUrl = (card.dataset.checkoutUrl || "").trim();

    if (productModalImage) {
      productModalImage.src = card.dataset.productImage || "";
      productModalImage.alt = `${productTitle} preview`;
    }
    if (productModalKicker) productModalKicker.textContent = card.dataset.productKicker || "Agora tool";
    if (productModalTitle) productModalTitle.textContent = productTitle;
    if (productModalDescription) {
      productModalDescription.textContent = card.dataset.productDescription || "";
    }
    if (productModalPrice) productModalPrice.textContent = card.dataset.productPrice || "";
    if (productModalBilling) productModalBilling.textContent = card.dataset.productBilling || "";
    if (productModalRequirement) {
      productModalRequirement.textContent = card.dataset.productRequirement || "";
    }

    if (productModalCheckout) {
      if (checkoutUrl) {
        productModalCheckout.href = checkoutUrl;
        productModalCheckout.textContent = "Subscribe with Square";
        productModalCheckout.classList.remove("is-disabled");
        productModalCheckout.removeAttribute("aria-disabled");
        productModalCheckout.removeAttribute("tabindex");
      } else {
        productModalCheckout.removeAttribute("href");
        productModalCheckout.textContent = "Square link coming soon";
        productModalCheckout.classList.add("is-disabled");
        productModalCheckout.setAttribute("aria-disabled", "true");
        productModalCheckout.setAttribute("tabindex", "-1");
      }
    }

    productModal.classList.add("is-open");
    productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("product-modal-open");
    productModalClose?.focus({ preventScroll: true });
  }

  function closeProductModal() {
    if (!productModal) return;

    productModal.classList.remove("is-open");
    productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("product-modal-open");
    activeProductCard?.focus({ preventScroll: true });
    activeProductCard = null;
  }

  function activateProductCard(card) {
    if ((card.dataset.checkoutUrl || "").trim()) {
      openProductModal(card);
    } else {
      openGalleryInquiry(card);
    }
  }

  productCards.forEach((card) => {
    card.addEventListener("click", () => activateProductCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateProductCard(card);
      }
    });
  });

  productModalClose?.addEventListener("click", closeProductModal);

  productModal?.addEventListener("click", (event) => {
    if (event.target === productModal) closeProductModal();
  });

  productModalCheckout?.addEventListener("click", (event) => {
    if (productModalCheckout.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }

    if (!allLegalDocumentsAccepted()) {
      event.preventDefault();
      openPurchaseConsent(productModalCheckout.href);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageLightbox?.classList.contains("is-open")) {
      closeImageLightbox();
      return;
    }
    if (
      event.key === "Escape" &&
      productModal?.classList.contains("is-open") &&
      !legalModal?.classList.contains("is-open") &&
      !purchaseConsentModal?.classList.contains("is-open")
    ) {
      closeProductModal();
    }
  });

  /* ---------------------------------------------------------
     Legal documents and checkout consent
     --------------------------------------------------------- */
  const LEGAL_VERSION = "2026-07-24";
  const LEGAL_STORAGE_KEY = `agora-legal-acceptance:${LEGAL_VERSION}`;
  const legalModal = document.getElementById("legal-modal");
  const legalModalTitle = document.getElementById("legal-modal-title");
  const legalModalClose = document.getElementById("legal-modal-close");
  const legalModalScroll = document.getElementById("legal-modal-scroll");
  const legalModalStatus = document.getElementById("legal-modal-status");
  const legalAccept = document.getElementById("legal-modal-accept");
  const legalAcceptLabel = document.getElementById("legal-modal-accept-label");
  const legalAcceptText = document.getElementById("legal-modal-accept-text");
  const purchaseConsentModal = document.getElementById("purchase-consent-modal");
  const purchaseConsentClose = document.getElementById("purchase-consent-close");
  const purchaseConsentStatus = document.getElementById("purchase-consent-status");
  const purchaseConsentContinue = document.getElementById("purchase-consent-continue");
  const purchaseConsentDocuments = document.querySelectorAll(
    ".purchase-consent-document[data-legal-document]",
  );
  const legalDocumentTriggers = document.querySelectorAll("[data-legal-document]");
  let currentLegalDocument = null;
  let legalReturnFocus = null;
  let pendingCheckoutUrl = "";

  function loadLegalAcceptance() {
    try {
      const saved = JSON.parse(localStorage.getItem(LEGAL_STORAGE_KEY) || "{}");
      return {
        privacy: Boolean(saved.privacy),
        terms: Boolean(saved.terms),
      };
    } catch {
      return { privacy: false, terms: false };
    }
  }

  const legalAcceptance = loadLegalAcceptance();

  function saveLegalAcceptance() {
    try {
      localStorage.setItem(
        LEGAL_STORAGE_KEY,
        JSON.stringify({
          privacy: legalAcceptance.privacy,
          terms: legalAcceptance.terms,
          acceptedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Consent still applies for this page session when storage is unavailable.
    }
  }

  function allLegalDocumentsAccepted() {
    return legalAcceptance.privacy && legalAcceptance.terms;
  }

  function setLegalStatus(message, complete = false) {
    if (!legalModalStatus) return;
    legalModalStatus.textContent = message;
    legalModalStatus.classList.toggle("is-complete", complete);
  }

  function updatePurchaseConsent() {
    purchaseConsentDocuments.forEach((button) => {
      const documentName = button.dataset.legalDocument;
      const accepted = Boolean(legalAcceptance[documentName]);
      button.disabled = accepted;
      button.classList.toggle("is-accepted", accepted);
      const detail = button.querySelector("small");
      if (detail) detail.textContent = accepted ? "Accepted" : "Review and accept";
    });

    const complete = allLegalDocumentsAccepted();
    if (purchaseConsentStatus) {
      purchaseConsentStatus.textContent = complete
        ? "We appreciate your time at Agora Exchange. You may now continue."
        : "Complete both documents to unlock checkout.";
      purchaseConsentStatus.classList.toggle("is-complete", complete);
    }
    if (purchaseConsentContinue) purchaseConsentContinue.hidden = !complete;
  }

  function legalScrollReachedBottom() {
    if (!legalModalScroll) return false;
    return (
      legalModalScroll.scrollTop + legalModalScroll.clientHeight >=
      legalModalScroll.scrollHeight - 6
    );
  }

  function unlockLegalAcceptance() {
    if (!legalAccept || !legalAcceptLabel || legalAccept.disabled === false) return;
    if (!legalScrollReachedBottom()) return;
    legalAccept.disabled = false;
    legalAcceptLabel.classList.remove("is-locked");
    setLegalStatus("You reached the end. Check the box to record your acceptance.");
  }

  function openLegalDocument(documentName, trigger) {
    if (!["privacy", "terms"].includes(documentName) || !legalModal || !legalModalScroll) return;

    const template = document.getElementById(`${documentName}-legal-content`);
    if (!template) return;

    currentLegalDocument = documentName;
    legalReturnFocus = trigger || document.activeElement;
    legalModalTitle.textContent = documentName === "privacy" ? "PRIVACY" : "TERMS";
    legalModalScroll.replaceChildren(template.content.cloneNode(true));
    legalModalScroll.scrollTop = 0;

    const accepted = Boolean(legalAcceptance[documentName]);
    legalAccept.checked = accepted;
    legalAccept.disabled = true;
    legalAcceptLabel.classList.add("is-locked");
    legalAcceptText.textContent =
      documentName === "privacy" ? "I accept the Privacy Policy" : "I accept the Terms of Service";
    legalModalClose.hidden = false;
    setLegalStatus(
      accepted
        ? "We appreciate your time at Agora Exchange. You may now continue."
        : "Scroll to the end to enable acceptance, or close without accepting.",
      accepted,
    );

    if (purchaseConsentModal?.classList.contains("is-open")) {
      purchaseConsentModal.setAttribute("aria-hidden", "true");
    }
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("legal-modal-open");
    requestAnimationFrame(() => {
      legalModalScroll.focus({ preventScroll: true });
      if (!accepted) unlockLegalAcceptance();
    });
  }

  function closeLegalDocument() {
    if (!legalModal || !currentLegalDocument) return;

    legalModal.classList.remove("is-open");
    legalModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("legal-modal-open");
    currentLegalDocument = null;
    if (purchaseConsentModal?.classList.contains("is-open")) {
      purchaseConsentModal.setAttribute("aria-hidden", "false");
      updatePurchaseConsent();
    }
    legalReturnFocus?.focus?.({ preventScroll: true });
    legalReturnFocus = null;
  }

  function openPurchaseConsent(checkoutUrl) {
    if (!purchaseConsentModal) return;
    pendingCheckoutUrl = checkoutUrl || pendingCheckoutUrl;
    updatePurchaseConsent();
    purchaseConsentModal.classList.add("is-open");
    purchaseConsentModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("purchase-consent-open");
    const firstRequired = [...purchaseConsentDocuments].find((button) => !button.disabled);
    (firstRequired || purchaseConsentContinue || purchaseConsentClose)?.focus({
      preventScroll: true,
    });
  }

  function closePurchaseConsent() {
    if (!purchaseConsentModal) return;
    purchaseConsentModal.classList.remove("is-open");
    purchaseConsentModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("purchase-consent-open");
    productModalCheckout?.focus({ preventScroll: true });
  }

  legalModalScroll?.addEventListener("scroll", unlockLegalAcceptance);

  legalAccept?.addEventListener("change", () => {
    if (!currentLegalDocument || !legalAccept.checked || legalAccept.disabled) return;
    legalAcceptance[currentLegalDocument] = true;
    saveLegalAcceptance();
    legalAccept.disabled = true;
    legalAcceptLabel.classList.add("is-locked");
    legalModalClose.hidden = false;
    setLegalStatus("We appreciate your time at Agora Exchange. You may now continue.", true);
    updatePurchaseConsent();
    legalModalClose.focus({ preventScroll: true });
  });

  legalDocumentTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const documentName = trigger.dataset.legalDocument;
      if (trigger.disabled && legalAcceptance[documentName]) return;
      openLegalDocument(documentName, trigger);
    });
  });

  legalModalClose?.addEventListener("click", closeLegalDocument);
  legalModal?.addEventListener("click", (event) => {
    if (event.target === legalModal) closeLegalDocument();
  });

  purchaseConsentClose?.addEventListener("click", closePurchaseConsent);
  purchaseConsentModal?.addEventListener("click", (event) => {
    if (event.target === purchaseConsentModal) closePurchaseConsent();
  });

  purchaseConsentContinue?.addEventListener("click", () => {
    if (allLegalDocumentsAccepted() && pendingCheckoutUrl) {
      window.location.assign(pendingCheckoutUrl);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (legalModal?.classList.contains("is-open")) {
      closeLegalDocument();
    } else if (purchaseConsentModal?.classList.contains("is-open")) {
      closePurchaseConsent();
    }
  });

  updatePurchaseConsent();

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
      return pick.line.replace("<hours>", `${hours} hour${hours === 1 ? "" : "s"}`);
    }

    function showHadesToast() {
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

      setTimeout(() => {
        hadesToast.classList.add("is-hiding");
        setTimeout(() => {
          hadesToast.classList.remove("is-visible", "is-hiding");
        }, 420);
      }, 4000);
    }

    let hadesShown = false;

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

    localStorage.setItem(SHOWCASE_SEEN_KEY, "true");
    showcaseModal.classList.add("is-open");
  }

  function closeShowcaseModal() {
    if (!showcaseModal) return;
    showcaseModal.classList.remove("is-open");
  }

  if (showcaseModalClose) showcaseModalClose.addEventListener("click", closeShowcaseModal);
  if (showcaseModalCta) showcaseModalCta.addEventListener("click", closeShowcaseModal);

  if (showcaseModal) {
    showcaseModal.addEventListener("click", (event) => {
      if (event.target === showcaseModal) closeShowcaseModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      showcaseModal &&
      showcaseModal.classList.contains("is-open")
    ) {
      closeShowcaseModal();
    }
  });

  const showcaseTriggers = document.querySelectorAll(
    '[data-view="showcase"], [data-view="gallery"]'
  );

  showcaseTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
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
          { name: "Email", value: emailVal, inline: false },
          { name: "Source", value: "Footer newsletter form on Agora site", inline: false },
        ],
        footer: { text: "Agora Exchange · Signal, not noise." },
        timestamp: new Date().toISOString(),
      };

      const payload = {
        content: "📡 **New newsletter signup received.**",
        embeds: [embed],
      };

      try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Discord webhook error (newsletter):", res.status, res.statusText);
          alert("We hit an issue adding this email to the updates queue. Please try again shortly.");
          return;
        }

        footerForm.reset();
        alert("Subscribed. You’ll be added to the Agora updates list for news, releases, and occasional discounts.");
      } catch (err) {
        console.error("Discord webhook fetch failed (newsletter):", err);
        alert("Something went wrong while sending this signup. Check your connection and try again.");
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
      const count = window.innerWidth < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
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
      clearTimeout(resize._t);
      resize._t = setTimeout(resize, 150);
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

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

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINK_DISTANCE) {
            const alpha = 1 - dist / LINK_DISTANCE;
            ctx.strokeStyle = `rgba(100, 255, 218, ${alpha * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        ctx.beginPath();
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

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

    resize();
    loop();
  });
})();

// ======================================================
// Force scroll-to-top on internal SPA view change only
// ======================================================
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-view]");
  if (!trigger) return;

  // ✅ Don’t mess with real navigation like career.html
  if (trigger.tagName && trigger.tagName.toLowerCase() === "a") {
    const href = (trigger.getAttribute("href") || "").trim();
    if (href && href !== "#") return;
  }

  const targetView = trigger.getAttribute("data-view");
  if (!targetView) return;

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const possibleScrollers = [
      document.querySelector(".site-main"),
      document.querySelector(".app-shell"),
      document.documentElement,
      document.body,
    ];

    possibleScrollers.forEach((el) => {
      if (!el || typeof el.scrollTo !== "function") return;
      el.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, 10);
});

/* =========================================================
   AGORA EXCHANGE — Showcase Modal Mesh Background
   Re-uses the main site mesh logic but scoped to modal only
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
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
          r: 1 + Math.random() * 1.2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

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
  });
})();
