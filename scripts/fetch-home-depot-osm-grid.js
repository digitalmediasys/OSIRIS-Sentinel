const https = require('https');
const fs = require('fs');

const endpoint = 'https://overpass.openstreetmap.fr/api/interpreter';
const boxes = [
  {south: 24, west: -125, north: 34, east: -115},
  {south: 24, west: -115, north: 34, east: -105},
  {south: 24, west: -105, north: 34, east: -95},
  {south: 24, west: -95, north: 34, east: -85},
  {south: 24, west: -85, north: 34, east: -75},
  {south: 24, west: -75, north: 34, east: -66},
  {south: 34, west: -125, north: 44, east: -115},
  {south: 34, west: -115, north: 44, east: -105},
  {south: 34, west: -105, north: 44, east: -95},
  {south: 34, west: -95, north: 44, east: -85},
  {south: 34, west: -85, north: 44, east: -75},
  {south: 34, west: -75, north: 44, east: -66},
  {south: 44, west: -125, north: 50, east: -115},
  {south: 44, west: -115, north: 50, east: -105},
  {south: 44, west: -105, north: 50, east: -95},
  {south: 44, west: -95, north: 50, east: -85},
  {south: 44, west: -85, north: 50, east: -75},
  {south: 44, west: -75, north: 50, east: -66},
  {south: 50, west: -170, north: 72, east: -130},
  {south: 18, west: -161, north: 23, east: -154},
  {south: 17.5, west: -67.5, north: 18.5, east: -64},
];

function queryForBox(box) {
  return `[out:json][timeout:180];(` +
    `node(${box.south},${box.west},${box.north},${box.east})["brand"~"Home[_ ]?Depot",i];` +
    `way(${box.south},${box.west},${box.north},${box.east})["brand"~"Home[_ ]?Depot",i];` +
    `relation(${box.south},${box.west},${box.north},${box.east})["brand"~"Home[_ ]?Depot",i];` +
    `node(${box.south},${box.west},${box.north},${box.east})["shop"="doityourself"]["name"~"Home[_ ]?Depot",i];` +
    `way(${box.south},${box.west},${box.north},${box.east})["shop"="doityourself"]["name"~"Home[_ ]?Depot",i];` +
    `relation(${box.south},${box.west},${box.north},${box.east})["shop"="doityourself"]["name"~"Home[_ ]?Depot",i];` +
    `);out center qt;`;
}

function request(query) {
  return new Promise((resolve, reject) => {
    const data = `data=${encodeURIComponent(query)}`;
    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'OSIRIS-Sentinel/1.0',
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`status ${res.statusCode}: ${body.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const seen = new Map();

  for (const box of boxes) {
    console.log('Querying box', box);
    const result = await request(queryForBox(box));
    console.log('  elements', Array.isArray(result.elements) ? result.elements.length : 0);
    for (const el of result.elements || []) {
      const key = `${el.type}-${el.id}`;
      if (!seen.has(key)) {
        seen.set(key, el);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  const elements = [...seen.values()];
  console.log('Total unique elements', elements.length);
  const output = { version: 0.6, generator: 'Static OSM Dump', elements };
  fs.writeFileSync('src/lib/home-depot-osm-dump.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('Saved src/lib/home-depot-osm-dump.json');
})();
