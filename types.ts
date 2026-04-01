
export enum InsulationRValue {
  None = 0,
  R11 = 11,
  R13 = 13,
  R19 = 19,
  R21 = 21,
  R30 = 30,
  R42 = 42
}

export enum GlassType {
  None = 'No Glass',
  SinglePane = 'Single Pane',
  DoublePane = 'Double Pane'
}

export type SurfaceType = 'Wall' | 'Ceiling' | 'Floor';

export interface SurfaceInput {
  id: string;
  name: string;
  type: SurfaceType;
  width: number;
  height: number;
  rValue: InsulationRValue;
  isExterior: boolean;
  sunExposed: boolean;
  glassWidth: number;
  glassHeight: number;
  glassType: GlassType;
  // Vaulted support
  isVaulted?: boolean;
  minHeight?: number;
  maxHeight?: number;
  // Floor specific
  isRadiantFloor?: boolean;
}

export interface UsageFactors {
  peopleCount: number;
  peopleHours: number;
  applianceWatts: number;
  applianceHours: number;
  ledWatts: number;
  ledHours: number;
  incandescentWatts: number;
  incandescentHours: number;
  ambientTemp: number; // Adjacent interior temp
  outdoorTemp: number; // Outdoor design temp
  targetTemp: number;
  frequentDoorOpening?: boolean;
  equipmentWatts?: number;
  equipmentHours?: number;
}

export interface Product {
  id: string;
  name: string;
  series: string;
  btuCapacity: number;
  description: string;
  imageUrl: string;
  link: string;
}

export interface CalculationResult {
  totalBtuLoad: number;
  breakdown: {
    qWalls: number;
    qCeiling: number;
    qFloor: number;
    qGlass: number;
    qSun: number;
    qPeople: number;
    qAppliances: number;
    qLighting: number;
    qAir: number;
    qExtra: number;
    qSafety: number;
  };
  volume: number;
}
