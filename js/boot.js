// K73 laadija: loeb data/index.json, laadib mudelid (.json + .bin) ja tekstuurid eraldi failidest
// edenemisribaga, seejärel mängu koodifailid õiges järjekorras ja käivitab mängu.
(function () {
  'use strict';
  var L = document.getElementById('loading');
  function say(t) { if (L) { L.hidden = false; L.textContent = t; } }
  function fail(msg) {
    say(msg);
    if (L) L.style.cssText += ';font-size:14px;letter-spacing:0;padding:20px;text-align:center';
  }
  if (location.protocol === 'file:') {
    fail('K73 needs to be opened through a web server (e.g. GitHub Pages, or run "python3 -m http.server" in this folder).');
    return;
  }

  var total = 1, done = 0;
  function progress() { say('LOADING… ' + Math.min(99, Math.floor(done / total * 100)) + '%'); }

  // fetch koos edenemisega (baitide kaupa)
  function get(url, kind) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
      if (!res.body || !res.body.getReader) {
        return res.arrayBuffer().then(function (b) { done += b.byteLength; progress(); return b; });
      }
      var rd = res.body.getReader(), parts = [], n = 0;
      function pump() {
        return rd.read().then(function (r) {
          if (r.done) {
            var u = new Uint8Array(n), o = 0;
            for (var i = 0; i < parts.length; i++) { u.set(parts[i], o); o += parts[i].length; }
            return u.buffer;
          }
          parts.push(r.value); n += r.value.length; done += r.value.length; progress();
          return pump();
        });
      }
      return pump();
    }).then(function (buf) { return kind === 'json' ? JSON.parse(new TextDecoder().decode(buf)) : buf; });
  }

  // {"$bin":[nihe, pikkus]} -> Uint8Array (oma puhvriga, et dekooderid saaksid nihetega lõigata)
  function resolve(x, bin) {
    if (Array.isArray(x)) { for (var i = 0; i < x.length; i++) x[i] = resolve(x[i], bin); return x; }
    if (x && typeof x === 'object') {
      if (x.$bin) return new Uint8Array(bin.slice(x.$bin[0], x.$bin[0] + x.$bin[1]));
      for (var k in x) x[k] = resolve(x[k], bin);
    }
    return x;
  }

  function loadScript(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = ok; s.onerror = function () { no(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  progress();
  fetch('data/index.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (idx) {
    total = idx.data.reduce(function (a, d) { return a + d.size; }, 0) || 1;
    return Promise.all(idx.data.map(function (d) {
      return Promise.all([get(d.json, 'json'), d.bin ? get(d.bin, 'bin') : null]).then(function (r) {
        window[d.var] = d.bin ? resolve(r[0], r[1]) : r[0];
      });
    })).then(function () {
      say('LOADING… 100%');
      // koodifailid järjest (async=false hoiab järjekorra), viimase järel käivitus
      return Promise.all(idx.code.map(loadScript));
    });
  }).then(function () {
    var start = function (data) {
      try { Game.boot(data || {}); }
      catch (e) { console.error(e); fail('Startup error: ' + e.message); }
    };
    var h = window.claude && window.claude.hot;
    if (h && h.ready) h.ready(start); else start(h && h.data ? h.data : {});
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
  }).catch(function (e) {
    console.error(e);
    fail('Loading failed: ' + e.message + '. Check your connection and reload.');
  });
})();
