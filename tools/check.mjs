import { readFile,stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const d=JSON.parse(await readFile('dist/data.json','utf8'));
assert.equal(d.projectStart,'2026-11-01');assert.equal(d.artists.length,10);assert.equal(d.places.length,38);assert.equal(d.works.length,6);
assert.equal(d.artists.reduce((n,a)=>n+a.works.length,0),60);
for(const a of d.artists){assert.equal(a.works.length,6);for(const w of a.works){assert.equal(w.checkout_eligible,'false');assert.equal(w.rights_status,'not_cleared');assert.ok(!('image_reference_url' in w));}}
for(const [c,n] of [['gallery',12],['experience',10],['restaurant',8],['lodging',8]])assert.equal(d.places.filter(p=>p.category===c).length,n);
for(const w of d.works){assert.ok(w.price>0);await stat('dist/assets/'+w.image);}
for(const f of ['dist/index.html','dist/app.js','dist/styles.css','dist/robots.txt']){const t=await readFile(f,'utf8');assert.ok(!/\bStuart\b/.test(t));assert.ok(!/sk_live_|ghp_[a-zA-Z0-9]{20}/.test(t));}
assert.match(await readFile('dist/index.html','utf8'),/noindex,nofollow/);
console.log('Static/data checks passed: six demo studies, ten artist/sixty source records, 38 places, no unauthorized art images or checkout.');
