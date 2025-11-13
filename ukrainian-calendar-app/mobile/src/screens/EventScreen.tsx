import React, {useEffect, useState} from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {ScrollView, View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {CalendarEvent, fetchEventById} from '../services/api';

type ParamList = {
  Event: { id: string; title?: string };
};

export default function EventScreen() {
  const route = useRoute<RouteProp<ParamList, 'Event'>>();
  const eventId = route.params?.id;

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!eventId) throw new Error('Відсутній ідентифікатор події');
        const data = await fetchEventById(eventId);
        setEvent(data);
      } catch (e: any) {
        setError(e?.message ?? 'Не вдалося завантажити подію');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Помилка: {error ?? 'Подію не знайдено'}</Text>
      </View>
    );
  }

  const dateStr =
    event.date
      ? new Date(event.date).toLocaleDateString('uk-UA')
      : `${String(event.date_day).padStart(2, '0')}.${String(event.date_month).padStart(2, '0')}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{dateStr}</Text>

      {event.images?.length ? (
        <Image
          source={{ uri: event.images[0].url.startsWith('http') ? event.images[0].url : `${event.images[0].url}` }}
          style={styles.image}
        />
      ) : null}

      {event.description ? (
        <>
          <Text style={styles.section}>Опис</Text>
          <Text style={styles.text}>{event.description}</Text>
        </>
      ) : null}

      {event.traditions ? (
        <>
          <Text style={styles.section}>Традиції</Text>
          <Text style={styles.text}>{event.traditions}</Text>
        </>
      ) : null}

      {event.preparation ? (
        <>
          <Text style={styles.section}>Підготовка</Text>
          <Text style={styles.text}>{event.preparation}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  error: {
    color: '#c00',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  date: {
    color: '#666',
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  text: {
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});


