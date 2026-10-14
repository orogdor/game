# K73

WebGL2 FPS ja baasiehitus kõrbeplaneedil. Brauseris töötav veebirakendus (PWA), mida saab paigaldada telefoni või arvutisse.

**Mängi:** https://orogdor.github.io/game/ (kui GitHub Pages on sisse lülitatud: Settings → Pages → Deploy from a branch → `main` / root)

## Failide ülesehitus

| Kaust / fail | Sisu |
|---|---|
| `index.html` | HTML-kest (menüüd, HUD) |
| `css/k73.css` | stiilid |
| `js/boot.js` | laadija: laeb mudelid ja tekstuurid edenemisribaga, siis koodi |
| `js/01_util.js … 20_net.js` | mängu kood (graafika, maailm, tegelased, relvad, ehitus, kasutajaliides, võrk) |
| `data/index.json` | andmefailide ja koodifailide nimekiri |
| `data/*.json` + `data/*.bin` | 3D-mudelid: kirjeldus (JSON) + geomeetria (binaarne) |
| `data/tex/` | tegelaste tekstuurid (4096 albeedo, regioonimaskid) |
| `sw.js` | teenustöötaja: kõik failid vahemällu, töötab ilma internetita |
| `manifest.webmanifest`, `icons/` | rakenduse nimi ja ikoonid |

## Kohalik käivitamine

Mäng laeb faile `fetch`-iga, seega otse failist (topeltklõps) see ei käivitu. Käivita kaustas:

```
python3 -m http.server 8000
```

ja ava http://localhost:8000

## Litsentsid

Inimkehad: VitruvianGodot (Agile Lens, CC0), MakeHuman (CC0). Animatsioonid: Mixamo/three.js näidised, Quaternius Universal Animation Library 1–2 (CC0). Esemed: KayKit, Kenney (CC0).
