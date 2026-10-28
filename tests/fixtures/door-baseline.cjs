// Explicit inputs for the standard-room regression, shared with the UI test.
// Vapor barrier is a UI gate, not an argument to calculateUSCSLoad.
const doorBaseline = (ledWatts = 0) => ({
  vaporBarrier: 'Yes',
  room: { width: '10', depth: '10', height: '8' },
  settings: ['Wall', 'Wall', 'Wall', 'Wall', 'Ceiling', 'Floor'].map((type, index) => ({
    id: String(index + 1), name: index < 4 ? `Wall ${index + 1}` : type, type,
    rValue: index < 4 ? 19 : index === 4 ? 30 : 0,
    wallConstruction: 'Opaque', isExterior: false, sunExposed: false,
    glassType: 'No Glass', glassWidth: 0, glassHeight: 0,
    hasDoor: index === 0, doorWidth: 3, doorHeight: 7, doorMaterial: 'Solid Core Wood',
    isVaulted: false, minHeight: 8, maxHeight: 10, isRadiantFloor: false,
  })),
  usage: {
    ambientTemp: 75, outdoorTemp: 95, targetTemp: 55, frequentDoorOpening: false,
    ledWatts, ledHours: 5, incandescentWatts: 0, incandescentHours: 0,
    peopleCount: 0, peopleHours: 0, applianceWatts: 0, applianceHours: 0,
    equipmentWatts: 0, equipmentHours: 0,
  },
});

const standardCases = [
  { watts: 0, total: 1257, lightingDaily: 0, safetyDaily: 3352, internalDisplay: 0, safetyDisplay: 210 },
  { watts: 22, total: 1285, lightingDaily: 375, safetyDaily: 3427, internalDisplay: 23, safetyDisplay: 214 },
];

module.exports = { doorBaseline, standardCases };
