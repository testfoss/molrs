# Source-built molrs Testfoss scenario

## Baseline and lab provenance

Upstream is molrs `aa4c935c3d8f7f31a33df21df2bcf118fbdd973d` (0.19.0).
The demo was copied from the molecular browser lab's `demos/molrs/` without
content changes. Source file SHA-256 values:

- `index.html`:
  `db51b53fcec2cd1c0e18664ae6490d4cd40039247502eb9dca58cf5ff240769c`
- `app.js`:
  `f18a9c740ed0af3de2ef7dcb082de25c1c2167995bb9f40eb45d46f468aaba26`
- `fixtures.js`:
  `1adfb484b173108e79804d2ea47bf9261f5a07af2ec4c00be84a78a968dc5847`

The page's source labels identify upstream two-atom XYZ, UFF ethanol, and MMFF
ethane fixtures. The browser gate selects ethanol/UFF and does not treat MMFF or
molecular dynamics as covered.

## Reproduction commands and pins

Run `cargo mrs-test --locked`, then `(cd molrs-wasm && wasm-pack test --node --
--locked)`. Generate the browser package from source with `(cd molrs-wasm &&
wasm-pack build --release --target web --out-dir ../testfoss/pkg --out-name
molrs -- --locked)`. Serve the repository and run `TESTFOSS_URL=... lmscript
testfoss/browser.lms`; complete server/tool setup is in `AGENTS.md` and
`testfoss/README.md`.

The exact toolchain is Rust 1.99.1, wasm-pack 0.15.0, Binaryen version_133, and
Node.js 24. Browser tools are lmctl 0.2.426, Playwright 1.63.0, and lmwebtest
v0.1.10 at commit `2920befd355eacc654697820d690db074e94dce3` (Linux x64
SHA-256 `b90cb79fc2b00627da226e563f77a395fedcb95aca01b076af8ff14755009690`).
The `.lms` uses `cli="lmwebtest playwright"` directly.

## Decisions and limitations

CI generates `testfoss/pkg` rather than committing Wasm. Cargo output is routed
to runner temp storage. Browser checks assert nine ethanol atoms, official
two-atom neighbor results, two `C_3` and one `O_3` UFF types, 27 force entries,
and nonzero L-BFGS coordinate movement. The demo itself rejects non-finite
energy, force, and optimizer values. No golden external-engine energy or pixel
comparison is claimed.

Generated pkg/Wasm, Rust target output, dependencies, and browser artifacts are
not durable source. No output molecular structure is checked in.
