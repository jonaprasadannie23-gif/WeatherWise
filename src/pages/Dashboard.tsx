import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";
import { fetchCurrentWeather } from "../services";
import type { WeatherData } from "../types/weather";
import type { TempUnit, DashPrefs } from "../hooks/useSettings";

interface OutletContextType {
  searchQuery: string;
  tempUnit: TempUnit;
  dashPrefs: DashPrefs;
  setWeatherDataForAdvisor?: (data: WeatherData) => void;
}

// ── Temperature conversion helper ────────────────────────────────────────────

function displayTemp(celsius: number, unit: TempUnit): string {
  if (unit === "fahrenheit") {
    return `${Math.round((celsius * 9) / 5 + 32)} °F`;
  }
  return `${celsius} °C`;
}

// ── Weather condition → lucide icon ─────────────────────────────────────────

function getWeatherIcon(condition: string): React.ReactElement {
  const cls = "w-5 h-5 text-brand-accent flex-shrink-0";
  const lower = condition.toLowerCase();
  if (lower === "clear") return <Sun className={cls} />;
  if (lower === "clouds") return <Cloud className={cls} />;
  if (lower === "rain") return <CloudRain className={cls} />;
  if (lower === "drizzle") return <CloudDrizzle className={cls} />;
  if (lower === "thunderstorm") return <CloudLightning className={cls} />;
  if (lower === "snow") return <Snowflake className={cls} />;
  if (["mist", "fog", "haze", "smoke", "dust", "sand", "ash", "squall", "tornado"].includes(lower))
    return <CloudFog className={cls} />;
  return <Cloud className={cls} />;
}

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactElement;
  primary?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, primary = false }) => (
  <div className="bg-bg-card border border-brand-border rounded-xl p-5 flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        {label}
      </span>
    </div>
    <span
      className={
        primary
          ? "text-5xl font-extrabold text-text-primary leading-tight mt-1"
          : "text-2xl font-bold text-text-primary"
      }
    >
      {value}
    </span>
  </div>
);

// ── Weather result display ───────────────────────────────────────────────────

interface WeatherDisplayProps {
  data: WeatherData;
  tempUnit: TempUnit;
  dashPrefs: DashPrefs;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data, tempUnit, dashPrefs }) => {
  const windKmh = (data.windSpeed * 3.6).toFixed(1);

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">
        Showing current weather for{" "}
        <span className="text-text-primary font-semibold">
          {data.city}, {data.country}
        </span>{" "}
        —{" "}
        {data.description.charAt(0).toUpperCase() + data.description.slice(1)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature — always shown, primary card */}
        <StatCard
          label="Temperature"
          value={displayTemp(data.temp, tempUnit)}
          icon={<Thermometer className="w-5 h-5 text-brand-accent flex-shrink-0" />}
          primary
        />

        {/* Feels Like — conditional */}
        {dashPrefs.showFeelsLike && (
          <StatCard
            label="Feels Like"
            value={displayTemp(data.feelsLike, tempUnit)}
            icon={<Thermometer className="w-5 h-5 text-brand-accent flex-shrink-0" />}
          />
        )}

        {/* Condition */}
        <StatCard
          label="Condition"
          value={data.condition}
          icon={getWeatherIcon(data.condition)}
        />

        {/* City */}
        <StatCard label="City" value={`${data.city}, ${data.country}`} />

        {/* Humidity — conditional */}
        {dashPrefs.showHumidity && (
          <StatCard
            label="Humidity"
            value={`${data.humidity} %`}
            icon={<Droplets className="w-5 h-5 text-brand-accent flex-shrink-0" />}
          />
        )}

        {/* Wind Speed — conditional */}
        {dashPrefs.showWindSpeed && (
          <StatCard
            label="Wind Speed"
            value={`${windKmh} km/h`}
            icon={<Wind className="w-5 h-5 text-brand-accent flex-shrink-0" />}
          />
        )}
      </div>
    </div>
  );
};

// ── Error card ───────────────────────────────────────────────────────────────

interface ErrorCardProps {
  message: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => {
  let heading = "Could not load weather data";
  let body = message;
  if (message === "CITY_NOT_FOUND") {
    heading = "City not found";
    body = "City not found. Please check the spelling and try again.";
  } else if (message === "NETWORK_ERROR") {
    heading = "Connection error";
    body = "Unable to connect to the weather service. Please check your internet connection.";
  }
  return (
    <div className="bg-bg-card border border-brand-border rounded-xl p-6">
      <p className="text-sm font-semibold text-text-primary mb-1">{heading}</p>
      <p className="text-sm text-text-secondary">{body}</p>
    </div>
  );
};

// ── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <p className="text-text-secondary text-sm text-center">
      Search for a city to view current weather information.
    </p>
  </div>
);

// ── Dashboard page ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const {
  searchQuery,
  tempUnit,
  dashPrefs,
  setWeatherDataForAdvisor,
} = useOutletContext<OutletContextType>();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery) return;

    let cancelled = false;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      setWeatherData(null);

      try {
        const data = await fetchCurrentWeather(searchQuery);
        if (!cancelled) {
          setWeatherData(data);
          setWeatherDataForAdvisor?.(data);
          setLastUpdated(
            new Date().toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-bg-card border border-brand-border rounded-xl p-6 flex items-center gap-3">
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
          <p className="text-text-secondary text-sm">
            Fetching weather data for{" "}
            <span className="text-text-primary font-semibold">{searchQuery}</span>…
          </p>
        </div>
      );
    }
    if (error) return <ErrorCard message={error} />;
    if (weatherData) return <WeatherDisplay data={weatherData} tempUnit={tempUnit} dashPrefs={dashPrefs} />;
    return <EmptyState />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        {lastUpdated && (
          <p className="text-xs text-text-secondary mt-1">Updated: {lastUpdated}</p>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default Dashboard;
