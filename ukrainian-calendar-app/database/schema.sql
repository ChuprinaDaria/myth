-- PostgreSQL Schema for Ukrainian Calendar App
-- Схема бази даних для Українського Календаря

-- Таблиця подій (свят)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    date_day INTEGER NOT NULL CHECK (date_day >= 1 AND date_day <= 31),
    date_month INTEGER NOT NULL CHECK (date_month >= 1 AND date_month <= 12),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    traditions TEXT,
    preparation TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Унікальний індекс для дати
    UNIQUE(date_day, date_month)
);

-- Індекси для швидкого пошуку
CREATE INDEX idx_events_date ON events(date_month, date_day);
CREATE INDEX idx_events_active ON events(is_active);

-- Таблиця зображень подій
CREATE TABLE IF NOT EXISTS event_images (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_title VARCHAR(255),
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(event_id, image_order)
);

CREATE INDEX idx_event_images_event ON event_images(event_id);

-- Таблиця для відстеження push-нотифікацій
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    notification_date DATE NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_date ON notifications(notification_date);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Таблиця FCM токенів (для push-нотифікацій без реєстрації)
CREATE TABLE IF NOT EXISTS device_tokens (
    id SERIAL PRIMARY KEY,
    fcm_token VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL, -- android, ios
    app_version VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);

-- Таблиця налаштувань користувачів (прив'язані до токену)
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    device_token_id INTEGER REFERENCES device_tokens(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    notification_time TIME DEFAULT '09:00:00', -- час коли відправляти нотифікації
    google_calendar_synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(device_token_id)
);

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригер для events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Тригер для user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Коментарі до таблиць
COMMENT ON TABLE events IS 'Календарні події - українські язичницькі свята';
COMMENT ON TABLE event_images IS 'Зображення для подій';
COMMENT ON TABLE notifications IS 'Історія відправлених нотифікацій';
COMMENT ON TABLE device_tokens IS 'FCM токени для push-нотифікацій';
COMMENT ON TABLE user_preferences IS 'Налаштування користувачів';
