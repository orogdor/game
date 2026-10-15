// K73 teenustöötaja: kõik mängu failid (kood, mudelid, tekstuurid) vahemällu -> töötab ka ilma internetita.
// Iga uus versioon saab uue vahemälu nime (ehitusskript lisab failide räsi), vana kustutatakse.
const CACHE = 'k73-v47-5dfc3a3a';
const FILES = [
"./",
"./css/k73.css",
"./data/architecture.bin",
"./data/architecture.json",
"./data/base.bin",
"./data/base.json",
"./data/characters.bin",
"./data/characters.json",
"./data/creatures.bin",
"./data/creatures.json",
"./data/furniture.bin",
"./data/furniture.json",
"./data/gear.bin",
"./data/gear.json",
"./data/index.json",
"./data/machines.bin",
"./data/machines.json",
"./data/materials.json",
"./data/models.bin",
"./data/models.json",
"./data/predator.bin",
"./data/predator.json",
"./data/prey.bin",
"./data/prey.json",
"./data/props.bin",
"./data/props.json",
"./data/tex/female_mask.png",
"./data/tex/female_tex.jpg",
"./data/tex/male_mask.png",
"./data/tex/male_tex.jpg",
"./data/tex/materials_albedo.jpg",
"./data/tex/materials_normal.jpg",
"./data/tex/soldier_mask.png",
"./data/tex/soldier_tex.jpg",
"./data/weapons.bin",
"./data/weapons.json",
"./icons/apple-touch-icon.png",
"./icons/icon-192.png",
"./icons/icon-512.png",
"./icons/maskable-512.png",
"./index.html",
"./js/00a_version.js",
"./js/01_util.js",
"./js/02_gfx.js",
"./js/03_models.js",
"./js/03b_chars.js",
"./js/03c_look.js",
"./js/03g_gunsinit.js",
"./js/04_world.js",
"./js/05_base.js",
"./js/06_audio.js",
"./js/07_ents.js",
"./js/07b_kiskja.js",
"./js/07c_prey.js",
"./js/08_fx.js",
"./js/09_econ.js",
"./js/09b_inv.js",
"./js/10_player.js",
"./js/11_comets.js",
"./js/12_crew.js",
"./js/13_rivals.js",
"./js/14_boss.js",
"./js/14b_waves.js",
"./js/15_objectives.js",
"./js/16_input.js",
"./js/17_build.js",
"./js/18_ui.js",
"./js/18b_creator.js",
"./js/19_game.js",
"./js/20_net.js",
"./js/boot.js",
"./manifest.webmanifest"
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'no-cache' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('k73-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
    // fondid jm. välised failid vahemällu esimesel laadimisel
    if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
    return res;
  }).catch(() => c.match('./index.html')))));
});
