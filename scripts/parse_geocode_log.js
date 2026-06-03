const fs = require('fs');
const path = require('path');
const inFile = path.join(__dirname, '..', 'geocode_log.txt');
const outFile = path.join(__dirname, '..', 'src', 'lib', 'home-depot-dcs-geocoded.json');
if (!fs.existsSync(inFile)) { console.error('Missing', inFile); process.exit(1); }
const raw = fs.readFileSync(inFile, 'utf16le').split(/\r?\n/);
const results = [];
for (const line of raw) {
  const m = line.match(/^(\d+)\s+(OK|NORESULT|ERR)\s+(.+?)(?:\s+([0-9.+-]+),([0-9.+-]+))?\s*$/);
  if (m) {
    const idx = parseInt(m[1], 10);
    const status = m[2];
    const address = m[3].trim();
    const lat = m[4] ? parseFloat(m[4]) : null;
    const lng = m[5] ? parseFloat(m[5]) : null;
    results.push({ index: idx, status, address, lat, lng });
  }
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
console.log('WROTE', outFile, results.length);