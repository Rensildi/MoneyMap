export function formatMoney(cents: number) {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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