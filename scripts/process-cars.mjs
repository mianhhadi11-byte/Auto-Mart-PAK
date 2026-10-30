import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = 'C:/Users/GEO/AppData/Local/Temp/opencode/cars';
const out = 'C:/Users/GEO/Documents/Default Project/public/images/cars';
fs.mkdirSync(out, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const byTitle = Object.fromEntries(manifest.map(m => [m.title, m]));

const map = {
  'alto-1': 'File:Altovxr001.jpg',
  'alto-2': 'File:Altovxr002.jpg',
  'alto-3': 'File:Altovxr003.jpg',
  'alto-interior': 'File:AltoInterior.jpg',
  'cultus-1': 'File:2017 Suzuki Celerio SZ4 Automatic 1.0 Front.jpg',
  'cultus-2': 'File:2nd generation Suzuki Cultus.jpg',
  'cultus-3': 'File:2nd generation Suzuki Cultus rear.jpg',
  'swift-1': 'File:2012 Suzuki Swift SZ4 1.2 Front.jpg',
  'swift-2': 'File:2012 Suzuki Swift SZ4 1.2 Rear.jpg',
  'swift-3': 'File:2018 Suzuki Swift SZ5 Boosterjet SHVS 1.0 Front.jpg',
  'city-1': 'File:Honda City, 5th Generation, Pakistan, Dec 2013.jpg',
  'city-2': 'File:Honda City 1.5 LX 2016 (33755304134).jpg',
  'city-3': 'File:Honda City 1.5 i-VTEC (VII, Facelift) – f 21032025.jpg',
  'city-4': 'File:Honda City 1.5 i-VTEC (VII, Facelift) – h 21032025.jpg',
  'civic-1': 'File:2022 Honda Civic Sedan EX in Platinum White Pearl, front left.jpg',
  'civic-2': 'File:2022 Honda Civic Sedan EX in Platinum White Pearl, rear left.jpg',
  'civic-3': 'File:2022 Honda Civic Touring in Lunar Silver Metallic, Front Left, 05-10-2022.jpg',
  'civic-interior': 'File:HONDA CIVIC HATCHBACK HYBRID (FE,FL) CHINA VERSION INTERIOR.jpg',
  'corolla-1': 'File:Toyota Corolla Pakistan.jpg',
  'corolla-2': 'File:Toyota Corolla E140 Pakistan.jpg',
  'corolla-3': 'File:Toyota Corolla Altis GR Sport (front).jpg',
  'corolla-4': 'File:Toyota Corolla Altis GR Sport (rear).jpg',
  'corolla-5': 'File:Toyota Corolla (E210) sedan IMG 4189.jpg',
  'yaris-1': 'File:Toyota Yaris 1.5E Sedan 2021 (52677028712).jpg',
  'fortuner-1': 'File:Toyota Fortuner GUN165 Legender 2.8 Q 4x2 Platinum White Pearl Mica.jpg',
  'fortuner-2': 'File:2018 Toyota Fortuner 2.4 VRZ 4x2 wagon (GUN165R; 02-18-2019), South Tangerang.jpg',
  'fortuner-3': 'File:2022 Toyota Fortuner 2.8 VRZ GR Sport 4x2 GUN166R (20220428).jpg',
  'fortuner-interior': 'File:Toyota Fortuner interior.jpg',
  'sportage-1': 'File:2019 Kia Sportage 2.0 EX (32).jpg',
  'sportage-2': 'File:2022 Kia Sportage GT-Line ISG HEV Automatic 1.6 Front.jpg',
  'sportage-3': 'File:2022 Kia Sportage GT-Line ISG HEV Automatic 1.6 Rear.jpg',
  'sportage-interior': 'File:Kia Sportage (QL) interior.jpg',
  'tucson-1': 'File:Hyundai Tucson (NX4, SWB) PHEV 1X7A1858.jpg',
  'tucson-2': 'File:Hyundai Tucson 2.0 CRDi 4WD Premium (III) – Frontansicht, 5. September 2015, Düsseldorf (colour corrected).jpg',
  'tucson-3': 'File:Hyundai Tucson facelift (front).jpg',
  'tucson-interior': 'File:Hyundai Tucson interior view.jpg',
  'haval-1': 'File:2022 Haval H6 HEV Ultra.jpg',
  'haval-2': 'File:2021 Haval H6 HEV Pro.jpg',
  'haval-3': 'File:2024 Haval H6 front view.png',
  'haval-interior': 'File:2024 Haval H6 HEV Interior in TSM Bandung.jpg',
  'about-market': 'File:Car Pakistan Market.jpg',
  'hero-mehran': 'File:Mehran Car At Lowari Pass Travelling To Chitral.jpg',
};

const extraHeroes = {
  'hero-kaghan': { path: '/a/ae/Siri_Paye%2C_Shogran%2C_Kaghan_Valley.jpg', width: 1920, name: 'Siri_Paye,_Shogran,_Kaghan_Valley.jpg' },
  'hero-babusar': { path: '/a/ab/View_from_Babusar_top_2.jpg', width: 1920, name: 'View_from_Babusar_top_2.jpg' },
  'hero-hunza': { path: '/d/dc/Hunza_Valley_HDR.jpg', width: 1920, name: 'Hunza_Valley_HDR.jpg' },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let n = 0, fails = [];

async function download(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AutoMartDemo/1.0' } });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 429) { console.log('429 wait', url.slice(0, 70)); await sleep(12000); continue; }
      console.log('HTTP', r.status, url.slice(0, 90));
      return null;
    } catch (e) { console.log('ERR', e.message); await sleep(4000); }
  }
  return null;
}

for (const [name, title] of Object.entries(map)) {
  const m = byTitle[title];
  if (!m) { fails.push(name); console.log('NO MANIFEST', name); continue; }
  const original = new URL(m.url);
  const parts = original.pathname.split('/'); // ['', 'wikipedia','commons','7','7c','File.jpg']
  const fileName = parts[parts.length - 1];
  const hash1 = parts[3], hash2 = parts[4];
  const width = Math.min(1280, m.w || 1280);
  const thumb = `https://thumb.wikimedia.org/wikipedia/commons/thumb/${hash1}/${hash2}/${fileName}/${width}px-${fileName}`;
  let buf = await download(thumb);
  if (!buf) { buf = await download(m.url.split('?')[0]); }
  if (!buf) { fails.push(name); continue; }
  const isHero = name.startsWith('hero') || name.startsWith('about');
  const w = isHero ? 2200 : 1500;
  const h = isHero ? 1100 : 1000;
  await sharp(buf).rotate().resize(w, h, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(path.join(out, name + '.webp'));
  console.log('OK', name, Math.round(fs.statSync(path.join(out, name + '.webp')).size / 1024) + 'KB');
  n++;
  await sleep(600);
}

for (const [name, h] of Object.entries(extraHeroes)) {
  const encoded = h.name.split('/').map(encodeURIComponent).join('/');
  const url = `https://thumb.wikimedia.org/wikipedia/commons/thumb${h.path}/${h.width}px-${encoded}`;
  const buf = await download(url);
  if (!buf) { fails.push(name); continue; }
  await sharp(buf).rotate().resize(2200, 1100, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(out, name + '.webp'));
  console.log('OK', name, Math.round(fs.statSync(path.join(out, name + '.webp')).size / 1024) + 'KB');
  n++;
  await sleep(600);
}

console.log('done', n, 'fails', fails.join(','));
