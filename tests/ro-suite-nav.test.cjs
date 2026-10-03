const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => { const bytes=fs.readFileSync(path.join(root,file)); if(file==='index.html')return Buffer.from(require('../qa/nav-1.4.0/normalize.cjs')(bytes.toString())); if(file!=='assets/ui.js')return bytes; let text=bytes.toString(); for(const [before,after]of require('../qa/first-run/ui-copy-changes.json'))text=text.replace(after,before); return Buffer.from(text); };
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const release = 'assets/ro-suite/1.3.0/';
const expected = {
  'nav.js': 'e0a75bce3f8ba21d73aff8aa28af1c624d977f1e8e3de483c6dd40785b3b84d2',
  'catalog.snapshot.json': 'a198338ddcb7857094ef950fb1315c532840cf53ac8e7a69b331d8cb4a87dd5d',
  'nav.lock.json': '7ac31d27c493071ad164326022854a637c5015ae7989ff8c2a4c129b021c59c3'
};
const markup = `  <ro-suite-nav tool-id="leveling-map" portal-url="https://econds.github.io/ro_tools_portal/">
    <nav aria-label="เครื่องมือ RO">
      <a href="https://econds.github.io/ro_tools_portal/">กลับ RO Tools Portal</a>
    </nav>
  </ro-suite-nav>
  <script type="module" src="./assets/ro-suite/1.3.0/nav.js"></script>
`;
const css = '    ro-suite-nav > nav > a{display:inline-flex;align-items:center;min-width:44px;min-height:44px;padding:8px 12px;color:var(--text)}\n';
test('Release artifacts match user SHA-256 and immutable lock', () => {
  const lock = JSON.parse(read(release + 'nav.lock.json'));
  assert.equal(lock.bundleVersion, '1.3.0');
  for (const [file, sha] of Object.entries(expected)) assert.equal(hash(read(release + file)), sha, file);
  for (const file of ['nav.js', 'catalog.snapshot.json']) assert.equal(lock.files[file].sha256, expected[file]);
});
test('Reviewed graph edits preserve navigation integration and every other original production file', () => {
  const baseline = JSON.parse(read('docs/qa/ro-suite-nav/source-baseline.json'));
  const reviewed = JSON.parse(read('docs/qa/level-chart/reviewed-source-changes.json'));
  assert.deepEqual(Object.keys(reviewed.files).sort(), ['assets/calculator.js', 'assets/ui.js', 'index.html', 'service-worker.js']);
  assert.equal(baseline.baseCommit, 'c5c8add7dc77e554a50c8369697390bcf0ed4107');
  const html = require('../qa/first-run/normalize.cjs')(read('index.html').toString());
  assert.equal(html.split(markup).length, 2, 'exactly one nav host and local executable');
  assert.equal(html.split(css).length, 2, 'only one narrowly scoped fallback style');
  assert(html.indexOf(markup) < html.indexOf('  <header>'));
  assert(!/<ro-suite-nav[^>]*(?:theme|catalog-url)=/.test(html));
  for (const [file, sha] of Object.entries(baseline.files)) {
    const bytes = file === 'index.html' ? html.replace(markup, '').replace(css, '') : read(file);
    assert.equal(hash(bytes), reviewed.files[file] || sha, file + ' must match its reviewed graph checksum or the original production checksum');
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

test('Rollout preserves all latest-main production bytes except versioned script URL', () => {
  const baseline = JSON.parse(read('docs/qa/ro-suite-nav-1.3.0/source-baseline.json'));
  for (const [file, sha] of Object.entries(baseline.files)) {
    const bytes = file === 'index.html' ? require('../qa/first-run/normalize.cjs')(read(file).toString()).replace('./assets/ro-suite/1.3.0/nav.js', './assets/ro-suite/1.2.0/nav.js') : read(file);
    assert.equal(hash(bytes), sha, file);
  }
  const catalog = JSON.parse(read(release + 'catalog.snapshot.json'));
  assert.equal(catalog.tools.find(t => t.id === 'best-status').canonicalUrl, 'https://econds.github.io/ro-best-status/');
});
