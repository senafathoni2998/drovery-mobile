// ==================== PRICING HELPERS ====================

export const SIZE_BASE_FEE: Record<string, number> = {
  Small: 3,
  Medium: 6,
  Large: 10,
  XL: 16,
};

export const TYPE_SURCHARGE: Record<string, number> = {
  fragile: 2,
  electronics: 2,
  food: 1,
  healthcare: 1,
};

export const WEIGHT_RATE = 3; // $ per kg
export const BASE_FEE = 2;

export interface PriceBreakdown {
  baseFee: number;
  sizeFee: number;
  weightFee: number;
  typeFee: number;
  total: number;
}

export interface PriceEstimationFormData {
  from: string;
  to: string;
  packageSize: string;
  packageWeight: string;
  packageTypes: string[];
}

export function calcBreakdownLocal(data: PriceEstimationFormData): PriceBreakdown {
  const sizeFee = SIZE_BASE_FEE[data.packageSize] ?? 0;
  const kg = parseFloat(data.packageWeight) || 0;
  const weightFee = Math.round(kg * WEIGHT_RATE * 100) / 100;
  const typeFee = data.packageTypes.reduce(
    (sum, id) => sum + (TYPE_SURCHARGE[id] ?? 0),
    0,
  );
  const total = BASE_FEE + sizeFee + weightFee + typeFee;
  return { baseFee: BASE_FEE, sizeFee, weightFee, typeFee, total };
}
