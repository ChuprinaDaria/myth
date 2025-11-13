"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const events_1 = __importDefault(require("./routes/events"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const admin_1 = __importDefault(require("./routes/admin"));
const cronService_1 = require("./services/cronService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Static files (для зображень)
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/events', events_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/admin', admin_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Ukrainian Calendar API',
        version: '1.0.0',
        endpoints: {
            events: '/api/events',
            notifications: '/api/notifications',
            admin: '/api/admin',
            health: '/health'
        }
    });
});
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});
// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('='.repeat(50));
    // Запускаємо cron jobs (можна вимкнути через ENV)
    if (process.env.ENABLE_CRON !== 'false') {
        (0, cronService_1.startAllCronJobs)();
    }
    else {
        console.log('⏱️ Cron jobs are disabled by ENABLE_CRON=false');
    }
});
exports.default = app;
