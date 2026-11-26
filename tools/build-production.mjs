import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../production/', import.meta.url);
const output = new URL('../production-release/', import.meta.url);
const publicRoot = new URL('public/', output);
const places = JSON.parse(await readFile(new URL('content/places.json', source), 'utf8'));
const keys = new Set();
for (const listing of places) {
  assert.match(listing.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(['taos', 'santa-fe'].includes(listing.city));
  assert.ok(['gallery', 'experience', 'food', 'lodging'].includes(listing.category));
  assert.ok(!keys.has(listing.city + '/' + listing.id));
  assert.ok(listing.name && listing.locality && listing.description);
  assert.equal(new URL(listing.source).protocol, 'https:');
  if (listing.image) {
    assert.match(listing.image.src, /^assets\/[a-z0-9][a-z0-9.-]*\.(?:avif|jpg|png|webp)$/);
    assert.ok(listing.image.alt && listing.image.credit);
    assert.ok((await stat(new URL(listing.image.src, source))).isFile());
  }
  keys.add(listing.city + '/' + listing.id);
}

await rm(output, { force: true, recursive: true });
await mkdir(new URL('assets/', publicRoot), { recursive: true });
const css = (await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')) + '\n' +
  await readFile(new URL('layout.css', source), 'utf8');
const js = await readFile(new URL('interactions.mjs', source), 'utf8');

async function versionedAsset(body, extension) {
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 12);
  const path = 'assets/catalog-' + hash + '.' + extension;
  await writeFile(new URL(path, publicRoot), body);
  return '/' + path;
}

const assets = { css: await versionedAsset(css, 'css'), script: await versionedAsset(js, 'mjs') };
const prototypeImages = ['favicon.svg','gallery-hero.webp','landscape-study.webp','landscape-study-card.webp',
  'abstract-study-card.webp','ceramic-study-card.webp','sage-study-card.webp'];
for (const file of prototypeImages) {
  await cp(new URL('../dist/assets/' + file, import.meta.url), new URL('assets/' + file, publicRoot));
}
for (const item of places) if (item.image) await cp(new URL(item.image.src, source), new URL(item.image.src, publicRoot));
await cp(new URL('site.mjs', source), new URL('site.mjs', output));
await writeFile(new URL('catalog-renderer.mjs', output),
  'import { createCatalog } from "./site.mjs";\n' +
  'export const catalog = createCatalog(' + JSON.stringify(places) + ', ' + JSON.stringify(assets) + ');\n');
const { catalog } = await import(new URL('catalog-renderer.mjs', output));
const { html } = catalog.render('/');
await writeFile(new URL('index.html', publicRoot), html);
console.log('Built the server-rendered ArtSouthwest catalog with ' + keys.size + ' listings at ' + fileURLToPath(output));
