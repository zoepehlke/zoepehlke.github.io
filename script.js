// Scroll event to handle section highlighting in navigation menu
let sections = document.querySelectorAll("section");
let menuItems = document.querySelectorAll(".nav-elements a");

window.onscroll = () => {
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
    document.querySelector(`.nav-elements a[href*=${activeId}]`).classList.add("active");
  }
};

// Tab Highlighter Functionality
function refreshTabHighlighter() {
  let activeLink = document.querySelector(
    "nav.sticky-top .nav-elements .nav-link.active"
  );
  let navHighlighter = document.querySelector(".nav-highlighter");
  if (activeLink && navHighlighter) {
    navHighlighter.style.left = `${
      activeLink.getBoundingClientRect().left -
      document.querySelector(".nav-elements").getBoundingClientRect().left
    }px`;
    navHighlighter.style.width = `${activeLink.offsetWidth}px`;
  }
}

window.addEventListener("scroll", () => {
  refreshTabHighlighter();
  changeNav();
});

document.querySelector("nav").addEventListener("click", () => {
  changeNav();
});

window.addEventListener("resize", refreshTabHighlighter);
document.addEventListener("DOMContentLoaded", refreshTabHighlighter);

// Reveal function to handle element visibility on scroll
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

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
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.querySelector(".sticky-top").style.cssText = `
      top: 0;
      background-color: rgba(255,255,255,0.8);
    `;
    document.querySelector("nav").style.height = "40px";
    document.querySelector(".nav-highlighter").style.height = "4px";
    document.querySelector(".bgLeft").style.cssText = `
      background-color: rgba(255,255,255,0.8);
      width: 100vw;
      left: -100vw;
    `;
    document.querySelector(".bgRight").style.cssText = `
      background-color: rgba(255,255,255,0.8);
      width: 100vw;
    `;
  } else {
    document.querySelector(".sticky-top").style.cssText = `
      top: 2em;
      background-color: rgba(255,255,255,0.4);
    `;
    document.querySelector(".bgLeft").style.cssText = `
      background-color: rgba(255,255,255,0.4);
      width: 0vw;
      left: 0vw;
    `;
    document.querySelector(".bgRight").style.cssText = `
      background-color: rgba(255,255,255,0.4);
      width: 0vw;
    `;
    document.querySelector("nav").style.height = "64px";
    document.querySelector(".nav-highlighter").style.height = "6px";
  }
}

/* document.addEventListener("DOMContentLoaded", () => {
  new Glide(".glide").mount();
});
 */