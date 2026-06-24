import React, { useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Thermometer,
  Droplets,
  Wind,
  Search,
  GitCompare,
} from "lucide-react";
import { fetchCurrentWeather } from "../services";
import type { WeatherData } from "../types/weather";

// ── Weather condition → lucide icon ──────────────────────────────────────────

function getWeatherIcon(
  condition: string,
  className = "w-8 h-8 text-brand-accent"
): React.ReactElement {
  const lower = condition.toLowerCase();
  if (lower === "clear") return <Sun className={className} />;
  if (lower === "clouds") return <Cloud className={className} />;
  if (lower === "rain") return <CloudRain className={className} />;
  if (lower === "drizzle") return <CloudDrizzle className={className} />;
  if (lower === "thunderstorm") return <CloudLightning className={className} />;
  if (lower === "snow") return <Snowflake className={className} />;
  if (
    ["mist", "fog", "haze", "smoke", "dust", "sand", "ash", "squall", "tornado"].includes(lower)
  )
    return <CloudFog className={className} />;
  return <Cloud className={className} />;
}

// ── Per-city slot state ───────────────────────────────────────────────────────

interface CitySlot {
  data: WeatherData | null;
  error: string | null;
  loading: boolean;
}

const emptySlot = (): CitySlot => ({ data: null, error: null, loading: false });

// ── Error message resolver ────────────────────────────────────────────────────

function resolveError(raw: string): string {
  if (raw === "CITY_NOT_FOUND")
    return "City not found. Please check the spelling and try again.";
  if (raw === "NETWORK_ERROR")
    return "Unable to connect to the weather service. Please check your internet connection.";
  return raw;
}

// ── City input field ──────────────────────────────────────────────────────────

interface CityInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}

const CityInput: React.FC<CityInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-text-secondary" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-bg-main border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand-accent transition-colors duration-150 disabled:opacity-50"
      />
    </div>
  </div>
);

// ── Winner / Loser badge ──────────────────────────────────────────────────────

type BadgeType = "higher" | "lower" | "equal";

const MetricBadge: React.FC<{ type: BadgeType }> = ({ type }) => {
  if (type === "equal") return null;
  return (
    <span
      className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
        type === "higher"
          ? "bg-brand-accent/15 text-brand-accent"
          : "bg-brand-border/60 text-text-secondary"
      }`}
    >
      {type === "higher" ? "Higher" : "Lower"}
    </span>
  );
};

// ── Metric row (with badge) ───────────────────────────────────────────────────

interface MetricRowProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  badge: BadgeType;
}

const MetricRow: React.FC<MetricRowProps> = ({ Icon, label, value, badge }) => {
  const isHigher = badge === "higher";
  return (
    <div className="flex items-center justify-between py-3 border-b border-brand-border last:border-0">
      <div className="flex items-center gap-2">
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${
            isHigher ? "text-brand-accent" : "text-text-secondary"
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            isHigher ? "text-brand-accent" : "text-text-secondary"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center">
        <span
          className={`text-sm font-bold ${
            isHigher ? "text-brand-accent" : "text-text-primary"
          }`}
        >
          {value}
        </span>
        <MetricBadge type={badge} />
      </div>
    </div>
  );
};

// ── City weather card ─────────────────────────────────────────────────────────

interface CityCardProps {
  slot: CitySlot;
  label: string;
  badges: Record<string, BadgeType>;
}

const CityCard: React.FC<CityCardProps> = ({ slot, label, badges }) => {
  if (slot.loading) {
    return (
      <div className="bg-bg-card border border-brand-border rounded-xl p-6 flex items-center gap-3 min-h-52">
        <svg
          className="animate-spin h-5 w-5 text-brand-accent flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-text-secondary text-sm">Fetching {label}…</p>
      </div>
    );
  }

  if (slot.error) {
    return (
      <div className="bg-bg-card border border-brand-border rounded-xl p-6 min-h-52">
        <p className="text-sm font-semibold text-text-primary mb-1">
          {slot.error === "CITY_NOT_FOUND" ? "City not found" : "Connection error"}
        </p>
        <p className="text-sm text-text-secondary">{resolveError(slot.error)}</p>
      </div>
    );
  }

  if (!slot.data) {
    return (
      <div className="bg-bg-card border border-brand-border rounded-xl p-6 min-h-52 flex items-center justify-center">
        <p className="text-text-secondary text-sm text-center">
          Enter a city name and click Compare.
        </p>
      </div>
    );
  }

  const d = slot.data;
  const windKmh = (d.windSpeed * 3.6).toFixed(1);
  const isTempWinner = badges["temp"] === "higher";

  return (
    <div className="bg-bg-card border border-brand-border rounded-xl p-6 flex flex-col gap-4 hover:border-brand-accent/50 transition-colors duration-200">
      {/* Card header: icon + city name */}
      <div className="flex items-center gap-3">
        {getWeatherIcon(d.condition, "w-9 h-9 text-brand-accent flex-shrink-0")}
        <div>
          <p className="text-xl font-bold text-text-primary leading-tight">
            {d.city}
            <span className="text-text-secondary font-medium text-sm ml-1.5">
              {d.country}
            </span>
          </p>
        </div>
      </div>

      {/* Temperature hero */}
      <div>
        <div className="flex items-end gap-3">
          <span
            className={`text-6xl font-extrabold leading-none ${
              isTempWinner ? "text-brand-accent" : "text-text-primary"
            }`}
          >
            {d.temp}°C
          </span>
          <MetricBadge type={badges["temp"] ?? "equal"} />
        </div>
        {/* Condition directly below temperature */}
        <p className="text-sm text-text-secondary capitalize mt-1.5">{d.description}</p>
      </div>

      {/* Metric rows */}
      <div className="flex flex-col">
        <MetricRow
          Icon={Thermometer}
          label="Feels Like"
          value={`${d.feelsLike} °C`}
          badge={badges["feelsLike"] ?? "equal"}
        />
        <MetricRow
          Icon={Droplets}
          label="Humidity"
          value={`${d.humidity} %`}
          badge={badges["humidity"] ?? "equal"}
        />
        <MetricRow
          Icon={Wind}
          label="Wind Speed"
          value={`${windKmh} km/h`}
          badge={badges["windSpeed"] ?? "equal"}
        />
      </div>
    </div>
  );
};

// ── Comparison header (VS banner) ─────────────────────────────────────────────

interface CompareHeaderProps {
  cityA: string;
  cityB: string;
}

const CompareHeader: React.FC<CompareHeaderProps> = ({ cityA, cityB }) => (
  <div className="flex items-center justify-center gap-4 py-2">
    <span className="text-2xl font-extrabold text-text-primary tracking-tight text-right flex-1 truncate">
      {cityA.toUpperCase()}
    </span>
    <span className="text-xs font-bold text-text-secondary border border-brand-border rounded-lg px-3 py-1.5 shrink-0 tracking-widest uppercase">
      VS
    </span>
    <span className="text-2xl font-extrabold text-text-primary tracking-tight text-left flex-1 truncate">
      {cityB.toUpperCase()}
    </span>
  </div>
);

// ── Insight cards (replaces bullet summary) ───────────────────────────────────

interface Insight {
  emoji: string;
  title: string;
  winner: string;
  detail: string;
  neutral: boolean;
}

function buildInsights(a: WeatherData, b: WeatherData): Insight[] {
  const aWind = parseFloat((a.windSpeed * 3.6).toFixed(1));
  const bWind = parseFloat((b.windSpeed * 3.6).toFixed(1));

  const insights: Insight[] = [];

  // Temperature
  if (a.temp !== b.temp) {
    const diff = Math.abs(a.temp - b.temp);
    const hotter = a.temp > b.temp ? a : b;
    insights.push({
      emoji: "🔥",
      title: "Hotter City",
      winner: hotter.city,
      detail: `+${diff} °C`,
      neutral: false,
    });
  } else {
    insights.push({ emoji: "🌡", title: "Temperature", winner: "Equal", detail: `${a.temp} °C`, neutral: true });
  }

  // Feels like
  if (a.feelsLike !== b.feelsLike) {
    const diff = Math.abs(a.feelsLike - b.feelsLike);
    const warmer = a.feelsLike > b.feelsLike ? a : b;
    insights.push({
      emoji: "🌡",
      title: "Feels Hotter",
      winner: warmer.city,
      detail: `+${diff} °C`,
      neutral: false,
    });
  } else {
    insights.push({ emoji: "🌡", title: "Feels Like", winner: "Equal", detail: `${a.feelsLike} °C`, neutral: true });
  }

  // Humidity
  if (a.humidity !== b.humidity) {
    const diff = Math.abs(a.humidity - b.humidity);
    const humid = a.humidity > b.humidity ? a : b;
    insights.push({
      emoji: "💧",
      title: "More Humid",
      winner: humid.city,
      detail: `+${diff} %`,
      neutral: false,
    });
  } else {
    insights.push({ emoji: "💧", title: "Humidity", winner: "Equal", detail: `${a.humidity} %`, neutral: true });
  }

  // Wind
  if (aWind !== bWind) {
    const diff = Math.abs(aWind - bWind).toFixed(1);
    const windier = aWind > bWind ? a : b;
    insights.push({
      emoji: "🌬",
      title: "Windier City",
      winner: windier.city,
      detail: `+${diff} km/h`,
      neutral: false,
    });
  } else {
    insights.push({ emoji: "🌬", title: "Wind Speed", winner: "Equal", detail: `${aWind} km/h`, neutral: true });
  }

  return insights;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
  <div className="bg-bg-card border border-brand-border rounded-xl p-4 flex flex-col gap-1 hover:border-brand-accent/40 transition-colors duration-200">
    <div className="flex items-center gap-2">
      <span className="text-lg" aria-hidden="true">{insight.emoji}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        {insight.title}
      </span>
    </div>
    <p
      className={`text-base font-bold leading-tight ${
        insight.neutral ? "text-text-secondary" : "text-text-primary"
      }`}
    >
      {insight.winner}
    </p>
    <p
      className={`text-sm font-semibold ${
        insight.neutral ? "text-text-secondary" : "text-brand-accent"
      }`}
    >
      {insight.detail}
    </p>
  </div>
);

// ── computeWinners → badges per city ─────────────────────────────────────────

function computeBadges(
  a: WeatherData,
  b: WeatherData
): { badgesA: Record<string, BadgeType>; badgesB: Record<string, BadgeType> } {
  const metrics: Array<{ key: string; valA: number; valB: number }> = [
    { key: "temp", valA: a.temp, valB: b.temp },
    { key: "feelsLike", valA: a.feelsLike, valB: b.feelsLike },
    { key: "humidity", valA: a.humidity, valB: b.humidity },
    { key: "windSpeed", valA: a.windSpeed, valB: b.windSpeed },
  ];

  const badgesA: Record<string, BadgeType> = {};
  const badgesB: Record<string, BadgeType> = {};

  for (const { key, valA, valB } of metrics) {
    if (valA > valB) {
      badgesA[key] = "higher";
      badgesB[key] = "lower";
    } else if (valB > valA) {
      badgesA[key] = "lower";
      badgesB[key] = "higher";
    } else {
      badgesA[key] = "equal";
      badgesB[key] = "equal";
    }
  }

  return { badgesA, badgesB };
}

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-bg-card border border-brand-border flex items-center justify-center">
      <GitCompare className="w-8 h-8 text-brand-accent" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-base font-semibold text-text-primary">Compare Two Cities</p>
      <p className="text-sm text-text-secondary max-w-xs">
        Search and compare real-time weather conditions between any two cities.
      </p>
    </div>
  </div>
);

// ── Compare page ──────────────────────────────────────────────────────────────

const Compare: React.FC = () => {
  const [cityAInput, setCityAInput] = useState("");
  const [cityBInput, setCityBInput] = useState("");
  const [slotA, setSlotA] = useState<CitySlot>(emptySlot());
  const [slotB, setSlotB] = useState<CitySlot>(emptySlot());
  const [comparing, setComparing] = useState(false);
  /** True once the user has clicked Compare at least once */
  const [hasCompared, setHasCompared] = useState(false);

  const canCompare =
    cityAInput.trim().length > 0 && cityBInput.trim().length > 0 && !comparing;

  const handleCompare = async () => {
    const trimA = cityAInput.trim();
    const trimB = cityBInput.trim();
    if (!trimA || !trimB) return;

    setHasCompared(true);
    setComparing(true);
    setSlotA({ data: null, error: null, loading: true });
    setSlotB({ data: null, error: null, loading: true });

    const [resultA, resultB] = await Promise.allSettled([
      fetchCurrentWeather(trimA),
      fetchCurrentWeather(trimB),
    ]);

    setSlotA(
      resultA.status === "fulfilled"
        ? { data: resultA.value, error: null, loading: false }
        : {
            data: null,
            error:
              resultA.reason instanceof Error
                ? resultA.reason.message
                : "Unknown error",
            loading: false,
          }
    );

    setSlotB(
      resultB.status === "fulfilled"
        ? { data: resultB.value, error: null, loading: false }
        : {
            data: null,
            error:
              resultB.reason instanceof Error
                ? resultB.reason.message
                : "Unknown error",
            loading: false,
          }
    );

    setComparing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canCompare) handleCompare();
  };

  const bothReady = slotA.data !== null && slotB.data !== null;

  const { badgesA, badgesB } = bothReady
    ? computeBadges(slotA.data!, slotB.data!)
    : { badgesA: {}, badgesB: {} };

  const insights = bothReady ? buildInsights(slotA.data!, slotB.data!) : [];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <h1 className="text-3xl font-bold text-text-primary tracking-tight">
        Compare
      </h1>

      {/* Input row */}
      <div className="bg-bg-card border border-brand-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <CityInput
            label="City A"
            value={cityAInput}
            onChange={setCityAInput}
            placeholder="e.g. Salem"
            disabled={comparing}
          />
          <CityInput
            label="City B"
            value={cityBInput}
            onChange={setCityBInput}
            placeholder="e.g. Tirunelveli"
            disabled={comparing}
          />
          <button
            onClick={handleCompare}
            onKeyDown={handleKeyDown}
            disabled={!canCompare}
            className="w-full sm:w-auto shrink-0 px-6 py-2.5 rounded-xl bg-brand-accent text-bg-main text-sm font-semibold transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-bg-card"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Empty state — shown before any comparison attempt */}
      {!hasCompared && <EmptyState />}

      {/* Results — shown after first Compare click */}
      {hasCompared && (
        <>
          {/* VS header — only when both slots have data */}
          {bothReady && (
            <CompareHeader
              cityA={slotA.data!.city}
              cityB={slotB.data!.city}
            />
          )}

          {/* City cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CityCard slot={slotA} label="City A" badges={badgesA} />
            <CityCard slot={slotB} label="City B" badges={badgesB} />
          </div>

          {/* Insight cards grid */}
          {bothReady && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
                Comparison Summary
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Compare;
