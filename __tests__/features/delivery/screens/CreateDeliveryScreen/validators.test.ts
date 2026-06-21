import {
  validateWeight,
  validatePickupDate,
  validatePickupTime,
  MAX_WEIGHT_KG,
} from "@/features/delivery/screens/CreateDeliveryScreen/validators";

// ── MAX_WEIGHT_KG ─────────────────────────────────────────────────────────────

describe("MAX_WEIGHT_KG", () => {
  it("defines limits for all four sizes", () => {
    expect(MAX_WEIGHT_KG.Small).toBe(0.5);
    expect(MAX_WEIGHT_KG.Medium).toBe(1.5);
    expect(MAX_WEIGHT_KG.Large).toBe(3);
    expect(MAX_WEIGHT_KG.XL).toBe(5);
  });
});

// ── validateWeight ────────────────────────────────────────────────────────────

describe("validateWeight", () => {
  it("returns true for valid weight within limit", () => {
    expect(validateWeight("0.3", "Small")).toBe(true);
    expect(validateWeight("1.5", "Medium")).toBe(true);
    expect(validateWeight("3", "Large")).toBe(true);
    expect(validateWeight("5", "XL")).toBe(true);
  });

  it("returns error for zero weight", () => {
    expect(validateWeight("0", "Small")).toBe(
      "Enter a valid weight greater than 0",
    );
  });

  it("returns error for negative weight", () => {
    expect(validateWeight("-1", "Small")).toBe(
      "Enter a valid weight greater than 0",
    );
  });

  it("returns error for non-numeric string", () => {
    expect(validateWeight("abc", "Small")).toBe(
      "Enter a valid weight greater than 0",
    );
  });

  it("returns error when weight exceeds Small limit", () => {
    const result = validateWeight("0.6", "Small");
    expect(result).toContain("0.5 kg limit for Small");
  });

  it("returns error when weight exceeds Medium limit", () => {
    const result = validateWeight("2", "Medium");
    expect(result).toContain("1.5 kg limit for Medium");
  });

  it("returns true at exact limit boundary", () => {
    expect(validateWeight("0.5", "Small")).toBe(true);
    expect(validateWeight("5", "XL")).toBe(true);
  });

  it("returns true when size has no defined limit", () => {
    expect(validateWeight("100", "Unknown")).toBe(true);
  });
});

// ── validatePickupDate ────────────────────────────────────────────────────────

describe("validatePickupDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns true for today's date", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupDate("2024-06-15")).toBe(true);
  });

  it("returns true for a future date", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupDate("2024-12-31")).toBe(true);
  });

  it("returns error for a past date", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupDate("2024-06-14")).toBe(
      "Pickup date cannot be in the past",
    );
  });

  it("returns error for a date from last year", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupDate("2023-01-01")).toBe(
      "Pickup date cannot be in the past",
    );
  });
});

// ── validatePickupTime ────────────────────────────────────────────────────────

describe("validatePickupTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns true when no pickupDate provided", () => {
    expect(validatePickupTime("10:00 AM", "")).toBe(true);
  });

  it("returns true when date is in the future (not today)", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupTime("08:00 AM", "2024-06-16")).toBe(true);
  });

  it("returns true when time is in the future on today", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupTime("11:00 AM", "2024-06-15")).toBe(true);
  });

  it("returns error when time is in the past on today", () => {
    jest.setSystemTime(new Date("2024-06-15T10:30:00"));
    expect(validatePickupTime("09:00 AM", "2024-06-15")).toBe(
      "Pickup time must be later than the current time",
    );
  });

  it("returns error when time equals current time", () => {
    jest.setSystemTime(new Date("2024-06-15T10:30:00"));
    expect(validatePickupTime("10:30 AM", "2024-06-15")).toBe(
      "Pickup time must be later than the current time",
    );
  });

  it("handles PM times correctly", () => {
    jest.setSystemTime(new Date("2024-06-15T13:00:00"));
    expect(validatePickupTime("02:00 PM", "2024-06-15")).toBe(true);
    expect(validatePickupTime("12:30 PM", "2024-06-15")).toBe(
      "Pickup time must be later than the current time",
    );
  });

  it("returns true when time format does not match", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    expect(validatePickupTime("invalid", "2024-06-15")).toBe(true);
  });
});
