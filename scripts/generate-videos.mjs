import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'videos');
await mkdir(OUT, { recursive: true });

const W = 1280;
const H = 720;
const FPS = 12;
const SECONDS = 7;
const FRAMES = FPS * SECONDS;

const projects = [
  {
    name: 'chip-packaging-lab',
    images: ['signal-chip-power', 'signal-video-lab', 'signal-data-center'],
    accent: '#c9f74a',
    secondary: '#57d9ff',
    mode: 'scan',
  },
  {
    name: 'foldable-buyers-guide',
    images: ['signal-device-fold', 'signal-device-glass', 'signal-video-device'],
    accent: '#a78bfa',
    secondary: '#57d9ff',
    mode: 'slide',
  },
  {
    name: 'electric-city-grid',
    images: ['signal-auto-grid', 'signal-auto-software', 'signal-video-lab'],
    accent: '#ff8a4c',
    secondary: '#ffd166',
    mode: 'pulse',
  },
];

function overlay(progress, project, sceneIndex) {
  const t = progress * Math.PI * 2;
  const scanY = (progress * 1.4 % 1) * H;
  const slide = Math.sin(t) * 60;
  const pulse = 0.55 + Math.sin(t * 2) * 0.22;
  const scene = sceneIndex + 1;

  if (project.mode === 'scan') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${project.accent}" stop-opacity="0"/>
        <stop offset="0.7" stop-color="${project.accent}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${project.accent}" stop-opacity="0"/>
      </linearGradient></defs>
      <rect x="0" y="${scanY - 80}" width="${W}" height="80" fill="url(#s)" opacity="0.45"/>
      <line x1="0" y1="${scanY}" x2="${W}" y2="${scanY}" stroke="${project.accent}" stroke-opacity="0.8" stroke-width="1.5"/>
      <rect x="70" y="70" width="1140" height="580" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
      <text x="86" y="116" fill="${project.accent}" font-family="monospace" font-size="15" letter-spacing="5">MIC TECH / VISUAL REPORT</text>
      <text x="86" y="626" fill="#ffffff" font-family="monospace" font-size="13" letter-spacing="3" opacity="0.65">SCENE 0${scene} · PACKAGING FLOOR</text>
      <circle cx="${W - 110}" cy="108" r="6" fill="${project.accent}" opacity="${pulse}"/>
      <text x="${W - 96}" y="113" fill="${project.accent}" font-family="monospace" font-size="12" opacity="0.8">REC</text>
    </svg>`;
  }

  if (project.mode === 'slide') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect x="${slide + 60}" y="70" width="2" height="580" fill="${project.accent}" opacity="0.35"/>
      <rect x="${W - slide - 62}" y="70" width="2" height="580" fill="${project.secondary}" opacity="0.25"/>
      <rect x="70" y="70" width="1140" height="580" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
      <text x="86" y="116" fill="${project.accent}" font-family="monospace" font-size="15" letter-spacing="5">MIC TECH / DEVICE LAB</text>
      <text x="86" y="626" fill="#ffffff" font-family="monospace" font-size="13" letter-spacing="3" opacity="0.65">SCENE 0${scene} · FOLDABLE FIELD TEST</text>
      <circle cx="${W - 110}" cy="108" r="6" fill="${project.accent}" opacity="${pulse}"/>
      <text x="${W - 96}" y="113" fill="${project.accent}" font-family="monospace" font-size="12" opacity="0.8">REC</text>
    </svg>`;
  }

  const pulseR = 40 + ((progress * 3) % 1) * 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <circle cx="${W * 0.5}" cy="${H * 0.52}" r="${pulseR}" fill="none" stroke="${project.accent}" stroke-opacity="${1 - ((progress * 3) % 1)}" stroke-width="2"/>
    <rect x="70" y="70" width="1140" height="580" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="86" y="116" fill="${project.accent}" font-family="monospace" font-size="15" letter-spacing="5">MIC TECH / FIELD REPORT</text>
    <text x="86" y="626" fill="#ffffff" font-family="monospace" font-size="13" letter-spacing="3" opacity="0.65">SCENE 0${scene} · ELECTRIC CITY</text>
    <circle cx="${W - 110}" cy="108" r="6" fill="${project.accent}" opacity="${pulse}"/>
    <text x="${W - 96}" y="113" fill="${project.accent}" font-family="monospace" font-size="12" opacity="0.8">REC</text>
  </svg>`;
}

function runFfmpeg(args, frames) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}\n${stderr}`));
    });

    (async () => {
      try {
        for (const frame of frames) {
          if (!proc.stdin.write(frame)) {
            await new Promise((r) => proc.stdin.once('drain', r));
          }
        }
        proc.stdin.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}

for (const project of projects) {
  const baseBuffers = await Promise.all(
    project.images.map(async (name) =>
      sharp(await readFile(path.join(process.cwd(), 'public', 'images', 'editorial', `${name}.webp`)))
        .resize(W, H, { fit: 'cover' })
        .png()
        .toBuffer(),
    ),
  );

  const frames = [];
  for (let i = 0; i < FRAMES; i++) {
    const progress = i / FRAMES;
    const sceneFloat = progress * project.images.length;
    const sceneIndex = Math.min(project.images.length - 1, Math.floor(sceneFloat));
    const local = sceneFloat - sceneIndex;
    const eased = 0.5 - Math.cos(local * Math.PI) / 2;
    const zoom = 1.02 + eased * 0.07;
    const width = Math.round(W * zoom);
    const height = Math.round(H * zoom);

    const bg = await sharp(baseBuffers[sceneIndex])
      .resize(width, height, { fit: 'cover' })
      .extract({
        left: Math.round((width - W) / 2),
        top: Math.round((height - H) / 2),
        width: W,
        height: H,
      })
      .composite([{ input: Buffer.from(overlay(progress, project, sceneIndex)) }])
      .png()
      .toBuffer();

    frames.push(bg);
  }

  const output = path.join(OUT, `${project.name}.mp4`);
  await runFfmpeg(
    [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'png',
      '-framerate', String(FPS),
      '-i', '-',
      '-f', 'lavfi',
      '-i', `sine=frequency=196:duration=${SECONDS}`,
      '-filter_complex', '[1:a]volume=0.012,afade=t=in:st=0:d=1,afade=t=out:st=5.5:d=1.5[a]',
      '-map', '0:v',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '25',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-movflags', '+faststart',
      '-shortest',
      output,
    ],
    frames,
  );
  await sharp(frames[0]).jpeg({ quality: 80 }).toFile(path.join(OUT, `${project.name}-poster.jpg`));
  console.log(`✓ ${project.name}.mp4`);
}
