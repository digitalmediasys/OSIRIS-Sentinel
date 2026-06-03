const https = require("https");
const url = "https://www.spscommerce.com/community/articles/home-depots-dc-list";
https.get(url, { headers: { "User-Agent": "curl/7.68.0" } }, res => {
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => {
    const text = d.replace(/<[^>]+>/g, "\n").replace(/&[#0-9a-zA-Z]+;/g, "");
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const filtered = lines.filter(l => /\d{3,4}:|BDC|DFC|FDC|IFC|MDO|RDC|SDC|Center|Distribution|Drive|Road|Street|Blvd|Ave|Pkwy|Parkway|Way|Trail|Court|Place|Rd\b/i);
    filtered.slice(0,300).forEach(l => console.log(l));
    console.log('---filtered count', filtered.length);
  });
}).on("error", e => console.error("ERROR", e.message));
