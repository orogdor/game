export function createInput(){
 const held=new Set(),buttons={attack:false};
 const down=e=>{held.add(e.code);if(e.code==='Space'){buttons.attack=true;e.preventDefault();}};
 const up=e=>held.delete(e.code);
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);
 const layer=document.createElement('div');layer.className='touch-controls';
 layer.innerHTML='<div class="dpad"><button data-k="w">▲</button><div><button data-k="a">◀</button><button data-k="s">▼</button><button data-k="d">▶</button></div></div><button class="attack-btn" data-k="attack">⚔ RÜNDA</button>';
 document.body.append(layer);
 const mapping={w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD'};
 for(const button of layer.querySelectorAll('button')){
  const key=button.dataset.k,press=e=>{e.preventDefault();if(key==='attack')buttons.attack=true;else held.add(mapping[key]);},
  release=e=>{e.preventDefault();if(mapping[key])held.delete(mapping[key]);};
  button.addEventListener('pointerdown',press);button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);button.addEventListener('pointerleave',release);
 }
 return {held,buttons,direction(){
  const x=Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'));
  const z=Number(held.has('KeyS')||held.has('ArrowDown'))-Number(held.has('KeyW')||held.has('ArrowUp'));
  const len=Math.hypot(x,z)||1;return{x:x/len,z:z/len};
 },consumeAttack(){const a=buttons.attack;buttons.attack=false;return a;},dispose(){window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);layer.remove();}};
}
