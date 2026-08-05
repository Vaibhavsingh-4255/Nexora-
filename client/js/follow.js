/* NEXORA — follow.js
   Followers/following, viewing other users' profiles, and privacy gating
   (private accounts are visible to their followers only; posts can still
   be individually public or followers-only regardless of account privacy). */

let viewedProfileUser = null;
let cameFromView = 'community';
let followListUser = null;
let followListType = 'followers';
let cameFromFollowList = 'profile';

function isFollowing(viewer, target){
  const t = users[target];
  return !!(t && t.followers && t.followers.includes(viewer));
}
function hasPendingRequest(viewer, target){
  const t = users[target];
  return !!(t && t.followRequests && t.followRequests.includes(viewer));
}

function viewProfile(username){
  if(username === currentUser){ switchView('profile'); return; }
  if(!users[username]) return;
  viewedProfileUser = username;
  cameFromView = currentView();
  switchView('user-profile');
}
function backFromUserProfile(){ switchView(cameFromView); }

function toggleFollow(){
  const target = users[viewedProfileUser];
  if(!target) return;
  const me = users[currentUser];
  target.followRequests = target.followRequests || [];

  const alreadyFollowing = target.followers.includes(currentUser);
  const pending = target.followRequests.includes(currentUser);

  if(alreadyFollowing){
    // unfollow
    target.followers = target.followers.filter(u=>u!==currentUser);
    me.following = me.following.filter(u=>u!==viewedProfileUser);
  } else if(pending){
    // withdraw the pending request
    target.followRequests = target.followRequests.filter(u=>u!==currentUser);
  } else if(target.publicProfile){
    // public account — follow right away
    target.followers.push(currentUser);
    me.following.push(viewedProfileUser);
  } else {
    // private account — send a follow request for them to accept
    target.followRequests.push(currentUser);
    pushFollowRequestNotification(viewedProfileUser, currentUser);
    updateNotifBadge();
  }
  renderUserProfile();
}

function acceptFollowRequest(fromUser){
  const me = users[currentUser];
  const requester = users[fromUser];
  if(!me || !requester) return;
  me.followRequests = (me.followRequests||[]).filter(u=>u!==fromUser);
  if(!me.followers.includes(fromUser)) me.followers.push(fromUser);
  if(!requester.following.includes(currentUser)) requester.following.push(currentUser);
  pushFollowAcceptedNotification(fromUser, currentUser);
  renderNotifications();
  renderFollowStatsRow('followStatsRow', currentUser, true);
}
function declineFollowRequest(fromUser){
  const me = users[currentUser];
  if(!me) return;
  me.followRequests = (me.followRequests||[]).filter(u=>u!==fromUser);
  renderNotifications();
}

function renderFollowStatsRow(elId, username, onOwnProfile){
  const u = users[username];
  const el = document.getElementById(elId);
  el.innerHTML = `
    <button class="follow-stat" data-action="open-follow-list" data-arg="followers" data-username="${username}" type="button">
      <span class="follow-stat-num">${u.followers.length}</span><span class="follow-stat-label">Followers</span>
    </button>
    <button class="follow-stat" data-action="open-follow-list" data-arg="following" data-username="${username}" type="button">
      <span class="follow-stat-num">${u.following.length}</span><span class="follow-stat-label">Following</span>
    </button>
  `;
}

function renderUserProfile(){
  const username = viewedProfileUser;
  const u = users[username];
  if(!u) return;
  document.getElementById('uProfileInitial').textContent = username[0].toUpperCase();
  document.getElementById('uProfileName').textContent = username;
  document.getElementById('uProfileBio').textContent = u.bio;
  renderFollowStatsRow('uFollowStatsRow', username, false);

  const following = isFollowing(currentUser, username);
  const pending = hasPendingRequest(currentUser, username);
  const followBtn = document.getElementById('followActionBtn');
  followBtn.textContent = following ? 'Following ✓' : pending ? 'Requested' : 'Follow';
  followBtn.classList.toggle('btn-ghost', following || pending);
  followBtn.classList.toggle('btn-primary', !following && !pending);

  const body = document.getElementById('uProfileBody');
  const canSeeFullProfile = u.publicProfile || following;

  if(!canSeeFullProfile){
    body.innerHTML = `<div class="private-banner" style="margin-top:14px;"><div class="lock">🔒</div>This account is private. Follow ${escapeHtml(username)} to see their watchlist, ratings, and notes.</div>`;
    return;
  }

  const titles = userTitles[username] || [];
  const completed = titles.filter(t=>t.completed);
  const watching = titles.filter(t=>!t.completed);
  const favs = [...new Set(titles.filter(t=>t.fav && t.fav!=='—').map(t=>t.fav))];
  const theirPosts = posts.filter(p=>p.author===username && canSeePost(p)).sort((a,b)=>b.createdAt-a.createdAt);

  body.innerHTML = `
    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:18px 0 8px;">Posts (${theirPosts.length})</div>
    ${theirPosts.length ? theirPosts.slice(0,8).map(p=>`
      <div class="my-post-card" style="cursor:default;">
        <div class="my-post-head"><span class="post-title-tag">${escapeHtml(p.title)}</span><span class="my-post-cat">${escapeHtml(p.category)}</span></div>
        <div class="my-post-snip">${escapeHtml(p.body.length>90 ? p.body.slice(0,90)+'…' : p.body)}</div>
      </div>
    `).join('') : '<div style="font-size:12px; color:var(--paper-faint);">No posts yet.</div>'}

    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:22px 0 8px; padding-top:18px; border-top:1px dashed var(--line);">Favorite characters</div>
    <div class="fav-grid">${favs.length ? favs.map(f=>`<span class="fav-chip">${escapeHtml(f)}</span>`).join('') : '<span style="color:var(--paper-faint); font-size:12px;">None yet</span>'}</div>

    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:22px 0 8px;">Watchlist (${watching.length})</div>
    ${watching.length ? watching.map(t=>`<div style="font-size:13px; padding:8px 0; border-bottom:1px solid var(--line);">${escapeHtml(t.name)} <span style="color:var(--paper-faint);">· ${t.status}</span></div>`).join('') : '<div style="font-size:12px; color:var(--paper-faint);">Nothing in progress.</div>'}

    <div style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--paper-faint); margin:22px 0 8px;">Completed (${completed.length})</div>
    ${completed.length ? completed.map(t=>`<div style="font-size:13px; padding:8px 0; border-bottom:1px solid var(--line);">${escapeHtml(t.name)} ${t.rating?`<span style="color:var(--gold);">· ${t.rating}/10</span>`:''}</div>`).join('') : '<div style="font-size:12px; color:var(--paper-faint);">Nothing completed yet.</div>'}
  `;
}

function openFollowList(type, username){
  followListType = type;
  followListUser = username;
  cameFromFollowList = currentView();
  switchView('followlist');
}
function backFromFollowList(){ switchView(cameFromFollowList); }

function renderFollowList(){
  const u = users[followListUser];
  if(!u) return;
  document.getElementById('followListTitle').textContent = `${followListType==='followers'?'Followers':'Following'} · ${followListUser}`;
  const names = followListType==='followers' ? u.followers : u.following;
  const el = document.getElementById('followListBody');
  if(names.length===0){
    el.innerHTML = `<div class="empty">No one here yet.</div>`;
    return;
  }
  el.innerHTML = names.map(name=>{
    const person = users[name];
    if(!person) return '';
    return `
    <button class="my-post-card" data-action="view-profile" data-arg="${name}" type="button">
      <div class="row" style="gap:10px;">
        <div class="avatar-ring" style="width:38px;height:38px;"><div class="avatar-inner" style="font-size:15px;">${name[0].toUpperCase()}</div></div>
        <div>
          <div style="font-weight:700; font-size:13.5px;">${escapeHtml(name)}</div>
          <div style="font-size:11.5px; color:var(--paper-faint);">${escapeHtml(person.bio.length>50?person.bio.slice(0,50)+'…':person.bio)}</div>
        </div>
      </div>
    </button>`;
  }).join('');
}
