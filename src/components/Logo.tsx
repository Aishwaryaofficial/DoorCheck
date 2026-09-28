import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from '../theme';

type Props = {size?: number};

const Logo = ({size = 56}: Props) => (
  <View style={styles.wrap}>
    <Image
      source={require('../assets/logo.png')}
      style={{width: size, height: size, borderRadius: size * 0.28}}
      accessibilityLabel="DoorCheck logo"
    />
    <Text style={styles.word}>DoorCheck</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', gap: 8},
  word: {
    color: Colors.ink,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.4,
  },
});

export default Logo;
