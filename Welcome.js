const WELCOME_TEXT = "Welcome to Voltage Dictionary";
const COPYRIGHT_TEXT = "Powered by the Surge⚡|Voltage Lord";

// ================ PARTICLE.JS INIT ================
particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: ["#bc13fe", "#6a0dad", "#0ff0fc"] },
    shape: { type: "circle" },
    opacity: {
      value: 0.5,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0.1 }
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.1 }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#6a0dad",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      out_mode: "out",
      attract: { enable: true, rotateX: 600, rotateY: 1200 }
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: true, mode: "push" },
      resize: true
    },
    modes: {
      grab: { distance: 140, line_linked: { opacity: 1 } },
      push: { particles_nb: 4 }
    }
  },
  retina_detect: true
});

// ================ TYPING ANIMATION ================
function typeWriter(text, element, speed, callback) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  
  type();
}

// ================ INITIALIZE WELCOME PAGE ================
function initWelcomePage() {
  const welcomeText = document.getElementById('welcome-text');
  const copyrightText = document.getElementById('copyright-text');
  const welcomeButtons = document.getElementById('welcome-buttons');
  
  // Start typing animation
  typeWriter(WELCOME_TEXT, welcomeText, 100, () => {
    // Show copyright after welcome text finishes
    copyrightText.textContent = COPYRIGHT_TEXT;
    
    // Show buttons after copyright appears
    setTimeout(() => {
      welcomeButtons.classList.remove('hidden');
      welcomeButtons.classList.add('show');
    }, 1000);
  });
  
  // Button event listeners
  document.getElementById('continue-btn').addEventListener('click', () => {
    window.location.href = 'di.html';
  });
  
  document.getElementById('projects-btn').addEventListener('click', () => {
    window.location.href = 'projects.html';
  });
}

// Start the welcome page
document.addEventListener('DOMContentLoaded', initWelcomePage);
