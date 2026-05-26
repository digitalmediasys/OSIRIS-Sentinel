const fs = require('fs');
const path = require('path');

function inferType(tags) {
  const name = (tags && (tags.name || tags.brand || '')).toLowerCase();
  const t = (tags && (tags.building || tags.industrial || tags.landuse || '')) || '';
  if (/distribution|dc|warehouse|fulfillment/.test(name + ' ' + t)) return 'Distribution Center';
  return 'Store';
}

function normalizeElement(el) {
  const lat = el.lat ?? (el.center && el.center.lat);
  const lon = el.lon ?? (el.center && el.center.lon);
  if (lat == null || lon == null) return null;
  const tags = el.tags || {};
  const name = tags.name || tags.brand || tags.alt_name || 'Home Depot';
  const city = tags['addr:city'] || tags['addr:place'] || '';
  const state = tags['addr:state'] || tags['addr:province'] || '';
  const country = tags['addr:country'] || 'USA';
  return {
    id: `${el.type}-${el.id}`,
    name: String(name),
    type: inferType(tags),
    street: tags['addr:street'] || '',
    city,
    state,
    country,
    lat: Number(lat),
    lng: Number(lon),
    source: 'openstreetmap-dump',
    tags,
  };
}

function main() {
  const dumpPath = path.join(process.cwd(), 'src', 'lib', 'home-depot-osm-dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error('Dump file not found:', dumpPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(dumpPath, 'utf8');
  const json = JSON.parse(raw);
  const elements = Array.isArray(json.elements) ? json.elements : [];
  const seen = new Map();
  for (const el of elements) {
    const store = normalizeElement(el);
    if (!store) continue;
    const key = `${store.lat.toFixed(6)}:${store.lng.toFixed(6)}:${store.name.toLowerCase()}`;
    if (!seen.has(key)) seen.set(key, store);
  }
  const stores = Array.from(seen.values());
  const out = { generated: new Date().toISOString(), count: stores.length, stores };
  const outPath = path.join(process.cwd(), 'src', 'lib', 'home-depot-stores.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', outPath, 'stores:', stores.length);
}

main();
