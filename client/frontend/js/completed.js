/* NEXORA — completed.js
   Completed list, stats, and star ratings. */

/* ===================== COMPLETED ===================== */
function renderCompleted(){
  const list = userTitles[currentUser].filter(t=>t.completed);
  document.getElementById('statTitles').textContent = list.length;
  const totalEpisodes = list.reduce((sum,t)=> sum + (t.format==='episodic' ? t.totalEp : 1), 0);
  document.getElementById('statEpisodes').textContent = totalEpisodes;
  const rated = list.filter(t=>t.rating!=null);
  const avg = rated.length ? (rated.reduce((s,t)=>s+t.rating,0)/rated.length).toFixed(1) : '–';
  document.getElementById('statAvgRating').textContent = avg;
  const el = document.getElementById('completedList');
  if(list.length===0){ el.innerHTML = `<div class="empty">No completed titles yet ? ... finish something and mark it done.</div>`; return; }

  el.innerHTML = list.map(t=>`
    <div class="title-card" data-type="${t.type}">
      <div class="title-top">
        <div class="title-badges">
          <span class="type-pill">${t.type}</span>
          <span class="status-badge watching">Done</span>
        </div>
      </div>
      <div class="ticket-title">${escapeHtml(t.name)}</div>
      <div class="ticket-fav">★ Favorite: <b>${escapeHtml(t.fav)}</b></div>
      <div class="notes-label" style="margin-top:14px;">Your rating</div>
      <div class="stars">
        ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="star ${t.rating>=n?'on':''}" data-action="rate-title" data-id="${t.id}" data-arg="${n}" type="button">★</button>`).join('')}
      </div>
    </div>
  `).join('');
}
function rateTitle(id,n){ findTitle(id).rating = n; renderCompleted(); }

