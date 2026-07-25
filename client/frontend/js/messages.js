/* NEXORA — messages.js
   Direct messages and groups. Anyone can message anyone; groups are built
   from your followers/following. Conversations live in memory for the
   session, same as everything else in this app. */

let activeConversationId = null;
let creatingGroup = false;
let groupSelection = [];

function myConversations(){
  return conversations.filter(c => c.participants.includes(currentUser))
    .sort((a,b) => lastMessageTime(b) - lastMessageTime(a));
}
function lastMessageTime(c){
  return c.messages.length ? c.messages[c.messages.length-1].createdAt : 0;
}
function conversationTitle(c){
  if(c.type === 'group') return c.name;
  const other = c.participants.find(p=>p!==currentUser);
  return other || 'Unknown';
}
function unreadCountFor(c, username){
  return (c.unread && c.unread[username]) || 0;
}
function updateMsgBadge(){
  if(!currentUser) return;
  const total = myConversations().reduce((sum,c)=> sum + unreadCountFor(c, currentUser), 0);
  const badge = document.getElementById('msgBadgeNav');
  if(badge){
    badge.textContent = total > 9 ? '9+' : String(total);
    badge.classList.toggle('hidden', total===0);
  }
}

function findOrCreateDM(otherUser){
  let convo = conversations.find(c => c.type==='dm' && c.participants.includes(currentUser) && c.participants.includes(otherUser));
  if(!convo){
    convo = { id:nextId(), type:'dm', participants:[currentUser, otherUser], messages:[], unread:{} };
    conversations.push(convo);
  }
  return convo;
}
function messageUser(){
  if(!viewedProfileUser) return;
  const convo = findOrCreateDM(viewedProfileUser);
  openConversation(convo.id);
}

function openConversation(id){
  activeConversationId = id;
  const convo = conversations.find(c=>c.id===id);
  if(convo){ convo.unread = convo.unread || {}; convo.unread[currentUser] = 0; }
  switchView('messages');
}
function backToConversationList(){
  activeConversationId = null;
  creatingGroup = false;
  renderMessages();
}

function sendMessage(){
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if(!text || !activeConversationId) return;
  const convo = conversations.find(c=>c.id===activeConversationId);
  convo.messages.push({ id:nextId(), author: currentUser, text, createdAt: Date.now() });
  convo.unread = convo.unread || {};
  convo.participants.forEach(p=>{ if(p!==currentUser) convo.unread[p] = (convo.unread[p]||0) + 1; });
  input.value = '';
  renderMessages();
}

function startNewGroup(){
  creatingGroup = true;
  groupSelection = [];
  renderMessages();
}
function cancelNewGroup(){
  creatingGroup = false;
  renderMessages();
}
function toggleGroupMember(username){
  const i = groupSelection.indexOf(username);
  if(i===-1) groupSelection.push(username); else groupSelection.splice(i,1);
  const btn = document.querySelector(`#messagesBody .genre-chip[data-arg="${username}"]`);
  if(btn) btn.classList.toggle('active', groupSelection.includes(username));
}
function createGroup(){
  const nameInput = document.getElementById('groupNameInput');
  const name = nameInput ? nameInput.value.trim() : '';
  if(!name){ alert('Give the group a name.'); return; }
  if(groupSelection.length===0){ alert('Pick at least one person to add.'); return; }
  const convo = { id:nextId(), type:'group', name, participants:[currentUser, ...groupSelection], messages:[], unread:{} };
  conversations.push(convo);
  creatingGroup = false;
  openConversation(convo.id);
}

function renderMessages(){
  const titleEl = document.getElementById('messagesTitle');
  const descEl = document.getElementById('messagesDesc');
  const body = document.getElementById('messagesBody');
  updateMsgBadge();

  if(activeConversationId){
    const convo = conversations.find(c=>c.id===activeConversationId);
    if(!convo){ activeConversationId=null; renderMessages(); return; }
    titleEl.textContent = conversationTitle(convo);
    descEl.textContent = convo.type==='group' ? `${convo.participants.length} members` : 'Direct message';
    body.innerHTML = `
      <button class="btn btn-ghost btn-small" data-action="back-to-conversations" type="button" style="margin-bottom:14px;">← All messages</button>
      <div class="thread-scroll" id="threadScroll">
        ${convo.messages.length ? convo.messages.map(m=>`
          <div class="msg-bubble ${m.author===currentUser?'mine':''}">
            ${convo.type==='group' && m.author!==currentUser ? `<div class="msg-author">${escapeHtml(m.author)}</div>` : ''}
            <div class="msg-text">${escapeHtml(m.text)}</div>
            <div class="msg-time">${timeAgo(m.createdAt)}</div>
          </div>
        `).join('') : '<div class="empty">No messages yet — say hi.</div>'}
      </div>
      <div class="comment-add" style="margin-top:12px;">
        <input type="text" id="msgInput" placeholder="Type a message..." data-enter-action="send-message">
        <button class="btn btn-primary btn-small" data-action="send-message" type="button">Send</button>
      </div>
    `;
    const scroll = document.getElementById('threadScroll');
    if(scroll) scroll.scrollTop = scroll.scrollHeight;
    return;
  }

  if(creatingGroup){
    titleEl.textContent = 'New Group';
    descEl.textContent = 'Pick people from your followers and following.';
    const candidates = [...new Set([...(users[currentUser].followers||[]), ...(users[currentUser].following||[])])];
    body.innerHTML = `
      <div class="field"><label>Group name</label><input id="groupNameInput" type="text" placeholder="e.g. weekend watch club"></div>
      <div class="field"><label>Members</label>
        <div class="genre-chip-row">
          ${candidates.length ? candidates.map(name=>`
            <button class="genre-chip ${groupSelection.includes(name)?'active':''}" data-action="toggle-group-member" data-arg="${name}" type="button">${escapeHtml(name)}</button>
          `).join('') : '<span style="font-size:12px; color:var(--paper-faint);">Follow people first to add them to a group.</span>'}
        </div>
      </div>
      <div class="row" style="margin-top:14px;">
        <button class="btn btn-primary" data-action="create-group" type="button">Create group</button>
        <button class="btn btn-ghost" data-action="cancel-new-group" type="button">Cancel</button>
      </div>
    `;
    return;
  }

  titleEl.textContent = 'Messages';
  descEl.textContent = 'DMs and groups with people you follow.';
  const list = myConversations();
  if(list.length===0){
    body.innerHTML = `<div class="empty">No conversations yet — message someone from their profile, or start a group.</div>`;
    return;
  }
  body.innerHTML = list.map(c=>{
    const last = c.messages[c.messages.length-1];
    const unread = unreadCountFor(c, currentUser);
    return `
    <button class="convo-card ${unread>0?'unread':''}" data-action="open-conversation" data-id="${c.id}" type="button">
      <div class="avatar-ring" style="width:44px;height:44px;"><div class="avatar-inner" style="font-size:17px;">${c.type==='group'?'👥':conversationTitle(c)[0].toUpperCase()}</div></div>
      <div style="flex:1; min-width:0;">
        <div class="row between">
          <span style="font-weight:700; font-size:13.5px;">${escapeHtml(conversationTitle(c))}</span>
          <span style="font-size:11px; color:var(--paper-faint);">${last?timeAgo(last.createdAt):''}</span>
        </div>
        <div style="font-size:12.5px; color:var(--paper-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${last?escapeHtml(last.text):'No messages yet'}</div>
      </div>
      ${unread>0?`<span class="notif-badge" style="position:static;">${unread}</span>`:''}
    </button>`;
  }).join('');
}
