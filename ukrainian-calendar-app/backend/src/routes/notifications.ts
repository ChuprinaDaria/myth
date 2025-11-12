import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// POST /api/notifications/register - Реєстрація FCM токена
router.post('/register', async (req, res) => {
  try {
    const { fcmToken, platform, appVersion } = req.body;

    if (!fcmToken || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fcmToken, platform'
      });
    }

    // Перевіряємо чи токен вже існує
    const existing = await pool.query(
      'SELECT id FROM device_tokens WHERE fcm_token = $1',
      [fcmToken]
    );

    let deviceTokenId;

    if (existing.rows.length > 0) {
      // Оновлюємо існуючий токен
      const update = await pool.query(`
        UPDATE device_tokens
        SET is_active = true,
            last_active_at = CURRENT_TIMESTAMP,
            app_version = $1
        WHERE fcm_token = $2
        RETURNING id
      `, [appVersion, fcmToken]);

      deviceTokenId = update.rows[0].id;
    } else {
      // Створюємо новий токен
      const insert = await pool.query(`
        INSERT INTO device_tokens (fcm_token, platform, app_version)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [fcmToken, platform, appVersion]);

      deviceTokenId = insert.rows[0].id;

      // Створюємо налаштування за замовчуванням
      await pool.query(`
        INSERT INTO user_preferences (device_token_id)
        VALUES ($1)
      `, [deviceTokenId]);
    }

    res.json({
      success: true,
      message: 'Device registered successfully',
      deviceId: deviceTokenId
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register device'
    });
  }
});

// PUT /api/notifications/preferences - Оновлення налаштувань нотифікацій
router.put('/preferences', async (req, res) => {
  try {
    const { fcmToken, notificationsEnabled, notificationTime, googleCalendarSynced } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing fcmToken'
      });
    }

    // Знаходимо device token
    const device = await pool.query(
      'SELECT id FROM device_tokens WHERE fcm_token = $1',
      [fcmToken]
    );

    if (device.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    const deviceTokenId = device.rows[0].id;

    // Оновлюємо налаштування
    const result = await pool.query(`
      UPDATE user_preferences
      SET
        notifications_enabled = COALESCE($1, notifications_enabled),
        notification_time = COALESCE($2, notification_time),
        google_calendar_synced = COALESCE($3, google_calendar_synced),
        updated_at = CURRENT_TIMESTAMP
      WHERE device_token_id = $4
      RETURNING *
    `, [notificationsEnabled, notificationTime, googleCalendarSynced, deviceTokenId]);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// GET /api/notifications/preferences/:fcmToken - Отримати налаштування
router.get('/preferences/:fcmToken', async (req, res) => {
  try {
    const { fcmToken } = req.params;

    const result = await pool.query(`
      SELECT up.*
      FROM user_preferences up
      JOIN device_tokens dt ON up.device_token_id = dt.id
      WHERE dt.fcm_token = $1
    `, [fcmToken]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences'
    });
  }
});

export default router;
