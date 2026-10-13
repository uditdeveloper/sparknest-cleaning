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

  // Do not allow past dates
  dateInput.min = new Date().toISOString().split("T")[0];

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach(function (field) {
      const group = field.closest(".form-group");
      let fieldValid = field.value.trim() !== "";

      if (field.type === "email" && fieldValid) {
        fieldValid = isValidEmail(field.value.trim());
      }

      group.classList.toggle("has-error", !fieldValid);
      if (!fieldValid) isValid = false;
    });

    formMessage.className = "form-message";

    if (!isValid) {
      formMessage.textContent = "Please fill in all required fields correctly.";
      formMessage.classList.add("is-error");
      return;
    }

    // TODO: connect to your backend or form service here
    formMessage.textContent = "Thank you! We’ll get back to you shortly.";
    formMessage.classList.add("is-success");
    form.reset();
  });

  // Remove the error state as soon as the user edits a field
  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      field.closest(".form-group").classList.remove("has-error");
    });
  });

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
