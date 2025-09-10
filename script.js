// Background color transition
const sections = document.querySelectorAll("section, header");
const colors = [
  "#ffe6e6",
  "#9b667b",
  "#ffeaf5",
  "#9b667b"
];

// Variables for smooth parallax
let targetOffset = 0;
let currentOffset = 0;

function smoothParallax() {
  currentOffset += (targetOffset - currentOffset) * 0.1; 
  const heroImages = document.querySelector(".hero-images");
  if (heroImages) {
    heroImages.style.transform = `translateY(${currentOffset}px)`;
  }
  requestAnimationFrame(smoothParallax);
}
smoothParallax();

window.addEventListener("scroll", () => {
  let scrollPos = window.scrollY + window.innerHeight / 2;
  sections.forEach((section, index) => {
    if (
      section.offsetTop <= scrollPos &&
      section.offsetTop + section.offsetHeight > scrollPos
    ) {
      document.body.style.backgroundColor = colors[index];
    }
  });

  // Update target offset for parallax
  targetOffset = window.scrollY * 0.4;

  // Floating images animation
  const floatingImages = document.querySelectorAll(".item img, .decor-img img");
  floatingImages.forEach((img) => {
    let rect = img.getBoundingClientRect();
    let move = rect.top * 0.1;
    img.style.transform = `translateY(${move}px)`;
  });
});

// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// Dynamic greeting with fade-in
const now = new Date();
const hour = now.getHours();
const greetingElement = document.getElementById("greeting");

if (greetingElement) {
  if (hour >= 5 && hour < 12) {
    greetingElement.textContent = "Good Morning 🌞🥐✨";
  } else if (hour >= 12 && hour < 18) {
    greetingElement.textContent = "Good Afternoon 🥂🍰🌿";
  } else {
    greetingElement.textContent = "Good Evening 🌙🍷🎻";
  }
  // Fade-in effect
  setTimeout(() => {
    greetingElement.classList.add("show");
  }, 100); // small delay for smoother transition
}

// Scroll-triggered decor-img animation
const decorImages = document.querySelectorAll(".decor-img img");

const decorObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      decorObserver.unobserve(entry.target); // optional: animate once
    }
  });
}, { threshold: 0.3 });

decorImages.forEach(img => decorObserver.observe(img));
