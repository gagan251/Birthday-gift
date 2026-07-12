const scenes = [
  document.getElementById("introScene"),
  document.getElementById("messageScene"),
  document.getElementById("cakeScene"),
  document.getElementById("finaleScene")
];

const dots = [...document.querySelectorAll(".progress-dots span")];
const giftStage = document.getElementById("giftStage");
const openGift = document.getElementById("openGift");
const showCake = document.getElementById("showCake");
const candle = document.getElementById("candle");
const finaleButton = document.getElementById("finaleButton");
const celebrateAgain = document.getElementById("celebrateAgain");
const typeMessage = document.getElementById("typeMessage");
const soundToggle = document.getElementById("soundToggle");
const fireworksCanvas = document.getElementById("fireworks");
const ctx = fireworksCanvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");

let currentScene = 0;
let audioContext = null;
let soundOn = false;
let typingTimer = null;
let particles = [];
let rockets = [];
let animationId = null;

const birthdayText =
  "May this birthday remind you how loved, valuable and capable you are. " +
  "May every new morning bring fresh hope, every challenge make you stronger, " +
  "and every dream lead you toward something extraordinary.";

function changeScene(index) {
  currentScene = index;
  scenes.forEach((scene, i) => scene.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));

  if (index === 1) {
    startTyping();
  }

  if (index === 3) {
    launchFinale();
  }
}

function startTyping() {
  clearInterval(typingTimer);
  typeMessage.textContent = "";
  let i = 0;

  typingTimer = setInterval(() => {
    typeMessage.textContent += birthdayText[i] || "";
    i += 1;
    if (i >= birthdayText.length) clearInterval(typingTimer);
  }, 28);
}

function openSurprise() {
  if (giftStage.classList.contains("opened")) return;
  giftStage.classList.add("opened");
  playChime();
  createConfetti(110);

  setTimeout(() => {
    changeScene(1);
  }, 1450);
}

openGift.addEventListener("click", (event) => {
  event.stopPropagation();
  openSurprise();
});

giftStage.addEventListener("click", openSurprise);
giftStage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") openSurprise();
});

showCake.addEventListener("click", () => {
  playChime();
  changeScene(2);
});

candle.addEventListener("click", () => {
  if (candle.classList.contains("blown")) return;
  candle.classList.add("blown");
  playBlow();
  createConfetti(70);

  finaleButton.classList.remove("hidden");
  setTimeout(() => finaleButton.style.transform = "translateY(0)", 20);
});

finaleButton.addEventListener("click", () => {
  playChime();
  changeScene(3);
});

celebrateAgain.addEventListener("click", () => {
  stopFireworks();
  giftStage.classList.remove("opened");
  candle.classList.remove("blown");
  finaleButton.classList.add("hidden");
  typeMessage.textContent = "";
  changeScene(0);
});

document.addEventListener("mousemove", (event) => {
  cursorGlow.style.left = event.clientX + "px";
  cursorGlow.style.top = event.clientY + "px";
  cursorGlow.style.opacity = "1";

  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * -10;

  document.querySelectorAll(".glass-card").forEach(card => {
    card.style.transform = `rotateY(${x * 0.25}deg) rotateX(${y * 0.25}deg)`;
  });
});

document.addEventListener("mouseleave", () => {
  cursorGlow.style.opacity = "0";
});

function makeStars() {
  const stars = document.getElementById("stars");
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--duration", (1.4 + Math.random() * 3.4) + "s");
    star.style.opacity = Math.random();
    stars.appendChild(star);
  }
}

function makeBalloons() {
  const container = document.getElementById("balloons");
  const colors = ["#ff4da6", "#8b5cf6", "#ffd166", "#62e6ff", "#ff7b54"];

  for (let i = 0; i < 14; i++) {
    const balloon = document.createElement("span");
    balloon.className = "balloon";
    balloon.style.left = Math.random() * 100 + "%";
    balloon.style.setProperty("--size", (38 + Math.random() * 42) + "px");
    balloon.style.setProperty("--balloon", colors[i % colors.length]);
    balloon.style.setProperty("--speed", (11 + Math.random() * 9) + "s");
    balloon.style.setProperty("--delay", (-Math.random() * 18) + "s");
    balloon.style.setProperty("--drift", (-90 + Math.random() * 180) + "px");
    container.appendChild(balloon);
  }
}

function createConfetti(amount = 100) {
  const colors = ["#ff4da6", "#ffd166", "#8b5cf6", "#62e6ff", "#ffffff", "#ff7b54"];

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty("--fall", (2.8 + Math.random() * 3.2) + "s");
    piece.style.setProperty("--x", (-180 + Math.random() * 360) + "px");
    piece.style.setProperty("--rotate", (360 + Math.random() * 1080) + "deg");
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6500);
  }
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") audioContext.resume();
}

function playTone(frequency, duration, offset = 0, type = "sine", volume = 0.05) {
  if (!soundOn) return;
  ensureAudio();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, audioContext.currentTime + offset);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + offset + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + offset + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + offset);
  oscillator.stop(audioContext.currentTime + offset + duration);
}

function playChime() {
  playTone(523.25, .5, 0, "sine", .06);
  playTone(659.25, .5, .1, "sine", .055);
  playTone(783.99, .7, .22, "triangle", .05);
}

function playBlow() {
  if (!soundOn) return;
  ensureAudio();

  const duration = .7;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = 700;
  gain.gain.value = .12;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
}

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle("active", soundOn);
  soundToggle.querySelector(".sound-label").textContent = soundOn ? "Sound on" : "Sound";
  if (soundOn) {
    ensureAudio();
    playChime();
  }
});

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  fireworksCanvas.width = innerWidth * ratio;
  fireworksCanvas.height = innerHeight * ratio;
  fireworksCanvas.style.width = innerWidth + "px";
  fireworksCanvas.style.height = innerHeight + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function randomColor() {
  const colors = ["#ff4da6", "#ffd166", "#8b5cf6", "#62e6ff", "#ffffff", "#ff7b54"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function addRocket() {
  rockets.push({
    x: innerWidth * (.12 + Math.random() * .76),
    y: innerHeight + 20,
    targetY: innerHeight * (.12 + Math.random() * .42),
    speed: 7 + Math.random() * 4,
    color: randomColor()
  });
}

function explode(x, y, color) {
  const count = 55 + Math.floor(Math.random() * 35);
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * 2 * i / count;
    const speed = 1.5 + Math.random() * 5.2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      gravity: .045,
      color,
      size: 1.5 + Math.random() * 2.7
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.globalCompositeOperation = "lighter";

  rockets.forEach((r, index) => {
    r.y -= r.speed;
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 2.6, 0, Math.PI * 2);
    ctx.fill();

    if (r.y <= r.targetY) {
      explode(r.x, r.y, r.color);
      rockets.splice(index, 1);
      playTone(110 + Math.random() * 80, .35, 0, "triangle", .025);
    }
  });

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= .99;
    p.alpha -= .012;

    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.alpha <= 0) particles.splice(index, 1);
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  if (currentScene === 3 && Math.random() < .055) addRocket();
  animationId = requestAnimationFrame(animateFireworks);
}

function launchFinale() {
  createConfetti(220);
  stopFireworks();
  animateFireworks();

  for (let i = 0; i < 6; i++) {
    setTimeout(addRocket, i * 210);
  }
}

function stopFireworks() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  particles = [];
  rockets = [];
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

makeStars();
makeBalloons();
