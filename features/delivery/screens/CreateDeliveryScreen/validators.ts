// ==================== VALIDATORS ====================

export const MAX_WEIGHT_KG: Record<string, number> = {
  Small: 0.5,
  Medium: 1.5,
  Large: 3,
  XL: 5,
};

/**
 * Validates package weight against the selected size limit.
 * @param value - The weight string entered by the user
 * @param packageSize - The currently selected package size
 */
export function validateWeight(value: string, packageSize: string): true | string {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return "Enter a valid weight greater than 0";
  const max = MAX_WEIGHT_KG[packageSize];
  if (max !== undefined && num > max)
    return `${num} kg exceeds the ${max} kg limit for ${packageSize} packages`;
  return true;
}

/**
 * Validates that the pickup date is not in the past.
 * @param value - ISO date string selected by the user
 */
export function validatePickupDate(value: string): true | string {
  const selected = new Date(value);
  const today = new Date();
  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (selected < today) return "Pickup date cannot be in the past";
  return true;
}

/**
 * Validates that the pickup time is in the future when the date is today.
 * @param value - Time string (e.g. "10:30 AM")
 * @param pickupDate - The currently selected pickup date string
 */
export function validatePickupTime(value: string, pickupDate: string): true | string {
  if (!pickupDate) return true;

  const selected = new Date(pickupDate);
  const today = new Date();
  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (selected.getTime() !== today.getTime()) return true;

  const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return true;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const isPm = match[3].toUpperCase() === "PM";
  if (isPm && hours !== 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;

  const now = new Date();
  const pickedTime = new Date();
  pickedTime.setHours(hours, minutes, 0, 0);

  if (pickedTime <= now) return "Pickup time must be later than the current time";
  return true;
}
