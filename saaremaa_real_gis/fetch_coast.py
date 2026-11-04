import json,math,pathlib,urllib.request,urllib.parse,time
from shapely.geometry import LineString,Polygon,box
from shapely.ops import transform,linemerge
root=pathlib.Path("saaremaa_real_gis");root.mkdir(exist_ok=True)
kml=(root/"official_map_2025.kml").read_text()
import xml.etree.ElementTree as ET
r=ET.fromstring(kml)
p=next(q for q in r.findall(".//{*}Placemark") if "Toomalõuka tee" in (q.findtext("{*}name") or ""))
route=[list(map(float,c.split(",")[:2])) for c in p.find(".//{*}LineString/{*}coordinates").text.split()]
lon0,lat0=22.1252951,58.174322
sx=111320*math.cos(math.radians(lat0));sy=111320
toxy=lambda p: ((p[0]-lon0)*sx,(p[1]-lat0)*sy)
route_xy=LineString(list(map(toxy,route)))
minx,miny,maxx,maxy=route_xy.bounds
latmin=lat0+(miny-2400)/sy;latmax=lat0+(maxy+2400)/sy
lonmin=lon0+(minx-2400)/sx;lonmax=lon0+(maxx+2400)/sx
bbox=f"{latmin:.7f},{lonmin:.7f},{latmax:.7f},{lonmax:.7f}"
q=f'[out:json][timeout:120];way["natural"="coastline"]({bbox});out geom;'
urls=["https://overpass.kumi.systems/api/interpreter","https://overpass-api.de/api/interpreter","https://overpass.nchc.org.tw/api/interpreter"]
raw=None;errors=[]
for url in urls:
 try:
  req=urllib.request.Request(url,urllib.parse.urlencode({"data":q}).encode(),headers={"User-Agent":"SaaremaaRally GIS data fetch contact: via Github","Content-Type":"application/x-www-form-urlencoded"})
  with urllib.request.urlopen(req,timeout=160) as resp: raw=json.loads(resp.read())
  break
 except Exception as e: errors.append(str(e)[:160])
if raw is None: raise RuntimeError("Overpass coastline not accessible: "+str(errors))
coast=[]
for w in raw.get("elements",[]):
 geom=w.get("geometry") or []
 if len(geom)<2:continue
 pts=[toxy([node["lon"],node["lat"]]) for node in geom]
 line=LineString(pts).simplify(1.3)
 if line.distance(route_xy)>2000:continue
 # clip with a 1.2 km buffer around rally line, preserve direction of OSM natural=coastline ways
 coords=list(line.coords)
 fragments=line.intersection(route_xy.buffer(1200))
 for part in (fragments.geoms if hasattr(fragments,"geoms") else [fragments]):
  if part.geom_type!="LineString" or part.length<4:continue
  ll=list(part.coords)
  # preserve OSM direction by comparing original start and end distances
  if LineString(coords).project(__import__('shapely').geometry.Point(ll[0]))>LineString(coords).project(__import__('shapely').geometry.Point(ll[-1])):ll.reverse()
  coast.append({"id":w["id"],"coordinates":[[round(x,1),round(y,1)] for x,y in ll]})
out={"source":"OpenStreetMap contributors","coordinate_system":"Local metres: X East, Y North from lon0=22.1252951 lat0=58.174322","land_side":"left","water_side":"right","features":coast,"queried_bbox":bbox}
(root/"osm_coastline_local.json").write_text(json.dumps(out,separators=(",",":")))
(root/"COAST_REPORT.txt").write_text(json.dumps({"coastlines":len(coast),"points":sum(len(f["coordinates"]) for f in coast),"nearest_m":min([LineString(f["coordinates"]).distance(route_xy) for f in coast],default=None),"errors":errors},indent=2))
print((root/"COAST_REPORT.txt").read_text())
