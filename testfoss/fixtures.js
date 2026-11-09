export const officialTwoAtomXyz = `2
Official molrs-wasm two_atom_frame fixture
H 0.0 0.0 0.0
O 1.0 0.0 0.5
`;

export const ethanolSdf = `ethanol — official molrs UFF typing coordinates
molrs-wasm quickstart
local fixture
  9  8  0  0  0  0  0  0  0  0999 V2000
    0.9000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.2000    0.9000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.3000    0.9000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.3000   -0.5000    0.9000 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.3000   -0.5000   -0.9000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.9000   -0.9000    0.5000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.9000   -0.5000   -0.9000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.1000    1.5000   -0.5000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  2  7  1  0  0  0  0
  2  8  1  0  0  0  0
  3  9  1  0  0  0  0
M  END
`;

export const ethaneSdf = `ethane — official molrs MMFF atom-type graph
molrs-wasm quickstart
local fixture
  8  7  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5400    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.3600    1.0200    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.3600   -0.5100    0.8830 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.3600   -0.5100   -0.8830 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.9000    1.0200    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.9000   -0.5100    0.8830 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.9000   -0.5100   -0.8830 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
  2  6  1  0  0  0  0
  2  7  1  0  0  0  0
  2  8  1  0  0  0  0
M  END
`;

export const sdfFixtures = { ethanol: ethanolSdf, ethane: ethaneSdf };
