import {
  calcBreakdownLocal,
  SIZE_BASE_FEE,
  TYPE_SURCHARGE,
  WEIGHT_RATE,
  BASE_FEE,
} from "@/features/delivery/screens/PriceEstimationScreen/pricing";
import type { PriceEstimationFormData } from "@/features/delivery/screens/PriceEstimationScreen/pricing";

const baseData: PriceEstimationFormData = {
  from: "Jakarta",
  to: "Bandung",
  packageSize: "Small",
  packageWeight: "0",
  packageTypes: [],
};

// ── Constants ─────────────────────────────────────────────────────────────────

describe("SIZE_BASE_FEE", () => {
  it("defines fees for all four sizes", () => {
    expect(SIZE_BASE_FEE.Small).toBe(3);
    expect(SIZE_BASE_FEE.Medium).toBe(6);
    expect(SIZE_BASE_FEE.Large).toBe(10);
    expect(SIZE_BASE_FEE.XL).toBe(16);
  });
});

describe("TYPE_SURCHARGE", () => {
  it("charges $2 for fragile and electronics", () => {
    expect(TYPE_SURCHARGE.fragile).toBe(2);
    expect(TYPE_SURCHARGE.electronics).toBe(2);
  });

  it("charges $1 for food and healthcare", () => {
    expect(TYPE_SURCHARGE.food).toBe(1);
    expect(TYPE_SURCHARGE.healthcare).toBe(1);
  });
});

describe("BASE_FEE and WEIGHT_RATE", () => {
  it("base fee is $2", () => {
    expect(BASE_FEE).toBe(2);
  });

  it("weight rate is $3 per kg", () => {
    expect(WEIGHT_RATE).toBe(3);
  });
});

// ── calcBreakdownLocal ────────────────────────────────────────────────────────

describe("calcBreakdownLocal", () => {
  it("calculates correct breakdown for Small with no weight and no types", () => {
    const result = calcBreakdownLocal({ ...baseData });
    expect(result).toEqual({
      baseFee: 2,
      sizeFee: 3,
      weightFee: 0,
      typeFee: 0,
      total: 5,
    });
  });

  it("calculates correct breakdown for Medium size", () => {
    const result = calcBreakdownLocal({ ...baseData, packageSize: "Medium" });
    expect(result.sizeFee).toBe(6);
    expect(result.total).toBe(2 + 6); // base + size
  });

  it("calculates correct breakdown for Large size", () => {
    const result = calcBreakdownLocal({ ...baseData, packageSize: "Large" });
    expect(result.sizeFee).toBe(10);
  });

  it("calculates correct breakdown for XL size", () => {
    const result = calcBreakdownLocal({ ...baseData, packageSize: "XL" });
    expect(result.sizeFee).toBe(16);
  });

  it("calculates weight fee correctly", () => {
    const result = calcBreakdownLocal({ ...baseData, packageWeight: "1" });
    expect(result.weightFee).toBe(3); // 1 kg * $3
  });

  it("rounds weight fee to 2 decimal places", () => {
    const result = calcBreakdownLocal({ ...baseData, packageWeight: "0.333" });
    expect(result.weightFee).toBe(1); // 0.333 * 3 = 0.999 → round → 1
  });

  it("calculates type surcharge for single surcharge type", () => {
    const result = calcBreakdownLocal({ ...baseData, packageTypes: ["fragile"] });
    expect(result.typeFee).toBe(2);
  });

  it("calculates type surcharge for multiple types", () => {
    const result = calcBreakdownLocal({
      ...baseData,
      packageTypes: ["fragile", "electronics"],
    });
    expect(result.typeFee).toBe(4);
  });

  it("adds no surcharge for types without a defined surcharge", () => {
    const result = calcBreakdownLocal({
      ...baseData,
      packageTypes: ["document", "clothing", "other"],
    });
    expect(result.typeFee).toBe(0);
  });

  it("calculates correct total combining all fees", () => {
    const result = calcBreakdownLocal({
      from: "A",
      to: "B",
      packageSize: "Medium",
      packageWeight: "1",
      packageTypes: ["fragile", "food"],
    });
    // base 2 + size 6 + weight 3 + type (2+1) = 14
    expect(result.total).toBe(14);
  });

  it("handles empty packageWeight string as 0", () => {
    const result = calcBreakdownLocal({ ...baseData, packageWeight: "" });
    expect(result.weightFee).toBe(0);
  });

  it("handles unknown package size with 0 size fee", () => {
    const result = calcBreakdownLocal({ ...baseData, packageSize: "Unknown" });
    expect(result.sizeFee).toBe(0);
    expect(result.total).toBe(2); // only base fee
  });

  it("always includes baseFee of $2", () => {
    const result = calcBreakdownLocal({ ...baseData });
    expect(result.baseFee).toBe(2);
  });
});
