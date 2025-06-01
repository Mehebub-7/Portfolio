window.addEventListener("DOMContentLoaded", () => {
  // GSAP intro animations
  gsap.from("header", { y: -100, opacity: 0, duration: 1 });
  gsap.from("#hero h2", { x: -100, opacity: 0, duration: 1, delay: 0.5 });
  gsap.from("#hero p", { x: 100, opacity: 0, duration: 1, delay: 0.7 });
  gsap.from(".btn", { scale: 0.8, opacity: 0, duration: 1, delay: 1 });

  // Theme toggle setup
  const toggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggleBtn.textContent = currentTheme === "dark" ? "🌙" : "☀️";

  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("animate");
    setTimeout(() => {
      toggleBtn.classList.remove("animate");

      let theme = document.documentElement.getAttribute("data-theme");
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        toggleBtn.textContent = "☀️";
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        toggleBtn.textContent = "🌙";
      }
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

  function scaleLettersAnimation() {
    gsap.set(letters, { scale: 0 });
    gsap.to(letters, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
      stagger: 0.1,
    });
  }

  scaleLettersAnimation();

  nameText.addEventListener("mouseenter", () => {
    scaleLettersAnimation();
  });

  // "View My Work" button hover bounce animation
  const btn = document.querySelector(".btn");

btn.addEventListener("mouseenter", () => {
  gsap.killTweensOf(btn);
  gsap.to(btn, {
    scale: 1.1,
    duration: 0.3,
    ease: "linear",
  });
});

btn.addEventListener("mouseleave", () => {
  gsap.killTweensOf(btn);
  gsap.to(btn, {
    scale: 1,
    duration: 0.3,
    ease: "linear",
  });
});
const projectWrappers = document.querySelectorAll(".project-preview-wrapper");

projectWrappers.forEach(wrapper => {
  const video = wrapper.querySelector("video.preview-video");
  const img = wrapper.querySelector("img");

  wrapper.addEventListener("mouseenter", () => {
    video.style.opacity = "1";
    img.style.opacity = "0";
    video.play();
  });

  wrapper.addEventListener("mouseleave", () => {
    video.style.opacity = "0";
    img.style.opacity = "1";
    video.pause();
    video.currentTime = 0;
  });
});
});
