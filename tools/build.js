#!/usr/bin/env node
/**
 * Builds the 21 project detail pages and the project grid on index.html
 * from data/projects.json + templates/project.html.
 *
 * Usage:  node tools/build.js          write files
 *         node tools/build.js --check  fail if output is stale (no writes)
 *
 * Everything about a project lives in data/projects.json. Asset paths are
 * derived from its slug: Assets/<slug>/icon.png and Assets/<slug>/video.mp4.
 */
const fs = require('fs');
const path = require('path');
const { imageSize } = require('./image-size.js');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const data = JSON.parse(read('data', 'projects.json'));
const template = read('templates', 'project.html');
const { site } = data;

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const iconOf = p => `Assets/${p.slug}/icon.png`;
const videoOf = p => `Assets/${p.slug}/video.mp4`;

// Trim to a clean sentence boundary for meta/OG descriptions.
const metaDescription = p => {
  const s = p.summary.replace(/\s+/g, ' ').trim();
  if (s.length <= 155) return s;
  const cut = s.slice(0, 155);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)).replace(/[,;:]$/, '') + '…';
};

const anchor = (l, indent) =>
  `${indent}<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`;

/* ---------- detail pages ---------- */
function renderProject(p) {
  const tech = p.tech
    .map(t => `          <li>${esc(t.name)}: ${esc(t.detail)}</li>`)
    .join('\n');

  const rows = [p.links];
  if (p.moreLinks && p.moreLinks.length) rows.push(p.moreLinks);
  const links = rows
    .map(row => row.map(l => anchor(l, '          ')).join('\n          |\n'))
    .join('\n          <br />\n');

  const vars = {
    title: esc(p.title),
    summary: esc(p.summary),
    role: esc(p.role),
    video: esc(videoOf(p)),
    icon: esc(iconOf(p)),
    author: esc(site.author),
    metaDescription: esc(metaDescription(p)),
    canonical: esc(site.baseUrl + p.slug + '.html'),
    ogImage: esc(site.baseUrl + iconOf(p)),
    techList: tech,
    links,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in vars)) throw new Error(`Unknown template placeholder {{${key}}}`);
    return vars[key];
  });
}

/* ---------- index.html project grid ---------- */
function renderGrid() {
  const out = [];
  for (const g of data.groups) {
    out.push(`      <h3 class="project-group-heading">${esc(g.company)} <span class="project-group-date">${esc(g.dates)}</span></h3>`);
    if (g.note) {
      const body = g.noteUrl
        ? `${esc(g.note)} <a href="${esc(g.noteUrl)}" target="_blank" rel="noopener">View on Google Play</a>`
        : esc(g.note);
      out.push(`      <p class="project-group-note">${body}</p>`);
    }
    out.push('      <div class="projects-grid">');
    for (const p of g.projects) {
      out.push('        <div class="project">');
      out.push(`          <a href="${p.slug}.html" class="project-link">`);
      out.push('            <div class="project-preview-wrapper">');
      const dim = imageSize(path.join(ROOT, iconOf(p)));
      out.push(`              <img src="${esc(iconOf(p))}" alt="${esc(p.title)}" loading="lazy" decoding="async" width="${dim.width}" height="${dim.height}" />`);
      out.push(`              <video class="preview-video" muted loop playsinline preload="none" src="${esc(videoOf(p))}"></video>`);
      out.push('            </div>');
      out.push(`            <h3>${esc(p.title)}</h3>`);
      out.push('          </a>');
      out.push('          <div class="external-link">');
      out.push(p.links.map(l => anchor(l, '            ')).join('\n            |\n'));
      out.push('          </div>');
      out.push('        </div>');
      out.push('');
    }
    if (out[out.length - 1] === '') out.pop();
    out.push('      </div>');
    out.push('');
  }
  if (out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

/* ---------- copy consistency ---------- */
// Two different numbers appear on the site and they mean different things:
//   site.shippedTitles  - the whole career claim ("50+"), matching the resume
//   featured card count - how many projects actually have cards below
// Both are hand-written in the About section, so check each against the data.
function copyWarnings(html) {
  const featured = data.groups.reduce((t, g) => t + g.projects.length, 0);
  const claim = String(site.shippedTitles || featured);
  const warn = [];

  const stat = html.match(/<span class="stat-num">(\d+\+?)<\/span>\s*<span class="stat-label">Shipped Titles</);
  if (!stat) warn.push('could not find the "Shipped Titles" stat card in index.html');
  else if (stat[1] !== claim) warn.push(`"Shipped Titles" stat says ${stat[1]}, data/projects.json claims ${claim}`);

  const prose = html.match(/shipped (\d+\+?) titles/i);
  if (!prose) warn.push('could not find the "shipped N titles" sentence in index.html');
  else if (prose[1] !== claim) warn.push(`About text says "shipped ${prose[1]} titles", data/projects.json claims ${claim}`);

  const feat = html.match(/(\d+)\s+featured/i);
  if (feat && Number(feat[1]) !== featured) {
    warn.push(`"${feat[1]} featured" does not match the ${featured} project cards built`);
  }
  return warn;
}

const START = '<!-- build:projects:start -->';
const END = '<!-- build:projects:end -->';

function injectIndex(html, grid) {
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1) {
    throw new Error(`index.html is missing the ${START} / ${END} markers`);
  }
  return html.slice(0, s + START.length) + '\n' + grid + '\n      ' + html.slice(e);
}

/* ---------- run ---------- */
const outputs = new Map();
for (const g of data.groups) {
  for (const p of g.projects) outputs.set(p.slug + '.html', renderProject(p));
}
outputs.set('index.html', injectIndex(read('index.html'), renderGrid()));

let stale = 0;
for (const [file, content] of outputs) {
  const abs = path.join(ROOT, file);
  const before = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (before === content) continue;
  stale++;
  if (CHECK) {
    console.error('stale: ' + file);
  } else {
    fs.writeFileSync(abs, content);
    console.log((before === null ? 'created: ' : 'updated: ') + file);
  }
}

const warnings = copyWarnings(outputs.get('index.html'));
for (const w of warnings) console.error('warning: ' + w);

const total = outputs.size;
if (CHECK) {
  if (stale) console.error(`\n${stale} of ${total} file(s) out of date. Run: npm run build`);
  if (stale || warnings.length) process.exit(1);
  console.log(`all ${total} generated files up to date`);
} else {
  console.log(`\n${total} files generated (${stale} changed) from data/projects.json`);
}
