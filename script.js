const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const backTop = document.querySelector(".back-top");
const revealItems = document.querySelectorAll(".reveal");
const skillCards = document.querySelectorAll(".skill-card");
const counters = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".tilt-card");
const form = document.querySelector("#contactForm");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const loader = document.querySelector("#loader");

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 2600);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

document.querySelectorAll(".nav-links a, .footer a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const setScrollState = () => {
  const scrolled = window.scrollY > 30;
  header.classList.toggle("scrolled", scrolled);
  backTop.classList.toggle("visible", window.scrollY > 600);
};

window.addEventListener("scroll", setScrollState, { passive: true });
setScrollState();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("visible");

    if (entry.target.classList.contains("skill-card")) {
      const progress = entry.target.dataset.progress || 0;
      entry.target.querySelector(".progress span").style.width = `${progress}%`;
    }

    if (entry.target.classList.contains("counter-card")) {
      const number = entry.target.querySelector("[data-count]");
      animateCounter(number);
    }
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => revealObserver.observe(item));
skillCards.forEach((card) => revealObserver.observe(card));
document.querySelectorAll(".counter-card").forEach((card) => revealObserver.observe(card));

function animateCounter(element) {
  if (element.dataset.animated) return;
  element.dataset.animated = "true";

  const target = Number(element.dataset.count);
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = `${target}+`;
    }
  };

  requestAnimationFrame(tick);
}

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 9;
    const rotateX = ((y / rect.height) - 0.5) * -9;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll("input, textarea")];
  let isValid = true;

  fields.forEach((field) => {
    const error = field.parentElement.querySelector(".error");
    error.textContent = "";

    if (!field.validity.valid) {
      isValid = false;
      if (field.validity.valueMissing) error.textContent = "This field is required.";
      else if (field.validity.typeMismatch) error.textContent = "Please enter a valid email address.";
      else if (field.validity.tooShort) error.textContent = `Please enter at least ${field.minLength} characters.`;
    }
  });

  const status = form.querySelector(".form-status");
  if (!isValid) {
    status.textContent = "";
    return;
  }

  status.textContent = "Message validated. Backend connection can be added later.";
  form.reset();
});

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    cursorRing.animate({
      left: `${event.clientX}px`,
      top: `${event.clientY}px`
    }, { duration: 420, fill: "forwards" });
  });

  document.querySelectorAll("a, button, input, textarea").forEach((item) => {
    item.addEventListener("mouseenter", () => cursorRing.classList.add("grow"));
    item.addEventListener("mouseleave", () => cursorRing.classList.remove("grow"));
  });
}

const canvas = document.querySelector("#particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = canvas.closest(".hero").offsetHeight;
  createParticles();
}

function createParticles() {
  const count = Math.min(90, Math.floor(window.innerWidth / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.8 + 0.7,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.55 + 0.2
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(8, 126, 164, ${particle.alpha})`;
    ctx.fill();

    for (let i = index + 1; i < particles.length; i += 1) {
      const other = particles[i];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 120) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(15, 159, 114, ${0.14 - distance / 1100})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();
