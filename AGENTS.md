# Testfoss fork guidance

This public demonstration fork is pinned to upstream molrs commit
`aa4c935c3d8f7f31a33df21df2bcf118fbdd973d` on branch `testfoss-demo`.
Keep upstream Rust source, bindings, examples, styles, build scripts, lockfiles,
and existing workflows unchanged. Testfoss edits belong only in this file, the
appended `README.md` section, `durable-memory/**`, `testfoss/**`, and
`.github/workflows/testfoss.yml`.

## Demo provenance

`testfoss/index.html`, `app.js`, and `fixtures.js` are exact copies of the
isolated molecular lab's `demos/molrs/` files at the baseline.
Their SHA-256 values are recorded in durable memory. Do not check in
`testfoss/pkg/`; generate it from `molrs-wasm` for every browser run.

## Exact build and browser pins

- Rust `1.99.1` and target `wasm32-unknown-unknown` from `rust-toolchain.toml`.
- wasm-pack `0.15.0`; Binaryen `version_133`; Node.js `24`.
- `taiki-e/install-action@cfdb7ed4ccc7c7dce37759eae89dc5674b469b39`
  (v2.90.3), `actions/checkout@11d5960a326750d5838078e36cf38b85af677262`
  (v4.4.0), and `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020`
  (v4.4.0).
- `@lmctl-ai/lmctl` `0.2.426`; Playwright `1.63.0`; lmwebtest `v0.1.10`, commit
  `2920befd355eacc654697820d690db074e94dce3`, Linux x64 SHA-256
  `b90cb79fc2b00627da226e563f77a395fedcb95aca01b076af8ff14755009690`.

## Reproduce

```bash
cargo mrs-test --locked
(cd molrs-wasm && wasm-pack test --node -- --locked)
(cd molrs-wasm && wasm-pack build --release --target web \
  --out-dir ../testfoss/pkg --out-name molrs -- --locked)
npm ci --prefix testfoss
npm run --prefix testfoss browsers:install
lmscript install github:lmctl-ai/lmwebtest@v0.1.10
export PATH="$HOME/.cache/lmscript/tools/github/lmctl-ai/lmwebtest/v0.1.10:$PATH"
python3 testfoss/server.py --root . --port 8000 &
TESTFOSS_URL=http://127.0.0.1:8000 lmscript testfoss/browser.lms
```

Stop the server after testing. The workflow sets `CARGO_TARGET_DIR` under the
runner temp directory and uses the same native/Wasm tests and browser scenario.
It has `contents: read`, a timeout, no secrets, and no deployment.

## Limitations

The browser checks official ethanol UFF types, finite energy/forces, official
neighbor values, and L-BFGS coordinate movement. They do not compare energies to
an external engine or test native molecular dynamics, which `molrs-wasm` does
not export. Never commit `target/`, generated Wasm/pkg, dependencies, browser
binaries, or output files. Do not commit or push unless explicitly requested.
