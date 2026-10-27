import { GlassType, WallConstruction } from '../types';
import type { SurfaceInput } from '../types';

export const fullWallGlassType = (surface: SurfaceInput): GlassType => {
  if (surface.type !== 'Wall') return GlassType.None;
  if (surface.wallConstruction === WallConstruction.SinglePaneGlass) return GlassType.SinglePane;
  if (surface.wallConstruction === WallConstruction.DoublePaneGlass) return GlassType.DoublePane;
  return GlassType.None;
};

// One allocation shared by the live UI's validation and the load calculation.
// Invalid oversized openings are reported; capped areas also keep loads safe.
export const getSurfaceAreas = (surface: SurfaceInput) => {
  const totalArea = Math.max(0, surface.width * surface.height);
  const fullGlassType = fullWallGlassType(surface);
  const isFullGlass = fullGlassType !== GlassType.None;
  const requestedDoorArea = surface.type === 'Wall' && surface.hasDoor
    ? Math.max(0, surface.doorWidth || 0) * Math.max(0, surface.doorHeight || 0) : 0;
  const requestedOpeningArea = !isFullGlass && surface.glassType !== GlassType.None
    ? Math.max(0, surface.glassWidth || 0) * Math.max(0, surface.glassHeight || 0) : 0;
  const openingArea = Math.min(totalArea, requestedOpeningArea);
  const doorArea = Math.min(Math.max(0, totalArea - openingArea), requestedDoorArea);
  const glassArea = isFullGlass ? Math.max(0, totalArea - doorArea) : openingArea;
  const opaqueArea = Math.max(0, totalArea - glassArea - doorArea);
  return {
    totalArea, doorArea, glassArea, opaqueArea,
    glassType: isFullGlass ? fullGlassType : surface.glassType,
    error: requestedDoorArea + requestedOpeningArea > totalArea
      ? `${surface.name}: door/opening area exceeds the derived surface area (${totalArea} sq ft). Reduce the openings or correct the room dimensions.` : '',
  };
};
