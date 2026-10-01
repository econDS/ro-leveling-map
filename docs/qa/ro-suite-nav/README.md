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
- `baseline.json.gz` is a lossless gzip of the genuine successful browser capture from the QA-only
  commit `9b451b153cf67c501a2473b879647810711a844c`, while every production
  source was still byte-identical to the original main
- [Baseline run](https://github.com/econDS/ro-leveling-map/actions/runs/36808124541):
  Chromium 140.0.7339.186, 28 browser checks passed, all eight viewport/theme
  combinations had zero horizontal overflow; warm-cache offline passed
- That run's overall workflow status was failure because its separate Python
  step used Pillow 11.3.0, which lacks `Image.get_flattened_data` required by the
  existing tests. The workflow now pins Pillow 12.3.0, matching the environment
  where the original four Python tests already passed. No Python test changed
- The earlier run `36807641987` is retained as a superseded capture: its UI
  driver entered an unintended damage value, detected through screenshot
  inspection. It is not the accepted custom-input baseline

Local Chromium launch failed with `socket() failed: Operation not permitted`.
Browser verification therefore runs only in the explicitly authorized PR-only
GitHub Actions job. Browser tooling is pinned to Playwright 1.55.1, installed
outside the production checkout, and uses its matching Chromium build.
The job has `contents: read`, checkout credentials are not persisted, and it
has no deploy, push or Pages-setting steps. Logs and screenshots upload even
when tests fail.

## Production change

The only edited pre-existing production file is `index.html`: the shared
component and local module are immediately before the unchanged header. There
was no skip link. A single `ro-suite-nav > nav > a` CSS rule makes the fallback
at least 44×44 CSS pixels and uses the app's existing text color in both themes.
No global CSS, sticky/modal adjustment, theme code or new storage key was needed.
There is no `theme` attribute because the real app follows OS color scheme, and
there is no `catalog-url`; executable navigation comes only from this repo.

The three immutable release files are under `assets/ro-suite/1.2.0/`. All original
assets, formulas, settings, event data, serializer, UI, service worker and
manifest remain byte-for-byte unchanged. A test also removes only the exact
approved insertion from `index.html` and verifies its original SHA-256.

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

The [integration run on 8df59c0](https://github.com/econDS/ro-leveling-map/actions/runs/36823790740)
passed 35 Node tests, 4 Python tests and 42 browser check groups. All three
pre-edit copied share URLs restored exact settings and all numeric rows.
All 360/390/768/1440px light/dark cases had zero horizontal overflow with
the menu closed and open. Fallback links measured 149×44 CSS pixels at top 0.
No new console errors, page errors, HTTP failures or failed requests appeared
relative to baseline, excluding the exact intentionally blocked nav module
and deliberate offline steps. Existing aborted manifest requests during
navigation are recorded. Console warnings are not compared.

The six PNGs below were generated by that exact commit and visually inspected.
Subsequent evidence commits add these files/documentation and tighten a
baseline-provenance assertion, without changing production or browser-test
behavior. The final PR links its latest-head run, whose artifact also contains
fresh screenshots, complete logs and `report.json` for that head.

- [390px light, menu open](screenshots/390-light-nav-open.png)
- [390px dark, menu open](screenshots/390-dark-nav-open.png)
- [1440px light, menu open](screenshots/1440-light-nav-open.png)
- [1440px dark, menu open](screenshots/1440-dark-nav-open.png)
- [390px light, actual nav request blocked](screenshots/fallback-390-light.png)
- [390px dark, actual nav request blocked](screenshots/fallback-390-dark.png)

Fallback screenshots were taken only after scrolling to the top and waiting
for scrolling/animation frames to settle. The visible link remains keyboard
operable. [Evidence summary](evidence-summary.json) records exact provenance,
PNG hashes, measured bounds/overflow, legacy-share comparisons and limitations.

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

The browser contexts contain isolated custom QA settings, not a read of the
user's real browser profile. Tests access only the Leveling settings key.
The custom damage input is seeded with the native input setter followed by the
real input/change handlers; it is not a claim about simulated typing behavior.
Copied share URLs and reopening, clipboard, buttons and keyboard navigation
are exercised in Chromium. Canonical self/Portal links are intercepted locally
to avoid visiting live calculators; the real Portal URL separately returned
HTTP 200. Service-worker error exclusions are confined to deliberate offline
steps, and nav failure exclusions to the exact intentionally blocked module.

The browser baseline is stored compressed to keep evidence transfer small; the tests decode it with Node built-in zlib. Decoded SHA-256: `3b4c9399ab8c64017eb37a601d9b6ba15b83c8045b20cffd477324e9f4d908ea`. Its data has not been regenerated after integration.
