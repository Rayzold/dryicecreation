// Re-encode oversized legacy images in place (paths stay identical so content links keep working).
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../public/media', import.meta.url).pathname;
const MAX_W = 1800;
let saved = 0, n = 0;
function* walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? yield* walk(p) : yield p; } }
for (const file of walk(ROOT)) {
  const ext = file.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png'].includes(ext)) continue;
  const before = statSync(file).size;
  const img = sharp(file, { failOn: 'none' });
  const meta = await img.metadata();
  const big = (meta.width || 0) > MAX_W;
  if (before < 220 * 1024 && !big) continue;
  let pipe = sharp(file, { failOn: 'none' }).rotate();
  if (big) pipe = pipe.resize({ width: MAX_W, withoutEnlargement: true });
  const buf = ext === 'png'
    ? await pipe.png({ compressionLevel: 9, palette: true, quality: 88, effort: 8 }).toBuffer()
    : await pipe.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
  if (buf.length < before) { writeFileSync(file, buf); saved += before - buf.length; n++; }
}
console.log(`optimized ${n} files, saved ${(saved / 1048576).toFixed(1)} MB`);
