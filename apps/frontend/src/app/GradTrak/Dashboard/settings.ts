import { useEffect, useMemo, useState } from "react";

export enum ShowSetting {
  units,
  grading,
  labels,
}

export type GradTrakSettings = {
  layout: "chart" | "grid";
  hideCompletedSemesters: boolean;
  hideSemesterStatus: boolean;
  show: Record<ShowSetting, boolean>;
};

export const GRADTRAK_SETTINGS_STORAGE_KEY = "gradtrak-settings";

export const defaultGradTrakSettings: GradTrakSettings = {
  layout: "chart",
  hideCompletedSemesters: false,
  hideSemesterStatus: false,
  show: {
    [ShowSetting.units]: true,
    [ShowSetting.grading]: true,
    [ShowSetting.labels]: true,
  },
};

export function loadGradTrakSettings(): GradTrakSettings {
  try {
    const raw = localStorage.getItem(GRADTRAK_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultGradTrakSettings;
    const parsed = JSON.parse(raw) as Partial<GradTrakSettings>;
    return { ...defaultGradTrakSettings, ...parsed };
  } catch {
    return defaultGradTrakSettings;
  }
}

export function saveGradTrakSettings(settings: GradTrakSettings) {
  try {
    localStorage.setItem(
      GRADTRAK_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // ignore
  }
}

export function useGradTrakSettings() {
  const [settings, setSettings] = useState<GradTrakSettings>(() =>
    loadGradTrakSettings()
  );

  useEffect(() => {
    saveGradTrakSettings(settings);
  }, [settings]);

  const updateSettings = useMemo(
    () =>
      (
        patch:
          | Partial<GradTrakSettings>
          | ((prev: GradTrakSettings) => GradTrakSettings)
      ) => {
        setSettings((prev) =>
          typeof patch === "function"
            ? (patch as (p: GradTrakSettings) => GradTrakSettings)(prev)
            : { ...prev, ...patch }
        );
      },
    []
  );

  return [settings, updateSettings] as const;
}
