# RO Suite nav 1.4 integration QA

- Repository: `econDS/ro-leveling-map`
- Immutable latest-main baseline: `87b50f729270cc134c7094e169e34d02f2d2ae27`
- Immutable Portal source: `24ca1068c8f6868b38d6224e661f818fec9897f9`
- Bundle, catalog and lock copied byte-for-byte into `assets/ro-suite/1.4.0/`; SHA-256 values in `release-hashes.json`
- Existing 1.2.0/1.3.0 files and all existing production files remain protected by `production-baseline.json`

## Integration scope

Main content box: max-width 1540px, 24px desktop gutters, 12px at <=980px. The legacy header uses a different perimeter and is deliberately unchanged.

Only the local module URL and scoped host/fallback CSS change existing production HTML. The fallback nav wrapper uses the same max-width/gutter variables and a minimum 52px row; the original >=44px fallback anchor remains intact. No first-run UI, inputs, defaults, app logic, data, storage, sharing, import/export, destination, theme, or service-worker changes.

`normalize.cjs` reverses only the two exact deltas recorded in `changes.json`, asserting exactly one occurrence. Historical tests still verify their original hashes after this reversal; no broad selector removal or replacement checksum is used.

## Evidence

The genuine pre-edit Chromium capture covers 320, 360, 390, 430, 768 and 1440px in light and dark. Compact before measurements are retained in `measured-before.json`; full screenshots and cross-app final candidate geometry are owned by [Portal draft PR #6](https://github.com/econDS/ro_tools_portal/pull/6).

Before nav height was 98px at 320–430 and 68px at 768/1440. Header gap was 0px. Candidate geometry must be checked in the pinned-head central suite before readiness is claimed.

Local source checks: 44 Node tests and 4 Python tests passed. Exact latest-main calculation, saved settings and serialization fixtures match `calculation-baseline.json`.

The dedicated read-only `nav-1.4.0-qa.yml` workflow runs every original source test, original browser regression, original first-run before/after test, and an additional latest-main before/after first-run/output comparison. It uses pinned actions, Node 22.14.0 and Playwright 1.55.1, has only contents:read, and never deploys. Browser results are reported by CI for the exact PR head; local Chromium is unavailable in this environment because socket creation is blocked.

Draft only. No merge or deployment.
