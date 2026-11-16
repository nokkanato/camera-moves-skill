// Render camera-reference clips from scene.html + presets.js, frame by frame, to MP4.
//
//   node render.mjs                         -> the default preset to out/library/<name>.mp4
//   node render.mjs --preset orbit_360      -> out/library/orbit_360.mp4
//   node render.mjs --preset push_in --out out/my_shot.mp4
//   node render.mjs --all                   -> every preset to out/library/ + out/library/index.html (gallery)
//   node render.mjs --list                  -> preset names
//
// Works on macOS, Windows and Linux. Setup on a new machine (needs Node 18+ and ffmpeg on PATH):
//   npm install            (three + playwright, from package.json)
//   npx playwright install chromium
// Graphics: macOS uses the GPU (Metal); elsewhere Chromium picks its own backend.
// No GPU / blank frames? Set CAMREF_GL=swiftshader to render on the CPU (slower, same picture).
import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright not found. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

function glArgs() {
  const mode = process.env.CAMREF_GL ?? (process.platform === 'darwin' ? 'metal' : 'auto');
  if (mode === 'swiftshader') return ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  if (mode === 'metal') return ['--use-angle=metal', '--ignore-gpu-blocklist'];
  return ['--ignore-gpu-blocklist'];
}

const root = path.dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({
  options: {
    out: { type: 'string' }, fps: { type: 'string' }, scene: { type: 'string' },
    preset: { type: 'string' }, all: { type: 'boolean' }, list: { type: 'boolean' },
  },
});
const fps = Number(values.fps ?? 30);
const sceneFile = values.scene ?? 'scene.html';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    const p = path.normalize(path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (p !== root && !p.startsWith(root + path.sep)) throw new Error('outside root');
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/${sceneFile}?capture=1`;

async function renderOne(page, preset, outFile) {
  await mkdir(path.dirname(outFile), { recursive: true });
  await page.goto(preset ? `${base}&preset=${encodeURIComponent(preset)}` : base);
  await page.waitForFunction('window.CAMREF_READY === true', null, { timeout: 15000 });
  const info = await page.evaluate('({W: CAMREF.W, H: CAMREF.H, DURATION: CAMREF.DURATION, preset: CAMREF.preset})');
  if (preset && info.preset !== preset) throw new Error(`unknown preset "${preset}" (see --list)`);
  const frames = Math.round(info.DURATION * fps);

  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => (ffErr += d));
  const done = new Promise((r) => ff.on('close', r));
  for (let i = 0; i < frames; i++) {
    const dataUrl = await page.evaluate((t) => window.CAMREF.frame(t), i / fps);
    const buf = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  const code = await done;
  if (code !== 0) throw new Error(`ffmpeg exited ${code}: ${ffErr.trim()}`);
  console.log(`${info.preset}: ${frames} frames, ${info.W}x${info.H} @ ${fps}fps -> ${outFile}`);
}

function galleryHtml(presets) {
  const groups = {};
  for (const [name, p] of Object.entries(presets)) (groups[p.group] ??= []).push([name, p.label]);
  const sections = Object.entries(groups).map(([g, items]) => `<h2>${g}</h2><div class="grid">${items.map(([name, label]) =>
    `<figure><video src="${name}.mp4" autoplay loop muted playsinline></video><figcaption><b>${label}</b><code>${name}</code></figcaption></figure>`).join('')}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Camera reference library</title><style>
body{margin:0;padding:16px;background:#16181c;color:#e8eaee;font:14px/1.4 system-ui,sans-serif}
h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:20px 0 8px;color:#9aa3b0;text-transform:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
figure{margin:0}video{width:100%;display:block;border-radius:6px;background:#000}
figcaption{padding:6px 2px}figcaption b{display:block;font-weight:600}code{color:#9aa3b0;font-size:12px}
</style></head><body><h1>Camera reference library</h1><div>Grey block clips, 6 seconds each, looping. Names are the presets in presets.js.</div>${sections}</body></html>`;
}

const browser = await chromium.launch({ args: [...glArgs(), '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  if (values.list || values.all) {
    await page.goto(base);
    await page.waitForFunction('window.CAMREF_READY === true', null, { timeout: 15000 });
    const presets = await page.evaluate('CAMREF.presets');
    if (values.list) {
      for (const [name, p] of Object.entries(presets)) console.log(`${name.padEnd(22)} ${p.group.padEnd(6)} ${p.label}`);
    } else {
      const dir = path.resolve(root, values.out ?? 'out/library');
      for (const name of Object.keys(presets)) await renderOne(page, name, path.join(dir, `${name}.mp4`));
      await writeFile(path.join(dir, 'index.html'), galleryHtml(presets));
      console.log(`gallery: ${path.join(dir, 'index.html')}`);
    }
  } else {
    let preset = values.preset;
    if (!preset) {
      await page.goto(base);
      await page.waitForFunction('window.CAMREF_READY === true', null, { timeout: 15000 });
      preset = await page.evaluate('CAMREF.preset');
    }
    await renderOne(page, preset, path.resolve(root, values.out ?? `out/library/${preset}.mp4`));
  }
} finally {
  await browser.close();
  server.close();
}
