import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Про застосунок</Text>
      <Text style={styles.secondary}>
        Український календар язичницьких свят. Версія 1.0. Для повної бази подій
        запустіть backend і вкажіть API адресу у файлі src/config/api.ts.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  secondary: {
    color: '#666',
    lineHeight: 20,
  },
});


