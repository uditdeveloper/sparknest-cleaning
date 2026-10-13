/* =========================================
   SparkNest Cleaning Co. - Main Script
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("main section[id]");

  /* ---------- 1. Mobile menu toggle ---------- */
  function closeMenu() {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu after a link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- 2. Header shadow on scroll ---------- */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    setActiveLink();
  }

  /* ---------- 3. Highlight active menu link ---------- */
  function setActiveLink() {
    const scrollPos = window.scrollY + header.offsetHeight + 120;
    let currentId = "home";

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    // Sections without their own menu item map to the nearest menu item
    const linkMap = {
      gallery: "process",
      testimonials: "about"
    };
    const target = linkMap[currentId] || currentId;

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + target);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. "Explore Service" pre-selects the service in the form ---------- */
  const serviceSelect = document.getElementById("service");

  document.querySelectorAll("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      serviceSelect.value = link.dataset.service;
    });
  });

  /* ---------- 5. Quote form validation ---------- */

const form = document.getElementById("quoteForm");
const formMessage = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

// Make.com webhook URL
const MAKE_WEBHOOK_URL =
  "https://hook.eu1.make.com/7p0snoe55uoks2fvkkdy0tpoc91m7lfq";

// Prevent past dates
if (dateInput) {
  const today = new Date();

  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  dateInput.min = localDate;
}

// Email validation
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (form && formMessage) {

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let isValid = true;

    const requiredFields = form.querySelectorAll("[required]");

    // Validate required fields
    requiredFields.forEach(function (field) {
      const group = field.closest(".form-group");

      let fieldValid = field.value.trim() !== "";

      if (field.type === "email" && fieldValid) {
        fieldValid = isValidEmail(field.value.trim());
      }

      if (field.type === "date" && fieldValid) {
        fieldValid =
          !dateInput.min || field.value >= dateInput.min;
      }

      if (group) {
        group.classList.toggle("has-error", !fieldValid);
      }

      if (!fieldValid) {
        isValid = false;
      }
    });

    formMessage.className = "form-message";
    formMessage.textContent = "";

    // Stop if validation fails
    if (!isValid) {
      formMessage.textContent =
        "Please fill in all required fields correctly.";

      formMessage.classList.add("is-error");
      return;
    }

    // Check webhook configuration
    if (
      !MAKE_WEBHOOK_URL ||
      MAKE_WEBHOOK_URL === "PASTE_YOUR_MAKE_WEBHOOK_URL_HERE"
    ) {
      formMessage.textContent =
        "The quote form is not connected yet. Please try again later.";

      formMessage.classList.add("is-error");
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');

    if (!submitButton) {
      formMessage.textContent =
        "Unable to submit the form. Please try again.";

      formMessage.classList.add("is-error");
      return;
    }

    const originalButtonHTML = submitButton.innerHTML;
    const formData = new FormData(form);

    // Collect form details
    const payload = {
      name: formData.get("name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      phone: formData.get("phone")?.trim() || "",
      service: formData.get("service") || "",
      date: formData.get("date") || "",
      size: formData.get("size") || "",
      details: formData.get("details")?.trim() || "",
      submittedAt: new Date().toISOString()
    };

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = "Sending...";

      formMessage.textContent =
        "Submitting your quote request...";

      // Send form data to Make.com
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(
          "Webhook request failed: " + response.status
        );
      }

      // Successful submission
      formMessage.textContent =
        "Thank you! Your quote request has been submitted successfully.";

      formMessage.classList.add("is-success");

      form.reset();

      // Reapply minimum date after reset
      if (dateInput) {
        const today = new Date();

        dateInput.min = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0")
        ].join("-");
      }

      // Clear validation errors
      form.querySelectorAll(".form-group").forEach(function (group) {
        group.classList.remove("has-error");
      });

    } catch (error) {
      console.error("Quote form submission error:", error);

      formMessage.textContent =
        "We couldn't submit your request. Please try again in a moment.";

      formMessage.classList.add("is-error");

    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHTML;
    }
  });

  // Remove field error when the user edits it
  form.querySelectorAll("input, select, textarea").forEach(function (field) {

    function clearFieldError() {
      const group = field.closest(".form-group");

      if (group) {
        group.classList.remove("has-error");
      }

      if (formMessage.classList.contains("is-error")) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
      }
    }

    field.addEventListener("input", clearFieldError);
    field.addEventListener("change", clearFieldError);
  });
}


  /* ---------- 6. Reveal sections on scroll ---------- */
  const revealItems = document.querySelectorAll(
    ".section__head, .service-card, .split__media, .split__content, .step, .gallery__item, .testimonial, .form-card, .quote__content"
  );

  if ("IntersectionObserver" in window) {
    revealItems.forEach(function (item) {
      item.classList.add("reveal");
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------- 7. Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
