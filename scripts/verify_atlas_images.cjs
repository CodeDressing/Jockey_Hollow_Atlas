#!/usr/bin/env node
// Ledger: 01 Public gallery inventory, 02 Evidence manifests, 03 HTTP verification.
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const imageTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif'
};

// SECTION 01 — Public gallery inventory
function asset(reference) {
  assert.match(reference, /^assets\//, 'Expected an Atlas image path');
  const file = decodeURIComponent(reference);
  const resolved = fs.realpathSync(path.join(root, file));
  assert.ok(resolved.startsWith(path.join(root, 'assets') + path.sep), file);
  const type = imageTypes[path.extname(file).toLowerCase()];
  assert.ok(type, 'Unsupported public image format: ' + file);
  const bytes = fs.readFileSync(resolved);
  assert.ok(bytes.length, 'Empty image: ' + file);
  return {file, type, size: bytes.length, sha: sha256(bytes)};
}

function gallery() {
  const context = vm.createContext({window: {}});
  const sourcePaths = [...read('index.html').matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]);
  const appIndex = sourcePaths.indexOf('app.js');
  assert.ok(appIndex >= 0, 'Atlas app.js loader is missing');
  for (const file of sourcePaths.slice(0, appIndex)) {
    const source = read(file);
    assert.doesNotMatch(source, /https?:\/\/(?:drive\.google\.com|[^/]*googleusercontent\.com)\//i, file);
    vm.runInContext(source, context, {filename: file, timeout: 5000});
  }
  const app = read('app.js');
  const mergeEnd = 'mergeMovies();';
  const end = app.indexOf(mergeEnd);
  assert.ok(end >= 0, 'Atlas media merge boundary is missing');
  vm.runInContext(app.slice(0, end + mergeEnd.length), context, {filename: 'app.js', timeout: 5000});
  const records = vm.runInContext('data', context);
  const refs = new Set();
  function include(photo) {
    assert.ok(photo.original, 'Published image lacks an original: ' + photo.filename);
    refs.add(photo.original);
    if (photo.thumb) refs.add(photo.thumb);
  }
  for (const record of records) {
    for (const photo of record.images || []) include(photo);
    for (const movie of record.movies || []) if (movie.poster) refs.add(movie.poster);
  }
  for (const photo of context.window.DRIVE_PHOTOS || []) {
    if (photo.publication_status === 'archive-only') {
      assert.ok(!photo.original && !photo.thumb && !photo.drive_view && !photo.id, photo.filename);
    } else {
      include(photo);
    }
  }
  const images = new Map();
  for (const ref of refs) {
    const file = decodeURIComponent(ref);
    if (!images.has(file)) images.set(file, asset(ref));
  }
  const archived = records.reduce((count, record) => count + (record.archivedPhotos || []).length, 0);
  return {images, records, archived, sourcePaths};
}

// SECTION 02 — Evidence manifests
function verifyManifests({records, images, sourcePaths}) {
  let manifests = 0;
  let captures = 0;
  for (const entry of fs.readdirSync(path.join(root, 'research'), {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join('research', entry.name, 'microscopy-intake.json');
    if (!fs.existsSync(path.join(root, manifestPath))) continue;
    const manifest = JSON.parse(read(manifestPath));
    assert.equal(entry.name, manifest.accession.toLowerCase());
    assert.ok(manifest.publication_authority, 'Missing publication authorization: ' + manifestPath);
    if (manifest.gallery) {
      assert.ok(sourcePaths.indexOf(manifest.gallery) >= 0 &&
        sourcePaths.indexOf(manifest.gallery) < sourcePaths.indexOf('app.js'), manifest.gallery);
    }
    const record = records.find(item => item.code === manifest.accession);
    assert.ok(record, 'Missing accession: ' + manifest.accession);
    assert.ok(manifest.images.length > 0, manifestPath);
    const unique = new Set();
    for (const entry of manifest.images) {
      const file = `assets/${manifest.accession.toLowerCase()}/microscopy/${entry.filename}`;
      assert.ok(!unique.has(file), 'Duplicate manifest image: ' + file);
      unique.add(file);
      const image = images.get(file);
      assert.ok(image, 'Missing published manifest image: ' + file);
      assert.equal(image.size, entry.size_bytes ?? entry.bytes, file);
      assert.equal(image.sha, entry.sha256, file);
      const linked = record.images.filter(photo => decodeURIComponent(photo.original) === file);
      assert.equal(linked.length, 1, 'Expected one image on its accession: ' + file);
      assert.equal(linked[0].category, 'Microscopy', file);
      assert.equal(linked[0].filename, entry.filename, file);
      if (entry.caption) assert.equal(linked[0].caption, entry.caption, file);
      captures++;
    }
    manifests++;
  }
  return {manifests, captures};
}

// SECTION 03 — Anonymous HTTP verification
async function verifyHttp(origin, images) {
  const base = new URL(origin);
  assert.ok(['https:', 'http:'].includes(base.protocol) && !base.username && !base.password);
  const queue = [...images.values()];
  const failures = [];
  async function worker() {
    while (queue.length) {
      const {file, type, size, sha} = queue.pop();
      const url = new URL(file.split('/').map(encodeURIComponent).join('/'), base);
      try {
        const response = await fetch(url, {redirect: 'error', signal: AbortSignal.timeout(45000)});
        assert.equal(response.status, 200);
        const mime = response.headers.get('content-type')?.split(';')[0];
        assert.equal(mime, type);
        const body = Buffer.from(await response.arrayBuffer());
        assert.equal(body.length, size);
        assert.equal(sha256(body), sha);
      } catch (error) {
        failures.push({file, error: error.message, cause: error.cause?.message});
      }
    }
  }
  await Promise.all(Array.from({length: 12}, worker));
  console.log(JSON.stringify({origin: base.origin, checked: images.size, passed: images.size - failures.length, failures}, null, 2));
  assert.equal(failures.length, 0, 'Atlas HTTP image verification failed');
}

(async () => {
  assert.ok(process.argv.length <= 3, 'Usage: node scripts/verify_atlas_images.cjs [http-origin]');
  const inventory = gallery();
  const manifests = verifyManifests(inventory);
  console.log(JSON.stringify({records: inventory.records.length, uniqueImagePaths: inventory.images.size,
    archivedPhotoRecords: inventory.archived, ...manifests}));
  if (process.argv[2]) await verifyHttp(process.argv[2], inventory.images);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
