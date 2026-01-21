(() => {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // Footer year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Mobile menu toggle ---
  const menuBtn = $("[data-menu-button]");
  const nav = $("[data-nav]");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  }

  function toggleMenu() {
    if (!nav) return;
    const isOpen = nav.classList.contains("is-open");
    setMenu(!isOpen);
  }

  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);

  // Close menu when clicking a nav link (mobile)
  $$(".nav a").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) setMenu(false);
    });
  });

  // --- Smooth scrolling (with reduced motion support) ---
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$('.nav a[href^="#"], .hero a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // --- Projects filter ---
  const filterButtons = $$(".chip[data-filter]");
  const projectCards = $$(".project[data-category]");

  function filterProjects(category) {
    projectCards.forEach((card) => {
      const matches = category === "all" || card.dataset.category === category;
      card.style.display = matches ? "" : "none";
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      filterProjects(btn.dataset.filter);
    });
  });

  // --- Lightbox ---
  const modal = $("[data-lightbox-modal]");
  const modalImg = $("[data-lightbox-img]");
  const modalCaption = $("[data-lightbox-caption]");
  const closeEls = $$("[data-lightbox-close]");
  const lightboxTriggers = $$("[data-lightbox]");

  let lastFocusedEl = null;

  function openLightbox(imgEl) {
    if (!modal || !modalImg) return;

    lastFocusedEl = document.activeElement;

    modalImg.src = imgEl.currentSrc || imgEl.src;
    modalImg.alt = imgEl.alt || "확대 이미지";
    if (modalCaption) modalCaption.textContent = imgEl.alt || "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    // focus close button for accessibility
    const closeBtn = $(".lightbox-close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    if (modalImg) modalImg.src = "";
    if (modalCaption) modalCaption.textContent = "";

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  lightboxTriggers.forEach((img) => {
    img.addEventListener("click", () => openLightbox(img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(img);
      }
    });
    // Make images keyboard focusable if needed
    if (!img.hasAttribute("tabindex")) img.setAttribute("tabindex", "0");
  });

  closeEls.forEach((el) => el.addEventListener("click", closeLightbox));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // --- Contact form validation ---
  const form = $("[data-contact-form]");
  const statusEl = $("[data-form-status]");

  const nameInput = $("#name");
  const emailInput = $("#email");
  const messageInput = $("#message");

  const nameError = $("#name-error");
  const emailError = $("#email-error");
  const messageError = $("#message-error");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function setFieldError(input, errorEl, message) {
    if (!input || !errorEl) return;
    errorEl.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateName() {
    const v = (nameInput?.value || "").trim();
    const msg = v.length ? "" : "이름을 입력해주세요.";
    setFieldError(nameInput, nameError, msg);
    return !msg;
  }

  function validateEmail() {
    const v = (emailInput?.value || "").trim();
    let msg = "";
    if (!v) msg = "이메일을 입력해주세요.";
    else if (!emailRegex.test(v)) msg = "이메일 형식이 올바르지 않습니다.";
    setFieldError(emailInput, emailError, msg);
    return !msg;
  }

  function validateMessage() {
    const v = (messageInput?.value || "").trim();
    const msg = v.length ? "" : "메시지를 입력해주세요.";
    setFieldError(messageInput, messageError, msg);
    return !msg;
  }

  function validateForm() {
    const a = validateName();
    const b = validateEmail();
    const c = validateMessage();
    return a && b && c;
  }

  [nameInput, emailInput, messageInput].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (el === nameInput) validateName();
      if (el === emailInput) validateEmail();
      if (el === messageInput) validateMessage();
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (statusEl) statusEl.textContent = "";

      const ok = validateForm();
      if (!ok) {
        if (statusEl) statusEl.textContent = "입력값을 확인해주세요.";
        return;
      }

      // Demo success (no real sending)
      if (statusEl) statusEl.textContent = "메시지가 준비되었습니다! (데모: 전송은 생략)";
      form.reset();

      // reset aria-invalid state
      setFieldError(nameInput, nameError, "");
      setFieldError(emailInput, emailError, "");
      setFieldError(messageInput, messageError, "");
    });
  }
})();
