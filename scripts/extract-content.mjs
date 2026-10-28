// Converts the scraped WordPress (Kallyas page builder) HTML into clean content JSON.
// Input:  scrape-output/html/*.html, scrape-output/api/*.json
// Output: src/content/pages.json
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { load } from 'cheerio';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = ROOT + 'scrape-output/';
const SITE = 'https://dryicecreation.gr';

const index = JSON.parse(readFileSync(SRC + 'html/index.json', 'utf8'));
const apiPages = JSON.parse(readFileSync(SRC + 'api/pages.json', 'utf8'));
const apiPosts = JSON.parse(readFileSync(SRC + 'api/posts.json', 'utf8'));
const categories = JSON.parse(readFileSync(SRC + 'api/categories.json', 'utf8'));

const missingMedia = new Set();
const decode = (s = '') => load(`<p>${s}</p>`)('p').text().trim();

// Map any wp-content/uploads URL to our local /media path (only if the file exists)
function mediaPath(url) {
  if (!url) return null;
  const m = url.match(/\/wp-content\/uploads\/(.+)$/);
  if (!m) return null;
  let rel = m[1].split('?')[0];
  try { rel = decodeURIComponent(rel); } catch {}
  if (existsSync(ROOT + 'public/media/' + rel)) return '/media/' + rel;
  // try the original (un-resized) variant
  const orig = rel.replace(/-\d+x\d+(_c)?(?=\.\w+$)/, '');
  if (existsSync(ROOT + 'public/media/' + orig)) return '/media/' + orig;
  return null;
}

function localHref(href) {
  if (!href) return href;
  if (href.startsWith('mailto:')) return href.replace(/\?swcfpc=1$/, '');
  if (/^(\.\.\/)+/.test(href)) href = '/' + href.replace(/^(\.\.\/)+/, '');
  if (href === '/') return href;
  if (href.includes('/wp-content/uploads/')) {
    const local = mediaPath(href);
    if (local) return local;
    const fixed = SITE + '/wp-content/uploads/' + href.split('/wp-content/uploads/')[1];
    missingMedia.add(fixed);
    return fixed;
  }
  if (/^https?:\/\/(www\.)?dryicecreation\.gr/i.test(href)) {
    const u = new URL(href);
    if (u.pathname.startsWith('/wp-content/uploads/')) return mediaPath(href) || href;
    return u.pathname + u.hash;
  }
  return href;
}

const PROMO = /qrcode|google-play|Get-it-on|kallyas_placeholder|\/if_[^/]*\.png|Dryicecreation_Logo|\/logo\.png/i;
const KEEP = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'br', 'iframe', 'figure', 'figcaption', 'sup', 'sub']);

const cfDecode = (hex) => { const k = parseInt(hex.slice(0, 2), 16); let o = ''; for (let i = 2; i < hex.length; i += 2) o += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k); return o; };

function clean($, root) {
  // Cloudflare-obfuscated e-mails
  root.find('.__cf_email__, [data-cfemail]').each((_, el) => { $(el).replaceWith(cfDecode($(el).attr('data-cfemail') || '')); });
  root.find('a[href*="email-protection#"]').each((_, a) => { const e = cfDecode($(a).attr('href').split('#')[1] || '') || $(a).text().trim(); $(a).attr('href', 'mailto:' + e); if (!$(a).text().trim() || /email.protected/i.test($(a).text())) $(a).text(e); });
  root.find('*').contents().filter((_, n) => n.type === 'comment').remove();
  root.contents().filter((_, n) => n.type === 'comment').remove();
  root.find('.breadcrumbs, .kl-breadcrumbs, #page_header, .page-subheader, .kl-blog-post-header, .related-articles, .blog-item-share, .itemTagsBlock').remove();
  // Accordion toggles (FAQ) -> real headings
  root.find('a[href^="#acc"]').each((_, a) => { $(a).replaceWith(`<h3>${$(a).text().trim()}</h3>`); });
  root.find('script,style,noscript,form,button,input,select,textarea,svg,.zn-shareIcons,.social-icons,.elm-social-icons,.kl-iconbox__icon-wrapper i,.zn_social_icons,.th-sparkles,.kl-bg-source,.zn-bgSource,.hidden-xs[class*=zn_section] .zn_slideshow').remove();
  // Unwrap everything not on the allow-list, deepest first
  const all = root.find('*').toArray().reverse();
  for (const el of all) {
    const tag = el.tagName?.toLowerCase();
    const $el = $(el);
    if (!KEEP.has(tag)) {
      // block-ish wrappers become paragraph breaks
      $el.replaceWith($el.contents());
      continue;
    }
    const attrs = { ...el.attribs };
    for (const a of Object.keys(attrs)) $el.removeAttr(a);
    if (tag === 'a') {
      const href = localHref(attrs.href);
      if (/addtoany|#facebook|#twitter|#pinterest|#linkedin|#email|#google_plus/i.test(attrs.href || '')) { $el.remove(); continue; }
      if (!href || href === '#' || href.startsWith('#elu') || href.startsWith('javascript')) { $el.replaceWith($el.contents()); continue; }
      $el.attr('href', href);
      if (/^https?:/.test(href)) { $el.attr('target', '_blank'); $el.attr('rel', 'noopener'); }
    }
    if (tag === 'img') {
      const src = mediaPath(attrs['data-src'] || attrs.src);
      if (!src || PROMO.test(src)) { $el.remove(); continue; }
      $el.attr('src', src);
      $el.attr('alt', decode(attrs.alt || attrs.title || ''));
      $el.attr('loading', 'lazy');
      if (attrs.width && attrs.height) { $el.attr('width', attrs.width); $el.attr('height', attrs.height); }
    }
    if (tag === 'iframe') {
      let src = attrs['data-src-cmplz'] || attrs['data-src'] || attrs.src || '';
      if (!/youtube|vimeo|google\.com\/maps/.test(src)) { $el.remove(); continue; }
      src = src.replace(/^\/\//, 'https://').replace('www.youtube.com/embed', 'www.youtube-nocookie.com/embed').replace('//youtube.com/embed', '//www.youtube-nocookie.com/embed');
      $el.attr('src', src);
      $el.attr('loading', 'lazy');
      $el.attr('allowfullscreen', '');
      $el.attr('title', 'Βίντεο');
    }
    if (tag === 'b') el.tagName = 'strong';
    if (tag === 'i' && !$el.text().trim()) { $el.remove(); continue; }
  }
  // Headings: plain text only, demote body h1 (the page template owns the h1)
  root.find('h1,h2,h3,h4,h5,h6').each((_, h) => {
    const $h = $(h);
    const t = $h.text().replace(/\s+/g, ' ').trim();
    $h.empty().text(t);
    if (h.tagName === 'h1') h.tagName = 'h2';
    if (h.tagName === 'h5' || h.tagName === 'h6') h.tagName = 'h4';
  });
  // Remove empty blocks
  for (let pass = 0; pass < 3; pass++) {
    root.find('p,li,h1,h2,h3,h4,h5,h6,strong,em,a,ul,ol,blockquote,figure').each((_, el) => {
      const $el = $(el);
      if (!$el.text().replace(/ /g, ' ').trim() && !$el.find('img,iframe').length) $el.remove();
    });
  }
  let html = root.html() || '';
  html = html.replace(/ /g, ' ').replace(/\n\s*\n+/g, '\n').replace(/[ \t]{2,}/g, ' ');
  // Loose text nodes between blocks -> paragraphs
  const $$ = load(`<div id="r">${html}</div>`);
  const r = $$('#r');
  r.contents().each((_, n) => {
    if (n.type === 'text' && n.data.trim()) $$(n).replaceWith(`<p>${n.data.trim()}</p>`);
  });
  // Inline-only top level runs (strong/a/em/img/br) -> wrap in <p>
  const top = r.contents().toArray();
  let run = [];
  const flush = () => { if (run.length) { $$(run[0]).before('<p class="__w"></p>'); const w = r.find('p.__w').last(); run.forEach((x) => w.append(x)); w.removeAttr('class'); run = []; } };
  for (const n of top) {
    const t = n.tagName?.toLowerCase();
    if (n.type === 'text') { if (!n.data.trim()) { if (run.length) run.push(n); } continue; }
    if (['strong', 'em', 'a', 'br', 'sup', 'sub', 'i'].includes(t)) run.push(n);
    else flush();
  }
  flush();
  r.find('p').each((_, p) => { const $p = $$(p); $p.html(($p.html() || '').replace(/^(\s*<br>\s*)+|(\s*<br>\s*)+$/g, '')); if (!$p.text().trim() && !$p.find('img,iframe').length) $p.remove(); });
  return r.html().trim();
}

function textOf(html) { return load(html).text().replace(/\s+/g, ' ').trim(); }

const out = [];
for (const { url, file } of index) {
  if (!file.endsWith('.html')) continue;
  const path = new URL(url).pathname;
  const raw = readFileSync(ROOT + file, 'utf8');
  const $ = load(raw);
  const api = [...apiPages, ...apiPosts].find((p) => p.link === url);
  const isPost = apiPosts.some((p) => p.link === url);
  const meta = (n) => $(`meta[property="${n}"]`).attr('content') || $(`meta[name="${n}"]`).attr('content') || '';
  const title = decode(api?.title?.rendered || $('title').text().split('|')[0]);
  const seoTitle = decode($('title').text());
  const description = decode(meta('description') || meta('og:description'));
  const ogRaw = mediaPath(meta('og:image'));
  const ogImage = ogRaw && !PROMO.test(ogRaw) ? ogRaw : null;

  let main;
  if (isPost) {
    const body = $('.itemBody').first().clone();
    $('.zn_pb_wrapper iframe').each((_, f) => { if (!$(f).closest('.itemBody').length) body.prepend($(f).clone()); });
    main = body;
    if (!main.length) main = $('.zn_pb_wrapper').first();
  } else {
    main = $('.zn_pb_wrapper').first();
  }
  if (!main.length) main = $('#page_wrapper');
  if (!isPost) main = main.clone();
  // Header slideshow text → keep separately as intro, then drop from body
  const heroText = main.find('.kl-slideshow').text().replace(/\s+/g, ' ').trim();
  main.find('.kl-slideshow, .znpb-footer-smart-area, #eluidb1ece391').remove();
  const images = [];
  main.find('img').each((_, im) => {
    const src = mediaPath($(im).attr('data-src') || $(im).attr('src'));
    if (src && !PROMO.test(src) && !images.some((x) => x.src === src)) images.push({ src, alt: decode($(im).attr('alt') || $(im).attr('title') || '') });
  });
  // Background images in inline styles (Kallyas uses them for banners)
  main.find('[style*="background-image"]').each((_, el) => {
    const m = ($(el).attr('style') || '').match(/url\(['"]?([^'")]+)/);
    const src = m && mediaPath(m[1]);
    if (src && !PROMO.test(src) && !images.some((x) => x.src === src)) images.push({ src, alt: '' });
  });
  const videos = [...new Set([...raw.replace(/\\\//g, '/').matchAll(/wp-content\/uploads\/([^"'\s<>]+?\.mp4)/g)].map((m) => '/media/' + decodeURIComponent(m[1])))].filter((v) => existsSync(ROOT + 'public' + v));
  const html = clean($, main);
  const featured = isPost ? mediaPath(api?._embedded?.['wp:featuredmedia']?.[0]?.source_url) : null;
  const cats = isPost ? (api.categories || []).map((id) => decode(categories.find((c) => c.id === id)?.name || '')).filter(Boolean) : [];
  out.push({
    path,
    type: isPost ? 'post' : path === '/' ? 'home' : 'page',
    title,
    seoTitle,
    description,
    ogImage,
    featured,
    date: api?.date || null,
    modified: api?.modified || null,
    categories: cats,
    heroText,
    images,
    videos,
    html,
    words: textOf(html).split(' ').length,
  });
}

// Structured extras for pages with special layouts
for (const p of out) {
  const $ = load(`<div id="r">${p.html}</div>`);
  const kids = $('#r').children().toArray();
  if (p.path === '/sychnes-erotisis/') {
    const faq = [];
    let cur = null;
    for (const k of kids) {
      const t = $(k).text().trim();
      if (k.tagName === 'h3' && t.includes('?')) { cur = { q: t.replace(/\s+\?$/, ';').replace(/\?$/, ';'), a: '' }; faq.push(cur); continue; }
      if (cur) cur.a += $.html(k);
    }
    p.faq = faq;
  }
  if (p.path === '/i-poria-mas/') {
    const tl = [];
    let cur = null;
    for (const k of kids) {
      const t = $(k).text().trim();
      const m = k.tagName === 'p' && t.match(/^(\d{4})/);
      if (m) { cur = { year: m[1], title: '', text: '' }; tl.push(cur); continue; }
      if (!cur) continue;
      if (/^h\d$/.test(k.tagName) && !cur.title) cur.title = t;
      else if (k.tagName === 'p' && !/^σημερα$/i.test(t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) cur.text += (cur.text ? ' ' : '') + t;
    }
    p.timeline = tl.filter((e) => !e.title.startsWith('...'));
  }
  if (p.path === '/gallery/') {
    const items = [];
    $('#r a').each((_, a) => {
      const img = $(a).find('img').first();
      if (!img.length) return;
      const href = $(a).attr('href') || '';
      const kind = /youtube\.com|youtu\.be/.test(href) ? 'youtube' : /\.mp4$/i.test(href) ? 'mp4' : 'image';
      items.push({ src: img.attr('src'), alt: img.attr('alt') || '', w: +img.attr('width') || 0, h: +img.attr('height') || 0, kind, href: kind === 'image' ? img.attr('src') : href });
    });
    p.gallery = items.filter((x, i, arr) => arr.findIndex((y) => y.src === x.src && y.kind === x.kind) === i);
  }
}

for (const p of out) for (const g of p.gallery || []) {
  const m = await sharp(ROOT + 'public' + decodeURIComponent(g.src)).metadata();
  g.w = m.width; g.h = m.height;
}

// Drop blocks repeated across many pages (share bars, app promo, social, CTAs)
const norm = (t) => t.replace(/\s+/g, ' ').trim().toLowerCase();
const freq = new Map();
const blocksOf = (html) => { const $ = load(`<div id="r">${html}</div>`); return { $, blocks: $('#r').children().toArray() }; };
for (const p of out) {
  const seen = new Set();
  for (const b of blocksOf(p.html).blocks) { const k = norm(load(b).text()); if (k && !seen.has(k)) { seen.add(k); freq.set(k, (freq.get(k) || 0) + 1); } }
}
const extraJunk = [/μοιράσου το/i, /βρες μας στο/i, /δες τα βιντεο/i, /ακολουθησε μας/i, /^επικοινωνια$/i, /κατεβασε την εφαρμογη/i, /dry ice creation app/i, /θελεις να παραγγειλεις/i, /πάτα το κουμπί/i];
for (const p of out) {
  const { $, blocks } = blocksOf(p.html);
  for (const b of blocks) {
    const t = norm($(b).text());
    if (!t && !$(b).find('img,iframe').length && !['img', 'iframe'].includes(b.tagName)) { $(b).remove(); continue; }
    if (p.type === 'home') continue;
    if ((t && freq.get(t) >= 4) || extraJunk.some((r) => r.test(t))) $(b).remove();
  }
  // Drop leading headings that just repeat the page title
  const fold = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
  const ft = fold(p.title);
  for (const b of $('#r').children().toArray().slice(0, 4)) {
    if (!/^h[1-6]$/.test(b.tagName)) break;
    const bt = fold($(b).text());
    if (bt && (ft.includes(bt) || bt.includes(ft) || bt.split(' ').filter((w) => w.length > 3 && ft.includes(w)).length >= 2)) $(b).remove();
    else break;
  }
  p.html = $('#r').html().trim();
  p.words = textOf(p.html).split(' ').filter(Boolean).length;
}

mkdirSync(ROOT + 'src/content', { recursive: true });
writeFileSync(ROOT + 'src/content/pages.json', JSON.stringify(out, null, 1));
writeFileSync(ROOT + 'scrape-output/missing-media.json', JSON.stringify([...missingMedia], null, 1));
console.log('missing media', missingMedia.size);
console.log(out.map((p) => `${p.type.padEnd(5)} ${String(p.words).padStart(5)}w ${String(p.images.length).padStart(3)}img  ${p.path}`).join('\n'));
