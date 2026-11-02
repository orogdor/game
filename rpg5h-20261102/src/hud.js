import './style.css';
export function createHUD(){
 const hud=document.createElement('div');hud.id='hud';
 hud.innerHTML='<div class="top"><div class="brand">SÜGAVIKU VÄRAV</div><span id="stats"></span></div><div class="mission"><b>ESIMENE ÜLESANNE</b><p>Leidke põhja suunas hõõguv värav. Võitle koletistega!</p><small>WASD / nooled · tühik: rünnak · mobiilis ekraaninupud</small></div><div id="message">Sinu seiklus algab...</div><div class="inventory" style="display:none"><h3>VARUSTUS</h3><ul id="inv-list"></ul></div><div class="quests" style="display:none"><h3>ÜLESANDED</h3><ul id="quest-list"></ul></div>';
 document.body.append(hud);
 const stats=document.getElementById('stats');const msg=document.getElementById('message');
 const inv=document.querySelector('.inventory');const quests=document.querySelector('.quests');
 let showInventory=false;
 function toggle(){showInventory=!showInventory;inv.style.display=showInventory?'block':'none';}
 hud.addEventListener('click',e=>{if(e.target.closest('.inventory'))toggle();});
 document.addEventListener('keydown',e=>{if(e.key==='I'||e.key==='i')toggle();});
 return {update(hero){stats.textContent='❤ '+Math.max(0,Math.round(hero.hp))+' / '+hero.maxHp+'  ·  ⚔ '+hero.kills+'  ·  ✦ '+hero.gold;},message(text){msg.textContent=text;},dispose(){hud.remove();document.removeEventListener('keydown',()=>{});},setInventory(items){const list=document.getElementById('inv-list');list.innerHTML='';items.forEach(i=>{const li=document.createElement('li');li.textContent=i.name||i;list.appendChild(li);});},setQuests(list){const qList=document.getElementById('quest-list');qList.innerHTML='';list.forEach(q=>{const li=document.createElement('li');li.textContent=q.title||q;list.appendChild(li);});}};
}
