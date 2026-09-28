import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Colors} from '../theme';

const BlobBackground = () => {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      );
    const one = loop(a, 7000);
    const two = loop(b, 9000);
    one.start();
    two.start();
    return () => {
      one.stop();
      two.stop();
    };
  }, [a, b]);

  const t1 = a.interpolate({inputRange: [0, 1], outputRange: [0, 28]});
  const t2 = b.interpolate({inputRange: [0, 1], outputRange: [0, -36]});

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[styles.blob, styles.lime, {transform: [{translateY: t1}]}]}
      />
      <Animated.View
        style={[styles.blob, styles.magenta, {transform: [{translateX: t2}]}]}
      />
      <Animated.View style={[styles.blob, styles.cyan]} />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.45,
  },
  lime: {
    backgroundColor: Colors.lime,
    top: -80,
    right: -60,
  },
  magenta: {
    backgroundColor: Colors.magenta,
    bottom: 80,
    left: -90,
  },
  cyan: {
    backgroundColor: Colors.cyan,
    bottom: -40,
    right: -40,
    opacity: 0.28,
  },
});

export default BlobBackground;
