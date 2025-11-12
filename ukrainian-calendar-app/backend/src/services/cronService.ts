import cron from 'node-cron';
import pool from '../config/database';
import { sendEventNotification } from './firebaseService';

/**
 * Cron job для відправки щоденних нотифікацій
 * Запускається щодня о 9:00
 */
export const startDailyNotifications = () => {
  // Запускаємо щодня о 9:00
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running daily notification job...');

    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;

      // Знаходимо події на сьогодні
      const result = await pool.query(`
        SELECT id, title, date_day, date_month
        FROM events
        WHERE date_day = $1 AND date_month = $2 AND is_active = true
      `, [day, month]);

      if (result.rows.length === 0) {
        console.log(`No events for today (${day}.${month})`);
        return;
      }

      console.log(`Found ${result.rows.length} event(s) for today`);

      // Відправляємо нотифікацію для кожної події
      for (const event of result.rows) {
        await sendEventNotification(event.id);
        // Затримка між нотифікаціями
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✓ Daily notifications completed');
    } catch (error) {
      console.error('✗ Error in daily notification job:', error);
    }
  });

  console.log('✓ Daily notification cron job started (runs at 9:00 AM)');
};

/**
 * Cron job для очищення старих токенів
 * Запускається щотижня
 */
export const startTokenCleanup = () => {
  // Запускаємо кожної неділі о 3:00
  cron.schedule('0 3 * * 0', async () => {
    console.log('🧹 Running token cleanup job...');

    try {
      // Деактивуємо токени, які не були активні більше 90 днів
      const result = await pool.query(`
        UPDATE device_tokens
        SET is_active = false
        WHERE last_active_at < NOW() - INTERVAL '90 days'
          AND is_active = true
        RETURNING id
      `);

      console.log(`✓ Deactivated ${result.rowCount} inactive tokens`);
    } catch (error) {
      console.error('✗ Error in token cleanup job:', error);
    }
  });

  console.log('✓ Token cleanup cron job started (runs weekly on Sunday at 3:00 AM)');
};

/**
 * Запуск всіх cron jobs
 */
export const startAllCronJobs = () => {
  console.log('Starting cron jobs...');
  startDailyNotifications();
  startTokenCleanup();
};

export default {
  startDailyNotifications,
  startTokenCleanup,
  startAllCronJobs
};
