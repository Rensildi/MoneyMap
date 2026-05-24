import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Download,
  Moon,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { dollarsToCents, formatMoney } from "../lib/formatMoney";
import {
  defaultSettings,
  loadSettings,
  resetSettings,
  saveSettings,
} from "../lib/settingsStorage";
import type {
  AppSettings,
  CurrencyCode,
  ThemePreference,
} from "../types/settings";

const currencyOptions: {
  label: string;
  value: CurrencyCode;
  description: string;
}[] = [
  {
    label: "USD",
    value: "USD",
    description: "US Dollar",
  },
  {
    label: "EUR",
    value: "EUR",
    description: "Euro",
  },
  {
    label: "GBP",
    value: "GBP",
    description: "British Pound",
  },
  {
    label: "CAD",
    value: "CAD",
    description: "Canadian Dollar",
  },
  {
    label: "ALL",
    value: "ALL",
    description: "Albanian Lek",
  },
];

const themeOptions: {
  label: string;
  value: ThemePreference;
  description: string;
}[] = [
  {
    label: "Light",
    value: "light",
    description: "Clean bright interface",
  },
  {
    label: "Dark",
    value: "dark",
    description: "Darker evening-friendly interface",
  },
  {
    label: "System",
    value: "system",
    description: "Follow device preference",
  },
];

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [freeLimitInput, setFreeLimitInput] = useState(
    String(settings.defaultFreeSpendingLimitCents / 100),
  );
  const [savedMessage, setSavedMessage] = useState("");

  const previewAmount = useMemo(() => {
    return formatMoney(123456, settings.currency);
  }, [settings.currency]);

  useEffect(() => {
    setFreeLimitInput(String(settings.defaultFreeSpendingLimitCents / 100));
  }, [settings.defaultFreeSpendingLimitCents]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  function updateSetting<Key extends keyof AppSettings>(
    key: Key,
    value: AppSettings[Key],
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  }

  function handleSave() {
    const nextSettings: AppSettings = {
      ...settings,
      defaultFreeSpendingLimitCents: dollarsToCents(freeLimitInput),
    };

    setSettings(nextSettings);
    saveSettings(nextSettings);

    setSavedMessage("Settings saved locally.");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset settings back to defaults? This will only reset local preferences.",
    );

    if (!confirmed) {
      return;
    }

    resetSettings();
    setSettings(defaultSettings);
    setFreeLimitInput(String(defaultSettings.defaultFreeSpendingLimitCents / 100));
    setSavedMessage("Settings reset.");
  }

  function handleExportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "cashpilot-settings.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Settings</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            App preferences
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your profile, currency, default free spending limit, theme,
            and basic notification preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <Save size={18} />
          Save settings
        </button>
      </div>

      {savedMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savedMessage}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-5">
          <Card>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">Profile</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Personal information
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will later connect to your Supabase user profile.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full name
                </label>

                <input
                  value={settings.fullName}
                  onChange={(event) =>
                    updateSetting("fullName", event.target.value)
                  }
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  value={settings.email}
                  onChange={(event) =>
                    updateSetting("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Wallet size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Money Preferences
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Currency and spending defaults
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose your display currency and default free spending limit.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Currency
                </label>

                <select
                  value={settings.currency}
                  onChange={(event) =>
                    updateSetting("currency", event.target.value as CurrencyCode)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label} — {currency.description}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-400">
                  Preview: {previewAmount}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Default free spending limit
                </label>

                <input
                  value={freeLimitInput}
                  onChange={(event) => setFreeLimitInput(event.target.value)}
                  placeholder="Example: 400"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Current default:{" "}
                  {formatMoney(
                    dollarsToCents(freeLimitInput),
                    settings.currency,
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Settings size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Appearance
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Theme preference
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We are saving the preference now. In a later polish step, we
                  will apply dark classes across the whole app.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {themeOptions.map((theme) => {
                const isActive = settings.theme === theme.value;

                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => updateSetting("theme", theme.value)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {theme.value === "dark" ? (
                          <Moon size={19} />
                        ) : (
                          <Sun size={19} />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">{theme.label}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isActive ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Bell size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Notifications
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Reminder preferences
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  These toggles prepare the settings model. Actual push
                  notifications come later when we add PWA support.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <PreferenceToggle
                label="Bill reminders"
                description="Remind me when bills are coming due."
                checked={settings.billRemindersEnabled}
                onChange={(value) =>
                  updateSetting("billRemindersEnabled", value)
                }
              />

              <PreferenceToggle
                label="Budget warnings"
                description="Warn me when categories or free spending are close to the limit."
                checked={settings.budgetWarningsEnabled}
                onChange={(value) =>
                  updateSetting("budgetWarningsEnabled", value)
                }
              />

              <PreferenceToggle
                label="Goal reminders"
                description="Remind me to contribute toward savings or debt payoff goals."
                checked={settings.goalRemindersEnabled}
                onChange={(value) =>
                  updateSetting("goalRemindersEnabled", value)
                }
              />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={23} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
              Settings saved locally
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your preferences are currently saved in browser localStorage. When
              we add Supabase, these will move into a real profile table.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
              >
                <Save size={18} />
                Save settings
              </button>

              <button
                type="button"
                onClick={handleExportSettings}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <Download size={18} />
                Export settings JSON
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RotateCcw size={18} />
                Reset settings
              </button>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">
              Current settings preview
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800">
                  {settings.fullName || "Not set"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold text-slate-800">
                  {settings.currency}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Free limit</span>
                <span className="font-semibold text-slate-800">
                  {formatMoney(
                    dollarsToCents(freeLimitInput),
                    settings.currency,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Theme</span>
                <span className="font-semibold capitalize text-slate-800">
                  {settings.theme}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type PreferenceToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
    >
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <div
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "bg-slate-950" : "bg-slate-300"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}