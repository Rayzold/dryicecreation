// One-off scraper: pulls content + images from the current WordPress site.
// Runs in GitHub Actions (open internet). Output is committed to the repo.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE = 'https://dryicecreation.gr';
const OUT = 'scrape-output';
const MEDIA_OUT = 'public/media';
const UA = 'Mozilla/5.0 (compatible; DryIceCreation-migration/1.0)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = 'text') {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return as === 'json' ? await res.json() : as === 'buf' ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (i === 2) throw e;
      await sleep(1500 * (i + 1));
    }
  }
}

async function save(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

async function paged(endpoint) {
  const all = [];
  for (let page = 1; page < 50; page++) {
    const sep = endpoint.includes('?') ? '&' : '?';
    let batch;
    try {
      batch = await get(`${BASE}/wp-json/wp/v2/${endpoint}${sep}per_page=100&page=${page}`, 'json');
    } catch (e) {
      if (page === 1) console.warn('endpoint failed', endpoint, e.message);
      break;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

const log = [];
const L = (...a) => { console.log(...a); log.push(a.join(' ')); };

// 1. REST API dumps
const pages = await paged('pages');
const posts = await paged('posts?_embed=1');
const media = await paged('media');
const categories = await paged('categories');
L('pages', pages.length, 'posts', posts.length, 'media', media.length);
await save(`${OUT}/api/pages.json`, JSON.stringify(pages, null, 1));
await save(`${OUT}/api/posts.json`, JSON.stringify(posts, null, 1));
await save(`${OUT}/api/media.json`, JSON.stringify(media.map((m) => ({ id: m.id, url: m.source_url, alt: m.alt_text, title: m.title?.rendered, w: m.media_details?.width, h: m.media_details?.height, mime: m.mime_type })), null, 1));
await save(`${OUT}/api/categories.json`, JSON.stringify(categories, null, 1));

// 2. Rendered HTML of every page/post (page builders often keep content out of content.rendered)
const urls = new Set([`${BASE}/`]);
for (const p of [...pages, ...posts]) if (p.link) urls.add(p.link);
for (const extra of ['/nea/', '/gallery/', '/sitemap_index.xml', '/page-sitemap.xml', '/post-sitemap.xml']) urls.add(BASE + extra);

const imgUrls = new Set();
const index = [];
for (const url of urls) {
  try {
    const html = await get(url);
    const slug = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home';
    const file = `${OUT}/html/${slug}${url.endsWith('.xml') ? '.xml' : '.html'}`;
    await save(file, html);
    index.push({ url, file });
    for (const m of html.matchAll(/https?:\/\/dryicecreation\.gr\/wp-content\/uploads\/[^"'\s)<>]+?\.(?:jpe?g|png|gif|webp|svg|mp4|pdf)/gi)) imgUrls.add(m[0].replace(/^http:/, 'https:'));
    L('ok', url);
  } catch (e) {
    L('FAIL', url, e.message);
  }
  await sleep(250);
}
await save(`${OUT}/html/index.json`, JSON.stringify(index, null, 1));

// 3. Download every referenced upload + media-library originals
for (const m of media) if (m.source_url) imgUrls.add(m.source_url.replace(/^http:/, 'https:'));
let ok = 0, fail = 0;
const failed = [];
for (const u of imgUrls) {
  const rel = decodeURIComponent(u.split('/wp-content/uploads/')[1]);
  const dest = join(MEDIA_OUT, rel);
  try { await access(dest); ok++; continue; } catch {}
  try {
    await save(dest, await get(encodeURI(decodeURI(u)), 'buf'));
    ok++;
  } catch (e) {
    fail++; failed.push(u);
  }
}
L('media downloaded', ok, 'failed', fail);
await save(`${OUT}/media-failed.json`, JSON.stringify(failed, null, 1));
await save(`${OUT}/log.txt`, log.join('\n'));
