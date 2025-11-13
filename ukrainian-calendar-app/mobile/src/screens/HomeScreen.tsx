import React, {useEffect, useState} from 'react';
import {FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {fetchEvents, CalendarEvent} from '../services/api';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const data = await fetchEvents();
      // sort by date ascending
      const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
      setEvents(sorted);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.secondary}>Завантаження...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Помилка: {error}</Text>
        <Text style={styles.secondary}>Перевірте API або використовуйте локальні дані.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={events}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Подія', { id: item.id, title: item.title })}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            {item.date
              ? new Date(item.date).toLocaleDateString('uk-UA')
              : `${String(item.date_day).padStart(2,'0')}.${String(item.date_month).padStart(2,'0')}`}
          </Text>
          {item.description ? <Text style={styles.desc} numberOfLines={3}>{item.description}</Text> : null}
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.secondary}>Немає подій</Text>}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  secondary: {
    marginTop: 8,
    color: '#666',
  },
  error: {
    color: '#c00',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },
  desc: {
    marginTop: 8,
    color: '#333',
  },
});


