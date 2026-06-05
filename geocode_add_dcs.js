const https = require('https');
const addresses = [
  '230 Riverview Dr, Perth Amboy, NJ 08861',
  '6600 W 68th St, Bedford Park, IL 60638',
  '23500 Mound Rd, Warren, MI 48091',
  '4040 W 108th St, Hialeah, FL 33018',
  '6770 Stonecrest Industrial Way, Stonecrest, GA 30058',
  '15720 Old Corpus Christi Rd, Elmendorf, TX 78112',
  '6089 Big Bend Rd, Gibsonton, FL 33534',
  '12933 Sam Neely Rd, Charlotte, NC 28273',
  '400 N Porter Rd, Conroe, TX 77301',
  '13131 Los Angeles Street, Irwindale, CA 91706',
  '15401 Boulder Avenue, Rosemount, MN 55068',
  '4194 Co Rd 36, Mead, CO 80651',
  '400 E Ellis Ave, Perris, CA 92570'
];

const results = [];
let index = 0;

function geocode() {
  if (index >= addresses.length) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  const address = addresses[index];
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: address, format: 'json', limit: '1', countrycodes: 'us' }).toString();
  https.get(url, {
    headers: {
      'User-Agent': 'OSIRIS-Sentinel/1.0 (contact@example.com)',
      'Accept': 'application/json',
      'Referer': 'https://www.openstreetmap.org/'
    }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const item = Array.isArray(json) && json[0] ? json[0] : null;
        results.push({ address, lat: item ? parseFloat(item.lat) : null, lng: item ? parseFloat(item.lon) : null, display_name: item ? item.display_name : null });
      } catch (err) {
        results.push({ address, lat: null, lng: null, error: err.message });
      }
      index += 1;
      setTimeout(geocode, 1100);
    });
  }).on('error', err => {
    results.push({ address, lat: null, lng: null, error: err.message });
    index += 1;
    setTimeout(geocode, 1100);
  });
}

google: geocode();
