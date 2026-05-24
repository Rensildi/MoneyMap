import type { CurrencyCode } from "../types/settings";

export function formatMoney(cents: number, currency: CurrencyCode = "USD") {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(dollars);
}

export function dollarsToCents(value: string) {
  const cleanValue = value.replace(/[^0-9.-]/g, "");
  const numberValue = Number(cleanValue);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.round(numberValue * 100);
}