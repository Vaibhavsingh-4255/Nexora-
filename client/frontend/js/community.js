/* NEXORA — community.js
   Community feed: For You default feed, categories, search, genre tags, voting, comments, post visibility. */

/* ===================== COMMUNITY ===================== */
function toggleNewPostForm(){ document.getElementById('newPostCard').classList.toggle('hidden'); }
function setSort(s){
  activeSort = s;
  document.getElementById('sortNewBtn').classList.toggle('active', s==='new');
  document.getElementById('sortTopBtn').classList.toggle('active', s==='top');
  renderCommunity();
}
function setCategory(c){
  activeCategory = c;
  document.getElementById('catSearch').value = '';
  hideSearchResults();
  renderCommunity();
}
function setPostVisibility(v){
  postVisibility = v;
  document.getElementById('visPublicBtn').classList.toggle('active', v==='public');
  document.getElementById('visFollowersBtn').classList.toggle('active', v==='followers');
}

function canSeePost(p){
  if(p.visibility !== 'followers') return true;
  if(p.author === currentUser) return true;
  const author = users[p.author];
  return !!(author && author.followers && author.followers.includes(currentUser));
}

function addPost(){
  const title = document.getElementById('pTitle').value.trim();
  const body = document.getElementById('pBody').value.trim();
  const category = document.getElementById('pCategory').value;
  if(!title || !body){ alert('Add a title and some post content.'); return; }
  posts.unshift({
    id:nextId(), category, title, author: currentUser, body,
    spoiler: document.getElementById('pSpoiler').checked,
    showProgress: document.getElementById('pProgress').checked,
    votes: 0, myVote:0, createdAt: Date.now(), revealed:false, comments:[],
    genres: [...selectedGenres],
    image: selectedImage,
    visibility: postVisibility
  });
  document.getElementById('pTitle').value='';
  document.getElementById('pBody').value='';
  document.getElementById('pSpoiler').checked=false;
  document.getElementById('pProgress').checked=false;
  selectedGenres = [];
  setPostVisibility('public');
  removeImage();
  toggleNewPostForm();
  renderCommunity();
}

/* ---- Optional image attachment ----
 * Images are never uploaded anywhere — the file is read locally and
 * downscaled in-browser to a compact data URL kept in memory for the
 * session, same as every other piece of data in this app. */
let selectedImage = null;
const MAX_IMAGE_DIM = 1000;

function pickImage(){ document.getElementById('pImageInput').click(); }

function handleImageFile(file){
  if(!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      let w = img.width, h = img.height;
      if(w > MAX_IMAGE_DIM || h > MAX_IMAGE_DIM){
        const scale = MAX_IMAGE_DIM / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      selectedImage = canvas.toDataURL('image/jpeg', 0.82);
      showImagePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(){
  document.getElementById('imagePreview').src = selectedImage;
  document.getElementById('imagePreviewWrap').classList.remove('hidden');
  document.getElementById('pImageBtn').classList.add('hidden');
}

function removeImage(){
  selectedImage = null;
  document.getElementById('pImageInput').value = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('imagePreviewWrap').classList.add('hidden');
  document.getElementById('pImageBtn').classList.remove('hidden');
}

function toggleGenre(g){
  const i = selectedGenres.indexOf(g);
  if(i===-1) selectedGenres.push(g); else selectedGenres.splice(i,1);
  renderGenrePicker();
}
function renderGenrePicker(){
  const el = document.getElementById('genrePicker');
  if(!el) return;
  el.innerHTML = GENRES.map(g=>
    `<button class="genre-chip ${selectedGenres.includes(g)?'active':''}" data-action="toggle-genre" data-arg="${g}" type="button">${g}</button>`
  ).join('');
}
function renderCategoryPicker(){
  const el = document.getElementById('pCategory');
  if(!el) return;
  const preselect = CATEGORIES.includes(activeCategory) ? activeCategory : myTopCategory();
  el.innerHTML = CATEGORIES.map(c=>`<option ${c===preselect?'selected':''}>${c}</option>`).join('');
}
function myTopCategory(){
  const mine = userTitles[currentUser] || [];
  const counts = {};
  mine.forEach(t=>{ counts[t.type] = (counts[t.type]||0) + 1; });
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  return sorted.length ? sorted[0][0] : CATEGORIES[0];
}

const CAT_COLORS = {
  'For You':        ['#8B7FD9','#3FC9B0'],
  'Hollywood':      ['#E0263F','#F2B84B'],
  'K-Drama':        ['#FFB6D9','#B79CFF'],
  'Anime':          ['#FF2E88','#00D4FF'],
  'Sitcoms':        ['#FFB648','#FF6F59'],
  'C-Drama':        ['#C81E3A','#F2C94C'],
  'J-Drama':        ['#FFC9D9','#5C6BC0'],
  'Thai Drama':     ['#FF8FA3','#C6A8FF'],
  'Turkish Dizi':   ['#D7263D','#1B4B5A'],
  'Spanish Series': ['#E63946','#F4A261'],
  'Korean Movies':  ['#2A2A2A','#FF3B3B'],
  'Japanese Movies':['#9CAF88','#D9A5A0'],
  'Web Series':     ['#3AA6FF','#8fd7ff']
};

/* ---- Search: type a category name, jump straight to it ---- */
function handleCategorySearch(query){
  const q = query.trim().toLowerCase();
  const resultsEl = document.getElementById('searchResults');
  if(!q){ hideSearchResults(); return; }
  const matches = CATEGORIES.filter(c => c.toLowerCase().includes(q));
  if(matches.length === 0){
    resultsEl.innerHTML = `<div class="search-empty">No category matches "${escapeHtml(query)}"</div>`;
    resultsEl.classList.remove('hidden');
    return;
  }
  resultsEl.innerHTML = matches.map(c =>
    `<button class="search-result-item" data-action="category" data-arg="${c}" type="button">${c}</button>`
  ).join('');
  resultsEl.classList.remove('hidden');
}
function hideSearchResults(){
  document.getElementById('searchResults').classList.add('hidden');
}
function submitCategorySearch(query){
  const q = query.trim().toLowerCase();
  if(!q) return;
  const match = CATEGORIES.find(c => c.toLowerCase().includes(q));
  if(match) setCategory(match);
}

function renderCommunity(){
  const section = document.getElementById('section-community');
  section.setAttribute('data-cat-theme', activeCategory);
  const [c1,c2] = CAT_COLORS[activeCategory] || ['var(--gold)','var(--crimson)'];
  section.style.setProperty('--cat-1', c1);
  section.style.setProperty('--cat-2', c2);
  document.getElementById('catHeading').textContent = activeCategory;
  document.getElementById('communityDesc').textContent = activeCategory === 'For You'
    ? 'A mix leaning toward what you track — search or tap a category to narrow it down.'
    : `Browsing ${activeCategory} — tap For You to go back to your personalized mix.`;

  document.getElementById('catTabs').innerHTML = ['For You', ...CATEGORIES].map(c=>
    `<button class="cat-tab ${activeCategory===c?'active':''}" data-action="category" data-arg="${c}" type="button">${c}</button>`
  ).join('');
  renderGenrePicker();
  renderCategoryPicker();

  let list;
  if(activeCategory === 'For You'){
    const myCats = new Set((userTitles[currentUser]||[]).map(t=>t.type));
    list = posts.filter(canSeePost);
    list = activeSort==='top' ? [...list].sort((a,b)=>b.votes-a.votes) : [...list].sort((a,b)=>b.createdAt-a.createdAt);
    list.sort((a,b) => (myCats.has(b.category)?1:0) - (myCats.has(a.category)?1:0));
  } else {
    list = posts.filter(p => p.category===activeCategory && canSeePost(p));
    list = activeSort==='top' ? [...list].sort((a,b)=>b.votes-a.votes) : [...list].sort((a,b)=>b.createdAt-a.createdAt);
  }

  const el = document.getElementById('postList');
  if(list.length===0){
    el.innerHTML = `<div class="empty">${activeCategory==='For You' ? 'No posts to show yet — follow people or browse a category.' : `No posts in ${activeCategory} yet — be the first.`}</div>`;
    return;
  }

  el.innerHTML = list.map(p=>{
    const myProgress = p.showProgress ? progressChipFor(p.author, p.title) : '';
    const imageHtml = p.image ? `<img class="post-image" src="${p.image}" alt="Image attached to post about ${escapeHtml(p.title)}">` : '';
    const bodyHtml = p.spoiler && !p.revealed
      ? `<div class="spoiler-wrap"><div class="spoiler-blur">${escapeHtml(p.body)}${imageHtml}</div></div><button class="icon-btn spoiler-btn" data-action="reveal-spoiler" data-id="${p.id}" type="button">Reveal spoiler</button>`
      : `<div class="post-body">${escapeHtml(p.body)}</div>${imageHtml}`;
    const catChip = activeCategory === 'For You' ? `<span class="progress-chip">${escapeHtml(p.category)}</span>` : '';
    const authorLink = p.author === currentUser
      ? `<span class="post-author-link">u/${escapeHtml(p.author)}</span>`
      : `<button class="post-author-link" data-action="view-profile" data-arg="${escapeHtml(p.author)}" type="button">u/${escapeHtml(p.author)}</button>`;
    return `
    <div class="post-card">
      <div class="post-head">
        <span>${authorLink} · <span class="post-title-tag">${escapeHtml(p.title)}</span>${catChip}${myProgress}${p.spoiler?' · <span style="color:var(--crimson)">SPOILER</span>':''}${p.visibility==='followers'?' · <span class="followers-only-tag">🔒 followers</span>':''}</span>
        <span>${timeAgo(p.createdAt)}</span>
      </div>
      ${bodyHtml}
      ${p.genres && p.genres.length ? `<div class="post-genres">${p.genres.map(g=>`<span class="genre-tag">${escapeHtml(g)}</span>`).join('')}</div>` : ''}
      <div class="vote-row">
        <button class="vote-btn ${p.myVote===1?'voted':''}" data-action="vote-post" data-id="${p.id}" data-arg="1" type="button">▲</button>
        <span class="vote-count">${p.votes}</span>
        <button class="vote-btn ${p.myVote===-1?'voted':''}" data-action="vote-post" data-id="${p.id}" data-arg="-1" type="button">▼</button>
        <button class="comments-toggle" data-action="toggle-comments" data-id="${p.id}" type="button">${p.comments.length} comment${p.comments.length===1?'':'s'}</button>
      </div>
      <div class="comment-block" id="comments-${p.id}">
        ${p.comments.map(c=>`
          <div class="comment">
            <div>
              <div class="comment-meta">u/${escapeHtml(c.author)}</div>
              <div>${escapeHtml(c.text)}</div>
            </div>
            <div class="comment-vote">
              <button data-action="vote-comment" data-id="${p.id}" data-comment="${c.id}" data-arg="1" type="button">▲</button>${c.votes}<button data-action="vote-comment" data-id="${p.id}" data-comment="${c.id}" data-arg="-1" type="button">▼</button>
            </div>
          </div>
        `).join('')}
        <div class="comment-add">
          <input type="text" placeholder="Add a comment..." id="commentInput-${p.id}" data-enter-action="add-comment" data-id="${p.id}">
          <button class="btn btn-ghost btn-small" data-action="add-comment" data-id="${p.id}" type="button">Reply</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function progressChipFor(username, titleName){
  const list = userTitles[username] || [];
  const t = list.find(t=>t.name.toLowerCase()===titleName.toLowerCase());
  if(!t) return '';
  const label = t.format==='episodic' ? `EP ${t.currentEp}/${t.totalEp}` : (t.currentEp>=1?'WATCHED':'NOT WATCHED');
  return `<span class="progress-chip">${label}</span>`;
}
function revealSpoiler(id){ posts.find(p=>p.id===id).revealed = true; renderCommunity(); }
function votePost(id,dir){
  const p = posts.find(p=>p.id===id);
  if(p.myVote===dir){ p.votes -= dir; p.myVote = 0; }
  else{ p.votes += dir - p.myVote; p.myVote = dir; }
  renderCommunity();
}
function toggleComments(id){ document.getElementById('comments-'+id).classList.toggle('open'); }
function addComment(id){
  const input = document.getElementById('commentInput-'+id);
  const text = input.value.trim();
  if(!text) return;
  const p = posts.find(p=>p.id===id);
  const comment = { id:nextId(), author: currentUser, text, votes:0, myVote:0 };
  p.comments.push(comment);
  if(p.author !== currentUser){
    pushNotification(p.author, currentUser, p, comment);
    updateNotifBadge();
  }
  renderCommunity();
  document.getElementById('comments-'+id).classList.add('open');
}
function voteComment(postId, commentId, dir){
  const c = posts.find(p=>p.id===postId).comments.find(c=>c.id===commentId);
  if(c.myVote===dir){ c.votes -= dir; c.myVote = 0; }
  else{ c.votes += dir - c.myVote; c.myVote = dir; }
  renderCommunity();
}
