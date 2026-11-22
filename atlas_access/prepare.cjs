const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gallery} = require('../scripts/verify_atlas_images.cjs');

const root = fs.realpathSync(path.join(__dirname, '..'));
const destination = process.argv[2];
assert.ok(destination, 'Usage: node atlas_access/prepare.cjs <new destination>');
const output = path.resolve(destination);
assert.ok(!fs.existsSync(output), 'Use a new destination for each build');

const {records, images, archived, sourcePaths} = gallery();
const pages = ['index.html', 'safety.html', 'sandbox.html', 'trametes.html', 'gymnopilus.html', 'classified.html'];
const files = new Set([...pages, ...sourcePaths, ...images.keys()]);
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const file = match[1].split(/[?#]/)[0].replace(/^\.\//, '');
    if (/^(?:(?:mycosim|research)\/)?[\w.-]+\.(?:css|js)$/.test(file)) files.add(file);
  }
}
// Keep the existing simulator modules, including their local imports.
for (const file of fs.readdirSync(path.join(root, 'mycosim'))) {
  if (file.endsWith('.js')) files.add('mycosim/' + file);
}
files.add('mycosim/research/gymnopilus_pk_pd_20261017.json');

fs.mkdirSync(output, {recursive: true});
for (const file of files) {
  const source = path.join(root, file);
  assert.equal(fs.realpathSync(source), source, 'Unexpected path or symlink: ' + file);
  assert.ok(source.startsWith(root + path.sep) && fs.statSync(source).isFile(), file);
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}
const cloudConfig = 'mycosim/gym_juno_cloud_config.json';
// Preserve the simulator's disabled cloud state without packaging its storage configuration.
fs.writeFileSync(path.join(output, cloudConfig), JSON.stringify({enabled:false}));
files.add(cloudConfig);
const summary = {accessions:records.length, imagePaths:images.size, archivalEntries:archived};
fs.writeFileSync(path.join(output, '.atlas-release.json'), JSON.stringify({summary, files:[...files].sort()}));
console.log(JSON.stringify({...summary, stagedFiles:files.size}));
