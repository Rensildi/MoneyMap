import type { AppSettings } from "../types/settings";

const SETTINGS_STORAGE_KEY = "cashpilot-settings";

export const defaultSettings: AppSettings = {
  fullName: "Rensildi",
  email: "rensildi@example.com",
  currency: "USD",
  defaultFreeSpendingLimitCents: 40000,
  theme: "light",
  billRemindersEnabled: true,
  budgetWarningsEnabled: true,
  goalRemindersEnabled: false,
};

export function loadSettings(): AppSettings {
  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(savedSettings),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}