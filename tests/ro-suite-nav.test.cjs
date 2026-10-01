const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const release = 'assets/ro-suite/1.2.0/';
const expected = {
  'nav.js': 'd75be916445feb4febeaada437841a1b3be68db16a00673198c78fd6f6c8dc5f',
  'catalog.snapshot.json': '800bb9c9d2b52a7fbae58e436b05529e69820fee3627d199da545a6f5e28f7dd',
  'nav.lock.json': '3b0350135ba5f455b38799c7940492938a209e8e0a6570a5126cb40c36127358'
};
const markup = `  <ro-suite-nav tool-id="leveling-map" portal-url="https://econds.github.io/ro_tools_portal/">
    <nav aria-label="เครื่องมือ RO">
      <a href="https://econds.github.io/ro_tools_portal/">กลับ RO Tools Portal</a>
    </nav>
  </ro-suite-nav>
  <script type="module" src="./assets/ro-suite/1.2.0/nav.js"></script>
`;
const css = '    ro-suite-nav > nav > a{display:inline-flex;align-items:center;min-width:44px;min-height:44px;padding:8px 12px;color:var(--text)}\n';
test('Release artifacts match user SHA-256 and immutable lock', () => {
  const lock = JSON.parse(read(release + 'nav.lock.json'));
  assert.equal(lock.bundleVersion, '1.2.0');
  for (const [file, sha] of Object.entries(expected)) assert.equal(hash(read(release + file)), sha, file);
  for (const file of ['nav.js', 'catalog.snapshot.json']) assert.equal(lock.files[file].sha256, expected[file]);
});
test('Original production bytes are preserved except exact isolated integration', () => {
  const baseline = JSON.parse(read('docs/qa/ro-suite-nav/source-baseline.json'));
  assert.equal(baseline.baseCommit, 'c5c8add7dc77e554a50c8369697390bcf0ed4107');
  const html = read('index.html').toString();
  assert.equal(html.split(markup).length, 2, 'exactly one nav host and local executable');
  assert.equal(html.split(css).length, 2, 'only one narrowly scoped fallback style');
  assert(html.indexOf(markup) < html.indexOf('  <header>'));
  assert(!/<ro-suite-nav[^>]*(?:theme|catalog-url)=/.test(html));
  for (const [file, sha] of Object.entries(baseline.files)) {
    const bytes = file === 'index.html' ? html.replace(markup, '').replace(css, '') : read(file);
    assert.equal(hash(bytes), sha, file + ' must remain byte-for-byte original');
  }
});
test('Calculation inputs, all recorded numeric outputs and existing share hashes equal pre-edit fixtures', () => {
  const actual = execFileSync(process.execPath, ['tests/capture-leveling-baseline.cjs'], {cwd: root, encoding: 'utf8'});
  assert.deepEqual(JSON.parse(actual), JSON.parse(read('docs/qa/ro-suite-nav/calculation-baseline.json')));
});
test('Embedded catalog keeps Leveling identity and Grade & Refine planned without a launch URL', () => {
  const catalog = JSON.parse(read(release + 'catalog.snapshot.json'));
  const leveling = catalog.tools.find(t => t.id === 'leveling-map');
  assert.deepEqual(leveling.identity, {accent: '#2f7a4f', icon: 'map'});
  assert.equal(leveling.canonicalUrl, 'https://econds.github.io/ro-leveling-map/');
  const planned = catalog.tools.find(t => t.id === 'grade-refine');
  assert.equal(planned.listingStatus, 'planned');
  assert.equal(planned.canonicalUrl, null);
});
test('Browser evidence is a successful genuine preintegration capture', () => {
  const bytes = require('node:zlib').gunzipSync(read('docs/qa/ro-suite-nav/baseline.json.gz'));
  assert.equal(hash(bytes), '3b4c9399ab8c64017eb37a601d9b6ba15b83c8045b20cffd477324e9f4d908ea');
  const baseline = JSON.parse(bytes);
  assert.equal(baseline.sourceCommit, '9b451b153cf67c501a2473b879647810711a844c');
  assert.equal(baseline.completedWithoutFailures, true);
  assert.equal(baseline.playwrightVersion, '1.55.1');
  assert.equal(Object.keys(baseline.matrix).length, 8);
  assert(baseline.sourceCommit && /^[0-9a-f]{40}$/.test(baseline.sourceCommit));
});
