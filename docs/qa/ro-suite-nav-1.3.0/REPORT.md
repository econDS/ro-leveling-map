# Leveling navigation 1.3.0 rollout

Base: `9954b741012eb6f1d39210e68993908ded6bd0f1` (clean main checkout, including map-comparison chart).
Publishing root: repository root; URL `/ro-leveling-map/`. Identity remains `leveling-map`, green map icon; theme follows system. No optional catalog attribute in production. Fallback and header are unchanged.

## Baseline and preservation

Before edits: `node --test tests/*.test.cjs` passed 38 tests; `python -m unittest discover -s tests -p 'test_*.py'` passed 4. `calculation-baseline.json` captures genuine pre-edit outputs for three fixtures; `source-baseline.json` hashes current production files. The new preservation assertion normalizes only the nav module URL and requires every previously tracked production file to retain identical bytes, including all 1.2.0 artifacts, settings, data, calculator, chart, UI, and service worker.

Existing preintegration browser baseline remains immutable. The PR workflow additionally checks out the exact current base and runs its unmodified browser suite before running this candidate, served under the same public subpath. Logs and screenshots explicitly identify each commit. Current browser results are authoritative in the CI artifact; no browser result is implied by this document.

## Artifacts

Source: `econDS/ro_tools_portal` reviewed release `integrations/nav/releases/1.3.0/`, copied without modification. Both content hashes match the lock:

- nav.js: `e0a75bce3f8ba21d73aff8aa28af1c624d977f1e8e3de483c6dd40785b3b84d2`
- catalog.snapshot.json: `a198338ddcb7857094ef950fb1315c532840cf53ac8e7a69b331d8cb4a87dd5d`
- nav.lock.json: `7ac31d27c493071ad164326022854a637c5015ae7989ff8c2a4c129b021c59c3`

## Checks

Candidate static tests: 39 Node tests, 4 Python tests. Browser suite covers three calculations, saved custom inputs/reload, copied share hashes and reopening, sort/modal/focus, four widths (360/390/768/1440) with both system themes and transitions, Enter/Space/Escape/Tab, current-page identity, all snapshot tool URLs including Best Status, planned/nonlaunchable Grade & Refine, real blocked module fallback, actual optional catalog abort in an isolated test fixture, warm-cache offline behavior, and console/page/network error comparison. The optional catalog fixture is intentionally executed after the ordinary network comparison; its aborted request is expected and is recorded separately.

Screenshot evidence: CI artifact includes menu-open 390 and 1440 images in both themes and settled-top mobile fallback in both themes. `commit.txt` and `report.json` bind evidence to the head; `before/` binds baseline evidence to the base.

## Scope / rollback

Production changes: `index.html` versioned module URL and three additive files under `assets/ro-suite/1.3.0/`. QA-only changes: existing Node/browser tests and PR workflow; baseline/report files in this directory. No app formula, data, default price, localStorage schema, share serializer, imports/exports, UI redesign, or Pages setting changes.

Rollback: change only the module URL in `index.html` back to `./assets/ro-suite/1.2.0/nav.js`, which is retained byte-for-byte; adjust QA version assertions accordingly. Do not revert later business/chart commits.

## Limits

Local Chromium failed to launch with sandbox socket EPERM; actual browser validation is performed by pinned Playwright 1.55.1 in GitHub Actions, not claimed locally. Real devices, WebKit/Safari/Firefox and postmerge Pages remain untested here. No merge or deploy performed. Suite-wide final consistency is reported separately by the rollout coordinator. Tests use a fixed date outside the archived event schedule and make no statement about current event activity.
