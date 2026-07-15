import { SurfaceInput, UsageFactors, CalculationResult, GlassType, DoorMaterial } from '../types';

export const calculateUSCSLoad = (
  surfaces: SurfaceInput[],
  usage: UsageFactors
): CalculationResult => {

  const deltaT_Interior = Math.max(0, usage.ambientTemp - usage.targetTemp);
  const deltaT_Outdoor = Math.max(0, usage.outdoorTemp - usage.targetTemp);

  // === LOAD BUCKETS (BTU/day) ===
  let qWalls_day = 0;
  let qCeiling_day = 0;
  let qFloor_day = 0;
  let qGlass_day = 0;
  let qDoors_day = 0;
  let qSun_day = 0;

  // Track for glass dampening
  let totalWallArea = 0;
  let totalGlassArea = 0;

  // === CONSTANTS ===
  const FACTOR_GLASS_SINGLE = 28.0;
  const FACTOR_GLASS_DOUBLE = 15.0;

  // Door factors are daily conduction factors (approximately 24 × U-value).
  const FACTOR_DOOR_HOLLOW_CORE = 18.0;
  const FACTOR_DOOR_SOLID_CORE = 12.0;
  const FACTOR_DOOR_INSULATED = 7.0;
  const FACTOR_DOOR_GLASS_SINGLE = FACTOR_GLASS_SINGLE;
  const FACTOR_DOOR_GLASS_DOUBLE = FACTOR_GLASS_DOUBLE;
  const FACTOR_FLOOR = 0.25;
  const FACTOR_AIR = 0.072;
  const COMPRESSOR_RUNTIME = 16;

  // === FIND FLOOR + CEILING FOR DIMENSIONS ===
  const floor = surfaces.find(s => s.type === 'Floor');
  const ceiling = surfaces.find(s => s.type === 'Ceiling');
  const wall = surfaces.find(s => s.type === 'Wall');

  let effectiveRoomHeight = wall?.height || 8;

  if (ceiling?.isVaulted) {
    const minH = ceiling.minHeight || effectiveRoomHeight;
    const maxH = ceiling.maxHeight || effectiveRoomHeight;
    effectiveRoomHeight = (minH + maxH) / 2;
  }

  const floorArea = floor
    ? floor.width * floor.height
    : (ceiling ? ceiling.width * ceiling.height : 0);

  const volume = floorArea * effectiveRoomHeight;

  // === SURFACE LOOP ===
  surfaces.forEach(s => {
    const deltaT = s.isExterior ? deltaT_Outdoor : deltaT_Interior;

    const totalArea = s.width * s.height;

    const computedGlassArea = (s.glassWidth || 0) * (s.glassHeight || 0);
    const actualGlassArea =
      s.glassType === GlassType.None ? 0 : Math.min(totalArea, computedGlassArea);

    // Doors are wall-specific. Cap door area to the remaining wall area
    // after glass so openings can never exceed the wall surface.
    const computedDoorArea =
      s.type === 'Wall' && s.hasDoor
        ? (s.doorWidth || 0) * (s.doorHeight || 0)
        : 0;

    const availableAreaAfterGlass = Math.max(0, totalArea - actualGlassArea);
    const actualDoorArea = Math.min(availableAreaAfterGlass, computedDoorArea);

    const wallArea = Math.max(0, totalArea - actualGlassArea - actualDoorArea);

    // Track totals for dampener
    if (s.type === 'Wall') {
      totalWallArea += totalArea;
      totalGlassArea += actualGlassArea;
    }

    // === FLOOR ===
    if (s.type === 'Floor') {
      const insulationModifier = 11 / (11 + s.rValue);
      const radiantModifier = s.isRadiantFloor ? 1.5 : 1.0;

      const qFloor = totalArea * deltaT * FACTOR_FLOOR * insulationModifier * radiantModifier;
      qFloor_day += qFloor;
      return;
    }

    // === WALL / CEILING ===
    const effectiveR = Math.max(1, s.rValue || 1);

    const conduction = ((wallArea * deltaT * 24) / effectiveR) * 1.10;

    if (s.type === 'Wall') qWalls_day += conduction;
    if (s.type === 'Ceiling') qCeiling_day += conduction;

    // === GLASS ===
    if (s.glassType !== GlassType.None) {
      const factor =
        s.glassType === GlassType.DoublePane
          ? FACTOR_GLASS_DOUBLE
          : FACTOR_GLASS_SINGLE;

      qGlass_day += actualGlassArea * deltaT * factor;
    }

    // === DOORS ===
    if (s.type === 'Wall' && s.hasDoor && actualDoorArea > 0) {
      let doorFactor = FACTOR_DOOR_SOLID_CORE;

      switch (s.doorMaterial) {
        case DoorMaterial.HollowCore:
          doorFactor = FACTOR_DOOR_HOLLOW_CORE;
          break;
        case DoorMaterial.Insulated:
          doorFactor = FACTOR_DOOR_INSULATED;
          break;
        case DoorMaterial.GlassSinglePane:
          doorFactor = FACTOR_DOOR_GLASS_SINGLE;
          break;
        case DoorMaterial.GlassDoublePane:
          doorFactor = FACTOR_DOOR_GLASS_DOUBLE;
          break;
        case DoorMaterial.SolidCore:
        default:
          doorFactor = FACTOR_DOOR_SOLID_CORE;
          break;
      }

      qDoors_day += actualDoorArea * deltaT * doorFactor;
    }

    // === SUN LOAD ===
    if (s.isExterior && s.sunExposed) {
      qSun_day += conduction * 0.25;
    }
  });

  // === GLASS DAMPENER ===
  const glassRatio = totalWallArea > 0 ? totalGlassArea / totalWallArea : 0;

  let glassDampener = 1.0;
  if (glassRatio > 0.75) glassDampener = 0.80;
  else if (glassRatio > 0.50) glassDampener = 0.90;

  qGlass_day *= glassDampener;

  // === INTERNAL LOADS ===
  const qPeople_day = usage.peopleCount * 500 * usage.peopleHours;

  const qLighting_day =
    (usage.ledWatts * 3.412 * usage.ledHours) +
    (usage.incandescentWatts * 3.412 * usage.incandescentHours);

  const qExtra_day =
    (usage.applianceWatts * 3.412 * usage.applianceHours) +
    ((usage.equipmentWatts || 0) * 3.412 * (usage.equipmentHours || 0));

  // === AIR LOAD ===
  const doorModifier = usage.frequentDoorOpening ? 1.25 : 1.0;
  const qAir_day = volume * deltaT_Interior * FACTOR_AIR * doorModifier;

  // === SUBTOTAL ===
  let qSubtotal_day =
    qWalls_day +
    qCeiling_day +
    qFloor_day +
    qGlass_day +
    qDoors_day +
    qSun_day +
    qPeople_day +
    qLighting_day +
    qAir_day +
    qExtra_day;

  // === SMALL ROOM FIX (Test #5) ===
  if (volume < 150) {
    const minimumDailyLoad = volume * 450;
    qSubtotal_day = Math.max(qSubtotal_day, minimumDailyLoad);
  }

  // === SAFETY ===
  const qSafety_day = qSubtotal_day * 0.20;

  const totalDaily = qSubtotal_day + qSafety_day;

  // === FINAL OUTPUT ===
  const totalBtuLoad = Math.round(totalDaily / COMPRESSOR_RUNTIME);

  return {
    totalBtuLoad,
    breakdown: {
      qWalls: Math.round(qWalls_day),
      qCeiling: Math.round(qCeiling_day),
      qFloor: Math.round(qFloor_day),
      qGlass: Math.round(qGlass_day),
      qDoors: Math.round(qDoors_day),
      qSun: Math.round(qSun_day),
      qPeople: Math.round(qPeople_day),
      qLighting: Math.round(qLighting_day),
      qAir: Math.round(qAir_day),
      qExtra: Math.round(qExtra_day),
      qSafety: Math.round(qSafety_day)
    },
    volume: Math.round(volume)
  };
};
