import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {buildResult} from '../api/decision';
import {getCurrentCoords} from '../api/location';
import {fetchDoorCheck} from '../api/openMeteo';
import BlobBackground from '../components/BlobBackground';
import Logo from '../components/Logo';
import {DEMO_CITIES, DEFAULT_DEMO} from '../constants/cities';
import {Colors, Radius, Spacing, verdictTheme} from '../theme';
import {DoorCheckResult} from '../types';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DoorCheckResult | null>(null);
  const [cityId, setCityId] = useState<string>('gps');
  const scale = useRef(new Animated.Value(0.7)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const pop = useCallback(() => {
    scale.setValue(0.72);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const load = useCallback(
    async (mode: 'gps' | string) => {
      setLoading(true);
      setError('');
      try {
        let latitude: number = DEFAULT_DEMO.latitude;
        let longitude: number = DEFAULT_DEMO.longitude;
        let placeName: string = DEFAULT_DEMO.name;
        let source: 'gps' | 'demo' = 'demo';

        if (mode === 'gps') {
          try {
            const gps = await getCurrentCoords();
            latitude = gps.latitude;
            longitude = gps.longitude;
            placeName = 'Here';
            source = 'gps';
            setCityId('gps');
          } catch {
            setCityId(DEFAULT_DEMO.id);
            setError('GPS off — showing Delhi. Allow location or pick a city.');
          }
        } else {
          const city = DEMO_CITIES.find(c => c.id === mode) ?? DEFAULT_DEMO;
          latitude = city.latitude;
          longitude = city.longitude;
          placeName = city.name;
          source = 'demo';
          setCityId(city.id);
        }

        const {weather, air} = await fetchDoorCheck(latitude, longitude);
        const next = buildResult({
          weather,
          air,
          coords: {latitude, longitude},
          placeName,
          source,
        });
        setResult(next);
        pop();
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : 'Could not check the door.');
      } finally {
        setLoading(false);
      }
    },
    [pop],
  );

  useEffect(() => {
    load('gps');
  }, [load]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const onRefresh = () => {
    Animated.timing(spin, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => spin.setValue(0));
    load(cityId === 'gps' ? 'gps' : cityId);
  };

  const theme = verdictTheme(result?.verdict ?? 'LOAD');
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const ring = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.05],
  });

  return (
    <LinearGradient colors={[...theme.colors]} style={styles.flex}>
      <BlobBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28},
        ]}
        showsVerticalScrollIndicator={false}>
        <Logo />
        <Text style={styles.kicker}>Should you step outside?</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cities}>
          <CityChip
            label="GPS"
            active={cityId === 'gps'}
            onPress={() => load('gps')}
          />
          {DEMO_CITIES.map(city => (
            <CityChip
              key={city.id}
              label={city.name}
              active={cityId === city.id}
              onPress={() => load(city.id)}
            />
          ))}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.heroWrap}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: theme.accent,
                opacity: ringOpacity,
                transform: [{scale: ring}],
              },
            ]}
          />
          <Animated.View style={{transform: [{scale}]}}>
            {loading ? (
              <View style={styles.hero}>
                <ActivityIndicator color={Colors.ink} size="large" />
                <Text style={styles.loading}>Checking the door…</Text>
              </View>
            ) : result ? (
              <View style={styles.hero}>
                <Text style={styles.emoji}>{result.emoji}</Text>
                <Text style={[styles.verdict, {color: theme.accent}]}>
                  {result.verdict}
                </Text>
                <Text style={styles.headline}>{result.headline}</Text>
                <Text style={styles.place}>
                  {result.placeName}
                  {result.source === 'demo' ? '  ·  demo pin' : ''}
                </Text>
              </View>
            ) : (
              <Text style={styles.headline}>No reading yet</Text>
            )}
          </Animated.View>
        </View>

        {result ? (
          <>
            <View style={styles.stats}>
              <Stat label="Temp" value={`${Math.round(result.temperatureC)}°`} />
              <Stat label="Feels" value={`${Math.round(result.apparentC)}°`} />
              <Stat
                label="AQI"
                value={result.aqi == null ? '—' : String(Math.round(result.aqi))}
              />
            </View>

            {result.reasons.map(reason => (
              <View key={reason} style={styles.reason}>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}

            {result.nextGoodHour && result.verdict !== 'GO' ? (
              <Text style={styles.next}>Next GO window · {result.nextGoodHour}</Text>
            ) : null}

            <Text style={styles.section}>Next 12 hours</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hours}>
              {result.hours.map(hour => (
                <View
                  key={`${hour.label}-${hour.tempC}`}
                  style={[
                    styles.hour,
                    {borderColor: verdictTheme(hour.verdict).accent},
                  ]}>
                  <Text style={styles.hourLabel}>{hour.label}</Text>
                  <Text
                    style={[
                      styles.hourVerdict,
                      {color: verdictTheme(hour.verdict).accent},
                    ]}>
                    {hour.verdict}
                  </Text>
                  <Text style={styles.hourTemp}>{Math.round(hour.tempC)}°</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        <Pressable
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Check again"
          style={({pressed}) => [styles.cta, pressed && styles.pressed]}>
          <Animated.Text style={[styles.ctaText, {transform: [{rotate}]}]}>
            ↻  Check again
          </Animated.Text>
        </Pressable>
        <Text style={styles.hint}>GPS or a demo city · Open-Meteo · no API key</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const CityChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.chip, active && styles.chipOn]}>
    <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
  </Pressable>
);

const Stat = ({label, value}: {label: string; value: string}) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {paddingHorizontal: Spacing.lg},
  kicker: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    color: Colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  cities: {gap: 8, paddingVertical: Spacing.lg},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipOn: {backgroundColor: Colors.ink},
  chipText: {color: Colors.ink, fontWeight: '700', fontSize: 13},
  chipTextOn: {color: Colors.night},
  error: {
    color: '#FDE68A',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  heroWrap: {alignItems: 'center', justifyContent: 'center', minHeight: 260},
  pulseRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
  },
  hero: {alignItems: 'center', paddingHorizontal: Spacing.md},
  emoji: {fontSize: 52, marginBottom: 6},
  verdict: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -3,
  },
  headline: {
    marginTop: 6,
    color: Colors.ink,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  place: {marginTop: 6, color: Colors.muted, fontWeight: '600'},
  loading: {marginTop: Spacing.md, color: Colors.ink, fontWeight: '700'},
  stats: {flexDirection: 'row', gap: 10, marginTop: Spacing.xl},
  stat: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statLabel: {color: Colors.muted, fontSize: 12, fontWeight: '700'},
  statValue: {color: Colors.ink, fontSize: 24, fontWeight: '800', marginTop: 4},
  reason: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.glass,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  reasonText: {color: Colors.ink, fontSize: 15, fontWeight: '600'},
  next: {
    marginTop: Spacing.md,
    color: Colors.lime,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    color: Colors.ink,
    fontWeight: '800',
    fontSize: 16,
  },
  hours: {gap: 10},
  hour: {
    width: 88,
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1.5,
  },
  hourLabel: {color: Colors.muted, fontSize: 12, fontWeight: '700'},
  hourVerdict: {fontWeight: '900', fontSize: 16, marginTop: 6},
  hourTemp: {color: Colors.ink, marginTop: 4, fontWeight: '700'},
  cta: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {color: Colors.night, fontSize: 17, fontWeight: '800'},
  pressed: {opacity: 0.88},
  hint: {
    marginTop: Spacing.md,
    textAlign: 'center',
    color: Colors.muted,
    fontSize: 12,
  },
});

export default HomeScreen;
