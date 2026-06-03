const https = require("https");
const url = "https://www.spscommerce.com/community/articles/home-depots-dc-list";
https.get(url, { headers: { "User-Agent": "curl/7.68.0" } }, res => {
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => {
    const m = d.match(/"content":"((?:[^"\\]|\\.)*)"/);
    if (!m) { console.error('NO MATCH'); return; }
    const content = JSON.parse('"' + m[1] + '"');
    const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const entries = [];
    let currentType = '';
    for (const line of lines) {
      const typeMatch = line.match(/^(Bulk Distribution Centers \(BDC\)|Direct Fulfillment Centers \(DFC\)|Flatbed Distribution Centers \(FDC\)|Internal Freight Consolidation \(IFC\)|Market Delivery Operations \(MDO\)|Rapid Distribution Centers \(RDC\)|Stocking Distribution Centers \(SDC\))$/);
      if (typeMatch) { currentType = typeMatch[1]; continue; }
      const r = line.match(/^\d+\.\s+([A-Z0-9]+):\s+(.+)$/);
      if (r) {
        entries.push({ code: r[1], type: currentType, address: r[2] });
      }
    }
    entries.forEach(e => console.log(`${e.code}|${e.type}|${e.address}`));
    console.log('--- count', entries.length);
  });
}).on("error", e => console.error("ERROR", e.message));
