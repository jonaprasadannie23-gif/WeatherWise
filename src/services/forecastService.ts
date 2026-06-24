import axios from "axios";
import type {
  OpenWeatherForecastResponse,
  ForecastData,
  ChartPoint,
  DailySummary,
} from "../types/forecast";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

/** Format a Unix timestamp as "Mon 14:00" in local time */
function formatSlotLabel(dt: number): string {
  const date = new Date(dt * 1000);
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${time}`;
}

/** Format a Unix timestamp as "Mon, Jun 23" */
function formatDayLabel(dt: number): string {
  return new Date(dt * 1000).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const fetchForecast = async (city: string): Promise<ForecastData> => {
  if (!API_KEY) {
    throw new Error(
      "OpenWeatherMap API key is missing. Please check your environment variables."
    );
  }

  try {
    const response = await axios.get<OpenWeatherForecastResponse>(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    const { list, city: cityInfo } = response.data;

    // ── Build chart points (every 3-hour slot) ───────────────────────────────
    const chartPoints: ChartPoint[] = list.map((item) => ({
      label: formatSlotLabel(item.dt),
      temp: round1(item.main.temp),
      humidity: item.main.humidity,
      windKmh: round1(item.wind.speed * 3.6),
    }));

    // ── Build per-day summaries ──────────────────────────────────────────────
    const byDay = new Map<string, typeof list>();
    for (const item of list) {
      // Group by calendar date string (YYYY-MM-DD from dt_txt)
      const dayKey = item.dt_txt.slice(0, 10);
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey)!.push(item);
    }

    const dailySummaries: DailySummary[] = Array.from(byDay.entries()).map(
      ([, slots]) => {
        const temps = slots.map((s) => s.main.temp);
        const humidities = slots.map((s) => s.main.humidity);
        // Use the condition from the noon slot if available, else first slot
        const noonSlot =
          slots.find((s) => s.dt_txt.includes("12:00:00")) ?? slots[0];

        return {
          date: formatDayLabel(slots[0].dt),
          avgTemp: round1(temps.reduce((a, b) => a + b, 0) / temps.length),
          maxTemp: round1(Math.max(...temps)),
          minTemp: round1(Math.min(...temps)),
          avgHumidity: Math.round(
            humidities.reduce((a, b) => a + b, 0) / humidities.length
          ),
          condition: noonSlot.weather[0]?.main ?? "Unknown",
        };
      }
    );

    // ── Overall stats across full forecast window ────────────────────────────
    const allTemps = list.map((i) => i.main.temp);
    const allHumidities = list.map((i) => i.main.humidity);

    const stats = {
      avgTemp: round1(allTemps.reduce((a, b) => a + b, 0) / allTemps.length),
      maxTemp: round1(Math.max(...allTemps)),
      minTemp: round1(Math.min(...allTemps)),
      avgHumidity: Math.round(
        allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length
      ),
    };

    return {
      city: cityInfo.name,
      country: cityInfo.country,
      dailySummaries,
      chartPoints,
      stats,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error("NETWORK_ERROR");
      }
      if (error.response.status === 404) {
        throw new Error("CITY_NOT_FOUND");
      }
      if (error.response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenWeatherMap key.");
      }
      throw new Error(
        (error.response.data as { message?: string })?.message ??
          "Failed to fetch forecast data."
      );
    }
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred."
    );
  }
};
