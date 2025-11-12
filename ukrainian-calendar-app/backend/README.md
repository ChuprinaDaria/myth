# 🔧 Backend API - Ukrainian Calendar

Node.js + Express + TypeScript + PostgreSQL

## 📋 Вимоги

- Node.js 18+
- PostgreSQL 14+
- npm або yarn

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування змінних середовища

```bash
cp .env.example .env
# Відредагуйте .env файл з вашими налаштуваннями
```

### 3. Створення бази даних та імпорт даних

```bash
# Перейти в директорію database
cd ../database

# Встановити Python залежності
pip install psycopg2-binary

# Запустити імпорт
python3 import_csv.py
```

### 4. Запуск сервера

```bash
# Development mode з автоперезавантаженням
npm run dev

# Production build
npm run build
npm start
```

## 📡 API Endpoints

### Events (Події)

- `GET /api/events` - Всі події
- `GET /api/events/:id` - Одна подія за ID
- `GET /api/events/date/:month/:day` - Подія за датою
- `GET /api/events/month/:month` - Події за місяць
- `GET /api/events/upcoming/:days` - Найближчі події

### Notifications (Нотифікації)

- `POST /api/notifications/register` - Реєстрація FCM токена
- `PUT /api/notifications/preferences` - Оновлення налаштувань
- `GET /api/notifications/preferences/:fcmToken` - Отримати налаштування

### Admin (Адміністрування)

- `PUT /api/admin/events/:id` - Оновити подію
- `POST /api/admin/events` - Створити подію
- `POST /api/admin/events/:id/images` - Завантажити зображення
- `DELETE /api/admin/events/:eventId/images/:imageId` - Видалити зображення
- `GET /api/admin/stats` - Статистика

### Інше

- `GET /health` - Health check
- `GET /` - API інформація

## 🔔 Push Нотифікації (Firebase)

### Налаштування Firebase

1. Створіть проект в [Firebase Console](https://console.firebase.google.com/)
2. Згенеруйте Service Account Key:
   - Перейдіть в Project Settings → Service Accounts
   - Натисніть "Generate new private key"
   - Збережіть JSON файл як `config/firebase-service-account.json`
3. Оновіть `FIREBASE_SERVICE_ACCOUNT_PATH` в `.env`

### Автоматична відправка нотифікацій

Cron jobs автоматично відправляють нотифікації:

- **Щоденні нотифікації**: Кожного дня о 9:00 (для подій на цей день)
- **Очищення токенів**: Кожної неділі о 3:00 (деактивація старих токенів)

## 📂 Структура проекту

```
backend/
├── src/
│   ├── config/         # Конфігурація (БД, Firebase)
│   ├── routes/         # API роути
│   ├── services/       # Бізнес-логіка (Firebase, Google Calendar, Cron)
│   ├── middleware/     # Express middleware
│   ├── utils/          # Допоміжні функції
│   └── server.ts       # Точка входу
├── uploads/            # Завантажені зображення
├── config/             # Конфігураційні файли (Firebase)
├── package.json
├── tsconfig.json
└── .env
```

## 🗄️ База даних

### Таблиці

- **events** - Календарні події
- **event_images** - Зображення подій
- **notifications** - Історія нотифікацій
- **device_tokens** - FCM токени
- **user_preferences** - Налаштування користувачів

### Міграції

Схема БД знаходиться в `../database/schema.sql`

## 🔒 Безпека

- **Helmet.js** - Захист HTTP заголовків
- **CORS** - Налаштований CORS
- **Rate Limiting** - Обмеження запитів (100/15 хв)
- **Input Validation** - Валідація вхідних даних
- **SQL Injection Protection** - Параметризовані запити

## 🧪 Тестування

```bash
# TODO: додати тести
npm test
```

## 📝 Логування

Логи виводяться в консоль. Для production рекомендується використовувати Winston або Pino.

## 🚢 Deployment

### Docker (рекомендовано)

```bash
# TODO: додати Dockerfile
docker build -t ukrainian-calendar-backend .
docker run -p 3000:3000 ukrainian-calendar-backend
```

### Manual

```bash
npm run build
NODE_ENV=production node dist/server.js
```

## 📄 Ліцензія

MIT
