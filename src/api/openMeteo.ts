import {AirSnapshot, WeatherSnapshot} from '../types';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function numOrNull(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot> {
  const url =
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day' +
    '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code' +
    '&forecast_days=1&timezone=auto';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather failed (${response.status}). Try again in a moment.`);
  }
  const data = await response.json();
  const current = data.current ?? {};
  const hourly = data.hourly ?? {};
  return {
    temperatureC: num(current.temperature_2m),
    apparentC: num(current.apparent_temperature, num(current.temperature_2m)),
    precipitationMm: num(current.precipitation),
    weatherCode: num(current.weather_code),
    windKmh: num(current.wind_speed_10m),
    isDay: Boolean(current.is_day),
    hourly: {
      time: Array.isArray(hourly.time) ? hourly.time.map(String) : [],
      temperatureC: Array.isArray(hourly.temperature_2m)
        ? hourly.temperature_2m.map((n: unknown) => num(n))
        : [],
      precipitationMm: Array.isArray(hourly.precipitation)
        ? hourly.precipitation.map((n: unknown) => num(n))
        : [],
      rainChance: Array.isArray(hourly.precipitation_probability)
        ? hourly.precipitation_probability.map((n: unknown) => num(n))
        : [],
      weatherCode: Array.isArray(hourly.weather_code)
        ? hourly.weather_code.map((n: unknown) => num(n))
        : [],
    },
  };
}

export async function fetchAir(
  latitude: number,
  longitude: number,
): Promise<AirSnapshot> {
  const url =
    `${AIR_URL}?latitude=${latitude}&longitude=${longitude}` +
    '&current=us_aqi,pm2_5' +
    '&hourly=us_aqi' +
    '&forecast_days=1&timezone=auto';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Air quality failed (${response.status}).`);
  }
  const data = await response.json();
  const current = data.current ?? {};
  const hourly = data.hourly ?? {};
  return {
    usAqi: numOrNull(current.us_aqi),
    hourlyAqi: Array.isArray(hourly.us_aqi)
      ? hourly.us_aqi.map((n: unknown) => numOrNull(n))
      : [],
    hourlyTime: Array.isArray(hourly.time) ? hourly.time.map(String) : [],
  };
}

export async function fetchDoorCheck(latitude: number, longitude: number) {
  const [weather, air] = await Promise.all([
    fetchWeather(latitude, longitude),
    fetchAir(latitude, longitude),
  ]);
  return {weather, air};
}
