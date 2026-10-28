const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
const { calculateUSCSLoad } = require('../utils/calculations.ts');
const { getSurfaceAreas } = require('../utils/surfaceAreas.ts');
const { deriveRoomSurfaces } = require('../utils/geometry.ts');
const { parseLightingWatts, validateLightingWatts } = require('../utils/lighting.ts');
const { WallConstruction, GlassType } = require('../types.ts');
const { doorBaseline, standardCases } = require('./fixtures/door-baseline.cjs');

const wall = { id: '1', name: 'Wall 1', type: 'Wall', width: 10, height: 8, rValue: 19,
  isExterior: false, sunExposed: false, glassType: GlassType.None, glassWidth: 0, glassHeight: 0 };
const usage = { ambientTemp: 75, outdoorTemp: 95, targetTemp: 55,
  peopleCount: 0, peopleHours: 0, ledWatts: 0, ledHours: 5,
  incandescentWatts: 0, incandescentHours: 0, applianceWatts: 0, applianceHours: 0 };

test('opaque construction preserves every existing R-value and the whole opaque area without openings', () => {
  for (const rValue of [0, 11, 13, 19, 21, 30, 42]) {
    const result = calculateUSCSLoad([{ ...wall, rValue }], usage);
    assert.equal(result.breakdown.qWalls, Math.round(80 * 20 * 24 / Math.max(1, rValue) * 1.1));
    assert.equal(result.breakdown.qGlass, 0);
  }
});

for (const [construction, glassType, factor] of [
  [WallConstruction.SinglePaneGlass, GlassType.SinglePane, 28],
  [WallConstruction.DoublePaneGlass, GlassType.DoublePane, 15],
]) {
  test(`${construction} counts only glazing, using the legacy factor and glass dampener`, () => {
    const full = { ...wall, wallConstruction: construction };
    const areas = getSurfaceAreas(full);
    assert.equal(areas.glassType, glassType);
    assert.equal(areas.glassArea, 80);
    assert.equal(areas.opaqueArea, 0);
    const result = calculateUSCSLoad([full], usage);
    assert.equal(result.breakdown.qWalls, 0);
    assert.equal(result.breakdown.qGlass, 80 * 20 * factor * 0.8);
    // Equivalent to the pre-existing full-area legacy glass controls.
    assert.deepEqual(result, calculateUSCSLoad([{ ...wall, glassType, glassWidth: 10, glassHeight: 8 }], usage));
  });
  test(`${construction} uses the appropriate interior/exterior temperature difference`, () => {
    const interior = calculateUSCSLoad([{ ...wall, wallConstruction: construction }], usage);
    const exterior = calculateUSCSLoad([{ ...wall, wallConstruction: construction, isExterior: true }], usage);
    assert.equal(exterior.breakdown.qGlass, interior.breakdown.qGlass * 2);
  });
  test(`${construction} subtracts a 21 sq ft door before applying glass and door loads`, () => {
    const full = { ...wall, wallConstruction: construction, hasDoor: true, doorWidth: 3, doorHeight: 7, doorMaterial: 'Solid Core Wood' };
    const areas = getSurfaceAreas(full);
    assert.equal(areas.glassArea, 59);
    assert.equal(areas.doorArea, 21);
    assert.equal(areas.opaqueArea, 0);
    assert.equal(areas.glassArea + areas.doorArea + areas.opaqueArea, areas.totalArea);
    const result = calculateUSCSLoad([full], usage);
    assert.equal(result.breakdown.qGlass, Math.round(59 * 20 * factor * 0.9));
    assert.equal(result.breakdown.qDoors, 5040);
    assert.equal(result.breakdown.qWalls, 0);
  });
}

test('opaque walls subtract both legacy glazing and doors without double counting', () => {
  const surface = { ...wall, glassType: GlassType.DoublePane, glassWidth: 4, glassHeight: 5,
    hasDoor: true, doorWidth: 3, doorHeight: 7, doorMaterial: 'Solid Core Wood' };
  const result = calculateUSCSLoad([surface], usage);
  assert.equal(getSurfaceAreas(surface).opaqueArea, 39);
  assert.equal(result.breakdown.qWalls, Math.round(39 * 20 * 24 / 19 * 1.1));
  assert.equal(result.breakdown.qGlass, 6000);
  assert.equal(result.breakdown.qDoors, 5040);
});

test('oversized doors/openings are reported and all remaining areas stay nonnegative', () => {
  const oversized = { ...wall, hasDoor: true, doorWidth: 20, doorHeight: 8 };
  for (const surface of [oversized, { ...oversized, wallConstruction: WallConstruction.DoublePaneGlass },
    { ...wall, glassType: GlassType.SinglePane, glassWidth: 20, glassHeight: 8 },
    { ...wall, glassType: GlassType.SinglePane, glassWidth: 8, glassHeight: 8, hasDoor: true, doorWidth: 3, doorHeight: 7 }]) {
    const areas = getSurfaceAreas(surface);
    assert.match(areas.error, /door\/opening area exceeds/);
    assert.ok(areas.glassArea >= 0 && areas.doorArea >= 0 && areas.opaqueArea >= 0);
    assert.equal(areas.glassArea + areas.doorArea + areas.opaqueArea, 80);
    assert.ok(Object.values(calculateUSCSLoad([surface], usage).breakdown).every(value => value >= 0));
  }
});

test('full-glass construction ignores retained legacy opening dimensions', () => {
  const surface = { ...wall, wallConstruction: WallConstruction.DoublePaneGlass,
    glassType: GlassType.SinglePane, glassWidth: 100, glassHeight: 100 };
  assert.equal(getSurfaceAreas(surface).glassArea, 80);
  assert.equal(getSurfaceAreas(surface).error, '');
  assert.equal(getSurfaceAreas(surface).glassType, GlassType.DoublePane);
});

for (const value of ['', ' ', '-1', 'abc', 'NaN', 'Infinity', '1e309', '0x16']) {
  test(`lighting rejects ${JSON.stringify(value)} without a hidden 22 W fallback`, () => {
    assert.equal(parseLightingWatts(value), null);
    assert.match(validateLightingWatts(value), /0 or a positive number/);
  });
}
for (const value of ['0', '22', '10.5']) {
  test(`explicit lighting ${value} W is accepted with the existing load formula`, () => {
    assert.equal(validateLightingWatts(value), '');
    assert.equal(parseLightingWatts(value), Number(value));
    assert.equal(calculateUSCSLoad([wall], { ...usage, ledWatts: parseLightingWatts(value) }).breakdown.qLighting,
      Math.round(Number(value) * 3.412 * 5));
  });
}

test('Stage 1 geometry and door baseline remain exact at explicit 0, 20, and 22 W', () => {
  const fixture = doorBaseline();
  const surfaces = deriveRoomSurfaces(fixture.settings, fixture.room);
  assert.deepEqual(surfaces.map(s => s.width * s.height), [80, 80, 80, 80, 100, 100]);
  for (const [ledWatts, expected] of [[0, 1257], [20, 1283], [22, 1285]]) {
    const result = calculateUSCSLoad(surfaces, { ...fixture.usage, ledWatts });
    assert.equal(result.totalBtuLoad, expected);
    assert.equal(result.breakdown.qDoors, 5040);
    assert.equal(result.breakdown.qWalls, 8309);
    assert.equal(result.volume, 800);
    assert.equal(result.breakdown.qAir, 1152); // 800 × 20 × 0.072, or 72 BTU/h before safety.
  }
});

test('standard regression matches every live Analysis category at 0 and 22 W', () => {
  for (const expected of standardCases) {
    const fixture = doorBaseline(expected.watts);
    const result = calculateUSCSLoad(deriveRoomSurfaces(fixture.settings, fixture.room), fixture.usage);
    assert.deepEqual(result, {
      totalBtuLoad: expected.total, volume: 800,
      breakdown: { qWalls: 8309, qCeiling: 1760, qFloor: 500, qGlass: 0, qDoors: 5040,
        qSun: 0, qPeople: 0, qLighting: expected.lightingDaily, qAir: 1152,
        qExtra: 0, qSafety: expected.safetyDaily },
    });
    assert.equal(Math.round((result.breakdown.qWalls + result.breakdown.qCeiling) / 16), 629);
    assert.equal(Math.round(result.breakdown.qDoors / 16), 315);
    assert.equal(Math.round(result.breakdown.qAir / 16), 72);
    assert.equal(Math.round(result.breakdown.qLighting / 16), expected.internalDisplay);
    assert.equal(Math.round(result.breakdown.qSafety / 16), expected.safetyDisplay);
  }
});

test('vaulted 8/10 ft average height reproduces the old 81 infiltration and 1268/1296 references', () => {
  for (const [watts, total] of [[0, 1268], [22, 1296]]) {
    const fixture = doorBaseline(watts);
    fixture.settings[4].isVaulted = true; // The sole changed input: average height becomes 9 ft.
    const result = calculateUSCSLoad(deriveRoomSurfaces(fixture.settings, fixture.room), fixture.usage);
    assert.equal(result.volume, 900);
    assert.equal(result.breakdown.qAir, 1296); // 900 × 20 × 0.072 = 81 × 16.
    assert.equal(result.totalBtuLoad, total);
    assert.equal(result.breakdown.qWalls, 8309);
    assert.equal(result.breakdown.qCeiling, 1760);
  }
});

test('frequent door opening on produces 90 infiltration, so it cannot explain 81', () => {
  const fixture = doorBaseline();
  fixture.usage.frequentDoorOpening = true;
  const result = calculateUSCSLoad(deriveRoomSurfaces(fixture.settings, fixture.room), fixture.usage);
  assert.equal(result.volume, 800);
  assert.equal(result.breakdown.qAir / 16, 90);
});
