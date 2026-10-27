// Keep blank/invalid separate from an explicitly entered zero.
export const parseLightingWatts = (input: string): number | null => {
  const value = input.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return null;
  const watts = Number(value);
  return Number.isFinite(watts) && watts >= 0 ? watts : null;
};

export const validateLightingWatts = (input: string): string =>
  parseLightingWatts(input) === null
    ? 'Enter total installed lighting wattage as 0 or a positive number. Enter 0 if there is no installed lighting.' : '';
