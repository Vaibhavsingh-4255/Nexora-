const trending = [
{
name:"Solo Leveling",
rating:"9.2",
image:"https://picsum.photos/300/450?1"
},
{
name:"One Piece",
rating:"9.0",
image:"https://picsum.photos/300/450?2"
},
{
name:"Jujutsu Kaisen",
rating:"8.8",
image:"https://picsum.photos/300/450?3"
},
{
name:"Demon Slayer",
rating:"8.7",
image:"https://picsum.photos/300/450?4"
}
];

const trendingList=document.getElementById("trendingList");

trending.forEach(anime=>{

trendingList.innerHTML+=`

<div class="poster-card">

<img src="${anime.image}">

<h4>${anime.name}</h4>

<p>⭐ ${anime.rating}</p>

</div>

`;

});