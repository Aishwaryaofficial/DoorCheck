import {verdictFor, weatherLabel, aqiLabel} from '../src/api/decision';

test('clear air and weather is GO', () => {
  expect(
    verdictFor({
      weatherCode: 0,
      precipitationMm: 0,
      rainChance: 10,
      apparentC: 24,
      windKmh: 8,
      usAqi: 40,
    }),
  ).toBe('GO');
});

test('rain or mid AQI is WAIT', () => {
  expect(
    verdictFor({
      weatherCode: 61,
      precipitationMm: 1.2,
      rainChance: 80,
      apparentC: 24,
      windKmh: 8,
      usAqi: 40,
    }),
  ).toBe('WAIT');
  expect(
    verdictFor({
      weatherCode: 1,
      precipitationMm: 0,
      rainChance: 10,
      apparentC: 24,
      windKmh: 8,
      usAqi: 120,
    }),
  ).toBe('WAIT');
});

test('thunder, snow, or bad AQI is STAY', () => {
  expect(
    verdictFor({
      weatherCode: 95,
      precipitationMm: 0,
      rainChance: 10,
      apparentC: 24,
      windKmh: 8,
      usAqi: 40,
    }),
  ).toBe('STAY');
  expect(
    verdictFor({
      weatherCode: 1,
      precipitationMm: 0,
      rainChance: 10,
      apparentC: 24,
      windKmh: 8,
      usAqi: 180,
    }),
  ).toBe('STAY');
});

test('labels', () => {
  expect(weatherLabel(0)).toBe('Clear');
  expect(weatherLabel(95)).toBe('Thunder');
  expect(aqiLabel(20)).toBe('Good air');
  expect(aqiLabel(null)).toBe('AQI unknown');
});
