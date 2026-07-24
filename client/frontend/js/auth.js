/* NEXORA — auth.js
   Login, signup, logout, and entering the app. */

/* ===================== AUTH ===================== */

function switchAuthTab(tab){
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabSignup').classList.toggle('active', tab==='signup');
  document.getElementById('loginForm').classList.toggle('hidden', tab!=='login');
  document.getElementById('signupForm').classList.toggle('hidden', tab!=='signup');
}

function handleLogin(){
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  const user = users[u];
  if(!user || user.password !== p){
    err.textContent = 'No match for that username and password.';
    return;
  }
  err.textContent = '';
  currentUser = u;
  enterApp();
}

function handleSignup(){
  const u = document.getElementById('suUser').value.trim();
  const p = document.getElementById('suPass').value;
  const bio = document.getElementById('suBio').value.trim();
  const err = document.getElementById('signupError');
  if(!u || !p){ err.textContent = 'Username and password are both required.'; return; }
  if(p.length < 4){ err.textContent = 'Password needs at least 4 characters.'; return; }
  if(users[u]){ err.textContent = 'That username is already taken.'; return; }
  users[u] = { username:u, password:p, bio: bio || 'New to nexora.', publicProfile:false };
  userTitles[u] = [];
  err.textContent = '';
  currentUser = u;
  enterApp();
}

function logout(){
  currentUser = null;
  document.getElementById('view-app').classList.add('hidden');
  document.getElementById('view-landing').classList.remove('hidden');
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('suUser').value='';
  document.getElementById('suPass').value='';
  document.getElementById('suBio').value='';
  switchAuthTab('login');
}

function enterApp(){
  document.getElementById('view-landing').classList.add('hidden');
  document.getElementById('view-app').classList.remove('hidden');
  document.getElementById('whoUser').textContent = currentUser;
  window.scrollTo({top:0, left:0, behavior:'auto'});
  switchView('community');
  renderProfile();
  updateNotifBadge();
}

