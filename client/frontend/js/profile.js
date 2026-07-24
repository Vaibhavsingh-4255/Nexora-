/* NEXORA — profile.js
   Profile view: visibility toggle, your posts, watchlist/completed summary. */

function toggleVisibility(){
  const u = users[currentUser];
  u.publicProfile = !u.publicProfile;
  renderProfile();
}
function renderProfile(){
  const u = users[currentUser];
  document.getElementById('profileInitial').textContent = currentUser[0].toUpperCase();
  document.getElementById('profileName').textContent = currentUser;
  document.getElementById('profileBio').textContent = u.bio;
  document.getElementById('visLabel').textContent = u.publicProfile ? 'Public' : 'Private';
  document.getElementById('visSwitch').classList.toggle('on', u.publicProfile);

  const titles = userTitles[currentUser];
  const body = document.getElementById('profileBody');

  const mine = posts.filter(p=>p.author===currentUser).sort((a,b)=>b.createdAt-a.createdAt);
  const myPostsHtml = `
    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin-bottom:8px;">Your posts (${mine.length})</div>
    ${mine.length ? mine.map(p=>`
      <button class="my-post-card" data-action="open-my-post" data-id="${p.id}" type="button">
        <div class="my-post-head"><span class="post-title-tag">${escapeHtml(p.title)}</span><span class="my-post-cat">${escapeHtml(p.category)}</span></div>
        <div class="my-post-snip">${escapeHtml(p.body.length>90 ? p.body.slice(0,90)+'…' : p.body)}</div>
        <div class="my-post-meta">▲ ${p.votes} · ${p.comments.length} comment${p.comments.length===1?'':'s'} · ${timeAgo(p.createdAt)}</div>
      </button>
    `).join('') : '<div style="font-size:12px; color:var(--paper-faint);">You haven’t posted anything yet.</div>'}
  `;

  console.log("Reached here");

if (!u.publicProfile) {
    console.log("Private profile");
    body.innerHTML = myPostsHtml + `
    <div class="private-banner" style="margin-top:14px;">
        <div class="lock">🔒</div>
        Your profile is private.
    </div>`;
    return;
}
  const completed = titles.filter(t=>t.completed);
  const watching = titles.filter(t=>!t.completed);
  const favs = [...new Set(titles.filter(t=>t.fav && t.fav!=='—').map(t=>t.fav))];

  const noteLine = t => t.notes ? `<div style="font-size:11.5px; color:var(--paper-faint); margin-top:2px; font-style:italic;">“${escapeHtml(t.notes)}”</div>` : '';

  body.innerHTML = myPostsHtml + `
    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:24px 0 8px; padding-top:20px; border-top:1px dashed var(--line);">Favorite characters</div>
    <div class="fav-grid">${favs.length ? favs.map(f=>`<span class="fav-chip">${escapeHtml(f)}</span>`).join('') : '<span style="color:var(--paper-faint); font-size:12px;">None yet</span>'}</div>

    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:22px 0 8px;">Watchlist (${watching.length})</div>
    ${watching.length ? watching.map(t=>`<div style="font-size:13px; padding:8px 0; border-bottom:1px solid var(--line);">${escapeHtml(t.name)} <span style="color:var(--paper-faint);">· ${t.status}</span>${noteLine(t)}</div>`).join('') : '<div style="font-size:12px; color:var(--paper-faint);">Nothing in progress.</div>'}

    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:22px 0 8px;">Completed (${completed.length})</div>
    ${completed.length ? completed.map(t=>`<div style="font-size:13px; padding:8px 0; border-bottom:1px solid var(--line);">${escapeHtml(t.name)} ${t.rating?`<span style="color:var(--gold);">· ${t.rating}/10</span>`:''}${noteLine(t)}</div>`).join('') : '<div style="font-size:12px; color:var(--paper-faint);">Nothing completed yet.</div>'}
  `;
}

