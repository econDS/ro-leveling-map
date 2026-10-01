#!/usr/bin/env node
'use strict';
// Run with Playwright 1.55.1 supplied externally through NODE_PATH.
// This test never reads, clears, or writes another application's storage keys.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium, playwrightVersion;
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.resolve(process.env.RO_QA_OUTPUT || '/tmp/ro-leveling-nav-browser-qa');
const BASE = process.env.RO_QA_URL || 'http://127.0.0.1:4173/ro-leveling-map/';
const BASELINE_FILE = path.join(ROOT, 'docs/qa/ro-suite-nav/baseline.json.gz');
const FIXED_DATE = '2026-11-01T00:00:00Z';
const STORAGE_KEY = 'ro-general-map-exp-tool-settings-v1';
const SELF_URL = 'https://econds.github.io/ro-leveling-map/';
const PORTAL_URL = 'https://econds.github.io/ro_tools_portal/';
const WIDTHS = [360, 390, 768, 1440];
const THEMES = ['light', 'dark'];
const CUSTOM = {
  playerLevel: 215, partySize: 4, playerDamage: 234567,
  serverBonus: 100, gearBonus: 164, customBonus: 37, racePlant: 9,
  manualBonus: 200, kafraBonus: 50, malangdoBonus: 20,
  premiumBonus: 20, staffBonus: 30, richManBonus: 60,
  enforceLevelLock: false, dailyDungeonMode: 'compare'
};
const CASES = [
  { id: 'none-defaults', settings: { spotlightEvent: 'none' } },
  { id: 'none-customized', settings: { ...CUSTOM, spotlightEvent: 'none' } },
  { id: 'historical-unicorn', settings: { ...CUSTOM, spotlightEvent: '2025-12-03_unicorn' } }
];
const report = {
  schemaVersion: 1, commit: process.env.RO_QA_COMMIT || null,
  fixedDate: FIXED_DATE, baseUrl: BASE, playwrightVersion,
  mode: null, checks: [], failures: [], screenshots: [], fixtures: {}, legacyShares: {}, matrix: {},
  network: { requests: [], failed: [], badResponses: [], consoleErrors: [], pageErrors: [] },
  limitations: [
    'The clock is fixed to 2026-11-01 for reproducibility; this is not a statement about the currently active event.',
    'Canonical Leveling and Portal navigation requests are intercepted locally, so production applications and their storage are not exercised.',
    'Clipboard checks use a real browser clipboard with clipboard-read/write permissions granted only to these fresh test contexts.',
    'playerDamage is deliberately seeded with the native input value setter plus input/change events because its live comma formatter interferes with Playwright fill; this is fixture seeding, not a keystroke-editor test. Every requested fixture setting is asserted before capture.',
    'Service-worker checks, if successful, prove a freshly warmed local cache, not upgrades from every historically installed cache.'
  ]
};
let browser, baseline, mode, navScriptUrl;
fs.mkdirSync(OUTPUT, { recursive: true });
const normalize = text => text.replace(/\s+/g, ' ').trim();
function failure(name, error) {
  const item = { name, message: error.message || String(error), stack: error.stack || null };
  report.failures.push(item); report.checks.push({ name, status: 'failed' });
  console.error('FAIL', name, item.message);
}
async function check(name, task, page) {
  try { const result = await task(); report.checks.push({ name, status: 'passed' }); return result; }
  catch (error) {
    failure(name, error);
    if (page && !page.isClosed()) await screenshot(page, 'failure-' + name).catch(() => {});
    return undefined;
  }
}
function writeReport() {
  const urls = list => [...new Set(list.map(item => item.url))].sort();
  report.network.requestUrls = urls(report.network.requests);
  report.network.failedUrls = urls(report.network.failed);
  report.status = report.failures.length ? 'failed' : 'passed';
  fs.writeFileSync(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
async function screenshot(page, name) {
  const filename = name.replace(/[^a-zA-Z0-9._-]/g, '-') + '.png';
  await page.screenshot({ path: path.join(OUTPUT, filename), fullPage: false, animations: 'disabled' });
  report.screenshots.push({ name, file: filename, url: page.url() });
}
function monitor(page, label) {
  page.__qaLabel = label;
  page.on('request', request => report.network.requests.push({ label: page.__qaLabel, url: request.url(), type: request.resourceType(), method: request.method() }));
  page.on('requestfailed', request => report.network.failed.push({ label: page.__qaLabel, url: request.url(), error: request.failure()?.errorText || '' }));
  page.on('response', response => { if (response.status() >= 400) report.network.badResponses.push({ label: page.__qaLabel, url: response.url(), status: response.status() }); });
  page.on('console', message => { if (message.type() === 'error') report.network.consoleErrors.push({ label: page.__qaLabel, text: message.text(), location: message.location() }); });
  page.on('pageerror', error => report.network.pageErrors.push({ label: page.__qaLabel, message: error.message }));
}
async function contextFor(width = 1440, theme = 'light', serviceWorkers = 'block') {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers, permissions: ['clipboard-read', 'clipboard-write'] });
  await context.addInitScript(({ date }) => {
    const OriginalDate = Date, time = OriginalDate.parse(date);
    class FixedDate extends OriginalDate {
      constructor(...args) { super(...(args.length ? args : [time])); }
      static now() { return time; }
    }
    window.Date = FixedDate;
  }, { date: FIXED_DATE });
  return context;
}
async function openPage(context, label, url = BASE) {
  const page = await context.newPage(); monitor(page, label);
  page.setDefaultTimeout(10000);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('#mapTable tbody .map-row').first().waitFor();
  return page;
}
async function top(page) {
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function applyCase(page, fixture) {
  await page.locator('#resetSettings').click();
  await page.locator('#advancedSettings').evaluate(el => { el.open = true; });
  for (const [id, value] of Object.entries(fixture.settings)) {
    const input = page.locator('#' + id);
    const kind = await input.evaluate(el => el.type);
    if (id === 'playerDamage') {
      // Deterministic fixture seeding through the real input/change handlers.
      // Do not describe this as successful simulated typing into the live formatter.
      await input.evaluate((el, requested) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(requested));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    } else if (kind === 'checkbox') await input.setChecked(value);
    else if (kind === 'select-one' && ['manualBonus', 'kafraBonus', 'malangdoBonus', 'premiumBonus', 'staffBonus', 'richManBonus'].includes(id)) {
      await page.locator(`.buff-chip[data-buff="${id}"][data-value="${value}"]`).click();
    } else if (kind === 'select-one') await input.selectOption(String(value));
    else await input.fill(String(value));
  }
  // Blur runs the application's change/sanitization path, without manipulating its state.
  await page.locator('#searchBox').focus();
  await page.locator('#searchBox').blur();
  await page.waitForFunction(() => document.querySelectorAll('#mapTable tbody .map-row').length > 0);
  const actual = await page.evaluate(() => readInputs());
  for (const [id, requested] of Object.entries(fixture.settings)) {
    assert.equal(actual[id], requested, `Fixture ${fixture.id} must actually contain requested ${id}`);
  }
  assert.deepEqual(JSON.parse(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)), actual, 'Requested fixture and saved settings agree');
  if ('playerDamage' in fixture.settings) assert.equal(await page.locator('#playerDamage').inputValue(), fixture.settings.playerDamage.toLocaleString('en-US'));
}
async function snapshot(page) {
  return page.evaluate(key => {
    const text = value => value.replace(/\s+/g, ' ').trim();
    const inputs = Object.fromEntries(IDS.map(id => {
      const el = document.getElementById(id);
      return [id, el.type === 'checkbox' ? el.checked : el.value];
    }));
    const rows = currentRows.map(row => ({
      code: row.code,
      // Every numeric property of every displayed calculated row, not a sampled ranking.
      numeric: Object.fromEntries(Object.entries(row).filter(([, value]) => typeof value === 'number').map(([key, value]) => [key, Number.isFinite(value) ? value : String(value)]))
    }));
    const displayRows = [...document.querySelectorAll('#mapTable tbody .map-row')].map(row => ({ code: row.dataset.code, numericCells: [...row.cells].slice(1).map(cell => text(cell.innerText)) }));
    return { inputs, settings: readInputs(), serializedSettings: localStorage.getItem(key), rows, displayRows, sort: { key: sortKey, direction: sortDir } };
  }, STORAGE_KEY);
}
async function assertSame(page, expected, message) {
  assert.deepEqual(await snapshot(page), expected, message);
}
async function shareAndReload(page, context, expected, label) {
  await page.locator('#shareSettings').click();
  await page.waitForFunction(() => document.getElementById('shareStatus').textContent === 'คัดลอกแล้ว');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const url = new URL(copied);
  assert.equal(url.origin + url.pathname, new URL(BASE).origin + new URL(BASE).pathname);
  const payload = JSON.parse(new URLSearchParams(url.hash.slice(1)).get('settings'));
  assert.equal(payload.version, 1); assert.deepEqual(payload.settings, expected.settings);
  const shared = await openPage(context, label + '-shared', copied);
  assert.equal(await shared.locator('#shareStatus').textContent(), 'โหลดค่าจากลิงก์แล้ว');
  await assertSame(shared, expected, 'Copied URL must recreate every input and every calculated output');
  await shared.reload({ waitUntil: 'networkidle' });
  await assertSame(shared, expected, 'Reload of actual shared URL preserves state');
  await shared.close();
  // A clean URL reload independently checks local persistence, without the hash override.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await assertSame(page, expected, 'Stored settings restore at a clean URL');
  await page.reload({ waitUntil: 'networkidle' });
  await assertSame(page, expected, 'Stored settings persist through reload');
  return copied;
}
async function overflow(page) {
  return page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, excess: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth }));
}
async function appTabOrder(page) {
  await top(page); await page.locator('#resetSettings').focus();
  const order = [];
  for (let index = 0; index < 10; index++) {
    order.push(await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, id: el.id, class: el.className, href: el.getAttribute('href'), label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) };
    }));
    await page.keyboard.press('Tab');
  }
  await top(page); return order;
}
async function geometry(page) {
  return page.evaluate(() => {
    const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    return { body: rect(document.body), header: rect(document.querySelector('body > header')), main: rect(document.querySelector('main')), nav: rect(document.querySelector('ro-suite-nav')) };
  });
}
async function modalAndSort(page, width) {
  const original = await snapshot(page);
  const sort = page.locator(width <= 600 ? '#mapSort' : '#mapTable th[data-sort="hp"] button');
  if (width <= 600) await sort.selectOption('hp'); else await sort.click();
  assert.equal(await page.locator('#mapTable th[data-sort="hp"]').getAttribute('aria-sort'), 'descending');
  const descending = (await snapshot(page)).rows.map(row => row.numeric.hp);
  assert(descending.every((value, index) => !index || descending[index - 1] >= value), 'HP descending order');
  if (width <= 600) await page.locator('#mapSortDirection').click(); else await sort.click();
  assert.equal(await page.locator('#mapTable th[data-sort="hp"]').getAttribute('aria-sort'), 'ascending');
  const ascending = (await snapshot(page)).rows.map(row => row.numeric.hp);
  assert(ascending.every((value, index) => !index || ascending[index - 1] <= value), 'HP ascending order');
  if (width <= 600) await sort.selectOption('finalPerKill'); else await page.locator('#mapTable th[data-sort="finalPerKill"] button').click();
  await assertSame(page, original, 'Sorting back must restore all original rows');
  const mapButton = page.locator('#mapTable .map-btn').first();
  const code = await mapButton.getAttribute('data-code');
  for (const dismissal of ['escape', 'button', 'backdrop']) {
    await mapButton.focus(); await mapButton.click();
    assert.equal(await page.locator('#mapModal').getAttribute('aria-hidden'), 'false');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    assert(await page.locator('#closeMapModal').evaluate(el => el === document.activeElement));
    assert(await page.locator('#closeMapModal').evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), 'Modal close control is topmost at its hit target');
    if (dismissal === 'escape') await page.keyboard.press('Escape');
    else if (dismissal === 'button') await page.locator('#closeMapModal').click();
    else await page.locator('[data-close-modal]').click({ position: { x: 1, y: 1 } });
    assert.equal(await page.locator('#mapModal').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert(await mapButton.evaluate(el => el === document.activeElement), 'Modal restores trigger focus');
  }
  await mapButton.click();
  await page.locator('#nextMap').click();
  assert.notEqual(await page.locator('#mapModalBody').getAttribute('data-code'), code);
  await page.locator('#prevMap').click();
  assert.equal(await page.locator('#mapModalBody').getAttribute('data-code'), code);
  await page.locator('#detail-tab-monsters').click();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#detail-tab-access').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#detail-tab-overview').getAttribute('aria-selected'), 'true');
  // Exercise focus wrapping using the actual visible tabbable elements used by the app.
  await page.locator('#mapModal').evaluate(modal => {
    const nodes = [...modal.querySelectorAll('button:not(:disabled),select,a,summary,[tabindex="0"]')].filter(el => el.getClientRects().length);
    nodes[nodes.length - 1].focus();
  });
  await page.keyboard.press('Tab');
  assert(await page.locator('#mapModal').evaluate(modal => {
    const first = [...modal.querySelectorAll('button:not(:disabled),select,a,summary,[tabindex="0"]')].find(el => el.getClientRects().length);
    return first === document.activeElement;
  }), 'Modal traps Tab at last visible control');
  await page.keyboard.press('Escape');
  await assertSame(page, original, 'Modal navigation must not alter calculation state');
}
async function themeTransition(page, theme) {
  const before = await snapshot(page), url = page.url();
  const colors = () => page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    nav: document.querySelector('ro-suite-nav')?.shadowRoot ? getComputedStyle(document.querySelector('ro-suite-nav').shadowRoot.querySelector('nav')).backgroundColor : null
  }));
  const initial = await colors();
  await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' });
  const changed = await colors();
  assert.notEqual(initial.body, changed.body, 'App theme responds on the same page');
  if (mode === 'final') assert.notEqual(initial.nav, changed.nav, 'Nav follows the same OS theme transition');
  assert.equal(page.url(), url); await assertSame(page, before, 'Theme transition preserves state');
  await page.emulateMedia({ colorScheme: theme });
  assert.deepEqual(await colors(), initial);
}
async function navigation(page, context, label, capture) {
  const host = page.locator('ro-suite-nav'), button = host.locator('.bar button'), menu = host.locator('#tools');
  await button.waitFor();
  assert.equal(await host.getAttribute('theme'), null); assert.equal(await host.getAttribute('catalog-url'), null);
  assert.equal(await host.getAttribute('tool-id'), 'leveling-map');
  const navIdentity = await host.evaluate(el => {
    const root = el.shadowRoot, nav = root.querySelector('nav');
    return { accent: getComputedStyle(nav).borderBottomColor, mapPaths: [...root.querySelectorAll('.current .chip svg path')].map(el => el.getAttribute('d')) };
  });
  assert.equal(navIdentity.accent, 'rgb(47, 122, 79)');
  assert.deepEqual(navIdentity.mapPaths, ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z', 'M9 4v14M15 6v14']);
  const before = await snapshot(page), url = page.url();
  await top(page); const closedGeometry = await geometry(page), closedOverflow = await overflow(page);
  await button.focus(); await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-expanded'), 'true'); assert(await menu.isVisible());
  const current = menu.locator('a[aria-current="page"]');
  assert.equal(await current.count(), 1); assert.equal(await current.getAttribute('href'), SELF_URL);
  const planned = menu.locator('li').filter({ hasText: 'Grade & Refine Workshop' });
  assert((await planned.innerText()).includes('อยู่ในแผน')); assert.equal(await planned.locator('a').count(), 0);
  await top(page);
  const openGeometry = await geometry(page), openOverflow = await overflow(page);
  assert(openGeometry.nav.x >= -1 && openGeometry.nav.right <= openOverflow.width + 1, 'Open nav fits viewport width');
  assert(openGeometry.nav.bottom <= openGeometry.header.y + 1, 'Open nav stays in normal flow above app header');
  assert(openOverflow.excess <= baseline.matrix[label].initialOverflow.excess + 1, 'Open nav adds no horizontal overflow');
  if (capture) await screenshot(page, label + '-nav-open');
  await current.focus(); await page.keyboard.press('Escape');
  assert.equal(await button.getAttribute('aria-expanded'), 'false');
  assert(await button.evaluate(el => el.getRootNode().activeElement === el), 'Escape returns nav focus to toggle');
  await page.keyboard.press('Space'); assert.equal(await button.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Space'); assert.equal(await button.getAttribute('aria-expanded'), 'false');
  await page.keyboard.press('Enter');
  await menu.locator('a').last().focus(); await page.keyboard.press('Tab');
  assert.equal(await button.getAttribute('aria-expanded'), 'false');
  assert(await host.evaluate(el => document.activeElement !== el), 'Tab exits the nav rather than trapping focus');
  assert.equal(page.url(), url); await assertSame(page, before, 'Menu interactions preserve URL/storage/outputs');
  // Intercept only the exact canonical destination; never visit the production calculator.
  let selfRequested = false;
  await context.route(SELF_URL, async route => { selfRequested = true; await route.fulfill({ status: 302, headers: { location: BASE }, body: '' }); });
  await button.click();
  await Promise.all([page.waitForURL(BASE), current.click()]);
  await page.locator('#mapTable tbody .map-row').first().waitFor();
  assert(selfRequested, 'The real self link requested its exact canonical URL');
  assert.equal(page.url(), BASE); await assertSame(page, before, 'Self navigation restores stored settings');
  await context.unroute(SELF_URL);
  return { ...navIdentity, closedGeometry, closedOverflow, openGeometry, openOverflow, selfDestination: SELF_URL, selfDestinationInterceptedLocally: true };
}
async function fixtures() {
  const context = await contextFor();
  try {
    const page = await openPage(context, 'fixtures');
    const present = await page.locator('ro-suite-nav').count(); mode = report.mode = present ? 'final' : 'baseline';
    if (mode === 'final') {
      assert(fs.existsSync(BASELINE_FILE), 'Final mode requires the frozen preintegration docs/qa/ro-suite-nav/baseline.json');
      baseline = JSON.parse(require('node:zlib').gunzipSync(fs.readFileSync(BASELINE_FILE)).toString('utf8'));
      assert.equal(baseline.completedWithoutFailures, true, 'Do not bless a partial or failing baseline');
      assert.equal(baseline.fixedDate, FIXED_DATE); assert.equal(baseline.playwrightVersion, playwrightVersion);
      navScriptUrl = await page.evaluate(() => [...document.scripts].map(s => s.src).find(src => /\/nav\.js(?:[?#]|$)/.test(src)));
      assert(navScriptUrl, 'Find the actual installed nav.js request for failure testing');
      report.navScriptUrl = navScriptUrl;
    }
    assert.equal(await page.locator('#spotlightEvent').inputValue(), 'auto');
    assert.equal(await page.evaluate(() => config().event), null, 'Fixed test date is outside the archived catalog schedule');
    for (const fixture of CASES) await check('fixture-' + fixture.id, async () => {
      if (mode === 'final') {
        const oldShareUrl = baseline.fixtures[fixture.id + '-shareUrl'];
        assert.equal(typeof oldShareUrl, 'string', 'Frozen baseline contains a genuinely copied pre-edit URL');
        const legacy = await openPage(context, 'legacy-share-' + fixture.id, oldShareUrl);
        try {
          assert.equal(await legacy.locator('#shareStatus').textContent(), 'โหลดค่าจากลิงก์แล้ว');
          await assertSame(legacy, baseline.fixtures[fixture.id], 'Stored pre-edit share URL restores exact original settings and outputs');
          report.legacyShares[fixture.id] = { url: oldShareUrl, exactOriginalState: true };
        } finally { await legacy.close(); }
      }
      await applyCase(page, fixture);
      const state = await snapshot(page); report.fixtures[fixture.id] = state;
      assert.equal(state.rows.length, state.displayRows.length);
      assert.deepEqual(state.rows.map(row => row.code), state.displayRows.map(row => row.code));
      assert.deepEqual(JSON.parse(state.serializedSettings), state.settings);
      if (mode === 'final') assert.deepEqual(state, baseline.fixtures[fixture.id], 'Every calculated row/input/storage value matches the frozen genuine browser baseline');
      const shareUrl = await shareAndReload(page, context, state, fixture.id);
      report.fixtures[fixture.id + '-shareUrl'] = shareUrl;
      if (mode === 'final') {
        assert.equal(new URL(shareUrl).hash, new URL(baseline.fixtures[fixture.id + '-shareUrl']).hash, 'New copy preserves the exact pre-edit settings hash contract');
        report.legacyShares[fixture.id].newHashIdentical = true;
      }
      await top(page); await screenshot(page, fixture.id);
    }, page);
    await page.close();
  } finally { await context.close(); }
}
async function matrix() {
  for (const width of WIDTHS) for (const theme of THEMES) {
    const label = `${width}-${theme}`, context = await contextFor(width, theme);
    let page;
    try {
      page = await openPage(context, label);
      await applyCase(page, CASES[1]);
      const state = await snapshot(page);
      assert.deepEqual(state, report.fixtures['none-customized']);
      const tabOrder = await appTabOrder(page);
      report.matrix[label] = { initialOverflow: await overflow(page), geometry: await geometry(page), appTabOrder: tabOrder };
      if (mode === 'final') assert.deepEqual(tabOrder, baseline.matrix[label].appTabOrder, 'Original app keyboard order is unchanged');
      if (mode === 'final') assert(report.matrix[label].initialOverflow.excess <= baseline.matrix[label].initialOverflow.excess + 1, 'Navigation must not increase baseline horizontal overflow');
      const shareUrl = await check(label + '-clipboard-storage-reload', () => shareAndReload(page, context, state, label), page);
      report.matrix[label].shareUrl = shareUrl;
      await check(label + '-sort-modal-focus', () => modalAndSort(page, width), page);
      await check(label + '-theme-transition', () => themeTransition(page, theme), page);
      if (mode === 'final') {
        if (shareUrl) await page.goto(shareUrl, { waitUntil: 'networkidle' });
        report.matrix[label].nav = await check(label + '-navigation-keyboard-state', () => navigation(page, context, label, width === 390 || width === 1440), page);
      }
      await top(page); await screenshot(page, label + '-closed');
      report.matrix[label].settledOverflow = await overflow(page);
      if (mode === 'final') assert(report.matrix[label].settledOverflow.excess <= baseline.matrix[label].settledOverflow.excess + 1, 'Settled horizontal overflow stays at/below baseline');
    } catch (error) { failure(label + '-matrix', error); if (page) await screenshot(page, label + '-matrix-failure').catch(() => {}); }
    finally { await context.close(); }
  }
}
async function fallback() {
  if (mode !== 'final') { report.fallback = { status: 'not-applicable', reason: 'No suite nav exists in the preintegration baseline.' }; return; }
  report.fallback = {};
  for (const theme of THEMES) {
    const label = `fallback-390-${theme}`, context = await contextFor(390, theme, 'block');
    let page, blocked = 0;
    await context.route(navScriptUrl, async route => { blocked++; await route.abort('failed'); });
    try {
      page = await openPage(context, label);
      assert(blocked > 0, 'The actual installed nav.js request was blocked');
      assert.equal(await page.locator('ro-suite-nav').evaluate(el => el.shadowRoot), null);
      report.fallback[theme] = { blockedUrl: navScriptUrl, scenarios: {} };
      for (const fixture of CASES) await check(label + '-' + fixture.id, async () => {
        await applyCase(page, fixture); const state = await snapshot(page);
        assert.deepEqual(state, baseline.fixtures[fixture.id]);
        await shareAndReload(page, context, state, label + '-' + fixture.id);
        await modalAndSort(page, 390);
        report.fallback[theme].scenarios[fixture.id] = { rows: state.rows.length, identicalToBaseline: true };
      }, page);
      await top(page);
      const info = await page.locator('ro-suite-nav').evaluate(el => {
        const link = el.querySelector('nav > a'); if (!link) return null;
        const box = link.getBoundingClientRect();
        return { href: link.href, width: box.width, height: box.height, top: box.top, visible: !!link.getClientRects().length };
      });
      assert(info?.visible); assert.equal(info.href, PORTAL_URL); assert(info.width >= 44 && info.height >= 44, 'Fallback link minimum 44×44 CSS pixels');
      assert(info.top >= 0 && info.top < 1000, 'Fallback is on-screen after settling at top');
      report.fallback[theme].link = info;
      await screenshot(page, label);
      let requested = false;
      await context.route(PORTAL_URL, async route => { requested = true; await route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Local Portal destination stub</title><p>Exact Portal destination intercepted for QA.</p>' }); });
      await page.locator('ro-suite-nav').evaluate(el => el.querySelector('nav > a').focus());
      await Promise.all([page.waitForURL(PORTAL_URL), page.keyboard.press('Enter')]);
      assert(requested); report.fallback[theme].keyboardDestinationInterceptedLocally = true;
    } catch (error) { failure(label, error); if (page) await screenshot(page, label + '-failure').catch(() => {}); }
    finally { await context.close(); }
  }
}
async function serviceWorker() {
  const context = await contextFor(390, 'light', 'allow');
  let page;
  try {
    page = await openPage(context, 'service-worker');
    await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker ready timed out after 15 seconds')), 15000))]));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await applyCase(page, CASES[1]); const before = await snapshot(page);
    page.__qaLabel = 'service-worker-offline';
    await context.setOffline(true); await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#mapTable tbody .map-row').first().waitFor();
    await assertSame(page, before, 'Warm-cache offline calculations/settings match online state');
    assert.equal(await page.locator('#offlineNotice').isVisible(), true);
    if (mode === 'final') await page.locator('ro-suite-nav .bar button').waitFor();
    await top(page); await screenshot(page, 'service-worker-offline');
    report.serviceWorker = { status: 'passed', controller: await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), warmCacheOfflineStateIdentical: true };
  } catch (error) {
    report.serviceWorker = { status: 'failed', message: error.message };
    failure('service-worker-warm-offline', error);
    if (page) await screenshot(page, 'service-worker-failure').catch(() => {});
  } finally { await context.close(); }
}
function networkSignatures() {
  const deliberateOffline = item => item.label === 'service-worker-offline';
  const blockedNav = item => item.label.startsWith('fallback') && (item.url === navScriptUrl || item.location?.url === navScriptUrl);
  const unique = values => [...new Set(values)].sort();
  return {
    consoleErrors: unique(report.network.consoleErrors.filter(item => !deliberateOffline(item) && !blockedNav(item)).map(item => item.text)),
    badResponses: unique(report.network.badResponses.filter(item => !deliberateOffline(item) && !blockedNav(item)).map(item => `${item.status} ${item.url}`)),
    failedRequests: unique(report.network.failed.filter(item => !deliberateOffline(item) && !blockedNav(item)).map(item => `${item.error} ${item.url}`))
  };
}
function networkComparison() {
  report.network.signatures = networkSignatures();
  assert.deepEqual(report.network.pageErrors, [], 'No uncaught browser JavaScript errors');
  if (mode !== 'final') return;
  const current = [...new Set(report.network.requests.filter(item => !item.label.startsWith('fallback') && !item.label.startsWith('service-worker')).map(item => item.url))].sort();
  const old = new Set(baseline.networkRequestUrls);
  const added = current.filter(url => !old.has(url));
  const removed = baseline.networkRequestUrls.filter(url => !current.includes(url));
  report.network.comparison = { added, removed, expectedAdded: [navScriptUrl, SELF_URL], note: 'Only the exact intentionally blocked nav resource and deliberate offline phase are excluded from error comparisons; all errors remain recorded.' };
  const unexpectedExternal = added.filter(url => new URL(url).origin !== new URL(BASE).origin && url !== SELF_URL);
  assert.deepEqual(unexpectedExternal, [], 'No unexpected external requests beyond baseline and intercepted self link');
  for (const category of ['consoleErrors', 'badResponses', 'failedRequests']) {
    const previous = new Set(baseline.networkSignatures[category]);
    const unexpected = report.network.signatures[category].filter(item => !previous.has(item));
    report.network.comparison[category] = { unexpected };
    assert.deepEqual(unexpected, [], 'No new ' + category + ' beyond genuine baseline');
  }
}

(async () => {
  try {
    ({ chromium } = require('playwright'));
    playwrightVersion = require('playwright/package.json').version;
    report.playwrightVersion = playwrightVersion;
    assert.equal(playwrightVersion, '1.55.1', 'Use the pinned externally installed Playwright version');
    browser = await chromium.launch({ headless: true, ...(process.env.RO_QA_CHROMIUM ? { executablePath: process.env.RO_QA_CHROMIUM } : {}) });
    report.browserVersion = browser.version();
    await fixtures(); await matrix(); await fallback(); await serviceWorker();
    await check('network-baseline-comparison', async () => networkComparison());

  } catch (error) { failure('runner', error); }
  finally {
    if (browser) await browser.close();
    if (mode === 'baseline' || !mode) {
      const frozen = {
        schemaVersion: 1, sourceCommit: report.commit, fixedDate: FIXED_DATE, playwrightVersion,
        browserVersion: report.browserVersion, baseUrl: BASE, fixtures: report.fixtures, matrix: report.matrix,
        networkRequestUrls: [...new Set(report.network.requests.filter(item => !item.label.startsWith('service-worker')).map(item => item.url))].sort(),
        networkFailedUrls: [...new Set(report.network.failed.map(item => item.url))].sort(),
        networkSignatures: networkSignatures(),
        completedWithoutFailures: report.failures.length === 0
      };
      fs.writeFileSync(path.join(OUTPUT, 'baseline.json'), JSON.stringify(frozen, null, 2) + '\n');
    }
    writeReport();
    console.log(JSON.stringify({ status: report.status, mode, passed: report.checks.filter(c => c.status === 'passed').length, failures: report.failures, report: path.join(OUTPUT, 'report.json'), baseline: mode === 'baseline' ? path.join(OUTPUT, 'baseline.json') : BASELINE_FILE, screenshots: report.screenshots.length }, null, 2));
    process.exitCode = report.failures.length ? 1 : 0;
  }
})();
