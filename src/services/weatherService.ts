import axios from "axios";
import type { OpenWeatherResponse, WeatherData } from "../types/weather";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const fetchCurrentWeather = async (city: string): Promise<WeatherData> => {
  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing. Please check your environment variables.");
  }

  try {
    const response = await axios.get<OpenWeatherResponse>(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    const { data } = response;
    
    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0]?.main || "Unknown",
      description: data.weather[0]?.description || "No description available",
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0]?.icon || "",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        // No response means a network-level failure (offline, DNS, timeout, etc.)
        throw new Error("NETWORK_ERROR");
      }
      if (error.response.status === 404) {
        throw new Error("CITY_NOT_FOUND");
      }
      if (error.response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenWeatherMap key.");
      }
      throw new Error(
        (error.response.data as { message?: string })?.message ||
          "Failed to fetch weather data."
      );
    }
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred."
    );
  }
};
