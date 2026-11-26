import assert from 'node:assert/strict';
import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../production/', import.meta.url);
const output = new URL('../production-dist/', import.meta.url);
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
await cp(source, output, { recursive: true });
await mkdir(new URL('assets/', output), { recursive: true });
await cp(new URL('../dist/assets/gallery-hero.webp', import.meta.url), new URL('assets/gallery-hero.webp', output));
console.log('Built ArtSouthwest catalog with ' + keys.size + ' place records at ' + fileURLToPath(output));
