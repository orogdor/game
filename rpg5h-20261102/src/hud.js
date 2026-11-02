export function createHUD(){
 const hud=document.createElement('div');hud.id='hud';
 hud.innerHTML='<div class="top"><div class="brand">SÜGAVIKU VÄRAV</div><span id="stats"></span></div><div class="mission"><b>ESIMENE ÜLESANNE</b><p>Leidke põhja suunas hõõguv värav. Võitle koletistega!</p><small>WASD / nooled · tühik: rünnak · mobiilis ekraaninupud</small></div><div id="message">Sinu seiklus algab...</div>';
 document.body.append(hud);
 const stats=document.getElementById('stats');const msg=document.getElementById('message');
 return {update(hero){stats.textContent='❤ '+Math.max(0,Math.round(hero.hp))+' / '+hero.maxHp+'  ·  ⚔ '+hero.kills+'  ·  ✦ '+hero.gold;},message(text){msg.textContent=text;},dispose(){hud.remove();}};
}
