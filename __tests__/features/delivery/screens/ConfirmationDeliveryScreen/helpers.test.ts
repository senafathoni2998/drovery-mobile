import {
  geocodeAddress,
  estimateDelivery,
  calcPrice,
  PACKAGE_LABELS,
  PACKAGE_ACCENT,
  NOMINATIM,
  HEADERS,
} from "@/features/delivery/screens/ConfirmationDeliveryScreen/helpers";

// ── geocodeAddress ────────────────────────────────────────────────────────────

describe("geocodeAddress", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns coordinates when API returns a result", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ lat: "-6.2088", lon: "106.8456" }],
    });

    const result = await geocodeAddress("Jakarta");

    expect(result).toEqual({ latitude: -6.2088, longitude: 106.8456 });
    expect(global.fetch).toHaveBeenCalledWith(
      `${NOMINATIM}/search?q=Jakarta&format=json&limit=1`,
      { headers: HEADERS },
    );
  });

  it("encodes special characters in address", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ lat: "1.0", lon: "2.0" }],
    });

    await geocodeAddress("Jl. Ahmad Yani & Sudirman");

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent("Jl. Ahmad Yani & Sudirman"));
  });

  it("returns null when API returns empty array", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    const result = await geocodeAddress("NonexistentPlace12345");
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const result = await geocodeAddress("Jakarta");
    expect(result).toBeNull();
  });
});

// ── estimateDelivery ──────────────────────────────────────────────────────────

describe("estimateDelivery", () => {
  it("adds 2 hours to AM time", () => {
    expect(estimateDelivery("2024-01-01", "10:30 AM")).toBe("12:30 PM");
  });

  it("adds 2 hours to PM time", () => {
    expect(estimateDelivery("2024-01-01", "02:00 PM")).toBe("04:00 PM");
  });

  it("handles crossing noon (AM to PM)", () => {
    expect(estimateDelivery("2024-01-01", "11:00 AM")).toBe("01:00 PM");
  });

  it("does not wrap midnight (h >= 24 edge case shows raw overflow)", () => {
    // 11 PM + 2h = 25h, function does not wrap; result is 13:00 PM (known limitation)
    expect(estimateDelivery("2024-01-01", "11:00 PM")).toBe("13:00 PM");
  });

  it("pads minutes with leading zero", () => {
    expect(estimateDelivery("2024-01-01", "09:05 AM")).toBe("11:05 AM");
  });

  it("returns original string when format does not match", () => {
    const invalid = "not-a-time";
    expect(estimateDelivery("2024-01-01", invalid)).toBe(invalid);
  });

  it("handles 12:00 PM (noon) correctly", () => {
    expect(estimateDelivery("2024-01-01", "12:00 PM")).toBe("02:00 PM");
  });

  it("handles 12:00 AM (midnight) correctly", () => {
    // 12 AM + 2h = 02 AM
    expect(estimateDelivery("2024-01-01", "12:00 AM")).toBe("02:00 AM");
  });
});

// ── calcPrice ─────────────────────────────────────────────────────────────────

describe("calcPrice", () => {
  it("calculates price for Small size with no weight", () => {
    expect(calcPrice("Small", "0")).toBe(5);
  });

  it("calculates price for Medium size with weight", () => {
    // base 8 + 1.5 * 3 = 12.5 → Math.round = 13
    expect(calcPrice("Medium", "1.5")).toBe(13);
  });

  it("calculates price for Large size with weight", () => {
    // base 12 + 2 * 3 = 18
    expect(calcPrice("Large", "2")).toBe(18);
  });

  it("calculates price for XL size", () => {
    // base 18 + 3 * 3 = 27
    expect(calcPrice("XL", "3")).toBe(27);
  });

  it("falls back to base 5 for unknown size", () => {
    expect(calcPrice("Unknown", "0")).toBe(5);
  });

  it("handles empty weight string as 0", () => {
    expect(calcPrice("Small", "")).toBe(5);
  });

  it("handles non-numeric weight string as 0", () => {
    expect(calcPrice("Small", "abc")).toBe(5);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe("PACKAGE_LABELS", () => {
  it("has all expected package types", () => {
    const expected = ["food", "document", "fragile", "electronics", "clothing", "healthcare", "other"];
    expected.forEach((type) => {
      expect(PACKAGE_LABELS[type]).toBeDefined();
    });
  });

  it("maps food to Food", () => {
    expect(PACKAGE_LABELS.food).toBe("Food");
  });
});

describe("PACKAGE_ACCENT", () => {
  it("has accent colors for all package types", () => {
    const expected = ["food", "document", "fragile", "electronics", "clothing", "healthcare", "other"];
    expected.forEach((type) => {
      expect(PACKAGE_ACCENT[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
