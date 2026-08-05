const firebaseConfig = {
  apiKey: "AIzaSyA5H8UV8XKBy9Y5iPKg4zl4j5pBpc-812E",
  authDomain: "nexora-d08d9.firebaseapp.com",
  projectId: "nexora-d08d9",
  storageBucket: "nexora-d08d9.firebasestorage.app",
  messagingSenderId: "631916198103",
  appId: "1:631916198103:web:adf3458596a288b706d892"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


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
  showLoadingScreen();
  setTimeout(()=>{
    enterApp();
    hideLoadingScreen();
  }, 1200);
}

function handleSignup(){
  const u = document.getElementById('suUser').value.trim();
  const p = document.getElementById('suPass').value;
  const email = document.getElementById('suEmail').value.trim();
  const name = document.getElementById('suName').value.trim();
  const gender = document.getElementById('suGender').value;
  const birthday = document.getElementById('suBirthday').value;
  const bio = document.getElementById('suBio').value.trim();
  const err = document.getElementById('signupError');
  if(!u || !p){ err.textContent = 'Username and password are both required.'; return; }
  if(p.length < 4){ err.textContent = 'Password needs at least 4 characters.'; return; }
  if(users[u]){ err.textContent = 'That username is already taken.'; return; }
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent = 'Enter a valid email address.'; return; }

  users[u] = {
    username:u, password:p, email: email || '', name: name || u, gender: gender || '', birthday: birthday || '',
    bio: bio || 'New to nexora.', publicProfile:false, followers:[], following:[], followRequests:[]
  };
  userTitles[u] = [];
  err.textContent = '';
  // account created — finish with the quick favorite-genre + badge picker before entering the app
  openOnboarding('signup', { username: u });
}

function logout(){
  currentUser = null;
  document.getElementById('view-app').classList.add('hidden');
  document.getElementById('view-landing').classList.remove('hidden');
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
  document.getElementById('suUser').value='';
  document.getElementById('suPass').value='';
  document.getElementById('suEmail').value='';
  document.getElementById('suName').value='';
  document.getElementById('suGender').value='';
  document.getElementById('suBirthday').value='';
  document.getElementById('suBio').value='';
  switchAuthTab('login');
  applyPageTheme();
}

function enterApp(){
  document.getElementById('view-landing').classList.add('hidden');
  document.getElementById('view-app').classList.remove('hidden');
  document.getElementById('whoUser').textContent = currentUser;
  window.scrollTo({top:0, left:0, behavior:'auto'});
  switchView('community');
  renderProfile();
  updateNotifBadge();
  updateMsgBadge();
}

async function googleSignIn() {

  try {

    const result = await auth.signInWithPopup(provider);

    const firebaseUser = result.user;

    const idToken = await firebaseUser.getIdToken();

    showLoadingScreen();

    // Guard against the backend being unreachable (e.g. not running on
    // localhost:5000) — without this the fetch below can hang forever
    // and the app looks frozen with no feedback at all.
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), 10000);

    const response = await fetch(
      "http://localhost:5000/api/auth/google-login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idToken
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {

      if (!data.user.username) {
        // first-time Google sign-in — collect the rest of the profile before entering the app
        onboardGooglePayload = { uid: data.user.uid, email: data.user.email, photoURL: data.user.photoURL };
        hideLoadingScreen();
        openOnboarding('google', { name: data.user.displayName || '' });
      } else {
        currentUser = data.user.username;
        enterApp();
        hideLoadingScreen();
      }

    } else {

      hideLoadingScreen();
      alert(data.message);

    }

  } catch (err) {
    console.error(err);
    console.error(err.stack);
    hideLoadingScreen();
    const timedOut = err && err.name === 'AbortError';
    alert(timedOut
      ? 'Google sign-in is taking too long — the server may be unreachable. Please try again or use the demo login.'
      : 'Could not sign in with Google right now. Please try again or use the demo login.');
  }
}
document
.getElementById("googleLoginBtn")
.addEventListener("click", googleSignIn);

document
.getElementById("googleSignupBtn")
.addEventListener("click", googleSignIn);