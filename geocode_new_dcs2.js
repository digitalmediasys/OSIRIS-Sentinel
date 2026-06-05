const https = require('https');
const addresses = [
  '6770 Stonecrest Industrial Way, Stonecrest, GA 30058',
  'Stonecrest Industrial Way, Stonecrest, GA 30058',
  '4194 County Road 36, Mead, CO 80651',
  '4194 Co Rd 36, Mead, CO 80651'
];
function geocode(i, results) {
  if (i >= addresses.length) { console.log(JSON.stringify(results, null, 2)); return; }
  const address = addresses[i];
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: address, format: 'json', limit: '1', countrycodes: 'us' }).toString();
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json', 'Referer': 'https://www.openstreetmap.org/' } }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const item = json[0] || null;
        results.push({ address, lat: item ? parseFloat(item.lat) : null, lng: item ? parseFloat(item.lon) : null, display_name: item ? item.display_name : null });
      } catch (e) {
        results.push({ address, lat: null, lng: null, error: e.message });
      }
      setTimeout(() => geocode(i + 1, results), 1100);
    });
  }).on('error', e => {
    results.push({ address, lat: null, lng: null, error: e.message });
    setTimeout(() => geocode(i + 1, results), 1100);
  });
}
geocode(0, []);
