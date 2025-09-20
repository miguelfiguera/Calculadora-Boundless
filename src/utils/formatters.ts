export const formatDecimal = (value: number, maxDecimals: number = 3): string => {
  const factor = Math.pow(10, maxDecimals);
  const truncated = Math.floor(value * factor) / factor;
  return truncated.toString();
};

export const formatCurrency = (value: number): string => {
  return `$${formatDecimal(value, 2)}`;
};

export const parseNumericInput = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};