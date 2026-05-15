window.addEventListener("DOMContentLoaded", () => {
  // GSAP intro animations
  gsap.from("header", { y: -100, opacity: 0, duration: 1 });
  gsap.from("#hero h2", { x: -100, opacity: 0, duration: 1, delay: 0.5 });
  gsap.from("#hero p", { x: 100, opacity: 0, duration: 1, delay: 0.7 });

  // Theme toggle setup
  const toggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);

  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("animate");
    setTimeout(() => {
      toggleBtn.classList.remove("animate");

      const theme = document.documentElement.getAttribute("data-theme");
      const next = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    }, 300);
  });

  // Name scaling letter animation
  const nameText = document.getElementById("name-text");
  const text = nameText.textContent;
  nameText.textContent = "";

  for (const char of text) {
    const span = document.createElement("span");
    if (char === " ") {
    span.innerHTML = "&nbsp;"; // Use non-breaking space for visible spacing
  } else {
    span.textContent = char;
  }
    nameText.appendChild(span);
  }

  const letters = nameText.querySelectorAll("span");
  let nameAnimating = false;

  function scaleLettersAnimation() {
    if (nameAnimating) return;
    nameAnimating = true;
    gsap.set(letters, { scale: 0 });
    gsap.to(letters, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
      stagger: 0.1,
      onComplete: () => { nameAnimating = false; },
    });
  }

  scaleLettersAnimation();

  nameText.addEventListener("mouseenter", () => {
    scaleLettersAnimation();
  });

const projectWrappers = document.querySelectorAll(".project-preview-wrapper");
const supportsHover = window.matchMedia("(hover: hover)").matches;

if (supportsHover) {
  projectWrappers.forEach(wrapper => {
    const video = wrapper.querySelector("video.preview-video");
    const img = wrapper.querySelector("img");

    wrapper.addEventListener("mouseenter", () => {
      video.style.opacity = "1";
      img.style.opacity = "0";
      video.play().catch(() => {});
    });

    wrapper.addEventListener("mouseleave", () => {
      video.style.opacity = "0";
      img.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
    });
  });
} else if ("IntersectionObserver" in window) {
  const previewObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const wrapper = entry.target;
      const video = wrapper.querySelector("video.preview-video");
      const img = wrapper.querySelector("img");
      if (!video) return;

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        video.style.opacity = "1";
        img.style.opacity = "0";
        video.play().catch(() => {});
      } else {
        video.pause();
        video.style.opacity = "0";
        img.style.opacity = "1";
      }
    });
  }, { threshold: [0, 0.5, 1] });

  projectWrappers.forEach(wrapper => previewObserver.observe(wrapper));
}
});
