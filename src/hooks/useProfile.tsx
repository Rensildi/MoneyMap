import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import {
  fetchProfileSettings,
  updateProfileSettings,
} from "../services/profileService";
import type { AppSettings } from "../types/settings";

const fallbackSettings: AppSettings = {
  fullName: "",
  email: "",
  currency: "USD",
  defaultFreeSpendingLimitCents: 40000,
  theme: "light",
  billRemindersEnabled: true,
  budgetWarningsEnabled: true,
  goalRemindersEnabled: false,
};

type ProfileContextValue = {
  settings: AppSettings;
  loading: boolean;
  error: string;
  refreshProfile: () => Promise<void>;
  saveProfile: (settings: AppSettings) => Promise<AppSettings>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined,
);

type ProfileProviderProps = {
  children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();

  const [settings, setSettings] = useState<AppSettings>(fallbackSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setSettings(fallbackSettings);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const savedSettings = await fetchProfileSettings(user.id, user.email);
      setSettings(savedSettings);
    } catch (profileError) {
      if (profileError instanceof Error) {
        setError(profileError.message);
      } else {
        setError("Could not load profile settings.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const saveProfile = useCallback(
    async (nextSettings: AppSettings) => {
      if (!user) {
        throw new Error("You must be signed in to save settings.");
      }

      const savedSettings = await updateProfileSettings(user.id, nextSettings);
      setSettings(savedSettings);
      return savedSettings;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      refreshProfile,
      saveProfile,
    }),
    [settings, loading, error, refreshProfile, saveProfile],
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider.");
  }

  return context;
}