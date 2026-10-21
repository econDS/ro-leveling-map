'use strict';
// Spotlight and map data refreshes rewrite generated data and their check dates.
// Navigation byte-freeze guards skip those data files (and the README that documents each event)
// and compare code with the dates normalized. Map names, nicknames and search aliases live in
// maps.js, planning-context.js and ep20.js, so those data files are skipped as well.
const DATA_FILE = /^(?:assets\/data\/(?:spotlight-[\w-]+|map-geometry|maps|planning-context|ep20)\.(?:js|json)|README\.md)$/;
const CHECK_DATES = {
  'assets/ui.js': /(?<=ข้อมูลกิจกรรมตรวจล่าสุด \$\{thaiDate\(')\d{4}-\d{2}-\d{2}(?='\))/,
  'scripts/audit_spotlight.cjs': /(?<=report\.checkedOn=')\d{4}-\d{2}-\d{2}(?=')/
};
const FROZEN_CHECK_DATE = '2026-09-24';
const isDataFile = file => DATA_FILE.test(file);
function normalizeCheckDate(file, bytes) {
  const pattern = CHECK_DATES[file];
  if (!pattern) return bytes;
  const text = bytes.toString('utf8');
  if (!pattern.test(text)) throw new Error('Check date not found in ' + file);
  return Buffer.from(text.replace(pattern, FROZEN_CHECK_DATE), 'utf8');
}
module.exports = {isDataFile, normalizeCheckDate};
