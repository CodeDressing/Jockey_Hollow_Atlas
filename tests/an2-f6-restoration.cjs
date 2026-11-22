const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { gallery } = require('../scripts/verify_atlas_images.cjs');
const ledger = require('../research/an2_f6_restoration_ledger_20261122.json');

const { records, images } = gallery();
const record = records.find(({ code }) => code === 'AN2-F6');
assert.ok(record);
assert.ok(record.images.some(({ original }) => original === 'assets/originals/AN2-F6SP.JPG'));
assert.equal(record.archivedPhotos.filter(({ category }) => category === 'Source macro / specimen').length, 8);
assert.equal(ledger.frames.length, 11);
assert.equal(new Set(ledger.frames.map(frame => frame.original_sha256)).size, 11);
assert.equal(record.images.filter(photo => photo.category === 'Microscopy').length, 11);

for (const frame of ledger.frames) {
  assert.match(frame.original_sha256, /^[a-f0-9]{64}$/);
  const derivative = images.get(frame.gallery_path);
  assert.ok(derivative);
  assert.equal(derivative.sha, frame.gallery_sha256);
  assert.equal(derivative.size, frame.gallery_bytes);
  const associations = Array.from(records).flatMap(row => row.images
    .filter(photo => photo.original === frame.gallery_path)
    .map(photo => [row.code, photo.filename, photo.caption]));
  assert.deepEqual(associations, [[record.code, frame.original_filename, frame.caption]]);
}

const register = ledger.measurement_register;
assert.equal(register.length, 7);
assert.equal(register.filter(row => row.width_um !== null).length, 6);
assert.equal(register.filter(row => row.q !== null).length, 6);
assert.deepEqual(register[2], {
  record: 3, length_um: '17.66', width_um: null, reported_wall_span_um: null, q: null,
});
assert.equal(ledger.inclusion_um.reported_span, '1.52');
assert.deepEqual(ledger.separate_structures_um.diameters, ['20.45', '20.13']);
assert.equal(ledger.independent_scale_calibration, null);
assert.equal(ledger.identification_status, 'unresolved');

const fields = record.measurements.find(row => row.source_id === 'AN2-F6 microscopy register').fields;
for (const row of register) {
  const value = fields['Spore ' + row.record];
  assert.ok(value.includes('Length ' + row.length_um + ' µm'));
  if (row.width_um) {
    assert.ok(value.includes('Width ' + row.width_um + ' µm'));
    assert.ok(value.includes('Reported wall span ' + row.reported_wall_span_um + ' µm'));
    assert.ok(value.includes('Q ' + (Number(row.length_um) / Number(row.width_um)).toFixed(2)));
  } else {
    assert.match(value, /Width not supplied.*Wall span not supplied.*Q unavailable/);
  }
}
assert.match(record.summary['Spore print (2026-11-22)'], /dark-brownish/);
assert.match(record.summary['Historical print record'], /pale tan-gray/);
const app = readFileSync(join(__dirname, '../app.js'), 'utf8');
for (const term of ['ellipsoid', 'amygdaliform', 'globose', 'inclusion']) {
  assert.match(app, new RegExp('^  '+term+':', 'm'));
}
console.log('AN2-F6 accession, media custody, gallery, measurement register and glossary verified');
