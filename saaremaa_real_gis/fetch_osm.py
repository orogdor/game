import json, math, pathlib, urllib.request, urllib.parse, datetime, xml.etree.ElementTree as ET
from shapely.geometry import LineString, Polygon, mapping
from shapely.ops import transform
from shapely.validation import make_valid
ROOT=pathlib.Path("saaremaa_real_gis")
KML=ET.fromstring((ROOT/"official_map_2025.kml").read_bytes())
P=[p for p in KML.findall(".//{*}Placemark") if "Toomalõuka tee" in (p.findtext("{*}name") or "")]
if len(P)!=1: raise RuntimeError("Stage name does not identify one line")
coord_el=P[0].find(".//{*}LineString/{*}coordinates")
points=[[float(q.split(",")[0]),float(q.split(",")[1])] for q in coord_el.text.split()]
start=[22.1252951,58.174322]
if math.dist(points[-1],start)<math.dist(points[0],start): points.reverse()
base_lon,base_lat=points[0]
sx=111320*math.cos(math.radians(base_lat));sy=111320
toXY=lambda x,y,z=None: ((x-base_lon)*sx,(y-base_lat)*sy) if z is None else ((x-base_lon)*sx,(y-base_lat)*sy,z)
toLL=lambda x,y,z=None: (base_lon+x/sx,base_lat+y/sy) if z is None else (base_lon+x/sx,base_lat+y/sy,z)
corridor=LineString([toXY(*p) for p in points]).buffer(310)
bbox=(min(p[1] for p in points)-.008,min(p[0] for p in points)-.012,max(p[1] for p in points)+.008,max(p[0] for p in points)+.012)
bb=",".join(str(round(v,7)) for v in bbox)
query='[out:json][timeout:120];(way["building"]('+bb+');way["landuse"~"^(forest|meadow|farmland|grass|residential|orchard)$"]('+bb+');way["natural"~"^(wood|scrub|grassland|heath)$"]('+bb+');way["highway"]('+bb+'););out geom;'
apis=[
 "https://overpass.kumi.systems/api/interpreter",
 "https://overpass-api.de/api/interpreter",
 "https://overpass.nchc.org.tw/api/interpreter"]
obj=None;errors=[]
for api in apis:
 try:
  req=urllib.request.Request(api,data=urllib.parse.urlencode({"data":query}).encode(),headers={"User-Agent":"SaaremaaRally-GIS/1.0 public OSM data processing","Content-Type":"application/x-www-form-urlencoded"})
  with urllib.request.urlopen(req,timeout=160) as r:
   obj=json.loads(r.read())
  if "elements" not in obj: raise ValueError(str(obj)[:300])
  break
 except Exception as e: errors.append(api+": "+str(e)[:240])
if obj is None:
 (ROOT/"OSM_REPORT.txt").write_text("Overpass failed:\n"+"\n".join(errors))
 raise RuntimeError("OSM download failed: "+str(errors))
features=[]
counts={}
for way in obj["elements"]:
 if way.get("type")!="way" or len(way.get("geometry") or [])<2:continue
 tags=way.get("tags") or {}
 xy=[toXY(n["lon"],n["lat"]) for n in way["geometry"]]
 polygon=bool(tags.get("building") or tags.get("landuse") or tags.get("natural")) and len(xy)>=4 and xy[0]==xy[-1]
 try:
  geometry=Polygon(xy) if polygon else LineString(xy)
  if not geometry.is_valid: geometry=make_valid(geometry)
  if not geometry.intersects(corridor):continue
  geometry=geometry.intersection(corridor)
  if geometry.is_empty:continue
  geometry=geometry.simplify(.45,preserve_topology=True)
  geometry=transform(toLL,geometry)
  if geometry.is_empty:continue
  layer="buildings" if tags.get("building") else ("landcover" if tags.get("landuse") or tags.get("natural") else "roads")
  props=dict(tags)
  props.update({"_source_layer":layer,"osm_id":way["id"],"source":"OpenStreetMap contributors"})
  features.append({"type":"Feature","properties":props,"geometry":mapping(geometry)})
  counts[layer]=counts.get(layer,0)+1
 except Exception as e:
  pass
out={"type":"FeatureCollection","metadata":{"source":"OpenStreetMap contributors via Overpass API","download_time_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"corridor_m":310,"source_stage":"Saaremaa Rally official KML 2025","osm_elements_queried":len(obj["elements"]),"feature_counts":counts,"elevation_source":None},"features":features}
(ROOT/"osm_environment.geojson").write_text(json.dumps(out,ensure_ascii=False,separators=(",",":")))
(ROOT/"OSM_REPORT.txt").write_text(json.dumps(out["metadata"],indent=2,ensure_ascii=False))
print("OSM:",out["metadata"])
