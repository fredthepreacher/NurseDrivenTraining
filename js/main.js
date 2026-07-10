/* Nurse Driven Training — site scripts (vanilla JS, no dependencies) */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("is-open");
    });
    navLinks.querySelectorAll(":scope > li > a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
      });
    });
    /* Escape closes the mobile menu and returns focus to the toggle button */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
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
