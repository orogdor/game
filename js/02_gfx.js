// ============================================================
//  GRAAFIKAMOOTOR (WebGL2): varjud, udu, taevas, osakesed, instantsid
// ============================================================
const MAT = { N: 0, FLESH: 30, MATTE: 45, WORN: 75, RUST: 120, SAND: 190, METAL: 205, PAINTED: 215, GLOW: 255 };

const GFX = (() => {
  let gl = null, canvas = null;
  const S = {
    w: 1, h: 1, dpr: 1, renderScale: 1,
    shadowsOn: true, shadowSize: 2048, shadowRange: 70,
    drawCalls: 0, tris: 0,
  };
  const env = {
    sunDir: [0.4, 0.5, 0.3], sunCol: [1.3, 0.95, 0.7], skyCol: [0.42, 0.36, 0.38], gndCol: [0.3, 0.2, 0.14],
    fogCol: [0.62, 0.44, 0.32], fogDen: 0.0028, fogH: 0, zenith: [0.25, 0.22, 0.3], horizon: [0.75, 0.52, 0.38],
    night: 0, exposure: 1.5, planetDir: [-0.5, 0.35, -0.8], time: 0,
  };
  const cam = {
    pos: V.new(0, 2, 0), yaw: 0, pitch: 0, fov: 70 * DEG, near: 0.1, far: 1400,
    useTarget: false, target: V.new(),
    view: M4.create(), proj: M4.create(), vp: M4.create(), invVP: M4.create(),
    right: V.new(1, 0, 0), up: V.new(0, 1, 0), fwd: V.new(0, 0, 1), planes: new Float32Array(24),
  };

  // ---------------- varjutajad ----------------
  const LIT_VS = `
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNor;
layout(location=2) in vec4 aCol;
#ifdef INST
layout(location=3) in vec4 aM0;
layout(location=4) in vec4 aM1;
layout(location=5) in vec4 aM2;
layout(location=6) in vec4 aM3;
layout(location=7) in vec4 aIC;
#endif
#ifdef SKIN
layout(location=3) in vec4 aJ;
layout(location=4) in vec4 aW;
out vec2 vUV;
#ifdef BONETEX
uniform highp sampler2D uBoneTex; uniform int uBoneRow;
mat4 boneM(float j){ int x = int(j+0.5)*3; vec4 a = texelFetch(uBoneTex, ivec2(x,uBoneRow), 0), b = texelFetch(uBoneTex, ivec2(x+1,uBoneRow), 0), c = texelFetch(uBoneTex, ivec2(x+2,uBoneRow), 0); return mat4(a.x,b.x,c.x,0.0, a.y,b.y,c.y,0.0, a.z,b.z,c.z,0.0, a.w,b.w,c.w,1.0); }
#else
uniform vec4 uB[96];
mat4 boneM(float j){ int i = int(j+0.5)*3; vec4 a = uB[i], b = uB[i+1], c = uB[i+2]; return mat4(a.x,b.x,c.x,0.0, a.y,b.y,c.y,0.0, a.z,b.z,c.z,0.0, a.w,b.w,c.w,1.0); }
#endif
// FACS näoilmed (Vitruvian): nihked tekstuuris, rida = (tipp/1024)*8 + morf
uniform highp sampler2D uMorphTex; uniform int uMorphN; uniform vec4 uMW[2];
vec3 morphOff(){ vec3 o = vec3(0.0); if (uMorphN == 0) return o; int x = gl_VertexID % 1024, y = (gl_VertexID / 1024) * 8;
  for (int k = 0; k < 8; k++) { float w = uMW[k / 4][k % 4]; if (w != 0.0) o += w * texelFetch(uMorphTex, ivec2(x, y + k), 0).xyz; } return o; }
#endif
uniform mat4 uVP;
uniform mat4 uModel;
uniform mat4 uSVP;
out vec3 vW; out vec3 vN; out vec4 vC; out vec4 vS; out float vE; out vec3 vO; out vec3 vNo;
void main(){
#ifdef SKIN
  mat4 Sk = boneM(aJ.x)*aW.x + boneM(aJ.y)*aW.y + boneM(aJ.z)*aW.z + boneM(aJ.w)*aW.w;
  mat4 M = uModel*Sk; vec4 c = vec4(1.0); vE = 0.0; vUV = aCol.xy;
#elif defined(INST)
  mat4 M = mat4(aM0,aM1,aM2,aM3);
  vec4 c = aCol; c.rgb *= aIC.rgb; vE = aIC.a;
#else
  mat4 M = uModel; vec4 c = aCol; vE = 0.0;
#endif
#ifdef SKIN
  vec4 w = M*vec4(aPos + morphOff(),1.0);
#else
  vec4 w = M*vec4(aPos,1.0);
#endif
  vW = w.xyz; vN = mat3(M)*aNor; vC = c; vS = uSVP*w; vO = aPos; vNo = aNor;
  gl_Position = uVP*w;
}`;
  const LIT_FS = `
precision highp float;
precision highp sampler2DShadow;
in vec3 vW; in vec3 vN; in vec4 vC; in vec4 vS; in float vE; in vec3 vO; in vec3 vNo;
uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uSkyCol; uniform vec3 uGndCol; uniform vec3 uFogCol; uniform vec3 uCam; uniform vec3 uEmis;
uniform float uFogDen; uniform float uExposure; uniform float uRust; uniform float uAlpha; uniform float uShadowOn; uniform float uFogH; uniform float uShadowTexel;
uniform vec4 uTint;
uniform vec4 uLP[12]; uniform vec4 uLC[12]; uniform int uNL;
uniform sampler2DShadow uShadow;
out vec4 oC;
#ifndef SKIN
// materjalitekstuurid (tekstuurimassiiv): 0 liiv 1 kivi 2 betoon 3 värvitud metall 4 harjatud metall 5 rooste 6 kangas 7 orgaaniline
uniform mediump sampler2DArray uMatA; uniform mediump sampler2DArray uMatN; uniform float uMatOn;
vec3 rotTo(vec3 a, vec3 b, vec3 v) { vec3 c = cross(a, b); float d = dot(a, b); if (d < -0.999) return -v; return v*d + cross(c, v) + c*(dot(c, v)/(1.0 + d)); }
#endif
vec3 tm(vec3 x){ x = max(x, 0.0); return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1.0,0.0)),f.x), mix(h21(i+vec2(0.0,1.0)),h21(i+vec2(1.0,1.0)),f.x), f.y); }
float shadowAt(){
  vec3 p = vS.xyz/vS.w*0.5+0.5;
  if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0||p.z>1.0) return 1.0;
  float b = 0.00025; float t = uShadowTexel*1.2;
  float s = texture(uShadow, vec3(p.xy+vec2(-t,-t), p.z-b));
  s += texture(uShadow, vec3(p.xy+vec2( t,-t), p.z-b));
  s += texture(uShadow, vec3(p.xy+vec2(-t, t), p.z-b));
  s += texture(uShadow, vec3(p.xy+vec2( t, t), p.z-b));
  float edge = smoothstep(0.0,0.07,min(min(p.x,1.0-p.x),min(p.y,1.0-p.y)));
  return mix(1.0, s*0.25, edge);
}
#ifdef SKIN
in vec2 vUV;
uniform sampler2D uAlb; uniform sampler2D uMask;
#ifdef TINTTEX
uniform highp sampler2D uTintTex;
#else
uniform vec4 uTints[32];
#endif
#endif
void main(){
  float shiny = 0.0, hairK = 0.0;
#ifdef SKIN
  vec4 mk = texture(uMask, vUV);
  int rg = int(mk.r*255.0+0.5);
  float fwUV = length(fwidth(vUV));
#ifdef TINTTEX
  vec4 tt = texelFetch(uTintTex, ivec2(clamp(rg,0,31),0), 0);
#else
  vec4 tt = uTints[clamp(rg,0,31)];
#endif
  if(tt.a < -0.5) discard;
  // juuksed/habe (režiim 1.25): salkude alfa maski G-kanalis
  if (tt.a > 1.1 && tt.a < 1.4) { if (mk.g < 0.5) discard; hairK = 1.0; }
  vec3 tx = texture(uAlb, vUV).rgb;
  vec3 base = (tt.a > 0.5 ? vec3(dot(tx, vec3(0.3,0.59,0.11))) : tx)*tt.rgb*uTint.rgb;
  float m = 0.2; shiny = tt.a > 1.5 ? 1.0 : 0.0;
  // kõrred (G) ja peanaha juuksepiir (B): pehme tihedus + pikslitera; värv ja tugevus tooniplaatidest 30/31
  if (tt.a > -0.5 && tt.a < 0.5 && mk.g + mk.b > 0.004) {
#ifdef TINTTEX
    vec4 sb = texelFetch(uTintTex, ivec2(30,0), 0), ss = texelFetch(uTintTex, ivec2(31,0), 0);
#else
    vec4 sb = uTints[30], ss = uTints[31];
#endif
    float gr = fract(sin(dot(floor(vUV*4096.0), vec2(12.9898,78.233)))*43758.5453);
    gr = mix(gr, 0.5, clamp(fwUV*4096.0 - 0.8, 0.0, 1.0));
    base = mix(base, sb.rgb*uTint.rgb*(0.75+0.35*gr), clamp(mk.g*sb.a*(0.4+1.2*gr), 0.0, 1.0));
    base = mix(base, ss.rgb*uTint.rgb*(0.8+0.3*gr), clamp(mk.b*ss.a*(0.45+1.1*gr), 0.0, 1.0));
  }
#else
  vec3 base = vC.rgb*uTint.rgb;
  float m = vC.a;
#endif
#ifndef SKIN
  // ---- pikslitäpsed tekstuurid tipuvärviga mudelitele (objekti ruumis -> ei libise liikuvatel objektidel) ----
  vec3 aN = abs(normalize(vNo));
  vec2 tq = aN.y > max(aN.x, aN.z) ? vO.xz : (aN.x > aN.z ? vO.zy : vO.xy);
  float tdist = length(vW-uCam);
  float tnear = 1.0 - smoothstep(15.0, 60.0, tdist);
  if (m < 0.6 && tnear > 0.0) {
    float q1 = vn(tq*6.0), q2 = vn(tq*23.0), q3 = vn(tq*71.0), q4 = vn(tq*190.0);
    if (m < 0.08) {                       // üldine: mõõdukas mottlimine + peen tera
      base *= mix(1.0, 0.9 + 0.12*q1 + 0.07*q3 + 0.05*q4, tnear);
    } else if (m < 0.16) {                // orgaaniline (olendid, liha): poorid ja soomusjas reljeef
      float cell = abs(vn(tq*34.0) - 0.5)*2.0;
      float pores = smoothstep(0.62, 0.8, q3);
      base *= mix(1.0, (0.82 + 0.3*q1) * (0.85 + 0.25*cell) * (1.0 - 0.25*pores), tnear);
    } else if (m < 0.24) {                // kangas / nahk / keraamika: kudumuster + kulumine
      float wv = sin(tq.x*420.0)*sin(tq.y*420.0)*0.5 + 0.5;
      base *= mix(1.0, (0.86 + 0.18*q1 + 0.06*q2) * (0.93 + 0.1*wv), tnear);
    } else if (m < 0.35) {                // kulunud polümeer / betoon: tera, poorid, kriimud
      float pit = smoothstep(0.72, 0.82, q3);
      base *= mix(1.0, (0.86 + 0.16*q1 + 0.08*q2) * (1.0 - 0.3*pit) * (0.95 + 0.08*q4), tnear);
    } else if (m < 0.6) {                 // rooste: täpiline korrosioon
      float pit = smoothstep(0.6, 0.78, q2*0.6 + q3*0.4);
      base = mix(base, base*vec3(0.62, 0.42, 0.3), pit*0.6*tnear);
      base *= mix(1.0, 0.88 + 0.2*q4, tnear);
    }
  }
#endif
  vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
#ifndef SKIN
  // ---- materjalitekstuur: triplanaarne albeedo + normaalkaart (objekti ruumis, maastik maailma ruumis) ----
  if (uMatOn > 0.5 && m < 0.85) {
    float mf = 1.0 - smoothstep(22.0, 52.0, tdist);
    if (mf > 0.0) {
      float L = 2.0, sc = 1.2, kA = 1.0, kN = 1.0; bool wrl = false;
      if (m < 0.08) { kA = 0.6; kN = 0.6; }
      else if (m < 0.16) { L = 7.0; sc = 3.5; }
      else if (m < 0.24) { L = 6.0; sc = 4.0; kA = 0.7; }
      else if (m < 0.35) { L = 2.0; sc = 1.4; }
      else if (m < 0.6) { L = 5.0; sc = 1.8; }
      else if (m < 0.785) { L = 0.0; sc = 0.55; wrl = true; kA = 0.8; kN = 0.6; }
      else if (m < 0.825) { L = 4.0; sc = 1.6; kA = 0.8; }
      else { L = 3.0; sc = 1.3; kA = 0.9; }
      vec3 nb = wrl ? normalize(vN) : normalize(vNo);
      vec3 p = (wrl ? vW : vO) * sc;
      vec3 w = pow(abs(nb), vec3(4.0)); w /= (w.x + w.y + w.z);
      vec3 al = texture(uMatA, vec3(p.zy, L)).rgb*w.x + texture(uMatA, vec3(p.xz, L)).rgb*w.y + texture(uMatA, vec3(p.xy, L)).rgb*w.z;
      base *= mix(vec3(1.0), al*2.0, kA*mf);
      vec3 tX = texture(uMatN, vec3(p.zy, L)).xyz*2.0 - 1.0, tY = texture(uMatN, vec3(p.xz, L)).xyz*2.0 - 1.0, tZ = texture(uMatN, vec3(p.xy, L)).xyz*2.0 - 1.0;
      tX = vec3(tX.xy + nb.zy, abs(tX.z)*nb.x); tY = vec3(tY.xy + nb.xz, abs(tY.z)*nb.y); tZ = vec3(tZ.xy + nb.xy, abs(tZ.z)*nb.z);
      vec3 np = normalize(tX.zyx*w.x + tY.xzy*w.y + tZ.xyz*w.z);
      if (!wrl) np = rotTo(nb, normalize(vN), np);
      if (!gl_FrontFacing) np = -np;
      N = normalize(mix(N, np, kN*mf));
    }
  }
#endif
  float dist = length(vW-uCam);
  float fog = 1.0-exp(-dist*uFogDen);
  fog *= clamp(1.0-(vW.y-uFogH)*0.0035, 0.5, 1.0);
  if(m>0.85){
    vec3 e = base*(1.0+vE) + uEmis;
    vec3 col = mix(e, uFogCol, fog*(uRust < -0.5 ? 0.12 : 0.75));
    oC = vec4(tm(col*uExposure), uAlpha); return;
  }
  if(m>0.785){
    // rekvisiidi pinnad (MAT.PAINTED / MAT.METAL): pikslitäpne triplanaarne tekstuur — värvikillud, kriimud,
    // paneelimüra, roostenõrgumine, tolm. Tippuvärv annab ainult põhitooni ja AO.
#ifndef SKIN
    vec3 an = aN; vec2 tp = tq;
#else
    vec3 an = abs(N); vec2 tp = an.y > max(an.x, an.z) ? vW.xz : (an.x > an.z ? vW.zy : vW.xy);
#endif
    float hc = vW.x*0.93 + vW.z*1.07;
    float g1 = vn(tp*3.1), g2 = vn(tp*11.0), g3 = vn(tp*37.0), g4 = vn(tp*95.0);
    float near = 1.0 - smoothstep(20.0, 70.0, dist);
    if (m > 0.825) {           // värvitud metall
      base *= 0.9 + 0.14*g1 + 0.06*g2;
      float chip = smoothstep(0.68, 0.74, g2*0.6 + g3*0.4 + 0.12*g1);
      vec3 bare = vec3(0.30, 0.295, 0.29)*(0.8 + 0.4*g4);
      base = mix(base, bare, chip*0.85*near);
      base *= 1.0 - 0.18*chip*(1.0 - smoothstep(0.74, 0.8, g2*0.6 + g3*0.4 + 0.12*g1))*near;   // killu tume serv
      float scr = smoothstep(0.965, 0.995, vn(vec2(dot(tp, vec2(0.8, 0.6))*90.0, dot(tp, vec2(-0.6, 0.8))*2.0)));
      base = mix(base, base*1.35 + 0.03, scr*0.6*near);
    } else {                   // paljas / harjatud metall
      float br = vn(vec2(dot(tp, vec2(1.0, 0.15))*3.0, dot(tp, vec2(-0.15, 1.0))*140.0));
      base *= 0.82 + 0.22*br*near + 0.12*g1;
      base = mix(base, base*vec3(0.75,0.62,0.5), smoothstep(0.6, 0.85, g1*0.7 + g2*0.3)*0.5);
    }
    if (an.y < 0.6) {          // roostenõrgumine ja mustus allapoole
      float streak = smoothstep(0.55, 0.92, vn(vec2(hc*7.0, vW.y*0.25))) * smoothstep(0.4, 0.75, vn(vec2(hc*1.3, vW.y*0.9)+3.0));
      base = mix(base, vec3(0.26, 0.14, 0.08), streak*0.55);
      base *= 1.0 - 0.18*smoothstep(0.5, 0.95, vn(vec2(hc*1.6, vW.y*1.3)+9.0));
    } else if (N.y > 0.6) {    // tolm ülespoole pindadel
      float dk = smoothstep(0.35, 0.8, g1*0.6 + vn(tp*0.8)*0.4);
      base = mix(base, vec3(0.5, 0.31, 0.2)*(0.85 + 0.3*g3), dk*0.6);
    }
    base *= 0.94 + 0.12*g4*near;
  } else if(m>0.6){
    float n1 = vn(vW.xz*0.35); float n2 = vn(vW.xz*2.3); float n3 = vn(vW.xz*0.045);
    float rip = sin(dot(vW.xz, vec2(1.35,0.62)) + n1*6.0)*0.5+0.5;
    float fl = clamp(N.y*1.6-0.6,0.0,1.0);
    // lähedal: tuulevirdude reljeef (normaali kallutus) + liivaterad
    float near = 1.0 - smoothstep(18.0, 60.0, dist);
    if (near > 0.0) {
      vec2 wd = normalize(vec2(0.82, 0.57));
      float ph = dot(vW.xz, wd)*4.2 + n2*2.6 + vn(vW.xz*0.6)*5.0;
      float sl = cos(ph);
      sl = sl*sl*sign(sl);
      N = normalize(N + vec3(wd.x, 0.0, wd.y)*sl*0.16*near*fl);
      float grain = vn(vW.xz*38.0)*0.6 + vn(vW.xz*91.0)*0.4;
      base *= 1.0 + (grain - 0.5)*0.16*near;
      base *= 1.0 - 0.06*near*fl*(sin(ph)*0.5+0.5);
    }
    base *= 0.82 + 0.24*n3 + 0.12*n1 + 0.09*n2 + 0.07*rip*fl;
  } else if(m>0.35){
    float hc = vW.x*0.93 + vW.z*1.07;
    float n = vn(vec2(hc*1.3, vW.y*0.32))*0.55 + vn(vec2(hc*4.5, vW.y*1.4))*0.3 + vn(vW.xz*2.1+vW.y*0.7)*0.15;
    if(abs(N.y)>0.7) n = vn(vW.xz*0.9)*0.55 + vn(vW.xz*3.7)*0.3 + vn(vW.xz*9.0)*0.15;
    float k = smoothstep(0.5, 0.86, n)*uRust;
    vec3 rc = mix(vec3(0.27,0.15,0.09), vec3(0.40,0.21,0.11), vn(vec2(hc*11.0, vW.y*9.0)));
    base = mix(base, rc, clamp(k*0.85,0.0,0.8));
    float vert = 1.0-abs(N.y);
    base *= 1.0 - 0.2*uRust*vert*(1.0-smoothstep(0.0,1.0,vW.y));
    base *= 0.92 + 0.12*vn(vec2(hc*6.0, vW.y*0.5));
  }
#ifndef SKIN
  // kulunud pinnad: tilgajäljed, plekid, kriimud, mustus põrandal, tahm laes
  bool flesh = m > 0.08 && m < 0.22;
  if (m < 0.6 && !flesh) {
    float gk = m > 0.35 ? 0.55 : m > 0.24 ? 1.0 : 0.4;
    float hc2 = vW.x*0.93 + vW.z*1.07;
    if (abs(N.y) < 0.6) {
      float streak = smoothstep(0.52, 0.95, vn(vec2(hc2*6.5, vW.y*0.22)));
      float blot = smoothstep(0.42, 0.88, vn(vec2(hc2*1.25, vW.y*1.05) + 7.3));
      float grit = vn(vec2(hc2*31.0, vW.y*29.0));
      float low = 1.0 - smoothstep(0.0, 0.9, fract((vW.y + 0.02) / 3.0) * 3.0);
      base *= max(0.5, 1.0 - gk*(0.30*streak + 0.26*blot + 0.32*low*(0.6 + 0.4*grit) + 0.06*grit));
      base = mix(base, base*vec3(0.86,0.72,0.58), gk*clamp(blot*0.6 + low*0.4, 0.0, 1.0));
      float chip = step(0.88, vn(vec2(hc2*19.0, vW.y*17.0)));
      base = mix(base, base*1.22 + 0.025, gk*chip*0.45);
    } else if (N.y > 0.6) {
      float d1 = smoothstep(0.3, 0.85, vn(vW.xz*0.85 + 3.1));
      float d2 = smoothstep(0.45, 0.9, vn(vW.xz*4.1));
      vec2 tc = abs(fract(vW.xz*0.5) - 0.5);
      float seam = 1.0 - smoothstep(0.455, 0.49, max(tc.x, tc.y));
      base *= max(0.5, 1.0 - gk*(0.32*d1 + 0.16*d2 + 0.25*(1.0 - seam)));
      base = mix(base, base*vec3(0.88,0.74,0.60), gk*d1*0.65);
    } else {
      base *= 1.0 - gk*(0.25 + 0.2*vn(vW.xz*1.7));
    }
  }
#endif
  float sh = uShadowOn>0.5 ? shadowAt() : 1.0;
  float ndl = max(dot(N,uSunDir),0.0);
  vec3 amb = mix(uGndCol, uSkyCol, N.y*0.5+0.5) * ((m < 0.6 || (m > 0.785 && m < 0.85)) ? 1.0 + 1.3*(1.0 - abs(N.y)) : 1.0);
  vec3 lit = amb + uSunCol*ndl*sh;
  for(int i=0;i<12;i++){
    if(i>=uNL) break;
    vec3 L = uLP[i].xyz - vW; float d = length(L);
    float a = clamp(1.0 - d/uLP[i].w, 0.0, 1.0); a *= a;
    lit += uLC[i].rgb*uLC[i].a*a*max(dot(N,L/max(d,0.001))*0.9+0.1,0.0);
  }
  vec3 Vd = normalize(uCam-vW); vec3 H = normalize(uSunDir+Vd);
  float spec = pow(max(dot(N,H),0.0), 32.0)*sh*ndl;
  float specK = (m>0.35 && m<0.6) ? 0.3 : mix(0.06, 0.22, shiny);
  if (hairK > 0.5) { specK = 0.2; spec = pow(max(dot(N,H),0.0), 16.0)*sh*ndl; }
  if (m > 0.785 && m < 0.85) { specK = m > 0.825 ? 0.16 : 0.38; spec = pow(max(dot(N,H),0.0), m > 0.825 ? 20.0 : 40.0)*sh*ndl; }
#ifndef SKIN
  if (m > 0.08 && m < 0.16) { specK = 0.42; spec = pow(max(dot(N,H),0.0), 48.0)*sh*ndl + pow(max(dot(N,H),0.0), 8.0)*0.08; }
  else if (m >= 0.16 && m < 0.22) { specK = 0.14; spec = pow(max(dot(N,H),0.0), 14.0)*sh*ndl; }
#endif
  vec3 col = base*lit + uSunCol*spec*specK + uEmis + base*uTint.a;
  col = mix(col, uFogCol, fog);
  oC = vec4(tm(col*uExposure), uAlpha);
}`;
  const DEPTH_VS = `
precision highp float;
layout(location=0) in vec3 aPos;
#ifdef INST
layout(location=3) in vec4 aM0;
layout(location=4) in vec4 aM1;
layout(location=5) in vec4 aM2;
layout(location=6) in vec4 aM3;
#endif
#ifdef SKIN
layout(location=3) in vec4 aJ;
layout(location=4) in vec4 aW;
#ifdef BONETEX
uniform highp sampler2D uBoneTex; uniform int uBoneRow;
mat4 boneM(float j){ int x = int(j+0.5)*3; vec4 a = texelFetch(uBoneTex, ivec2(x,uBoneRow), 0), b = texelFetch(uBoneTex, ivec2(x+1,uBoneRow), 0), c = texelFetch(uBoneTex, ivec2(x+2,uBoneRow), 0); return mat4(a.x,b.x,c.x,0.0, a.y,b.y,c.y,0.0, a.z,b.z,c.z,0.0, a.w,b.w,c.w,1.0); }
#else
uniform vec4 uB[96];
mat4 boneM(float j){ int i = int(j+0.5)*3; vec4 a = uB[i], b = uB[i+1], c = uB[i+2]; return mat4(a.x,b.x,c.x,0.0, a.y,b.y,c.y,0.0, a.z,b.z,c.z,0.0, a.w,b.w,c.w,1.0); }
#endif
#endif
uniform mat4 uVP; uniform mat4 uModel;
void main(){
#ifdef SKIN
  mat4 M = uModel*(boneM(aJ.x)*aW.x + boneM(aJ.y)*aW.y + boneM(aJ.z)*aW.z + boneM(aJ.w)*aW.w);
#elif defined(INST)
  mat4 M = mat4(aM0,aM1,aM2,aM3);
#else
  mat4 M = uModel;
#endif
  gl_Position = uVP*(M*vec4(aPos,1.0));
}`;
  const DEPTH_FS = `precision mediump float; void main(){}`;
  const SKY_VS = `
layout(location=0) in vec2 aP; out vec2 vP;
void main(){ vP=aP; gl_Position=vec4(aP,0.0,1.0); }`;
  const SKY_FS = `
precision highp float;
in vec2 vP; out vec4 oC;
uniform mat4 uInvVP; uniform vec3 uCam; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uFogCol;
uniform float uNight; uniform float uExposure; uniform float uTime; uniform vec3 uPlDir;
vec3 tm(vec3 x){ x = max(x, 0.0); return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
float h31(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float cn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
void main(){
  vec4 a = uInvVP*vec4(vP,1.0,1.0); vec3 d = normalize(a.xyz/a.w - uCam);
  float h = d.y;
  vec3 col = mix(uHor, uZen, pow(clamp(h,0.0,1.0),0.55));
  if(uNight>0.01 && h>0.0){
    vec3 g = floor(d*260.0); float s = h31(g);
    float st = step(0.9972, s)*(0.55+0.45*sin(uTime*1.7+s*300.0));
    vec3 sc = mix(vec3(0.75,0.82,1.0), vec3(1.0,0.85,0.7), h31(g+7.0));
    col += sc*st*uNight*smoothstep(0.0,0.2,h);
    vec3 g2 = floor(d*520.0); float s2 = h31(g2+3.0);
    col += vec3(0.8,0.85,1.0)*step(0.9965, s2)*0.45*uNight*smoothstep(0.0,0.3,h);
    // udukogu
    float neb = cn(d.xz/(h+0.3)*1.3 + 11.0);
    col += mix(vec3(0.16,0.06,0.12), vec3(0.05,0.08,0.16), cn(d.zx*2.0))*smoothstep(0.55,0.95,neb)*uNight*0.14*smoothstep(0.05,0.5,h);
    // linnutee
    float mw = exp(-pow(dot(d, normalize(vec3(0.3,0.5,-0.8)))*4.0,2.0));
    col += vec3(0.10,0.07,0.09)*mw*uNight*0.5;
  }
  // gaasihiid
  float pd = dot(d, uPlDir);
  float pr = 0.9935;
  if(pd>pr-0.004){
    vec3 ax = normalize(cross(uPlDir, vec3(0.25,1.0,0.1)));
    vec3 ay = cross(ax, uPlDir);
    float rr = sqrt(1.0-pr*pr);
    vec2 q = vec2(dot(d,ax), dot(d,ay))/rr;
    float r2 = dot(q,q);
    float z = sqrt(max(1.0-r2,0.0));
    vec3 n = normalize(q.x*ax + q.y*ay - z*uPlDir);
    float lat = q.y*0.93 + q.x*0.37;
    float bands = sin(lat*17.0 + sin(q.x*4.0+lat*3.0)*0.8)*0.5+0.5;
    vec3 pc = mix(vec3(0.62,0.48,0.40), vec3(0.85,0.70,0.55), bands);
    pc = mix(pc, vec3(0.45,0.30,0.28), smoothstep(0.6,0.95,sin(lat*5.0+1.3)*0.5+0.5)*0.5);
    float li = clamp(dot(n, uSunDir)*1.1+0.12, 0.0, 1.0);
    vec3 pcol = pc*li*1.05 + pc*0.07 + vec3(0.30,0.20,0.24)*pow(1.0-z,3.0)*0.8;
    float rim = smoothstep(1.0,0.96,sqrt(r2));
    float haze = clamp(1.0 - h*3.0, 0.0, 1.0)*0.55;
    col = mix(col, mix(pcol, col, haze), rim);
  }
  float sd = max(dot(d,uSunDir),0.0);
  // kõrged kiudpilved, mis triivivad aeglaselt; päikese poolt valgustatud servad
  if(h>0.0){
    vec2 cp = d.xz/(h+0.12)*0.55 + vec2(uTime*0.0035, uTime*0.0012);
    float c = cn(cp*vec2(0.9,2.6)*1.4)*0.65 + cn(cp*vec2(1.8,5.0)*1.4 + 3.0)*0.35;
    c = smoothstep(0.5, 0.82, c)*smoothstep(0.0, 0.18, h)*(1.0 - smoothstep(0.55, 0.95, h));
    vec3 cc = mix(uHor*1.05, uZen*0.6 + uSunCol*0.55, 0.45) + uSunCol*pow(sd, 5.0)*0.9;
    cc = mix(cc, vec3(0.035,0.03,0.045), uNight*0.85);
    col = mix(col, cc, c*0.55);
  }
  col += uSunCol*(smoothstep(0.9993,0.9996,sd)*7.0 + pow(sd,260.0)*0.9 + pow(sd,24.0)*0.28 + pow(sd,4.0)*0.10);
  float hz = exp(-max(h,0.0)*9.0);
  col = mix(col, uFogCol, hz*0.85);
  if(h<0.0) col = mix(uFogCol, uFogCol*0.8, clamp(-h*3.0,0.0,1.0));
  oC = vec4(tm(col*uExposure),1.0);
}`;
  const PART_VS = `
precision highp float;
layout(location=0) in vec2 aC;
layout(location=1) in vec4 aPS;
layout(location=2) in vec4 aCol;
layout(location=3) in vec4 aDir;
uniform mat4 uVP; uniform vec3 uR; uniform vec3 uU; uniform vec3 uCam; uniform float uFogDen;
out vec4 vCol; out vec2 vUV; out float vF; out vec3 vS;
void main(){
  vec3 wp; vS = aPS.xyz*0.45;
  if(aDir.w>0.0){
    vec3 dd = normalize(aDir.xyz); vec3 tc = normalize(uCam-aPS.xyz);
    vec3 r = normalize(cross(dd,tc));
    wp = aPS.xyz + r*aC.x*aPS.w + dd*aC.y*aDir.w;
  } else {
    wp = aPS.xyz + (uR*aC.x + uU*aC.y)*aPS.w;
  }
  vUV = aC; vCol = aCol;
  vF = 1.0-exp(-length(aPS.xyz-uCam)*uFogDen);
  gl_Position = uVP*vec4(wp,1.0);
}`;
  const PART_FS = `
precision highp float;
in vec4 vCol; in vec2 vUV; in float vF; in vec3 vS; out vec4 oC;
uniform float uAdd; uniform vec3 uFogCol;
float ph(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float pn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(ph(i),ph(i+vec2(1,0)),f.x), mix(ph(i+vec2(0,1)),ph(i+vec2(1,1)),f.x), f.y); }
void main(){
  float d = length(vUV);
  if(uAdd>0.5){
    float a = smoothstep(1.0, 0.0, d); a = a*a;
    float core = smoothstep(0.45, 0.0, d);
    oC = vec4((vCol.rgb*a + vec3(core*core*0.35))*vCol.a*(1.0-vF*0.8), 1.0);
  } else {
    // pehme "puhviline" suits/tolm: kaks oktaavi müra, mis liigub osakesega kaasa
    vec2 q = vUV*1.6 + vS.xz + vec2(vS.y*0.7, -vS.y*0.4);
    float n = pn(q*1.7)*0.65 + pn(q*3.9 + 4.1)*0.35;
    float a = smoothstep(1.0, 0.15, d + (n - 0.5)*0.55);
    float sh = 0.82 + 0.3*(n - 0.5) - 0.18*vUV.y*(-1.0);
    oC = vec4(mix(vCol.rgb*sh, uFogCol, vF*0.8), vCol.a*a*a);
  }
}`;

  function compile(vs, fs, defines) {
    const pre = '#version 300 es\n' + (defines || '');
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, pre + src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader: ' + gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Link: ' + gl.getProgramInfoLog(p));
    const cache = new Map();
    const u = (name) => { if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name)); return cache.get(name); };
    return { p, u };
  }

  // ---------------- võrgustikud ----------------
  class Mesh {
    constructor(d) {
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bPos); gl.bufferData(gl.ARRAY_BUFFER, d.pos, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      this.bNor = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bNor); gl.bufferData(gl.ARRAY_BUFFER, d.nor, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      this.bCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bCol); gl.bufferData(gl.ARRAY_BUFFER, d.col, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 0, 0);
      if (d.idx) {
        this.bIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, d.idx, gl.STATIC_DRAW);
        this.count = d.idx.length; this.idxType = d.idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
      } else { this.count = d.pos.length / 3; this.idxType = 0; }
      gl.bindVertexArray(null);
      // piirdesfäär
      let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
      const p = d.pos;
      for (let i = 0; i < p.length; i += 3) {
        if (p[i] < mnx) mnx = p[i]; if (p[i] > mxx) mxx = p[i];
        if (p[i + 1] < mny) mny = p[i + 1]; if (p[i + 1] > mxy) mxy = p[i + 1];
        if (p[i + 2] < mnz) mnz = p[i + 2]; if (p[i + 2] > mxz) mxz = p[i + 2];
      }
      if (p.length === 0) { mnx = mny = mnz = mxx = mxy = mxz = 0; }
      this.cx = (mnx + mxx) / 2; this.cy = (mny + mxy) / 2; this.cz = (mnz + mxz) / 2;
      this.rad = Math.hypot(mxx - mnx, mxy - mny, mxz - mnz) / 2;
      this.min = [mnx, mny, mnz]; this.max = [mxx, mxy, mxz];
      this.tris = this.count / 3;
    }
    dispose() {
      gl.deleteBuffer(this.bPos); gl.deleteBuffer(this.bNor); gl.deleteBuffer(this.bCol);
      if (this.bIdx) gl.deleteBuffer(this.bIdx);
      gl.deleteVertexArray(this.vao);
    }
  }

  // Nahastatud võrk: pos(f32) nor(i8) uv(u16 norm) liigesed(u8) kaalud(u8 norm)
  class SkinMesh {
    constructor(d) {
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      const buf = (data, loc, n, type, norm, int) => {
        const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        if (int) gl.vertexAttribIPointer(loc, n, type, 0, 0); else gl.vertexAttribPointer(loc, n, type, norm, 0, 0);
        return b;
      };
      buf(d.pos, 0, 3, gl.FLOAT, false); buf(d.nor, 1, 3, gl.BYTE, true); buf(d.uv, 2, 2, gl.UNSIGNED_SHORT, true);
      buf(d.jn, 3, 4, gl.UNSIGNED_BYTE, false); buf(d.wt, 4, 4, gl.UNSIGNED_BYTE, true);
      const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, d.idx, gl.STATIC_DRAW);
      this.count = d.idx.length; this.idxType = d.idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
      gl.bindVertexArray(null);
      this.tris = this.count / 3;
      this.morphTex = null;
      if (d.morph) {
        const nv = d.pos.length / 3, rows = Math.ceil(nv / 1024) * 8, data = new Float32Array(1024 * rows * 4);
        const { idx, dq, sc, n } = d.morph;
        for (let i = 0; i < n; i++) {
          const v = idx[i], x = v % 1024, y0 = Math.floor(v / 1024) * 8;
          for (let k = 0; k < 8; k++) { const o = ((y0 + k) * 1024 + x) * 4, q = (i * 8 + k) * 3; data[o] = dq[q] * sc; data[o + 1] = dq[q + 1] * sc; data[o + 2] = dq[q + 2] * sc; }
        }
        const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1024, rows, 0, gl.RGBA, gl.FLOAT, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.morphTex = t;
      }
    }
  }
  function texFromImage(img, opt = {}) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    if (opt.mask) {
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, Math.max(0, Math.round(Math.log2(img.width || 2048)) - 6));   // madalaim mip 64 px (atlase servade sulandumise vältimiseks), sõltumata atlase suurusest
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  // tagastab rea indeksi ja Float32Array alamvaate selle rea luude jaoks
  // rida BONE_H-2 on reserveeritud esimese isiku kätele (muidu võivad paljud tegelased read ära kasutada ja relv jääb käest)
  let fpRow = false;
  function boneRow(fp) { if (fp) { fpRow = true; return BONE_H - 2; } if (bonesUsed >= BONE_H - 2) return -1; return bonesUsed++; }
  function boneRowData(row) { return boneData.subarray(row * BONE_W, (row + 1) * BONE_W); }
  // sk: {mesh, alb, mask}; m: mudelimaatriks; row: luurida; tints: Float32Array(64)
  function drawSkinned(sk, m, row, tints, tint, rad = 1.2, opt) {
    if (row < 0 || !sk || !sk.mesh || S.noSkin) return;
    const cx = m[12] + m[4] * 0.9, cy = m[13] + m[5] * 0.9, cz = m[14] + m[6] * 0.9;
    const inView = sphereInFrustum(cx, cy, cz, rad);
    const shadow = !(opt && opt.shadow === false);
    if (!inView && !(shadow && S.shadowsOn && nearShadow(cx, cz, rad))) return;
    let r = skinned[nSkin];
    if (!r) r = skinned[nSkin] = {};
    nSkin++;
    r.sk = sk; r.m = m; r.row = row; r.tints = tints; r.tint = tint || WHITE; r.vis = inView; r.cx = cx; r.cz = cz; r.rad = rad; r.shadow = shadow;
    r.overlay = !!(opt && opt.overlay);
    r.morph = (opt && opt.morph) || null;
    r.ranges = (opt && opt.ranges) || null;
  }
  // varustuse astmed: indeksivahemikud [algus, arv] (ainult vajalik osa joonistatakse)
  function drawRanges(mesh, ranges) {
    if (!ranges) { gl.drawElements(gl.TRIANGLES, mesh.count, mesh.idxType, 0); S.drawCalls++; S.tris += mesh.tris; return; }
    const bs = mesh.idxType === gl.UNSIGNED_INT ? 4 : 2;
    for (const [a, n] of ranges) { if (n > 0) { gl.drawElements(gl.TRIANGLES, n, mesh.idxType, a * bs); S.drawCalls++; S.tris += n / 3; } }
  }
  const MW0 = new Float32Array(8);
  function setMorph(pr, sk, mw) {
    const on = !!(mw && sk.mesh.morphTex);
    gl.uniform1i(pr.u('uMorphTex'), 5);
    gl.uniform1i(pr.u('uMorphN'), on ? 8 : 0);
    if (on) { gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, sk.mesh.morphTex); gl.uniform1i(pr.u('uMorphTex'), 5); gl.uniform4fv(pr.u('uMW'), mw); gl.activeTexture(gl.TEXTURE0); }
    else { gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0); gl.uniform4fv(pr.u('uMW'), MW0); }
  }
  function uploadBones(row) {
    if (!S.boneTex) return;
    gl.bindTexture(gl.TEXTURE_2D, boneTex);
    if (row !== undefined) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, row, BONE_W / 4, 1, gl.RGBA, gl.FLOAT, boneData, row * BONE_W);
    else {
      if (bonesUsed) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, BONE_W / 4, bonesUsed, gl.RGBA, gl.FLOAT, boneData, 0);
      if (fpRow) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, BONE_H - 2, BONE_W / 4, 1, gl.RGBA, gl.FLOAT, boneData, (BONE_H - 2) * BONE_W);
    }
  }
  function setSkinDraw(pr, row, nj, tints) {
    if (S.boneTex) { gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, boneTex); gl.uniform1i(pr.u('uBoneTex'), 3); gl.uniform1i(pr.u('uBoneRow'), row); }
    else gl.uniform4fv(pr.u('uB'), boneData, row * BONE_W, nj * 12);
    if (tints) {
      if (S.tintTex) { gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tintTex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 1, gl.RGBA, gl.FLOAT, tints); gl.uniform1i(pr.u('uTintTex'), 4); }
      else gl.uniform4fv(pr.u('uTints'), tints);
    }
    gl.activeTexture(gl.TEXTURE0);
  }
  function drawSkinList(pr, depth, overlayPass) {
    if (!depth) { gl.uniform1i(pr.u('uAlb'), 1); gl.uniform1i(pr.u('uMask'), 2); }
    const uM = pr.u('uModel'), uT = depth ? null : pr.u('uTint');
    for (let i = 0; i < nSkin; i++) {
      const r = skinned[i];
      if (!!r.overlay !== !!overlayPass) continue;
      if (depth) { if (!r.shadow || !nearShadow(r.cx, r.cz, r.rad)) continue; }
      else if (!r.vis) continue;
      gl.uniformMatrix4fv(uM, false, r.m); setSkinDraw(pr, r.row, r.sk.nj, depth ? null : r.tints);
      if (!depth) {
        setMorph(pr, r.sk, r.morph);
        gl.uniform4fv(uT, r.tint);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, r.sk.alb || whiteTex);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, r.sk.mask || whiteTex);
      }
      gl.bindVertexArray(r.sk.mesh.vao);
      drawRanges(r.sk.mesh, r.ranges);
    }
    gl.activeTexture(gl.TEXTURE0);
  }

  // ---------- portree (tegelase pilt UI jaoks) ----------
  let pFbo = null, pCol = null, pDep = null, pW = 0, pH = 0, pCanvas = null;
  const pV = new Float32Array(16), pP = new Float32Array(16), pVP = new Float32Array(16);
  function portrait(sk, row, tints, m, eye, tgt, fov, w, h, outCanvas, extras) {
    if (!sk || !sk.alb || !sk.mask || S.noSkin) return null;
    if (!pFbo || pW !== w || pH !== h) {
      if (pFbo) { gl.deleteFramebuffer(pFbo); gl.deleteRenderbuffer(pCol); gl.deleteRenderbuffer(pDep); }
      pW = w; pH = h;
      pFbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, pFbo);
      pCol = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, pCol); gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, pCol);
      pDep = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, pDep); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pDep);
      const stt = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (stt !== gl.FRAMEBUFFER_COMPLETE) S.portraitErr = 'FBO ' + stt;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, pFbo);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.disable(gl.BLEND);
    M4.perspective(pP, fov, w / h, 0.05, 50);
    M4.lookAt(pV, eye[0], eye[1], eye[2], tgt[0], tgt[1], tgt[2]);
    M4.mul(pVP, pP, pV);
    const pr = progSkin;
    gl.useProgram(pr.p);
    gl.uniform3fv(pr.u('uSunDir'), [0.42, 0.55, 0.72]); gl.uniform3fv(pr.u('uSunCol'), [1.0, 0.96, 0.9]);
    gl.uniform3fv(pr.u('uSkyCol'), [0.36, 0.36, 0.40]); gl.uniform3fv(pr.u('uGndCol'), [0.22, 0.18, 0.15]);
    gl.uniform3fv(pr.u('uFogCol'), [0, 0, 0]); gl.uniform1f(pr.u('uFogDen'), 0); gl.uniform1f(pr.u('uFogH'), 0);
    gl.uniform3f(pr.u('uCam'), eye[0], eye[1], eye[2]); gl.uniform1f(pr.u('uExposure'), 1.0);
    gl.uniformMatrix4fv(pr.u('uVP'), false, pVP); gl.uniformMatrix4fv(pr.u('uSVP'), false, pVP);
    gl.uniform1f(pr.u('uShadowOn'), 0); gl.uniform1i(pr.u('uShadow'), 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, dummyShadow);
    gl.uniform1i(pr.u('uNL'), 1);
    gl.uniform4fv(pr.u('uLP'), new Float32Array([eye[0] - 1.5, eye[1] + 0.5, eye[2] - 0.8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    gl.uniform4fv(pr.u('uLC'), new Float32Array([1.0, 0.5, 0.25, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    gl.uniform3fv(pr.u('uEmis'), ZERO3); gl.uniform1f(pr.u('uAlpha'), 1); gl.uniform1f(pr.u('uRust'), 0);
    gl.uniform1i(pr.u('uAlb'), 1); gl.uniform1i(pr.u('uMask'), 2);
    gl.uniformMatrix4fv(pr.u('uModel'), false, m);
    uploadBones(row); setSkinDraw(pr, row, sk.nj, tints); setMorph(pr, sk, extras && extras.morph); gl.uniform4fv(pr.u('uTint'), WHITE);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sk.alb);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, sk.mask);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(sk.mesh.vao);
    drawRanges(sk.mesh, extras && extras.ranges);
    if (extras && extras.length) {
      const pl = progLit;
      gl.useProgram(pl.p);
      gl.uniform3fv(pl.u('uSunDir'), [0.42, 0.55, 0.72]); gl.uniform3fv(pl.u('uSunCol'), [1.0, 0.96, 0.9]);
      gl.uniform3fv(pl.u('uSkyCol'), [0.36, 0.36, 0.40]); gl.uniform3fv(pl.u('uGndCol'), [0.22, 0.18, 0.15]);
      gl.uniform3fv(pl.u('uFogCol'), [0, 0, 0]); gl.uniform1f(pl.u('uFogDen'), 0); gl.uniform1f(pl.u('uFogH'), 0);
      gl.uniform3f(pl.u('uCam'), eye[0], eye[1], eye[2]); gl.uniform1f(pl.u('uExposure'), 1.0);
      gl.uniformMatrix4fv(pl.u('uVP'), false, pVP); gl.uniformMatrix4fv(pl.u('uSVP'), false, pVP);
      gl.uniform1f(pl.u('uShadowOn'), 0); gl.uniform1i(pl.u('uShadow'), 0); gl.uniform1i(pl.u('uNL'), 0);
      gl.uniform3fv(pl.u('uEmis'), ZERO3); gl.uniform1f(pl.u('uAlpha'), 1); gl.uniform1f(pl.u('uRust'), 0.6);
      for (const x of extras) {
        gl.uniformMatrix4fv(pl.u('uModel'), false, x.m); gl.uniform4fv(pl.u('uTint'), x.tint || WHITE);
        gl.bindVertexArray(x.mesh.vao); if (x.mesh.idxType) gl.drawElements(gl.TRIANGLES, x.mesh.count, x.mesh.idxType, 0); else gl.drawArrays(gl.TRIANGLES, 0, x.mesh.count);
      }
    }
    gl.bindVertexArray(null);
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const ge = gl.getError(); if (ge) S.portraitErr = 'GL error ' + ge;
    let any = 0; for (let i = 3; i < px.length; i += 64) if (px[i]) { any = 1; break; }
    S.portraitEmpty = !any;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const cv = outCanvas || document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const id = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) id.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    ctx.putImageData(id, 0, 0);
    return cv;
  }

  // Instantsikogum: üks võrk, palju maatrikseid
  class InstSet {
    constructor(mesh, max) {
      this.mesh = mesh; this.max = max; this.count = 0;
      this.data = new Float32Array(max * 20);
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bPos); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bNor); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bCol); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 0, 0);
      if (mesh.bIdx) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.bIdx);
      this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
      for (let i = 0; i < 4; i++) {
        gl.enableVertexAttribArray(3 + i); gl.vertexAttribPointer(3 + i, 4, gl.FLOAT, false, 80, i * 16); gl.vertexAttribDivisor(3 + i, 1);
      }
      gl.enableVertexAttribArray(7); gl.vertexAttribPointer(7, 4, gl.FLOAT, false, 80, 64); gl.vertexAttribDivisor(7, 1);
      gl.bindVertexArray(null);
      this.dirty = true; this.castShadow = true; this.visible = true; this.viewDist = 1e9;
      this.bc = [0, 0, 0]; this.br = 1e9;
    }
    clear() { this.count = 0; this.dirty = true; }
    add(m, r = 1, g = 1, b = 1, e = 0) {
      if (this.count >= this.max) return -1;
      const o = this.count * 20;
      this.data.set(m, o);
      this.data[o + 16] = r; this.data[o + 17] = g; this.data[o + 18] = b; this.data[o + 19] = e;
      this.dirty = true;
      return this.count++;
    }
    setColor(i, r, g, b, e) { const o = i * 20; this.data[o + 16] = r; this.data[o + 17] = g; this.data[o + 18] = b; this.data[o + 19] = e; this.dirty = true; }
    setMatrix(i, m) { this.data.set(m, i * 20); this.dirty = true; }
    computeBounds() {
      if (!this.count) { this.br = 0; return; }
      let mnx = 1e9, mnz = 1e9, mny = 1e9, mxx = -1e9, mxz = -1e9, mxy = -1e9;
      for (let i = 0; i < this.count; i++) {
        const o = i * 20, x = this.data[o + 12], y = this.data[o + 13], z = this.data[o + 14];
        if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (z < mnz) mnz = z; if (z > mxz) mxz = z; if (y < mny) mny = y; if (y > mxy) mxy = y;
      }
      this.bc = [(mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2];
      this.br = Math.hypot(mxx - mnx, mxy - mny, mxz - mnz) / 2 + this.mesh.rad * 3;
    }
    upload() {
      if (!this.dirty) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.count * 20);
      this.dirty = false;
    }
  }

  // ---------------- osakesed ----------------
  class ParticlePool {
    constructor(max, additive) {
      this.max = max; this.add = additive; this.n = 0;
      this.p = new Float32Array(max * 3); this.v = new Float32Array(max * 3);
      this.life = new Float32Array(max); this.maxLife = new Float32Array(max);
      this.s0 = new Float32Array(max); this.s1 = new Float32Array(max);
      this.c0 = new Float32Array(max * 4); this.c1 = new Float32Array(max * 4);
      this.grav = new Float32Array(max); this.drag = new Float32Array(max); this.str = new Float32Array(max);
      this.inst = new Float32Array(max * 12);
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, this.inst.byteLength, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 48, 0); gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 48, 16); gl.vertexAttribDivisor(2, 1);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 48, 32); gl.vertexAttribDivisor(3, 1);
      gl.bindVertexArray(null);
    }
    // o: {x,y,z, vx,vy,vz, life, s0, s1, c0:[r,g,b,a], c1:[r,g,b,a], g, drag, stretch}
    emit(x, y, z, vx, vy, vz, life, s0, s1, c0, c1, g = 0, drag = 0, stretch = 0) {
      let i = this.n;
      if (i >= this.max) { i = Math.floor(Math.random() * this.max); } else this.n++;
      this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
      this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
      this.life[i] = life; this.maxLife[i] = life; this.s0[i] = s0; this.s1[i] = s1;
      this.c0.set(c0, i * 4); this.c1.set(c1 || c0, i * 4);
      this.grav[i] = g; this.drag[i] = drag; this.str[i] = stretch;
    }
    update(dt) {
      let i = 0;
      while (i < this.n) {
        this.life[i] -= dt;
        if (this.life[i] <= 0) {
          const j = --this.n;
          if (i !== j) {
            this.p.copyWithin(i * 3, j * 3, j * 3 + 3); this.v.copyWithin(i * 3, j * 3, j * 3 + 3);
            this.life[i] = this.life[j]; this.maxLife[i] = this.maxLife[j]; this.s0[i] = this.s0[j]; this.s1[i] = this.s1[j];
            this.c0.copyWithin(i * 4, j * 4, j * 4 + 4); this.c1.copyWithin(i * 4, j * 4, j * 4 + 4);
            this.grav[i] = this.grav[j]; this.drag[i] = this.drag[j]; this.str[i] = this.str[j];
          }
          continue;
        }
        const k = 1 - this.drag[i] * dt;
        this.v[i * 3] *= k; this.v[i * 3 + 1] = this.v[i * 3 + 1] * k - this.grav[i] * dt; this.v[i * 3 + 2] *= k;
        this.p[i * 3] += this.v[i * 3] * dt; this.p[i * 3 + 1] += this.v[i * 3 + 1] * dt; this.p[i * 3 + 2] += this.v[i * 3 + 2] * dt;
        i++;
      }
    }
    fill() {
      const d = this.inst;
      for (let i = 0; i < this.n; i++) {
        const t = 1 - this.life[i] / this.maxLife[i], o = i * 12;
        d[o] = this.p[i * 3]; d[o + 1] = this.p[i * 3 + 1]; d[o + 2] = this.p[i * 3 + 2];
        d[o + 3] = this.s0[i] + (this.s1[i] - this.s0[i]) * t;
        for (let c = 0; c < 4; c++) d[o + 4 + c] = this.c0[i * 4 + c] + (this.c1[i * 4 + c] - this.c0[i * 4 + c]) * t;
        if (this.str[i] > 0) {
          d[o + 8] = this.v[i * 3]; d[o + 9] = this.v[i * 3 + 1]; d[o + 10] = this.v[i * 3 + 2];
          const sp = Math.hypot(this.v[i * 3], this.v[i * 3 + 1], this.v[i * 3 + 2]);
          d[o + 11] = Math.max(0.05, sp * this.str[i]);
          if (sp < 0.001) { d[o + 8] = 0; d[o + 9] = 1; d[o + 10] = 0; }
        } else { d[o + 8] = 0; d[o + 9] = 1; d[o + 10] = 0; d[o + 11] = 0; }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, d, 0, this.n * 12);
    }
  }


  const POST_VS = `layout(location=0) in vec2 aP; out vec2 vP; out vec2 vUV; void main(){ vP=aP; vUV=aP*0.5+0.5; gl_Position=vec4(aP,0.0,1.0); }`;
  const BRIGHT_FS = `precision highp float; in vec2 vUV; out vec4 oC; uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThr;
  vec3 s(vec2 o){ vec3 c = texture(uTex, vUV+o*uTexel).rgb; float l = max(c.r,max(c.g,c.b)); return c*smoothstep(uThr, 1.0, l); }
  void main(){ oC = vec4((s(vec2(-1.0,-1.0))+s(vec2(1.0,-1.0))+s(vec2(-1.0,1.0))+s(vec2(1.0,1.0)))*0.25, 1.0); }`;
  const BLUR_FS = `precision highp float; in vec2 vUV; out vec4 oC; uniform sampler2D uTex; uniform vec2 uDir;
  void main(){ vec3 c = texture(uTex,vUV).rgb*0.227;
    c += (texture(uTex,vUV+uDir*1.38).rgb + texture(uTex,vUV-uDir*1.38).rgb)*0.316;
    c += (texture(uTex,vUV+uDir*3.23).rgb + texture(uTex,vUV-uDir*3.23).rgb)*0.070;
    oC = vec4(c,1.0); }`;
  const COMP_FS = `precision highp float; in vec2 vP; in vec2 vUV; out vec4 oC;
  uniform sampler2D uTex; uniform sampler2D uB1; uniform sampler2D uB2; uniform float uAspect; uniform float uTime; uniform float uBloom; uniform float uNight;
  float h(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }
  void main(){
    vec3 col = texture(uTex, vUV).rgb;
    vec3 b = texture(uB1, vUV).rgb*0.65 + texture(uB2, vUV).rgb*0.85;
    col += b*uBloom*(1.0 - col*0.5);
    float lum = dot(col, vec3(0.299,0.587,0.114));
    // varjud jahedamaks, heledad soojemaks (filmilik jaotus)
    // varjud sügavaks veinpunaseks, heledad hõõguvaks oranžiks (punane Marsi loojang)
    vec3 shadowT = mix(vec3(0.92,0.80,0.84), vec3(0.90,0.90,1.02), uNight*0.6);
    col = mix(col*shadowT, col*vec3(1.08,0.95,0.84), smoothstep(0.10, 0.72, lum));
    col = mix(vec3(lum), col, 0.98);
    col = (col-0.5)*1.17+0.5 - 0.025;
    vec2 q = vP*vec2(uAspect,1.0)/max(uAspect,1.0);
    float v = smoothstep(1.35, 0.25, length(q));
    col *= mix(0.42, 1.0, v);
    col += (h(vUV*vec2(1931.0,1029.0)+fract(uTime)*7.0)-0.5)*0.025;
    oC = vec4(clamp(col,0.0,1.0),1.0);
  }`;
  const post = { on: false, samples: 0, w: 0, h: 0 };
  let progBright, progBlur, progComp;
  function mkTex(w, h) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { tex: t, fb, w, h };
  }
  function freeTex(o) { if (!o) return; gl.deleteTexture(o.tex); gl.deleteFramebuffer(o.fb); }
  function setupPost(on, samples) {
    post.on = on; post.samples = samples; post.w = 0;
  }
  function ensurePost() {
    if (!progBright) { progBright = compile(POST_VS, BRIGHT_FS, ''); progBlur = compile(POST_VS, BLUR_FS, ''); progComp = compile(POST_VS, COMP_FS, ''); }
    if (post.w === S.w && post.h === S.h && post.fbMS) return;
    if (post.fbMS) { gl.deleteFramebuffer(post.fbMS); gl.deleteRenderbuffer(post.rbC); gl.deleteRenderbuffer(post.rbD); }
    freeTex(post.res); freeTex(post.a); freeTex(post.b); freeTex(post.c); freeTex(post.d);
    post.w = S.w; post.h = S.h;
    const smp = Math.min(post.samples, gl.getParameter(gl.MAX_SAMPLES) || 0);
    post.rbC = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, post.rbC);
    if (smp > 0) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, gl.RGBA8, S.w, S.h); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, S.w, S.h);
    post.rbD = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, post.rbD);
    if (smp > 0) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, gl.DEPTH_COMPONENT24, S.w, S.h); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, S.w, S.h);
    post.fbMS = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, post.fbMS);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, post.rbC);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, post.rbD);
    post.res = mkTex(S.w, S.h);
    const qw = Math.max(1, S.w >> 2), qh = Math.max(1, S.h >> 2), ew = Math.max(1, S.w >> 3), eh = Math.max(1, S.h >> 3);
    post.a = mkTex(qw, qh); post.b = mkTex(qw, qh); post.c = mkTex(ew, eh); post.d = mkTex(ew, eh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function mainTarget() { return post.on ? post.fbMS : null; }
  function pass(prog, target, setup) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, target ? target.w : S.w, target ? target.h : S.h);
    gl.useProgram(prog.p); setup(prog);
    gl.bindVertexArray(skyVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function bindT(unit, tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); }
  function finishPost() {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, post.fbMS); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, post.res.fb);
    gl.blitFramebuffer(0, 0, S.w, S.h, 0, 0, S.w, S.h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(false);
    pass(progBright, post.a, (p) => { bindT(0, post.res.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uTexel'), 1.5 / S.w, 1.5 / S.h); gl.uniform1f(p.u('uThr'), 0.7); });
    pass(progBlur, post.b, (p) => { bindT(0, post.a.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 1 / post.a.w, 0); });
    pass(progBlur, post.a, (p) => { bindT(0, post.b.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 0, 1 / post.a.h); });
    pass(progBlur, post.c, (p) => { bindT(0, post.a.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 1.5 / post.a.w, 0); });
    pass(progBlur, post.d, (p) => { bindT(0, post.c.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 0, 1.5 / post.c.h); });
    pass(progBlur, post.c, (p) => { bindT(0, post.d.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 2.5 / post.c.w, 0); });
    pass(progBlur, post.d, (p) => { bindT(0, post.c.tex); gl.uniform1i(p.u('uTex'), 0); gl.uniform2f(p.u('uDir'), 0, 2.5 / post.c.h); });
    pass(progComp, null, (p) => {
      bindT(0, post.res.tex); bindT(1, post.a.tex); bindT(2, post.d.tex);
      gl.uniform1i(p.u('uTex'), 0); gl.uniform1i(p.u('uB1'), 1); gl.uniform1i(p.u('uB2'), 2);
      gl.uniform1f(p.u('uAspect'), S.w / S.h); gl.uniform1f(p.u('uTime'), env.time); gl.uniform1f(p.u('uBloom'), env.bloom || 0.9); gl.uniform1f(p.u('uNight'), env.night);
    });
    gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
  }

  // ---------------- olek ----------------
  let progLit, progLitI, progDepth, progDepthI, progSky, progPart, progSkin, progDepthSkin;
  // nahastatud tegelased: luumaatriksid tekstuuris (rida = üks tegelane)
  const BONE_W = 72 * 12, BONE_H = 96;
  const boneData = new Float32Array(BONE_W * BONE_H);
  let whiteTex = null, bonesUsed = 0, boneTex = null, tintTex = null;
  const skinned = []; let nSkin = 0;
  let quadBuf, skyVao, shadowFbo, shadowTex, dummyShadow;
  const shadowVP = M4.create(), shadowView = M4.create(), shadowProj = M4.create();
  const opaque = [], trans = [];
  let nOpaque = 0, nTrans = 0;
  const instSets = [];
  let partAdd, partAlpha;
  const lights = [];
  const lightPos = new Float32Array(48), lightCol = new Float32Array(48);
  const ident = M4.create();
  const WHITE = [1, 1, 1, 0], ZERO3 = [0, 0, 0];

  // ---------- materjalitekstuurid (8-kihiline massiiv, ühikud 6 = albeedo, 7 = normaalid) ----------
  let matA = null, matN = null;
  function arrTex(unit, pix) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pix));
    gl.activeTexture(gl.TEXTURE0); return t;
  }
  function initMatTex() {
    S.matOn = true;
    // ajutised neutraalsed (enne pildi laadimist): hall albeedo, tasane normaal
    arrTex(6, [128, 128, 128, 255]); arrTex(7, [128, 128, 255, 255]);
    if (typeof MAT_TEX === 'undefined') return;
    const load = (src, unit, done) => {
      const im = new Image();
      im.onload = () => {
        try {
          const n = Math.round(im.height / im.width), t = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
          gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, im.width, im.width, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, im);
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
          gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
          const an = gl.getExtension('EXT_texture_filter_anisotropic');
          if (an) gl.texParameterf(gl.TEXTURE_2D_ARRAY, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
          gl.activeTexture(gl.TEXTURE0);
          done(t);
        } catch (e) { console.error('mat tex', e); }
      };
      im.src = src;
    };
    load(MAT_TEX.albedo, 6, (t) => { matA = t; });
    load(MAT_TEX.normal, 7, (t) => { matN = t; });
  }
  function init(cv, opts = {}) {
    canvas = cv;
    gl = canvas.getContext('webgl2', { antialias: opts.antialias !== false, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve });
    if (!gl) return false;
    progLit = compile(LIT_VS, LIT_FS, '');
    initMatTex();
    progLitI = compile(LIT_VS, LIT_FS, '#define INST 1\n');
    progDepth = compile(DEPTH_VS, DEPTH_FS, '');
    progDepthI = compile(DEPTH_VS, DEPTH_FS, '#define INST 1\n');
    progSky = compile(SKY_VS, SKY_FS, '');
    progPart = compile(PART_VS, PART_FS, '');
    // nahastuse variandid: mõnel mobiilikiibil (nt Adreno) ei lingi ühtlane massiiv, siis tekstuurid
    const errs = [];
    for (const [bt, tt] of (window.__SKINVAR || [[false, false], [true, false], [false, true], [true, true]])) {
      const def = '#define SKIN 1\n' + (bt ? '#define BONETEX 1\n' : '') + (tt ? '#define TINTTEX 1\n' : '');
      try { progSkin = compile(LIT_VS, LIT_FS, def); progDepthSkin = compile(DEPTH_VS, DEPTH_FS, def); S.boneTex = bt; S.tintTex = tt; S.noSkin = false; gl.useProgram(progSkin.p); gl.uniform1i(progSkin.u('uMorphTex'), 5); gl.uniform1i(progSkin.u('uMorphN'), 0); break; }
      catch (e) { console.error(e); errs.push((bt ? 'B' : '') + (tt ? 'T' : '') + ':' + String(e && e.message || e).slice(0, 90)); S.noSkin = true; progSkin = progDepthSkin = null; }
    }
    if (S.noSkin) S.skinErr = errs.join(' | ').slice(0, 400);
    if (S.boneTex) {
      boneTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, boneTex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, BONE_W / 4, BONE_H);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    if (S.tintTex) {
      tintTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tintTex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, 32, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    whiteTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, whiteTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    skyVao = gl.createVertexArray(); gl.bindVertexArray(skyVao);
    const sb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    dummyShadow = makeDepthTex(1);
    setShadowSize(S.shadowSize);
    partAdd = new ParticlePool(opts.particlesAdd || 2500, true);
    partAlpha = new ParticlePool(opts.particlesAlpha || 1800, false);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
    return true;
  }
  function makeDepthTex(size) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, size, size);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    return t;
  }
  function setShadowSize(size) {
    if (shadowTex) gl.deleteTexture(shadowTex);
    if (shadowFbo) gl.deleteFramebuffer(shadowFbo);
    S.shadowSize = size;
    shadowTex = makeDepthTex(size);
    shadowFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function resize(cssW, cssH, scale) {
    S.renderScale = scale;
    const w = Math.max(1, Math.round(cssW * scale)), h = Math.max(1, Math.round(cssH * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    S.w = w; S.h = h;
  }

  // ---------------- joonistamise järjekord ----------------
  function pushRec(list, n) {
    let r = list[n];
    if (!r) { r = list[n] = { mesh: null, m: null, tint: null, emis: null, alpha: 1, rust: 1, shadow: true, cull: true, d: 0 }; }
    return r;
  }
  // tint: [r,g,b,emissiveAdd] ; emis: [r,g,b]
  function draw(mesh, m, tint, emis, opt) {
    if (!mesh || !mesh.count) return;
    const sc = M4.maxScale(m);
    const cx = m[0] * mesh.cx + m[4] * mesh.cy + m[8] * mesh.cz + m[12];
    const cy = m[1] * mesh.cx + m[5] * mesh.cy + m[9] * mesh.cz + m[13];
    const cz = m[2] * mesh.cx + m[6] * mesh.cy + m[10] * mesh.cz + m[14];
    const rad = mesh.rad * sc;
    const alpha = opt && opt.alpha !== undefined ? opt.alpha : 1;
    const inView = sphereInFrustum(cx, cy, cz, rad);
    const shadow = !(opt && opt.shadow === false) && alpha >= 1;
    if (!inView && !(shadow && S.shadowsOn && nearShadow(cx, cz, rad))) return;
    let r;
    if (alpha < 1) { r = pushRec(trans, nTrans++); } else { r = pushRec(opaque, nOpaque++); }
    r.mesh = mesh; r.m = m; r.tint = tint || WHITE; r.emis = emis || ZERO3; r.alpha = alpha;
    r.rust = opt && opt.rust !== undefined ? opt.rust : 1; r.shadow = shadow; r.cull = !(opt && opt.cull === false);
    r.vis = inView; r.cx = cx; r.cz = cz; r.rad = rad;
    r.d = (cx - cam.pos.x) ** 2 + (cy - cam.pos.y) ** 2 + (cz - cam.pos.z) ** 2;
  }
  function addInstSet(set) { instSets.push(set); return set; }
  function removeInstSet(set) { const i = instSets.indexOf(set); if (i >= 0) instSets.splice(i, 1); }
  function addLight(x, y, z, r, cr, cg, cb, intensity) { lights.push({ x, y, z, r, cr, cg, cb, i: intensity }); }

  // ---------------- kaamera ----------------
  function updateCamera() {
    const aspect = S.w / S.h;
    M4.perspective(cam.proj, cam.fov, aspect, cam.near, cam.far);
    if (cam.shiftY) cam.proj[9] = -cam.shiftY;
    let tx, ty, tz;
    if (cam.useTarget) { tx = cam.target.x; ty = cam.target.y; tz = cam.target.z; }
    else {
      const cp = Math.cos(cam.pitch);
      tx = cam.pos.x + Math.sin(cam.yaw) * cp; ty = cam.pos.y + Math.sin(cam.pitch); tz = cam.pos.z + Math.cos(cam.yaw) * cp;
    }
    M4.lookAt(cam.view, cam.pos.x, cam.pos.y, cam.pos.z, tx, ty, tz);
    M4.mul(cam.vp, cam.proj, cam.view);
    // relva/käte vaatemudelil oma püsiv vaateväli (ei veni telefoni püstvaates ega laia FOV-seadega)
    M4.perspective(vmProj, S.vmFov || 58 * Math.PI / 180, aspect, 0.03, 50);
    if (cam.shiftY) vmProj[9] = -cam.shiftY;
    M4.mul(vmVP, vmProj, cam.view);
    M4.invert(cam.invVP, cam.vp);
    const v = cam.view;
    V.set(cam.right, v[0], v[4], v[8]); V.set(cam.up, v[1], v[5], v[9]); V.set(cam.fwd, -v[2], -v[6], -v[10]);
    // frustumi tasandid
    const m = cam.vp, p = cam.planes;
    const set = (i, a, b, c, d) => { const l = Math.hypot(a, b, c); p[i] = a / l; p[i + 1] = b / l; p[i + 2] = c / l; p[i + 3] = d / l; };
    set(0, m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]);
    set(4, m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
    set(8, m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]);
    set(12, m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
    set(16, m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]);
    set(20, m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);
  }
  function sphereInFrustum(x, y, z, r) {
    const p = cam.planes;
    for (let i = 0; i < 24; i += 4) if (p[i] * x + p[i + 1] * y + p[i + 2] * z + p[i + 3] < -r) return false;
    return true;
  }
  let shCX = 0, shCZ = 0;
  function nearShadow(x, z, r) {
    const R = S.shadowRange;
    return Math.abs(x - shCX) < R + r && Math.abs(z - shCZ) < R + r;
  }
  // 3D -> ekraan (CSS pikslites), tagastab null kui taga
  function project(x, y, z, out) {
    const m = cam.vp;
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (w <= 0.01) return null;
    out = out || {};
    out.x = ((m[0] * x + m[4] * y + m[8] * z + m[12]) / w * 0.5 + 0.5) * (S.w / S.renderScale);
    out.y = (1 - ((m[1] * x + m[5] * y + m[9] * z + m[13]) / w * 0.5 + 0.5)) * (S.h / S.renderScale);
    out.d = w;
    return out;
  }
  // ekraani punktist kiir (CSS px)
  function screenRay(sx, sy) {
    const nx = (sx / (S.w / S.renderScale)) * 2 - 1, ny = 1 - (sy / (S.h / S.renderScale)) * 2;
    const m = cam.invVP;
    const tf = (x, y, z) => {
      const w = m[3] * x + m[7] * y + m[11] * z + m[15];
      return { x: (m[0] * x + m[4] * y + m[8] * z + m[12]) / w, y: (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, z: (m[2] * x + m[6] * y + m[10] * z + m[14]) / w };
    };
    const a = tf(nx, ny, -1), b = tf(nx, ny, 1);
    const d = V.norm(V.new(), V.sub(V.new(), b, a));
    return { o: a, d };
  }

  // ---------------- renderdus ----------------
  function setEnvUniforms(pr) {
    gl.uniform3fv(pr.u('uSunDir'), env.sunDir); gl.uniform3fv(pr.u('uSunCol'), env.sunCol);
    gl.uniform3fv(pr.u('uSkyCol'), env.skyCol); gl.uniform3fv(pr.u('uGndCol'), env.gndCol);
    gl.uniform3fv(pr.u('uFogCol'), env.fogCol); gl.uniform1f(pr.u('uFogDen'), env.fogDen);
    gl.uniform1f(pr.u('uFogH'), env.fogH);
    gl.uniform3f(pr.u('uCam'), cam.pos.x, cam.pos.y, cam.pos.z);
    gl.uniform1f(pr.u('uExposure'), env.exposure);
    gl.uniformMatrix4fv(pr.u('uVP'), false, cam.vp);
    gl.uniformMatrix4fv(pr.u('uSVP'), false, shadowVP);
    gl.uniform1f(pr.u('uShadowOn'), S.shadowsOn ? 1 : 0);
    gl.uniform1f(pr.u('uShadowTexel'), 1 / S.shadowSize);
    gl.uniform1i(pr.u('uShadow'), 0);
    gl.uniform4fv(pr.u('uLP'), lightPos); gl.uniform4fv(pr.u('uLC'), lightCol);
    gl.uniform1i(pr.u('uNL'), Math.min(12, lights.length));
    gl.uniform1f(pr.u('uMatOn'), S.matOn && matA ? 1 : 0); gl.uniform1i(pr.u('uMatA'), 6); gl.uniform1i(pr.u('uMatN'), 7);
  }
  function pickLights() {
    for (const l of lights) { l.score = Math.max(0, Math.hypot(l.x - cam.pos.x, l.y - cam.pos.y, l.z - cam.pos.z) - l.r) - l.i * 2; }
    lights.sort((a, b) => a.score - b.score);
    const n = Math.min(12, lights.length);
    lightPos.fill(0); lightCol.fill(0);
    for (let i = 0; i < n; i++) {
      const l = lights[i];
      lightPos[i * 4] = l.x; lightPos[i * 4 + 1] = l.y; lightPos[i * 4 + 2] = l.z; lightPos[i * 4 + 3] = l.r;
      lightCol[i * 4] = l.cr; lightCol[i * 4 + 1] = l.cg; lightCol[i * 4 + 2] = l.cb; lightCol[i * 4 + 3] = l.i;
    }
  }
  let terrainMesh = null, terrainShadow = false;
  function setTerrain(mesh, castShadow) { terrainMesh = mesh; terrainShadow = castShadow; }

  function render(shadowCenter) {
    S.drawCalls = 0; S.tris = 0;
    pickLights();
    // --- varjukaart ---
    if (S.shadowsOn) {
      const R = S.shadowRange;
      const sd = env.sunDir;
      // ankurda tekselvõrgule, et vari ei väriseks
      const texel = (2 * R) / S.shadowSize;
      const cx = shadowCenter.x, cz = shadowCenter.z, cy = shadowCenter.y;
      M4.lookAt(shadowView, cx + sd[0] * 200, cy + sd[1] * 200, cz + sd[2] * 200, cx, cy, cz, 0, 1, 0);
      // nihuta keskpunkt tekslisse (fikseeritud valgusruumi alguspunkti suhtes)
      const lx = shadowView[0] * cx + shadowView[4] * cy + shadowView[8] * cz;
      const ly = shadowView[1] * cx + shadowView[5] * cy + shadowView[9] * cz;
      const ox = lx - Math.floor(lx / texel) * texel, oy = ly - Math.floor(ly / texel) * texel;
      M4.ortho(shadowProj, -R - ox, R - ox, -R - oy, R - oy, 20, 420);
      M4.mul(shadowVP, shadowProj, shadowView);
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFbo);
      gl.viewport(0, 0, S.shadowSize, S.shadowSize);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.6, 3.0);
      gl.disable(gl.CULL_FACE);
      gl.useProgram(progDepth.p);
      gl.uniformMatrix4fv(progDepth.u('uVP'), false, shadowVP);
      if (terrainMesh && terrainShadow) {
        gl.uniformMatrix4fv(progDepth.u('uModel'), false, ident);
        gl.bindVertexArray(terrainMesh.vao);
        gl.drawElements(gl.TRIANGLES, terrainMesh.count, terrainMesh.idxType, 0);
      }
      for (let i = 0; i < nOpaque; i++) {
        const r = opaque[i];
        if (!r.shadow || !nearShadow(r.cx, r.cz, r.rad)) continue;
        gl.uniformMatrix4fv(progDepth.u('uModel'), false, r.m);
        gl.bindVertexArray(r.mesh.vao);
        if (r.mesh.idxType) gl.drawElements(gl.TRIANGLES, r.mesh.count, r.mesh.idxType, 0); else gl.drawArrays(gl.TRIANGLES, 0, r.mesh.count);
      }
      gl.useProgram(progDepthI.p);
      gl.uniformMatrix4fv(progDepthI.u('uVP'), false, shadowVP);
      for (const s of instSets) {
        if (!s.visible || !s.castShadow || !s.count || (s.manual && !s.want)) continue;
        if (!nearShadow(s.bc[0], s.bc[2], s.br)) continue;
        s.upload();
        gl.bindVertexArray(s.vao);
        if (s.mesh.idxType) gl.drawElementsInstanced(gl.TRIANGLES, s.mesh.count, s.mesh.idxType, 0, s.count);
        else gl.drawArraysInstanced(gl.TRIANGLES, 0, s.mesh.count, s.count);
      }
      if (nSkin && !S.dbgNoSkinSh) {
        uploadBones();
        gl.useProgram(progDepthSkin.p);
        gl.uniformMatrix4fv(progDepthSkin.u('uVP'), false, shadowVP);
        drawSkinList(progDepthSkin, true, false);
      }
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.enable(gl.CULL_FACE);
    } else if (nSkin) uploadBones();
    // --- põhikaader ---
    if (post.on) ensurePost();
    gl.bindFramebuffer(gl.FRAMEBUFFER, mainTarget());
    gl.viewport(0, 0, S.w, S.h);
    gl.clearColor(env.fogCol[0], env.fogCol[1], env.fogCol[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // taevas
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.useProgram(progSky.p);
    gl.uniformMatrix4fv(progSky.u('uInvVP'), false, cam.invVP);
    gl.uniform3f(progSky.u('uCam'), cam.pos.x, cam.pos.y, cam.pos.z);
    gl.uniform3fv(progSky.u('uSunDir'), env.sunDir); gl.uniform3fv(progSky.u('uSunCol'), env.sunCol);
    gl.uniform3fv(progSky.u('uZen'), env.zenith); gl.uniform3fv(progSky.u('uHor'), env.horizon);
    gl.uniform3fv(progSky.u('uFogCol'), env.fogCol); gl.uniform1f(progSky.u('uNight'), env.night);
    gl.uniform1f(progSky.u('uExposure'), env.exposure); gl.uniform1f(progSky.u('uTime'), env.time);
    gl.uniform3fv(progSky.u('uPlDir'), env.planetDir);
    gl.bindVertexArray(skyVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, S.shadowsOn ? shadowTex : dummyShadow);
    // maastik + läbipaistmatud
    const pr = progLit;
    gl.useProgram(pr.p); setEnvUniforms(pr);
    const uM = pr.u('uModel'), uT = pr.u('uTint'), uE = pr.u('uEmis'), uA = pr.u('uAlpha'), uR = pr.u('uRust');
    gl.uniform1f(uA, 1);
    if (terrainMesh) {
      gl.uniformMatrix4fv(uM, false, ident); gl.uniform4fv(uT, WHITE); gl.uniform3fv(uE, ZERO3); gl.uniform1f(uR, 0);
      gl.bindVertexArray(terrainMesh.vao);
      gl.drawElements(gl.TRIANGLES, terrainMesh.count, terrainMesh.idxType, 0);
      S.drawCalls++; S.tris += terrainMesh.tris;
    }
    let cullOn = true;
    for (let i = 0; i < nOpaque; i++) {
      const r = opaque[i];
      if (!r.vis) continue;
      if (r.cull !== cullOn) { cullOn = r.cull; if (cullOn) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE); }
      gl.uniformMatrix4fv(uM, false, r.m); gl.uniform4fv(uT, r.tint); gl.uniform3fv(uE, r.emis); gl.uniform1f(uR, r.rust);
      gl.bindVertexArray(r.mesh.vao);
      if (r.mesh.idxType) gl.drawElements(gl.TRIANGLES, r.mesh.count, r.mesh.idxType, 0); else gl.drawArrays(gl.TRIANGLES, 0, r.mesh.count);
      S.drawCalls++; S.tris += r.mesh.tris;
    }
    if (!cullOn) gl.enable(gl.CULL_FACE);
    // nahastatud tegelased
    if (nSkin && !S.dbgNoSkin) {
      gl.useProgram(progSkin.p); setEnvUniforms(progSkin);
      gl.uniform3fv(progSkin.u('uEmis'), ZERO3); gl.uniform1f(progSkin.u('uAlpha'), 1); gl.uniform1f(progSkin.u('uRust'), 0);
      drawSkinList(progSkin, false, false);
    }
    // instantsid
    const pi = progLitI;
    gl.useProgram(pi.p); setEnvUniforms(pi);
    gl.uniform4fv(pi.u('uTint'), WHITE); gl.uniform3fv(pi.u('uEmis'), ZERO3); gl.uniform1f(pi.u('uAlpha'), 1);
    const uRI = pi.u('uRust');
    for (const s of instSets) {
      if (!s.visible || !s.count || (s.manual && !s.want)) continue;
      const dx = s.bc[0] - cam.pos.x, dz = s.bc[2] - cam.pos.z;
      if (Math.hypot(dx, dz) - s.br > s.viewDist * (S.viewMul || 1)) continue;
      if (!sphereInFrustum(s.bc[0], s.bc[1], s.bc[2], s.br)) continue;
      s.upload();
      gl.uniform1f(uRI, s.rust !== undefined ? s.rust : 1);
      gl.bindVertexArray(s.vao);
      if (s.mesh.idxType) gl.drawElementsInstanced(gl.TRIANGLES, s.mesh.count, s.mesh.idxType, 0, s.count);
      else gl.drawArraysInstanced(gl.TRIANGLES, 0, s.mesh.count, s.count);
      S.drawCalls++; S.tris += s.mesh.tris * s.count;
    }
    // käsitsi juhitud komplektid (nt baasi põrandad) peavad igal kaadril uuesti soovi andma
    for (const s of instSets) if (s.manual) s.want = false;
    // läbipaistvad
    if (nTrans) {
      gl.useProgram(pr.p); setEnvUniforms(pr);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      const list = trans.slice(0, nTrans).filter((r) => r.vis).sort((a, b) => b.d - a.d);
      for (const r of list) {
        if (r.cull) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
        gl.uniformMatrix4fv(uM, false, r.m); gl.uniform4fv(uT, r.tint); gl.uniform3fv(uE, r.emis);
        gl.uniform1f(uA, r.alpha); gl.uniform1f(uR, r.rust);
        gl.bindVertexArray(r.mesh.vao);
        if (r.mesh.idxType) gl.drawElements(gl.TRIANGLES, r.mesh.count, r.mesh.idxType, 0); else gl.drawArrays(gl.TRIANGLES, 0, r.mesh.count);
        S.drawCalls++;
      }
      gl.enable(gl.CULL_FACE); gl.depthMask(true); gl.disable(gl.BLEND);
    }
    // osakesed
    if (partAdd.n || partAlpha.n) {
      gl.useProgram(progPart.p);
      gl.uniformMatrix4fv(progPart.u('uVP'), false, cam.vp);
      gl.uniform3f(progPart.u('uR'), cam.right.x, cam.right.y, cam.right.z);
      gl.uniform3f(progPart.u('uU'), cam.up.x, cam.up.y, cam.up.z);
      gl.uniform3f(progPart.u('uCam'), cam.pos.x, cam.pos.y, cam.pos.z);
      gl.uniform1f(progPart.u('uFogDen'), env.fogDen);
      gl.uniform3fv(progPart.u('uFogCol'), env.fogCol.map((c) => { const x = Math.max(0, c * env.exposure); return Math.min(1, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)); }));
      gl.enable(gl.BLEND); gl.depthMask(false); gl.disable(gl.CULL_FACE);
      if (partAlpha.n) {
        partAlpha.fill();
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform1f(progPart.u('uAdd'), 0);
        gl.bindVertexArray(partAlpha.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, partAlpha.n);
      }
      if (partAdd.n) {
        partAdd.fill();
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform1f(progPart.u('uAdd'), 1);
        gl.bindVertexArray(partAdd.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, partAdd.n);
      }
      gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.CULL_FACE);
    }
    // vaatemudel (relv) eraldi sügavusega
    let overlayCleared = false;
    if (overlay.length) {
      gl.clear(gl.DEPTH_BUFFER_BIT); overlayCleared = true;
      gl.useProgram(pr.p); setEnvUniforms(pr); gl.uniformMatrix4fv(pr.u('uVP'), false, vmVP);
      gl.uniform1f(uA, 1);
      for (const r of overlay) {
        gl.uniformMatrix4fv(uM, false, r.m); gl.uniform4fv(uT, r.tint || WHITE); gl.uniform3fv(uE, r.emis || ZERO3); gl.uniform1f(uR, 0.4);
        gl.bindVertexArray(r.mesh.vao);
        if (r.mesh.idxType) gl.drawElements(gl.TRIANGLES, r.mesh.count, r.mesh.idxType, 0); else gl.drawArrays(gl.TRIANGLES, 0, r.mesh.count);
      }
      overlay.length = 0;
    }
    if (nSkin && skinned.slice(0, nSkin).some((r) => r.overlay)) {
      if (!overlayCleared) gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(progSkin.p); setEnvUniforms(progSkin); gl.uniformMatrix4fv(progSkin.u('uVP'), false, vmVP);
      gl.uniform3fv(progSkin.u('uEmis'), ZERO3); gl.uniform1f(progSkin.u('uAlpha'), 1); gl.uniform1f(progSkin.u('uRust'), 0);
      drawSkinList(progSkin, false, true);
    }
    if (post.on) finishPost();
    gl.bindVertexArray(null);
    nOpaque = 0; nTrans = 0; lights.length = 0; nSkin = 0; bonesUsed = 0; fpRow = false; S.frame = (S.frame || 0) + 1;
  }
  const overlay = [];
  const vmProj = new Float32Array(16), vmVP = new Float32Array(16);
  function drawOverlay(mesh, m, tint, emis) { overlay.push({ mesh, m, tint, emis }); }
  function beginShadowCenter(x, z) { shCX = x; shCZ = z; }

  return {
    S, env, cam, MAT, init, glInfo: () => { try { const d = gl.getExtension('WEBGL_debug_renderer_info'); return (d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + ' · VU ' + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) + ' · FU ' + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS); } catch (e) { return '?'; } }, resize, setShadowSize, setupPost, Mesh, InstSet, SkinMesh, texFromImage, boneRow, boneRowData, drawSkinned, portrait, PORTRAIT_ROW: BONE_H - 1, draw, drawOverlay, addInstSet, removeInstSet, addLight,
    updateCamera, render, project, screenRay, setTerrain, sphereInFrustum, beginShadowCenter,
    get gl() { return gl; }, get partAdd() { return partAdd; }, get partAlpha() { return partAlpha; },
  };
})();

// ============================================================
//  MESHBUILDER: madala polügooniarvuga mudelid lamevarjutusega
// ============================================================
class MB {
  static detail = true;
  constructor() {
    this.p = []; this.n = []; this.c = [];
    this.m = M4.create(); this.stack = [];
    this.col = [255, 255, 255, 0];
    this.jit = 0.05;
    this.rng = mulberry32(7);
  }
  color(c, mat = 0) {
    const rgb = Array.isArray(c) ? c : hexToRgb(c);
    this.col = [Math.round(clamp(rgb[0], 0, 1) * 255), Math.round(clamp(rgb[1], 0, 1) * 255), Math.round(clamp(rgb[2], 0, 1) * 255), mat];
    return this;
  }
  push() { this.stack.push(new Float32Array(this.m)); return this; }
  pop() { this.m = this.stack.pop(); return this; }
  tf(x, y, z, yaw = 0, pitch = 0, roll = 0, sx = 1, sy = 1, sz = 1) {
    const t = M4.compose(M4.create(), x, y, z, yaw, pitch, roll, sx, sy, sz);
    M4.mul(this.m, this.m, t); return this;
  }
  _pt(x, y, z) { const m = this.m; return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]]; }
  // normaali teisendus (kofaktormaatriks: töötab ka mitteühtlase skaleerimisega)
  _nr(x, y, z) {
    const m = this.m;
    const c0x = m[0], c0y = m[1], c0z = m[2], c1x = m[4], c1y = m[5], c1z = m[6], c2x = m[8], c2y = m[9], c2z = m[10];
    const ax = c1y * c2z - c1z * c2y, ay = c1z * c2x - c1x * c2z, az = c1x * c2y - c1y * c2x;
    const bx = c2y * c0z - c2z * c0y, by = c2z * c0x - c2x * c0z, bz = c2x * c0y - c2y * c0x;
    const cx = c0y * c1z - c0z * c1y, cy = c0z * c1x - c0x * c1z, cz = c0x * c1y - c0y * c1x;
    const nx = x * ax + y * bx + z * cx, ny = x * ay + y * by + z * cy, nz = x * az + y * bz + z * cz;
    const l = Math.hypot(nx, ny, nz) || 1; return [nx / l, ny / l, nz / l];
  }
  tri(a, b, c, col, na, nb, nc) {
    const A = this._pt(a[0], a[1], a[2]), B = this._pt(b[0], b[1], b[2]), C = this._pt(c[0], c[1], c[2]);
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    if (l < 1e-12) return this;
    const cc = col || this.col;
    const j = this.jit ? 1 + (this.rng() - 0.5) * 2 * this.jit : 1;
    let N = null;
    if (na) {
      N = [this._nr(na[0], na[1], na[2]), this._nr(nb[0], nb[1], nb[2]), this._nr(nc[0], nc[1], nc[2])];
      const s = N[0][0] * nx + N[0][1] * ny + N[0][2] * nz + N[1][0] * nx + N[1][1] * ny + N[1][2] * nz;
      if (s < 0) for (const q of N) { q[0] = -q[0]; q[1] = -q[1]; q[2] = -q[2]; }
    }
    const PP = [A, B, C];
    for (let k = 0; k < 3; k++) {
      const P = PP[k];
      this.p.push(P[0], P[1], P[2]);
      if (N) this.n.push(N[k][0], N[k][1], N[k][2]); else this.n.push(nx, ny, nz);
      if (cc[3] === MAT.GLOW) this.c.push(cc[0], cc[1], cc[2], cc[3]);
      else this.c.push(Math.min(255, cc[0] * j), Math.min(255, cc[1] * j), Math.min(255, cc[2] * j), cc[3]);
    }
    return this;
  }
  quad(a, b, c, d, col, na, nb, nc, nd) {
    if (na) { this.tri(a, b, c, col, na, nb, nc); this.tri(a, c, d, col, na, nc, nd); }
    else { this.tri(a, b, c, col); this.tri(a, c, d, col); }
    return this;
  }
  // tsentreeritud kast; piisavalt suurtel kastidel faasitud servad (siledad servanormaalid)
  box(x, y, z, w, h, d) {
    const mn = Math.min(w, h, d);
    if (MB.detail && mn >= 0.03) return this.rbox(x, y, z, w, h, d, Math.min(0.045, mn * 0.14));
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2, z0 = z - d / 2, z1 = z + d / 2;
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); // ülemine
    this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); // alumine
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); // +z
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]); // -z
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]); // +x
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]); // -x
    return this;
  }
  rbox(x, y, z, w, h, d, r) {
    const H = [w / 2, h / 2, d / 2];
    const G = H.map((hh) => [-hh, -hh + r, hh - r, hh]);
    const pt = (q) => {
      const inn = [0, 0, 0], dir = [0, 0, 0];
      for (let k = 0; k < 3; k++) { inn[k] = Math.max(-(H[k] - r), Math.min(H[k] - r, q[k])); dir[k] = q[k] - inn[k]; }
      const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
      const n = [dir[0] / l, dir[1] / l, dir[2] / l];
      return { p: [x + inn[0] + n[0] * r, y + inn[1] + n[1] * r, z + inn[2] + n[2] * r], n };
    };
    // iga tahk: telg ax, märk sg; (u,v) teljed
    const faces = [[1, 1, 2, 0], [1, -1, 0, 2], [2, 1, 0, 1], [2, -1, 1, 0], [0, 1, 1, 2], [0, -1, 2, 1]];
    for (const [ax, sg, ua, va] of faces) {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const mk = (ii, jj) => { const q = [0, 0, 0]; q[ax] = sg * H[ax]; q[ua] = G[ua][ii]; q[va] = G[va][jj]; return pt(q); };
        const A = mk(i, j), B = mk(i + 1, j), C = mk(i + 1, j + 1), D = mk(i, j + 1);
        this.quad(A.p, B.p, C.p, D.p, null, A.n, B.n, C.n, D.n);
      }
    }
    return this;
  }
  // kast alumisest servast (y = põhi)
  boxB(x, y, z, w, h, d) { return this.box(x, y + h / 2, z, w, h, d); }
  // vertikaalne silinder/koonus, alus y, kõrgus h (siledad küljed, tihedam jaotus)
  cyl(x, y, z, r0, r1, h, seg = 8, caps = true, phase = 0) {
    const big = Math.max(r0, r1);
    if (MB.detail && big > 0.012) seg = Math.min(40, Math.max(seg * 2, big > 0.08 ? 16 : 10));
    const rows = MB.detail && big > 0.012 ? (Math.abs(h) > 0.25 ? 3 : 2) : 1;
    const sl = (r0 - r1) / (Math.abs(h) || 1);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * TAU + phase, a1 = ((i + 1) / seg) * TAU + phase;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const n0 = [c0, sl, s0], n1 = [c1, sl, s1];
      for (let k = 0; k < rows; k++) {
        const t0 = k / rows, t1 = (k + 1) / rows;
        const ra = r0 + (r1 - r0) * t0, rb = r0 + (r1 - r0) * t1, ya = y + h * t0, yb = y + h * t1;
        const p00 = [x + c0 * ra, ya, z + s0 * ra], p10 = [x + c1 * ra, ya, z + s1 * ra];
        const p01 = [x + c0 * rb, yb, z + s0 * rb], p11 = [x + c1 * rb, yb, z + s1 * rb];
        if (rb > 0.0001) this.quad(p00, p01, p11, p10, null, n0, n0, n1, n1);
        else this.tri(p00, p01, p10, null, n0, [0, 1, 0], n1);
      }
      const p00 = [x + c0 * r0, y, z + s0 * r0], p10 = [x + c1 * r0, y, z + s1 * r0];
      const p01 = [x + c0 * r1, y + h, z + s0 * r1], p11 = [x + c1 * r1, y + h, z + s1 * r1];
      if (caps) {
        if (r1 > 0.0001) this.tri([x, y + h, z], p11, p01);
        if (r0 > 0.0001) this.tri([x, y, z], p00, p10);
      }
    }
    return this;
  }
  // kera (siledad normaalid, tihedam jaotus)
  sphere(x, y, z, r, seg = 8, rings = 5, sy = 1) {
    if (MB.detail && r > 0.015) { seg = Math.min(48, seg * 2); rings = Math.min(32, rings * 2); }
    const P = (t, a) => [x + Math.sin(t) * Math.cos(a) * r, y + Math.cos(t) * r * sy, z + Math.sin(t) * Math.sin(a) * r];
    const Nn = (t, a) => [Math.sin(t) * Math.cos(a), Math.cos(t) / (sy || 1), Math.sin(t) * Math.sin(a)];
    for (let j = 0; j < rings; j++) {
      const t0 = (j / rings) * Math.PI, t1 = ((j + 1) / rings) * Math.PI;
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * TAU, a1 = ((i + 1) / seg) * TAU;
        const A = P(t0, a0), B = P(t0, a1), C = P(t1, a1), D = P(t1, a0);
        const nA = Nn(t0, a0), nB = Nn(t0, a1), nC = Nn(t1, a1), nD = Nn(t1, a0);
        if (j === 0) this.tri(A, C, D, null, nA, nC, nD);
        else if (j === rings - 1) this.tri(A, B, D, null, nA, nB, nD);
        else this.quad(A, B, C, D, null, nA, nB, nC, nD);
      }
    }
    return this;
  }
  // deformeeritud ikosaeeder (kivid)
  rock(x, y, z, r, rng, rough = 0.35, sy = 0.8) {
    const t = (1 + Math.sqrt(5)) / 2;
    let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
    let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    v = v.map((p) => { const l = Math.hypot(p[0], p[1], p[2]); const k = (1 + (rng() - 0.5) * 2 * rough) / l; return [p[0] * k, p[1] * k, p[2] * k]; });
    if (MB.detail) for (let lv = 0; lv < 2; lv++) { // jaotus + väiksem müra: tahulised, kuid detailsemad kivid
      const mid = new Map(), nf = [];
      const m = (a, b) => { const key = a < b ? a + '_' + b : b + '_' + a; if (mid.has(key)) return mid.get(key);
        const A = v[a], B = v[b], la = Math.hypot(...A), lb = Math.hypot(...B), L = (la + lb) / 2;
        let p = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2]; const lp = Math.hypot(...p) || 1;
        const k = L * (1 + (rng() - 0.5) * rough * (lv ? 0.28 : 0.5)) / lp; p = [p[0] * k, p[1] * k, p[2] * k];
        v.push(p); mid.set(key, v.length - 1); return v.length - 1; };
      for (const [a, b, c] of f) { const ab = m(a, b), bc = m(b, c), ca = m(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); }
      f = nf;
    }
    v = v.map((p) => [x + p[0] * r, y + p[1] * r * sy, z + p[2] * r]);
    for (const tr of f) this.tri(v[tr[0]], v[tr[1]], v[tr[2]]);
    return this;
  }
  build() {
    MB.total = (MB.total || 0) + this.p.length / 9;
    return new GFX.Mesh({ pos: new Float32Array(this.p), nor: new Float32Array(this.n), col: new Uint8Array(this.c) });
  }
}
