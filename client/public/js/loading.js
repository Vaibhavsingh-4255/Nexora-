/* NEXORA — loading.js
   Controls the "Zoro is searching" loading overlay shown while login /
   signup / Google sign-in are working, so the UI never looks frozen. */

const ZORO_LINES = [
  'this may take a while, he took a wrong turn 🧭',
  'he swears he knows exactly where he\'s going',
  'still lost, still trying his best 😅',
  'recalculating... in the completely wrong direction',
  'he found something! ...nope, that\'s just Sanji\'s kitchen',
  'asking a seagull for directions, be right back',
  'almost there (probably) 🗡️',
  'he took a left when it was clearly a right'
];

let _zoroLineTimer = null;
let _zoroShownAt = 0;
const ZORO_MIN_VISIBLE_MS = 1100;

function _setZoroLine(){
  const el = document.getElementById('zoroLine');
  if(!el) return;
  el.style.opacity = 0;
  setTimeout(()=>{
    el.textContent = ZORO_LINES[Math.floor(Math.random() * ZORO_LINES.length)];
    el.style.opacity = 1;
  }, 180);
}

function showLoadingScreen(){
  const overlay = document.getElementById('loadingOverlay');
  if(!overlay) return;
  overlay.classList.remove('hidden');
  _zoroShownAt = Date.now();
  _setZoroLine();
  clearInterval(_zoroLineTimer);
  _zoroLineTimer = setInterval(_setZoroLine, 2400);
}

function hideLoadingScreen(){
  const overlay = document.getElementById('loadingOverlay');
  if(!overlay) return;
  const elapsed = Date.now() - _zoroShownAt;
  const wait = Math.max(0, ZORO_MIN_VISIBLE_MS - elapsed);
  setTimeout(()=>{
    overlay.classList.add('hidden');
    clearInterval(_zoroLineTimer);
  }, wait);
}
