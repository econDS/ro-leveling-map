# ro-suite-nav 1.2.0 integration evidence

## Baseline provenance

- Original `main`: `c5c8add7dc77e554a50c8369697390bcf0ed4107`
- Fresh checkout was clean; feature branch: `feat/ro-suite-nav`
- Read `AGENTS.md`, `README.md`, the actual page, settings, calculator, UI,
  theme, manifest and service-worker code before changing production files
- `before-node.log`: original 30 Node tests passed
- `before-python.log`: original 4 Python tests passed
- `calculation-baseline.json`: three real calculation cases and serialized
  settings/share hashes captured before production edits, using
  `node tests/capture-leveling-baseline.cjs`
- `source-baseline.json`: SHA-256 of the original production files, captured
  before production edits; this is not a reconstructed after-change baseline
- Browser baseline is captured by a separate QA-only commit and CI run before
  integrating the component; its report/commit will be recorded here

Local Chromium launch failed with `socket() failed: Operation not permitted`.
Browser verification therefore runs only in the explicitly authorized PR-only
GitHub Actions job. Browser tooling is pinned to Playwright 1.55.1, installed
outside the production checkout, and uses its matching Chromium build.
The job has `contents: read`, checkout credentials are not persisted, and it
has no deploy, push or Pages-setting steps. Logs and screenshots upload even
when tests fail.

## Existing application contracts

- Publishing root is the repository root; public path stays `/ro-leveling-map/`
- Theme follows `prefers-color-scheme`, light and dark; no theme switch exists
- App settings use only `ro-general-map-exp-tool-settings-v1` (flat JSON)
- Existing startup removes the obsolete app-owned
  `ro-general-map-exp-tool-password`; that behavior is unchanged
- Shared settings are encoded in `#settings=...` as JSON
  `{version:1,settings:{...}}`, using `URLSearchParams`; copying preserves query
  and pathname and does not change the current address bar
- There is no existing skip link. The existing mobile results jump remains
  available; the original controls retain their relative tab order
- Map sort defaults to EXP descending. Modal dismissal restores its opener
- Spotlight auto mode uses the app's recorded catalog and Thai time boundaries;
  explicit historical events remain selectable. QA freezes time for
  reproducibility and does not assert that an event is currently active
- The existing PWA worker remains unchanged. It dynamically caches successfully
  loaded same-origin scripts; a fresh failed nav load must use the fallback

## Release source

Read the immutable tagged instructions:
https://github.com/econDS/ro_tools_portal/blob/nav-v1.2.0/integrations/nav/README.md

The three files were downloaded from `nav-v1.2.0` into a temporary directory
and verified before integration. No release or portal files were modified.

| File | SHA-256 |
| --- | --- |
| nav.js | d75be916445feb4febeaada437841a1b3be68db16a00673198c78fd6f6c8dc5f |
| catalog.snapshot.json | 800bb9c9d2b52a7fbae58e436b05529e69820fee3627d199da545a6f5e28f7dd |
| nav.lock.json | 3b0350135ba5f455b38799c7940492938a209e8e0a6570a5126cb40c36127358 |

The first two hashes also match `nav.lock.json`. The snapshot supplies
`leveling-map`, accent `#2f7a4f` and icon `map`. Grade & Refine remains planned
without a launch link.

## Verification commands

```sh
node --test tests/*.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
node tests/capture-leveling-baseline.cjs
# With externally installed playwright@1.55.1 and the local subpath server:
NODE_PATH=/path/to/qa/node_modules node tests/ro-suite-nav.browser.cjs
```

## Explicit limits

Physical devices, WebKit/Safari, Firefox, and the public GitHub Pages build after
merge are not tested. No merge or deployment is authorized. Browser claims
must reference an actual run on the stated commit, not this checklist.
