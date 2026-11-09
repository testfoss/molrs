# molrs Testfoss source-built Wasm demo

`index.html`, `app.js`, and `fixtures.js` are copied from the molecular browser
lab's `demos/molrs/` scenario. The page reads local SDF/XYZ fixtures, checks
neighbor analysis and official UFF atom types, evaluates finite energies/forces,
and runs L-BFGS in the browser. `molrs-wasm` does not export native molecular
dynamics; this demo does not claim otherwise.

`testfoss/pkg/` is generated from this checkout in CI or locally. It is not
checked in and no prebuilt Wasm is downloaded by the demo.

## Run

Use the repository-pinned Rust 1.99.1 toolchain, Node.js 24, wasm-pack 0.15.0,
Binaryen version_133 (`wasm-opt`), and Python 3:

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
SERVER_PID=$!
trap 'kill "$SERVER_PID"' EXIT
TESTFOSS_URL=http://127.0.0.1:8000 lmscript testfoss/browser.lms
```

If Playwright cannot download a browser on your host, set
`TESTFOSS_CHROMIUM=/absolute/path/to/chrome` in the final command's environment
to use an existing Chromium/Chrome executable instead.

Open `http://127.0.0.1:8000/testfoss/` for manual UFF/MMFF and optimization
controls. Browser assertions cover UFF typing, force-vector size, official
neighbor values, and coordinate-changing L-BFGS. They do not establish force-
field accuracy against an external engine or visual rendering correctness.
Rust `target/`, `testfoss/pkg/`, `node_modules/`, and browser artifacts remain
uncommitted.
