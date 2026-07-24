/* NEXORA — community.js
   Community feed: categories, posts, genre tags, voting, comments. */

/* ===================== COMMUNITY ===================== */
function toggleNewPostForm(){ document.getElementById('newPostCard').classList.toggle('hidden'); }
function setSort(s){
  activeSort = s;
  document.getElementById('sortNewBtn').classList.toggle('active', s==='new');
  document.getElementById('sortTopBtn').classList.toggle('active', s==='top');
  renderCommunity();
}
function setCategory(c){ activeCategory = c; renderCommunity(); }

function addPost(){
  const title = document.getElementById('pTitle').value.trim();
  const body = document.getElementById('pBody').value.trim();
  if(!title || !body){ alert('Add a title and some post content.'); return; }
  posts.unshift({
    id:nextId(), category: activeCategory, title, author: currentUser, body,
    spoiler: document.getElementById('pSpoiler').checked,
    showProgress: document.getElementById('pProgress').checked,
    votes: 0, myVote:0, createdAt: Date.now(), revealed:false, comments:[],
    genres: [...selectedGenres],
    image: selectedImage
  });
  document.getElementById('pTitle').value='';
  document.getElementById('pBody').value='';
  document.getElementById('pSpoiler').checked=false;
  document.getElementById('pProgress').checked=false;
  selectedGenres = [];
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

const CAT_COLORS = {
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

function renderCommunity(){
  const section = document.getElementById('section-community');
  section.setAttribute('data-cat-theme', activeCategory);
  const [c1,c2] = CAT_COLORS[activeCategory] || ['var(--gold)','var(--crimson)'];
  section.style.setProperty('--cat-1', c1);
  section.style.setProperty('--cat-2', c2);
  document.getElementById('catHeading').textContent = activeCategory;

  document.getElementById('catTabs').innerHTML = CATEGORIES.map(c=>
    `<button class="cat-tab ${activeCategory===c?'active':''}" data-action="category" data-arg="${c}" type="button">${c}</button>`
  ).join('');
  renderGenrePicker();

  let list = posts.filter(p=>p.category===activeCategory);
  list = activeSort==='top' ? [...list].sort((a,b)=>b.votes-a.votes) : [...list].sort((a,b)=>b.createdAt-a.createdAt);

  const el = document.getElementById('postList');
  if(list.length===0){ el.innerHTML = `<div class="empty">No posts in ${activeCategory} yet — be the first.</div>`; return; }

  el.innerHTML = list.map(p=>{
    const myProgress = p.showProgress ? progressChipFor(p.author, p.title) : '';
    const imageHtml = p.image ? `<img class="post-image" src="${p.image}" alt="Image attached to post about ${escapeHtml(p.title)}">` : '';
    const bodyHtml = p.spoiler && !p.revealed
      ? `<div class="spoiler-wrap"><div class="spoiler-blur">${escapeHtml(p.body)}${imageHtml}</div></div><button class="icon-btn spoiler-btn" data-action="reveal-spoiler" data-id="${p.id}" type="button">Reveal spoiler</button>`
      : `<div class="post-body">${escapeHtml(p.body)}</div>${imageHtml}`;
    return `
    <div class="post-card">
      <div class="post-head">
        <span>u/${escapeHtml(p.author)} · <span class="post-title-tag">${escapeHtml(p.title)}</span>${myProgress}${p.spoiler?' · <span style="color:var(--crimson-bright)">SPOILER</span>':''}</span>
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

