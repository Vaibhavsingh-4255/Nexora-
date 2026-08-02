/* NEXORA — theme.js
   Dark/light theme toggle. */

/* ===================== THEME ===================== */
function toggleTheme(){
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  ['themeDotLanding','themeDotApp'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = isLight ? '☀️' : '🌙';
  });
}

