export const safeParseInt = (value: string, fallback: number = 0): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const safeParseFloat = (value: string, fallback: number = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const safeParseNumber = (value: string | number, fallback: number = 0): number => {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};
