const https = require('https');
const fs = require('fs');
const query = `[out:json][timeout:120];
area["ISO3166-1"="US"][admin_level=2]->.searchArea;
(
  node(area.searchArea)["brand"~"Home Depot", i];
  way(area.searchArea)["brand"~"Home Depot", i];
  relation(area.searchArea)["brand"~"Home Depot", i];
  node(area.searchArea)["name"~"Home Depot", i];
  way(area.searchArea)["name"~"Home Depot", i];
  relation(area.searchArea)["name"~"Home Depot", i];
  node(area.searchArea)["shop"="doityourself"]["name"~"Home Depot", i];
);
out center;`;
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function request(url) {
  return new Promise((resolve, reject) => {
    const data = `data=${encodeURIComponent(query)}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'OSIRIS-Sentinel/1.0',
      },
      timeout: 120000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error(`Invalid JSON: ${err.message}`));
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const endpoint of endpoints) {
    console.log(`Trying ${endpoint}...`);
    try {
      const result = await request(endpoint);
      console.log('Success, elements:', Array.isArray(result.elements) ? result.elements.length : 'none');
      fs.writeFileSync('src/lib/home-depot-osm-dump.json', JSON.stringify(result, null, 2), 'utf8');
      console.log('Saved src/lib/home-depot-osm-dump.json');
      return;
    } catch (error) {
      console.error(`Endpoint failed: ${endpoint}`, error.message);
    }
  }
  console.error('All Overpass endpoints failed');
  process.exit(1);
})();