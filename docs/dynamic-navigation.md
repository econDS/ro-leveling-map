# Dynamic suite navigation 2.0.0

The locally installed immutable web component fetches
`https://econds.github.io/ro_tools_portal/catalog/v1/tools.json` automatically when
connected. It immediately renders its frozen bundled fallback, then replaces it
only after validating the whole schemaVersion 1 catalog. The central registry can
add, remove, rename or reorder tools without changing this application. Its stable
identity remains `leveling-map`; the public root remains `/ro-leveling-map/`.

The approved policy accepts HTTPS `econds.github.io` repository-root URLs only,
without credentials, ports, queries, fragments, encoded paths or dot segments.
JSON is data, never executable code. The runtime bounds responses to 256 KiB,
500 tools and 1.5 seconds and requests cache revalidation. Unknown current IDs
remain readable until remote metadata resolves them. The searchable menu supports
keyboard operation, host theme tokens and small screens.

The existing service worker handles only requests under `/ro-leveling-map/` and
therefore never caches the central `/ro_tools_portal/` catalog. Reloading online
revalidates the catalog; offline uses the embedded snapshot. A blocked component
script retains the existing plain Portal link.

Migration: publish the Portal catalog first after reviewing its source and 2.0.0
release hashes; then independently merge and deploy this child. No deployment or
Pages settings change is performed by this PR. Historical releases stay intact.
Rollback: change the sole module script URL in index.html back to
`./assets/ro-suite/1.5.1/nav.js` and redeploy through the normal approved process.
The corresponding historical test expectation/normalization can be reverted.
No application formulas, storage keys, sharing, export, theme or URLs change.

Validation includes all historical frozen-artifact checks, exact calculation/share
fixtures, Python map geometry tests, the existing eight-layout browser matrix and
a dynamic catalog test that serves 120 new tools to the unchanged installed bundle.
Browser fixtures intercept the exact central endpoint before navigating; raw
hostile strings are passed directly through JSON to prevent URL normalization from
hiding forbidden inputs. CI is scoped to `feat/dynamic-ro-suite-nav`.
