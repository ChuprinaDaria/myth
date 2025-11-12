# 📚 Повний гід по налаштуванню Ukrainian Calendar App

## 🎯 Огляд

Цей проект складається з трьох частин:
1. **Backend API** (Node.js + Express + PostgreSQL)
2. **Mobile App** (React Native)
3. **Admin Panel** (React) - в розробці

## ⚙️ Передумови

Перед початком переконайтесь, що у вас встановлено:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Python** 3.8+ (для скриптів БД)
- **Git** ([Download](https://git-scm.com/))

### Для Mobile App додатково:

**Android:**
- Android Studio
- Android SDK
- JDK 11+

**iOS (тільки macOS):**
- Xcode 14+
- CocoaPods

---

## 🚀 Крок 1: Клонування репозиторію

```bash
git clone <repository-url>
cd ukrainian-calendar-app
```

---

## 🗄️ Крок 2: Налаштування бази даних

### 2.1 Встановлення PostgreSQL

Завантажте та встановіть PostgreSQL з офіційного сайту.

### 2.2 Створення бази даних

```bash
# Увійдіть в PostgreSQL
psql -U postgres

# Створіть базу даних
CREATE DATABASE ukrainian_calendar;

# Вийдіть
\q
```

### 2.3 Імпорт даних з CSV

```bash
cd database

# Встановіть Python залежності
pip install psycopg2-binary

# Налаштуйте змінні середовища (опціонально)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=ukrainian_calendar
export DB_USER=postgres
export DB_PASSWORD=your_password

# Запустіть імпорт
python3 import_csv.py
```

Скрипт автоматично:
- Створить таблиці (schema.sql)
- Імпортує дані з CSV
- Виведе статистику

**Результат:**
```
✓ База даних ukrainian_calendar вже існує
✓ Підключено до БД ukrainian_calendar
✓ Схема БД створена
✓ Імпортовано 365 подій
```

---

## 🔧 Крок 3: Налаштування Backend API

### 3.1 Встановлення залежностей

```bash
cd ../backend
npm install
```

### 3.2 Конфігурація

```bash
# Створіть .env файл
cp .env.example .env

# Відредагуйте .env
nano .env
```

Мінімальна конфігурація `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ukrainian_calendar
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3.3 Налаштування Firebase (для push-нотифікацій)

1. Перейдіть в [Firebase Console](https://console.firebase.google.com/)
2. Створіть новий проект
3. Перейдіть в **Project Settings** → **Service Accounts**
4. Натисніть **Generate new private key**
5. Збережіть JSON файл як `backend/config/firebase-service-account.json`
6. Оновіть `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```

### 3.4 Запуск сервера

```bash
# Development mode
npm run dev

# або Production build
npm run build
npm start
```

**Результат:**
```
==================================================
🚀 Server running on port 3000
📍 http://localhost:3000
==================================================
✓ Connected to PostgreSQL
✓ Daily notification cron job started
✓ Token cleanup cron job started
```

### 3.5 Тестування API

Відкрийте в браузері або Postman:
```
http://localhost:3000/
http://localhost:3000/api/events
http://localhost:3000/health
```

---

## 📱 Крок 4: Налаштування Mobile App

### 4.1 Встановлення залежностей

```bash
cd ../mobile
npm install
```

**Для iOS:**
```bash
cd ios
pod install
cd ..
```

### 4.2 Налаштування Firebase для Mobile

#### Android:

1. В Firebase Console відкрийте ваш проект
2. Додайте Android app:
   - Package name: `com.ukrainiancalendar`
3. Завантажте `google-services.json`
4. Помістіть файл в `mobile/android/app/google-services.json`

#### iOS:

1. В Firebase Console додайте iOS app:
   - Bundle ID: `com.ukrainiancalendar`
2. Завантажте `GoogleService-Info.plist`
3. Помістіть файл в `mobile/ios/UkrainianCalendar/GoogleService-Info.plist`

### 4.3 Конфігурація API endpoint

Відредагуйте `mobile/src/config/api.ts`:

```typescript
// Замініть YOUR_IP на вашу локальну IP адресу
export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

**Як дізнатись IP:**
- macOS/Linux: `ifconfig | grep inet`
- Windows: `ipconfig`

### 4.4 Запуск застосунку

```bash
# Metro bundler (в одному терміналі)
npm start

# Android (в іншому терміналі)
npm run android

# iOS (тільки macOS)
npm run ios
```

---

## 🎨 Крок 5: Admin Panel (в розробці)

Admin панель буде створена на React + Material-UI.

**Функціонал:**
- Редагування подій
- Завантаження зображень
- Статистика користувачів
- Керування нотифікаціями

---

## 🧪 Тестування всієї системи

### 1. Backend API

```bash
# Перевірте що API працює
curl http://localhost:3000/health
curl http://localhost:3000/api/events
```

### 2. База даних

```bash
# Увійдіть в PostgreSQL
psql -U postgres -d ukrainian_calendar

# Перевірте дані
SELECT COUNT(*) FROM events;
SELECT * FROM events WHERE description != '' LIMIT 5;
```

### 3. Push нотифікації

- Запустіть mobile app
- Зареєструйте FCM токен (автоматично при запуску)
- Перевірте в базі: `SELECT * FROM device_tokens;`

---

## 📊 Структура проекту

```
ukrainian-calendar-app/
├── README.md                 # Основна документація
├── SETUP_GUIDE.md           # Цей файл
│
├── database/                # База даних
│   ├── schema.sql          # Схема PostgreSQL
│   └── import_csv.py       # Скрипт імпорту
│
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Конфігурація (БД, Firebase)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Firebase, Google Calendar, Cron
│   │   └── server.ts       # Точка входу
│   ├── uploads/            # Завантажені зображення
│   ├── package.json
│   └── README.md
│
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── screens/        # Екрани
│   │   ├── components/     # Компоненти
│   │   ├── services/       # API, Firebase, Calendar
│   │   └── navigation/     # Навігація
│   ├── android/            # Android native
│   ├── ios/                # iOS native
│   ├── package.json
│   └── README.md
│
└── admin/                   # Admin Panel (TODO)
    └── README.md
```

---

## 🔧 Налагодження проблем

### PostgreSQL не підключається

```bash
# Перевірте статус
sudo systemctl status postgresql  # Linux
brew services list               # macOS

# Перезапустіть
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS
```

### Backend помилка "Cannot find module"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Mobile app не підключається до API

- Перевірте що backend запущений
- Перевірте IP адресу в `api.ts`
- Вимкніть firewall або додайте правило для порту 3000
- Перевірте що мобільний пристрій в одній мережі з комп'ютером

### Firebase push не працюють

- Перевірте що `google-services.json` / `GoogleService-Info.plist` на місці
- Перевірте що `FIREBASE_SERVICE_ACCOUNT_PATH` правильний
- Перегляньте логи backend

---

## 🚀 Production Deployment

### Backend

**Рекомендовані платформи:**
- Heroku
- DigitalOcean
- AWS EC2
- Railway

**Кроки:**
1. Build: `npm run build`
2. Налаштуйте змінні середовища
3. Запустіть: `node dist/server.js`

### Mobile App

**Android:**
```bash
cd android
./gradlew assembleRelease
# APK в android/app/build/outputs/apk/release/
```

**iOS:**
- Відкрийте проект в Xcode
- Product → Archive
- Distribute App → App Store / Ad Hoc

---

## 📝 Додаткові ресурси

- [React Native Docs](https://reactnative.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Express.js Guide](https://expressjs.com/)

---

## 🆘 Підтримка

Якщо виникли проблеми, створіть Issue в GitHub репозиторії.

## 📄 Ліцензія

MIT
