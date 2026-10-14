'use strict';
const assert = require('node:assert/strict');
module.exports = html => {
  // Reverse only the reviewed v2 script upgrade before historical preservation checks.
  html = html.replace('./assets/ro-suite/2.0.0/nav.js', './assets/ro-suite/1.5.1/nav.js');
  for (const [before, after] of [...require('./changes.json')].reverse()) {
    assert.equal(html.split(after).length, 2, 'exactly one reviewed host-theme delta');
    html = html.replace(after, before);
  }
  return html;
};
