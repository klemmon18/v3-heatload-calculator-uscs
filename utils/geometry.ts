import type { RoomDimensionInputs, SurfaceInput, SurfaceSettings } from '../types';

const dimensionNames = ['width', 'depth', 'height'] as const;

const positiveDimension = (input: string): number => {
  const value = input.trim();
  // Reject non-numeric strings and non-finite values rather than coercing them.
  if (!/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return 0;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export const validateRoomDimensions = (inputs: RoomDimensionInputs) =>
  Object.fromEntries(dimensionNames.map(field => [
    field,
    positiveDimension(inputs[field]) ? '' : `Enter a valid ${field} greater than 0 ft.`,
  ])) as Record<keyof RoomDimensionInputs, string>;

export const deriveRoomSurfaces = (
  settings: SurfaceSettings[],
  inputs: RoomDimensionInputs,
): SurfaceInput[] => {
  const width = positiveDimension(inputs.width);
  const depth = positiveDimension(inputs.depth);
  const height = positiveDimension(inputs.height);
  let wallIndex = 0;
  return settings.map(surface => {
    if (surface.type === 'Wall') {
      return { ...surface, width: wallIndex++ % 2 === 0 ? width : depth, height };
    }
    // The existing vaulted workflow uses this footprint and its own min/max
    // heights for average room height; do not change its load formulas here.
    return { ...surface, width, height: depth };
  });
};
