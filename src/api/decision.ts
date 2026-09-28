import {AirSnapshot, DoorCheckResult, HourChip, Verdict, WeatherSnapshot} from '../types';

export function weatherLabel(code: number): string {
  if (code <= 1) {
    return 'Clear';
  }
  if (code <= 3) {
    return 'Cloudy';
  }
  if (code <= 48) {
    return 'Fog';
  }
  if (code <= 57) {
    return 'Drizzle';
  }
  if (code <= 67) {
    return 'Rain';
  }
  if (code <= 77) {
    return 'Snow';
  }
  if (code <= 82) {
    return 'Showers';
  }
  if (code <= 86) {
    return 'Snow showers';
  }
  return 'Thunder';
}

export function aqiLabel(aqi: number | null): string {
  if (aqi == null) {
    return 'AQI unknown';
  }
  if (aqi <= 50) {
    return 'Good air';
  }
  if (aqi <= 100) {
    return 'OK air';
  }
  if (aqi <= 150) {
    return 'Sensitive groups';
  }
  if (aqi <= 200) {
    return 'Unhealthy';
  }
  return 'Hazardous air';
}

export function verdictFor(input: {
  weatherCode: number;
  precipitationMm: number;
  rainChance: number;
  apparentC: number;
  windKmh: number;
  usAqi: number | null;
}): Verdict {
  const {weatherCode, precipitationMm, rainChance, apparentC, windKmh, usAqi} =
    input;

  if (
    (usAqi != null && usAqi >= 150) ||
    weatherCode >= 95 ||
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86) ||
    apparentC >= 42 ||
    apparentC <= 2 ||
    windKmh >= 60
  ) {
    return 'STAY';
  }

  if (
    (usAqi != null && usAqi >= 100) ||
    precipitationMm >= 0.2 ||
    rainChance >= 60 ||
    (weatherCode >= 45 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    apparentC >= 36 ||
    apparentC <= 8
  ) {
    return 'WAIT';
  }

  return 'GO';
}

function currentHourIndex(times: string[]): number {
  const now = Date.now();
  let idx = 0;
  for (let i = 0; i < times.length; i += 1) {
    if (new Date(times[i]).getTime() <= now) {
      idx = i;
    }
  }
  return idx;
}

function hourLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {hour: 'numeric'});
}

export function buildResult(opts: {
  weather: WeatherSnapshot;
  air: AirSnapshot;
  coords: {latitude: number; longitude: number};
  placeName: string;
  source: 'gps' | 'demo';
}): DoorCheckResult {
  const {weather, air, coords, placeName, source} = opts;
  const idx = currentHourIndex(weather.hourly.time);
  const rainChance = weather.hourly.rainChance[idx] ?? 0;
  const hourAqi = air.hourlyAqi[idx] ?? air.usAqi;
  const verdict = verdictFor({
    weatherCode: weather.weatherCode,
    precipitationMm: weather.precipitationMm,
    rainChance,
    apparentC: weather.apparentC,
    windKmh: weather.windKmh,
    usAqi: hourAqi ?? air.usAqi,
  });

  const reasons: string[] = [];
  reasons.push(`${Math.round(weather.temperatureC)}° feels ${Math.round(weather.apparentC)}° · ${weatherLabel(weather.weatherCode)}`);
  reasons.push(aqiLabel(air.usAqi));
  if (weather.precipitationMm >= 0.2 || rainChance >= 40) {
    reasons.push(`${Math.round(rainChance)}% chance of rain this hour`);
  } else {
    reasons.push(`Wind ${Math.round(weather.windKmh)} km/h`);
  }

  const hours: HourChip[] = [];
  for (let i = idx; i < Math.min(idx + 12, weather.hourly.time.length); i += 1) {
    const v = verdictFor({
      weatherCode: weather.hourly.weatherCode[i] ?? weather.weatherCode,
      precipitationMm: weather.hourly.precipitationMm[i] ?? 0,
      rainChance: weather.hourly.rainChance[i] ?? 0,
      apparentC: weather.hourly.temperatureC[i] ?? weather.apparentC,
      windKmh: weather.windKmh,
      usAqi: air.hourlyAqi[i] ?? air.usAqi,
    });
    hours.push({
      label: i === idx ? 'Now' : hourLabel(weather.hourly.time[i]),
      verdict: v,
      tempC: weather.hourly.temperatureC[i] ?? weather.temperatureC,
      rainChance: weather.hourly.rainChance[i] ?? 0,
    });
  }

  const nextGood = hours.find((h, i) => i > 0 && h.verdict === 'GO');

  const headline =
    verdict === 'GO'
      ? 'Door open. Go live your day.'
      : verdict === 'WAIT'
        ? 'Not yet. Give it a beat.'
        : 'Stay in. The street can wait.';

  const emoji = verdict === 'GO' ? '🚪' : verdict === 'WAIT' ? '⏳' : '🏠';

  return {
    verdict,
    emoji,
    headline,
    reasons: reasons.slice(0, 3),
    temperatureC: weather.temperatureC,
    apparentC: weather.apparentC,
    aqi: air.usAqi,
    aqiLabel: aqiLabel(air.usAqi),
    weatherLabel: weatherLabel(weather.weatherCode),
    isDay: weather.isDay,
    hours,
    nextGoodHour: nextGood ? nextGood.label : null,
    coords,
    source,
    placeName,
  };
}
