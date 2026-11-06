import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const W = 1600;
const H = 900;
const OUT = path.join(process.cwd(), 'public', 'images', 'editorial');

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const palettes = {
  ai: ['#c9f74a', '#59e3c2', '#173c36', '#07090b'],
  technology: ['#57d9ff', '#7f8cff', '#122744', '#07090b'],
  business: ['#ffc857', '#ff8a4c', '#3a2812', '#08090a'],
  startups: ['#c9f74a', '#ff8a4c', '#243414', '#08090a'],
  mobile: ['#a78bfa', '#57d9ff', '#221d46', '#07090b'],
  gadgets: ['#57d9ff', '#ff74b1', '#132d3c', '#07090b'],
  telecom: ['#59e3c2', '#57d9ff', '#0e3532', '#07090b'],
  social: ['#ff74b1', '#ffb357', '#39192b', '#08090a'],
  automobile: ['#ff8a4c', '#ffd166', '#3a1d11', '#08090a'],
  education: ['#7f9cff', '#c9f74a', '#1a2344', '#07090b'],
  guides: ['#c9f74a', '#9aa8b8', '#2a3218', '#07090b'],
  reviews: ['#ffc857', '#57d9ff', '#33290f', '#08090a'],
  opinion: ['#ff6b6b', '#ffd6b0', '#361618', '#08090a'],
  video: ['#ff74b1', '#57d9ff', '#2d1531', '#07090b'],
  security: ['#59e3c2', '#c9f74a', '#0f2f2b', '#07090b'],
};

const specs = [
  ['signal-ai-mesh', 'ai', 'mesh'],
  ['signal-chip-power', 'technology', 'chip'],
  ['signal-frontier-model', 'ai', 'atom'],
  ['signal-agent-protocol', 'technology', 'circuit'],
  ['signal-device-fold', 'mobile', 'fold'],
  ['signal-device-glass', 'mobile', 'phone'],
  ['signal-review-laptop', 'reviews', 'laptop'],
  ['signal-review-audio', 'gadgets', 'wave'],
  ['signal-startup-capital', 'startups', 'chart'],
  ['signal-business-cycle', 'business', 'blocks'],
  ['signal-telecom-orbit', 'telecom', 'satellite'],
  ['signal-telecom-spectrum', 'telecom', 'tower'],
  ['signal-social-private', 'social', 'chat'],
  ['signal-social-creator', 'social', 'spark'],
  ['signal-education-ai', 'education', 'cap'],
  ['signal-guide-security', 'security', 'shield'],
  ['signal-guide-laptop', 'guides', 'layers'],
  ['signal-auto-grid', 'automobile', 'car'],
  ['signal-auto-software', 'automobile', 'grid'],
  ['signal-opinion-open', 'opinion', 'eye'],
  ['signal-opinion-work', 'opinion', 'compass'],
  ['signal-video-lab', 'video', 'play'],
  ['signal-video-device', 'video', 'lens'],
  ['signal-data-center', 'technology', 'grid'],
  ['signal-quantum', 'technology', 'atom'],
  ['signal-robot', 'ai', 'robot'],
  ['signal-lock', 'security', 'lock'],
  ['signal-aperture', 'reviews', 'lens'],
];

function frame() {
  return `
    <defs>
      <filter id="blur"><feGaussianBlur stdDeviation="70"/></filter>
      <filter id="blurS"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${Math.floor(Math.random() * 999)}"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer>
      </filter>
      <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>
      </pattern>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
        <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.03"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="46%" r="75%">
        <stop offset="0" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.68"/>
      </radialGradient>
    </defs>`;
}

function base(palette, seed) {
  const [a, b, c, bg] = palette;
  const r = mulberry32(seed);
  const blobs = Array.from({ length: 5 }).map((_, i) => {
    const x = 100 + r() * 1400;
    const y = 80 + r() * 740;
    const rad = 170 + r() * 330;
    const fill = i % 2 === 0 ? a : b;
    const op = 0.11 + r() * 0.16;
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(0)}" fill="${fill}" opacity="${op.toFixed(2)}" filter="url(#blur)"/>`;
  }).join('');
  return `
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <rect width="${W}" height="${H}" fill="${c}" opacity="0.55"/>
    ${blobs}
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <path d="M-80 760 L740 -80" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
    <path d="M240 980 L1180 -40" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    <rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="url(#edge)" stroke-width="1.5"/>`;
}

function motif(type, palette, seed) {
  const [a, b] = palette;
  const r = mulberry32(seed + 17);
  const cx = 800;
  const cy = 450;
  const line = `stroke="${a}" stroke-width="1.6" fill="none" opacity="0.82"`;
  const thin = `stroke="${a}" stroke-width="0.9" fill="none" opacity="0.36"`;

  if (type === 'mesh') {
    const nodes = Array.from({ length: 22 }).map(() => ({
      x: cx + (r() - 0.5) * 820,
      y: cy + (r() - 0.5) * 440,
      z: 2 + r() * 6,
    }));
    let lines = '';
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 235) {
          lines += `<line x1="${nodes[i].x.toFixed(0)}" y1="${nodes[i].y.toFixed(0)}" x2="${nodes[j].x.toFixed(0)}" y2="${nodes[j].y.toFixed(0)}" stroke="${a}" stroke-opacity="${(0.5 - d / 700).toFixed(2)}" stroke-width="1"/>`;
        }
      }
    }
    const dots = nodes.map((n) => `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${n.z.toFixed(1)}" fill="${a}" opacity="0.9"/><circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${(n.z * 3).toFixed(1)}" fill="${a}" opacity="0.12" filter="url(#blurS)"/>`).join('');
    return `<g>${lines}${dots}<circle cx="${cx}" cy="${cy}" r="250" ${thin}/><circle cx="${cx}" cy="${cy}" r="340" ${thin}/></g>`;
  }

  if (type === 'chip') {
    const pins = Array.from({ length: 11 }).map((_, i) => {
      const p = 250 + i * 36;
      return `<line x1="${p}" y1="270" x2="${p}" y2="220" ${line}/><line x1="${p}" y1="630" x2="${p}" y2="680" ${line}/><line x1="525" y1="${p}" x2="475" y2="${p}" ${line}/><line x1="1075" y1="${p}" x2="1125" y2="${p}" ${line}/>`;
    }).join('');
    return `<g>
      <rect x="505" y="250" width="590" height="400" rx="34" fill="${a}" opacity="0.055" stroke="${a}" stroke-width="2"/>
      <rect x="560" y="305" width="480" height="290" rx="14" fill="none" stroke="${a}" stroke-width="1.1" opacity="0.5"/>
      <path d="M635 305V225M745 305V195M855 305V215M965 305V245M560 395H500M560 485H470M560 575H515M1040 395H1100M1040 485H1140M1040 575H1085" ${line}/>
      <path d="M610 650v45h-70M710 650v78h55M810 650v48h120M910 650v96h-45" ${thin}/>
      ${pins}
      <rect x="660" y="375" width="280" height="150" rx="8" fill="${a}" opacity="0.14"/>
      <text x="800" y="468" text-anchor="middle" font-family="monospace" font-size="58" letter-spacing="16" fill="${a}" opacity="0.8">MIC</text>
      <circle cx="800" cy="450" r="300" fill="none" stroke="${b}" stroke-opacity="0.12" stroke-width="1"/>
    </g>`;
  }

  if (type === 'phone' || type === 'fold') {
    const second = type === 'fold' ? 90 : 210;
    return `<g transform="rotate(-12 ${cx} ${cy})">
      <rect x="${cx - 330}" y="140" width="440" height="640" rx="52" fill="#0b0d10" stroke="${a}" stroke-opacity="0.65" stroke-width="2"/>
      <rect x="${cx - 312}" y="158" width="404" height="604" rx="38" fill="${b}" opacity="0.13"/>
      <rect x="${cx + second}" y="118" width="440" height="660" rx="52" fill="#0b0d10" stroke="${a}" stroke-opacity="0.35" stroke-width="1.5"/>
      <rect x="${cx + second + 18}" y="136" width="404" height="624" rx="38" fill="${a}" opacity="0.07"/>
      <circle cx="${cx - 110}" cy="520" r="110" fill="${a}" opacity="0.08" filter="url(#blurS)"/>
      <circle cx="${cx + second + 220}" cy="400" r="120" fill="${b}" opacity="0.13" filter="url(#blurS)"/>
      <rect x="${cx - 100}" y="180" width="180" height="20" rx="10" fill="${a}" opacity="0.45"/>
      <rect x="${cx + second + 200}" y="160" width="130" height="16" rx="8" fill="${a}" opacity="0.25"/>
      <path d="M${cx - 285} 660h350M${cx + second + 45} 690h350" stroke="${a}" stroke-opacity="0.18"/>
      <path d="M250 180l120-60M1220 720l130-70" stroke="${b}" stroke-opacity="0.35"/>
    </g>`;
  }

  if (type === 'laptop') {
    return `<g>
      <path d="M440 230H1160L1120 590H480Z" fill="#0b0d10" stroke="${a}" stroke-opacity="0.55" stroke-width="2"/>
      <path d="M475 266H1125L1090 556H510Z" fill="${b}" opacity="0.12"/>
      <path d="M475 266H1125L1090 556H510Z" fill="none" stroke="${a}" stroke-opacity="0.18"/>
      <path d="M330 620H1270L1190 720H410Z" fill="#101317" stroke="${a}" stroke-opacity="0.4" stroke-width="1.5"/>
      <path d="M650 660H950" stroke="${a}" stroke-opacity="0.45" stroke-width="3"/>
      <rect x="560" y="320" width="220" height="14" rx="7" fill="${a}" opacity="0.65"/>
      <rect x="560" y="360" width="430" height="8" rx="4" fill="${b}" opacity="0.4"/>
      <rect x="560" y="386" width="340" height="8" rx="4" fill="${b}" opacity="0.25"/>
      <rect x="560" y="452" width="150" height="54" rx="8" fill="${a}" opacity="0.2"/>
      <rect x="730" y="452" width="150" height="54" rx="8" fill="${a}" opacity="0.08"/>
      <circle cx="900" cy="480" r="130" fill="${b}" opacity="0.12" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'car') {
    return `<g>
      <path d="M310 560c25-36 70-48 112-52l70-82c22-26 55-42 90-42h256c38 0 74 18 96 48l55 76 110 18c34 6 60 36 60 71v34H310z" fill="#0b0d10" stroke="${a}" stroke-opacity="0.6" stroke-width="2"/>
      <path d="M520 420l54-62c14-16 34-25 55-25h220c24 0 46 11 60 30l43 57z" fill="${b}" opacity="0.13" stroke="${a}" stroke-opacity="0.28"/>
      <circle cx="535" cy="620" r="74" fill="#090b0d" stroke="${a}" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="535" cy="620" r="36" fill="none" stroke="${a}" stroke-opacity="0.3"/>
      <circle cx="1020" cy="620" r="74" fill="#090b0d" stroke="${a}" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="1020" cy="620" r="36" fill="none" stroke="${a}" stroke-opacity="0.3"/>
      <path d="M1235 470c80 0 145 65 145 145" ${thin}/>
      <path d="M1240 410c113 0 205 92 205 205" ${thin}/>
      <path d="M1050 300l40-50M1110 300l40-50" stroke="${b}" stroke-opacity="0.4"/>
      <rect x="700" y="490" width="120" height="6" rx="3" fill="${a}" opacity="0.7"/>
      <rect x="700" y="506" width="76" height="6" rx="3" fill="${a}" opacity="0.3"/>
    </g>`;
  }

  if (type === 'chart') {
    const bars = [180, 300, 255, 390, 340, 510, 620, 560].map((h, i) => `<rect x="${390 + i * 110}" y="${700 - h}" width="58" height="${h}" rx="5" fill="${a}" opacity="${0.18 + i * 0.045}"/>`).join('');
    return `<g>
      <path d="M350 710H1270" stroke="${a}" stroke-opacity="0.3"/>
      ${bars}
      <path d="M380 610l130-80 120 30 140-150 130 60 160-200 120 90" stroke="${b}" stroke-width="3" fill="none" opacity="0.9"/>
      <circle cx="380" cy="610" r="8" fill="${a}"/><circle cx="580" cy="560" r="8" fill="${a}"/><circle cx="770" cy="410" r="8" fill="${a}"/><circle cx="1060" cy="270" r="8" fill="${a}"/>
      <path d="M1060 270l150-100" stroke="${a}" stroke-opacity="0.4"/>
      <circle cx="1210" cy="170" r="70" fill="${a}" opacity="0.1" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'satellite') {
    return `<g>
      <circle cx="800" cy="470" r="250" fill="${b}" opacity="0.1"/>
      <circle cx="800" cy="470" r="250" fill="none" stroke="${a}" stroke-opacity="0.2"/>
      <ellipse cx="800" cy="470" rx="540" ry="180" fill="none" stroke="${a}" stroke-opacity="0.42" stroke-width="1.5" transform="rotate(-16 800 470)"/>
      <ellipse cx="800" cy="470" rx="400" ry="120" fill="none" stroke="${b}" stroke-opacity="0.2" transform="rotate(24 800 470)"/>
      <g transform="translate(1050 255) rotate(-16)">
        <rect x="-45" y="-30" width="90" height="60" rx="10" fill="#0d1014" stroke="${a}" stroke-width="1.5"/>
        <rect x="-150" y="-18" width="90" height="36" fill="${a}" opacity="0.25" stroke="${a}" stroke-opacity="0.5"/>
        <rect x="60" y="-18" width="90" height="36" fill="${a}" opacity="0.25" stroke="${a}" stroke-opacity="0.5"/>
        <path d="M0 30l-18 55h36z" fill="${a}" opacity="0.55"/>
      </g>
      <circle cx="1050" cy="255" r="110" fill="${a}" opacity="0.12" filter="url(#blurS)"/>
      <path d="M520 610c70 40 150 60 250 60" stroke="${b}" stroke-opacity="0.4"/>
    </g>`;
  }

  if (type === 'chat') {
    return `<g>
      <rect x="390" y="220" width="520" height="260" rx="70" fill="#0c0f12" stroke="${a}" stroke-opacity="0.45" stroke-width="1.5"/>
      <path d="M500 480l-20 85 110-85" fill="#0c0f12" stroke="${a}" stroke-opacity="0.45"/>
      <rect x="470" y="300" width="300" height="14" rx="7" fill="${a}" opacity="0.5"/>
      <rect x="470" y="340" width="380" height="10" rx="5" fill="${b}" opacity="0.35"/>
      <rect x="470" y="370" width="260" height="10" rx="5" fill="${b}" opacity="0.22"/>
      <rect x="690" y="470" width="500" height="230" rx="70" fill="${b}" opacity="0.1" stroke="${b}" stroke-opacity="0.45" stroke-width="1.5"/>
      <path d="M1070 700l40 75-120-75" fill="${b}" opacity="0.1" stroke="${b}" stroke-opacity="0.45"/>
      <circle cx="790" cy="585" r="16" fill="${a}"/><circle cx="860" cy="585" r="16" fill="${a}" opacity="0.6"/><circle cx="930" cy="585" r="16" fill="${a}" opacity="0.3"/>
      <circle cx="420" cy="620" r="130" fill="${a}" opacity="0.1" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'cap') {
    return `<g>
      <path d="M800 250L1250 430L800 610L350 430Z" fill="${a}" opacity="0.1" stroke="${a}" stroke-width="2"/>
      <path d="M540 500v170c0 55 116 100 260 100s260-45 260-100V500" fill="none" stroke="${a}" stroke-opacity="0.35" stroke-width="2"/>
      <path d="M1050 470v190c0 40 60 65 110 80" stroke="${b}" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="1160" cy="740" r="22" fill="${b}" opacity="0.7"/>
      <path d="M800 250v360M350 430l450 180 450-180" stroke="${a}" stroke-opacity="0.18"/>
      <circle cx="800" cy="430" r="220" fill="${b}" opacity="0.08" filter="url(#blurS)"/>
      <path d="M300 260h120M290 300h70M1180 650h130" stroke="${a}" stroke-opacity="0.25"/>
    </g>`;
  }

  if (type === 'shield') {
    return `<g>
      <path d="M800 205l290 110v190c0 175-115 300-290 370-175-70-290-195-290-370V315z" fill="${a}" opacity="0.055" stroke="${a}" stroke-width="2"/>
      <path d="M800 255l240 92v158c0 145-95 250-240 310-145-60-240-165-240-310V347z" fill="none" stroke="${a}" stroke-opacity="0.3"/>
      <circle cx="800" cy="455" r="70" fill="none" stroke="${a}" stroke-width="2"/>
      <path d="M800 525v105" stroke="${a}" stroke-width="7" stroke-linecap="round"/>
      <path d="M570 690l-80 80M1030 690l80 80M800 180V120" stroke="${b}" stroke-opacity="0.35"/>
      <circle cx="800" cy="455" r="180" fill="${a}" opacity="0.09" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'layers') {
    return `<g transform="rotate(-8 800 450)">
      <rect x="430" y="280" width="660" height="400" rx="24" fill="#0b0d10" stroke="${a}" stroke-opacity="0.2"/>
      <rect x="490" y="225" width="660" height="400" rx="24" fill="#0e1115" stroke="${a}" stroke-opacity="0.35"/>
      <rect x="550" y="170" width="660" height="400" rx="24" fill="#11151a" stroke="${a}" stroke-opacity="0.6" stroke-width="1.5"/>
      <rect x="600" y="225" width="240" height="18" rx="9" fill="${a}" opacity="0.65"/>
      <rect x="600" y="265" width="500" height="10" rx="5" fill="${b}" opacity="0.28"/>
      <rect x="600" y="292" width="390" height="10" rx="5" fill="${b}" opacity="0.18"/>
      <rect x="600" y="360" width="160" height="100" rx="10" fill="${a}" opacity="0.12"/>
      <rect x="790" y="360" width="160" height="100" rx="10" fill="${a}" opacity="0.07"/>
      <rect x="600" y="495" width="350" height="10" rx="5" fill="${a}" opacity="0.2"/>
      <circle cx="1120" cy="240" r="140" fill="${b}" opacity="0.11" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'grid' || type === 'blocks') {
    const cubes = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (r() > 0.68) continue;
        const x = 500 + col * 130 + row * 55;
        const y = 330 + row * 95 - col * 30;
        cubes.push(`<g transform="translate(${x} ${y})">
          <path d="M0 0l70-40 70 40-70 40z" fill="${a}" opacity="${0.12 + r() * 0.25}" stroke="${a}" stroke-opacity="0.5"/>
          <path d="M0 0v50l70 40v-50z" fill="${b}" opacity="0.08" stroke="${b}" stroke-opacity="0.18"/>
          <path d="M140 0v50l-70 40v-50z" fill="${a}" opacity="0.05" stroke="${a}" stroke-opacity="0.18"/>
        </g>`);
      }
    }
    return `<g>${cubes.join('')}<circle cx="800" cy="450" r="300" fill="${a}" opacity="0.07" filter="url(#blur)"/></g>`;
  }

  if (type === 'wave') {
    const waves = Array.from({ length: 14 }).map((_, i) => {
      const y = 240 + i * 34;
      return `<path d="M210 ${y}C420 ${y - 90} 560 ${y + 90} 760 ${y}S1100 ${y - 90} 1390 ${y}" stroke="${i % 2 ? b : a}" stroke-opacity="${(0.08 + i * 0.018).toFixed(2)}" stroke-width="1.5" fill="none"/>`;
    }).join('');
    return `<g>${waves}<circle cx="800" cy="470" r="230" fill="none" stroke="${a}" stroke-opacity="0.25"/><circle cx="800" cy="470" r="320" fill="none" stroke="${a}" stroke-opacity="0.1"/><circle cx="800" cy="470" r="130" fill="${a}" opacity="0.08" filter="url(#blurS)"/></g>`;
  }

  if (type === 'tower') {
    return `<g>
      <path d="M760 720L800 260l40 460M730 720h140M745 640h110M760 550h80M775 450h50" stroke="${a}" stroke-opacity="0.65" stroke-width="2"/>
      <path d="M800 260V170" stroke="${a}" stroke-width="2"/>
      <circle cx="800" cy="160" r="8" fill="${a}"/>
      <path d="M690 300c-60 60-95 140-95 230M910 300c60 60 95 140 95 230" ${thin}/>
      <path d="M640 250c-80 80-125 185-125 300M960 250c80 80 125 185 125 300" ${thin}/>
      <path d="M590 200c-105 105-165 240-165 390M1010 200c105 105 165 240 165 390" ${thin}/>
      <path d="M420 760h760" stroke="${a}" stroke-opacity="0.2"/>
      <circle cx="800" cy="430" r="260" fill="${b}" opacity="0.08" filter="url(#blur)"/>
    </g>`;
  }

  if (type === 'atom') {
    return `<g transform="rotate(-18 800 450)">
      <ellipse cx="800" cy="450" rx="330" ry="130" fill="none" stroke="${a}" stroke-opacity="0.6" stroke-width="1.5"/>
      <ellipse cx="800" cy="450" rx="330" ry="130" fill="none" stroke="${b}" stroke-opacity="0.32" stroke-width="1.5" transform="rotate(60 800 450)"/>
      <ellipse cx="800" cy="450" rx="330" ry="130" fill="none" stroke="${a}" stroke-opacity="0.32" stroke-width="1.5" transform="rotate(120 800 450)"/>
      <circle cx="800" cy="450" r="50" fill="${a}" opacity="0.18" stroke="${a}" stroke-opacity="0.7" stroke-width="1.5"/>
      <circle cx="1130" cy="450" r="11" fill="${a}"/><circle cx="965" cy="710" r="9" fill="${b}"/><circle cx="635" cy="190" r="9" fill="${a}"/>
      <circle cx="800" cy="450" r="180" fill="${a}" opacity="0.12" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'robot') {
    return `<g>
      <rect x="640" y="235" width="320" height="235" rx="42" fill="#0c0f12" stroke="${a}" stroke-opacity="0.55" stroke-width="2"/>
      <rect x="700" y="295" width="200" height="88" rx="30" fill="${a}" opacity="0.1" stroke="${a}" stroke-opacity="0.35"/>
      <circle cx="750" cy="339" r="13" fill="${a}"/><circle cx="850" cy="339" r="13" fill="${a}"/>
      <path d="M760 470v70h80v-70M800 235V170" stroke="${a}" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="800" cy="165" r="13" fill="${a}" opacity="0.8"/>
      <path d="M640 330H520l-90 120M960 330h120l80 150" stroke="${a}" stroke-opacity="0.55" stroke-width="4" fill="none"/>
      <circle cx="430" cy="450" r="20" fill="${b}" opacity="0.6"/><circle cx="1160" cy="480" r="20" fill="${b}" opacity="0.6"/>
      <path d="M470 470l-80 120M1110 500l60 120" stroke="${a}" stroke-opacity="0.25" stroke-width="2"/>
      <circle cx="800" cy="380" r="230" fill="${b}" opacity="0.1" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'lock') {
    return `<g>
      <rect x="560" y="390" width="480" height="350" rx="54" fill="${a}" opacity="0.07" stroke="${a}" stroke-width="2"/>
      <path d="M650 390V320c0-83 67-150 150-150s150 67 150 150v70" fill="none" stroke="${a}" stroke-opacity="0.65" stroke-width="18" stroke-linecap="round"/>
      <circle cx="800" cy="525" r="48" fill="none" stroke="${a}" stroke-width="2"/>
      <path d="M800 573v70" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
      <path d="M560 490H420M1040 490h140M560 630H460M1040 630h100" stroke="${b}" stroke-opacity="0.3"/>
      <circle cx="800" cy="525" r="150" fill="${a}" opacity="0.1" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'eye') {
    return `<g>
      <path d="M300 450c120-180 300-270 500-270s380 90 500 270c-120 180-300 270-500 270s-380-90-500-270z" fill="none" stroke="${a}" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="800" cy="450" r="190" fill="${a}" opacity="0.07" stroke="${a}" stroke-opacity="0.35"/>
      <circle cx="800" cy="450" r="105" fill="${a}" opacity="0.13" stroke="${a}" stroke-opacity="0.65" stroke-width="2"/>
      <circle cx="800" cy="450" r="40" fill="${a}" opacity="0.85"/>
      <circle cx="762" cy="410" r="14" fill="#ffffff" opacity="0.8"/>
      <path d="M800 90v70M800 740v70M170 450h70M1360 450h70" stroke="${b}" stroke-opacity="0.3"/>
      <circle cx="800" cy="450" r="260" fill="${b}" opacity="0.08" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'compass') {
    return `<g>
      <circle cx="800" cy="450" r="290" fill="none" stroke="${a}" stroke-opacity="0.35" stroke-width="1.5"/>
      <circle cx="800" cy="450" r="230" fill="none" stroke="${a}" stroke-opacity="0.2"/>
      <circle cx="800" cy="450" r="160" fill="${a}" opacity="0.04"/>
      <path d="M800 200l55 250-55 250-55-250z" fill="${a}" opacity="0.7"/>
      <path d="M800 200l55 250-55-70z" fill="${b}" opacity="0.35"/>
      <circle cx="800" cy="450" r="16" fill="${b}"/>
      <path d="M800 160v40M800 700v40M510 450h40M1050 450h40" stroke="${a}" stroke-opacity="0.5"/>
      <circle cx="800" cy="450" r="230" fill="${b}" opacity="0.09" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'play' || type === 'lens') {
    const isPlay = type === 'play';
    return `<g>
      <rect x="430" y="200" width="740" height="500" rx="34" fill="#0a0c0f" stroke="${a}" stroke-opacity="0.35" stroke-width="1.5"/>
      <rect x="430" y="200" width="740" height="500" rx="34" fill="${b}" opacity="0.06"/>
      <circle cx="800" cy="450" r="120" fill="${a}" opacity="0.12" stroke="${a}" stroke-opacity="0.6" stroke-width="1.5"/>
      ${isPlay
        ? `<path d="M765 395l110 55-110 55z" fill="${a}" opacity="0.9"/>`
        : `<path d="M800 450l-100 170h200zM800 450l100-170H700zM800 450h-200l100 170zM800 450h200L900 280z" fill="none" stroke="${a}" stroke-opacity="0.5"/>`}
      <circle cx="800" cy="450" r="190" fill="none" stroke="${b}" stroke-opacity="0.18"/>
      <path d="M470 260h80M470 290h40M1110 660h60" stroke="${a}" stroke-opacity="0.25"/>
      <circle cx="800" cy="450" r="260" fill="${a}" opacity="0.08" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'circuit') {
    const traces = Array.from({ length: 16 }).map((_, i) => {
      const y = 180 + i * 40;
      const turn = 300 + r() * 500;
      return `<path d="M180 ${y}H${turn}l50 50H${1300 + (i % 3) * 40}" stroke="${i % 3 ? a : b}" stroke-opacity="${(0.1 + r() * 0.3).toFixed(2)}" fill="none" stroke-width="1.4"/>`;
    }).join('');
    return `<g>${traces}
      <rect x="620" y="300" width="360" height="300" rx="26" fill="#0b0e11" stroke="${a}" stroke-opacity="0.55" stroke-width="2"/>
      <rect x="680" y="360" width="240" height="180" rx="8" fill="${a}" opacity="0.1"/>
      <circle cx="700" cy="330" r="6" fill="${a}"/><circle cx="900" cy="330" r="6" fill="${a}"/><circle cx="700" cy="600" r="6" fill="${a}"/><circle cx="900" cy="600" r="6" fill="${a}"/>
      <circle cx="800" cy="450" r="150" fill="${b}" opacity="0.1" filter="url(#blurS)"/>
    </g>`;
  }

  if (type === 'spark') {
    const rays = Array.from({ length: 20 }).map((_, i) => {
      const ang = (i / 20) * Math.PI * 2;
      const r1 = 170 + (i % 3) * 30;
      const r2 = 330 + (i % 4) * 35;
      return `<line x1="${(cx + Math.cos(ang) * r1).toFixed(0)}" y1="${(cy + Math.sin(ang) * r1).toFixed(0)}" x2="${(cx + Math.cos(ang) * r2).toFixed(0)}" y2="${(cy + Math.sin(ang) * r2).toFixed(0)}" stroke="${i % 2 ? a : b}" stroke-opacity="0.4" stroke-width="1.5"/>`;
    }).join('');
    return `<g>${rays}<circle cx="${cx}" cy="${cy}" r="130" fill="${a}" opacity="0.13" stroke="${a}" stroke-opacity="0.6"/><path d="M800 330l30 90 90 30-90 30-30 90-30-90-90-30 90-30z" fill="${a}" opacity="0.8"/><circle cx="800" cy="450" r="230" fill="${a}" opacity="0.1" filter="url(#blurS)"/></g>`;
  }

  return '';
}

await mkdir(OUT, { recursive: true });
for (let i = 0; i < specs.length; i++) {
  const [name, paletteName, type] = specs[i];
  const palette = palettes[paletteName] ?? palettes.technology;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${frame()}
    ${base(palette, i * 997 + 13)}
    ${motif(type, palette, i * 131 + 7)}
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(path.join(OUT, `${name}.webp`));
  console.log(`✓ ${name}.webp`);
}
