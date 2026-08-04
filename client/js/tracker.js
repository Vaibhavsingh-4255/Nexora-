/* NEXORA — tracker.js
   Watchlist: add/edit titles, episode progress, notes, status filters. */

/* ===================== TRACKER ===================== */
function toggleAddForm(){ document.getElementById('addFormCard').classList.toggle('hidden'); }
function toggleEpField(){
  const isEpisodic = document.getElementById('fFormat').value === 'episodic';
  document.getElementById('fEpWrap').style.display = isEpisodic ? 'block' : 'none';
}

function addTitle(){
  const name = document.getElementById('fTitle').value.trim();
  if(!name){ alert('Give the title a name first.'); return; }
  const format = document.getElementById('fFormat').value;
  const t = mkTitle({
    name,
    type: document.getElementById('fType').value,
    format,
    totalEp: format==='episodic' ? (document.getElementById('fTotalEp').value || 12) : 1,
    currentEp: 0,
    fav: document.getElementById('fFav').value.trim() || '—',
    priority: document.getElementById('fPriority').value,
    status: document.getElementById('fStatus').value,
    notes: ''
  });
  userTitles[currentUser].unshift(t);
  document.getElementById('fTitle').value='';
  document.getElementById('fFav').value='';
  toggleAddForm();
  renderTracker();
}

function setStatusFilter(s){ activeStatusFilter = s; renderTracker(); }

function renderTracker(){
  const pillsEl = document.getElementById('statusPills');
  const statuses = ['All','Watching','Plan to Watch','On Hold','Dropped'];
  pillsEl.innerHTML = statuses.map(s=>
    `<button class="pill ${activeStatusFilter===s?'active':''}" data-action="status-pill" data-arg="${s}" type="button">${s}</button>`
  ).join('');

  const list = userTitles[currentUser].filter(t=>!t.completed);
  const filtered = activeStatusFilter==='All' ? list : list.filter(t=>t.status===activeStatusFilter);
  const el = document.getElementById('trackerList');

  if(filtered.length===0){
    el.innerHTML = `<div class="empty">Nothing here yet. Add a title to start tracking.</div>`;
    return;
  }

  el.innerHTML = filtered.map(t=>{
    const pct = t.format==='episodic' ? Math.min(100, Math.round((t.currentEp/t.totalEp)*100)) : (t.currentEp>=1?100:0);
    const badgeClass = t.status==='Watching'?'watching':t.status==='Plan to Watch'?'plan':t.status==='On Hold'?'hold':'dropped';
    return `
    <div class="title-card" data-type="${t.type}">
      <div class="title-top">
        <div class="title-badges">
          <span class="type-pill">${t.type}</span>
          <span class="status-badge ${badgeClass}">${t.status==='Plan to Watch'?'Plan':t.status}</span>
        </div>
        <select class="status-select" data-action="title-status-change" data-id="${t.id}">
          ${['Watching','Plan to Watch','On Hold','Dropped'].map(s=>`<option ${t.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="ticket-title">${escapeHtml(t.name)}</div>
      <div class="ticket-fav">★ Favorite: <b>${escapeHtml(t.fav)}</b></div>
      <div class="priority-tag">${t.priority} priority</div>

      ${t.format==='episodic' ? `
      <div class="ep-row">
        <div class="ep-track"><div class="ep-fill" style="width:${pct}%;"></div></div>
        <div class="ep-label">EP ${t.currentEp} / ${t.totalEp}</div>
      </div>` : `
      <div class="ep-row">
        <div class="ep-track"><div class="ep-fill" style="width:${pct}%;"></div></div>
        <div class="ep-label">${t.currentEp>=1?'WATCHED':'NOT WATCHED'}</div>
      </div>`}

      <div class="ticket-actions">
        ${t.format==='episodic' ? `<button class="icon-btn" data-action="bump-episode" data-id="${t.id}" type="button">+1 Episode</button>` : `<button class="icon-btn" data-action="mark-watched" data-id="${t.id}" type="button">Mark Watched</button>`}
        <button class="icon-btn" data-action="mark-complete" data-id="${t.id}" type="button">Mark Completed</button>
        <button class="icon-btn" data-action="delete-title" data-id="${t.id}" type="button">Remove</button>
      </div>

      <div class="notes-box">
        <span class="notes-label">Notes <span class="private-flag">(visible on your profile only when it's set to Public)</span></span>
        <textarea placeholder="theories, favorite moments, reminders..." data-action="notes-change" data-id="${t.id}">${escapeHtml(t.notes)}</textarea>
      </div>
    </div>`;
  }).join('');
}

function findTitle(id){ return userTitles[currentUser].find(t=>t.id===id); }
function changeStatus(id, val){ findTitle(id).status = val; renderTracker(); }
function bumpEpisode(id){
  const t = findTitle(id);
  t.currentEp = Math.min(t.totalEp, t.currentEp+1);
  markCompletedIfDone(userTitles[currentUser]);
  renderTracker();
}
function markWatched(id){
  const t = findTitle(id);
  t.currentEp = 1;
  markCompletedIfDone(userTitles[currentUser]);
  renderTracker();
}
function markCompleteManually(id){
  const t = findTitle(id);
  t.currentEp = t.totalEp;
  t.completed = true;
  renderTracker();
}
function deleteTitle(id){
  userTitles[currentUser] = userTitles[currentUser].filter(t=>t.id!==id);
  renderTracker();
}
function updateNotes(id, val){ findTitle(id).notes = val; }

