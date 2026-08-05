/* NEXORA — notifications.js
   Notifications: comments on your posts, and follow requests / accepts
   (private accounts require the owner to accept a follow request). */

/* ===================== NOTIFICATIONS ===================== */
function renderNotifications(){
  const list = notifications.filter(n=>n.forUser===currentUser).sort((a,b)=>b.createdAt-a.createdAt);
  const el = document.getElementById('notifList');
  if(list.length===0){
    el.innerHTML = `<div class="empty">No notifications yet — comments and follow requests will show up here.</div>`;
    updateNotifBadge();
    return;
  }
  el.innerHTML = list.map(n=>{
    if(n.type === 'follow_request'){
      const stillPending = hasPendingRequest(n.fromUser, currentUser);
      return `
        <div class="notif-card ${n.read?'':'unread'}">
          <div class="notif-row"><span class="notif-user">u/${escapeHtml(n.fromUser)}</span><span>${timeAgo(n.createdAt)}</span></div>
          <div class="notif-body">requested to follow you</div>
          ${stillPending ? `
            <div class="row" style="gap:8px; margin-top:10px;">
              <button class="btn btn-primary btn-small" data-action="accept-follow-request" data-arg="${n.fromUser}" type="button">Accept</button>
              <button class="btn btn-ghost btn-small" data-action="decline-follow-request" data-arg="${n.fromUser}" type="button">Decline</button>
            </div>
          ` : `<div style="font-size:11.5px; color:var(--paper-faint); margin-top:8px;">Already handled</div>`}
        </div>`;
    }
    if(n.type === 'follow_accepted'){
      return `
        <button class="notif-card ${n.read?'':'unread'}" data-action="view-profile" data-arg="${n.fromUser}" type="button">
          <div class="notif-row"><span class="notif-user">u/${escapeHtml(n.fromUser)}</span><span>${timeAgo(n.createdAt)}</span></div>
          <div class="notif-body">accepted your follow request</div>
        </button>`;
    }
    return `
      <button class="notif-card ${n.read?'':'unread'}" data-action="open-notification" data-id="${n.id}" type="button">
        <div class="notif-row"><span class="notif-user">u/${escapeHtml(n.fromUser)}</span><span>${timeAgo(n.createdAt)}</span></div>
        <div class="notif-body">commented on your post about <b>${escapeHtml(n.postTitle)}</b></div>
        <div class="notif-snippet">"${escapeHtml(n.snippet)}"</div>
      </button>`;
  }).join('');
  list.forEach(n=>n.read=true);
  updateNotifBadge();
}
function openNotification(id){
  const n = notifications.find(n=>n.id===id);
  if(!n) return;
  n.read = true;
  updateNotifBadge();
  switchView('community');
  setCategory(n.category);
  goToPostComments(n.postId);
}
function markAllRead(){
  notifications.forEach(n=>{ if(n.forUser===currentUser) n.read=true; });
  updateNotifBadge();
  renderNotifications();
}
function openMyPost(id){
  const p = posts.find(p=>p.id===id);
  if(!p) return;
  switchView('community');
  setCategory(p.category);
  goToPostComments(id);
}
function goToPostComments(postId){
  setTimeout(()=>{
    const block = document.getElementById('comments-'+postId);
    if(block){ block.classList.add('open'); block.scrollIntoView({behavior:'smooth', block:'center'}); }
  }, 60);
}
