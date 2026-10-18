// ============================================================
//  MÄNGIJA: FPS-liikumine, relvad, tegevused
// ============================================================
const WEAPONS = {
  shotgun: { name: 'Shotgun', dmg: 13, pellets: 9, rate: 0.85, mag: 6, reload: 2.4, spread: 0.065, range: 45, kick: 1.0, recoil: 0.9, snd: 'shotgun' },
  pistol: { name: 'Pistol', dmg: 24, rate: 0.2, mag: 12, reload: 1.15, spread: 0.007, range: 140, semi: true, kick: 0.45, recoil: 0.3, snd: 'pistol' },
  smg: { name: 'PP-9 SMG', dmg: 12, rate: 0.068, mag: 40, reload: 1.8, spread: 0.022, range: 110, kick: 0.25, recoil: 0.2, snd: 'smg' },
  sniper: { name: 'Sniper rifle', dmg: 120, rate: 1.35, mag: 5, reload: 2.7, spread: 0.0006, range: 420, kick: 1.1, recoil: 0.9, snd: 'sniper', zoom: 0.78, moveSpread: 6 },
  revolver: { name: '.44 Revolver', dmg: 58, rate: 0.42, mag: 6, reload: 2.2, spread: 0.005, range: 170, semi: true, kick: 0.9, recoil: 0.7, snd: 'pistol' },
  dmr: { name: 'DMR marksman rifle', dmg: 48, rate: 0.26, mag: 15, reload: 2.0, spread: 0.0025, range: 320, semi: true, kick: 0.7, recoil: 0.5, snd: 'sniper', zoom: 0.62 },
  plasma: { name: 'Plasma rifle', dmg: 30, rate: 0.11, mag: 30, reload: 2.0, spread: 0.011, range: 200, kick: 0.35, recoil: 0.22, snd: 'plasma', plasma: true },
  gl: { name: 'Grenade launcher', dmg: 150, rate: 0.85, mag: 6, reload: 3.0, spread: 0.004, range: 120, kick: 1.0, recoil: 0.9, snd: 'gl', launcher: true },
  ashot: { name: 'Auto shotgun', dmg: 11, pellets: 8, rate: 0.24, mag: 10, reload: 2.8, spread: 0.07, range: 42, kick: 0.8, recoil: 0.55, snd: 'shotgun' },
  bugmg: { name: 'Buggy MG', dmg: 22, rate: 0.085, mag: 120, reload: 3.0, spread: 0.018, range: 260, kick: 0.35, recoil: 0.18, snd: 'lmg' },
  lmg: { name: 'Machine gun', dmg: 26, rate: 0.095, mag: 100, reload: 4.2, spread: 0.028, range: 260, kick: 0.5, recoil: 0.32, slow: 0.78, snd: 'lmg' },
};
function weaponStats(w) {
  if (w === 'rail') return { name: 'Railgun', dmg: 150, rate: 1.05, mag: 5, reload: 2.3, spread: 0.0012, range: 340, pierce: true };
  if (WEAPONS[w]) return WEAPONS[w];
  const lv = G.up.rifle;
  return { name: 'Carbine' + (lv > 1 ? ' Mk' + lv : ''), dmg: [0, 16, 22, 30][lv], rate: [0, 0.15, 0.13, 0.11][lv], mag: [0, 24, 28, 32][lv], reload: 1.6, spread: 0.010, range: 230 };
}

const Player = {
  kind: 'player', team: 'player', id: 0, pos: { x: 0, y: 0, z: 0 }, vel: { x: 0, y: 0, z: 0 }, yaw: Math.PI, pitch: 0,
  hp: 100, maxHp: 100, alive: true, radius: 0.38, spheres: [], hitY: 1.0, pose: 'stand', moveAmt: 0, speed: 0, phase: 0,
  dead: false, deadT: 0, onGround: true, speedNow: 0, bobT: 0, lastStep: 0,
  weapon: 'rifle', mag: { rifle: 24, rail: 5, sniper: 5, shotgun: 6, pistol: 12, smg: 40, lmg: 100, revolver: 6, dmr: 15, plasma: 30, gl: 6, ashot: 10 }, reloadT: 0, fireCool: 0, recoil: 0, kick: 0, swayX: 0, swayY: 0,
  inter: null, interT: 0, interScan: 0, hurtT: 0, lastHurt: 99, regenT: 0, eyeH: 1.62, fallV: 0,
  vm: M4.create(), vmG: M4.create(), vmArmL: M4.create(), vmArmR: M4.create(), camM: M4.create(), wasInside: false,

  reset(x, z, yaw) {
    this.pos.x = x; this.pos.z = z; this.pos.y = Ents.groundY(x, z); this.yaw = yaw; this.pitch = 0;
    this.vel.x = this.vel.y = this.vel.z = 0; this.maxHp = 100 + G.up.armor * 50; this.hp = this.maxHp;
    this.dead = false; this.alive = true; this.reloadT = 0; this.fireCool = 0;
    this.weapon = Inv.curWeapon() || 'rifle';
  },
  fillMags() { this.mag.rifle = weaponStats('rifle').mag; this.mag.rail = 5; for (const k in WEAPONS) this.mag[k] = WEAPONS[k].mag; },

  update(dt, inp) {
    if (this.hurtT > 0) this.hurtT -= dt;
    this.lastHurt += dt;
    if (this.dead) {
      this.deadT += dt;
      if (this.deadT > 4.5) this.respawn();
      return;
    }
    // sõidukis: eraldi juhtimine
    if (this.vehicle) { Vehicles.playerUpdate(this, dt, inp); return; }
    // taastumine
    if (this.lastHurt > 6 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + dt * 4 * Inv.regenMul());
    Inv.update(dt);
    // vaatamine
    this.yaw -= inp.lookX; this.pitch = clamp(this.pitch - inp.lookY, -1.45, 1.45);
    // liikumine
    const fw = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) }, rt = { x: -Math.cos(this.yaw), z: Math.sin(this.yaw) };
    let wx = fw.x * inp.moveY + rt.x * inp.moveX, wz = fw.z * inp.moveY + rt.z * inp.moveX;
    const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
    const sprint = (inp.sprint || inp.moveMag > 0.93) && inp.moveY > 0.3;
    let spd = (sprint && !this.zoom ? 8.6 : 5.3) * Inv.speedMul() * (this.zoom ? 0.6 : 1) * (weaponStats(this.weapon).slow || 1);
    if (this.reloadT > 0) spd *= 0.85;
    // kallakul aeglasemalt üles
    const ahead = World.heightAt(this.pos.x + wx * 1.2, this.pos.z + wz * 1.2) - World.heightAt(this.pos.x, this.pos.z);
    if (ahead > 0.6) spd *= clamp(1.4 - ahead * 0.55, 0.3, 1);
    const acc = this.onGround ? 11 : 2.5;
    this.vel.x += (wx * spd - this.vel.x) * Math.min(1, dt * acc);
    this.vel.z += (wz * spd - this.vel.z) * Math.min(1, dt * acc);
    const ox = this.pos.x, oz = this.pos.z, oh = World.heightAt(ox, oz);
    this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
    World.collideCircle(this.pos, this.radius, this.pos.y + 0.35, this.pos.y + 1.75, this);
    // järsud kaljuseinad: üles ei saa ronida, kaldalt libised alla
    if (!Base.isInside(this.pos.x, this.pos.z)) {
      const nh = World.heightAt(this.pos.x, this.pos.z), hd = Math.hypot(this.pos.x - ox, this.pos.z - oz);
      if (hd > 1e-4 && nh - oh > hd * 1.15 && this.pos.y < nh + 0.4) { this.pos.x = ox; this.pos.z = oz; this.vel.x *= 0.2; this.vel.z *= 0.2; }
      if (World.slopeAt(this.pos.x, this.pos.z) > 0.38 && this.pos.y - World.heightAt(this.pos.x, this.pos.z) < 0.35) {
        const n = World.normalAt(this.pos.x, this.pos.z); this.pos.x += n.x * dt * 6; this.pos.z += n.z * dt * 6;
      }
    }
    this.pos.x = clamp(this.pos.x, -World.HALF + 12, World.HALF - 12); this.pos.z = clamp(this.pos.z, -World.HALF + 12, World.HALF - 12);
    const gy = Ents.groundY(this.pos.x, this.pos.z, this.pos.y);
    if (this.onGround && inp.jump) { this.vel.y = 5.4; this.onGround = false; }
    this.vel.y -= 11 * dt;
    this.pos.y += this.vel.y * dt;
    if (this.pos.y <= gy) {
      if (!this.onGround && this.vel.y < -6) Audio2.land();
      if (this.vel.y < -14) this.hurt((-this.vel.y - 14) * 5, null);
      this.pos.y = gy; this.vel.y = 0; this.onGround = true;
    } else if (this.onGround && this.pos.y - gy < 0.6 && this.vel.y <= 0) { this.pos.y = gy; this.vel.y = 0; }
    else this.onGround = false;
    this.speedNow = Math.hypot(this.vel.x, this.vel.z);
    this.moveAmt = clamp(this.speedNow / 5, 0, 1);
    // jalasammud ja kõikumine
    if (this.onGround && this.speedNow > 0.5) {
      this.bobT += dt * this.speedNow * 1.75;
      if (Math.floor(this.bobT / Math.PI) !== this.lastStep) { this.lastStep = Math.floor(this.bobT / Math.PI); Audio2.step(!Base.isInside(this.pos.x, this.pos.z)); }
    }
    // relv
    this.updateWeapon(dt, inp);
    // tegevus
    this.updateInteract(dt, inp);
    // ladustamine baasis
    const inside = Base.isInside(this.pos.x, this.pos.z);
    if (inside && (Inv.count('kris') || Inv.count('scrap') || Inv.count('meat') || Inv.count('stones'))) this.deposit();
    if (inside && !this.wasInside) G.flags.visitedInside = true;
    this.wasInside = inside;
    Audio2.setListener(this.pos.x, this.pos.z, this.yaw);
  },

  deposit() {
    const parts = Inv.depositResources();
    Audio2.pickup();
    UI.toast(parts.join(' · ') + ' to storage');
    if (G.flags.stonesHome) Game.stonesHome();
  },

  // ---------- relv ----------
  updateWeapon(dt, inp) {
    const st = weaponStats(this.weapon);
    if (this.fireCool > 0) this.fireCool -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 6);
    this.kick = Math.max(0, this.kick - dt * 8);
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) { this.mag[this.weapon] = Math.min(st.mag, this.mag[this.weapon] + (this.reloadAmt || 0)); this.reloadAmt = 0; }
    }
    if (inp.swap && this.reloadT <= 0 && Inv.swap()) {
      this.weapon = Inv.curWeapon(); this.fireCool = 0.35; this.swapT = 0.4; Audio2.reload();
    }
    if (inp.reload && this.reloadT <= 0 && this.mag[this.weapon] < st.mag) this.startReload();
    if (this.mag[this.weapon] === undefined) this.mag[this.weapon] = 0;
    const trig = inp.fire && !(st.semi && this._held);
    this._held = inp.fire;
    if (trig && this.fireCool <= 0 && this.reloadT <= 0 && G.mode === 'play') {
      if (this.mag[this.weapon] > 0) this.shoot(st, inp);
      else if (!this.startReload()) { this.fireCool = 0.5; Audio2.deny(); }
    }
  },
  startReload() {
    const st = weaponStats(this.weapon), ammo = Inv.ammoFor(this.weapon);
    const need = st.mag - this.mag[this.weapon]; if (need <= 0) return false;
    const got = Inv.take(ammo, need);
    if (!got) { if (!this.noAmmoT || G.time.total - this.noAmmoT > 2) { UI.toast(ITEMS[ammo].name + ' has run out. Take some from storage, buy or craft it in the workshop.'); this.noAmmoT = G.time.total; } return false; }
    this.reloadAmt = got; this.reloadT = st.reload * Inv.reloadMul(); Audio2.reload(); return true;
  },
  eye() { return { x: this.pos.x, y: this.pos.y + this.eyeH + Math.sin(this.bobT * 2) * 0.035 * this.moveAmt, z: this.pos.z }; },
  shoot(st, inp) {
    this.fireCool = st.rate;
    this.mag[this.weapon]--;
    if (st.launcher) {   // granaadiheitja: kaarega lendav mürsk, plahvatab kokkupõrkel
      const e = this.eye(), cp = Math.cos(this.pitch), sp = 34;
      const dx = Math.sin(this.yaw) * cp, dy = Math.sin(this.pitch) + 0.06, dz = Math.cos(this.yaw) * cp;
      const mz = M4.point(this.vm, 0, 0.06, 0.45, {});
      Ents.projs.push({ x: mz.x, y: mz.y, z: mz.z, vx: dx * sp, vy: dy * sp, vz: dz * sp, g: 9, life: 4, dmg: st.dmg, splash: 6, owner: this, kind: 'grenade', r: 0.1, delay: 0 });
      FX.muzzle(mz.x, mz.y, mz.z, dx, dy, dz, false); Audio2.shoot('shotgun');
      this.recoil = Math.min(1.5, this.recoil + st.recoil); this.kick = st.kick; this.pitch = Math.min(1.45, this.pitch + 0.04);
      Ents.noise(this.pos.x, this.pos.z, 50, 'shot');
      return;
    }
    const n = st.pellets || 1;
    for (let k = 0; k < n; k++) this.shootRay(st, inp, k === 0, k === n - 1);
  },
  shootRay(st, inp, first, last) {
    const e = this.eye();
    const cp = Math.cos(this.pitch);
    let dx = Math.sin(this.yaw) * cp, dy = Math.sin(this.pitch), dz = Math.cos(this.yaw) * cp;
    const ads = this.adsT || 0;
    const spr = (st.moveSpread ? st.spread * (1 + (1 - ads) * 40) : st.spread) * (1 + this.moveAmt * 1.5 * (1 - ads * 0.6) * (st.moveSpread || 1) + (this.onGround ? 0 : 2)) * (1 + this.recoil * 0.6 * (1 - ads * 0.5)) * (1 - ads * 0.72);
    dx += rand(-spr, spr); dy += rand(-spr, spr); dz += rand(-spr, spr);
    let l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
    // puutetugi: sihtimisabi
    if (inp.assist) {
      let best = null, bc = Math.cos(4.5 * DEG);
      for (const t of Ents.list) {
        if (!t.alive || t === this || Ents.friendly(t, this) || t.kind === 'goat' && t.state !== 'charge' && !inp.assistAll) continue;
        if (t.kind === 'jelly') continue;
        for (const s of t.spheres) {
          const vx = s[0] - e.x, vy = s[1] - e.y, vz = s[2] - e.z, d = Math.hypot(vx, vy, vz);
          if (d > st.range || d < 1) continue;
          const c = (vx * dx + vy * dy + vz * dz) / d;
          if (c > bc) { bc = c; best = { x: vx / d, y: vy / d, z: vz / d }; }
        }
      }
      if (best) { dx = lerp(dx, best.x, 0.85); dy = lerp(dy, best.y, 0.85); dz = lerp(dz, best.z, 0.85); l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l; }
    }
    // maailm
    let wt = World.raycastTerrain(e.x, e.y, e.z, dx, dy, dz, st.range);
    let wkind = 'sand';
    const doorF = (c) => !c.door || (c.blocks && c.blocks(this)); doorF.hitDoors = true;
    const hc = World.raycastCols(e.x, e.y, e.z, dx, dy, dz, wt >= 0 ? wt : st.range, doorF);
    if (hc && hc.col.hurt) { hc.col.hurt(st.dmg, this); UI.hitMarker && UI.hitMarker(false); }
    if (hc) { wt = hc.t; wkind = hc.col.kind === 'rock' ? 'sand' : 'metal'; }
    if (wt < 0) wt = st.range;
    // olemid
    let endT = wt, hitAny = false;
    if (st.pierce) {
      const hits = [];
      for (const t of Ents.list) {
        if (!t.alive || t === this || Ents.friendly(t, this)) continue;
        let tb = -1, mb = 1, ib = -1;
        for (let i = 0; i < t.spheres.length; i++) {
          const s = t.spheres[i];
          const fx = e.x - s[0], fy = e.y - s[1], fz = e.z - s[2];
          const b = fx * dx + fy * dy + fz * dz, c = fx * fx + fy * fy + fz * fz - s[3] * s[3];
          const disc = b * b - c; if (disc < 0) continue;
          const tt = -b - Math.sqrt(disc);
          if (tt > 0 && tt < wt && (tb < 0 || tt < tb)) { tb = tt; mb = s[4]; ib = i; }
        }
        if (tb >= 0) hits.push({ e: t, t: tb, mult: mb, idx: ib });
      }
      hits.sort((a, b) => a.t - b.t);
      for (const h of hits.slice(0, 6)) { this.applyHit(h, st, e, dx, dy, dz); hitAny = true; }
    } else {
      const hr = Ents.raycast(e.x, e.y, e.z, dx, dy, dz, wt, 'player', null);
      if (hr) { this.applyHit(hr, st, e, dx, dy, dz); hitAny = true; endT = hr.t; }
    }
    if (!hitAny || st.pierce) {
      const hx = e.x + dx * wt, hy = e.y + dy * wt, hz = e.z + dz * wt;
      if (wt < st.range - 1) FX.impact(hx, hy, hz, wkind);
    }
    // efektid
    const mz = M4.point(this.vm, 0, 0.04, 0.64, {});
    const ex = e.x + dx * endT, ey = e.y + dy * endT, ez = e.z + dz * endT;
    if (st.pierce) FX.rail(mz.x, mz.y, mz.z, e.x + dx * wt, e.y + dy * wt, e.z + dz * wt);
    else if (st.plasma) { FX.rail(mz.x, mz.y, mz.z, ex, ey, ez); GFX.addLight && GFX.addLight(mz.x, mz.y, mz.z, 4, 0.5, 0.85, 1.0, 1.2); }
    else if (first || Math.random() < 0.35) FX.tracer(mz.x, mz.y, mz.z, ex, ey, ez);
    if (!last) return;
    FX.muzzle(mz.x, mz.y, mz.z, dx, dy, dz, st.pierce);
    Audio2.shoot(st.snd || (st.pierce ? 'rail' : 'rifle'));
    this.recoil = Math.min(1.5, this.recoil + (st.recoil !== undefined ? st.recoil : st.pierce ? 1.2 : 0.35));
    this.kick = st.kick !== undefined ? st.kick : st.pierce ? 1 : 0.5;
    this.pitch = Math.min(1.45, this.pitch + (st.pierce ? 0.035 : st.pellets ? 0.03 : 0.006) * (1 - (this.adsT || 0) * 0.4));
    if (st.pellets) UI.shake && UI.shake(0.25);
    Ents.noise(this.pos.x, this.pos.z, st.pierce ? 70 : 45, 'shot');
  },
  applyHit(hr, st, e, dx, dy, dz) {
    const t = hr.e;
    let dmg = st.dmg * hr.mult;
    const hx = e.x + dx * hr.t, hy = e.y + dy * hr.t, hz = e.z + dz * hr.t;
    if (t.kind === 'boss') { Boss.hit(t, dmg, this, hr.idx, hx, hy, hz); return; }
    Ents.damage(t, dmg, this);
    FX.impact(hx, hy, hz, t.kind === 'human' ? 'metal' : t.kind === 'crab' ? 'crystal' : 'flesh');
    if (t.kind === 'human') FX.goo(hx, hy, hz, [0.5, 0.08, 0.06], 4);
    UI.hitMarker(!t.alive);
    Audio2.hitMarker();
  },

  // ---------- haavata / surm ----------
  hurt(amt, src) {
    if (this.dead || G.mode !== 'play' && G.mode !== 'build') return;
    if (G.mode === 'build') return;
    amt *= Inv.dmgMul();
    if (this.vehicle && !this.vehicle.dead) { this.vehicle.hp -= amt * 0.55; this.vehicle.hurtT = 0.25; amt *= this.seat === 1 ? 0.6 : 0.4; }   // sõiduk võtab osa löögist
    this.hp -= amt;
    this.hurtT = 0.4; this.lastHurt = 0;
    Audio2.hurt();
    let ang = null;
    if (src && src.pos) ang = Math.atan2(src.pos.x - this.pos.x, src.pos.z - this.pos.z) - this.yaw;
    UI.damage(amt, ang);
    if (this.hp <= 0) this.die();
  },
  die() {
    this.dead = true; this.alive = false; this.deadT = 0; this.hp = 0;
    G.stats.deaths++;
    Inv.dropResourcesBag(this.pos.x, this.pos.z);
    UI.banner('You collapsed', 'The rescue team brings you back to the base', 'danger');
  },
  respawn() {
    let spot = null;
    const med = Base.objsOfType('ravila')[0];
    const beds = Base.objsOfType('voodi');
    const o = med || beds[0];
    if (o) { const u = Base.useCells(o)[0]; if (u) spot = Base.cellCenter(u[0], u[1]); }
    if (!spot) spot = { x: -1, z: 1 };
    const bill = Math.min(G.res.cr, 50);
    G.res.cr -= bill;
    this.reset(spot.x, spot.z, this.yaw);
    this.hp = this.maxHp * (med ? 1 : 0.6);
    UI.msg('Rescue team bill: ' + bill + ' ₵. Your things stayed where you fell.', 'warn');
    G.mode = 'play';
  },

  // ---------- tegevused ----------
  updateInteract(dt, inp) {
    this.interScan -= dt;
    if (this.interScan <= 0) { this.interScan = 0.12; const prev = this.inter; this.inter = this.findInteract(); if (!prev || !this.inter || prev.key !== this.inter.key) this.interT = 0; }
    const it = this.inter;
    if (!it) { this.interT = 0; return; }
    if (it.disabled) { this.interT = 0; return; }
    if (it.hold) {
      if (inp.actHeld) {
        this.interT += dt;
        if (it.tick) it.tick(dt);
        if (this.interT >= it.hold) { this.interT = 0; it.act(); this.interScan = 0; }
      } else this.interT = Math.max(0, this.interT - dt * 2);
    } else if (inp.act) { it.act(); this.interScan = 0; }
  },
  findInteract() {
    const px = this.pos.x, pz = this.pos.z;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    let best = null, bs = 1e9;
    const consider = (it, x, z, maxD) => {
      const dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
      if (d > maxD) return;
      const facing = d > 0.3 ? (dx * fx + dz * fz) / d : 1;
      if (facing < -0.2 && d > 1.2) return;
      const s = d - facing * 1.5;
      if (s < bs) { bs = s; best = it; }
    };
    // baasiobjektid
    for (const o of Base.objs.values()) {
      const qx = clamp(px, Base.X0 + o.i * Base.CS, Base.X0 + (o.i + o.w) * Base.CS), qz = clamp(pz, Base.Z0 + o.j * Base.CS, Base.Z0 + (o.j + o.h) * Base.CS);
      const d = Math.hypot(qx - px, qz - pz);
      if (d > 1.9) continue;
      const it = objInteraction(o);
      if (it) { it.key = 'o' + o.id + it.label; consider(it, o.cx, o.cz, 4.5); }
    }
    // vrakid
    for (const w of World.wrecks) {
      if (w.gone) continue;
      const d = Math.hypot(w.x - px, w.z - pz);
      if (d > w.rad + 2.6) continue;
      w.known = true;
      const it = w.scrap > 0
        ? { key: 'w' + w.id, label: 'Collect scrap', sub: w.name + ' · left ' + w.scrap, hold: 1.4, act: () => salvage(w), tick: () => FX.repair(w.x + rand(-1, 1), w.y + 1.2, w.z + rand(-1, 1)) }
        : { key: 'w' + w.id + 'e', label: w.name, sub: 'Picked clean', disabled: true };
      consider(it, w.x, w.z, w.rad + 2.6);
    }
    // rauamaagi kivid (vajavad maagipuuri)
    for (const o of World.ores) {
      if (o.gone || o.amount <= 0) continue;
      const d = Math.hypot(o.x - px, o.z - pz);
      if (d > o.rad + 2.4) continue;
      o.known = true;
      const it = G.flags.drill
        ? { key: 'ore' + o.id, label: 'Drill iron ore', sub: 'left ' + o.amount + ' · backpack fits ' + Inv.room('ore'), hold: 1.6, act: () => mineOre(o), tick: () => { FX.sparks(o.x + rand(-0.6, 0.6), o.y + 0.8, o.z + rand(-0.6, 0.6), [1, 0.6, 0.3], 2, 2); } }
        : { key: 'ore' + o.id + 'n', label: 'Iron ore rock', sub: 'Needs an ore drill · build the Ore works and buy one there', disabled: true };
      consider(it, o.x, o.z, o.rad + 2.4);
    }
    // kristallid
    const cl = Comets.nearestCluster(px, pz, 3.4);
    if (cl) consider({ key: 'k' + cl.id, label: 'Collect diamonds', sub: cl.amount + ' left · backpack fits ' + Inv.room('kris'), hold: 0.45, act: () => Comets.mine(cl, this), tick: () => FX.beam(this.pos.x, this.pos.y + 1.2, this.pos.z, cl.x, cl.y + 0.6, cl.z) }, cl.x, cl.z, 3.4);
    // meeskonnaliikmed: kutsu kaasa / saada tagasi
    for (const e of Ents.list) {
      if (!e.alive || !e.crew || e.team !== 'crew') continue;
      if (Math.abs(e.pos.x - px) > 3 || Math.abs(e.pos.z - pz) > 3) continue;
      const f = e.crew.follow;
      consider({ key: 'f' + e.id + (f ? 'y' : 'n'), label: f ? 'Send back to work' : 'Ask to follow', sub: e.crew.name + ' · ' + (e.crew.act || ''), act: () => Crew.setFollow(e, !f) }, e.pos.x, e.pos.z, 2.6);
    }
    // võõra baasi lukus uks: häki (hoia E 30 s) või tulista katki; oma lõhutud uks: paranda
    for (const b of Bases.list) {
      if (!b.doors || Math.abs(px - b.OX) > 60 || Math.abs(pz - b.OZ) > 60) continue;
      for (const d of b.doors) {
        if (Math.abs(d.x - px) > 2.6 || Math.abs(d.z - pz) > 2.6) continue;
        if (b.OWNER !== 'crew' && b.doorBlocks(d.st, this)) consider({ key: 'hk' + d.key, label: 'Hack the door lock', sub: 'Hold E for 30 s (or shoot the door: ' + Math.ceil(d.st.hp) + ' hp)', hold: 30, act: () => { d.st.hack.crew = true; UI.toast('Lock hacked – the door opens for you and your crew'); Audio2.door(d.x, d.z); }, tick: () => { if (Math.random() < 0.15) FX.sparks(d.x, b.OY + 1.2, d.z, [0.4, 0.8, 1], 2, 1.5); } }, d.x, d.z, 2.6);
        else if (b.OWNER === 'crew' && (d.st.broken || d.st.hp < b.DOOR_HP || Object.keys(d.st.hack).length)) consider({ key: 'rd' + d.key, label: 'Repair the door', sub: (d.st.broken ? 'smashed' : Object.keys(d.st.hack).length ? 'lock hacked' : Math.ceil(d.st.hp) + ' hp') + ' · 5 scrap', hold: 2.5, act: () => { if (G.res.scrap < 5) { UI.toast('Not enough scrap'); Audio2.deny(); return; } G.res.scrap -= 5; b.repairDoor(d); Audio2.repair(); UI.toast('Door repaired and locked'); }, tick: () => FX.repair(d.x + rand(-0.5, 0.5), b.OY + 1.2, d.z + rand(-0.5, 0.5)) }, d.x, d.z, 2.6);
      }
    }
    // korjused
    for (const e of Ents.list) {
      if (e.kind === 'alien' && !e.alive && e.harvestable && Math.abs(e.pos.x - px) < 3.5 && Math.abs(e.pos.z - pz) < 3.5) consider({ key: 'a' + e.id, label: 'Harvest acid glands', sub: e.acid + ' glands', hold: 1.6, act: () => harvestAcid(e), tick: () => { if (Math.random() < 0.3) FX.goo(e.pos.x, e.pos.y + 0.6, e.pos.z, [0.55, 1.0, 0.2], 1); } }, e.pos.x, e.pos.z, 3);
      if (e.alive || !e.butcherable) continue;
      if (Math.abs(e.pos.x - px) > 3 || Math.abs(e.pos.z - pz) > 3) continue;
      consider({ key: 'c' + e.id, label: 'Butcher meat', sub: e.meat + ' pieces', hold: 1.4, act: () => butcher(e), tick: () => { if (Math.random() < 0.3) FX.goo(e.pos.x, e.pos.y + 0.4, e.pos.z, [0.5, 0.15, 0.12], 1); } }, e.pos.x, e.pos.z, 2.6);
    }
    // korjatavad
    for (const p of Ents.pickups) {
      if (p.gone) continue;
      if (!p.id) p.id = Math.floor(Math.random() * 1e9);
      consider({ key: 'p' + p.id, label: p.kind === 'stones' ? 'Take the heartstones' : 'Pick up bag', hold: p.kind === 'stones' ? 1.5 : 0.6, act: () => pickupBag(p) }, p.x, p.z, 2.4);
    }
    if (typeof Vehicles !== 'undefined') Vehicles.interactions(consider);
    return best;
  },

  // ---------- vaatemudel ----------
  drawViewmodel(dt) {
    const sc = document.getElementById('scope');
    if (this.dead || G.mode !== 'play' || this.vehicle) { this.adsT = 0; if (sc) sc.style.opacity = '0'; return; }
    this.adsT = lerp(this.adsT || 0, this.zoom && this.reloadT <= 0 ? 1 : 0, Math.min(1, dt * 12));
    // sihik: täisekraani optika, relvamudel peidetakse
    const so = clamp((this.adsT - 0.55) / 0.35, 0, 1);
    if (sc) { sc.style.opacity = so.toFixed(3); sc.classList.toggle('rail', this.weapon === 'rail'); sc.classList.toggle('sniper', this.weapon === 'sniper' || this.weapon === 'dmr'); }
    if (so > 0.97) return;
    const e = this.eye();
    const mv = this.moveAmt;
    this.swayX = lerp(this.swayX, Math.sin(this.bobT) * 0.012 * mv, Math.min(1, dt * 10));
    this.swayY = lerp(this.swayY, Math.abs(Math.cos(this.bobT)) * 0.014 * mv, Math.min(1, dt * 10));
    // laadimine faasidena: kallutus + langetus (salv välja), salve löök sisse (tõuge üles), lukk taha (tõmme), tagasi
    const rp = this.reloadT > 0 ? clamp(1 - this.reloadT / (weaponStats(this.weapon).reload * Inv.reloadMul()), 0, 1) : 0;
    const rl = this.reloadT > 0 ? Math.sin(rp * Math.PI) : 0;
    const bump = this.reloadT > 0 ? Math.exp(-Math.pow((rp - 0.6) / 0.045, 2)) : 0;
    const rack = this.reloadT > 0 ? Math.exp(-Math.pow((rp - 0.82) / 0.04, 2)) : 0;
    // relvavahetus: alla ja uuesti üles
    if (this.swapT > 0) this.swapT = Math.max(0, this.swapT - dt);
    const sw = this.swapT > 0 ? Math.sin((this.swapT / 0.4) * Math.PI) : 0;
    M4.compose(this.camM, e.x, e.y, e.z, this.yaw, -this.pitch, 0);
    const rail = this.weapon === 'rail';
    const rcl = Math.min(1, this.recoil);
    M4.child(this.vm, this.camM, -0.2 + this.swayX, -0.215 - this.swayY - rl * 0.14 + bump * 0.03 - sw * 0.3 - this.kick * 0.01, 0.52 - this.kick * 0.05 - rack * 0.06, 0.03 + rl * 0.45, -this.kick * 0.06 - rl * 0.4 + bump * 0.12 - sw * 0.7 - rcl * 0.015, -0.04 + rl * 0.25, 0.92, 0.92, 0.92);
    // realistlikud käed: mängija enda tegelane, silm kaamera kohal, relv IK-ga
    const look = G.look || (G.look = Look.player());
    const vs = this.vst || (this.vst = { type: 'male', tints: null, layers: [{ clip: 'idle', t: 0, w: 1 }], aim: 1, pitch: 0, headYaw: 0, pose: 'stand', gun: true, recoil: 0 });
    vs.type = look.type; vs.tints = Look.tints(look); vs.gear = Look.gearLvl(look); vs.layers[0].t = G.time.total * 0.6; vs.recoil = Math.min(1, this.kick);
    vs.aim = 1 - rl * 0.6;
    vs.narrow = GFX.S.w < GFX.S.h; vs.gunK = this.weapon;
    if (!this.vmBody) this.vmBody = M4.create();
    M4.child(this.vmG, this.camM, this.swayX, -this.swayY - rl * 0.12 + bump * 0.03 - sw * 0.28 - this.kick * 0.008, -this.kick * 0.03 - rack * 0.05, rl * 0.3, -this.kick * 0.04 - rl * 0.25 + bump * 0.1 - sw * 0.65, rl * 0.2 + rack * 0.08);
    const gw = Chars.drawFP(vs, this.vmG, this.vmBody, this.adsT * 0.85, { overlay: true, shadow: false });
    if (gw) { this.vm.set(gw); GFX.drawOverlay(rail ? MODELS.railFPS : (MODELS[this.weapon] && this.weapon !== 'rifle' ? MODELS[this.weapon] : MODELS.carbine), this.vm); }
    else {
      GFX.drawOverlay(rail ? MODELS.railFPS : MODELS.rifleFPS, this.vm);
      M4.child(this.vmArmR, this.vm, 0, -0.16, -0.1, 0.4, -0.1, 0);
      GFX.drawOverlay(MODELS.armFPS, this.vmArmR);
      M4.child(this.vmArmL, this.vm, 0.01, -0.095, 0.27, -0.75, -0.15, -0.2);
      GFX.drawOverlay(MODELS.armFPSL, this.vmArmL);
    }
    // otsmikulamp öösel
    if (GFX.env.night > 0.4 || Base.isInside(this.pos.x, this.pos.z) && !Base.power.lightsOn) {
      const cp = Math.cos(this.pitch);
      GFX.addLight(e.x + Math.sin(this.yaw) * cp * 3.5, e.y + Math.sin(this.pitch) * 3.5, e.z + Math.cos(this.yaw) * cp * 3.5, 14, 1.0, 0.92, 0.8, 1.1);
    }
  },
};

// ---------- objektide tegevused ----------
function objInteraction(o) {
  const d = OBJ[o.type];
  switch (o.type) {
    case 'tostuk':
      return Vehicles.liftInteraction(o);
    case 'kapp': case 'kohvimasin': case 'pesumasin': case 'ravikapp': case 'moonapress': case 'treipink': case 'uurimislaud': case 'raadiojaam': case 'piljard': case 'toovanker':
      return Gadgets.playerInteraction(o);
    case 'vanagen':
      if (o.broken) return { label: 'Repair the generator', sub: '25 scrap', hold: 2.6, cost: { s: 25 }, act: () => repairObj(o, 25, () => { G.flags.gen = true; Audio2.powerOn(); UI.msg('The generator coughed and started. The lights are back on!', 'good'); Objectives.check(); }), tick: () => FX.repair(o.cx, 1.4, o.cz) };
      return { label: 'Old generator', sub: Base.power.supply + ' ⚡ produced · ' + Base.power.demand + ' ⚡ used', disabled: true };
    case 'generaator':
      return { label: 'Generator', sub: '+6 ⚡', disabled: true };
    case 'terminal':
      if (o.broken) return { label: 'Repair the comms terminal', sub: '15 scrap', hold: 2.0, act: () => repairObj(o, 15, () => { G.flags.term = true; Audio2.radio(); UI.msg('The comms terminal is back. Market, hiring and the bank are now available.', 'good'); Econ.genCandidates(); Objectives.check(); }), tick: () => FX.repair(o.cx, 1.2, o.cz) };
      if (!Base.power.lightsOn) return { label: 'Comms terminal', sub: 'No power. Repair the generator.', disabled: true };
      return { label: 'Open terminal', sub: 'Market · hiring · bank', act: () => UI.openTerminal() };
    case 'voodi': case 'nari': {
      const night = Econ.isNight();
      const danger = Ents.list.some((e) => e.alive && (e.kind === 'stalker' && e.state !== 'buried' || e.kind === 'kiskja' || e.kind === 'human' && e.team !== 'crew') && Math.hypot(e.pos.x - Player.pos.x, e.pos.z - Player.pos.z) < 55);
      if (!night) return { label: d.name, sub: 'You can sleep at night', disabled: true };
      if (danger) return { label: d.name, sub: 'Enemies nearby, can\'t sleep', disabled: true };
      return { label: 'Sleep until morning', sub: 'The night passes', act: () => UI.sleep() };
    }
    case 'ravila':
      if (!o.on) return { label: 'Medical bay', sub: 'No power', disabled: true };
      if (Player.hp >= Player.maxHp) return { label: 'Medical bay', sub: 'You\'re healthy', disabled: true };
      return { label: 'Heal yourself', sub: '10 ₵', hold: 1.2, act: () => { if (G.res.cr < 10) { UI.toast('No money'); return; } G.res.cr -= 10; Player.hp = Player.maxHp; Audio2.pickup(); UI.toast('Wounds patched'); } };
    case 'pliit':
      if (!o.on) return { label: 'Stove', sub: 'No power', disabled: true };
      if (G.res.meat <= 0) return { label: 'Stove', sub: 'No raw meat', disabled: true };
      return { label: 'Cook food', sub: '1 meat → 2 meals', hold: 1.6, act: () => { G.res.meat--; G.res.food += 2; o.data.cooking = 3; Audio2.pickup(); UI.toast('+2 meals'); }, tick: () => FX.smoke(o.cx, 1.3, o.cz) };
    case 'vesi':
      if (!o.on) return { label: 'Water dispenser', sub: 'No power', disabled: true };
      return { label: 'Drink water', sub: '+5 health', act: () => { Player.hp = Math.min(Player.maxHp, Player.hp + 5); Audio2.pickup(); UI.toast('The water tastes of rust, but it\'s cold'); } };
    case 'dush':
      if (!o.on) return { label: 'Shower', sub: 'No power', disabled: true };
      return { label: 'Take a shower', sub: 'Desert dust washed off', hold: 2.2, act: () => { Player.hp = Math.min(Player.maxHp, Player.hp + 10); UI.toast('Fresh! Still sand crunching between my teeth.'); }, tick: () => { if (Math.random() < 0.4) FX.smoke(o.cx, 1.8, o.cz); } };
    case 'wc':
      return { label: 'Dry toilet', sub: 'Occupied? Knock first.', disabled: true };
    case 'teler': {
      if (!o.on) return { label: 'Old TV', sub: 'No power', disabled: true };
      const NEWS = ['News: the bank raised the colonists\' loan interest again.', 'Weather report: a dust storm is moving toward the Ochre desert.', 'Ad: “Krell-Varga — the future is ours!”', 'News: comet frequency is rising. Miners are cheering.', 'The series “Red Love” continues with episode 412.', 'Notice: the crew of the missing cargo shuttle has still not been found.'];
      return { label: 'Watch TV', sub: 'News from the home world', act: () => { o.data.watch = 20; UI.msg(pick(NEWS), 'info'); } };
    }
    case 'trenn':
      return { label: 'Train', sub: 'Hold', hold: 3, act: () => { UI.toast('Sweaty, but feeling stronger'); Player.hp = Math.min(Player.maxHp, Player.hp + 3); } };
    case 'kasvu':
      if (!o.on) return { label: 'Hydroponics', sub: 'No power — plants are wilting', disabled: true };
      return { label: 'Hydroponics', sub: 'Next harvest: ' + Math.max(0, Math.ceil((1 - (o.data.grow || 0)) * 100)) + '% to go', disabled: true };
    case 'torn': {
      const up = Player.pos.y > o.y + 4;
      return { label: up ? 'Climb down' : 'Climb the tower', sub: up ? 'Climb down the ladder' : 'View from 7 m up', hold: 0.8, act: () => {
        if (up) { const u = Base.useCells(o)[0]; const cc = u ? Base.cellCenter(u[0], u[1]) : { x: o.cx + 3, z: o.cz }; Player.reset(cc.x, cc.z, Player.yaw); }
        else { Player.reset(o.cx, o.cz, Player.yaw); Player.pos.y = Ents.groundY(o.cx, o.cz); }
        Audio2.step(false); } };
    }
    case 'varav': case 'varav3': case 'suurvarav':
      return { label: OBJ[o.type].name, sub: Waves.active() ? 'Locked — swarm attacking' : 'Opens by itself when you approach', disabled: true };
    case 'kmpesa':
      return { label: 'MG nest', sub: 'Crew mans it during a swarm · in storage ' + (G.stash.ammo_r || 0) + ' rounds', disabled: true };
    case 'kaardilaud': {
      const wi = Waves.info(), cmd = Waves.hasCommand();
      const nxt = wi && !wi.none && !wi.done ? (wi.warned ? 'Swarm on its way: ' + wi.small + ' darters, ' + wi.big + ' rammers' : 'A swarm is coming tonight') : 'No swarm tonight';
      const sg = Base.signature();
      return { label: 'Map table', sub: (cmd ? nxt : 'Needs a radar and a powered room') + ' · threat level ' + sg.tier + ' (noise ' + sg.noise + ', light ' + sg.light + ', items ' + sg.count + ')', disabled: true };
    }
    case 'relvakapp':
      return { label: 'Open gun locker', sub: 'Weapons and ammo from storage', act: () => UI.openInv() };
    case 'jukebox':
      if (!o.on) return { label: 'Jukebox', sub: 'No power', disabled: true };
      return { label: G.flags.music ? 'Stop music' : 'Play music', act: () => { G.flags.music = !G.flags.music; Audio2.setMusic(G.flags.music); } };
    case 'maagitehas': {
      if (!G.flags.drill) {
        const can = G.res.cr >= 400;
        return { label: 'Buy an ore drill', sub: '400 ₵ · you and your miners can then mine iron ore rocks' + (can ? '' : ' · not enough money'), disabled: !can, hold: 1.0,
          act: () => { if (G.res.cr < 400) return; G.res.cr -= 400; G.flags.drill = true; Audio2.cash(); UI.banner('Ore drill bought', 'Iron ore rocks in the desert can now be mined. Miners will also go drilling.'); Objectives.check(); } };
      }
      if (!o.on) return { label: 'Ore works', sub: 'No power — can\'t smelt', disabled: true };
      if (!(G.res.ore > 0)) return { label: 'Ore works', sub: 'No iron ore in storage · mine the reddish rocks in the desert', disabled: true };
      return { label: 'Smelt iron ore', sub: G.res.ore + ' ore in storage · 1 ore = 3 steel scrap', hold: 2.4,
        act: () => { const n = Math.min(10, G.res.ore); G.res.ore -= n; const got = Math.round(n * 3 * (Crew.roomJobOf(o) === 'Workshop' ? 1.2 : 1)); G.res.scrap += got; UI.toast('+' + got + ' steel scrap from ' + n + ' ore'); Audio2.repair(); },
        tick: () => FX.sparks(o.cx + rand(-0.3, 0.3), 0.9, o.cz + rand(-0.3, 0.3), [1, 0.55, 0.2], 2, 2.5) };
    }
    case 'toolaud':
      return { label: 'Workshop', sub: 'Weapon upgrades', act: () => UI.openTerminal('tookoda') };
    case 'lihvija':
      if (!o.on) return { label: 'Diamond polisher', sub: 'No power', disabled: true };
      if (G.res.kris <= 0) return { label: 'Diamond polisher', sub: 'No raw diamonds', disabled: true };
      return { label: 'Polish diamonds', sub: 'up to 5 at a time' + (Crew.roomJobOf(o) === 'Workshop' ? ' · workshop +20%' : ''), hold: 2.2, act: () => { const n = Math.min(5, G.res.kris); G.res.kris -= n; const got = Crew.roomJobOf(o) === 'Workshop' ? Math.round(n * 1.2) : n; G.res.lihv += got; UI.toast('+' + got + ' polished diamonds'); Audio2.crystal(); }, tick: () => FX.beam(o.cx, 1.8, o.cz, o.cx + rand(-0.5, 0.5), 1.0, o.cz) };
    case 'hoidla':
      return { label: 'Storage', sub: G.res.kris + ' raw diamonds · ' + G.res.lihv + ' polished · ' + G.res.scrap + ' scrap · ' + G.res.meat + ' meat · ' + G.res.food + ' food', disabled: true };
    case 'skanner':
      if (G.scan.found) return { label: 'Deep scanner', sub: 'Nest found', disabled: true };
      return { label: 'Deep scanner', sub: o.on ? 'Search ' + Math.floor(G.scan.p) + ' %' : 'No power', disabled: true };
    case 'kahur':
      if (o.hp < o.maxHp) return { label: 'Repair cannon', sub: '5 scrap', hold: 1.6, act: () => repairObj(o, 5, null, true), tick: () => FX.repair(o.cx, 1.6, o.cz) };
      return { label: 'Autocannon', sub: o.on ? 'On guard' : 'No power', disabled: true };
    case 'myyrturel':
      if (o.hp < o.maxHp) return { label: 'Repair wall turret', sub: '6 scrap', hold: 1.8, act: () => repairObj(o, 6, null, true), tick: () => FX.repair(o.cx, 3.4, o.cz) };
      return { label: 'Wall turret', sub: o.on ? 'On guard · 46 m' : 'No power', disabled: true };
    case 'radar':
      return { label: 'Radar mast', sub: o.on ? 'Working' : 'No power', disabled: true };
    default:
      return null;
  }
}
function repairObj(o, cost, after, partial) {
  if (G.res.scrap < cost) { UI.toast('Need ' + cost + ' scrap (in storage ' + G.res.scrap + ')'); Audio2.deny(); return; }
  G.res.scrap -= cost;
  if (partial) o.hp = o.maxHp; else { o.broken = false; o.hp = o.maxHp; }
  Audio2.repair();
  Base.updatePower(!Econ.isNight());
  if (after) after();
}
function salvage(w) {
  const room = Inv.room('scrap');
  if (room <= 0) { UI.toast('Backpack is full. Take your things to the base.'); Audio2.deny(); return; }
  const n = Inv.add('scrap', Math.min(8, w.scrap, room));
  w.scrap -= n;
  Audio2.pickup(); UI.toast('+' + n + ' scrap into the backpack');
  G.flags.salvaged = true; Objectives.check();
}
function mineOre(o) {
  const room = Inv.room('ore');
  if (room <= 0) { UI.toast('Backpack is full. Take your things to the base.'); Audio2.deny(); return; }
  const n = Inv.add('ore', Math.min(5, o.amount, room));
  o.amount -= n;
  Audio2.pickup(); UI.toast('+' + n + ' iron ore into the backpack');
  FX.dust(o.x, o.y + 0.6, o.z, 4, 1.2);
}
function harvestAcid(e) {
  const room = Inv.room('acid');
  if (room <= 0) { UI.toast('Backpack is full.'); Audio2.deny(); return; }
  const n = Inv.add('acid', Aliens.harvest(e, Math.min(e.acid, room)));
  G.flags.acid = true; Audio2.pickup(); UI.toast('+' + n + ' acid glands into the backpack – sell them at the terminal');
}
function butcher(e) {
  const room = Inv.room('meat');
  if (room <= 0) { UI.toast('Backpack is full.'); Audio2.deny(); return; }
  const n = Inv.add('meat', Math.min(e.meat, room));
  e.meat -= n; G.stats.meat += n;
  if (e.meat <= 0) { e.butcherable = false; e.remove = true; }
  Audio2.pickup(); UI.toast('+' + n + ' meat into the backpack');
  G.flags.hunted = true; Objectives.check();
}
function pickupBag(p) { Inv.pickBag(p); }
