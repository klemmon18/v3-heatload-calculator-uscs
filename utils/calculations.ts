import { SurfaceInput, UsageFactors, CalculationResult, GlassType, InsulationRValue } from '../types';

export const calculateUSCSLoad = (
  surfaces: SurfaceInput[],
  usage: UsageFactors
): CalculationResult => {
  const deltaT_Interior = Math.max(0, usage.ambientTemp - usage.targetTemp);
  const deltaT_Outdoor = Math.max(0, usage.outdoorTemp - usage.targetTemp);
  
  // All loads below are in BTU per DAY
  let qWalls_day = 0;
  let qCeiling_day = 0;
  let qFloor_day = 0;
  let qGlass_day = 0;
  let qSun_day = 0;

  // Track total wall and glass area for glass dampening
  let totalWallArea = 0;
  let totalGlassArea = 0;

  // Find ceiling details for volume calculation
  const ceiling = surfaces.find(s => s.type === 'Ceiling');
  const floor = surfaces.find(s => s.type === 'Floor');
  const wall = surfaces.find(s => s.type === 'Wall');
  
  // Calculate Average Height based on Vaulted setting
  let effectiveRoomHeight = wall?.height || 8;
  if (ceiling?.isVaulted) {
    const minH = ceiling.minHeight || 8;
    const maxH = ceiling.maxHeight || 8;
    effectiveRoomHeight = (minH + maxH) / 2;
  }

  // 1. Envelope and Glass Calculations (BTU/day)
  const FACTOR_GLASS_SINGLE = 28.0;
  const FACTOR_GLASS_DOUBLE = 15.0;
  const FACTOR_FLOOR_BASE = 0.25;
  const FACTOR_AIR_BASE = 0.072;
  const COMPRESSOR_RUNTIME = 16;

  surfaces.forEach(s => {
    const deltaT = s.isExterior ? deltaT_Outdoor : deltaT_Interior;
    const totalArea = s.width * s.height;
    
    const computedGlassArea = (s.glassWidth || 0) * (s.glassHeight || 0);
    const actualGlassArea = s.glassType === GlassType.None ? 0 : Math.min(totalArea, computedGlassArea);
    const wallArea = Math.max(0, totalArea - actualGlassArea);

    // Track wall and glass area for wall surfaces only
    if (s.type === 'Wall') {
      totalWallArea += totalArea;
      totalGlassArea += actualGlassArea;
    }

    let conductionDay = 0;
    
    if (s.type === 'Floor') {
      // Floor Model: Area * DeltaT * Baseline * InsulationModifier * RadiantModifier
      const insulationModifier = 11 / (11 + s.rValue);
      const radiantModifier = s.isRadiantFloor ? 1.5 : 1.0;
      conductionDay = (totalArea * deltaT * FACTOR_FLOOR_BASE) * insulationModifier * radiantModifier;
      qFloor_day += conductionDay;
    } else {
      // Pure Conduction Model for Walls/Ceiling with modest framing/bridging adjustment
      const effectiveR = Math.max(1, s.rValue || 1); // Fallback to R1 for uninsulated to avoid div by zero
      conductionDay = ((wallArea * deltaT * 24) / effectiveR) * 1.10;
      
      if (s.type === 'Wall') qWalls_day += conductionDay;
      else if (s.type === 'Ceiling') qCeiling_day += conductionDay;
    }

    if (s.glassType !== GlassType.None) {
      const factor = s.glassType === GlassType.DoublePane ? FACTOR_GLASS_DOUBLE : FACTOR_GLASS_SINGLE;
      const glassConductionDay = actualGlassArea * deltaT * factor;
      qGlass_day += glassConductionDay;
    }

    if (s.isExterior && s.sunExposed) {
      qSun_day += conductionDay * 0.25;
    }
  });

  // Glass dampener for extreme glass-heavy rooms
  const glassRatio = totalWallArea > 0 ? totalGlassArea / totalWallArea : 0;

  let glassDampener = 1.0;
  if (glassRatio > 0.75) glassDampener = 0.80;
  else if (glassRatio > 0.50) glassDampener = 0.90;

  qGlass_day = qGlass_day * glassDampener;

  // 2. Occupancy Load (BTU/day)
  const qPeople_day = usage.peopleCount * 500 * usage.peopleHours;

  // 3. Appliances & Lighting (BTU/day)
  const qLighting_day =
    (usage.ledWatts * 3.412 * usage.ledHours) +
    (usage.incandescentWatts * 3.412 * usage.incandescentHours);
  
  // Qextra corresponds to "other loads" in thermal benchmarks
  const qAppliances_day = usage.applianceWatts * 3.412 * usage.applianceHours;
  const qEquipment_day = (usage.equipmentWatts || 0) * 3.412 * (usage.equipmentHours || 0);
  const qExtra_day = qAppliances_day + qEquipment_day;

  // 4. Infiltration & Latent Load (Qair_day)
  // Air Model: Volume * DeltaT * Baseline * DoorModifier
  const floorArea = floor ? floor.width * floor.height : (ceiling ? ceiling.width * ceiling.height : 0);
  const volume = floorArea * effectiveRoomHeight;
  const doorModifier = usage.frequentDoorOpening ? 1.25 : 1.0;
  const qAir_day = (volume * deltaT_Interior * FACTOR_AIR_BASE) * doorModifier;

  // 5. Daily Total
  let qSubtotal_day = qWalls_day + qCeiling_day + qFloor_day + qGlass_day + qSun_day + qPeople_day + qLighting_day + qAir_day + qExtra_day;

  // Minimum baseline load floor for very small rooms
  const minimumDailyLoad = volume * 20;
  qSubtotal_day = Math.max(qSubtotal_day, minimumDailyLoad);
  
  // 6. Safety Factor (20%)
  const qSafety_day = qSubtotal_day * 0.20;
  
  const totalDailyBtu = qSubtotal_day + qSafety_day;
  
  // 7. Final Sizing (BTU/hr = TotalDailyBTU / 16)
  const totalBtuLoad = Math.round(totalDailyBtu / COMPRESSOR_RUNTIME);

  return {
    totalBtuLoad,
    breakdown: {
      qWalls: Math.round(qWalls_day),
      qCeiling: Math.round(qCeiling_day),
      qFloor: Math.round(qFloor_day),
      qGlass: Math.round(qGlass_day),
      qSun: Math.round(qSun_day),
      qPeople: Math.round(qPeople_day),
      qAppliances: Math.round(qAppliances_day),
      qLighting: Math.round(qLighting_day),
      qAir: Math.round(qAir_day),
      qExtra: Math.round(qExtra_day),
      qSafety: Math.round(qSafety_day)
    },
    volume: Math.round(volume)
  };
};
