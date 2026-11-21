export { cn } from "cn";

export function formatRupiahInput(rawDigits: string): string {
  if (!rawDigits) return "";
  const numeric = Number(rawDigits);
  if (Number.isNaN(numeric)) return "";
  return numeric.toLocaleString("id-ID");
}
