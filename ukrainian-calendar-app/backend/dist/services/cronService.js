"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAllCronJobs = exports.startTokenCleanup = exports.startDailyNotifications = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../config/database"));
const firebaseService_1 = require("./firebaseService");
/**
 * Cron job для відправки щоденних нотифікацій
 * Запускається щодня о 9:00
 */
const startDailyNotifications = () => {
    // Запускаємо щодня о 9:00
    node_cron_1.default.schedule('0 9 * * *', async () => {
        console.log('🔔 Running daily notification job...');
        try {
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;
            // Знаходимо події на сьогодні
            const result = await database_1.default.query(`
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
                await (0, firebaseService_1.sendEventNotification)(event.id);
                // Затримка між нотифікаціями
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log('✓ Daily notifications completed');
        }
        catch (error) {
            console.error('✗ Error in daily notification job:', error);
        }
    });
    console.log('✓ Daily notification cron job started (runs at 9:00 AM)');
};
exports.startDailyNotifications = startDailyNotifications;
/**
 * Cron job для очищення старих токенів
 * Запускається щотижня
 */
const startTokenCleanup = () => {
    // Запускаємо кожної неділі о 3:00
    node_cron_1.default.schedule('0 3 * * 0', async () => {
        console.log('🧹 Running token cleanup job...');
        try {
            // Деактивуємо токени, які не були активні більше 90 днів
            const result = await database_1.default.query(`
        UPDATE device_tokens
        SET is_active = false
        WHERE last_active_at < NOW() - INTERVAL '90 days'
          AND is_active = true
        RETURNING id
      `);
            console.log(`✓ Deactivated ${result.rowCount} inactive tokens`);
        }
        catch (error) {
            console.error('✗ Error in token cleanup job:', error);
        }
    });
    console.log('✓ Token cleanup cron job started (runs weekly on Sunday at 3:00 AM)');
};
exports.startTokenCleanup = startTokenCleanup;
/**
 * Запуск всіх cron jobs
 */
const startAllCronJobs = () => {
    console.log('Starting cron jobs...');
    (0, exports.startDailyNotifications)();
    (0, exports.startTokenCleanup)();
};
exports.startAllCronJobs = startAllCronJobs;
exports.default = {
    startDailyNotifications: exports.startDailyNotifications,
    startTokenCleanup: exports.startTokenCleanup,
    startAllCronJobs: exports.startAllCronJobs
};
