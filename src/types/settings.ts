export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "ALL";

export type ThemePreference = "light" | "dark" | "system";

export type AppSettings = {
  fullName: string;
  email: string;
  currency: CurrencyCode;
  defaultFreeSpendingLimitCents: number;
  theme: ThemePreference;
  billRemindersEnabled: boolean;
  budgetWarningsEnabled: boolean;
  goalRemindersEnabled: boolean;
};