/* Nurse Driven Training — site scripts (vanilla JS, no dependencies) */
(function () {
  "use strict";


  /* Progressive scroll-reveal motion and sticky-header polish */
  document.documentElement.classList.add("js");

  var revealTargets = document.querySelectorAll(
    ".section-head, .card, .step, .trust-item, .photo-frame, .cta-banner, .page-hero .container, .hero-grid > *"
  );
  revealTargets.forEach(function (el, index) {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", String((index % 4) * 70) + "ms");
  });

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var siteHeader = document.querySelector(".site-header");
  function updateHeaderState() {
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", !expanded);
    });
    navLinks.querySelectorAll(":scope > li > a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      });
    });
    /* Escape closes the mobile menu and returns focus to the toggle button */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
  }

  /* Nav dropdowns (Programs / Resources) */
  document.querySelectorAll(".nav-dropdown-trigger").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      /* close any other open dropdown first */
      document.querySelectorAll(".nav-dropdown-trigger[aria-expanded='true']").forEach(function (other) {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.classList.remove("is-open");
        }
      });
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("is-open", !expanded);
    });
  });
  /* Close open dropdowns when focus/click moves outside the nav */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item.has-dropdown")) {
      document.querySelectorAll(".nav-dropdown-trigger[aria-expanded='true']").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.classList.remove("is-open");
      });
    }
  });

  /* FAQ accordion */
  document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.classList.toggle("is-open", !expanded);
    });
  });

  /* Current year in footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Mark current nav link for accessibility (aria-current) */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* Capture UTM parameters (and referrer) into hidden form fields, once per session */
  (function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("ndt_utm") || "{}");
    } catch (err) { stored = {}; }
    var hasNew = false;
    utmFields.forEach(function (key) {
      var val = params.get(key);
      if (val) { stored[key] = val; hasNew = true; }
    });
    if (hasNew) {
      try { sessionStorage.setItem("ndt_utm", JSON.stringify(stored)); } catch (err) { /* ignore */ }
    }
    document.querySelectorAll("form[data-netlify-ajax]").forEach(function (form) {
      utmFields.forEach(function (key) {
        var input = form.querySelector('input[name="' + key + '"]');
        if (input && stored[key]) input.value = stored[key];
      });
      var pageField = form.querySelector('input[name="page_url"]');
      if (pageField) pageField.value = window.location.href;
    });
  })();

  /* Netlify AJAX submit with proper success/error handling */
  document.querySelectorAll("form[data-netlify-ajax]").forEach(function (form) {
    var errorBox = form.querySelector(".form-error");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) {
        return; // let native validation messages show
      }
      e.preventDefault();

      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        if (!submitBtn.dataset.originalText) submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }

      var data = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Submission failed with status " + response.status);
          window.location.assign(form.getAttribute("data-success") || "/thank-you.html");
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || "Send Request";
          }
          if (errorBox) {
            errorBox.hidden = false;
            errorBox.textContent = "Sorry, something went wrong sending your request. Please try again, or call us directly at (941) 822-1796.";
            errorBox.focus();
          }
        });
    });
  });
})();

/* Wavy-inspired experience enhancements — dependency-free and progressive. */
(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Global page progress indicator. */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = '<div class="scroll-progress__bar"></div>';
  document.body.prepend(progress);
  var progressBar = progress.firstElementChild;

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    progressBar.style.transform = "scaleX(" + ratio + ")";
  }
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  /* Gentle hero entrance and a cue that communicates page depth. */
  var hero = document.querySelector(".hero");
  if (hero) {
    var cueTarget = hero.querySelector(".hero-meta");
    if (cueTarget && !hero.querySelector(".scroll-cue")) {
      var cue = document.createElement("span");
      cue.className = "scroll-cue";
      cue.innerHTML = '<i aria-hidden="true"></i> Scroll to explore';
      cueTarget.insertAdjacentElement("afterend", cue);
    }
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { hero.classList.add("is-ready"); });
    });
  }

  /* Assign varied reveal directions for a more editorial flow. */
  document.querySelectorAll(".grid .card, .grid .step").forEach(function (el, index) {
    el.classList.add(index % 3 === 0 ? "reveal-left" : index % 3 === 2 ? "reveal-right" : "reveal-scale");
  });
  document.querySelectorAll(".photo-frame").forEach(function (el, index) {
    el.classList.add(index % 2 ? "reveal-right" : "reveal-left");
  });

  /* Homepage journey rail with active-section feedback. */
  var isHome = /(^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === "/";
  if (isHome && "IntersectionObserver" in window) {
    var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
    sections = sections.filter(function (section) { return section.offsetHeight > 180; });
    var rail = document.createElement("nav");
    rail.className = "page-journey";
    rail.setAttribute("aria-label", "Homepage sections");

    sections.forEach(function (section, index) {
      if (!section.id) section.id = "section-" + (index + 1);
      var heading = section.querySelector("h1, h2");
      var kicker = section.querySelector(".kicker, .eyebrow");
      var label = kicker ? kicker.textContent.trim() : heading ? heading.textContent.trim() : "Section " + (index + 1);
      if (label.length > 34) label = label.slice(0, 31) + "…";
      var link = document.createElement("a");
      link.href = "#" + section.id;
      link.dataset.label = label;
      link.setAttribute("aria-label", label);
      rail.appendChild(link);
    });
    document.body.appendChild(rail);

    var links = rail.querySelectorAll("a");
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (link) { link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id); });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* Persistent but unobtrusive return-to-top affordance. */
  var topButton = document.createElement("button");
  topButton.className = "back-to-top";
  topButton.type = "button";
  topButton.setAttribute("aria-label", "Back to top");
  topButton.innerHTML = "↑";
  document.body.appendChild(topButton);
  function setTopButton() { topButton.classList.toggle("is-visible", window.scrollY > 700); }
  setTopButton();
  window.addEventListener("scroll", setTopButton, { passive: true });
  topButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* Small parallax response on hero media, disabled for reduced motion/mobile. */
  var heroMedia = document.querySelector(".hero-media .photo-frame");
  if (heroMedia && !reducedMotion && window.matchMedia("(min-width: 900px)").matches) {
    window.addEventListener("scroll", function () {
      var y = Math.min(window.scrollY * .045, 24);
      heroMedia.style.transform = "translateY(" + y + "px)";
    }, { passive: true });
  }
})();
