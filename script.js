// Scroll event to handle section highlighting in navigation menu
const sections = document.querySelectorAll("section[id]");
const menuItems = document.querySelectorAll(".nav-elements a");
const nav = document.querySelector("nav");
const navElements = document.querySelector(".nav-elements");
const navHighlighter = document.querySelector(".nav-highlighter");
const stickyTop = document.querySelector(".sticky-top");
const bgLeft = document.querySelector(".bgLeft");
const bgRight = document.querySelector(".bgRight");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.onscroll = () => {
  if (menuItems.length === 0) return;

  let maxVisible = 0;
  let activeId = null;

  sections.forEach((section) => {
    let rect = section.getBoundingClientRect();
    let visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    let percentage = visibleHeight / window.innerHeight;

    if (percentage > 0.5 && percentage > maxVisible) {
      maxVisible = percentage;
      activeId = section.getAttribute("id");
    }
  });

  menuItems.forEach((link) => {
    link.classList.remove("active");
  });

  if (activeId) {
    const activeLink = document.querySelector(`.nav-elements a[href*="${activeId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
};

// Tab Highlighter Functionality
function refreshTabHighlighter() {
  if (!navHighlighter || !navElements) return;

  let activeLink = document.querySelector(
    "nav.sticky-top .nav-elements .nav-link.active"
  );
  if (activeLink) {
    navHighlighter.style.left = `${
      activeLink.getBoundingClientRect().left -
      navElements.getBoundingClientRect().left
    }px`;
    navHighlighter.style.width = `${activeLink.offsetWidth}px`;
  }
}

window.addEventListener("scroll", () => {
  refreshTabHighlighter();
  changeNav();
});

if (nav) {
  nav.addEventListener("click", () => {
    changeNav();
  });
}

window.addEventListener("resize", refreshTabHighlighter);
document.addEventListener("DOMContentLoaded", refreshTabHighlighter);

// Reveal function to handle element visibility on scroll
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add("active"));
    return;
  }

  reveals.forEach((reveal) => {
    var windowHeight = window.innerHeight;
    var elementTop = reveal.getBoundingClientRect().top;
    var elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add("active");
    } else {
      reveal.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", reveal);

// To check the scroll position on page load
reveal();

// Change navigation appearance on scroll
function changeNav() {
  if (!stickyTop || !nav || !bgLeft || !bgRight) return;

  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    stickyTop.style.cssText = `
      top: 0;
      background-color: rgba(255,255,255,0.8);
    `;
    nav.style.height = "40px";
    if (navHighlighter) {
      navHighlighter.style.height = "4px";
    }
    bgLeft.style.cssText = `
      background-color: rgba(255,255,255,0.8);
      width: 100vw;
      left: -100vw;
    `;
    bgRight.style.cssText = `
      background-color: rgba(255,255,255,0.8);
      width: 100vw;
    `;
  } else {
    stickyTop.style.cssText = `
      top: 2em;
      background-color: rgba(255,255,255,0.4);
    `;
    bgLeft.style.cssText = `
      background-color: rgba(255,255,255,0.4);
      width: 0vw;
      left: 0vw;
    `;
    bgRight.style.cssText = `
      background-color: rgba(255,255,255,0.4);
      width: 0vw;
    `;
    nav.style.height = "64px";
    if (navHighlighter) {
      navHighlighter.style.height = "6px";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const copyright = document.getElementById("copyright");
  if (copyright) {
    copyright.textContent = `\u00A9 ${new Date().getFullYear()}`;
  }
});
