/* NEXORA — events.js
   Single delegated click/change/keydown listener wiring every data-action, plus startup calls. */

/* ===================== EVENT DELEGATION ===================== *
 * A single click / change / keydown listener on document handles
 * every interactive element via data-action attributes. This avoids
 * inline onclick/onchange handlers, which some sandboxed viewers
 * block under a strict Content-Security-Policy.
 * =================================================================== */

document.addEventListener('click', function(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id ? Number(el.dataset.id) : null;
  const arg = el.dataset.arg;

  switch(action){
    case 'toggle-theme': toggleTheme(); break;
    case 'auth-tab': switchAuthTab(arg); break;
    case 'login': handleLogin(); break;
    case 'signup': handleSignup(); break;
    case 'logout': logout(); break;
    case 'nav': switchView(arg); break;
    case 'toggle-add-form': toggleAddForm(); break;
    case 'add-title': addTitle(); break;
    case 'status-pill': setStatusFilter(arg); break;
    case 'bump-episode': bumpEpisode(id); break;
    case 'mark-watched': markWatched(id); break;
    case 'mark-complete': markCompleteManually(id); break;
    case 'delete-title': deleteTitle(id); break;
    case 'rate-title': rateTitle(id, Number(arg)); break;
    case 'toggle-new-post': toggleNewPostForm(); break;
    case 'sort': setSort(arg); break;
    case 'category': setCategory(arg); break;
    case 'add-post': addPost(); break;
    case 'reveal-spoiler': revealSpoiler(id); break;
    case 'vote-post': votePost(id, Number(arg)); break;
    case 'toggle-comments': toggleComments(id); break;
    case 'add-comment': addComment(id); break;
    case 'vote-comment': voteComment(id, Number(el.dataset.comment), Number(arg)); break;
    case 'toggle-visibility': toggleVisibility(); break;
    case 'toggle-genre': toggleGenre(arg); break;
    case 'open-notification': openNotification(id); break;
    case 'mark-all-read': markAllRead(); break;
    case 'open-my-post': openMyPost(id); break;
    case 'quick-post': quickNewPost(); break;
    case 'pick-image': pickImage(); break;
    case 'remove-image': removeImage(); break;
    case 'post-visibility': setPostVisibility(arg); break;
    case 'view-profile': viewProfile(arg); break;
    case 'back-from-user-profile': backFromUserProfile(); break;
    case 'toggle-follow': toggleFollow(); break;
    case 'open-follow-list': openFollowList(arg, el.dataset.username); break;
    case 'back-from-follow-list': backFromFollowList(); break;
    case 'message-user': messageUser(); break;
    case 'new-group': startNewGroup(); break;
    case 'cancel-new-group': cancelNewGroup(); break;
    case 'toggle-group-member': toggleGroupMember(arg); break;
    case 'create-group': createGroup(); break;
    case 'open-conversation': openConversation(id); break;
    case 'back-to-conversations': backToConversationList(); break;
    case 'send-message': sendMessage(); break;
  }
});

document.addEventListener('change', function(e){
  const el = e.target;
  if(el.id === 'fFormat'){ toggleEpField(); return; }
  if(el.id === 'pImageInput'){ handleImageFile(el.files[0]); return; }
  if(el.dataset && el.dataset.action === 'title-status-change'){
    changeStatus(Number(el.dataset.id), el.value); return;
  }
  if(el.dataset && el.dataset.action === 'notes-change'){
    updateNotes(Number(el.dataset.id), el.value); return;
  }
});

document.addEventListener('input', function(e){
  if(e.target.id === 'catSearch'){ handleCategorySearch(e.target.value); }
});

document.addEventListener('keydown', function(e){
  if(e.key !== 'Enter') return;
  const el = e.target;
  if(el.id === 'catSearch'){ e.preventDefault(); submitCategorySearch(el.value); return; }
  if(!el.dataset) return;
  if(el.dataset.enterAction === 'login'){ e.preventDefault(); handleLogin(); }
  if(el.dataset.enterAction === 'add-comment'){ e.preventDefault(); addComment(Number(el.dataset.id)); }
  if(el.dataset.enterAction === 'send-message'){ e.preventDefault(); sendMessage(); }
});

document.addEventListener('click', function(e){
  if(!e.target.closest('.search-row')) hideSearchResults();
});

/* bulb strip render */
(function renderBulbs(){
  const strip = document.getElementById('bulbStrip');
  for(let i=0;i<40;i++){ const b=document.createElement('div'); b.className='bulb'; strip.appendChild(b); }
})();

toggleEpField();
