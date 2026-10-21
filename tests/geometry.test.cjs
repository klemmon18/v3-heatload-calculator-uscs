const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Use the project's pinned TypeScript compiler without adding a test transpiler.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, filename);
};
const { deriveRoomSurfaces, validateRoomDimensions } = require('../utils/geometry.ts');
const { calculateUSCSLoad } = require('../utils/calculations.ts');

const settings = ['Wall', 'Wall', 'Wall', 'Wall', 'Ceiling', 'Floor'].map((type, i) => ({
  id: String(i + 1), name: type, type, rValue: i < 4 ? 19 : i === 4 ? 30 : 0,
  isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: 'No Glass',
}));
const usage = {
  peopleCount: 0, peopleHours: 0, applianceWatts: 0, applianceHours: 0,
  ledWatts: 20, ledHours: 5, incandescentWatts: 0, incandescentHours: 0,
  ambientTemp: 75, outdoorTemp: 95, targetTemp: 55,
  frequentDoorOpening: false, equipmentWatts: 0, equipmentHours: 0,
};

test('rectangular room derives alternating walls and matching ceiling/floor footprints', () => {
  const surfaces = deriveRoomSurfaces(settings, { width: '12', depth: '8', height: '9' });
  assert.deepEqual(surfaces.map(s => [s.width, s.height, s.width * s.height]), [
    [12, 9, 108], [8, 9, 72], [12, 9, 108], [8, 9, 72], [12, 8, 96], [12, 8, 96],
  ]);
  assert.equal(calculateUSCSLoad(surfaces, usage).volume, 864);
});

for (const field of ['width', 'depth', 'height']) {
  for (const invalid of ['', ' ', '0', '-2', 'abc', 'NaN', 'Infinity', '1e309', '0x10']) {
    test(`${field} rejects ${JSON.stringify(invalid)}`, () => {
      const inputs = { width: '12', depth: '8', height: '9', [field]: invalid };
      assert.match(validateRoomDimensions(inputs)[field], /greater than 0 ft/);
      assert.ok(Object.entries(validateRoomDimensions(inputs)).filter(([key]) => key !== field).every(([, error]) => !error));
      const surfaces = deriveRoomSurfaces(settings, inputs);
      assert.ok(surfaces.every(s => Number.isFinite(s.width) && Number.isFinite(s.height)));
    });
  }
}

test('decimal dimensions are accepted without rounding geometry', () => {
  const inputs = { width: '10.5', depth: '8.25', height: '9' };
  assert.deepEqual(validateRoomDimensions(inputs), { width: '', depth: '', height: '' });
  assert.deepEqual(deriveRoomSurfaces(settings, inputs).map(s => s.width * s.height), [94.5, 74.25, 94.5, 74.25, 86.625, 86.625]);
});

test('dimension changes recompute geometry without mutating construction/opening settings', () => {
  const before = structuredClone(settings);
  const first = deriveRoomSurfaces(settings, { width: '12', depth: '8', height: '9' });
  const next = deriveRoomSurfaces(settings, { width: '13', depth: '7', height: '10' });
  assert.equal(first[0].width, 12);
  assert.equal(next[0].width, 13);
  assert.equal(next[1].width, 7);
  assert.deepEqual(settings, before);
});

test('door regression matches the pre-change 10 × 10 × 8 baseline including wall subtraction', () => {
  const withDoor = structuredClone(settings);
  Object.assign(withDoor[0], { hasDoor: true, doorWidth: 3, doorHeight: 7, doorMaterial: 'Solid Core Wood' });
  const surfaces = deriveRoomSurfaces(withDoor, { width: '10', depth: '10', height: '8' });
  assert.deepEqual(calculateUSCSLoad(surfaces, usage), {
    totalBtuLoad: 1283, volume: 800,
    breakdown: { qWalls: 8309, qCeiling: 1760, qFloor: 500, qGlass: 0, qDoors: 5040,
      qSun: 0, qPeople: 0, qLighting: 341, qAir: 1152, qExtra: 0, qSafety: 3420 },
  });
  // The 21 sq ft door must be subtracted from the 320 sq ft wall total.
  assert.equal(calculateUSCSLoad(surfaces, usage).breakdown.qWalls, Math.round((320 - 21) * 20 * 24 / 19 * 1.1));
});

test('vaulted heights, glass, door, exterior, insulation and radiant settings retain their existing calculations', () => {
  const special = structuredClone(settings);
  Object.assign(special[0], { isExterior: true, sunExposed: true, glassWidth: 4, glassHeight: 5, glassType: 'Double Pane', hasDoor: true, doorWidth: 3, doorHeight: 7, doorMaterial: 'Insulated Exterior' });
  Object.assign(special[4], { isVaulted: true, minHeight: 8, maxHeight: 12, isExterior: true });
  Object.assign(special[5], { isRadiantFloor: true, rValue: 11 });
  const explicit = special.map((s, i) => ({ ...s, width: i < 4 ? (i % 2 === 0 ? 12 : 8) : 12, height: i < 4 ? 9 : 8 }));
  const derived = deriveRoomSurfaces(special, { width: '12', depth: '8', height: '9' });
  assert.deepEqual(derived, explicit);
  assert.deepEqual(calculateUSCSLoad(derived, usage), calculateUSCSLoad(explicit, usage));
  assert.equal(calculateUSCSLoad(derived, usage).volume, 960);
});
