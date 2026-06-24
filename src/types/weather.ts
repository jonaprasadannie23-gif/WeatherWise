export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure?: number;
    temp_min?: number;
    temp_max?: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  weather: WeatherCondition[];
  sys: {
    country: string;
    sunrise?: number;
    sunset?: number;
  };
  cod: number | string;
  message?: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}
