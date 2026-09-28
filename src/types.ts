export type Verdict = 'GO' | 'WAIT' | 'STAY';

export type HourChip = {
  label: string;
  verdict: Verdict;
  tempC: number;
  rainChance: number;
};

export type DoorCheckResult = {
  verdict: Verdict;
  emoji: string;
  headline: string;
  reasons: string[];
  temperatureC: number;
  apparentC: number;
  aqi: number | null;
  aqiLabel: string;
  weatherLabel: string;
  isDay: boolean;
  hours: HourChip[];
  nextGoodHour: string | null;
  coords: {latitude: number; longitude: number};
  source: 'gps' | 'demo';
  placeName: string;
};

export type WeatherSnapshot = {
  temperatureC: number;
  apparentC: number;
  precipitationMm: number;
  weatherCode: number;
  windKmh: number;
  isDay: boolean;
  hourly: {
    time: string[];
    temperatureC: number[];
    precipitationMm: number[];
    rainChance: number[];
    weatherCode: number[];
  };
};

export type AirSnapshot = {
  usAqi: number | null;
  hourlyAqi: Array<number | null>;
  hourlyTime: string[];
};
