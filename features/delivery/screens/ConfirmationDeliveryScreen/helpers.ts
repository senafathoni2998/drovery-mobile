// ==================== HELPERS ====================

export const NOMINATIM = "https://nominatim.openstreetmap.org";
export const HEADERS = { "User-Agent": "Drovery/1.0", "Accept-Language": "en" };

export interface Coord {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: string): Promise<Coord | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: HEADERS },
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch {}
  return null;
}

export function estimateDelivery(_dateStr: string, timeStr: string): string {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    h += 2;
    const newPeriod = h >= 12 ? "PM" : "AM";
    const dH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(dH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${newPeriod}`;
  } catch {
    return timeStr;
  }
}

export function calcPrice(size: string, weight: string): number {
  const base: Record<string, number> = {
    Small: 5,
    Medium: 8,
    Large: 12,
    XL: 18,
  };
  const kg = parseFloat(weight) || 0;
  return Math.round((base[size] ?? 5) + kg * 3);
}

export const PACKAGE_LABELS: Record<string, string> = {
  food: "Food",
  document: "Document",
  fragile: "Fragile",
  electronics: "Electronics",
  clothing: "Clothing",
  healthcare: "Healthcare",
  other: "Other",
};

export const PACKAGE_ACCENT: Record<string, string> = {
  food: "#F97316",
  document: "#3B82F6",
  fragile: "#8B5CF6",
  electronics: "#06B6D4",
  clothing: "#EC4899",
  healthcare: "#10B981",
  other: "#64748B",
};
