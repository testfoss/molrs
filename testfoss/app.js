import init, {
  readXyz,
  readSdf,
  writeXyz,
  fillAtomicNumbers,
  fillSymbols,
  NeighborList,
  UffTypifier,
  Mmff94Typifier,
  PotentialCompiler,
  Lbfgs,
  SmilesIr,
} from './pkg/molrs.js';
import { officialTwoAtomXyz, sdfFixtures } from './fixtures.js';

const statusNode = document.querySelector('#status');
const resultsNode = document.querySelector('#results');
const buttons = [...document.querySelectorAll('button')];
const state = { ready: false, fixture: null, results: {} };
let currentFrame = null;

function setStatus(text, kind = 'working') {
  statusNode.textContent = text;
  statusNode.dataset.status = kind;
}

function publish(patch) {
  state.results = { ...state.results, ...patch };
  resultsNode.textContent = JSON.stringify(state.results, null, 2);
}

function coordinates(frame) {
  const atoms = frame.get('atoms');
  const x = atoms.copy('x');
  const y = atoms.copy('y');
  const z = atoms.copy('z');
  const flat = new Float64Array(x.length * 3);
  for (let i = 0; i < x.length; i += 1) {
    flat[3 * i] = x[i];
    flat[3 * i + 1] = y[i];
    flat[3 * i + 2] = z[i];
  }
  return flat;
}

function typify(frame, forcefield) {
  const typifier = forcefield === 'uff' ? new UffTypifier() : new Mmff94Typifier();
  const typed = typifier.typify(frame);
  const potentials = new PotentialCompiler(typifier.forcefield()).compile(typed);
  return { typifier, typed, potentials };
}

function assertOfficialTwoAtomValues() {
  const bytes = new TextEncoder().encode(officialTwoAtomXyz);
  const fromText = readXyz(officialTwoAtomXyz);
  const fromBytes = readXyz(bytes);
  const xText = Array.from(fromText.get('atoms').copy('x'));
  const xBytes = Array.from(fromBytes.get('atoms').copy('x'));
  if (JSON.stringify(xText) !== '[0,1]' || JSON.stringify(xBytes) !== '[0,1]') {
    throw new Error(`Official two-atom XYZ mismatch: ${xText} / ${xBytes}`);
  }
  const neighbors = new NeighborList(2.0);
  neighbors.build(fromBytes);
  const pairs = neighbors.neighbors();
  const distSq = Array.from(new Float64Array(pairs.distSq()));
  if (pairs.nPairs !== 1 || distSq.length !== 1 || Math.abs(distSq[0] - 1.25) > 1e-12) {
    throw new Error(`Neighbor analysis mismatch: nPairs=${pairs.nPairs}, distSq=${distSq}`);
  }
  return {
    source: 'upstream/molrs/molrs-wasm/src/io/xyz.rs and two_atom_frame',
    textX: xText,
    bytesX: xBytes,
    byteInputLength: bytes.length,
    xyzRoundTripFirstLine: writeXyz(fromBytes).split('\n')[0],
    neighborPairs: pairs.nPairs,
    neighborDistSq: distSq,
  };
}

function checkOfficialTypes(fixture, forcefield, atomTypes) {
  if (fixture === 'ethanol' && forcefield === 'uff') {
    const c3 = atomTypes.filter((value) => value === 'C_3').length;
    const o3 = atomTypes.filter((value) => value === 'O_3').length;
    if (c3 !== 2 || o3 !== 1) throw new Error(`Official UFF ethanol types mismatch: C_3=${c3}, O_3=${o3}`);
    return { reference: 'uff_types_ethanol', C_3: c3, O_3: o3, passed: true };
  }
  if (fixture === 'ethane' && forcefield === 'mmff') {
    const expected = ['1', '1', '5', '5', '5', '5', '5', '5'];
    if (JSON.stringify(atomTypes) !== JSON.stringify(expected)) {
      throw new Error(`Official MMFF ethane types mismatch: ${atomTypes}`);
    }
    return { reference: 'test_ethane_atom_types', expected, passed: true };
  }
  return { reference: 'finite evaluation; no exact upstream energy golden for this fixture', passed: true };
}

async function withBusy(label, action) {
  buttons.forEach((button) => { button.disabled = true; });
  setStatus(label);
  try {
    await action();
    setStatus('Complete', 'complete');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), 'error');
    throw error;
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}

document.querySelector('#load').addEventListener('click', () => withBusy('Reading local SDF text and running neighbor analysis…', async () => {
  const fixture = document.querySelector('#fixture').value;
  state.results = {};
  currentFrame = readSdf(sdfFixtures[fixture]);
  fillAtomicNumbers(currentFrame);
  const official = assertOfficialTwoAtomValues();
  const atomCount = currentFrame.get('atoms').nRows;
  const neighbors = new NeighborList(3.0);
  neighbors.build(currentFrame);
  const pairs = neighbors.neighbors();
  const smiles = SmilesIr.fromFrame(currentFrame).toString();
  fillSymbols(currentFrame);
  const xyz = writeXyz(currentFrame);
  fillAtomicNumbers(currentFrame);
  state.fixture = fixture;
  publish({
    fixture,
    structure: {
      source: `fixtures.js:${fixture}Sdf`,
      atomCount,
      bondCount: currentFrame.get('bonds').nRows,
      canonicalSmiles: smiles,
      xyzFirstLine: xyz.split('\n')[0],
      xyzBytes: new TextEncoder().encode(xyz).length,
    },
    officialTwoAtomAssertions: official,
    analysis: {
      cutoffAngstrom: 3.0,
      neighborPairs: pairs.nPairs,
      firstDistSq: pairs.nPairs ? pairs.distSq()[0] : null,
    },
  });
}));

document.querySelector('#evaluate').addEventListener('click', () => withBusy('Typifying and evaluating the selected force field…', async () => {
  if (!currentFrame) throw new Error('Load a fixture first.');
  const forcefield = document.querySelector('#forcefield').value;
  const { typed, potentials } = typify(currentFrame, forcefield);
  const evaluation = potentials.evaluate(coordinates(typed));
  const forces = Array.from(evaluation.forces);
  if (!Number.isFinite(evaluation.energy) || !forces.every(Number.isFinite)) {
    throw new Error('Force-field evaluation produced a non-finite value.');
  }
  const atomTypes = Array.from(typed.get('atoms').copy('type'));
  publish({
    evaluation: {
      forcefield: forcefield === 'uff' ? 'UFF' : 'MMFF94',
      energyKcalPerMol: evaluation.energy,
      forceCount: forces.length,
      maxAbsForce: Math.max(...forces.map(Math.abs)),
      atomTypes,
      officialAssertion: checkOfficialTypes(state.fixture, forcefield, atomTypes),
    },
  });
}));

document.querySelector('#optimize').addEventListener('click', () => withBusy('Running source-built L-BFGS in WebAssembly…', async () => {
  if (!currentFrame) throw new Error('Load a fixture first.');
  const forcefield = document.querySelector('#forcefield').value;
  const { typed, potentials } = typify(currentFrame, forcefield);
  const before = coordinates(typed);
  const initial = potentials.evaluate(before);
  const neighbors = new NeighborList(12.5);
  neighbors.build(typed);
  const optimizer = new Lbfgs(potentials, neighbors.neighbors());
  const report = optimizer.minimize(typed, 250);
  const after = coordinates(typed);
  const coordinateDelta = after.map((value, index) => Math.abs(value - before[index]));
  if (![initial.energy, report.finalEnergy, report.finalFmax, report.finalGradRms].every(Number.isFinite)) {
    throw new Error('L-BFGS produced a non-finite result.');
  }
  if (!coordinateDelta.some((value) => value > 1e-8)) throw new Error('L-BFGS did not change coordinates.');
  fillSymbols(typed);
  const optimizedXyz = writeXyz(typed);
  publish({
    optimization: {
      algorithm: 'L-BFGS',
      forcefield: forcefield === 'uff' ? 'UFF' : 'MMFF94',
      initialEnergyKcalPerMol: initial.energy,
      finalEnergyKcalPerMol: report.finalEnergy,
      converged: report.converged,
      nSteps: report.nSteps,
      finalFmax: report.finalFmax,
      finalGradRms: report.finalGradRms,
      maxAbsCoordinateChangeAngstrom: Math.max(...coordinateDelta),
      optimizedXyz,
    },
  });
}));

window.molrsDemo = {
  getState: () => JSON.parse(JSON.stringify(state)),
};

try {
  await init({ module_or_path: './pkg/molrs_bg.wasm' });
  state.ready = true;
  buttons.forEach((button) => { button.disabled = false; });
  setStatus('WebAssembly ready', 'ready');
} catch (error) {
  setStatus(error instanceof Error ? error.message : String(error), 'error');
  throw error;
}
