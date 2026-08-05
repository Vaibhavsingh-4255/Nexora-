/* NEXORA — onboarding.js
   Post-signup "complete your profile" flow: account details (Google
   first-time sign-in only), favorite genre, and a badge pick. Also
   powers the profile edit modal, so the same fields stay editable later. */

const BADGES = [
  { id:'ceo-era',            label:'CEO Era',               icon:'👑', color:'#e8c76b' },
  { id:'green-flag',         label:'Green Flag',            icon:'🟩', color:'#4CAF7D' },
  { id:'red-flag',           label:'Red Flag',              icon:'🚩', color:'#E5484D' },
  { id:'second-lead',        label:'Second Lead Syndrome',  icon:'💔', color:'#E0607A' },
  { id:'binge-master',       label:'Binge Master',          icon:'📺', color:'#4EA1E0' },
  { id:'ost-lover',          label:'OST Lover',             icon:'🎵', color:'#9B7BE0' },
  { id:'drama-addict',       label:'Drama Addict',          icon:'🎬', color:'#E0975A' },
  { id:'palace-expert',      label:'Palace Expert',         icon:'🏯', color:'#D9A441' },
  { id:'wuxia-warrior',      label:'Wuxia Warrior',         icon:'⚔️', color:'#8FA3B0' },
  { id:'emotional-survivor', label:'Emotional Survivor',    icon:'💧', color:'#40CECE' },
  { id:'happy-ending',       label:'Happy Ending Believer', icon:'❤️', color:'#E8536B' },
  { id:'plot-twist',         label:'Plot Twist Expert',     icon:'🎭', color:'#7B6BE0' },
];

let onboardMode = null;          // 'google' | 'signup'
let onboardData = {};            // fields collected across steps
let onboardGooglePayload = null; // { uid, email, photoURL } — set by auth.js before opening 'google' mode

let editProfileGenre = null;
let editProfileBadge = null;

/* ===================== SHARED PICKERS ===================== */
function renderGenrePicker(containerId, active, action){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = GENRES.map(g =>
    `<button class="genre-pick-chip ${active===g?'active':''}" data-action="${action}" data-arg="${g}" type="button">${escapeHtml(g)}</button>`
  ).join('');
}

function renderBadgePicker(containerId, activeId, action){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = BADGES.map(b => `
    <button class="badge-card ${activeId===b.id?'selected':''}" data-action="${action}" data-arg="${b.id}" type="button" style="--badge-color:${b.color};">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-label">${escapeHtml(b.label)}</span>
    </button>
  `).join('');
}

function badgeById(id){ return BADGES.find(b => b.id === id) || null; }

/* ===================== ONBOARDING FLOW ===================== */
function openOnboarding(mode, prefill){
  onboardMode = mode;
  onboardData = Object.assign({ genre:null, badge:null }, prefill || {});

  document.getElementById('onboardAccountError').textContent = '';
  document.getElementById('onboardOverlay').classList.remove('hidden');

  const accountStep = document.getElementById('onboardStepAccount');
  const genreStep = document.getElementById('onboardStepGenre');
  const badgeStep = document.getElementById('onboardStepBadge');

  if(mode === 'google'){
    accountStep.classList.remove('hidden');
    genreStep.classList.add('hidden');
    badgeStep.classList.add('hidden');
    document.getElementById('obUsername').value = '';
    document.getElementById('obPassword').value = '';
    document.getElementById('obName').value = onboardData.name || '';
    document.getElementById('obGender').value = '';
    document.getElementById('obBirthday').value = '';
  } else {
    accountStep.classList.add('hidden');
    genreStep.classList.remove('hidden');
    badgeStep.classList.add('hidden');
  }

  renderGenrePicker('onboardGenreRow', onboardData.genre, 'onboard-pick-genre');
  renderBadgePicker('onboardBadgeGrid', onboardData.badge, 'onboard-pick-badge');
  renderOnboardDots();
}

function renderOnboardDots(){
  const totalSteps = onboardMode === 'google' ? 3 : 2;
  let current;
  if(onboardMode === 'google'){
    current = !document.getElementById('onboardStepAccount').classList.contains('hidden') ? 1
      : !document.getElementById('onboardStepGenre').classList.contains('hidden') ? 2 : 3;
  } else {
    current = !document.getElementById('onboardStepGenre').classList.contains('hidden') ? 1 : 2;
  }
  document.getElementById('onboardDots').innerHTML =
    Array.from({ length: totalSteps }).map((_, i) => `<span class="onboard-dot ${i < current ? 'active' : ''}"></span>`).join('');
}

function onboardPickGenre(g){
  onboardData.genre = g;
  renderGenrePicker('onboardGenreRow', onboardData.genre, 'onboard-pick-genre');
}
function onboardPickBadge(id){
  onboardData.badge = id;
  renderBadgePicker('onboardBadgeGrid', onboardData.badge, 'onboard-pick-badge');
}

function onboardNextAccount(){
  const err = document.getElementById('onboardAccountError');
  const username = document.getElementById('obUsername').value.trim();
  const password = document.getElementById('obPassword').value.trim();
  const name = document.getElementById('obName').value.trim();
  const gender = document.getElementById('obGender').value;
  const birthday = document.getElementById('obBirthday').value;

  if(!username){ err.textContent = 'Pick a username to continue.'; return; }
  if(users[username]){ err.textContent = 'That username is already taken.'; return; }
  if(!/^\d{8}$/.test(password)){ err.textContent = 'Password must be exactly 8 digits.'; return; }
  if(!name){ err.textContent = 'Let us know your name.'; return; }
  if(!birthday){ err.textContent = 'Add your birthday to continue.'; return; }

  err.textContent = '';
  Object.assign(onboardData, { username, password, name, gender, birthday });

  document.getElementById('onboardStepAccount').classList.add('hidden');
  document.getElementById('onboardStepGenre').classList.remove('hidden');
  renderOnboardDots();
}

function onboardNextGenre(){
  if(!onboardData.genre) onboardData.genre = GENRES[0];
  document.getElementById('onboardStepGenre').classList.add('hidden');
  document.getElementById('onboardStepBadge').classList.remove('hidden');
  renderOnboardDots();
}

function onboardFinish(){
  if(!onboardData.badge) onboardData.badge = BADGES[0].id;

  if(onboardMode === 'google'){
    const u = onboardData.username;
    users[u] = {
      username: u,
      password: onboardData.password,
      email: onboardGooglePayload ? (onboardGooglePayload.email || '') : '',
      name: onboardData.name,
      gender: onboardData.gender,
      birthday: onboardData.birthday,
      favoriteGenre: onboardData.genre,
      badge: onboardData.badge,
      bio: 'New to nexora.',
      publicProfile: false,
      followers: [], following: [], followRequests: [],
      photoURL: onboardGooglePayload ? (onboardGooglePayload.photoURL || '') : ''
    };
    userTitles[u] = [];
    currentUser = u;

    // best-effort — never blocks entering the app if the backend isn't reachable
    if(onboardGooglePayload && onboardGooglePayload.uid){
      fetch('http://localhost:5000/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: onboardGooglePayload.uid, ...onboardData })
      }).catch(() => {});
    }
  } else {
    // manual signup: base account already exists (handleLogin created it) — layer on the vibe
    const u = onboardData.username;
    if(users[u]){
      users[u].favoriteGenre = onboardData.genre;
      users[u].badge = onboardData.badge;
    }
    currentUser = u;
  }

  document.getElementById('onboardOverlay').classList.add('hidden');
  showLoadingScreen();
  setTimeout(() => { enterApp(); hideLoadingScreen(); }, 1200);
}

/* ===================== EDIT PROFILE ===================== */
function openEditProfile(){
  let u = users[currentUser];
  if(!u){
    u = { username: currentUser, bio:'', publicProfile:false, followers:[], following:[], followRequests:[] };
    users[currentUser] = u;
    userTitles[currentUser] = userTitles[currentUser] || [];
  }
  document.getElementById('epName').value = u.name || '';
  document.getElementById('epGender').value = u.gender || '';
  document.getElementById('epBirthday').value = u.birthday || '';
  document.getElementById('epBio').value = u.bio || '';
  editProfileGenre = u.favoriteGenre || null;
  editProfileBadge = u.badge || null;
  renderGenrePicker('epGenreRow', editProfileGenre, 'edit-pick-genre');
  renderBadgePicker('epBadgeGrid', editProfileBadge, 'edit-pick-badge');
  document.getElementById('editProfileError').textContent = '';
  document.getElementById('editProfileOverlay').classList.remove('hidden');
}

function editPickGenre(g){
  editProfileGenre = g;
  renderGenrePicker('epGenreRow', editProfileGenre, 'edit-pick-genre');
}
function editPickBadge(id){
  editProfileBadge = id;
  renderBadgePicker('epBadgeGrid', editProfileBadge, 'edit-pick-badge');
}

function closeEditProfile(){
  document.getElementById('editProfileOverlay').classList.add('hidden');
}

function saveEditProfile(){
  const u = users[currentUser];
  const name = document.getElementById('epName').value.trim();
  if(!name){ document.getElementById('editProfileError').textContent = 'Name can\'t be empty.'; return; }

  u.name = name;
  u.gender = document.getElementById('epGender').value;
  u.birthday = document.getElementById('epBirthday').value;
  u.bio = document.getElementById('epBio').value.trim();
  u.favoriteGenre = editProfileGenre;
  u.badge = editProfileBadge;

  closeEditProfile();
  renderProfile();
}

window.BADGES = BADGES;
window.badgeById = badgeById;
window.renderGenrePicker = renderGenrePicker;
window.renderBadgePicker = renderBadgePicker;
window.openOnboarding = openOnboarding;
window.onboardPickGenre = onboardPickGenre;
window.onboardPickBadge = onboardPickBadge;
window.onboardNextAccount = onboardNextAccount;
window.onboardNextGenre = onboardNextGenre;
window.onboardFinish = onboardFinish;
window.openEditProfile = openEditProfile;
window.editPickGenre = editPickGenre;
window.editPickBadge = editPickBadge;
window.closeEditProfile = closeEditProfile;
window.saveEditProfile = saveEditProfile;
