import admin from 'firebase-admin';
import pool from '../config/database';
import path from 'path';
import fs from 'fs';

// Ініціалізація Firebase Admin SDK
const initializeFirebase = () => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️  Firebase service account not found. Push notifications disabled.');
    return false;
  }

  try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✓ Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('✗ Failed to initialize Firebase:', error);
    return false;
  }
};

const isFirebaseInitialized = initializeFirebase();

/**
 * Відправка push-нотифікації
 */
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Skipping push notification.');
    return false;
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      token: fcmToken
    };

    await admin.messaging().send(message);
    console.log(`✓ Push notification sent to ${fcmToken}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to send push notification:', error);
    return false;
  }
};

/**
 * Відправка нотифікації всім активним пристроям
 */
export const sendNotificationToAll = async (
  title: string,
  body: string,
  data?: any
): Promise<{ success: number; failed: number }> => {
  if (!isFirebaseInitialized) {
    return { success: 0, failed: 0 };
  }

  try {
    // Отримуємо всі активні токени з увімкненими нотифікаціями
    const result = await pool.query(`
      SELECT dt.fcm_token
      FROM device_tokens dt
      JOIN user_preferences up ON dt.id = up.device_token_id
      WHERE dt.is_active = true
        AND up.notifications_enabled = true
    `);

    const tokens = result.rows.map(row => row.fcm_token);

    if (tokens.length === 0) {
      console.log('No active devices with notifications enabled');
      return { success: 0, failed: 0 };
    }

    // Відправляємо multicast
    const message = {
      notification: { title, body },
      data: data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);

    console.log(`✓ Sent ${response.successCount} notifications, ${response.failureCount} failed`);

    return {
      success: response.successCount,
      failed: response.failureCount
    };
  } catch (error) {
    console.error('✗ Failed to send multicast notification:', error);
    return { success: 0, failed: 0 };
  }
};

/**
 * Відправка нотифікації про подію
 */
export const sendEventNotification = async (eventId: number): Promise<void> => {
  try {
    // Отримуємо інформацію про подію
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      console.error(`Event ${eventId} not found`);
      return;
    }

    const event = eventResult.rows[0];
    const title = event.title;
    const body = `Сьогодні ${event.date_day}.${String(event.date_month).padStart(2, '0')} - ${title}`;

    const data = {
      eventId: String(eventId),
      date: `${event.date_day}.${event.date_month}`,
      type: 'event_reminder'
    };

    const result = await sendNotificationToAll(title, body, data);

    // Зберігаємо в історію
    await pool.query(`
      INSERT INTO notifications (event_id, notification_date, sent_at, status)
      VALUES ($1, CURRENT_DATE, CURRENT_TIMESTAMP, $2)
    `, [eventId, result.success > 0 ? 'sent' : 'failed']);

    console.log(`✓ Event notification sent for ${title}: ${result.success} success, ${result.failed} failed`);
  } catch (error) {
    console.error('✗ Failed to send event notification:', error);
  }
};

export default {
  sendPushNotification,
  sendNotificationToAll,
  sendEventNotification
};
