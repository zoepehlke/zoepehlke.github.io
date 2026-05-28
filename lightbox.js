/**
 * Vanilla lightbox for project gallery images (.lightbox-image).
 * Self-contained — does not depend on script.js.
 */
(function () {
  const IMAGE_SELECTOR = ".lightbox-image";
  const OPEN_CLASS = "lightbox--open";

  let root = null;
  let overlay = null;
  let imageEl = null;
  let captionEl = null;
  let closeBtn = null;
  let prevBtn = null;
  let nextBtn = null;

  let images = [];
  let currentIndex = 0;
  let triggerElement = null;
  let isOpen = false;

  function handleDocumentKeydown(event) {
    if (!isOpen || !root) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowLeft":
        event.preventDefault();
        navigate(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        navigate(1);
        break;
      case "Tab":
        trapFocus(event);
        break;
      default:
        break;
    }
  }

  function init() {
    images = Array.from(document.querySelectorAll(IMAGE_SELECTOR));
    if (images.length === 0) return;

    buildLightbox();
    bindTriggers();
  }

  function buildLightbox() {
    root = document.createElement("div");
    root.className = "lightbox";
    root.id = "lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "lightbox-caption");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("tabindex", "-1");
    root.hidden = true;

    root.innerHTML = `
      <div class="lightbox__backdrop" data-lightbox-close tabindex="-1"></div>
      <div class="lightbox__panel">
        <button type="button" class="lightbox__close" aria-label="Lightbox schließen">
          <span aria-hidden="true">&times;</span>
        </button>
        <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Vorheriges Bild">
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Nächstes Bild">
          <span aria-hidden="true">&#8250;</span>
        </button>
        <figure class="lightbox__figure">
          <img class="lightbox__image" alt="">
          <figcaption id="lightbox-caption" class="lightbox__caption"></figcaption>
        </figure>
      </div>
    `;

    document.body.appendChild(root);

    overlay = root.querySelector(".lightbox__backdrop");
    imageEl = root.querySelector(".lightbox__image");
    captionEl = root.querySelector(".lightbox__caption");
    closeBtn = root.querySelector(".lightbox__close");
    prevBtn = root.querySelector(".lightbox__nav--prev");
    nextBtn = root.querySelector(".lightbox__nav--next");

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => navigate(-1));
    nextBtn.addEventListener("click", () => navigate(1));
    overlay.addEventListener("click", close);

    root.querySelector(".lightbox__panel").addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  function bindTriggers() {
    images.forEach((img, index) => {
      if (!img.hasAttribute("tabindex")) {
        img.setAttribute("tabindex", "0");
      }
      img.setAttribute("role", "button");
      img.setAttribute("aria-haspopup", "dialog");
      if (img.alt) {
        img.setAttribute("aria-label", `${img.alt} vergrößern`);
      }

      img.addEventListener("click", () => open(index, img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(index, img);
        }
      });
    });
  }

  function open(index, trigger) {
    if (!root || images.length === 0) return;

    triggerElement = trigger;
    currentIndex = index;
    updateSlide();
    updateNavVisibility();

    isOpen = true;
    document.addEventListener("keydown", handleDocumentKeydown);

    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add(OPEN_CLASS);

    requestAnimationFrame(() => {
      root.classList.add("is-visible");
      root.focus({ preventScroll: true });
    });
  }

  function close() {
    if (!root || root.hidden || !isOpen) return;

    isOpen = false;
    document.removeEventListener("keydown", handleDocumentKeydown);

    const restoreFocus = triggerElement;
    let closed = false;

    const finishClose = () => {
      if (closed) return;
      closed = true;
      root.hidden = true;
      imageEl.removeAttribute("src");
      captionEl.textContent = "";
      if (restoreFocus && typeof restoreFocus.focus === "function") {
        restoreFocus.focus();
      }
      triggerElement = null;
    };

    root.classList.remove("is-visible");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove(OPEN_CLASS);

    root.addEventListener(
      "transitionend",
      (event) => {
        if (event.target === root && event.propertyName === "opacity") {
          finishClose();
        }
      },
      { once: true }
    );

    window.setTimeout(finishClose, 300);
  }

  function navigate(delta) {
    if (images.length <= 1) return;
    currentIndex = (currentIndex + delta + images.length) % images.length;
    updateSlide();
    updateNavVisibility();
    if (root) {
      root.focus({ preventScroll: true });
    }
  }

  function updateSlide() {
    const source = images[currentIndex];
    if (!source) return;

    imageEl.src = source.currentSrc || source.src;
    imageEl.alt = source.alt || "";
    captionEl.textContent = source.alt || "";
  }

  function updateNavVisibility() {
    const hasMultiple = images.length > 1;
    prevBtn.hidden = !hasMultiple;
    nextBtn.hidden = !hasMultiple;
  }

  function trapFocus(event) {
    const focusable = root.querySelectorAll(
      'button:not([hidden]), [href], [tabindex]:not([tabindex="-1"])'
    );
    const elements = Array.from(focusable).filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
    if (elements.length === 0) return;

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (elements.length === 1) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (!root.contains(document.activeElement) || document.activeElement === root) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
