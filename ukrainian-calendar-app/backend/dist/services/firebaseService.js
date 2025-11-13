"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventNotification = exports.sendNotificationToAll = exports.sendPushNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
// Ініціалізація Firebase Admin SDK
const initializeFirebase = () => {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath || !fs_1.default.existsSync(serviceAccountPath)) {
        console.warn('⚠️  Firebase service account not found. Push notifications disabled.');
        return false;
    }
    try {
        const serviceAccount = require(serviceAccountPath);
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount)
        });
        console.log('✓ Firebase Admin SDK initialized');
        return true;
    }
    catch (error) {
        console.error('✗ Failed to initialize Firebase:', error);
        return false;
    }
};
const isFirebaseInitialized = initializeFirebase();
/**
 * Відправка push-нотифікації
 */
const sendPushNotification = async (fcmToken, title, body, data) => {
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
        await firebase_admin_1.default.messaging().send(message);
        console.log(`✓ Push notification sent to ${fcmToken}`);
        return true;
    }
    catch (error) {
        console.error('✗ Failed to send push notification:', error);
        return false;
    }
};
exports.sendPushNotification = sendPushNotification;
/**
 * Відправка нотифікації всім активним пристроям
 */
const sendNotificationToAll = async (title, body, data) => {
    if (!isFirebaseInitialized) {
        return { success: 0, failed: 0 };
    }
    try {
        // Отримуємо всі активні токени з увімкненими нотифікаціями
        const result = await database_1.default.query(`
      SELECT dt.fcm_token
      FROM device_tokens dt
      JOIN user_preferences up ON dt.id = up.device_token_id
      WHERE dt.is_active = true
        AND up.notifications_enabled = true
    `);
        const tokens = result.rows.map((row) => row.fcm_token);
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
        const response = await firebase_admin_1.default.messaging().sendMulticast(message);
        console.log(`✓ Sent ${response.successCount} notifications, ${response.failureCount} failed`);
        return {
            success: response.successCount,
            failed: response.failureCount
        };
    }
    catch (error) {
        console.error('✗ Failed to send multicast notification:', error);
        return { success: 0, failed: 0 };
    }
};
exports.sendNotificationToAll = sendNotificationToAll;
/**
 * Відправка нотифікації про подію
 */
const sendEventNotification = async (eventId) => {
    try {
        // Отримуємо інформацію про подію
        const eventResult = await database_1.default.query('SELECT * FROM events WHERE id = $1', [eventId]);
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
        const result = await (0, exports.sendNotificationToAll)(title, body, data);
        // Зберігаємо в історію
        await database_1.default.query(`
      INSERT INTO notifications (event_id, notification_date, sent_at, status)
      VALUES ($1, CURRENT_DATE, CURRENT_TIMESTAMP, $2)
    `, [eventId, result.success > 0 ? 'sent' : 'failed']);
        console.log(`✓ Event notification sent for ${title}: ${result.success} success, ${result.failed} failed`);
    }
    catch (error) {
        console.error('✗ Failed to send event notification:', error);
    }
};
exports.sendEventNotification = sendEventNotification;
exports.default = {
    sendPushNotification: exports.sendPushNotification,
    sendNotificationToAll: exports.sendNotificationToAll,
    sendEventNotification: exports.sendEventNotification
};
