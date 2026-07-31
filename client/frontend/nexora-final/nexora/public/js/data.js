/* NEXORA — data.js
   State, seed data (titles, posts, notifications, follows, messages) — the app's in-memory database for this session. */

/* ===================== IN-MEMORY DATA LAYER ===================== *
 * Everything lives in JS variables for this session only — nothing
 * is written to disk or browser storage.
 * =================================================================== */

let currentUser = null;
let idCounter = 1000;
const nextId = () => idCounter++;

const users = {
  demo: {
    username:'demo', password:'demo123',
    bio:'Currently juggling three K-dramas and a Turkish dizi. Send help (and recs).',
    publicProfile:true, followers:['reelwatcher','nightowl_ott'], following:['popcorn_diaries']
  },
  reelwatcher:     { username:'reelwatcher',     password:'demo123', bio:'Always mid-rewatch of something.', publicProfile:true, followers:[], following:['demo'] },
  nightowl_ott:    { username:'nightowl_ott',    password:'demo123', bio:'Late night streaming, spoiler-free zone.', publicProfile:true, followers:[], following:['demo'] },
  popcorn_diaries: { username:'popcorn_diaries', password:'demo123', bio:'Reviews with too many exclamation marks.', publicProfile:false, followers:['demo'], following:[] },
};

const userTitles = { demo: [] };

const CATEGORIES = [
  'Hollywood','K-Drama','Anime','Sitcoms','C-Drama','J-Drama',
  'Thai Drama','Turkish Dizi','Spanish Series','Korean Movies','Japanese Movies','Web Series'
];
const GENRES = ['Action','Romance','Comedy','Thriller','Fantasy','Drama','Mystery','Horror','Slice of Life','Sci-Fi','Sports'];
let selectedGenres = [];
let postVisibility = 'public';
let activeCategory = 'For You';
let activeSort = 'new';
let activeStatusFilter = 'All';
const VIEW_ORDER = ['tracker','completed','community','messages','notifications','profile'];

function mkTitle({name,type,format,totalEp,currentEp,fav,priority,status,notes}){
  return { id:nextId(), name, type, format, totalEp:Number(totalEp), currentEp:Number(currentEp), fav, priority, status, notes:notes||'', completed:false, rating:null };
}
function markCompletedIfDone(list){
  list.forEach(t=>{
    if((t.format==='episodic' && t.currentEp>=t.totalEp && t.totalEp>0) || (t.format==='single' && t.currentEp>=1)){
      t.completed = true;
    }
  });
}

function seedDemoData(){
  userTitles.demo = [
    mkTitle({name:'One Piece', type:'Anime', format:'episodic', totalEp:1100, currentEp:1080, fav:'Roronoa Zoro', priority:'High', status:'Watching', notes:'Wano arc still gives me chills.'}),
    mkTitle({name:'Jujutsu Kaisen', type:'Anime', format:'episodic', totalEp:24, currentEp:24, fav:'Nobara Kugisaki', priority:'High', status:'Watching', notes:'Rewatch before S3.'}),
    mkTitle({name:'Crash Landing on You', type:'K-Drama', format:'episodic', totalEp:16, currentEp:16, fav:'Ri Jeong-hyeok', priority:'Medium', status:'Watching', notes:'Cried at ep 14.'}),
    mkTitle({name:'The Dark Knight', type:'Hollywood', format:'single', totalEp:1, currentEp:1, fav:'Alfred Pennyworth', priority:'High', status:'Watching', notes:'Comfort rewatch, every single time.'}),
    mkTitle({name:'Kore wa Zombie Desu ka', type:'J-Drama', format:'episodic', totalEp:12, currentEp:0, fav:'—', priority:'Low', status:'Plan to Watch', notes:''}),
    mkTitle({name:'Attack on Titan', type:'Anime', format:'episodic', totalEp:87, currentEp:87, fav:'Levi Ackerman', priority:'High', status:'Watching', notes:'Final season destroyed me.'}),
  ];
  markCompletedIfDone(userTitles.demo);
  userTitles.demo.find(t=>t.name==='Attack on Titan').rating = 10;
  userTitles.demo.find(t=>t.name==='Jujutsu Kaisen').rating = 9;
  userTitles.demo.find(t=>t.name==='Crash Landing on You').rating = 9;
  userTitles.demo.find(t=>t.name==='The Dark Knight').rating = 10;
}

const posts = [];
const notifications = [];
function pushNotification(forUser, fromUser, post, comment){
  notifications.unshift({
    id: nextId(), forUser, fromUser, postId: post.id, postTitle: post.title, category: post.category,
    snippet: comment.text.length>60 ? comment.text.slice(0,60)+'…' : comment.text,
    read:false, createdAt: Date.now()
  });
}
function updateNotifBadge(){
  if(!currentUser) return;
  const count = notifications.filter(n=>n.forUser===currentUser && !n.read).length;
  const label = count > 9 ? '9+' : String(count);
  const badge = document.getElementById('notifBadge');
  if(badge){
    badge.textContent = label;
    badge.classList.toggle('hidden', count===0);
  }
}
function mkPost(category,title,author,body,spoiler,showProgress,seedVotes,genres,visibility){
  return {
    id:nextId(), category, title, author, body, spoiler, showProgress,
    votes: seedVotes, myVote:0, createdAt: Date.now() - Math.floor(Math.random()*1000000),
    revealed:false, genres: genres || [], visibility: visibility || 'public',
    comments: seedComments()
  };
}
function seedComments(){
  const pool = [
    {author:'reelwatcher', text:'Completely agree with this.', votes:12},
    {author:'nightowl_ott', text:'This take is criminally underrated.', votes:6},
    {author:'popcorn_diaries', text:'Sending this to my group chat immediately.', votes:3},
  ];
  const n = Math.floor(Math.random()*3);
  return pool.slice(0,n).map(c=>({...c, id:nextId(), myVote:0}));
}
function seedPosts(){
  posts.push(
    mkPost('Hollywood','Oppenheimer','demo','The Trinity test sequence deserves to be seen on the biggest screen possible.', false, false, 154, ['Drama','Thriller']),
    mkPost('Hollywood','The Dark Knight','demo','The Joker interrogation scene is still the best-written scene in any superhero movie.', false, true, 198, ['Action','Thriller']),
    mkPost('K-Drama','Crash Landing on You','demo','The ending had me sobbing at 2am, absolutely worth the hype.', true, true, 97, ['Romance','Drama']),
    mkPost('Anime','One Piece','demo','Wano still holds up on rewatch — the pacing complaints age worse every year.', false, true, 182, ['Action','Fantasy']),
    mkPost('Anime','Jujutsu Kaisen','demo','Ok who else thinks the Shibuya arc is the best animated fight sequence of the decade, no notes.', false, false, 121, ['Action','Thriller']),
    mkPost('Sitcoms','Brooklyn Nine-Nine','demo','Rewatched the Halloween heist episodes back to back, still the best written bits in the whole show.', false, false, 145, ['Comedy']),
    mkPost('C-Drama','The Untamed','demo','The soundtrack alone carries half the emotional weight of this show, still get chills.', false, false, 88, ['Fantasy','Drama']),
    mkPost('J-Drama','Midnight Diner','demo','The most comforting hour of television that exists, I mean that literally.', false, false, 46, ['Slice of Life','Drama']),
    mkPost('Thai Drama','2gether: The Series','demo','Started this ironically and now I am fully, unironically invested. No regrets.', false, true, 73, ['Romance','Comedy']),
    mkPost('Turkish Dizi','Kara Sevda','demo','Turkish dizi pacing is not for the impatient but the payoff is always worth it.', true, false, 64, ['Romance','Drama']),
    mkPost('Spanish Series','Money Heist','demo','Tokyo\u2019s narration still goes so hard even on a fourth rewatch.', false, false, 132, ['Thriller','Action']),
    mkPost('Korean Movies','Parasite','demo','Every rewatch I notice another detail in the production design foreshadowing the ending.', true, false, 176, ['Thriller','Drama']),
    mkPost('Japanese Movies','Departures','demo','A quiet, devastating film that never gets the conversation it deserves.', false, false, 41, ['Drama']),
    mkPost('Web Series','The Family Man','demo','Manoj Bajpayee carries every single scene he is in, underrated performance.', false, false, 39, ['Thriller','Drama']),
    mkPost('Anime','Attack on Titan','demo','Only telling my followers this but the ending still lives in my head rent free.', false, false, 12, ['Action','Drama'], 'followers'),
    mkPost('Anime','Demon Slayer','reelwatcher','The animation budget for this show should be studied in film schools honestly.', false, false, 58, ['Action','Fantasy']),
  );
}

/* ---- Messaging: DMs and groups ---- */
const conversations = [];
function seedConversations(){
  conversations.push(
    {
      id:nextId(), type:'dm', participants:['demo','reelwatcher'],
      messages:[
        {id:nextId(), author:'reelwatcher', text:'have you started the new season yet??', createdAt: Date.now()-1000*60*40},
        {id:nextId(), author:'demo', text:'not yet, no spoilers 😭', createdAt: Date.now()-1000*60*35},
      ]
    },
    {
      id:nextId(), type:'group', name:'weekend watch club', participants:['demo','reelwatcher','nightowl_ott'],
      messages:[
        {id:nextId(), author:'nightowl_ott', text:'movie night saturday?', createdAt: Date.now()-1000*60*200},
        {id:nextId(), author:'reelwatcher', text:'im in, my pick this time', createdAt: Date.now()-1000*60*190},
      ]
    }
  );
}

seedDemoData();
seedPosts();
seedConversations();
