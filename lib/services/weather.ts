import type { WeatherData, HourlyForecast } from '@/lib/types';
import { mockWeather } from '@/lib/mock-data';
import { NYC_DEFAULTS } from '@/lib/constants';

const OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5';

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    icon: string;
  }>;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
}

function kelvinToFahrenheit(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 9 / 5 + 32);
}

function mpsToMph(mps: number): number {
  return Math.round(mps * 2.237);
}

function formatHour(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: NYC_DEFAULTS.timezone,
  });
}

export async function getWeather(
  lat?: number,
  lng?: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY not set, using mock data');
    return mockWeather;
  }

  const latitude = lat ?? NYC_DEFAULTS.latitude;
  const longitude = lng ?? NYC_DEFAULTS.longitude;

  try {
    // Fetch current weather and forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `${OPENWEATHER_API}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      ),
      fetch(
        `${OPENWEATHER_API}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&cnt=4`
      ),
    ]);

    if (!currentRes.ok) {
      console.error(`OpenWeather current API error: ${currentRes.status}`);
      return mockWeather;
    }

    const current: OpenWeatherResponse = await currentRes.json();

    // Build hourly forecast from 3-hour forecast endpoint
    let hourlyForecast: HourlyForecast[] = [];

    if (forecastRes.ok) {
      const forecast: OpenWeatherForecastResponse = await forecastRes.json();
      hourlyForecast = forecast.list.map((item) => ({
        time: formatHour(item.dt),
        temp: kelvinToFahrenheit(item.main.temp),
        condition: item.weather[0]?.main ?? 'Clear',
        icon: item.weather[0]?.icon ?? '01d',
      }));
    }

    return {
      temp: kelvinToFahrenheit(current.main.temp),
      feelsLike: kelvinToFahrenheit(current.main.feels_like),
      condition: current.weather[0]?.main ?? 'Clear',
      icon: current.weather[0]?.icon ?? '01d',
      humidity: current.main.humidity,
      wind: mpsToMph(current.wind.speed),
      hourlyForecast,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return mockWeather;
  }
}
