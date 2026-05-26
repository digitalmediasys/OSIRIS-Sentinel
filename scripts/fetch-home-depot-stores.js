const https = require('https');
const fs = require('fs');

// Fetch Home Depot locations from OpenStreetMap Overpass API and normalize them.
// Writes output to src/lib/home-depot-stores.json

const query = `[out:json][timeout:180];
area["ISO3166-1"="US"][admin_level=2]->.searchArea;
(
  node(area.searchArea)["brand"~"Home[_ ]?Depot", i];
  way(area.searchArea)["brand"~"Home[_ ]?Depot", i];
  relation(area.searchArea)["brand"~"Home[_ ]?Depot", i];
  node(area.searchArea)["name"~"Home[_ ]?Depot", i];
  way(area.searchArea)["name"~"Home[_ ]?Depot", i];
  relation(area.searchArea)["name"~"Home[_ ]?Depot", i];
  node(area.searchArea)["shop"="doityourself"]["name"~"Home[_ ]?Depot", i];
);
out center qt;`;

const endpoints = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function post(endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = `data=${encodeURIComponent(data)}`;
    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'OSIRIS-Sentinel/1.0',
      },
      timeout: 120000,
    }, (res) => {
      let out = '';
      res.on('data', (c) => (out += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(out));
          } catch (err) {
            reject(new Error(`Invalid JSON: ${err.message}`));
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${out.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

function inferType(tags) {
  const name = (tags && (tags.name || tags.brand || '')).toLowerCase();
  const t = (tags && (tags.building || tags.industrial || tags.landuse || '')) || '';
  if (/distribution|dc|warehouse|fulfillment/.test(name + ' ' + t)) return 'Distribution Center';
  return 'Store';
}

function elementToStore(el) {
  const lat = el.lat ?? (el.center && el.center.lat);
  const lon = el.lon ?? (el.center && el.center.lon);
  if (lat == null || lon == null) return null;
  const tags = el.tags || {};
  const city = tags['addr:city'] || tags['addr:place'] || '';
  const state = tags['addr:state'] || tags['addr:province'] || '';
  const country = tags['addr:country'] || 'USA';
  const postal = tags['addr:postcode'] || '';
  const street = tags['addr:street'] || '';
  const name = tags.name || tags.brand || 'Home Depot';
  return {
    id: `${el.type}-${el.id}`,
    name: name,
    type: inferType(tags),
    street,
    city,
    state,
    postal,
    country,
    lat,
    lng: lon,
    source: 'openstreetmap',
    tags,
  };
}

(async () => {
  for (const ep of endpoints) {
    console.log('Trying', ep);
    try {
      const json = await post(ep, query);
      const elements = Array.isArray(json.elements) ? json.elements : [];
      console.log('Fetched elements:', elements.length);

      const seen = new Map();
      for (const el of elements) {
        const store = elementToStore(el);
        if (!store) continue;
        // de-duplicate by lat/lng/name
        const key = `${store.lat.toFixed(6)}:${store.lng.toFixed(6)}:${(store.name || '').toLowerCase()}`;
        if (!seen.has(key)) seen.set(key, store);
      }

      const stores = Array.from(seen.values());
      console.log('Unique stores:', stores.length);
      const out = { generated: new Date().toISOString(), count: stores.length, stores };
      fs.writeFileSync('src/lib/home-depot-stores.json', JSON.stringify(out, null, 2), 'utf8');
      console.log('Saved src/lib/home-depot-stores.json');
      return;
    } catch (err) {
      console.error('Endpoint failed', ep, err.message || err);
      continue;
    }
  }
  console.error('All Overpass endpoints failed');
  process.exit(1);
})();
