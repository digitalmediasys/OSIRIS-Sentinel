const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Scrape Home Depot official store-locator page and extract store locations.
// Saves output to src/lib/home-depot-stores.json

async function scrape() {
  const url = 'https://www.homedepot.com/l/store-locator';
  // find system Chrome/Chromium/Edge
  function findChrome() {
    const envPath = process.env.CHROME_PATH || process.env.CHROMIUM_PATH || process.env.BROWSER_PATH;
    if (envPath && fs.existsSync(envPath)) return envPath;
    const platform = process.platform;
    const candidates = [];
    if (platform === 'win32') {
      const prog = process.env['ProgramFiles'] || 'C:\\Program Files';
      const progx86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
      const local = process.env['LocalAppData'] || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local') : null);
      candidates.push(path.join(prog, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(progx86, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      if (local) candidates.push(path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(prog, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
      candidates.push(path.join(progx86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    } else if (platform === 'darwin') {
      candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
      candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
      candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    } else {
      candidates.push('/usr/bin/google-chrome-stable');
      candidates.push('/usr/bin/google-chrome');
      candidates.push('/usr/bin/chromium-browser');
      candidates.push('/usr/bin/chromium');
      candidates.push('/snap/bin/chromium');
    }
    for (const c of candidates) {
      try { if (c && fs.existsSync(c)) return c; } catch (e) {}
    }
    return null;
  }

  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error('No system Chrome/Chromium found. Set CHROME_PATH environment variable to your browser executable path or install Chrome.');
  }
  const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');

  const stores = new Map();

  // Capture JSON XHR responses that look like store payloads
  page.on('response', async (res) => {
    try {
      const ct = res.headers()['content-type'] || '';
      if (!/application\/json/.test(ct)) return;
      const url = res.url();
      if (!/store|location|locator|stores|nearby/i.test(url)) return;
      const txt = await res.text();
      if (!txt) return;
      let obj;
      try { obj = JSON.parse(txt); } catch (e) { return; }
      // Search object recursively for store-like records
      const queue = [obj];
      while (queue.length) {
        const cur = queue.shift();
        if (!cur || typeof cur !== 'object') continue;
        if (Array.isArray(cur)) {
          for (const item of cur) queue.push(item);
          continue;
        }
        // heuristics: look for latitude/longitude fields
        if ((cur.latitude || cur.lat || (cur.location && cur.location.lat)) && (cur.longitude || cur.lon || (cur.location && cur.location.lon))) {
          const lat = Number(cur.latitude ?? cur.lat ?? (cur.location && cur.location.lat));
          const lng = Number(cur.longitude ?? cur.lon ?? (cur.location && cur.location.lon));
          const name = cur.displayName || cur.name || cur.storeName || cur.store || cur.title || '';
          const id = cur.storeNumber || cur.id || `${lat}:${lng}:${name}`;
          stores.set(id, { id, name, lat, lng, raw: cur });
        }
        for (const k of Object.keys(cur)) queue.push(cur[k]);
      }
    } catch (err) {
      // ignore parse errors
    }
  });

  console.log('Loading store-locator page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // The site may load stores via XHR after initial load; wait a bit so responses are captured
  await page.waitForTimeout(5000);

  // Additionally, try to extract any stores rendered into the DOM
  const domStores = await page.evaluate(() => {
    const out = [];
    // common data attributes or script tags
    try {
      // Look for scripts containing JSON with 'stores' or 'locations'
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const s of scripts) {
        const t = s.textContent || '';
        if (/stores|locations|latitude|longitude|storeNumber/i.test(t)) {
          try {
            const m = t.match(/\{[\s\S]*\}/m);
            if (m) {
              const obj = JSON.parse(m[0]);
              out.push(obj);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    return out;
  });

  for (const o of domStores) {
    const queue = [o];
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || typeof cur !== 'object') continue;
      if (Array.isArray(cur)) { for (const i of cur) queue.push(i); continue; }
      if ((cur.latitude || cur.lat || (cur.location && cur.location.lat)) && (cur.longitude || cur.lon || (cur.location && cur.location.lon))) {
        const lat = Number(cur.latitude ?? cur.lat ?? (cur.location && cur.location.lat));
        const lng = Number(cur.longitude ?? cur.lon ?? (cur.location && cur.location.lon));
        const name = cur.displayName || cur.name || cur.storeName || cur.store || cur.title || '';
        const id = cur.storeNumber || cur.id || `${lat}:${lng}:${name}`;
        stores.set(id, { id, name, lat, lng, raw: cur });
      }
      for (const k of Object.keys(cur)) queue.push(cur[k]);
    }
  }

  await browser.close();

  const arr = Array.from(stores.values()).map((s, i) => ({
    id: s.id,
    name: s.name || 'Home Depot',
    type: 'Store',
    city: '',
    state: '',
    country: 'USA',
    lat: Number(s.lat),
    lng: Number(s.lng),
    source: 'homedepot-official',
  })).filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));

  const out = { generated: new Date().toISOString(), count: arr.length, stores: arr };
  const outPath = path.join(process.cwd(), 'src', 'lib', 'home-depot-stores.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved', outPath, 'stores:', arr.length);
}

scrape().catch((err) => { console.error(err); process.exit(1); });
