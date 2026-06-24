import React, { useState } from "react";
import {
  Thermometer,
  Sun,
  Moon,
  MapPin,
  LayoutDashboard,
  Info,
  Check,
  Save,
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import type { TempUnit, ThemeMode, DashPrefs } from "../hooks/useSettings";

// ── Section wrapper card ──────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <div className="bg-bg-card border border-brand-border rounded-xl overflow-hidden">
    {/* Card header */}
    <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-border">
      <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
        {React.cloneElement(icon, { className: "w-4 h-4 text-brand-accent" })}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
    {/* Card body */}
    <div className="px-5 py-4">{children}</div>
  </div>
);

// ── Segmented button (for temp unit + theme) ──────────────────────────────────

interface SegmentOption<T> {
  value: T;
  label: string;
  icon?: React.ReactElement;
}

interface SegmentedButtonProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

function SegmentedButton<T extends string>({
  options,
  value,
  onChange,
}: SegmentedButtonProps<T>) {
  return (
    <div className="inline-flex rounded-xl border border-brand-border bg-bg-main overflow-hidden">
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none",
              i > 0 ? "border-l border-brand-border" : "",
              active
                ? "bg-brand-accent text-bg-main"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
            ].join(" ")}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={[
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
      "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-bg-card",
      checked ? "bg-brand-accent" : "bg-brand-border",
    ].join(" ")}
  >
    <span
      className={[
        "pointer-events-none inline-block h-5 w-5 rounded-full bg-bg-main shadow-sm",
        "transition-transform duration-200",
        checked ? "translate-x-5" : "translate-x-0",
      ].join(" ")}
    />
  </button>
);

// ── Toggle row (label + optional sub-label + toggle) ─────────────────────────

interface ToggleRowProps {
  id: string;
  label: string;
  subLabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  id,
  label,
  subLabel,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-brand-border last:border-0">
    <label htmlFor={id} className="cursor-pointer select-none">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {subLabel && <p className="text-xs text-text-secondary mt-0.5">{subLabel}</p>}
    </label>
    <Toggle id={id} checked={checked} onChange={onChange} />
  </div>
);

// ── Saved feedback pill ───────────────────────────────────────────────────────

const SavedPill: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent">
    <Check className="w-3.5 h-3.5" />
    Saved
  </span>
);

// ── Settings page ─────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const {
    tempUnit,
    theme,
    defaultCity,
    dashPrefs,
    setTempUnit,
    setTheme,
    setDefaultCity,
    setDashPrefs,
  } = useSettings();

  // Local state for default city input so we only persist on Save
  const [cityInput, setCityInput] = useState(defaultCity);
  const [citySaved, setCitySaved] = useState(false);

  const handleSaveCity = () => {
    setDefaultCity(cityInput.trim());
    setCitySaved(true);
    setTimeout(() => setCitySaved(false), 2000);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSaveCity();
  };

  const tempOptions: SegmentOption<TempUnit>[] = [
    { value: "celsius", label: "Celsius (°C)", icon: <Thermometer /> },
    { value: "fahrenheit", label: "Fahrenheit (°F)", icon: <Thermometer /> },
  ];

  const themeOptions: SegmentOption<ThemeMode>[] = [
    { value: "dark", label: "Dark", icon: <Moon /> },
    { value: "light", label: "Light", icon: <Sun /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-text-primary tracking-tight">
        Settings
      </h1>

      {/* ── 1. Temperature Units ───────────────────────────────────────── */}
      <SectionCard
        icon={<Thermometer />}
        title="Temperature Unit"
        description="Choose how temperatures are displayed across the app"
      >
        <SegmentedButton<TempUnit>
          options={tempOptions}
          value={tempUnit}
          onChange={setTempUnit}
        />
      </SectionCard>

      {/* ── 2. Theme ───────────────────────────────────────────────────── */}
      <SectionCard
        icon={<Sun />}
        title="Theme"
        description="Switch between dark and light display modes"
      >
        <SegmentedButton<ThemeMode>
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </SectionCard>

      {/* ── 3. Default City ───────────────────────────────────────────── */}
      <SectionCard
        icon={<MapPin />}
        title="Default City"
        description="Weather for this city loads automatically on startup"
      >
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCitySaved(false);
            }}
            onKeyDown={handleCityKeyDown}
            placeholder="e.g. Chennai"
            className="flex-1 bg-bg-main border border-brand-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand-accent transition-colors duration-150"
          />
          <button
            onClick={handleSaveCity}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-bg-card"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          {citySaved && <SavedPill />}
        </div>
        {defaultCity && (
          <p className="text-xs text-text-secondary mt-2">
            Current default:{" "}
            <span className="text-text-primary font-medium">{defaultCity}</span>
          </p>
        )}
      </SectionCard>

      {/* ── 4. Dashboard Preferences ──────────────────────────────────── */}
      <SectionCard
        icon={<LayoutDashboard />}
        title="Dashboard Preferences"
        description="Choose which weather cards appear on the Dashboard"
      >
        <div className="flex flex-col">
          <ToggleRow
            id="pref-humidity"
            label="Show Humidity Card"
            subLabel="Displays the current humidity percentage"
            checked={dashPrefs.showHumidity}
            onChange={(v) =>
              setDashPrefs({ ...dashPrefs, showHumidity: v } as DashPrefs)
            }
          />
          <ToggleRow
            id="pref-wind"
            label="Show Wind Speed Card"
            subLabel="Displays current wind speed in km/h"
            checked={dashPrefs.showWindSpeed}
            onChange={(v) =>
              setDashPrefs({ ...dashPrefs, showWindSpeed: v } as DashPrefs)
            }
          />
          <ToggleRow
            id="pref-feels"
            label="Show Feels Like Card"
            subLabel="Displays the perceived temperature"
            checked={dashPrefs.showFeelsLike}
            onChange={(v) =>
              setDashPrefs({ ...dashPrefs, showFeelsLike: v } as DashPrefs)
            }
          />
        </div>
      </SectionCard>

      {/* ── 5. Application Information ────────────────────────────────── */}
      <SectionCard
        icon={<Info />}
        title="Application Information"
        description="About this application"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-brand-border">
            <span className="text-sm text-text-secondary">Application</span>
            <span className="text-sm font-semibold text-text-primary">WeatherWise</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-brand-border">
            <span className="text-sm text-text-secondary">Version</span>
            <span className="text-sm font-semibold text-text-primary">1.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-brand-border">
            <span className="text-sm text-text-secondary">Data Source</span>
            <span className="text-sm font-semibold text-text-primary">OpenWeather API</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-secondary">Built With</span>
            <span className="text-sm font-semibold text-text-primary">React + TypeScript</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
