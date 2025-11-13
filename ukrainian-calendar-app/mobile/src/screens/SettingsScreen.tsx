import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Налаштування</Text>
      <Text style={styles.secondary}>Тут зʼявляться параметри нотифікацій та синхронізації.</Text>
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
  },
});


