/**
 * NGN amounts are always held as integer kobo (1 naira = 100 kobo).
 * Never use floating point for stored amounts.
 */

const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(kobo: number): string {
  if (!Number.isSafeInteger(kobo)) throw new RangeError("Amount must be an integer number of kobo");
  // Integer split avoids float rounding on large values.
  const sign = kobo < 0 ? "-" : "";
  const abs = Math.abs(kobo);
  return sign + formatter.format(Math.trunc(abs / 100) + (abs % 100) / 100);
}

/**
 * Parse a naira amount typed by staff ("150000", "150,000.50", "₦150,000")
 * into kobo. Returns null for anything ambiguous.
 */
export function parseNairaToKobo(input: string): number | null {
  const cleaned = input.trim().replace(/[₦,\s]/g, "").replace(/^NGN/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const kobo = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(kobo) ? kobo : null;
}

export function koboToNairaInput(kobo: number | null | undefined): string {
  if (kobo == null) return "";
  const whole = Math.trunc(kobo / 100);
  const fraction = kobo % 100;
  return fraction ? `${whole}.${String(fraction).padStart(2, "0")}` : String(whole);
}
