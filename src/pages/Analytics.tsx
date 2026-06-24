import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { fetchForecast } from "../services";
import type { ForecastData, ChartPoint } from "../types/forecast";

interface OutletContextType {
  searchQuery: string;
}

// ── Theme tokens (must match index.css @theme values) ───────────────────────
const COLOR_CARD = "#272B30";
const COLOR_BORDER = "#3A3F45";
const COLOR_TEXT_PRIMARY = "#F4F4F5";
const COLOR_TEXT_SECONDARY = "#A1A1AA";
const COLOR_TEMP = "#8FA3B8";
const COLOR_HUMIDITY = "#6EB5A0";
const COLOR_WIND = "#B89A6E";

// ── Summary stat card ────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, sub }) => (
  <div className="bg-bg-card border border-brand-border rounded-xl p-5 flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
      {label}
    </span>
    <span className="text-3xl font-bold text-text-primary leading-tight">
      {value}
    </span>
    {sub && <span className="text-xs text-text-secondary mt-0.5">{sub}</span>}
  </div>
);

// ── Chart card wrapper ────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="bg-bg-card border border-brand-border rounded-xl p-5 flex flex-col gap-4">
    <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
      {title}
    </h3>
    {children}
  </div>
);

// ── Shared recharts tooltip style ────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    backgroundColor: COLOR_CARD,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: "10px",
    color: COLOR_TEXT_PRIMARY,
    fontSize: "12px",
  },
  labelStyle: { color: COLOR_TEXT_SECONDARY, marginBottom: 4 },
  itemStyle: { color: COLOR_TEXT_PRIMARY },
  cursor: { stroke: COLOR_BORDER, strokeWidth: 1 },
};

// ── Axis tick count — fewer on small screens handled via ResponsiveContainer ─
function tickInterval(total: number): number {
  // Show ~8 ticks regardless of dataset size
  return Math.max(1, Math.floor(total / 8));
}

// ── Temperature chart ─────────────────────────────────────────────────────────

interface TempChartProps {
  data: ChartPoint[];
}

const TemperatureChart: React.FC<TempChartProps> = ({ data }) => (
  <ChartCard title="Temperature Trend (°C)">
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={COLOR_BORDER} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          interval={tickInterval(data.length)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="°"
        />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} °C`, "Temp"]} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: COLOR_TEXT_SECONDARY, paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="temp"
          name="Temperature"
          stroke={COLOR_TEMP}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLOR_TEMP }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ── Humidity chart ────────────────────────────────────────────────────────────

interface HumidityChartProps {
  data: ChartPoint[];
}

const HumidityChart: React.FC<HumidityChartProps> = ({ data }) => (
  <ChartCard title="Humidity Trend (%)">
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={COLOR_BORDER} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          interval={tickInterval(data.length)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} %`, "Humidity"]} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: COLOR_TEXT_SECONDARY, paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="humidity"
          name="Humidity"
          stroke={COLOR_HUMIDITY}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLOR_HUMIDITY }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ── Wind speed chart ──────────────────────────────────────────────────────────

interface WindChartProps {
  data: ChartPoint[];
}

const WindChart: React.FC<WindChartProps> = ({ data }) => (
  <ChartCard title="Wind Speed Trend (km/h)">
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={COLOR_BORDER} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          interval={tickInterval(data.length)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: COLOR_TEXT_SECONDARY, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit=" km/h"
          width={52}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number) => [`${v} km/h`, "Wind"]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: COLOR_TEXT_SECONDARY, paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="windKmh"
          name="Wind Speed"
          stroke={COLOR_WIND}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLOR_WIND }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ── Forecast display ──────────────────────────────────────────────────────────

interface ForecastDisplayProps {
  data: ForecastData;
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data }) => {
  const { stats, chartPoints } = data;

  return (
    <div className="space-y-6">
      {/* Sub-heading */}
      <p className="text-text-secondary text-sm">
        5-day forecast for{" "}
        <span className="text-text-primary font-semibold">
          {data.city}, {data.country}
        </span>
      </p>

      {/* Summary cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Avg Temperature"
          value={`${stats.avgTemp} °C`}
          sub="5-day average"
        />
        <SummaryCard
          label="Max Temperature"
          value={`${stats.maxTemp} °C`}
          sub="5-day high"
        />
        <SummaryCard
          label="Min Temperature"
          value={`${stats.minTemp} °C`}
          sub="5-day low"
        />
        <SummaryCard
          label="Avg Humidity"
          value={`${stats.avgHumidity} %`}
          sub="5-day average"
        />
      </div>

      {/* Charts — stacked on mobile, 2-col grid on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TemperatureChart data={chartPoints} />
        <HumidityChart data={chartPoints} />
      </div>

      {/* Wind chart spans full width */}
      <WindChart data={chartPoints} />
    </div>
  );
};

// ── Error card ────────────────────────────────────────────────────────────────

interface ErrorCardProps {
  message: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => {
  let heading = "Could not load forecast data";
  let body = message;

  if (message === "CITY_NOT_FOUND") {
    heading = "City not found";
    body = "City not found. Please check the spelling and try again.";
  } else if (message === "NETWORK_ERROR") {
    heading = "Connection error";
    body =
      "Unable to connect to the weather service. Please check your internet connection.";
  }

  return (
    <div className="bg-bg-card border border-brand-border rounded-xl p-6">
      <p className="text-sm font-semibold text-text-primary mb-1">{heading}</p>
      <p className="text-sm text-text-secondary">{body}</p>
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <p className="text-text-secondary text-sm text-center">
      Search for a city to view forecast analytics.
    </p>
  </div>
);

// ── Analytics page ────────────────────────────────────────────────────────────

const Analytics: React.FC = () => {
  const { searchQuery } = useOutletContext<OutletContextType>();

  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery) return;

    let cancelled = false;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      setForecastData(null);

      try {
        const data = await fetchForecast(searchQuery);
        if (!cancelled) {
          setForecastData(data);
          setLastUpdated(
            new Date().toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  // ── Render states ─────────────────────────────────────────────────────────

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
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-text-secondary text-sm">
            Loading forecast for{" "}
            <span className="text-text-primary font-semibold">{searchQuery}</span>
            …
          </p>
        </div>
      );
    }

    if (error) return <ErrorCard message={error} />;
    if (forecastData) return <ForecastDisplay data={forecastData} />;
    return <EmptyState />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Analytics
        </h1>
        {lastUpdated && (
          <p className="text-xs text-text-secondary mt-1">
            Updated: {lastUpdated}
          </p>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default Analytics;
