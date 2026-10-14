// ============================================================
//  MUDELID: kõik koodist ehitatud madala polügooniarvuga mudelid
// ============================================================
const PAL = {
  bone: [0.80, 0.74, 0.62], boneDark: [0.55, 0.50, 0.42],
  metal: [0.46, 0.46, 0.48], metalDark: [0.22, 0.22, 0.24], metalLight: [0.66, 0.66, 0.68],
  rust: [0.52, 0.30, 0.20], hazard: [0.86, 0.64, 0.14], black: [0.08, 0.08, 0.09],
  teal: [0.22, 0.58, 0.56], amber: [1.0, 0.62, 0.22], crystal: [0.55, 0.85, 1.0], crystal2: [0.78, 0.55, 1.0],
  wood: [0.45, 0.30, 0.20], cloth: [0.42, 0.44, 0.38], red: [0.75, 0.16, 0.12],
};
const TEAM_PAL = {
  crew: { suit: [0.78, 0.72, 0.60], dark: [0.30, 0.28, 0.25], accent: [0.22, 0.56, 0.55], visor: [1.0, 0.62, 0.25] },
  player: { suit: [0.70, 0.52, 0.34], dark: [0.25, 0.20, 0.17], accent: [0.80, 0.36, 0.16], visor: [1.0, 0.62, 0.25] },
  krell: { suit: [0.56, 0.14, 0.10], dark: [0.12, 0.10, 0.10], accent: [0.85, 0.72, 0.30], visor: [1.0, 0.2, 0.15] },
  klann: { suit: [0.30, 0.24, 0.36], dark: [0.14, 0.12, 0.15], accent: [0.78, 0.74, 0.66], visor: [0.6, 1.0, 0.4] },
};
const MODELS = {};

function buildModels() {
  const M = MODELS;
  if (typeof Kiskja !== 'undefined') Kiskja.init();
  if (typeof Prey !== 'undefined') Prey.init();
  // ---------- inimesed ----------
  M.human = {};
  for (const team of Object.keys(TEAM_PAL)) {
    const p = TEAM_PAL[team];
    const parts = {};
    let b = new MB();
    // keha: puusad 0.95 kuni rind 1.55 (lokaalne alus puusades)
    b.color(p.dark).boxB(0, -0.08, 0, 0.42, 0.18, 0.26); // vöö
    b.color(p.suit).boxB(0, 0.08, 0, 0.48, 0.34, 0.28);
    b.color(p.suit).boxB(0, 0.40, 0, 0.56, 0.22, 0.32); // rind
    b.color(p.accent).boxB(0, 0.25, 0.145, 0.30, 0.16, 0.03); // rinnaplaat
    b.color(p.dark).boxB(0, 0.10, -0.24, 0.40, 0.48, 0.18); // seljakott
    b.color(PAL.metal, MAT.RUST).cyl(-0.12, 0.08, -0.33, 0.07, 0.07, 0.5, 6);
    b.color(PAL.metal, MAT.RUST).cyl(0.12, 0.08, -0.33, 0.07, 0.07, 0.5, 6);
    b.color(p.accent).boxB(-0.31, 0.44, 0, 0.14, 0.16, 0.28); // õlakud
    b.color(p.accent).boxB(0.31, 0.44, 0, 0.14, 0.16, 0.28);
    parts.body = b.build();
    b = new MB();
    b.color(p.dark).cyl(0, -0.02, 0, 0.08, 0.08, 0.08, 6);
    b.color(p.suit).sphere(0, 0.16, 0, 0.17, 8, 6);
    b.color(p.visor, MAT.GLOW).boxB(0, 0.11, 0.12, 0.22, 0.09, 0.08);
    b.color(p.dark).boxB(0, 0.07, 0.13, 0.12, 0.04, 0.06);
    b.color(p.dark).cyl(0.13, 0.2, -0.04, 0.012, 0.012, 0.22, 4); // antenn
    parts.head = b.build();
    b = new MB(); // käsi (õlast alla)
    b.color(p.suit).boxB(0, -0.36, 0, 0.13, 0.36, 0.14);
    b.color(p.dark).boxB(0, -0.62, 0, 0.12, 0.27, 0.13);
    b.color(p.dark).boxB(0, -0.70, 0.02, 0.11, 0.1, 0.12);
    parts.arm = b.build();
    b = new MB(); // jalg (puusast alla)
    b.color(p.suit).boxB(0, -0.48, 0, 0.17, 0.48, 0.19);
    b.color(p.dark).boxB(0, -0.86, 0, 0.16, 0.38, 0.18);
    b.color(p.dark).boxB(0, -0.95, 0.05, 0.19, 0.12, 0.3);
    parts.leg = b.build();
    M.human[team] = parts;
  }
  // relvad
  let b = new MB();
  b.color(PAL.metalDark).boxB(0, -0.05, 0.05, 0.07, 0.1, 0.62);
  b.color(PAL.wood).boxB(0, -0.1, -0.32, 0.06, 0.13, 0.26);
  b.color(PAL.metal, MAT.RUST).boxB(0, -0.16, 0.12, 0.05, 0.14, 0.08);
  b.color(PAL.metalDark).cyl(0, 0, 0.36, 0.022, 0.022, 0.0001, 6, false); // (siht)
  b.push().tf(0, -0.01, 0.35, 0, Math.PI / 2, 0).color(PAL.metalDark).cyl(0, 0, 0, 0.02, 0.02, 0.32, 6).pop();
  M.rifleNPC = b.build();

  // ---------- FPS relvamudelid (vaatemudel) ----------
  // lokaalne: +z ette, +y üles; päästik umbes nullpunktis
  const GM = [0.27, 0.28, 0.30], GM2 = [0.17, 0.17, 0.19], HG = [0.56, 0.33, 0.19];
  const gloveC = [0.16, 0.14, 0.13], sleeveC = TEAM_PAL.player.suit, cuffC = TEAM_PAL.player.accent;
  b = new MB(); b.jit = 0.02;
  b.color(GM).boxB(0, -0.055, 0.02, 0.066, 0.1, 0.34); // lukukoda
  b.color(GM2).boxB(0, 0.045, 0.03, 0.036, 0.022, 0.32); // ülemine siin
  for (let i = 0; i < 7; i++) b.color(GM).boxB(0, 0.067, -0.1 + i * 0.045, 0.04, 0.008, 0.02);
  b.color(HG, MAT.RUST).boxB(0, -0.05, 0.3, 0.074, 0.08, 0.24); // eesmine käepide
  for (let i = 0; i < 4; i++) b.color(GM2).boxB(0, -0.03, 0.22 + i * 0.05, 0.078, 0.012, 0.022);
  b.push().tf(0, -0.012, 0.42, 0, Math.PI / 2, 0).color(GM2).cyl(0, 0, 0, 0.016, 0.016, 0.22, 8).pop(); // raud
  b.push().tf(0, -0.012, 0.6, 0, Math.PI / 2, 0).color(GM2).cyl(0, 0, 0, 0.026, 0.026, 0.07, 8).pop(); // summuti
  b.push().tf(0, -0.15, 0.07, 0, 0.22, 0).color(GM2).boxB(0, 0, 0, 0.048, 0.16, 0.07).pop(); // salv
  b.push().tf(0, -0.15, -0.1, 0, -0.32, 0).color(GM2).boxB(0, 0, 0, 0.044, 0.13, 0.055).pop(); // püstolkäepide
  b.color(GM2).boxB(0, -0.11, -0.05, 0.03, 0.012, 0.09); // päästikukaitse
  b.color(GM).boxB(0, -0.06, -0.2, 0.05, 0.09, 0.06); // lühike kaba
  b.color(GM2).boxB(0, 0.07, 0.01, 0.05, 0.05, 0.075); // kollimaator
  b.color([1.0, 0.35, 0.18], MAT.GLOW).boxB(0, 0.08, 0.05, 0.026, 0.024, 0.004);
  b.color(PAL.amber, MAT.GLOW).boxB(0.035, -0.04, -0.03, 0.004, 0.022, 0.05); // laskemoona näidik
  b.color(PAL.hazard).boxB(-0.034, -0.07, 0.12, 0.004, 0.02, 0.06);
  M.rifleFPS = b.build();
  b = new MB(); b.jit = 0.02; // rööpkahur
  b.color([0.22, 0.24, 0.27]).boxB(0, -0.06, 0.02, 0.09, 0.12, 0.38);
  b.color(GM2).boxB(0.055, -0.03, 0.34, 0.022, 0.06, 0.48).boxB(-0.055, -0.03, 0.34, 0.022, 0.06, 0.48);
  b.color(PAL.crystal, MAT.GLOW).boxB(0, -0.03, 0.34, 0.05, 0.016, 0.46);
  for (let i = 0; i < 5; i++) b.color(GM2).boxB(0, -0.03 + 0.04, 0.16 + i * 0.09, 0.13, 0.014, 0.022);
  b.color(PAL.crystal2, MAT.GLOW).boxB(0, 0.025, -0.08, 0.04, 0.03, 0.12);
  b.push().tf(0, -0.16, -0.08, 0, -0.32, 0).color(GM2).boxB(0, 0, 0, 0.046, 0.13, 0.055).pop();
  b.color(GM2).boxB(0, -0.15, 0.1, 0.06, 0.12, 0.09);
  b.color(GM).boxB(0, -0.06, -0.2, 0.06, 0.1, 0.06);
  M.railFPS = b.build();
  b = new MB(); b.jit = 0.02; // parem käsi: kinnas püstolkäepidemel, varrukas taha
  b.color(gloveC).boxB(0, -0.04, 0, 0.065, 0.075, 0.09);
  b.color(gloveC).boxB(0.0, -0.005, 0.045, 0.05, 0.03, 0.04);
  b.push().tf(0, -0.03, -0.04, 0, -0.35, 0).color(cuffC).boxB(0, 0, -0.04, 0.085, 0.085, 0.08).color(sleeveC).boxB(0, 0, -0.25, 0.1, 0.1, 0.36).pop();
  M.armFPS = b.build();
  b = new MB(); b.jit = 0.02; // vasak käsi: peopesa eesmise käepideme all
  b.color(gloveC).boxB(0, -0.03, 0, 0.09, 0.05, 0.11);
  b.color(gloveC).boxB(0.045, 0.0, 0.0, 0.02, 0.06, 0.09);
  b.push().tf(0, -0.04, -0.04, 0, -0.45, 0).color(cuffC).boxB(0, 0, -0.04, 0.09, 0.09, 0.08).color(sleeveC).boxB(0, 0, -0.26, 0.105, 0.105, 0.38).pop();
  M.armFPSL = b.build();

  // ---------- olendid ----------
  // Kõrbekits
  b = new MB(); b.jit = 0.08;
  b.color([0.56, 0.45, 0.43]).sphere(0, 0.95, 0, 0.36, 8, 5, 1);
  b.push().tf(0, 0.95, 0, 0, 0, 0, 1.0, 0.85, 1.75).color([0.58, 0.47, 0.45]).sphere(0, 0, 0, 0.36, 8, 5).pop();
  b.color([0.75, 0.66, 0.58]).boxB(0, 0.62, 0.0, 0.34, 0.12, 0.7); // kõht
  for (let i = 0; i < 4; i++) b.color([0.38, 0.27, 0.27]).cyl(0, 1.18, -0.3 + i * 0.18, 0.06, 0.0, 0.22 - i * 0.03, 4); // seljaharjased
  b.color([0.42, 0.33, 0.33]).cyl(0, 0.92, -0.62, 0.07, 0.02, 0.3, 4); // saba alus
  M.goatBody = b.build();
  b = new MB(); b.jit = 0.08; // kael + pea, pöördepunkt kaela alusel
  b.push().tf(0, 0, 0, 0, -0.75, 0).color([0.56, 0.45, 0.43]).cyl(0, 0, 0, 0.13, 0.1, 0.55, 6).pop();
  b.color([0.60, 0.49, 0.46]).boxB(0, 0.28, 0.42, 0.22, 0.22, 0.34);
  b.color([0.45, 0.35, 0.34]).boxB(0, 0.24, 0.62, 0.16, 0.14, 0.14);
  b.color([1.0, 0.75, 0.3], MAT.GLOW).boxB(-0.1, 0.38, 0.5, 0.04, 0.04, 0.04);
  b.color([1.0, 0.75, 0.3], MAT.GLOW).boxB(0.1, 0.38, 0.5, 0.04, 0.04, 0.04);
  b.color([1.0, 0.75, 0.3], MAT.GLOW).boxB(0, 0.43, 0.48, 0.04, 0.04, 0.04);
  for (const s of [-1, 1]) {
    b.push().tf(s * 0.1, 0.4, 0.36, s * 0.35, -1.1, 0).color([0.28, 0.24, 0.22]).cyl(0, 0, 0, 0.045, 0.012, 0.42, 5).pop();
    b.push().tf(s * 0.14, 0.62, 0.15, s * 0.6, -2.0, 0).color([0.28, 0.24, 0.22]).cyl(0, 0, 0, 0.03, 0.005, 0.2, 4).pop();
  }
  M.goatHead = b.build();
  b = new MB(); b.jit = 0.06; // jalg, pöördepunkt üleval
  b.color([0.50, 0.40, 0.38]).boxB(0, -0.4, 0, 0.09, 0.4, 0.1);
  b.color([0.36, 0.28, 0.27]).boxB(0, -0.8, -0.03, 0.065, 0.42, 0.07);
  b.color([0.18, 0.15, 0.14]).boxB(0, -0.86, 0.0, 0.1, 0.06, 0.12);
  M.goatLeg = b.build();
  // Jäär: suurem pea, suured sarved
  b = new MB(); b.jit = 0.08;
  b.push().tf(0, 0, 0, 0, -0.75, 0).color([0.46, 0.36, 0.34]).cyl(0, 0, 0, 0.16, 0.12, 0.55, 6).pop();
  b.color([0.50, 0.40, 0.38]).boxB(0, 0.28, 0.42, 0.26, 0.24, 0.36);
  b.color([0.35, 0.27, 0.26]).boxB(0, 0.24, 0.63, 0.18, 0.16, 0.14);
  b.color([1.0, 0.4, 0.2], MAT.GLOW).boxB(-0.11, 0.38, 0.5, 0.045, 0.045, 0.04);
  b.color([1.0, 0.4, 0.2], MAT.GLOW).boxB(0.11, 0.38, 0.5, 0.045, 0.045, 0.04);
  b.color([1.0, 0.4, 0.2], MAT.GLOW).boxB(0, 0.44, 0.48, 0.045, 0.045, 0.04);
  for (const s of [-1, 1]) {
    b.push().tf(s * 0.15, 0.42, 0.34, s * 0.9, -0.6, s * 0.3).color([0.22, 0.19, 0.17]).cyl(0, 0, 0, 0.08, 0.05, 0.3, 5).pop();
    b.push().tf(s * 0.38, 0.6, 0.4, s * 0.4, 0.9, s * 0.5).color([0.22, 0.19, 0.17]).cyl(0, 0, 0, 0.05, 0.01, 0.35, 5).pop();
  }
  M.ramHead = b.build();

  // Liivahiilija
  b = new MB(); b.jit = 0.07;
  const chit = [0.26, 0.18, 0.15], chit2 = [0.36, 0.24, 0.18], spine = [0.82, 0.42, 0.18];
  b.push().tf(0, 0.55, 0, 0, 0, 0, 1, 0.7, 1.9).color(chit).sphere(0, 0, 0, 0.45, 8, 5).pop();
  b.push().tf(0, 0.5, 0.75, 0, 0, 0, 1, 0.75, 1.1).color(chit2).sphere(0, 0, 0, 0.36, 7, 5).pop();
  for (let i = 0; i < 6; i++) b.color(spine).cyl(0, 0.8 - i * 0.02, 0.5 - i * 0.28, 0.07, 0.0, 0.32 - i * 0.03, 4);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) b.push().tf(s * 0.3, 0.7, 0.3 - i * 0.3, 0, 0, s * 0.9).color(spine).cyl(0, 0, 0, 0.04, 0, 0.22, 4).pop();
  M.stalkerBody = b.build();
  b = new MB(); b.jit = 0.07;
  b.color(chit2).boxB(0, -0.12, 0.2, 0.42, 0.26, 0.45);
  b.color(chit).boxB(0, -0.22, 0.45, 0.3, 0.12, 0.25);
  b.color([1.0, 0.18, 0.1], MAT.GLOW).boxB(-0.12, 0.0, 0.38, 0.06, 0.04, 0.04);
  b.color([1.0, 0.18, 0.1], MAT.GLOW).boxB(0.12, 0.0, 0.38, 0.06, 0.04, 0.04);
  b.color([1.0, 0.18, 0.1], MAT.GLOW).boxB(-0.07, 0.04, 0.4, 0.04, 0.03, 0.03);
  b.color([1.0, 0.18, 0.1], MAT.GLOW).boxB(0.07, 0.04, 0.4, 0.04, 0.03, 0.03);
  for (const s of [-1, 1]) b.push().tf(s * 0.14, -0.2, 0.6, -s * 0.4, 1.5, 0).color([0.85, 0.80, 0.65]).cyl(0, 0, 0, 0.04, 0.0, 0.3, 4).pop();
  M.stalkerHead = b.build();
  b = new MB(); b.jit = 0.05; // jalg: välja ja alla
  b.push().tf(0, 0, 0, 0, 0, -0.9).color(chit).cyl(0, 0, 0, 0.07, 0.05, 0.55, 5).pop();
  b.push().tf(0.46, 0.32, 0, 0, 0, -2.84).color(chit2).cyl(0, 0, 0, 0.05, 0.02, 0.85, 5).pop();
  M.stalkerLeg = b.build();
  b = new MB(); b.jit = 0.05;
  b.push().tf(0, 0, 0, 0, -Math.PI / 2 - 0.15, 0).color(chit).cyl(0, 0, 0, 0.16, 0.03, 1.6, 6).pop();
  b.color(spine).cyl(0, 0.08, -1.45, 0.08, 0, 0.3, 4);
  M.stalkerTail = b.build();

  // Okaskilp
  b = new MB(); b.jit = 0.1;
  const shell = [0.30, 0.32, 0.38], shell2 = [0.22, 0.23, 0.28];
  b.push().tf(0, 0.55, 0, 0, 0, 0, 1.3, 0.62, 1.15).color(shell).sphere(0, 0, 0, 1.0, 9, 5).pop();
  b.push().tf(0, 0.52, 0, 0, 0, 0, 1.35, 0.25, 1.2).color(shell2).sphere(0, 0, 0, 1.0, 9, 3).pop();
  const rr = mulberry32(55);
  for (let i = 0; i < 9; i++) {
    const a = rr() * TAU, d = rr() * 0.8;
    b.push().tf(Math.cos(a) * d, 0.95 + (0.8 - d) * 0.35, Math.sin(a) * d * 0.9, rr() * 3, (rr() - 0.5) * 0.9, (rr() - 0.5) * 0.9)
      .color(rr() < 0.5 ? PAL.crystal : PAL.crystal2, MAT.GLOW).cyl(0, 0, 0, 0.09, 0.0, 0.4 + rr() * 0.5, 5).pop();
  }
  b.color([1.0, 0.85, 0.3], MAT.GLOW).boxB(-0.25, 0.45, 1.15, 0.08, 0.08, 0.06);
  b.color([1.0, 0.85, 0.3], MAT.GLOW).boxB(0.25, 0.45, 1.15, 0.08, 0.08, 0.06);
  M.crabBody = b.build();
  b = new MB(); b.jit = 0.06;
  b.push().tf(0, 0, 0, 0, 0, -1.0).color(shell2).cyl(0, 0, 0, 0.09, 0.06, 0.8, 5).pop();
  b.push().tf(0.66, 0.43, 0, 0, 0, -2.78).color(shell).cyl(0, 0, 0, 0.06, 0.02, 1.0, 5).pop();
  M.crabLeg = b.build();
  b = new MB(); b.jit = 0.06;
  b.push().tf(0, 0, 0, 0, 1.3, 0).color(shell2).cyl(0, 0, 0, 0.13, 0.1, 0.6, 6).pop();
  b.color(shell).boxB(0, -0.05, 0.78, 0.28, 0.24, 0.4);
  b.color([0.75, 0.70, 0.62]).boxB(0.08, -0.08, 1.06, 0.08, 0.12, 0.3);
  b.color([0.75, 0.70, 0.62]).boxB(-0.08, -0.1, 1.04, 0.08, 0.08, 0.26);
  M.crabClaw = b.build();

  // Tuulemeduus
  b = new MB(); b.jit = 0;
  b.push().tf(0, 0, 0, 0, 0, 0, 1, 0.6, 1).color([0.75, 0.55, 0.95], MAT.GLOW).sphere(0, 0, 0, 0.8, 10, 4).pop();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.push().tf(Math.cos(a) * 0.45, -0.1, Math.sin(a) * 0.45, 0, Math.PI, 0).color([0.45, 0.85, 0.85], MAT.GLOW).cyl(0, 0, 0, 0.04, 0.005, 1.6 + (i % 3) * 0.4, 3).pop();
  }
  M.jelly = b.build();

  // ---------- Kivisüda (boss) ----------
  b = new MB(); b.jit = 0.1;
  const bossA = [0.30, 0.25, 0.22], bossB = [0.42, 0.34, 0.28], bossC = [0.20, 0.16, 0.15];
  b.push().tf(0, 5.0, 0, 0, 0, 0, 1, 0.72, 1.55).color(bossA).sphere(0, 0, 0, 4.2, 10, 6).pop();
  const br = mulberry32(99);
  for (let i = 0; i < 22; i++) {
    const a = br() * TAU, z = (br() - 0.5) * 9, x = Math.cos(a) * 3.2;
    const y = 5 + Math.abs(Math.sin(a)) * 2.6 + 0.6;
    if (y < 6) continue;
    b.color(br() < 0.5 ? bossB : bossC).rock(x * 0.8, y, z, 1.0 + br() * 0.9, br, 0.4, 0.6);
  }
  b.push().tf(0, 3.0, 0, 0, 0, 0, 1, 0.5, 1.4).color(bossC).sphere(0, 0, 0, 3.5, 8, 4).pop();
  M.bossBody = b.build();
  b = new MB(); b.jit = 0.08; // pea, pöördepunkt kaelal
  b.push().tf(0, 0, 2.0, 0, 0, 0, 1.2, 0.9, 1.3).color(bossB).sphere(0, 0, 0, 2.0, 9, 5).pop();
  b.color(bossC).boxB(0, -1.0, 3.2, 2.2, 0.8, 1.6);
  for (const s of [-1, 1]) {
    b.push().tf(s * 1.4, -0.6, 3.0, s * 0.25, 1.2, s * 0.2).color([0.85, 0.80, 0.68]).cyl(0, 0, 0, 0.35, 0.02, 3.2, 6).pop();
    b.color([1.0, 0.3, 0.6], MAT.GLOW).boxB(s * 0.8, 0.6, 3.6, 0.35, 0.25, 0.2);
    b.color([1.0, 0.3, 0.6], MAT.GLOW).boxB(s * 1.3, 0.3, 3.3, 0.25, 0.2, 0.2);
  }
  M.bossHead = b.build();
  b = new MB(); b.jit = 0.08; // jalg
  b.push().tf(0, 0, 0, 0, 0, 0).color(bossA).cyl(0, -3.0, 0, 0.75, 0.95, 3.0, 7).pop();
  b.color(bossC).cyl(0, -5.6, 0, 0.6, 0.75, 2.7, 7);
  b.color(bossB).cyl(0, -5.9, 0, 1.0, 0.6, 0.4, 7);
  M.bossLeg = b.build();
  b = new MB(); b.jit = 0; // kristallisõlm (nõrk koht)
  const nr = mulberry32(5);
  for (let i = 0; i < 7; i++) {
    b.push().tf((nr() - 0.5) * 0.9, 0, (nr() - 0.5) * 0.9, nr() * 3, (nr() - 0.5) * 0.7, (nr() - 0.5) * 0.7)
      .color(i % 2 ? [1.0, 0.35, 0.75] : [0.6, 0.85, 1.0], MAT.GLOW).cyl(0, 0, 0, 0.32, 0.0, 1.6 + nr() * 1.4, 5).pop();
  }
  b.color(bossC).rock(0, 0, 0, 0.8, nr, 0.3, 0.5);
  M.bossNode = b.build();
  b = new MB(); b.jit = 0;
  b.color([1.0, 0.4, 0.55], MAT.GLOW).sphere(0, 0, 0, 1.2, 10, 7);
  M.bossHeart = b.build();
  b = new MB(); b.jit = 0; // helendav sammas pesa kohal
  for (let k = 0; k < 8; k++) b.color([1.0 - k * 0.05, 0.42 + k * 0.03, 0.9], MAT.GLOW).cyl(0, k * 40, 0, 5.5 - k * 0.45, 5.1 - k * 0.45, 40, 8);
  M.beacon = b.build();
  b = new MB(); b.jit = 0;
  b.color([1.0, 0.45, 0.8], MAT.GLOW).rock(0, 0, 0, 0.35, mulberry32(3), 0.3, 1.4);
  M.heartStone = b.build();
  b = new MB(); b.jit = 0;
  b.color([0.9, 0.6, 1.0], MAT.GLOW).cyl(0, -0.4, 0, 0.0, 0.25, 0.4, 5).color([0.9, 0.6, 1.0], MAT.GLOW).cyl(0, 0, 0, 0.25, 0.0, 0.5, 5);
  M.shard = b.build();

  // ---------- kristallid ----------
  b = new MB(); b.jit = 0;
  const cr = mulberry32(21);
  for (let i = 0; i < 6; i++) {
    const a = cr() * TAU, d = cr() * 0.35;
    b.push().tf(Math.cos(a) * d, -0.1, Math.sin(a) * d, cr() * 3, (cr() - 0.5) * 0.8, (cr() - 0.5) * 0.8)
      .color(i % 3 === 0 ? PAL.crystal2 : PAL.crystal, MAT.GLOW).cyl(0, 0, 0, 0.12 + cr() * 0.06, 0.0, 0.7 + cr() * 0.8, 6).pop();
  }
  b.color([0.18, 0.14, 0.16]).rock(0, 0, 0, 0.45, cr, 0.3, 0.45);
  M.crystalCluster = b.build();
  b = new MB(); b.jit = 0;
  b.color(PAL.crystal, MAT.GLOW).cyl(0, 0, 0, 0.0, 0.08, 0.12, 5).cyl(0, 0.12, 0, 0.08, 0.0, 0.18, 5);
  M.crystalBit = b.build();
  b = new MB(); b.jit = 0.05; // kotike (surmapaik)
  b.color([0.35, 0.30, 0.22]).boxB(0, 0, 0, 0.5, 0.35, 0.4).color(PAL.amber, MAT.GLOW).boxB(0, 0.36, 0, 0.06, 0.06, 0.06);
  M.bag = b.build();
  b = new MB(); b.jit = 0.05; // kitse korjus (liha)
  b.color([0.55, 0.22, 0.2]).boxB(0, 0.1, 0, 0.5, 0.2, 0.3);
  M.meat = b.build();

  // ---------- loodus ----------
  M.rocks = [];
  for (let k = 0; k < 4; k++) {
    b = new MB(); b.jit = 0.06;
    const r = mulberry32(100 + k);
    const base = [[0.47, 0.30, 0.22], [0.40, 0.26, 0.20], [0.55, 0.38, 0.28], [0.33, 0.22, 0.18]][k];
    b.color(base).rock(0, 0.35, 0, 1, r, 0.32, 0.75);
    if (k % 2 === 0) b.color(mixRgb(base, [0.2, 0.15, 0.12], 0.3)).rock(0.7, 0.15, 0.3, 0.55, r, 0.3, 0.7);
    M.rocks.push(b.build());
  }
  // kaljutorn
  b = new MB(); b.jit = 0.05;
  {
    const r = mulberry32(777); let y = 0, w = 1.4;
    for (let i = 0; i < 6; i++) {
      const hh = 1.4 + r() * 1.2;
      b.color(mixRgb([0.52, 0.32, 0.22], [0.38, 0.24, 0.18], (i % 2) * 0.6 + r() * 0.2)).cyl((r() - 0.5) * 0.3, y, (r() - 0.5) * 0.3, w, w * (0.75 + r() * 0.2), hh, 7, true, r());
      y += hh; w *= 0.8 + r() * 0.12;
    }
    b.color([0.40, 0.25, 0.19]).rock(0, y + 0.5, 0, w * 1.6, r, 0.3, 0.6);
  }
  M.spire = b.build();
  // kõrbeküünal (taim)
  b = new MB(); b.jit = 0.06;
  {
    const r = mulberry32(31);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4, d = i === 0 ? 0 : 0.35;
      const h = i === 0 ? 2.8 : 1.6 + r() * 0.6;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      b.color([0.30, 0.34, 0.24]).cyl(x, 0, z, 0.14, 0.09, h, 6);
      for (let k = 0; k < 5; k++) b.push().tf(x, 0.3 + k * h / 5.5, z, r() * TAU, 0, 1.2).color([0.62, 0.58, 0.42]).cyl(0, 0, 0, 0.025, 0, 0.18, 3).pop();
      b.color([0.82, 0.45, 1.0], MAT.GLOW).sphere(x, h + 0.08, z, 0.14, 6, 4);
    }
  }
  M.candle = b.build();
  b = new MB(); b.jit = 0.12; // kuivpõõsas
  {
    const r = mulberry32(41);
    for (let i = 0; i < 9; i++) b.push().tf(0, 0, 0, r() * TAU, 0, 0.3 + r() * 0.9).color([0.48, 0.38, 0.26]).cyl(0, 0, 0, 0.04, 0.0, 0.5 + r() * 0.5, 3).pop();
    b.color([0.40, 0.32, 0.22]).sphere(0, 0.12, 0, 0.18, 5, 3);
  }
  M.shrub = b.build();
  // fossiilne roidekorv (orientiir)
  b = new MB(); b.jit = 0.05;
  {
    const boneC = [0.82, 0.76, 0.64];
    b.push().tf(0, 0.6, 0, 0, Math.PI / 2, 0).color(boneC).cyl(0, -9, 0, 0.6, 0.5, 18, 7).pop();
    for (let i = 0; i < 9; i++) {
      const z = -7 + i * 1.7, s = 1 - Math.abs(i - 4) * 0.08;
      for (const side of [-1, 1]) {
        let px = 0, py = 0.8;
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 0.95;
          const nx = side * Math.sin(a) * 5.2 * s, ny = 0.8 + (1 - Math.cos(a)) * 0.5 + Math.sin(a) * 6.5 * s;
          const segLen = Math.hypot(nx - px, ny - py);
          const ang = Math.atan2(nx - px, ny - py);
          b.push().tf(px, py, z, 0, 0, -ang).color(boneC).cyl(0, 0, 0, 0.32 - k * 0.03, 0.29 - k * 0.03, segLen, 5).pop();
          px = nx; py = ny;
        }
      }
    }
    b.push().tf(0, 1.2, 9.5, 0, 0.3, 0).color(boneC).sphere(0, 0, 0, 2.0, 8, 5, 0.8).pop();
    b.color([0.1, 0.08, 0.07]).boxB(-0.8, 1.4, 11.2, 0.6, 0.5, 0.4).boxB(0.8, 1.4, 11.2, 0.6, 0.5, 0.4);
  }
  M.ribcage = b.build();

  // vrakid
  M.wrecks = [];
  {
    // 0: konteiner
    b = new MB(); b.jit = 0.04;
    b.color([0.55, 0.30, 0.18], MAT.RUST).boxB(0, 0, 0, 2.6, 2.6, 6.0);
    for (let i = 0; i < 9; i++) b.color([0.48, 0.26, 0.16], MAT.RUST).boxB(1.32, 0.2, -2.8 + i * 0.7, 0.06, 2.2, 0.12).boxB(-1.32, 0.2, -2.8 + i * 0.7, 0.06, 2.2, 0.12);
    b.color(PAL.metalDark).boxB(0, 0.1, 3.02, 2.3, 2.3, 0.05);
    M.wrecks.push(b.build());
    // 1: sond
    b = new MB(); b.jit = 0.04;
    b.push().tf(0, 1.2, 0, 0, Math.PI / 2 - 0.25, 0).color([0.62, 0.62, 0.6], MAT.RUST).cyl(0, -2.5, 0, 1.1, 1.0, 5, 8).color(PAL.metalDark).cyl(0, 2.5, 0, 1.0, 0.3, 1.4, 8).pop();
    b.push().tf(1.4, 1.5, 0.5, 0.3, 0, 0.5).color([0.18, 0.24, 0.38]).boxB(1.2, 0, 0, 2.6, 0.06, 1.4).pop();
    b.push().tf(-1.6, 0.4, -0.5, -0.2, 0.1, -0.2).color([0.18, 0.24, 0.38]).boxB(-1.0, 0, 0, 2.2, 0.06, 1.4).pop();
    b.color(PAL.hazard).boxB(0, 2.25, -0.4, 0.4, 0.06, 1.2);
    M.wrecks.push(b.build());
    // 2: kaevandusroomik
    b = new MB(); b.jit = 0.05;
    b.color([0.62, 0.45, 0.16], MAT.RUST).boxB(0, 0.9, 0, 3.4, 2.0, 5.0);
    b.color(PAL.metalDark).boxB(-2.0, 0, 0, 0.8, 1.3, 5.6).boxB(2.0, 0, 0, 0.8, 1.3, 5.6);
    b.color([0.5, 0.36, 0.14], MAT.RUST).boxB(0, 2.9, -0.8, 2.2, 1.2, 2.2);
    b.color([0.2, 0.25, 0.28]).boxB(0, 3.1, 0.33, 1.8, 0.7, 0.05);
    b.push().tf(0, 1.5, 2.6, 0, 0.6, 0).color(PAL.metal, MAT.RUST).cyl(0, 0, 0, 0.8, 0.1, 2.2, 8).pop();
    M.wrecks.push(b.build());
    // 3: laevakere osa
    b = new MB(); b.jit = 0.05;
    for (let i = 0; i < 7; i++) {
      const a0 = -0.2 + i * 0.42, a1 = a0 + 0.42;
      const R = 5;
      b.color(i % 2 ? [0.45, 0.43, 0.42] : [0.5, 0.48, 0.46], MAT.RUST).quad(
        [Math.cos(a0) * R, Math.sin(a0) * R, -4], [Math.cos(a0) * R, Math.sin(a0) * R, 4], [Math.cos(a1) * R, Math.sin(a1) * R, 4], [Math.cos(a1) * R, Math.sin(a1) * R, -4]);
      b.color([0.3, 0.29, 0.28], MAT.RUST).quad(
        [Math.cos(a1) * R * 0.95, Math.sin(a1) * R * 0.95, -4], [Math.cos(a1) * R * 0.95, Math.sin(a1) * R * 0.95, 4], [Math.cos(a0) * R * 0.95, Math.sin(a0) * R * 0.95, 4], [Math.cos(a0) * R * 0.95, Math.sin(a0) * R * 0.95, -4]);
    }
    for (let i = 0; i < 4; i++) b.color(PAL.metalDark, MAT.RUST).boxB(0, 0, -3 + i * 2, 9.6, 0.4, 0.3);
    M.wrecks.push(b.build());
  }

  // ---------- baasiobjektid ----------
  buildObjectModels();
  applyImportedModels();
}

function buildObjectModels() {
  const O = (MODELS.obj = {});
  let b;
  const ST = [0.40, 0.41, 0.43];
  // voodi (1x1) — pea suunas -z
  b = new MB(); b.jit = 0.03;
  b.color(ST, MAT.RUST).boxB(0, 0, 0, 1.0, 0.35, 1.9);
  b.color([0.55, 0.50, 0.42]).boxB(0, 0.35, 0.05, 0.92, 0.16, 1.75);
  b.color([0.80, 0.78, 0.72]).boxB(0, 0.51, -0.65, 0.7, 0.1, 0.35);
  b.color([0.35, 0.42, 0.40]).boxB(0, 0.51, 0.25, 0.9, 0.06, 1.05);
  b.color(ST, MAT.RUST).boxB(0, 0, -0.95, 1.0, 0.85, 0.08);
  O.voodi = b.build();
  b = new MB(); b.jit = 0.03; // narivoodi
  b.color(ST, MAT.RUST).boxB(-0.47, 0, -0.9, 0.06, 2.0, 0.06).boxB(0.47, 0, -0.9, 0.06, 2.0, 0.06).boxB(-0.47, 0, 0.9, 0.06, 2.0, 0.06).boxB(0.47, 0, 0.9, 0.06, 2.0, 0.06);
  for (const y of [0.3, 1.3]) {
    b.color(ST, MAT.RUST).boxB(0, y, 0, 1.0, 0.12, 1.9);
    b.color([0.55, 0.50, 0.42]).boxB(0, y + 0.12, 0.05, 0.92, 0.14, 1.75);
    b.color([0.80, 0.78, 0.72]).boxB(0, y + 0.26, -0.65, 0.7, 0.09, 0.35);
    b.color(y < 1 ? [0.42, 0.30, 0.26] : [0.28, 0.36, 0.45]).boxB(0, y + 0.26, 0.25, 0.9, 0.05, 1.05);
  }
  for (let i = 0; i < 4; i++) b.color(PAL.metalDark).boxB(0.52, 0.45 + i * 0.3, 0.6, 0.04, 0.04, 0.4);
  O.nari = b.build();
  b = new MB(); b.jit = 0.03; // söögilaud + taburetid
  b.color([0.38, 0.36, 0.34]).cyl(0, 0, 0, 0.12, 0.08, 0.72, 6);
  b.color([0.52, 0.42, 0.32]).cyl(0, 0.72, 0, 0.62, 0.62, 0.06, 10);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4, x = Math.cos(a) * 0.82, z = Math.sin(a) * 0.82;
    b.color(PAL.metalDark).cyl(x, 0, z, 0.05, 0.05, 0.42, 5).color([0.45, 0.22, 0.16]).cyl(x, 0.42, z, 0.2, 0.2, 0.06, 8);
  }
  b.color([0.75, 0.70, 0.62]).cyl(0.18, 0.78, 0.1, 0.1, 0.08, 0.06, 7).color([0.8, 0.8, 0.82]).cyl(-0.2, 0.78, -0.1, 0.05, 0.05, 0.14, 6);
  O.laud = b.build();
  b = new MB(); b.jit = 0.03; // pliit
  b.color([0.62, 0.60, 0.56], MAT.RUST).boxB(0, 0, -0.45, 1.3, 0.9, 0.75);
  b.color(PAL.metalDark).boxB(0, 0.9, -0.45, 1.3, 0.05, 0.75);
  for (const x of [-0.32, 0.32]) b.color([1.0, 0.45, 0.12], MAT.GLOW).cyl(x, 0.95, -0.45, 0.17, 0.17, 0.02, 10);
  b.color(PAL.metalDark).boxB(0, 0.2, -0.07, 1.0, 0.45, 0.02);
  b.color([0.55, 0.53, 0.5], MAT.RUST).boxB(0, 1.7, -0.6, 1.2, 0.35, 0.5).cyl(0, 2.05, -0.6, 0.12, 0.12, 0.95, 6);
  b.color([0.65, 0.4, 0.3]).cyl(0.32, 0.97, -0.45, 0.14, 0.12, 0.2, 8);
  O.pliit = b.build();
  b = new MB(); b.jit = 0.02; // jukeboks
  b.color([0.35, 0.16, 0.12]).boxB(0, 0, -0.5, 0.9, 1.2, 0.55);
  b.push().tf(0, 1.2, -0.5, 0, 0, Math.PI / 2).color([0.35, 0.16, 0.12]).cyl(0, -0.45, 0, 0.27, 0.27, 0.9, 10).pop();
  for (let i = 0; i < 4; i++) b.color([[1, 0.55, 0.15], [1, 0.3, 0.4], [0.4, 0.9, 1], [0.7, 1, 0.4]][i], MAT.GLOW).boxB(-0.3 + i * 0.2, 0.2, -0.22, 0.08, 0.95, 0.02);
  b.color([0.9, 0.8, 0.55], MAT.GLOW).boxB(0, 1.08, -0.22, 0.6, 0.14, 0.03);
  O.jukebox = b.build();
  b = new MB(); b.jit = 0.06; // taim potis
  b.color([0.55, 0.30, 0.2]).cyl(0, 0, 0, 0.22, 0.3, 0.45, 8);
  b.color([0.3, 0.22, 0.16]).cyl(0, 0.44, 0, 0.27, 0.27, 0.02, 8);
  for (let i = 0; i < 5; i++) b.push().tf(0, 0.45, 0, i * 1.3, 0, 0.25 + (i % 2) * 0.2).color([0.32, 0.45, 0.30]).cyl(0, 0, 0, 0.05, 0.02, 0.7 + i * 0.12, 4).pop();
  b.color([0.82, 0.45, 1.0], MAT.GLOW).sphere(0, 1.25, 0, 0.1, 6, 4).sphere(0.18, 1.05, 0.05, 0.07, 6, 4);
  O.taim = b.build();
  b = new MB(); b.jit = 0.03; // diivan
  b.color([0.45, 0.30, 0.22]).boxB(0, 0, -0.35, 1.8, 0.42, 0.85);
  b.color([0.40, 0.26, 0.19]).boxB(0, 0.42, -0.7, 1.8, 0.55, 0.22);
  b.color([0.40, 0.26, 0.19]).boxB(-0.85, 0.42, -0.35, 0.18, 0.28, 0.85).boxB(0.85, 0.42, -0.35, 0.18, 0.28, 0.85);
  b.color([0.55, 0.42, 0.3]).boxB(-0.42, 0.42, -0.28, 0.78, 0.1, 0.65).boxB(0.42, 0.42, -0.28, 0.78, 0.1, 0.65);
  O.diivan = b.build();
  b = new MB(); b.jit = 0.03; // töölaud
  b.color(PAL.wood).boxB(0, 0.85, -0.45, 1.7, 0.08, 0.8);
  b.color(ST, MAT.RUST).boxB(-0.75, 0, -0.45, 0.08, 0.85, 0.7).boxB(0.75, 0, -0.45, 0.08, 0.85, 0.7).boxB(0, 0.3, -0.45, 1.5, 0.05, 0.7);
  b.color(PAL.metalDark).boxB(0.5, 0.93, -0.45, 0.25, 0.18, 0.2);
  b.color([0.5, 0.35, 0.2]).boxB(-0.3, 0.93, -0.5, 0.5, 0.06, 0.15);
  b.color(ST).boxB(0, 1.4, -0.82, 1.6, 1.0, 0.04);
  for (let i = 0; i < 5; i++) b.color(i % 2 ? PAL.hazard : PAL.metal).boxB(-0.6 + i * 0.3, 1.5 + (i % 3) * 0.15, -0.79, 0.06, 0.3, 0.03);
  b.color([1.0, 0.9, 0.7], MAT.GLOW).boxB(-0.6, 1.95, -0.65, 0.3, 0.05, 0.1);
  O.toolaud = b.build();
  // ---- uued esemed ----
  b = new MB(); b.jit = 0.02; // veeautomaat
  b.color([0.42, 0.44, 0.45], MAT.WORN).boxB(0, 0, -0.62, 0.55, 1.15, 0.45);
  b.push().tf(0, 1.15, -0.62, 0, 0, 0).color([0.45, 0.62, 0.70]).cyl(0, 0, 0, 0.17, 0.17, 0.45, 10).pop();
  b.color([0.30, 0.32, 0.33]).cyl(0, 1.6, -0.62, 0.12, 0.12, 0.05, 10);
  b.color([0.15, 0.15, 0.16]).boxB(0, 0.75, -0.39, 0.3, 0.2, 0.02);
  b.color([0.3, 0.6, 1.0], MAT.GLOW).boxB(-0.08, 0.98, -0.39, 0.04, 0.04, 0.02); b.color([1.0, 0.35, 0.2], MAT.GLOW).boxB(0.08, 0.98, -0.39, 0.04, 0.04, 0.02);
  b.color([0.75, 0.75, 0.72]).cyl(0.15, 0.6, -0.33, 0.035, 0.03, 0.09, 6);
  O.vesi = b.build();
  b = new MB(); b.jit = 0.02; // dušinurk
  b.color([0.36, 0.38, 0.38], MAT.WORN).boxB(0, 0, -0.1, 1.5, 0.12, 1.5);
  b.color([0.12, 0.12, 0.13]).cyl(0, 0.12, -0.1, 0.08, 0.08, 0.01, 8);
  b.color([0.40, 0.42, 0.42], MAT.WORN).boxB(0, 0, -0.82, 1.5, 2.3, 0.06).boxB(-0.72, 0, -0.1, 0.06, 2.3, 1.5);
  b.color([0.5, 0.62, 0.66]).boxB(0.72, 0.15, -0.1, 0.03, 1.9, 1.4);
  b.color(PAL.metalDark).boxB(0, 2.25, -0.1, 1.5, 0.05, 0.05);
  b.color(PAL.metal).cyl(0, 0.9, -0.76, 0.02, 0.02, 1.2, 6).boxB(0, 2.05, -0.6, 0.04, 0.04, 0.35).cyl(0, 1.95, -0.42, 0.1, 0.06, 0.08, 8);
  b.color([0.55, 0.42, 0.28]).boxB(-0.65, 1.3, -0.5, 0.06, 0.06, 0.3);
  O.dush = b.build();
  b = new MB(); b.jit = 0.02; // kuivkäimla
  b.color([0.34, 0.36, 0.33], MAT.WORN).boxB(0, 0, -0.1, 1.2, 2.2, 0.06).boxB(-0.6, 0, -0.45, 0.06, 2.2, 0.75).boxB(0.6, 0, -0.45, 0.06, 2.2, 0.75);
  b.color([0.30, 0.31, 0.29], MAT.RUST).boxB(0, 0, -0.82, 1.2, 2.2, 0.06);
  b.color([0.62, 0.62, 0.58]).cyl(0, 0, -0.5, 0.2, 0.22, 0.42, 10).color([0.25, 0.24, 0.22]).cyl(0, 0.42, -0.48, 0.21, 0.21, 0.04, 10);
  b.color([0.55, 0.55, 0.52]).boxB(0, 0.42, -0.74, 0.4, 0.4, 0.12);
  b.color([0.75, 0.73, 0.66]).cyl(0.42, 0.9, -0.7, 0.06, 0.06, 0.1, 8);
  b.color([1.0, 0.8, 0.5], MAT.GLOW).boxB(0, 2.1, -0.5, 0.2, 0.03, 0.08);
  O.wc = b.build();
  b = new MB(); b.jit = 0.02; // vana teler kapil
  b.color(PAL.wood).boxB(0, 0, -0.6, 1.3, 0.55, 0.5);
  b.color([0.16, 0.15, 0.14]).boxB(0, 0.55, -0.62, 0.95, 0.68, 0.45);
  b.color([0.25, 0.38, 0.42], MAT.GLOW).boxB(0, 0.62, -0.395, 0.78, 0.54, 0.01);
  b.color(PAL.metalDark).cyl(0.3, 1.23, -0.65, 0.01, 0.01, 0.4, 4).cyl(-0.3, 1.23, -0.65, 0.01, 0.01, 0.4, 4);
  b.color([0.55, 0.42, 0.28]).boxB(-0.35, 0.56, -0.5, 0.15, 0.04, 0.1);
  O.teler = b.build();
  b = new MB(); b.jit = 0.02; // treeningpink
  b.color(PAL.metalDark).boxB(0, 0, -0.1, 0.3, 0.42, 1.3);
  b.color([0.35, 0.16, 0.12]).boxB(0, 0.42, -0.1, 0.38, 0.1, 1.25);
  for (const sx of [-0.5, 0.5]) b.color(PAL.metalDark).boxB(sx, 0, -0.55, 0.06, 1.3, 0.06);
  b.push().tf(0, 1.15, -0.55, 0, 0, Math.PI / 2).color(PAL.metal).cyl(0, -0.75, 0, 0.02, 0.02, 1.5, 6).pop();
  for (const sx of [-0.68, 0.68]) b.push().tf(sx, 1.15, -0.55, 0, 0, Math.PI / 2).color([0.12, 0.12, 0.13]).cyl(0, -0.04, 0, 0.2, 0.2, 0.08, 12).pop();
  O.trenn = b.build();
  b = new MB(); b.jit = 0.02; // hüdropoonika 2x1
  for (const y of [0.15, 0.85]) {
    b.color([0.30, 0.32, 0.33], MAT.WORN).boxB(0, y, -0.25, 3.4, 0.18, 0.8);
    for (let i = 0; i < 9; i++) b.push().tf(-1.5 + i * 0.375, y + 0.18, -0.25 + (i % 2) * 0.12, i * 0.7, 0, 0.2).color([0.24 + (i % 3) * 0.03, 0.42, 0.18]).cyl(0, 0, 0, 0.11, 0.03, 0.35 + (i % 3) * 0.08, 5).pop();
    b.color([0.85, 0.3, 1.0], MAT.GLOW).boxB(0, y + 0.62, -0.25, 3.3, 0.03, 0.08);
  }
  for (const sx of [-1.68, 1.68]) b.color(PAL.metalDark).boxB(sx, 0, -0.25, 0.06, 1.9, 0.8);
  b.color([0.45, 0.6, 0.7]).cyl(1.45, 0, 0.3, 0.16, 0.16, 0.6, 8);
  O.kasvu = b.build();
  b = new MB(); b.jit = 0.02; // relvakapp
  b.color([0.24, 0.26, 0.24], MAT.WORN).boxB(0, 0, -0.62, 1.2, 2.0, 0.45);
  b.color([0.10, 0.10, 0.11]).boxB(0, 0.1, -0.39, 1.05, 1.8, 0.01);
  for (let i = 0; i < 4; i++) { b.color([0.08, 0.08, 0.085]).boxB(-0.36 + i * 0.24, 0.35, -0.47, 0.05, 1.05, 0.06); b.color(PAL.wood).boxB(-0.36 + i * 0.24, 0.2, -0.47, 0.07, 0.3, 0.08); }
  b.color([0.30, 0.31, 0.30], MAT.WORN).boxB(0.3, 0.1, -0.36, 0.5, 1.8, 0.04);
  b.color(PAL.hazard).boxB(0.3, 1.6, -0.335, 0.4, 0.06, 0.01);
  b.color([1.0, 0.3, 0.15], MAT.GLOW).boxB(0.1, 1.0, -0.33, 0.03, 0.06, 0.01);
  O.relvakapp = b.build();
  // ---- kaitseliin (Starship Troopers) ----
  const CON = [0.42, 0.40, 0.37], CON2 = [0.30, 0.29, 0.27], HZ = PAL.hazard;
  const myyrB = (b) => {
  b.color(CON, MAT.WORN).boxB(0, 0, 0, 2.0, 0.35, 1.3);
  b.push().tf(0, 0.35, 0, 0, 0, 0).color(CON, MAT.WORN).boxB(0, 0, 0, 2.0, 1.55, 1.0).pop();
  b.color(CON, MAT.WORN).boxB(-0.62, 1.9, 0, 0.76, 0.8, 0.85).boxB(0.62, 1.9, 0, 0.76, 0.8, 0.85);
  b.color(CON2, MAT.WORN).boxB(0, 1.9, -0.1, 0.48, 0.18, 0.85).boxB(0, 2.48, -0.1, 0.48, 0.22, 0.85);
  b.color([0.06, 0.06, 0.06]).boxB(0, 2.08, 0, 0.46, 0.38, 0.6);
  b.color(CON2, MAT.WORN).boxB(0, 2.7, 0, 2.0, 0.05, 0.9);
  for (const sx of [-0.99, 0.99]) b.color(CON2, MAT.WORN).boxB(sx, 0, 0, 0.04, 2.7, 1.05);
  b.color(HZ).boxB(0, 1.0, 0.505, 1.6, 0.12, 0.01);
  for (let i = 0; i < 4; i++) b.color([0.08, 0.08, 0.08]).boxB(-0.6 + i * 0.4, 1.0, 0.506, 0.12, 0.12, 0.01);
  b.color(PAL.metalDark).boxB(0.7, 0.6, -0.505, 0.1, 0.1, 0.02).boxB(-0.7, 0.6, -0.505, 0.1, 0.1, 0.02);
    return b; };
  O.myyr = myyrB(new MB()).build();
  // müüri ühendusdetailid: keskpost + õlg (+z suunas raku servani) + otsapost; kõik raku keskpunktist
  b = new MB(); b.jit = 0.015; // õlg: sama profiil mis müüril, pikkus 1.0 (keskelt servani)
  b.color(CON, MAT.WORN).boxB(0, 0, 0.5, 1.3, 0.35, 1.0);
  b.color(CON, MAT.WORN).boxB(0, 0.35, 0.5, 1.0, 1.55, 1.0);
  b.color(CON, MAT.WORN).boxB(0, 1.9, 0.62, 0.85, 0.8, 0.76);
  b.color(CON2, MAT.WORN).boxB(0, 1.9, 0.12, 0.85, 0.18, 0.24).boxB(0, 2.48, 0.12, 0.85, 0.22, 0.24);
  b.color(CON2, MAT.WORN).boxB(0, 2.7, 0.5, 0.9, 0.05, 1.0);
  for (const sx of [-0.505, 0.505]) b.color(HZ).boxB(sx, 1.0, 0.55, 0.01, 0.12, 0.8);
  O.myyrArm = b.build();
  b = new MB(); b.jit = 0.015; // nurgapost
  b.color(CON, MAT.WORN).boxB(0, 0, 0, 1.45, 0.4, 1.45);
  b.color(CON, MAT.WORN).boxB(0, 0.4, 0, 1.18, 2.5, 1.18);
  b.color(CON2, MAT.WORN).boxB(0, 2.9, 0, 1.34, 0.16, 1.34);
  b.color(CON, MAT.WORN).boxB(0, 3.06, 0, 0.9, 0.3, 0.9);
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) b.color(CON2, MAT.WORN).boxB(x, 0.4, z, 0.08, 2.5, 0.08);
  b.color(PAL.metalDark).boxB(0, 1.6, 0, 1.22, 0.08, 1.22);
  b.color(HZ).boxB(0, 1.0, 0, 1.2, 0.12, 1.2);
  O.myyrPost = b.build();
  b = new MB(); b.jit = 0.015; // otsapost (müürirea lõpp), +z serva juures
  b.color(CON, MAT.WORN).boxB(0, 0, 0.82, 1.42, 0.4, 0.36);
  b.color(CON, MAT.WORN).boxB(0, 0.4, 0.82, 1.14, 2.45, 0.34);
  b.color(CON2, MAT.WORN).boxB(0, 2.85, 0.82, 1.28, 0.14, 0.4);
  b.color(HZ).boxB(0, 1.0, 0.995, 0.9, 0.12, 0.01);
  O.myyrCap = b.build();
  b = new MB(); b.jit = 0.015; // torni seelik: müürilõik torni külje all (+z poole), jalgade vahel
  b.color(CON, MAT.WORN).boxB(0, 0, 1.55, 3.6, 0.35, 1.2);
  b.color(CON, MAT.WORN).boxB(0, 0.35, 1.55, 3.2, 1.55, 0.95);
  for (const x of [-1.05, 0, 1.05]) b.color(CON, MAT.WORN).boxB(x, 1.9, 1.55, 0.7, 0.8, 0.8);
  b.color(CON2, MAT.WORN).boxB(0, 2.7, 1.55, 3.3, 0.06, 0.85);
  b.color(HZ).boxB(0, 1.0, 2.03, 2.8, 0.12, 0.01);
  O.tornSkirt = b.build();
  b = myyrB(new MB()); b.jit = 0.015; // müüriturel: müür + raudalus peal
  b.color(PAL.metalDark).cyl(0, 2.72, 0, 0.62, 0.5, 0.18, 8);
  b.color([0.45, 0.46, 0.42], MAT.RUST).cyl(0, 2.9, 0, 0.26, 0.26, 0.42, 8);
  b.color(PAL.hazard).cyl(0, 2.86, 0, 0.55, 0.55, 0.05, 8);
  for (const sx of [-0.8, 0.8]) b.color(PAL.metalDark).boxB(sx, 2.72, 0.42, 0.06, 0.5, 0.06);
  b.color([0.15, 0.15, 0.14], MAT.WORN).boxB(0, 2.75, -0.42, 1.4, 0.16, 0.25);
  O.myyrturel = b.build();
  b = new MB(); b.jit = 0.015; // ainult turreti pealisosa (ühendatud müüri jaoks)
  b.color(PAL.metalDark).cyl(0, 2.72, 0, 0.62, 0.5, 0.18, 8);
  b.color([0.45, 0.46, 0.42], MAT.RUST).cyl(0, 2.9, 0, 0.26, 0.26, 0.42, 8);
  b.color(PAL.hazard).cyl(0, 2.86, 0, 0.55, 0.55, 0.05, 8);
  O.myyrturelTop = b.build();
  b = new MB(); b.jit = 0.015; // sõlmplokk: müüri kõrgune keskosa, kuhu õlad kinnituvad (turreti alus)
  b.color(CON, MAT.WORN).boxB(0, 0, 0, 1.3, 0.35, 1.3);
  b.color(CON, MAT.WORN).boxB(0, 0.35, 0, 1.0, 2.35, 1.0);
  b.color(CON2, MAT.WORN).boxB(0, 2.7, 0, 1.08, 0.05, 1.08);
  b.color(HZ).boxB(0, 1.0, 0, 1.02, 0.12, 1.02);
  O.myyrHub = b.build();
  b = new MB(); b.jit = 0.015; // vallikäik
  b.color(PAL.metalDark).boxB(0, 1.38, 0, 2.0, 0.12, 2.0);
  for (let i = 0; i < 9; i++) b.color([0.18, 0.18, 0.19]).boxB(-0.88 + i * 0.22, 1.5, 0, 0.04, 0.01, 1.95);
  for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) b.color(CON2, MAT.WORN).boxB(x, 0, z, 0.16, 1.38, 0.16);
  b.color(PAL.metalDark).boxB(0, 0.7, 0.9, 1.8, 0.06, 0.06).boxB(0, 0.7, -0.9, 1.8, 0.06, 0.06);
  b.color(HZ).boxB(0, 1.5, 0.98, 2.0, 0.02, 0.04);
  O.vallikaik = b.build();
  b = new MB(); b.jit = 0.01; // trepp: kõrgem ots -z poole
  for (let k = 0; k < 7; k++) { const y = (k + 1) * 0.214, z = 0.86 - k * 0.286; b.color(k % 2 ? [0.26, 0.26, 0.27] : PAL.metalDark).boxB(0, y - 0.05, z, 1.6, 0.05, 0.29); }
  for (const sx of [-0.82, 0.82]) b.push().tf(sx, 0.75, 0, 0, Math.atan2(1.5, 2.0), 0).color(PAL.metalDark).boxB(0, -0.06, 0, 0.06, 0.12, 2.5).pop();
  b.color(HZ).boxB(0, 0.02, 0.98, 1.6, 0.02, 0.04);
  O.trepp = b.build();
  b = new MB(); b.jit = 0.015; // vahitorn 2x2
  for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) b.color(CON2, MAT.WORN).boxB(x, 0, z, 0.4, 6.0, 0.4);
  for (const y of [1.8, 3.8]) { b.color(PAL.metalDark).boxB(0, y, -1.6, 3.2, 0.12, 0.12).boxB(0, y, 1.6, 3.2, 0.12, 0.12).boxB(-1.6, y, 0, 0.12, 0.12, 3.2).boxB(1.6, y, 0, 0.12, 0.12, 3.2); }
  b.color(CON, MAT.WORN).boxB(0, 5.9, 0, 4.0, 0.25, 4.0);
  for (const [x, z, w, d] of [[0, -1.95, 4, 0.1], [0, 1.95, 4, 0.1], [-1.95, 0, 0.1, 4], [1.95, 0, 0.1, 4]]) b.color(CON, MAT.WORN).boxB(x, 6.15, z, w, 1.0, d);
  for (const [x, z] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) b.color(PAL.metalDark).boxB(x, 7.15, z, 0.12, 1.4, 0.12);
  b.color(CON2, MAT.RUST).boxB(0, 8.5, 0, 4.4, 0.2, 4.4);
  b.color(HZ).boxB(0, 6.9, 1.99, 3.6, 0.1, 0.02);
  for (let k = 0; k < 18; k++) b.color(PAL.metalDark).boxB(1.75, 0.3 + k * 0.33, 2.05, 0.4, 0.04, 0.05);
  b.color(PAL.metalDark).boxB(1.55, 0, 2.05, 0.05, 6.1, 0.05).boxB(1.95, 0, 2.05, 0.05, 6.1, 0.05);
  b.color([1.0, 0.95, 0.8], MAT.GLOW).cyl(1.7, 7.3, 1.7, 0.18, 0.18, 0.12, 8);
  O.torn = b.build();
  b = new MB(); b.jit = 0.015; // värava pukid (2x1 = 4 m)
  for (const sx of [-1.75, 1.75]) b.color(CON, MAT.WORN).boxB(sx, 0, 0, 0.5, 3.2, 1.3);
  b.color(CON2, MAT.WORN).boxB(0, 2.9, 0, 4.0, 0.35, 1.0);
  b.color(HZ).boxB(0, 3.0, 0.51, 3.0, 0.12, 0.01);
  b.color([0.3, 1.0, 0.5], MAT.GLOW).boxB(-1.75, 2.6, 0.66, 0.2, 0.1, 0.02); b.color([1.0, 0.3, 0.2], MAT.GLOW).boxB(1.75, 2.6, 0.66, 0.2, 0.1, 0.02);
  b.color(PAL.metalDark).boxB(0, 0, 0, 4.0, 0.06, 0.3);
  O.varav = b.build();
  b = new MB(); b.jit = 0.01; // värava liuguks
  b.color([0.24, 0.24, 0.25], MAT.WORN).boxB(0, 0.05, 0, 3.0, 2.8, 0.25);
  for (let i = 0; i < 4; i++) b.color(PAL.metalDark).boxB(0, 0.4 + i * 0.6, 0.13, 2.9, 0.1, 0.02);
  for (let i = 0; i < 6; i++) b.push().tf(-1.25 + i * 0.5, 0.3, 0.14, 0, 0, 0.6).color(HZ).boxB(0, 0, 0, 0.12, 0.45, 0.01).pop();
  O.varavPanel = b.build();
  b = new MB(); b.jit = 0.04; // kuulipildujapesa 2x1
  for (let k = 0; k < 14; k++) { const a = Math.PI * (k / 13), x = Math.cos(a) * 1.6, z = -Math.sin(a) * 0.75 + 0.2; for (let r = 0; r < 3; r++) b.push().tf(x, r * 0.3, z, a, 0, 0).color(r % 2 ? [0.55, 0.45, 0.32] : [0.6, 0.5, 0.36]).boxB(0, 0, 0, 0.42, 0.3, 0.28).pop(); }
  b.color(PAL.metalDark).cyl(0, 0, 0.5, 0.06, 0.08, 0.95, 6);
  b.push().tf(0, 1.0, 0.5, 0, Math.PI / 2, 0).color([0.12, 0.12, 0.13]).boxB(0, 0, -0.2, 0.18, 0.2, 0.6).cyl(0, 0, -0.9, 0.03, 0.03, 0.9, 6).pop();
  b.color([0.40, 0.42, 0.30]).boxB(0.3, 0.98, 0.45, 0.2, 0.15, 0.3);
  O.kmpesa = b.build();
  b = new MB(); b.jit = 0.02; // tankitõke (siil)
  for (const [yw, rl] of [[0, 0.75], [Math.PI / 2, 0.75], [Math.PI / 4, -0.75]]) b.push().tf(0, 0.6, 0, yw, 0, rl).color([0.30, 0.27, 0.24], MAT.RUST).boxB(0, -0.85, 0, 0.14, 1.7, 0.14).pop();
  O.siil = b.build();
  b = new MB(); b.jit = 0.03; // okastraat
  for (const x of [-0.9, 0, 0.9]) b.color(PAL.metalDark).boxB(x, 0, 0, 0.05, 0.9, 0.05);
  for (let k = 0; k < 24; k++) { const a = k / 24 * TAU * 3; b.push().tf(-0.95 + k * 0.083, 0.45 + Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0, 0, 0).color([0.42, 0.40, 0.38]).boxB(0, 0, 0, 0.09, 0.02, 0.02).pop(); }
  O.okas = b.build();
  b = new MB(); b.jit = 0.02; // kaardilaud
  b.color(PAL.metalDark).boxB(0, 0, -0.1, 1.4, 0.85, 1.0);
  b.color([0.25, 0.55, 0.45], MAT.GLOW).boxB(0, 0.86, -0.1, 1.3, 0.02, 0.9);
  for (let i = 0; i < 5; i++) b.color([0.9, 0.5, 0.15], MAT.GLOW).boxB(-0.5 + Math.sin(i * 2.3) * 0.4, 0.89, -0.1 + Math.cos(i * 1.7) * 0.3, 0.06, 0.03, 0.06);
  b.color([0.15, 0.15, 0.16]).boxB(0.55, 0.88, -0.45, 0.25, 0.25, 0.15);
  O.kaardilaud = b.build();
  b = new MB(); b.jit = 0.03; // kristallilihvija 2x1
  b.color([0.30, 0.34, 0.36], MAT.RUST).boxB(0, 0, -0.2, 3.2, 0.9, 1.2);
  b.push().tf(-0.6, 1.25, -0.2, 0, 0, Math.PI / 2).color([0.42, 0.45, 0.47], MAT.RUST).cyl(0, -0.75, 0, 0.45, 0.45, 1.5, 10).pop();
  b.color(PAL.metalDark).boxB(1.0, 0.9, -0.2, 0.9, 0.9, 0.9);
  b.color(PAL.crystal, MAT.GLOW).boxB(1.0, 1.82, -0.2, 0.7, 0.06, 0.7);
  b.color(PAL.crystal2, MAT.GLOW).boxB(-0.6, 1.25, 0.27, 1.2, 0.08, 0.02);
  b.color(PAL.hazard).boxB(0, 0.05, 0.42, 3.2, 0.1, 0.04);
  O.lihvija = b.build();
  b = new MB(); b.jit = 0.03; // raviala
  b.color([0.80, 0.80, 0.78]).boxB(0, 0, 0, 0.9, 0.6, 1.9);
  b.color([0.62, 0.78, 0.72]).boxB(0, 0.6, 0.05, 0.85, 0.12, 1.7);
  b.color([0.82, 0.82, 0.8]).boxB(-0.55, 0, -0.6, 0.1, 2.0, 0.1).boxB(0.55, 0, -0.6, 0.1, 2.0, 0.1).boxB(0, 1.95, -0.6, 1.2, 0.12, 0.25);
  b.color([0.3, 1.0, 0.6], MAT.GLOW).boxB(0, 1.88, -0.6, 0.9, 0.04, 0.16);
  b.color([0.75, 0.2, 0.18]).boxB(0, 1.4, -0.71, 0.3, 0.3, 0.04);
  O.ravila = b.build();
  b = new MB(); b.jit = 0.03; // sügavskanner 2x2
  b.color([0.28, 0.30, 0.33], MAT.RUST).cyl(0, 0, 0, 1.6, 1.4, 0.5, 10);
  b.color([0.36, 0.38, 0.40], MAT.RUST).cyl(0, 0.5, 0, 0.7, 0.55, 2.6, 8);
  b.color(PAL.crystal, MAT.GLOW).cyl(0, 3.1, 0, 0.35, 0.0, 0.8, 6);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    b.push().tf(Math.cos(a) * 1.35, 0.5, Math.sin(a) * 1.35, -a + Math.PI / 2, 0, 0).color(PAL.metalDark).boxB(0, 0, 0, 0.7, 1.1, 0.2).color([0.4, 1.0, 0.7], MAT.GLOW).boxB(0, 0.7, 0.11, 0.55, 0.35, 0.02).pop();
  }
  O.skanner = b.build();
  b = new MB(); b.jit = 0; // skanneri pöörlev rõngas
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * TAU, a1 = ((i + 0.7) / 12) * TAU;
    b.color(i % 2 ? PAL.hazard : PAL.metalLight).quad([Math.cos(a0) * 1.15, 0.06, Math.sin(a0) * 1.15], [Math.cos(a1) * 1.15, 0.06, Math.sin(a1) * 1.15], [Math.cos(a1) * 0.95, 0.06, Math.sin(a1) * 0.95], [Math.cos(a0) * 0.95, 0.06, Math.sin(a0) * 0.95]);
    b.color(PAL.metalDark).quad([Math.cos(a0) * 0.95, -0.02, Math.sin(a0) * 0.95], [Math.cos(a1) * 0.95, -0.02, Math.sin(a1) * 0.95], [Math.cos(a1) * 1.15, -0.02, Math.sin(a1) * 1.15], [Math.cos(a0) * 1.15, -0.02, Math.sin(a0) * 1.15]);
  }
  O.skannerRing = b.build();
  b = new MB(); b.jit = 0.03; // radar
  b.color(PAL.metalDark).boxB(0, 0, 0, 1.2, 0.3, 1.2);
  b.color([0.5, 0.5, 0.52], MAT.RUST).cyl(0, 0.3, 0, 0.12, 0.08, 4.0, 6);
  b.color(PAL.hazard).boxB(0, 1.0, 0, 0.3, 0.1, 0.3);
  O.radar = b.build();
  b = new MB(); b.jit = 0;
  b.push().tf(0, 0, 0, 0, -0.35, 0).color([0.72, 0.72, 0.7]).cyl(0, 0, 0.0, 0.0, 1.1, 0.45, 10).pop();
  b.color(PAL.metalDark).boxB(0, 0, 0, 0.2, 0.2, 0.3);
  b.color([1, 0.3, 0.2], MAT.GLOW).boxB(0, 0.25, 0.55, 0.06, 0.06, 0.06);
  O.radarDish = b.build();
  b = new MB(); b.jit = 0.03; // generaator 2x1
  b.color([0.40, 0.42, 0.38], MAT.RUST).boxB(0, 0, -0.25, 3.4, 1.3, 1.3);
  for (let i = 0; i < 10; i++) b.color(PAL.metalDark).boxB(-1.5 + i * 0.33, 0.2, 0.42, 0.06, 0.9, 0.05);
  b.color([0.36, 0.38, 0.35], MAT.RUST).cyl(-1.0, 1.3, -0.3, 0.42, 0.42, 0.8, 10).cyl(0.9, 1.3, -0.5, 0.18, 0.18, 1.6, 8);
  b.color(PAL.hazard).boxB(0, 1.3, -0.25, 3.4, 0.08, 1.3);
  b.color([0.4, 1.0, 0.5], MAT.GLOW).boxB(1.2, 0.9, 0.42, 0.25, 0.12, 0.03);
  b.color([1.0, 0.6, 0.2], MAT.GLOW).boxB(0.85, 0.9, 0.42, 0.12, 0.12, 0.03);
  O.generaator = b.build();
  b = new MB(); b.jit = 0.03; // päikesepaneel
  b.color(PAL.metalDark).cyl(0, 0, 0, 0.1, 0.08, 1.3, 6);
  b.push().tf(0, 1.35, 0, 0, -0.55, 0).color([0.12, 0.16, 0.30]).boxB(0, 0, 0, 1.8, 0.06, 1.6);
  for (let i = 0; i < 4; i++) b.color([0.65, 0.68, 0.72]).boxB(-0.9 + i * 0.6 + 0.3, 0.035, 0, 0.02, 0.02, 1.6);
  b.color([0.65, 0.68, 0.72]).boxB(0, 0.035, 0, 1.8, 0.02, 0.02);
  b.pop();
  O.paike = b.build();
  b = new MB(); b.jit = 0.03; // kahuri alus
  b.color(PAL.metalDark).cyl(0, 0, 0, 0.75, 0.6, 0.45, 8);
  b.color([0.45, 0.46, 0.42], MAT.RUST).cyl(0, 0.45, 0, 0.3, 0.3, 0.8, 8);
  b.color(PAL.hazard).cyl(0, 0.42, 0, 0.62, 0.62, 0.06, 8);
  O.kahur = b.build();
  b = new MB(); b.jit = 0.03; // kahuri pea
  b.color([0.42, 0.44, 0.40], MAT.RUST).boxB(0, -0.25, -0.05, 0.75, 0.5, 0.8);
  b.color(PAL.metalDark).boxB(0, 0.05, -0.25, 0.5, 0.2, 0.4);
  for (const x of [-0.17, 0.17]) b.push().tf(x, 0, 0.3, 0, Math.PI / 2, 0).color(PAL.metalDark).cyl(0, 0, 0, 0.07, 0.06, 0.9, 6).pop();
  b.color([1, 0.25, 0.15], MAT.GLOW).boxB(0, 0.0, 0.36, 0.12, 0.06, 0.02);
  O.kahurHead = b.build();
  b = new MB(); b.jit = 0.1; // barrikaad
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - (r % 2); i++) {
    b.color(mixRgb([0.56, 0.47, 0.34], [0.46, 0.38, 0.28], (r + i) % 2)).boxB(-0.75 + i * 0.5 + (r % 2) * 0.25, r * 0.28, 0, 0.48, 0.28, 0.6);
  }
  b.color([0.45, 0.32, 0.22], MAT.RUST).boxB(0, 0.84, -0.1, 1.9, 0.5, 0.06);
  O.barrikaad = b.build();
  b = new MB(); b.jit = 0.03; // prožektor
  b.color(PAL.metalDark).boxB(0, 0, 0, 0.6, 0.2, 0.6);
  b.color([0.45, 0.45, 0.47], MAT.RUST).cyl(0, 0.2, 0, 0.07, 0.06, 3.6, 6);
  b.push().tf(0, 3.8, 0.1, 0, 0.5, 0).color([0.3, 0.3, 0.32]).boxB(0, 0, 0, 0.7, 0.4, 0.35).color([1.0, 0.95, 0.8], MAT.GLOW).boxB(0, 0, 0.18, 0.6, 0.32, 0.02).pop();
  O.prozektor = b.build();
  b = new MB(); b.jit = 0.03; // sideterminal
  b.color([0.36, 0.38, 0.36], MAT.RUST).boxB(0, 0, -0.55, 1.4, 1.0, 0.6);
  b.push().tf(0, 1.0, -0.6, 0, 0.35, 0).color([0.30, 0.32, 0.30], MAT.RUST).boxB(0, 0, 0, 1.4, 0.75, 0.25).pop();
  b.push().tf(0, 1.05, -0.47, 0, 0.35, 0).color([0.35, 0.9, 0.75], MAT.GLOW).boxB(0, 0.3, 0.05, 1.15, 0.55, 0.02).pop();
  b.color(PAL.metalDark).boxB(0, 0.95, -0.2, 1.2, 0.06, 0.3);
  b.color([1, 0.5, 0.2], MAT.GLOW).boxB(-0.5, 0.99, -0.15, 0.06, 0.03, 0.06).boxB(-0.38, 0.99, -0.15, 0.06, 0.03, 0.06);
  b.color(PAL.metalDark).cyl(0.55, 1.7, -0.75, 0.025, 0.02, 1.2, 4);
  O.terminal = b.build();
  b = new MB(); b.jit = 0.06; // hoidla
  b.color([0.40, 0.36, 0.26], MAT.RUST).boxB(-0.35, 0, -0.35, 1.1, 0.8, 0.9);
  b.color([0.35, 0.40, 0.30], MAT.RUST).boxB(0.45, 0, -0.4, 0.8, 0.7, 0.8);
  b.color([0.45, 0.40, 0.28], MAT.RUST).boxB(-0.3, 0.8, -0.4, 0.8, 0.6, 0.7);
  b.color(PAL.hazard).boxB(-0.35, 0.3, 0.11, 1.1, 0.1, 0.02);
  b.color(PAL.metalDark).boxB(0.45, 0.7, -0.4, 0.6, 0.04, 0.6);
  b.color(PAL.crystal, MAT.GLOW).boxB(0.45, 0.78, -0.4, 0.4, 0.12, 0.4);
  O.hoidla = b.build();
  // uks (paneel)
  b = new MB(); b.jit = 0.02;
  // futuristlik liuguksepool: tõstetud plaat, kaldnurk, aknapilu, helendav riba, ohutriibud
  b.color([0.20, 0.21, 0.23], MAT.RUST).boxB(0, 0, 0, 0.72, 2.3, 0.08);
  b.color([0.36, 0.37, 0.40], MAT.RUST).boxB(0, 0.38, 0, 0.56, 1.72, 0.1);
  b.push().tf(0.25, 2.05, 0, 0, 0, Math.PI / 4).color([0.20, 0.21, 0.23]).boxB(0, -0.05, 0, 0.3, 0.1, 0.105).pop();
  b.push().tf(-0.25, 2.05, 0, 0, 0, -Math.PI / 4).color([0.20, 0.21, 0.23]).boxB(0, -0.05, 0, 0.3, 0.1, 0.105).pop();
  b.color([1.0, 0.55, 0.18], MAT.GLOW).boxB(0, 1.06, 0, 0.5, 0.045, 0.11);
  b.color([0.35, 0.62, 0.72], MAT.GLOW).boxB(0, 1.4, 0, 0.1, 0.5, 0.105);
  b.color([0.06, 0.06, 0.07]).boxB(0, 0.1, 0, 0.6, 0.24, 0.1);
  for (let k = 0; k < 4; k++) b.push().tf(-0.22 + k * 0.15, 0.22, 0, 0, 0, 0.7).color(PAL.hazard).boxB(0, -0.1, 0, 0.05, 0.2, 0.105).pop();
  O.doorPanel = b.build();
  // välisvalgusti ukse kohal
  b = new MB(); b.jit = 0;
  b.color(PAL.metalDark).boxB(0, 0, 0, 0.36, 0.14, 0.22);
  b.color([1.0, 0.82, 0.55], MAT.GLOW).boxB(0, -0.02, 0.03, 0.26, 0.06, 0.16);
  O.doorLamp = b.build();
  // valgusti (lae paneel)
  b = new MB(); b.jit = 0;
  b.color(PAL.metalDark).boxB(0, 0, 0, 0.9, 0.08, 0.9);
  b.color([1.0, 0.9, 0.72], MAT.GLOW).boxB(0, -0.04, 0, 0.7, 0.02, 0.7);
  O.ceilLamp = b.build();
  // konkurendi laagri tuum
  b = new MB(); b.jit = 0.04;
  b.color(PAL.metalDark).cyl(0, 0, 0, 2.2, 1.8, 1.0, 8);
  b.color([0.35, 0.33, 0.32], MAT.RUST).cyl(0, 1.0, 0, 1.2, 0.9, 3.0, 8);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU; b.color(PAL.metal, MAT.RUST).boxB(Math.cos(a) * 1.4, 0.5, Math.sin(a) * 1.4, 0.5, 2.6, 0.5); }
  b.color([1.0, 0.5, 0.3], MAT.GLOW).cyl(0, 4.0, 0, 0.7, 0.2, 1.4, 8);
  O.core = b.build();
  b = new MB(); b.jit = 0.05; // telk/barakk
  b.color([0.42, 0.38, 0.32], MAT.RUST).boxB(0, 0, 0, 6, 2.6, 4);
  b.push().tf(0, 2.6, 0, 0, 0, 0).color([0.35, 0.32, 0.28]).quad([-3.2, 0, -2.2], [-3.2, 0, 2.2], [0, 1.2, 2.2], [0, 1.2, -2.2]).quad([3.2, 0, 2.2], [3.2, 0, -2.2], [0, 1.2, -2.2], [0, 1.2, 2.2]).pop();
  b.color(PAL.metalDark).boxB(0, 0, 2.02, 1.4, 2.1, 0.05);
  O.barrack = b.build();
  b = new MB(); b.jit = 0.05; // lipp/torn
  b.color(PAL.metalDark).cyl(0, 0, 0, 0.12, 0.1, 7, 5);
  b.color([1, 1, 1]).boxB(0.7, 5.8, 0, 1.4, 0.9, 0.03);
  O.flagpole = b.build();
}

// ============================================================
//  IMPORDITUD MUDELID (KayKit CC0, Kenney MIT) — vt 00_assets.js
// ============================================================
const Imported = (() => {
  let bin = null;
  function bytes() {
    if (!bin) bin = bytesOf(MODEL_DATA.b64);
    return bin.buffer;
  }
  function raw(name) {
    const e = MODEL_DATA.index[name];
    if (!e) return null;
    const buf = bytes(); let o = e.o;
    const q = new Uint16Array(buf, o, e.nv * 3); o += e.nv * 6; o = (o + 3) & ~3;
    const nn = new Int8Array(buf, o, e.nv * 3); o += e.nv * 3; o = (o + 3) & ~3;
    const cc = new Uint8Array(buf, o, e.nv * 4); o += e.nv * 4;
    const ii = new Uint16Array(buf, o, e.ni);
    const pos = new Float32Array(e.nv * 3), nor = new Float32Array(e.nv * 3);
    for (let i = 0; i < e.nv; i++) for (let k = 0; k < 3; k++) { pos[i * 3 + k] = e.mn[k] + q[i * 3 + k] * e.sc[k]; nor[i * 3 + k] = nn[i * 3 + k] / 127; }
    return { pos, nor, col: new Uint8Array(cc), idx: Array.from(ii) };
  }
  function fromMB(b) { const n = b.p.length / 3; return { pos: new Float32Array(b.p), nor: new Float32Array(b.n), col: new Uint8Array(b.c), idx: Array.from({ length: n }, (_, i) => i) }; }
  // osad: [{d, m (mat4 või null)}]
  function merge(parts) {
    let nv = 0, ni = 0;
    for (const p of parts) { nv += p.d.pos.length / 3; ni += p.d.idx.length; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Uint8Array(nv * 4);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const { d, m } of parts) {
      const n = d.pos.length / 3;
      for (let i = 0; i < n; i++) {
        let x = d.pos[i * 3], y = d.pos[i * 3 + 1], z = d.pos[i * 3 + 2], a = d.nor[i * 3], b = d.nor[i * 3 + 1], c = d.nor[i * 3 + 2];
        if (m) {
          const X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14];
          x = X; y = Y; z = Z;
          const A = m[0] * a + m[4] * b + m[8] * c, B = m[1] * a + m[5] * b + m[9] * c, C = m[2] * a + m[6] * b + m[10] * c;
          const l = Math.hypot(A, B, C) || 1; a = A / l; b = B / l; c = C / l;
        }
        const o = (vo + i) * 3;
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; nor[o] = a; nor[o + 1] = b; nor[o + 2] = c;
      }
      col.set(d.col, vo * 4);
      for (let k = 0; k < d.idx.length; k++) idx[io + k] = d.idx[k] + vo;
      vo += n; io += d.idx.length;
    }
    return new GFX.Mesh({ pos, nor, col, idx });
  }
  function mesh(name, m) { const d = raw(name); return d ? merge([{ d, m: m || null }]) : null; }
  return { raw, fromMB, merge, mesh, has: (n) => typeof MODEL_DATA !== 'undefined' && !!MODEL_DATA.index[n] };
})();

function applyImportedModels() {
  // protseduursete inimeste ühtne rigi kirjeldus
  for (const k of Object.keys(MODELS.human)) {
    const P = MODELS.human[k];
    Object.assign(P, { armL: P.arm, armR: P.arm, legL: P.leg, legR: P.leg, rig: { hip: 0.95, hipZ: 0, head: [0, 0.62, 0], armL: [0.31, 0.5, 0], armR: [-0.31, 0.5, 0], legL: [0.12, 0.95, 0], legR: [-0.12, 0.95, 0] } });
  }
  if (typeof MODEL_DATA === 'undefined') return;
  // päris tegelased (Kenney, CC0): ellujäänud meeskonnale, küborg Krell-Vargale, palgasõdur klannile
  const CH = MODEL_DATA.chars || {};
  const mk = (key) => {
    const c = CH[key]; if (!c || !Imported.has('chr_' + key + '_body')) return null;
    const P = {};
    for (const q of ['body', 'head', 'armL', 'armR', 'legL', 'legR']) P[q] = Imported.mesh('chr_' + key + '_' + q);
    P.rig = { hip: c.body[1], hipZ: c.body[2], head: c.head, armL: c.armL, armR: c.armR, legL: c.legL, legR: c.legR };
    return P;
  };
  const crew = mk('crew'), crew2 = mk('crew2'), krell = mk('krell'), klann = mk('klann');
  if (crew) { MODELS.human.crew = crew; MODELS.human.player = crew; MODELS.human.crew2 = crew2 || crew; }
  if (krell) MODELS.human.krell = krell;
  if (klann) MODELS.human.klann = klann;
  const O = MODELS.obj, I = Imported, T = (x, y, z, yaw = 0, sx = 1, sy = 1, sz = 1) => M4.compose(M4.create(), x, y, z, yaw, 0, 0, sx, sy, sz);
  O.voodi = I.mesh('voodi');
  // narivoodi: metallraam + kaks voodit
  const b = new MB(); b.jit = 0.03;
  const ST = [0.40, 0.41, 0.43];
  for (const [x, z] of [[-0.5, -0.92], [0.5, -0.92], [-0.5, 0.92], [0.5, 0.92]]) b.color(ST, MAT.RUST).boxB(x, 0, z, 0.07, 2.05, 0.07);
  for (const z of [-0.92, 0.92]) b.color(ST, MAT.RUST).boxB(0, 1.12, z, 1.07, 0.06, 0.06);
  for (let i = 0; i < 4; i++) b.color(PAL.metalDark).boxB(0.55, 0.5 + i * 0.32, 0.55, 0.04, 0.04, 0.42);
  const bed = I.raw('nari_bed');
  O.nari = I.merge([{ d: I.fromMB(b), m: null }, { d: bed, m: T(0, 0.02, 0, 0, 1, 0.82, 1) }, { d: bed, m: T(0, 1.12, 0, 0, 1, 0.82, 1) }]);
  O.laud = I.mesh('laud');
  O.diivan = I.mesh('diivan', T(0, 0, -0.45));
  O.taim = I.mesh('taim');
  O.hoidla = I.mesh('hoidla');
  O.paike = I.mesh('paike', T(0, 0, 0, Math.PI));
  // Quaternius Modular Sci-Fi (CC0): realistlikum tehnika
  if (I.has('q_terminal')) {
    O.terminal = I.mesh('q_terminal', T(0, 0, -0.55, 0));
    O.toolaud = I.mesh('q_console', T(0, 0, -0.62, Math.PI));
    O.ravila = I.mesh('q_capsule', T(0, 0, -0.2));
    O.skanner = I.mesh('q_scanner');
    O.lihvija = I.mesh('q_laser');
    O.hoidla = I.mesh('q_shelf', T(0, 0, -0.5, Math.PI));
    for (const k of ['q_crate', 'q_crate_long', 'q_container', 'q_chest', 'q_pod', 'q_vessel']) MODELS[k] = I.mesh(k);
  }
  MODELS.wrecks = [0, 1, 2, 3].map((i) => I.mesh('wreck' + i));
  MODELS.rocks = [0, 1, 2, 3].map((i) => I.mesh('rock' + i));
  if (I.has('ship_wreck')) MODELS.wrecks[4] = I.mesh('ship_wreck');
  if (I.has('formation0')) MODELS.formations = [0, 1, 2, 3].map((i) => I.mesh('formation' + i));
  for (const k of ['comm_tower', 'scifi_crate', 'barrel']) if (I.has(k)) MODELS[k] = I.mesh(k);
  for (const k of ['camp_module', 'camp_module2', 'camp_core', 'camp_cargo', 'camp_pad', 'camp_lander', 'camp_turbine', 'camp_lights', 'base_pad', 'base_truck']) MODELS[k] = I.mesh(k);
  // relvad: toru +z, käepide all; skaleeri ~0.6 m pikkuseks
  MODELS.rifleFPS = I.mesh('gun_rifle', M4.compose(M4.create(), 0, -0.095, -0.02, 0, 0, 0, 0.2, 0.2, 0.2));
  MODELS.railFPS = I.mesh('gun_rail', M4.compose(M4.create(), 0, -0.1, 0.0, 0, 0, 0, 0.22, 0.22, 0.22));
  MODELS.rifleNPC = I.mesh('gun_rifle', M4.compose(M4.create(), 0, -0.09, 0.08, 0, 0, 0, 0.26, 0.26, 0.26));
  MODELS.carbine = buildCarbine(false);
  MODELS.shotgun = buildShotgun(); MODELS.pistol = buildPistol(); MODELS.smg = buildSMG(); MODELS.lmg = buildLMG(); MODELS.sniper = buildSniper();
  MODELS.carbineTan = buildCarbine(true);
  MODELS.rifleNPC = MODELS.carbine;
  if (typeof applyGunModels === 'function') applyGunModels();
  if (typeof applyCreatureModels === 'function') applyCreatureModels();
  if (typeof applyBaseModels === 'function') applyBaseModels();
  if (typeof applyPropModels === 'function') applyPropModels();
}
// realistlik karabiin (päris mõõdud, ~0.93 m). Alguspunkt: püstolkäepideme ülaosa, +z ette, +y üles
function buildCarbine(tan) {
  const b = new MB(); b.jit = 0;
  const BLK = [0.10, 0.10, 0.105], MET = [0.19, 0.195, 0.205], MET2 = [0.28, 0.285, 0.295], ACC = tan ? [0.46, 0.38, 0.27] : [0.11, 0.115, 0.12];
  const rz = (z0, z1) => [z0, z1];
  // lukukoda (alumine + ülemine)
  b.color(MET).boxB(0, 0.0, 0.065, 0.034, 0.042, 0.2);
  b.color(MET2).boxB(0, 0.042, 0.075, 0.036, 0.034, 0.25);
  b.color(BLK).boxB(-0.0185, 0.05, 0.08, 0.002, 0.016, 0.055); // väljaviskeava
  b.color(MET).boxB(0.0, 0.07, -0.035, 0.02, 0.012, 0.04); // laadimiskäepide
  // pikatinny siin
  b.color(MET).boxB(0, 0.076, 0.13, 0.022, 0.006, 0.36);
  for (let i = 0; i < 26; i++) b.color(BLK).boxB(0, 0.082, -0.04 + i * 0.0135, 0.024, 0.004, 0.006);
  // käekaitse (kaheksakant) + külgsiinid
  b.push().tf(0, 0.04, 0.17, 0, Math.PI / 2, 0).color(ACC).cyl(0, 0, 0, 0.026, 0.026, 0.26, 8, true, Math.PI / 8).pop();
  for (const sx of [-1, 1]) b.color(BLK).boxB(sx * 0.026, 0.035, 0.30, 0.006, 0.012, 0.22);
  b.color(BLK).boxB(0, 0.008, 0.3, 0.012, 0.006, 0.22);
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) b.color(BLK).boxB(sx * 0.0265, 0.05, 0.215 + i * 0.035, 0.002, 0.008, 0.016); // ventilatsiooniavad
  // eesmine vertikaalkäepide
  b.push().tf(0, 0.0, 0.33, 0, 0.12, 0).color(BLK).cyl(0, -0.075, 0, 0.014, 0.016, 0.075, 8).pop();
  // raud, gaasiplokk, leegisummuti
  b.push().tf(0, 0.04, 0.43, 0, Math.PI / 2, 0).color(MET).cyl(0, 0, 0, 0.0085, 0.0085, 0.15, 8).pop();
  b.color(MET).boxB(0, 0.03, 0.45, 0.02, 0.03, 0.025);
  b.push().tf(0, 0.04, 0.58, 0, Math.PI / 2, 0).color(BLK).cyl(0, 0, 0, 0.012, 0.012, 0.055, 8).pop();
  for (let i = 0; i < 3; i++) b.color(MET).boxB(0, 0.052, 0.583 + i * 0.012, 0.004, 0.004, 0.006);
  // eesmine sihik
  b.color(BLK).boxB(0, 0.08, 0.43, 0.012, 0.035, 0.012);
  // salv (kumer, kahest osast)
  b.push().tf(0, 0.0, 0.085, 0, 0.12, 0).color(BLK).boxB(0, -0.1, 0, 0.026, 0.1, 0.058).pop();
  b.push().tf(0, -0.095, 0.098, 0, 0.32, 0).color(BLK).boxB(0, -0.065, 0, 0.025, 0.07, 0.056).pop();
  b.color(MET).boxB(0, -0.006, 0.085, 0.036, 0.012, 0.07); // salvepesa
  // püstolkäepide + päästik
  b.push().tf(0, 0.0, 0.0, 0, -0.32, 0).color(BLK).boxB(0, -0.105, 0, 0.03, 0.105, 0.042).pop();
  b.color(BLK).boxB(0, -0.032, 0.035, 0.006, 0.004, 0.06); // päästikukaitse
  b.color(MET2).boxB(0, -0.022, 0.03, 0.004, 0.02, 0.006);
  // puhvertoru + teleskoopkaba
  b.push().tf(0, 0.045, -0.19, 0, Math.PI / 2, 0).color(MET).cyl(0, 0, 0, 0.015, 0.015, 0.17, 8).pop();
  b.color(ACC).boxB(0, 0.012, -0.24, 0.036, 0.07, 0.11);
  b.color(BLK).boxB(0, -0.005, -0.3, 0.04, 0.105, 0.022); // kabaplaat
  b.color(ACC).boxB(0, -0.03, -0.215, 0.03, 0.03, 0.08);
  // punase punkti sihik
  b.color(BLK).boxB(0, 0.082, 0.07, 0.03, 0.012, 0.05);
  b.push().tf(0, 0.112, 0.045, 0, Math.PI / 2, 0).color(BLK).cyl(0, 0, 0, 0.02, 0.02, 0.055, 10).pop();
  b.push().tf(0, 0.112, 0.1, 0, Math.PI / 2, 0).color([0.95, 0.25, 0.12], MAT.GLOW).cyl(0, 0, 0, 0.013, 0.013, 0.002, 10).pop();
  // rihma aas, kaitseriiv
  b.color(MET).boxB(0.02, 0.02, -0.02, 0.006, 0.01, 0.018);
  b.color(MET).boxB(0, 0.02, -0.33, 0.014, 0.01, 0.01);
  return b.build();
}

// ---------- lisarelvad (päris mõõdud; alguspunkt käepideme ülaosas, +z ette) ----------
const GUN_C = { BLK: [0.10, 0.10, 0.105], MET: [0.20, 0.205, 0.215], MET2: [0.30, 0.30, 0.31], WOOD: [0.30, 0.19, 0.11], POLY: [0.17, 0.17, 0.16] };
function gunGrip(b, ang, col) { b.push().tf(0, 0, 0, 0, ang, 0).color(col).boxB(0, -0.1, 0, 0.03, 0.1, 0.042).pop(); b.color(GUN_C.BLK).boxB(0, -0.032, 0.035, 0.006, 0.004, 0.06); }
function tube(b, x, y, z, r, len, col, seg = 10) { b.push().tf(x, y, z, 0, Math.PI / 2, 0).color(col).cyl(0, 0, 0, r, r, len, seg).pop(); }
function buildShotgun() {
  const b = new MB(), C = GUN_C; b.jit = 0;
  b.color(C.MET).boxB(0, 0.0, 0.06, 0.038, 0.06, 0.24);          // lukukoda
  b.color(C.BLK).boxB(-0.0195, 0.025, 0.07, 0.002, 0.022, 0.08);   // väljaviskeava
  tube(b, 0, 0.043, 0.18, 0.012, 0.52, C.BLK);                     // raud
  tube(b, 0, 0.017, 0.18, 0.013, 0.42, C.MET);                     // salvetoru
  b.push().tf(0, 0.017, 0.33, 0, Math.PI / 2, 0).color(C.WOOD).cyl(0, 0, 0, 0.022, 0.022, 0.18, 10).pop(); // pumbakäepide
  for (let i = 0; i < 6; i++) b.push().tf(0, 0.017, 0.345 + i * 0.026, 0, Math.PI / 2, 0).color(C.BLK).cyl(0, 0, 0, 0.0225, 0.0225, 0.006, 10).pop();
  b.color(C.MET2).boxB(0, 0.058, 0.68, 0.006, 0.01, 0.006);        // kärbes
  b.color(C.BLK).boxB(0, 0.062, 0.03, 0.008, 0.008, 0.02);
  gunGrip(b, -0.3, C.WOOD);
  b.push().tf(0, 0.0, -0.06, 0.0, -0.08, 0).color(C.WOOD).boxB(0, -0.02, -0.17, 0.036, 0.075, 0.28).pop(); // puitkaba
  b.color(C.BLK).boxB(0, -0.04, -0.34, 0.04, 0.1, 0.02);
  for (let i = 0; i < 4; i++) b.color([0.55, 0.12, 0.08]).boxB(0.021, 0.0 - i * 0.0, 0.0 + i * 0.03, 0.004, 0.018, 0.022); // padrunihoidja
  return b.build();
}
function buildPistol() {
  const b = new MB(), C = GUN_C; b.jit = 0;
  b.color(C.MET).boxB(0, 0.018, 0.075, 0.03, 0.034, 0.2);          // kelk
  for (let i = 0; i < 7; i++) b.color(C.BLK).boxB(0, 0.02, -0.01 + i * 0.008, 0.031, 0.026, 0.003); // sooned
  b.color(C.POLY).boxB(0, -0.008, 0.07, 0.028, 0.018, 0.17);       // raam
  tube(b, 0, 0.022, 0.18, 0.007, 0.012, C.BLK);
  b.color(C.BLK).boxB(0, 0.054, 0.16, 0.006, 0.008, 0.006); b.color(C.BLK).boxB(0, 0.054, -0.015, 0.016, 0.008, 0.006);
  b.push().tf(0, 0, 0, 0, -0.22, 0).color(C.POLY).boxB(0, -0.11, 0, 0.03, 0.11, 0.048).pop();
  b.color(C.POLY).boxB(0, -0.03, 0.04, 0.006, 0.005, 0.055);
  b.color([0.95, 0.5, 0.12], MAT.GLOW).boxB(0, 0.058, 0.16, 0.002, 0.003, 0.002);
  return b.build();
}
function buildSMG() {
  const b = new MB(), C = GUN_C; b.jit = 0;
  b.color(C.POLY).boxB(0, 0.005, 0.08, 0.036, 0.06, 0.28);         // korpus
  b.color(C.MET).boxB(0, 0.045, 0.08, 0.026, 0.012, 0.26);         // siin
  for (let i = 0; i < 16; i++) b.color(C.BLK).boxB(0, 0.052, -0.03 + i * 0.015, 0.028, 0.004, 0.006);
  tube(b, 0, 0.012, 0.3, 0.018, 0.12, C.BLK); tube(b, 0, 0.012, 0.36, 0.008, 0.1, C.MET);
  b.push().tf(0, 0, 0.13, 0, 0.05, 0).color(C.BLK).boxB(0, -0.13, 0, 0.022, 0.13, 0.03).pop(); // pikk salv
  gunGrip(b, -0.25, C.POLY);
  b.push().tf(0, 0.0, 0.24, 0, 0.1, 0).color(C.BLK).cyl(0, -0.06, 0, 0.012, 0.014, 0.06, 8).pop();
  b.color(C.MET).boxB(0.0, 0.01, -0.12, 0.01, 0.01, 0.16); b.color(C.MET).boxB(0, -0.04, -0.2, 0.01, 0.07, 0.01); b.color(C.BLK).boxB(0, -0.02, -0.21, 0.03, 0.09, 0.018); // traatkaba
  b.color(C.BLK).boxB(0, 0.07, 0.06, 0.028, 0.022, 0.05);
  b.color([0.95, 0.25, 0.12], MAT.GLOW).boxB(0, 0.072, 0.086, 0.01, 0.01, 0.002);
  return b.build();
}
function buildLMG() {
  const b = new MB(), C = GUN_C; b.jit = 0;
  b.color(C.MET).boxB(0, 0.0, 0.07, 0.05, 0.07, 0.32);             // lukukoda
  b.color(C.MET2).boxB(0, 0.07, 0.04, 0.054, 0.02, 0.2);           // kaas
  tube(b, 0, 0.04, 0.3, 0.024, 0.32, C.BLK, 12);                   // jahutuskest
  for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) b.color([0.04, 0.04, 0.04]).boxB(sx * 0.024, 0.04, 0.17 + i * 0.035, 0.002, 0.01, 0.014);
  tube(b, 0, 0.04, 0.55, 0.01, 0.22, C.MET);
  b.push().tf(0, 0.04, 0.75, 0, Math.PI / 2, 0).color(C.BLK).cyl(0, 0, 0, 0.016, 0.016, 0.05, 8).pop();
  b.color(C.POLY).boxB(0.0, -0.06, 0.16, 0.08, 0.075, 0.1);         // lindikast
  for (let i = 0; i < 5; i++) b.color([0.65, 0.5, 0.2]).boxB(0.045, 0.02 - i * 0.012, 0.13 + i * 0.006, 0.02, 0.008, 0.008); // padrunilint
  gunGrip(b, -0.3, C.POLY);
  b.color(C.POLY).boxB(0, -0.005, -0.21, 0.042, 0.085, 0.24);      // kaba
  for (const sx of [-1, 1]) b.push().tf(sx * 0.02, 0.0, 0.5, sx * 0.25, 0.5, 0).color(C.BLK).boxB(0, -0.09, 0, 0.008, 0.09, 0.008).pop(); // jalad
  b.color(C.BLK).boxB(0, 0.11, 0.1, 0.02, 0.03, 0.03); b.color(C.MET2).boxB(0, 0.13, 0.06, 0.008, 0.01, 0.12); // kandesang
  return b.build();
}

function buildSniper() {
  const b = new MB(), C = GUN_C; b.jit = 0;
  const OD = [0.24, 0.26, 0.20];
  b.color(C.MET).boxB(0, 0.0, 0.07, 0.036, 0.05, 0.24);                // lukukoda
  b.push().tf(0.026, 0.03, 0.03, 0, 0, Math.PI / 2).color(C.MET2).cyl(0, 0, 0, 0.008, 0.008, 0.06, 6).pop(); // lukupide
  b.color(C.BLK).sphere(0.086, 0.03, 0.03, 0.014, 6, 4);
  tube(b, 0, 0.03, 0.42, 0.013, 0.62, C.BLK, 10);                       // pikk raud
  b.push().tf(0, 0.03, 0.76, 0, Math.PI / 2, 0).color(C.BLK).cyl(0, 0, 0, 0.02, 0.02, 0.07, 8).pop(); // summuti
  b.color(OD).boxB(0, -0.005, 0.28, 0.05, 0.05, 0.36);                  // käekaitse
  b.color(OD).boxB(0, -0.01, -0.2, 0.042, 0.09, 0.3);                   // kaba
  b.color(OD).boxB(0, 0.035, -0.18, 0.03, 0.025, 0.14);                 // põsetugi
  b.color(C.BLK).boxB(0, -0.03, -0.36, 0.044, 0.12, 0.02);
  b.push().tf(0, 0, 0, 0, -0.35, 0).color(OD).boxB(0, -0.1, 0, 0.03, 0.1, 0.045).pop();
  b.color(C.BLK).boxB(0, -0.06, 0.1, 0.024, 0.05, 0.05);                // salv
  // optika
  b.color(C.BLK).boxB(0, 0.055, 0.02, 0.016, 0.02, 0.02).boxB(0, 0.055, 0.15, 0.016, 0.02, 0.02);
  tube(b, 0, 0.1, 0.08, 0.02, 0.32, C.BLK, 12);
  b.push().tf(0, 0.1, 0.27, 0, Math.PI / 2, 0).color(C.BLK).cyl(0, 0, 0, 0.03, 0.03, 0.06, 12).pop();
  b.push().tf(0, 0.1, -0.07, 0, Math.PI / 2, 0).color(C.BLK).cyl(0, 0, 0, 0.026, 0.026, 0.05, 12).pop();
  b.push().tf(0, 0.1, 0.331, 0, Math.PI / 2, 0).color([0.25, 0.4, 0.5], MAT.GLOW).cyl(0, 0, 0, 0.026, 0.026, 0.002, 12).pop();
  b.color(C.MET2).cyl(0, 0.12, 0.08, 0.008, 0.008, 0.02, 6);
  for (const sx of [-1, 1]) b.push().tf(sx * 0.02, -0.03, 0.42, sx * 0.3, 0.45, 0).color(C.BLK).boxB(0, -0.09, 0, 0.007, 0.09, 0.007).pop(); // jalad
  return b.build();
}
