import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type TempUnit = "celsius" | "fahrenheit";
export type ThemeMode = "dark" | "light";

export interface DashPrefs {
  showHumidity: boolean;
  showWindSpeed: boolean;
  showFeelsLike: boolean;
}

export interface Settings {
  tempUnit: TempUnit;
  theme: ThemeMode;
  defaultCity: string;
  dashPrefs: DashPrefs;
}

// ── localStorage keys ────────────────────────────────────────────────────────

const KEYS = {
  tempUnit: "ww_tempUnit",
  theme: "ww_theme",
  defaultCity: "ww_defaultCity",
  dashPrefs: "ww_dashPrefs",
} as const;

// ── Default values ────────────────────────────────────────────────────────────

const DEFAULTS: Settings = {
  tempUnit: "celsius",
  theme: "dark",
  defaultCity: "",
  dashPrefs: {
    showHumidity: true,
    showWindSpeed: true,
    showFeelsLike: true,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (e.g. private mode quota)
  }
}

/** Apply/remove the data-theme attribute on <html> and swap CSS vars */
export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSettings() {
  const [tempUnit, setTempUnitState] = useState<TempUnit>(() =>
    read(KEYS.tempUnit, DEFAULTS.tempUnit)
  );
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    read(KEYS.theme, DEFAULTS.theme)
  );
  const [defaultCity, setDefaultCityState] = useState<string>(() =>
    read(KEYS.defaultCity, DEFAULTS.defaultCity)
  );
  const [dashPrefs, setDashPrefsState] = useState<DashPrefs>(() =>
    read(KEYS.dashPrefs, DEFAULTS.dashPrefs)
  );

  // Apply theme on first render
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTempUnit = useCallback((unit: TempUnit) => {
    write(KEYS.tempUnit, unit);
    setTempUnitState(unit);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    write(KEYS.theme, t);
    applyTheme(t);
    setThemeState(t);
  }, []);

  const setDefaultCity = useCallback((city: string) => {
    write(KEYS.defaultCity, city);
    setDefaultCityState(city);
  }, []);

  const setDashPrefs = useCallback((prefs: DashPrefs) => {
    write(KEYS.dashPrefs, prefs);
    setDashPrefsState(prefs);
  }, []);

  return {
    tempUnit,
    theme,
    defaultCity,
    dashPrefs,
    setTempUnit,
    setTheme,
    setDefaultCity,
    setDashPrefs,
  };
}

// ── Static readers (used outside React — e.g. initial theme injection) ───────

export function readStoredTheme(): ThemeMode {
  return read(KEYS.theme, DEFAULTS.theme);
}

export function readStoredDefaultCity(): string {
  return read(KEYS.defaultCity, DEFAULTS.defaultCity);
}
