// ── Raw OpenWeatherMap 5-day / 3-hour forecast API response ─────────────────

export interface ForecastItem {
  dt: number; // Unix timestamp
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number; // m/s
    deg: number;
  };
  dt_txt: string; // "2024-01-15 12:00:00"
}

export interface ForecastCity {
  name: string;
  country: string;
}

export interface OpenWeatherForecastResponse {
  cod: string;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

// ── Formatted types used by components ──────────────────────────────────────

/** One data point in a chart series (x = label, y = numeric value) */
export interface ChartPoint {
  label: string; // e.g. "Mon 14:00"
  temp: number;
  humidity: number;
  windKmh: number;
}

/** Per-day summary derived from multiple 3-hour slots */
export interface DailySummary {
  date: string;       // e.g. "Mon, Jun 23"
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  condition: string;
}

/** Everything the Analytics page needs */
export interface ForecastData {
  city: string;
  country: string;
  /** Aggregated per-day summaries (up to 5 days) */
  dailySummaries: DailySummary[];
  /** Every 3-hour slot as a chart point (up to 40 points) */
  chartPoints: ChartPoint[];
  /** Rolled-up stats across the full forecast window */
  stats: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    avgHumidity: number;
  };
}
