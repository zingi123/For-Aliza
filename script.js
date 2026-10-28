/* ==========================================================
   For Aliza: behavior
   1. Cat GIFs, each with a caption and a cat sound
   2. Song with a message that fades in
   ========================================================== */

/* ---------- Your content (edit these) ---------- */

const CATS = Array.from({ length: 10 }, (_, i) =>
  `assets/cats/cat-${String(i + 1).padStart(2, "0")}.webp`
);

const CAPTIONS = [
  "Hehe, smile a little, kiddo 😂🐱",
  "No more sad face, okay? 😄",
  "Sending you a big friend hug 🫂",
  "Smileee, you awesome human 😭🐱",
  "Here’s a cat to make your day better 🐱✨",
  "Don’t be sad, silly 😂",
  "Meowww, sending you some happiness 🐈🌈",
  "You deserve a little happiness today 🌟",
  "Try a tiny smile? Just a small one 😊",
  "Mission: make you smile successfully 😂🐱✅",
];

const MESSAGE = [
  "Hey, Aliza, why are you putting so much pressure on yourself? It’s okay to cry, but you’ve cried enough for today, kiddo. 🫂",
  "Even if you didn’t get the result you expected, you still worked hard, and you did well. Please don’t blame yourself for it.",
  "Remember, small progress is still progress. Give yourself time to heal. You don’t have to be okay overnight, and you don’t have to be perfect to be enough.",
  "Your life can get better, one step at a time. Don’t let challenges stop you from growing; let them teach you how strong you can be. No matter what situation you face, I hope you can find a little reason to smile, even on your hardest days. 😊",
  "And one more thing: sometimes, the bad things we go through lead us to good things we never expected.",
  "So, please be kind to yourself, okay? You’ve tried your best, and that’s something to be proud of. Take a deep breath, wipe your tears, and keep going at your own pace. You don’t have to be strong every second. It’s okay to rest, too. 🌟💪",
];

// Slow-motion reveal: the whole message is spread over this many seconds,
// one line at a time (bigger = slower)
const MESSAGE_SECONDS = 70;

// Extra pause (seconds) after the last line before "THE END" appears
const ENDING_DELAY = 3;

// Volume of the song in the message part (0 to 1)
const SONG_VOLUME = 0.75;

// Volume of the funny background music (0 to 1)
const FUNNY_VOLUME = 0.12;

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);

const song  = $("song");
const funny = $("funny");

let audioCtx = null;
let muted = false;
let current = 0;

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("on"));
  $(`screen-${name}`).classList.add("on");
  window.scrollTo(0, 0);
}

/* ---------- Cat sounds (made in the browser) ---------- */

// A "meow": a rising and falling tone through a moving filter
function meow(t, startHz, endHz, duration, volume) {
  const osc    = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain   = audioCtx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.linearRampToValueAtTime(((startHz + endHz) / 2) * 1.15, t + duration * 0.4);
  osc.frequency.linearRampToValueAtTime(endHz, t + duration);

  filter.type = "bandpass";
  filter.Q.value = 2.2;
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.linearRampToValueAtTime(2100, t + duration * 0.5);
  filter.frequency.linearRampToValueAtTime(1100, t + duration);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.05);
  gain.gain.linearRampToValueAtTime(0.0001, t + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// A purr: a low tone that pulses about 24 times a second
function purr(t) {
  const osc     = audioCtx.createOscillator();
  const pulse   = audioCtx.createOscillator();
  const pulseAmt = audioCtx.createGain();
  const gain    = audioCtx.createGain();

  osc.type = "sawtooth";
  osc.frequency.value = 75;
  pulse.frequency.value = 24;
  pulseAmt.gain.value = 0.5;
  gain.gain.value = 0.5;

  pulse.connect(pulseAmt);
  pulseAmt.connect(gain.gain);
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(t);
  pulse.start(t);
  osc.stop(t + 1.6);
  pulse.stop(t + 1.6);
}

// A bubble "bloop"
function bloop(t, hz) {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(hz, t);
  osc.frequency.exponentialRampToValueAtTime(hz * 2.4, t + 0.12);

  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

// One sound per cat (index matches the GIF order)
function playCatSound(index) {
  if (muted || !audioCtx) return;
  const t = audioCtx.currentTime + 0.02;

  switch (index) {
    case 0: meow(t, 620, 880, 0.45, 1.6); break;                              // soft mew
    case 1: meow(t, 520, 780, 0.85, 1.6); break;                              // meow
    case 2: meow(t, 380, 520, 0.18, 1.6); meow(t + 0.22, 400, 560, 0.22, 1.6); break; // mrrp
    case 3: purr(t); break;                                                   // purr
    case 4: bloop(t, 300); bloop(t + 0.2, 380); bloop(t + 0.4, 340); break;   // bloop bloop
    case 5: meow(t, 900, 1250, 0.3, 1.4); break;                              // tiny mew
    case 6: meow(t, 480, 900, 1.0, 1.7); break;                               // long meow
    case 7: meow(t, 420, 700, 0.55, 1.6); break;                              // mrow
    case 8: meow(t, 1000, 1400, 0.3, 1.3); meow(t + 0.38, 1050, 1450, 0.3, 1.3); break; // baby mews
    case 9: meow(t, 600, 1000, 1.0, 2); break;                                // big MEOW
  }
}

/* ---------- Part 1: cats ---------- */

function showCat() {
  const frame = $("frame");

  $("cat").src = CATS[current];
  $("caption").textContent = CAPTIONS[current];
  $("count").textContent = `${current + 1} of ${CATS.length}`;
  $("next").textContent = current === CATS.length - 1 ? "I’m smiling 😊" : "Next 😊";

  // Replay the little pop animation
  frame.classList.remove("pop");
  void frame.offsetWidth;
  frame.classList.add("pop");

  playCatSound(current);
}

$("start").onclick = () => {
  // Browsers only allow sound after a tap, so audio starts here
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.resume) audioCtx.resume();

  $("mute").hidden = false;
  showScreen("cats");
  showCat();

  funny.volume = FUNNY_VOLUME;
  funny.play().catch(() => {});
};

$("next").onclick = () => {
  if (current < CATS.length - 1) {
    current++;
    showCat();
  } else {
    funny.pause();
    openMessage();
  }
};

/* ---------- Part 2: song and message ---------- */

const message = $("message");
const ending  = $("ending");

// Split each paragraph into lines (sentences) so they can appear one by one
const LINES = [];   // { text, group }
MESSAGE.forEach((text, group) => {
  text.split(/(?<=[.!?])\s+(?=[A-Z“"])/).forEach((line) => {
    LINES.push({ text: line, group });
  });
});

// Each line becomes its own paragraph (hidden at first)
const lineEls = LINES.map((l, i) => {
  const p = document.createElement("p");
  p.textContent = l.text;
  if (i > 0 && l.group !== LINES[i - 1].group) p.classList.add("gap");
  message.appendChild(p);
  return p;
});

// When each line appears (seconds): longer lines get more time,
// all spread across MESSAGE_SECONDS
const rawTimes = [];
let acc = 1;
LINES.forEach((l) => {
  rawTimes.push(acc);
  acc += 2 + l.text.length * 0.05;
});
const LINE_TIMES = rawTimes.map((t) => (t / acc) * MESSAGE_SECONDS);

let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

// Runs on its own clock, so the text shows even if the song is blocked
function runMessage() {
  clearTimers();
  lineEls.forEach((p) => p.classList.remove("visible"));
  ending.classList.remove("visible");
  window.scrollTo(0, 0);

  lineEls.forEach((p, i) => {
    timers.push(setTimeout(() => {
      p.classList.add("visible");
      p.scrollIntoView({ behavior: "smooth", block: "center" });
    }, LINE_TIMES[i] * 1000));
  });

  timers.push(setTimeout(() => {
    ending.classList.add("visible");
    ending.scrollIntoView({ behavior: "smooth", block: "end" });
  }, (MESSAGE_SECONDS + ENDING_DELAY) * 1000));
}

function playSong() {
  song.volume = SONG_VOLUME;
  song.muted = muted;
  song.currentTime = 0;
  const tryPlay = song.play();
  if (tryPlay && tryPlay.catch) tryPlay.catch(() => {});
}

function openMessage() {
  showScreen("message");
  runMessage();
  playSong();
}

$("again").onclick = () => {
  runMessage();
  playSong();
};

/* ---------- Mute button ---------- */

$("mute").onclick = () => {
  muted = !muted;
  song.muted = muted;
  funny.muted = muted;
  $("mute").textContent = muted ? "🔇 Sound off" : "🔊 Sound on";
};
